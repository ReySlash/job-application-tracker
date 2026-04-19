import { createBrowserRouter } from "react-router";
import AppLayout from "../layouts/AppLayout";
import HomePage from "../pages/HomePage";
import LoginPage from "../pages/LoginPage";
import PublicLayout from "../layouts/PublicLayout";
import DashboardPage from "../pages/DashboardPage";
import ApplicationsPage from "../pages/ApplicationsPage";
import ApplicationDetailsPage from "../pages/ApplicationDetailsPage";
import ApplicationFormPage from "../pages/ApplicationFormPage";
import NotFoundPage from "../pages/NotFoundPage";
import SignupPage from "../pages/SignupPage";
import ProtectedRoute from "../components/ProtectedRoute";
import PublicOnlyRoute from "../components/PublicOnlyRoute";

const router = createBrowserRouter([
  {
    path: "/",
    Component: PublicLayout,
    children: [
      { index: true, Component: HomePage },
      {
        Component: PublicOnlyRoute,
        children: [
          { path: "login", Component: LoginPage },
          { path: "signup", Component: SignupPage },
        ],
      },
    ],
  },
  {
    path: "/",
    Component: ProtectedRoute,
    children: [
      {
        Component: AppLayout,
        children: [
          { path: "dashboard", Component: DashboardPage },
          { path: "applications", Component: ApplicationsPage },
          { path: "applications/new", Component: ApplicationFormPage },
          { path: "applications/:id", Component: ApplicationDetailsPage },
          { path: "applications/:id/edit", Component: ApplicationFormPage },
        ],
      },
    ],
  },
  { path: "*", Component: NotFoundPage },
]);

export default router;
