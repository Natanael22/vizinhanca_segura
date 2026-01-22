import { Plus } from 'lucide-react';
import { Link } from 'react-router-dom';

export function CreateAlertFAB() {
    return (
        <Link
            to="/create-alert"
            className="absolute bottom-24 right-6 w-14 h-14 bg-red-600 rounded-full flex items-center justify-center shadow-lg hover:bg-red-700 active:scale-95 transition-all z-[1000] text-white"
        >
            <Plus size={32} />
        </Link>
    );
}
