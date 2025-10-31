import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { signInWithEmailPassword, signInWithMagicLink } from '@/dal/auth';
import { getUserRole } from '@/dal/programs';
import { useAuth } from './auth-provider';

export function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [magicLinkSent, setMagicLinkSent] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();
  const location = useLocation() as any;
  const from = location.state?.from?.pathname || '/plans';
  const { user } = useAuth();

  // Auto-redirect if already logged in (e.g., after clicking magic link)
  useEffect(() => {
    async function handleAutoRedirect() {
      if (user?.email) {
        const role = await getUserRole(user.email);
        if (role === 'manager') {
          navigate('/plans', { replace: true });
        } else if (role === 'trainee') {
          navigate('/my-schedule', { replace: true });
        }
      }
    }
    handleAutoRedirect();
  }, [user, navigate]);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError(null);
    setMagicLinkSent(false);
    
    try {
      // First detect user type
      const role = await getUserRole(email);
      
      if (role === 'manager') {
        // Managers must use password
        if (!password) {
          setError('Wachtwoord is verplicht voor talent managers');
          setSubmitting(false);
          return;
        }
        await signInWithEmailPassword(email, password);
        navigate(from, { replace: true });
      } else if (role === 'trainee') {
        // Trainees use magic link (passwordless)
        await signInWithMagicLink(email);
        setMagicLinkSent(true);
      } else {
        // User not found in either table
        setError('Dit e-mailadres is niet bekend. Neem contact op met je talent manager.');
      }
    } catch (err: any) {
      setError(err?.message ?? 'Login mislukt');
    } finally {
      setSubmitting(false);
    }
  };
  
  const handleEmailBlur = async () => {
    // Auto-detect if user needs password or magic link
    if (email && !password) {
      const role = await getUserRole(email);
      if (role === 'manager') {
        setShowPassword(true);
      } else if (role === 'trainee') {
        setShowPassword(false);
      }
    }
  };

  return (
    <main className="container section">
      <div className="card max-w-md mx-auto">
        <div className="card-body col gap-4">
          <h1 className="heading-xl">Inloggen</h1>
          {error && <div className="text-red-400 text-sm">{error}</div>}
          {magicLinkSent && (
            <div className="text-green-400 text-sm">
              Een inloglink is verzonden naar je e-mailadres. Check je inbox en klik op de link om in te loggen.
            </div>
          )}
          <form className="col gap-3" onSubmit={onSubmit}>
            <label className="col">
              <span className="eyebrow">E-mail</span>
              <input 
                type="email" 
                className="bg-black text-white border border-white/20 rounded-md p-2"
                value={email} 
                onChange={(e) => setEmail(e.target.value)} 
                onBlur={handleEmailBlur}
                required 
              />
            </label>
            {showPassword && (
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
            )}
            <button className="btn btn-primary" disabled={submitting} type="submit">
              {submitting ? 'Bezig...' : showPassword ? 'Inloggen' : 'Verstuur inloglink'}
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

