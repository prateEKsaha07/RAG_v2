import { useState } from "react"
import { supabase } from "../supabaseClient"

function SignupScreen({ onSignup, onLogin }) {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [confirm, setConfirm] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")

  const handleSignup = async () => {
    if (!email || !password || !confirm) {
      setError("Please fill in all fields")
      return
    }

    if (password !== confirm) {
      setError("Passwords don't match!")
      return
    }

    if (password.length < 6) {
      setError("Password must be at least 6 characters")
      return
    }

    setLoading(true)
    setError("")

    const { data, error } = await supabase.auth.signUp({
      email,
      password
    })

    if (error) {
      setError(error.message)
    } else {
      setSuccess("Account created! Check your email to confirm.")
      setTimeout(() => onLogin(), 3000)
    }

    setLoading(false)
  }

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center">
      <div className="bg-white rounded-xl p-8 shadow w-full max-w-md">

        <h2 className="text-2xl font-bold mb-2">Create Account 🚀</h2>
        <p className="text-gray-500 text-sm mb-6">
          Join RAG_V2 and start studying smarter
        </p>

        <div className="mb-4">
          <label className="block text-sm font-medium mb-1">Email</label>
          <input
            type="email"
            placeholder="you@example.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full border rounded-lg p-2 text-sm"
          />
        </div>

        <div className="mb-4">
          <label className="block text-sm font-medium mb-1">Password</label>
          <input
            type="password"
            placeholder="••••••••"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full border rounded-lg p-2 text-sm"
          />
        </div>

        <div className="mb-6">
          <label className="block text-sm font-medium mb-1">
            Confirm Password
          </label>
          <input
            type="password"
            placeholder="••••••••"
            value={confirm}
            onChange={(e) => setConfirm(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSignup()}
            className="w-full border rounded-lg p-2 text-sm"
          />
        </div>

        {error && (
          <p className="text-red-500 text-sm mb-4">{error}</p>
        )}

        {success && (
          <p className="text-green-600 text-sm mb-4">{success}</p>
        )}

        <button
          onClick={handleSignup}
          disabled={loading}
          className="w-full bg-blue-600 text-white py-2 rounded-lg
                     font-medium hover:bg-blue-700 disabled:opacity-50 mb-4"
        >
          {loading ? "Creating account..." : "Sign Up"}
        </button>

        <p className="text-center text-sm text-gray-500">
          Already have an account?{" "}
          <button
            onClick={onLogin}
            className="text-blue-600 hover:underline font-medium"
          >
            Login
          </button>
        </p>
      </div>
    </div>
  )
}

export default SignupScreen