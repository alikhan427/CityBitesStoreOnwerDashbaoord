// src/deliveryboy/profile/Profile.jsx
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import "./Profile.css";

/**
 * Delivery Partner Profile (client-side demo).
 * - Persists to localStorage under "user" (merged with existing record).
 * - Avatar stored as base64 data URL (client only).
 * - Emits 'userUpdated' and sets 'user_last_update' after save so navbars and other parts react.
 *
 * NOTE: Replace localStorage usage with your API + Redux for production.
 */
const Profile = () => {
  const navigate = useNavigate();

  const initial = {
    name: "",
    email: "",
    phone: "",
    avatar: "",
    vehicleType: "",
    vehicleName: "",
    plateNumber: "",
    licenseNumber: "",
  };

  const [user, setUser] = useState(initial);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState(null);
  const [errors, setErrors] = useState({});
  const [showPassword, setShowPassword] = useState(false);
  const [passwords, setPasswords] = useState({ current: "", newPass: "", confirm: "" });

  // load existing localStorage user (merge-friendly)
  useEffect(() => {
    try {
      const raw = localStorage.getItem("user");
      if (raw) {
        const parsed = JSON.parse(raw);
        // fill known fields only (defensive)
        setUser((u) => ({ ...u, ...parsed }));
      }
    } catch {
      // ignore parse errors
    }
  }, []);

  // convert file -> base64
  const toBase64 = (file) =>
    new Promise((res, rej) => {
      const reader = new FileReader();
      reader.onload = () => res(reader.result);
      reader.onerror = rej;
      reader.readAsDataURL(file);
    });

  const validate = () => {
    const e = {};
    if (!user.name || user.name.trim().length < 2) e.name = "Name is required";
    if (!user.email || !/^\S+@\S+\.\S+$/.test(user.email)) e.email = "Valid email required";
    if (user.phone && !/^[0-9+\-\s()]{7,20}$/.test(user.phone)) e.phone = "Invalid phone";
    if (!user.vehicleType) e.vehicleType = "Select vehicle type";
    if (!user.vehicleName || user.vehicleName.trim().length < 1) e.vehicleName = "Vehicle name/model required";

    if (passwords.newPass || passwords.confirm || passwords.current) {
      if (!passwords.current) e.current = "Enter current password (demo)";
      if (passwords.newPass.length < 6) e.newPass = "New password must be 6+ chars";
      if (passwords.newPass !== passwords.confirm) e.confirm = "Passwords do not match";
    }

    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleAvatarChange = async (ev) => {
    const f = ev.target.files?.[0];
    if (!f) return;
    if (f.size > 5 * 1024 * 1024) {
      setMessage("Image too large (max 5MB).");
      return;
    }
    try {
      const b64 = await toBase64(f);
      setUser((u) => ({ ...u, avatar: b64 }));
      setMessage("Avatar selected — click Save to persist.");
    } catch (err) {
      console.error(err);
      setMessage("Failed to read file.");
    }
  };

  const handleRemoveAvatar = () => {
    if (!user.avatar) return;
    if (!window.confirm("Remove avatar/logo?")) return;
    setUser((u) => ({ ...u, avatar: "" }));
    setMessage("Avatar removed — click Save to persist.");
  };

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(JSON.stringify(user, null, 2));
      setMessage("Profile copied to clipboard.");
    } catch {
      setMessage("Failed to copy profile.");
    }
  };

  const handleSave = async () => {
    if (!validate()) {
      setMessage("Fix validation errors.");
      return;
    }
    setSaving(true);
    setMessage(null);
    try {
      // merge with existing storage so we don't wipe role/token
      let current = {};
      try {
        const raw = localStorage.getItem("user");
        current = raw ? JSON.parse(raw) : {};
      } catch {}
      const merged = { ...current, ...user, role: current.role || "delivery_boy" };
      localStorage.setItem("user", JSON.stringify(merged));

      // notify other tabs/components
      window.dispatchEvent(new Event("userUpdated"));
      try {
        localStorage.setItem("user_last_update", String(Date.now()));
      } catch {}

      // demo: clear password inputs
      if (passwords.newPass) setPasswords({ current: "", newPass: "", confirm: "" });

      setMessage("Profile saved.");
    } catch (err) {
      console.error(err);
      setMessage("Failed to save profile.");
    } finally {
      setSaving(false);
    }
  };

  const handleLogout = () => {
    if (!window.confirm("Logout?")) return;
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    try {
      localStorage.setItem("user_last_update", String(Date.now()));
    } catch {}
    window.dispatchEvent(new Event("userUpdated"));
    navigate("/login", { replace: true });
  };

  const handleRemoveLocal = () => {
    if (!window.confirm("This removes local profile data only. Continue?")) return;
    localStorage.removeItem("user");
    localStorage.removeItem("token");
    try {
      localStorage.setItem("user_last_update", String(Date.now()));
    } catch {}
    window.dispatchEvent(new Event("userUpdated"));
    navigate("/login", { replace: true });
  };

  const initials = (() => {
    const n = user?.name || "";
    if (!n) return "DB";
    const parts = n.split(/\s+/);
    if (parts.length === 1) return parts[0].charAt(0).toUpperCase();
    return (parts[0].charAt(0) + parts[1].charAt(0)).toUpperCase();
  })();

  return (
    <div className="dbp-page">
      <div className="dbp-card">
        <h2>Delivery Partner Profile</h2>

        {message && <div className="dbp-msg">{message}</div>}

        <div className="dbp-grid">
          <div className="dbp-left">
            <div className="dbp-row avatar-row">
              <label>Logo / Avatar</label>
              <div className="dbp-avatar-block">
                {user.avatar ? (
                  <img src={user.avatar} alt="avatar preview" className="dbp-avatar-preview" />
                ) : (
                  <div className="dbp-avatar-placeholder">{initials}</div>
                )}

                <div className="dbp-avatar-controls">
                  <input type="file" accept="image/*" onChange={handleAvatarChange} />
                  <div className="dbp-avatar-actions">
                    <button className="btn" onClick={handleRemoveAvatar} type="button">
                      Remove
                    </button>
                    <button className="btn" onClick={handleCopy} type="button">
                      Copy JSON
                    </button>
                  </div>
                  <small className="muted">Max 5MB. JPG/PNG/WebP. Click Save to persist.</small>
                </div>
              </div>
            </div>

            <div className="dbp-row">
              <label>Full name</label>
              <input
                type="text"
                value={user.name}
                onChange={(e) => setUser((u) => ({ ...u, name: e.target.value }))}
                placeholder="Full name"
              />
              {errors.name && <div className="field-error">{errors.name}</div>}
            </div>

            <div className="dbp-row">
              <label>Email</label>
              <input
                type="email"
                value={user.email}
                onChange={(e) => setUser((u) => ({ ...u, email: e.target.value }))}
                placeholder="email@example.com"
              />
              {errors.email && <div className="field-error">{errors.email}</div>}
            </div>

            <div className="dbp-row">
              <label>Phone</label>
              <input
                type="text"
                value={user.phone}
                onChange={(e) => setUser((u) => ({ ...u, phone: e.target.value }))}
                placeholder="+92 300 0000000"
              />
              {errors.phone && <div className="field-error">{errors.phone}</div>}
            </div>
          </div>

          <div className="dbp-right">
            <div className="dbp-row">
              <label>Vehicle type</label>
              <select
                value={user.vehicleType}
                onChange={(e) => setUser((u) => ({ ...u, vehicleType: e.target.value }))}
              >
                <option value="">Select vehicle</option>
                <option value="motorcycle">Motorcycle</option>
                <option value="scooter">Scooter</option>
                <option value="car">Car</option>
                <option value="bicycle">Bicycle</option>
                <option value="other">Other</option>
              </select>
              {errors.vehicleType && <div className="field-error">{errors.vehicleType}</div>}
            </div>

            <div className="dbp-row">
              <label>Vehicle name / model</label>
              <input
                type="text"
                value={user.vehicleName}
                onChange={(e) => setUser((u) => ({ ...u, vehicleName: e.target.value }))}
                placeholder="e.g. Honda CG125"
              />
              {errors.vehicleName && <div className="field-error">{errors.vehicleName}</div>}
            </div>

            <div className="dbp-row">
              <label>Plate number</label>
              <input
                type="text"
                value={user.plateNumber}
                onChange={(e) => setUser((u) => ({ ...u, plateNumber: e.target.value }))}
                placeholder="ABC-1234"
              />
            </div>

            <div className="dbp-row">
              <label>License number</label>
              <input
                type="text"
                value={user.licenseNumber}
                onChange={(e) => setUser((u) => ({ ...u, licenseNumber: e.target.value }))}
                placeholder="DL12345678"
              />
            </div>
          </div>
        </div>

        <hr />

        <div className="dbp-row">
          <label>Change password (demo)</label>
          <div className="password-row">
            <input
              type={showPassword ? "text" : "password"}
              placeholder="Current password"
              value={passwords.current}
              onChange={(e) => setPasswords((p) => ({ ...p, current: e.target.value }))}
            />
            <input
              type={showPassword ? "text" : "password"}
              placeholder="New password"
              value={passwords.newPass}
              onChange={(e) => setPasswords((p) => ({ ...p, newPass: e.target.value }))}
            />
            <input
              type={showPassword ? "text" : "password"}
              placeholder="Confirm new password"
              value={passwords.confirm}
              onChange={(e) => setPasswords((p) => ({ ...p, confirm: e.target.value }))}
            />
            <label className="show-pass">
              <input type="checkbox" checked={showPassword} onChange={() => setShowPassword((s) => !s)} />
              <span>Show</span>
            </label>
          </div>

          {errors.current && <div className="field-error">{errors.current}</div>}
          {errors.newPass && <div className="field-error">{errors.newPass}</div>}
          {errors.confirm && <div className="field-error">{errors.confirm}</div>}
          <small className="muted">Password change is demo-only — call your API to update passwords in production.</small>
        </div>

        <div className="dbp-actions">
          <div className="left-actions">
            <button className="btn btn-primary" onClick={handleSave} disabled={saving}>
              {saving ? "Saving..." : "Save profile"}
            </button>
            <button className="btn" onClick={() => navigate(-1)} disabled={saving}>
              Cancel
            </button>
          </div>

          <div className="right-actions">
            <button className="btn logout-btn" onClick={handleLogout}>
              Logout
            </button>
            <button className="btn danger" onClick={handleRemoveLocal}>
              Remove Local Profile
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;
