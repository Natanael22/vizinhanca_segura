import { divIcon } from 'leaflet';
import { Marker, Popup } from 'react-leaflet';
import { ALERT_TYPES, type Alert } from '../../types/alert';
import { renderToStaticMarkup } from 'react-dom/server';
import { CheckCircle, AlertOctagon, Volume2, Eye, HelpCircle, ChevronRight, Dog } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface AlertMarkerProps {
    alert: Alert;
}

const getIcon = (type: string) => {
    const size = 20;
    const color = "white";
    switch (type) {
        case 'emergency': return <AlertOctagon size={size} color={color} />;
        case 'theft': return <AlertOctagon size={size} color={color} />;
        case 'suspicious': return <Eye size={size} color={color} />;
        case 'noise': return <Volume2 size={size} color={color} />;
        case 'mistreatment': return <Dog size={size} color={color} />;
        default: return <HelpCircle size={size} color={color} />;
    }
}

export function AlertMarker({ alert }: AlertMarkerProps) {
    const navigate = useNavigate();
    // Safely get the type config with fallback to 'other'
    const alertType = (alert.type in ALERT_TYPES ? alert.type : 'other') as keyof typeof ALERT_TYPES;
    const typeConfig = ALERT_TYPES[alertType];

    const iconMarkup = renderToStaticMarkup(
        <div className={`w-8 h-8 rounded-full flex items-center justify-center shadow-lg border-2 border-white ${typeConfig.bg}`}>
            {getIcon(alertType)}
        </div>
    );

    const customIcon = divIcon({
        html: iconMarkup,
        className: 'custom-marker', // Needs global CSS to reset default styles if any
        iconSize: [32, 32],
        iconAnchor: [16, 32],
        popupAnchor: [0, -32],
    });

    return (
        <Marker position={[alert.latitude, alert.longitude]} icon={customIcon}>
            <Popup>
                <div className="p-1 min-w-[200px]">
                    <div className="flex items-center gap-2 mb-2">
                        <span className={`w-2 h-2 rounded-full ${typeConfig.bg}`} />
                        <span className="font-bold text-sm text-primary-900 uppercase">{typeConfig.label}</span>
                    </div>
                    <p className="text-sm text-primary-700 mb-3">{alert.description}</p>

                    <button
                        onClick={() => navigate(`/alert/${alert.id}`)}
                        className="w-full mb-3 flex items-center justify-center gap-2 bg-primary-900 text-white text-xs font-bold py-2 rounded-lg hover:bg-primary-800 transition-colors pointer-events-auto"
                    >
                        Ver Detalhes
                        <ChevronRight size={14} />
                    </button>

                    <div className="flex justify-between items-center text-xs text-primary-400 border-t border-primary-100 pt-2">
                        <span>{alert.author_pseudonym}</span>
                        <span className="flex items-center gap-1 text-accent-600">
                            <CheckCircle size={12} /> {alert.confirmations}
                        </span>
                    </div>
                </div>
            </Popup>
        </Marker>
    );
}
