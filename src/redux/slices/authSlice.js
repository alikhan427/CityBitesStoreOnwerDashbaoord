import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';
import { BASE_URL } from '../api';

// Axios instance
const api = axios.create({
  baseURL: BASE_URL,
});

// Attach token if present
api.interceptors.request.use(config => {
  const token = localStorage.getItem('token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

/**
 * prepareFormData - CORRECTED VERSION
 * Uses exact field names from frontend
 */
const prepareFormData = (data = {}, files = {}) => {
  const formData = new FormData();

  console.log('🔍 DEBUG - Starting FormData preparation');
  
  // Append scalar data
  Object.keys(data).forEach(key => {
    const val = data[key];
    if (val !== undefined && val !== null && val !== '') {
      formData.append(key, String(val));
      console.log(`📝 Added data field: ${key} = ${val}`);
    }
  });

  // DEBUG: Log what files we're processing
  console.log('🔍 DEBUG - Files object received:', Object.keys(files));
  
  // Iterate provided files object - USE EXACT FIELD NAMES, NO MAPPING
  Object.keys(files).forEach(fieldName => {
    const value = files[fieldName];
    if (!value) {
      console.log(`🔍 DEBUG - Skipping empty file field: ${fieldName}`);
      return;
    }

    console.log(`🔍 DEBUG - Processing file field: ${fieldName}`, value);

    if (Array.isArray(value)) {
      // For array fields, append each file individually
      value.forEach((file, index) => {
        if (file instanceof File) {
          formData.append(fieldName, file, file.name);
          console.log(`✅ Appended ${fieldName}[${index}]: ${file.name} (${file.type}, ${file.size} bytes)`);
        }
      });
    } else if (value instanceof File) {
      // For single file fields
      formData.append(fieldName, value, value.name);
      console.log(`✅ Appended ${fieldName}: ${value.name} (${value.type}, ${value.size} bytes)`);
    } else {
      console.log(`❌ ${fieldName} is not a File or File array:`, value);
    }
  });

  // Log FormData contents for debugging
  console.log('🔍 DEBUG - FormData entries:');
  for (let pair of formData.entries()) {
    console.log(`📋 ${pair[0]}:`, pair[1] instanceof File ? `File: ${pair[1].name}` : pair[1]);
  }

  return formData;
};

// Save auth state
const saveAuthState = (user, token) => {
  try {
    if (user) localStorage.setItem('user', JSON.stringify(user));
    if (token) localStorage.setItem('token', token);
    localStorage.setItem('isAuthenticated', 'true');
  } catch (error) {
    console.error('Error saving auth state:', error);
  }
};

// Clear auth state
const clearAuthState = () => {
  try {
    localStorage.removeItem('user');
    localStorage.removeItem('token');
    localStorage.removeItem('isAuthenticated');
  } catch (error) {
    console.error('Error clearing auth state:', error);
  }
};

// Async thunks
export const loadAuthState = createAsyncThunk(
  'auth/loadAuthState',
  async (_, { rejectWithValue }) => {
    try {
      const user = localStorage.getItem('user');
      const token = localStorage.getItem('token');
      const isAuthenticated = localStorage.getItem('isAuthenticated') === 'true';
      if (token && isAuthenticated && user) {
        return {
          user: JSON.parse(user),
          token,
          isAuthenticated: true,
          isVerified: JSON.parse(user)?.isVerified || false,
        };
      }
      return null;
    } catch (error) {
      console.error('Error loading auth state:', error);
      return rejectWithValue({ message: 'Failed to load authentication state' });
    }
  }
);

export const registerStoreOwner = createAsyncThunk(
  'auth/registerStoreOwner',
  async ({ data, files }, { rejectWithValue }) => {
    try {
      const formData = prepareFormData(data, files);
      const response = await api.post('/auth/register/store-owner', formData, {
        headers: { 
          'Content-Type': 'multipart/form-data',
          'Accept': 'application/json'
        },
      });
      const payload = response.data || {};
      saveAuthState(payload.user, payload.token);
      return {
        user: payload.user || null,
        token: payload.token || null,
        message: payload.message || 'Store owner registered',
      };
    } catch (err) {
      const data = err.response?.data;
      const message =
        (data && (data.message || data.error || JSON.stringify(data))) ||
        err.message ||
        'Registration failed';
      return rejectWithValue({ message, raw: data || null });
    }
  }
);

export const registerDelivery = createAsyncThunk(
  'auth/registerDelivery',
  async ({ data, files }, { rejectWithValue }) => {
    try {
      console.log('🚀 Starting delivery registration...');
      const formData = prepareFormData(data, files);
      
      const response = await api.post('/auth/register/delivery', formData, {
        headers: { 
          'Content-Type': 'multipart/form-data',
          'Accept': 'application/json'
        },
        timeout: 60000,
      });
      
      const payload = response.data || {};
      if (payload.token) saveAuthState(payload.user, payload.token);
      
      console.log('✅ Delivery registration successful:', payload);
      return {
        user: payload.user || null,
        token: payload.token || null,
        message: payload.message || 'Delivery partner registered successfully',
      };
    } catch (err) {
      console.error('❌ Delivery registration failed:', err);
      const data = err.response?.data;
      
      // Enhanced error logging
      console.error('🔍 Error details:', {
        status: err.response?.status,
        statusText: err.response?.statusText,
        data: data,
        headers: err.response?.headers,
        config: err.config
      });
      
      const message =
        (data && (data.message || data.error || JSON.stringify(data))) ||
        err.message ||
        'Registration failed';
      return rejectWithValue({ 
        message, 
        raw: data || null,
        status: err.response?.status 
      });
    }
  }
);

export const login = createAsyncThunk(
  'auth/login',
  async (credentials, { rejectWithValue }) => {
    try {
      const response = await api.post('/auth/login', credentials);
      const payload = response.data || {};
      saveAuthState(payload.user, payload.token);
      return {
        user: payload.user || null,
        token: payload.token || null,
        message: payload.message || 'Login successful',
      };
    } catch (err) {
      const data = err.response?.data;
      const message =
        (data && (data.message || data.error || JSON.stringify(data))) ||
        err.message ||
        'Login failed';
      return rejectWithValue({ message, raw: data || null });
    }
  }
);

export const getMe = createAsyncThunk(
  'auth/getMe',
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.get('/auth/me');
      
      const payload = response.data || {};
      const token = localStorage.getItem('token');
      saveAuthState(payload.user, token);
      return {
        user: payload.user || null,
        message: payload.message || 'User fetched',
        isVerified: payload.user?.isVerified || false,
      };
    } catch (err) {
      const data = err.response?.data;
      const message =
        (data && (data.message || data.error || JSON.stringify(data))) ||
        err.message ||
        'Failed to fetch user';
      return rejectWithValue({ message, raw: data || null });
    }
  }
);

export const logout = createAsyncThunk('auth/logout', async (_, { rejectWithValue }) => {
  try {
    clearAuthState();
    return true;
  } catch (err) {
    return rejectWithValue({ message: 'Logout failed' });
  }
});

export const toggleStoreStatus = createAsyncThunk(
  'auth/toggleStoreStatus',
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.put('/auth/store/toggle-status');
      const payload = response.data || {};
      const userString = localStorage.getItem('user');
      if (userString) {
        const user = JSON.parse(userString);
        user.isActive = payload.data?.isActive ?? user.isActive;
        localStorage.setItem('user', JSON.stringify(user));
      }
      return {
        data: payload.data || {},
        message: payload.message || 'Store status toggled',
      };
    } catch (err) {
      const data = err.response?.data;
      const message =
        (data && (data.message || data.error || JSON.stringify(data))) ||
        err.message ||
        'Failed to toggle store status';
      return rejectWithValue({ message, raw: data || null });
    }
  }
);

