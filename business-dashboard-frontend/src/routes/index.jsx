import { createBrowserRouter } from "react-router-dom";
import Auth from "../Layout/Auth/Auth";
import Main from "../Layout/Main/Main";
import ChangePassword from "../Pages/Auth/ChangePassword";
import Login from "../Pages/Auth/Login";
import SignUp from "../Pages/Auth/SignUp";
import ShopInfo from "../Pages/Auth/ShopInfo";
import ForgotPassword from "../Pages/Auth/ForgotPassword";
import ResetSuccess from "../Pages/Auth/ResetSuccess";
import SetPassword from "../Pages/Auth/SetPassword";
import VerifyOtp from "../Pages/Auth/VerifyOtp";
import Notifications from "../Pages/Dashboard/Notifications";
// import OtpVerification from "../Pages/Auth/OtpVerification";
import AdminProfile from "../Pages/Dashboard/AdminProfile/AdminProfile";
import Home from "../Pages/Dashboard/Home";
import CustomerManagement from "../components/customerManagement/customerManagement";
import TierSystem from "../components/TierSystem/TierSystem";
import PromotionManagement from "../components/promotionManagement/PromotionManagement";
import ReportingAnalytics from "../components/reportingAnalytics/ReportingAnalytics";
import UserManagement from "../components/userManagement/UserManagement";
import PrivacyPolicy from "../Pages/Dashboard/PrivacyPolicy";
import TermsAndConditions from "../Pages/Dashboard/TermsAndCondition";
import NotFound from "../NotFound";
import PrivateRoute from "./ProtectedRoute";
import SellManagement from "../components/sellManagement/SellManagement";
import Success from "../components/common/Success";
import Failed from "../components/common/Failed";

const router = createBrowserRouter([
  {
    element: (
      <PrivateRoute>
        <Main />
      </PrivateRoute>
    ),
    // path: "/",
    // element: <Main />,

    children: [
      {
        path: "/",
        element: <Home />,
      },
      {
        path: "/sell-management",
        element: <SellManagement />,
      },
      {
        path: "/customer-management",
        element: <CustomerManagement />,
      },
      {
        path: "/point-tyre-system",
        element: <TierSystem />,
      },
      {
        path: "/promotion-management",
        element: <PromotionManagement />,
      },
      {
        path: "/user-management",
        element: <UserManagement />,
      },
      {
        path: "/reporting-analytics",
        element: <ReportingAnalytics />,
      },
      {
        path: "/privacy-policy",
        element: <PrivacyPolicy />,
      },
      {
        path: "/terms-and-conditions",
        element: <TermsAndConditions />,
      },
      {
        path: "/change-password",
        element: <ChangePassword />,
      },
      {
        path: "/profile",
        element: <AdminProfile />,
      },
      {
        path: "/notification",
        element: <Notifications />,
      },
    ],
  },
  {
    path: "/success",
    element: <Success />,
  },
  {
    path: "/failed",
    element: <Failed />,
  },
  {
    path: "/auth",
    element: <Auth />,
    children: [
      {
        path: "/auth",
        element: <Login />,
      },
      {
        path: "login",
        element: <Login />,
      },
      {
        path: "forgot-password",
        element: <ForgotPassword />,
      },
      // {
      //   path: "verify-otp",
      //   element: <VerifyOtp />,
      // },
      {
        path: "reset-success",
        element: <ResetSuccess />,
      },
      {
        path: "set-password",
        element: <SetPassword />,
      },
      {
        path: "signup",
        element: <SignUp />,
      },
      {
        path: "otp-verification",
        element: <VerifyOtp />,
      },
      {
        path: "shop-info",
        element: <ShopInfo />,
      },
    ],
  },
  {
    path: "*",
    element: <NotFound />,
  },
],
  {
    basename: "/",
  },
);

export default router;
