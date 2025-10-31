import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { signUpWithEmailPassword } from '@/dal/auth';

export function SignupPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const navigate = useNavigate();

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError(null);
    setSuccess(false);
    try {
      const session = await signUpWithEmailPassword(email, password, name);
      if (session) {
        // If email confirmation is disabled, user is immediately signed in
        navigate('/plans', { replace: true });
      } else {
        // Email confirmation required - show message
        setSuccess(true);
      }
    } catch (err: any) {
      // Handle rate limiting errors specifically
      if (err?.message?.includes('429') || err?.message?.includes('rate limit') || err?.message?.includes('Te veel')) {
        setError(err.message || 'Te veel pogingen. Wacht even en probeer het opnieuw.');
      } else {
        setError(err?.message ?? 'Registratie mislukt. Probeer het opnieuw.');
      }
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <main className="container section">
      <div className="card max-w-md mx-auto">
        <div className="card-body col gap-4">
          <h1 className="heading-xl">Registreren</h1>
          {error && <div className="text-red-400 text-sm">{error}</div>}
          {success && (
            <div className="text-green-400 text-sm">
              Registratie gelukt! Check je e-mail om je account te bevestigen, daarna kun je inloggen.
            </div>
          )}
          <form className="col gap-3" onSubmit={onSubmit}>
            <label className="col">
              <span className="eyebrow">Naam</span>
              <input 
                type="text" 
                className="bg-black text-white border border-white/20 rounded-md p-2"
                value={name} 
                onChange={(e) => setName(e.target.value)} 
                required 
                placeholder="Volledige naam"
              />
            </label>
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
                minLength={6}
              />
            </label>
            <button className="btn btn-primary" disabled={submitting} type="submit">
              {submitting ? 'Bezig...' : 'Registreren'}
            </button>
          </form>
          <div className="text-sm text-gray-400 text-center">
            Heb je al een account? <Link to="/login" className="text-blue-400 hover:underline">Inloggen</Link>
          </div>
        </div>
      </div>
    </main>
  );
}

