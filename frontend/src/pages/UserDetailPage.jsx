import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { request } from "../lib/api";
import { useAuth } from "../state/useAuth";

function AuditRow({ label, actor, timestamp }) {
  return (
    <div className="audit-row">
      <strong>{label}</strong>
      <span>{actor ? `${actor.name} (${actor.email})` : "System"}</span>
      <span>{timestamp ? new Date(timestamp).toLocaleString() : "N/A"}</span>
    </div>
  );
}

export default function UserDetailPage() {
  const { id } = useParams();
  const { token } = useAuth();
  const [user, setUser] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    request(`/users/${id}`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((data) => setUser(data.user))
      .catch((requestError) => setError(requestError.message));
  }, [id, token]);

  if (error) {
    return (
      <section className="card">
        <div className="error-banner">{error}</div>
        <Link className="text-link" to="/users">
          Back to users
        </Link>
      </section>
    );
  }

  if (!user) {
    return <div className="page-state">Loading user details...</div>;
  }

  return (
    <div className="stack-lg">
      <section className="card">
        <div className="section-heading">
          <div>
            <p className="eyebrow">Audit View</p>
            <h2>{user.name}</h2>
          </div>
          <Link className="secondary-button" to="/users">
            Back to Directory
          </Link>
        </div>

        <div className="detail-grid">
          <div>
            <p className="detail-label">Email</p>
            <p>{user.email}</p>
          </div>
          <div>
            <p className="detail-label">Role</p>
            <p>{user.role}</p>
          </div>
          <div>
            <p className="detail-label">Status</p>
            <p>{user.status}</p>
          </div>
          <div>
            <p className="detail-label">Last Login</p>
            <p>{user.lastLoginAt ? new Date(user.lastLoginAt).toLocaleString() : "Never"}</p>
          </div>
        </div>
      </section>

      <section className="card">
        <p className="eyebrow">Audit Trail</p>
        <h3>Record ownership and modification history</h3>
        <div className="audit-list">
          <AuditRow label="Created by" actor={user.createdBy} timestamp={user.createdAt} />
          <AuditRow label="Last updated by" actor={user.updatedBy} timestamp={user.updatedAt} />
        </div>
      </section>
    </div>
  );
}
