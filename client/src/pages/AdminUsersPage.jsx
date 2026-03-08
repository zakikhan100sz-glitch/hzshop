import { useState } from 'react';
import Container from '../components/Container';
import Button from '../components/Button';
import { api } from '../app/api';
import { useStore } from '../app/store';

export default function AdminUsersPage() {
  const { user } = useStore();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState('');
  const [err, setErr] = useState('');

  // Only owner can see/use this page
  if (!user || user.role !== 'owner') {
    return (
      <Container className="py-10">
        <div className="rounded-2xl border border-neutral-200 bg-white p-6">
          <div className="text-lg font-bold">Access denied</div>
          <p className="mt-2 text-sm text-neutral-600">Only the owner can create new admins.</p>
        </div>
      </Container>
    );
  }

  async function onSubmit(e) {
    e.preventDefault();
    setErr('');
    setMsg('');

    if (!name.trim() || !email.trim() || password.length < 8) {
      setErr('Please enter name, email and a password (8+ characters).');
      return;
    }

    try {
      setLoading(true);

      // api helper should already include Authorization header (token)
      await api('/api/admin/users', {
        method: 'POST',
        auth: true,
        body: {
          name: name.trim(),
          email: email.trim(),
          password
        }
      });

      setMsg('Admin created successfully.');
      setName('');
      setEmail('');
      setPassword('');
    } catch (e2) {
      setErr(e2?.message || 'Failed to create admin.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <Container className="py-10">
      <div className="rounded-2xl border border-neutral-200 bg-white p-6 shadow-soft">
        <div className="text-xl font-extrabold">Create New Admin</div>
        <p className="mt-2 text-sm text-neutral-600">
          Add another admin who can log in and manage products.
        </p>

        <form className="mt-6 grid gap-4 max-w-lg" onSubmit={onSubmit}>
          <div>
            <label className="text-sm font-semibold">Full name</label>
            <input
              className="mt-2 w-full rounded-xl border border-neutral-200 bg-white px-4 py-3 text-sm outline-none focus:border-neutral-400"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Admin Two"
            />
          </div>

          <div>
            <label className="text-sm font-semibold">Email</label>
            <input
              className="mt-2 w-full rounded-xl border border-neutral-200 bg-white px-4 py-3 text-sm outline-none focus:border-neutral-400"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="admin2@gmail.com"
              type="email"
            />
          </div>

          <div>
            <label className="text-sm font-semibold">Password</label>
            <input
              className="mt-2 w-full rounded-xl border border-neutral-200 bg-white px-4 py-3 text-sm outline-none focus:border-neutral-400"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Minimum 8 characters"
              type="password"
            />
          </div>

          {err && <div className="rounded-xl bg-red-50 p-3 text-sm text-red-700">{err}</div>}
          {msg && <div className="rounded-xl bg-green-50 p-3 text-sm text-green-700">{msg}</div>}

          <Button type="submit" className="rounded-2xl" disabled={loading}>
            {loading ? 'Creating...' : 'Create Admin'}
          </Button>
        </form>
      </div>
    </Container>
  );
}