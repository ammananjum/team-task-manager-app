import { useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api/axios";
import logoImg from "../assets/image/logo.png";

export default function Login() {
  const navigate = useNavigate();

  const [isRightPanelActive, setIsRightPanelActive] = useState(false);

  // LOGIN
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  // SIGNUP
  const [name, setName] = useState("");
  const [signupEmail, setSignupEmail] = useState("");
  const [signupPassword, setSignupPassword] = useState("");

  // ERRORS
  const [emailError, setEmailError] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const [loginMessage, setLoginMessage] = useState("");
  const [signupMessage, setSignupMessage] = useState("");

  // EMAIL VALIDATION
  const validateEmail = (email) => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  };

  // PASSWORD VALIDATION
  const validatePassword = (pass) => {
    return /^(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&]).{8,}$/.test(pass);
  };

  // LIVE EMAIL CHECK
  const handleSignupEmailChange = (value) => {
    setSignupEmail(value);

    if (!value.includes("@")) {
      setEmailError("Email must contain @");
    } else if (!validateEmail(value)) {
      setEmailError("Enter a valid email address");
    } else {
      setEmailError("");
    }
  };

  // LIVE PASSWORD CHECK
  const handlePasswordChange = (value) => {
    setSignupPassword(value);

    if (!validatePassword(value)) {
      setPasswordError(
        "8+ chars, 1 uppercase, 1 number & 1 special character"
      );
    } else {
      setPasswordError("");
    }
  };

  // LOGIN
  const handleLogin = async (e) => {
    e.preventDefault();

    setLoginMessage("");

    if (!validateEmail(email)) {
      setLoginMessage("Enter a valid email");
      return;
    }

    try {
      const res = await api.post("/auth/login", {
        email,
        password,
      });

     localStorage.setItem("user", JSON.stringify(res.data.user));
     localStorage.setItem("token", res.data.token);

      setLoginMessage("Login successful");

      setTimeout(() => {
        navigate("/dashboard");
      }, 1000);

    } catch (err) {
      setLoginMessage(
        err.response?.data?.message || "Login failed"
      );
    }
  };

  // SIGNUP
  const handleSignup = async (e) => {
    e.preventDefault();

    setSignupMessage("");

    if (!validateEmail(signupEmail)) {
      setEmailError("Enter valid email");
      return;
    }

    if (!validatePassword(signupPassword)) {
      setPasswordError(
        "8+ chars, 1 uppercase, 1 number & 1 special character"
      );
      return;
    }

    try {
      const res = await api.post("/auth/register", {
        name,
        email: signupEmail,
        password: signupPassword,
      });

      setSignupMessage(
        res.data.message || "Account created successfully"
      );

      setTimeout(() => {
        setIsRightPanelActive(false);
      }, 1200);

    } catch (err) {
      setSignupMessage(
        err.response?.data?.message || "Signup failed"
      );
    }
  };

  return (
    <div className="min-h-screen bg-[#F6F1E6] flex items-center justify-center px-4 py-8 overflow-hidden">

      {/* MAIN CONTAINER */}
      <div className="relative w-[1050px] max-w-full h-[620px] bg-white/20 backdrop-blur-xl shadow-2xl rounded-[40px] overflow-hidden border border-white/30">

        {/* LOGIN PANEL */}
        <div
          className={`absolute top-0 left-0 w-1/2 h-full flex items-center justify-center transition-all duration-700 z-20
          ${isRightPanelActive
            ? "translate-x-full opacity-0"
            : "translate-x-0 opacity-100"
          }`}
        >
          <form
            onSubmit={handleLogin}
            className="w-full px-16"
          >
            <div className="flex justify-center mb-5">
              <img
                src={logoImg}
                className="w-20 h-20 rounded-full border-4 border-[#2B2B2B]"
              />
            </div>

            <h1 className="text-4xl font-bold text-center text-[#2B2B2B]">
              Welcome Back
            </h1>

            <p className="text-center text-gray-600 mt-3 mb-8">
              Login to continue your workflow
            </p>

            <input
              type="email"
              placeholder="Email"
              className="w-full mb-4 px-5 py-3 rounded-full border border-gray-300 outline-none bg-white/70"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />

            <input
              type="password"
              placeholder="Password"
              className="w-full mb-4 px-5 py-3 rounded-full border border-gray-300 outline-none bg-white/70"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />

            {/* MESSAGE */}
            {loginMessage && (
              <p className="text-center text-large text-black-500 mb-4">
                {loginMessage}
              </p>
            )}

            <button
              className="w-full py-3 rounded-full bg-[#2B2B2B] text-[#D0D0D0] text-lg font-semibold hover:scale-[1.02] transition"
            >
              Sign In
            </button>
          </form>
        </div>

        {/* SIGNUP PANEL */}
        <div
          className={`absolute top-0 left-0 w-1/2 h-full flex items-center justify-center transition-all duration-700 z-20
          ${isRightPanelActive
            ? "translate-x-full opacity-100"
            : "translate-x-0 opacity-0 pointer-events-none"
          }`}
        >
          <form
            onSubmit={handleSignup}
            className="w-full px-16"
          >
            <div className="flex justify-center mb-5">
              <img
                src={logoImg}
                className="w-20 h-20 rounded-full border-4 border-[#2B2B2B]"
              />
            </div>

            <h1 className="text-4xl font-bold text-center text-[#2B2B2B]">
              Create Account
            </h1>

            <p className="text-center text-gray-600 mt-3 mb-8">
              Join TaskFlow today
            </p>

            <input
              type="text"
              placeholder="Full Name"
              className="w-full mb-4 px-5 py-3 rounded-full border border-gray-300 outline-none bg-white/70"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />

            {/* EMAIL */}
            <input
              type="email"
              placeholder="Email"
              className={`w-full mb-2 px-5 py-3 rounded-full border outline-none bg-white/70
              ${emailError ? "border-red-500" : "border-gray-300"}`}
              value={signupEmail}
              onChange={(e) =>
                handleSignupEmailChange(e.target.value)
              }
            />

            {/* EMAIL ERROR */}
            {emailError && (
              <p className="text-red-500 text-sm mb-3">
                {emailError}
              </p>
            )}

            {/* PASSWORD */}
            <input
              type="password"
              placeholder="Password"
              className={`w-full mb-2 px-5 py-3 rounded-full border outline-none bg-white/70
              ${passwordError ? "border-red-500" : "border-gray-300"}`}
              value={signupPassword}
              onChange={(e) =>
                handlePasswordChange(e.target.value)
              }
            />

            {/* PASSWORD ERROR */}
            {passwordError && (
              <p className="text-red-500 text-sm mb-3">
                {passwordError}
              </p>
            )}

            {/* SIGNUP MESSAGE */}
            {signupMessage && (
              <p className="text-center text-large text-black-500 mb-4">
                {signupMessage}
              </p>
            )}

            <button
              className="w-full py-3 rounded-full bg-[#2B2B2B] text-[#D0D0D0] text-lg font-semibold hover:scale-[1.02] transition"
            >
              Sign Up
            </button>
          </form>
        </div>

        {/* SLIDING OVERLAY */}
        <div
          className={`absolute top-0 left-1/2 w-1/2 h-full bg-[#2B2B2B]
          text-[#E0E0E0] flex flex-col items-center justify-center px-12 text-center
          transition-all duration-700 z-30
          ${isRightPanelActive ? "-translate-x-full" : "translate-x-0"}
          `}
        >
          <img
            src={logoImg}
            className="w-28 h-28 rounded-full border-4 border-[#B0B0B0] mb-6"
          />

          <h1 className="text-5xl font-bold leading-tight">
            {isRightPanelActive
              ? "Welcome Back!"
              : "Hello, Friend!"}
          </h1>

          <p className="mt-5 text-lg text-gray-300 leading-relaxed max-w-md">
            {isRightPanelActive
              ? "Login and continue managing your teams, projects and workflow."
              : "Create your account and start organizing your workflow beautifully."}
          </p>

          <button
            onClick={() =>
              setIsRightPanelActive(!isRightPanelActive)
            }
            className="mt-10 px-10 py-3 rounded-full border-2 border-[#B0B0B0]
            text-lg hover:bg-[#B0B0B0] hover:text-[#2B2B2B] transition"
          >
            {isRightPanelActive ? "Sign In" : "Sign Up"}
          </button>
        </div>

      </div>
    </div>
  );
}
