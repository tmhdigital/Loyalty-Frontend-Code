import { Navigate, useLocation } from "react-router-dom";
import { useProfileQuery } from "../redux/apiSlices/authSlice";
import { useUser } from "../provider/User";
import { getAuthToken } from "../utils/tokenService";

const allowedRoles = [
  "ADMIN",
  "SUPER_ADMIN",
  "ADMIN_REP",
  "ADMIN_SELL",
  "VIEW_ADMIN",
];

const AuthLoading = () => (
  <div className="flex items-center justify-center h-screen">
    <div className="text-center">
      <img src="/favicon.png" alt="Loading" className="h-20 w-20 mx-auto animate-pulse" />
    </div>
  </div>
);

const PrivateRoute = ({ children }) => {
  const location = useLocation();
  const { isAuthReady } = useUser();
  const token = getAuthToken();

  const {
    data: profile,
    isLoading,
    isError,
  } = useProfileQuery(undefined, {
    skip: !isAuthReady || !token,
  });

  if (!isAuthReady) {
    return <AuthLoading />;
  }

  if (!token) {
    return <Navigate to="/auth/login" state={{ from: location }} replace />;
  }

  if (isLoading) {
    return <AuthLoading />;
  }

  if (isError) {
    return <Navigate to="/auth/login" state={{ from: location }} replace />;
  }

  if (allowedRoles.includes(profile?.role)) {
    return children;
  }

  return <Navigate to="/auth/login" state={{ from: location }} replace />;
};

export default PrivateRoute;
