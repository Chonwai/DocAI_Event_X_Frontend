'use client';

import axios from 'axios';
import { MoveRightIcon } from 'lucide-react';
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
            <div className="container mx-auto p-4 max-w-3xl">
                <img src='./bg.jpeg'></img>
                {formDatas?.map((data, index: number) => (
                    <div key={index} className="flex flex-col mb-4 my-4">
                        <div
                            onClick={() => {
                                handleClickForm(data);
                            }}
                            className="cursor-pointer p-2  "
                        >
                            <p className="font-semibold text-2xl">{data?.json_schema?.title}</p>

                            <p className='mt-4 font-semibold text-xl'>{data?.name}</p>
                            <div dangerouslySetInnerHTML={{ __html: data?.description }} />
                            <div className='mt-2 flex justify-end'>
                                <button className='flex items-center bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 transition'
                                    onClick={() => {
                                        handleClickForm(data);
                                    }}>
                                    <MoveRightIcon size={20} />
                                </button>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </>
    );
}
