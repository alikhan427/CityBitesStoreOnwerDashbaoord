import React, { useEffect, useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import {
  FaHome,
  FaShoppingBag,
  FaBars,
  FaMotorcycle
} from "react-icons/fa";
import { PiChartLine } from "react-icons/pi";
import { TfiMenuAlt } from "react-icons/tfi";
import { BsPercent } from "react-icons/bs";
import { FiArrowLeft, FiX } from "react-icons/fi";
import "./Sidebar.css";

import { useDispatch, useSelector } from "react-redux";
// your authSlice exports 'logout' — use that
import { logout } from "../../redux/slices/authSlice";

const Sidebar = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const dispatch = useDispatch();

  // use Redux as the single source of truth for auth
  const isAuth = useSelector((state) => !!state.auth?.isAuthenticated);

  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  // Sync auth across tabs: if token removed in another tab, dispatch logout
  useEffect(() => {
    const onStorage = (e) => {
      if (e.key === "token" && !e.newValue) {
        // token removed in another tab -> update redux
        try {
          dispatch(logout());
        } catch (err) {
          // ignore
        }
      }
    };
    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, [dispatch]);

  // Check if device is mobile
  useEffect(() => {
    const checkScreenSize = () => {
      setIsMobile(window.innerWidth <= 768);
    };

    checkScreenSize();
    window.addEventListener("resize", checkScreenSize);
    return () => window.removeEventListener("resize", checkScreenSize);
  }, []);

  // Auto-close sidebar when route changes on mobile
  useEffect(() => {
    if (isMobile) {
      setIsSidebarOpen(false);
    }
  }, [location.pathname, isMobile]);

  // Logout: clear localStorage + update redux + navigate to login
  const handleLogout = () => {
    const ok = window.confirm("Are you sure you want to logout?");
    if (!ok) return;

    // remove token/user from localStorage
    localStorage.removeItem("token");
    localStorage.removeItem("user");

    // update redux (use the exported 'logout' action)
    dispatch(logout());

    // redirect to login
    navigate("/login", { replace: true });
  };

  const toggleSidebar = () => {
    setIsSidebarOpen((s) => !s);
  };

  const closeSidebar = () => {
    if (isMobile) {
      setIsSidebarOpen(false);
    }
  };

  // If not authenticated, do not render the sidebar
  if (!isAuth) return null;

  return (
    <>
      {/* Mobile Toggle Button */}
      {isMobile && (
        <div className="mobile-toggle" onClick={toggleSidebar}>
          {isSidebarOpen ? <FiX /> : <FaBars />}
        </div>
      )}

      {/* Overlay for mobile when sidebar is open */}
      {isMobile && isSidebarOpen && (
        <div className="sidebar-overlay" onClick={closeSidebar}></div>
      )}

      {/* Sidebar */}
      <aside className={`sidebar ${isMobile ? (isSidebarOpen ? "open" : "closed") : "desktop-open"}`}>
        <div className="sidebar-header">
          <h2 className="brand">CityBites</h2>
          {isMobile && (
            <button className="close-sidebar-mobile" onClick={closeSidebar}>
              <FiX />
            </button>
          )}
        </div>

        <ul className="menu">
          <li>
            <Link
              to="/dashboard"
              className={`nav-link ${location.pathname === "/dashboard" ? "active" : ""}`}
              onClick={closeSidebar}
            >
              <FaHome /> <span>Dashboard</span>
            </Link>
          </li>
          <li>
            <Link
              to="/orders"
              className={`nav-link ${location.pathname.startsWith("/orders") ? "active" : ""}`}
              onClick={closeSidebar}
            >
              <FaShoppingBag /> <span>Orders</span>
            </Link>
          </li>
          <li>
            <Link
              to="/menu"
              className={`nav-link ${location.pathname.startsWith("/menu") ? "active" : ""}`}
              onClick={closeSidebar}
            >
              <TfiMenuAlt /> <span>Menu</span>
            </Link>
          </li>
          <li>
            <Link
              to="/offers"
              className={`nav-link ${location.pathname.startsWith("/offers") ? "active" : ""}`}
              onClick={closeSidebar}
            >
              <BsPercent /> <span>Offers</span>
            </Link>
          </li>
          <li>
            <Link
              to="/payments"
              className={`nav-link ${location.pathname.startsWith("/payments") ? "active" : ""}`}
              onClick={closeSidebar}
            >
              <PiChartLine /> <span>Payments</span>
            </Link>
          </li>
          <li>
            <Link
              to="/delivery"
              className={`nav-link ${location.pathname.startsWith("/delivery") ? "active" : ""}`}
              onClick={closeSidebar}
            >
              <FaMotorcycle /> <span>Delivery</span>
            </Link>
          </li>
        </ul>

        {/* Logout Button at the bottom */}
        <div className="sidebar-footer">
          <button className="logout-button" onClick={handleLogout}>
            <FiArrowLeft /> <span>Logout</span>
          </button>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;
