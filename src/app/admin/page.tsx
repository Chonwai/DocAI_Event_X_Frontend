// pages/admin/page.tsx

'use client';

import { User, List, BarChart2, CheckCircle } from 'lucide-react';
import axios from 'axios';
import { useEffect, useState } from 'react';

interface Submission {
    qrcode_id: string;
    submission_data: {
        name: string;
        email: string;
        phone_number: string;
        country: string;
    };
    checked_in: boolean;
}

const AdminDashboard: React.FC = () => {
    const [submissions, setSubmissions] = useState<Submission[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchSubmissions = async () => {
            try {
                const formId = process.env.NEXT_PUBLIC_FORM_ID; // 設置您的表單 ID
                const response = await axios.get(
                    `${process.env.NEXT_PUBLIC_API_BASE_URL}/forms/${formId}`
                );
                setSubmissions(response.data);
            } catch (err: any) {
                setError('無法獲取報名者信息。');
            } finally {
                setLoading(false);
            }
        };

        fetchSubmissions();
    }, []);

    if (loading) {
        return <div className="text-center mt-10">Loading...</div>;
    }

    if (error) {
        return <div className="text-red-500 text-center mt-10">{error}</div>;
    }

    return (
        <div className="container mx-auto p-4">
            <h1 className="text-2xl font-bold mb-4 flex items-center">
                <List className="w-6 h-6 mr-2" /> 管理員後台
            </h1>

            <div className="mb-4">
                <h2 className="text-xl font-semibold flex items-center">
                    <User className="w-6 h-6 mr-2" /> 報名者列表
                </h2>
                <table className="min-w-full bg-white border">
                    <thead>
                        <tr>
                            <th className="py-2 px-4 border-b">姓名</th>
                            <th className="py-2 px-4 border-b">電子郵件</th>
                            <th className="py-2 px-4 border-b">電話號碼</th>
                            <th className="py-2 px-4 border-b">國家</th>
                            <th className="py-2 px-4 border-b">入場狀態</th>
                        </tr>
                    </thead>
                    <tbody>
                        {submissions.map((submission) => (
                            <tr key={submission.qrcode_id}>
                                <td className="py-2 px-4 border-b">
                                    {submission.submission_data.name}
                                </td>
                                <td className="py-2 px-4 border-b">
                                    {submission.submission_data.email}
                                </td>
                                <td className="py-2 px-4 border-b">
                                    {submission.submission_data.phone_number}
                                </td>
                                <td className="py-2 px-4 border-b">
                                    {submission.submission_data.country}
                                </td>
                                <td className="py-2 px-4 border-b">
                                    {submission.checked_in ? (
                                        <span className="text-green-500 flex items-center">
                                            已入場 <CheckCircle className="w-4 h-4 ml-1" />
                                        </span>
                                    ) : (
                                        <span className="text-red-500">未入場</span>
                                    )}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            <div>
                <h2 className="text-xl font-semibold flex items-center">
                    <BarChart2 className="w-6 h-6 mr-2" /> 統計數據
                </h2>
                {/* 集成圖表庫來展示統計數據 */}
            </div>
        </div>
    );
};

export default AdminDashboard;
