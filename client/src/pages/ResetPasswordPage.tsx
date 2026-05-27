import { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate, useSearchParams } from "react-router-dom";

const ResetPasswordPage = () => {
  const [searchParams] = useSearchParams();
  const [formData, setFormData] = useState({
    password: "",
    confirmPassword: "",
  });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [passwordsMatch, setPasswordsMatch] = useState(true);
  const [resetSuccess, setResetSuccess] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const navigate = useNavigate();

  const token = searchParams.get("token");

  useEffect(() => {
    if (!token) {
      setError("Invalid reset link. No token provided.");
    }
  }, [token]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
    setError("");

    // Check if passwords match
    if (name === "password" && formData.confirmPassword) {
      setPasswordsMatch(value === formData.confirmPassword);
    } else if (name === "confirmPassword" && formData.password) {
      setPasswordsMatch(formData.password === value);
    }
  };

  const validatePassword = (password: string): string | null => {
    if (password.length < 6) {
      return "Password must be at least 6 characters long";
    }
    return null;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage("");
    setError("");

    // Validation
    const passwordError = validatePassword(formData.password);
    if (passwordError) {
      setError(passwordError);
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    if (!token) {
      setError("Invalid reset link. Please request a new one.");
      return;
    }

    setLoading(true);

    try {
      const res = await axios.post(
        "http://localhost:4001/auth/reset-password",
        {
          token,
          newPassword: formData.password,
        }
      );

      setMessage(res.data.message);
      setResetSuccess(true);

      // Redirect to login after 3 seconds
      setTimeout(() => {
        navigate("/login");
      }, 3000);
    } catch (err: any) {
      setError(
        err.response?.data?.message || "Failed to reset password"
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0f172a] flex items-center justify-center relative overflow-hidden">
      <div className="absolute w-[500px] h-[500px] bg-blue-500/20 rounded-full blur-3xl top-[-100px] left-[-100px]" />

      <div className="absolute w-[400px] h-[400px] bg-purple-500/20 rounded-full blur-3xl bottom-[-100px] right-[-100px]" />

      <div className="relative z-10 w-[420px] bg-white/10 backdrop-blur-xl border border-white/10 rounded-3xl p-10 shadow-2xl">
        <h1 className="text-4xl font-bold text-white text-center mb-2">
          Create New Password
        </h1>

        <p className="text-gray-300 text-center mb-8">
          Enter your new password below
        </p>

        {!resetSuccess ? (
          <form onSubmit={handleSubmit}>
            {/* Password Input */}
            <div className="relative mb-4">
              <input
                type={showPassword ? "text" : "password"}
                name="password"
                placeholder="New Password"
                value={formData.password}
                onChange={handleChange}
                required
                className="w-full px-4 py-3 rounded-xl bg-white/10 border border-white/10 text-white placeholder-gray-400 outline-none focus:border-white/30 transition-all pr-10"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-3 text-gray-400 hover:text-gray-200"
              >
                {showPassword ? "Hide" : "Show"}
              </button>
            </div>

            {/* Confirm Password Input */}
            <div className="relative mb-4">
              <input
                type={showConfirmPassword ? "text" : "password"}
                name="confirmPassword"
                placeholder="Confirm Password"
                value={formData.confirmPassword}
                onChange={handleChange}
                required
                className="w-full px-4 py-3 rounded-xl bg-white/10 border border-white/10 text-white placeholder-gray-400 outline-none focus:border-white/30 transition-all pr-10"
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="absolute right-3 top-3 text-gray-400 hover:text-gray-200"
              >
                {showConfirmPassword ? "Hide" : "Show"}
              </button>
            </div>

            {/* Password Match Indicator */}
            {formData.confirmPassword && (
              <div className={`mb-4 text-sm ${passwordsMatch ? "text-green-400" : "text-red-400"}`}>
                {passwordsMatch ? "✓ Passwords match" : "✗ Passwords do not match"}
              </div>
            )}

            {error && (
              <div className="mb-4 p-3 rounded-lg bg-red-500/20 border border-red-500/50 text-red-200 text-sm">
                {error}
              </div>
            )}

            {message && (
              <div className="mb-4 p-3 rounded-lg bg-blue-500/20 border border-blue-500/50 text-blue-200 text-sm">
                {message}
              </div>
            )}

            <button
              type="submit"
              disabled={loading || !passwordsMatch || !token}
              className="w-full bg-white text-black py-3 rounded-xl font-semibold hover:bg-gray-200 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? "Resetting..." : "Reset Password"}
            </button>

            <button
              type="button"
              onClick={() => navigate("/login")}
              className="mt-5 text-gray-300 w-full hover:text-white transition-all"
            >
              Back to Login
            </button>
          </form>
        ) : (
          <div className="text-center">
            <div className="mb-4 p-3 rounded-lg bg-green-500/20 border border-green-500/50 text-green-200 text-sm">
              {message}
            </div>

            <p className="text-gray-300 mb-6">
              Your password has been successfully reset. You will be redirected to the login page shortly.
            </p>

            <button
              onClick={() => navigate("/login")}
              className="w-full bg-white text-black py-3 rounded-xl font-semibold hover:bg-gray-200 transition-all"
            >
              Go to Login
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default ResetPasswordPage;
