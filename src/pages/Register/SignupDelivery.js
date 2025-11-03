import React, { useState, useRef } from "react";
import { Eye, EyeOff, Lock } from "lucide-react";
import { useNavigate } from "react-router-dom";
import "./SignupDelivery.css";
import Logoo from "../../Assets/Logoo.jpg"; // FIXED PATH

const SignupDelivery = () => {
  const [showPin, setShowPin] = useState(false);
  const [pin, setPin] = useState(["", "", "", ""]);
  const [confirmPin, setConfirmPin] = useState(["", "", "", ""]);
  const [fileNames, setFileNames] = useState({
    selfie: "No file chosen",
    frontCnic: "No file chosen",
    backCnic: "No file chosen",
  });

  const navigate = useNavigate();

  // Refs for focusing next/prev PIN input
  const pinRefs = useRef([]);
  const confirmPinRefs = useRef([]);

  const handlePinChange = (index, value, setFunc, arr, refs) => {
    if (/^\d?$/.test(value)) {
      const newPin = [...arr];
      newPin[index] = value;
      setFunc(newPin);

      // Auto-move to next box
      if (value && index < arr.length - 1) {
        refs.current[index + 1]?.focus();
      }
    }
  };

  const handlePinKeyDown = (e, index, refs) => {
    if (e.key === "Backspace" && !e.target.value && index > 0) {
      refs.current[index - 1]?.focus();
    }
  };

  const handleFileChange = (e, type) => {
    const file = e.target.files[0];
    setFileNames((prev) => ({
      ...prev,
      [type]: file ? file.name : "No file chosen",
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (pin.join("") !== confirmPin.join("")) {
      alert("❌ PINs do not match!");
      return;
    }
    alert("✅ Delivery Partner Registered Successfully!");
    navigate("/login");
  };

  return (
    <div className="citybites-signup-wrapper">
      {/* ===== LEFT SIDE ===== */}
      <div className="citybites-signup-left">
        <img src={Logoo} alt="CityBites Logo" className="citybites-logo" />
        <h2 className="welcome-heading">Welcome to CityBites</h2>
        <p className="welcome-subtext">
          For Delivery and Store Owners Dashboard Access Only
        </p>

        <div className="info-cards">
          <div className="info-box">👑 Admin Privileges Required</div>
          <div className="info-box">🔐 Secure Access Only</div>
          <div className="info-box">⚡ Full System Control</div>
        </div>
      </div>

      {/* ===== RIGHT SIDE (FORM) ===== */}
      <div className="citybites-signup-right">
        <div className="form-card">
          <h2 className="form-title">Sign Up as Delivery Partner</h2>
          <p className="form-subtitle">Fill in the details to register</p>

          <form onSubmit={handleSubmit}>
            {/* Rider Info */}
            <div className="form-group">
              <label>Rider Name *</label>
              <input type="text" placeholder="Enter Rider Name" required />
            </div>

            <div className="form-group">
              <label>Phone Number *</label>
              <input type="tel" placeholder="+92 3XX-XXXXXXX" required />
            </div>

            <div className="form-group">
              <label>Vehicle Type *</label>
              <select required>
                <option value="">Select Vehicle Type</option>
                <option value="bike">Bike</option>
                <option value="car">Car</option>
                <option value="bicycle">Bicycle</option>
              </select>
            </div>

            <div className="form-group">
              <label>Vehicle Number *</label>
              <input type="text" placeholder="ABC-1234" required />
            </div>

            {/* ===== PIN SECTION ===== */}
            <div className="pin-section">
              <label>Create 4-digit PIN *</label>
              <div className="pin-inputs">
                {pin.map((p, i) => (
                  <input
                    key={i}
                    ref={(el) => (pinRefs.current[i] = el)}
                    type={showPin ? "text" : "password"}
                    maxLength="1"
                    value={p}
                    onChange={(e) =>
                      handlePinChange(i, e.target.value, setPin, pin, pinRefs)
                    }
                    onKeyDown={(e) => handlePinKeyDown(e, i, pinRefs)}
                  />
                ))}
              </div>
            </div>

            <div className="pin-section">
              <label>Confirm 4-digit PIN *</label>
              <div className="pin-inputs">
                {confirmPin.map((p, i) => (
                  <input
                    key={i}
                    ref={(el) => (confirmPinRefs.current[i] = el)}
                    type={showPin ? "text" : "password"}
                    maxLength="1"
                    value={p}
                    onChange={(e) =>
                      handlePinChange(
                        i,
                        e.target.value,
                        setConfirmPin,
                        confirmPin,
                        confirmPinRefs
                      )
                    }
                    onKeyDown={(e) => handlePinKeyDown(e, i, confirmPinRefs)}
                  />
                ))}
              </div>
              <button
                type="button"
                className="show-pin"
                onClick={() => setShowPin(!showPin)}
              >
                {showPin ? <EyeOff size={16} /> : <Eye size={16} />} Show PIN
              </button>
            </div>

            {/* ===== DOCUMENT UPLOADS ===== */}
            <h3 className="document-title">Required Documents</h3>

            <div className="file-upload-wrapper">
              <label htmlFor="selfie" className="file-upload-label">
                📸 Upload Selfie with CNIC
              </label>
              <input
                type="file"
                id="selfie"
                accept="image/*"
                onChange={(e) => handleFileChange(e, "selfie")}
                className="file-upload-input"
                required
              />
              <div className="file-name">{fileNames.selfie}</div>
            </div>

            <div className="file-upload-wrapper">
              <label htmlFor="frontCnic" className="file-upload-label">
                🪪 Upload Front CNIC
              </label>
              <input
                type="file"
                id="frontCnic"
                accept="image/*"
                onChange={(e) => handleFileChange(e, "frontCnic")}
                className="file-upload-input"
                required
              />
              <div className="file-name">{fileNames.frontCnic}</div>
            </div>

            <div className="file-upload-wrapper">
              <label htmlFor="backCnic" className="file-upload-label">
                🪪 Upload Back CNIC
              </label>
              <input
                type="file"
                id="backCnic"
                accept="image/*"
                onChange={(e) => handleFileChange(e, "backCnic")}
                className="file-upload-input"
                required
              />
              <div className="file-name">{fileNames.backCnic}</div>
            </div>

            {/* ===== SUBMIT ===== */}
            <button type="submit" className="submit-btn">
              <Lock size={18} /> Complete Registration
            </button>

            <div className="login-redirect">
              Already have an account?{" "}
              <span onClick={() => navigate("/login")}>Login</span>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default SignupDelivery;