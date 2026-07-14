import { Form, Input, message } from "antd";
import { useNavigate } from "react-router-dom";
import { useState } from "react";
import { useDispatch } from "react-redux";
import FormItem from "../../components/common/FormItem";
import image4 from "../../assets/image4.png";
import { useLoginMutation } from "../../redux/apiSlices/authSlice";
import { useUser } from "../../provider/User";
import { GoogleOAuthProvider, GoogleLogin } from "@react-oauth/google";
import { getFCMToken, getStoredFCMToken } from "../../utils/fcmService";
import { api } from "../../redux/api/baseApi";
import { useGoogleLoginMutation } from "../../redux/apiSlices/authSlice";
import { setAuthTokens } from "../../utils/tokenService";
import { extractAuthTokens } from "../../utils/authTokens";
import { getMerchantRedirectPath } from "../../utils/authRoles";

const Login = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { refetch } = useUser();
  const [login, { isLoading }] = useLoginMutation();
  const [googleLogin] = useGoogleLoginMutation();
  const [, setGoogleLoading] = useState(false);
  const [isNavigating, setIsNavigating] = useState(false);

  const handleGoogleSuccess = async (credentialResponse) => {
    setGoogleLoading(true);
    try {
      // Clear previous user's Redux cache
      dispatch(api.util.resetApiState());

      let fcmToken = await getFCMToken();
      if (!fcmToken) {
        fcmToken = getStoredFCMToken();
      }

      const googlePayload = {
        idToken: credentialResponse.credential,
        role: "MERCHANT",
        fcmToken: fcmToken, // Always include token
      };

      const data = await googleLogin(googlePayload).unwrap();

      if (data?.data?.accessToken || data?.accessToken) {
        const { accessToken, refreshToken, role } = extractAuthTokens(data);

        if (accessToken) {
          setAuthTokens(accessToken, refreshToken);
          setIsNavigating(true);

          try {
            const profile = await dispatch(
              api.endpoints.profile.initiate(undefined, { forceRefetch: true }),
            ).unwrap();

            try {
              await refetch();
            } catch (e) {
              /* ignore */
            }

            message.success("Google login successful!");
            const finalRole = profile?.user?.role || profile?.role || role;
            navigate(getMerchantRedirectPath(finalRole), { replace: true });
          } catch (error) {
            console.warn("Profile fetch delayed:", error);
            message.success("Google login successful!");
            navigate(getMerchantRedirectPath(role), { replace: true });
          }
        } else {
          message.error("Token not found in response");
          console.error("Token not in response:", data);
        }
      } else {
        message.error(data.message || "Google login failed");
        console.error("Google auth failed:", data);
      }
    } catch (error) {
      console.error("Google login error:", error);
      message.error("An error occurred during Google login");
      setGoogleLoading(false);
      // We don't set isNavigating to false here because if successful, it's navigating away.
      // If it failed before navigation, isNavigating is still false.
    }
  };

  const handleGoogleError = () => {
    message.error("Google login failed. Please try again.");
  };

  const onFinish = async (values) => {
    // Clear previous user's Redux cache
    dispatch(api.util.resetApiState());
    let fcmToken = await getFCMToken();
    if (!fcmToken) {
      fcmToken = getStoredFCMToken();
    }

    const payload = {
      identifier: values.email,
      password: values.password,
      device: "merchant",
      fcmToken: fcmToken,
    };

    try {
      const result = await login(payload).unwrap();
      const { accessToken, refreshToken, role } = extractAuthTokens(result);

      if (!accessToken) {
        message.error("Login succeeded but no access token was returned.");
        return;
      }

      setAuthTokens(accessToken, refreshToken);
      setIsNavigating(true);

      try {
        const profile = await dispatch(
          api.endpoints.profile.initiate(undefined, { forceRefetch: true }),
        ).unwrap();

        try {
          await refetch();
        } catch (e) {
          /* ignore */
        }

        message.success("Login successful!");
        const finalRole = profile?.user?.role || profile?.role || role;
        navigate(getMerchantRedirectPath(finalRole), { replace: true });
      } catch (error) {
        console.warn("Profile fetch delayed:", error);
        message.success("Login successful!");
        navigate(getMerchantRedirectPath(role), { replace: true });
      }
    } catch (err) {
      message.error(err?.data?.message || "Login failed!");
      setIsNavigating(false);
    }
  };

  return (
    <GoogleOAuthProvider clientId="593611426236-c0aqlvlgbg1jnd5lm3tjmnqjurevdljh.apps.googleusercontent.com">
      <div>
        <div className="text-center mb-8">
          <img src={image4} alt="logo" className="h-40 w-40 mx-auto" />
          <h1 className="text-[25px] font-semibold mb-[10px] mt-[20px]">
            Business Dashboard
          </h1>
          <p>Welcome back! Please enter your details.</p>
        </div>

        <Form
          onFinish={onFinish}
          layout="vertical"
          className="flex flex-col gap-4"
        >
          <FormItem name={"email"} label={"Phone/Email"} />

          <Form.Item
            name="password"
            label={<p>Password</p>}
            rules={[{ required: true, message: "Please input your Password!" }]}
          >
            <Input.Password
              placeholder="Enter your password"
              style={{
                height: 45,
                border: "1px solid #3FAE6A",
                borderRadius: "200px",
              }}
            />
          </Form.Item>

          <div className="flex items-center justify-end">
            <a
              className="login-form-forgot text-[#1E1E1E] hover:text-[#3FAE6A] rounded-md font-semibold"
              href="/auth/forgot-password"
            >
              Forgot password
            </a>
          </div>

          <Form.Item style={{ marginBottom: 0 }}>
            <button
              type="submit"
              disabled={isLoading || isNavigating}
              className="flex items-center justify-center bg-[#3FAE6A] rounded-lg"
              style={{
                width: "100%",
                height: 45,
                color: "white",
                fontSize: "18px",
                marginTop: 20,
                borderRadius: "200px",
              }}
            >
              {isLoading || isNavigating ? "Signing in..." : "Sign in"}
            </button>
          </Form.Item>

          {/* Google Login Button */}
          <div className="flex justify-center mb-6 mt-4">
            <GoogleLogin
              onSuccess={handleGoogleSuccess}
              onError={handleGoogleError}
              text="signin_with"
              width="350"
            />
          </div>

          <div className="mt-[20px]">
            <p className="text-center text-[#1E1E1E]">
              Don&apos;t have an account?{" "}
              <a
                href="/auth/signup"
                className="text-[#3FAE6A] hover:text-[#1E1E1E] font-semibold"
              >
                Sign Up
              </a>
            </p>
          </div>
        </Form>
      </div>
    </GoogleOAuthProvider>
  );
};

export default Login;
