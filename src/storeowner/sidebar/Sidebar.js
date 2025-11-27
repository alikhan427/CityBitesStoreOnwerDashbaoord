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
import { logout } from "../../redux/slices/authSlice";

const Sidebar = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const dispatch = useDispatch();

  const isAuth = useSelector((state) => !!state.auth?.isAuthenticated);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [isTablet, setIsTablet] = useState(false);

  // Enhanced screen size detection
  useEffect(() => {
    const checkScreenSize = () => {
      const width = window.innerWidth;
      setIsMobile(width <= 768);
      setIsTablet(width > 768 && width <= 1024);
    };

    checkScreenSize();
    window.addEventListener("resize", checkScreenSize);
    
    return () => window.removeEventListener("resize", checkScreenSize);
  }, []);

  // Sync auth across tabs
  useEffect(() => {
    const onStorage = (e) => {
      if (e.key === "token" && !e.newValue) {
        try {
          dispatch(logout());
        } catch (err) {
          console.error("Logout error:", err);
        }
      }
    };
    
    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, [dispatch]);

  // Auto-close sidebar when route changes on mobile/tablet
  useEffect(() => {
    if (isMobile || isTablet) {
      setIsSidebarOpen(false);
    }
  }, [location.pathname, isMobile, isTablet]);

  const handleLogout = () => {
    const ok = window.confirm("Are you sure you want to logout?");
    if (!ok) return;

    localStorage.removeItem("token");
    localStorage.removeItem("user");
    dispatch(logout());
    navigate("/login", { replace: true });
  };

  const toggleSidebar = () => {
    setIsSidebarOpen((prev) => !prev);
  };

  const closeSidebar = () => {
    if (isMobile || isTablet) {
      setIsSidebarOpen(false);
    }
  };

  // If not authenticated, do not render the sidebar
  if (!isAuth) return null;

  // Determine sidebar state based on device type
  const getSidebarState = () => {
    if (isMobile || isTablet) {
      return isSidebarOpen ? "open" : "closed";
    }
    return "desktop-open";
  };

  // Navigation items for better maintainability
  const navItems = [
    { to: "/dashboard", icon: FaHome, label: "Dashboard", exact: true },
    { to: "/orders", icon: FaShoppingBag, label: "Orders" },
    { to: "/menu", icon: TfiMenuAlt, label: "Menu" },
    { to: "/offers", icon: BsPercent, label: "Offers" },
    { to: "/payments", icon: PiChartLine, label: "Payments" },
    { to: "/delivery", icon: FaMotorcycle, label: "Delivery" },
  ];

  const isActiveLink = (to, exact = false) => {
    if (exact) {
      return location.pathname === to;
    }
    return location.pathname.startsWith(to);
  };

  return (
    <>
      {/* Mobile/Tablet Toggle Button */}
      {(isMobile || isTablet) && (
        <button 
          className="mobile-toggle" 
          onClick={toggleSidebar}
          aria-label={isSidebarOpen ? "Close menu" : "Open menu"}
          aria-expanded={isSidebarOpen}
        >
          {isSidebarOpen ? <FiX /> : <FaBars />}
        </button>
      )}

      {/* Overlay for mobile/tablet when sidebar is open */}
      {(isMobile || isTablet) && isSidebarOpen && (
        <div 
          className="sidebar-overlay" 
          onClick={closeSidebar}
          aria-hidden="true"
        />
      )}

      {/* Sidebar */}
      <aside 
        className={`sidebar ${getSidebarState()}`}
        role="navigation"
        aria-label="Main navigation"
      >
        <div className="sidebar-header">
          <h2 className="brand">CityBites</h2>
          {(isMobile || isTablet) && (
            <button 
              className="close-sidebar-mobile" 
              onClick={closeSidebar}
              aria-label="Close sidebar"
            >
              <FiX />
            </button>
          )}
        </div>

        <nav>
          <ul className="menu">
            {navItems.map((item) => {
              const IconComponent = item.icon;
              return (
                <li key={item.to}>
                  <Link
                    to={item.to}
                    className={`nav-link ${isActiveLink(item.to, item.exact) ? "active" : ""}`}
                    onClick={closeSidebar}
                    aria-current={isActiveLink(item.to, item.exact) ? "page" : undefined}
                  >
                    <IconComponent aria-hidden="true" /> 
                    <span>{item.label}</span>
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>

        {/* Logout Button at the bottom */}
        <div className="sidebar-footer">
          <button 
            className="logout-button" 
            onClick={handleLogout}
            aria-label="Logout"
          >
            <FiArrowLeft aria-hidden="true" /> 
            <span>Logout</span>
          </button>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;