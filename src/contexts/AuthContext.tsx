import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { supabase, User } from '../lib/supabase';
import type { Session } from '@supabase/supabase-js';

interface AuthContextType {
  user: User | null;
  session: Session | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<{ error: Error | null }>;
  signUp: (email: string, password: string, role: 'club' | 'fan', name?: string) => Promise<{ error: Error | null }>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchUserData = useCallback(async (userId: string, sessionEmail?: string) => {
    try {
      const [clubResult, memberResult] = await Promise.all([
        supabase.from('clubs').select('id, name').eq('user_id', userId).maybeSingle(),
        supabase.from('club_members').select('club_id, clubs(name)').eq('user_id', userId).maybeSingle(),
      ]);

      const clubData = clubResult.data;
      const memberData = memberResult.data as any;

      const userData: User = {
        id: userId,
        email: sessionEmail || '',
        role: clubData ? 'club' : 'fan',
        club_id: clubData?.id || memberData?.club_id,
        club_name: clubData?.name || memberData?.clubs?.name,
      };

      setUser(userData);
    } catch (error) {
      console.error('Error fetching user data:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    let mounted = true;

    const initAuth = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (!mounted) return;

        setSession(session);
        if (session?.user) {
          await fetchUserData(session.user.id, session.user.email);
        } else {
          setLoading(false);
        }
      } catch (error) {
        console.error('Error getting session:', error);
        if (mounted) {
          setLoading(false);
        }
      }
    };

    initAuth();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (!mounted) return;

      setSession(session);
      if (session?.user) {
        await fetchUserData(session.user.id, session.user.email);
      } else {
        setUser(null);
        setLoading(false);
      }
    });

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, [fetchUserData]);

  async function signIn(email: string, password: string) {
    try {
      //setLoading(true);
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      return { error: error as Error | null };
    } catch (error) {
      return { error: error as Error };
    }
  }

  async function signUp(email: string, password: string, role: 'club' | 'fan', name?: string) {
    try {
      setLoading(true);
      const { data, error } = await supabase.auth.signUp({ email, password });
      if (error) {
        setLoading(false);
        return { error: error as Error };
      }

      if (data.user && role === 'club' && name) {
        await supabase.from('clubs').insert({
          user_id: data.user.id,
          name: name,
        });
      }

      return { error: null };
    } catch (error) {
      setLoading(false);
      return { error: error as Error };
    }
  }

  async function signOut() {
    try {
      await supabase.auth.signOut();
      setUser(null);
      setSession(null);
    } catch (error) {
      console.error('Error signing out:', error);
    }
  }

  return (
    <AuthContext.Provider value={{ user, session, loading, signIn, signUp, signOut }}>
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
