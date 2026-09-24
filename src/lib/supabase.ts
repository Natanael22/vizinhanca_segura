import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
    throw new Error('Missing Supabase environment variables');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Types
export type Profile = {
    id: string;
    email: string;
    phone: string | null;
    pseudonym: string;
    neighborhood: string | null;
    city: string | null;
    state: string | null;
    reputation: number;
    created_at: string;
    updated_at: string;
};

export type AlertRow = {
    id: string;
    user_id: string;
    type: string;
    description: string;
    latitude: number;
    longitude: number;
    neighborhood: string | null;
    city: string | null;
    state: string | null;
    street: string | null;
    photo_url: string | null;
    author_pseudonym: string;
    police_report: string | null;
    reference_point: string | null;
    status: 'active' | 'resolved' | 'reported';
    created_at: string;
    updated_at: string;
};

export type AlertConfirmation = {
    id: string;
    alert_id: string;
    user_id: string;
    created_at: string;
};

export type AlertComment = {
    id: string;
    alert_id: string;
    user_id: string;
    author_pseudonym: string;
    content: string;
    created_at: string;
};

export type Topic = {
    id: string;
    user_id: string;
    author_pseudonym: string;
    neighborhood: string | null;
    title: string;
    content: string;
    created_at: string;
    updated_at: string;
};

export type Reply = {
    id: string;
    topic_id: string;
    user_id: string;
    author_pseudonym: string;
    content: string;
    created_at: string;
};
