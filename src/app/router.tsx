import { createHashRouter } from 'react-router';
import AppLayout from '../layouts/AppLayout';
import PublicLayout from '../layouts/PublicLayout';
import ProtectedRoute from '../components/ProtectedRoute';
import PublicOnlyRoute from '../components/PublicOnlyRoute';

function lazyPage(importPage: () => Promise<{ default: React.ComponentType }>) {
  return async () => {
    const module = await importPage();

    return { Component: module.default };
  };
}

const router = createHashRouter([
  {
    path: '/',
    Component: PublicLayout,
    children: [
      { index: true, lazy: lazyPage(() => import('../pages/HomePage')) },
      {
        Component: PublicOnlyRoute,
        children: [
          { path: 'login', lazy: lazyPage(() => import('../pages/LoginPage')) },
          { path: 'signup', lazy: lazyPage(() => import('../pages/SignupPage')) },
        ],
      },
    ],
  },
  {
    path: '/',
    Component: ProtectedRoute,
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
  { path: '*', lazy: lazyPage(() => import('../pages/NotFoundPage')) },
]);

export default router;
