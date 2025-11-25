// Orders.js - Clean White Theme Design
import React, { useState, useEffect, useRef } from "react";
import "./Orders.css";

/* ----------------- icons ----------------- */
const OrderIcon = () => (
  <svg width="14" height="14" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M5 3H15C16.1046 3 17 3.89543 17 5V15C17 16.1046 16.1046 17 15 17H5C3.89543 17 3 16.1046 3 15V5C3 3.89543 3.89543 3 5 3Z" stroke="currentColor" strokeWidth="1.5"/>
    <path d="M7 7H13" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
    <path d="M7 11H13" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
    <path d="M7 15H11" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
  </svg>
);
const UserIcon = () => (
  <svg width="12" height="12" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
    <circle cx="10" cy="6" r="3" stroke="currentColor" strokeWidth="1.5"/>
    <path d="M16 16C16 13.7909 13.3137 12 10 12C6.68629 12 4 13.7909 4 16" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
  </svg>
);
const ClockIcon = () => (
  <svg width="12" height="12" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
    <circle cx="10" cy="10" r="7" stroke="currentColor" strokeWidth="1.5"/>
    <path d="M10 6V10L12.5 12.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);
const MoneyIcon = () => (
  <svg width="14" height="14" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M10 14C12.2091 14 14 12.2091 14 10C14 7.79086 12.2091 6 10 6C7.79086 6 6 7.79086 6 10C6 12.2091 7.79086 14 10 14Z" stroke="currentColor" strokeWidth="1.5"/>
    <path d="M13 3H7C4.79086 3 3 4.79086 3 7V13C3 15.2091 4.79086 17 7 17H13C15.2091 17 17 15.2091 17 13V7C17 4.79086 15.2091 3 13 3Z" stroke="currentColor" strokeWidth="1.5"/>
    <path d="M10 8.5V11.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
    <path d="M8.5 10H11.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
  </svg>
);
const CheckIcon = () => (
  <svg width="12" height="12" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M13 4L6 12L3 9" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
);
const CloseIcon = () => (
  <svg width="12" height="12" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M12 4L4 12M4 4L12 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
);

/* --------------------------------------------------------- */

const LIVE_ORDERS_WS = process.env.REACT_APP_ORDERS_WS || "ws://localhost:4000/ws/orders";
const POLLING_URL = process.env.REACT_APP_ORDERS_API || "/api/orders";
const STATUS_UPDATE_URL = process.env.REACT_APP_ORDERS_STATUS_API || "/api/orders";
const POLLING_INTERVAL_MS = 5000;

const Orders = ({ usePollingFallback = true, useSSE = false }) => {
  const [dateRange, setDateRange] = useState("today");
  const [orderStatus, setOrderStatus] = useState("all");
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [orders, setOrders] = useState([
    { id: "6e135e1a", status: "pending", customer: "John Doe", date: "18/11/2025", amount: "PKR 0.00", time: "17:26" },
    { id: "8a2845", status: "confirmed", customer: "Jane Smith", date: "18/11/2025", amount: "PKR 1,500.00", time: "23:37" },
    { id: "8a27cc", status: "preparing", customer: "Mike Johnson", date: "17/11/2025", amount: "PKR 2,300.00", time: "23:33" },
    { id: "8a2741", status: "pending", customer: "Sarah Wilson", date: "17/11/2025", amount: "PKR 800.00", time: "23:21" }
  ]);

  const wsRef = useRef(null);
  const reconnectAttemptRef = useRef(0);
  const pollingRef = useRef(null);
  const sseRef = useRef(null);

  const dateRanges = [
    { id: "today", label: "Today", active: true },
    { id: "yesterday", label: "Yesterday", active: false },
    { id: "last7", label: "Last 7 Days", active: false },
    { id: "last30", label: "Last 30 Days", active: false }
  ];
  const statusOptions = [
    { id: "all", label: "All" },
    { id: "pending", label: "Pending" },
    { id: "confirmed", label: "Confirmed" },
    { id: "preparing", label: "Preparing" }
  ];

  const filteredOrders = orders.filter(order => {
    if (orderStatus !== "all" && order.status !== orderStatus) return false;
    return true;
  });

  const handleStatusChange = async (orderId, newStatus) => {
    setOrders(prev => prev.map(o => (o.id === orderId ? { ...o, status: newStatus } : o)));
    if (selectedOrder && selectedOrder.id === orderId) {
      setSelectedOrder(prev => ({ ...prev, status: newStatus }));
    }

    try {
      const res = await fetch(`${STATUS_UPDATE_URL}/${orderId}/status`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus })
      });

      if (!res.ok) {
        await refetchOrdersOnce();
      } else {
        const data = await res.json();
        if (data && data.order) upsertOrder(data.order);
      }
    } catch (err) {
      console.error("[Orders] Status update error", err);
      await refetchOrdersOnce();
    }
  };

  const handleViewDetails = (order) => setSelectedOrder(order);

  const upsertOrder = (incomingOrder) => {
    setOrders(prev => {
      const idx = prev.findIndex(o => o.id === incomingOrder.id);
      if (idx === -1) {
        return [incomingOrder, ...prev];
      } else {
        const copy = [...prev];
        copy[idx] = { ...copy[idx], ...incomingOrder };
        return copy;
      }
    });

    if (selectedOrder && selectedOrder.id === incomingOrder.id) {
      setSelectedOrder(prev => ({ ...prev, ...incomingOrder }));
    }
  };

  const deleteOrder = (orderId) => {
    setOrders(prev => prev.filter(o => o.id !== orderId));
    if (selectedOrder && selectedOrder.id === orderId) setSelectedOrder(null);
  };

  const refetchOrdersOnce = async () => {
    try {
      const res = await fetch(POLLING_URL);
      if (!res.ok) return;
      const data = await res.json();
      if (!Array.isArray(data)) return;
      setOrders(data);
      if (selectedOrder) {
        const updated = data.find(o => o.id === selectedOrder.id);
        if (updated) setSelectedOrder(updated);
        else setSelectedOrder(null);
      }
    } catch (err) {
      console.error("[Orders] refetch failed", err);
    }
  };

  useEffect(() => {
    let mounted = true;

    const connectWebSocket = () => {
      if (wsRef.current) {
        try { wsRef.current.close(); } catch (e) {}
        wsRef.current = null;
      }

      try {
        const ws = new WebSocket(LIVE_ORDERS_WS);
        wsRef.current = ws;

        ws.onopen = () => {
          reconnectAttemptRef.current = 0;
          console.info("[Orders] Live WS connected");
        };

        ws.onmessage = (event) => {
          if (!mounted) return;
          let data = null;
          try {
            data = JSON.parse(event.data);
          } catch (e) {
            console.warn("[Orders] Could not parse WS message", e);
            return;
          }

          if (Array.isArray(data)) {
            data.forEach(item => {
              if (item.action === "delete") deleteOrder(item.orderId || item.id);
              else if (item.order) upsertOrder(item.order);
            });
          } else {
            const { action, order, orderId } = data;
            if (action === "delete") deleteOrder(orderId || (order && order.id));
            else if (order) upsertOrder(order);
            else console.warn("[Orders] WS message missing 'order' field:", data);
          }
        };

        ws.onclose = (ev) => {
          console.warn(`[Orders] WS closed code=${ev.code} reason=${ev.reason}`);
          wsRef.current = null;
          if (!mounted) return;
          attemptReconnect();
        };

        ws.onerror = (err) => {
          console.error("[Orders] WS error", err);
        };
      } catch (err) {
        console.error("[Orders] WS connection failed", err);
        attemptReconnect();
      }
    };

    const attemptReconnect = () => {
      reconnectAttemptRef.current = Math.min(10, reconnectAttemptRef.current + 1);
      const backoff = Math.min(30000, 1000 * 2 ** reconnectAttemptRef.current);
      console.info(`[Orders] Reconnecting in ${backoff}ms (attempt ${reconnectAttemptRef.current})`);
      setTimeout(() => {
        if (mounted) connectWebSocket();
      }, backoff);
    };

    if (useSSE) {
      try {
        sseRef.current = new EventSource(LIVE_ORDERS_WS.replace(/^ws/i, "http"));
        sseRef.current.onmessage = (e) => {
          if (!mounted) return;
          try {
            const data = JSON.parse(e.data);
            if (data.order) upsertOrder(data.order);
            else if (data.action === "delete") deleteOrder(data.orderId || data.id);
          } catch (err) {
            console.warn("[Orders] SSE parse error", err);
          }
        };
        sseRef.current.onerror = (err) => {
          console.error("[Orders] SSE error", err);
        };
      } catch (err) {
        console.error("[Orders] SSE failed, falling back to polling", err);
        connectWebSocket();
      }
    } else {
      connectWebSocket();
    }

    if (usePollingFallback) {
      const poll = async () => {
        try {
          const res = await fetch(POLLING_URL);
          if (!res.ok) return;
          const data = await res.json();
          if (!Array.isArray(data)) return;
          setOrders(prev => {
            const map = new Map(prev.map(o => [o.id, o]));
            data.forEach(order => map.set(order.id, { ...map.get(order.id), ...order }));
            return [...map.values()].sort((a,b) => (a.date === b.date ? 0 : (a.date < b.date ? 1 : -1)));
          });
        } catch (err) {
          // ignore
        }
      };
      poll();
      pollingRef.current = setInterval(poll, POLLING_INTERVAL_MS);
    }

    return () => {
      mounted = false;
      try { if (wsRef.current) wsRef.current.close(); } catch (e) {}
      try { if (sseRef.current) sseRef.current.close(); } catch (e) {}
      if (pollingRef.current) clearInterval(pollingRef.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [usePollingFallback, useSSE]);

  const getStatusColor = (status) => {
    switch (status) {
      case "pending": return "#FF9500";
      case "confirmed": return "#007AFF";
      case "preparing": return "#5856D6";
      case "completed": return "#34C759";
      case "cancelled": return "#FF3B30";
      default: return "#8E8E93";
    }
  };

  return (
    <div className="orders-container">
      <div className="orders-grid">
        {/* Left Panel - Filters */}
        <div className="filters-panel">
          <div className="filter-group">
            <h3 className="filter-title">Date Range</h3>
            <div className="filter-buttons">
              {dateRanges.map(range => (
                <button 
                  key={range.id}
                  className={`filter-btn ${dateRange === range.id ? 'filter-btn-active' : ''}`}
                  onClick={() => setDateRange(range.id)}
                >
                  {range.label}
                </button>
              ))}
            </div>
          </div>

          <div className="panel-divider"></div>

          <div className="filter-group">
            <h3 className="filter-title">Order Status</h3>
            <div className="filter-buttons">
              {statusOptions.map(status => (
                <button 
                  key={status.id}
                  className={`filter-btn ${orderStatus === status.id ? 'filter-btn-active' : ''}`}
                  onClick={() => setOrderStatus(status.id)}
                >
                  {status.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Center Panel - Orders List */}
        <div className="orders-panel">
          <div className="orders-stack">
            {filteredOrders.map(order => (
              <div key={order.id} className="order-item">
                <div className="order-header">
                  <div className="order-number">
                    <OrderIcon />
                    <span>#{order.id}</span>
                  </div>
                  <div className="order-state" style={{ color: getStatusColor(order.status) }}>
                    {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                  </div>
                </div>

                <div className="order-info-grid">
                  <div className="info-item">
                    <UserIcon />
                    <span className="info-text">{order.customer}</span>
                  </div>
                  <div className="info-item">
                    <ClockIcon />
                    <span className="info-text">{order.time}</span>
                  </div>
                  <div className="info-item">
                    <MoneyIcon />
                    <span className="info-text-bold">{order.amount}</span>
                  </div>
                </div>

                <div className="order-controls">
                  <div className="control-group">
                    {order.status === "pending" && (
                      <>
                        <button 
                          className="control-btn control-btn-success"
                          onClick={() => handleStatusChange(order.id, "confirmed")}
                        >
                          <CheckIcon /> Confirm
                        </button>
                        <button 
                          className="control-btn control-btn-primary"
                          onClick={() => handleStatusChange(order.id, "preparing")}
                        >
                          Prepare
                        </button>
                      </>
                    )}
                    {order.status === "confirmed" && (
                      <button 
                        className="control-btn control-btn-primary"
                        onClick={() => handleStatusChange(order.id, "preparing")}
                      >
                        Prepare
                      </button>
                    )}
                    <button 
                      className="control-btn control-btn-danger"
                      onClick={() => handleStatusChange(order.id, "cancelled")}
                    >
                      <CloseIcon /> Cancel
                    </button>
                  </div>
                  <button 
                    className="control-btn control-btn-secondary"
                    onClick={() => handleViewDetails(order)}
                  >
                    Details
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right Panel - Order Details */}
        {selectedOrder && (
          <div className="details-panel">
            <div className="details-header">
              <h3>Order #{selectedOrder.id}</h3>
              <button className="close-button" onClick={() => setSelectedOrder(null)}>
                <CloseIcon />
              </button>
            </div>

            <div className="details-content">
              <div className="detail-group">
                <div className="detail-label">Status</div>
                <div className="detail-value" style={{ color: getStatusColor(selectedOrder.status) }}>
                  {selectedOrder.status.charAt(0).toUpperCase() + selectedOrder.status.slice(1)}
                </div>
              </div>

              <div className="detail-group">
                <div className="detail-label">Customer</div>
                <div className="detail-value">
                  <UserIcon />
                  <span>{selectedOrder.customer}</span>
                </div>
              </div>

              <div className="detail-group">
                <div className="detail-label">Date & Time</div>
                <div className="detail-value">
                  <ClockIcon />
                  <span>{selectedOrder.date} at {selectedOrder.time}</span>
                </div>
              </div>

              <div className="panel-divider"></div>

              <div className="detail-group">
                <div className="amount-display">
                  <MoneyIcon />
                  <span>{selectedOrder.amount}</span>
                </div>
              </div>

              <div className="panel-divider"></div>

              <div className="action-stack">
                {selectedOrder.status === "pending" && (
                  <button 
                    className="action-btn action-btn-success"
                    onClick={() => handleStatusChange(selectedOrder.id, "confirmed")}
                  >
                    <CheckIcon /> Confirm Order
                  </button>
                )}
                {selectedOrder.status === "confirmed" && (
                  <button 
                    className="action-btn action-btn-primary"
                    onClick={() => handleStatusChange(selectedOrder.id, "preparing")}
                  >
                    <CheckIcon /> Start Preparing
                  </button>
                )}
                <button 
                  className="action-btn action-btn-danger"
                  onClick={() => handleStatusChange(selectedOrder.id, "cancelled")}
                >
                  <CloseIcon /> Cancel Order
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Orders;