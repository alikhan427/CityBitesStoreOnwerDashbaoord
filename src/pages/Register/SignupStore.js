import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Camera, Image as Gallery, Lock } from "lucide-react";
import "./SignupStore.css";

const SignupStore = () => {
  const navigate = useNavigate();
  const [storeName, setStoreName] = useState("");
  const [phone, setPhone] = useState("+92");
  const [password, setPassword] = useState("");
  const [photo, setPhoto] = useState(null);
  const [preview, setPreview] = useState(null);

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      setPhoto(file);
      setPreview(URL.createObjectURL(file));
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!storeName || !phone || !password || !photo) {
      alert("Please fill all fields and upload a photo!");
      return;
    }
    alert("✅ Store Owner Registered Successfully!");
    navigate("/login");
  };

  return (
    <div className="signupstore-wrapper">
      <div className="signupstore-card">
        <h2 className="signupstore-title">Register as Store Owner 🏪</h2>
        <p className="signupstore-subtitle">
          Complete the form below to create your CityBites store account.
        </p>

        <form onSubmit={handleSubmit} className="signupstore-form">
          <div className="signupstore-field">
            <label>Store Name</label>
            <input
              type="text"
              value={storeName}
              onChange={(e) => setStoreName(e.target.value)}
              placeholder="Enter your store name"
              required
            />
          </div>

          <div className="signupstore-field">
            <label>Phone Number (+92)</label>
            <input
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="+92 3XX XXXXXXX"
              required
            />
          </div>

          <div className="signupstore-field">
            <label>Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter a strong password"
              required
            />
          </div>

          <div className="signupstore-upload">
            <p className="upload-label">Upload Store Photo</p>
            <div className="upload-buttons">
              <label className="upload-btn camera">
                <Camera size={18} /> Take Photo
                <input
                  type="file"
                  accept="image/*"
                  capture="environment"
                  onChange={handleImageUpload}
                  hidden
                />
              </label>

              <label className="upload-btn gallery">
                <Gallery size={18} /> Choose from Gallery
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageUpload}
                  hidden
                />
              </label>
            </div>

            {preview && (
              <div className="photo-preview">
                <img src={preview} alt="Preview" />
                <p>✅ Photo Selected</p>
              </div>
            )}
          </div>

          <button type="submit" className="signupstore-submit-btn">
            <Lock size={18} /> Complete Registration
          </button>

          <div className="signupstore-footer">
            <p>Already have an account?</p>
            <button
              type="button"
              className="back-login-btn"
              onClick={() => navigate("/login")}
            >
              Back to Login
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default SignupStore;