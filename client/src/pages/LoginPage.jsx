import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import Container from '../components/Container';
import Button from '../components/Button';
import { useStore } from '../app/store';
import { useTranslation } from 'react-i18next';

function isValidEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

export default function LoginPage() {
  const { t } = useTranslation();
  const { login } = useStore();
  const nav = useNavigate();
  const loc = useLocation();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const [fieldErrors, setFieldErrors] = useState({
    email: '',
    password: '',
  });

  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  function validate() {
    const nextErrors = {
      email: '',
      password: '',
    };

    if (!email.trim()) {
      nextErrors.email = t('auth.errors.emailRequired') || 'Email is required.';
    } else if (!isValidEmail(email.trim())) {
      nextErrors.email = t('auth.errors.emailInvalid') || 'Please enter a valid email address.';
    }

    if (!password) {
      nextErrors.password = t('auth.errors.passwordRequired') || 'Password is required.';
    }

    setFieldErrors(nextErrors);

    return !nextErrors.email && !nextErrors.password;
  }

  async function submit(e) {
    e.preventDefault();
    setError('');

    const ok = validate();
    if (!ok) return;

    setLoading(true);
    try {
      await login(email.trim(), password);
      nav(loc.state?.from || '/');
    } catch (err) {
      const msg = err?.message || 'Login failed';

      if (msg.toLowerCase().includes('invalid credentials')) {
        setError(t('auth.errors.invalidCredentials') || 'Incorrect email or password.');
      } else {
        setError(msg);
      }
    } finally {
      setLoading(false);
    }
  }

  function inputClass(hasError) {
    return `mt-2 w-full rounded-xl border px-4 py-3 text-sm outline-none ${
      hasError
        ? 'border-red-400 focus:border-red-500'
        : 'border-neutral-200 focus:border-neutral-400'
    }`;
  }

  return (
    <main>
      <Container className="py-14">
        <div className="mx-auto max-w-md rounded-2xl border border-neutral-200 bg-white p-8 shadow-soft">
          <div className="text-3xl font-extrabold">{t('auth.welcome')}</div>
          <div className="mt-2 text-sm text-neutral-600">
            {t('auth.welcomeSub')}
          </div>

          <form className="mt-8 space-y-4" onSubmit={submit} noValidate>
            <div>
              <label className="text-xs font-semibold">{t('auth.email')}</label>
              <input
                type="email"
                className={inputClass(!!fieldErrors.email)}
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  if (fieldErrors.email) {
                    setFieldErrors((prev) => ({ ...prev, email: '' }));
                  }
                }}
                placeholder={t('auth.placeholders.email') || 'you@example.com'}
              />
              {fieldErrors.email && (
                <div className="mt-1 text-sm text-red-600">{fieldErrors.email}</div>
              )}
            </div>

            <div>
              <label className="text-xs font-semibold">{t('auth.password')}</label>
              <input
                type="password"
                className={inputClass(!!fieldErrors.password)}
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value);
                  if (fieldErrors.password) {
                    setFieldErrors((prev) => ({ ...prev, password: '' }));
                  }
                }}
                placeholder={t('auth.placeholders.password') || 'Enter your password'}
              />
              {fieldErrors.password && (
                <div className="mt-1 text-sm text-red-600">{fieldErrors.password}</div>
              )}
            </div>

            {error && (
              <div className="rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700">
                {error}
              </div>
            )}

            <Button type="submit" className="w-full rounded-2xl" disabled={loading}>
              {loading ? (t('auth.signingIn') || 'Signing in...') : t('auth.signIn')}
            </Button>
          </form>

          <div className="mt-6 text-center text-sm text-neutral-600">
            {t('auth.noAccount')}{' '}
            <Link className="font-semibold text-neutral-900" to="/register">
              {t('auth.signUp')}
            </Link>
          </div>
        </div>
      </Container>
    </main>
  );
}