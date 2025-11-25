// src/deliveryboy/navbar/DeliveryNavbar.jsx
import React, { useEffect, useState, useRef, useCallback } from "react";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import "./DeliveryNavbar.css";

/**
 * DeliveryNavbar
 * - Shows uploaded avatar (data URL or remote URL) in the profile button when available.
 * - Falls back to initials when image can't load.
 * - Persists and toggles "delivery_online" in localStorage.
 * - Emits 'delivery_status_changed' event when online state changes.
 * - Listens to 'userUpdated', 'delivery_status_changed', and storage events to sync UI.
 */
const DeliveryNavbar = () => {
  const reduxUser = useSelector((state) => state.auth?.user);
  const navigate = useNavigate();

  // initial user state: prefer redux, fallback to localStorage
  const [user, setUser] = useState(() => {
    try {
      const raw = localStorage.getItem("user");
      return reduxUser || (raw ? JSON.parse(raw) : null);
    } catch {
      return reduxUser || null;
    }
  });

  const [searchText, setSearchText] = useState("");
  const [isMobile, setIsMobile] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [online, setOnline] = useState(() => localStorage.getItem("delivery_online") === "true");

  // whether avatar image loaded successfully
  const [showAvatar, setShowAvatar] = useState(false);
  const profileRef = useRef();

  // helper: preload avatar to know if it loads correctly
  const tryLoadAvatar = useCallback((avatar) => {
    if (!avatar) {
      setShowAvatar(false);
      return;
    }
    const img = new Image();
    img.onload = () => setShowAvatar(true);
    img.onerror = () => setShowAvatar(false);
    img.src = avatar;
  }, []);

  // sync user and online state from redux or localStorage (and listen for changes)
  useEffect(() => {
    // if redux user exists, prefer it
    if (reduxUser) {
      setUser(reduxUser);
      tryLoadAvatar(reduxUser?.avatar);
      return;
    }

    const sync = () => {
      try {
        const raw = localStorage.getItem("user");
        const parsed = raw ? JSON.parse(raw) : null;
        setUser(parsed);
        tryLoadAvatar(parsed?.avatar);
      } catch {
        setUser(null);
        setShowAvatar(false);
      }
      setOnline(localStorage.getItem("delivery_online") === "true");
    };

    // initial sync
    sync();

    // listen for cross-tab and custom events
    window.addEventListener("storage", sync);
    window.addEventListener("userUpdated", sync);
    window.addEventListener("delivery_status_changed", sync);

    return () => {
      window.removeEventListener("storage", sync);
      window.removeEventListener("userUpdated", sync);
      window.removeEventListener("delivery_status_changed", sync);
    };
  }, [reduxUser, tryLoadAvatar]);

  // also re-run tryLoadAvatar when user.avatar changes in same tab (redux updates)
  useEffect(() => {
    tryLoadAvatar(user?.avatar);
  }, [user?.avatar, tryLoadAvatar]);

  // responsive: show/hide search
  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth <= 768);
    check();
    window.addEventListener("resize", check);
    return () => window.removeEventListener("resize", check);
  }, []);

  // close dropdown when clicking outside
  useEffect(() => {
    const onDocClick = (e) => {
      if (profileRef.current && !profileRef.current.contains(e.target)) setProfileOpen(false);
    };
    document.addEventListener("mousedown", onDocClick);
    return () => document.removeEventListener("mousedown", onDocClick);
  }, []);

  // close on Escape
  useEffect(() => {
    const onKey = (e) => {
      if (e.key === "Escape") setProfileOpen(false);
    };
    if (profileOpen) document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [profileOpen]);

  const getInitials = (u) => {
    const name = u?.name || u?.fullName || u?.username || "";
    if (!name) return "DP";
    const parts = name.trim().split(/\s+/);
    if (parts.length === 1) return parts[0].charAt(0).toUpperCase();
    return (parts[0].charAt(0) + parts[1].charAt(0)).toUpperCase();
  };

  // set and persist online state; optional event param to stopPropagation
  const setOnlineState = (next, e) => {
    if (e && e.stopPropagation) e.stopPropagation();
    setOnline(next);
    try {
      localStorage.setItem("delivery_online", next ? "true" : "false");
    } catch {}
    // notify other parts/tabs
    window.dispatchEvent(new Event("delivery_status_changed"));
  };

  // toggle helper used by main button and small button (stops propagation when called from dropdown)
  const toggleOnline = (e) => setOnlineState(!online, e);

  const handleLogout = (e) => {
    if (e && e.stopPropagation) e.stopPropagation();
    if (!window.confirm("Logout?")) return;
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    try {
      localStorage.setItem("user_last_update", String(Date.now()));
      localStorage.removeItem("delivery_online");
    } catch {}
    window.dispatchEvent(new Event("delivery_status_changed"));
    window.dispatchEvent(new Event("userUpdated"));
    navigate("/login", { replace: true });
  };

  const openProfilePage = (e) => {
    if (e && e.stopPropagation) e.stopPropagation();
    setProfileOpen(false);
    navigate("/delivery/profile");
  };

  const toggleProfileOpen = (e) => {
    e.stopPropagation();
    setProfileOpen((s) => !s);
  };

  return (
    <header className="delivery-navbar" role="banner">
      <div className="delivery-navbar-left">
        <h3 className="delivery-name">CityBites Delivery</h3>
      </div>

      <div className="delivery-navbar-right">
        {!isMobile && (
          <div className="delivery-navbar-search" role="search" aria-label="Search orders">
            <span className="delivery-navbar-search-icon" aria-hidden>
              🔍
            </span>
            <input
              type="text"
              placeholder="Search orders..."
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
              aria-label="Search orders"
            />
          </div>
        )}

        {/* Main online toggle */}
        <button
          type="button"
          className={`delivery-online-btn ${online ? "online" : "offline"}`}
          onClick={toggleOnline}
          aria-pressed={online}
          aria-label={online ? "Go offline" : "Go online"}
          title={online ? "Go offline" : "Go online"}
        >
          {online ? "Go offline" : "Go online"}
        </button>

        {/* Profile button + dropdown */}
        <div
          className={`delivery-user-profile ${profileOpen ? "open" : ""}`}
          ref={profileRef}
          title={user?.name || "Delivery Partner"}
        >
          <button
            type="button"
            className="delivery-user-button"
            onClick={toggleProfileOpen}
            aria-haspopup="true"
            aria-expanded={profileOpen}
            aria-label="Open profile menu"
          >
            {showAvatar && user?.avatar ? (
              <img
                src={user.avatar}
                alt={user?.name || "avatar"}
                className="delivery-user-avatar-img"
                onError={() => setShowAvatar(false)}
              />
            ) : (
              <div className="delivery-user-avatar" aria-hidden>
                {getInitials(user)}
              </div>
            )}
          </button>

          {profileOpen && (
            <div className="delivery-user-details" role="dialog" aria-label="Delivery profile menu">
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 8 }}>
                <div>
                  <div className="delivery-user-name">{user?.name || "Delivery Partner"}</div>
                  <div className="delivery-user-role">{online ? "Online" : "Offline"}</div>
                </div>

                <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                  {/* small toggle - stopPropagation so dropdown stays open while toggling */}
                  <button
                    type="button"
                    className={`delivery-online-btn small ${online ? "online" : "offline"}`}
                    onClick={(e) => toggleOnline(e)}
                    aria-pressed={online}
                    aria-label={online ? "Go offline" : "Go online"}
                  >
                    {online ? "Go offline" : "Go online"}
                  </button>

                  <button type="button" className="delivery-logout-btn" onClick={(e) => handleLogout(e)}>
                    Logout
                  </button>
                </div>
              </div>

              <hr style={{ margin: "10px 0", borderTop: "1px solid #f1f5f9" }} />

              <div style={{ display: "grid", gap: 8 }}>
                {user?.vehicleName && (
                  <div>
                    <small style={{ color: "#6b7280" }}>Vehicle</small>
                    <div style={{ fontWeight: 600 }}>{user.vehicleName}</div>
                  </div>
                )}
                {user?.vehicleNumber && (
                  <div>
                    <small style={{ color: "#6b7280" }}>Vehicle No.</small>
                    <div>{user.vehicleNumber}</div>
                  </div>
                )}
                {user?.phone && (
                  <div>
                    <small style={{ color: "#6b7280" }}>Phone</small>
                    <div>{user.phone}</div>
                  </div>
                )}
                {user?.email && (
                  <div>
                    <small style={{ color: "#6b7280" }}>Email</small>
                    <div>{user.email}</div>
                  </div>
                )}
              </div>

              <div style={{ display: "flex", gap: 8, marginTop: 10 }}>
                <button type="button" className="profile-action-btn" onClick={(e) => openProfilePage(e)}>
                  View Profile
                </button>
                <button type="button" className="profile-action-btn" onClick={(e) => openProfilePage(e)}>
                  Edit
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

export default DeliveryNavbar;
