import { createBrowserRouter } from "react-router-dom";
import HomePage from "../pages/HomePage.tsx";
import SignInPage from "../pages/auth/SignInPage.tsx";
import SignUpPage from "../pages/auth/SignUpPage.tsx";
import ConfirmPage from "../pages/ConfirmPage.tsx";
import DashboardPage from "../pages/DashboardPage.tsx";
import ItemsPage from "../pages/ItemsPage.tsx";
import LabelsPage from "../pages/LabelsPage.tsx";
import ThankYouPage from "../pages/ThankYouPage.tsx";
import SettingsPage from "../pages/SettingsPage.tsx";
import NotFoundPage from "../pages/404Page.tsx";
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
        path: "/confirm",
        element: <ConfirmPage />,
      },
      {
        path: "/thankyou",
        element: <ThankYouPage />,
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
            path: "/labels",
            element: <LabelsPage />,
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
