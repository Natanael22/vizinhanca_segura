import { MapContainer, TileLayer, useMap, Marker, Popup } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { useAlerts } from '../../context/AlertContext';
import { useUserLocation } from '../../hooks/useUserLocation';
import { AlertMarker } from './AlertMarker';
import { useEffect } from 'react';
import { Locate } from 'lucide-react';
import { calculateDistance } from '../../utils/geo';

// Create a custom icon for the user
const userIcon = L.divIcon({
    className: 'bg-transparent',
    html: `
        <div class="relative w-8 h-8">
            <div class="absolute inset-0 bg-blue-500 rounded-full opacity-20 animate-ping"></div>
            <div class="absolute inset-2 bg-blue-600 rounded-full border-2 border-white shadow-lg"></div>
        </div>
    `,
    iconSize: [32, 32],
    iconAnchor: [16, 16],
    popupAnchor: [0, -16],
});

function MapRecenter({ center }: { center: [number, number] }) {
    const map = useMap();
    useEffect(() => {
        map.setView(center, 15);
    }, [center, map]);
    return null;
}

function RecenterButton({ center }: { center: [number, number] }) {
    const map = useMap();
    return (
        <button
            onClick={() => map.setView(center, 15)}
            className="absolute left-4 bottom-32 z-[400] bg-white p-3 rounded-full shadow-lg border border-primary-100 text-primary-600 hover:bg-primary-50 transition-colors flex items-center justify-center pointer-events-auto"
            title="Minha Localização"
        >
            <Locate size={24} />
        </button>
    );
}

export default function CommunityMap() {
    const { alerts } = useAlerts();
    const userLocation = useUserLocation();
    const defaultCenter: [number, number] = [-23.550520, -46.633308]; // SP

    return (
        <div className="w-full h-full relative z-0">
            <MapContainer
                center={defaultCenter}
                zoom={15}
                className="w-full h-full"
                zoomControl={false}
            >
                <TileLayer
                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                    url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png"
                />

                {/* Alerts Markers */}
                {alerts
                    .filter(a => a.status === 'active')
                    .filter(a => {
                        if (!userLocation) return true; // Se não tem localização, mostra tudo (ou nada? assumindo tudo por enquanto)
                        const dist = calculateDistance(
                            userLocation[0],
                            userLocation[1],
                            a.latitude,
                            a.longitude
                        );
                        return dist <= 1000; // 1km raio
                    })
                    .map(alert => (
                        <AlertMarker key={alert.id} alert={alert} />
                    ))}

                {/* User Location Marker */}
                {userLocation && (
                    <Marker position={userLocation} icon={userIcon}>
                        <Popup className="rounded-lg">
                            <div className="p-1 font-bold text-blue-600">Sua Localização</div>
                        </Popup>
                    </Marker>
                )}

                {/* Controls */}
                {userLocation && <RecenterButton center={userLocation} />}

                {/* User Location Recenter (Initial) */}
                {userLocation && <MapRecenter center={userLocation} />}
            </MapContainer>
        </div>
    );
}
