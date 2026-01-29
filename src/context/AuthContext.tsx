import { useState, useEffect, createContext, useContext, useCallback } from 'react';
import { supabase, type Profile } from '../lib/supabase';
import type { User, Session } from '@supabase/supabase-js';

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
        const { data: currentSession } = await supabase.auth.getSession();
        const userId = currentSession?.session?.user?.id;

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

            if (error) throw error;
            setProfile(data);
        } catch (error) {
            console.error('Error refreshing profile:', error);
        }
    }, []);

    useEffect(() => {
        // Initial setup
        const initAuth = async () => {
            const { data: { session } } = await supabase.auth.getSession();
            setSession(session);
            setUser(session?.user ?? null);

            if (session?.user) {
                await refreshProfile();
            }

            setLoading(false);
        };

        initAuth();

        // Listen for auth changes
        const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
            // Avoid duplicate state updates if session is same
            setSession(session);
            setUser(session?.user ?? null);

            if (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED' || (event === 'INITIAL_SESSION' && session)) {
                await refreshProfile();
            } else if (event === 'SIGNED_OUT') {
                setProfile(null);
            }

            setLoading(false);
        });

        return () => subscription.unsubscribe();
    }, [refreshProfile]);

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
        const { error } = await supabase.auth.signOut();
        if (error) throw error;
        setProfile(null);
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
