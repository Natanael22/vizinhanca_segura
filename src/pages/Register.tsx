import { useState } from 'react';
import { Input } from '../components/Input';
import { Button } from '../components/Button';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowLeft, RefreshCw, ShieldCheck } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { generateRandomPseudonym } from '../utils/pseudonym';

export default function Register() {
    const navigate = useNavigate();
    const { signUp } = useAuth();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [formData, setFormData] = useState({
        pseudonym: generateRandomPseudonym(),
        email: '',
        phone: '',
        password: '',
        confirmPassword: '',
    });

    const refreshPseudonym = () => {
        setFormData(prev => ({ ...prev, pseudonym: generateRandomPseudonym() }));
    };

    const handleRegister = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');

        if (formData.password !== formData.confirmPassword) {
            setError('As senhas não coincidem');
            return;
        }

        if (formData.password.length < 6) {
            setError('A senha deve ter no mínimo 6 caracteres');
            return;
        }

        try {
            // Instead of signing up now, pass data to onboarding
            navigate('/onboarding', { state: { registrationData: formData } });
        } catch (err: any) {
            setError('Erro ao processar dados. Tente novamente.');
        }
    };

    return (
        <div className="p-6 flex flex-col h-full bg-white">
            <header className="mb-8">
                <Link to="/" className="text-primary-500 hover:text-primary-700 inline-block p-2 -ml-2 rounded-full hover:bg-primary-50">
                    <ArrowLeft size={24} />
                </Link>
                <h1 className="text-2xl font-bold mt-2 text-primary-900">Crie sua conta</h1>
                <p className="text-primary-500">Junte-se à sua comunidade.</p>
            </header>

            <form onSubmit={handleRegister} className="space-y-5 flex-1">
                <div className="relative">
                    <Input
                        label="Nome Público (Pseudônimo)"
                        type="text"
                        placeholder="Ex: Vigilante do Bairro 123"
                        required
                        readOnly
                        value={formData.pseudonym}
                        onChange={(e) => setFormData({ ...formData, pseudonym: e.target.value })}
                        className="bg-primary-50 border-primary-100 pr-12"
                    />
                    <button
                        type="button"
                        onClick={refreshPseudonym}
                        className="absolute right-3 top-[34px] p-2 text-primary-400 hover:text-accent-600 transition-colors"
                        title="Gerar novo nome"
                    >
                        <RefreshCw size={20} className={loading ? 'animate-spin' : ''} />
                    </button>
                    <p className="text-[10px] text-primary-400 mt-1 flex items-center gap-1">
                        <ShieldCheck size={12} />
                        Sua identidade real nunca será revelada.
                    </p>
                </div>
                <Input
                    label="Email"
                    type="email"
                    placeholder="seu@email.com"
                    required
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                />
                <Input
                    label="Telefone"
                    type="tel"
                    placeholder="(00) 00000-0000"
                    required
                    value={formData.phone}
                    onChange={(e) => {
                        // Simple numeric mask could be added here
                        setFormData({ ...formData, phone: e.target.value });
                    }}
                />
                <Input
                    label="Senha"
                    type="password"
                    placeholder="No mínimo 6 caracteres"
                    required
                    minLength={6}
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                />
                <Input
                    label="Confirmar Senha"
                    type="password"
                    placeholder="Repita sua senha"
                    required
                    minLength={6}
                    value={formData.confirmPassword}
                    onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                />

                {error && (
                    <p className="text-red-500 text-sm bg-red-50 p-3 rounded-lg border border-red-100">
                        {error}
                    </p>
                )}

                <div className="pt-4">
                    <Button type="submit" className="w-full" disabled={loading}>
                        {loading ? 'Criando conta...' : 'Continuar'}
                    </Button>
                </div>
            </form>

            <div className="text-center mt-6">
                <p className="text-sm text-primary-500">
                    Já tem uma conta?{' '}
                    <Link to="/login" className="text-accent-600 font-semibold hover:underline">
                        Faça login
                    </Link>
                </p>
            </div>
        </div>
    );
}
