import { useState } from "react";

const emptyForm = {
  name: "",
  email: "",
  password: "",
  role: "user",
  status: "active",
};

export default function UserForm({ initialValues, onSubmit, onCancel, canEditRole }) {
  const [form, setForm] = useState(() =>
    initialValues
      ? {
          name: initialValues.name || "",
          email: initialValues.email || "",
          password: "",
          role: initialValues.role || "user",
          status: initialValues.status || "active",
        }
      : emptyForm,
  );

  function handleChange(event) {
    const { name, value } = event.target;
    setForm((current) => ({ ...current, [name]: value }));
  }

  function handleSubmit(event) {
    event.preventDefault();

    const payload = {
      name: form.name,
      email: form.email,
      status: form.status,
    };

    if (canEditRole) {
      payload.role = form.role;
    }

    if (form.password) {
      payload.password = form.password;
    }

    onSubmit(payload);
  }

  const isEditing = Boolean(initialValues?._id);

  return (
    <form className="card user-form stack" onSubmit={handleSubmit}>
      <div className="section-heading">
        <div>
          <p className="eyebrow">{isEditing ? "Edit User" : "Create User"}</p>
          <h3>{isEditing ? "Update account details" : "Add a new team member"}</h3>
        </div>
        {onCancel ? (
          <button type="button" className="ghost-button" onClick={onCancel}>
            Cancel
          </button>
        ) : null}
      </div>

      <label className="field">
        <span>Name</span>
        <input name="name" value={form.name} onChange={handleChange} required />
      </label>

      <label className="field">
        <span>Email</span>
        <input name="email" type="email" value={form.email} onChange={handleChange} required />
      </label>

      <label className="field">
        <span>{isEditing ? "New Password" : "Password"}</span>
        <input
          name="password"
          type="password"
          value={form.password}
          onChange={handleChange}
          required={!isEditing}
          minLength={8}
        />
      </label>

      <div className="field-grid">
        <label className="field">
          <span>Role</span>
          <select
            name="role"
            value={form.role}
            onChange={handleChange}
            disabled={!canEditRole}
          >
            <option value="user">User</option>
            <option value="manager">Manager</option>
            <option value="admin">Admin</option>
          </select>
        </label>

        <label className="field">
          <span>Status</span>
          <select name="status" value={form.status} onChange={handleChange}>
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
          </select>
        </label>
      </div>

      <button className="primary-button" type="submit">
        {isEditing ? "Save Changes" : "Create User"}
      </button>
    </form>
  );
}
