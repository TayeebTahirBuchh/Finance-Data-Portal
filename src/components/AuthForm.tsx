import { useState, type FormEvent } from "react";
import { loginUser, registerUser } from "../lib/auth-api";

interface AuthFormProps {
  onAuthenticated: () => void;
}

export default function AuthForm({
  onAuthenticated,
}: AuthFormProps) {
  const [isRegistering, setIsRegistering] = useState(false);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      if (isRegistering) {
        await registerUser({ name, email, password });
        await loginUser(email, password);
      } else {
        await loginUser(email, password);
      }

      onAuthenticated();
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Something went wrong. Please try again."
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="min-h-screen bg-[#F5F5F4] flex items-center justify-center p-4">
      <section className="w-full max-w-md bg-white rounded-3xl border border-[#E7E5E4] shadow-sm p-8">
        <div className="mb-8">
          <div className="w-12 h-12 bg-[#1C1917] rounded-xl flex items-center justify-center text-white text-xl font-bold mb-5">
            ₹
          </div>

          <h1 className="text-2xl font-bold text-[#1C1917]">
            Finance Data Portal
          </h1>

          <p className="text-sm text-[#78716C] mt-2">
            {isRegistering
              ? "Create your account to get started."
              : "Welcome back. Sign in to continue."}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {isRegistering && (
            <input
              type="text"
              placeholder="Full name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              minLength={2}
              maxLength={80}
              className="w-full p-3 rounded-xl border border-[#E7E5E4] text-sm outline-none focus:ring-2 focus:ring-[#1C1917]"
            />
          )}

          <input
            type="email"
            placeholder="Email address"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            maxLength={254}
            autoComplete="email"
            className="w-full p-3 rounded-xl border border-[#E7E5E4] text-sm outline-none focus:ring-2 focus:ring-[#1C1917]"
          />

          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            minLength={8}
            autoComplete={
              isRegistering ? "new-password" : "current-password"
            }
            className="w-full p-3 rounded-xl border border-[#E7E5E4] text-sm outline-none focus:ring-2 focus:ring-[#1C1917]"
          />

          {error && (
            <p className="text-sm text-red-600 bg-red-50 p-3 rounded-xl">
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-[#1C1917] text-white p-3 rounded-xl text-sm font-semibold hover:bg-[#44403C] disabled:opacity-50"
          >
            {loading
              ? "Please wait..."
              : isRegistering
                ? "Create account"
                : "Sign in"}
          </button>
        </form>

        <p className="text-center text-sm text-[#78716C] mt-6">
          {isRegistering
            ? "Already have an account?"
            : "Don't have an account?"}

          <button
            type="button"
            onClick={() => {
              setIsRegistering(!isRegistering);
              setError("");
            }}
            className="ml-2 font-semibold text-[#1C1917] hover:underline"
          >
            {isRegistering ? "Sign in" : "Create account"}
          </button>
        </p>
      </section>
    </main>
  );
}
