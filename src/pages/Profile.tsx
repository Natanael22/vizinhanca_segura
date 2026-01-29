import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

import { BottomNav } from '../components/Navigation/BottomNav';
import { User, Shield, CheckCircle, AlertTriangle, Settings, MapPin, HeartPlus } from 'lucide-react';
import { Button } from '../components/Button';
import { useAlerts } from '../context/AlertContext';

export default function Profile() {
    const navigate = useNavigate();
    const { profile, signOut } = useAuth();
    const { alerts } = useAlerts();

    const handleSignOut = async () => {
        try {
            await signOut();
            navigate('/');
        } catch (error) {
            console.error('Erro ao sair:', error);
        }
    };

    // Dynamic Stats Calculation
    const myAlerts = profile ? alerts.filter(a => a.author_pseudonym === profile.pseudonym) : [];
    const alertsCreatedCount = myAlerts.length;

    // Reputation Calc: Base + (100 * Created) + (10 * Confirmed)
    // In a real app, this would come from the database (reputation field)
    const reputation = profile?.reputation || 0;

    // Trust Level Logic
    let trustLevel = 'Novo Vizinho';
    if (reputation > 500) trustLevel = 'Morador Ativo';
    if (reputation > 1500) trustLevel = 'Guardião do Bairro';

    return (
        <div className="flex flex-col h-full bg-primary-50 relative">
            <header className="bg-white p-6 pb-8 rounded-b-[2.5rem] shadow-sm relative overflow-hidden sticky top-0 z-20">
                <div className="absolute top-0 right-0 p-8 opacity-5">
                    <Shield size={180} />
                </div>

                <div className="relative z-10 flex flex-col items-center">
                    <div className="w-24 h-24 bg-primary-100 rounded-full flex items-center justify-center text-primary-600 mb-4 border-4 border-white shadow-md">
                        <User size={48} />
                    </div>

                    <h1 className="text-xl font-bold text-primary-900">{profile?.pseudonym || 'Carregando...'}</h1>
                    <div className="flex items-center gap-1 text-primary-500 text-sm mt-1">
                        <MapPin size={14} />
                        <span>{profile?.neighborhood || 'Vizinhança'}, {profile?.city || 'Sua Cidade'}</span>
                    </div>

                    <div className="mt-6 bg-accent-50 text-accent-700 px-4 py-1.5 rounded-full text-sm font-bold flex items-center gap-2 border border-accent-100">
                        <Shield size={16} className="fill-accent-200" />
                        {trustLevel}
                    </div>
                </div>
            </header>

            <div className="flex-1 overflow-y-auto px-4 pb-32 space-y-6 pt-6">
                {/* Stats Grid */}
                <div className="grid grid-cols-2 gap-3">
                    <div className="bg-white p-4 rounded-2xl shadow-sm border border-primary-100">
                        <div className="flex items-center gap-2 text-primary-400 mb-2">
                            <AlertTriangle size={18} />
                            <span className="text-xs font-medium">Alertas</span>
                        </div>
                        <span className="text-2xl font-bold text-primary-900">{alertsCreatedCount}</span>
                    </div>
                    <div className="bg-white p-4 rounded-2xl shadow-sm border border-primary-100">
                        <div className="flex items-center gap-2 text-primary-400 mb-2">
                            <CheckCircle size={18} />
                            <span className="text-xs font-medium">Reputação</span>
                        </div>
                        <span className="text-2xl font-bold text-primary-900 text-accent-600">{reputation}</span>
                    </div>
                </div>

                {/* Reputation Progress */}
                <div className="bg-white p-5 rounded-2xl shadow-sm border border-primary-100">
                    <div className="flex justify-between items-end mb-2">
                        <span className="font-bold text-primary-900">Reputação</span>
                        <span className="text-accent-600 font-bold">{reputation} XP</span>
                    </div>
                    <div className="h-2 bg-primary-100 rounded-full overflow-hidden">
                        <div className="h-full bg-accent-500 w-[0%]" />
                    </div>
                    <p className="text-xs text-primary-400 mt-2">Continue contribuindo para subir de nível!</p>
                </div>

                {/* Settings Teaser */}
                <div className="space-y-3">
                    <h3 className="font-bold text-primary-900 ml-1">Configurações</h3>
                    {/*<button className="w-full bg-white p-4 rounded-xl shadow-sm border border-primary-100 flex items-center justify-between text-primary-700 hover:bg-primary-50 transition-colors">
                        <div className="flex items-center gap-3" >
                            <Bell size={20} />
                            <span>Notificações</span>
                        </div>
                        <div className="w-10 h-6 bg-green-500 rounded-full relative">
                            <div className="absolute right-0.5 top-0.5 w-5 h-5 bg-white rounded-full shadow-sm" />
                        </div>
                    </button>*/}
                    <button
                        onClick={() => navigate('/my-account', { state: { profile } })}
                        className="w-full bg-white p-4 rounded-xl shadow-sm border border-primary-100 flex items-center justify-between text-primary-700 hover:bg-primary-50 transition-colors"
                    >
                        <div className="flex items-center gap-3">
                            <Settings size={20} />
                            <span>Minha Conta</span>
                        </div>
                    </button>
                    <button
                        onClick={() => navigate('/support')}
                        className="w-full bg-white p-4 rounded-xl shadow-sm border border-primary-100 flex items-center justify-between text-primary-700 hover:bg-primary-50 transition-colors"
                    >
                        <div className="flex items-center gap-3">
                            <HeartPlus size={20} className="text-red-400" />
                            <span>Apoie o Projeto</span>
                        </div>
                    </button>
                </div>

                <div className="pt-4">
                    <Button
                        variant="outline"
                        className="w-full text-red-500 border-red-200 hover:bg-red-50 hover:border-red-300"
                        onClick={handleSignOut}
                    >
                        Sair
                    </Button>
                </div>
            </div>

            <BottomNav />
        </div>
    );
}
