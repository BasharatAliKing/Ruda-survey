import { useEffect, useMemo, useState } from "react";
import {
  Plus,
  Search,
  Pencil,
  Trash2,
  Users as UsersIcon,
} from "lucide-react";

import Sidebar from "../components/Sidebar";
import Header from "../components/Header";
import UserModal from "../components/users/UserModal";
import { api } from "../lib/api";

function Users() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [search, setSearch] = useState("");

  const [isModalOpen, setIsModalOpen] = useState(false);

  const [editingUser, setEditingUser] = useState(null);

  useEffect(() => { api.getUsers().then((payload) => setUsers(payload.users || [])).catch((err) => setError(err.message)).finally(() => setLoading(false)); }, []);

  const filteredUsers = useMemo(() => {
    return users.filter((user) => {
      const searchText = search.toLowerCase();

      return (
        user.user_name.toLowerCase().includes(searchText) ||
        user.email.toLowerCase().includes(searchText) ||
        user.role.toLowerCase().includes(searchText)
      );
    });
  }, [users, search]);

  const handleAddUser = () => {
    setEditingUser(null);
    setIsModalOpen(true);
  };

  const handleEditUser = (user) => {
    setEditingUser(user);
    setIsModalOpen(true);
  };

  const handleSaveUser = async (user) => {
    const payload = editingUser ? await api.updateUser(editingUser._id || editingUser.id, user) : await api.createUser(user);
    const saved = payload.user || user;
    setUsers((prev) => editingUser ? prev.map((item) => (item._id === editingUser._id ? { ...item, ...saved } : item)) : [saved, ...prev]);
  };

  const handleDeleteUser = (id) => {
    const confirmed = window.confirm(
      "Are you sure you want to delete this user?"
    );

    if (!confirmed) {
      return;
    }

    api.deleteUser(id).then(() => setUsers((prev) => prev.filter((user) => (user._id || user.id) !== id))).catch((err) => setError(err.message));
  };

  return (
    <div className="app-shell">
      <Sidebar />

      <Header />

      <main className="main-content">
        <div className="page-wrap">
          {/* Heading */}
          <div className="page-heading">
            <div>
              <p className="eyebrow">Workspace / people</p><h1>Users</h1>

              <p className="page-subtitle">
                Manage system users and their roles.
              </p>
            </div>

            <button
              onClick={handleAddUser}
              className="button button-primary"
            >
              <Plus size={19} />

              Add User
            </button>
          </div>

          {/* Table Card */}
          {error && <div className="alert">{error}</div>}<div className="table-card">
            {/* Search */}
            <div className="table-toolbar"><div className="search-box">
                <Search
                  size={19}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                />

                <input
                  type="text"
                  placeholder="Search users..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="search-input"
                />
              </div>

              <div className="toolbar-count">
                <UsersIcon size={18} />

                {users.length} Users
              </div>
            </div>

            {/* Table */}
            <div className="table-scroll">
              <table className="w-full">
                <thead>
                  <tr>
                    <th>
                      User
                    </th>

                    <th>
                      Email
                    </th>

                    <th>
                      Role
                    </th>

                    <th className="align-right">
                      Actions
                    </th>
                  </tr>
                </thead>

                <tbody>
                  {loading ? <tr><td colSpan="4" className="empty-state">Loading users...</td></tr> : filteredUsers.length === 0 ? (
                    <tr>
                      <td
                        colSpan="4"
                        className="empty-state"
                      >
                        No users found.
                      </td>
                    </tr>
                  ) : (
                    filteredUsers.map((user) => (
                      <tr
                        key={user._id || user.id}
                      >
                        {/* User */}
                        <td>
                          <div className="flex items-center gap-3">
                            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-100 font-semibold text-blue-600">
                              {user.user_name
                                .charAt(0)
                                .toUpperCase()}
                            </div>

                            <div>
                              <p className="cell-title">
                                {user.user_name}
                              </p>

                              <p className="cell-meta">
                                ID: {user._id || user.id}
                              </p>
                            </div>
                          </div>
                        </td>

                        {/* Email */}
                        <td className="cell-text">
                          {user.email}
                        </td>

                        {/* Role */}
                        <td><span className={`role-pill ${
                              user.role === "admin"
                                ? "bg-purple-100 text-purple-700"
                                : "bg-blue-100 text-blue-700"
                              }`}>
                            {user.role}
                          </span>
                        </td>

                        {/* Actions */}
                        <td className="align-right">
                          <div className="flex justify-end gap-2">
                            <button
                              onClick={() => handleEditUser(user)} className="icon-button icon-blue"
                              title="Edit"
                            >
                              <Pencil size={18} />
                            </button>

                            <button
                              onClick={() => handleDeleteUser(user._id || user.id)} className="icon-button icon-red"
                              title="Delete"
                            >
                              <Trash2 size={18} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </main>

      {/* Modal */}
      <UserModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={handleSaveUser}
        editingUser={editingUser}
      />
    </div>
  );
}

export default Users;