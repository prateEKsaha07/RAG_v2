import { useState } from "react";
import { supabase } from "../../supabaseClient";
import {
  ArrowLeft,
  Sparkles,
  Mail,
  Lock,
  Eye,
  EyeOff,
  ChevronRight,
  BookOpen,
  Brain,
  BarChart3,
  CheckCircle
} from "lucide-react";

function SignupScreen({ onSignup, onLogin, onBack }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

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
    setSuccess("");

    const { error } = await supabase.auth.signUp({
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
    <div className="min-h-screen bg-[#f7f3ee] flex">

      {/* LEFT PANEL */}
      <div className="hidden lg:flex lg:w-1/2 bg-[#faf7f3] border-r border-[#e8dfd3]">
        <div className="flex flex-col justify-between p-12 w-full h-full">

          {/* Logo */}
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-md bg-[#5c1a1a] flex items-center justify-center">
              <Sparkles size={16} strokeWidth={1.8} className="text-white" />
            </div>
            <div>
              <p className="text-base font-semibold text-[#2a1f14] leading-tight">
                RAG<span className="text-[#5c1a1a]">_v2</span>
              </p>
              <p className="text-[10px] tracking-[0.12em] uppercase text-[#8a7965] leading-none mt-0.5">
                Study Smarter
              </p>
            </div>
          </div>

          {/* Center content */}
          <div className="space-y-8">
            <div className="space-y-3">
              <p className="text-[11px] tracking-[0.14em] uppercase text-[#8a7965]">
                Get started
              </p>
              <h1 className="text-3xl font-bold text-[#2a1f14] leading-tight">
                Start your<br />
                Learning Journey
              </h1>
              <p className="text-sm text-[#6a5a48] max-w-sm leading-relaxed">
                Join thousands of students using RAG_V2 to study smarter.
              </p>
            </div>

            {/* Feature list */}
            <div className="space-y-2">
              {[
                { icon: BookOpen,  title: "Free AI features",       sub: "Unlimited access" },
                { icon: Brain,     title: "Smart quizzes",          sub: "Track your progress" },
                { icon: BarChart3, title: "Personalized insights",  sub: "Adapted to your goals" },
              ].map((item) => {
                const Icon = item.icon;
                return (
                  <div
                    key={item.title}
                    className="flex items-center gap-4 border border-[#e8dfd3] bg-white px-4 py-3 rounded-md"
                  >
                    <div className="w-8 h-8 rounded-md border border-[#e8dfd3] bg-[#faf7f3] flex items-center justify-center flex-shrink-0">
                      <Icon size={14} strokeWidth={1.8} className="text-[#5c1a1a]" />
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm font-medium text-[#2a1f14] truncate">
                        {item.title}
                      </p>
                      <p className="text-xs text-[#8a7965] truncate mt-0.5">
                        {item.sub}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Footer */}
          <p className="text-[11px] text-[#8a7965]">
            © 2026 RAG_V2. All rights reserved.
          </p>
        </div>
      </div>

      {/* RIGHT PANEL */}
      <div className="w-full lg:w-1/2 flex items-center justify-center px-6 py-12">
        <div className="w-full max-w-sm space-y-6">

          {/* Back */}
          <button
            onClick={onBack}
            className="inline-flex items-center gap-1.5 text-xs text-[#8a7965] hover:text-[#2a1f14] transition-colors"
          >
            <ArrowLeft size={13} strokeWidth={1.8} />
            Back
          </button>

          {/* Header */}
          <div>
            <p className="text-[11px] tracking-[0.14em] uppercase text-[#8a7965] mb-1.5">
              Create Account
            </p>
            <h2 className="text-2xl font-bold text-[#2a1f14]">
              Create Account
            </h2>
            <p className="text-sm text-[#8a7965] mt-1.5">
              Get started with your free account
            </p>
          </div>

          {/* Error */}
          {error && (
            <div className="bg-[#faf0f0] border border-[#dcc9c9] rounded-md p-3.5 text-sm text-[#7a2a2a]">
              {error}
            </div>
          )}

          {/* Success */}
          {success && (
            <div className="bg-[#faf7f3] border border-[#e8dfd3] rounded-md p-3.5 text-sm text-[#5c1a1a] flex items-center gap-2.5">
              <CheckCircle size={14} strokeWidth={1.8} className="text-[#5c1a1a] flex-shrink-0" />
              {success}
            </div>
          )}

          {/* Form */}
          <form
            className="space-y-4"
            onSubmit={(e) => { e.preventDefault(); handleSignup(); }}
          >
            <div className="space-y-3.5">
              {/* Email */}
              <div>
                <label className="block text-[11px] tracking-[0.12em] uppercase text-[#8a7965] mb-2">
                  Email Address
                </label>
                <div className="relative">
                  <Mail size={14} strokeWidth={1.8} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#8a7965]" />
                  <input
                    type="email"
                    placeholder="you@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full pl-10 pr-3.5 py-2.5 bg-[#faf7f3] border border-[#e8dfd3] rounded-md text-sm text-[#2a1f14] placeholder-[#a89880] outline-none focus:border-[#5c1a1a] transition-colors"
                  />
                </div>
              </div>

              {/* Password */}
              <div>
                <label className="block text-[11px] tracking-[0.12em] uppercase text-[#8a7965] mb-2">
                  Password
                </label>
                <div className="relative">
                  <Lock size={14} strokeWidth={1.8} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#8a7965]" />
                  <input
                    type={showPassword ? "text" : "password"}
                    placeholder="Min 6 characters"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full pl-10 pr-10 py-2.5 bg-[#faf7f3] border border-[#e8dfd3] rounded-md text-sm text-[#2a1f14] placeholder-[#a89880] outline-none focus:border-[#5c1a1a] transition-colors"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    aria-label={showPassword ? "Hide password" : "Show password"}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[#8a7965] hover:text-[#2a1f14] transition-colors"
                  >
                    {showPassword
                      ? <EyeOff size={14} strokeWidth={1.8} />
                      : <Eye size={14} strokeWidth={1.8} />}
                  </button>
                </div>
              </div>

              {/* Confirm password */}
              <div>
                <label className="block text-[11px] tracking-[0.12em] uppercase text-[#8a7965] mb-2">
                  Confirm Password
                </label>
                <div className="relative">
                  <CheckCircle size={14} strokeWidth={1.8} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#8a7965]" />
                  <input
                    type={showConfirm ? "text" : "password"}
                    placeholder="Confirm your password"
                    value={confirm}
                    onChange={(e) => setConfirm(e.target.value)}
                    className="w-full pl-10 pr-10 py-2.5 bg-[#faf7f3] border border-[#e8dfd3] rounded-md text-sm text-[#2a1f14] placeholder-[#a89880] outline-none focus:border-[#5c1a1a] transition-colors"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirm(!showConfirm)}
                    aria-label={showConfirm ? "Hide password" : "Show password"}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[#8a7965] hover:text-[#2a1f14] transition-colors"
                  >
                    {showConfirm
                      ? <EyeOff size={14} strokeWidth={1.8} />
                      : <Eye size={14} strokeWidth={1.8} />}
                  </button>
                </div>
              </div>
            </div>

            {/* Requirements */}
            <p className="flex items-center gap-2 text-[10px] tracking-[0.06em] uppercase text-[#8a7965]">
              <span className={password.length >= 6 ? "text-[#5c1a1a]" : "text-[#c9bda9]"}>
                {password.length >= 6 ? "✓" : "○"}
              </span>
              At least 6 characters
            </p>

            <button
              type="submit"
              disabled={loading}
              className={`w-full py-2.5 rounded-md text-sm font-medium transition-colors flex items-center justify-center gap-2 ${
                loading
                  ? "bg-[#f0e9e0] text-[#a89880] cursor-not-allowed"
                  : "bg-[#5c1a1a] text-white hover:bg-[#4a1414]"
              }`}
            >
              {loading ? (
                <span className="w-4 h-4 border-2 border-[#a89880] border-t-transparent rounded-full animate-spin" />
              ) : (
                <>
                  Create Account
                  <ChevronRight size={14} strokeWidth={1.8} />
                </>
              )}
            </button>
          </form>

          {/* Divider */}
          <div className="flex items-center gap-3">
            <div className="flex-1 h-px bg-[#e8dfd3]" />
            <span className="text-[10px] tracking-[0.12em] uppercase text-[#8a7965]">
              Or continue with
            </span>
            <div className="flex-1 h-px bg-[#e8dfd3]" />
          </div>

          {/* Socials */}
          <div className="flex justify-center gap-2">
            <button
              aria-label="Continue with GitHub"
              className="w-9 h-9 rounded-md border border-[#e8dfd3] bg-white flex items-center justify-center text-[#8a7965] hover:text-[#5c1a1a] hover:border-[#5c1a1a]/40 transition-colors"
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.15 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.62.24 2.85.12 3.15.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z"/>
              </svg>
            </button>
            <button
              aria-label="Continue with LinkedIn"
              className="w-9 h-9 rounded-md border border-[#e8dfd3] bg-white flex items-center justify-center text-[#8a7965] hover:text-[#5c1a1a] hover:border-[#5c1a1a]/40 transition-colors"
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
                <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
              </svg>
            </button>
          </div>

          {/* Login link */}
          <p className="text-center text-xs text-[#8a7965]">
            Already have an account?{" "}
            <button
              onClick={onLogin}
              className="text-[#5c1a1a] hover:text-[#4a1414] font-medium transition-colors"
            >
              Sign in
            </button>
          </p>

          {/* Terms */}
          <p className="text-center text-[10px] text-[#8a7965]">
            By creating an account, you agree to our{" "}
            <button className="text-[#5c1a1a] hover:text-[#4a1414] transition-colors">
              Terms
            </button>{" "}
            &{" "}
            <button className="text-[#5c1a1a] hover:text-[#4a1414] transition-colors">
              Privacy Policy
            </button>
          </p>
        </div>
      </div>
    </div>
  );
}

export default SignupScreen;