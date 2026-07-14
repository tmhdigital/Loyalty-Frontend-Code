import { Form, Input, message } from "antd";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import image4 from "../../assets/image4.png";
import {
  useGoogleLoginMutation,
  useRegisterMutation,
} from "../../redux/apiSlices/authSlice";
import PhoneInput from "react-phone-number-input";
import "react-phone-number-input/style.css";
import { GoogleOAuthProvider, GoogleLogin } from "@react-oauth/google";
import { setAuthTokens } from "../../utils/tokenService";

const SignUp = () => {
  const navigate = useNavigate();
  const [registerUser, { isLoading }] = useRegisterMutation();
  const [googleLogin] = useGoogleLoginMutation();
  const [phoneValue, setPhoneValue] = useState("");
  const [, setGoogleLoading] = useState(false);

  const handleGoogleSuccess = async (credentialResponse) => {
    setGoogleLoading(true);
    try {
      const data = await googleLogin({
        idToken: credentialResponse.credential,
        role: "MERCHANT",
      }).unwrap();

      if (data?.data?.accessToken) {
        message.success("Google signup successful!");

        // Save token from response - check various possible field names
        const token = data.data?.accessToken || data.accessToken || data.token;
        if (token) {
          setAuthTokens(
            token,
            data.data?.refreshToken || data.refreshToken,
          );

          // Add delay and full page reload to ensure token is recognized
          setTimeout(() => {
            navigate("/", { replace: true });
          }, 500);
        } else {
          message.error("Token not found in response");
          console.error("Token not in response:", data);
        }
      } else {
        message.error(data.message || "Google signup failed");
        console.error("Google auth failed:", data);
      }
    } catch (error) {
      console.error("Google signup error:", error);
      message.error("An error occurred during Google signup");
    } finally {
      setGoogleLoading(false);
    }
  };

  const handleGoogleError = () => {
    message.error("Google signup failed. Please try again.");
  };

  const onFinish = async (values) => {
    const payload = {
      firstName: values.name,
      phone: values.phone,
      email: values.email,
      password: values.password,
      role: "MERCHANT",
    };

    try {
      await registerUser(payload).unwrap();
      message.success("Registration successful. Please verify OTP.");
      navigate(
        `/auth/otp-verification?phone=${encodeURIComponent(
          values.phone,
        )}&email=${encodeURIComponent(values.email)}&type=${encodeURIComponent(
          "signup",
        )}`,
      );
    } catch (err) {
      const errorMsg =
        err?.data?.errorMessages[0]?.message || "Registration failed";
      message.error(errorMsg);
    }
  };

  return (
    <GoogleOAuthProvider clientId="593611426236-c0aqlvlgbg1jnd5lm3tjmnqjurevdljh.apps.googleusercontent.com">
      <div>
        {/* Header */}
        <div className="text-center mb-2">
          <img src={image4} alt="logo" className="h-20 w-20 mx-auto" />
          <h1 className="text-[25px] font-semibold mb-[10px] mt-[20px]">
            Business Dashboard
          </h1>
          <p>Create an account</p>
        </div>

        {/* Form */}
        <Form
          onFinish={onFinish}
          layout="vertical"
          className="flex flex-col gap-2"
        >
          {/* Name */}
          <Form.Item
            name="name"
            label={<p>Name</p>}
            rules={[{ required: true, message: "Please enter your name" }]}
          >
            <Input
              placeholder="Enter your name"
              style={{
                height: 45,
                border: "1px solid #3FAE6A",
                borderRadius: "200px",
              }}
            />
          </Form.Item>

          {/* Email */}
          <Form.Item
            name="email"
            label={<p>Email</p>}
            rules={[
              { required: true, message: "Please enter your email" },
              {
                validator: (_, value) => {
                  if (!value) return Promise.resolve();
                  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
                  if (!emailRegex.test(value)) {
                    return Promise.reject(
                      new Error("Please enter a valid email address"),
                    );
                  }
                  return Promise.resolve();
                },
              },
            ]}
          >
            <Input
              placeholder="Enter your email"
              style={{
                height: 45,
                border: "1px solid #3FAE6A",
                borderRadius: "200px",
              }}
            />
          </Form.Item>

          {/* Phone Number */}
          <Form.Item
            name="phone"
            label={<p>Phone Number</p>}
            rules={[
              { required: true, message: "Please enter your phone number" },
              {
                validator: (_, value) => {
                  if (!value) return Promise.resolve();
                  // Validate that it's a valid phone number format
                  if (!/^\+?[1-9]\d{1,14}$/.test(value.replace(/\D/g, ""))) {
                    return Promise.reject(
                      new Error("Please enter a valid phone number"),
                    );
                  }
                  return Promise.resolve();
                },
              },
            ]}
          >
            <PhoneInput
              international
              countryCallingCodeEditable={false}
              countries={["PK", "AE", "OM", "QA", "KW", "BH", "SA", "BD", "GB"]}
              defaultCountry="PK"
              value={phoneValue}
              onChange={setPhoneValue}
              placeholder="Enter your phone number"
              className="phone-input-no-focus"
              style={{
                height: 45,
                border: "1px solid #3FAE6A",
                borderRadius: "200px",
                paddingLeft: "12px",
                fontSize: "14px",
                fontFamily: "inherit",
              }}
            />
          </Form.Item>

          {/* Password */}
          <Form.Item
            name="password"
            label={<p>Password</p>}
            validateTrigger="onChange"
            rules={[
              { required: true, message: "Please enter your password" },
              {
                validator(_, value) {
                  if (!value) return Promise.resolve();

                  const hasUpperCase = /[A-Z]/.test(value);
                  const hasLowerCase = /[a-z]/.test(value);
                  const hasNumber = /\d/.test(value);
                  const hasSpecialChar =
                    /[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]/.test(value);

                  if (
                    hasUpperCase &&
                    hasLowerCase &&
                    hasNumber &&
                    hasSpecialChar
                  ) {
                    return Promise.resolve();
                  }

                  const missing = [];
                  if (!hasUpperCase) missing.push("uppercase letter");
                  if (!hasLowerCase) missing.push("lowercase letter");
                  if (!hasNumber) missing.push("number");
                  if (!hasSpecialChar) missing.push("special character");

                  return Promise.reject(
                    new Error(
                      `Password must contain at least one ${missing.join(
                        ", one ",
                      )}`,
                    ),
                  );
                },
              },
            ]}
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

          {/* Confirm Password */}
          <Form.Item
            name="confirmPassword"
            label={<p>Confirm Password</p>}
            dependencies={["password"]}
            rules={[
              { required: true, message: "Please confirm your password" },
              ({ getFieldValue }) => ({
                validator(_, value) {
                  if (!value || getFieldValue("password") === value) {
                    return Promise.resolve();
                  }
                  return Promise.reject(new Error("Passwords do not match"));
                },
              }),
            ]}
          >
            <Input.Password
              placeholder="Confirm your password"
              style={{
                height: 45,
                border: "1px solid #3FAE6A",
                borderRadius: "200px",
              }}
            />
          </Form.Item>

          {/* Submit button */}
          <Form.Item style={{ marginBottom: 0 }}>
            <button
              htmlType="submit"
              type="submit"
              disabled={isLoading}
              style={{
                width: "100%",
                height: 45,
                color: "white",
                fontWeight: "400px",
                fontSize: "18px",
                marginTop: 20,
                borderRadius: "200px",
              }}
              className="flex items-center justify-center bg-[#3FAE6A] rounded-lg"
            >
              {isLoading ? "Signing up..." : "Sign Up"}
            </button>
          </Form.Item>
        </Form>

        {/* Divider */}
        {/* <div className="relative my-6">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-gray-300"></div>
          </div>
          <div className="relative flex justify-center text-sm">
            <span className="px-2 bg-white text-gray-500">Or</span>
          </div>
        </div> */}

        {/* Google Login Button */}
        <div className="flex justify-center mb-6 mt-4">
          <GoogleLogin
            onSuccess={handleGoogleSuccess}
            onError={handleGoogleError}
            text="signup_with"
            width="350"
          />
        </div>

        {/* Footer */}
        <div className="mt-[20px]">
          <p className="text-center text-[#1E1E1E]">
            Already have an account?{" "}
            <a
              href="/auth/login"
              className="text-[#3FAE6A] hover:text-[#1E1E1E] font-semibold"
            >
              Log in
            </a>
          </p>
        </div>
      </div>
    </GoogleOAuthProvider>
  );
};

export default SignUp;
