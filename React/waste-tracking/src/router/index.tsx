import { createBrowserRouter } from "react-router-dom";
import HomePage from "../pages/HomePage.tsx";
import SignInPage from "../pages/auth/SignInPage.tsx";
import SignUpPage from "../pages/auth/SignUpPage.tsx";
import ResetPasswordPage from "../pages/auth/ResetPasswordPage.tsx";
import ConfirmPage from "../pages/ConfirmPage.tsx";
import DashboardPage from "../pages/DashboardPage.tsx";
import ItemsPage from "../pages/ItemsPage.tsx";
import DialogPage from "../pages/DialogPage.tsx";
import SettingsPage from "../pages/settings/SettingsPage.tsx";
import NotFoundPage from "../pages/404Page.tsx";
import SubscriptionPage from "../pages/subscription/SubscriptionPage.tsx";
import AuthProtectedRoute from "./AuthProtectedRoute.tsx";
import Providers from "../Providers.tsx";

const router = createBrowserRouter([
  // I recommend you reflect the routes here in the pages folder
  {
    path: "/",
    element: <Providers />,
    children: [
      // Public routes
      {
        path: "/",
        element: <HomePage />,
      },
      {
        path: "/auth/sign-in",
        element: <SignInPage />,
      },
      {
        path: "/auth/sign-up",
        element: <SignUpPage />,
      },
      {
        path: "/auth/reset-password",
        element: <ResetPasswordPage />,
      },
      {
        path: "/confirm",
        element: <ConfirmPage />,
      },
      {
        path: "/dialog",
        element: <DialogPage />,
      },
      {
        path: "/subscription",
        element: <SubscriptionPage />,
      },
      // Auth Protected routes
      {
        path: "/",
        element: <AuthProtectedRoute />,
        children: [
          {
            path: "/dashboard",
            element: <DashboardPage />,
          },
          {
            path: "/items",
            element: <ItemsPage />,
          },
          {
            path: "/settings",
            element: <SettingsPage />,
          },
        ],
      },
    ],
  },
  {
    path: "*",
    element: <NotFoundPage />,
  },
]);

export default router;
