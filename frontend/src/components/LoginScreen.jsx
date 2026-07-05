import { useState } from "react";
import { supabase } from "../supabaseClient";
import LeftVisual from "./LeftVisual";
import Navbar from "./Navbar";
import WordReveal from "./WordReveal";

function LoginScreen({ onLogin, onSignup }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleLogin = async () => {
    if (!email || !password) {
      setError("Please fill in all fields");
      return;
    }

    setLoading(true);
    setError("");

   const { data, error } = await supabase.auth.signInWithPassword({
  email,
  password,
});

if (error) {
  setError(error.message);
} else {
  console.log("USER:", data.user);
  console.log("SESSION:", data.session);
  console.log("ACCESS TOKEN:", data.session?.access_token);

  // Save token for later API calls
  localStorage.setItem(
    "access_token",
    data.session.access_token
  );

  onLogin(data.user);
}

    setLoading(false);
  };

  return (
    
    <div className="min-h-screen bg-[#0B1220] text-white flex">
      <Navbar />

      {/* LEFT VISUAL (unchanged idea) */}
      {/* LEFT VISUAL */}
<div className="hidden lg:flex w-1/2 relative overflow-hidden">

  {/* Background image */}
  <img
    src="https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5"
    className="absolute inset-0 w-full h-full object-cover opacity-50 scale-110"
  />

  {/* gradient overlay */}
  <div className="absolute inset-0 bg-gradient-to-tr from-[#0B1220] via-[#0B1220]/70 to-transparent" />

  {/* soft glow */}
  <div className="absolute w-[500px] h-[500px] bg-indigo-500/20 blur-[160px] rounded-full bottom-[-150px] left-[-150px]" />

  {/* CONTENT */}
  <div className="relative z-10 w-full h-full flex flex-col justify-center px-16">

    {/* badge */}
    <div className="inline-flex items-center gap-2 px-4 py-1 rounded-full bg-white/5 backdrop-blur-xl text-xs text-gray-300 w-fit">
      ✨ Smart Learning Platform
    </div>

    {/* heading */}
    {/* <h1 className="text-4xl font-bold leading-tight mt-6">
      Your Knowledge,<br />Organized Intelligently
    </h1> */}
    <WordReveal
  text="Your Knowledge , Organized Intelligently"
  speed={500}
/>

    <p className="mt-4 text-gray-300 max-w-md">
      RAG_V2 transforms your notes into a structured, searchable, AI-powered learning system designed for clarity and speed.
    </p>

    {/* floating feature cards */}
    <div className="mt-10 space-y-4">

      <div className="flex items-center gap-3 bg-white/5 backdrop-blur-xl px-4 py-3 rounded-2xl w-fit">
        📚 <span className="text-sm text-gray-200">Organized Notes</span>
      </div>

      <div className="flex items-center gap-3 bg-white/5 backdrop-blur-xl px-4 py-3 rounded-2xl w-fit">
        🧠 <span className="text-sm text-gray-200">Contextual AI Answers</span>
      </div>

      <div className="flex items-center gap-3 bg-white/5 backdrop-blur-xl px-4 py-3 rounded-2xl w-fit">
        📊 <span className="text-sm text-gray-200">Learning Insights</span>
      </div>

    </div>

    {/* subtle stats */}
    <div className="mt-12 flex gap-6">

      <div>
        <p className="text-xl font-bold">Fast</p>
        <p className="text-xs text-gray-400">Retrieval</p>
      </div>

      <div>
        <p className="text-xl font-bold">Accurate</p>
        <p className="text-xs text-gray-400">Responses</p>
      </div>

      <div>
        <p className="text-xl font-bold">Simple</p>
        <p className="text-xs text-gray-400">Workflow</p>
      </div>

    </div>

  </div>
</div>

      {/* RIGHT SIDE — FLOATING INTERACTIVE ZONE */}
      <div className="w-full lg:w-1/2 flex items-center justify-center px-6 relative">

        {/* soft moving glow that follows cursor feel */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute w-[400px] h-[400px] bg-blue-500/20 blur-[140px] rounded-full top-1/3 left-1/2 -translate-x-1/2" />
        </div>

        <div className="w-full max-w-md space-y-6 z-10">

          {/* HEADER (no card) */}
          <div>
            <h2 className="text-4xl font-bold">
              Welcome Back
            </h2>
            <p className="text-gray-400 mt-2">
              Continue your AI learning journey
            </p>
          </div>

          {/* ERROR */}
          {error && (
            <p className="text-red-400 text-sm">
              {error}
            </p>
          )}

          {/* INPUT GROUP — FLOATING STYLE */}
          <div className="space-y-4">

            {/* EMAIL */}
            <div className="
              relative group
              transition duration-300
            ">
              <input
                type="email"
                placeholder="Email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="
                  w-full px-4 py-4
                  bg-white/5
                  text-white placeholder-gray-500
                  outline-none
                  rounded-2xl
                  transition
                  focus:bg-white/10
                  focus:scale-[1.01]
                "
              />
              <div className="
                absolute inset-0 rounded-2xl
                bg-gradient-to-r from-blue-500/20 to-purple-500/20
                opacity-0 group-focus-within:opacity-100
                blur-xl transition
                pointer-events-none
              " />
            </div>

            {/* PASSWORD */}
            <div className="relative group">
              <input
                type="password"
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleLogin()}
                className="
                  w-full px-4 py-4
                  bg-white/5
                  text-white placeholder-gray-500
                  outline-none
                  rounded-2xl
                  transition
                  focus:bg-white/10
                  focus:scale-[1.01]
                "
              />
              <div className="
                absolute inset-0 rounded-2xl
                bg-gradient-to-r from-cyan-500/20 to-blue-500/20
                opacity-0 group-focus-within:opacity-100
                blur-xl transition
                pointer-events-none
              " />
            </div>

          </div>

          {/* BUTTON — FLOATING GLOW */}
          <button
            onClick={handleLogin}
            disabled={loading}
            className="
              w-full py-4 rounded-2xl
              bg-blue-600 hover:bg-blue-500
              transition
              relative overflow-hidden
              font-medium
            "
          >
            <span className="relative z-10">
              {loading ? "Logging in..." : "Login"}
            </span>

            {/* animated shine */}
            <div className="
              absolute inset-0
              bg-gradient-to-r from-transparent via-white/20 to-transparent
              translate-x-[-100%] hover:translate-x-[100%]
              transition-transform duration-700
            " />
          </button>

          {/* SIGNUP */}
          <p className="text-center text-sm text-gray-400">
            Don't have an account?{" "}
            <button
              onClick={onSignup}
              className="text-blue-400 hover:text-blue-300 transition"
            >
              Sign up
            </button>
          </p>
        </div>
      </div>
    </div>
    
  );
}

export default LoginScreen;