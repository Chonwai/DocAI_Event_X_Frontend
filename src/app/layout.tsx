'use client';

import localFont from 'next/font/local';
import './globals.css';
import Navbar from '../components/Navbar';
import { SessionProvider } from 'next-auth/react';
import UserNavbar from '@/components/UserNavbar';

const geistSans = localFont({
    src: './fonts/GeistVF.woff',
    variable: '--font-geist-sans',
    weight: '100 900'
});
const geistMono = localFont({
    src: './fonts/GeistMonoVF.woff',
    variable: '--font-geist-mono',
    weight: '100 900'
});

export default function RootLayout({
    children,
    session
}: Readonly<{
    children: React.ReactNode;
    session: any;
}>) {
    return (
        <html lang="en">
            <body className={`${geistSans.variable} ${geistMono.variable} antialiased bg-gray-100`}>
                <SessionProvider session={session}>
                    <UserNavbar />
                    {children}
                </SessionProvider>
            </body>
        </html>
    );
}
