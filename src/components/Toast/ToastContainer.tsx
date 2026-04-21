import { CheckCircle, XCircle, Info } from "lucide-react";
import { useEffect, useState } from "react";

export interface Toast{
    id: number;
    message: string;
    type: 'success' | 'error' | 'info';
}

interface ToastProps{
    toasts: Toast[];
    removeToast: (id:number) => void;
}

export default function ToastContainer({ toasts,removeToast }:ToastProps){
    return(
        <div className="fixed top-4 right-4 z-50 flex flex-col gap-3">
        {toasts.map((toast) =>(
            <ToastItem key={toast.id} toast={toast} onRemove={removeToast} />
        ))}
        </div>
    );
}

function ToastItem({ toast, onRemove } : { toast: Toast; onRemove:(id:number) => void }){
    const [isExiting, setIsExiting] = useState(false);

    useEffect(() =>{
        const timer = setTimeout(() =>{
            setIsExiting(true);
            setTimeout(() => onRemove(toast.id),300);
        },3000);

        return () => clearTimeout(timer);
    },[toast.id, onRemove]);

    const handleClick = () =>{
        setIsExiting(true);
        setTimeout(() => onRemove(toast.id),300);
    };

    const icons = {
        success: <CheckCircle size={18} />,
        error: <XCircle size={18} />,
        info: <Info size={18} />
    };

    const colors = {
        success: 'bg-green-50 border-green-200 text-green-800',
        error: 'bg-red-50 border-red-200 text-red-800',
        info: 'bg-blue-50 border-blue-200 text-blue-800',
    };

    return (
        <div className={`flex items-center gap-3 px-4 py-3 rounded-lg border shadow-lg transition-all duration-300 cursor-pointer ${colors[toast.type]} ${
                isExiting ? 'opacity-0 translate-x-full' : 'opacity-100 translate-x-0'
            }`}
            onClick={handleClick}
        >
            {icons[toast.type]}
            <span className="text-sm font-medium">{toast.message}</span>
        </div>
    );
}