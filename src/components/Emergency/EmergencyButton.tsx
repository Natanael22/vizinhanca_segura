import { Phone } from 'lucide-react';
import { type ReactNode } from 'react';

interface EmergencyButtonProps {
    number: string;
    label: string;
    sublabel?: string;
    color: string;
    icon?: ReactNode;
}

export function EmergencyButton({ number, label, sublabel, color, icon }: EmergencyButtonProps) {
    return (
        <a
            href={`tel:${number}`}
            className={`w-full p-6 rounded-2xl flex items-center justify-between shadow-lg transition-transform active:scale-95 border-l-8 ${color} bg-white`}
        >
            <div className="flex flex-col">
                <span className="text-3xl font-black text-primary-900">{number}</span>
                <span className="text-lg font-bold text-primary-800">{label}</span>
                {sublabel && <span className="text-sm text-primary-500">{sublabel}</span>}
            </div>
            <div className={`w-14 h-14 rounded-full flex items-center justify-center text-white shadow-md ${color.replace('border-', 'bg-')}`}>
                {icon || <Phone size={28} />}
            </div>
        </a>
    );
}
