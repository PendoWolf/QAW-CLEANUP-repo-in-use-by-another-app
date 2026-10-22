import { useState, type FormEvent } from "react";
import { Navigate, useLocation, useNavigate } from "react-router-dom";
import { pendo } from "../analytics/pendo";
import { ApiError } from "../api/client";
import { useAuth } from "../auth/AuthContext";

/** Why a sign-in failed: the API rejected it (4xx), the API failed (5xx), or it couldn't be reached. */
function signInErrorType(e: unknown): "invalid_credentials" | "server_error" | "network_error" {
  // Only an ApiError has an HTTP status: fetch rejects with a TypeError when the API can't be reached.
  if (!(e instanceof ApiError)) return "network_error";
  return e.status >= 500 ? "server_error" : "invalid_credentials";
}

/** Signs a user in with their email and password against the Tripwise API. */
export function SignInPage() {
  const { user, signIn } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [signingIn, setSigningIn] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const from = (location.state as { from?: string } | null)?.from ?? "/trips";
  if (user) {
    return <Navigate to={from} replace />;
  }

  const submit = async (event: FormEvent) => {
    event.preventDefault();
    setSigningIn(true);
    setError(null);
    try {
      const session = await signIn(email.trim(), password);
      // Identify the user first, so Pendo attributes the sign-in to them, not to an anonymous visitor.
      pendo.identify({ visitor: { id: session.user.id }, account: { id: session.account.id } });
      pendo.track("sign_in_succeeded", {
        return_path: from,
        user_role: session.user.role,
        account_plan: session.account.plan,
      });
      navigate(from, { replace: true });
    } catch (e) {
      // Every failure shows the same message, so record what went wrong. Never the email or password.
      pendo.track("sign_in_failed", {
        error_status: e instanceof ApiError ? e.status : undefined,
        error_type: signInErrorType(e),
        return_path: from,
      });
      setError("That email and password don't match an account.");
    } finally {
      setSigningIn(false);
    }
  };

  return (
    <main className="sign-in">
      <form className="card" aria-labelledby="sign-in-heading" onSubmit={submit}>
        <h1 id="sign-in-heading">Sign in to Tripwise</h1>
        <label>
          Email
          <input type="email" autoComplete="email" value={email} onChange={(e) => setEmail(e.target.value)} />
        </label>
        <label>
          Password
          <input
            type="password"
            autoComplete="current-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </label>
        {error && <p className="error">{error}</p>}
        <button type="submit" disabled={email.trim() === "" || password === "" || signingIn}>
          {signingIn ? "Signing in…" : "Sign in"}
        </button>
      </form>
    </main>
  );
}
