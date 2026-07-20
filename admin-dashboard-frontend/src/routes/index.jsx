import { createBrowserRouter } from "react-router-dom";
import Auth from "../Layout/Auth/Auth";
import Main from "../Layout/Main/Main";
import Home from "../Pages/Dashboard/Home";
import PrivacyPolicy from "../Pages/Dashboard/PrivacyPolicy";
import TermsAndConditions from "../Pages/Dashboard/TermsAndConditions";
import ChangePassword from "../Pages/Auth/ChangePassword";
import Login from "../Pages/Auth/Login";
import ForgotPassword from "../Pages/Auth/ForgotPassword";
import VerifyOtp from "../Pages/Auth/VerifyOtp";
import NotFound from "../NotFound";
import Notifications from "../Pages/Dashboard/Notifications";
import AdminProfile from "../Pages/Dashboard/AdminProfile/AdminProfile";
import LoyaltyProgram from "../Pages/Dashboard/LoyaltyProgram";
import PackagesPlans from "../components/subscription/Subscription";
import Contact from "../Pages/Dashboard/Contact";
import ResetSuccess from "../Pages/Auth/ResetSuccess";
import SetPassword from "../Pages/Auth/SetPassword";
import TierSystem from "../components/TierSystem/TierSystem";
import PromotionManagement from "../components/promotionManagement/PromotionManagement";
import SalesRepPortal from "../components/salesRepPortal/SalesRepPortal";
import AuditLogs from "../components/auditLogs/AuditLogs";
import ReportingAnalytics from "../components/reportingAnalytics/ReportingAnalytics";
import PushNotifications from "../components/pushNotifications/PushNotifications";
import PrivateRoute from "./ProtectedRoute";
import MerchantManagement from "../components/MerchantManagement/MerchantManagement";
import UserManagement from "../components/userManagement/UserManagement2";
import CustomerManagement2 from "../components/customerManagement/CustomerManagement2";
import SupportMessage from "../components/SupportMessage/SupportMessage";

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
        path: "/merchant-management",
        element: <MerchantManagement />,
      },
      {
        path: "/customer-management",
        element: <CustomerManagement2 />,
      },
      {
        path: "/tier-system",
        element: <TierSystem />,
      },
      {
        path: "/promotion-management",
        element: <PromotionManagement />,
      },
      {
        path: "/sales-rep-portal",
        element: <SalesRepPortal />,
      },
      {
        path: "/audit-logs",
        element: <AuditLogs />,
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
        path: "/loyalty-program",
        element: <LoyaltyProgram />,
      },
      {
        path: "/membership-plans",
        element: <PackagesPlans />,
      },
      {
        path: "/contact",
        element: <Contact />,
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
      // {
      //   path: "/currency-conversion",
      //   element: <CurrencyConversion />,
      // },
      {
        path: "/push-notifications",
        element: <PushNotifications />,
      },
      {
        path: "/support-messages",
        element: <SupportMessage />,
      },
    ],
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
      {
        path: "otp-verification",
        element: <VerifyOtp />,
      },
      {
        path: "reset-success",
        element: <ResetSuccess />,
      },
      {
        path: "set-password",
        element: <SetPassword />,
      },
    ],
  },
  {
    path: "*",
    element: <NotFound />,
  },
],
  {
    basename: "/admin",
  },);

export default router;
