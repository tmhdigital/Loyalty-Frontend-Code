import { Form } from "antd";
import { useState, useEffect } from "react";
import OTPInput from "react-otp-input";
import { useNavigate } from "react-router-dom";
import mailIcon from "../../assets/mail.png";
import { ArrowLeft } from "lucide-react";
import {
  useOtpVerifyMutation,
  useResendOtpMutation,
} from "../../redux/apiSlices/authSlice";
import Swal from "sweetalert2";
import { setAuthToken, setResetToken } from "../../utils/tokenService";

const VerifyOtp = () => {
  const navigate = useNavigate();
  const [otp, setOtp] = useState("");
  const [timeLeft, setTimeLeft] = useState(180); // 3 minutes in seconds
  const [isExpired, setIsExpired] = useState(false);
  const searchParams = new URLSearchParams(location.search);
  const phone = searchParams.get("phone") || "";
  const email = searchParams.get("email") || "";
  const identifier = searchParams.get("identifier") || phone || email;
  const type = searchParams.get("type");
  const [otpVerify, { isLoading }] = useOtpVerifyMutation();
  const [resendOtp, { isLoading: isResending }] = useResendOtpMutation();

  // Timer effect
  useEffect(() => {
    if (timeLeft <= 0) {
      setIsExpired(true);
      return;
    }

    const timer = setInterval(() => {
      setTimeLeft((prev) => prev - 1);
    }, 1000);

    return () => clearInterval(timer);
  }, [timeLeft]);

  const onFinish = async () => {
    if (isExpired) {
      Swal.fire({
        icon: "error",
        title: "OTP Expired",
        text: "Your OTP has expired. Please request a new one.",
      });
      return;
    }

    if (otp.length !== 6) {
      Swal.fire({
        icon: "error",
        title: "Invalid OTP",
        text: "Please enter a valid 6-digit OTP",
      });
      return;
    }

    try {
      const response = await otpVerify({
        identifier,
        oneTimeCode: parseInt(otp, 10),
      }).unwrap();

      // Store tokens for password reset flow
      if (response?.accessToken) {
        setAuthToken(response.accessToken);
      }
      if (response?.resetToken) {
        setResetToken(response.resetToken);
      }

      Swal.fire({
        icon: "success",
        title: "OTP Verified",
        text: "Your OTP has been verified successfully",
        timer: 1500,
        showConfirmButton: false,
      });

      setTimeout(() => {
        if (type === "signup") {
          navigate(
            `/auth/shop-info?phone=${encodeURIComponent(
              phone,
            )}&email=${encodeURIComponent(email)}`,
          );
          return;
        }
        navigate(
          `/auth/set-password?identifier=${encodeURIComponent(identifier)}`,
        );
      }, 1500);
    } catch (error) {
      const errorMessage =
        error?.data?.message || error?.message || "Failed to verify OTP";
      Swal.fire({
        icon: "error",
        title: "Verification Failed",
        text: errorMessage,
      });
    }
  };

  const handleResendEmail = async () => {
    if (!identifier) {
      Swal.fire({
        icon: "error",
        title: "Error",
        text: "Email or phone is missing",
      });
      return;
    }

    try {
      await resendOtp({ identifier }).unwrap();

      // Reset timer to 3 minutes
      setTimeLeft(180);
      setIsExpired(false);

      Swal.fire({
        icon: "success",
        title: "OTP Resent",
        text: "A new OTP has been sent",
      });
      setOtp("");
    } catch (error) {
      const errorMessage =
        error?.data?.message || error?.message || "Failed to resend OTP";
      Swal.fire({
        icon: "error",
        title: "Error",
        text: errorMessage,
      });
    }
  };

  return (
    <div>
      <img src={mailIcon} alt="KeyIcon" className="mb-[24px] mx-auto" />
      <div className="text-center mb-8">
        <h1 className="text-[25px] font-semibold mb-6">Verify OTP</h1>
        <p className="mx-auto text-base text-[#667085]">
          We sent a 6-digit code to {identifier || "your email or phone"}
        </p>
      </div>
      <Form layout="vertical">
        <Form.Item>
          <div className="flex justify-center mb-6">
            <OTPInput
              value={otp}
              onChange={setOtp}
              numInputs={6}
              disabled={isExpired}
              renderSeparator={<span className="mx-2">-</span>}
              renderInput={(props) => (
                <input
                  {...props}
                  disabled={isExpired}
                  style={{
                    width: "45px",
                    height: "45px",
                    fontSize: "20px",
                    textAlign: "center",
                    border: "2px solid #3FAE6A",
                    borderRadius: "8px",
                    fontWeight: "600",
                    opacity: isExpired ? 0.5 : 1,
                    cursor: isExpired ? "not-allowed" : "text",
                  }}
                />
              )}
            />
          </div>
        </Form.Item>

        <Form.Item>
          <button
            type="button"
            onClick={onFinish}
            disabled={isLoading || otp.length !== 6 || isExpired}
            style={{
              width: "100%",
              height: 45,
              color: "white",
              fontWeight: "400px",
              fontSize: "18px",
              borderRadius: "200px",
              marginTop: 20,
              opacity: isLoading || otp.length !== 6 || isExpired ? 0.6 : 1,
              cursor:
                isLoading || otp.length !== 6 || isExpired
                  ? "not-allowed"
                  : "pointer",
            }}
            className="flex items-center justify-center bg-[#3FAE6A] rounded-lg hover:opacity-90"
          >
            {isLoading ? "Verifying..." : "Verify OTP"}
          </button>
        </Form.Item>
      </Form>
      <div className="mt-[20px]">
        <p className="text-center text-[#667085]">
          Didn&apos;t receive the code?{" "}
          <button
            onClick={handleResendEmail}
            disabled={isResending || timeLeft > 0}
            className="text-[#3FAE6A] hover:text-[#1E1E1E] font-semibold bg-none border-none cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isResending
              ? "Resending..."
              : timeLeft > 0
                ? `Resend in ${Math.floor(timeLeft / 60)}:${String(
                    timeLeft % 60,
                  ).padStart(2, "0")}`
                : "Click to resend"}
          </button>
        </p>
      </div>
      <div className="">
        <a
          href="/auth/login"
          className="flex items-center justify-center gap-1 text-[#667085] hover:text-[#3FAE6A] text-center mt-4"
        >
          <ArrowLeft size={20} />
          <p>Back to log in</p>
        </a>
      </div>
    </div>
  );
};

export default VerifyOtp;
