import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface AuthState {
  userInfo: any | null;
  token: string | null;
}

const userInfoFromStorage = localStorage.getItem('userInfo');
const initialState: AuthState = {
  userInfo: userInfoFromStorage ? JSON.parse(userInfoFromStorage) : null,
  token: userInfoFromStorage ? JSON.parse(userInfoFromStorage).token : null,
};

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    setCredentials: (
      state,
      action: PayloadAction<{ userInfo: any; token: string }>
    ) => {
      state.userInfo = action.payload.userInfo;
      state.token = action.payload.token;
      // We still update matching localStorage for persistence across reloads
      localStorage.setItem('userInfo', JSON.stringify({ ...action.payload.userInfo, token: action.payload.token }));
    },
    logOut: (state) => {
      state.userInfo = null;
      state.token = null;
      localStorage.removeItem('userInfo');
    },
  },
});

export const { setCredentials, logOut } = authSlice.actions;

export default authSlice.reducer;

export const selectCurrentUser = (state: any) => state.auth.userInfo;
export const selectCurrentToken = (state: any) => state.auth.token;
