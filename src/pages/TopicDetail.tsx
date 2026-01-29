import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { MessageCircle, ArrowLeft, Send, Clock } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import * as communityService from '../services/community';
import { supabase, type Topic, type Reply } from '../lib/supabase';
import { useAuth } from '../context/AuthContext';
import { Button } from '../components/Button';
import { Input } from '../components/Input';
import { logError } from '../services/logger';

export default function TopicDetail() {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const { user } = useAuth();

    const [topic, setTopic] = useState<Topic | null>(null);
    const [replies, setReplies] = useState<Reply[]>([]);
    const [loading, setLoading] = useState(true);
    const [replyContent, setReplyContent] = useState('');
    const [submitting, setSubmitting] = useState(false);

    useEffect(() => {
        if (id) {
            loadTopicAndReplies(id);
        }
    }, [id]);

    const loadTopicAndReplies = async (topicId: string) => {
        setLoading(true);
        try {
            const [topicData, repliesData] = await Promise.all([
                communityService.getTopicById(topicId),
                communityService.getReplies(topicId)
            ]);
            setTopic(topicData);
            setReplies(repliesData);
        } catch (error: any) {
            //console.error('Error loading topic/replies:', error);
            await logError({
                message: error.message,
                stack: error.stack,
                context: 'TopicDetail.loadTopicAndReplies',
                metadata: { topicId }
            });
        } finally {
            setLoading(false);
        }
    };

    const handleAddReply = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!user || !id || !replyContent.trim()) return;

        setSubmitting(true);
        try {
            const { data: profile } = await supabase
                .from('profiles')
                .select('pseudonym')
                .eq('id', user.id)
                .single();

            await communityService.addReply(id, replyContent, profile?.pseudonym || 'Anônimo');
            setReplyContent('');
            // Reload replies
            const updatedReplies = await communityService.getReplies(id);
            setReplies(updatedReplies);
        } catch (error: any) {
            //console.error('Error adding reply:', error);
            await logError({
                message: error.message,
                stack: error.stack,
                context: 'TopicDetail.handleAddReply',
                metadata: { topicId: id }
            });
        } finally {
            setSubmitting(false);
        }
    };

    if (loading) {
        return (
            <div className="flex flex-col h-full bg-primary-50 items-center justify-center">
                <div className="w-10 h-10 border-4 border-accent-200 border-t-accent-600 rounded-full animate-spin"></div>
                <p className="mt-4 text-primary-500 font-medium">Carregando discussão...</p>
            </div>
        );
    }

    if (!topic) {
        return (
            <div className="flex flex-col h-full bg-primary-50 p-6 items-center justify-center text-center">
                <div className="bg-red-100 p-4 rounded-full text-red-600 mb-4">
                    <MessageCircle size={32} />
                </div>
                <h1 className="text-xl font-bold text-primary-900 mb-2">Discussão não encontrada</h1>
                <p className="text-primary-500 mb-6">O link pode estar quebrado ou a discussão foi removida.</p>
                <Button onClick={() => navigate('/community')}>Voltar para Comunidade</Button>
            </div>
        );
    }

    return (
        <div className="flex flex-col h-full bg-primary-50">
            <header className="p-4 bg-white border-b border-primary-200 sticky top-0 z-10 flex items-center gap-4">
                <button
                    onClick={() => navigate('/community')}
                    className="p-2 hover:bg-primary-50 rounded-full transition-colors text-primary-600"
                >
                    <ArrowLeft size={24} />
                </button>
                <div className="flex-1 min-w-0">
                    <h1 className="text-lg font-bold text-primary-900 truncate">Discussão</h1>
                    {topic.neighborhood && (
                        <p className="text-[10px] text-accent-600 font-medium uppercase tracking-wider">{topic.neighborhood}</p>
                    )}
                </div>
            </header>

            <div className="flex-1 overflow-y-auto pb-32">
                {/* Topic Content */}
                <div className="bg-white p-6 border-b border-primary-200 shadow-sm">
                    <h2 className="text-xl font-bold text-primary-900 mb-4">{topic.title}</h2>

                    <div className="flex items-center gap-2 mb-6 text-sm">
                        <div className="w-8 h-8 rounded-full bg-accent-100 flex items-center justify-center text-accent-700 font-bold border border-accent-200">
                            {topic.author_pseudonym[0].toUpperCase()}
                        </div>
                        <div className="flex flex-col">
                            <span className="font-bold text-primary-900 leading-tight">{topic.author_pseudonym}</span>
                            <div className="flex items-center gap-1 text-primary-400 text-xs">
                                <Clock size={12} />
                                <span>{formatDistanceToNow(new Date(topic.created_at), { locale: ptBR, addSuffix: true })}</span>
                            </div>
                        </div>
                    </div>

                    <div className="prose prose-sm text-primary-800 leading-relaxed whitespace-pre-wrap">
                        {topic.content}
                    </div>
                </div>

                {/* Replies Section */}
                <div className="p-4 space-y-4">
                    <h3 className="font-bold text-primary-900 text-sm flex items-center gap-2 px-2">
                        <MessageCircle size={16} className="text-accent-500" />
                        Respostas ({replies.length})
                    </h3>

                    {replies.length === 0 ? (
                        <div className="bg-white/50 border border-dashed border-primary-300 p-8 rounded-xl text-center text-primary-400">
                            <p>Nenhuma resposta ainda. Seja o primeiro a comentar!</p>
                        </div>
                    ) : (
                        <div className="space-y-4">
                            {replies.map(reply => (
                                <div key={reply.id} className="bg-white p-4 rounded-xl border border-primary-200 shadow-sm">
                                    <div className="flex justify-between items-center mb-2">
                                        <div className="flex items-center gap-2">
                                            <div className="w-6 h-6 rounded-full bg-primary-100 flex items-center justify-center text-[10px] text-primary-600 font-bold">
                                                {reply.author_pseudonym[0].toUpperCase()}
                                            </div>
                                            <span className="text-xs font-bold text-primary-900">{reply.author_pseudonym}</span>
                                        </div>
                                        <span className="text-[10px] text-primary-400">
                                            {formatDistanceToNow(new Date(reply.created_at), { locale: ptBR, addSuffix: true })}
                                        </span>
                                    </div>
                                    <p className="text-sm text-primary-700 leading-relaxed">{reply.content}</p>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>

            {/* Sticky Reply Input */}
            <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-primary-200 p-4 pb-6 z-20 shadow-[0_-4px_10px_-2px_rgba(0,0,0,0.05)]">
                <form onSubmit={handleAddReply} className="max-w-md mx-auto flex gap-2 items-end">
                    <div className="flex-1">
                        <Input
                            label=""
                            placeholder="Escreva sua resposta..."
                            value={replyContent}
                            onChange={(e) => setReplyContent(e.target.value)}
                            className="bg-primary-50 border-none focus:ring-accent-500"
                        />
                    </div>
                    <Button
                        type="submit"
                        disabled={submitting || !replyContent.trim()}
                        className="h-[42px] px-4 flex items-center justify-center gap-2"
                    >
                        <Send size={18} />
                        <span className="hidden sm:inline">Enviar</span>
                    </Button>
                </form>
            </div>
        </div>
    );
}
