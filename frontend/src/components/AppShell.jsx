import { NavLink, Outlet } from "react-router-dom";
import { useAuth } from "../state/useAuth";

const roleLabels = {
  admin: "Administrator",
  manager: "Manager",
  user: "User",
};

export default function AppShell() {
  const { user, logout } = useAuth();
  const canBrowseUsers = user?.role === "admin" || user?.role === "manager";

  return (
    <div className="app-shell">
      <aside className="sidebar">
        <div>
          <p className="eyebrow">Purple Merit Assessment</p>
          <h1 className="sidebar-title">User Management System</h1>
          <p className="sidebar-copy">
            Secure role-based access, user lifecycle management, and audit visibility in one
            workflow.
          </p>
        </div>

        <nav className="nav-list">
          <NavLink to="/" end className="nav-link">
            Dashboard
          </NavLink>
          {canBrowseUsers ? (
            <NavLink to="/users" className="nav-link">
              Users
            </NavLink>
          ) : null}
          <NavLink to="/profile" className="nav-link">
            My Profile
          </NavLink>
        </nav>

        <div className="sidebar-footer">
          <div className="profile-chip">
            <div className="profile-chip__avatar">{user.name.slice(0, 1).toUpperCase()}</div>
            <div>
              <strong>{user.name}</strong>
              <p>{roleLabels[user.role]}</p>
            </div>
          </div>
          <button className="ghost-button" onClick={logout}>
            Log out
          </button>
        </div>
      </aside>

      <main className="content-panel">
        <Outlet />
      </main>
    </div>
  );
}
