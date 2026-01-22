import { useEffect } from 'react';
import CommunityMap from '../components/Map/CommunityMap';
import { CreateAlertFAB } from '../components/CreateAlertFAB';
import { BottomNav } from '../components/Navigation/BottomNav';
import { useAuth } from '../context/AuthContext';

export default function Home() {
    const { user } = useAuth();

    useEffect(() => {
        if (user) {

        }
    }, [user]);



    return (
        <div className="w-full h-full relative">
            <CommunityMap />
            <CreateAlertFAB />

            {/* Overlay Header - Optional */}
            <div className="absolute top-4 left-4 right-4 z-[400] pointer-events-none">
                <div className="bg-white/90 backdrop-blur-md p-3 rounded-xl shadow-lg border border-white/50 pointer-events-auto flex justify-between items-center">
                    <div className="flex flex-col">
                        <h1 className="font-bold text-primary-900 text-sm">Vizinhança Segura</h1>
                        <p className="text-xs text-primary-500">Bairro</p>
                    </div>
                    <div className="w-8 h-8 bg-primary-200 rounded-full" />
                </div>
            </div>

            <BottomNav />
        </div>
    );
}
