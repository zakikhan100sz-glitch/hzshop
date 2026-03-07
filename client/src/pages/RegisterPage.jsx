import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Container from '../components/Container';
import Button from '../components/Button';
import { useStore } from '../app/store';
import { useTranslation } from 'react-i18next';

export default function RegisterPage() {
  const { t } = useTranslation();
  const { register } = useStore();
  const nav = useNavigate();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function submit(e) {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await register(name, email, password);
      nav('/');
    } catch (err) {
      setError(err.message || 'Register failed');
    } finally {
      setLoading(false);
    }
  }

  return (
    <main>
      <Container className="py-14">
        <div className="mx-auto max-w-md rounded-2xl border border-neutral-200 bg-white p-8 shadow-soft">
          <div className="text-3xl font-extrabold">{t('auth.signUp')}</div>
          <div className="mt-2 text-sm text-neutral-600">
            Create an account to manage orders faster.
          </div>

          <form className="mt-8 space-y-4" onSubmit={submit}>
            <div>
              <label className="text-xs font-semibold">{t('auth.name')}</label>
              <input
                className="mt-2 w-full rounded-xl border border-neutral-200 px-4 py-3 text-sm"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            </div>

            <div>
              <label className="text-xs font-semibold">{t('auth.email')}</label>
              <input
                className="mt-2 w-full rounded-xl border border-neutral-200 px-4 py-3 text-sm"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>

            <div>
              <label className="text-xs font-semibold">{t('auth.password')}</label>
              <input
                type="password"
                className="mt-2 w-full rounded-xl border border-neutral-200 px-4 py-3 text-sm"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>

            {error && <div className="text-sm text-red-600">{error}</div>}

            <Button className="w-full rounded-2xl" disabled={loading}>
              {t('auth.create')}
            </Button>
          </form>

          <div className="mt-6 text-center text-sm text-neutral-600">
            Already have an account?{' '}
            <Link className="font-semibold text-neutral-900" to="/login">
              {t('auth.signIn')}
            </Link>
          </div>
        </div>
      </Container>
    </main>
  );
}