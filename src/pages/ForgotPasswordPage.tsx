import { useState } from 'react';
import type { FormEvent } from 'react';
import { Link } from 'react-router';
import { useAuth } from '../hooks/useAuth';

function ForgotPasswordPage() {
  const { requestPasswordReset } = useAuth();
  const [email, setEmail] = useState('');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [infoMessage, setInfoMessage] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setErrorMessage(null);
    setInfoMessage(null);
    setIsSubmitting(true);

    try {
      await requestPasswordReset(email);
      setInfoMessage('If that email is registered, a password reset link has been sent.');
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : 'Failed to send password reset email');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <section className="mx-auto flex min-h-[calc(100vh-3rem)] max-w-md items-center px-4 py-10">
      <div className="w-full rounded-lg border border-gray-200 bg-white p-6 shadow-lg dark:border-slate-700 dark:bg-slate-900">
        <h1 className="text-3xl font-bold text-slate-900 dark:text-slate-100">Reset password</h1>
        <p className="mt-2 text-sm text-slate-600 dark:text-slate-400">
          Enter your account email and we&apos;ll send you a secure link to choose a new password.
        </p>

        {errorMessage && (
          <p className="mt-4 rounded border border-red-300 bg-red-100 px-3 py-2 text-sm text-red-700 dark:border-red-800 dark:bg-red-950/60 dark:text-red-200">
            {errorMessage}
          </p>
        )}

        {infoMessage && (
          <p className="mt-4 rounded border border-green-300 bg-green-100 px-3 py-2 text-sm text-green-800 dark:border-green-800 dark:bg-green-950/70 dark:text-green-200">
            {infoMessage}
          </p>
        )}

        <form className="mt-6 grid gap-4" onSubmit={handleSubmit}>
          <div className="grid gap-1">
            <label className="text-sm font-medium text-slate-700 dark:text-slate-200" htmlFor="email">
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

          <button
            className="rounded-md bg-teal-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-teal-500 disabled:cursor-not-allowed disabled:opacity-70"
            disabled={isSubmitting}
            type="submit"
          >
            {isSubmitting ? 'Sending reset link...' : 'Send reset link'}
          </button>
        </form>

        <p className="mt-5 text-center text-sm text-slate-600 dark:text-slate-400">
          Remembered your password?{' '}
          <Link className="font-medium text-teal-700 hover:underline dark:text-teal-300" to="/login">
            Back to sign in
          </Link>
        </p>
      </div>
    </section>
  );
}

export default ForgotPasswordPage;
