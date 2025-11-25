// // // src/routing/AppRouting.js
// // import React, { useEffect, useState } from "react";
// // import { Routes, Route, Navigate } from "react-router-dom";
// // import { useDispatch, useSelector } from "react-redux";
// // import { loadAuthState } from "../redux/slices/authSlice";

// // import Login from "../pages/login/Login";
// // import SignupStore from "../pages/register/SignupStore";
// // import SignupDelivery from "../pages/register/SignupDelivery";

// // import Dashboard from "../storeowner/dashboard/Dashboard";
// // import Orders from "../storeowner/orders/Orders";
// // import Menu from "../storeowner/menu/menu";
// // import Offers from "../storeowner/offers/offers";
// // import Payments from "../storeowner/payments/Payments";
// // import Delivery from "../storeowner/delivery/Delivery";

// // import Sidebar from "../storeowner/sidebar/Sidebar";
// // import Navbar from "../storeowner/navbar/Navbar";

// // export default function AppRouting() {
// //   const dispatch = useDispatch();
// //   const auth = useSelector((state) => state.auth || {});
// //   const isAuthenticated = Boolean(auth?.token || auth?.user);
// //   const loading = Boolean(auth?.loading);
// //   const [authChecked, setAuthChecked] = useState(false);

// //   useEffect(() => {
// //     let mounted = true;
// //     const initialize = async () => {
// //       try {
// //         await dispatch(loadAuthState());
// //       } catch (e) {
// //         console.warn("loadAuthState error:", e);
// //       } finally {
// //         if (mounted) setAuthChecked(true);
// //       }
// //     };
// //     initialize();
// //     return () => {
// //       mounted = false;
// //     };
// //   }, [dispatch]);

// //   // optional: keep role normalization available
// //   let storedUser = null;
// //   try {
// //     const raw = localStorage.getItem("user");
// //     storedUser = raw ? JSON.parse(raw) : null;
// //   } catch (e) {
// //     storedUser = null;
// //   }
// //   const user = auth.user ?? storedUser;
// //   const rawRole = (user?.role || "").toString().toLowerCase();
// //   const normalizedRole = rawRole.replace(/[-\s]+/g, "_").trim();

// //   // Wait until auth restoration completes
// //   if (!authChecked || loading) {
// //     return (
// //       <div style={{ padding: 20, display: "flex", justifyContent: "center", alignItems: "center", height: "100vh" }}>
// //         <h3>Loading...</h3>
// //       </div>
// //     );
// //   }

// //   // PUBLIC layout (unauthenticated)
// //   if (!isAuthenticated) {
// //     return (
// //       <Routes>
// //         <Route path="/login" element={<Login />} />
// //         <Route path="/signup-store" element={<SignupStore />} />
// //         <Route path="/signup-delivery" element={<SignupDelivery />} />
// //         <Route path="/" element={<Navigate to="/login" replace />} />
// //         <Route path="*" element={<Navigate to="/login" replace />} />
// //       </Routes>
// //     );
// //   }

// //   // AUTHENTICATED: show store-owner layout & routes
// //   // If Sidebar or Navbar fail to import, render a fallback message
// //   if (typeof Sidebar === "undefined" || typeof Navbar === "undefined") {
// //     return (
// //       <div style={{ padding: 24 }}>
// //         <h2>Component import problem</h2>
// //         <pre>{JSON.stringify({ Sidebar: typeof Sidebar, Navbar: typeof Navbar }, null, 2)}</pre>
// //       </div>
// //     );
// //   }

// //   const NAVBAR_HEIGHT = 60;
// //   const SIDEBAR_WIDTH = 250;

// //   return (
// //     <div style={{ display: "flex", flexDirection: "column", minHeight: "100vh" }}>
// //       <Navbar isAuthenticated />
// //       <div style={{ display: "flex", flex: 1 }}>
// //         <Sidebar />
// //         <main
// //           style={{
// //             marginLeft: `${SIDEBAR_WIDTH}px`,
// //             paddingTop: `${NAVBAR_HEIGHT}px`,
// //             padding: 12,
// //             width: "100%",
// //             minHeight: "100vh",
// //             backgroundColor: "#f8f9fa",
// //             boxSizing: "border-box",
// //           }}
// //         >
// //           <Routes>
// //             <Route path="/dashboard" element={<Dashboard />} />
// //             <Route path="/orders" element={<Orders />} />
// //             <Route path="/menu" element={<Menu />} />
// //             <Route path="/offers" element={<Offers />} />
// //             <Route path="/payments" element={<Payments />} />
// //             <Route path="/delivery" element={<Delivery />} />

