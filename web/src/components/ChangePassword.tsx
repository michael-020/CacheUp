import { useState, FormEvent } from "react";
import { useNavigate } from "react-router-dom";
import { Lock } from "lucide-react";
import { useAuthStore } from "../stores/AuthStore/useAuthStore";
import toast from "react-hot-toast";
import { axiosInstance } from "../lib/axios"; 

export default function ChangePasswordForm() {
  const navigate = useNavigate();
  const { authUser } = useAuthStore();
  const [step, setStep] = useState(authUser?.email ? 1 : 1); 
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState(authUser?.email || "");
  const [otp, setOtp] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [otpSent, setOtpSent] = useState(false);

  const handleRequestOTP = async (e: FormEvent) => {
    e.preventDefault();
    
    if (!email) {
      toast.error("Please enter your email address");
      return;
    }
    
    try {
      setLoading(true);
      await axiosInstance.post("/user/send-password-reset-otp", { email });
      
      toast.success("OTP sent to your email");
      setOtpSent(true); 
    } catch (error: any) {
      toast.error(error.response?.data?.msg || "Failed to send OTP");
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOTP = async (e: FormEvent) => {
    e.preventDefault();
    
    if (!otp || otp.length !== 6) {
      toast.error("Please enter a valid 6-digit OTP");
      return;
    }
    
    try {
      setLoading(true);
      await axiosInstance.post("/user/verify-password-reset-otp", { email, otp });
      
      toast.success("OTP verified successfully");
      setStep(2); 
    } catch (error: any) {
      toast.error(error.response?.data?.msg || "Invalid OTP");
    } finally {
      setLoading(false);
    }
  };

  const handleChangePassword = async (e: FormEvent) => {
    e.preventDefault();
    
    if (newPassword.length < 8) {
      toast.error("Password must be at least 8 characters long");
      return;
    }
    
    if (newPassword !== confirmPassword) {
      toast.error("Passwords do not match");
      return;
    }
    
    try {
      setLoading(true);
      await axiosInstance.post("/user/reset-password", { email, otp, newPassword });
      
      toast.success("Password changed successfully");
      navigate("/settings"); 
    } catch (error: any) {
      toast.error(error.response?.data?.msg || "Failed to change password");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="pt-16 min-h-screen bg-gray-100 dark:bg-neutral-900">
      <div className="max-w-md mx-auto p-4">
        {/* Header */}
        <div className="bg-white dark:bg-neutral-800 rounded-lg shadow-sm p-4 mb-4">
          <div className="flex items-center">
            <button
              onClick={() => navigate(-1)}
              className="mr-4 p-2 rounded-full hover:bg-gray-100 dark:hover:bg-neutral-700"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5 text-gray-600 dark:text-gray-300"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M10 19l-7-7m0 0l7-7m-7 7h18"
                />
              </svg>
            </button>
            <h1 className="text-xl font-semibold text-gray-800 dark:text-white">Change Password</h1>
          </div>
        </div>

        {/* Form Container */}
        <div className="bg-white dark:bg-neutral-800 rounded-lg shadow-sm p-6">
          <div className="flex justify-center mb-6">
            <div className="p-3 bg-blue-100 dark:bg-blue-900 rounded-full">
              <Lock className="h-6 w-6 text-blue-600 dark:text-blue-300" />
            </div>
          </div>

          {/* Step 1: Email & OTP */}
          {step === 1 && (
            <div>
              {/* Email Input Form */}
              <form onSubmit={handleRequestOTP} className="space-y-4 mb-4">
                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Email Address
                  </label>
                  <input
                    type="email"
                    id="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full p-2 border border-gray-300 dark:border-neutral-600 rounded-md bg-white dark:bg-neutral-800 text-gray-800 dark:text-white disabled:opacity-75"
                    placeholder="Enter your email address"
                    required
                    disabled={!!authUser} // Disable if logged in
                  />
                  <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
                    We'll send a verification code to this email
                  </p>
                </div>
                <button
                  type="submit"
                  className="w-full px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition disabled:opacity-50 disabled:cursor-not-allowed"
                  disabled={loading || (!!authUser && otpSent)}
                >
                  {loading ? "Sending..." : otpSent ? "OTP Sent" : "Request Verification Code"}
                </button>
              </form>

              {/* OTP Verification Form - Only shown after requesting OTP */}
              {otpSent && (
                <form onSubmit={handleVerifyOTP} className="space-y-4 mt-6 pt-6 border-t border-gray-200 dark:border-neutral-700">
                  <div>
                    <label htmlFor="otp" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Verification Code
                    </label>
                    <input
                      type="text"
                      id="otp"
                      value={otp}
                      onChange={(e) => setOtp(e.target.value)}
                      className="w-full p-2 border border-gray-300 dark:border-neutral-600 rounded-md bg-white dark:bg-neutral-800 text-gray-800 dark:text-white"
                      placeholder="Enter 6-digit code"
                      maxLength={6}
                      required
                    />
                    <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
                      Enter the 6-digit code sent to {email}
                    </p>
                  </div>
                  <button
                    type="submit"
                    className="w-full px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition disabled:opacity-50 disabled:cursor-not-allowed"
                    disabled={loading}
                  >
                    {loading ? "Verifying..." : "Verify OTP"}
                  </button>
                  <button
                    type="button"
                    onClick={handleRequestOTP}
                    className="w-full text-blue-500 dark:text-blue-400 text-sm font-medium"
                    disabled={loading}
                  >
                    Didn't receive code? Resend
                  </button>
                </form>
              )}
            </div>
          )}

          {/* Step 2: New Password */}
          {step === 2 && (
            <form onSubmit={handleChangePassword} className="space-y-4">
              <div>
                <label htmlFor="newPassword" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  New Password
                </label>
                <input
                  type="password"
                  id="newPassword"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="w-full p-2 border border-gray-300 dark:border-neutral-600 rounded-md bg-white dark:bg-neutral-800 text-gray-800 dark:text-white"
                  placeholder="Enter new password"
                  minLength={8}
                  required
                />
              </div>
              <div>
                <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Confirm Password
                </label>
                <input
                  type="password"
                  id="confirmPassword"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="w-full p-2 border border-gray-300 dark:border-neutral-600 rounded-md bg-white dark:bg-neutral-800 text-gray-800 dark:text-white"
                  placeholder="Confirm new password"
                  minLength={8}
                  required
                />
              </div>
              <div className="flex space-x-2">
                <button
                  type="button"
                  onClick={() => setStep(1)}
                  className="flex-1 px-4 py-2 bg-gray-200 dark:bg-neutral-700 text-gray-800 dark:text-white rounded-md hover:bg-gray-300 dark:hover:bg-neutral-600 transition"
                >
                  Back
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition disabled:opacity-50 disabled:cursor-not-allowed"
                  disabled={loading}
                >
                  {loading ? "Updating..." : "Change Password"}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}