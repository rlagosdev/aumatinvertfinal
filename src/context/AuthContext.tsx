import React, { createContext, useContext, useEffect, useState } from 'react';
    import type { ReactNode } from 'react';
    import type { User, AuthError } from '@supabase/supabase-js';
    import { supabase } from '../supabase/client';

    interface AuthContextType {
      user: User | null;
      loading: boolean;
      signOut: () => Promise<void>;
      signInWithOAuth: (provider: string) => Promise<{ error?: AuthError }>;
      signInWithGoogle: () => Promise<{ error?: AuthError }>;
      signInWithFacebook: () => Promise<{ error?: AuthError }>;
      signInWithGitHub: () => Promise<{ error?: AuthError }>;
    }

    interface AuthProviderProps {
      children: ReactNode;
    }

    const AuthContext = createContext<AuthContextType>({} as AuthContextType);

    export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
      const [user, setUser] = useState<User | null>(null);
      const [loading, setLoading] = useState<boolean>(true);

      useEffect(() => {
        // Get initial session
        const getSession = async () => {
          const { data: { session } } = await supabase.auth.getSession();
          setUser(session?.user ?? null);
          setLoading(false);
        };

        getSession();

        // Listen for auth changes
        const { data: { subscription } } = supabase.auth.onAuthStateChange(
          async (_event, session) => {
            setUser(session?.user ?? null);
            setLoading(false);
          }
        );

        return () => subscription.unsubscribe();
      }, []);

      const signOut = async (): Promise<void> => {
        const { error } = await supabase.auth.signOut();
        if (error) {
          console.error('Error signing out:', error.message);
        }
      };

      const signInWithOAuth = async (provider: string): Promise<{ error?: AuthError }> => {
        const { error } = await supabase.auth.signInWithOAuth({
          provider: provider as any,
          options: {
            redirectTo: `${window.location.origin}/`
          }
        });
        if (error) {
          console.error(`Error signing in with ${provider}:`, error.message);
          return { error };
        }
        return {};
      };

      const signInWithGoogle = async () => signInWithOAuth('google');
      const signInWithFacebook = async () => signInWithOAuth('facebook');
      const signInWithGitHub = async () => signInWithOAuth('github');

      const value: AuthContextType = {
        user,
        loading,
        signOut,
        signInWithOAuth,
        signInWithGoogle,
        signInWithFacebook,
        signInWithGitHub,
      };

      return (
        <AuthContext.Provider value={value}>
          {children}
        </AuthContext.Provider>
      );
    };

    export const useAuth = (): AuthContextType => useContext(AuthContext);