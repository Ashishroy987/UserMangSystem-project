import { startTransition, useDeferredValue, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import UserForm from "../components/UserForm";
import { request } from "../lib/api";
import { useAuth } from "../state/useAuth";

function buildQuery(params) {
  const searchParams = new URLSearchParams();

  Object.entries(params).forEach(([key, value]) => {
    if (value) {
      searchParams.set(key, value);
    }
  });

  return searchParams.toString();
}

export default function UsersPage() {
  const { token, user } = useAuth();
  const [users, setUsers] = useState([]);
  const [meta, setMeta] = useState({ page: 1, totalPages: 1, total: 0 });
  const [search, setSearch] = useState("");
  const [filters, setFilters] = useState({ role: "", status: "", page: 1 });
  const [editingUser, setEditingUser] = useState(null);
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const deferredSearch = useDeferredValue(search);

  const canCreateUsers = user.role === "admin";
  const canEditRole = user.role === "admin";

  useEffect(() => {
    async function loadUsers() {
      setIsLoading(true);
      setError("");

      try {
        const query = buildQuery({
          page: filters.page,
          search: deferredSearch,
          role: filters.role,
          status: filters.status,
        });

        const data = await request(`/users?${query}`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        startTransition(() => {
          setUsers(data.items);
          setMeta(data.meta);
        });
      } catch (requestError) {
        setError(requestError.message);
      } finally {
        setIsLoading(false);
      }
    }

    loadUsers();
  }, [token, filters, deferredSearch]);

  async function reloadCurrentPage() {
    const query = buildQuery({
      page: filters.page,
      search: deferredSearch,
      role: filters.role,
      status: filters.status,
    });

    const data = await request(`/users?${query}`, {
      headers: { Authorization: `Bearer ${token}` },
    });

    setUsers(data.items);
    setMeta(data.meta);
  }

  async function handleCreate(payload) {
    try {
      await request("/users", {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
        body: JSON.stringify(payload),
      });

      await reloadCurrentPage();
      setEditingUser(null);
    } catch (requestError) {
      setError(requestError.message);
    }
  }

  async function handleEdit(payload) {
    try {
      await request(`/users/${editingUser._id}`, {
        method: "PATCH",
        headers: { Authorization: `Bearer ${token}` },
        body: JSON.stringify(payload),
      });

      await reloadCurrentPage();
      setEditingUser(null);
    } catch (requestError) {
      setError(requestError.message);
    }
  }

  async function handleDeactivate(id) {
    try {
      await request(`/users/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });

      await reloadCurrentPage();
    } catch (requestError) {
      setError(requestError.message);
    }
  }

  function openCreateForm() {
    setEditingUser({
      name: "",
      email: "",
      role: "user",
      status: "active",
    });
  }

  return (
    <div className="stack-lg">
      <section className="card">
        <div className="section-heading">
          <div>
            <p className="eyebrow">Directory</p>
            <h2>User management</h2>
          </div>
          {canCreateUsers ? (
            <button className="primary-button" onClick={openCreateForm}>
              Create User
            </button>
          ) : null}
        </div>

        <div className="toolbar">
          <input
            className="search-input"
            placeholder="Search by name or email"
            value={search}
            onChange={(event) => {
              setSearch(event.target.value);
              setFilters((current) => ({ ...current, page: 1 }));
            }}
          />

          <select
            value={filters.role}
            onChange={(event) =>
              setFilters((current) => ({ ...current, role: event.target.value, page: 1 }))
            }
          >
            <option value="">All roles</option>
            <option value="admin">Admin</option>
            <option value="manager">Manager</option>
            <option value="user">User</option>
          </select>

          <select
            value={filters.status}
            onChange={(event) =>
              setFilters((current) => ({ ...current, status: event.target.value, page: 1 }))
            }
          >
            <option value="">All statuses</option>
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
          </select>
        </div>

        {error ? <div className="error-banner">{error}</div> : null}

        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Name</th>
                <th>Email</th>
                <th>Role</th>
                <th>Status</th>
                <th>Updated</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                <tr>
                  <td colSpan="6">Loading users...</td>
                </tr>
              ) : users.length === 0 ? (
                <tr>
                  <td colSpan="6">No users found for the current filters.</td>
                </tr>
              ) : (
                users.map((entry) => {
                  const cannotEditAdmin = user.role === "manager" && entry.role === "admin";

                  return (
                    <tr key={entry._id}>
                      <td>{entry.name}</td>
                      <td>{entry.email}</td>
                      <td>
                        <span className={`badge badge-${entry.role}`}>{entry.role}</span>
                      </td>
                      <td>{entry.status}</td>
                      <td>{new Date(entry.updatedAt).toLocaleString()}</td>
                      <td className="actions">
                        <Link className="text-link" to={`/users/${entry._id}`}>
                          View
                        </Link>
                        {!cannotEditAdmin ? (
                          <button className="text-link" onClick={() => setEditingUser(entry)}>
                            Edit
                          </button>
                        ) : null}
                        {canCreateUsers && entry.status === "active" ? (
                          <button
                            className="text-link danger-link"
                            onClick={() => handleDeactivate(entry._id)}
                          >
                            Deactivate
                          </button>
                        ) : null}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        <div className="pagination">
          <button
            className="ghost-button"
            disabled={meta.page <= 1}
            onClick={() => setFilters((current) => ({ ...current, page: current.page - 1 }))}
          >
            Previous
          </button>
          <span>
            Page {meta.page} of {meta.totalPages} ({meta.total} users)
          </span>
          <button
            className="ghost-button"
            disabled={meta.page >= meta.totalPages}
            onClick={() => setFilters((current) => ({ ...current, page: current.page + 1 }))}
          >
            Next
          </button>
        </div>
      </section>

      {editingUser ? (
        <UserForm
          key={editingUser._id || "create-user"}
          initialValues={editingUser._id ? editingUser : null}
          onSubmit={editingUser._id ? handleEdit : handleCreate}
          onCancel={() => setEditingUser(null)}
          canEditRole={canEditRole}
        />
      ) : null}
    </div>
  );
}
