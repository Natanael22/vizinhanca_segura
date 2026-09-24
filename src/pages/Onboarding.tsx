import { useState } from 'react';
import { Button } from '../components/Button';
import { Input } from '../components/Input';
import { MapPin, CheckCircle, Shield, Search, Loader2, Navigation, MessageSquare } from 'lucide-react';
import { fetchAddressByCEP } from '../services/cep';
import { fetchAddressByCoords } from '../services/geocoding';
import { useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { sendOTP, verifyOTP } from '../services/whatsapp';
import { logError } from '../services/logger';
import { useNotification } from '../context/NotificationContext';
import { translateError } from '../utils/errors';

type LocationState = {
    neighborhood: string;
    city: string;
    state: string;
}

export default function Onboarding() {
    const navigate = useNavigate();
    const routeLocation = useLocation();
    const { signUp } = useAuth();
    const { showNotification } = useNotification();

    // Get registration data from Register page
    const registrationData = routeLocation.state?.registrationData;

    const [step, setStep] = useState(1);
    const [loading, setLoading] = useState(false);
    const [isLocating, setIsLocating] = useState(false);
    const [isFinishing, setIsFinishing] = useState(false);

    const [cep, setCep] = useState('');
    const [location, setLocation] = useState<LocationState | null>(null);
    const [error, setError] = useState('');
    const [acceptedTerms, setAcceptedTerms] = useState(false);

    // WhatsApp OTP State
    const [userCode, setUserCode] = useState('');
    const [isSendingCode, setIsSendingCode] = useState(false);
    const [isVerifyingCode, setIsVerifyingCode] = useState(false);

    const handleLocateMe = () => {
        setIsLocating(true);
        setError('');

        if (!navigator.geolocation) {
            setError('Geolocalização não suportada');
            setIsLocating(false);
            return;
        }

        navigator.geolocation.getCurrentPosition(
            async (position) => {
                try {
                    const { latitude, longitude } = position.coords;
                    const address = await fetchAddressByCoords(latitude, longitude);
                    setLocation({
                        neighborhood: address.neighborhood,
                        city: address.city,
                        state: address.state
                    });
                    setError('');
                } catch (err) {
                    setError('Não foi possível identificar o bairro automaticamente. Tente pelo CEP.');
                } finally {
                    setIsLocating(false);
                }
            },
            (err) => {
                let errorType = 'User denied Geolocation';
                if (err.code === err.TIMEOUT) errorType = 'Position acquisition timed out';

                const { title, message } = translateError(errorType);
                showNotification({ title, message, type: 'error' });

                setError(message);
                setIsLocating(false);
            }
        );
    };

    const handleSendCode = async () => {
        if (!registrationData?.phone) return;

        setIsSendingCode(true);
        setError('');

        try {
            await sendOTP(registrationData.phone);
        } catch (err: any) {
            setError(err.message || 'Erro ao enviar código. Verifique se o número está correto.');
        } finally {
            setIsSendingCode(false);
        }
    };

    const handleVerifyCode = async () => {
        if (!registrationData?.phone) return;
        
        setIsVerifyingCode(true);
        setError('');
        
        try {
            await verifyOTP(registrationData.phone, userCode);
            setStep(3);
        } catch (err: any) {
            setError(err.message || 'Código incorreto ou expirado. Tente novamente.');
        } finally {
            setIsVerifyingCode(false);
        }
    };

    const handleCepSearch = async () => {
        if (cep.length < 8) return;
        setLoading(true);
        setError('');
        try {
            const address = await fetchAddressByCEP(cep);
            setLocation({
                neighborhood: address.neighborhood,
                city: address.city,
                state: address.state
            });
        } catch (err: any) {
            setError('CEP não encontrado.');
            setLocation(null);
            logError({
                message: err.message,
                context: 'Onboarding.handleCepSearch',
                metadata: { cep }
            });
        } finally {
            setLoading(false);
        }
    };

    const handleFinish = async () => {
        if (!location) {
            setError('Por favor, identifique seu bairro primeiro.');
            return;
        }

        if (!registrationData) {
            setError('Dados de cadastro não encontrados. Por favor, recomece.');
            return;
        }

        setIsFinishing(true);
        setError('');
        try {
            await signUp(
                registrationData.email,
                registrationData.password,
                registrationData.pseudonym,
                registrationData.phone,
                location.neighborhood,
                location.city,
                location.state
            );

            navigate('/home');
        } catch (err: any) {
            //console.error('Registration error:', err);

            const { title, message } = translateError(err.message);
            showNotification({
                title,
                message,
                type: 'error',
                onClose: () => {
                    if (err.message.includes('User already registered')) {
                        navigate('/login');
                    }
                }
            });

            setError(message);
            logError({
                message: err.message,
                stack: err.stack,
                context: 'Onboarding.handleFinish'
            });
        } finally {
            setIsFinishing(false);
        }
    };

    return (
        <div className="p-6 flex flex-col h-full bg-white animate-in slide-in-from-right duration-500">
            {step === 1 && (
                <>
                    <header className="mb-6">
                        <div className="w-14 h-14 bg-accent-100 rounded-full flex items-center justify-center mb-4 text-accent-600 shadow-sm">
                            <MapPin size={28} />
                        </div>
                        <h1 className="text-2xl font-bold text-primary-900">Onde você mora?</h1>
                        <p className="text-primary-500 mt-2">Isso ajuda a conectar você com vizinhos próximos e alertas relevantes.</p>
                    </header>

                    <div className="flex-1 overflow-y-auto space-y-6">

                        {/* Auto Location Option */}
                        <div className="bg-accent-50 border border-accent-100 rounded-xl p-5 text-center">
                            <p className="text-accent-800 font-medium mb-4">Para melhor experiência, use sua localização atual</p>
                            <Button
                                onClick={handleLocateMe}
                                className="w-full flex items-center justify-center gap-2"
                                disabled={isLocating}
                            >
                                {isLocating ? <Loader2 className="animate-spin" /> : <Navigation size={18} />}
                                {isLocating ? 'Localizando...' : 'Usar Localização Atual'}
                            </Button>
                        </div>

                        <div className="relative flex items-center py-2">
                            <div className="flex-grow border-t border-primary-200"></div>
                            <span className="flex-shrink-0 mx-4 text-primary-400 text-sm">Caso esteja incorreto, informe o CEP</span>
                            <div className="flex-grow border-t border-primary-200"></div>
                        </div>

                        {/* CEP Input */}
                        <div className="space-y-4">
                            <div className="flex gap-2 items-end">
                                <div className="flex-1">
                                    <Input
                                        label="CEP"
                                        placeholder="00000-000"
                                        value={cep}
                                        onChange={(e) => {
                                            const val = e.target.value.replace(/\D/g, '').slice(0, 8);
                                            setCep(val);
                                        }}
                                        type="tel"
                                    />
                                </div>
                                <Button
                                    variant="secondary"
                                    onClick={handleCepSearch}
                                    disabled={cep.length < 8 || loading}
                                    className="h-[50px] mb-[1px]" // Align with input
                                >
                                    {loading ? <Loader2 className="animate-spin" /> : <Search size={20} />}
                                </Button>
                            </div>

                            {error && (
                                <p className="text-red-500 text-sm bg-red-50 p-3 rounded-lg border border-red-100">{error}</p>
                            )}
                        </div>

                        {/* Location Result Card */}
                        {location && (
                            <div className="bg-green-50 border border-green-200 rounded-xl p-4 animate-in fade-in zoom-in duration-300">
                                <div className="flex items-start gap-3">
                                    <div className="bg-green-100 p-2 rounded-full text-green-600 mt-1">
                                        <CheckCircle size={20} />
                                    </div>
                                    <div>
                                        <h3 className="font-bold text-green-900">Localização Encontrada</h3>
                                        <p className="text-green-700 font-medium text-lg mt-1">{location.neighborhood}</p>
                                        <p className="text-green-600 text-sm">{location.city}, {location.state}</p>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>

                    <div className="pt-6">
                        <Button
                            className="w-full text-lg h-14"
                            disabled={!location}
                            onClick={() => {
                                handleSendCode();
                                setStep(2);
                            }}
                        >
                            Continuar
                        </Button>
                    </div>
                </>
            )}

            {step === 2 && (
                <div className="animate-in slide-in-from-right duration-500 flex flex-col h-full">
                    <header className="mb-6">
                        <div className="w-14 h-14 bg-green-100 rounded-full flex items-center justify-center mb-4 text-green-600 shadow-sm">
                            <MessageSquare size={28} />
                        </div>
                        <h1 className="text-2xl font-bold text-primary-900">Verifique seu WhatsApp</h1>
                        <p className="text-primary-500 mt-2">
                            Enviamos um código para o número <strong>{registrationData?.phone}</strong>
                        </p>
                    </header>

                    <div className="flex-1 space-y-6">
                        <div className="space-y-4">
                            <Input
                                label="Código de 6 dígitos"
                                placeholder="000000"
                                value={userCode}
                                onChange={(e) => {
                                    const val = e.target.value.replace(/\D/g, '').slice(0, 6);
                                    setUserCode(val);
                                }}
                                type="tel"
                                className="text-center text-2xl tracking-[0.5em] font-bold"
                            />

                            {error && (
                                <p className="text-red-500 text-sm bg-red-50 p-3 rounded-lg border border-red-100">{error}</p>
                            )}
                        </div>

                        <div className="text-center">
                            <button
                                onClick={handleSendCode}
                                disabled={isSendingCode}
                                className="text-accent-600 font-medium hover:underline text-sm disabled:opacity-50"
                            >
                                {isSendingCode ? 'Reenviando...' : 'Não recebeu o código? Reenviar'}
                            </button>
                        </div>
                    </div>

                    <div className="pt-6 space-y-3">
                        <Button
                            className="w-full text-lg h-14"
                            disabled={userCode.length < 6 || isVerifyingCode}
                            onClick={handleVerifyCode}
                        >
                            {isVerifyingCode ? <Loader2 className="animate-spin" /> : 'Verificar Código'}
                        </Button>
                        <Button
                            variant="ghost"
                            className="w-full"
                            onClick={() => setStep(1)}
                        >
                            Voltar
                        </Button>
                    </div>
                </div>
            )}

            {step === 3 && (
                <div className="animate-in slide-in-from-right duration-500 flex flex-col h-full">
                    <header className="mb-6">
                        <div className="w-14 h-14 bg-primary-100 rounded-full flex items-center justify-center mb-4 text-primary-600 shadow-sm">
                            <Shield size={28} />
                        </div>
                        <h1 className="text-2xl font-bold text-primary-900">Código de Conduta</h1>
                        <p className="text-primary-500 mt-2">Para manter a comunidade segura e confiável, precisamos que todos colaborem.</p>
                    </header>

                    <div className="flex-1 space-y-4 overflow-y-auto pr-2">
                        <div className="bg-primary-50 p-5 rounded-xl space-y-4 text-sm text-primary-700 border border-primary-100">
                            <p><strong className="text-primary-900 block mb-1">1. Seja Honesto</strong> Apenas reporte ocorrências reais. Informações falsas prejudicam a credibilidade do grupo.</p>
                            <div className="h-px bg-primary-200" />
                            <p><strong className="text-primary-900 block mb-1">2. Respeito Mútuo</strong> Não use linguagem ofensiva. Estamos aqui para nos ajudar.</p>
                            <div className="h-px bg-primary-200" />
                            <p><strong className="text-primary-900 block mb-1">3. Dados Pessoais</strong> Não exponha dados de terceiros sem permissão.</p>
                            <div className="h-px bg-primary-200" />
                            <p><strong className="text-primary-900 block mb-1">4. Emergências</strong> Este app não substitui a polícia. Em risco imediato, ligue 190.</p>
                        </div>

                        <label className="flex items-start gap-4 p-3 cursor-pointer group hover:bg-primary-50 rounded-lg transition-colors">
                            <div className="relative flex items-center mt-1">
                                <input
                                    type="checkbox"
                                    className="peer h-6 w-6 cursor-pointer appearance-none rounded-md border-2 border-primary-300 bg-white checked:border-accent-500 checked:bg-accent-500 transition-all"
                                    checked={acceptedTerms}
                                    onChange={(e) => setAcceptedTerms(e.target.checked)}
                                />
                                <CheckCircle size={16} className="pointer-events-none absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 text-white opacity-0 peer-checked:opacity-100" />
                            </div>
                            <span className="text-sm text-primary-600 select-none group-hover:text-primary-800">
                                Li e concordo com o Código de Conduta e aceito participar responsavelmente da comunidade.
                            </span>
                        </label>
                    </div>
                    <div className="pt-6 space-y-3">
                        <Button
                            className="w-full text-lg h-14 flex items-center justify-center gap-2"
                            disabled={!acceptedTerms || isFinishing}
                            onClick={handleFinish}
                        >

                            {isFinishing && <Loader2 className="animate-spin" size={20} />}
                            {isFinishing ? 'Criando conta...' : 'Concordar e Entrar'}
                        </Button>
                        <Button
                            variant="ghost"
                            className="w-full"
                            onClick={() => setStep(2)}
                        >
                            Voltar
                        </Button>
                    </div>
                </div>
            )}
        </div>
    );
}
