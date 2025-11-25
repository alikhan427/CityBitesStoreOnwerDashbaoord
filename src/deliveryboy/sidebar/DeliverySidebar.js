// import React, { useEffect, useState } from "react";
// import { Link, useNavigate, useLocation } from "react-router-dom";
// import {
//   FaHome,
//   FaBars,
//   FaMotorcycle,
//   FaCheckCircle,
//   FaClock,
//   FaChartLine,
//   FaHeadset
// } from "react-icons/fa";
// import { FiArrowLeft, FiX } from "react-icons/fi";
// import "./DeliverySidebar.css";

// import { useDispatch, useSelector } from "react-redux";
// import { logout } from "../../redux/slices/authSlice";

// const DeliverySidebar = () => {
//   const navigate = useNavigate();
//   const location = useLocation();
//   const dispatch = useDispatch();

//   // Redux auth flag (adapt if your slice uses a different field)
//   const isAuth = useSelector((state) => !!state.auth?.isAuthenticated);

//   const [isSidebarOpen, setIsSidebarOpen] = useState(false); // mobile toggle
//   const [isMobile, setIsMobile] = useState(false);

//   // Sync auth across tabs: logout if token removed elsewhere
//   useEffect(() => {
//     const onStorage = (e) => {
//       if (e.key === "token" && !e.newValue) {
//         try {
//           dispatch(logout());
//         } catch (err) {}
//       }
//     };
//     window.addEventListener("storage", onStorage);
//     return () => window.removeEventListener("storage", onStorage);
//   }, [dispatch]);

//   // Detect mobile vs desktop
//   useEffect(() => {
//     const check = () => setIsMobile(window.innerWidth <= 768);
//     check();
//     window.addEventListener("resize", check);
//     return () => window.removeEventListener("resize", check);
//   }, []);

//   // Close sidebar on navigation when mobile
//   useEffect(() => {
//     if (isMobile) setIsSidebarOpen(false);
//   }, [location.pathname, isMobile]);

//   // Toggle body class so navbar starts after sidebar on desktop
//   useEffect(() => {
//     const shouldHave = !isMobile; // permanent sidebar on desktop
//     if (shouldHave) {
//       document.body.classList.add("has-delivery-sidebar");
//     } else {
//       document.body.classList.remove("has-delivery-sidebar");
//     }
//     return () => {
//       document.body.classList.remove("has-delivery-sidebar");
//     };
//   }, [isMobile]);

//   const handleLogout = () => {
//     const ok = window.confirm("Are you sure you want to logout?");
//     if (!ok) return;
//     localStorage.removeItem("token");
//     localStorage.removeItem("user");
//     dispatch(logout());
//     navigate("/login", { replace: true });
//   };

//   const toggleSidebar = () => setIsSidebarOpen((s) => !s);
//   const closeSidebar = () => { if (isMobile) setIsSidebarOpen(false); };

//   if (!isAuth) return null;

//   return (
//     <>
//       {/* Mobile toggle button */}
//       {isMobile && (
//         <button
//           className="delivery-mobile-toggle"
//           onClick={toggleSidebar}
//           aria-label={isSidebarOpen ? "Close sidebar" : "Open sidebar"}
//         >
//           {isSidebarOpen ? <FiX /> : <FaBars />}
//         </button>
//       )}

//       {/* overlay when mobile sidebar open */}
//       {isMobile && isSidebarOpen && (
//         <div className="delivery-sidebar-overlay" onClick={closeSidebar} />
//       )}

//       <aside
//         className={`delivery-sidebar ${isMobile ? (isSidebarOpen ? "open" : "closed") : "desktop-open"}`}
//         aria-hidden={isMobile ? (!isSidebarOpen) : false}
//       >
//         <div className="delivery-sidebar-header">
//           <div className="delivery-brand">CityBites</div>
//           {isMobile && (
//             <button className="close-delivery-sidebar-mobile" onClick={closeSidebar} aria-label="Close sidebar">
//               <FiX />
//             </button>
//           )}
//         </div>

//         <ul className="delivery-menu" role="menu">
//           <li>
//             <Link to="/dashboard" className={`delivery-nav-link ${location.pathname === "/dashboard" ? "active" : ""}`} onClick={closeSidebar}>
//               <FaHome /> <span>Dashboard</span>
//             </Link>
//           </li>

//           <li>
//             <Link to="/orders/active" className={`delivery-nav-link ${location.pathname.startsWith("/orders/active") ? "active" : ""}`} onClick={closeSidebar}>
//               <FaMotorcycle /> <span>Active Orders</span>
//             </Link>
//           </li>

