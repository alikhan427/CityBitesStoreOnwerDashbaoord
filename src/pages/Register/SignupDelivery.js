import React, { useState, useRef, useEffect, useCallback } from "react";
import { Eye, EyeOff, Lock, Camera, X, Clock, Calendar, Bike, User, Phone, Hash, Car, CreditCard, Building, ChevronDown } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { registerDelivery, clearError, clearMessage, clearRegistrationSuccess } from "../../redux/slices/authSlice";
import "./SignupDelivery.css";
import logo from "../../assets/images/logo.jpg";

const ALL_DAYS = ['mon', 'tue', 'wed', 'thu', 'fri', 'sat', 'sun'];
const VEHICLE_TYPES = ['Bike', 'Car', 'Scooter', 'Bicycle', 'Motorcycle'];

const DeliverySignUp = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const { loading, registrationSuccess, status } = useSelector((state) => state.auth || {});
  const registerStatus = status?.registerDelivery || {};

  // Core fields
  const [formValues, setFormValues] = useState({
    name: "",
    phone: "",
    vehicleType: "",
    vehicleNumber: "",
    vehicleModel: "",
    vehicleColor: "",
    vehicleYear: "",
    startTime: "09:00",
    endTime: "18:00",
    accountNumber: "",
    accountTitle: "",
    bankName: "",
    branchCode: "",
  });

  const [pin, setPin] = useState(["", "", "", ""]);
  const [confirmPin, setConfirmPin] = useState(["", "", "", ""]);
  const [showPin, setShowPin] = useState(false);
  const [workingDays, setWorkingDays] = useState([...ALL_DAYS]);
  
  // UI state
  const [showVehicleTypeModal, setShowVehicleTypeModal] = useState(false);
  const [showWorkingDaysModal, setShowWorkingDaysModal] = useState(false);
  const [showStartTimeModal, setShowStartTimeModal] = useState(false);
  const [showEndTimeModal, setShowEndTimeModal] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [currentUploadType, setCurrentUploadType] = useState("");

  const [errors, setErrors] = useState({});
  const [documents, setDocuments] = useState({
    selfieWithCnic: null,
    cnicFront: null,
    cnicBack: null,
    drivingLicense: null,
    vehicleRegistration: null,
    vehicleImages: [],
  });

  const pinRefs = useRef([]);
  const confirmPinRefs = useRef([]);
  const fileInputRefs = useRef({
    selfieWithCnic: React.createRef(),
    cnicFront: React.createRef(),
    cnicBack: React.createRef(),
    drivingLicense: React.createRef(),
    vehicleRegistration: React.createRef(),
    vehicleImages: React.createRef(),
  });

  // Add success effect
  useEffect(() => {
    if (registrationSuccess && registerStatus.message) {
      alert(registerStatus.message);
      // Reset form
      setFormValues({
        name: "", phone: "", vehicleType: "", vehicleNumber: "",
        vehicleModel: "", vehicleColor: "", vehicleYear: "",
        startTime: "09:00", endTime: "18:00",
        accountNumber: "", accountTitle: "", bankName: "", branchCode: ""
      });
      setPin(["", "", "", ""]);
      setConfirmPin(["", "", "", ""]);
      setWorkingDays([...ALL_DAYS]);
      setDocuments({
        selfieWithCnic: null, cnicFront: null, cnicBack: null,
        drivingLicense: null, vehicleRegistration: null, vehicleImages: []
      });
      
      setTimeout(() => {
        navigate("/login");
        dispatch(clearRegistrationSuccess());
        dispatch(clearMessage("registerDelivery"));
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
      dispatch(clearError("registerDelivery"));
      dispatch(clearMessage("registerDelivery"));
      cleanupObjectURLs();
    };
  }, [dispatch, cleanupObjectURLs]);

  // PIN handling functions
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

  // File handling functions
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
        const fileArray = Array.from(files).slice(0, 5).map(file => ({
          file,
          preview: URL.createObjectURL(file),
          name: file.name,
          type: file.type,
          size: file.size,
        }));

        setDocuments(prev => ({
          ...prev,
          [type]: [...(prev[type] || []), ...fileArray].slice(0, 5),
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
      if (type === 'vehicleImages' && index !== null) {
        const newImages = [...(prev.vehicleImages || [])];
        if (newImages[index]?.preview) {
          URL.revokeObjectURL(newImages[index].preview);
        }
        newImages.splice(index, 1);
        return { ...prev, vehicleImages: newImages };
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

  // Time handling
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

  // Validation functions
  const validateField = (field) => {
    switch (field) {
      case "name":
        if (!formValues.name.trim()) return "Rider name is required";
        if (formValues.name.trim().length < 2) return "Name should be at least 2 characters";
        return "";

      case "phone":
        if (!formValues.phone.trim()) return "Phone number is required";
        const cleanPhone = formValues.phone.replace(/^0+|-/g, "");
        if (!/^3\d{9}$/.test(cleanPhone)) return "Invalid phone number (3XX-XXXXXXX)";
        return "";

      case "vehicleType":
        if (!formValues.vehicleType) return "Vehicle type is required";
        return "";

      case "vehicleNumber":
        if (!formValues.vehicleNumber.trim()) return "Vehicle number is required";
        if (formValues.vehicleNumber.trim().length < 3) return "Enter valid vehicle number";
        return "";

      case "pin":
        if (!pin.every(digit => digit)) return "4-digit PIN is required";
        if (pin.join("").length !== 4) return "PIN must be exactly 4 digits";
        return "";

      case "confirmPin":
        if (!confirmPin.every(digit => digit)) return "Please confirm your PIN";
        if (confirmPin.join("") !== pin.join("")) return "PIN codes do not match";
        return "";

      case "documents":
        const missingDocs = [];
        if (!documents.selfieWithCnic) missingDocs.push("Selfie with CNIC");
        if (!documents.cnicFront) missingDocs.push("CNIC Front");
        if (!documents.cnicBack) missingDocs.push("CNIC Back");
        if (!documents.drivingLicense) missingDocs.push("Driving License");
        if (!documents.vehicleRegistration) missingDocs.push("Vehicle Registration");
        if (!documents.vehicleImages || documents.vehicleImages.length === 0) missingDocs.push("At least 1 Vehicle Photo");

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
      vehicleType: validateField("vehicleType"),
      vehicleNumber: validateField("vehicleNumber"),
      pin: validateField("pin"),
      confirmPin: validateField("confirmPin"),
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

  // ✅ CORRECTED SUBMISSION FUNCTION
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
        vehicleType: formValues.vehicleType,
        vehicleNumber: formValues.vehicleNumber.trim(),
        vehicleModel: formValues.vehicleModel.trim(),
        vehicleColor: formValues.vehicleColor.trim(),
        vehicleYear: formValues.vehicleYear ? String(formValues.vehicleYear) : "",
        startTime: formValues.startTime || "09:00",
        endTime: formValues.endTime || "18:00",
        workingDays: Array.isArray(workingDays) ? workingDays.join(",") : workingDays,
        accountNumber: formValues.accountNumber.trim(),
        accountTitle: formValues.accountTitle.trim(),
        bankName: formValues.bankName.trim(),
        branchCode: formValues.branchCode.trim(),
      };

      // ✅ CORRECTED: Use backend-expected field names
      const files = {};
      
      if (documents.selfieWithCnic) {
        files.selfieWithCnic = documents.selfieWithCnic.file;
        console.log("📸 Selfie file added as 'selfieWithCnic'");
      }
      if (documents.cnicFront) {
        files.cnicFront = documents.cnicFront.file;
        console.log("📸 CNIC Front file added as 'cnicFront'");
      }
      if (documents.cnicBack) {
        files.cnicBack = documents.cnicBack.file;
        console.log("📸 CNIC Back file added as 'cnicBack'");
      }
      if (documents.drivingLicense) {
        files.drivingLicense = documents.drivingLicense.file;
        console.log("📸 Driving License file added as 'drivingLicense'");
      }
      if (documents.vehicleRegistration) {
        files.vehicleRegistration = documents.vehicleRegistration.file;
        console.log("📸 Vehicle Registration file added as 'vehicleRegistration'");
      }
      if (documents.vehicleImages && documents.vehicleImages.length > 0) {
        files.vehicleImages = documents.vehicleImages.map(img => img.file);
        console.log("📸 Vehicle Images files added as 'vehicleImages'");
      }

      console.log("🚀 Submitting delivery registration:");
      console.log("📦 Data fields:", Object.keys(data));
      console.log("📁 File fields:", Object.keys(files));

      const result = await dispatch(registerDelivery({ data, files })).unwrap();
      
      console.log("✅ Registration successful:", result);
      
    } catch (error) {
      console.error("❌ Registration failed:", error);
      if (error.message) {
        alert(`Registration failed: ${error.message}`);
      }
    }
  };

  const renderImageUploader = (title, type, isMultiple = false, showGallery = true) => {
    const raw = documents[type];
    const images = isMultiple ? (Array.isArray(raw) ? raw : []) : raw;
    const hasImages = isMultiple ? images.length > 0 : !!images;
    const max = 5;

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
    <div className="citybites-signup-wrapper delivery-signup">
      <div className="citybites-signup-left">
        <img src={logo} alt="CityBites Logo" className="citybites-logo" />
        <h2 className="welcome-heading">Welcome to CityBites</h2>
        <p className="welcome-subtext">Sign up as a Delivery Partner</p>
      </div>

      <div className="citybites-signup-right">
        <div className="form-card">
          <h2 className="form-title">Delivery Partner Registration</h2>
          <p className="form-subtitle">Fill in the details to register as a delivery partner</p>

          <form onSubmit={handleSignUp} encType="multipart/form-data">
            {/* Rider Information Section */}
            <div className="form-section">
              <h3 className="section-title">Rider Information</h3>

              {/* Name */}
              <div className="form-group">
                <label>
                  <User size={16} />
                  Rider Name *
                </label>
                <div className="input-container">
                  <input
                    name="name"
                    value={formValues.name}
                    onChange={(e) => handleInputChange("name", e.target.value)}
                    type="text"
                    placeholder="Enter Rider Name"
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

              {/* Vehicle Type */}
              <div className="form-group">
                <label>
                  <Bike size={16} />
                  Vehicle Type *
                </label>
                <button
                  type="button"
                  className={`vehicle-type-select ${errors.vehicleType ? "input-error" : ""}`}
                  onClick={() => setShowVehicleTypeModal(true)}
                  disabled={loading}
                >
                  <span className={!formValues.vehicleType ? "placeholder-text" : ""}>
                    {formValues.vehicleType || "Select Vehicle Type *"}
                  </span>
                  <ChevronDown size={16} className="dropdown-icon" />
                </button>
                {errors.vehicleType && <span className="error-text">{errors.vehicleType}</span>}
              </div>

              {/* Vehicle Number */}
              <div className="form-group">
                <label>
                  <Hash size={16} />
                  Vehicle Number *
                </label>
                <div className="input-container">
                  <input
                    name="vehicleNumber"
                    value={formValues.vehicleNumber}
                    onChange={(e) => handleInputChange("vehicleNumber", e.target.value)}
                    type="text"
                    placeholder="Enter Vehicle Number"
                    className={errors.vehicleNumber ? "input-error" : ""}
                    onBlur={() => setErrors(prev => ({ ...prev, vehicleNumber: validateField("vehicleNumber") }))}
                    disabled={loading}
                  />
                </div>
                {errors.vehicleNumber && <span className="error-text">{errors.vehicleNumber}</span>}
              </div>

              {/* Vehicle Details Row */}
              <div className="form-row">
                <div className="form-group">
                  <label>Vehicle Model</label>
                  <div className="input-container">
                    <Car size={16} className="input-icon" />
                    <input
                      value={formValues.vehicleModel}
                      onChange={(e) => handleInputChange("vehicleModel", e.target.value)}
                      type="text"
                      placeholder="Model (optional)"
                      disabled={loading}
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label>Vehicle Color</label>
                  <div className="input-container">
                    <div className="color-icon">Color</div>
                    <input
                      value={formValues.vehicleColor}
                      onChange={(e) => handleInputChange("vehicleColor", e.target.value)}
                      type="text"
                      placeholder="Color (optional)"
                      disabled={loading}
                    />
                  </div>
                </div>
              </div>

              {/* Vehicle Year */}
              <div className="form-group">
                <label>Vehicle Year</label>
                <div className="input-container">
                  <Calendar size={16} className="input-icon" />
                  <input
                    value={formValues.vehicleYear}
                    onChange={(e) => handleInputChange("vehicleYear", e.target.value.replace(/[^0-9]/g, ''))}
                    type="text"
                    placeholder="Year (optional)"
                    maxLength={4}
                    disabled={loading}
                  />
                </div>
              </div>
            </div>

            {/* Security PIN Section */}
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

            {/* Availability Section */}
            <div className="form-section">
              <h3 className="section-title">Availability</h3>

              <div className="time-selection">
                <div className="time-input-group">
                  <label>Start Time</label>
                  <button
                    type="button"
                    className="time-select-button"
                    onClick={() => setShowStartTimeModal(true)}
                    disabled={loading}
                  >
                    <Clock size={16} />
                    {formValues.startTime}
                  </button>
                </div>

                <div className="time-input-group">
                  <label>End Time</label>
                  <button
                    type="button"
                    className="time-select-button"
                    onClick={() => setShowEndTimeModal(true)}
                    disabled={loading}
                  >
                    <Clock size={16} />
                    {formValues.endTime}
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

            {/* Bank Details Section */}
            <div className="form-section">
              <h3 className="section-title">Bank Details (Optional)</h3>

              <div className="form-group">
                <label>
                  <CreditCard size={16} />
                  Account Number
                </label>
                <div className="input-container">
                  <input
                    value={formValues.accountNumber}
                    onChange={(e) => handleInputChange("accountNumber", e.target.value)}
                    type="text"
                    placeholder="Account Number"
                    disabled={loading}
                  />
                </div>
              </div>

              <div className="form-group">
                <label>
                  <User size={16} />
                  Account Title
                </label>
                <div className="input-container">
                  <input
                    value={formValues.accountTitle}
                    onChange={(e) => handleInputChange("accountTitle", e.target.value)}
                    type="text"
                    placeholder="Account Title"
                    disabled={loading}
                  />
                </div>
              </div>

              <div className="form-group">
                <label>
                  <Building size={16} />
                  Bank Name
                </label>
                <div className="input-container">
                  <input
                    value={formValues.bankName}
                    onChange={(e) => handleInputChange("bankName", e.target.value)}
                    type="text"
                    placeholder="Bank Name"
                    disabled={loading}
                  />
                </div>
              </div>

              <div className="form-group">
                <label>Branch Code</label>
                <div className="input-container">
                  <Hash size={16} className="input-icon" />
                  <input
                    value={formValues.branchCode}
                    onChange={(e) => handleInputChange("branchCode", e.target.value)}
                    type="text"
                    placeholder="Branch Code"
                    disabled={loading}
                  />
                </div>
              </div>
            </div>

            {/* Documents Section */}
            <div className="form-section">
              <h3 className="section-title">Required Documents</h3>
              
              {renderImageUploader("Selfie with CNIC", "selfieWithCnic")}
              {renderImageUploader("Front CNIC", "cnicFront")}
              {renderImageUploader("Back CNIC", "cnicBack")}
              {renderImageUploader("Driving License", "drivingLicense")}
              {renderImageUploader("Vehicle Registration", "vehicleRegistration")}
              {renderImageUploader("Vehicle Photos (1-5)", "vehicleImages", true)}
              
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
              className={`submit-btn ${loading || uploading ? "disabled-button" : ""}`}
              disabled={loading || uploading}
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

      {/* Vehicle Type Modal */}
      {showVehicleTypeModal && (
        <div className="modal-overlay" onClick={() => setShowVehicleTypeModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <h3 className="modal-title">Select Vehicle Type</h3>
            <div className="vehicle-type-list">
              {VEHICLE_TYPES.map((type, index) => (
                <button
                  key={index}
                  className="vehicle-type-item"
                  onClick={() => {
                    handleInputChange("vehicleType", type);
                    setErrors(prev => ({ ...prev, vehicleType: "" }));
                    setShowVehicleTypeModal(false);
                  }}
                  type="button"
                >
                  {type}
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
        isOpen={showStartTimeModal}
        onClose={() => setShowStartTimeModal(false)}
        selectedTime={formValues.startTime}
        onTimeSelect={(time) => handleInputChange("startTime", time)}
        title="Select Start Time"
      />

      <TimeSelectorModal
        isOpen={showEndTimeModal}
        onClose={() => setShowEndTimeModal(false)}
        selectedTime={formValues.endTime}
        onTimeSelect={(time) => handleInputChange("endTime", time)}
        title="Select End Time"
      />
    </div>
  );
};

export default DeliverySignUp;