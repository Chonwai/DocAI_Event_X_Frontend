// components/UserNavbar.tsx

import Link from 'next/link';
import { Home } from 'lucide-react';

const UserNavbar: React.FC = () => {
    return (
        <nav className="bg-gray-800 text-white p-4 flex justify-between">
            <div className="flex items-center space-x-4">
                <Link legacyBehavior href="/">
                    <a className="flex items-center hover:text-gray-400 transition">
                        <Home className="w-5 h-5 mr-1" /> 首頁
                    </a>
                </Link>
                {/* 添加更多普通用戶導航鏈接 */}
            </div>
            {/* <div className="flex items-center space-x-4">
                <Link legacyBehavior href="/auth/signin">
                    <a className="flex items-center hover:text-gray-400 transition">登錄</a>
                </Link>
            </div> */}
        </nav>
    );
};

export default UserNavbar;
