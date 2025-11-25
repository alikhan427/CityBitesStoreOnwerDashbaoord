import React, { useState, useEffect } from 'react';
import './Active.css';

const Active = () => {
  const [activeOrders, setActiveOrders] = useState([
    {
      id: 'ORD-001',
      customer: 'John Smith',
      address: '123 Main St, Apt 4B',
      amount: '$24.50',
      distance: '1.2 km',
      timeLeft: '25 min',
      status: 'preparing'
    },
    {
      id: 'ORD-002',
      customer: 'Sarah Johnson',
      address: '456 Oak Avenue',
      amount: '$18.75',
      distance: '0.8 km',
      timeLeft: '15 min',
      status: 'on the way'
    },
    {
      id: 'ORD-003',
      customer: 'Mike Chen',
      address: '789 Pine Road',
      amount: '$32.20',
      distance: '2.1 km',
      timeLeft: '35 min',
      status: 'ready for pickup'
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
    setActiveOrders(orders => 
      orders.map(order => 
        order.id === orderId 
          ? { ...order, status: 'accepted' }
          : order
      )
    );
    alert(`Order ${orderId} accepted!`);
  };

  const handleCompleteOrder = (orderId) => {
    setActiveOrders(orders => orders.filter(order => order.id !== orderId));
    alert(`Order ${orderId} completed!`);
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'preparing': return '#f59e0b';
      case 'ready for pickup': return '#3b82f6';
      case 'on the way': return '#8b5cf6';
      case 'accepted': return '#10b981';
      default: return '#6b7280';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'preparing': return '👨‍🍳';
      case 'ready for pickup': return '📦';
      case 'on the way': return '🚗';
      case 'accepted': return '✅';
      default: return '⏱️';
    }
  };

  return (
    <div className="active-orders-container">
      {/* Header Section */}
      <div className="active-orders-header">
        <h1 className="active-orders-title">Active Orders</h1>
        <div className="active-orders-stats">
          <div className="stat-card">
            <span className="stat-number">{activeOrders.length}</span>
            <span className="stat-label">Active Orders</span>
          </div>
          <div className="stat-card">
            <span className="stat-number">
              {activeOrders.filter(order => order.status === 'on the way').length}
            </span>
            <span className="stat-label">In Delivery</span>
          </div>
          <div className="stat-card">
            <span className="stat-number">
              {activeOrders.filter(order => order.status === 'ready for pickup').length}
            </span>
            <span className="stat-label">Ready for Pickup</span>
          </div>
        </div>
      </div>

      {/* Current Time */}
      <div className="current-time">
        <span>🕒 {currentTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
      </div>

      {/* Orders List */}
      <div className="orders-grid">
        {activeOrders.length === 0 ? (
          <div className="no-orders">
            <div className="no-orders-icon">📭</div>
            <h3>No Active Orders</h3>
            <p>You're all caught up! New orders will appear here.</p>
          </div>
        ) : (
          activeOrders.map((order) => (
            <div key={order.id} className="order-card">
              <div className="order-header">
                <div className="order-id">{order.id}</div>
                <div 
                  className="order-status"
                  style={{ backgroundColor: getStatusColor(order.status) }}
                >
                  {getStatusIcon(order.status)} {order.status.toUpperCase()}
                </div>
              </div>
              
              <div className="order-details">
                <div className="customer-info">
                  <span className="customer-name">👤 {order.customer}</span>
                  <span className="customer-address">📍 {order.address}</span>
                </div>
                
                <div className="order-meta">
                  <div className="meta-item">
                    <span className="meta-label">Amount:</span>
                    <span className="meta-value">{order.amount}</span>
                  </div>
                  <div className="meta-item">
                    <span className="meta-label">Distance:</span>
                    <span className="meta-value">{order.distance}</span>
                  </div>
                  <div className="meta-item">
                    <span className="meta-label">Time Left:</span>
                    <span className="meta-value time-warning">{order.timeLeft}</span>
                  </div>
                </div>
              </div>

              <div className="order-actions">
                {order.status === 'ready for pickup' && (
                  <button 
                    className="btn btn-accept"
                    onClick={() => handleAcceptOrder(order.id)}
                  >
                    🚗 Accept Delivery
                  </button>
                )}
                {order.status === 'on the way' && (
                  <button 
                    className="btn btn-complete"
                    onClick={() => handleCompleteOrder(order.id)}
                  >
                    ✅ Mark Delivered
                  </button>
                )}
                {(order.status === 'preparing' || order.status === 'accepted') && (
                  <button className="btn btn-view" disabled>
                    👀 View Details
                  </button>
                )}
                
                <button className="btn btn-call">
                  📞 Call Customer
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Quick Actions */}
      <div className="quick-actions">
        <h3>Quick Actions</h3>
        <div className="action-buttons">
          <button className="action-btn">
            🗺️ View Map
          </button>
          <button className="action-btn">
            📋 Today's Schedule
          </button>
          <button className="action-btn">
            ⚡ Go Online
          </button>
          <button className="action-btn">
            📊 Earnings
          </button>
        </div>
      </div>
    </div>
  );
};

export default Active;