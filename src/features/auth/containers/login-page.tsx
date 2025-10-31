import React, { useState } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { signInWithEmailPassword } from '@/dal/auth';

export function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();
  const location = useLocation() as any;
  const from = location.state?.from?.pathname || '/plans';

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError(null);
    try {
      await signInWithEmailPassword(email, password);
      navigate(from, { replace: true });
    } catch (err: any) {
      setError(err?.message ?? 'Login mislukt');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <main className="container section">
      <div className="card max-w-md mx-auto">
        <div className="card-body col gap-4">
          <h1 className="heading-xl">Inloggen</h1>
          {error && <div className="text-red-400 text-sm">{error}</div>}
          <form className="col gap-3" onSubmit={onSubmit}>
            <label className="col">
              <span className="eyebrow">E-mail</span>
              <input 
                type="email" 
                className="bg-black text-white border border-white/20 rounded-md p-2"
                value={email} 
                onChange={(e) => setEmail(e.target.value)} 
                required 
              />
            </label>
            <label className="col">
              <span className="eyebrow">Wachtwoord</span>
              <input 
                type="password" 
                className="bg-black text-white border border-white/20 rounded-md p-2"
                value={password} 
                onChange={(e) => setPassword(e.target.value)} 
                required 
              />
            </label>
            <button className="btn btn-primary" disabled={submitting} type="submit">
              {submitting ? 'Bezig...' : 'Inloggen'}
            </button>
          </form>
          <div className="text-sm text-gray-400 text-center">
            Nog geen account? <Link to="/signup" className="text-blue-400 hover:underline">Registreren</Link>
          </div>
        </div>
      </div>
    </main>
  );
}

