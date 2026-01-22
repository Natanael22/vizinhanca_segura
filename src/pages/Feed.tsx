import { useAlerts } from '../context/AlertContext';
import { AlertCard } from '../components/Feed/AlertCard';
import { CreateAlertFAB } from '../components/CreateAlertFAB';
import { BottomNav } from '../components/Navigation/BottomNav';

export default function Feed() {
    const { alerts } = useAlerts();

    // Sort by date desc
    const sortedAlerts = [...alerts].sort((a, b) =>
        new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
    );

    return (
        <div className="flex flex-col h-full bg-primary-50 relative">
            <header className="p-4 bg-white border-b border-primary-200 sticky top-0 z-10 shadow-sm">
                <h1 className="text-xl font-bold text-primary-900">Feed do Bairro</h1>
                <p className="text-xs text-primary-500">Últimas ocorrências na região</p>
            </header>

            <div className="flex-1 overflow-y-auto p-4 space-y-3 pb-24">
                {sortedAlerts.map(alert => (
                    <AlertCard key={alert.id} alert={alert} />
                ))}
                {sortedAlerts.length === 0 && (
                    <div className="text-center text-primary-400 mt-10">
                        <p>Nenhum alerta por perto.</p>
                    </div>
                )}
            </div>

            <CreateAlertFAB />
            <BottomNav />
        </div>
    );
}
