import { useQuery } from '@tanstack/react-query';
import { listProgramsForManager, getManagerIdByEmail } from '@/dal/programs';
import { Link, useNavigate } from 'react-router-dom';
import type { Program } from '@/types/database';
import { useAuth } from '@/features/auth/containers/auth-provider';

function ProgramRow({ p }: { p: Program }) {
  return (
    <li className="card row justify-between items-center p-3">
      <div className="col">
        <div className="font-semibold">{p.title}</div>
        <div className="text-sm text-gray-400">
          {p.trainee_name ?? '(naam onbekend)'} — {p.trainee_email}
        </div>
        <div className="text-xs text-gray-500">
          {p.start_date} → {p.end_date}
        </div>
      </div>
      <div>
        <Link 
          className="btn btn-ghost" 
          to={`/schedule?traineeEmail=${encodeURIComponent(p.trainee_email)}`}
        >
          Bewerken
        </Link>
      </div>
    </li>
  );
}

export function PlansOverviewPage() {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();

  const { data: managerId } = useQuery({
    queryKey: ['managerId', user?.email] as const,
    queryFn: async () => {
      if (!user?.email) return null;
      return await getManagerIdByEmail(user.email);
    },
    enabled: !!user?.email,
  });

  const { data: programs, isLoading, error } = useQuery({
    queryKey: ['programs', managerId] as const,
    queryFn: async () => {
      if (!managerId) return [];
      return await listProgramsForManager(managerId);
    },
    enabled: !!managerId,
  });

  const handleSignOut = async () => {
    try {
      await signOut();
      navigate('/login', { replace: true });
    } catch (error) {
      console.error('Logout error:', error);
      // Navigate anyway even if signOut fails
      navigate('/login', { replace: true });
    }
  };

  return (
    <main className="container section">
      <header className="mb-6 row items-center justify-between">
        <div>
          <h1 className="heading-xl">Plannen</h1>
          <p className="text-sm text-gray-400">Ingelogd als {user?.email}</p>
        </div>
        <div className="row gap-2">
          <Link className="btn btn-ghost" to="/schedule/new">
            Nieuw programma
          </Link>
          <button className="btn btn-ghost" onClick={handleSignOut}>
            Uitloggen
          </button>
        </div>
      </header>

      {isLoading && <div className="text-gray-400">Laden...</div>}
      {error && <div className="text-red-400">Fout bij laden</div>}
      {!isLoading && !error && (
        <ul className="col gap-3">
          {(programs ?? []).map((p) => (
            <ProgramRow key={p.id} p={p} />
          ))}
          {(!programs || programs.length === 0) && (
            <div className="text-gray-400">Geen programma's gevonden</div>
          )}
        </ul>
      )}
    </main>
  );
}

