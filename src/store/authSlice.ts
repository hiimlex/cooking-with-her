import { createSlice, type PayloadAction } from '@reduxjs/toolkit';
import type { AuthUser, AuthCouple, LoginResponse } from '@/model/auth';

const TOKEN_KEY  = 'cwh_token';
const USER_KEY   = 'cwh_user';
const COUPLE_KEY = 'cwh_couple';

interface AuthState {
  token:  string    | null;
  user:   AuthUser  | null;
  couple: AuthCouple | null;
}

function load(): AuthState {
  try {
    return {
      token:  localStorage.getItem(TOKEN_KEY),
      user:   JSON.parse(localStorage.getItem(USER_KEY)   ?? 'null'),
      couple: JSON.parse(localStorage.getItem(COUPLE_KEY) ?? 'null'),
    };
  } catch {
    return { token: null, user: null, couple: null };
  }
}

const authSlice = createSlice({
  name: 'auth',
  initialState: load,
  reducers: {
    setAuth(_state, { payload }: PayloadAction<LoginResponse>) {
      localStorage.setItem(TOKEN_KEY,  payload.token);
      localStorage.setItem(USER_KEY,   JSON.stringify(payload.user));
      localStorage.setItem(COUPLE_KEY, JSON.stringify(payload.couple));
      return { token: payload.token, user: payload.user, couple: payload.couple };
    },
    clearAuth() {
      localStorage.removeItem(TOKEN_KEY);
      localStorage.removeItem(USER_KEY);
      localStorage.removeItem(COUPLE_KEY);
      return { token: null, user: null, couple: null };
    },
  },
});

export const { setAuth, clearAuth } = authSlice.actions;
export default authSlice.reducer;
