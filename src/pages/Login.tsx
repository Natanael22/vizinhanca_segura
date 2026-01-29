import { useState } from 'react';
import { Input } from '../components/Input';
import { Button } from '../components/Button';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { logError } from '../services/logger';
import { useNotification } from '../context/NotificationContext';
import { translateError } from '../utils/errors';

export default function Login() {
    const navigate = useNavigate();
    const { signIn } = useAuth();
    const { showNotification } = useNotification();
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        email: '',
        password: '',
    });

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        try {
            await signIn(formData.email, formData.password);
            navigate('/home');
        } catch (err: any) {
            const { title, message } = translateError(err.message);
            showNotification({ title, message, type: 'error' });

            logError({
                message: err.message,
                context: 'Login.handleLogin',
                metadata: { email: formData.email }
            });
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="p-6 flex flex-col h-full bg-white">
            <header className="mb-8">
                <Link to="/" className="text-primary-500 hover:text-primary-700 inline-block p-2 -ml-2 rounded-full hover:bg-primary-50">
                    <ArrowLeft size={24} />
                </Link>
                <h1 className="text-2xl font-bold mt-2 text-primary-900">Bem-vindo de volta</h1>
                <p className="text-primary-500">Faça login para continuar.</p>
            </header>

            <form onSubmit={handleLogin} className="space-y-6 flex-1">
                <Input
                    label="Email"
                    type="email"
                    placeholder="seu@email.com"
                    required
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                />
                <Input
                    label="Senha"
                    type="password"
                    placeholder="********"
                    required
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                />


                <div className="pt-4">
                    <Button type="submit" className="w-full" disabled={loading}>
                        {loading ? 'Entrando...' : 'Entrar'}
                    </Button>
                </div>
            </form>

            <div className="text-center mt-6">
                <p className="text-sm text-primary-500">
                    Não tem uma conta?{' '}
                    <Link to="/register" className="text-accent-600 font-semibold hover:underline">
                        Crie agora
                    </Link>
                </p>
            </div>
        </div>
    );
}
