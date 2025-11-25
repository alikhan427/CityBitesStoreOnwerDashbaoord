import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "./Delivery.css";

const Delivery = () => {
  const navigate = useNavigate();
  const [settings, setSettings] = useState({
    settingsLoaded: true,
    useOwnRiders: false,
    useSystemDelivery: true,
    offerFreeDelivery: false,
    ridersLoaded: true
  });

  const [riders, setRiders] = useState([
    {
      id: 1,
      name: "Asas",
      phone: "+923119924206",
      vehicle: "Bike",
      code: "1134",
      verified: true,
      status: "active"
    }
  ]);

  const [pendingRiders, setPendingRiders] = useState([]);
  const [activeTab, setActiveTab] = useState("settings");

  // Load data from localStorage
  useEffect(() => {
    const savedSettings = localStorage.getItem('deliverySettings');
    const savedRiders = localStorage.getItem('deliveryRiders');
    const savedPendingRiders = localStorage.getItem('pendingRiders');
    
    if (savedSettings) setSettings(JSON.parse(savedSettings));
    if (savedRiders) setRiders(JSON.parse(savedRiders));
    if (savedPendingRiders) setPendingRiders(JSON.parse(savedPendingRiders));
  }, []);

  // Save to localStorage
  useEffect(() => {
    localStorage.setItem('deliverySettings', JSON.stringify(settings));
    localStorage.setItem('deliveryRiders', JSON.stringify(riders));
    localStorage.setItem('pendingRiders', JSON.stringify(pendingRiders));
  }, [settings, riders, pendingRiders]);

  const handleSettingChange = (settingName) => {
    setSettings(prev => ({
      ...prev,
      [settingName]: !prev[settingName]
    }));
  };

  const handleRegisterRider = () => {
    navigate("/signup-delivery");
  };

  const handleVerifyRider = (riderId) => {
    const riderToVerify = pendingRiders.find(rider => rider.id === riderId);
    if (riderToVerify) {
      setRiders(prev => [...prev, { ...riderToVerify, verified: true, status: "active" }]);
      setPendingRiders(prev => prev.filter(rider => rider.id !== riderId));
    }
  };

  const handleRemoveRider = (riderId, isPending = false) => {
    if (isPending) {
      setPendingRiders(prev => prev.filter(rider => rider.id !== riderId));
    } else {
      setRiders(prev => prev.filter(rider => rider.id !== riderId));
    }
  };

  const handleAddTestRider = () => {
    const newRider = {
      id: Date.now(),
      name: `Rider${Math.floor(Math.random() * 1000)}`,
      phone: `+923${Math.floor(100000000 + Math.random() * 900000000)}`,
      vehicle: ["Bike", "Car", "Scooter"][Math.floor(Math.random() * 3)],
      code: Math.floor(1000 + Math.random() * 9000).toString(),
      verified: false,
      status: "pending"
    };
    setPendingRiders(prev => [...prev, newRider]);
  };

  return (
    <div className="delivery-management">
      {/* Header */}
      <div className="delivery-header">
        <div className="delivery-header-info">
          <h1 className="delivery-title">Delivery Management</h1>
          <p className="delivery-description">Manage your delivery settings and riders</p>
        </div>
        <div className="delivery-header-actions">
          <button className="delivery-btn delivery-btn--primary" onClick={handleRegisterRider} style={{backgroundColor:" #db3131"}}>
            <span className="delivery-btn-icon">+</span>
            Register New Rider
          </button>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="delivery-navigation" >
        <button 
          className={`delivery-nav-btn ${activeTab === "settings" ? "delivery-nav-btn--active" : ""}`}
          onClick={() => setActiveTab("settings")}
          
        >
          ⚙️ Delivery Settings
        </button>
        <button 
          className={`delivery-nav-btn ${activeTab === "riders" ? "delivery-nav-btn--active" : ""}`}
          onClick={() => setActiveTab("riders")}
        >
          🚴 Riders Management
        </button>
        <button 
          className={`delivery-nav-btn ${activeTab === "analytics" ? "delivery-nav-btn--active" : ""}`}
          onClick={() => setActiveTab("analytics")}
        >
          📊 Analytics
        </button>
      </div>

      {/* Main Content */}
      <div className="delivery-content">
        {activeTab === "settings" && (
          <div className="delivery-section">
            <div className="delivery-section-heading">
              <h2>Delivery Configuration</h2>
              <p>Configure how you want to handle deliveries for your business</p>
            </div>

            <div className="delivery-settings-grid">
              {/* Delivery Method Card */}
              <div className="delivery-card delivery-card--settings">
                <div className="delivery-card-header">
                  <h3>🚚 Delivery Method</h3>
                  <span className="delivery-badge delivery-badge--required">Required</span>
                </div>
                <div className="delivery-card-body">
                  <div className="delivery-options">
                    <label className="delivery-option">
                      <input
                        type="radio"
                        name="deliveryMethod"
                        checked={settings.useOwnRiders}
                        onChange={() => {
                          setSettings(prev => ({
                            ...prev,
                            useOwnRiders: true,
                            useSystemDelivery: false
                          }))
                        }}
                      />
                      <div className="delivery-option-content">
                        <span className="delivery-option-title">Use My Own Riders</span>
                        <span className="delivery-option-desc">
                          Manage your own delivery team and fees. Great for nearby orders and full control.
                        </span>
                      </div>
                    </label>

                    <label className="delivery-option">
                      <input
                        type="radio"
                        name="deliveryMethod"
                        checked={settings.useSystemDelivery}
                        onChange={() => {
                          setSettings(prev => ({
                            ...prev,
                            useOwnRiders: false,
                            useSystemDelivery: true
                          }))
                        }}
                      />
                      <div className="delivery-option-content">
                        <span className="delivery-option-title">Use System Delivery</span>
                        <span className="delivery-option-desc">
                          Let our platform handle delivery so you can focus on preparing orders.
                        </span>
                      </div>
                    </label>
                  </div>
                </div>
              </div>

              {/* Additional Settings Card */}
              <div className="delivery-card delivery-card--settings">
                <div className="delivery-card-header">
                  <h3>⚡ Additional Settings</h3>
                </div>
                <div className="delivery-card-body">
                  <label className="delivery-toggle">
                    <input
                      type="checkbox"
                      checked={settings.offerFreeDelivery}
                      onChange={() => handleSettingChange('offerFreeDelivery')}
                    />
                    <span className="delivery-toggle-slider"></span>
                    <div className="delivery-toggle-content">
                      <span className="delivery-toggle-title">Offer Free Delivery</span>
                      <span className="delivery-toggle-desc">
                        Provide free delivery to attract more customers
                      </span>
                    </div>
                  </label>

                  <div className="delivery-status">
                    <div className="delivery-status-content">
                      <span className="delivery-status-title">Settings Status</span>
                      <span className="delivery-status-desc">
                        All settings are properly loaded and configured
                      </span>
                    </div>
                    <div className="delivery-status-indicator delivery-status-indicator--active">
                      <div className="delivery-status-dot"></div>
                      Loaded
                    </div>
                  </div>

                  <div className="delivery-status">
                    <div className="delivery-status-content">
                      <span className="delivery-status-title">Riders Status</span>
                      <span className="delivery-status-desc">
                        Delivery riders database is synced and ready
                      </span>
                    </div>
                    <div className="delivery-status-indicator delivery-status-indicator--active">
                      <div className="delivery-status-dot"></div>
                      Loaded
                    </div>
                  </div>
                </div>
              </div>

              {/* Quick Stats Card */}
              <div className="delivery-card delivery-card--stats">
                <div className="delivery-card-header">
                  <h3>📊 Quick Stats</h3>
                </div>
                <div className="delivery-stats">
                  <div className="delivery-stat">
                    <span className="delivery-stat-value">{riders.length}</span>
                    <span className="delivery-stat-label">Active Riders</span>
                  </div>
                  <div className="delivery-stat">
                    <span className="delivery-stat-value">{pendingRiders.length}</span>
                    <span className="delivery-stat-label">Pending</span>
                  </div>
                  <div className="delivery-stat">
                    <span className="delivery-stat-value">
                      {settings.useOwnRiders ? "Own" : "System"}
                    </span>
                    <span className="delivery-stat-label">Current Mode</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === "riders" && (
          <div className="delivery-section">
            <div className="delivery-section-heading">
              <h2>Riders Management</h2>
              <p>Manage your delivery team and their status</p>
            </div>

            <div className="delivery-riders-grid">
              {/* Verified Riders */}
              <div className="delivery-card delivery-card--riders">
                <div className="delivery-card-header">
                  <h3>✅ Verified Riders</h3>
                  <span className="delivery-badge delivery-badge--count">{riders.length}</span>
                </div>
                <div className="delivery-card-body">
                  {riders.length > 0 ? (
                    <div className="delivery-riders-list">
                      {riders.map(rider => (
                        <div key={rider.id} className="delivery-rider">
                          <div className="delivery-rider-avatar">
                            {rider.name.charAt(0)}
                          </div>
                          <div className="delivery-rider-info">
                            <span className="delivery-rider-name">{rider.name}</span>
                            <span className="delivery-rider-details">
                              {rider.phone} · {rider.vehicle} · #{rider.code}
                            </span>
                          </div>
                          <div className="delivery-rider-actions">
                            <span className="delivery-rider-status delivery-rider-status--verified">
                              Verified
                            </span>
                            <button 
                              className="delivery-btn delivery-btn--danger delivery-btn--small"
                              onClick={() => handleRemoveRider(rider.id)}
                            >
                              Remove
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="delivery-empty">
                      <div className="delivery-empty-icon">🚴</div>
                      <p>No verified riders yet</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Pending Riders */}
              <div className="delivery-card delivery-card--riders">
                <div className="delivery-card-header">
                  <h3>⏳ Pending Riders</h3>
                  <span className="delivery-badge delivery-badge--count">{pendingRiders.length}</span>
                </div>
                <div className="delivery-card-body">
                  {pendingRiders.length > 0 ? (
                    <div className="delivery-riders-list">
                      {pendingRiders.map(rider => (
                        <div key={rider.id} className="delivery-rider">
                          <div className="delivery-rider-avatar delivery-rider-avatar--pending">
                            {rider.name.charAt(0)}
                          </div>
                          <div className="delivery-rider-info">
                            <span className="delivery-rider-name">{rider.name}</span>
                            <span className="delivery-rider-details">
                              {rider.phone} · {rider.vehicle} · #{rider.code}
                            </span>
                          </div>
                          <div className="delivery-rider-actions">
                            <button 
                              className="delivery-btn delivery-btn--primary delivery-btn--small"
                              onClick={() => handleVerifyRider(rider.id)}
                            >
                              Verify
                            </button>
                            <button 
                              className="delivery-btn delivery-btn--danger delivery-btn--small"
                              onClick={() => handleRemoveRider(rider.id, true)}
                            >
                              Remove
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="delivery-empty">
                      <div className="delivery-empty-icon">📋</div>
                      <p>No pending riders</p>
                      <button 
                        className="delivery-btn delivery-btn--secondary"
                        onClick={handleAddTestRider}
                      >
                        Add Test Rider
                      </button>
                    </div>
                  )}
                </div>
              </div>

              {/* Registration Card */}
              <div className="delivery-card delivery-card--registration">
                <div className="delivery-card-header">
                  <h3>👤 Register New Rider</h3>
                </div>
                <div className="delivery-card-body">
                  <div className="delivery-registration-content">
                    <div className="delivery-registration-icon">🚀</div>
                    <h4>Expand Your Delivery Team</h4>
                    <p>
                      Add a delivery rider specifically for your business. 
                      Perfect for managing local deliveries and maintaining quality control.
                    </p>
                    <button 
                      className="delivery-btn delivery-btn--primary delivery-btn--large"
                      onClick={handleRegisterRider}
                    >
                      Start Registration Process
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === "analytics" && (
          <div className="delivery-section">
            <div className="delivery-section-heading">
              <h2>Delivery Analytics</h2>
              <p>Track your delivery performance and metrics</p>
            </div>
            <div className="delivery-analytics-placeholder">
              <div className="delivery-placeholder-content">
                <div className="delivery-placeholder-icon">📊</div>
                <h3>Analytics Coming Soon</h3>
                <p>
                  Delivery performance metrics, rider efficiency stats, 
                  and detailed analytics will be available here soon.
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Delivery;