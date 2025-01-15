'use client';

import { useState, useEffect } from 'react';
// import Form from '@rjsf/core';
import Form from '@rjsf/chakra-ui';
import {
    ChakraProvider,
    Modal,
    ModalOverlay,
    ModalContent,
    ModalHeader,
    ModalBody,
    ModalCloseButton
} from '@chakra-ui/react';
import validator from '@rjsf/validator-ajv8';
import axios from 'axios';
import { useRouter } from 'next/navigation';
import { PlusCircle, X, ChevronLeft } from 'lucide-react';
import { Editor } from '@tinymce/tinymce-react';

interface FormField {
    title: string;
    type: 'string' | 'number' | 'integer' | 'boolean' | 'array' | 'null';
    required: boolean;
    options?: { id: string; value: string }[];
    widget?:
        | 'text'
        | 'textarea'
        | 'select'
        | 'radio'
        | 'checkboxes'
        | 'date'
        | 'time'
        | 'datetime'
        | 'email'
        | 'password'
        | 'number'
        | 'range';
    format?: 'date' | 'time' | 'date-time' | 'email' | 'string' | 'uri' | 'uuid';
    minimum?: number;
    maximum?: number;
}

interface EmailTemplate {
    name: string;
    subject: string;
    html_content: string;
    placeholders: string[];
}

const DEFAULT_EMAIL_TEMPLATES = {
    default: {
        name: '基本模板',
        subject: 'HKU Information Day 報名確認',
        html_content: `
            <h1>活動報名確認</h1>
            <div class="section">
                <p>親愛的 {{salutation}} {{last_name}} {{first_name}}：</p>
                <p>感謝您報名參加 HKU Information Day！</p>
            </div>
            <div class="section">
                <p>以下是您的報名詳情：</p>
                <ul>
                    <li>稱謂：{{salutation}}</li>
                    <li>姓名：{{last_name}} {{first_name}}</li>
                    <li>電郵：{{email}}</li>
                    <li>手機：{{mobile_number}}</li>
                    <li>身份：{{role}}</li>
                </ul>
            </div>
            <div class="section">
                <p>活動當天請出示隨附的 QR Code 進行簽到。</p>
                <p>如有任何疑問，請電郵至 info@example.com。</p>
            </div>
            <div class="footer">
                <p>香港大學招生處</p>
            </div>
        `
    },
    reminder: {
        name: '活動提醒模板',
        subject: 'HKU Information Day 活動提醒',
        html_content: `
            <h1>活動提醒通知</h1>
            <div class="section">
                <p>親愛的 {{salutation}} {{last_name}} {{first_name}}：</p>
                <p>提醒您，您報名參加的 HKU Information Day 將於明天舉行。</p>
            </div>
            <div class="section">
                <p>活動詳情：</p>
                <ul>
                    <li>日期：2024年11月9日（星期六）</li>
                    <li>時間：9:00am-6:00pm</li>
                    <li>地點：澳門得勝馬路廿八號陳瑞祺永援中學</li>
                </ul>
            </div>
            <div class="section">
                <p>請記得攜帶您的 QR Code 進行簽到。</p>
                <p>如有任何疑問，請電郵至 info@example.com。</p>
            </div>
            <div class="footer">
                <p>香港大學招生處</p>
            </div>
        `
    }
};

