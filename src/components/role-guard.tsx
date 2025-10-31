import React, { useEffect, useState } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '@/features/auth/containers/auth-provider';
import { getUserRole } from '@/dal/programs';

type Props = {
  children: React.ReactNode;
  allowedRoles: ('manager' | 'trainee')[];
  redirectTo?: string;
};

export function RoleGuard({ children, allowedRoles, redirectTo = '/login' }: Props) {
  const { user } = useAuth();
  const [role, setRole] = useState<'manager' | 'trainee' | null | 'loading'>('loading');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function checkRole() {
      if (!user?.email) {
        setRole(null);
        setLoading(false);
        return;
      }

      const userRole = await getUserRole(user.email);
      setRole(userRole);
      setLoading(false);
    }

    checkRole();
  }, [user?.email]);

  if (loading) {
    return (
      <div className="container section">
        <div className="text-center text-gray-400">Laden...</div>
      </div>
    );
  }

  if (!user || !role || !allowedRoles.includes(role)) {
    return <Navigate to={redirectTo} replace />;
  }

  return <>{children}</>;
}

