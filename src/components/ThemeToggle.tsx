import { useTheme } from '../hooks/useTheme';
import darkModeIcon from '../assets/darkModeIcon.svg';
import lightModeIcon from '../assets/lightModeIcon.svg';

function ThemeToggle() {
  const { theme, toggleTheme } = useTheme();
  const isDark = theme === 'dark';

  return (
    <button
      type="button"
      onClick={toggleTheme}
      className="rounded-md border border-slate-300 bg-white px-3 py-2 text-sm font-medium text-slate-700 shadow-sm transition-colors hover:bg-slate-100 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100 dark:hover:bg-slate-800"
      aria-label={`Switch to ${isDark ? 'light' : 'dark'} mode`}
    >
      <img
        className={`h-5 w-5 ${isDark ? 'brightness-0 invert' : ''}`}
        src={isDark ? lightModeIcon : darkModeIcon}
        alt=""
      />
    </button>
  );
}

export default ThemeToggle;
