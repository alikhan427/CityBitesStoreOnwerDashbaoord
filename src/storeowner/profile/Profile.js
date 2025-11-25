import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import "./Profile.css";

/**
 * Profile page for store-owner (client-side/demo).
 * - Stores profile in localStorage (user key).
 * - Avatar is stored as base64 (client-only). No external URLs.
 * - Emits 'userUpdated' event and sets 'user_last_update' to notify other tabs.
 *
 * NOTE: Replace localStorage persistence with your API + Redux when integrating backend.
 */
const Profile = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState({ name: "", email: "", phone: "", avatar: "" });
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState(null);
  const [errors, setErrors] = useState({});
  const [showPassword, setShowPassword] = useState(false);
  const [passwords, setPasswords] = useState({ current: "", newPass: "", confirm: "" });

  useEffect(() => {
    try {
      const raw = localStorage.getItem("user");
      if (raw) setUser((u) => ({ ...u, ...JSON.parse(raw) }));
    } catch {
      // ignore
    }
  }, []);

  const validate = () => {
    const errs = {};
    if (!user.name || user.name.trim().length < 2) errs.name = "Name is required";
    if (!user.email || !/^\S+@\S+\.\S+$/.test(user.email)) errs.email = "Valid email is required";
    if (user.phone && !/^[0-9+\-\s()]{7,20}$/.test(user.phone)) errs.phone = "Invalid phone";
    if (passwords.newPass || passwords.confirm || passwords.current) {
      if (!passwords.current) errs.current = "Enter current password (demo)";
      if (passwords.newPass.length < 6) errs.newPass = "New password must be 6+ chars";
      if (passwords.newPass !== passwords.confirm) errs.confirm = "Passwords don't match";
    }
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const toBase64 = (file) =>
    new Promise((res, rej) => {
      const reader = new FileReader();
      reader.onload = () => res(reader.result);
      reader.onerror = rej;
      reader.readAsDataURL(file);
    });

  const handleAvatarChange = async (e) => {
    const f = e.target.files?.[0];
    if (!f) return;
    if (f.size > 5 * 1024 * 1024) {
      setMessage("Image too large (max 5MB).");
      return;
    }
    try {
      const b64 = await toBase64(f);
      setUser((u) => ({ ...u, avatar: b64 }));
      setMessage("Avatar selected (preview shown). Click Save to persist.");
    } catch (err) {
      console.error(err);
      setMessage("Failed to read file.");
    }
  };

  const handleRemoveAvatar = () => {
    if (!user.avatar) return;
    if (!window.confirm("Remove avatar?")) return;
    setUser((u) => ({ ...u, avatar: "" }));
    setMessage("Avatar removed. Click Save to persist.");
  };

  const handleCopyProfile = async () => {
    try {
      await navigator.clipboard.writeText(JSON.stringify(user, null, 2));
      setMessage("Profile JSON copied to clipboard.");
    } catch {
      setMessage("Failed to copy (clipboard permission?).");
    }
  };

  const handleLogout = () => {
    if (!window.confirm("Are you sure you want to logout?")) return;
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    try {
      localStorage.setItem("user_last_update", String(Date.now()));
    } catch {}
    window.dispatchEvent(new Event("userUpdated"));
    navigate("/login", { replace: true });
  };

  const handleSave = async () => {
    if (!validate()) {
      setMessage("Fix validation errors.");
      return;
    }
    setSaving(true);
    setMessage(null);
    try {
      localStorage.setItem("user", JSON.stringify(user));
      window.dispatchEvent(new Event("userUpdated"));
      try {
        localStorage.setItem("user_last_update", String(Date.now()));
      } catch {}
      if (passwords.newPass) setPasswords({ current: "", newPass: "", confirm: "" });
      setMessage("Profile saved.");
    } catch (err) {
      console.error(err);
      setMessage("Failed to save profile.");
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => navigate(-1);

  const initials = (() => {
    const name = user?.name || user?.fullName || user?.username || "";
    if (!name) return "SO";
    const parts = name.trim().split(/\s+/);
    if (parts.length === 1) return parts[0].charAt(0).toUpperCase();
    return (parts[0].charAt(0) + parts[1].charAt(0)).toUpperCase();
  })();

  return (
    <div className="profile-page">
      <div className="profile-card">
        <h2>Store Owner Profile</h2>

        {message && <div className="profile-msg">{message}</div>}

        <div className="profile-row avatar-row">
          <label>Avatar</label>

          <div className="avatar-block">
            {user.avatar ? (
              <img src={user.avatar} alt="avatar preview" className="avatar-preview" />
            ) : (
              <div className="avatar-placeholder">{initials}</div>
            )}

            <div className="avatar-controls">
              <input type="file" accept="image/*" onChange={handleAvatarChange} />
              <div className="avatar-actions">
                <button className="btn" onClick={handleRemoveAvatar} type="button">
                  Remove
                </button>
                <button className="btn" onClick={handleCopyProfile} type="button">
                  Copy JSON
                </button>
              </div>
              <small className="muted">Max 5MB. JPG / PNG / WebP. Click Save to persist changes.</small>
            </div>
          </div>
        </div>

        <div className="profile-row">
          <label>Name</label>
          <input type="text" value={user.name} onChange={(e) => setUser((u) => ({ ...u, name: e.target.value }))} placeholder="Full name" />
          {errors.name && <div className="field-error">{errors.name}</div>}
        </div>

        <div className="profile-row">
          <label>Email</label>
          <input type="email" value={user.email} onChange={(e) => setUser((u) => ({ ...u, email: e.target.value }))} placeholder="email@example.com" />
          {errors.email && <div className="field-error">{errors.email}</div>}
        </div>

        <div className="profile-row">
          <label>Phone</label>
          <input type="text" value={user.phone} onChange={(e) => setUser((u) => ({ ...u, phone: e.target.value }))} placeholder="+92 300 0000000" />
          {errors.phone && <div className="field-error">{errors.phone}</div>}
        </div>

        <hr />

        <div className="profile-row">
          <label>Change Password (demo)</label>
          <div className="password-row">
            <input type={showPassword ? "text" : "password"} placeholder="Current password" value={passwords.current} onChange={(e) => setPasswords((p) => ({ ...p, current: e.target.value }))} />
            <input type={showPassword ? "text" : "password"} placeholder="New password" value={passwords.newPass} onChange={(e) => setPasswords((p) => ({ ...p, newPass: e.target.value }))} />
            <input type={showPassword ? "text" : "password"} placeholder="Confirm new password" value={passwords.confirm} onChange={(e) => setPasswords((p) => ({ ...p, confirm: e.target.value }))} />
            <label className="show-pass">
              <input type="checkbox" checked={showPassword} onChange={() => setShowPassword((s) => !s)} />
              <span>Show</span>
            </label>
          </div>
          {errors.current && <div className="field-error">{errors.current}</div>}
          {errors.newPass && <div className="field-error">{errors.newPass}</div>}
          {errors.confirm && <div className="field-error">{errors.confirm}</div>}
          <small className="muted">Password change is demo-only — implement via backend for production.</small>
        </div>

        <div className="profile-actions-row">
          <div className="left-actions">
            <button className="btn btn-primary" onClick={handleSave} disabled={saving}>
              {saving ? "Saving..." : "Save"}
            </button>
            <button className="btn" onClick={handleCancel} disabled={saving}>
              Cancel
            </button>
          </div>

          <div className="right-actions">
            <button className="btn logout-btn" onClick={handleLogout} type="button">
              Logout
            </button>
            <button
              className="btn danger"
              onClick={() => {
                if (!window.confirm("This clears only local profile data. Continue?")) return;
                localStorage.removeItem("user");
                localStorage.removeItem("token");
                try {
                  localStorage.setItem("user_last_update", String(Date.now()));
                } catch {}
                window.dispatchEvent(new Event("userUpdated"));
                navigate("/login", { replace: true });
              }}
              type="button"
            >
              Remove Local Profile
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;