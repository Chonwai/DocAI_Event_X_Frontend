// pages/admin/page.tsx

'use client';

import axios from 'axios';
import { User } from 'lucide-react';
import { useParams } from 'next/navigation';
import { useEffect, useState } from 'react';

interface Submission {
    qrcode_id: string;
    submission_data: {
        firstName: string;
        lastName: string;
        name: string;
        email: string;
        mobileNumber: string;
        country: string;
    };
    checked_in: boolean;
}

const AdminDashboard: React.FC = () => {
    const [formSubmission, setFormSubmission] = useState<Submission[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);
    const params = useParams();
    useEffect(() => {
        const fetchSubmissions = async () => {
            try {
                const formId = params['id'] || process.env.NEXT_PUBLIC_FORM_ID; // 設置您的表單 ID
                const response = await axios.get(
                    `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/form_submissions/${formId}`
                );
                setFormSubmission(response.data.form_submission);
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

    return (
        <div className="container mx-auto p-4">
            <div className="mb-4">
                <h2 className="text-xl font-semibold flex items-center">
                    <User className="w-6 h-6 mr-2" /> 詳細
                </h2>
                <table className="min-w-full my-4 bg-white border">
                    <thead>
                        <tr className="bg-gray-200">
                            <th className="py-3 px-6 border-b text-left">姓名</th>
                            <th className="py-3 px-6 border-b text-left">電子郵件</th>
                            <th className="py-3 px-6 border-b text-left">電話號碼</th>
                            <th className="py-3 px-6 border-b text-left">國家</th>
                            <th className="py-3 px-6 border-b text-left">入場狀態</th>
                        </tr>
                    </thead>
                </table>
            </div>
        </div>
    );
};

export default AdminDashboard;
