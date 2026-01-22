import { supabase, type Profile } from '../lib/supabase';

export async function getProfile(userId: string): Promise<Profile | null> {
    const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();

    if (error) throw error;
    return data;
}

export async function updateProfile(userId: string, updates: Partial<Profile>): Promise<void> {
    const { error } = await supabase
        .from('profiles')
        .update(updates)
        .eq('id', userId);

    if (error) throw error;
}

export async function saveUserLocation(
    userId: string,
    location: { neighborhood: string; city: string; state: string }
): Promise<void> {
    const { error } = await supabase
        .from('profiles')
        .update({
            neighborhood: location.neighborhood,
            city: location.city,
            state: location.state,
        })
        .eq('id', userId);

    if (error) throw error;
}
