import { createBrowserRouter } from 'react-router';
import AppLayout from '../layouts/AppLayout';
import PublicLayout from '../layouts/PublicLayout';
import ProtectedRoute from '../components/ProtectedRoute';
import PublicOnlyRoute from '../components/PublicOnlyRoute';

// Vite serves from `/` locally, but GitHub Pages deploys this app under the repo name.
const basename = import.meta.env.BASE_URL === '/' ? '/' : import.meta.env.BASE_URL.replace(/\/$/, '');

const hydrateFallbackElement = (
  <div className="flex min-h-screen items-center justify-center bg-slate-50 text-slate-600 dark:bg-slate-950 dark:text-slate-300">
    Loading page...
  </div>
);

function lazyPage(importPage: () => Promise<{ default: React.ComponentType }>) {
  return async () => {
    const module = await importPage();

    // Keep route definitions small while still code-splitting each page.
    return { Component: module.default };
  };
}

const router = createBrowserRouter([
  {
    path: '/',
    Component: PublicLayout,
    hydrateFallbackElement,
    children: [
      { index: true, lazy: lazyPage(() => import('../pages/HomePage')) },
      {
        Component: PublicOnlyRoute,
        children: [
          { path: 'login', lazy: lazyPage(() => import('../pages/LoginPage')) },
          { path: 'signup', lazy: lazyPage(() => import('../pages/SignupPage')) },
          { path: 'forgot-password', lazy: lazyPage(() => import('../pages/ForgotPasswordPage')) },
          { path: 'reset-password', lazy: lazyPage(() => import('../pages/ResetPasswordPage')) },
        ],
      },
    ],
  },
  {
    path: '/',
    Component: ProtectedRoute,
    hydrateFallbackElement,
    children: [
      {
        Component: AppLayout,
        children: [
          { path: 'dashboard', lazy: lazyPage(() => import('../pages/DashboardPage')) },
          { path: 'applications', lazy: lazyPage(() => import('../pages/ApplicationsPage')) },
          { path: 'applications/new', lazy: lazyPage(() => import('../pages/ApplicationFormPage')) },
          { path: 'applications/:id', lazy: lazyPage(() => import('../pages/ApplicationDetailsPage')) },
          { path: 'applications/:id/edit', lazy: lazyPage(() => import('../pages/ApplicationFormPage')) },
        ],
      },
    ],
  },
  { path: '*', hydrateFallbackElement, lazy: lazyPage(() => import('../pages/NotFoundPage')) },
], { basename });

export default router;
