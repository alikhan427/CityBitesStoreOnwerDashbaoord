import React, { useState, useEffect } from 'react';
import './Pending.css';

const Pending = () => {
  const [pendingOrders, setPendingOrders] = useState([
    {
      id: 'ORD-004',
      customer: 'Emily Davis',
      address: '321 Maple Street, Floor 2',
      amount: '$28.90',
      items: 3,
      orderTime: '10:15 AM',
      estimatedTime: '25 min',
      restaurant: 'Burger Palace',
      specialInstructions: 'Extra ketchup, no onions'
    },
    {
      id: 'ORD-005',
      customer: 'Robert Wilson',
      address: '654 Cedar Avenue',
      amount: '$45.75',
      items: 5,
      orderTime: '10:30 AM',
      estimatedTime: '35 min',
      restaurant: 'Pizza Heaven',
      specialInstructions: 'Leave at door, do not ring bell'
    },
    {
      id: 'ORD-006',
      customer: 'Lisa Thompson',
      address: '987 Birch Road',
      amount: '$19.50',
      items: 2,
      orderTime: '10:45 AM',
      estimatedTime: '20 min',
      restaurant: 'Taco Fiesta',
      specialInstructions: 'Add extra guacamole'
    }
  ]);

  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 60000); // Update every minute

    return () => clearInterval(timer);
  }, []);

  const handleAcceptOrder = (orderId) => {
    setPendingOrders(orders => orders.filter(order => order.id !== orderId));
    alert(`Order ${orderId} accepted and moved to Active Orders!`);
  };

  const handleDeclineOrder = (orderId) => {
    setPendingOrders(orders => orders.filter(order => order.id !== orderId));
    alert(`Order ${orderId} declined!`);
  };

  const getRestaurantColor = (restaurant) => {
    const colors = {
      'Burger Palace': '#e74c3c',
      'Pizza Heaven': '#3498db',
      'Taco Fiesta': '#2ecc71',
      'Sushi Master': '#9b59b6',
      'Default': '#667eea'
    };
    return colors[restaurant] || colors['Default'];
  };

  return (
    <div className="pending-orders-container">
      {/* Header Section */}
      <div className="pending-header">
        <div className="header-content">
          <h1 className="pending-title">Pending Orders</h1>
          <p className="pending-subtitle">Orders waiting for delivery acceptance</p>
        </div>
        <div className="header-stats">
          <div className="stat-item">
            <span className="stat-number">{pendingOrders.length}</span>
            <span className="stat-label">Pending</span>
          </div>
          <div className="current-time">
            🕒 {currentTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
          </div>
        </div>
      </div>

      {/* Orders Grid */}
      <div className="pending-orders-grid">
        {pendingOrders.length === 0 ? (
          <div className="no-pending-orders">
            <div className="empty-state">
              <div className="empty-icon">📭</div>
              <h3>No Pending Orders</h3>
              <p>All orders have been accepted. New orders will appear here shortly.</p>
              <button className="refresh-btn">🔄 Refresh Orders</button>
            </div>
          </div>
        ) : (
          pendingOrders.map((order) => (
            <div key={order.id} className="pending-order-card">
              {/* Order Header */}
              <div className="order-header">
                <div className="order-id-time">
                  <span className="order-id">{order.id}</span>
                  <span className="order-time">Ordered at {order.orderTime}</span>
                </div>
                <div 
                  className="restaurant-tag"
                  style={{ backgroundColor: getRestaurantColor(order.restaurant) }}
                >
                  {order.restaurant}
                </div>
              </div>

              {/* Customer & Address */}
              <div className="customer-section">
                <div className="customer-info">
                  <span className="customer-name">👤 {order.customer}</span>
                  <span className="customer-address">📍 {order.address}</span>
                </div>
              </div>

              {/* Order Details */}
              <div className="order-details">
                <div className="detail-row">
                  <div className="detail-item">
                    <span className="detail-label">Amount:</span>
                    <span className="detail-value amount">{order.amount}</span>
                  </div>
                  <div className="detail-item">
                    <span className="detail-label">Items:</span>
                    <span className="detail-value">{order.items} items</span>
                  </div>
                </div>
                <div className="detail-row">
                  <div className="detail-item">
                    <span className="detail-label">Est. Prep Time:</span>
                    <span className="detail-value time">{order.estimatedTime}</span>
                  </div>
                </div>
              </div>

              {/* Special Instructions */}
              {order.specialInstructions && (
                <div className="special-instructions">
                  <span className="instructions-label">📝 Special Instructions:</span>
                  <p className="instructions-text">{order.specialInstructions}</p>
                </div>
              )}

              {/* Action Buttons */}
              <div className="order-actions">
                <button 
                  className="btn btn-accept"
                  onClick={() => handleAcceptOrder(order.id)}
                >
                  ✅ Accept Order
                </button>
                <button 
                  className="btn btn-decline"
                  onClick={() => handleDeclineOrder(order.id)}
                >
                  ❌ Decline
                </button>
                <button className="btn btn-details">
                  📋 View Details
                </button>
              </div>

              {/* Distance & ETA Info */}
              <div className="order-meta">
                <div className="meta-info">
                  <span className="meta-item">🚗 2.3 km away</span>
                  <span className="meta-item">⏱️ ETA: 15 min</span>
                  <span className="meta-item">💰 Earn: ${(parseFloat(order.amount.replace('$', '')) * 0.15).toFixed(2)}</span>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Quick Stats */}
      <div className="quick-stats">
        <div className="stats-grid">
          <div className="stat-card">
            <div className="stat-icon">⏱️</div>
            <div className="stat-content">
              <div className="stat-main">{pendingOrders.length}</div>
              <div className="stat-desc">Waiting Acceptance</div>
            </div>
          </div>
          <div className="stat-card">
            <div className="stat-icon">💰</div>
            <div className="stat-content">
              <div className="stat-main">
                ${pendingOrders.reduce((total, order) => total + parseFloat(order.amount.replace('$', '')), 0).toFixed(2)}
              </div>
              <div className="stat-desc">Total Order Value</div>
            </div>
          </div>
          <div className="stat-card">
            <div className="stat-icon">📦</div>
            <div className="stat-content">
              <div className="stat-main">
                {pendingOrders.reduce((total, order) => total + order.items, 0)}
              </div>
              <div className="stat-desc">Total Items</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Pending;