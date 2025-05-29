// pages/admin/page.tsx

'use client';

import ExportToXlsxButton from '@/app/admin/components/ExportToXlsxButton';
import ScanButton from '@/app/admin/components/ScanButton';
import Modal from '@/components/modal';
import { useModalContext } from '@/context/modal-context';
import axios from 'axios';
import {
    BarChart2,
    CheckCircle,
    Eye,
    FileText,
    List,
    Search,
    Settings,
    Trash2Icon,
    User
} from 'lucide-react';
import moment from 'moment';
import { useParams, useRouter, useSearchParams } from 'next/navigation';
import { useEffect, useState } from 'react';

interface Submission {
    id: string;
    form_id: string;
    qrcode_id: string;
    submission_data: {
        [key: string]: string | string[]; // 修改這裡以支持動態鍵值
    };
    checked_in: boolean;
    created_at: string;
    check_in_at: string;
}

const AdminDashboard: React.FC = () => {
    const router = useRouter();
    const [submissions, setSubmissions] = useState<Submission[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);
    const searchParams = useSearchParams();
    const [page, setPage] = useState(1);
    const [meta, setMeta] = useState({
        current_page: 1,
        next_page: null,
        prev_page: null,
        total_pages: 1,
        total_count: 0
    });
    const params = useParams();
    const [searchQuery, setSearchQuery] = useState('');
    const [isSearching, setIsSearching] = useState(false);
    const [formSchema, setFormSchema] = useState<any>(null);
    const [displayOrder, setDisplayOrder] = useState<string[]>([]);
    const [formDetails, setFormDetails] = useState<any>(null);
    const [showFormDetails, setShowFormDetails] = useState(false);
    const [previewUrl, setPreviewUrl] = useState<string | null>(null);
    const [showModal, setShowModal] = useState(false);
    const { setShowConfirmDelete } = useModalContext()

    const fetchSubmissions = async (resetPage = false) => {
        try {
            setLoading(true);
            const formId = params['id'] || process.env.NEXT_PUBLIC_FORM_ID;
            const pageToFetch = resetPage ? 1 : page;
            const response = await axios.get(
                `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/form_submissions/form/${formId}/search?page=${pageToFetch}`
            );

            console.log('API Response:', response.data);
            console.log('Form Schema:', response.data.form?.json_schema);

            if (response.data.success) {
                if (resetPage || pageToFetch == 1) {
                    setSubmissions(response.data.form_submissions);
                    setPage(1);
                } else {
                    setSubmissions(submissions.concat(response.data.form_submissions));
                }
                setMeta(response.data.meta);
                setFormSchema(response.data.form?.json_schema);
                setDisplayOrder(response.data.form?.display_order || []);
            }
            setLoading(false);
        } catch (err: any) {
            setError('無法獲取報名者信息。');
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchSubmissions();
    }, [params, page]);

    useEffect(() => {
        let isLoadingMore = false; // 新增标志位

        const handleScroll = () => {
            if (window.innerHeight + window.scrollY >= document.body.offsetHeight) {
                // console.log('meta', meta);
                if (meta.next_page && !loading && !isLoadingMore) {
                    // 檢查是否有下一頁
                    isLoadingMore = true; // 设置标志位为 true
                    setPage((prevPage) => prevPage + 1); // 增加頁碼以加載更多數據
                }
            }
        };

        // window.addEventListener('scroll', handleScroll);
        // return () => {
        //     window.removeEventListener('scroll', handleScroll);
        // };
        const isMobile = /Mobi|Android/i.test(navigator.userAgent); // 检测是否为移动设备
        // console.log('isMobile', isMobile);

        if (isMobile) {
            window.addEventListener('touchmove', handleScroll); // 仅在移动设备上使用 touchmove
        } else {
            window.addEventListener('scroll', handleScroll); // 仅在电脑端使用 scroll
        }
        return () => {
            if (isMobile) {
                window.removeEventListener('touchmove', handleScroll);
            } else {
                window.removeEventListener('scroll', handleScroll);
            }
        };
    }, [meta, loading]);

    useEffect(() => {
        if (searchParams && searchParams.get('page')) {
            setPage(Number(searchParams.get('page')));
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
                alert(response.data.message);
                //取消簽到，更改狀態checked_in=false
                setSubmissions((prevSubmissions) =>
                    prevSubmissions.map((submission) =>
                        submission.qrcode_id === qrcode_id
                            ? { ...submission, checked_in: false }
                            : submission
                    )
                );
            } else {
                alert('取消簽到失敗');
            }
        } catch (err: any) {
            alert(err?.response?.data?.error || '取消簽到失敗');
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

    const handleSearch = async (query: string) => {
        try {
            setIsSearching(true);
            const formId = params['id'] || process.env.NEXT_PUBLIC_FORM_ID;
            const response = await axios.get(
                `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/form_submissions/form/${formId}/search?query=${query}`
            );
            if (response.data.success) {
                setSubmissions(response.data.form_submissions);
                setMeta(response.data.meta);
                setPage(1); // 重置頁碼
            }
        } catch (err) {
            console.error('搜尋錯誤:', err);
        } finally {
            setIsSearching(false);
        }
    };

    const handleReset = () => {
        setSearchQuery('');
        setIsSearching(false);
        fetchSubmissions(true); // 重置並重新獲取數據
    };

    useEffect(() => {
        fetchFormDetails();
    }, [params]);

    const fetchFormDetails = async () => {
        try {
            const formId = params['id'] || process.env.NEXT_PUBLIC_FORM_ID;
            const response = await axios.get(
                `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/forms/${formId}`
            );
            if (response.data.success) {
                // console.log('Form Details:', response.data.form);
                setFormDetails(response.data.form);
            }
        } catch (err) {
            console.error('獲取表單詳情失敗:', err);
        }
    };

    // if (loading) {
    //     return <div className="text-center mt-10">Loading...</div>;
    // }

    // 渲染 Modal
    const renderPreviewModal = () => (
        <Modal
            isShow={showModal}
            onClose={() => { setShowModal(false) }}
            wrapperClassName="z-50"
            className={'z-50'}
            closable
        >
            <div
                onClick={(e) => {
                    e.stopPropagation();
                    e.stopPropagation();
                    e.nativeEvent.stopImmediatePropagation();
                }}
            >
                <div className="p-2 flex items-center justify-center">
                    {previewUrl?.toLowerCase().endsWith('.pdf') ? (
                        <embed src={previewUrl} type="application/pdf" width="500px" height="700px" />
                    ) : (
                        <img src={previewUrl || ''} alt="preview" className="max-w-full max-h-[700px] rounded" />
                    )}
                </div>
            </div>
        </Modal>

    );

    const onClickDelete = () => {
        setShowConfirmDelete({
            payload: {
                content: '確定刪除表單嗎?'
            },
            onSaveCallback: async (newPayload) => {
                console.log('newPayload');
                const formId = params['id'] || process.env.NEXT_PUBLIC_FORM_ID;
                const response = await axios.delete(
                    `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/admin/forms/${formId}`,
                    {
                        headers: {
                            Authorization: `Bearer ${process.env.NEXT_PUBLIC_BEARER_TOKEN}`
                        }
                    }
                )
                if (response.data.success) {
                    // console.log('Form Details:', response.data.form);
                    router.back()
                    router.refresh()
                }
            }
        })
    }

    if (error) {
        return <div className="text-red-500 text-center mt-10">{error}</div>;
    }

    return (
        <div className="container mx-auto p-4">
            <div className="flex flex-row items-center justify-between mb-4 flex-wrap">
                <h1 className="text-2xl font-bold flex items-center">
                    <List className="w-6 h-6 mr-2" /> 管理員後台
                </h1>
                <div className="flex items-center gap-2">
                    <button
                        onClick={() => setShowFormDetails(!showFormDetails)}
                        className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 transition flex items-center gap-2 text-sm"
                    >
                        <Eye className="w-4 h-4" />
                        {showFormDetails ? '隱藏表單內容' : '顯示表單內容'}
                    </button>
                    <ExportToXlsxButton name="submissions" datas={submissions} disabled={false} />
                </div>
            </div>

            {showFormDetails && formDetails && (
                <div className="bg-white rounded-lg shadow-md p-6 mb-6">
                    <div className="flex justify-between items-center mb-4">
                        <h2 className="text-xl font-semibold flex items-center">
                            <FileText className="w-6 h-6 mr-2" /> 表單內容
                        </h2>
                        <div className='flex flex-row items-end space-x-4'>
                            <button
                                onClick={() => router.push(`/admin/forms/${params['id']}/settings`)}
                                className="text-gray-600 hover:text-gray-800 transition flex items-center gap-2"
                            >
                                <Settings className="w-5 h-5" />
                                表單設置
                            </button>
                            <button
                                onClick={onClickDelete}
                                className="text-red-600 hover:text-red-800 transition flex items-center gap-2"
                            >
                                <Trash2Icon className="w-5 h-5" />
                                刪除表單
                            </button>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <h3 className="font-semibold mb-2">基本信息</h3>
                            <div className="bg-gray-50 p-4 rounded">
                                <p className="mb-2">
                                    <span className="font-medium">表單標題：</span>
                                    {formDetails.json_schema?.title}
                                </p>
                                <div className="mb-2">
                                    <span className="font-medium">表單描述：</span>
                                    <div
                                        className="mt-1"
                                        dangerouslySetInnerHTML={{
                                            __html: formDetails.json_schema?.description || ''
                                        }}
                                    />
                                </div>
                                <p>
                                    <span className="font-medium">創建時間：</span>
                                    {moment(formDetails.created_at).format('YYYY-MM-DD HH:mm')}
                                </p>
                            </div>
                        </div>

                        <div>
                            <h3 className="font-semibold mb-2">表單統計</h3>
                            <div className="bg-gray-50 p-4 rounded">
                                <p className="mb-2">
                                    <span className="font-medium">總提交數：</span>
                                    {meta?.total_count || 0}
                                </p>
                                <p className="mb-2">
                                    <span className="font-medium">已入場人數：</span>
                                    {submissions.filter((s) => s.checked_in).length}
                                </p>
                                <p>
                                    <span className="font-medium">未入場人數：</span>
                                    {submissions.filter((s) => !s.checked_in).length}
                                </p>
                            </div>
                        </div>

                        <div className="md:col-span-2">
                            <h3 className="font-semibold mb-2">表單欄位</h3>
                            <div className="bg-gray-50 p-4 rounded">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    {formDetails.json_schema?.properties &&
                                        Object.entries(formDetails.json_schema.properties).map(
                                            ([key, field]: [string, any]) => {
                                                if (!field) return null;
                                                return (
                                                    <div key={key} className="flex flex-col">
                                                        <span className="font-medium">
                                                            {field.title}
                                                        </span>
                                                        <span className="text-sm text-gray-600">
                                                            類型：{field.type}
                                                            {formDetails.json_schema.required?.includes(
                                                                key
                                                            ) && (
                                                                    <span className="text-red-500 ml-2">
                                                                        必填
                                                                    </span>
                                                                )}
                                                        </span>
                                                        {field.enum && (
                                                            <span className="text-sm text-gray-600">
                                                                選項：{field.enum.join(', ')}
                                                            </span>
                                                        )}
                                                    </div>
                                                );
                                            }
                                        )}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            <div className="mb-4">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-4 gap-4">
                    <h2 className="text-xl font-semibold flex items-center">
                        <User className="w-6 h-6 mr-2" /> 報名者列表({meta?.total_count || 0})
                    </h2>

                    <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
                        <div className="relative flex-grow sm:flex-grow-0 sm:w-64">
                            <input
                                type="text"
                                placeholder="搜尋電郵..."
                                className="w-full pl-10 pr-4 py-2 border rounded-lg focus:outline-none focus:border-blue-500"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                onKeyPress={(e) => {
                                    if (e.key === 'Enter' && searchQuery.trim()) {
                                        handleSearch(searchQuery);
                                    }
                                }}
                            />
                            <Search className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
                            {isSearching && (
                                <div className="absolute right-3 top-2.5">
                                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-500"></div>
                                </div>
                            )}
                        </div>

                        <div className="flex gap-2 w-full sm:w-auto">
                            <button
                                onClick={() => searchQuery.trim() && handleSearch(searchQuery)}
                                className="flex-1 sm:flex-none px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors flex items-center justify-center gap-2"
                                disabled={isSearching || !searchQuery.trim()}
                            >
                                <Search className="h-5 w-5" />
                                搜尋
                            </button>

                            {searchQuery && (
                                <button
                                    onClick={handleReset}
                                    className="flex-1 sm:flex-none px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors flex items-center justify-center gap-2"
                                    disabled={isSearching}
                                >
                                    顯示全部
                                </button>
                            )}
                        </div>
                    </div>
                </div>

                <div className="overflow-x-auto">
                    <table className="min-w-full my-4 bg-white border table-auto">
                        <thead>
                            <tr className="bg-gray-200">
                                <th className="border-b px-4 py-2 text-center whitespace-nowrap">
                                    編號
                                </th>
                                {formDetails?.json_schema?.properties &&
                                    Object.entries(formDetails.json_schema.properties).map(
                                        ([key, field]: [string, any]) => (
                                            <th
                                                key={key}
                                                className="border-b px-4 py-2 text-left whitespace-nowrap"
                                            >
                                                <div className="font-medium">{field.title}</div>
                                            </th>
                                        )
                                    )}
                                <th className="border-b px-4 py-2 text-left whitespace-nowrap">
                                    入場狀態
                                </th>
                                <th className="border-b px-4 py-2 text-left whitespace-nowrap">
                                    入場時間
                                </th>
                                <th className="border-b px-4 py-2 text-left whitespace-nowrap">
                                    報名時間
                                </th>
                                <th className="border-b px-4 py-2 text-left">操作</th>
                            </tr>
                        </thead>
                        <tbody>
                            {submissions?.map((submission, index) => (
                                <tr key={submission.qrcode_id} className="hover:bg-gray-100">
                                    <td className="border-b px-4 py-2 text-center">{index + 1}</td>
                                    {formDetails?.json_schema?.properties &&
                                        Object.entries(formDetails.json_schema.properties).map(
                                            ([key, field]: [string, any]) => {
                                                // console.log('key', formDetails?.ui_schema[key]['ui:widget']);
                                                const widget = formDetails?.ui_schema[key]?.['ui:widget']
                                                const value = submission.submission_data[key];
                                                if (widget == 'file') {
                                                    return (
                                                        <td
                                                            key={key}
                                                            className='px-4 py-2'>
                                                            <label className=' text-blue-500 cursor-pointer underline'
                                                                onClick={() => {
                                                                    // 支持多文件时可自行拆分
                                                                    const url = Array.isArray(value) ? value[0] : value;
                                                                    setPreviewUrl(url);
                                                                    setShowModal(true);
                                                                }}
                                                            >查看</label>
                                                        </td>
                                                    )
                                                }
                                                return (
                                                    <td
                                                        key={key}
                                                        className="border-b px-4 py-2 whitespace-nowrap"
                                                    >

                                                        {Array.isArray(value)
                                                            ? value.join(', ')
                                                            : value}
                                                    </td>
                                                );
                                            }
                                        )}
                                    <td className="border-b px-4 py-2 whitespace-nowrap">
                                        {submission.checked_in ? (
                                            <div className="flex flex-row items-center text-sm">
                                                <span className="text-green-500 flex items-center">
                                                    已入場
                                                </span>
                                                <CheckCircle className="w-4 h-4 ml-1 text-green-500" />
                                            </div>
                                        ) : (
                                            <span className="text-red-500">未入場</span>
                                        )}
                                    </td>
                                    <td className="border-b px-4 py-2 whitespace-nowrap">
                                        {submission.check_in_at
                                            ? moment(submission.check_in_at).format('MM-DD HH:mm')
                                            : ''}
                                    </td>
                                    <td className="border-b px-4 py-2 whitespace-nowrap">
                                        {moment(submission.created_at).format('MM-DD HH:mm')}
                                    </td>
                                    <td className="border-b px-4 py-2 whitespace-nowrap">
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
                                                    className="text-blue-500 text-sm flex items-center cursor-pointer"
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
                                                className="text-red-500 text-sm flex items-center cursor-pointer"
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
            {renderPreviewModal()}
        </div>
    );
};

export default AdminDashboard;
