import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, AlertTriangle, Camera, X } from 'lucide-react';
import { Button } from '../components/Button';
import { useAlerts } from '../context/AlertContext';
import { useAuth } from '../context/AuthContext';
import * as alertService from '../services/alerts';
import { useUserLocation } from '../hooks/useUserLocation';
import { ALERT_TYPES, type AlertType } from '../types/alert';
import { clsx } from 'clsx';
import { supabase } from '../lib/supabase';
import { fetchAddressByCoords } from '../services/geocoding';

export default function CreateAlert() {
    const navigate = useNavigate();
    const { addAlert } = useAlerts();
    const { user } = useAuth();
    const userLocation = useUserLocation();
    const [description, setDescription] = useState('');
    const [selectedType, setSelectedType] = useState<AlertType | null>(null);
    const [loading, setLoading] = useState(false);
    const [uploading, setUploading] = useState(false);
    const [error, setError] = useState('');
    const [photo, setPhoto] = useState<File | null>(null);
    const [photoPreview, setPhotoPreview] = useState<string | null>(null);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        console.log('Submit clicked', { selectedType, userLocation, user });

        if (!selectedType) {
            setError('Por favor, selecione um tipo de alerta');
            return;
        }

        if (!userLocation) {
            setError('Localização não disponível. Permita acesso à localização.');
            return;
        }

        if (!user) {
            setError('Você precisa estar autenticado para criar alertas');
            return;
        }

        setLoading(true);
        setError('');

        try {
            console.log('Fetching user profile...');
            // Get user's pseudonym
            const { data: profile, error: profileError } = await supabase
                .from('profiles')
                .select('pseudonym')
                .eq('id', user.id)
                .single();

            if (profileError) {
                console.error('Profile error:', profileError);
                throw new Error('Erro ao buscar perfil do usuário');
            }

            console.log('Profile:', profile);

            let photoUrl = '';
            if (photo) {
                console.log('Uploading photo...');
                setUploading(true);
                try {
                    photoUrl = await alertService.uploadAlertPhoto(photo);
                } catch (uploadErr) {
                    console.error('Photo upload error:', uploadErr);
                    // We'll continue without the photo if upload fails, or we could stop? 
                    // Let's stop and show error to be safe.
                    setError('Erro ao enviar a foto. Tente novamente ou remova a foto.');
                    setLoading(false);
                    setUploading(false);
                    return;
                }
                setUploading(false);
            }

            console.log('Resolving address...');

            let addressData = { neighborhood: '', city: '', state: '', street: '' };
            try {
                const resolved = await fetchAddressByCoords(userLocation[0], userLocation[1]);
                addressData = {
                    neighborhood: resolved.neighborhood,
                    city: resolved.city,
                    state: resolved.state,
                    street: resolved.street
                };
            } catch (addrErr) {
                console.warn('Could not resolve address, continuing with coordinates only', addrErr);
            }

            console.log('Creating alert with address:', addressData);

            await addAlert({
                type: selectedType,
                latitude: userLocation[0],
                longitude: userLocation[1],
                description,
                author_pseudonym: profile?.pseudonym || 'Anônimo',
                photo_url: photoUrl,
                ...addressData
            });

            console.log('Alert created successfully');
            navigate('/home');
        } catch (err: any) {
            console.error('Error creating alert:', err);
            setError(err.message || 'Erro ao criar alerta. Tente novamente.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="flex flex-col h-full bg-white">
            <header className="p-4 border-b border-primary-100 flex items-center gap-4 bg-white sticky top-0 z-10">
                <button onClick={() => navigate(-1)} className="text-primary-600 p-2 rounded-full hover:bg-primary-50">
                    <ArrowLeft size={24} />
                </button>
                <h1 className="font-bold text-lg text-primary-900">Novo Alerta</h1>
            </header>

            <form onSubmit={handleSubmit} className="flex-1 flex flex-col p-4 overflow-y-auto">
                <div className="space-y-6 flex-1">
                    {/* Location Warning */}
                    <div className="bg-orange-50 p-4 rounded-lg flex gap-3 text-orange-800 text-sm border border-orange-200">
                        <AlertTriangle className="shrink-0" size={20} />
                        <p>Usaremos sua localização atual para o alerta. Certifique-se de estar no local ou próximo.</p>
                    </div>

                    {/* Type Selection */}
                    <div className="space-y-2">
                        <label className="text-sm font-medium text-primary-700">O que está acontecendo?</label>
                        <div className="grid grid-cols-2 gap-3">
                            {(Object.entries(ALERT_TYPES) as [AlertType, typeof ALERT_TYPES['emergency']][]).map(([type, config]) => (
                                <button
                                    key={type}
                                    type="button"
                                    onClick={() => setSelectedType(type)}
                                    className={clsx(
                                        "p-4 rounded-xl border text-left transition-all",
                                        selectedType === type
                                            ? `border-${config.color} ring-1 ring-${config.color} bg-primary-50` // Using style directly might be better due to tailwind dynamic class limits
                                            : "border-primary-200 hover:border-primary-300"
                                    )}
                                    style={selectedType === type ? { borderColor: config.color } : {}}
                                >
                                    <div className={`w-8 h-8 rounded-full ${config.bg} mb-2 flex items-center justify-center text-white text-xs`}>
                                        {/* Icon placeholder or simple dot */}
                                    </div>
                                    <span className="font-semibold text-primary-900 block">{config.label}</span>
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Description */}
                    <div className="space-y-2">
                        <label className="text-sm font-medium text-primary-700">Descrição (Opcional)</label>
                        <textarea
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            placeholder="Descreva brevemente o que você viu..."
                            className="w-full h-32 rounded-lg border border-primary-300 p-3 text-primary-900 resize-none focus:ring-2 focus:ring-accent-500 focus:outline-none"
                            maxLength={280}
                        />
                        <div className="text-right text-xs text-primary-400">
                            {description.length}/280
                        </div>
                    </div>

                    {/* Photo Upload */}
                    <div className="space-y-2">
                        <label className="text-sm font-medium text-primary-700">Adicionar Foto (Opcional)</label>
                        {!photoPreview ? (
                            <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-primary-200 rounded-xl bg-primary-50 cursor-pointer hover:bg-primary-100 transition-colors">
                                <div className="flex flex-col items-center justify-center pt-5 pb-6">
                                    <Camera className="w-8 h-8 text-primary-400 mb-2" />
                                    <p className="text-xs text-primary-500">Toque para tirar foto ou galeria</p>
                                </div>
                                <input
                                    type="file"
                                    className="hidden"
                                    accept="image/*"
                                    onChange={(e) => {
                                        const file = e.target.files?.[0];
                                        if (file) {
                                            setPhoto(file);
                                            setPhotoPreview(URL.createObjectURL(file));
                                        }
                                    }}
                                />
                            </label>
                        ) : (
                            <div className="relative w-full h-48 rounded-xl overflow-hidden border border-primary-200">
                                <img src={photoPreview} alt="Preview" className="w-full h-full object-cover" />
                                <button
                                    type="button"
                                    onClick={() => {
                                        setPhoto(null);
                                        setPhotoPreview(null);
                                    }}
                                    className="absolute top-2 right-2 p-1.5 bg-red-500 text-white rounded-full shadow-md"
                                >
                                    <X size={16} />
                                </button>
                            </div>
                        )}
                    </div>

                    {error && (
                        <p className="text-red-500 text-sm bg-red-50 p-3 rounded-lg border border-red-100">
                            {error}
                        </p>
                    )}
                </div>

                <div className="pt-4 mt-4 border-t border-primary-100 bg-white">
                    <Button type="submit" className="w-full" disabled={!selectedType || !userLocation || loading || uploading}>
                        {loading ? 'Publicando...' : uploading ? 'Enviando foto...' : 'Publicar Alerta'}
                    </Button>
                </div>
            </form>
        </div>
    );
}
