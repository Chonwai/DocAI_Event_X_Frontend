// pages/admin/page.tsx

'use client';

import { FormDetail } from '@/app/forms/[id]/page';
import axios from 'axios';
import { ChevronLeftIcon, User } from 'lucide-react';
import { useParams, useRouter, useSearchParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import { Controller, useForm } from 'react-hook-form';

interface Submission {
    qrcode_id: string;
    submission_data: any;
    checked_in: boolean;
}

const AdminDashboard: React.FC = () => {
    const {
        register,
        handleSubmit,
        control,
        formState: { errors }
    } = useForm();

    const [formSubmission, setFormSubmission] = useState<Submission>();
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);
    const params = useParams();
    const router = useRouter()
    const searchParams = useSearchParams()
    const [formData, setFormData] = useState<FormDetail>();
    const [formId, setFormId] = useState('')

    useEffect(() => {
        if (searchParams && searchParams.get('form_id'))
            fetchFormDataById(searchParams.get('form_id') as string);
    }, [searchParams]);

    const fetchFormDataById = async (formId: string) => {
        console.log('form id', params['id']);
        setLoading(true);
        // const formId = params['id'] || process.env.NEXT_PUBLIC_FORM_ID;
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

    useEffect(() => {
        const fetchSubmissions = async () => {
            try {
                const formId = params['id'] || process.env.NEXT_PUBLIC_FORM_ID; // 設置您的表單 ID
                const response = await axios.get(
                    `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/form_submissions/${formId}`
                );
                setFormSubmission(response.data.form_submission);
                setFormId(response.data.form_submission.form_id)
            } catch (err: any) {
                setError('無法獲取報名者信息。');
            } finally {
                setLoading(false);
            }
        };

        fetchSubmissions();
    }, [params]);

    if (loading) {
        return <div className="text-center mt-10">Loading...</div>;
    }

    if (error) {
        return <div className="text-red-500 text-center mt-10">{error}</div>;
    }

    if (!formData || !formSubmission) {
        return <div className="text-center mt-10">Loading...</div>;
    }

    const requiredFields = formData.json_schema.required || [];

    return (
        <div className="container mx-auto p-4">
            <div className="mb-4">
                <div className='flex flex-row items-center justify-between'>
                    <h2 className="flex items-center"
                        onClick={() => { router.back() }}
                    >
                        <ChevronLeftIcon className="w-6 h-6 " /> 返回
                    </h2>
                    <h2 className="text-xl font-semibold flex items-center mx-auto">
                        <User className="w-6 h-6 mr-2" /> 詳細
                    </h2>
                </div>

                <form className="space-y-4 mt-4">
                    {Object.keys(formData.form_data).map((key) => {
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
                                        defaultValue={formSubmission.submission_data[key]}
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
                                        defaultValue={formSubmission.submission_data[key]}
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
                                        defaultValue={formSubmission.submission_data[key]}
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
                    {/* <div className="flex justify-end">
                        <button
                        
                            type="submit"
                            disabled={submitting}
                            className={`bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 transition ${
                                submitting ? 'opacity-50 cursor-not-allowed' : ''
                            }`}
                        >
                            {submitting ? '提交中...' : '提交'}
                        </button>
                    </div> */}
                </form>
            </div>
        </div>
    );
};

export default AdminDashboard;
