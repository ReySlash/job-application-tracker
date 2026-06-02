import { Link, useLocation } from 'react-router';

type LocationState = {
  email?: string;
};

function SignupSuccessPage() {
  const location = useLocation();
  const locationState = location.state as LocationState | null;

  return (
    <section className="mx-auto flex min-h-[calc(100vh-3rem)] max-w-md items-center px-4 py-10">
      <div className="w-full rounded-lg border border-gray-200 bg-white p-6 shadow-lg dark:border-slate-700 dark:bg-slate-900">
        <h1 className="text-3xl font-bold text-slate-900 dark:text-slate-100">Check your email</h1>
        <p className="mt-2 text-sm text-slate-600 dark:text-slate-400">
          Your account was created successfully. Verify your email before signing in.
        </p>

        <div className="mt-6 rounded border border-green-300 bg-green-100 px-4 py-3 text-sm text-green-800 dark:border-green-800 dark:bg-green-950/70 dark:text-green-200">
          {locationState?.email
            ? `We sent a verification link to ${locationState.email}.`
            : 'We sent you a verification link.'}
        </div>

        <p className="mt-5 text-center text-sm text-slate-600 dark:text-slate-400">
          Already verified?{' '}
          <Link className="font-medium text-teal-700 hover:underline dark:text-teal-300" to="/login">
            Sign in
          </Link>
        </p>
      </div>
    </section>
  );
}

export default SignupSuccessPage;
