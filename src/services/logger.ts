import { supabase } from '../lib/supabase';

export interface LogErrorParams {
    message: string;
    stack?: string;
    context: string;
    metadata?: any;
}

export async function logError({ message, stack, context, metadata }: LogErrorParams) {
    try {
        const { data: { user } } = await supabase.auth.getUser();

        const logData = {
            user_id: user?.id || null,
            error_message: message,
            error_stack: stack || null,
            context,
            path: window.location.pathname,
            metadata: {
                ...metadata,
                userAgent: navigator.userAgent,
                timestamp: new Date().toISOString()
            }
        };

        const { error } = await supabase
            .from('error_logs')
            .insert(logData);

        if (error) {
            console.error('Failed to save log to Supabase:', error);

        }
    } catch (err) {
        console.error('Critical error in logger service:', err);
    }
}
