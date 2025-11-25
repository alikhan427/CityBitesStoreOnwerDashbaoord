import React from "react";
import "./Dashboard.css";

// Icon components
const RevenueIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M3 3V21H21" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M7 15L10 12L13.5 15.5L17 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

const OrdersIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M9 5H7C5.89543 5 5 5.89543 5 7V19C5 20.1046 5.89543 21 7 21H17C18.1046 21 19 20.1046 19 19V7C19 5.89543 18.1046 5 17 5H15" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
    <path d="M9 5C9 3.89543 9.89543 3 11 3H13C14.1046 3 15 3.89543 15 5C15 6.10457 14.1046 7 13 7H11C9.89543 7 9 6.10457 9 5Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
    <path d="M9 12H15" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
    <path d="M9 16H15" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
  </svg>
);

const RecentIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="2"/>
    <path d="M12 7V12L15 15" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

const OrderIcon = () => (
  <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M5 3H15C16.1046 3 17 3.89543 17 5V15C17 16.1046 16.1046 17 15 17H5C3.89543 17 3 16.1046 3 15V5C3 3.89543 3.89543 3 5 3Z" stroke="currentColor" strokeWidth="1.5"/>
    <path d="M7 7H13" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
    <path d="M7 11H13" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
    <path d="M7 15H11" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
  </svg>
);

const ArrowRightIcon = () => (
  <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M3 8H13" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M9 4L13 8L9 12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

const Dashboard = () => {
  // Sample data
  const dashboardData = {
    todayRevenue: "PKR 0.00",
    todayOrders: 0,
    totalOrders: 8,
    recentOrders: [
      { id: "135e1a", amount: "PKR 0.00", time: "17:26", items: "No items" },
      { id: "8a2845", amount: "PKR 0.00", time: "23:37", items: "No items" },
      { id: "8a27cc", amount: "PKR 0.00", time: "23:33", items: "No items" },
      { id: "8a2741", amount: "PKR 0.00", time: "23:21", items: "No items" },
      { id: "135c8a", amount: "PKR 0.00", time: "16:35", items: "No items" }
    ]
  };

  const handleSeeAll = () => {
    // Navigate to orders page or show all orders
    console.log("See All clicked");
  };

  return (
    <div className="dashboard-overview">
      <div className="dashboard-overview-header">
        <h1>Dashboard</h1>
      </div>
      
      <div className="dashboard-stats-container">
        <div className="dashboard-stat-card">
          <div className="dashboard-stat-header">
            <div className="dashboard-stat-icon dashboard-revenue-icon">
              <RevenueIcon />
            </div>
            <div className="dashboard-stat-title">
              <h2>Today's Revenue</h2>
            </div>
          </div>
          <div className="dashboard-stat-value">{dashboardData.todayRevenue}</div>
          <div className="dashboard-stat-description">{dashboardData.todayOrders} orders today</div>
        </div>
        
        <div className="dashboard-stat-card">
          <div className="dashboard-stat-header">
            <div className="dashboard-stat-icon dashboard-orders-icon">
              <OrdersIcon />
            </div>
            <div className="dashboard-stat-title">
              <h2>Total Orders</h2>
            </div>
          </div>
          <div className="dashboard-stat-value">{dashboardData.totalOrders}</div>
          <div className="dashboard-stat-description">All time</div>
        </div>
      </div>
      
      <div className="dashboard-recent-orders">
        <div className="dashboard-section-header">
          <div className="dashboard-section-title">
            <div className="dashboard-section-icon">
              <RecentIcon />
            </div>
            <h2>Recent Orders</h2>
          </div>
          <button className="dashboard-see-all-btn" onClick={handleSeeAll} style={{
            color:'red',
          borderColor:"red"
          }}>
            See All
            <ArrowRightIcon />
          </button>
        </div>
        
        <div className="dashboard-orders-list">
          {dashboardData.recentOrders.map((order, index) => (
            <div key={index} className="dashboard-order-item">
              <div className="dashboard-order-main">
                <div className="dashboard-order-icon">
                  <OrderIcon />
                </div>
                <div className="dashboard-order-details">
                  <div className="dashboard-order-id">Order #{order.id}</div>
                  <div className="dashboard-order-items">{order.items}</div>
                </div>
              </div>
              <div className="dashboard-order-info">
                <div className="dashboard-order-amount">{order.amount}</div>
                <div className="dashboard-order-time">{order.time}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;