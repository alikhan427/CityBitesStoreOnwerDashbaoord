import React from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { Provider } from "react-redux";
import store from "./redux/store";

// Pages - direct imports from pages folder
import Login from "./pages/Login/Login";
import SignupStore from "./pages/Register/SignupStore";
import SignupDelivery from "./pages/Register/SignupDelivery";

function App() {
  return (
    <Provider store={store}>
      <Router>
        <Routes>
          {/* 🔐 Login Page */}
          <Route path="/login" element={<Login />} />

          {/* 🏪 Store Owner Signup */}
          <Route path="/signup-store" element={<SignupStore />} />

          {/* 🚚 Delivery Boy Signup */}
          <Route path="/signup-delivery" element={<SignupDelivery />} />

          {/* 🔁 Default Redirect */}
          <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
      </Router>
    </Provider>
  );
}

export default App;