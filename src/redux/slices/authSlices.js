import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";
import { BASE_URL } from "../api";

// Create Axios instance
const api = axios.create({ baseURL: BASE_URL });

// Request Interceptor
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Response Interceptor
api.interceptors.response.use(
  (res) => res,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      localStorage.removeItem("isAuthenticated");
      window.dispatchEvent(new Event("storage"));
    }
    return Promise.reject(error);
  }
);

// ✅ Signup
export const signup = createAsyncThunk(
  "auth/signup",
  async (userData, { rejectWithValue }) => {
    try {
      const res = await api.post("/auth/signup", userData);
      const { token, user } = res.data;
      localStorage.setItem("token", token);
      localStorage.setItem("user", JSON.stringify(user));
      localStorage.setItem("isAuthenticated", "true");
      return { user, token, isVerified: user?.isVerified || false };
    } catch (err) {
      const message = err.response?.data?.message || "Signup failed.";
      return rejectWithValue({ message });
    }
  }
);

// ✅ Login
export const login = createAsyncThunk(
  "auth/login",
  async (credentials, { rejectWithValue }) => {
    try {
      const res = await api.post("/auth/login", credentials);
      const { token, user } = res.data;
      localStorage.setItem("token", token);
      localStorage.setItem("user", JSON.stringify(user));
      localStorage.setItem("isAuthenticated", "true");
      return { user, token, isVerified: user?.isVerified || false };
    } catch (err) {
      const message = err.response?.data?.message || "Login failed.";
      return rejectWithValue({ message });
    }
  }
);

// ✅ Get current user
export const getMe = createAsyncThunk(
  "auth/getMe",
  async (_, { rejectWithValue }) => {
    try {
      const res = await api.get("/auth/me");
      const user = res.data.user;
      localStorage.setItem("user", JSON.stringify(user));
      return { user, isVerified: user?.isVerified || false };
    } catch (err) {
      return rejectWithValue({ message: "Failed to fetch user info." });
    }
  }
);

// ✅ Logout
export const logout = createAsyncThunk("auth/logout", async () => {
  localStorage.clear();
  return true;
});

const initialState = {
  user: null,
  token: null,
  isAuthenticated: false,
  isVerified: false,
  loading: false,
  error: null,
};

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(signup.pending, (s) => {
        s.loading = true;
        s.error = null;
      })
      .addCase(signup.fulfilled, (s, a) => {
        s.loading = false;
        s.user = a.payload.user;
        s.token = a.payload.token;
        s.isAuthenticated = true;
      })
      .addCase(signup.rejected, (s, a) => {
        s.loading = false;
        s.error = a.payload.message;
      })

      .addCase(login.pending, (s) => {
        s.loading = true;
        s.error = null;
      })
      .addCase(login.fulfilled, (s, a) => {
        s.loading = false;
        s.user = a.payload.user;
        s.token = a.payload.token;
        s.isAuthenticated = true;
      })
      .addCase(login.rejected, (s, a) => {
        s.loading = false;
        s.error = a.payload.message;
      })

      .addCase(getMe.fulfilled, (s, a) => {
        s.user = a.payload.user;
        s.isVerified = a.payload.isVerified;
      })
      .addCase(logout.fulfilled, (s) => {
        s.user = null;
        s.token = null;
        s.isAuthenticated = false;
      });
  },
});

export const { clearError } = authSlice.actions;
export default authSlice.reducer;
