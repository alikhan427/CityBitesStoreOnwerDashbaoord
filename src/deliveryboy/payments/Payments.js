// src/pages/payments/Payments.jsx
import React, { useState, useEffect } from "react";
import "./Payments.css";

const Payments = () => {
  const [paymentMethods, setPaymentMethods] = useState([]);
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddPaymentModal, setShowAddPaymentModal] = useState(false);
  const [newPaymentMethod, setNewPaymentMethod] = useState({
    type: "bank",
    bankName: "",
    accountNumber: "",
    routingNumber: "",
    accountType: "checking"
  });

  // Mock API calls
  useEffect(() => {
    fetchPaymentMethods();
    fetchTransactions();
  }, []);

  const fetchPaymentMethods = async () => {
    try {
      setTimeout(() => {
        const methods = [
          {
            id: 1,
            type: "bank",
            title: "Bank Account",
            details: "**** 1234",
            isDefault: true,
            bankName: "Chase Bank",
            accountType: "Checking"
          }
        ];
        setPaymentMethods(methods);
      }, 500);
    } catch (error) {
      console.error("Error fetching payment methods:", error);
    }
  };

  const fetchTransactions = async () => {
    try {
      setTimeout(() => {
        const allTransactions = [
          {
            id: 1,
            title: "Order #CB28341 + Tip",
            date: "2024-01-15 14:30",
            amount: "+$28.40",
            type: "positive",
            trend: "up",
            status: "completed"
          },
          {
            id: 2,
            title: "Order #CB28338",
            date: "2024-01-15 13:15",
            amount: "+$35.20",
            type: "positive",
            trend: "up",
            status: "completed"
          },
          {
            id: 3,
            title: "Bank Transfer",
            date: "2024-01-14 09:00",
            amount: "$100.00",
            type: "negative",
            trend: "down",
            status: "completed"
          }
        ];
        setTransactions(allTransactions);
        setLoading(false);
      }, 800);
    } catch (error) {
      console.error("Error fetching transactions:", error);
      setLoading(false);
    }
  };

  const handleAddPaymentMethod = () => {
    setShowAddPaymentModal(true);
  };

  const handleCloseModal = () => {
    setShowAddPaymentModal(false);
    setNewPaymentMethod({
      type: "bank",
      bankName: "",
      accountNumber: "",
      routingNumber: "",
      accountType: "checking"
    });
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewPaymentMethod(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleAddNewPayment = () => {
    if (!newPaymentMethod.bankName || !newPaymentMethod.accountNumber || !newPaymentMethod.routingNumber) {
      alert("Please fill in all required bank details");
      return;
    }

    const newMethod = {
      id: Date.now(),
      type: "bank",
      title: "Bank Account",
      details: `**** ${newPaymentMethod.accountNumber.slice(-4)}`,
      isDefault: paymentMethods.length === 0,
      bankName: newPaymentMethod.bankName,
      accountType: newPaymentMethod.accountType
    };

    setPaymentMethods(prev => [...prev, newMethod]);
    handleCloseModal();
  };

  const handleSetDefault = (methodId) => {
    const updatedMethods = paymentMethods.map(method => ({
      ...method,
      isDefault: method.id === methodId
    }));
    setPaymentMethods(updatedMethods);
  };

  const handleRemovePaymentMethod = (methodId) => {
    if (window.confirm("Are you sure you want to remove this payment method?")) {
      const updatedMethods = paymentMethods.filter(method => method.id !== methodId);
      setPaymentMethods(updatedMethods);
    }
  };

  const handleTransactionClick = (transaction) => {
    console.log("Transaction details:", transaction);
  };

  if (loading) {
    return (
      <div className="payments-page">
        <div className="loading-spinner">
          <div className="spinner"></div>
          <p>Loading payments...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="payments-page">
      {/* Payment Methods Section */}
      <section className="payments-section">
        <div className="section-header">
          <h2 className="section-title">Payment Methods</h2>
          <button className="add-new-btn" onClick={handleAddPaymentMethod}>
            + Add New
          </button>
        </div>

        <div className="payment-methods">
          {paymentMethods.map((method) => (
            <div key={method.id} className="payment-card">
              <div className={`payment-icon ${method.type}`}></div>
              <div className="payment-info">
                <h4 className="payment-title">{method.title}</h4>
                <p className="payment-details">{method.details}</p>
                {method.bankName && (
                  <p className="payment-subdetails">{method.bankName} • {method.accountType}</p>
                )}
              </div>
              <div className="payment-actions">
                {method.isDefault ? (
                  <span className="default-badge">Default</span>
                ) : (
                  <>
                    <button 
                      className="set-default-btn"
                      onClick={() => handleSetDefault(method.id)}
                    >
                      Set Default
                    </button>
                    <button 
                      className="remove-btn"
                      onClick={() => handleRemovePaymentMethod(method.id)}
                    >
                      Remove
                    </button>
                  </>
                )}
              </div>
            </div>
          ))}
          
          {/* Cash Collection Card */}
          <div className="payment-card cash-collection">
            <div className="payment-icon cash"></div>
            <div className="payment-info">
              <h4 className="payment-title">Cash Collection</h4>
              <p className="payment-details">Daily cash pickup</p>
            </div>
          </div>
        </div>
      </section>

      {/* Recent Transactions Section */}
      <section className="transactions-section">
        <div className="section-header">
          <h2 className="section-title">Recent Transactions</h2>
          <button className="see-all-btn">
            See All
          </button>
        </div>

        <div className="transactions-list">
          {transactions.map((transaction) => (
            <div 
              key={transaction.id} 
              className="transaction-card"
              onClick={() => handleTransactionClick(transaction)}
            >
              <div className="transaction-info">
                <span className={`trend-icon ${transaction.trend}`}></span>
                <div className="transaction-details">
                  <h4 className="transaction-title">{transaction.title}</h4>
                  <p className="transaction-date">{transaction.date}</p>
                </div>
              </div>
              <div className={`amount ${transaction.type}`}>
                {transaction.amount}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Add Payment Method Modal */}
      {showAddPaymentModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h3>Add Bank Account</h3>
              <button className="close-btn" onClick={handleCloseModal}>×</button>
            </div>

            <div className="modal-body">
              <div className="bank-form">
                <div className="form-group">
                  <label>Bank Name *</label>
                  <input
                    type="text"
                    name="bankName"
                    value={newPaymentMethod.bankName}
                    onChange={handleInputChange}
                    placeholder="Enter bank name"
                    className="form-input"
                  />
                </div>
                
                <div className="form-group">
                  <label>Account Number *</label>
                  <input
                    type="text"
                    name="accountNumber"
                    value={newPaymentMethod.accountNumber}
                    onChange={handleInputChange}
                    placeholder="Enter account number"
                    maxLength="16"
                    className="form-input"
                  />
                </div>
                
                <div className="form-group">
                  <label>Routing Number *</label>
                  <input
                    type="text"
                    name="routingNumber"
                    value={newPaymentMethod.routingNumber}
                    onChange={handleInputChange}
                    placeholder="Enter routing number"
                    maxLength="9"
                    className="form-input"
                  />
                </div>
                
                <div className="form-group">
                  <label>Account Type *</label>
                  <select 
                    name="accountType" 
                    value={newPaymentMethod.accountType}
                    onChange={handleInputChange}
                    className="form-select"
                  >
                    <option value="checking">Checking Account</option>
                    <option value="savings">Savings Account</option>
                  </select>
                </div>
              </div>
            </div>

            <div className="modal-actions">
              <button className="cancel-btn" onClick={handleCloseModal}>
                Cancel
              </button>
              <button className="confirm-btn" onClick={handleAddNewPayment}>
                Add Bank Account
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Payments;