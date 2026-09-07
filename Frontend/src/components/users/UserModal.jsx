import { useEffect, useState } from "react";
import { AtSign, KeyRound, ShieldCheck, UserRound, X } from "lucide-react";

function UserModal({ isOpen, onClose, onSave, editingUser }) {
  const [formData, setFormData] = useState({
    user_name: "",
    email: "",
    password: "",
    role: "user",
  });

  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (editingUser) {
      setFormData({
        user_name: editingUser.user_name,
        email: editingUser.email,
        password: editingUser.password,
        role: editingUser.role,
      });
    } else {
      setFormData({
        user_name: "",
        email: "",
        password: "",
        role: "user",
      });
    }

    setErrors({});
  }, [editingUser, isOpen]);

  if (!isOpen) {
    return null;
  }

  const handleChange = (e) => {
    const { name, value } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    setErrors((prev) => ({
      ...prev,
      [name]: "",
    }));
  };

  const validate = () => {
    const newErrors = {};

    if (!formData.user_name.trim()) {
      newErrors.user_name = "Username is required";
    }

    if (!formData.email.trim()) {
      newErrors.email = "Email is required";
    }

    if (!formData.password.trim()) {
      newErrors.password = "Password is required";
    }

    if (!formData.role) {
      newErrors.role = "Role is required";
    }

    setErrors(newErrors);

    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validate()) {
      return;
    }

    try {
      await onSave(editingUser ? { ...editingUser, ...formData } : formData);
      onClose();
    } catch (saveError) {
      setErrors({ form: saveError.message });
    }
  };

  return (
    <div className="modal-backdrop">
      <div className="modal user-modal">
        {/* Header */}
        <div className="modal-header">
          <div>
            <p className="eyebrow">People / access control</p>
            <h2>
              {editingUser ? "Edit User" : "Add User"}
            </h2>

            <p className="modal-subtitle">
              {editingUser
                ? "Update user information"
                : "Create a new user"}
            </p>
          </div>

          <button
            onClick={onClose}
            className="icon-button icon-blue"
          >
            <X size={20} />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="user-form">
          <div className="user-form-banner"><div className="user-form-avatar"><UserRound size={22} /></div><div><strong>{editingUser ? "Update account details" : "Create a workspace account"}</strong><span>Set the identity and permission level for this user.</span></div></div>
          {/* Username */}
          <label className="user-field">
            <span className="user-field-label"><UserRound size={15} /> Username</span>
            <div className="user-input-wrap">
              <input
                type="text"
                name="user_name"
                value={formData.user_name}
                onChange={handleChange}
                placeholder="e.g. Ayesha Khan"
                className={errors.user_name ? "has-error" : ""}
              />
            </div>
            {errors.user_name && <p className="field-error">{errors.user_name}</p>}
          </label>

          {/* Email */}
          <label className="user-field">
            <span className="user-field-label"><AtSign size={15} /> Email address</span>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="name@company.com"
              className={errors.email ? "has-error" : ""}
            />
            {errors.email && <p className="field-error">{errors.email}</p>}
          </label>

          {/* Password */}
          <label className="user-field">
            <span className="user-field-label"><KeyRound size={15} /> Password</span>
            <input
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              placeholder={editingUser ? "Enter a new password" : "Create a secure password"}
              className={errors.password ? "has-error" : ""}
            />
            {errors.password && <p className="field-error">{errors.password}</p>}
          </label>

          {/* Role */}
          <label className="user-field">
            <span className="user-field-label"><ShieldCheck size={15} /> Access role</span>
            <select
              name="role"
              value={formData.role}
              onChange={handleChange}
              className="user-select"
            >
              <option value="user">User</option>
              <option value="admin">Admin</option>
            </select>
            <span className="role-hint">{formData.role === "admin" ? "Full access to users, surveys and system settings." : "Standard access for managing assigned survey work."}</span>
          </label>

          {errors.form && <p className="form-error">{errors.form}</p>}

          {/* Buttons */}
          <div className="modal-actions">
            <button
              type="button"
              onClick={onClose}
              className="button button-muted"
            >
              Cancel
            </button>

            <button
              type="submit"
              className="button button-primary"
            >
              {editingUser ? "Update User" : "Create User"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default UserModal;