'use client';

import { Suspense, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';

export default function LoginPage() {
  return (
    <Suspense fallback={null}>
      <LoginForm />
    </Suspense>
  );
}

function LoginForm() {
  const [passcode, setPasscode] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const params = useSearchParams();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError('');
    const res = await fetch('/api/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ passcode })
    });
    setLoading(false);
    if (res.ok) {
      router.push(params.get('next') || '/');
      router.refresh();
    } else {
      setError('Incorrect passcode');
    }
  }

  return (
    <main className="min-h-screen flex items-center justify-center bg-paper">
      <form onSubmit={handleSubmit} className="bg-white border border-black/10 rounded-xl p-8 w-full max-w-sm shadow-sm">
        <h1 className="text-xl font-semibold mb-1">Shooting Coach</h1>
        <p className="text-sm text-black/60 mb-6">Enter your passcode to continue.</p>
        <input
          type="password"
          value={passcode}
          onChange={(e) => setPasscode(e.target.value)}
          className="w-full border border-black/20 rounded-lg px-3 py-2 mb-3"
          placeholder="Passcode"
          autoFocus
        />
        {error && <p className="text-sm text-red-600 mb-3">{error}</p>}
        <button
          type="submit"
          disabled={loading}
          className="w-full bg-ink text-white rounded-lg py-2 font-medium disabled:opacity-50"
        >
          {loading ? 'Checking…' : 'Enter'}
        </button>
      </form>
    </main>
  );
}
