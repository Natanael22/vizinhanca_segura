import { supabase } from '../lib/supabase';

export async function submitFeedback(userId: string | undefined, content: string, type: string = 'suggestion'): Promise<void> {
    const { error } = await supabase
        .from('feedbacks')
        .insert({
            user_id: userId,
            content,
            type
        });

    if (error) throw error;
}
