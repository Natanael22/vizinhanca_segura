import { createContext, useContext, useState, useEffect, type ReactNode } from 'react';
import { supabase } from '../lib/supabase';
import * as alertService from '../services/alerts';
import { useAuth } from './AuthContext';
import { type Alert } from '../types/alert';
import { logError } from '../services/logger';


interface AlertContextType {
    alerts: Alert[];
    loading: boolean;
    addAlert: (alert: {
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
    }) => Promise<void>;
    confirmAlert: (id: string) => Promise<void>;
    resolveAlert: (id: string) => Promise<void>;
    reportAlert: (id: string) => Promise<void>;
    addComment: (alertId: string, text: string) => Promise<void>;
}

const AlertContext = createContext<AlertContextType | undefined>(undefined);

export function AlertProvider({ children }: { children: ReactNode }) {
    const [alerts, setAlerts] = useState<Alert[]>([]);
    const [loading, setLoading] = useState(true);
    const { user } = useAuth();

    // Load alerts on mount
    useEffect(() => {
        loadAlerts();

        // Subscribe to real-time changes
        const channel = supabase
            .channel('alerts-changes')
            .on(
                'postgres_changes',
                { event: '*', schema: 'public', table: 'alerts' },
                () => {
                    loadAlerts();
                }
            )
            .subscribe();

        return () => {
            supabase.removeChannel(channel);
        };
    }, []);

    const loadAlerts = async () => {
        try {
            const data = await alertService.getAlerts();

            // Map the Supabase data to our frontend Alert type
            // Note: In a real app we might want to fetch confirmation counts and comments together
            const mappedAlerts: Alert[] = await Promise.all(data.map(async (alert: any) => {
                const [confirmations, reports, comments] = await Promise.all([
                    alertService.getAlertConfirmations(alert.id),
                    alertService.getAlertReports(alert.id),
                    alertService.getComments(alert.id)
                ]);

                return {
                    id: alert.id,
                    user_id: alert.user_id,
                    type: alert.type as any,
                    latitude: alert.latitude,
                    longitude: alert.longitude,
                    description: alert.description,
                    neighborhood: alert.neighborhood,
                    city: alert.city,
                    state: alert.state,
                    street: alert.street,
                    photo_url: alert.photo_url,
                    created_at: alert.created_at,
                    author_pseudonym: alert.author_pseudonym,
                    confirmations,
                    reports,
                    police_report: alert.police_report,
                    reference_point: alert.reference_point,
                    status: (alert.status || 'active') as any,
                    comments: comments.map((c: any) => ({
                        id: c.id,
                        text: c.content,
                        author_pseudonym: c.author_pseudonym,
                        created_at: c.created_at
                    }))
                };
            }));

            setAlerts(mappedAlerts);
        } catch (error: any) {
            //console.error('Error loading alerts:', error);
            logError({
                message: error.message,
                context: 'AlertContext.loadAlerts',
                metadata: { email: user?.email || 'anonymous' }
            });
        } finally {
            setLoading(false);
        }
    };

    const addAlert = async (newAlert: {
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
    }) => {
        try {
            await alertService.createAlert(newAlert);
            await loadAlerts();
        } catch (error: any) {
            //console.error('Error creating alert:', error);
            logError({
                message: error.message,
                context: 'AlertContext.loadAlerts',
                metadata: { email: user?.email || 'anonymous' }
            });
            throw error;
        }
    };

    const confirmAlert = async (id: string) => {
        try {
            await alertService.confirmAlert(id);
            // Optimistic update
            setAlerts(prev => prev.map(alert =>
                alert.id === id ? { ...alert, confirmations: alert.confirmations + 1 } : alert
            ));
        } catch (error: any) {
            //console.error('Error confirming alert:', error);
            logError({
                message: error.message,
                context: 'AlertContext.loadAlerts',
                metadata: { email: user?.email || 'anonymous' }
            });
            throw error;
        }
    };

    const reportAlert = async (id: string) => {
        try {
            await alertService.reportAlert(id);
            // Optimistic update
            setAlerts(prev => prev.map(alert =>
                alert.id === id ? { ...alert, reports: alert.reports + 1 } : alert
                //const newReports = alert.reports + 1;
                //const newStatus = newReports >= 10 ? 'hidden' : alert.status;
                //return { ...alert, reports: newReports, status: newStatus };

                //return alert;
                //}
            ));
        } catch (error: any) {
            //console.error('Error reporting alert:', error);
            logError({
                message: error.message,
                context: 'AlertContext.loadAlerts',
                metadata: { email: user?.email || 'anonymous' }
            });
            throw error;
        }
    };

    const resolveAlert = async (id: string) => {
        try {
            await alertService.resolveAlert(id);
            setAlerts(prev => prev.map(alert =>
                alert.id === id ? { ...alert, status: 'resolved' } : alert
            ));
        } catch (error: any) {
            //console.error('Error resolving alert:', error);
            logError({
                message: error.message,
                context: 'AlertContext.loadAlerts',
                metadata: { email: user?.email || 'anonymous' }
            });
            throw error;
        }
    };

    const addComment = async (alertId: string, text: string) => {
        try {
            if (!user) throw new Error('Not authenticated');

            const { data: profile } = await supabase
                .from('profiles')
                .select('pseudonym')
                .eq('id', user.id)
                .single();

            await alertService.addComment(alertId, text, profile?.pseudonym || 'Anônimo');

            // Real-time update will handle the list, but we could also loadAlerts() or update state
            loadAlerts();
        } catch (error: any) {
            //console.error('Error adding comment:', error);
            logError({
                message: error.message,
                context: 'AlertContext.loadAlerts',
                metadata: { email: user?.email || 'anonymous' }
            });
            throw error;
        }
    };

    return (
        <AlertContext.Provider value={{
            alerts,
            loading,
            addAlert,
            confirmAlert,
            resolveAlert,
            reportAlert,
            addComment
        }}>
            {children}
        </AlertContext.Provider>
    );
}

export function useAlerts() {
    const context = useContext(AlertContext);
    if (context === undefined) {
        throw new Error('useAlerts must be used within an AlertProvider');
    }
    return context;
}
