import { createSlice } from "@reduxjs/toolkit";

const authSlice = createSlice({
  name: "auth",
  initialState: {
    isLoggedIn: false,
    user: null,
  },
  reducers: {
    setUserLoggedIn: (state, action) => {
      state.isLoggedIn = true;
      state.user = action.payload.userId;
      state.email = action.payload.email;
      state.groups = action.payload.groups;
      state.birthdate = action.payload.birthdate;
      state.givenname = action.payload.givenname;
      state.familyname = action.payload.familyname;
    },
    setUserLoggedOut: (state) => {
      state.isLoggedIn = false;
      state.user = null;
      state.email = null;
      state.groups = null;
      state.birthdate = null;
    },
  },
});

export const { setUserLoggedIn, setUserLoggedOut } = authSlice.actions;
export default authSlice.reducer;
