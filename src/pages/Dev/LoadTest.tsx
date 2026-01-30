import { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../context/AuthContext';
import { useLocation } from '../../context/LocationContext';
import { Button } from '../../components/Button';
import { Database, Zap, Trash2, Activity, MapPin } from 'lucide-react';
import { PageLoader } from '../../components/PageLoader';

export default function LoadTest() {
    const { user, profile } = useAuth();
    const { gpsLocation, gpsCoords } = useLocation();
    const [isSeeding, setIsSeeding] = useState(false);
    const [seedCount, setSeedCount] = useState(100);
    const [stats, setStats] = useState({
        totalAlerts: 0,
        lastDuration: 0,
        fps: 0
    });

    // Monitor FPS
    useEffect(() => {
        let frameCount = 0;
        let lastTime = performance.now();

        const updateFPS = () => {
            frameCount++;
            const now = performance.now();
            if (now - lastTime >= 1000) {
                setStats(prev => ({ ...prev, fps: frameCount }));
                frameCount = 0;
                lastTime = now;
            }
            requestAnimationFrame(updateFPS);
        };

        const handle = requestAnimationFrame(updateFPS);
        return () => cancelAnimationFrame(handle);
    }, []);

    const fetchStats = async () => {
        const { count } = await supabase.from('alerts').select('*', { count: 'exact', head: true });
        setStats(prev => ({ ...prev, totalAlerts: count || 0 }));
    };

    useEffect(() => {
        fetchStats();
    }, []);

    const generateRandomAlerts = async (count: number) => {
        if (!gpsCoords || !gpsLocation || !profile) return;

        setIsSeeding(true);
        const startTime = performance.now();

        const types = ['emergency', 'theft', 'suspicious', 'noise', 'other'];
        const descriptions = [
            'Teste de carga - Atividade suspeita',
            'Simulação de congestionamento',
            'Alerta de teste automatizado',
            'Verificação de performance do mapa',
            'Massa de dados para estresse'
        ];

        const newAlerts = Array.from({ length: count }).map(() => ({
            user_id: user?.id,
            type: types[Math.floor(Math.random() * types.length)],
            description: descriptions[Math.floor(Math.random() * descriptions.length)],
            latitude: gpsCoords[0] + (Math.random() - 0.5) * 0.05,
            longitude: gpsCoords[1] + (Math.random() - 0.5) * 0.05,
            neighborhood: gpsLocation.neighborhood,
            city: gpsLocation.city,
            state: profile.state || '',
            author_pseudonym: profile.pseudonym,
            status: 'active'
        }));

        // Batch insert in chunks of 100 to avoid request size limits
        const chunkSize = 100;
        for (let i = 0; i < newAlerts.length; i += chunkSize) {
            const chunk = newAlerts.slice(i, i + chunkSize);
            const { error } = await supabase.from('alerts').insert(chunk);
            if (error) console.error('Seeding error:', error);
        }

        const duration = performance.now() - startTime;
        setStats(prev => ({ ...prev, lastDuration: Math.round(duration) }));
        setIsSeeding(false);
        fetchStats();
    };

    const clearAllAlerts = async () => {
        if (!confirm('Tem certeza? Isso vai DELETAR TODOS os alertas do banco!')) return;

        setIsSeeding(true);
        // Supabase often requires a filter, so we delete by non-null id
        const { error } = await supabase.from('alerts').delete().neq('id', '00000000-0000-0000-0000-000000000000');

        if (error) alert('Erro ao limpar: ' + error.message);
        setIsSeeding(false);
        fetchStats();
    };

    const runStormTest = async () => {
        if (!gpsCoords || !gpsLocation || !profile) return;
        setIsSeeding(true);
        // Simulate rapid fire creation (1 alert every 100ms for 5 seconds)
        let count = 0;
        const interval = setInterval(async () => {
            if (count >= 50) {
                clearInterval(interval);
                setIsSeeding(false);
                fetchStats();
                return;
            }

            await supabase.from('alerts').insert({
                user_id: user?.id,
                type: 'emergency',
                description: 'STORM TEST 🔥 #' + count,
                latitude: gpsCoords[0] + (Math.random() - 0.5) * 0.01,
                longitude: gpsCoords[1] + (Math.random() - 0.5) * 0.01,
                neighborhood: gpsLocation.neighborhood,
                city: gpsLocation.city,
                state: profile.state || '',
                author_pseudonym: profile.pseudonym,
                status: 'active'
            });
            count++;
        }, 100);
    };

    if (isSeeding && stats.totalAlerts === 0) return <PageLoader />;

    return (
        <div className="min-h-screen bg-primary-50 p-6 pb-24">
            <header className="mb-8">
                <h1 className="text-2xl font-bold text-primary-900 flex items-center gap-2">
                    <Activity className="text-accent-600" />
                    Laboratório de Estresse
                </h1>
                <p className="text-primary-600 text-sm">Ferramentas de teste de carga e performance</p>
            </header>

            <div className="grid grid-cols-2 gap-4 mb-8">
                <div className="bg-white p-4 rounded-2xl border border-primary-200 shadow-sm">
                    <p className="text-[10px] uppercase font-bold text-primary-400 mb-1">Total Alertas</p>
                    <p className="text-2xl font-black text-primary-900">{stats.totalAlerts}</p>
                </div>
                <div className="bg-white p-4 rounded-2xl border border-primary-200 shadow-sm">
                    <p className="text-[10px] uppercase font-bold text-primary-400 mb-1">UI Performance</p>
                    <p className="text-2xl font-black text-accent-600">{stats.fps} <span className="text-xs font-normal text-primary-400">FPS</span></p>
                </div>
            </div>

            <section className="space-y-6">
                <div className="bg-white p-6 rounded-2xl border border-primary-200 shadow-md">
                    <h2 className="font-bold text-primary-900 mb-4 flex items-center gap-2">
                        <Database size={18} className="text-primary-400" />
                        Seeding de Alertas
                    </h2>

                    <div className="flex gap-2 mb-4">
                        {[10, 100, 500, 1000].map(n => (
                            <button
                                key={n}
                                onClick={() => setSeedCount(n)}
                                className={`flex-1 py-2 rounded-lg text-xs font-bold transition-all ${seedCount === n ? 'bg-primary-900 text-white' : 'bg-primary-50 text-primary-600 hover:bg-primary-100'}`}
                            >
                                {n}
                            </button>
                        ))}
                    </div>

                    <Button
                        onClick={() => generateRandomAlerts(seedCount)}
                        disabled={isSeeding || !gpsLocation}
                        className="w-full flex items-center justify-center gap-2 py-4"
                    >
                        <Zap size={18} />
                        Gerar {seedCount} Alertas Aleatórios
                    </Button>

                    <p className="text-center text-[10px] text-primary-400 mt-3">
                        Última operação: {stats.lastDuration}ms
                    </p>
                </div>

                <div className="bg-white p-6 rounded-2xl border border-primary-200 shadow-md">
                    <h2 className="font-bold text-primary-900 mb-4 flex items-center gap-2">
                        <Zap size={18} className="text-amber-500" />
                        Stress Tests
                    </h2>

                    <Button
                        variant="secondary"
                        onClick={runStormTest}
                        disabled={isSeeding || !gpsLocation}
                        className="w-full mb-3"
                    >
                        Iniciar Storm Test (50 rápidas)
                    </Button>

                    <button
                        onClick={clearAllAlerts}
                        disabled={isSeeding}
                        className="w-full flex items-center justify-center gap-2 py-3 text-red-600 font-bold text-sm bg-red-50 hover:bg-red-100 rounded-xl transition-all"
                    >
                        <Trash2 size={18} />
                        Limpar Banco de Dados
                    </button>
                </div>

                {!gpsLocation && (
                    <div className="bg-amber-50 border border-amber-200 p-4 rounded-xl flex items-start gap-3">
                        <MapPin className="text-amber-600 shrink-0" />
                        <div>
                            <p className="text-sm font-bold text-amber-900">GPS Necessário</p>
                            <p className="text-xs text-amber-700">Ative o GPS para gerar alertas próximos à sua posição real.</p>
                        </div>
                    </div>
                )}
            </section>

            {/* Back to Home */}
            <div className="fixed bottom-6 left-6 right-6">
                <Button variant="secondary" className="w-full" onClick={() => window.location.href = '/home'}>
                    Voltar para o App
                </Button>
            </div>
        </div>
    );
}
