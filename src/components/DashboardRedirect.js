import React from "react";
import { useSelector } from "react-redux";
import { Navigate } from "react-router-dom";

const DashboardRedirect = () => {
  // prefer redux state, fallback to localStorage
  const userFromStore = useSelector((s) => s.auth?.user);
  const stored = localStorage.getItem("user");
  let user = userFromStore;
  if (!user && stored) {
    try {
      user = JSON.parse(stored);
    } catch (e) {
      user = null;
    }
  }

  if (!user) return <Navigate to="/login" replace />;

  const role = (user.role || "").toString().toLowerCase();

  if (role === "store_owner" || role === "storeowner" || role === "store") {
    return <Navigate to="/store/dashboard" replace />;
  } else if (role === "delivery" || role === "delivery_boy" || role === "deliveryboy") {
    return <Navigate to="/delivery/dashboard" replace />;
  } else {
    return <Navigate to="/" replace />;
  }
};

export default DashboardRedirect;
