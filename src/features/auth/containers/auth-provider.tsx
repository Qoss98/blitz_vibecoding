import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { QueryClient, QueryClientProvider, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase/client';
import { getCurrentUser, signOut as dalSignOut } from '@/dal/auth';
import { ensureTalentManagerExists, getUserRole } from '@/dal/programs';

type AuthContextValue = {
  user: { id: string; email: string } | null;
  signOut: () => Promise<void>;
};

const AuthContext = createContext<AuthContextValue>({ user: null, signOut: async () => {} });

export function useAuth() {
  return useContext(AuthContext);
}

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: false,
      refetchOnWindowFocus: false,
    },
  },
});

function AuthProviderInner({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<{ id: string; email: string } | null>(null);
  const [loading, setLoading] = useState(true);
  const queryClient = useQueryClient();

  useEffect(() => {
    let mounted = true;
    
    // Initial load
    getCurrentUser().then(async (u) => {
      if (mounted) {
        setUser(u);
        setLoading(false);
      }
    });

    // Listen for auth state changes
    const sub = supabase?.auth.onAuthStateChange(async (event) => {
      if (!mounted) return;
      const u = await getCurrentUser();
      
      // Create manager record on first login (only for managers, not trainees)
      if (event === 'SIGNED_IN' && u?.email) {
        const role = await getUserRole(u.email);
        // If user is not a trainee, they might be a new manager signing up
        // Try to ensure manager record exists (this will only create if it doesn't exist)
        if (role !== 'trainee') {
          await ensureTalentManagerExists(u.email);
        }
      }
      
      setUser(u);
      setLoading(false);
      
      // Clear queries on sign out
      if (event === 'SIGNED_OUT') {
        queryClient.clear();
      }
    });

    return () => {
      mounted = false;
      sub?.data.subscription.unsubscribe();
    };
  }, [queryClient]);

  const handleSignOut = async () => {
    try {
      // Cancel all in-flight queries first
      await queryClient.cancelQueries();
      // Clear all React Query cache
      queryClient.clear();
      // Set user to null immediately to prevent new queries
      setUser(null);
      // Then attempt to sign out from Supabase
      await dalSignOut();
    } catch (error) {
      console.error('Sign out failed:', error);
      // Still clear user state and cache even if signOut fails
      setUser(null);
      queryClient.clear();
      // Cancel any remaining queries
      await queryClient.cancelQueries();
    }
  };

  const value = useMemo(() => ({ user, signOut: handleSignOut }), [user]);

  if (loading) {
    return (
      <div className="container section">
        <div className="text-center text-gray-400">Laden...</div>
      </div>
    );
  }

  return (
    <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
  );
}

export function AppProviders({ children }: { children: React.ReactNode }) {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProviderInner>{children}</AuthProviderInner>
    </QueryClientProvider>
  );
}


