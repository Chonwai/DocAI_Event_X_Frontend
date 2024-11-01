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
        dependencies: any;
        required?: string[];
    };
    form_data: any;
    ui_schema: any;
    display_order: any[]
}

export default function FormDetail() {
    const {
        register,
        handleSubmit,
        control,
        formState: { errors }
    } = useForm();
    const router = useRouter();
    const params = useParams();
    const [qrCode, setQrCode] = useState(null);
    const [formId, setFormId] = useState(null);
    const [formData, setFormData] = useState<FormDetail>();
    const [submissionData, setSubmissionData] = useState<any>();
    const [loading, setLoading] = useState<boolean>(true);
    const [submitting, setSubmitting] = useState<boolean>(false);

    useEffect(() => {
        fetchFormDataById();
    }, [params]);

    const fetchFormDataById = async () => {
        console.log('form id', params['id']);
        setLoading(true);
        const formId = params['id'] || process.env.NEXT_PUBLIC_FORM_ID;
        const response = await axios.get(
            `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/forms/${formId}`
        );
        setLoading(false);
        console.log('response.data', response.data);
        if (response.data.success) {
            setFormData(response.data.form);
        } else {
            alert(response.data.error?.toString() || 'error');
        }
    };

    const onSubmit = async (data: any) => {
        console.log('submit form data', data);
        setSubmissionData(data);
        setSubmitting(true);
        try {
            const formId = params['id'] || process.env.NEXT_PUBLIC_FORM_ID;
            const response = await axios.post(
                `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/form_submissions`,
                { form_submission: { form_id: formId, submission_data: data } }
            );
            setSubmitting(false);
            setQrCode(response.data.form_submission.qrcode_id);
        } catch (error) {
            setSubmitting(false);
            console.error(error);
            alert('提交失敗，請稍後再試。');
        }
    };

    if (loading) {
        return <div className="text-center mt-10">Loading...</div>;
    }

    if (!formData) {
        return <div className="text-center mt-10">Loading...</div>;
    }

    const requiredFields = formData.json_schema.required || [];

    return (
        <div className="container mx-auto p-4 max-w-3xl">
            <img src="../bg.jpeg" alt="背景圖片" />
            {!qrCode && (
                <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 mt-4">
                    {formData.display_order.map((key) => {
                        const fieldSchema = formData.json_schema.properties[key];
                        const uiSchema = formData.ui_schema[key];
                        const isRequired = requiredFields.includes(key);

                        return (
                            <div key={key} className="flex flex-col">
                                <label className="font-medium mb-1">
                                    {fieldSchema.title}
                                    {isRequired && <span className="text-red-500"> *</span>}
                                </label>
                                {fieldSchema.type === 'string' &&
                                    uiSchema?.['ui:widget'] === 'select' ? (
                                    <Controller
                                        name={key}
                                        control={control}
                                        defaultValue={formData.form_data[key]}
                                        rules={{
                                            required: isRequired
                                                ? `${fieldSchema.title} 是必填項`
                                                : false
                                        }}
                                        render={({ field }) => (
                                            <div className="flex flex-col">
                                                {fieldSchema.enum.map((item: string) => (
                                                    <label key={item} className="flex items-center">
                                                        <input
                                                            type="radio"
                                                            value={item}
                                                            checked={field.value === item}
                                                            onChange={() => field.onChange(item)}
                                                            className="mr-2"
                                                        />
                                                        {item}
                                                    </label>
                                                ))}
                                            </div>
                                        )}
                                    />
                                ) : fieldSchema.type === 'array' &&
                                    uiSchema?.['ui:widget'] === 'checkboxes' ? (
                                    <Controller
                                        name={key}
                                        control={control}
                                        defaultValue={formData.form_data[key]}
                                        rules={{
                                            required: isRequired
                                                ? fieldSchema.items.enum.length > 0
                                                    ? `${fieldSchema.title} 至少選擇一項`
                                                    : false
                                                : false
                                        }}
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
                                                                    : field.value.filter(
                                                                        (v: string) => v !== item
                                                                    );
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
                                    <Controller
                                        name={key}
                                        control={control}
                                        defaultValue={formData.form_data[key]}
                                        rules={{
                                            required: isRequired
                                                ? `${fieldSchema.title} 是必填項`
                                                : false
                                        }}
                                        render={({ field }) => (
                                            <input
                                                {...field}
                                                placeholder={fieldSchema.title}
                                                className="border rounded p-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                            />
                                        )}
                                    />
                                )}
                                {errors[key] && (
                                    <span className="text-red-500 text-sm mt-1">
                                        {String(errors[key]?.message)}
                                    </span>
                                )}
                            </div>
                        );
                    })}
                    <div className="flex justify-end">
                        <button

                            type="submit"
                            disabled={submitting}
                            className={`bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 transition ${submitting ? 'opacity-50 cursor-not-allowed' : ''
                                }`}
                        >
                            {submitting ? '提交中...' : '提交'}
                        </button>
                    </div>
                </form>
            )}

            {qrCode && (
                <div className="mt-8 text-center flex flex-col items-center justify-center">
                    <h2 className="text-xl font-semibold mb-2">您的電子門票 QR Code</h2>
                    <QRCodeCanvas value={qrCode} size={256} />
                    <p className="mt-2">請活動當天顯示此二維碼入場。</p>
                    <p className="mt-2">
                        Please show this QR code for entry on the day of the event.
                    </p>
                    <p className="mt-2">
                        姓名 Name: {submissionData?.lastName} {submissionData?.firstName}
                    </p>
                </div>
            )}
        </div>
    );
}
