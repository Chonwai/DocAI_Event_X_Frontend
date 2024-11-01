import { ScanQrCodeIcon } from "lucide-react"
import { useRouter } from "next/navigation"

const ScanButton: React.FC = () => {
    const router = useRouter()
    return (
        <>
            <button
                className="flex items-center justify-center bg-green-500 text-white w-12 h-12 rounded-full hover:bg-green-600 transition"
                onClick={() => {
                    // 在這裡添加掃描二維碼的功能
                    router.push('/admin/checkin')
                }}
            >

                <ScanQrCodeIcon className='w-6 h-6' />
            </button>
        </>
    )
}

export default ScanButton