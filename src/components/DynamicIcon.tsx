import dynamic from 'next/dynamic';

// 動態導入 CheckCircle 圖標
const CheckCircle = dynamic(() => import('lucide-react').then((mod) => mod.CheckCircle), {
    ssr: false
});

export default function DynamicIcon() {
    return <CheckCircle className="w-6 h-6 text-blue-500" />;
}
