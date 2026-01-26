import { useEffect } from 'react';
import CommunityMap from '../components/Map/CommunityMap';
import { CreateAlertFAB } from '../components/CreateAlertFAB';
import { BottomNav } from '../components/Navigation/BottomNav';
import { MapPin, Navigation } from 'lucide-react';
import { useLocation } from '../context/LocationContext';

export default function Home() {
    const { profileLocation, gpsLocation, gpsLoading } = useLocation();

    // Travar a rolagem global apenas nesta tela (Mapa)
    useEffect(() => {
        document.body.style.overflow = 'hidden';
        document.body.style.position = 'fixed';
        document.body.style.width = '100%';
        document.body.style.height = '100%';

        return () => {
            document.body.style.overflow = '';
            document.body.style.position = '';
            document.body.style.width = '';
            document.body.style.height = '';
        };
    }, []);

    const isUsingGps = !!gpsLocation;
    const locationDisplay = gpsLocation
        ? `${gpsLocation.neighborhood}, ${gpsLocation.city}`
        : profileLocation
            ? `${profileLocation.neighborhood || 'Bairro unknown'}, ${profileLocation.city || 'Cidade'}`
            : gpsLoading ? 'Buscando GPS...' : 'Buscando localização...';



    return (
        <div className="w-full h-full relative">
            <CommunityMap />
            <CreateAlertFAB />

            {/* Overlay Header - Optional */}
            <div className="absolute top-4 left-4 right-4 z-[400] pointer-events-none">
                <div className="bg-white/90 backdrop-blur-md p-3 rounded-xl shadow-lg border border-white/50 pointer-events-auto flex justify-between items-center">
                    <div className="flex flex-col">
                        <h1 className="font-bold text-primary-900 text-sm">Vizinhança Segura</h1>
                        <div className="flex items-center gap-1 text-primary-500">
                            {isUsingGps ? (
                                <Navigation size={10} className="text-accent-600 fill-accent-100" />
                            ) : (
                                <MapPin size={10} className="text-accent-500" />
                            )}
                            <p className="text-[10px] leading-tight font-medium">
                                {isUsingGps && <span className="text-accent-600 font-bold mr-1">GPS:</span>}
                                {locationDisplay}
                            </p>
                        </div>
                    </div>
                    <div className="w-8 h-8 bg-primary-200 rounded-full" />
                </div>
            </div>

            <BottomNav />
        </div>
    );
}
