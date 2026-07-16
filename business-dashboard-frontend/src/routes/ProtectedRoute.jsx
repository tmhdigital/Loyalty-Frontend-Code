import { Navigate, useLocation } from "react-router-dom";
import { useProfileQuery } from "../redux/apiSlices/authSlice";
import { useUser } from "../provider/User";
import { getAuthToken } from "../utils/tokenService";
import { getProfileRole, isMerchantRole } from "../utils/authRoles";

const PrivateRoute = ({ children }) => {
  const location = useLocation();
  const { isBootstrapping, token: contextToken } = useUser();
  const token = contextToken || getAuthToken();

  const {
    data: profile,
    isLoading,
    isFetching,
    isError,
  } = useProfileQuery(undefined, {
    skip: isBootstrapping || !token,
  });

  if (isBootstrapping) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <img src="/favicon.png" alt="Loading" className="h-20 w-20 mx-auto animate-pulse" />
        </div>
      </div>
    );
  }

  if (!token) {
    return <Navigate to="/auth/login" state={{ from: location }} replace />;
  }

  if (isError) {
    return <Navigate to="/auth/login" state={{ from: location }} replace />;
  }

  if (isLoading || isFetching || !profile) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <img src="/favicon.png" alt="Loading" className="h-20 w-20 mx-auto animate-pulse" />
        </div>
      </div>
    );
  }

  if (isMerchantRole(getProfileRole(profile))) {
    return children;
  }

  return <Navigate to="/auth/login" state={{ from: location }} replace />;
};

export default PrivateRoute;
