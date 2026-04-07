import { useState } from 'react';
import { BottomNav } from '../components/Navigation/BottomNav';

export default function Partners() {
    const [isLoading, setIsLoading] = useState(true);

    return (
        <div className="flex flex-col h-full bg-primary-50 relative">
            <header className="bg-white border-b border-primary-200 sticky top-0 z-20 shadow-sm">
                <div className="p-4 flex justify-between items-center">
                    <div>
                        <h1 className="text-xl font-bold text-primary-900">Parceiros</h1>
                        <p className="text-xs text-primary-500">Serviços e benefícios para você</p>
                    </div>
                </div>
            </header>

            <div className="flex-1 relative w-full overflow-hidden" style={{ paddingBottom: 'calc(45px + env(safe-area-inset-bottom))' }}>
                {isLoading && (
                    <div className="absolute inset-0 flex items-center justify-center bg-gray-50 z-10">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
                    </div>
                )}

                <iframe
                    src="https://sistema.kesherapp.com.br/vizinhancasegura"
                    title="Parceiros"
                    className="w-full h-full border-0"
                    onLoad={() => setIsLoading(false)}
                />
            </div>

            <BottomNav />
        </div>
    );
}
