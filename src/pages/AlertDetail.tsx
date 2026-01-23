import { useParams, useNavigate } from 'react-router-dom';
import { useAlerts } from '../context/AlertContext';
import { ALERT_TYPES, type AlertType } from '../types/alert';
import { Button } from '../components/Button';
import { MapContainer, TileLayer, Marker } from 'react-leaflet';
import { ArrowLeft, Clock, MapPin, ThumbsUp, Send, PointerIcon, LocateFixed, ShieldUser } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { useState } from 'react';
import { Input } from '../components/Input';

export default function AlertDetail() {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const { alerts, confirmAlert, addComment } = useAlerts();
    const [commentText, setCommentText] = useState('');

    const alert = alerts.find(a => a.id === id);

    if (!alert) {
        return <div className="p-8 text-center">Alerta não encontrado.</div>;
    }

    const typeConfig = ALERT_TYPES[alert.type as AlertType];

    const handleConfirm = () => {
        confirmAlert(alert.id);
    };

    const submitComment = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!commentText.trim()) return;
        try {
            await addComment(alert.id, commentText);
            setCommentText('');
        } catch (err) {
            console.error('Error adding comment:', err);
        }
    };

    return (
        <div className="flex flex-col h-full bg-white relative">
            <header className="absolute top-0 left-0 right-0 p-4 z-10 flex items-center justify-between pointer-events-none">
                <button onClick={() => navigate(-1)} className="bg-white/90 backdrop-blur p-2 rounded-full shadow-sm text-primary-700 hover:bg-white pointer-events-auto">
                    <ArrowLeft size={24} />
                </button>
            </header>

            {/* Mini Map */}
            <div className="h-48 w-full bg-primary-100 relative z-0">
                <MapContainer
                    center={[alert.latitude, alert.longitude]}
                    zoom={16}
                    className="w-full h-full"
                    zoomControl={false}
                    dragging={false}
                    scrollWheelZoom={false}
                >
                    <TileLayer url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png" />
                    <Marker position={[alert.latitude, alert.longitude]} />
                </MapContainer>
            </div>

            <div className="flex-1 -mt-6 rounded-t-3xl bg-white relative z-1 p-6 overflow-y-auto flex flex-col shadow-[0_-4px_10px_-2px_rgba(0,0,0,0.1)] pb-24">

                {/* Photo Exhibit if exists */}
                {alert.photo_url && (
                    <div className="mb-6 rounded-2xl overflow-hidden shadow-sm border border-primary-100">
                        <img
                            src={alert.photo_url}
                            alt="Foto da ocorrência"
                            className="w-full h-auto max-h-[400px] object-cover"
                        />
                    </div>
                )}

                {/* Header Info */}
                <div className="flex items-center gap-3 mb-4">
                    <div className={`w-3 h-3 rounded-full ${typeConfig.bg}`} />
                    <span className="font-bold text-lg text-primary-900 uppercase">{typeConfig.label}</span>
                </div>

                <p className="text-primary-800 text-lg leading-relaxed mb-6 font-medium">
                    {alert.description}
                </p>

                <div className="flex flex-wrap gap-4 text-sm text-primary-500 mb-8 border-b border-primary-100 pb-6">
                    <div className="flex items-center gap-1.5">
                        <Clock size={16} />
                        <span>{formatDistanceToNow(new Date(alert.created_at), { locale: ptBR, addSuffix: true })}</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                        <MapPin size={16} />
                        <span>{alert.street || alert.neighborhood || 'Localização'}</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                        <LocateFixed size={16} />
                        <span>{alert.reference_point || 'Ponto de Referência'}</span>
                    </div>
                    <div className="flex items-center gap-1.5 w-full">
                        <span className="font-medium text-primary-900">Por:</span> {alert.author_pseudonym}
                    </div>
                </div>

                {/* Additional Info:  Police Report */}
                {(alert.police_report) && (
                    <div className="grid grid-cols-1 gap-3 mb-8">
                        {alert.police_report && (
                            <div className="bg-accent-50 p-4 rounded-xl border border-accent-100 flex gap-3 items-start">
                                <ShieldUser size={20} className="text-accent-600 shrink-0 mt-0.5" />
                                <div>
                                    <span className="text-[10px] uppercase font-bold text-accent-400 block mb-0.5">Boletim de Ocorrência</span>
                                    <p className="text-primary-800 text-sm font-mono">{alert.police_report}</p>
                                </div>
                            </div>
                        )}
                    </div>
                )}

                {/* Actions */}
                <div className="mb-8">
                    <Button
                        variant="outline"
                        className="flex gap-2 items-center w-full"
                        onClick={handleConfirm}
                    >
                        <ThumbsUp size={18} /> Confirmar ({alert.confirmations || 0})
                    </Button>
                </div>

                {/* Comments Section */}
                <div className="space-y-4">
                    <h3 className="font-bold text-primary-900">Comentários ({alert.comments?.length || 0})</h3>

                    <div className="space-y-4 mb-4">
                        {alert.comments?.map(comment => (
                            <div key={comment.id} className="bg-primary-50 p-3 rounded-lg">
                                <div className="flex justify-between items-baseline mb-1">
                                    <span className="font-semibold text-xs text-primary-900">{comment.author_pseudonym}</span>
                                    <span className="text-[10px] text-primary-400">
                                        {formatDistanceToNow(new Date(comment.created_at), { locale: ptBR })}
                                    </span>
                                </div>
                                <p className="text-sm text-primary-700">{comment.text}</p>
                            </div>
                        ))}
                    </div>

                    <form onSubmit={submitComment} className="flex gap-2 items-end">
                        <div className="flex-1">
                            <Input
                                label=""
                                placeholder="Adicione informações..."
                                value={commentText}
                                onChange={(e) => setCommentText(e.target.value)}
                                className="h-10 text-sm"
                            />
                        </div>
                        <Button type="submit" size="sm" className="h-10 w-12 p-0 flex items-center justify-center">
                            <Send size={18} />
                        </Button>
                    </form>
                </div>
            </div>
        </div>
    );
}
