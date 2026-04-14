import { Link } from "react-router-dom";
import { useAuth } from "../state/useAuth";

export default function DashboardPage() {
  const { user } = useAuth();
  const canManageUsers = user.role === "admin" || user.role === "manager";

  return (
    <div className="stack-lg">
      <section className="hero card">
        <div>
          <p className="eyebrow">Dashboard</p>
          <h2>Welcome back, {user.name}</h2>
          <p className="muted">
            Your current role is <strong>{user.role}</strong>. The interface below only exposes
            actions your account is allowed to perform.
          </p>
        </div>
        <div className="hero-actions">
          <Link className="primary-button" to="/profile">
            Manage my profile
          </Link>
          {canManageUsers ? (
            <Link className="secondary-button" to="/users">
              Open user directory
            </Link>
          ) : null}
        </div>
      </section>

      <section className="stats-grid">
        <article className="card stat-card">
          <p className="eyebrow">Access</p>
          <h3>
            {user.role === "admin"
              ? "Full user control"
              : user.role === "manager"
                ? "Limited admin control"
                : "Self-service only"}
          </h3>
          <p className="muted">
            {user.role === "admin"
              ? "Create, edit, deactivate, and inspect every account."
              : user.role === "manager"
                ? "View users and update non-admin accounts."
                : "View and update only your own profile."}
          </p>
        </article>
        <article className="card stat-card">
          <p className="eyebrow">Status</p>
          <h3>{user.status}</h3>
          <p className="muted">Inactive accounts are prevented from signing in by the backend.</p>
        </article>
        <article className="card stat-card">
          <p className="eyebrow">Audit</p>
          <h3>Tracked automatically</h3>
          <p className="muted">
            Created by, updated by, and timestamps are captured for user records.
          </p>
        </article>
      </section>

      <section className="card">
        <p className="eyebrow">Suggested Flow</p>
        <h3>What to demo in the assessment video</h3>
        <div className="list-block">
          <p>1. Login as admin and browse the paginated user table.</p>
          <p>2. Create a new user, update the role or status, and open the audit detail view.</p>
          <p>3. Login as manager and show that admin edits are blocked.</p>
          <p>4. Login as a regular user and show profile-only access.</p>
        </div>
      </section>
    </div>
  );
}
