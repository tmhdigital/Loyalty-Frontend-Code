import { Outlet, useLocation } from "react-router-dom";
import loginImage from "../../assets/sideimage.png";
import forgotImage from "../../assets/forgot-img.png";
import verifyEmail from "../../assets/checkEmail.png";
import setImage from "../../assets/set-password.png";
import resetSuccess from "../../assets/reset-success.png";
import signUp from "../../assets/signup.png";
import otpVerification from "../../assets/otp-verification.png";
import shopInfo from "../../assets/shop-info.png";

const Auth = () => {
  const location = useLocation();

  // Map routes to images
  const imageMap = {
    "/auth/login": loginImage,
    "/auth/forgot-password": forgotImage,
    "/auth/verify-email": verifyEmail,
    "/auth/set-password": setImage,
    "/auth/reset-success": resetSuccess,
    "/auth/signup": signUp,
    "/auth/otp-verification": otpVerification,
    "/auth/shop-info": shopInfo,
  };

  // Pick the correct image or a default one
  const currentImage = imageMap[location.pathname] || forgotImage;

  return (
    <div
      className="w-full flex items-center justify-between relative overflow-hidden"
      style={{ height: "100vh" }}
    >
      {/* Background image */}
      <div style={{ backgroundColor: "#ffffff" }}></div>

      {/* Left side - Dynamic image */}
      <div className="w-1/2 h-full hidden md:flex items-center justify-center lg:relative lg:left-[50px] xl:left-[100px] z-10">
        <img
          src={currentImage}
          alt="Authentication visual"
          className="h-full w-full object-contain"
          style={{
            maxHeight: "90vh",
            padding: "20px",
          }}
        />
      </div>

      {/* Right side - Auth form */}
      <div className="md:w-1/2 w-full flex justify-center lg:justify-end px-4 lg:relative lg:right-[50px] xl:right-[100px] z-10">
        <div
          style={{
            background: "#FCFCFC3B",
            borderRadius: 15,
            maxWidth: 500,
            width: "100%",
            border: "1px solid #198248",
            backdropFilter: "blur(10px)",
            overflow: "hidden",
          }}
          className="shadow-xl"
        >
          <div
            style={{
              padding: 30,
              paddingBottom: 40,
              maxHeight: "95vh",
              overflowY: "auto",
            }}
          >
            <Outlet />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Auth;
