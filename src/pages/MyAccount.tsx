import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { updateProfile } from '../services/profiles';
import { Button } from '../components/Button';
import { Input } from '../components/Input';
import { ArrowLeft, User, Phone, MapPin, Save } from 'lucide-react';

export default function MyAccount() {
    const navigate = useNavigate();
    const { user, profile, refreshProfile } = useAuth();

    const [saving, setSaving] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState(false);

    const [formData, setFormData] = useState({
        pseudonym: profile?.pseudonym || '',
        phone: profile?.phone || '',
        neighborhood: profile?.neighborhood || '',
        city: profile?.city || '',
        state: profile?.state || ''
    });

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!user) return;

        if (!formData.pseudonym.trim()) {
            setError('O apelido é obrigatório.');
            return;
        }

        try {
            setSaving(true);
            setError(null);
            await updateProfile(user.id, formData);

            // Refresh global profile state
            await refreshProfile();

            setSuccess(true);

            // Wait a moment for success message then redirect
            setTimeout(() => {
                navigate('/profile');
            }, 1000);
        } catch (err) {
            console.error('Error updating profile:', err);
            setError('Erro ao salvar as alterações.');
        } finally {
            setSaving(false);
        }
    };

    return (
        <div className="flex flex-col h-full bg-primary-50">
            {/* Header */}
            <header className="bg-white px-4 py-6 flex items-center gap-4 border-b border-primary-100 shadow-sm sticky top-0 z-10">
                <button
                    onClick={() => navigate(-1)}
                    className="p-2 hover:bg-primary-50 rounded-full transition-colors text-primary-600"
                >
                    <ArrowLeft size={24} />
                </button>
                <h1 className="text-xl font-bold text-primary-900">Minha Conta</h1>
            </header>

            <div className="flex-1 overflow-y-auto p-4 pb-10">
                <form onSubmit={handleSave} className="space-y-6">
                    {/* Profile Section */}
                    <div className="bg-white p-6 rounded-2xl shadow-sm border border-primary-100 space-y-4">
                        <div className="flex items-center gap-2 text-accent-600 mb-2">
                            <User size={20} />
                            <h2 className="font-bold">Informações Básicas</h2>
                        </div>

                        <Input
                            label="Apelido na Comunidade"
                            value={formData.pseudonym}
                            onChange={(e) => setFormData(prev => ({ ...prev, pseudonym: e.target.value }))}
                            placeholder="Ex: Vizinho 123"
                            required
                        />

                        <div className="flex items-center gap-2 text-accent-600 pt-2 mb-1">
                            <Phone size={18} />
                            <span className="text-sm font-bold">Contato</span>
                        </div>

                        <Input
                            label="Telefone (WhatsApp)"
                            value={formData.phone}
                            onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
                            placeholder="(00) 00000-0000"
                            type="tel"
                        />
                    </div>

                    {/* Location Section */}
                    <div className="bg-white p-6 rounded-2xl shadow-sm border border-primary-100 space-y-4">
                        <div className="flex items-center gap-2 text-accent-600 mb-2">
                            <MapPin size={20} />
                            <h2 className="font-bold">Localização</h2>
                        </div>

                        <Input
                            label="Bairro"
                            value={formData.neighborhood}
                            onChange={(e) => setFormData(prev => ({ ...prev, neighborhood: e.target.value }))}
                            placeholder="Seu bairro"
                        />

                        <div className="grid grid-cols-2 gap-4">
                            <Input
                                label="Cidade"
                                value={formData.city}
                                onChange={(e) => setFormData(prev => ({ ...prev, city: e.target.value }))}
                                placeholder="Cidade"
                            />
                            <Input
                                label="Estado"
                                value={formData.state}
                                onChange={(e) => setFormData(prev => ({ ...prev, state: e.target.value }))}
                                placeholder="UF"
                                maxLength={2}
                            />
                        </div>
                    </div>

                    {error && (
                        <div className="bg-red-50 text-red-600 p-4 rounded-xl text-sm border border-red-100 font-medium animate-in fade-in slide-in-from-top-2">
                            {error}
                        </div>
                    )}

                    {success && (
                        <div className="bg-green-50 text-green-600 p-4 rounded-xl text-sm border border-green-100 font-medium animate-in fade-in slide-in-from-top-2">
                            Alterações salvas com sucesso!
                        </div>
                    )}

                    <Button
                        type="submit"
                        className="w-full flex items-center justify-center gap-2 h-14 shadow-lg shadow-primary-200"
                        isLoading={saving}
                    >
                        {!saving && <Save size={20} />}
                        {saving ? 'Salvando...' : 'Salvar Alterações'}
                    </Button>

                    <p className="text-center text-xs text-primary-400 px-6">
                        Suas informações de localização ajudam a identificar alertar próximos a você.
                    </p>
                </form>
            </div>
        </div>
    );
}
