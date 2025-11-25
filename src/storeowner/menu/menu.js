import React, { useState, useRef } from "react";
import './menu.css';

const Menu = () => {
  const [menuItems, setMenuItems] = useState([
    {
      id: 1,
      name: "king burger",
      originalPrice: 230,
      discountPrice: 115,
      category: "Burgers",
      prepTime: "20",
      status: "Active",
      description: "Delicious burger with special sauce",
      ingredients: ["Beef patty", "Lettuce", "Tomato", "Special sauce"],
      images: [
        "https://via.placeholder.com/300x200/FF6B6B/white?text=Burger+1",
        "https://via.placeholder.com/300x200/4ECDC4/white?text=Burger+2",
        "https://via.placeholder.com/300x200/45B7D1/white?text=Burger+3"
      ]
    }
  ]);

  const [showAddForm, setShowAddForm] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [newItem, setNewItem] = useState({
    name: "",
    originalPrice: 0,
    discountPrice: 0,
    category: "",
    prepTime: "",
    description: "",
    ingredients: [],
    images: []
  });

  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [sortBy, setSortBy] = useState("name");
  const [imageUploading, setImageUploading] = useState(false);
  
  const fileInputRef = useRef(null);

  const categories = [
    "Biryani", "Burgers", "Cool Gappas", "Haleem", "Karahi", 
    "Kebabs", "Nihari", "Pakoras", "Pasta", "Pizza", 
    "Salads", "Samosas", "Shawarma"
  ];

  const categoryDescriptions = {
    "Burgers": "Juicy burgers with fresh ingredients and special sauces",
    "Biryani": "Fragrant rice dishes with aromatic spices and tender meat",
    "Pizza": "Italian style pizzas with various toppings and cheese",
    "Kebabs": "Grilled meat delicacies with traditional spices",
    "Shawarma": "Middle Eastern wraps with marinated meat and sauces",
    "Cool Gappas": "Crispy shells filled with spicy and tangy flavors",
    "Haleem": "Slow-cooked wheat and meat porridge with spices",
    "Karahi": "Traditional Pakistani wok-cooked meat dishes",
    "Nihari": "Slow-cooked beef stew with traditional spices",
    "Pakoras": "Deep-fried fritters with vegetables in chickpea batter",
    "Pasta": "Italian pasta dishes with various sauces",
    "Salads": "Fresh vegetable salads with dressings",
    "Samosas": "Crispy fried pastries with spiced fillings"
  };

  const categoryIngredients = {
    "Burgers": ["Bun", "Beef Patty", "Lettuce", "Tomato", "Cheese", "Sauce"],
    "Biryani": ["Basmati Rice", "Meat", "Spices", "Herbs", "Yogurt", "Onions"],
    "Pizza": ["Pizza Dough", "Mozzarella Cheese", "Tomato Sauce", "Toppings"],
    "Kebabs": ["Minced Meat", "Spices", "Herbs", "Onions"],
    "Shawarma": ["Marinated Meat", "Pita Bread", "Garlic Sauce", "Vegetables"]
  };

  // Image Upload Functions
  const handleImageUpload = (event) => {
    const files = Array.from(event.target.files);
    
    if (files.length > 3) {
      alert("You can only upload up to 3 images");
      return;
    }

    setImageUploading(true);

    const uploadPromises = files.map(file => {
      return new Promise((resolve) => {
        const reader = new FileReader();
        reader.onload = (e) => {
          resolve(e.target.result);
        };
        reader.readAsDataURL(file);
      });
    });

    Promise.all(uploadPromises).then(imageUrls => {
      setNewItem(prev => ({
        ...prev,
        images: [...prev.images, ...imageUrls].slice(0, 3)
      }));
      setImageUploading(false);
    });

    event.target.value = '';
  };

  const handleRemoveImage = (indexToRemove) => {
    setNewItem(prev => ({
      ...prev,
      images: prev.images.filter((_, index) => index !== indexToRemove)
    }));
  };

  const handleImageReorder = (fromIndex, toIndex) => {
    const newImages = [...newItem.images];
    const [movedImage] = newImages.splice(fromIndex, 1);
    newImages.splice(toIndex, 0, movedImage);
    setNewItem(prev => ({ ...prev, images: newImages }));
  };

  // Item Management Functions
  const handleAddItem = () => {
    if (newItem.name && newItem.category) {
      const item = {
        id: Date.now(),
        ...newItem,
        status: "Active",
        createdAt: new Date().toISOString()
      };
      setMenuItems([...menuItems, item]);
      resetForm();
      setShowAddForm(false);
    } else {
      alert("Please fill in all required fields (Name and Category)");
    }
  };

  const handleEditItem = (item) => {
    setEditingItem(item);
    setNewItem(item);
    setShowAddForm(true);
  };

  const handleUpdateItem = () => {
    setMenuItems(menuItems.map(item => 
      item.id === editingItem.id ? { ...newItem, id: editingItem.id } : item
    ));
    resetForm();
    setShowAddForm(false);
  };

  const handleDeleteItem = (id) => {
    if (window.confirm("Are you sure you want to delete this item?")) {
      setMenuItems(menuItems.filter(item => item.id !== id));
    }
  };

  const handleStatusToggle = (id) => {
    setMenuItems(menuItems.map(item =>
      item.id === id ? { ...item, status: item.status === "Active" ? "Pending" : "Active" } : item
    ));
  };

  const handleCategoryChange = (category) => {
    setNewItem({
      ...newItem,
      category,
      description: categoryDescriptions[category] || "",
      ingredients: categoryIngredients[category] || []
    });
  };

  const handleIngredientAdd = (ingredient) => {
    if (ingredient.trim() && !newItem.ingredients.includes(ingredient.trim())) {
      setNewItem({
        ...newItem,
        ingredients: [...newItem.ingredients, ingredient.trim()]
      });
    }
  };

  const handleIngredientRemove = (ingredientToRemove) => {
    setNewItem({
      ...newItem,
      ingredients: newItem.ingredients.filter(ingredient => ingredient !== ingredientToRemove)
    });
  };

  const resetForm = () => {
    setNewItem({
      name: "",
      originalPrice: 0,
      discountPrice: 0,
      category: "",
      prepTime: "",
      description: "",
      ingredients: [],
      images: []
    });
    setEditingItem(null);
  };

  // Search and Filter Functions
  const filteredItems = menuItems.filter(item => {
    const matchesSearch = item.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === "All" || item.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const sortedItems = [...filteredItems].sort((a, b) => {
    switch (sortBy) {
      case "name":
        return a.name.localeCompare(b.name);
      case "price":
        return a.discountPrice - b.discountPrice;
      case "prepTime":
        return parseInt(a.prepTime) - parseInt(b.prepTime);
      case "date":
        return new Date(b.createdAt) - new Date(a.createdAt);
      default:
        return 0;
    }
  });

  const totalItems = menuItems.length;
  const activeItems = menuItems.filter(item => item.status === "Active").length;
  const pendingItems = menuItems.filter(item => item.status === "Pending").length;

  return (
    <div className="menu-management">
      {/* Header Stats */}
      <div className="menu-header">
        <h1 className="menu-ti" style={{
          color:"white"
        }}>Menu Management</h1>
        <div className="menu-stats">
          <div className="menu-stat-item">
            <div className="menu-stat-number">{totalItems}</div>
            <div className="menu-stat-label">Total Items</div>
          </div>
          <div className="menu-stat-item">
            <div className="menu-stat-number">{activeItems}</div>
            <div className="menu-stat-label">Active</div>
          </div>
          <div className="menu-stat-item">
            <div className="menu-stat-number">{pendingItems}</div>
            <div className="menu-stat-label">Pending</div>
          </div>
        </div>
      </div>

      {/* Search and Filter Bar */}
      <div className="menu-controls">
        <div className="menu-search-box">
          <input
            type="text"
            placeholder="Search menu items..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="menu-search-input"
          />
          <span className="menu-search-icon">🔍</span>
        </div>
        
        <select 
          value={selectedCategory} 
          onChange={(e) => setSelectedCategory(e.target.value)}
          className="menu-filter-select"
        >
          <option value="All">All Categories</option>
          {categories.map(category => (
            <option key={category} value={category}>{category}</option>
          ))}
        </select>

        <select 
          value={sortBy} 
          onChange={(e) => setSortBy(e.target.value)}
          className="menu-sort-select"
        >
          <option value="name">Sort by Name</option>
          <option value="price">Sort by Price</option>
          <option value="prepTime">Sort by Prep Time</option>
          <option value="date">Sort by Date</option>
        </select>
      </div>

      {/* Add New Item Button */}
      <button
        onClick={() => {
          setShowAddForm(true);
          resetForm();
        }}
        className="menu-add-btn"
      >
        + Add New Item
      </button>

      {/* Add/Edit Form */}
      {showAddForm && (
        <div className="menu-form">
          <h2 className="menu-form-title">{editingItem ? 'Edit Menu Item' : 'Add Menu Item'}</h2>

          {/* Item Images Section */}
          <div className="menu-form-section">
            <h3 className="menu-section-title">Item Images ({newItem.images.length}/3)</h3>
            <div className="menu-image-upload">
              <div className="menu-upload-box" onClick={() => fileInputRef.current?.click()}>
                {imageUploading ? (
                  <div className="menu-uploading">Uploading...</div>
                ) : (
                  <>
                    <div className="menu-upload-icon">📷</div>
                    <p className="menu-upload-text">Click to upload images (Max 3)</p>
                    <p className="menu-upload-hint">Recommended size: 300x200 pixels</p>
                  </>
                )}
              </div>
              
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleImageUpload}
                accept="image/*"
                multiple
                style={{ display: 'none' }}
              />

              {newItem.images.length > 0 && (
                <div className="menu-image-preview">
                  <h4>Image Preview:</h4>
                  <div className="menu-preview-list">
                    {newItem.images.map((image, index) => (
                      <div key={index} className="menu-preview-item">
                        <img src={image} alt={`Preview ${index + 1}`} />
                        <div className="menu-image-actions">
                          <button
                            type="button"
                            onClick={() => handleRemoveImage(index)}
                            className="menu-remove-image"
                          >
                            ✕
                          </button>
                          <span className="menu-image-number">{index + 1}</span>
                          {index > 0 && (
                            <button
                              type="button"
                              onClick={() => handleImageReorder(index, index - 1)}
                              className="menu-move-image"
                            >
                              ↑
                            </button>
                          )}
                          {index < newItem.images.length - 1 && (
                            <button
                              type="button"
                              onClick={() => handleImageReorder(index, index + 1)}
                              className="menu-move-image"
                            >
                              ↓
                            </button>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Basic Information */}
          <div className="menu-form-section">
            <h3 className="menu-section-title">Basic Information</h3>
            
            {/* Item Name */}
            <div className="menu-input-group">
              <label className="menu-input-label">Item Name *</label>
              <input
                type="text"
                placeholder="e.g. Classic Burger"
                value={newItem.name}
                onChange={(e) => setNewItem({ ...newItem, name: e.target.value })}
                className="menu-input-field"
                required
              />
            </div>

            {/* Price and Prep Time */}
            <div className="menu-price-row">
              <div className="menu-input-group">
                <label className="menu-input-label">Original Price (Rs.) *</label>
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  value={newItem.originalPrice}
                  onChange={(e) => setNewItem({ ...newItem, originalPrice: parseFloat(e.target.value) || 0 })}
                  className="menu-input-field"
                  required
                />
              </div>
              <div className="menu-input-group">
                <label className="menu-input-label">Discount Price (Rs.) *</label>
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  value={newItem.discountPrice}
                  onChange={(e) => setNewItem({ ...newItem, discountPrice: parseFloat(e.target.value) || 0 })}
                  className="menu-input-field"
                  required
                />
              </div>
              <div className="menu-input-group">
                <label className="menu-input-label">Prep Time (mins) *</label>
                <input
                  type="number"
                  min="1"
                  value={newItem.prepTime}
                  onChange={(e) => setNewItem({ ...newItem, prepTime: e.target.value })}
                  className="menu-input-field"
                  required
                />
              </div>
            </div>

            {/* Category */}
            <div className="menu-input-group">
              <label className="menu-input-label">Category *</label>
              <div className="menu-category-grid">
                {categories.map(category => (
                  <button
                    key={category}
                    type="button"
                    onClick={() => handleCategoryChange(category)}
                    className={`menu-category-btn ${newItem.category === category ? 'menu-category-active' : ''}`}
                  >
                    {category}
                  </button>
                ))}
              </div>
            </div>

            {/* Description */}
            <div className="menu-input-group">
              <label className="menu-input-label">Description</label>
              <textarea
                value={newItem.description}
                onChange={(e) => setNewItem({ ...newItem, description: e.target.value })}
                placeholder="Select a category to see descriptions"
                className="menu-input-field menu-textarea"
                rows="4"
              />
            </div>

            {/* Ingredients */}
            <div className="menu-input-group">
              <label className="menu-input-label">Ingredients</label>
              <div className="menu-ingredients-input">
                <input
                  type="text"
                  placeholder="Add ingredient and press Enter"
                  onKeyPress={(e) => {
                    if (e.key === 'Enter') {
                      handleIngredientAdd(e.target.value);
                      e.target.value = '';
                    }
                  }}
                  className="menu-input-field menu-ingredient-input"
                />
                <button
                  type="button"
                  onClick={(e) => {
                    const input = e.target.previousSibling;
                    handleIngredientAdd(input.value);
                    input.value = '';
                  }}
                  className="menu-add-ingredient"
                >
                  Add
                </button>
              </div>
              <div className="menu-ingredients-list">
                {newItem.ingredients.map((ingredient, index) => (
                  <div key={index} className="menu-ingredient-tag">
                    {ingredient}
                    <button
                      type="button"
                      onClick={() => handleIngredientRemove(ingredient)}
                      className="menu-remove-ingredient"
                    >
                      ×
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="menu-form-actions">
            <button
              onClick={editingItem ? handleUpdateItem : handleAddItem}
              className="menu-submit-btn"
              disabled={!newItem.name || !newItem.category}
            >
              {editingItem ? 'Update Item' : 'Add Menu Item'}
            </button>
            <button
              onClick={() => {
                setShowAddForm(false);
                resetForm();
              }}
              className="menu-cancel-btn"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Menu Items List */}
      <div className="menu-items-grid">
        {sortedItems.length === 0 ? (
          <div className="menu-empty">
            <p>No menu items found. {searchTerm && `No results for "${searchTerm}"`}</p>
            <button 
              onClick={() => setShowAddForm(true)}
              className="menu-add-first-btn"
            >
              Add Your First Item
            </button>
          </div>
        ) : (
          sortedItems.map(item => (
            <div key={item.id} className="menu-item-card">
              {/* Item Images */}
              {item.images && item.images.length > 0 && (
                <div className="menu-item-images">
                  <div className="menu-main-image">
                    <img src={item.images[0]} alt={item.name} />
                  </div>
                  {item.images.length > 1 && (
                    <div className="menu-image-thumbnails">
                      {item.images.slice(1).map((image, index) => (
                        <img key={index} src={image} alt={`${item.name} ${index + 2}`} />
                      ))}
                    </div>
                  )}
                </div>
              )}
              
              <div className="menu-item-content">
                <div className="menu-item-header">
                  <div className="menu-item-info">
                    <span className={`menu-status-badge ${item.status === 'Active' ? 'menu-status-active' : 'menu-status-pending'}`}>
                      {item.status}
                    </span>
                    <h3 className="menu-item-name">{item.name}</h3>
                  </div>
                  <div className="menu-item-pricing">
                    <span className="menu-original-price">Rs.{item.originalPrice}</span>
                    <span className="menu-discount-price">Rs.{item.discountPrice}</span>
                    <div className="menu-item-meta">
                      {item.category} • {item.prepTime} min
                    </div>
                  </div>
                </div>
                
                {item.description && (
                  <p className="menu-item-description">{item.description}</p>
                )}
                
                {item.ingredients && item.ingredients.length > 0 && (
                  <div className="menu-item-ingredients">
                    <strong>Ingredients: </strong>
                    {item.ingredients.join(', ')}
                  </div>
                )}
                
                <div className="menu-item-actions">
                  <button
                    onClick={() => handleEditItem(item)}
                    className="menu-action-btn menu-edit-btn"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => handleDeleteItem(item.id)}
                    className="menu-action-btn menu-delete-btn"
                  >
                    Delete
                  </button>
                  <button
                    onClick={() => handleStatusToggle(item.id)}
                    className="menu-action-btn menu-toggle-btn"
                  >
                    {item.status === 'Active' ? 'Deactivate' : 'Activate'}
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default Menu;