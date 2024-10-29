// components/AdminNavbar.tsx

import Link from 'next/link';
import { User, CheckCircle2, Settings, LogOut } from 'lucide-react';
import { signOut } from 'next-auth/react';

const AdminNavbar: React.FC = () => {
    return (
        <nav className="bg-gray-800 text-white p-4 flex justify-between">
            <div className="flex items-center space-x-4">
                <Link href="/admin/checkin">
                    <a className="flex items-center hover:text-gray-400 transition">
                        <CheckCircle2 className="w-5 h-5 mr-1" /> Check-In
                    </a>
                </Link>
                <Link href="/admin">
                    <a className="flex items-center hover:text-gray-400 transition">
                        <User className="w-5 h-5 mr-1" /> 管理員
                    </a>
                </Link>
                {/* 添加更多管理員導航鏈接 */}
            </div>
            <div className="flex items-center space-x-4">
                <button
                    onClick={() => signOut()}
                    className="flex items-center hover:text-gray-400 transition"
                >
                    <LogOut className="w-5 h-5 mr-1" /> 登出
                </button>
            </div>
        </nav>
    );
};

export default AdminNavbar;