export default function CreateForm() {
    const router = useRouter();
    const [submitting, setSubmitting] = useState(false);
    const [formTitle, setFormTitle] = useState('新表單');
    const [formDescription, setFormDescription] = useState('');
    const [fields, setFields] = useState<FormField[]>([]);
    const [emailEnabled, setEmailEnabled] = useState(false);
    const [isActive, setIsActive] = useState(false);
    const [emailTemplate, setEmailTemplate] = useState<EmailTemplate>({
        name: DEFAULT_EMAIL_TEMPLATES.default.name,
        subject: DEFAULT_EMAIL_TEMPLATES.default.subject,
        html_content: DEFAULT_EMAIL_TEMPLATES.default.html_content,
        placeholders: []
    });
    const [showEmailEditor, setShowEmailEditor] = useState(false);
    const [isPreviewOpen, setIsPreviewOpen] = useState(false);
    const [previewContent, setPreviewContent] = useState('');
    const [selectedTemplate, setSelectedTemplate] = useState<string>('default');

    // 當表單欄位更新時，自動更新可用的變數列表
    useEffect(() => {
        if (emailEnabled) {
            const newPlaceholders = fields
                .map((field) => field.title.toLowerCase().replace(/\s+/g, '_'))
                .filter((fieldId) => fieldId.trim() !== '');
            setEmailTemplate((prev) => ({
                ...prev,
                placeholders: newPlaceholders
            }));
        }
    }, [fields, emailEnabled]);

    // 確保初始模板載入
    useEffect(() => {
        const template =
            DEFAULT_EMAIL_TEMPLATES[selectedTemplate as keyof typeof DEFAULT_EMAIL_TEMPLATES];
        setEmailTemplate((prev) => ({
            ...prev,
            name: template.name,
            subject: template.subject,
            html_content: template.html_content
        }));
    }, [selectedTemplate]);

    const addField = () => {
        setFields([
            ...fields,
            {
                title: '',
                type: 'string',
                required: false,
                widget: 'text'
            }
        ]);
    };

    const removeField = (index: number) => {
        setFields(fields.filter((_, i) => i !== index));
    };

    const updateField = (index: number, updates: Partial<FormField>) => {
        setFields(fields.map((field, i) => (i === index ? { ...field, ...updates } : field)));
    };

    const getTypeForWidget = (widget: string) => {
        switch (widget) {
            case 'number':
            case 'range':
                return 'number';
            case 'checkboxes':
                return 'array';
            case 'radio':
                return 'string';
            default:
                return 'string';
        }
    };

    const getFormatForWidget = (widget: string) => {
        switch (widget) {
            case 'date':
                return 'date';
            case 'time':
                return 'time';
            case 'datetime':
                return 'date-time';
            case 'email':
                return 'email';
            default:
                return undefined;
        }
    };

    const generateSchemas = () => {
        const jsonSchema: any = {
            type: 'object',
            title: formTitle,
            description: formDescription,
            properties: {},
            required: []
        };

        const uiSchema: any = {};
        const displayOrder: string[] = [];

        fields.forEach((field) => {
            const fieldId = field.title.toLowerCase().replace(/\s+/g, '_');
            displayOrder.push(fieldId);

            if (field.widget === 'checkboxes') {
                jsonSchema.properties[fieldId] = {
                    type: 'array',
                    title: field.title,
                    items: {
                        type: 'string',
                        enum: field.options?.map((opt) => opt.value) || []
                    },
                    uniqueItems: true
                };
                uiSchema[fieldId] = {
                    'ui:widget': 'checkboxes'
                };
            } else {
                jsonSchema.properties[fieldId] = {
                    type: field.type,
                    title: field.title
                };

                if (field.widget === 'number') {
                    if (field.minimum !== undefined) {
                        jsonSchema.properties[fieldId].minimum = field.minimum;
                    }
                    if (field.maximum !== undefined) {
                        jsonSchema.properties[fieldId].maximum = field.maximum;
                    }
                    uiSchema[fieldId] = {
                        'ui:widget': 'updown'
                    };
                } else if (field.widget === 'radio') {
                    jsonSchema.properties[fieldId].enum =
                        field.options?.map((opt) => opt.value) || [];
                    uiSchema[fieldId] = {
                        'ui:widget': 'radio'
                    };
                } else if (field.widget) {
                    uiSchema[fieldId] = {
                        'ui:widget': field.widget
                    };
                }
            }

            if (field.required) {
                jsonSchema.required.push(fieldId);
            }
        });

        return { jsonSchema, uiSchema, displayOrder };
    };

    const handleSave = async () => {
        if (!formTitle.trim()) {
            alert('請輸入表單標題');
            return;
        }

        if (fields.length === 0) {
            alert('請至少添加一個表單欄位');
            return;
        }

        // 檢查所有欄位是否都有標題
        const emptyTitleField = fields.find((field) => !field.title.trim());
        if (emptyTitleField) {
            alert('所有欄位都必須有標題');
            return;
        }

        // 如果啟用了郵件功能，檢查必要欄位
        if (emailEnabled) {
            if (!emailTemplate.subject.trim()) {
                alert('請輸入郵件主題');
                return;
            }
            if (!emailTemplate.html_content.trim()) {
                alert('請輸入郵件內容');
                return;
            }
        }

        setSubmitting(true);
        try {
            const { jsonSchema, uiSchema, displayOrder } = generateSchemas();

            // 生成空的form_data
            const formData: { [key: string]: string } = {};
            fields.forEach((field) => {
                const fieldId = field.title.toLowerCase().replace(/\s+/g, '_');
                formData[fieldId] = '';
            });

            const response = await axios.post(
                `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/admin/forms`,
                {
                    form: {
                        name: formTitle,
                        description: formDescription,
                        json_schema: jsonSchema,
                        ui_schema: uiSchema,
                        display_order: displayOrder,
                        email_enabled: emailEnabled,
                        is_active: isActive,
                        form_data: formData,
                        ...(emailEnabled && {
                            email_template_attributes: {
                                name: emailTemplate.name,
                                subject: emailTemplate.subject,
                                html_content: emailTemplate.html_content,
                                placeholders: emailTemplate.placeholders
                            }
                        })
                    }
                },
                {
                    headers: {
                        Authorization: `Bearer ${process.env.NEXT_PUBLIC_BEARER_TOKEN}`
                    }
                }
            );

            if (response.data.success) {
                alert('表單創建成功！');
                router.push('/admin');
            }
        } catch (error: any) {
            console.error('創建表單錯誤:', error);
            alert(error.response?.data?.error || '創建失敗，請稍後再試。');
        } finally {
            setSubmitting(false);
        }
    };

    const handleEditorChange = (content: string) => {
        setEmailTemplate((prev) => ({
            ...prev,
            html_content: content
        }));
    };

    const handlePreview = () => {
        // 替換預覽內容中的變數為示例值
        let previewHtml = emailTemplate.html_content;
        emailTemplate.placeholders.forEach((placeholder) => {
            const exampleValue = getExampleValue(placeholder);
            previewHtml = previewHtml.replace(new RegExp(`{{${placeholder}}}`, 'g'), exampleValue);
        });
        setPreviewContent(previewHtml);
        setIsPreviewOpen(true);
    };

    const getExampleValue = (placeholder: string): string => {
        // 根據欄位名稱返回示例值
        const examples: { [key: string]: string } = {
            name: '張三',
            email: 'example@mail.com',
            phone_number: '12345678',
            mobile_number: '12345678',
            first_name: '三',
            last_name: '張',
            salutation: 'Mr.',
            role: '學生',
            country: '澳門'
        };
        return examples[placeholder] || `[${placeholder}]`;
    };

    return (
        <ChakraProvider>
            <div className="container mx-auto p-4">
                <div className="flex items-center mb-6">
                    <button
                        onClick={() => router.back()}
                        className="mr-4 hover:text-gray-600 transition-colors"
                    >
                        <ChevronLeft className="w-6 h-6" />
                    </button>
                    <h1 className="text-2xl font-bold">創建新表單</h1>
                </div>
                <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-4">
                        <div className="bg-white p-4 rounded shadow">
                            <div className="flex justify-between items-center mb-4">
                                <input
                                    type="text"
                                    value={formTitle}
                                    onChange={(e) => setFormTitle(e.target.value)}
                                    className="w-full text-xl font-bold mb-2 p-2 border rounded"
                                    placeholder="表單標題"
                                />
                                <label className="flex items-center cursor-pointer ml-4">
                                    <input
                                        type="checkbox"
                                        checked={isActive}
                                        onChange={(e) => setIsActive(e.target.checked)}
                                        className="mr-2"
                                    />
                                    <span className="text-sm">啟用表單</span>
                                </label>
                            </div>
                            <textarea
                                value={formDescription}
                                onChange={(e) => setFormDescription(e.target.value)}
                                className="w-full p-2 border rounded"
                                placeholder="表單描述"
                                rows={3}
                            />
                        </div>

                        {fields.map((field, index) => (
                            <div key={index} className="bg-white p-4 rounded shadow relative">
                                <button
                                    onClick={() => removeField(index)}
                                    className="absolute top-2 right-2 text-red-500"
                                >
                                    <X className="w-5 h-5" />
                                </button>
                                <div className="space-y-2">
                                    <input
                                        type="text"
                                        value={field.title}
                                        onChange={(e) =>
                                            updateField(index, { title: e.target.value })
                                        }
                                        className="w-full p-2 border rounded"
                                        placeholder="欄位標題"
                                    />
                                    <select
                                        value={field.widget}
                                        onChange={(e) =>
                                            updateField(index, {
                                                widget: e.target.value as any,
                                                type: getTypeForWidget(e.target.value)
                                            })
                                        }
                                        className="w-full p-2 border rounded"
                                    >
                                        <option value="text">文字輸入</option>
                                        <option value="textarea">多行文字</option>
                                        <option value="number">數字</option>
                                        <option value="date">日期</option>
                                        <option value="time">時間</option>
                                        <option value="datetime">日期時間</option>
                                        <option value="email">電子郵件</option>
                                        <option value="radio">單選按鈕</option>
                                        <option value="checkboxes">多選框</option>
                                    </select>

                                    {['radio', 'checkboxes'].includes(field.widget || '') && (
                                        <div className="space-y-2">
                                            <div className="flex items-center justify-between mb-2">
                                                <span className="text-sm font-medium">
                                                    選項列表
                                                </span>
                                                <button
                                                    type="button"
                                                    onClick={() => {
                                                        const newOptions = [
                                                            ...(field.options || []),
                                                            {
                                                                id: Math.random()
                                                                    .toString(36)
                                                                    .substr(2, 9),
                                                                value: ''
                                                            }
                                                        ];
                                                        updateField(index, { options: newOptions });
                                                    }}
                                                    className="text-blue-500 text-sm hover:text-blue-600"
                                                >
                                                    + 添加選項
                                                </button>
                                            </div>
                                            {field.options?.map((option, optionIndex) => (
                                                <div
                                                    key={option.id}
                                                    className="flex items-center gap-2"
                                                >
                                                    <input
                                                        type="text"
                                                        value={option.value}
                                                        onChange={(e) => {
                                                            const newOptions = field.options?.map(
                                                                (opt, idx) =>
                                                                    idx === optionIndex
                                                                        ? {
                                                                              ...opt,
                                                                              value: e.target.value
                                                                          }
                                                                        : opt
                                                            );
                                                            updateField(index, {
                                                                options: newOptions
                                                            });
                                                        }}
                                                        className="flex-1 p-2 border rounded"
                                                        placeholder={`選項 ${optionIndex + 1}`}
                                                    />
                                                    <button
                                                        type="button"
                                                        onClick={() => {
                                                            const newOptions =
                                                                field.options?.filter(
                                                                    (_, idx) => idx !== optionIndex
                                                                );
                                                            updateField(index, {
                                                                options: newOptions
                                                            });
                                                        }}
                                                        className="text-red-500 hover:text-red-600"
                                                    >
                                                        <X className="w-4 h-4" />
                                                    </button>
                                                </div>
                                            ))}
                                        </div>
                                    )}

                                    <label className="flex items-center">
                                        <input
                                            type="checkbox"
                                            checked={field.required}
                                            onChange={(e) =>
                                                updateField(index, { required: e.target.checked })
                                            }
                                            className="mr-2"
                                        />
                                        必填欄位
                                    </label>

                                    {field.widget === 'number' && (
                                        <div className="grid grid-cols-2 gap-2">
                                            <div>
                                                <label className="text-sm text-gray-600">
                                                    最小值
                                                </label>
                                                <input
                                                    type="number"
                                                    value={field.minimum || ''}
                                                    onChange={(e) =>
                                                        updateField(index, {
                                                            minimum: e.target.value
                                                                ? Number(e.target.value)
                                                                : undefined
                                                        })
                                                    }
                                                    className="w-full p-2 border rounded"
                                                    placeholder="最小值"
                                                />
                                            </div>
                                            <div>
                                                <label className="text-sm text-gray-600">
                                                    最大值
                                                </label>
                                                <input
                                                    type="number"
                                                    value={field.maximum || ''}
                                                    onChange={(e) =>
                                                        updateField(index, {
                                                            maximum: e.target.value
                                                                ? Number(e.target.value)
                                                                : undefined
                                                        })
                                                    }
                                                    className="w-full p-2 border rounded"
                                                    placeholder="最大值"
                                                />
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>
                        ))}

                        <button
                            onClick={addField}
                            className="w-full p-4 border-2 border-dashed rounded-lg text-gray-500 hover:text-gray-700 hover:border-gray-400 flex items-center justify-center"
                        >
                            <PlusCircle className="w-6 h-6 mr-2" />
                            添加新欄位
                        </button>

                        <div className="bg-white p-4 rounded shadow">
                            <div className="flex items-center justify-between mb-4">
                                <h3 className="text-lg font-semibold">郵件通知設置</h3>
                                <label className="flex items-center cursor-pointer">
                                    <input
                                        type="checkbox"
                                        checked={emailEnabled}
                                        onChange={(e) => setEmailEnabled(e.target.checked)}
                                        className="mr-2"
                                    />
                                    啟用郵件通知
                                </label>
                            </div>

                            {emailEnabled && (
                                <div className="space-y-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            選擇預設模板
                                        </label>
                                        <select
                                            value={selectedTemplate}
                                            onChange={(e) => {
                                                const template =
                                                    DEFAULT_EMAIL_TEMPLATES[
                                                        e.target
                                                            .value as keyof typeof DEFAULT_EMAIL_TEMPLATES
                                                    ];
                                                setSelectedTemplate(e.target.value);
                                                setEmailTemplate((prev) => ({
                                                    ...prev,
                                                    name: template.name,
                                                    subject: template.subject,
                                                    html_content: template.html_content
                                                }));
                                            }}
                                            className="w-full p-2 border rounded mb-4"
                                        >
                                            {Object.entries(DEFAULT_EMAIL_TEMPLATES).map(
                                                ([key, template]) => (
                                                    <option key={key} value={key}>
                                                        {template.name}
                                                    </option>
                                                )
                                            )}
                                        </select>
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            郵件主題
                                        </label>
                                        <input
                                            type="text"
                                            value={emailTemplate.subject}
                                            onChange={(e) =>
                                                setEmailTemplate((prev) => ({
                                                    ...prev,
                                                    subject: e.target.value
                                                }))
                                            }
                                            className="w-full p-2 border rounded"
                                            placeholder="請輸入郵件主題"
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            郵件內容
                                        </label>
                                        <div className="border rounded p-2 bg-gray-50">
                                            <div className="mb-2 text-sm text-gray-600">
                                                可用變數：
                                                {emailTemplate.placeholders.map((placeholder) => (
                                                    <span
                                                        key={placeholder}
                                                        className="inline-block bg-blue-100 text-blue-800 px-2 py-1 rounded text-xs mr-2 mb-1 cursor-pointer"
                                                        onClick={() => {
                                                            const textToInsert = `{{${placeholder}}}`;
                                                            // 在編輯器中插入變數
                                                            setEmailTemplate((prev) => ({
                                                                ...prev,
                                                                html_content:
                                                                    prev.html_content + textToInsert
                                                            }));
                                                        }}
                                                    >
                                                        {`{{${placeholder}}}`}
                                                    </span>
                                                ))}
                                            </div>
                                            <Editor
                                                apiKey={process.env.NEXT_PUBLIC_TINYMCE_API_KEY}
                                                value={emailTemplate.html_content}
                                                init={{
                                                    height: 400,
                                                    menubar: true,
                                                    plugins: [
                                                        'advlist',
                                                        'autolink',
                                                        'lists',
                                                        'link',
                                                        'image',
                                                        'charmap',
                                                        'preview',
                                                        'anchor',
                                                        'searchreplace',
                                                        'visualblocks',
                                                        'code',
                                                        'fullscreen',
                                                        'insertdatetime',
                                                        'media',
                                                        'table',
                                                        'help',
                                                        'wordcount'
                                                    ],
                                                    toolbar:
                                                        'undo redo | formatselect | ' +
                                                        'bold italic backcolor | alignleft aligncenter ' +
                                                        'alignright alignjustify | bullist numlist outdent indent | ' +
                                                        'removeformat | help',
                                                    content_style:
                                                        'body { font-family:Helvetica,Arial,sans-serif; font-size:14px }'
                                                }}
                                                onEditorChange={handleEditorChange}
                                            />
                                        </div>
                                    </div>

                                    <div className="flex justify-end">
                                        <button
                                            type="button"
                                            onClick={handlePreview}
                                            className="bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600 transition mr-2"
                                        >
                                            預覽郵件
                                        </button>
                                    </div>

                                    {/* 郵件預覽模態框 */}
                                    <Modal
                                        isOpen={isPreviewOpen}
                                        onClose={() => setIsPreviewOpen(false)}
                                        size="4xl"
                                    >
                                        <ModalOverlay />
                                        <ModalContent maxWidth="900px">
                                            <ModalHeader>郵件預覽</ModalHeader>
                                            <ModalCloseButton />
                                            <ModalBody className="p-6">
                                                <div className="mb-4 p-2 bg-gray-100 rounded">
                                                    <strong>主題：</strong> {emailTemplate.subject}
                                                </div>
                                                <div
                                                    style={{
                                                        border: '1px solid #ddd',
                                                        borderRadius: '5px',
                                                        padding: '20px',
                                                        backgroundColor: '#fff'
                                                    }}
                                                >
                                                    <div
                                                        style={{
                                                            fontFamily: 'Arial, sans-serif',
                                                            lineHeight: 1.6,
                                                            color: '#333',
                                                            width: '80%',
                                                            margin: '0 auto',
                                                            padding: '20px',
                                                            border: '1px solid #ddd',
                                                            borderRadius: '5px',
                                                            backgroundColor: '#f9f9f9'
                                                        }}
                                                        dangerouslySetInnerHTML={{
                                                            __html: previewContent
                                                        }}
                                                    />
                                                </div>
                                            </ModalBody>
                                        </ModalContent>
                                    </Modal>
                                </div>
                            )}
                        </div>

                        <div className="fixed bottom-6 right-6">
                            <button
                                onClick={handleSave}
                                disabled={submitting}
                                className={`bg-blue-500 text-white px-6 py-3 rounded-lg shadow-lg hover:bg-blue-600 transition flex items-center ${
                                    submitting ? 'opacity-50 cursor-not-allowed' : ''
                                }`}
                            >
                                {submitting ? (
                                    <>
                                        <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                                        保存中...
                                    </>
                                ) : (
                                    <>保存表單</>
                                )}
                            </button>
                        </div>
                    </div>

                    <div>
                        <h2 className="text-xl mb-2">表單預覽</h2>
                        <Form
                            schema={generateSchemas().jsonSchema}
                            uiSchema={generateSchemas().uiSchema}
                            validator={validator}
                            disabled={submitting}
                        />
                    </div>
                </div>
            </div>
        </ChakraProvider>
    );
}