// //             {/* Prevent visiting auth pages when logged in */}
// //             <Route path="/login" element={<Navigate to="/dashboard" replace />} />
// //             <Route path="/signup-store" element={<Navigate to="/dashboard" replace />} />
// //             <Route path="/signup-delivery" element={<Navigate to="/dashboard" replace />} />

// //             <Route path="/" element={<Navigate to="/dashboard" replace />} />
// //             <Route path="*" element={<Navigate to="/dashboard" replace />} />
// //           </Routes>
// //         </main>
// //       </div>
// //     </div>
// //   );
// // }




// import React, { useEffect, useState } from "react";
// import { Routes, Route, Navigate } from "react-router-dom";
// import { useDispatch, useSelector } from "react-redux";
// import { loadAuthState } from "../redux/slices/authSlice";

// import Login from "../pages/login/Login";
// import SignupStore from "../pages/register/SignupStore";
// import SignupDelivery from "../pages/register/SignupDelivery";

// /* Store owner pages */
// import Dashboard from "../storeowner/dashboard/Dashboard";
// import Orders from "../storeowner/orders/Orders";
// import Menu from "../storeowner/menu/menu";
// import Offers from "../storeowner/offers/offers";
// import Payments from "../storeowner/payments/Payments";
// import Delivery from "../storeowner/delivery/Delivery";

// import Sidebar from "../storeowner/sidebar/Sidebar";
// import Navbar from "../storeowner/navbar/Navbar";

// /* Delivery pages (adjust path if your structure differs) */
// import DeliveryDashboard from "../deliveryboy/dashboard/DeliveryDashboard";

// export default function AppRouting() {
//   const dispatch = useDispatch();
//   const auth = useSelector((state) => state.auth || {});
//   const isAuthenticated = Boolean(auth?.token || auth?.user);
//   const loading = Boolean(auth?.loading);
//   const [authChecked, setAuthChecked] = useState(false);

//   useEffect(() => {
//     let mounted = true;
//     const initialize = async () => {
//       try {
//         await dispatch(loadAuthState());
//       } catch (e) {
//         console.warn("loadAuthState error:", e);
//       } finally {
//         if (mounted) setAuthChecked(true);
//       }
//     };
//     initialize();
//     return () => {
//       mounted = false;
//     };
//   }, [dispatch]);

//   // read fallback stored user from localStorage if redux hasn't hydrated yet
//   let storedUser = null;
//   try {
//     const raw = localStorage.getItem("user");
//     storedUser = raw ? JSON.parse(raw) : null;
//   } catch (e) {
//     storedUser = null;
//   }
//   const user = auth.user ?? storedUser;
//   const rawRole = (user?.role || "").toString().toLowerCase();
//   const normalizedRole = rawRole.replace(/[-\s]+/g, "_").trim();

//   // Wait until auth restoration completes
//   if (!authChecked || loading) {
//     return (
//       <div style={{ padding: 20, display: "flex", justifyContent: "center", alignItems: "center", height: "100vh" }}>
//         <h3>Loading...</h3>
//       </div>
//     );
//   }

//   // PUBLIC routes (unauthenticated)
//   if (!isAuthenticated) {
//     return (
//       <Routes>
//         <Route path="/login" element={<Login />} />
//         <Route path="/signup-store" element={<SignupStore />} />
//         <Route path="/signup-delivery" element={<SignupDelivery />} />
//         <Route path="/" element={<Navigate to="/login" replace />} />
//         <Route path="*" element={<Navigate to="/login" replace />} />
//       </Routes>
//     );
//   }

//   // Helper guard component to protect role-specific routes
//   const RequireRole = ({ allowedRoles = [], children }) => {
//     const role = normalizedRole;
//     const ok = allowedRoles.some((r) => role.includes(r) || role === r);
//     return ok ? children : <Navigate to={allowedRoles.includes("delivery") ? "/delivery-dashboard" : "/dashboard"} replace />;
//   };

//   // constants for layout spacing (match your CSS)
//   const NAVBAR_HEIGHT = 60;
//   const SIDEBAR_WIDTH = 250;

