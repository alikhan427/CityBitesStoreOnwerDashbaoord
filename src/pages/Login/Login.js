// src/pages/login/Login.js
import React, { useState, useEffect, useMemo, useRef } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import {
  login,
  clearError,
  clearMessage,
  setCredentials,
} from "../../redux/slices/authSlice";
import { Eye, EyeOff, Smartphone, Lock } from "lucide-react";
import "./Login.css";
import logo from "../../assets/images/logo.jpg"; // adjust if needed

const Login = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  // redux state
  const { loading, status } = useSelector((state) => state.auth || {});
  const loginStatus = useMemo(() => status?.login || {}, [status?.login]);

  // local state
  const [phone, setPhone] = useState("");
  const [pin, setPin] = useState(["", "", "", ""]); // now an array of 4 digits
  const [showPin, setShowPin] = useState(false);
  const [errors, setErrors] = useState({ phone: "", pin: "" });
  const [rememberMe, setRememberMe] = useState(false);

  const phoneInputRef = useRef(null);
  const pinRefs = useRef([]);

  // Autofill remembered phone (if present)
  useEffect(() => {
    const remembered = localStorage.getItem("rememberedPhone");
    if (remembered) {
      setPhone(remembered);
      setRememberMe(true);
    }
    phoneInputRef.current?.focus();
  }, []);

  // If already logged in (token present) redirect
  useEffect(() => {
    if (localStorage.getItem("token")) {
      navigate("/dashboard", { replace: true });
    }
  }, [navigate]);

  // Auto clear backend messages after a short timeout
  useEffect(() => {
    if (loginStatus.message || loginStatus.error) {
      const timer = setTimeout(() => {
        dispatch(clearError("login"));
        dispatch(clearMessage("login"));
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [loginStatus, dispatch]);

  // phone input (local format: 3XXXXXXXXX)
  const handlePhoneChange = (value) => {
    const cleaned = value.replace(/\D/g, "").slice(0, 10);
    setPhone(cleaned);
    setErrors((prev) => ({ ...prev, phone: "" }));
  };

  // pin handlers (4 separate boxes)
  const handlePinChange = (value, index) => {
    const digit = value.replace(/\D/g, "").slice(0, 1);
    const newPin = [...pin];
    newPin[index] = digit;
    setPin(newPin);
    setErrors((prev) => ({ ...prev, pin: "" }));

    if (digit && index < 3) {
      // move focus to next input
      setTimeout(() => pinRefs.current[index + 1]?.focus(), 10);
    }
  };

  const handlePinKeyDown = (e, index) => {
    if (e.key === "Backspace") {
      if (!pin[index] && index > 0) {
        pinRefs.current[index - 1]?.focus();
      } else {
        // clear current if it had value
        const newPin = [...pin];
        newPin[index] = "";
        setPin(newPin);
      }
    } else if (e.key === "ArrowLeft" && index > 0) {
      pinRefs.current[index - 1]?.focus();
    } else if (e.key === "ArrowRight" && index < 3) {
      pinRefs.current[index + 1]?.focus();
    }
  };

  const validate = () => {
    const newErrors = {};
    const cleanPhone = phone.replace(/^0+|-/g, "");

    if (!cleanPhone) newErrors.phone = "Phone number is required";
    else if (!/^3\d{9}$/.test(cleanPhone))
      newErrors.phone = "Invalid phone number (3XX-XXXXXXX)";

    const pinCode = pin.join("");
    if (!/^\d{4}$/.test(pinCode)) newErrors.pin = "PIN must be 4 digits";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter") handleLogin(e);
  };

  // login submit
  const handleLogin = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    try {
      const formattedPhone = phone.startsWith("+92")
        ? phone
        : `+92${phone.replace(/^0+/, "")}`;

      const credentials = { phone: formattedPhone, pin: pin.join("") };
      const result = await dispatch(login(credentials)).unwrap();

      if (result?.token) {
        // persist token
        localStorage.setItem("token", result.token);

        // remember phone optionally (store local short format)
        if (rememberMe) {
          localStorage.setItem("rememberedPhone", phone);
        } else {
          localStorage.removeItem("rememberedPhone");
        }

        // set credentials in redux (user + token)
        try {
          dispatch(
            setCredentials({
              user: result.user ?? null,
              token: result.token,
              isVerified: result.user?.isVerified ?? false,
            })
          );
        } catch (err) {
          // ignore
        }

        navigate("/dashboard", { replace: true });
      }
    } catch (err) {
      console.error("Login failed:", err);
    }
  };

  return (
    <div className="citybites-login-wrapper">
      {/* LEFT HERO */}
      <div className="citybites-login-left">
        <div className="citybites-login-left-content">
          <img src={logo} alt="CityBites Logo" className="citybites-login-logo" />
          <h1 className="citybites-login-title">Welcome Back to CityBites</h1>
          <p className="citybites-login-subtitle">
            For Delivery and Store Owners Dashboard Access Only
          </p>

          <div className="citybites-login-feature-list">
            <div className="citybites-login-feature-item">
              <div className="citybites-login-feature-icon">👑</div>
              <span>Admin Privileges Required</span>
            </div>

            <div className="citybites-login-feature-item">
              <div className="citybites-login-feature-icon">🔒</div>
              <span>Secure Access Only</span>
            </div>

            <div className="citybites-login-feature-item">
              <div className="citybites-login-feature-icon">⚡</div>
              <span>Full System Control</span>
            </div>
          </div>
        </div>
      </div>

      {/* RIGHT FORM */}
      <div className="citybites-login-right">
        <div className="citybites-login-container">
          <form onSubmit={handleLogin} className="citybites-login-card" noValidate>
            <div className="citybites-login-card-header">
              <h5 className="citybites-login-card-title">Welcome Back 👋</h5>
              <p className="citybites-login-card-subtitle">
                Enter your phone and 4-digit PIN to continue
              </p>
            </div>

            {/* Backend messages from slice */}
            {loginStatus.error && (
              <div className="citybites-login-error-message">
                <div className="citybites-login-error-icon">⚠</div>
                <div className="citybites-login-error-text">{loginStatus.error}</div>
              </div>
            )}
            {loginStatus.message && (
              <div className="citybites-login-error-message" style={{ borderColor: "#d1fae5" }}>
                <div style={{ color: "#10b981" }}>✔</div>
                <div style={{ color: "#065f46" }}>{loginStatus.message}</div>
              </div>
            )}

            {/* Phone */}
            <div className="citybites-login-input-group">
              <label htmlFor="phone" className="citybites-login-form-label">
                <Smartphone size={16} /> Phone Number
              </label>

              <div
                className={
                  "citybites-login-input-wrapper " +
                  (errors.phone ? "error " : "") +
                  (phone ? "focused" : "")
                }
              >
                <span style={{ padding: "0 12px", fontWeight: 700, color: "#2d3436" }}>+92</span>
                <input
                  id="phone"
                  ref={phoneInputRef}
                  name="phone"
                  type="tel"
                  placeholder="3XX-XXXXXXX"
                  value={phone}
                  onChange={(e) => handlePhoneChange(e.target.value)}
                  onKeyDown={handleKeyDown}
                  className="citybites-login-form-input"
                  maxLength={10}
                  disabled={loading}
                  aria-invalid={!!errors.phone}
                />
              </div>

              {errors.phone && <div className="citybites-login-field-error">• {errors.phone}</div>}
            </div>

            {/* PIN (4 boxes) */}
            <div className="citybites-login-input-group">
              <label className="citybites-login-form-label">
                <Lock size={16} /> PIN
              </label>

              <div className="citybites-login-pin-container">
                <div className={"citybites-login-pin-group " + (errors.pin ? "error" : "")}>
                  {pin.map((digit, idx) => (
                    <input
                      key={idx}
                      ref={(el) => (pinRefs.current[idx] = el)}
                      className="citybites-login-pin-box"
                      type={showPin ? "text" : "password"}
                      inputMode="numeric"
                      maxLength={1}
                      value={digit}
                      onChange={(e) => handlePinChange(e.target.value, idx)}
                      onKeyDown={(e) => handlePinKeyDown(e, idx)}
                      disabled={loading}
                      aria-label={`PIN digit ${idx + 1}`}
                    />
                  ))}
                </div>

                <div className="citybites-login-pin-toggle">
                  <button
                    type="button"
                    className={"citybites-login-toggle-btn " + (showPin ? "visible" : "")}
                    onClick={() => setShowPin((s) => !s)}
                    disabled={loading}
                  >
                    {showPin ? <EyeOff size={16} /> : <Eye size={16} />}
                    <span style={{ marginLeft: 8 }}>{showPin ? "Hide PIN" : "Show PIN"}</span>
                  </button>
                </div>
              </div>

              {errors.pin && <div className="citybites-login-field-error">• {errors.pin}</div>}
            </div>

            {/* Remember phone checkbox */}
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginTop: 6 }}>
              <input
                id="remember"
                type="checkbox"
                checked={rememberMe}
                onChange={() => setRememberMe((v) => !v)}
                disabled={loading}
              />
              <label htmlFor="remember" style={{ color: "#6b7280", fontSize: 14 }}>
                Remember phone
              </label>
            </div>

            <button
              type="submit"
              className={"citybites-login-btn " + (loading ? "disabled" : "")}
              disabled={loading}
            >
              <Lock size={18} /> {loading ? "Signing in..." : "Sign in"}
            </button>

            <div className="citybites-login-card-footer">
              <p className="citybites-login-support-text">
                Don’t have an account? Choose your role to sign up:
              </p>

              <div className="citybites-login-signup-buttons">
                <button
                  type="button"
                  className="citybites-login-signup-btn store-btn"
                  onClick={() => navigate("/signup-store")}
                >
                  Sign Up as Store Owner
                </button>

                <button
                  type="button"
                  className="citybites-login-signup-btn delivery-btn"
                  onClick={() => navigate("/signup-delivery")}
                >
                  Sign Up as Delivery Boy
                </button>
              </div>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Login;



