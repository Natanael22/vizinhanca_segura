import { useState } from 'react';
import { useAlerts } from '../context/AlertContext';
import { AlertCard } from '../components/Feed/AlertCard';
import { BottomNav } from '../components/Navigation/BottomNav';
import { useCurrentNeighborhood } from '../hooks/useCurrentNeighborhood';
import { MapPin, Navigation, User } from 'lucide-react';
import { clsx } from 'clsx';
import { useAuth } from '../context/AuthContext';

export default function Feed() {
    const { user } = useAuth();
    const { alerts } = useAlerts();
    const { profileNeighborhood, gpsNeighborhood, loading: locationLoading } = useCurrentNeighborhood();
    const [filter, setFilter] = useState<'meus' | 'neighborhood' | 'gps'>('neighborhood');

    // Filter Logic
    const filteredAlerts = alerts.filter(alert => {
        const isStatusActive = alert.status === 'active';
        if (filter === 'meus') return alert.user_id === user?.id; // Allow seeing my own resolved alerts
        if (filter === 'neighborhood') return alert.neighborhood === profileNeighborhood && isStatusActive;
        if (filter === 'gps') return alert.neighborhood === gpsNeighborhood && isStatusActive;
        return isStatusActive;
    });

    // Sort by date desc
    const sortedAlerts = [...filteredAlerts].sort((a, b) =>
        new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
    );

    const FilterButton = ({ active, onClick, icon: Icon, label, sublabel }: any) => (
        <button
            onClick={onClick}
            className={clsx(
                "flex-shrink-0 flex items-center gap-2 px-4 py-2 rounded-full border transition-all text-sm font-medium",
                active
                    ? "bg-accent-500 border-accent-500 text-white shadow-md shadow-accent-100"
                    : "bg-white border-primary-100 text-primary-600 hover:border-primary-200"
            )}
        >
            <Icon size={16} className={active ? "text-white" : "text-accent-500"} />
            <div className="flex flex-col items-start leading-tight">
                <span>{label}</span>
                {sublabel && <span className={clsx("text-[10px]", active ? "text-white/80" : "text-primary-400")}>{sublabel}</span>}
            </div>
        </button>
    );

    return (
        <div className="flex flex-col h-full bg-primary-50 relative">
            <header className="bg-white border-b border-primary-200 sticky top-0 z-20 shadow-sm">
                <div className="p-4 flex justify-between items-center">
                    <div>
                        <h1 className="text-xl font-bold text-primary-900">Feed de Alertas</h1>
                        <p className="text-xs text-primary-500">Acontecimentos próximos a você</p>
                    </div>
                </div>

                {/* Horizontal Filter Bar */}
                <div className="flex gap-2 overflow-x-auto px-4 pb-4 no-scrollbar">
                    <FilterButton
                        active={filter === 'meus'}
                        onClick={() => setFilter('meus')}
                        icon={User}
                        label="Meus"
                    />

                    {profileNeighborhood && (
                        <FilterButton
                            active={filter === 'neighborhood'}
                            onClick={() => setFilter('neighborhood')}
                            icon={MapPin}
                            label="Meu Bairro"
                            sublabel={profileNeighborhood}
                        />
                    )}

                    {!locationLoading && gpsNeighborhood && gpsNeighborhood !== profileNeighborhood && (
                        <FilterButton
                            active={filter === 'gps'}
                            onClick={() => setFilter('gps')}
                            icon={Navigation}
                            label="GPS Atual"
                            sublabel={gpsNeighborhood}
                        />
                    )}

                    {locationLoading && (
                        <div className="flex items-center gap-2 px-4 py-2 rounded-full border border-primary-100 bg-white opacity-50">
                            <div className="w-4 h-4 rounded-full border-2 border-primary-200 border-t-accent-500 animate-spin" />
                            <span className="text-xs text-primary-400">Buscando local...</span>
                        </div>
                    )}
                </div>
            </header>

            <div className="flex-1 overflow-y-auto p-4 space-y-3 pb-32">
                {sortedAlerts.map(alert => (
                    <AlertCard key={alert.id} alert={alert} />
                ))}
                {sortedAlerts.length === 0 && (
                    <div className="bg-white p-8 rounded-2xl border border-primary-100 text-center shadow-sm">
                        <div className="w-16 h-16 bg-primary-50 rounded-full flex items-center justify-center mx-auto mb-4 text-primary-300">
                            <MapPin size={32} />
                        </div>
                        <h3 className="font-bold text-primary-900 mb-1">Nenhum alerta aqui</h3>
                        <p className="text-sm text-primary-500">
                            {filter === 'meus'
                                ? 'Você ainda não registrou nenhuma ocorrência.'
                                : `Não há ocorrências registradas em ${filter === 'neighborhood' ? profileNeighborhood : gpsNeighborhood}.`}
                        </p>
                        {filter !== 'neighborhood' && (
                            <button
                                onClick={() => setFilter('neighborhood')}
                                className="mt-4 text-accent-600 font-bold text-sm hover:underline"
                            >
                                Ver meu bairro
                            </button>
                        )}
                    </div>
                )}
            </div>


            <BottomNav />
        </div>
    );
}
