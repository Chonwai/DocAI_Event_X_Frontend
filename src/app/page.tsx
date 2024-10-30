'use client';

import axios from 'axios';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
export interface EventForm {
    id: string;
    name: string;
    description: string;
    json_schema: {
        type: string;
        title: string;
        properties: any;
        dependencies: any;
    };
}

export default function Home() {
    const router = useRouter();
    const [formDatas, setFormDatas] = useState<EventForm[]>([]);

    useEffect(() => {
        fetchAllFormData();
    }, []);

    const fetchAllFormData = async () => {
        const response = await axios.get(`${process.env.NEXT_PUBLIC_API_BASE_URL}/api/forms`);
        console.log('response.data', response.data);
        if (response.data.success) {
            setFormDatas(response.data.forms);
        } else {
            alert(response.data.error?.toString() || 'error');
        }
    };

    const handleClickForm = (formData: any) => {
        router.push(`/forms/${formData?.id}`);
    };

    return (
        <>
            <div className="container mx-auto p-4">
                {formDatas?.map((data, index: number) => (
                    <div key={index} className="flex flex-col mb-4">
                        <div
                            onClick={() => {
                                handleClickForm(data);
                            }}
                            className="cursor-pointer p-2 border border-gray-200 rounded hover:bg-gray-100"
                        >
                            <label className="font-semibold">{data?.json_schema?.title}</label>
                        </div>
                    </div>
                ))}
            </div>
        </>
    );
}
