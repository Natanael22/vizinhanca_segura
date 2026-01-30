import { useState, useEffect } from 'react';
import { BottomNav } from '../components/Navigation/BottomNav';
import { MessageCircle, Plus, X, Search } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import * as communityService from '../services/community';
import { type Topic } from '../lib/supabase';
import { useAuth } from '../context/AuthContext';
import { Button } from '../components/Button';
import { Input } from '../components/Input';
import { useCurrentNeighborhood } from '../hooks/useCurrentNeighborhood';

import { useNavigate } from 'react-router-dom';

export default function Community() {
    const navigate = useNavigate();
    const { user, profile } = useAuth();
    const { profileNeighborhood } = useCurrentNeighborhood();
    const [topics, setTopics] = useState<Topic[]>([]);
    const [loading, setLoading] = useState(true);
    const [showForm, setShowForm] = useState(false);
    const [newTitle, setNewTitle] = useState('');
    const [newContent, setNewContent] = useState('');
    const [submitting, setSubmitting] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');

    useEffect(() => {
        loadTopics();
    }, [profileNeighborhood]);

    const loadTopics = async () => {
        // Safety timeout for Supabase promise
        const timeoutPromise = new Promise((_, reject) =>
            setTimeout(() => reject(new Error('TIMEOUT_DATABASE')), 8000)
        );

        try {
            const data = await Promise.race([
                communityService.getTopics(profileNeighborhood || undefined),
                timeoutPromise
            ]) as Topic[];

            setTopics(data);
        } catch (error: any) {
            if (error.message === 'TIMEOUT_DATABASE') {
                console.warn('Community topics load timed out');
            } else {
                try {
                    const { logError } = await import('../services/logger');
                    await logError({
                        message: error.message,
                        context: 'Community.loadTopics',
                        metadata: { neighborhood: profileNeighborhood }
                    });
                } catch (e) { /* ignore secondary error */ }
            }
        } finally {
            setLoading(false);
        }
    };

    const filteredTopics = topics.filter(topic =>
        topic.title.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const handleCreateTopic = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!user || !newTitle || !newContent) return;

        setSubmitting(true);
        try {
            await communityService.createTopic({
                title: newTitle,
                content: newContent,
                author_pseudonym: profile?.pseudonym || 'Anônimo',
                neighborhood: profileNeighborhood
            });

            setNewTitle('');
            setNewContent('');
            setShowForm(false);
            loadTopics();
        } catch (error: any) {
            console.log('Error creating topic:', error);

        } finally {
            setSubmitting(false);
        }
    };

    return (
        <div className="flex flex-col h-full bg-primary-50">
            <header className="p-4 bg-white border-b border-primary-200 sticky top-0 z-10 shadow-sm flex items-center gap-2">
                <div className="bg-accent-100 p-2 rounded-full text-accent-600">
                    <MessageCircle size={24} />
                </div>
                <div>
                    <h1 className="text-xl font-bold text-primary-900">Comunidade</h1>
                    <p className="text-xs text-primary-500">
                        {profileNeighborhood ? `Discussões em ${profileNeighborhood}` : 'Discussões gerais'}
                    </p>
                </div>
            </header>

            <div className="flex-1 overflow-y-auto p-4 space-y-4 pb-32">
                {/* New Post Placeholder/Form */}
                {!showForm ? (
                    <div
                        onClick={() => setShowForm(true)}
                        className="bg-white p-4 rounded-xl border border-primary-200 shadow-sm flex gap-3 items-center text-primary-400 cursor-pointer hover:bg-primary-50 transition-colors"
                    >
                        <div className="w-10 h-10 rounded-full bg-primary-100 flex items-center justify-center text-primary-600">
                            <Plus size={20} />
                        </div>
                        <span className="flex-1 text-sm">Comece uma discussão...</span>
                    </div>
                ) : (
                    <form onSubmit={handleCreateTopic} className="bg-white p-4 rounded-xl border-2 border-accent-200 shadow-md space-y-4 animate-in zoom-in-95 duration-200">
                        <div className="flex justify-between items-center">
                            <h2 className="font-bold text-primary-900">Nova Discussão</h2>
                            <button type="button" onClick={() => setShowForm(false)} className="text-primary-400 hover:text-primary-600">
                                <X size={20} />
                            </button>
                        </div>
                        <Input
                            label="Título"
                            placeholder="Título da discussão"
                            value={newTitle}
                            onChange={(e) => setNewTitle(e.target.value)}
                            required
                        />
                        <textarea
                            placeholder="O que você quer compartilhar ou perguntar?"
                            className="w-full h-32 rounded-lg border border-primary-300 p-3 text-primary-900 resize-none focus:ring-2 focus:ring-accent-500 focus:outline-none text-sm"
                            value={newContent}
                            onChange={(e) => setNewContent(e.target.value)}
                            required
                        />
                        <Button type="submit" className="w-full" disabled={submitting}>
                            {submitting ? 'Postando...' : 'Postar Discussão'}
                        </Button>
                    </form>
                )}

                {/* Search Bar */}
                <div className="relative">
                    <div className="absolute left-3 top-1/2 -translate-y-1/2 text-primary-400">
                        <Search size={18} />
                    </div>
                    <input
                        type="text"
                        placeholder="Pesquisar discussões..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full pl-10 pr-10 py-3 bg-white border border-primary-200 rounded-xl text-sm text-primary-900 focus:ring-2 focus:ring-accent-500 focus:outline-none transition-all shadow-sm"
                    />
                    {searchTerm && (
                        <button
                            onClick={() => setSearchTerm('')}
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-primary-400 hover:text-primary-600 p-1"
                        >
                            <X size={16} />
                        </button>
                    )}
                </div>

                {loading ? (
                    <div className="text-center py-10 text-primary-400">Carregando discussões...</div>
                ) : filteredTopics.length === 0 ? (
                    <div className="text-center py-10 space-y-2 bg-white rounded-xl border border-dashed border-primary-200">
                        <p className="text-primary-400 font-medium">
                            {searchTerm
                                ? `Nenhuma discussão encontrada para "${searchTerm}"`
                                : `Nenhuma discussão em ${profileNeighborhood || 'seu bairro'} ainda.`}
                        </p>
                        <p className="text-xs text-primary-300">
                            {searchTerm ? 'Tente outros termos ou limpe a busca.' : 'Seja o primeiro a compartilhar algo com seus vizinhos!'}
                        </p>
                        {searchTerm && (
                            <button
                                onClick={() => setSearchTerm('')}
                                className="mt-2 text-accent-600 text-sm font-bold hover:underline"
                            >
                                Limpar Busca
                            </button>
                        )}
                    </div>
                ) : (
                    filteredTopics.map(topic => (
                        <div
                            key={topic.id}
                            onClick={() => navigate(`/topic/${topic.id}`)}
                            className="bg-white p-4 rounded-xl border border-primary-200 shadow-sm hover:border-accent-300 transition-colors cursor-pointer"
                        >
                            <div className="flex justify-between items-start mb-2">
                                <h3 className="font-bold text-primary-900">{topic.title}</h3>
                                <span className="text-xs text-primary-400">
                                    {formatDistanceToNow(new Date(topic.created_at), { locale: ptBR, addSuffix: true })}
                                </span>
                            </div>
                            <p className="text-sm text-primary-700 mb-3 line-clamp-2">{topic.content}</p>
                            <div className="flex justify-between items-center text-xs text-primary-500 border-t border-primary-50 pt-3">
                                <div className="flex items-center gap-2">
                                    <div className="w-5 h-5 rounded-full bg-primary-100 flex items-center justify-center text-[10px] text-primary-600">
                                        {topic.author_pseudonym[0].toUpperCase()}
                                    </div>
                                    <span className="font-medium text-primary-600">{topic.author_pseudonym}</span>
                                </div>
                                <div className="flex items-center gap-1">
                                    <MessageCircle size={14} />
                                    <span>Ver respostas</span>
                                </div>
                            </div>
                        </div>
                    ))
                )}
            </div>

            <BottomNav />
        </div>
    );
}
