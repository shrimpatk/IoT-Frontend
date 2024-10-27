import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface User {
  id: string;
  username: string;
  email: string;
  displayName: string;
}

interface AuthState {
  accessToken: string | null;
  user: User | null;
  isLoading: boolean;
  error: string | null;
}

const getInitialState = (): AuthState => {
  if (typeof window === 'undefined') {
    return {
      accessToken: null,
      user: null,
      isLoading: false,
      error: null,
    };
  }

  return {
    accessToken: localStorage.getItem('access_token'),
    user: localStorage.getItem('user') ? JSON.parse(localStorage.getItem('user')!) : null,
    isLoading: false,
    error: null,
  };
};

const authSlice = createSlice({
  name: 'auth',
  initialState: getInitialState(),
  reducers: {
    loginStart: (state) => {
      state.isLoading = true;
      state.error = null;
    },
    loginSuccess: (state, action: PayloadAction<{ access_token: string; user: User }>) => {
      state.isLoading = false;
      state.accessToken = action.payload.access_token;
      state.user = action.payload.user;
      localStorage.setItem('access_token', action.payload.access_token);
      localStorage.setItem('user', JSON.stringify(action.payload.user));
    },
    loginFailure: (state, action: PayloadAction<string>) => {
      state.isLoading = false;
      state.error = action.payload;
    },
    logout: (state) => {
      state.accessToken = null;
      state.user = null;
      localStorage.removeItem('access_token');
      localStorage.removeItem('user');
    },
    updateToken: (state, action: PayloadAction<string>) => {
      state.accessToken = action.payload;
      localStorage.setItem('access_token', action.payload);
    },
  },
});

export const { loginStart, loginSuccess, loginFailure, logout, updateToken } = authSlice.actions;
export default authSlice.reducer;