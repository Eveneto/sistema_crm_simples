'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { UserRole, hasPermission } from '@/lib/auth/roles';

interface UserProfile {
  id: string;
  full_name: string;
  avatar_url: string | null;
  role: UserRole;
  phone: string | null;
  created_at: string;
  updated_at: string;
}

/**
 * Hook para gerenciar role do usuário e permissões
 */
export function useUserRole() {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [role, setRole] = useState<UserRole | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const supabase = createClient();

  useEffect(() => {
    async function loadUserProfile() {
      try {
        setIsLoading(true);

        // Obter usuário atual
        const {
          data: { user },
          error: userError,
        } = await supabase.auth.getUser();

        if (userError) throw userError;
        if (!user) {
          setProfile(null);
          setRole(null);
          return;
        }

        // Buscar perfil do usuário
        const { data: profileData, error: profileError } = await supabase
          .from('user_profiles')
          .select('*')
          .eq('id', user.id)
          .single();

        if (profileError) throw profileError;
        if (!profileData) throw new Error('Profile not found');

        const userProfile = profileData as unknown as UserProfile;
        setProfile(userProfile);
        setRole(userProfile.role);
      } catch (err) {
        console.error('Error loading user profile:', err);
        setError(err instanceof Error ? err : new Error('Unknown error'));
      } finally {
        setIsLoading(false);
      }
    }

    loadUserProfile();

    // Listener para mudanças de auth
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(() => {
      loadUserProfile();
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [supabase]);

  /**
   * Verifica se o usuário tem uma permissão específica
   */
  const checkPermission = (permission: Parameters<typeof hasPermission>[1]): boolean => {
    if (!role) return false;
    return hasPermission(role, permission);
  };

  /**
   * Verifica se o usuário é admin
   */
  const isAdmin = role === 'admin';

  /**
   * Verifica se o usuário é manager ou admin
   */
  const isManagerOrAdmin = role === 'admin' || role === 'manager';

  /**
   * Verifica se o usuário é agent
   */
  const isAgent = role === 'agent';

  return {
    profile,
    role,
    isLoading,
    error,
    checkPermission,
    isAdmin,
    isManagerOrAdmin,
    isAgent,
  };
}
