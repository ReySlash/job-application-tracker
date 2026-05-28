import { useState } from 'react';
import type { SubmitEventHandler } from 'react';
import { Link, useNavigate } from 'react-router';
import { useAuth } from '../hooks/useAuth';

function ResetPasswordPage() {
  const { isPasswordRecovery, updatePassword } = useAuth();
  const navigate = useNavigate();
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit: SubmitEventHandler<HTMLFormElement> = async (event) => {
    event.preventDefault();
    setErrorMessage(null);

    if (password !== confirmPassword) {
      setErrorMessage('Passwords do not match');
      return;
    }

    setIsSubmitting(true);

    try {
      await updatePassword(password);
      navigate('/login', {
        replace: true,
        state: { successMessage: 'Password updated. Sign in with your new password.' },
      });
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : 'Failed to update password');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <section className="mx-auto flex min-h-[calc(100vh-3rem)] max-w-md items-center px-4 py-10">
      <div className="w-full rounded-lg border border-gray-200 bg-white p-6 shadow-lg dark:border-slate-700 dark:bg-slate-900">
        <h1 className="text-3xl font-bold text-slate-900 dark:text-slate-100">Choose a new password</h1>
        <p className="mt-2 text-sm text-slate-600 dark:text-slate-400">
          Create a new password for your account to finish the recovery flow.
        </p>

        {!isPasswordRecovery ? (
          <div className="mt-6 rounded border border-amber-300 bg-amber-100 px-4 py-3 text-sm text-amber-900 dark:border-amber-800 dark:bg-amber-950/60 dark:text-amber-200">
            This password reset link is invalid or has expired. Request a new one to continue.
            <div className="mt-3">
              <Link className="font-medium text-teal-700 hover:underline dark:text-teal-300" to="/forgot-password">
                Request a new reset link
              </Link>
            </div>
          </div>
        ) : (
          <>
            {errorMessage && (
              <p className="mt-4 rounded border border-red-300 bg-red-100 px-3 py-2 text-sm text-red-700 dark:border-red-800 dark:bg-red-950/60 dark:text-red-200">
                {errorMessage}
              </p>
            )}

            <form className="mt-6 grid gap-4" onSubmit={handleSubmit}>
              <div className="grid gap-1">
                <label className="text-sm font-medium text-slate-700 dark:text-slate-200" htmlFor="password">
                  New password
                </label>
                <input
                  autoComplete="new-password"
                  className="rounded-md border border-gray-300 p-2 focus:ring-2 focus:ring-teal-500 focus:outline-none dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100"
                  id="password"
                  minLength={6}
                  onChange={(event) => setPassword(event.target.value)}
                  required
                  type="password"
                  value={password}
                />
              </div>

              <div className="grid gap-1">
                <label className="text-sm font-medium text-slate-700 dark:text-slate-200" htmlFor="confirm-password">
                  Confirm password
                </label>
                <input
                  autoComplete="new-password"
                  className="rounded-md border border-gray-300 p-2 focus:ring-2 focus:ring-teal-500 focus:outline-none dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100"
                  id="confirm-password"
                  minLength={6}
                  onChange={(event) => setConfirmPassword(event.target.value)}
                  required
                  type="password"
                  value={confirmPassword}
                />
              </div>

              <button
                className="rounded-md bg-teal-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-teal-500 disabled:cursor-not-allowed disabled:opacity-70"
                disabled={isSubmitting}
                type="submit"
              >
                {isSubmitting ? 'Updating password...' : 'Update password'}
              </button>
            </form>
          </>
        )}
      </div>
    </section>
  );
}

export default ResetPasswordPage;
