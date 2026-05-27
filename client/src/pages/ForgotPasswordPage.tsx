import { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

const ForgotPasswordPage = () => {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [resetLinkSent, setResetLinkSent] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setEmail(e.target.value);
    setError("");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage("");
    setError("");

    try {
      const res = await axios.post(
        "http://localhost:4001/auth/forgot-password",
        { email }
      );

      setMessage(res.data.message);
      setResetLinkSent(true);

      // For development: Show the reset link (remove in production)
      if (res.data.resetLink) {
        console.log("Reset Link (Dev Only):", res.data.resetLink);
      }
    } catch (err: any) {
      setError(
        err.response?.data?.message || "Failed to process forgot password request"
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
          Reset Password
        </h1>

        <p className="text-gray-300 text-center mb-8">
          Enter your email to receive a password reset link
        </p>

        {!resetLinkSent ? (
          <form onSubmit={handleSubmit}>
            <input
              type="email"
              placeholder="Enter your email"
              value={email}
              onChange={handleChange}
              required
              className="w-full mb-4 px-4 py-3 rounded-xl bg-white/10 border border-white/10 text-white placeholder-gray-400 outline-none focus:border-white/30 transition-all"
            />

            {error && (
              <div className="mb-4 p-3 rounded-lg bg-red-500/20 border border-red-500/50 text-red-200 text-sm">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-white text-black py-3 rounded-xl font-semibold hover:bg-gray-200 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? "Sending..." : "Send Reset Link"}
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
              Please check your email for a password reset link. The link will expire in 30 minutes.
            </p>

            <button
              onClick={() => navigate("/login")}
              className="w-full bg-white text-black py-3 rounded-xl font-semibold hover:bg-gray-200 transition-all"
            >
              Back to Login
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default ForgotPasswordPage;
