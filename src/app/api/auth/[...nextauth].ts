// pages/api/auth/[...nextauth].ts
import NextAuth from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';

export default NextAuth({
    providers: [
        CredentialsProvider({
            name: 'Credentials',
            credentials: {
                username: { label: 'Username', type: 'text', placeholder: 'admin' },
                password: { label: 'Password', type: 'password' }
            },
            async authorize(credentials) {
                const adminUsername = process.env.ADMIN_USERNAME;
                const adminPassword = process.env.ADMIN_PASSWORD;

                console.log('Authorize called with:', credentials);

                if (
                    credentials?.username === adminUsername &&
                    credentials?.password === adminPassword
                ) {
                    // 返回用戶對象
                    return { id: 1, name: 'Admin' };
                } else {
                    // 認證失敗
                    console.log('Authentication failed for:', credentials?.username);
                    return null;
                }
            }
        })
    ],
    session: {
        strategy: 'jwt'
    },
    pages: {
        signIn: '/auth/signin',
        error: '/auth/error' // 自定義錯誤頁面
    },
    secret: process.env.NEXTAUTH_SECRET
});