// Initial state
const initialState = {
  user: null,
  token: null,
  isAuthenticated: false,
  isVerified: false,
  registrationSuccess: false,
  loading: false,
  loginLoading: false,
  stores: [],
  pagination: {},
  storesLoading: false,
  storesError: null,
  status: {
    registerStoreOwner: { message: null, error: null },
    registerDelivery: { message: null, error: null },
    login: { message: null, error: null },
    getMe: { message: null, error: null },
    logout: { message: null, error: null },
    toggleStoreStatus: { message: null, error: null },
    fetchStores: { message: null, error: null },
    loadAuthState: { message: null, error: null },
  },
};

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    clearError: (state, action) => {
      const actionType = action.payload;
      if (actionType) {
        state.status[actionType].error = null;
        if (actionType === 'fetchStores') state.storesError = null;
      } else {
        Object.keys(state.status).forEach(k => (state.status[k].error = null));
        state.storesError = null;
      }
    },
    clearMessage: (state, action) => {
      const actionType = action.payload;
      if (actionType) {
        state.status[actionType].message = null;
      } else {
        Object.keys(state.status).forEach(k => (state.status[k].message = null));
      }
    },
    clearRegistrationSuccess: state => {
      state.registrationSuccess = false;
    },
    setCredentials: (state, action) => {
      state.user = action.payload.user;
      state.token = action.payload.token;
      state.isAuthenticated = true;
      state.isVerified = action.payload.isVerified || false;
      if (action.payload.actionType) {
        state.status[action.payload.actionType].message = action.payload.message || null;
      }
    },
    clearStores: state => {
      state.stores = [];
      state.pagination = {};
      state.storesLoading = false;
      state.storesError = null;
      state.status.fetchStores.message = null;
      state.status.fetchStores.error = null;
    },
  },
  extraReducers: builder => {
    // loadAuthState
    builder
      .addCase(loadAuthState.pending, state => {
        state.loading = true;
        state.status.loadAuthState.error = null;
        state.status.loadAuthState.message = null;
      })
      .addCase(loadAuthState.fulfilled, (state, action) => {
        state.loading = false;
        if (action.payload) {
          state.user = action.payload.user;
          state.token = action.payload.token;
          state.isAuthenticated = true;
          state.isVerified = action.payload.isVerified;
          state.status.loadAuthState.message = 'Authentication state restored';
        }
      })
      .addCase(loadAuthState.rejected, (state, action) => {
        state.loading = false;
        state.isAuthenticated = false;
        state.status.loadAuthState.error = action.payload?.message || 'Failed to load auth state';
      });

    // registerStoreOwner
    builder
      .addCase(registerStoreOwner.pending, state => {
        state.loading = true;
        state.status.registerStoreOwner.error = null;
        state.status.registerStoreOwner.message = null;
        state.registrationSuccess = false;
      })
      .addCase(registerStoreOwner.fulfilled, (state, action) => {
        state.loading = false;
        state.user = action.payload.user ?? state.user;
        state.token = action.payload.token ?? state.token;
        state.isAuthenticated = !!action.payload.token;
        state.isVerified = !!action.payload.user?.isVerified;
        state.registrationSuccess = true;
        state.status.registerStoreOwner.message = action.payload.message || 'Store owner registration successful';
      })
      .addCase(registerStoreOwner.rejected, (state, action) => {
        state.loading = false;
        state.registrationSuccess = false;
        state.status.registerStoreOwner.error = action.payload?.message || 'Registration failed';
      });

    // registerDelivery
    builder
      .addCase(registerDelivery.pending, state => {
        state.loading = true;
        state.status.registerDelivery.error = null;
        state.status.registerDelivery.message = null;
        state.registrationSuccess = false;
      })
      .addCase(registerDelivery.fulfilled, (state, action) => {
        state.loading = false;
        state.user = action.payload.user ?? state.user;
        state.token = action.payload.token ?? state.token;
        state.isAuthenticated = !!action.payload.token;
        state.isVerified = !!action.payload.user?.isVerified;
        state.registrationSuccess = true;
        state.status.registerDelivery.message = action.payload.message || 'Delivery registration successful';
      })
      .addCase(registerDelivery.rejected, (state, action) => {
        state.loading = false;
        state.registrationSuccess = false;
        state.status.registerDelivery.error = action.payload?.message || 'Registration failed';
      });

    // login
    builder
      .addCase(login.pending, state => {
        state.loginLoading = true;
        state.status.login.error = null;
        state.status.login.message = null;
      })
      .addCase(login.fulfilled, (state, action) => {
        state.loginLoading = false;
        state.user = action.payload.user ?? state.user;
        state.token = action.payload.token ?? state.token;
        state.isAuthenticated = !!action.payload.token;
        state.isVerified = !!action.payload.user?.isVerified;
        state.status.login.message = action.payload.message || 'Login successful';
      })
      .addCase(login.rejected, (state, action) => {
        state.loginLoading = false;
        state.status.login.error = action.payload?.message || 'Login failed';
      });

    // getMe
    builder
      .addCase(getMe.pending, state => {
        state.loading = true;
        state.status.getMe.error = null;
        state.status.getMe.message = null;
      })
      .addCase(getMe.fulfilled, (state, action) => {
        state.loading = false;
        state.user = action.payload.user ?? state.user;
        state.isAuthenticated = true;
        state.isVerified = action.payload.isVerified ?? state.isVerified;
        state.status.getMe.message = action.payload.message || 'User fetched successfully';
      })
      .addCase(getMe.rejected, (state, action) => {
        state.loading = false;
        state.isAuthenticated = false;
        state.status.getMe.error = action.payload?.message || 'Failed to fetch user';
      });

    // logout
    builder
      .addCase(logout.fulfilled, state => {
        state.user = null;
        state.token = null;
        state.isAuthenticated = false;
        state.isVerified = false;
        state.registrationSuccess = false;
        state.loading = false;
        state.loginLoading = false;
        state.stores = [];
        state.pagination = {};
        state.storesLoading = false;
        state.storesError = null;
        state.status.logout.message = 'Logged out successfully';
        Object.keys(state.status).forEach(k => {
          state.status[k].error = null;
          state.status[k].message = null;
        });
      })
      .addCase(logout.rejected, (state, action) => {
        state.status.logout.error = action.payload?.message || 'Logout failed';
      });

    // toggleStoreStatus
    builder
      .addCase(toggleStoreStatus.pending, state => {
        state.loading = true;
        state.status.toggleStoreStatus.error = null;
        state.status.toggleStoreStatus.message = null;
      })
      .addCase(toggleStoreStatus.fulfilled, (state, action) => {
        state.loading = false;
        state.status.toggleStoreStatus.message = action.payload.message || 'Store status toggled';
        if (state.user) {
          state.user.isActive = action.payload.data?.isActive ?? state.user.isActive;
        }
      })
      .addCase(toggleStoreStatus.rejected, (state, action) => {
        state.loading = false;
        state.status.toggleStoreStatus.error = action.payload?.message || 'Failed to toggle store status';
      });
  },
});

export const {
  clearError,
  clearMessage,
  clearRegistrationSuccess,
  setCredentials,
  clearStores,
} = authSlice.actions;

export default authSlice.reducer;

