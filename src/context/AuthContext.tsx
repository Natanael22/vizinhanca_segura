import { useState, useEffect, createContext, useContext, useCallback } from 'react';
import { supabase, type Profile } from '../lib/supabase';
import type { User, Session } from '@supabase/supabase-js';
import { logError } from '../services/logger';

type AuthContextType = {
    user: User | null;
    session: Session | null;
    profile: Profile | null;
    loading: boolean;
    refreshProfile: () => Promise<void>;
    signUp: (email: string, password: string, pseudonym: string, phone: string, neighborhood?: string, city?: string, state?: string) => Promise<void>;
    signIn: (email: string, password: string) => Promise<void>;
    signOut: () => Promise<void>;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
    const [user, setUser] = useState<User | null>(null);
    const [session, setSession] = useState<Session | null>(null);
    const [profile, setProfile] = useState<Profile | null>(null);
    const [loading, setLoading] = useState(true);

    const refreshProfile = useCallback(async () => {
        const { data: { session: currentSession } } = await supabase.auth.getSession();
        const userId = currentSession?.user?.id;

        if (!userId) {
            setProfile(null);
            return;
        }

        try {
            const { data, error } = await supabase
                .from('profiles')
                .select('*')
                .eq('id', userId)
                .single();

            if (error) {
                if (error.code === 'PGRST116') {
                    // Item not found - profile might have been deleted manually
                    console.warn('Profile not found for authenticated user');
                    setProfile(null);
                } else {
                    throw error;
                }
            } else {
                setProfile(data);
            }
        } catch (error: any) {
            console.log('Error refreshing profile:', error);
            setProfile(null);
            logError({
                message: error.message,
                context: 'AuthContext.refreshProfile',
                metadata: { userId }
            });
        }
    }, [user?.id]);

    useEffect(() => {
        // Initial setup
        const initAuth = async () => {
            try {
                const { data: { session: initialSession } } = await supabase.auth.getSession();
                setSession(initialSession);
                setUser(initialSession?.user ?? null);

                if (initialSession?.user) {
                    // Start profile fetch but don't block auth initialization
                    refreshProfile();
                }
            } catch (err) {
                console.error('Auth initialization error:', err);
            } finally {
                setLoading(false);
            }
        };

        initAuth();

        // Listen for auth changes
        const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, currentSession) => {
            setSession(currentSession);
            setUser(currentSession?.user ?? null);

            if (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED' || (event === 'INITIAL_SESSION' && currentSession)) {
                refreshProfile();
            } else if (event === 'SIGNED_OUT') {
                setProfile(null);
            }

            setLoading(false);
        });

        return () => {
            subscription.unsubscribe();
        };
    }, []); // Empty dependency array to run only once

    const signUp = async (
        email: string,
        password: string,
        pseudonym: string,
        phone: string,
        neighborhood?: string,
        city?: string,
        state?: string
    ) => {
        const { error } = await supabase.auth.signUp({
            email,
            password,
            options: {
                data: {
                    pseudonym,
                    phone,
                    neighborhood,
                    city,
                    state,
                },
            },
        });

        if (error) throw error;
    };

    const signIn = async (email: string, password: string) => {
        const { error } = await supabase.auth.signInWithPassword({
            email,
            password,
        });

        if (error) throw error;
    };

    const signOut = async () => {
        try {
            await supabase.auth.signOut();
        } catch (error: any) {
            console.log('Supabase signOut error:', error);
        } finally {
            // Always clear local state
            setUser(null);
            setSession(null);
            setProfile(null);
        }
    };

    return (
        <AuthContext.Provider value={{ user, session, profile, loading, refreshProfile, signUp, signIn, signOut }}>
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
}
