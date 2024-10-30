'use client';

import axios from 'axios';
import { useParams, useRouter } from 'next/navigation';
import { QRCodeCanvas } from 'qrcode.react';
import { useEffect, useState } from 'react';
import { Controller, useForm } from 'react-hook-form';

export interface FormDetail {
    id: string;
    name: string;
    description: string;
    json_schema: {
        type: string;
        title: string;
        properties: any;
        dependencies: any
    },
    form_data: any;
    ui_schema: any;

}

export default function FormDetail() {
    const {
        register,
        handleSubmit,
        control,
        formState: { errors }
    } = useForm();
    const router = useRouter()
    const params = useParams()
    const [qrCode, setQrCode] = useState(null);
    const [formId, setFormId] = useState(null);
    const [formData, setFormData] = useState<FormDetail>()
    const [loading, setLoading] = useState<boolean>(true);
    const [submitting, setSubmitting] = useState<boolean>(false);

    useEffect(() => {
        fetchFormDataById()
    }, [params])

    const fetchFormDataById = async () => {
        console.log('form id', params['id']);
        setLoading(true)
        const formId = params['id']//'98d9afbe-4b7f-492d-ad0b-9d2a4e95b262'
        const response = await axios.get(
            `${process.env.NEXT_PUBLIC_API_BASE_URL}/forms/${formId}`
        );
        setLoading(false)
        console.log('response.data', response.data);
        if (response.data.success) {
            setFormData(response.data.form)
        } else {
            alert(response.data.error?.toString() || 'error')
        }

    }

    const onSubmit = async (data: any) => {
        console.log('submit form data', data);
        setSubmitting(true)
        try {
            // 假設您已經有一個表單 ID
            const formId = params['id']; // 替換為實際表單 ID
            const response = await axios.post(
                `${process.env.NEXT_PUBLIC_API_BASE_URL}/form_submissions`,
                { form_submission: { form_id: formId, submission_data: data } }
            );
            setSubmitting(false)
            setQrCode(response.data.form_submission.qrcode_id);
        } catch (error) {
            setSubmitting(false)
            console.error(error);
        }
    };

    if (loading) {
        return <div className="text-center mt-10">Loading...</div>;
    }

    if (!formData) {
        return <div className="text-center mt-10">Loading...</div>;
    }

    return (
        <div className="container mx-auto p-4 max-w-4xl">
            <h1 className="text-2xl font-bold mb-4">{formData?.json_schema?.title}</h1>
            {!qrCode && (
                <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                    {Object.keys(formData.form_data).map((key) => {
                        const fieldSchema = formData.json_schema.properties[key];
                        const uiSchema = formData.ui_schema[key]; // 获取对应的 ui_schema

                        return (
                            <div key={key} className="flex flex-col">
                                <label className="font-medium mb-1">{fieldSchema.title}</label>
                                {fieldSchema.type === 'string' && uiSchema?.['ui:widget'] === 'select' ? (
                                    // 处理下拉选择框
                                    <Controller
                                        name={key}
                                        control={control}
                                        defaultValue={formData.form_data[key]}
                                        render={({ field }) => (
                                            <select {...field} className="border rounded p-2">
                                                {fieldSchema.enum.map((item: string) => (
                                                    <option key={item} value={item}>
                                                        {item}
                                                    </option>
                                                ))}
                                            </select>
                                        )}
                                    />
                                ) : fieldSchema.type === 'array' && uiSchema?.['ui:widget'] === 'checkboxes' ? (
                                    // 处理复选框
                                    <Controller
                                        name={key}
                                        control={control}
                                        defaultValue={formData.form_data[key]}
                                        render={({ field }) => (
                                            <div className="flex flex-col">
                                                {fieldSchema.items.enum.map((item: string) => (
                                                    <label key={item} className="flex items-center">
                                                        <input
                                                            type="checkbox"
                                                            value={item}
                                                            checked={field.value.includes(item)}
                                                            onChange={(e) => {
                                                                const newValue = e.target.checked
                                                                    ? [...field.value, item]
                                                                    : field.value.filter((v: string) => v !== item);
                                                                field.onChange(newValue);
                                                            }}
                                                            className="mr-2"
                                                        />
                                                        {item}
                                                    </label>
                                                ))}
                                            </div>
                                        )}
                                    />
                                ) : (
                                    // 处理其他类型字段
                                    <Controller
                                        name={key}
                                        control={control}
                                        defaultValue={formData.form_data[key]}
                                        render={({ field }) => (
                                            <input
                                                {...field}
                                                placeholder={fieldSchema.title}
                                                className="border rounded p-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                            />
                                        )}
                                    />
                                )}
                                {errors[key] && <span className="text-red-500 text-sm mt-1">{errors[key]?.message + ""}</span>}
                            </div>
                        );
                    })}
                    <div className='flex  justify-end'>
                        <button
                            type="submit"
                            disabled={submitting} // 禁用按钮
                            className={`bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 transition ${submitting ? 'opacity-50 cursor-not-allowed' : ''}`}>
                            {submitting ? '提交中...' : '提交'}
                        </button>
                    </div>
                </form>
            )}

            {qrCode && (
                <div className="mt-8 text-center flex flex-col items-center justify-center">
                    <h2 className="text-xl font-semibold mb-2">您的電子門票 QR Code</h2>
                    <QRCodeCanvas value={qrCode} size={256} />
                    <p className="mt-2">QR Code ID: {qrCode}</p>
                </div>
            )}
        </div>
    );
}
