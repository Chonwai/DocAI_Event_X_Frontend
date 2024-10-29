// src/app/auth/error/page.tsx

import { signIn } from 'next-auth/react';
import { useRouter } from 'next/router';

const AuthError: React.FC = () => {
    const router = useRouter();
    const { error } = router.query;

    const getErrorMessage = () => {
        switch (error) {
            case 'CredentialsSignin':
                return '無效的帳號或密碼。';
            default:
                return '登錄失敗，請稍後再試。';
        }
    };

    return (
        <div className="flex items-center justify-center min-h-screen bg-gray-100">
            <div className="bg-white p-6 rounded shadow-md text-center">
                <h1 className="text-2xl font-bold mb-4">登錄錯誤</h1>
                <p className="mb-4">{getErrorMessage()}</p>
                <button
                    onClick={() => signIn()}
                    className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
                >
                    返回登錄
                </button>
            </div>
        </div>
    );
};

export default AuthError;
