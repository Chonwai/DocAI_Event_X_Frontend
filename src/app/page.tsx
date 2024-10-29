import { useForm } from 'react-hook-form';
import axios from 'axios';
import { useState } from 'react';
import QRCode from 'qrcode.react';
import { CheckCircle, Mail, Phone, User, Globe } from 'lucide-react'; // 引入所需的圖標

export default function Home() {
    const {
        register,
        handleSubmit,
        formState: { errors }
    } = useForm();
    const [qrCode, setQrCode] = useState(null);
    const [formId, setFormId] = useState(null);

    const onSubmit = async (data) => {
        try {
            // 假設您已經有一個表單 ID
            const formId = 'YOUR_FORM_ID'; // 替換為實際表單 ID
            const response = await axios.post(
                `${process.env.NEXT_PUBLIC_API_BASE_URL}/forms/${formId}/submissions`,
                { form_submission: { submission_data: data } }
            );
            setQrCode(response.data.qrcode_id);
        } catch (error) {
            console.error(error);
        }
    };

    return (
        <div className="container mx-auto p-4">
            <h1 className="text-2xl font-bold mb-4">活動報名表</h1>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                <div>
                    <label className="block text-sm font-medium mb-1">
                        姓名 <span className="text-red-500">*</span>
                    </label>
                    <div className="flex items-center border rounded">
                        <User className="w-5 h-5 text-gray-400 ml-2" />
                        <input
                            name="name"
                            {...register('name', { required: true })}
                            className="flex-1 p-2 focus:outline-none"
                            placeholder="您的姓名"
                        />
                    </div>
                    {errors.name && <span className="text-red-500 text-sm">這是必填欄位</span>}
                </div>

                <div>
                    <label className="block text-sm font-medium mb-1">
                        電子郵件 <span className="text-red-500">*</span>
                    </label>
                    <div className="flex items-center border rounded">
                        <Mail className="w-5 h-5 text-gray-400 ml-2" />
                        <input
                            name="email"
                            type="email"
                            {...register('email', { required: true })}
                            className="flex-1 p-2 focus:outline-none"
                            placeholder="您的電子郵件"
                        />
                    </div>
                    {errors.email && <span className="text-red-500 text-sm">這是必填欄位</span>}
                </div>

                <div>
                    <label className="block text-sm font-medium mb-1">電話號碼</label>
                    <div className="flex items-center border rounded">
                        <Phone className="w-5 h-5 text-gray-400 ml-2" />
                        <input
                            name="phone_number"
                            {...register('phone_number')}
                            className="flex-1 p-2 focus:outline-none"
                            placeholder="您的電話號碼"
                        />
                    </div>
                </div>

                <div>
                    <label className="block text-sm font-medium mb-1">國家</label>
                    <div className="flex items-center border rounded">
                        <Globe className="w-5 h-5 text-gray-400 ml-2" />
                        <select
                            name="country"
                            {...register('country')}
                            className="flex-1 p-2 focus:outline-none"
                            defaultValue="USA"
                        >
                            <option value="USA">USA</option>
                            <option value="Canada">Canada</option>
                            <option value="Others">Others</option>
                        </select>
                    </div>
                </div>

                <button
                    type="submit"
                    className="flex items-center justify-center bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 transition"
                >
                    提交 <CheckCircle className="w-5 h-5 ml-2" />
                </button>
            </form>

            {qrCode && (
                <div className="mt-8 text-center">
                    <h2 className="text-xl font-semibold mb-2">您的電子門票 QR Code</h2>
                    <QRCode value={qrCode} size={256} />
                    <p className="mt-2">QR Code ID: {qrCode}</p>
                </div>
            )}
        </div>
    );
}
