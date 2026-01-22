import { Link } from 'react-router-dom';
import { MessageSquare, ThumbsUp, MapPin } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { ALERT_TYPES, type Alert } from '../../types/alert';
import { calculateDistance, formatDistance } from '../../utils/geo';
import { useUserLocation } from '../../hooks/useUserLocation';

interface AlertCardProps {
    alert: Alert;
}

export function AlertCard({ alert }: AlertCardProps) {
    const userLocation = useUserLocation();
    const typeConfig = ALERT_TYPES[alert.type as keyof typeof ALERT_TYPES];
    const isResolved = alert.status === 'resolved';

    const distance = userLocation
        ? calculateDistance(userLocation[0], userLocation[1], alert.latitude, alert.longitude)
        : null;

    return (
        <Link
            to={`/alert/${alert.id}`}
            className={`block bg-white p-4 rounded-xl border transition-all active:scale-[0.99] shadow-sm ${isResolved ? 'border-primary-100 opacity-75' : 'border-primary-200 hover:border-accent-300'
                }`}
        >
            <div className="flex justify-between items-start mb-2">
                <div className="flex items-center gap-2">
                    <div className={`w-2 h-2 rounded-full ${typeConfig.bg}`} />
                    <span className="font-bold text-sm text-primary-900 uppercase">
                        {typeConfig.label}
                    </span>
                    {isResolved && (
                        <span className="bg-primary-100 text-primary-600 text-xs px-2 py-0.5 rounded-full font-medium">Resolvido</span>
                    )}
                </div>
                <span className="text-xs text-primary-400">
                    {formatDistanceToNow(new Date(alert.created_at), { addSuffix: true, locale: ptBR })}
                </span>
            </div>

            <p className="text-primary-800 font-medium mb-3 line-clamp-2">
                {alert.description}
            </p>

            <div className="flex items-center justify-between text-xs text-primary-500 pt-3 border-t border-primary-50">
                <div className="flex items-center gap-1">
                    <MapPin size={14} />
                    <span>{distance !== null ? `A ${formatDistance(distance)}` : (alert.neighborhood || 'Próximo')}</span>
                </div>

                <div className="flex items-center gap-4">
                    <div className="flex items-center gap-1">
                        <ThumbsUp size={14} className={alert.confirmations > 0 ? "text-accent-500 fill-accent-100" : ""} />
                        <span>{alert.confirmations} confirms</span>
                    </div>
                    <div className="flex items-center gap-1">
                        <MessageSquare size={14} />
                        <span>{alert.comments?.length || 0}</span>
                    </div>
                </div>
            </div>
        </Link>
    );
}
