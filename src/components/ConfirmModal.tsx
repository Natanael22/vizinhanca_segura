import { useEffect } from 'react';

interface ConfirmModalProps {
    isOpen: boolean;
    title: string;
    description: string;
    confirmText?: string;
    cancelText?: string;
    confirmVariant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger';
    onConfirm: () => void;
    onCancel: () => void;
}

export function ConfirmModal({
    isOpen,
    title,
    description,
    confirmText = 'Confirmar',
    cancelText = 'Cancelar',
    confirmVariant = 'danger',
    onConfirm,
    onCancel
}: ConfirmModalProps) {

    // Prevent scrolling when modal is open
    useEffect(() => {
        if (isOpen) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = 'unset';
        }
        return () => {
            document.body.style.overflow = 'unset';
        };
    }, [isOpen]);

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 animate-in fade-in duration-200">
            {/* Backdrop */}
            <div
                className="absolute inset-0 bg-black/40 backdrop-blur-sm"
                onClick={onCancel}
            />

            {/* Modal Card */}
            <div className="bg-white w-full max-w-sm rounded-2xl shadow-xl z-10 overflow-hidden transform transition-all animate-in zoom-in-95 duration-200">
                <div className="p-6 text-center">
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">
                        {title}
                    </h3>
                    <p className="text-sm text-gray-500 leading-relaxed">
                        {description}
                    </p>
                </div>

                {/* Actions mimicking iOS style (stacked or side-by-side depending on preference, here stacked for mobile feel) */}
                <div className="flex flex-col border-t border-gray-100">
                    <button
                        onClick={onConfirm}
                        className={`w-full py-3.5 text-sm font-semibold transition-colors
                            ${confirmVariant === 'danger' ? 'text-red-600 hover:bg-red-50' : 'text-primary-600 hover:bg-primary-50'}
                        `}
                    >
                        {confirmText}
                    </button>
                    <div className="h-[1px] bg-gray-100 w-full" />
                    <button
                        onClick={onCancel}
                        className="w-full py-3.5 text-sm font-regular text-gray-600 hover:bg-gray-50 transition-colors"
                    >
                        {cancelText}
                    </button>
                </div>
            </div>
        </div>
    );
}