//           <li>
//             <Link to="/orders/pending" className={`delivery-nav-link ${location.pathname.startsWith("/orders/pending") ? "active" : ""}`} onClick={closeSidebar}>
//               <FaClock /> <span>Pending Orders</span>
//             </Link>
//           </li>

//           <li>
//             <Link to="/orders/completed" className={`delivery-nav-link ${location.pathname.startsWith("/orders/completed") ? "active" : ""}`} onClick={closeSidebar}>
//               <FaCheckCircle /> <span>Completed</span>
//             </Link>
//           </li>

//           <li>
//             <Link to="/payments" className={`delivery-nav-link ${location.pathname.startsWith("/payments") ? "active" : ""}`} onClick={closeSidebar}>
//               <FaChartLine /> <span>Payments</span>
//             </Link>
//           </li>

//           <li>
//             <Link to="/performance" className={`delivery-nav-link ${location.pathname.startsWith("/performance") ? "active" : ""}`} onClick={closeSidebar}>
//               <FaChartLine /> <span>Performance</span>
//             </Link>
//           </li>

//           <li>
//             <Link to="/support" className={`delivery-nav-link ${location.pathname.startsWith("/support") ? "active" : ""}`} onClick={closeSidebar}>
//               <FaHeadset /> <span>Support</span>
//             </Link>
//           </li>

//           <li>
//             <button className="delivery-logout-button" onClick={handleLogout}>
//               <FiArrowLeft /> <span>Logout</span>
//             </button>
//           </li>
//         </ul>
//       </aside>
//     </>
//   );
// };

// export default DeliverySidebar;

import React, { useEffect, useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import {
  FaBars,
  FaMotorcycle,
  FaCheckCircle,
  FaClock,
  FaChartLine,
  FaHeadset,
 
} from "react-icons/fa";
import { FiArrowLeft, FiX } from "react-icons/fi";
import "./DeliverySidebar.css";

import { useDispatch, useSelector } from "react-redux";
import { logout } from "../../redux/slices/authSlice";

const DeliverySidebar = () => {
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
        <div className="delivery-mobile-toggle" onClick={toggleSidebar}>
          {isSidebarOpen ? <FiX /> : <FaBars />}
        </div>
      )}

      {/* Overlay for mobile when sidebar is open */}
      {isMobile && isSidebarOpen && (
        <div className="delivery-sidebar-overlay" onClick={closeSidebar}></div>
      )}

      {/* Sidebar */}
      <aside className={`delivery-sidebar ${isMobile ? (isSidebarOpen ? "open" : "closed") : "desktop-open"}`}>
        <div className="delivery-sidebar-header">
          <h2 className="delivery-brand">CityBites Delivery</h2>
          {isMobile && (
            <button className="close-delivery-sidebar-mobile" onClick={closeSidebar}>
              <FiX />
            </button>
          )}
        </div>

        <ul className="delivery-menu">
          <li>
            <Link
              to="/orders/active"
              className={`delivery-nav-link ${location.pathname.startsWith("/orders/active") ? "active" : ""}`}
              onClick={closeSidebar}
            >
              <FaMotorcycle /> <span>Active Orders</span>
            </Link>
          </li>
          <li>
            <Link
              to="/orders/pending"
              className={`delivery-nav-link ${location.pathname.startsWith("/orders/pending") ? "active" : ""}`}
              onClick={closeSidebar}
            >
              <FaClock /> <span>Pending Orders</span>
            </Link>
          </li>
          <li>
            <Link
              to="/orders/completed"
              className={`delivery-nav-link ${location.pathname.startsWith("/orders/completed") ? "active" : ""}`}
              onClick={closeSidebar}
            >
              <FaCheckCircle /> <span>Completed</span>
            </Link>
          </li>
          <li>
            <Link
              to="/payments"
              className={`delivery-nav-link ${location.pathname.startsWith("/payments") ? "active" : ""}`}
              onClick={closeSidebar}
            >
              <FaChartLine /> <span>Payments</span>
            </Link>
          </li>
          <li>
            <Link
              to="/performance"
              className={`delivery-nav-link ${location.pathname.startsWith("/performance") ? "active" : ""}`}
              onClick={closeSidebar}
            >
              <FaChartLine /> <span>Performance</span>
            </Link>
          </li>
          <li>
            <Link
              to="/support"
              className={`delivery-nav-link ${location.pathname.startsWith("/support") ? "active" : ""}`}
              onClick={closeSidebar}
            >
              <FaHeadset /> <span>Support</span>
            </Link>
          </li>
        </ul>

        {/* Logout Button at the bottom */}
        <div className="delivery-sidebar-footer">
          <button className="delivery-logout-button" onClick={handleLogout}>
            <FiArrowLeft /> <span>Logout</span>
          </button>
        </div>
      </aside>
    </>
  );
};

export default DeliverySidebar;