//   // STORE OWNER layout (role contains 'store' or 'owner')
//   if (normalizedRole.includes("store") || normalizedRole.includes("owner") || normalizedRole === "store_owner") {
//     return (
//       <div style={{ display: "flex", flexDirection: "column", minHeight: "100vh" }}>
//         <Navbar isAuthenticated />
//         <div style={{ display: "flex", flex: 1 }}>
//           <Sidebar />
//           <main
//             style={{
//               marginLeft: `${SIDEBAR_WIDTH}px`,
//               paddingTop: `${NAVBAR_HEIGHT}px`,
//               padding: 12,
//               width: "100%",
//               minHeight: "100vh",
//               backgroundColor: "#f8f9fa",
//               boxSizing: "border-box",
//             }}
//           >
//             <Routes>
//               <Route
//                 path="/dashboard"
//                 element={
//                   <RequireRole allowedRoles={["store", "owner", "store_owner"]}>
//                     <Dashboard />
//                   </RequireRole>
//                 }
//               />
//               <Route
//                 path="/orders"
//                 element={
//                   <RequireRole allowedRoles={["store", "owner", "store_owner"]}>
//                     <Orders />
//                   </RequireRole>
//                 }
//               />
//               <Route
//                 path="/menu"
//                 element={
//                   <RequireRole allowedRoles={["store", "owner", "store_owner"]}>
//                     <Menu />
//                   </RequireRole>
//                 }
//               />
//               <Route
//                 path="/offers"
//                 element={
//                   <RequireRole allowedRoles={["store", "owner", "store_owner"]}>
//                     <Offers />
//                   </RequireRole>
//                 }
//               />
//               <Route
//                 path="/payments"
//                 element={
//                   <RequireRole allowedRoles={["store", "owner", "store_owner"]}>
//                     <Payments />
//                   </RequireRole>
//                 }
//               />
//               <Route
//                 path="/delivery"
//                 element={
//                   <RequireRole allowedRoles={["store", "owner", "store_owner"]}>
//                     <Delivery />
//                   </RequireRole>
//                 }
//               />

//               {/* prevent visiting auth pages when logged in */}
//               <Route path="/login" element={<Navigate to="/dashboard" replace />} />
//               <Route path="/signup-store" element={<Navigate to="/dashboard" replace />} />
//               <Route path="/signup-delivery" element={<Navigate to="/dashboard" replace />} />

//               <Route path="/" element={<Navigate to="/dashboard" replace />} />
//               <Route path="*" element={<Navigate to="/dashboard" replace />} />
//             </Routes>
//           </main>
//         </div>
//       </div>
//     );
//   }

//   // DELIVERY layout (role contains 'delivery' or 'driver')
//   if (normalizedRole.includes("delivery") || normalizedRole.includes("driver") || normalizedRole === "delivery_boy") {
//     return (
//       <div style={{ minHeight: "100vh", background: "#f8f9fa" }}>
//         {/* Simple delivery header — replace with your delivery Navbar if you have one */}
//         <header style={{ height: NAVBAR_HEIGHT, display: "flex", alignItems: "center", padding: "0 16px", background: "#fff", boxShadow: "0 1px 0 rgba(0,0,0,0.06)" }}>
//           <h3 style={{ margin: 0 }}>Delivery Dashboard</h3>
//         </header>

//         <main style={{ padding: 12 }}>
//           <Routes>
//             <Route
//               path="/delivery-dashboard"
//               element={
//                 <RequireRole allowedRoles={["delivery", "driver", "delivery_boy"]}>
//                   <DeliveryDashboard />
//                 </RequireRole>
//               }
//             />

//             {/* Optionally add more delivery routes here */}

//             {/* prevent visiting auth pages when logged in */}
//             <Route path="/login" element={<Navigate to="/delivery-dashboard" replace />} />
//             <Route path="/signup-store" element={<Navigate to="/delivery-dashboard" replace />} />
//             <Route path="/signup-delivery" element={<Navigate to="/delivery-dashboard" replace />} />

//             <Route path="/" element={<Navigate to="/delivery-dashboard" replace />} />
//             <Route path="*" element={<Navigate to="/delivery-dashboard" replace />} />
//           </Routes>
//         </main>
//       </div>
//     );
//   }

//   // fallback: unknown role (safest: send back to login)
//   return (
//     <Routes>
//       <Route path="*" element={<Navigate to="/login" replace />} />
//     </Routes>
//   );
// }
 
// src/routing/AppRouting.js
import React, { useEffect, useState } from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { loadAuthState } from "../redux/slices/authSlice";

import Login from "../pages/login/Login";
import SignupStore from "../pages/register/SignupStore";
import SignupDelivery from "../pages/register/SignupDelivery";

/* Store owner pages */
import Dashboard from "../storeowner/dashboard/Dashboard";
import Orders from "../storeowner/orders/Orders";
import Menu from "../storeowner/menu/menu";
import Offers from "../storeowner/offers/offers";
import StorePayments from "../storeowner/payments/Payments";
import Delivery from "../storeowner/delivery/Delivery";
import StoreProfile from "../storeowner/profile/Profile";

