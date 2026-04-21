import { useState } from 'react';
import type { SubmitEventHandler } from 'react';
import { Link, useLocation, useNavigate } from 'react-router';
import PasswordVisibilityToggle from '../components/PasswordVisibilityToggle';
import { useAuth } from '../hooks/useAuth';

type LocationState = {
  from?: {
    pathname?: string;
  };
  successMessage?: string;
};

function LoginPage() {
  const { signIn } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const locationState = location.state as LocationState | null;
  const redirectTo = locationState?.from?.pathname ?? '/dashboard';

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit: SubmitEventHandler<HTMLFormElement> = async (event) => {
    event.preventDefault();
    setErrorMessage(null);
    setIsSubmitting(true);

    try {
      await signIn(email, password);
      navigate(redirectTo, { replace: true });
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : 'Failed to sign in');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <section className="mx-auto flex min-h-[calc(100vh-3rem)] max-w-md items-center px-4 py-10">
      <div className="w-full rounded-lg border border-gray-200 bg-white p-6 shadow-lg dark:border-slate-700 dark:bg-slate-900">
        <h1 className="text-3xl font-bold text-slate-900 dark:text-slate-100">Welcome back</h1>
        <p className="mt-2 text-sm text-slate-600 dark:text-slate-400">
          Sign in to manage your private job applications.
        </p>

        {locationState?.successMessage && (
          <p className="mt-4 rounded border border-green-300 bg-green-100 px-3 py-2 text-sm text-green-800 dark:border-green-800 dark:bg-green-950/70 dark:text-green-200">
            {locationState.successMessage}
          </p>
        )}

        {errorMessage && (
          <p className="mt-4 rounded border border-red-300 bg-red-100 px-3 py-2 text-sm text-red-700 dark:border-red-800 dark:bg-red-950/60 dark:text-red-200">
            {errorMessage}
          </p>
        )}

        <form className="mt-6 grid gap-4" onSubmit={handleSubmit}>
          <div className="grid gap-1">
            <label
              className="text-sm font-medium text-slate-700 dark:text-slate-200"
              htmlFor="email"
            >
              Email
            </label>
            <input
              autoComplete="email"
              className="rounded-md border border-gray-300 p-2 focus:ring-2 focus:ring-teal-500 focus:outline-none dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100 dark:placeholder:text-slate-500"
              id="email"
              onChange={(event) => setEmail(event.target.value)}
              required
              type="email"
              value={email}
            />
          </div>

          <div className="grid gap-1">
            <label
              className="text-sm font-medium text-slate-700 dark:text-slate-200"
              htmlFor="password"
            >
              Password
            </label>
            <div className="relative">
              <input
                autoComplete="current-password"
                className="w-full rounded-md border border-gray-300 p-2 pr-11 focus:ring-2 focus:ring-teal-500 focus:outline-none dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100"
                id="password"
                onChange={(event) => setPassword(event.target.value)}
                required
                type={isPasswordVisible ? 'text' : 'password'}
                value={password}
              />
              <PasswordVisibilityToggle
                isVisible={isPasswordVisible}
                onToggle={() => setIsPasswordVisible((currentValue) => !currentValue)}
              />
            </div>
          </div>

          <div className="flex justify-end">
            <Link
              className="text-sm font-medium text-teal-700 hover:underline dark:text-teal-300"
              to="/forgot-password"
            >
              Forgot your password?
            </Link>
          </div>

          <button
            className="rounded-md bg-teal-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-teal-500 disabled:cursor-not-allowed disabled:opacity-70"
            disabled={isSubmitting}
            type="submit"
          >
            {isSubmitting ? 'Signing in...' : 'Sign in'}
          </button>
        </form>

        <p className="mt-5 text-center text-sm text-slate-600 dark:text-slate-400">
          Need an account?{' '}
          <Link
            className="font-medium text-teal-700 hover:underline dark:text-teal-300"
            to="/signup"
          >
            Sign up
          </Link>
        </p>
      </div>
    </section>
  );
}

export default LoginPage;
