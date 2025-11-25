import React, { useState, useEffect } from "react";
import "./offers.css";

const Offer = () => {
  const [offers, setOffers] = useState([
    {
      id: 1,
      name: "Back to school",
      discount: 50,
      type: "specific",
      description: "No description provided.",
      items: ["King Burger"],
      status: "active"
    }
  ]);

  const [showCreateForm, setShowCreateForm] = useState(false);
  const [editingOffer, setEditingOffer] = useState(null);
  const [menuItems, setMenuItems] = useState([
    { id: 1, name: "King Burger", category: "Burgers", price: 230 },
    { id: 2, name: "Chicken Pizza", category: "Pizza", price: 850 },
    { id: 3, name: "Chicken Biryani", category: "Biryani", price: 320 },
    { id: 4, name: "Vegetable Salad", category: "Salads", price: 180 },
    { id: 5, name: "Chocolate Shake", category: "Beverages", price: 220 }
  ]);

  const [newOffer, setNewOffer] = useState({
    name: "",
    type: "store-wide",
    discount: 10,
    description: "",
    selectedItems: []
  });

  // Load offers from localStorage on component mount
  useEffect(() => {
    const savedOffers = localStorage.getItem('store_offers');
    if (savedOffers) {
      setOffers(JSON.parse(savedOffers));
    }
    
    const savedMenuItems = localStorage.getItem('menu_items');
    if (savedMenuItems) {
      setMenuItems(JSON.parse(savedMenuItems));
    }
  }, []);

  // Save offers to localStorage whenever offers change
  useEffect(() => {
    localStorage.setItem('store_offers', JSON.stringify(offers));
  }, [offers]);

  const handleCreateOffer = () => {
    if (!newOffer.name || !newOffer.discount) {
      alert("Please fill in all required fields");
      return;
    }

    const offer = {
      id: editingOffer ? editingOffer.id : Date.now(),
      name: newOffer.name,
      discount: parseInt(newOffer.discount),
      type: newOffer.type,
      description: newOffer.description || "No description provided.",
      items: newOffer.type === "specific" ? newOffer.selectedItems.map(id => 
        menuItems.find(item => item.id === id)?.name
      ).filter(Boolean) : ["All items"],
      status: "active",
      createdAt: new Date().toISOString()
    };

    if (editingOffer) {
      setOffers(offers.map(o => o.id === editingOffer.id ? offer : o));
    } else {
      setOffers([...offers, offer]);
    }

    resetForm();
    setShowCreateForm(false);
  };

  const handleEditOffer = (offer) => {
    setEditingOffer(offer);
    setNewOffer({
      name: offer.name,
      type: offer.type === "specific" ? "specific" : "store-wide",
      discount: offer.discount,
      description: offer.description === "No description provided." ? "" : offer.description,
      selectedItems: offer.type === "specific" ? 
        menuItems.filter(item => offer.items.includes(item.name)).map(item => item.id) : []
    });
    setShowCreateForm(true);
  };

  const handleDeleteOffer = (id) => {
    if (window.confirm("Are you sure you want to delete this offer?")) {
      setOffers(offers.filter(offer => offer.id !== id));
    }
  };

  const handleToggleStatus = (id) => {
    setOffers(offers.map(offer =>
      offer.id === id ? { ...offer, status: offer.status === "active" ? "inactive" : "active" } : offer
    ));
  };

  const resetForm = () => {
    setNewOffer({
      name: "",
      type: "store-wide",
      discount: 10,
      description: "",
      selectedItems: []
    });
    setEditingOffer(null);
  };

  const handleItemSelection = (itemId) => {
    setNewOffer(prev => {
      const isSelected = prev.selectedItems.includes(itemId);
      if (isSelected) {
        return {
          ...prev,
          selectedItems: prev.selectedItems.filter(id => id !== itemId)
        };
      } else {
        return {
          ...prev,
          selectedItems: [...prev.selectedItems, itemId]
        };
      }
    });
  };

  const handleSelectAllItems = () => {
    if (newOffer.selectedItems.length === menuItems.length) {
      setNewOffer(prev => ({ ...prev, selectedItems: [] }));
    } else {
      setNewOffer(prev => ({ 
        ...prev, 
        selectedItems: menuItems.map(item => item.id) 
      }));
    }
  };

  const activeOffers = offers.filter(offer => offer.status === "active");
  const inactiveOffers = offers.filter(offer => offer.status === "inactive");

  return (
    <div className="offers-main-container">
      <div className="offers-header-section">
        <h1 className="offers-main-title">Offers & Discounts</h1>
        <button 
          className="offers-create-btn"
          onClick={() => {
            setShowCreateForm(true);
            resetForm();
          }}
        >
          + Create New Offer
        </button>
      </div>

      {/* Create/Edit Offer Form */}
      {showCreateForm && (
        <div className="offers-form-overlay">
          <div className="offers-form-wrapper">
            <div className="offers-form-header">
              <h2 className="offers-form-title">{editingOffer ? 'Edit Offer' : 'Create Offer'}</h2>
              <button 
                className="offers-close-btn"
                onClick={() => {
                  setShowCreateForm(false);
                  resetForm();
                }}
              >
                ×
              </button>
            </div>

            <div className="offers-form-section">
              <h3 className="offers-section-title">Offer Type</h3>
              <div className="offers-type-selector">
                <label className="offers-radio-label">
                  <input
                    type="radio"
                    name="offerType"
                    value="store-wide"
                    checked={newOffer.type === "store-wide"}
                    onChange={(e) => setNewOffer({ ...newOffer, type: e.target.value, selectedItems: [] })}
                  />
                  <span className="offers-radio-custom"></span>
                  Store-wide
                </label>
                <label className="offers-radio-label">
                  <input
                    type="radio"
                    name="offerType"
                    value="specific"
                    checked={newOffer.type === "specific"}
                    onChange={(e) => setNewOffer({ ...newOffer, type: e.target.value })}
                  />
                  <span className="offers-radio-custom"></span>
                  Specific Items
                </label>
              </div>
            </div>

            <div className="offers-form-section">
              <label className="offers-form-label">
                Offer Name*
                <input
                  type="text"
                  placeholder="e.g. Weekend Special"
                  value={newOffer.name}
                  onChange={(e) => setNewOffer({ ...newOffer, name: e.target.value })}
                  className="offers-form-input"
                />
              </label>
            </div>

            <div className="offers-form-section">
              <label className="offers-form-label">
                Description
                <textarea
                  placeholder="Optional description"
                  value={newOffer.description}
                  onChange={(e) => setNewOffer({ ...newOffer, description: e.target.value })}
                  className="offers-form-textarea"
                  maxLength={500}
                />
                <div className="offers-char-count">{newOffer.description.length}/500</div>
              </label>
            </div>

            <div className="offers-form-section">
              <label className="offers-form-label">
                Discount (%)*
                <div className="offers-discount-input-container">
                  <input
                    type="number"
                    min="1"
                    max="100"
                    value={newOffer.discount}
                    onChange={(e) => setNewOffer({ ...newOffer, discount: e.target.value })}
                    className="offers-discount-input"
                  />
                  <span className="offers-discount-suffix">% OFF</span>
                </div>
              </label>
            </div>

            {newOffer.type === "specific" && (
              <div className="offers-form-section">
                <h3 className="offers-section-title">Select Items</h3>
                <div className="offers-items-selection">
                  <div className="offers-select-all-container">
                    <label className="offers-checkbox-label">
                      <input
                        type="checkbox"
                        checked={newOffer.selectedItems.length === menuItems.length}
                        onChange={handleSelectAllItems}
                      />
                      <span className="offers-checkbox-custom"></span>
                      Select All Items
                    </label>
                  </div>
                  
                  <div className="offers-items-list">
                    {menuItems.map(item => (
                      <label key={item.id} className="offers-checkbox-label offers-item-checkbox">
                        <input
                          type="checkbox"
                          checked={newOffer.selectedItems.includes(item.id)}
                          onChange={() => handleItemSelection(item.id)}
                        />
                        <span className="offers-checkbox-custom"></span>
                        <div className="offers-item-info">
                          <span className="offers-item-name">{item.name}</span>
                          <span className="offers-item-category">{item.category}</span>
                        </div>
                        <span className="offers-item-price">PKR {item.price}</span>
                      </label>
                    ))}
                  </div>
                  
                  {menuItems.length === 0 && (
                    <div className="offers-no-items-message">
                      No menu items available
                    </div>
                  )}
                </div>
              </div>
            )}

            <div className="offers-form-actions">
              <button 
                className="offers-cancel-btn"
                onClick={() => {
                  setShowCreateForm(false);
                  resetForm();
                }}
              >
                Cancel
              </button>
              <button 
                className="offers-submit-btn"
                onClick={handleCreateOffer}
                disabled={!newOffer.name || !newOffer.discount}
              >
                {editingOffer ? 'Update Offer' : 'Create Offer'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Active Offers */}
      <div className="offers-section-container">
        <h2 className="offers-section-heading">Active Offers ({activeOffers.length})</h2>
        <div className="offers-grid-layout">
          {activeOffers.length > 0 ? (
            activeOffers.map(offer => (
              <OfferCard 
                key={offer.id}
                offer={offer}
                onEdit={handleEditOffer}
                onDelete={handleDeleteOffer}
                onToggleStatus={handleToggleStatus}
              />
            ))
          ) : (
            <div className="offers-empty-message">
              No active offers. Create your first offer to get started!
            </div>
          )}
        </div>
      </div>

      {/* Inactive Offers */}
      {inactiveOffers.length > 0 && (
        <div className="offers-section-container">
          <h2 className="offers-section-heading">Inactive Offers ({inactiveOffers.length})</h2>
          <div className="offers-grid-layout">
            {inactiveOffers.map(offer => (
              <OfferCard 
                key={offer.id}
                offer={offer}
                onEdit={handleEditOffer}
                onDelete={handleDeleteOffer}
                onToggleStatus={handleToggleStatus}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

// Offer Card Component
const OfferCard = ({ offer, onEdit, onDelete, onToggleStatus }) => {
  return (
    <div className={`offers-card-item ${offer.status === 'inactive' ? 'offers-card-item-inactive' : ''}`}>
      <div className="offers-card-header">
        <div className="offers-discount-badge">
          {offer.discount}% OFF
        </div>
        <div className="offers-type-label">
          {offer.type === "store-wide" ? "Store-wide" : "Specific items"}
        </div>
      </div>
      
      <div className="offers-card-content">
        <h3 className="offers-card-title">{offer.name}</h3>
        <p className="offers-card-description">{offer.description}</p>
        
        <div className="offers-items-section">
          <span className="offers-items-count">
            {offer.items.length} item(s) included
          </span>
          {offer.type === "specific" && (
            <div className="offers-items-preview">
              {offer.items.slice(0, 3).map((item, index) => (
                <span key={index} className="offers-item-tag">{item}</span>
              ))}
              {offer.items.length > 3 && (
                <span className="offers-more-items">+{offer.items.length - 3} more</span>
              )}
            </div>
          )}
        </div>
      </div>
      
      <div className="offers-card-actions">
        <button 
          className="offers-action-button offers-edit-btn"
          onClick={() => onEdit(offer)}
        >
          Edit
        </button>
        <button 
          className="offers-action-button offers-delete-btn"
          onClick={() => onDelete(offer.id)}
        >
          Delete
        </button>
        <button 
          className={`offers-action-button offers-status-btn ${offer.status === 'inactive' ? 'offers-status-btn-inactive' : ''}`}
          onClick={() => onToggleStatus(offer.id)}
        >
          {offer.status === "active" ? "Deactivate" : "Activate"}
        </button>
      </div>
    </div>
  );
};

export default Offer;