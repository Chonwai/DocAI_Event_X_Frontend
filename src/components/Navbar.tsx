import Link from 'next/link';
import { Home, User, Settings } from 'lucide-react';

export default function Navbar() {
    return (
        <nav className="bg-gray-800 text-white p-4 flex justify-between">
            <div className="flex items-center space-x-4">
                <Link legacyBehavior href="/">
                    <a className="flex items-center hover:text-gray-400 transition">
                        <Home className="w-5 h-5 mr-1" /> 首頁
                    </a>
                </Link>
                <Link legacyBehavior href="/admin">
                    <a className="flex items-center hover:text-gray-400 transition">
                        <User className="w-5 h-5 mr-1" /> 管理員
                    </a>
                </Link>
            </div>
            <div className="flex items-center space-x-4">
                <Link legacyBehavior href="/settings">
                    <a className="flex items-center hover:text-gray-400 transition">
                        <Settings className="w-5 h-5 mr-1" /> 設定
                    </a>
                </Link>
            </div>
        </nav>
    );
}
