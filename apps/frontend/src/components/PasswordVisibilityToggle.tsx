type Props = {
  isVisible: boolean;
  onToggle: () => void;
};

// Keep the icons inline here so the auth forms stay readable without adding an icon package.
function EyeIcon() {
  return (
    <svg aria-hidden="true" className="h-5 w-5" fill="none" viewBox="0 0 24 24">
      <path
        d="M2 12s4-8 10-8 10 8 10 8-4 8-10 8S2 12 2 12z"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="1.8"
      />
      <circle cx="12" cy="12" r="3" stroke="currentColor" strokeWidth="1.8" />
    </svg>
  );
}

function EyeOffIcon() {
  return (
    <svg aria-hidden="true" className="h-5 w-5" fill="none" viewBox="0 0 24 24">
      <path
        d="M3 3L21 21M10.58 10.58A2 2 0 0012 14a2 2 0 001.42-.58M9.88 5.09A9.77 9.77 0 0112 4c5 0 9 4 10 8a11.8 11.8 0 01-4.35 5.94M6.1 6.1A11.77 11.77 0 002 12c1 4 5 8 10 8a9.77 9.77 0 004.23-.94"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="1.8"
      />
    </svg>
  );
}

function PasswordVisibilityToggle({ isVisible, onToggle }: Props) {
  return (
    <button
      aria-label={isVisible ? 'Hide password' : 'Show password'}
      className="absolute inset-y-0 right-0 flex items-center px-3 text-slate-500 transition-colors hover:text-slate-700 focus:outline-none dark:text-slate-400 dark:hover:text-slate-200"
      onClick={onToggle}
      type="button"
    >
      {isVisible ? <EyeOffIcon /> : <EyeIcon />}
    </button>
  );
}

export default PasswordVisibilityToggle;
