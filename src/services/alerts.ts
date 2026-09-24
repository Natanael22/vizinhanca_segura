import { supabase, type Alert } from '../lib/supabase';

export async function getAlerts(): Promise<Alert[]> {
    const { data, error } = await supabase
        .from('alerts')
        .select('*')
        .order('created_at', { ascending: false });

    if (error) throw error;
    return data || [];
}

export async function getAlertById(id: string): Promise<Alert | null> {
    const { data, error } = await supabase
        .from('alerts')
        .select('*')
        .eq('id', id)
        .single();

    if (error) throw error;
    return data;
}

export async function createAlert(alert: {
    type: string;
    description: string;
    latitude: number;
    longitude: number;
    neighborhood?: string;
    city?: string;
    state?: string;
    street?: string;
    photo_url?: string;
    author_pseudonym: string;
    police_report?: string;
    reference_point?: string;
}): Promise<Alert> {
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) throw new Error('Not authenticated');

    const { data, error } = await supabase
        .from('alerts')
        .insert({
            ...alert,
            user_id: user.id,
            status: 'active'
        })
        .select()
        .single();

    if (error) throw error;
    return data;
}

export async function uploadAlertPhoto(file: File): Promise<string> {
    const fileExt = file.name.split('.').pop();
    const fileName = `${crypto.randomUUID()}.${fileExt}`;
    const filePath = `${fileName}`;

    const { error: uploadError } = await supabase.storage
        .from('alert-photos')
        .upload(filePath, file);

    if (uploadError) throw uploadError;

    const { data } = supabase.storage
        .from('alert-photos')
        .getPublicUrl(filePath);

    return data.publicUrl;
}

export async function confirmAlert(alertId: string): Promise<void> {
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) throw new Error('Not authenticated');

    const { error } = await supabase
        .from('alert_confirmations')
        .insert({
            alert_id: alertId,
            user_id: user.id,
        });

    if (error) throw error;
}

export async function getAlertConfirmations(alertId: string): Promise<number> {
    const { count, error } = await supabase
        .from('alert_confirmations')
        .select('*', { count: 'exact', head: true })
        .eq('alert_id', alertId);

    if (error) throw error;
    return count || 0;
}

export async function getAlertReports(alertId: string): Promise<number> {
    const { count, error } = await supabase
        .from('alert_reports')
        .select('*', { count: 'exact', head: true })
        .eq('alert_id', alertId);

    if (error) throw error;
    return count || 0;
}

export async function addComment(alertId: string, content: string, authorPseudonym: string): Promise<void> {
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) throw new Error('Not authenticated');

    const { error } = await supabase
        .from('alert_comments')
        .insert({
            alert_id: alertId,
            user_id: user.id,
            author_pseudonym: authorPseudonym,
            content,
        });

    if (error) throw error;
}

export async function resolveAlert(alertId: string): Promise<void> {
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) throw new Error('Not authenticated');

    const { error } = await supabase
        .from('alerts')
        .update({ status: 'resolved' })
        .eq('id', alertId)
        .eq('user_id', user.id);

    if (error) throw error;
}

export async function reportAlert(alertId: string): Promise<void> {
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) throw new Error('Not authenticated');

    // 1. Insert report
    const { error: reportError } = await supabase
        .from('alert_reports')
        .insert({
            alert_id: alertId,
            user_id: user.id,
        });

    if (reportError) throw reportError;

    // 2. Check total reports
    const reportCount = await getAlertReports(alertId);

    // 3. Hide if threshold reached
    if (reportCount >= 10) {
        const { error: updateError } = await supabase
            .from('alerts')
            .update({ status: 'reported' })
            .eq('id', alertId);

        if (updateError) throw updateError;
    }
}

export async function getComments(alertId: string) {
    const { data, error } = await supabase
        .from('alert_comments')
        .select('*')
        .eq('alert_id', alertId)
        .order('created_at', { ascending: true });

    if (error) throw error;
    return data || [];
}