import Sidebar from "../storeowner/sidebar/Sidebar";
import Navbar from "../storeowner/navbar/Navbar";

/* Delivery pages */
import DeliverySidebar from "../deliveryboy/sidebar/DeliverySidebar";
import DeliveryNavbar from "../deliveryboy/navbar/DeliveryNavbar";
import Active from "../deliveryboy/active/Active";
import Pending from "../deliveryboy/pending/Pending";
import Completed from "../deliveryboy/completed/Completed";
import DeliveryPayments from "../deliveryboy/payments/Payments";
import Performance from "../deliveryboy/performance/Performance";
import Support from "../deliveryboy/support/Support";
import DeliveryProfile from "../deliveryboy/profile/Profile";

export default function AppRouting() {
  const dispatch = useDispatch();
  const auth = useSelector((state) => state.auth || {});
  const isAuthenticated = Boolean(auth?.token || auth?.user);
  const loading = Boolean(auth?.loading);
  const [authChecked, setAuthChecked] = useState(false);

  useEffect(() => {
    let mounted = true;
    const initialize = async () => {
      try {
        await dispatch(loadAuthState());
      } catch (e) {
        console.warn("loadAuthState error:", e);
      } finally {
        if (mounted) setAuthChecked(true);
      }
    };
    initialize();
    return () => {
      mounted = false;
    };
  }, [dispatch]);

  // Read fallback stored user from localStorage if redux hasn't hydrated yet
  let storedUser = null;
  try {
    const raw = localStorage.getItem("user");
    storedUser = raw ? JSON.parse(raw) : null;
  } catch (e) {
    storedUser = null;
  }
  const user = auth.user ?? storedUser;
  const rawRole = (user?.role || "").toString().toLowerCase();
  const normalizedRole = rawRole.replace(/[-\s]+/g, "_").trim();

  // Wait until auth restoration completes
  if (!authChecked || loading) {
    return (
      <div style={{ padding: 20, display: "flex", justifyContent: "center", alignItems: "center", height: "100vh" }}>
        <h3>Loading...</h3>
      </div>
    );
  }

  // Helper guard component to protect role-specific routes
  const RequireRole = ({ allowedRoles = [], children }) => {
    const role = normalizedRole;
    const ok = allowedRoles.some((r) => role.includes(r) || role === r);
    return ok ? children : <Navigate to="/dashboard" replace />;
  };

  // Constants for layout spacing
  const NAVBAR_HEIGHT = 60;
  const SIDEBAR_WIDTH = 250;

  // STORE OWNER layout (role contains 'store' or 'owner')
  if (normalizedRole.includes("store") || normalizedRole.includes("owner") || normalizedRole === "store_owner") {
    return (
      <div style={{ display: "flex", flexDirection: "column", minHeight: "100vh" }}>
        <Navbar isAuthenticated />
        <div style={{ display: "flex", flex: 1 }}>
          <Sidebar />
          <main
            style={{
              marginLeft: `${SIDEBAR_WIDTH}px`,
              paddingTop: `${NAVBAR_HEIGHT}px`,
              padding: 12,
              width: "100%",
              minHeight: "100vh",
              backgroundColor: "#f8f9fa",
              boxSizing: "border-box",
              
            }}
          >
            <Routes>
              <Route
                path="/dashboard"
                element={
                  <RequireRole allowedRoles={["store", "owner", "store_owner"]}>
                    <Dashboard />
                  </RequireRole>
                }
              />
              <Route
                path="/orders"
                element={
                  <RequireRole allowedRoles={["store", "owner", "store_owner"]}>
                    <Orders />
                  </RequireRole>
                }
              />
              <Route
                path="/menu"
                element={
                  <RequireRole allowedRoles={["store", "owner", "store_owner"]}>
                    <Menu />
                  </RequireRole>
                }
              />
              <Route
                path="/offers"
                element={
                  <RequireRole allowedRoles={["store", "owner", "store_owner"]}>
                    <Offers />
                  </RequireRole>
                }
              />
              <Route
                path="/payments"
                element={
                  <RequireRole allowedRoles={["store", "owner", "store_owner"]}>
                    <StorePayments />
                  </RequireRole>
                }
              />
              <Route
                path="/delivery"
                element={
                  <RequireRole allowedRoles={["store", "owner", "store_owner"]}>
                    <Delivery />
                  </RequireRole>
                }
              />

              {/* Store owner profile route */}
              <Route
                path="/store-owner/profile"
                element={
                  <RequireRole allowedRoles={["store", "owner", "store_owner"]}>
                    <StoreProfile />
                  </RequireRole>
                }
              />

              {/* ALLOW store owners to access delivery signup page */}
              <Route
                path="/signup-delivery"
                element={
                  <RequireRole allowedRoles={["store", "owner", "store_owner"]}>
                    <SignupDelivery />
                  </RequireRole>
                }
              />

              {/* Prevent visiting other auth pages when logged in */}
              <Route path="/login" element={<Navigate to="/dashboard" replace />} />
              <Route path="/signup-store" element={<Navigate to="/dashboard" replace />} />

              <Route path="/" element={<Navigate to="/dashboard" replace />} />
              <Route path="*" element={<Navigate to="/dashboard" replace />} />
            </Routes>
          </main>
        </div>
      </div>
    );
  }

  // DELIVERY layout (role contains 'delivery' or 'driver')
  if (normalizedRole.includes("delivery") || normalizedRole.includes("driver") || normalizedRole === "delivery_boy") {
    // Check if delivery components are available
    if (typeof DeliverySidebar === "undefined" || typeof DeliveryNavbar === "undefined") {
      return (
        <div style={{ padding: 24 }}>
          <h2>Delivery Components Import Problem</h2>
          <p>Please check your delivery component imports.</p>
          <pre>{JSON.stringify({ DeliverySidebar: typeof DeliverySidebar, DeliveryNavbar: typeof DeliveryNavbar }, null, 2)}</pre>
        </div>
      );
    }

    return (
      <div style={{ display: "flex", flexDirection: "column", minHeight: "100vh" }}>
        <DeliveryNavbar />
        <div style={{ display: "flex", flex: 1 }}>
          <DeliverySidebar />
          <main
            style={{
              marginLeft: `${SIDEBAR_WIDTH}px`,
              paddingTop: `${NAVBAR_HEIGHT}px`,
              padding: 12,
              width: "100%",
              minHeight: "100vh",
              backgroundColor: "#f8f9fa",
              boxSizing: "border-box",

            }}
          >
            <Routes>
              <Route
                path="/dashboard"
                element={
                  <RequireRole allowedRoles={["delivery", "driver", "delivery_boy"]}>
                    <Active />
                  </RequireRole>
                }
              />
              <Route
                path="/orders/active"
                element={
                  <RequireRole allowedRoles={["delivery", "driver", "delivery_boy"]}>
                    <Active />
                  </RequireRole>
                }
              />
              <Route
                path="/orders/pending"
                element={
                  <RequireRole allowedRoles={["delivery", "driver", "delivery_boy"]}>
                    <Pending />
                  </RequireRole>
                }
              />
              <Route
                path="/orders/completed"
                element={
                  <RequireRole allowedRoles={["delivery", "driver", "delivery_boy"]}>
                    <Completed />
                  </RequireRole>
                }
              />
              <Route
                path="/payments"
                element={
                  <RequireRole allowedRoles={["delivery", "driver", "delivery_boy"]}>
                    <DeliveryPayments />
                  </RequireRole>
                }
              />
              <Route
                path="/performance"
                element={
                  <RequireRole allowedRoles={["delivery", "driver", "delivery_boy"]}>
                    <Performance />
                  </RequireRole>
                }
              />
              <Route
                path="/support"
                element={
                  <RequireRole allowedRoles={["delivery", "driver", "delivery_boy"]}>
                    <Support />
                  </RequireRole>
                }
              />

              {/* Delivery profile route */}
              <Route
                path="/delivery/profile"
                element={
                  <RequireRole allowedRoles={["delivery", "driver", "delivery_boy"]}>
                    <DeliveryProfile />
                  </RequireRole>
                }
              />

              {/* Prevent visiting auth pages when logged in */}
              <Route path="/login" element={<Navigate to="/dashboard" replace />} />
              <Route path="/signup-store" element={<Navigate to="/dashboard" replace />} />
              <Route path="/signup-delivery" element={<Navigate to="/dashboard" replace />} />

              <Route path="/" element={<Navigate to="/dashboard" replace />} />
              <Route path="*" element={<Navigate to="/dashboard" replace />} />
            </Routes>
          </main>
        </div>
      </div>
    );
  }

  // PUBLIC routes (unauthenticated users)
  if (!isAuthenticated) {
    return (
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/signup-store" element={<SignupStore />} />
        <Route path="/signup-delivery" element={<SignupDelivery />} />
        <Route path="/" element={<Navigate to="/login" replace />} />
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    );
  }

  // Fallback: unknown role (send back to login)
  return (
    <Routes>
      <Route path="*" element={<Navigate to="/login" replace />} />
    </Routes>
  );
}