'use client';

import { useState } from 'react';
// import Form from '@rjsf/core';
import Form from '@rjsf/chakra-ui';
import { ChakraProvider } from '@chakra-ui/react';
import validator from '@rjsf/validator-ajv8';
import axios from 'axios';
import { useRouter } from 'next/navigation';
import { PlusCircle, X } from 'lucide-react';

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

export default function CreateForm() {
    const router = useRouter();
    const [submitting, setSubmitting] = useState(false);
    const [formTitle, setFormTitle] = useState('新表單');
    const [formDescription, setFormDescription] = useState('');
    const [fields, setFields] = useState<FormField[]>([]);

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
        setSubmitting(true);
        try {
            const { jsonSchema, uiSchema, displayOrder } = generateSchemas();
            const response = await axios.post(
                `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/forms`,
                {
                    form: {
                        name: formTitle,
                        description: formDescription,
                        json_schema: jsonSchema,
                        ui_schema: uiSchema,
                        display_order: displayOrder
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
        } catch (error) {
            console.error(error);
            alert('創建失敗，請稍後再試。');
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <ChakraProvider>
            <div className="container mx-auto p-4">
                <h1 className="text-2xl font-bold mb-4">創建新表單</h1>
                <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-4">
                        <div className="bg-white p-4 rounded shadow">
                            <input
                                type="text"
                                value={formTitle}
                                onChange={(e) => setFormTitle(e.target.value)}
                                className="w-full text-xl font-bold mb-2 p-2 border rounded"
                                placeholder="表單標題"
                            />
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

                <div className="flex justify-end mt-4">
                    <button
                        onClick={handleSave}
                        disabled={submitting}
                        className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 transition disabled:opacity-50"
                    >
                        {submitting ? '保存中...' : '保存表單'}
                    </button>
                </div>
            </div>
        </ChakraProvider>
    );
}
