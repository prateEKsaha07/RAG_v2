import { useState } from "react";
import { supabase } from "../supabaseClient";
import Navbar from "./Navbar";
import WordReveal from "./WordReveal";

function SignupScreen({ onSignup, onLogin }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const handleSignup = async () => {
    if (!email || !password || !confirm) {
      setError("Please fill in all fields");
      return;
    }

    if (password !== confirm) {
      setError("Passwords don't match!");
      return;
    }

    if (password.length < 6) {
      setError("Password must be at least 6 characters");
      return;
    }

    setLoading(true);
    setError("");

    const { data, error } = await supabase.auth.signUp({
      email,
      password,
    });

    if (error) {
      setError(error.message);
    } else {
      setSuccess("Account created! Check your email to confirm.");
      setTimeout(() => onLogin(), 2500);
    }

    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-[#0B1220] text-white flex">
      <Navbar />
      {/* LEFT VISUAL (same style as login for consistency) */}
      <div className="hidden lg:flex w-1/2 relative overflow-hidden">

        <img
          src="https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5"
          className="absolute inset-0 w-full h-full object-cover opacity-50 scale-110"
        />

        <div className="absolute inset-0 bg-gradient-to-tr from-[#0B1220] via-[#0B1220]/70 to-transparent" />

        <div className="relative z-10 w-full h-full flex flex-col justify-center px-16">

          <div className="inline-flex items-center px-4 py-1 rounded-full bg-white/5 text-xs text-gray-300 w-fit">
            🚀 Join RAG_V2
          </div>
        <h1><WordReveal
  text="Start Learning Smarter with RAG_V2"
  speed={500}
/></h1>
          


          <p className="mt-4 text-gray-300 max-w-md">
            Create your account and turn your notes into an AI-powered learning system.
          </p>

          <div className="mt-10 space-y-3 text-gray-300 text-sm">
            <div>📚 Instant note indexing</div>
            <div>🧠 AI-powered Q&A system</div>
            <div>📊 Personalized insights</div>
          </div>

        </div>
      </div>

      {/* RIGHT FORM */}
      <div className="w-full lg:w-1/2 flex items-center justify-center px-6 relative">

        {/* glow background */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute w-[450px] h-[450px] bg-purple-500/20 blur-[140px] rounded-full top-1/3 left-1/2 -translate-x-1/2" />
        </div>

        <div className="w-full max-w-md space-y-6 z-10">

          {/* HEADER */}
          <div>
            <h2 className="text-4xl font-bold">
              Create Account
            </h2>
            <p className="text-gray-400 mt-2">
              Join RAG_V2 and start learning smarter
            </p>
          </div>

          {/* ERROR */}
          {error && (
            <p className="text-red-400 text-sm">{error}</p>
          )}

          {/* SUCCESS */}
          {success && (
            <p className="text-green-400 text-sm">{success}</p>
          )}

          {/* INPUTS */}
          <div className="space-y-4">

            <input
              type="email"
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="
                w-full px-4 py-4
                bg-white/5 text-white
                placeholder-gray-500
                rounded-2xl
                outline-none
                focus:bg-white/10
                transition
              "
            />

            <input
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="
                w-full px-4 py-4
                bg-white/5 text-white
                placeholder-gray-500
                rounded-2xl
                outline-none
                focus:bg-white/10
                transition
              "
            />

            <input
              type="password"
              placeholder="Confirm Password"
              value={confirm}
              onChange={(e) => setConfirm(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSignup()}
              className="
                w-full px-4 py-4
                bg-white/5 text-white
                placeholder-gray-500
                rounded-2xl
                outline-none
                focus:bg-white/10
                transition
              "
            />

          </div>

          {/* BUTTON */}
          <button
            onClick={handleSignup}
            disabled={loading}
            className="
              w-full py-4 rounded-2xl
              bg-blue-600 hover:bg-blue-500
              transition
              font-medium
            "
          >
            {loading ? "Creating account..." : "Sign Up"}
          </button>

          {/* LOGIN LINK */}
          <p className="text-center text-sm text-gray-400">
            Already have an account?{" "}
            <button
              onClick={onLogin}
              className="text-blue-400 hover:text-blue-300"
            >
              Login
            </button>
          </p>

        </div>
      </div>
    </div>
  );
}

export default SignupScreen;