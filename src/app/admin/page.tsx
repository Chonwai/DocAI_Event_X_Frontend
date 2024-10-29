'use client';

import { useState, useEffect } from 'react';
import axios from 'axios';
import { User, List, BarChart2, LogOut } from 'lucide-react';

export default function Admin() {
    const [submissions, setSubmissions] = useState([]);

    useEffect(() => {
        // 假設您已經有一個表單 ID
        const formId = 'YOUR_FORM_ID'; // 替換為實際表單 ID
        axios
            .get(`${process.env.NEXT_PUBLIC_API_BASE_URL}/forms/${formId}/submissions`)
            .then((response) => {
                setSubmissions(response.data);
            })
            .catch((error) => {
                console.error(error);
            });
    }, []);

    return (
        <div className="container mx-auto p-4">
            <h1 className="text-2xl font-bold mb-4 flex items-center">
                <List className="w-6 h-6 mr-2" /> 管理員後台
            </h1>

            <div className="mb-4">
                <button className="flex items-center bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600 transition">
                    <LogOut className="w-5 h-5 mr-2" /> 登出
                </button>
            </div>

            <div className="mb-6">
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
                {/* 這裡可以集成圖表庫來展示統計數據 */}
            </div>
        </div>
    );
}
