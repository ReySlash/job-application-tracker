import { Link, useNavigate } from 'react-router';
import { useAuth } from '../hooks/useAuth';

function NotFoundPage() {
  const navigate = useNavigate();
  const { user, isAuthLoading } = useAuth();
  const primaryDestination = !isAuthLoading && user ? '/dashboard' : '/';
  const primaryLabel = !isAuthLoading && user ? 'Go to dashboard' : 'Go home';

  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-50 px-4 py-12 text-slate-950 dark:bg-slate-950 dark:text-slate-100">
      <section className="w-full max-w-xl rounded-lg border border-gray-200 bg-white p-8 text-center shadow-lg dark:border-slate-700 dark:bg-slate-900">
        <p className="text-sm font-semibold uppercase text-teal-700 dark:text-teal-300">
          404
        </p>
        <h1 className="mt-3 text-4xl font-bold text-slate-900 dark:text-slate-100">
          This page wandered off.
        </h1>
        <p className="mt-4 text-base text-slate-600 dark:text-slate-400">
          The link may be broken, moved, or no longer available.
        </p>

        <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
          <Link
            to={primaryDestination}
            className="inline-flex justify-center rounded-md bg-teal-600 px-5 py-2.5 text-sm font-medium text-white transition-colors hover:bg-teal-500"
          >
            {primaryLabel}
          </Link>
          <button
            type="button"
            onClick={() => navigate(-1)}
            className="rounded-md border border-slate-300 px-5 py-2.5 text-sm font-medium text-slate-700 transition-colors hover:bg-slate-100 dark:border-slate-700 dark:text-slate-200 dark:hover:bg-slate-800"
          >
            Go back
          </button>
        </div>
      </section>
    </main>
  );
}

export default NotFoundPage;
