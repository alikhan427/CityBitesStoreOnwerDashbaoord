// src/pages/payments/Payments.jsx
import React, { useState, useEffect } from "react";
import "./Payments.css";

const Payments = () => {
  const [paymentMethods, setPaymentMethods] = useState([]);
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTimeFrame, setActiveTimeFrame] = useState("Today");
  const [modalType, setModalType] = useState(null); // 'select', 'easypaisa', 'jazzcash', 'bank'
  const [selectedPaymentType, setSelectedPaymentType] = useState("");
  
  // Form states for different payment methods
  const [bankForm, setBankForm] = useState({
    accountTitle: "",
    accountNumber: "",
    cnicNumber: "",
    bankName: ""
  });
  
  const [easypaisaForm, setEasypaisaForm] = useState({
    phoneNumber: "",
    accountTitle: "",
    cnicNumber: ""
  });
  
  const [jazzcashForm, setJazzcashForm] = useState({
    phoneNumber: "",
    accountTitle: "",
    cnicNumber: ""
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
            bankName: "HBL Bank",
            accountType: "Current Account"
          },
          {
            id: 2,
            type: "easypaisa",
            title: "EasyPaisa",
            details: "0321-*******",
            isDefault: false
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
            title: "EasyPaisa Transfer",
            date: "2024-01-14 09:00",
            amount: "-$100.00",
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

  // Modal handlers
  const handleAddPaymentMethod = () => {
    setModalType('select');
  };

  const handleCloseModal = () => {
    setModalType(null);
    setSelectedPaymentType("");
    resetAllForms();
  };

  const handlePaymentTypeSelect = (type) => {
    setSelectedPaymentType(type);
    setModalType(type);
  };

  const handleBackToSelection = () => {
    setModalType('select');
    setSelectedPaymentType("");
  };

  // Form handlers
  const handleBankFormChange = (e) => {
    const { name, value } = e.target;
    setBankForm(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleEasypaisaFormChange = (e) => {
    const { name, value } = e.target;
    setEasypaisaForm(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleJazzcashFormChange = (e) => {
    const { name, value } = e.target;
    setJazzcashForm(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Format input functions
  const formatPhoneNumber = (value) => {
    const numbers = value.replace(/\D/g, '');
    if (numbers.length <= 4) return numbers;
    if (numbers.length <= 11) return `${numbers.slice(0, 4)}-${numbers.slice(4)}`;
    return numbers.slice(0, 11);
  };

  const formatAccountNumber = (value) => {
    const numbers = value.replace(/\D/g, '');
    if (numbers.length <= 4) return numbers;
    if (numbers.length <= 8) return `${numbers.slice(0, 4)}-${numbers.slice(4)}`;
    if (numbers.length <= 12) return `${numbers.slice(0, 4)}-${numbers.slice(4, 8)}-${numbers.slice(8)}`;
    if (numbers.length <= 16) return `${numbers.slice(0, 4)}-${numbers.slice(4, 8)}-${numbers.slice(8, 12)}-${numbers.slice(12)}`;
    return numbers.slice(0, 16);
  };

  const formatCNIC = (value) => {
    const numbers = value.replace(/\D/g, '');
    if (numbers.length <= 5) return numbers;
    if (numbers.length <= 12) return `${numbers.slice(0, 5)}-${numbers.slice(5)}`;
    if (numbers.length <= 13) return `${numbers.slice(0, 5)}-${numbers.slice(5, 12)}-${numbers.slice(12)}`;
    return numbers.slice(0, 13);
  };

  // Validation functions
  const validateBankForm = () => {
    if (!bankForm.accountTitle.trim()) {
      alert("Please enter account title");
      return false;
    }
    if (!bankForm.accountNumber || bankForm.accountNumber.replace(/\D/g, '').length < 16) {
      alert("Please enter a valid 16-digit account number");
      return false;
    }
    if (!bankForm.cnicNumber || bankForm.cnicNumber.replace(/\D/g, '').length !== 13) {
      alert("Please enter a valid 13-digit CNIC number");
      return false;
    }
    if (!bankForm.bankName.trim()) {
      alert("Please enter bank name");
      return false;
    }
    return true;
  };

  const validateMobileWalletForm = (form, type) => {
    if (!form.phoneNumber || form.phoneNumber.replace(/\D/g, '').length !== 11) {
      alert("Please enter a valid 11-digit phone number");
      return false;
    }
    if (!form.accountTitle.trim()) {
      alert("Please enter account title");
      return false;
    }
    if (!form.cnicNumber || form.cnicNumber.replace(/\D/g, '').length !== 13) {
      alert("Please enter a valid 13-digit CNIC number");
      return false;
    }
    return true;
  };

  // Form submission handlers
  const handleBankSubmit = () => {
    if (!validateBankForm()) return;

    const newMethod = {
      id: Date.now(),
      type: "bank",
      title: "Bank Transfer",
      details: `**** ${bankForm.accountNumber.slice(-4)}`,
      isDefault: paymentMethods.length === 0,
      bankName: bankForm.bankName,
      accountType: "Current Account",
      accountTitle: bankForm.accountTitle,
      fullAccountNumber: bankForm.accountNumber
    };

    setPaymentMethods(prev => [...prev, newMethod]);
    handleCloseModal();
    alert("Bank account added successfully!");
  };

  const handleEasypaisaSubmit = () => {
    if (!validateMobileWalletForm(easypaisaForm, 'easypaisa')) return;

    const newMethod = {
      id: Date.now(),
      type: "easypaisa",
      title: "EasyPaisa",
      details: easypaisaForm.phoneNumber,
      isDefault: paymentMethods.length === 0,
      accountTitle: easypaisaForm.accountTitle,
      phoneNumber: easypaisaForm.phoneNumber
    };

    setPaymentMethods(prev => [...prev, newMethod]);
    handleCloseModal();
    alert("EasyPaisa account added successfully!");
  };

  const handleJazzcashSubmit = () => {
    if (!validateMobileWalletForm(jazzcashForm, 'jazzcash')) return;

    const newMethod = {
      id: Date.now(),
      type: "jazzcash",
      title: "JazzCash",
      details: jazzcashForm.phoneNumber,
      isDefault: paymentMethods.length === 0,
      accountTitle: jazzcashForm.accountTitle,
      phoneNumber: jazzcashForm.phoneNumber
    };

    setPaymentMethods(prev => [...prev, newMethod]);
    handleCloseModal();
    alert("JazzCash account added successfully!");
  };

  const resetAllForms = () => {
    setBankForm({
      accountTitle: "",
      accountNumber: "",
      cnicNumber: "",
      bankName: ""
    });
    setEasypaisaForm({
      phoneNumber: "",
      accountTitle: "",
      cnicNumber: ""
    });
    setJazzcashForm({
      phoneNumber: "",
      accountTitle: "",
      cnicNumber: ""
    });
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

  const handleTimeFrameClick = (timeFrame) => {
    setActiveTimeFrame(timeFrame);
  };

  const handleWithdraw = () => {
    const defaultMethod = paymentMethods.find(method => method.isDefault);
    if (!defaultMethod) {
      alert("Please set a default payment method first");
      return;
    }
    alert(`Withdrawal request submitted to ${defaultMethod.title}`);
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
      {/* Time Frame Selector */}
      <section className="timeframe-section">
        <div className="timeframe-selector">
          <button 
            className={`timeframe-btn ${activeTimeFrame === "Today" ? "active" : ""}`}
            onClick={() => handleTimeFrameClick("Today")}
          >
            Today
          </button>
          <button 
            className={`timeframe-btn ${activeTimeFrame === "This Week" ? "active" : ""}`}
            onClick={() => handleTimeFrameClick("This Week")}
          >
            This Week
          </button>
          <button 
            className={`timeframe-btn ${activeTimeFrame === "This Month" ? "active" : ""}`}
            onClick={() => handleTimeFrameClick("This Month")}
          >
            This Month
          </button>
        </div>
      </section>

      {/* Available Balance Section */}
      <section className="balance-section">
        <div className="balance-card">
          <h3 className="balance-title">Available Balance</h3>
          <div className="balance-amount">$0.00</div>
          <div className="balance-stats">
            <span className="deliveries-count">0 deliveries</span>
            <span className="average-amount">Avg: $0.00/order</span>
          </div>
        </div>
      </section>

      {/* Withdraw Section */}
      <section className="withdraw-section">
        <div className="withdraw-header">
          <h3 className="withdraw-title">Withdraw</h3>
          <button className="withdraw-btn" onClick={handleWithdraw}>
            Withdraw Now
          </button>
        </div>
        
        <div className="withdraw-options">
          <button className="withdraw-option">
            <span className="option-icon">📋</span>
            History
          </button>
          <button className="withdraw-option" onClick={handleAddPaymentMethod}>
            <span className="option-icon">➕</span>
            Add New
          </button>
          <button className="withdraw-option">
            <span className="option-icon">⭐</span>
            Default
          </button>
          <button className="withdraw-option">
            <span className="option-icon">👁️</span>
            See All
          </button>
        </div>
      </section>

      {/* Payment Methods Section */}
      <section className="payments-section">
        <div className="section-header">
          <h2 className="section-title">Payment Methods</h2>
        </div>

        <div className="payment-methods">
          {paymentMethods.map((method) => (
            <div key={method.id} className="payment-card">
              <div className={`payment-icon ${method.type}`}>
                {method.type === 'bank' ? '🏦' : method.type === 'easypaisa' ? '📱' : method.type === 'jazzcash' ? '💳' : '💵'}
              </div>
              <div className="payment-info">
                <h4 className="payment-title">{method.title}</h4>
                <p className="payment-details">{method.details}</p>
                {method.bankName && (
                  <p className="payment-subdetails">{method.bankName} • {method.accountType}</p>
                )}
                {method.accountTitle && (
                  <p className="payment-subdetails">{method.accountTitle}</p>
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
            <div className="payment-icon cash">💵</div>
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
                <span className={`trend-icon ${transaction.trend}`}>
                  {transaction.trend === 'up' ? '📈' : '📉'}
                </span>
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

      {/* Payment Method Selection Modal */}
      {modalType === 'select' && (
        <div className="modal-overlay">
          <div className="modal-content payment-selection-modal">
            <div className="modal-header">
              <h3>Select Payment Method</h3>
              <button className="close-btn" onClick={handleCloseModal}>×</button>
            </div>

            <div className="modal-body">
              <p className="modal-subtitle">Choose your preferred payment method</p>
              
              <div className="payment-options">
                <div 
                  className={`payment-option ${selectedPaymentType === 'easypaisa' ? 'selected' : ''}`}
                  onClick={() => handlePaymentTypeSelect('easypaisa')}
                >
                  <div className="option-radio">
                    <div className="radio-circle"></div>
                  </div>
                  <div className="option-info">
                    <h4>EasyPaisa</h4>
                    <p>Mobile Wallet</p>
                  </div>
                  <div className="option-icon">📱</div>
                </div>

                <div 
                  className={`payment-option ${selectedPaymentType === 'jazzcash' ? 'selected' : ''}`}
                  onClick={() => handlePaymentTypeSelect('jazzcash')}
                >
                  <div className="option-radio">
                    <div className="radio-circle"></div>
                  </div>
                  <div className="option-info">
                    <h4>JazzCash</h4>
                    <p>Mobile Wallet</p>
                  </div>
                  <div className="option-icon">💳</div>
                </div>

                <div 
                  className={`payment-option ${selectedPaymentType === 'bank' ? 'selected' : ''}`}
                  onClick={() => handlePaymentTypeSelect('bank')}
                >
                  <div className="option-radio">
                    <div className="radio-circle"></div>
                  </div>
                  <div className="option-info">
                    <h4>Bank Transfer</h4>
                    <p>Bank Account</p>
                  </div>
                  <div className="option-icon">🏦</div>
                </div>
              </div>
            </div>

            <div className="modal-actions">
              <button className="cancel-btn" onClick={handleCloseModal}>
                Cancel
              </button>
              <button 
                className="confirm-btn" 
                onClick={() => selectedPaymentType && handlePaymentTypeSelect(selectedPaymentType)}
                disabled={!selectedPaymentType}
              >
                Continue
              </button>
            </div>
          </div>
        </div>
      )}

      {/* EasyPaisa Modal */}
      {modalType === 'easypaisa' && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h3>Add EasyPaisa</h3>
              <button className="close-btn" onClick={handleCloseModal}>×</button>
            </div>

            <div className="modal-body">
              <div className="payment-method-header">
                <div className="method-icon">📱</div>
                <div className="method-info">
                  <h4>EasyPaisa</h4>
                  <p>Mobile Wallet</p>
                </div>
              </div>

              <div className="form-section">
                <div className="form-group">
                  <label>Phone Number *</label>
                  <input
                    type="tel"
                    name="phoneNumber"
                    value={easypaisaForm.phoneNumber}
                    onChange={(e) => setEasypaisaForm(prev => ({
                      ...prev,
                      phoneNumber: formatPhoneNumber(e.target.value)
                    }))}
                    placeholder="03XX-XXXXXXX"
                    className="form-input"
                    maxLength={12}
                  />
                </div>
                
                <div className="form-group">
                  <label>Account Title *</label>
                  <input
                    type="text"
                    name="accountTitle"
                    value={easypaisaForm.accountTitle}
                    onChange={handleEasypaisaFormChange}
                    placeholder="Your full name"
                    className="form-input"
                  />
                </div>
                
                <div className="form-group">
                  <label>CNIC Number *</label>
                  <input
                    type="text"
                    name="cnicNumber"
                    value={easypaisaForm.cnicNumber}
                    onChange={(e) => setEasypaisaForm(prev => ({
                      ...prev,
                      cnicNumber: formatCNIC(e.target.value)
                    }))}
                    placeholder="XXXXX-XXXXXXX-X"
                    className="form-input"
                    maxLength={15}
                  />
                </div>
              </div>
            </div>

            <div className="modal-actions">
              <button className="back-btn" onClick={handleBackToSelection}>
                Back to Payment Methods
              </button>
              <button className="confirm-btn" onClick={handleEasypaisaSubmit}>
                Add Payment Method
              </button>
            </div>
          </div>
        </div>
      )}

      {/* JazzCash Modal */}
      {modalType === 'jazzcash' && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h3>Add JazzCash</h3>
              <button className="close-btn" onClick={handleCloseModal}>×</button>
            </div>

            <div className="modal-body">
              <div className="payment-method-header">
                <div className="method-icon">💳</div>
                <div className="method-info">
                  <h4>JazzCash</h4>
                  <p>Mobile Wallet</p>
                </div>
              </div>

              <div className="form-section">
                <div className="form-group">
                  <label>Phone Number *</label>
                  <input
                    type="tel"
                    name="phoneNumber"
                    value={jazzcashForm.phoneNumber}
                    onChange={(e) => setJazzcashForm(prev => ({
                      ...prev,
                      phoneNumber: formatPhoneNumber(e.target.value)
                    }))}
                    placeholder="03XX-XXXXXXX"
                    className="form-input"
                    maxLength={12}
                  />
                </div>
                
                <div className="form-group">
                  <label>Account Title *</label>
                  <input
                    type="text"
                    name="accountTitle"
                    value={jazzcashForm.accountTitle}
                    onChange={handleJazzcashFormChange}
                    placeholder="Your full name"
                    className="form-input"
                  />
                </div>
                
                <div className="form-group">
                  <label>CNIC Number *</label>
                  <input
                    type="text"
                    name="cnicNumber"
                    value={jazzcashForm.cnicNumber}
                    onChange={(e) => setJazzcashForm(prev => ({
                      ...prev,
                      cnicNumber: formatCNIC(e.target.value)
                    }))}
                    placeholder="XXXXX-XXXXXXX-X"
                    className="form-input"
                    maxLength={15}
                  />
                </div>
              </div>
            </div>

            <div className="modal-actions">
              <button className="back-btn" onClick={handleBackToSelection}>
                Back to Payment Methods
              </button>
              <button className="confirm-btn" onClick={handleJazzcashSubmit}>
                Add Payment Method
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Bank Transfer Modal */}
      {modalType === 'bank' && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h3>Add Bank Transfer</h3>
              <button className="close-btn" onClick={handleCloseModal}>×</button>
            </div>

            <div className="modal-body">
              <div className="payment-method-header">
                <div className="method-icon">🏦</div>
                <div className="method-info">
                  <h4>Bank Transfer</h4>
                  <p>Bank Account</p>
                </div>
              </div>

              <div className="form-section">
                <div className="form-group">
                  <label>Bank Name *</label>
                  <input
                    type="text"
                    name="bankName"
                    value={bankForm.bankName}
                    onChange={handleBankFormChange}
                    placeholder="Enter bank name"
                    className="form-input"
                  />
                </div>
                
                <div className="form-group">
                  <label>Account Title *</label>
                  <input
                    type="text"
                    name="accountTitle"
                    value={bankForm.accountTitle}
                    onChange={handleBankFormChange}
                    placeholder="Your full name as in bank"
                    className="form-input"
                  />
                </div>
                
                <div className="form-group">
                  <label>Account Number *</label>
                  <input
                    type="text"
                    name="accountNumber"
                    value={bankForm.accountNumber}
                    onChange={(e) => setBankForm(prev => ({
                      ...prev,
                      accountNumber: formatAccountNumber(e.target.value)
                    }))}
                    placeholder="XXXX-XXXX-XXXX-XXXX"
                    className="form-input"
                    maxLength={19}
                  />
                </div>
                
                <div className="form-group">
                  <label>CNIC Number *</label>
                  <input
                    type="text"
                    name="cnicNumber"
                    value={bankForm.cnicNumber}
                    onChange={(e) => setBankForm(prev => ({
                      ...prev,
                      cnicNumber: formatCNIC(e.target.value)
                    }))}
                    placeholder="XXXXX-XXXXXXX-X"
                    className="form-input"
                    maxLength={15}
                  />
                </div>
              </div>
            </div>

            <div className="modal-actions">
              <button className="back-btn" onClick={handleBackToSelection}>
                Back to Payment Methods
              </button>
              <button className="confirm-btn" onClick={handleBankSubmit}>
                Add Payment Method
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Payments;