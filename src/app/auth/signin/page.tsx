// src/app/auth/signin/page.tsx

'use client';

import { getCsrfToken, signIn } from 'next-auth/react';
import { useState, useEffect } from 'react';

const SignIn: React.FC = () => {
    const [csrfToken, setCsrfToken] = useState<string | null>(null);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchCsrfToken = async () => {
            const token = await getCsrfToken();
            setCsrfToken(token || null);
        };
        fetchCsrfToken();
    }, []);

    const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        const form = event.currentTarget;
        const formData = new FormData(form);
        const username = formData.get('username') as string;
        const password = formData.get('password') as string;

        const res = await signIn('credentials', {
            redirect: false,
            username,
            password
        });

        if (res?.error) {
            setError(res.error);
        } else {
            window.location.href = '/admin/checkin';
        }
    };

    return (
        <div className="flex items-center justify-center min-h-screen bg-gray-100">
            <form method="post" onSubmit={handleSubmit} className="bg-white p-6 rounded shadow-md">
                <input name="csrfToken" type="hidden" value={csrfToken || ''} />
                <h1 className="text-2xl mb-4">管理員登錄</h1>
                {error && (
                    <div className="mb-4 text-red-500">
                        {error === 'CredentialsSignin'
                            ? '無效的帳號或密碼。'
                            : '登錄失敗，請稍後再試。'}
                    </div>
                )}
                <div className="mb-4">
                    <label htmlFor="username" className="block text-sm font-medium mb-1">
                        帳號
                    </label>
                    <input
                        name="username"
                        type="text"
                        required
                        className="w-full border px-3 py-2 rounded"
                        placeholder="admin"
                    />
                </div>
                <div className="mb-4">
                    <label htmlFor="password" className="block text-sm font-medium mb-1">
                        密碼
                    </label>
                    <input
                        name="password"
                        type="password"
                        required
                        className="w-full border px-3 py-2 rounded"
                        placeholder="您的密碼"
                    />
                </div>
                <button
                    type="submit"
                    className="w-full bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
                >
                    登錄
                </button>
            </form>
        </div>
    );
};

export default SignIn;
