import { createContext, useContext, useState, useCallback, type ReactNode } from "react";

type ToastType = "success" | "error" | "info" | "warning";

interface Toast {
    id: number;
    message: string;
    type: ToastType;
}

interface ToastContextType {
    addToast: (message: string, type?: ToastType) => void;
}

const ToastContext = createContext<ToastContextType>({ addToast: () => { } });

export const useToast = () => useContext(ToastContext);

let toastId = 0;

export const ToastProvider = ({ children }: { children: ReactNode }) => {
    const [toasts, setToasts] = useState<Toast[]>([]);

    const addToast = useCallback((message: string, type: ToastType = "success") => {
        const id = ++toastId;
        setToasts(prev => [...prev, { id, message, type }]);
        setTimeout(() => {
            setToasts(prev => prev.filter(t => t.id !== id));
        }, 3500);
    }, []);

    const removeToast = (id: number) => {
        setToasts(prev => prev.filter(t => t.id !== id));
    };

    const icons: Record<ToastType, string> = {
        success: "✓",
        error: "✕",
        warning: "⚠",
        info: "ℹ",
    };

    const colors: Record<ToastType, string> = {
        success: "bg-emerald-500",
        error: "bg-red-500",
        warning: "bg-amber-500",
        info: "bg-indigo-500",
    };

    const bgColors: Record<ToastType, string> = {
        success: "bg-emerald-500/10 border-emerald-500/30",
        error: "bg-red-500/10 border-red-500/30",
        warning: "bg-amber-500/10 border-amber-500/30",
        info: "bg-indigo-500/10 border-indigo-500/30",
    };

    const textColors: Record<ToastType, string> = {
        success: "text-emerald-300",
        error: "text-red-300",
        warning: "text-amber-300",
        info: "text-indigo-300",
    };

    return (
        <ToastContext.Provider value={{ addToast }}>
            {children}
            {/* Toast Container */}
            <div className="fixed bottom-6 right-6 z-[9999] flex flex-col gap-3 pointer-events-none">
                {toasts.map((toast) => (
                    <div
                        key={toast.id}
                        className={`pointer-events-auto flex items-center gap-3 px-4 py-3 rounded-xl border backdrop-blur-md shadow-2xl animate-in slide-in-from-right fade-in duration-300 min-w-[280px] max-w-[400px] ${bgColors[toast.type]}`}
                    >
                        <div className={`w-6 h-6 rounded-full ${colors[toast.type]} flex items-center justify-center flex-shrink-0`}>
                            <span className="text-white text-xs font-bold">{icons[toast.type]}</span>
                        </div>
                        <p className={`text-sm font-medium flex-1 ${textColors[toast.type]}`}>
                            {toast.message}
                        </p>
                        <button
                            onClick={() => removeToast(toast.id)}
                            className="text-gray-500 hover:text-gray-300 transition-colors cursor-pointer text-xs flex-shrink-0"
                        >
                            ✕
                        </button>
                    </div>
                ))}
            </div>
        </ToastContext.Provider>
    );
};
