import { startTransition, useState } from "react";
import { Link, Navigate, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../state/useAuth";

export default function LoginPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { login, isAuthenticated } = useAuth();
  const [email, setEmail] = useState("admin@purplemerit.local");
  const [password, setPassword] = useState("Admin@123");
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const destination = location.state?.from?.pathname || "/";

  if (isAuthenticated) {
    return <Navigate to="/" replace />;
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setIsSubmitting(true);
    setError("");

    try {
      await login({ email, password });
      startTransition(() => {
        navigate(destination, { replace: true });
      });
    } catch (requestError) {
      setError(requestError.message);
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="login-page">
      <div className="login-card">
        <p className="eyebrow">MERN Intern Assessment</p>
        <h1>Role-based user administration</h1>
        <p className="muted">
          Sign in with one of the seeded accounts to explore admin, manager, and self-service
          user flows.
        </p>

        <form className="stack" onSubmit={handleSubmit}>
          <label className="field">
            <span>Email</span>
            <input type="email" value={email} onChange={(event) => setEmail(event.target.value)} />
          </label>
          <label className="field">
            <span>Password</span>
            <input
              type="password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
            />
          </label>

          {error ? <div className="error-banner">{error}</div> : null}

          <button className="primary-button" type="submit" disabled={isSubmitting}>
            {isSubmitting ? "Signing in..." : "Login"}
          </button>
        </form>

        <div className="demo-credentials">
          <strong>Demo accounts</strong>
          <p>Admin: admin@purplemerit.local / Admin@123</p>
          <p>Manager: manager@purplemerit.local / Manager@123</p>
          <p>User: user@purplemerit.local / User@1234</p>
        </div>

        <p className="auth-switch">
          New here?{" "}
          <Link className="inline-link" to="/register">
            Create an account
          </Link>
        </p>
      </div>
    </div>
  );
}
