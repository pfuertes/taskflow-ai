import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';

async function login(formData: FormData) {
  'use server';

  const email = formData.get('email') as string;
  const password = formData.get('password') as string;

  const supabase = await createClient();
  const { error } = await supabase.auth.signInWithPassword({ email, password });

  if (error) redirect('/login?error=Credenciales incorrectas');

  redirect('/dashboard');
}

interface LoginPageProps {
  searchParams: Promise<{ error?: string }>;
}

export default async function LoginPage({ searchParams }: LoginPageProps) {
  const { error } = await searchParams;

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#0f0f1a]">
      <div className="w-full max-w-sm px-8 py-10 bg-white/5 border border-white/10 rounded-2xl flex flex-col gap-6">
        {/* Title */}
        <div className="text-center">
          <h1 className="text-white font-bold text-xl tracking-tight">
            TaskFlow <span className="text-neutral-400 font-normal">AI</span>
          </h1>
          <p className="text-neutral-500 text-sm mt-1">Inicia sesión en tu cuenta</p>
        </div>

        {/* Error */}
        {error && (
          <p className="text-red-400 text-sm text-center bg-red-500/10 border border-red-500/20 rounded-lg px-3 py-2">
            {error}
          </p>
        )}

        {/* Form */}
        <form action={login} className="flex flex-col gap-4">
          <div className="flex flex-col gap-1.5">
            <label htmlFor="email" className="text-neutral-400 text-xs font-medium">
              Email
            </label>
            <input
              id="email"
              name="email"
              type="email"
              required
              autoComplete="email"
              placeholder="tu@email.com"
              className="bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-white placeholder:text-neutral-600 focus:outline-none focus:border-white/25"
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label htmlFor="password" className="text-neutral-400 text-xs font-medium">
              Contraseña
            </label>
            <input
              id="password"
              name="password"
              type="password"
              required
              autoComplete="current-password"
              placeholder="••••••••"
              className="bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-white placeholder:text-neutral-600 focus:outline-none focus:border-white/25"
            />
          </div>

          <button
            type="submit"
            className="mt-2 bg-green-500 hover:bg-green-600 transition-colors text-white text-sm font-semibold py-2 rounded-lg"
          >
            Iniciar sesión
          </button>
        </form>
      </div>
    </div>
  );
}
