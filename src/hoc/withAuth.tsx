// hoc/withAuth.tsx

import { useSession, signIn } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

const withAuth = (WrappedComponent: React.ComponentType) => {
    const AuthenticatedComponent: React.FC = (props) => {
        const { data: session, status } = useSession();
        const router = useRouter();

        useEffect(() => {
            if (status === 'loading') return; // 等待 session 加載
            if (!session) signIn('credentials', { callbackUrl: '/auth/signin' }); // 未登錄則重定向到登錄頁面
        }, [session, status, router]);

        if (status === 'loading' || !session) {
            return <div>Loading...</div>; // 可以顯示一個加載指示器
        }

        return <WrappedComponent {...props} />;
    };

    return AuthenticatedComponent;
};

export default withAuth;
