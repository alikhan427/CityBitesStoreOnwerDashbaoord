import React, { useState, useRef, useEffect, useCallback } from "react";
import { Eye, EyeOff, Lock, Camera, X, Clock, Calendar, Store, User, Phone, Hash, CreditCard, Building, ChevronDown, MapPin, DollarSign, Truck, Watch } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { 
  registerStoreOwner, 
  clearError, 
  clearMessage, 
  clearRegistrationSuccess 
} from "../../redux/slices/authSlice";
import "./SignupStore.css";
import logo from "../../assets/images/logo.jpg";

const CATEGORIES = [
  'Grocery',
  'Restaurant',
  'Electronics',
  'Clothing',
  'Pharmacy',
  'Hardware',
  'Books',
  'Other',
];

const ALL_DAYS = ['mon', 'tue', 'wed', 'thu', 'fri', 'sat', 'sun'];

const SignupStore = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const { loading, registrationSuccess, status } = useSelector((state) => state.auth || {});
  const registerStatus = status?.registerStoreOwner || {};

  // Core fields
  const [formValues, setFormValues] = useState({
    name: "",
    phone: "",
    storeName: "",
    category: "",
    taxNumber: "",
    openingTime: "09:00",
    closingTime: "22:00",
    minimumOrder: "",
    deliveryFee: "",
    preparationTime: "30",
    maxDeliveryDistance: "10",
    latitude: "",
    longitude: "",
    address: "",
    city: "",
    state: "",
    country: "",
    countryCode: "",
  });

  const [pin, setPin] = useState(["", "", "", ""]);
  const [confirmPin, setConfirmPin] = useState(["", "", "", ""]);
  const [showPin, setShowPin] = useState(false);
  const [workingDays, setWorkingDays] = useState([...ALL_DAYS]);
  
  // UI state
  const [showCategoryModal, setShowCategoryModal] = useState(false);
  const [showWorkingDaysModal, setShowWorkingDaysModal] = useState(false);
  const [showOpeningTimeModal, setShowOpeningTimeModal] = useState(false);
  const [showClosingTimeModal, setShowClosingTimeModal] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [currentUploadType, setCurrentUploadType] = useState("");
  const [locationLoading, setLocationLoading] = useState(false);
  const [locationError, setLocationError] = useState("");

  const [errors, setErrors] = useState({});
  const [documents, setDocuments] = useState({
    cnicFront: null,
    cnicBack: null,
    electricityBill: null,
    businessRegistration: null,
    storeLogo: null,
    storeImages: [],
  });

  const pinRefs = useRef([]);
  const confirmPinRefs = useRef([]);
  const fileInputRefs = useRef({
    cnicFront: React.createRef(),
    cnicBack: React.createRef(),
    electricityBill: React.createRef(),
    businessRegistration: React.createRef(),
    storeLogo: React.createRef(),
    storeImages: React.createRef(),
  });

  // Add success effect
  useEffect(() => {
    if (registrationSuccess && registerStatus.message) {
      alert(registerStatus.message);
      // Reset form
      setFormValues({
        name: "", phone: "", storeName: "", category: "", taxNumber: "",
        openingTime: "09:00", closingTime: "22:00", minimumOrder: "",
        deliveryFee: "", preparationTime: "30", maxDeliveryDistance: "10",
        latitude: "", longitude: "", address: "", city: "", state: "", country: "", countryCode: ""
      });
      setPin(["", "", "", ""]);
      setConfirmPin(["", "", "", ""]);
      setWorkingDays([...ALL_DAYS]);
      setDocuments({
        cnicFront: null, cnicBack: null, electricityBill: null,
        businessRegistration: null, storeLogo: null, storeImages: []
      });
      
      setTimeout(() => {
        navigate("/login");
        dispatch(clearRegistrationSuccess());
        dispatch(clearMessage("registerStoreOwner"));
      }, 2000);
    }
  }, [registrationSuccess, registerStatus.message, dispatch, navigate]);

  // Cleanup function for object URLs
  const cleanupObjectURLs = useCallback(() => {
    Object.values(documents).forEach(doc => {
      if (doc && doc.preview) {
        URL.revokeObjectURL(doc.preview);
      }
      if (Array.isArray(doc)) {
        doc.forEach(item => {
          if (item && item.preview) {
            URL.revokeObjectURL(item.preview);
          }
        });
      }
    });
  }, [documents]);

  // Clear errors and setup cleanup on unmount
  useEffect(() => {
    return () => {
      dispatch(clearError("registerStoreOwner"));
      dispatch(clearMessage("registerStoreOwner"));
      cleanupObjectURLs();
    };
  }, [dispatch, cleanupObjectURLs]);

  // PIN handling functions - SAME AS DELIVERY
  const handlePinChange = (text, index, pinArray, setPinFunction, refs, fieldName) => {
    if (!/^\d*$/.test(text)) return;

    const newPin = [...pinArray];
    newPin[index] = text;
    setPinFunction(newPin);

    if (text && index < 3) {
      refs.current[index + 1]?.focus();
    }

    if (newPin.every(digit => digit !== "") && newPin.join("").length === 4) {
      setErrors(prev => ({ ...prev, [fieldName]: "" }));
    }
  };

  const handlePinBackspace = (e, index, pinArray, refs) => {
    if (e.key === "Backspace" && !pinArray[index] && index > 0) {
      refs.current[index - 1]?.focus();
    }
  };

  // File handling functions - SAME AS DELIVERY
  const handleFileSelect = (type, isMultiple = false) => {
    setCurrentUploadType(type);
    setUploading(true);
    setErrors(prev => ({ ...prev, documents: "" }));

    const input = fileInputRefs.current[type].current;
    if (input) {
      input.accept = "image/*";
      if (isMultiple) {
        input.multiple = true;
      } else {
        input.multiple = false;
      }
      input.click();
    }
  };

  const handleFileChange = (e, type, isMultiple = false) => {
    const files = e.target.files;
    if (!files || files.length === 0) {
      setUploading(false);
      return;
    }

    try {
      if (isMultiple) {
        const fileArray = Array.from(files).slice(0, 6).map(file => ({
          file,
          preview: URL.createObjectURL(file),
          name: file.name,
          type: file.type,
          size: file.size,
        }));

        setDocuments(prev => ({
          ...prev,
          [type]: [...(prev[type] || []), ...fileArray].slice(0, 6),
        }));
      } else {
        const file = files[0];
        
        // Validate file type
        if (!file.type.startsWith('image/')) {
          setErrors(prev => ({
            ...prev,
            documents: "Please select an image file"
          }));
          setUploading(false);
          return;
        }

        // Validate file size (5MB max)
        if (file.size > 5 * 1024 * 1024) {
          setErrors(prev => ({
            ...prev,
            documents: "File size should be less than 5MB"
          }));
          setUploading(false);
          return;
        }

        const fileData = {
          file,
          preview: URL.createObjectURL(file),
          name: file.name,
          type: file.type,
          size: file.size,
        };

        setDocuments(prev => ({
          ...prev,
          [type]: fileData,
        }));
      }

      setErrors(prev => ({ ...prev, documents: "" }));
    } catch (error) {
      console.error("File processing error:", error);
      setErrors(prev => ({
        ...prev,
        documents: "Failed to process image. Please try again.",
      }));
    } finally {
      setUploading(false);
      e.target.value = ""; // Reset input
    }
  };

  const removeImage = (type, index = null) => {
    setDocuments(prev => {
      if (type === 'storeImages' && index !== null) {
        const newImages = [...(prev.storeImages || [])];
        if (newImages[index]?.preview) {
          URL.revokeObjectURL(newImages[index].preview);
        }
        newImages.splice(index, 1);
        return { ...prev, storeImages: newImages };
      } else {
        if (prev[type]?.preview) {
          URL.revokeObjectURL(prev[type].preview);
        }
        return { ...prev, [type]: null };
      }
    });
    setErrors(prev => ({ ...prev, documents: "" }));
  };

  // Working days
  const toggleDay = (day) => {
    setWorkingDays(prev =>
      prev.includes(day) ? prev.filter(d => d !== day) : [...prev, day]
    );
  };

  // Time handling - SAME AS DELIVERY
  const generateTimeOptions = () => {
    const times = [];
    for (let hour = 0; hour < 24; hour++) {
      for (let minute = 0; minute < 60; minute += 30) {
        const timeString = `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;
        times.push(timeString);
      }
    }
    return times;
  };

  // Location handling
  const getCurrentLocation = () => {
    setLocationLoading(true);
    setLocationError("");

    if (!navigator.geolocation) {
      setLocationError("Geolocation is not supported by this browser.");
      setLocationLoading(false);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        
        // Set coordinates
        setFormValues(prev => ({
          ...prev,
          latitude: latitude.toString(),
          longitude: longitude.toString()
        }));

        // Reverse geocode to get address
        fetch(`https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${latitude}&longitude=${longitude}&localityLanguage=en`)
          .then(response => response.json())
          .then(data => {
            setFormValues(prev => ({
              ...prev,
              address: data.locality || data.city || "Address not available",
              city: data.city || "",
              state: data.principalSubdivision || "",
              country: data.countryName || "",
              countryCode: data.countryCode || ""
            }));
            setLocationLoading(false);
          })
          .catch(error => {
            console.error("Geocoding error:", error);
            setFormValues(prev => ({
              ...prev,
              address: "Location captured (address lookup failed)"
            }));
            setLocationLoading(false);
          });
      },
      (error) => {
        console.error("Geolocation error:", error);
        setLocationError("Failed to get location. Please enable location permissions and try again.");
        setLocationLoading(false);
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 60000
      }
    );
  };

  // Validation functions
  const validateField = (field) => {
    switch (field) {
      case "name":
        if (!formValues.name.trim()) return "Owner name is required";
        if (formValues.name.trim().length < 2) return "Name should be at least 2 characters";
        return "";

      case "phone":
        if (!formValues.phone.trim()) return "Phone number is required";
        const cleanPhone = formValues.phone.replace(/^0+|-/g, "");
        if (!/^3\d{9}$/.test(cleanPhone)) return "Invalid phone number (3XX-XXXXXXX)";
        return "";

      case "storeName":
        if (!formValues.storeName.trim()) return "Store name is required";
        if (formValues.storeName.trim().length < 2) return "Store name should be at least 2 characters";
        return "";

      case "category":
        if (!formValues.category) return "Category is required";
        return "";

      case "pin":
        if (!pin.every(digit => digit)) return "4-digit PIN is required";
        if (pin.join("").length !== 4) return "PIN must be exactly 4 digits";
        return "";

      case "confirmPin":
        if (!confirmPin.every(digit => digit)) return "Please confirm your PIN";
        if (confirmPin.join("") !== pin.join("")) return "PIN codes do not match";
        return "";

      case "location":
        if (!formValues.latitude || !formValues.longitude) return "Store location is required";
        return "";

      case "documents":
        const missingDocs = [];
        if (!documents.cnicFront) missingDocs.push("CNIC Front");
        if (!documents.cnicBack) missingDocs.push("CNIC Back");
        if (!documents.electricityBill) missingDocs.push("Electricity Bill");
        if (!documents.businessRegistration) missingDocs.push("Business Registration");
        if (!documents.storeLogo) missingDocs.push("Store Logo");
        if (!documents.storeImages || documents.storeImages.length === 0) missingDocs.push("At least 1 Store Image");

        if (missingDocs.length > 0) {
          return `Missing: ${missingDocs.join(", ")}`;
        }
        return "";

      default:
        return "";
    }
  };

  const validateForm = () => {
    const newErrors = {
      name: validateField("name"),
      phone: validateField("phone"),
      storeName: validateField("storeName"),
      category: validateField("category"),
      pin: validateField("pin"),
      confirmPin: validateField("confirmPin"),
      location: validateField("location"),
      documents: validateField("documents"),
    };

    setErrors(newErrors);
    return Object.values(newErrors).every(error => !error);
  };

  const handleInputChange = (field, value) => {
    setFormValues(prev => ({ ...prev, [field]: value }));
    
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: "" }));
    }
  };

  // Numeric input handlers
  const handleNumericInput = (field, value) => {
    const numericValue = value.replace(/[^0-9.]/g, '');
    const parts = numericValue.split('.');
    if (parts.length > 2) return;
    
    handleInputChange(field, numericValue);
  };

  // ✅ CORRECTED SUBMISSION FUNCTION - SAME PATTERN AS DELIVERY
  const handleSignUp = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      const firstErrorField = Object.keys(errors).find(key => errors[key]);
      if (firstErrorField) {
        const element = document.querySelector(`[name="${firstErrorField}"]`);
        if (element) {
          element.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
      }
      return;
    }

    try {
      const formattedPhone = formValues.phone.startsWith("+92")
        ? formValues.phone
        : `+92${formValues.phone.replace(/^0+/, "")}`;

      const data = {
        name: formValues.name.trim(),
        phone: formattedPhone,
        pin: pin.join(""),
        storeName: formValues.storeName.trim(),
        category: formValues.category,
        taxNumber: formValues.taxNumber.trim(),
        openingTime: formValues.openingTime || "09:00",
        closingTime: formValues.closingTime || "22:00",
        workingDays: Array.isArray(workingDays) ? workingDays.join(",") : workingDays,
        minimumOrder: formValues.minimumOrder.trim(),
        deliveryFee: formValues.deliveryFee.trim(),
        preparationTime: formValues.preparationTime || "30",
        maxDeliveryDistance: formValues.maxDeliveryDistance || "10",
        latitude: formValues.latitude,
        longitude: formValues.longitude,
        address: formValues.address.trim(),
        city: formValues.city.trim(),
        state: formValues.state.trim(),
        country: formValues.country.trim(),
        countryCode: formValues.countryCode.trim(),
      };

      // ✅ CORRECTED: Use simple field names like delivery signup
      const files = {};
      
      if (documents.cnicFront) {
        files.cnicFront = documents.cnicFront.file;
        console.log("📸 CNIC Front file added as 'cnicFront'");
      }
      if (documents.cnicBack) {
        files.cnicBack = documents.cnicBack.file;
        console.log("📸 CNIC Back file added as 'cnicBack'");
      }
      if (documents.electricityBill) {
        files.electricityBill = documents.electricityBill.file;
        console.log("📸 Electricity Bill file added as 'electricityBill'");
      }
      if (documents.businessRegistration) {
        files.businessRegistration = documents.businessRegistration.file;
        console.log("📸 Business Registration file added as 'businessRegistration'");
      }
      if (documents.storeLogo) {
        files.storeLogo = documents.storeLogo.file;
        console.log("📸 Store Logo file added as 'storeLogo'");
      }
      if (documents.storeImages && documents.storeImages.length > 0) {
        files.storeImages = documents.storeImages.map(img => img.file);
        console.log("📸 Store Images files added as 'storeImages'");
      }

      console.log("🚀 Submitting store registration:");
      console.log("📦 Data fields:", Object.keys(data));
      console.log("📁 File fields:", Object.keys(files));

      const result = await dispatch(registerStoreOwner({ data, files })).unwrap();
      
      console.log("✅ Store registration successful:", result);
      
    } catch (error) {
      console.error("❌ Store registration failed:", error);
      if (error.message) {
        alert(`Registration failed: ${error.message}`);
      }
    }
  };

  // Image uploader - SAME PATTERN AS DELIVERY
  const renderImageUploader = (title, type, isMultiple = false) => {
    const raw = documents[type];
    const images = isMultiple ? (Array.isArray(raw) ? raw : []) : raw;
    const hasImages = isMultiple ? images.length > 0 : !!images;
    const max = isMultiple ? 6 : 1;

    return (
      <div className="upload-section" key={type}>
        <div className="upload-header">
          <span className="upload-title">
            {title} <span className="required">*</span>
          </span>
          {isMultiple && (
            <span className="image-count">
              {images.length}/{max}
            </span>
          )}
        </div>

        <input
          type="file"
          ref={fileInputRefs.current[type]}
          onChange={(e) => handleFileChange(e, type, isMultiple)}
          style={{ display: "none" }}
          accept="image/*"
          multiple={isMultiple}
        />

        {isMultiple ? (
          <div className="gallery-container">
            {images.map((img, index) => (
              <div key={`${type}-${index}`} className="image-preview-container">
                <img
                  src={img.preview}
                  alt={`${title} preview ${index + 1}`}
                  className="image-preview"
                />
                <button
                  className="remove-image-button"
                  onClick={() => removeImage(type, index)}
                  disabled={uploading}
                  type="button"
                >
                  <X size={14} />
                </button>
              </div>
            ))}
            {images.length < max && (
              <button
                className={`upload-button ${uploading ? "disabled-button" : ""}`}
                onClick={() => handleFileSelect(type, true)}
                disabled={uploading}
                type="button"
              >
                {uploading && currentUploadType === type ? (
                  <div className="loading-spinner"></div>
                ) : (
                  <>
                    <Camera size={24} />
                    <span className="upload-button-text">Add Photos</span>
                  </>
                )}
              </button>
            )}
          </div>
        ) : hasImages ? (
          <div className="single-image-container">
            <div className="image-preview-container">
              <img
                src={images.preview}
                alt={`${title} preview`}
                className="image-preview"
              />
              <button
                className="remove-image-button"
                onClick={() => removeImage(type)}
                disabled={uploading}
                type="button"
              >
                <X size={14} />
              </button>
            </div>
          </div>
        ) : (
          <div className="upload-options">
            <button
              className={`upload-option ${uploading ? "disabled-button" : ""}`}
              onClick={() => handleFileSelect(type)}
              disabled={uploading}
              type="button"
            >
              {uploading && currentUploadType === type ? (
                <div className="loading-spinner"></div>
              ) : (
                <>
                  <Camera size={24} />
                  <span className="upload-option-text">Upload Photo</span>
                </>
              )}
            </button>
          </div>
        )}
      </div>
    );
  };

  // Time selector modal - SAME AS DELIVERY
  const TimeSelectorModal = ({ isOpen, onClose, selectedTime, onTimeSelect, title }) => {
    if (!isOpen) return null;

    return (
      <div className="modal-overlay" onClick={onClose}>
        <div className="modal-content time-modal" onClick={(e) => e.stopPropagation()}>
          <h3 className="modal-title">{title}</h3>
          <div className="time-options">
            {generateTimeOptions().map((time) => (
              <button
                key={time}
                className={`time-option ${selectedTime === time ? "time-option-active" : ""}`}
                onClick={() => {
                  onTimeSelect(time);
                  onClose();
                }}
                type="button"
              >
                {time}
              </button>
            ))}
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="citybites-signup-wrapper store-signup">
      <div className="citybites-signup-left">
        <img src={logo} alt="CityBites Logo" className="citybites-logo" />
        <h2 className="welcome-heading">Welcome to CityBites</h2>
        <p className="welcome-subtext">Sign up as a Store Owner</p>
      </div>

      <div className="citybites-signup-right">
        <div className="form-card">
          <h2 className="form-title">Store Owner Registration</h2>
          <p className="form-subtitle">Fill in the details to register your store</p>

          <form onSubmit={handleSignUp} encType="multipart/form-data">
            {/* Store Information Section */}
            <div className="form-section">
              <h3 className="section-title">Store Information</h3>

              {/* Store Name */}
              <div className="form-group">
                <label>
                  <Store size={16} />
                  Store Name *
                </label>
                <div className="input-container">
                  <input
                    name="storeName"
                    value={formValues.storeName}
                    onChange={(e) => handleInputChange("storeName", e.target.value)}
                    type="text"
                    placeholder="Enter Store Name"
                    className={errors.storeName ? "input-error" : ""}
                    onBlur={() => setErrors(prev => ({ ...prev, storeName: validateField("storeName") }))}
                    disabled={loading}
                  />
                </div>
                {errors.storeName && <span className="error-text">{errors.storeName}</span>}
              </div>

              {/* Category */}
              <div className="form-group">
                <label>
                  <Building size={16} />
                  Category *
                </label>
                <button
                  type="button"
                  className={`category-select ${errors.category ? "input-error" : ""}`}
                  onClick={() => setShowCategoryModal(true)}
                  disabled={loading}
                >
                  <span className={!formValues.category ? "placeholder-text" : ""}>
                    {formValues.category || "Select Category *"}
                  </span>
                  <ChevronDown size={16} className="dropdown-icon" />
                </button>
                {errors.category && <span className="error-text">{errors.category}</span>}
              </div>

              {/* Owner Name */}
              <div className="form-group">
                <label>
                  <User size={16} />
                  Owner Name *
                </label>
                <div className="input-container">
                  <input
                    name="name"
                    value={formValues.name}
                    onChange={(e) => handleInputChange("name", e.target.value)}
                    type="text"
                    placeholder="Enter Owner Name"
                    className={errors.name ? "input-error" : ""}
                    onBlur={() => setErrors(prev => ({ ...prev, name: validateField("name") }))}
                    disabled={loading}
                  />
                </div>
                {errors.name && <span className="error-text">{errors.name}</span>}
              </div>

              {/* Phone */}
              <div className="form-group">
                <label>
                  <Phone size={16} />
                  Phone Number *
                </label>
                <div className="input-container phone-input">
                  <span className="country-code">+92</span>
                  <input
                    name="phone"
                    value={formValues.phone}
                    onChange={(e) => handleInputChange("phone", e.target.value)}
                    type="tel"
                    placeholder="3XX-XXXXXXX"
                    className={errors.phone ? "input-error" : ""}
                    onBlur={() => setErrors(prev => ({ ...prev, phone: validateField("phone") }))}
                    maxLength={10}
                    disabled={loading}
                  />
                </div>
                {errors.phone && <span className="error-text">{errors.phone}</span>}
              </div>
            </div>

            {/* Security PIN Section - SAME AS DELIVERY */}
            <div className="form-section">
              <h3 className="section-title">Security PIN</h3>

              <div className="pin-section">
                <label>Create 4-digit PIN *</label>
                <div className="pin-inputs">
                  {pin.map((digit, index) => (
                    <input
                      key={index}
                      ref={el => pinRefs.current[index] = el}
                      type={showPin ? "text" : "password"}
                      inputMode="numeric"
                      maxLength="1"
                      value={digit}
                      onChange={(e) => handlePinChange(e.target.value, index, pin, setPin, pinRefs, "pin")}
                      onKeyDown={(e) => handlePinBackspace(e, index, pin, pinRefs)}
                      onBlur={() => setErrors(prev => ({ ...prev, pin: validateField("pin") }))}
                      className={errors.pin ? "input-error" : ""}
                      disabled={loading}
                    />
                  ))}
                </div>
                {errors.pin && <span className="error-text">{errors.pin}</span>}
              </div>

              <div className="pin-section">
                <label>Confirm 4-digit PIN *</label>
                <div className="pin-inputs">
                  {confirmPin.map((digit, index) => (
                    <input
                      key={index}
                      ref={el => confirmPinRefs.current[index] = el}
                      type={showPin ? "text" : "password"}
                      inputMode="numeric"
                      maxLength="1"
                      value={digit}
                      onChange={(e) => handlePinChange(e.target.value, index, confirmPin, setConfirmPin, confirmPinRefs, "confirmPin")}
                      onKeyDown={(e) => handlePinBackspace(e, index, confirmPin, confirmPinRefs)}
                      onBlur={() => setErrors(prev => ({ ...prev, confirmPin: validateField("confirmPin") }))}
                      className={errors.confirmPin ? "input-error" : ""}
                      disabled={loading}
                    />
                  ))}
                </div>
                {errors.confirmPin && <span className="error-text">{errors.confirmPin}</span>}
                
                <button 
                  type="button" 
                  className="show-pin-btn"
                  onClick={() => setShowPin(!showPin)}
                  disabled={loading}
                >
                  {showPin ? <EyeOff size={16} /> : <Eye size={16} />}
                  {showPin ? "Hide PIN" : "Show PIN"}
                </button>
              </div>
            </div>

            {/* Store Location Section */}
            <div className="form-section">
              <h3 className="section-title">Store Location *</h3>

              <div className="location-section">
                {formValues.latitude && formValues.longitude ? (
                  <div className="location-info">
                    <MapPin size={20} color="#4CAF50" />
                    <div className="location-details">
                      <div className="location-text">
                        {formValues.address || "Location captured"}
                      </div>
                      {formValues.latitude && (
                        <div className="location-coordinates">
                          {formValues.latitude}, {formValues.longitude}
                        </div>
                      )}
                      <button 
                        type="button"
                        className="change-location-btn"
                        onClick={getCurrentLocation}
                      >
                        Change Location
                      </button>
                    </div>
                  </div>
                ) : (
                  <div>
                    <button
                      type="button"
                      className={`get-location-btn ${locationLoading ? "disabled-button" : ""}`}
                      onClick={getCurrentLocation}
                      disabled={locationLoading || loading}
                    >
                      {locationLoading ? (
                        <div className="loading-spinner small"></div>
                      ) : (
                        <>
                          <MapPin size={20} />
                          Get Current Location
                        </>
                      )}
                    </button>
                    {locationError && (
                      <div className="error-text">{locationError}</div>
                    )}
                    {errors.location && (
                      <div className="error-text">{errors.location}</div>
                    )}
                  </div>
                )}
              </div>

              {/* Manual Address Inputs */}
              <div className="form-group">
                <label>Address</label>
                <div className="input-container">
                  <input
                    value={formValues.address}
                    onChange={(e) => handleInputChange("address", e.target.value)}
                    type="text"
                    placeholder="Store Address"
                    disabled={loading}
                  />
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>City</label>
                  <div className="input-container">
                    <input
                      value={formValues.city}
                      onChange={(e) => handleInputChange("city", e.target.value)}
                      type="text"
                      placeholder="City"
                      disabled={loading}
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label>State</label>
                  <div className="input-container">
                    <input
                      value={formValues.state}
                      onChange={(e) => handleInputChange("state", e.target.value)}
                      type="text"
                      placeholder="State"
                      disabled={loading}
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Operating Hours Section */}
            <div className="form-section">
              <h3 className="section-title">Operating Hours & Days</h3>

              <div className="time-selection">
                <div className="time-input-group">
                  <label>Opening Time</label>
                  <button
                    type="button"
                    className="time-select-button"
                    onClick={() => setShowOpeningTimeModal(true)}
                    disabled={loading}
                  >
                    <Clock size={16} />
                    {formValues.openingTime}
                  </button>
                </div>

                <div className="time-input-group">
                  <label>Closing Time</label>
                  <button
                    type="button"
                    className="time-select-button"
                    onClick={() => setShowClosingTimeModal(true)}
                    disabled={loading}
                  >
                    <Clock size={16} />
                    {formValues.closingTime}
                  </button>
                </div>
              </div>

              <div className="form-group">
                <label>
                  <Calendar size={16} />
                  Working Days
                </label>
                <button
                  type="button"
                  className="working-days-select"
                  onClick={() => setShowWorkingDaysModal(true)}
                  disabled={loading}
                >
                  <span>
                    {workingDays.length === 7
                      ? "Every day"
                      : workingDays.map(day => day.toUpperCase()).join(", ")}
                  </span>
                  <ChevronDown size={16} className="dropdown-icon" />
                </button>
              </div>
            </div>

            {/* Business Info Section */}
            <div className="form-section">
              <h3 className="section-title">Business Info (Optional)</h3>

              <div className="form-group">
                <label>
                  <CreditCard size={16} />
                  Tax Number (NTN/Sales Tax)
                </label>
                <div className="input-container">
                  <input
                    value={formValues.taxNumber}
                    onChange={(e) => handleInputChange("taxNumber", e.target.value)}
                    type="text"
                    placeholder="Tax Number"
                    disabled={loading}
                  />
                </div>
              </div>
            </div>

            {/* Order & Delivery Settings Section */}
            <div className="form-section">
              <h3 className="section-title">Order & Delivery Settings (Optional)</h3>

              <div className="form-row">
                <div className="form-group">
                  <label>
                    <DollarSign size={16} />
                    Minimum Order (Rs)
                  </label>
                  <div className="input-container">
                    <input
                      value={formValues.minimumOrder}
                      onChange={(e) => handleNumericInput("minimumOrder", e.target.value)}
                      type="text"
                      placeholder="0"
                      disabled={loading}
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label>
                    <Truck size={16} />
                    Delivery Fee (Rs)
                  </label>
                  <div className="input-container">
                    <input
                      value={formValues.deliveryFee}
                      onChange={(e) => handleNumericInput("deliveryFee", e.target.value)}
                      type="text"
                      placeholder="0"
                      disabled={loading}
                    />
                  </div>
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>
                    <Watch size={16} />
                    Preparation Time (min)
                  </label>
                  <div className="input-container">
                    <input
                      value={formValues.preparationTime}
                      onChange={(e) => handleNumericInput("preparationTime", e.target.value)}
                      type="text"
                      placeholder="30"
                      disabled={loading}
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label>Max Delivery Distance (km)</label>
                  <div className="input-container">
                    <input
                      value={formValues.maxDeliveryDistance}
                      onChange={(e) => handleNumericInput("maxDeliveryDistance", e.target.value)}
                      type="text"
                      placeholder="10"
                      disabled={loading}
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Documents Section */}
            <div className="form-section">
              <h3 className="section-title">Required Documents</h3>
              
              {renderImageUploader("Front CNIC", "cnicFront")}
              {renderImageUploader("Back CNIC", "cnicBack")}
              {renderImageUploader("Electricity Bill", "electricityBill")}
              {renderImageUploader("Business Registration", "businessRegistration")}
              {renderImageUploader("Store Logo", "storeLogo")}
              {renderImageUploader("Store Images (1-6)", "storeImages", true)}
              
              {errors.documents && <span className="error-text">{errors.documents}</span>}
            </div>

            {/* Status Messages */}
            {loading && (
              <div className="loading-message">
                <span>Registration in progress... This may take up to 1 minute.</span>
              </div>
            )}

            {registerStatus.error && (
              <div className="error-message">
                <span className="error-text">{registerStatus.error}</span>
              </div>
            )}

            {registerStatus.message && (
              <div className="success-message">
                <span className="success-text">{registerStatus.message}</span>
              </div>
            )}

            {/* Submit Button */}
            <button 
              type="submit" 
              className={`submit-btn ${loading || uploading || locationLoading ? "disabled-button" : ""}`}
              disabled={loading || uploading || locationLoading}
            >
              <Lock size={18} /> 
              {loading ? "Registering..." : "Complete Registration"}
            </button>

            <div className="login-redirect">
              Already have an account? <span onClick={() => navigate("/login")}>Login</span>
            </div>
          </form>
        </div>
      </div>

      {/* Category Modal */}
      {showCategoryModal && (
        <div className="modal-overlay" onClick={() => setShowCategoryModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <h3 className="modal-title">Select Category</h3>
            <div className="category-list">
              {CATEGORIES.map((category, index) => (
                <button
                  key={index}
                  className="category-item"
                  onClick={() => {
                    handleInputChange("category", category);
                    setErrors(prev => ({ ...prev, category: "" }));
                    setShowCategoryModal(false);
                  }}
                  type="button"
                >
                  {category}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Working Days Modal */}
      {showWorkingDaysModal && (
        <div className="modal-overlay" onClick={() => setShowWorkingDaysModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <h3 className="modal-title">Select Working Days</h3>
            <div className="days-grid">
              {ALL_DAYS.map(day => (
                <button
                  key={day}
                  className={`day-chip ${workingDays.includes(day) ? "day-chip-active" : ""}`}
                  onClick={() => toggleDay(day)}
                  type="button"
                >
                  {day.toUpperCase()}
                </button>
              ))}
            </div>
            <button
              className="verification-button"
              onClick={() => setShowWorkingDaysModal(false)}
              type="button"
            >
              Done
            </button>
          </div>
        </div>
      )}

      {/* Time Selector Modals */}
      <TimeSelectorModal
        isOpen={showOpeningTimeModal}
        onClose={() => setShowOpeningTimeModal(false)}
        selectedTime={formValues.openingTime}
        onTimeSelect={(time) => handleInputChange("openingTime", time)}
        title="Select Opening Time"
      />

      <TimeSelectorModal
        isOpen={showClosingTimeModal}
        onClose={() => setShowClosingTimeModal(false)}
        selectedTime={formValues.closingTime}
        onTimeSelect={(time) => handleInputChange("closingTime", time)}
        title="Select Closing Time"
      />
    </div>
  );
};

export default SignupStore;