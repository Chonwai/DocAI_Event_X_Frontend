// pages/admin/page.tsx

'use client';

import axios from 'axios';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { EventForm } from '../page';

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
    const router = useRouter()
    const [formDatas, setFormDatas] = useState<EventForm[]>([])

    useEffect(() => {
        fetchAllFormData()
    }, [])

    const fetchAllFormData = async () => {
        setLoading(true)
        const response = await axios.get(
            `${process.env.NEXT_PUBLIC_API_BASE_URL}/forms`
        );
        console.log('response.data', response.data);
        setLoading(false)
        if (response.data.success) {
            setFormDatas(response.data.forms)
        } else {
            alert(response.data.error?.toString() || 'error')
        }
    }

    const handleClickForm = (formData: any) => {
        router.push(`/admin/form_submissions/${formData?.id}`)
    }

    if (loading) {
        return <div className="text-center mt-10">Loading...</div>;
    }

    return (
        <div className="container mx-auto p-4">
            <h1 className="text-2xl font-bold mb-4">{'表單列表'}</h1>
            {formDatas?.map((data, index: number) => (
                <div key={index} className='flex flex-col mb-4'>
                    <div
                        onClick={() => { handleClickForm(data) }}
                        className='cursor-pointer p-2 border border-gray-200 rounded hover:bg-gray-100'
                    >
                        <label className='font-semibold'>{data?.json_schema?.title}</label>
                    </div>
                </div>
            ))}
        </div>
    );
};

export default AdminDashboard;
