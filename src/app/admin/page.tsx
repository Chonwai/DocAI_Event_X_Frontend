// pages/admin/page.tsx

'use client';

import axios from 'axios';
import { List, MoveRightIcon } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { EventForm } from '../page';
import ScanButton from './components/ScanButton';

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
    const router = useRouter();
    const [formDatas, setFormDatas] = useState<EventForm[]>([]);

    const title = `HKU Information Day 2024 in Macau 香港大學本科入學資訊日 2024（澳門）`;
    const description = `
    Date 日期：9 November 2024 (Saturday)​ 2024年11月9日（星期六）<br/>
    Time 時間： 9:00am-6:00pm<br/>
    Venue 地點：Chan Sui Ki Perpetual Help College, 28, Estrada da Vitoria, Macau<br/>
    澳門得勝馬路廿八號陳瑞祺永援中學<br/>
    <br/>
    Organized By 主辦單位: 香港大學 The University of Hong Kong<br/>
    Co-Organized By 承辦單位: 澳門聯校科學展覽青年協會 Macao Joint School Science Exhibition Youth Association<br/>`;

    useEffect(() => {
        fetchAllFormData();
    }, []);

    const fetchAllFormData = async () => {
        setLoading(true);
        const response = await axios.get(`${process.env.NEXT_PUBLIC_API_BASE_URL}/api/forms`);
        // console.log('response.data', response.data);
        setLoading(false);
        if (response.data.success) {
            setFormDatas(response.data.forms);
        } else {
            alert(response.data.error?.toString() || 'error');
        }
    };

    const handleClickForm = (formData: any) => {
        router.push(`/admin/forms/${formData?.id}/form_submissions`);
    };

    if (loading) {
        return <div className="text-center mt-10">Loading...</div>;
    }

    return (
        <div className="container mx-auto p-4 relative">
            <h1 className="text-2xl font-bold mb-4 flex items-center">
                <List className="w-6 h-6 mr-2" /> 管理員後台
            </h1>
            <div className="container mx-auto p-4 max-w-3xl">
                <img src="./bg.jpeg"></img>
                {formDatas?.map((data, index: number) => (
                    <div key={index} className="flex flex-col mb-4 my-4">
                        <div
                            onClick={() => {
                                handleClickForm(data);
                            }}
                            className="cursor-pointer p-2  "
                        >
                            <p className="font-semibold text-2xl">{data?.json_schema?.title}</p>

                            <p className="mt-4 font-semibold text-xl">{title}</p>
                            <div
                                dangerouslySetInnerHTML={{
                                    __html: description
                                }}
                            />
                            <div className="mt-2 flex justify-end">
                                <button
                                    className="flex items-center bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 transition"
                                    onClick={() => {
                                        handleClickForm(data);
                                    }}
                                >
                                    <MoveRightIcon size={20} />
                                </button>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
            <div className="mt-4 flex justify-end fixed bottom-6 right-2">
                <ScanButton />
            </div>
        </div>
    );
};

export default AdminDashboard;
