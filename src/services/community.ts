import { supabase, type Topic, type Reply } from '../lib/supabase';

export async function getTopics(neighborhood?: string): Promise<Topic[]> {
    let query = supabase
        .from('topics')
        .select('*');

    if (neighborhood) {
        query = query.eq('neighborhood', neighborhood);
    }

    const { data, error } = await query.order('created_at', { ascending: false });

    if (error) throw error;
    return data || [];
}

export async function getTopicById(id: string): Promise<Topic> {
    const { data, error } = await supabase
        .from('topics')
        .select('*')
        .eq('id', id)
        .single();

    if (error) throw error;
    return data;
}

export async function createTopic(topic: { title: string; content: string; author_pseudonym: string; neighborhood: string | null }): Promise<Topic> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Not authenticated');

    const { data, error } = await supabase
        .from('topics')
        .insert({
            ...topic,
            user_id: user.id
        })
        .select()
        .single();

    if (error) throw error;
    return data;
}

export async function getReplies(topicId: string): Promise<Reply[]> {
    const { data, error } = await supabase
        .from('replies')
        .select('*')
        .eq('topic_id', topicId)
        .order('created_at', { ascending: true });

    if (error) throw error;
    return data || [];
}

export async function addReply(topicId: string, content: string, authorPseudonym: string): Promise<Reply> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Not authenticated');

    const { data, error } = await supabase
        .from('replies')
        .insert({
            topic_id: topicId,
            content,
            author_pseudonym: authorPseudonym,
            user_id: user.id
        })
        .select()
        .single();

    if (error) throw error;
    return data;
}
