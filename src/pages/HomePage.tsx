import { useState } from 'react';
import { Link, useNavigate } from 'react-router';
import heroImageDark from '../assets/heroImageDark.jpg';
import heroImageLight from '../assets/heroLight.jpg';
import { resetDemoApplications } from '../api/applications';
import { useAuth } from '../hooks/useAuth';
import { queryClient } from '../lib/queryClient';

const featureCards = [
  {
    title: 'Track every role',
    body: 'Keep company, role, status, location, notes, and links in one focused workspace.',
  },
  {
    title: 'Know what needs attention',
    body: 'Surface older applications that are still waiting for a response.',
  },
  {
    title: 'Read your momentum',
    body: 'Use dashboard metrics and activity charts to understand how the search is moving.',
  },
];

function HomePage() {
  const navigate = useNavigate();
  const { isAuthLoading, startDemoSession, user } = useAuth();
  const [isStartingDemo, setIsStartingDemo] = useState(false);
  const [demoError, setDemoError] = useState<string | null>(null);

  const isDemoUser = Boolean(user?.is_anonymous);
  const isPermanentUser = Boolean(user && !user.is_anonymous);

  const handleStartDemo = async () => {
    setDemoError(null);

    if (isPermanentUser) {
      navigate('/dashboard');
      return;
    }

    setIsStartingDemo(true);

    try {
      const userId = isDemoUser && user ? user.id : (await startDemoSession()).userId;
      await resetDemoApplications(userId);
      await queryClient.invalidateQueries({ queryKey: ['applications'] });
      navigate('/dashboard', { replace: true });
    } catch (error) {
      setDemoError(
        error instanceof Error ? error.message : 'Failed to start demo. Please try again.',
      );
    } finally {
      setIsStartingDemo(false);
    }
  };

  const demoButtonLabel = (() => {
    if (isStartingDemo) return 'Starting demo...';
    if (isPermanentUser) return 'Go to dashboard';
    if (isDemoUser) return 'Reset demo data';
    return 'Try live demo';
  })();

  return (
    <div className="bg-slate-50 text-slate-950 dark:bg-slate-950 dark:text-slate-100">
      <section className="relative isolate min-h-[calc(100vh-2.75rem)] overflow-hidden">
        <div className="mx-auto grid min-h-[calc(100vh-2.75rem)] max-w-6xl content-center gap-8 px-4 py-12 lg:grid-cols-[minmax(0,1fr)_minmax(22rem,32rem)] lg:items-center lg:py-16">
          <div className="order-1 mx-auto w-full max-w-sm lg:order-2 lg:max-w-none">
            <img
              src={heroImageLight}
              alt=""
              aria-hidden="true"
              className="mx-auto w-full mask-[radial-gradient(circle_at_top_left,transparent_0,transparent_16%,black_34%),radial-gradient(circle_at_top_right,transparent_0,transparent_16%,black_34%)] mask-intersect opacity-95 md:scale-110 dark:hidden"
            />
            <img
              src={heroImageDark}
              alt=""
              aria-hidden="true"
              className="mx-auto hidden w-full mask-[radial-gradient(circle_at_top_left,transparent_0,transparent_16%,black_34%),radial-gradient(circle_at_top_right,transparent_0,transparent_16%,black_34%)] mask-intersect opacity-95 md:scale-110 dark:block"
            />
          </div>

          <div className="order-2 max-w-3xl md:order-1">
            <p className="text-sm font-semibold text-teal-700 uppercase dark:text-teal-300">
              Private job search dashboard
            </p>
            <h1 className="mt-4 max-w-3xl text-4xl leading-tight font-bold text-slate-950 dark:text-slate-50">
              Track every job application without losing the thread.
            </h1>
            <p className="mt-5 max-w-2xl text-lg text-slate-600 dark:text-slate-300">
              Organize applications, follow-ups, interviews, offers, and outcomes from one focused
              dashboard.
            </p>

            {demoError && (
              <p className="mt-5 max-w-xl rounded border border-red-300 bg-red-100 px-3 py-2 text-sm text-red-700 dark:border-red-800 dark:bg-red-950/60 dark:text-red-200">
                {demoError}
              </p>
            )}

            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <button
                type="button"
                disabled={isStartingDemo || isAuthLoading}
                onClick={handleStartDemo}
                className="rounded-md bg-teal-600 px-5 py-3 text-sm font-medium text-white transition-colors hover:bg-teal-500 disabled:cursor-not-allowed disabled:opacity-70"
              >
                {demoButtonLabel}
              </button>
              <Link
                to="/signup"
                className="rounded-md border border-slate-300/70 bg-white px-5 py-3 text-center text-sm font-medium text-slate-700 transition-colors hover:bg-slate-100 dark:border-slate-700/70 dark:bg-slate-900 dark:text-slate-200 dark:hover:bg-slate-800"
              >
                Create account
              </Link>
            </div>

            <p className="mt-4 text-sm text-slate-500 dark:text-slate-400">
              No signup needed for the demo. A temporary private workspace is created for you.
            </p>
          </div>
        </div>
      </section>

      <section className="border-t border-slate-200/60 bg-white py-14 dark:border-slate-800/70 dark:bg-slate-900">
        <div className="mx-auto grid max-w-6xl gap-6 px-4 md:grid-cols-3">
          {featureCards.map((feature) => (
            <article
              key={feature.title}
              className="rounded-lg border border-slate-200/70 bg-white/80 p-5 shadow-sm shadow-slate-200/50 dark:border-slate-700/60 dark:bg-slate-950/80 dark:shadow-none"
            >
              <h2 className="text-lg font-semibold text-slate-950 dark:text-slate-100">
                {feature.title}
              </h2>
              <p className="mt-3 text-sm leading-6 text-slate-600 dark:text-slate-400">
                {feature.body}
              </p>
            </article>
          ))}
        </div>
      </section>
    </div>
  );
}

export default HomePage;
