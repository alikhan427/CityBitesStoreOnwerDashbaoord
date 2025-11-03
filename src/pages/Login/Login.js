import React, { useState, useEffect, useRef, useCallback } from "react";
import { useDispatch, useSelector } from "react-redux";
import { login, clearError } from "../../redux/slices/authSlices";
import { useNavigate } from "react-router-dom";
import { Eye, EyeOff, Smartphone, Lock, Check, X, AlertCircle } from "lucide-react";
import "./Login.css";
import Logoo from "../../Assets/Logoo.jpg";

const Login = () => {
  const [phone, setPhone] = useState("+92");
  const [pin, setPin] = useState(["", "", "", ""]);
  const [showPin, setShowPin] = useState(false);
  const [formErrors, setFormErrors] = useState({});
  const [isFocused, setIsFocused] = useState({ phone: false });
  const [phoneValidation, setPhoneValidation] = useState({ isValid: false, isTouched: false });

  const pinRefs = useRef([]);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const { loading, error, isAuthenticated, user } = useSelector((state) => state.auth);

  const validatePhone = useCallback((phoneNumber) => {
    const phoneRegex = /^\+923[0-9]{9}$/;
    if (!phoneNumber.startsWith("+92")) return "Phone must start with +92";
    if (phoneNumber.length !== 13) return "Phone must be 13 digits including +92";
    if (!phoneRegex.test(phoneNumber)) return "Must be a valid Pakistani number (+92XXXXXXXXXX)";
    return null;
  }, []);

  const validatePin = useCallback((pinArray) => {
    const pinCode = pinArray.join("");
    if (pinCode.length !== 4) return "PIN must be exactly 4 digits";
    if (!/^\d+$/.test(pinCode)) return "PIN must contain only numbers";
    return null;
  }, []);

  const getRedirectPath = useCallback((userData) => {
    if (!userData?.role) return "/login";
    return userData.role.toLowerCase() === "admin" ? "/" : "/login";
  }, []);

  useEffect(() => {
    if (isAuthenticated && user) {
      const redirectPath = getRedirectPath(user);
      if (redirectPath === "/login") {
        setFormErrors({ access: "Access denied. Admin privileges required." });
      } else {
        navigate(redirectPath, { replace: true });
      }
    }
  }, [isAuthenticated, user, navigate, getRedirectPath]);

  useEffect(() => {
    if (error) dispatch(clearError("login"));
    setFormErrors({});
  }, [phone, pin, dispatch, error]);

  const handlePhoneChange = (e) => {
    let value = e.target.value.replace(/(?!^\+)\D/g, "");
    if (!value.startsWith("+92")) value = "+92" + value.replace(/^\+92/, "").replace(/^\+?/, "");
    if (value.length > 13) value = value.slice(0, 13);
    setPhone(value);

    const phoneError = validatePhone(value);
    setPhoneValidation({ isValid: !phoneError && value.length === 13, isTouched: true });
    setFormErrors((prev) => ({ ...prev, phone: phoneError }));
  };

  const handlePinChange = (e, index) => {
    const value = e.target.value.replace(/\D/g, "").slice(0, 1);
    const newPin = [...pin];
    newPin[index] = value;
    setPin(newPin);
    if (value && index < 3) setTimeout(() => pinRefs.current[index + 1]?.focus(), 10);
    else if (!value && index > 0) setTimeout(() => pinRefs.current[index - 1]?.focus(), 10);

    const pinError = validatePin(newPin);
    setFormErrors((prev) => ({ ...prev, pin: pinError }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const phoneError = validatePhone(phone);
    const pinError = validatePin(pin);
    const pinCode = pin.join("");
    if (phoneError || pinError) {
      setFormErrors({ phone: phoneError, pin: pinError });
      return;
    }
    setFormErrors({});
    dispatch(clearError("login"));
    dispatch(login({ phone, pin: pinCode }));
  };

  const isFormValid = phone.length === 13 && pin.join("").length === 4 && !formErrors.phone && !formErrors.pin;

  return (
    <div className="citybites-login-wrapper">
      <div className="citybites-login-left">
        <div className="citybites-login-left-content">
          <img src={Logoo} alt="CityBites Logo" className="citybites-login-logo" />
          <h1 className="citybites-login-title">Welcome Back to CityBites</h1>
          <p className="citybites-login-subtitle">For Delivery and Store Owners Dashboard Access Only</p>

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

      <div className="citybites-login-right">
        <div className="citybites-login-container">
          <form onSubmit={handleSubmit} className="citybites-login-card" noValidate>
            <div className="citybites-login-card-header">
              <h5 className="citybites-login-card-title">Welcome Back 👋</h5>
              <p className="citybites-login-card-subtitle">
                "Access to the dashboard is restricted to Store Owners and Delivery Boys with valid credentials."
              </p>
            </div>

            {error && (
              <div className="citybites-login-error-message">
                <div className="citybites-login-error-icon">⚠</div>
                <div className="citybites-login-error-text">{error}</div>
              </div>
            )}
            {formErrors.access && (
              <div className="citybites-login-error-message">
                <AlertCircle size={18} />
                <div className="citybites-login-error-text">{formErrors.access}</div>
              </div>
            )}

            <div className="citybites-login-input-group">
              <label htmlFor="phone" className="citybites-login-form-label">
                <Smartphone size={16} /> Admin Phone Number
              </label>
              <div
                className={`citybites-login-input-wrapper ${isFocused.phone ? "focused" : ""} ${
                  formErrors.phone ? "error" : ""
                } ${phoneValidation.isValid ? "valid" : ""}`}
              >
                <input
                  id="phone"
                  type="tel"
                  value={phone}
                  onChange={handlePhoneChange}
                  onFocus={() => setIsFocused((prev) => ({ ...prev, phone: true }))}
                  onBlur={() => setIsFocused((prev) => ({ ...prev, phone: false }))}
                  placeholder="+92 3XX XXXXXXX"
                  className="citybites-login-form-input"
                  required
                  disabled={loading}
                />
                {phoneValidation.isTouched && (
                  <div className="citybites-login-validation-icon">
                    {phoneValidation.isValid ? (
                      <Check size={16} className="valid-icon" />
                    ) : (
                      <X size={16} className="invalid-icon" />
                    )}
                  </div>
                )}
              </div>
              {formErrors.phone && (
                <div className="citybites-login-field-error">
                  <span>•</span>
                  {formErrors.phone}
                </div>
              )}
            </div>

            <div className="citybites-login-input-group">
              <label className="citybites-login-form-label">
                <Lock size={16} /> Security PIN
              </label>
              <div className="citybites-login-pin-container">
                <div className={`citybites-login-pin-group ${formErrors.pin ? "error" : ""}`}>
                  {pin.map((digit, index) => (
                    <input
                      key={index}
                      ref={(el) => (pinRefs.current[index] = el)}
                      type={showPin ? "text" : "password"}
                      inputMode="numeric"
                      maxLength="1"
                      value={digit}
                      onChange={(e) => handlePinChange(e, index)}
                      className="citybites-login-pin-box"
                      required
                      disabled={loading}
                    />
                  ))}
                </div>
                <div className="citybites-login-pin-toggle">
                  <button
                    type="button"
                    className={`citybites-login-toggle-btn ${showPin ? "visible" : ""}`}
                    onClick={() => setShowPin((s) => !s)}
                    disabled={loading}
                  >
                    {showPin ? <EyeOff size={16} /> : <Eye size={16} />}
                    <span>{showPin ? "Hide PIN" : "Show PIN"}</span>
                  </button>
                </div>
              </div>
              {formErrors.pin && (
                <div className="citybites-login-field-error">
                  <span>•</span>
                  {formErrors.pin}
                </div>
              )}
            </div>

            <button
              type="submit"
              className={`citybites-login-btn ${!isFormValid || loading ? "disabled" : ""}`}
              disabled={loading || !isFormValid}
            >
              {loading ? (
                <>
                  <div className="citybites-login-spinner"></div> Verifying Admin Access...
                </>
              ) : (
                <>
                  <Lock size={18} /> Access Admin Dashboard
                </>
              )}
            </button>

            <div className="citybites-login-card-footer">
              <p className="citybites-login-support-text">
                Don't have an account? Choose your role to sign up:
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
              <div className="citybites-login-security-notice">
                <AlertCircle size={14} /> Secure login powered by CityBites
              </div>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Login;