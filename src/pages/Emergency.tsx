import { EmergencyButton } from '../components/Emergency/EmergencyButton';
import { BottomNav } from '../components/Navigation/BottomNav';
import { AlertTriangle, ShieldAlert, HeartPulse, Flame } from 'lucide-react';

export default function Emergency() {
    return (
        <div className="flex flex-col h-full bg-primary-50">
            <header className="p-6 bg-red-600 text-white pb-8 rounded-b-3xl shadow-lg relative z-10">
                <div className="flex items-center gap-3 mb-2">
                    <ShieldAlert size={32} />
                    <h1 className="text-2xl font-bold">Emergência</h1>
                </div>
                <p className="text-red-100 text-sm">Toque nos cartões para ligar imediatamente.</p>
            </header>

            <div className="flex-1 overflow-y-auto -mt-4 pt-8 px-4 space-y-4 pb-24">
                {/* Banner with warning */}
                <div className="bg-orange-100 border border-orange-200 p-4 rounded-xl flex gap-3 text-orange-900 text-sm mb-6">
                    <AlertTriangle className="shrink-0 text-orange-600" size={24} />
                    <p>
                        <strong>Atenção:</strong> Este aplicativo não substitui serviços oficiais. Em caso de perigo real, ligue para as autoridades.
                    </p>
                </div>

                <EmergencyButton
                    number="190"
                    label="Polícia Militar"
                    sublabel="Emergências policiais e risco de vida"
                    color="border-blue-900"
                    icon={<ShieldAlert size={28} />}
                />

                <EmergencyButton
                    number="193"
                    label="Bombeiros"
                    sublabel="Incêndios e resgates"
                    color="border-red-600"
                    icon={<Flame size={28} />}
                />

                <EmergencyButton
                    number="192"
                    label="SAMU"
                    sublabel="Ambulância e socorro médico"
                    color="border-red-500" // red-500 is lighter/different
                    icon={<HeartPulse size={28} />}
                />
            </div>

            <BottomNav />
        </div>
    );
}
