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
    type: 'string' | 'number' | 'boolean' | 'array';
    required: boolean;
    options?: string[];
    widget?: 'text' | 'select' | 'radio' | 'checkboxes';
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

            jsonSchema.properties[fieldId] = {
                type: field.type,
                title: field.title
            };

            if (field.options && ['select', 'radio', 'checkboxes'].includes(field.widget || '')) {
                if (field.type === 'array') {
                    jsonSchema.properties[fieldId].items = {
                        type: 'string',
                        enum: field.options
                    };
                } else {
                    jsonSchema.properties[fieldId].enum = field.options;
                }
            }

            if (field.required) {
                jsonSchema.required.push(fieldId);
            }

            if (field.widget) {
                uiSchema[fieldId] = {
                    'ui:widget': field.widget
                };
            }
        });

        return { jsonSchema, uiSchema, displayOrder };
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
                                                type:
                                                    e.target.value === 'checkboxes'
                                                        ? 'array'
                                                        : 'string'
                                            })
                                        }
                                        className="w-full p-2 border rounded"
                                    >
                                        <option value="text">文字輸入</option>
                                        <option value="radio">單選按鈕</option>
                                        <option value="checkboxes">多選框</option>
                                    </select>

                                    {['radio', 'checkboxes'].includes(field.widget || '') && (
                                        <textarea
                                            value={field.options?.join('\n')}
                                            onChange={(e) =>
                                                updateField(index, {
                                                    options: e.target.value
                                                        .split('\n')
                                                        .filter(Boolean)
                                                })
                                            }
                                            className="w-full p-2 border rounded"
                                            placeholder="每行輸入一個選項"
                                            rows={3}
                                        />
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
            </div>
        </ChakraProvider>
    );
}
