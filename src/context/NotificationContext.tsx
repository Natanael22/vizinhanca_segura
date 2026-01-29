import { createContext, useContext, useState, useCallback, type ReactNode } from 'react';
import { AlertCircle, CheckCircle, Info } from 'lucide-react';

interface NotificationOptions {
    title: string;
    message: string;
    type?: 'error' | 'success' | 'info' | 'warning';
    onClose?: () => void;
}

interface NotificationContextType {
    showNotification: (options: NotificationOptions) => void;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

export function NotificationProvider({ children }: { children: ReactNode }) {
    const [isOpen, setIsOpen] = useState(false);
    const [options, setOptions] = useState<NotificationOptions | null>(null);

    const showNotification = useCallback((newOptions: NotificationOptions) => {
        setOptions(newOptions);
        setIsOpen(true);
    }, []);

    const handleClose = () => {
        setIsOpen(false);
        if (options?.onClose) {
            options.onClose();
        }
    };

    return (
        <NotificationContext.Provider value={{ showNotification }}>
            {children}
            {isOpen && options && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 animate-in fade-in duration-200">
                    <div
                        className="absolute inset-0 bg-black/40 backdrop-blur-sm"
                        onClick={handleClose}
                    />
                    <div className="bg-white w-full max-w-sm rounded-[2rem] shadow-2xl z-10 overflow-hidden transform transition-all animate-in zoom-in-95 duration-200">
                        <div className="p-8 text-center">
                            <div className={`mx-auto w-16 h-16 rounded-full flex items-center justify-center mb-6 
                                ${options.type === 'error' ? 'bg-red-50 text-red-500' :
                                    options.type === 'success' ? 'bg-green-50 text-green-500' :
                                        'bg-primary-50 text-primary-500'}`}
                            >
                                {options.type === 'error' && <AlertCircle size={32} />}
                                {options.type === 'success' && <CheckCircle size={32} />}
                                {(options.type === 'info' || options.type === 'warning' || !options.type) && <Info size={32} />}
                            </div>
                            <h3 className="text-xl font-bold text-primary-900 mb-3">
                                {options.title}
                            </h3>
                            <p className="text-primary-600 leading-relaxed text-sm">
                                {options.message}
                            </p>
                        </div>
                        <div className="p-2 border-t border-primary-50">
                            <button
                                onClick={handleClose}
                                className="w-full py-4 text-primary-700 font-bold hover:bg-primary-50 rounded-2xl transition-colors"
                            >
                                Entendido
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </NotificationContext.Provider>
    );
}

export function useNotification() {
    const context = useContext(NotificationContext);
    if (!context) {
        throw new Error('useNotification must be used within a NotificationProvider');
    }
    return context;
}
