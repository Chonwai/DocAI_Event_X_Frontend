// pages/admin/page.tsx

'use client';

import ScanButton from '@/app/admin/components/ScanButton';
import axios from 'axios';
import { BarChart2, CheckCircle, List, Trash2Icon, User } from 'lucide-react';
import moment from 'moment';
import { useParams, useRouter, useSearchParams } from 'next/navigation';
import { useEffect, useState } from 'react';

interface Submission {
    id: string;
    form_id: string;
    qrcode_id: string;
    submission_data: {
        firstName: string;
        lastName: string;
        name: string;
        email: string;
        role: string;
        mobileNumber: string;
        country: string;
        schoolName: string;
    };
    checked_in: boolean;
    created_at: string;
    check_in_at: string;
}

const AdminDashboard: React.FC = () => {
    const router = useRouter()
    const [submissions, setSubmissions] = useState<Submission[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);
    const searchParams = useSearchParams();
    const [page, setPage] = useState('1');
    const [meta, setMeta] = useState({
        current_page: 1,
        next_page: null,
        prev_page: null,
        total_pages: 1,
        total_count: 0
    });
    const params = useParams();
    useEffect(() => {
        const fetchSubmissions = async () => {
            try {
                const formId = params['id'] || process.env.NEXT_PUBLIC_FORM_ID; // 設置您的表單 ID
                const response = await axios.get(
                    `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/form_submissions/form/${formId}?page=${page}`
                );
                if (response.data.success) {
                    setSubmissions(response.data.form_submissions);
                    setMeta(response.data.meta);
                }
            } catch (err: any) {
                setError('無法獲取報名者信息。');
            } finally {
                setLoading(false);
            }
        };

        fetchSubmissions();
    }, [params, page]);

    useEffect(() => {
        const handleScroll = () => {
            if (window.innerHeight + window.scrollY >= document.body.offsetHeight) {
                if (meta.next_page) {
                    // 檢查是否有下一頁
                    setPage((prevPage) => prevPage + 1); // 增加頁碼以加載更多數據
                }
            }
        };

        window.addEventListener('scroll', handleScroll);
        return () => {
            window.removeEventListener('scroll', handleScroll);
        };
    }, [meta]);

    useEffect(() => {
        if (searchParams && searchParams.get('page')) {
            setPage(searchParams.get('page') as string);
        }
    }, [searchParams]);

    const handleCheckin = async (qrcode_id: string) => {
        try {
            const response = await axios.patch(
                `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/admin/form_submissions/${qrcode_id}/check_in`,
                {},
                {
                    headers: {
                        Authorization: `Bearer ${process.env.NEXT_PUBLIC_BEARER_TOKEN}`
                    }
                }
            );
            // console.log('response', response);
            if (response.data.success) {
                alert(response.data.message);
                //成功簽到，更改狀態checked_in=true
                setSubmissions((prevSubmissions) =>
                    prevSubmissions.map((submission) =>
                        submission.qrcode_id === qrcode_id
                            ? { ...submission, checked_in: true, check_in_at: moment().toString() }
                            : submission
                    )
                );
            } else {
                alert('無法手動簽到');
            }
        } catch (err: any) { }
    };

    const handleCheckout = async (qrcode_id: string) => {
        try {
            const response = await axios.patch(
                `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/admin/form_submissions/${qrcode_id}/cancel_check_in`,
                {},
                {
                    headers: {
                        Authorization: `Bearer ${process.env.NEXT_PUBLIC_BEARER_TOKEN}`
                    }
                }
            );
            // console.log('response', response);
            if (response.data.success) {
                alert(response.data.message)
                //取消簽到，更改狀態checked_in=false
                setSubmissions((prevSubmissions) =>
                    prevSubmissions.map((submission) =>
                        submission.qrcode_id === qrcode_id
                            ? { ...submission, checked_in: false }
                            : submission
                    )
                );
            } else {
                alert('取消簽到失敗')
            }

        } catch (err: any) {
            alert(err?.response?.data?.error || '取消簽到失敗')
        }
    };

    const handleDeleteFormSubmission = async (form_submission_id: string) => {
        try {
            const response = await axios.delete(
                `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/form_submissions/${form_submission_id}`,
                {
                    headers: {
                        Authorization: `Bearer ${process.env.NEXT_PUBLIC_BEARER_TOKEN}`
                    }
                }
            );
            // console.log('response', response);
            if (response.data.success) {
                alert(response.data.message);
                setSubmissions((prevSubmissions) =>
                    prevSubmissions.filter((submission) => submission.id !== form_submission_id)
                );
            } else {
                alert('無法刪除');
            }
        } catch (err: any) { }
    };

    const handleResendEmail = async (form_submission_id: string) => {
        try {
            const response = await axios.post(
                `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/form_submissions/${form_submission_id}/resend_confirmation_email`,
                {},
                {
                    headers: {
                        Authorization: `Bearer ${process.env.NEXT_PUBLIC_BEARER_TOKEN}`
                    }
                }
            );
            // console.log('response', response);
            if (response.data.success) {
                alert(response.data.message);
            } else {
                alert(response.data.message || '重發失敗');
            }
        } catch (err: any) { }
    };

    // if (loading) {
    //     return <div className="text-center mt-10">Loading...</div>;
    // }

    if (error) {
        return <div className="text-red-500 text-center mt-10">{error}</div>;
    }

    return (
        <div className="container mx-auto p-4">
            <h1 className="text-2xl font-bold mb-4 flex items-center">
                <List className="w-6 h-6 mr-2" /> 管理員後台
            </h1>

            <div className="mb-4">
                <div className='flex flex-row items-center justify-between'>
                    <h2 className="text-xl font-semibold flex items-center">
                        <User className="w-6 h-6 mr-2" /> 報名者列表({meta?.total_count || 0})
                    </h2>
                    {/* <h2 className="text-xl font-semibold flex items-center text-green-500">
                        <CheckCircle className="w-4 h-4 mr-1 text-green-500" /> CheckIn
                    </h2> */}
                </div>
                <div className="overflow-x-auto">
                    <table className="min-w-full my-4 bg-white border table-auto">
                        <thead>
                            <tr className="bg-gray-200">
                                <th className="  border-b text-center w-[40px] whitespace-nowrap">
                                    編號
                                </th>
                                <th className="py-3 px-2 sm:px-6 border-b text-left whitespace-nowrap">姓名</th>
                                <th className="py-3 px-2 sm:px-6 border-b text-left whitespace-nowrap">學校</th>
                                <th className="py-3 px-2 sm:px-6 border-b text-left whitespace-nowrap">身份</th>
                                <th className="py-3 px-2 sm:px-6 border-b text-left whitespace-nowrap">電子郵件</th>
                                <th className="py-3 px-2 sm:px-6 border-b text-left whitespace-nowrap">電話號碼</th>
                                <th className="py-3 px-2 sm:px-6 border-b text-left whitespace-nowrap">
                                    國家/地區
                                </th>
                                <th className="py-3 px-2 sm:px-6 border-b text-left whitespace-nowrap">
                                    入場狀態
                                </th>
                                <th className="py-3 px-2 sm:px-6 border-b text-left whitespace-nowrap">入場時間</th>
                                <th className="py-3 px-2 sm:px-6 border-b text-left whitespace-nowrap">報名時間</th>
                                <th className="py-3 px-2 sm:px-6 border-b text-left">操作</th>
                            </tr>
                        </thead>
                        <tbody>
                            {submissions?.map((submission, index) => (
                                <tr key={submission.qrcode_id} className="hover:bg-gray-100">
                                    <td className=" border-b text-center  w-[40px]">{index + 1}</td>
                                    <td className="py-3 px-2 sm:px-6 border-b whitespace-nowrap">
                                        {submission.submission_data.lastName}{' '}
                                        {submission.submission_data.firstName}
                                    </td>
                                    <td className="py-3 px-2 sm:px-6 border-b whitespace-nowrap">
                                        {submission.submission_data.schoolName}
                                    </td>
                                    <td className="py-3 px-2 sm:px-6 border-b whitespace-nowrap">
                                        {submission.submission_data.role}
                                    </td>
                                    <td className="py-3 px-2 sm:px-6 border-b">
                                        {submission.submission_data.email}
                                    </td>
                                    <td className="py-3 px-2 sm:px-6 border-b">
                                        {submission.submission_data.mobileNumber}
                                    </td>
                                    <td className="py-3 px-2 sm:px-6 border-b ">
                                        {submission.submission_data.country}
                                    </td>
                                    <td className="py-3 px-2 sm:px-6 border-b whitespace-nowrap">
                                        {submission.checked_in ? (
                                            <div className="flex flex-row items-center text-sm">
                                                <span className="text-green-500 flex items-center">
                                                    已入場
                                                </span>
                                                <div>
                                                    <CheckCircle className="w-4 h-4 ml-1 text-green-500" />
                                                </div>
                                            </div>
                                        ) : (
                                            <span className="text-red-500">未入場</span>
                                        )}
                                    </td>
                                    <td className="py-3 px-2 sm:px-6 border-b whitespace-nowrap">
                                        {submission.check_in_at ? moment(submission.check_in_at).format('MM-DD HH:mm') : ''}
                                    </td>
                                    <td className="py-3 px-2 sm:px-6 border-b whitespace-nowrap">
                                        {moment(submission.created_at).format('MM-DD HH:mm')}
                                    </td>
                                    <td className="py-3 px-2 sm:px-6 border-b whitespace-nowrap ">
                                        <div className="flex flex-row items-center">
                                            {!submission.checked_in ? (
                                                <span
                                                    className="text-blue-500 text-sm flex items-center cursor-pointer"
                                                    onClick={() => {
                                                        if (window.confirm('確定要簽到嗎？')) {
                                                            handleCheckin(submission.qrcode_id);
                                                        }
                                                    }}
                                                >
                                                    簽到
                                                </span>
                                            ) : (
                                                <span
                                                    className="ml-2 text-blue-500 text-sm flex items-center cursor-pointer"
                                                    onClick={() => {
                                                        if (window.confirm('確定要取消簽到嗎？')) {
                                                            handleCheckout(submission.qrcode_id);
                                                        }
                                                    }}
                                                >
                                                    取消簽到
                                                </span>
                                            )}
                                            <span className="mx-2">|</span>
                                            <span
                                                className="text-blue-500 text-sm flex items-center cursor-pointer"
                                                onClick={() => {
                                                    if (window.confirm('確定要重發Email嗎？')) {
                                                        handleResendEmail(submission.id);
                                                    }
                                                }}
                                            >
                                                重發Email
                                            </span>
                                            <span className="mx-2">|</span>
                                            <span
                                                className="text-blue-500 text-sm flex items-center cursor-pointer hidden"
                                                onClick={() => {
                                                    router.push(`/admin/form_submissions/${submission.id}?form_id=${submission.form_id}`)
                                                }}
                                            >
                                                詳細
                                            </span>
                                            <span
                                                className=" text-red-500 text-sm flex items-center cursor-pointer"
                                                onClick={() => {
                                                    if (window.confirm('確定要刪除嗎？')) {
                                                        handleDeleteFormSubmission(submission.id);
                                                    }
                                                }}
                                            >
                                                <Trash2Icon className="w-4 h-4 ml-1 text-red-500" />
                                            </span>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
            {loading && <div className="text-center mt-10">Loading...</div>}
            <div className="hidden">
                <h2 className="text-xl font-semibold flex items-center">
                    <BarChart2 className="w-6 h-6 mr-2" /> 統計數據
                </h2>
                {/* 集成圖表庫來展示統計數據 */}
            </div>
            <div className="mt-4 flex justify-end fixed bottom-6 right-2">
                <ScanButton />
            </div>
        </div>
    );
};

export default AdminDashboard;
