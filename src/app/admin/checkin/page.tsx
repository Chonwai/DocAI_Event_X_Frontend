// pages/admin/checkin/page.tsx

'use client';

import { useState } from 'react';
import axios from 'axios';
import { CheckCircle, XCircle } from 'lucide-react';
import { Scanner } from '@yudiel/react-qr-scanner';

const CheckIn: React.FC = () => {
    const [scanResult, setScanResult] = useState<string | null>(null);
    const [checkInStatus, setCheckInStatus] = useState<{
        success: boolean;
        message: string;
    } | null>(null);
    const [error, setError] = useState<string | null>(null);

    const handleScan = async (detectedCodes: any) => {
        console.log(detectedCodes);
        if (detectedCodes && detectedCodes.length > 0) {
            const data = detectedCodes[0].rawValue;
            setScanResult(data);
            try {
                const response = await axios.patch(
                    `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/admin/form_submissions/${data}/check_in`,
                    {},
                    {
                        headers: {
                            Authorization: `Bearer ${process.env.NEXT_PUBLIC_BEARER_TOKEN}`
                        }
                    }
                );
                setCheckInStatus({ success: true, message: response.data.message });
            } catch (err: any) {
                if (err.response) {
                    setCheckInStatus({ success: false, message: err.response.data.message });
                } else {
                    setCheckInStatus({ success: false, message: 'Check-In 發生錯誤。' });
                }
            }
        }
    };

    const handleError = (err: unknown) => {
        console.error(err);
        setError('無法訪問攝像頭。請確保您已授予攝像頭權限。');
    };

    return (
        <div className="container mx-auto p-4">
            <h1 className="text-2xl font-bold mb-4">工作人員 Check-In 系統</h1>

            <div className="mb-4">
                <Scanner onScan={handleScan} onError={handleError} />
            </div>

            {error && (
                <div className="flex items-center text-red-500 mb-4">
                    <XCircle className="w-5 h-5 mr-2" /> {error}
                </div>
            )}

            {checkInStatus && (
                <div
                    className={`flex items-center p-4 rounded ${
                        checkInStatus.success
                            ? 'bg-green-100 text-green-700'
                            : 'bg-red-100 text-red-700'
                    }`}
                >
                    {checkInStatus.success ? (
                        <CheckCircle className="w-6 h-6 mr-2" />
                    ) : (
                        <XCircle className="w-6 h-6 mr-2" />
                    )}
                    <span>{checkInStatus.message}</span>
                </div>
            )}

            {scanResult && (
                <div className="mt-4">
                    <h2 className="text-xl font-semibold">掃描結果：</h2>
                    <p>QR Code ID: {scanResult}</p>
                </div>
            )}
        </div>
    );
};

export default CheckIn;
