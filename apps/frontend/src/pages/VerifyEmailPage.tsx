import { useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router';
import { verifyEmail } from '../api/auth';

type AsyncViewState = {
  status: 'pending' | 'success' | 'error';
  message: string;
};

function VerifyEmailPage() {
  const [searchParams] = useSearchParams();
  const redirectedStatus = searchParams.get('status');
  const redirectedMessage = searchParams.get('message');
  const actionCode = searchParams.get('oobCode');
  const shouldHandleFirebaseCode = !redirectedStatus && Boolean(actionCode);
  const [asyncViewState, setAsyncViewState] = useState<AsyncViewState>({
    status: shouldHandleFirebaseCode ? 'pending' : 'error',
    message: shouldHandleFirebaseCode
      ? 'Checking your verification link...'
      : 'This verification link is invalid or has expired.',
  });

  useEffect(() => {
    if (!shouldHandleFirebaseCode || !actionCode) {
      return;
    }

    void verifyEmail(actionCode)
      .then((result) => {
        setAsyncViewState({
          status: 'success',
          message: result.message,
        });
      })
      .catch((error) => {
        setAsyncViewState({
          status: 'error',
          message: error instanceof Error ? error.message : 'Unable to verify your email.',
        });
      });
  }, [actionCode, shouldHandleFirebaseCode]);

  const viewState = redirectedStatus
    ? {
        status: redirectedStatus === 'success' ? 'success' : 'error',
        message:
          redirectedMessage ??
          (redirectedStatus === 'success'
            ? 'Your email has been verified. You can sign in now.'
            : 'This verification link is invalid or has expired.'),
      }
    : asyncViewState;

  const isSuccess = viewState.status === 'success';
  const isPending = viewState.status === 'pending';

  return (
    <section className="mx-auto flex min-h-[calc(100vh-3rem)] max-w-md items-center px-4 py-10">
      <div className="w-full rounded-lg border border-gray-200 bg-white p-6 shadow-lg dark:border-slate-700 dark:bg-slate-900">
        <h1 className="text-3xl font-bold text-slate-900 dark:text-slate-100">Verify email</h1>
        <p className="mt-2 text-sm text-slate-600 dark:text-slate-400">
          Finish account setup by confirming your email address.
        </p>

        <div
          className={`mt-6 rounded px-4 py-3 text-sm ${
            isPending
              ? 'border border-slate-300 bg-slate-100 text-slate-800 dark:border-slate-700 dark:bg-slate-950/70 dark:text-slate-200'
              : isSuccess
                ? 'border border-green-300 bg-green-100 text-green-800 dark:border-green-800 dark:bg-green-950/70 dark:text-green-200'
                : 'border border-amber-300 bg-amber-100 text-amber-900 dark:border-amber-800 dark:bg-amber-950/60 dark:text-amber-200'
          }`}
        >
          {viewState.message}
        </div>

        <p className="mt-5 text-center text-sm text-slate-600 dark:text-slate-400">
          <Link className="font-medium text-teal-700 hover:underline dark:text-teal-300" to="/login">
            Go to sign in
          </Link>
        </p>
      </div>
    </section>
  );
}

export default VerifyEmailPage;
