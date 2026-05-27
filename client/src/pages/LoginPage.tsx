import { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

const LoginPage = () => {
  const navigate = useNavigate();

  const [isLogin, setIsLogin] = useState(true);

  const [formData, setFormData] = useState({
    username: "",
    email: "",
    password: "",
  });

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {

    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async () => {

    try {

      const endpoint = isLogin
        ? "login"
        : "signup";

      const res = await axios.post(
        `http://localhost:4001/auth/${endpoint}`,
        formData
      );

      console.log(res.data);

      localStorage.setItem(
        "token",
        res.data.token
      );

      alert("Authentication successful");

    } catch (error: any) {

      console.log(error);

      alert(
        error.response?.data?.message ||
        "Something went wrong"
      );
    }
  };

  return (
    <div className="min-h-screen bg-[#0f172a] flex items-center justify-center relative overflow-hidden">

      <div className="absolute w-[500px] h-[500px] bg-blue-500/20 rounded-full blur-3xl top-[-100px] left-[-100px]" />

      <div className="absolute w-[400px] h-[400px] bg-purple-500/20 rounded-full blur-3xl bottom-[-100px] right-[-100px]" />

      <div className="relative z-10 w-[420px] bg-white/10 backdrop-blur-xl border border-white/10 rounded-3xl p-10 shadow-2xl">

        <h1 className="text-4xl font-bold text-white text-center mb-2">
          Real-Time Chat
        </h1>

        <p className="text-gray-300 text-center mb-8">
          Distributed Messaging Platform
        </p>

        {!isLogin && (
          <input
            type="text"
            name="username"
            placeholder="Username"
            onChange={handleChange}
            className="w-full mb-4 px-4 py-3 rounded-xl bg-white/10 border border-white/10 text-white outline-none"
          />
        )}

        <input
          type="email"
          name="email"
          placeholder="Email"
          onChange={handleChange}
          className="w-full mb-4 px-4 py-3 rounded-xl bg-white/10 border border-white/10 text-white outline-none"
        />

        <input
          type="password"
          name="password"
          placeholder="Password"
          onChange={handleChange}
          className="w-full mb-6 px-4 py-3 rounded-xl bg-white/10 border border-white/10 text-white outline-none"
        />

        <button
          onClick={handleSubmit}
          className="w-full bg-white text-black py-3 rounded-xl font-semibold hover:bg-gray-200 transition-all"
        >
          {isLogin ? "Login" : "Create Account"}
        </button>

        <button
          onClick={() => setIsLogin(!isLogin)}
          className="mt-5 text-gray-300 w-full hover:text-white transition-all"
        >
          {isLogin
            ? "Don't have an account? Sign Up"
            : "Already have an account? Login"}
        </button>

        {isLogin && (
          <button
            type="button"
            onClick={() => navigate("/forgot-password")}
            className="mt-3 text-blue-300 w-full text-sm hover:text-blue-200 transition-all"
          >
            Forgot Password?
          </button>
        )}

      </div>

    </div>
  );
};

export default LoginPage;