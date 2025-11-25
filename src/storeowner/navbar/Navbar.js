// src/storeowner/navbar/Navbar.jsx
import React, { useEffect, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import "./Navbar.css";

/**
 * Navbar for store-owner:
 * - Left: app name only.
 * - Right: search, online toggle, store status toggle, profile button.
 * - Persists online state to localStorage key "store_online" and emits "store_status_changed".
 * - Persists store status to localStorage key "store_status" and emits "store_status_changed".
 * - Reads user from localStorage safely; listens for 'userUpdated' and storage events.
 */
const Navbar = ({ isAuthenticated = false }) => {
  const [searchText, setSearchText] = useState("");
  const [profileOpen, setProfileOpen] = useState(false);
  const [user, setUser] = useState(null);
  const [online, setOnline] = useState(() => localStorage.getItem("store_online") === "true");
  const [storeStatus, setStoreStatus] = useState(() => localStorage.getItem("store_status") || "open"); // "open" or "closed"
  const navigate = useNavigate();
  const profileRef = useRef();

  const SIDEBAR_WIDTH = 250;
  const navbarStyle = isAuthenticated
    ? { left: `${SIDEBAR_WIDTH}px`, width: `calc(100% - ${SIDEBAR_WIDTH}px)` }
    : { left: "0px", width: "100%" };

  const loadUser = () => {
    try {
      const raw = localStorage.getItem("user");
      if (!raw) {
        setUser(null);
        return;
      }
      const parsed = JSON.parse(raw);
      setUser(parsed && typeof parsed === "object" ? parsed : null);
    } catch {
      setUser(null);
    }
  };

  useEffect(() => {
    loadUser();
    const onStorage = (e) => {
      // sync user changes or when store_online/store_status changed in another tab
      if (e.key === "user" || e.key === "user_last_update") loadUser();
      if (e.key === "store_online") setOnline(e.newValue === "true");
      if (e.key === "store_status") setStoreStatus(e.newValue || "open");
    };
    window.addEventListener("storage", onStorage);
    const onUserUpdated = () => loadUser();
    window.addEventListener("userUpdated", onUserUpdated);

    // custom event to sync online state across same-tab listeners
    const onStoreStatus = () => {
      setOnline(localStorage.getItem("store_online") === "true");
      setStoreStatus(localStorage.getItem("store_status") || "open");
    };
    window.addEventListener("store_status_changed", onStoreStatus);

    return () => {
      window.removeEventListener("storage", onStorage);
      window.removeEventListener("userUpdated", onUserUpdated);
      window.removeEventListener("store_status_changed", onStoreStatus);
    };
  }, []);

  useEffect(() => {
    const onDocClick = (e) => {
      if (profileRef.current && !profileRef.current.contains(e.target)) {
        setProfileOpen(false);
      }
    };
    document.addEventListener("mousedown", onDocClick);
    return () => document.removeEventListener("mousedown", onDocClick);
  }, []);

  useEffect(() => {
    const onKey = (e) => {
      if (e.key === "Escape") setProfileOpen(false);
    };
    if (profileOpen) document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [profileOpen]);

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

  const goToProfile = () => {
    setProfileOpen(false);
    navigate("/store-owner/profile");
  };

  const initials = (() => {
    const name = user?.name || user?.fullName || user?.username || "";
    if (!name) return "SO";
    const parts = name.trim().split(/\s+/);
    if (parts.length === 1) return parts[0].charAt(0).toUpperCase();
    return (parts[0].charAt(0) + parts[1].charAt(0)).toUpperCase();
  })();

  const hasAvatar = Boolean(user?.avatar);

  // Toggle online state and persist in localStorage
  const setOnlineState = (next) => {
    setOnline(next);
    try {
      localStorage.setItem("store_online", next ? "true" : "false");
    } catch {}
    window.dispatchEvent(new Event("store_status_changed"));
  };

  const toggleOnline = (e) => {
    if (e && e.stopPropagation) e.stopPropagation();
    setOnlineState(!online);
  };

  // Toggle store status (open/closed) and persist in localStorage
  const setStoreStatusState = (status) => {
    setStoreStatus(status);
    try {
      localStorage.setItem("store_status", status);
    } catch {}
    window.dispatchEvent(new Event("store_status_changed"));
  };

  const toggleStoreStatus = (e) => {
    if (e && e.stopPropagation) e.stopPropagation();
    const newStatus = storeStatus === "open" ? "closed" : "open";
    setStoreStatusState(newStatus);
    
    // Optional: Show confirmation message
    if (newStatus === "closed") {
      alert("Store is now closed. Customers cannot place orders.");
    } else {
      alert("Store is now open. Customers can place orders.");
    }
  };

  return (
    <header className="navbar" style={navbarStyle}>
      <div className="navbar-left">
        <h3 className="name">Citybites Store Owner</h3>
      </div>

      <div className="navbar-right">
        <div className="navbar-search" role="search" aria-label="Site search">
          <span className="navbar-search-icon" aria-hidden>
            📍
          </span>
          <input
            type="text"
            placeholder="Search"
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
            aria-label="Search"
          />
        </div>

        {/* Store Status Toggle */}
        <button
          type="button"
          className={`store-status-toggle ${storeStatus}`}
          onClick={toggleStoreStatus}
          aria-pressed={storeStatus === "open"}
          aria-label={storeStatus === "open" ? "Close store" : "Open store"}
          title={storeStatus === "open" ? "Close store" : "Open store"}
        >
          {storeStatus === "open" ? "Close Store" : "Open Store"}
        </button>

        {/* Online Toggle */}
        <button
          type="button"
          className={`online-toggle ${online ? "online" : "offline"}`}
          onClick={toggleOnline}
          aria-pressed={online}
          aria-label={online ? "Go offline" : "Go online"}
          title={online ? "Go offline" : "Go online"}
        >
          {online ? "Go offline" : "Go online"}
        </button>

        {/* PROFILE AREA (right side) */}
        <div className="profile-container" ref={profileRef}>
          <button
            className="profile-button"
            onClick={() => setProfileOpen((s) => !s)}
            aria-haspopup="true"
            aria-expanded={profileOpen}
            title="Store owner"
          >
            {hasAvatar ? (
              <img
                src={user.avatar}
                alt={`${user?.name || "Store Owner"} avatar`}
                className="profile-avatar"
                onError={(e) => {
                  e.currentTarget.style.display = "none";
                }}
              />
            ) : (
              <div className="profile-initials">{initials}</div>
            )}
          </button>

          {profileOpen && (
            <div className="profile-dropdown" role="menu" aria-label="Profile menu">
              <div className="profile-info">
                {hasAvatar ? (
                  <img src={user.avatar} alt="avatar" className="profile-avatar-sm" onError={(e) => (e.currentTarget.style.display = "none")} />
                ) : (
                  <div className="profile-initials-sm">{initials}</div>
                )}
                <div className="profile-info-text">
                  <div className="profile-name">{user?.name || user?.username || "Store Owner"}</div>
                  <div className="profile-email">{user?.email || ""}</div>
                </div>
              </div>

              <div className="store-status-info">
                <div className="status-item">
                  <span className="status-label">Store Status:</span>
                  <span className={`status-value ${storeStatus}`}>
                    {storeStatus === "open" ? "🟢 Open" : "🔴 Closed"}
                  </span>
                </div>
                <div className="status-item">
                  <span className="status-label">Online Status:</span>
                  <span className={`status-value ${online ? "online" : "offline"}`}>
                    {online ? "🟢 Online" : "🔴 Offline"}
                  </span>
                </div>
              </div>

              <div className="profile-actions">
                <button className="profile-action-btn" onClick={goToProfile}>
                  View / Edit Profile
                </button>
                <button className="profile-action-btn logout" onClick={handleLogout}>
                  Logout
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

export default Navbar;