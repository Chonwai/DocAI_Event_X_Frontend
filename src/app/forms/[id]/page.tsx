'use client';

import axios from 'axios';
import { useParams, useRouter } from 'next/navigation';
import { QRCodeCanvas } from 'qrcode.react';
import { useEffect, useState } from 'react';
import { ChakraProvider } from '@chakra-ui/react';
import { extendTheme } from '@chakra-ui/theme-utils';
import Form from '@rjsf/chakra-ui';
import validator from '@rjsf/validator-ajv8';

const theme = extendTheme({});

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
    display_order: any[];
}

export default function FormDetail() {
    const router = useRouter();
    const params = useParams();
    const [qrCode, setQrCode] = useState(null);
    const [formData, setFormData] = useState<FormDetail>();
    const [submissionData, setSubmissionData] = useState<any>();
    const [loading, setLoading] = useState<boolean>(true);
    const [submitting, setSubmitting] = useState<boolean>(false);

    useEffect(() => {
        fetchFormDataById();
    }, [params]);

    const fetchFormDataById = async () => {
        setLoading(true);
        const formId = params['id'] || process.env.NEXT_PUBLIC_FORM_ID;
        const response = await axios.get(
            `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/forms/${formId}`
        );
        setLoading(false);
        if (response.data.success) {
            setFormData(response.data.form);
        } else {
            alert(response.data.error?.toString() || 'error');
        }
    };

    const onSubmit = async ({ formData: submitData }: any) => {
        setSubmissionData(submitData);
        setSubmitting(true);
        try {
            const formId = params['id'] || process.env.NEXT_PUBLIC_FORM_ID;
            const response = await axios.post(
                `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/form_submissions`,
                { form_submission: { form_id: formId, submission_data: submitData } }
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

    return (
        <ChakraProvider theme={theme}>
            <div className="container mx-auto p-4 max-w-3xl">
                <img src="../bg.jpeg" alt="背景圖片" />
                {!qrCode && (
                    <Form
                        schema={formData.json_schema}
                        uiSchema={formData.ui_schema}
                        formData={formData.form_data}
                        validator={validator}
                        onSubmit={onSubmit}
                        disabled={submitting}
                    />
                )}
                {qrCode && (
                    <div className="mt-8 text-center flex flex-col items-center justify-center">
                        <h2 className="text-4xl font-extrabold text-green-600 mb-4">報名成功!</h2>
                        <p className="text-xl font-semibold mb-2">您很快將收到確認電子郵件。</p>
                        <p className="text-xl font-semibold mb-2">
                            Registration successful! You will receive a confirmation email shortly.
                        </p>
                        <h3 className="text-xl font-semibold mb-2">您的電子門票 QR Code</h3>
                        <QRCodeCanvas value={qrCode} size={256} />
                        <p className="mt-2">請活動當天顯示二維碼入場。</p>
                        <p className="mt-2">
                            Please show this QR code for entry on the day of the event.
                        </p>
                    </div>
                )}
            </div>
        </ChakraProvider>
    );
}
