type Props = {
  onClose: () => void;
  signOut: () => Promise<void>;
  isSigningOut: boolean;
  error: string | null;
};

function SignoutDialog(props: Props) {
  const { onClose, signOut, isSigningOut, error } = props;
  return (
    <dialog
      className="fixed inset-0 z-50 m-auto w-full max-w-sm rounded-lg border border-gray-300 bg-white p-6 text-slate-900 shadow-lg backdrop:bg-black/40 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100"
      open
    >
      <div className="flex flex-col gap-4">
        <p>Are you sure you want to sign out?</p>
        {error && (
          <p
            className="rounded border border-red-300 bg-red-100 px-3 py-2 text-sm text-red-700 dark:border-red-800 dark:bg-red-950/60 dark:text-red-200"
            role="alert"
          >
            {error}
          </p>
        )}
        <div className="flex justify-end gap-2">
          <button
            onClick={onClose}
            disabled={isSigningOut}
            className="rounded border border-slate-300 px-4 py-2 text-slate-700 hover:bg-gray-200 disabled:cursor-not-allowed disabled:opacity-70 dark:border-slate-700 dark:text-slate-200 dark:hover:bg-slate-800"
          >
            Cancel
          </button>
          <button
            onClick={signOut}
            className="rounded bg-red-600 px-4 py-2 text-white hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-70"
            disabled={isSigningOut}
          >
            {isSigningOut ? (
              <span className="inline-block h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent"></span>
            ) : (
              'Sign Out'
            )}
          </button>
        </div>
      </div>
    </dialog>
  );
}

export default SignoutDialog;
