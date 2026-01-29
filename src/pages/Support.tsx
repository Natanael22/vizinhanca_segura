import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { submitFeedback } from '../services/feedback';
import { Button } from '../components/Button';
import { ArrowLeft, MessageSquare, Heart, Copy, CheckCircle2, MessageCircle, Bug, Sparkles } from 'lucide-react';

export default function Support() {
    const navigate = useNavigate();
    const { user, profile } = useAuth();

    const [content, setContent] = useState('');
    const [type, setType] = useState('suggestion');
    const [submitting, setSubmitting] = useState(false);
    const [submitted, setSubmitted] = useState(false);
    const [copied, setCopied] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const pixKey = 'nex3nsolutions@gmail.com';

    const handleCopyPix = () => {
        navigator.clipboard.writeText(pixKey);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!content.trim()) return;

        setSubmitting(true);
        setSubmitted(false); // Reset success state
        setError(null);

        try {
            // Use profile ID, falling back to user ID if available
            const userId = profile?.id || user?.id;
            await submitFeedback(userId, content, type);

            setSubmitted(true);
            setContent('');
            // Reset success message after 5 seconds
            setTimeout(() => setSubmitted(false), 5000);
        } catch (err) {
            console.error('Error submitting feedback:', err);
            setError('Erro ao enviar. Verifique sua conexão e tente novamente.');
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <div className="flex flex-col h-full bg-primary-50 relative">
            {/* Header */}
            <header className="bg-white px-4 py-6 flex items-center gap-4 border-b border-primary-100 shadow-sm sticky top-0 z-20">
                <button
                    onClick={() => navigate(-1)}
                    className="p-2 hover:bg-primary-50 rounded-full transition-colors text-primary-600"
                >
                    <ArrowLeft size={24} />
                </button>
                <h1 className="text-xl font-bold text-primary-900">Apoie o Projeto</h1>
            </header>

            <div className="flex-1 overflow-y-auto p-4 space-y-6 pb-10">
                {/* Donation Card */}
                <section className="bg-gradient-to-br from-accent-600 to-accent-800 p-6 rounded-3xl shadow-lg text-white relative overflow-hidden">
                    <div className="absolute top-0 right-0 p-4 opacity-10 rotate-12">
                        <Heart size={120} />
                    </div>

                    <div className="relative z-10">
                        <div className="flex items-center gap-2 mb-4">
                            <Sparkles className="text-accent-200" size={20} />
                            <h2 className="text-lg font-bold">Faça uma Doação</h2>
                        </div>

                        <p className="text-accent-100 text-sm leading-relaxed mb-6">
                            Este é um projeto voluntário e gratuito. Sua doação ajuda a cobrir custos de servidor e incentiva o desenvolvimento de novas funcionalidades!
                        </p>

                        <div className="bg-white/10 backdrop-blur-md rounded-2xl p-4 border border-white/20">
                            <span className="text-xs text-accent-200 block mb-1">Chave PIX (E-mail)</span>
                            <div className="flex items-center justify-between gap-2">
                                <code className="text-sm font-bold truncate">{pixKey}</code>
                                <button
                                    onClick={handleCopyPix}
                                    className="p-2 bg-white text-accent-700 rounded-lg hover:bg-accent-50 transition-colors shrink-0"
                                >
                                    {copied ? <CheckCircle2 size={18} /> : <Copy size={18} />}
                                </button>
                            </div>
                        </div>

                        {copied && (
                            <p className="text-xs text-accent-200 mt-2 font-medium flex items-center gap-1 animate-in fade-in slide-in-from-bottom-1">
                                <CheckCircle2 size={12} /> Chave copiada!
                            </p>
                        )}
                    </div>
                </section>

                {/* Feedback Form */}
                <section className="bg-white p-6 rounded-2xl shadow-sm border border-primary-100">
                    <div className="flex items-center gap-2 text-primary-900 mb-6">
                        <MessageSquare className="text-accent-600" size={20} />
                        <h2 className="font-bold">Sugestões e Feedbacks</h2>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div className="grid grid-cols-2 gap-2 p-1 bg-primary-50 rounded-xl">
                            <button
                                type="button"
                                onClick={() => setType('suggestion')}
                                className={`flex items-center justify-center gap-2 py-2 rounded-lg text-sm font-medium transition-all ${type === 'suggestion'
                                    ? 'bg-white text-primary-900 shadow-sm'
                                    : 'text-primary-500 hover:text-primary-700'
                                    }`}
                            >
                                <MessageCircle size={16} />
                                Sugestão
                            </button>
                            <button
                                type="button"
                                onClick={() => setType('bug')}
                                className={`flex items-center justify-center gap-2 py-2 rounded-lg text-sm font-medium transition-all ${type === 'bug'
                                    ? 'bg-white text-red-600 shadow-sm'
                                    : 'text-primary-500 hover:text-primary-700'
                                    }`}
                            >
                                <Bug size={16} />
                                Bug
                            </button>
                        </div>

                        <textarea
                            value={content}
                            onChange={(e) => setContent(e.target.value)}
                            placeholder={type === 'suggestion' ? "O que podemos melhorar?" : "Descreva o problema..."}
                            className="w-full min-h-[120px] p-4 bg-white border border-primary-200 rounded-xl text-primary-900 placeholder:text-primary-400 focus:outline-none focus:ring-2 focus:ring-accent-500 focus:border-transparent transition-all resize-none"
                            required
                        />

                        {error && (
                            <div className="text-red-500 text-xs font-medium px-1">
                                {error}
                            </div>
                        )}

                        {submitted && (
                            <div className="bg-green-50 text-green-600 p-3 rounded-lg text-sm font-medium border border-green-100 flex items-center gap-2 animate-in fade-in zoom-in-95">
                                <CheckCircle2 size={18} />
                                Obrigado pelo seu feedback!
                            </div>
                        )}

                        <Button
                            type="submit"
                            className="w-full flex items-center justify-center gap-2 h-12"
                            isLoading={submitting}
                            disabled={!content.trim()}
                        >
                            {!submitting && <MessageSquare size={18} />}
                            {submitting ? 'Enviando...' : 'Enviar Feedback'}
                        </Button>
                    </form>
                </section>

                <div className="text-center space-y-2">
                    <p className="text-sm text-primary-500">
                        Feito com <Heart size={14} className="inline fill-red-400 text-red-400" /> para uma vizinhaça mais segura.
                    </p>
                    <p className="text-xs text-primary-400">
                        Versão 1.0.0
                    </p>
                </div>
            </div>
        </div>
    );
}
