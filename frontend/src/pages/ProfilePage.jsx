import { useEffect, useState } from "react";
import { request } from "../lib/api";
import { useAuth } from "../state/useAuth";

export default function ProfilePage() {
  const { token, updateUser } = useAuth();
  const [profile, setProfile] = useState(null);
  const [form, setForm] = useState({ name: "", password: "" });
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    request("/users/me", {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((data) => {
        setProfile(data.user);
        setForm({ name: data.user.name, password: "" });
      })
      .catch((requestError) => setError(requestError.message));
  }, [token]);

  function handleChange(event) {
    const { name, value } = event.target;
    setForm((current) => ({ ...current, [name]: value }));
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setMessage("");
    setError("");

    try {
      const payload = { name: form.name };

      if (form.password) {
        payload.password = form.password;
      }

      const data = await request("/users/me", {
        method: "PATCH",
        headers: { Authorization: `Bearer ${token}` },
        body: JSON.stringify(payload),
      });

      setProfile(data.user);
      updateUser(data.user);
      setForm({ name: data.user.name, password: "" });
      setMessage("Profile updated successfully.");
    } catch (requestError) {
      setError(requestError.message);
    }
  }

  if (!profile) {
    return <div className="page-state">Loading profile...</div>;
  }

  return (
    <div className="stack-lg">
      <section className="card">
        <p className="eyebrow">My Profile</p>
        <h2>Self-service account management</h2>
        <p className="muted">
          You can update your own name and password here. Role changes are intentionally blocked.
        </p>
      </section>

      <section className="profile-grid">
        <form className="card stack" onSubmit={handleSubmit}>
          <label className="field">
            <span>Name</span>
            <input name="name" value={form.name} onChange={handleChange} required />
          </label>
          <label className="field">
            <span>New Password</span>
            <input
              name="password"
              type="password"
              value={form.password}
              onChange={handleChange}
              minLength={8}
            />
          </label>
          {message ? <div className="success-banner">{message}</div> : null}
          {error ? <div className="error-banner">{error}</div> : null}
          <button className="primary-button" type="submit">
            Save Profile
          </button>
        </form>

        <div className="card stack">
          <div>
            <p className="detail-label">Email</p>
            <p>{profile.email}</p>
          </div>
          <div>
            <p className="detail-label">Role</p>
            <p>{profile.role}</p>
          </div>
          <div>
            <p className="detail-label">Status</p>
            <p>{profile.status}</p>
          </div>
          <div>
            <p className="detail-label">Created</p>
            <p>{new Date(profile.createdAt).toLocaleString()}</p>
          </div>
          <div>
            <p className="detail-label">Updated</p>
            <p>{new Date(profile.updatedAt).toLocaleString()}</p>
          </div>
        </div>
      </section>
    </div>
  );
}
