import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, AlertTriangle, Camera, X, Dog } from 'lucide-react';
import { Button } from '../components/Button';
import { useAlerts } from '../context/AlertContext';
import { useAuth } from '../context/AuthContext';
import * as alertService from '../services/alerts';
import { useLocation } from '../context/LocationContext';
import { ALERT_TYPES, type AlertType } from '../types/alert';
import { clsx } from 'clsx';
import { supabase } from '../lib/supabase';
import { logError } from '../services/logger';


export default function CreateAlert() {
    const navigate = useNavigate();
    const { addAlert } = useAlerts();
    const { user } = useAuth();
    const { gpsCoords, gpsLocation } = useLocation();
    const [description, setDescription] = useState('');
    const [selectedType, setSelectedType] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);
    const [uploading, setUploading] = useState(false);
    const [error, setError] = useState('');
    const [photo, setPhoto] = useState<File | null>(null);
    const [photoPreview, setPhotoPreview] = useState<string | null>(null);
    const [policeReport, setPoliceReport] = useState('');
    const [referencePoint, setReferencePoint] = useState('');

    // Location verification states
    const [manualNeighborhood, setManualNeighborhood] = useState('');
    const [manualStreet, setManualStreet] = useState('');

    useEffect(() => {
        if (gpsCoords && gpsLocation && !manualNeighborhood) {
            setManualNeighborhood(gpsLocation.neighborhood);
            setManualStreet(''); // We only have neighborhood/city in context currently
        }
    }, [gpsCoords, gpsLocation]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        //console.log('Submit clicked', { selectedType, userLocation, user });

        if (!selectedType) {
            setError('Por favor, selecione um tipo de alerta');
            logError({
                message: 'Validation: No alert type selected',
                context: 'CreateAlert.handleSubmit.validation',
                metadata: { step: 'type_selection' }
            });
            return;
        }

        if (!gpsCoords) {
            setError('Localização não disponível. Permita acesso à localização.');
            logError({
                message: 'Validation: GPS coordinates missing',
                context: 'CreateAlert.handleSubmit.validation',
                metadata: { step: 'gps_coords' }
            });
            return;
        }

        if (!user) {
            setError('Você precisa estar autenticado para criar alertas');
            logError({
                message: 'Validation: User not authenticated',
                context: 'CreateAlert.handleSubmit.validation',
                metadata: { step: 'auth_check' }
            });
            return;
        }

        setLoading(true);
        setError('');

        try {
            //console.log('Fetching user profile...');
            // Get user's pseudonym
            const { data: profile, error: profileError } = await supabase
                .from('profiles')
                .select('pseudonym')
                .eq('id', user.id)
                .single();

            if (profileError) {
                //console.error('Profile error:', profileError);
                await logError({
                    message: profileError.message,
                    context: 'CreateAlert.handleSubmit.validation',
                    metadata: { step: 'profile_fetch' }
                });
                throw new Error('Erro ao buscar perfil do usuário');
            }

            //console.log('Profile:', profile);

            let photoUrl = '';
            if (photo) {
                //console.log('Uploading photo...');
                setUploading(true);
                try {
                    photoUrl = await alertService.uploadAlertPhoto(photo);
                } catch (uploadErr: any) {
                    //console.error('Photo upload error:', uploadErr);
                    await logError({
                        message: uploadErr.message,
                        context: 'CreateAlert.handleSubmit.photo_upload',
                        metadata: { step: 'photo_upload' }
                    });
                    // We'll continue without the photo if upload fails, or we could stop? 
                    // Let's stop and show error to be safe.
                    setError('Erro ao enviar a foto. Tente novamente ou remova a foto.');
                    setLoading(false);
                    setUploading(false);
                    return;
                }
                setUploading(false);
            }

            // We use the manual values edited by the user
            const addressData = {
                neighborhood: manualNeighborhood || '',
                city: '', // We could also fetch/store city if needed, but neighborhood is the priority
                state: '',
                street: manualStreet || ''
            };

            //console.log('Creating alert with address:', addressData);

            await addAlert({
                type: selectedType === 'maltratos' ? 'other' : (selectedType as AlertType),
                latitude: gpsCoords[0],
                longitude: gpsCoords[1],
                description: selectedType === 'maltratos' ? `[Maus-tratos] ${description}` : description,
                author_pseudonym: profile?.pseudonym || 'Anônimo',
                photo_url: photoUrl,
                police_report: (selectedType === 'emergency' || selectedType === 'theft') ? policeReport : undefined,
                reference_point: (selectedType === 'emergency' || selectedType === 'theft') ? referencePoint : undefined,
                ...addressData
            });

            //console.log('Alert created successfully');

            navigate('/home');
        } catch (err: any) {
            //console.error('Error creating alert:', err);
            setError(err.message || 'Erro ao criar alerta. Tente novamente.');

            // Log error to Supabase
            await logError({
                message: err.message,
                stack: err.stack,
                context: 'CreateAlert',
                metadata: {
                    alertType: selectedType,
                    hasPhoto: !!photo
                }
            });
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
                            {[
                                ...Object.entries(ALERT_TYPES).map(([type, config]) => ({
                                    id: type,
                                    label: config.label,
                                    color: config.color,
                                    bg: config.bg,
                                    icon: null
                                })),
                                {
                                    id: 'maltratos',
                                    label: 'Maus-tratos',
                                    color: '#9333ea',
                                    bg: 'bg-purple-600',
                                    icon: Dog
                                }
                            ].map((option) => (
                                <button
                                    key={option.id}
                                    type="button"
                                    onClick={() => setSelectedType(option.id)}
                                    className={clsx(
                                        "p-4 rounded-xl border text-left transition-all",
                                        selectedType === option.id
                                            ? `bg-primary-50`
                                            : "border-primary-200 hover:border-primary-300"
                                    )}
                                    style={selectedType === option.id ? { borderColor: option.color, borderWidth: '2px' } : {}}
                                >
                                    <div className={`w-8 h-8 rounded-full ${option.bg} mb-2 flex items-center justify-center text-white text-xs`}>
                                        {option.icon ? <option.icon size={16} /> : null}
                                    </div>
                                    <span className="font-semibold text-primary-900 block">{option.label}</span>
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

                    {/* Conditional Fields: Police Report and Reference Point */}
                    {(selectedType === 'emergency' || selectedType === 'theft') && (
                        <div className="space-y-4 animate-in fade-in slide-in-from-top-2 duration-300">
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-primary-700">Ponto de Referência</label>
                                <input
                                    type="text"
                                    value={referencePoint}
                                    onChange={(e) => setReferencePoint(e.target.value)}
                                    placeholder="Ex: Próximo ao mercado da esquina"
                                    className="w-full h-12 rounded-lg border border-primary-300 px-3 text-primary-900 focus:ring-2 focus:ring-accent-500 focus:outline-none"
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-primary-700">Nº do Boletim de Ocorrência (Opcional)</label>
                                <input
                                    type="text"
                                    value={policeReport}
                                    onChange={(e) => setPoliceReport(e.target.value)}
                                    placeholder="Caso já possua o registro"
                                    className="w-full h-12 rounded-lg border border-primary-300 px-3 text-primary-900 focus:ring-2 focus:ring-accent-500 focus:outline-none"
                                />
                            </div>
                        </div>
                    )}

                    {/* Location Verification */}
                    <div className="space-y-4 p-4 bg-primary-50 rounded-xl border border-primary-100">
                        <div className="flex items-center justify-between mb-2">
                            <label className="text-sm font-bold text-primary-900">Confirmar Localização</label>
                        </div>
                        <div className="space-y-3">
                            <div className="space-y-1">
                                <span className="text-[10px] uppercase font-bold text-primary-400 ml-1">Bairro</span>
                                <input
                                    type="text"
                                    value={manualNeighborhood}
                                    onChange={(e) => setManualNeighborhood(e.target.value)}
                                    placeholder="Nome do bairro"
                                    className="w-full h-10 rounded-lg border border-primary-200 px-3 text-sm text-primary-900 focus:ring-2 focus:ring-accent-500 focus:outline-none bg-white"
                                />
                            </div>
                        </div>
                        <p className="text-[10px] text-primary-400 mt-2 italic">
                            * O GPS identificou este local.
                        </p>
                        <p className="text-[10px] text-primary-400 mt-2 italic">
                            * Como nosso GPS tem algumas limitações, você pode ajustar o nome se estiver incorreto.
                        </p>
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
                    <Button type="submit" className="w-full" disabled={!selectedType || !gpsCoords || loading || uploading}>
                        {loading ? 'Publicando...' : uploading ? 'Enviando foto...' : 'Publicar Alerta'}
                    </Button>
                </div>
            </form>
        </div>
    );
}
