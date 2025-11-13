import React, { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { login, clearError, clearMessage } from "../../redux/slices/authSlice";
import { Eye, EyeOff, Lock } from "lucide-react";
import logo from "../../assets/images/logo.jpg";
import "./login.css";

const Login = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const { loading, status } = useSelector((state) => state.auth);
  const loginStatus = status?.login || {};

  const [formData, setFormData] = useState({
    phone: "",
    pin: "",
  });

  const [showPin, setShowPin] = useState(false);
  const [errors, setErrors] = useState({ phone: "", pin: "" });

  // 🔄 Auto clear backend messages after few seconds
  useEffect(() => {
    if (loginStatus.message || loginStatus.error) {
      const timer = setTimeout(() => {
        dispatch(clearError("login"));
        dispatch(clearMessage("login"));
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [loginStatus, dispatch]);

  // 🧠 Input handling
  const handleChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    setErrors((prev) => ({ ...prev, [field]: "" }));
  };

  // ✅ Validation before submit
  const validate = () => {
    const newErrors = {};
    const cleanPhone = formData.phone.replace(/^0+|-/g, "");
    if (!cleanPhone) newErrors.phone = "Phone number is required";
    else if (!/^3\d{9}$/.test(cleanPhone))
      newErrors.phone = "Invalid phone number (3XX-XXXXXXX)";

    if (!formData.pin.trim()) newErrors.pin = "PIN is required";
    else if (formData.pin.length !== 4)
      newErrors.pin = "PIN must be 4 digits";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // 🚀 Handle Login
  const handleLogin = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    try {
      const formattedPhone = formData.phone.startsWith("+92")
        ? formData.phone
        : `+92${formData.phone.replace(/^0+/, "")}`;

      const credentials = { phone: formattedPhone, pin: formData.pin };
      const result = await dispatch(login(credentials)).unwrap();

      console.log("✅ Login Success:", result);
      alert(result.message || "Login successful!");
      navigate("/dashboard");
    } catch (err) {
      console.error("❌ Login Failed:", err);
    }
  };

  return (
    <div className="login-page">
      <div className="login-container">
        <img src={logo} alt="CityBites" className="login-logo" />
        <h2 className="login-title">Welcome Back</h2>
        <p className="login-subtitle">Login to your CityBites account</p>

        <form onSubmit={handleLogin} className="login-form">
          {/* 📱 Phone Input */}
          <div className="form-group">
            <label>Phone Number *</label>
            <div className="input-container phone-input">
              <span className="country-code">+92</span>
              <input
                type="tel"
                placeholder="3XX-XXXXXXX"
                value={formData.phone}
                onChange={(e) => handleChange("phone", e.target.value)}
                maxLength={10}
                disabled={loading}
                className={errors.phone ? "input-error" : ""}
              />
            </div>
            {errors.phone && <span className="error-text">{errors.phone}</span>}
          </div>

          {/* 🔒 PIN Input */}
          <div className="form-group">
            <label>PIN *</label>
            <div className="input-container">
              <input
                type={showPin ? "text" : "password"}
                placeholder="Enter 4-digit PIN"
                value={formData.pin}
                onChange={(e) => handleChange("pin", e.target.value)}
                maxLength={4}
                disabled={loading}
                className={errors.pin ? "input-error" : ""}
              />
              <button
                type="button"
                className="toggle-pin"
                onClick={() => setShowPin(!showPin)}
              >
                {showPin ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
            {errors.pin && <span className="error-text">{errors.pin}</span>}
          </div>

          {/* 🔄 Loading or Error Message */}
          {loading && <p className="loading-text">Logging in...</p>}
          {loginStatus.error && (
            <p className="error-text">{loginStatus.error}</p>
          )}
          {loginStatus.message && (
            <p className="success-text">{loginStatus.message}</p>
          )}

          <button
            type="submit"
            className={`login-btn ${loading ? "disabled-button" : ""}`}
            disabled={loading}
          >
            <Lock size={18} />
            {loading ? "Logging in..." : "Login"}
          </button>

          {/* Signup Buttons for Store Owner and Delivery Boy */}
          <div className="signup-buttons">
            <p>Don’t have an account? Choose your role:</p>
            <div className="role-buttons">
              <button
                type="button"
                className="signup-btn store-btn"
                onClick={() => navigate("/signup-store")}
              >
                Signup as Store Owner
              </button>
              <button
                type="button"
                className="signup-btn delivery-btn"
                onClick={() => navigate("/signup-delivery")}
              >
                Signup as Delivery Boy
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Login;
