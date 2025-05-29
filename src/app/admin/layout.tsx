import { ModalContextProvider } from '@/context/modal-context';
import { Suspense, type ReactNode } from 'react';

const Layout = ({ children }: { children: ReactNode }) => {
    return (
        <>
            <Suspense>
                <ModalContextProvider>
                    {children}
                </ModalContextProvider>
            </Suspense>
        </>
    );
};

export const metadata = {
    title: 'Admin'
};

export default Layout;
