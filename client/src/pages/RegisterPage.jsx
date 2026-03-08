import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Container from '../components/Container';
import Button from '../components/Button';
import { useStore } from '../app/store';
import { useTranslation } from 'react-i18next';

function isValidEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

export default function RegisterPage() {
  const { t } = useTranslation();
  const { register } = useStore();
  const nav = useNavigate();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const [fieldErrors, setFieldErrors] = useState({
    name: '',
    email: '',
    password: '',
  });

  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  function validate() {
    const nextErrors = {
      name: '',
      email: '',
      password: '',
    };

    if (!name.trim()) {
      nextErrors.name = t('auth.errors.nameRequired') || 'Full name is required.';
    } else if (name.trim().length < 2) {
      nextErrors.name = t('auth.errors.nameMin') || 'Full name must be at least 2 characters.';
    }

    if (!email.trim()) {
      nextErrors.email = t('auth.errors.emailRequired') || 'Email is required.';
    } else if (!isValidEmail(email.trim())) {
      nextErrors.email = t('auth.errors.emailInvalid') || 'Please enter a valid email address.';
    }

    if (!password) {
      nextErrors.password = t('auth.errors.passwordRequired') || 'Password is required.';
    } else if (password.length < 6) {
      nextErrors.password = t('auth.errors.passwordMin') || 'Password must be at least 6 characters.';
    }

    setFieldErrors(nextErrors);

    return !nextErrors.name && !nextErrors.email && !nextErrors.password;
  }

  async function submit(e) {
    e.preventDefault();
    setError('');

    const ok = validate();
    if (!ok) return;

    setLoading(true);
    try {
      await register(name.trim(), email.trim(), password);
      nav('/');
    } catch (err) {
      const msg = err?.message || 'Register failed';

      // Try to map common backend messages to friendly text
      if (msg.toLowerCase().includes('email already in use')) {
        setFieldErrors((prev) => ({
          ...prev,
          email: t('auth.errors.emailUsed') || 'This email is already in use.',
        }));
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
          <div className="text-3xl font-extrabold">{t('auth.signUp')}</div>
          <div className="mt-2 text-sm text-neutral-600">
            {t('auth.registerSub') || 'Create an account to manage orders faster.'}
          </div>

          <form className="mt-8 space-y-4" onSubmit={submit} noValidate>
            <div>
              <label className="text-xs font-semibold">{t('auth.name')}</label>
              <input
                className={inputClass(!!fieldErrors.name)}
                value={name}
                onChange={(e) => {
                  setName(e.target.value);
                  if (fieldErrors.name) {
                    setFieldErrors((prev) => ({ ...prev, name: '' }));
                  }
                }}
                placeholder={t('auth.placeholders.name') || 'Your full name'}
              />
              {fieldErrors.name && (
                <div className="mt-1 text-sm text-red-600">{fieldErrors.name}</div>
              )}
            </div>

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
                placeholder={t('auth.placeholders.password') || 'At least 6 characters'}
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
              {loading ? (t('auth.creating') || 'Creating...') : t('auth.create')}
            </Button>
          </form>

          <div className="mt-6 text-center text-sm text-neutral-600">
            {t('auth.haveAccount') || 'Already have an account?'}{' '}
            <Link className="font-semibold text-neutral-900" to="/login">
              {t('auth.signIn')}
            </Link>
          </div>
        </div>
      </Container>
    </main>
  );
}