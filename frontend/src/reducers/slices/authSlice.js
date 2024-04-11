/**
 * Redux slice for managing the authentication state.
 *
 * @typedef {Object} AuthState - The authentication state object.
 * @property {boolean} isLoggedIn - Indicates whether the user is logged in or not.
 * @property {string|null} user - The user ID of the logged-in user.
 * @property {string|null} email - The email address of the logged-in user.
 * @property {string|null} groups - The groups the logged-in user belongs to.
 * @property {string|null} birthdate - The birthdate of the logged-in user.
 * @property {string|null} givenname - The given name of the logged-in user.
 * @property {string|null} familyname - The family name of the logged-in user.
 *
 * @typedef {Object} SetUserLoggedInAction - The action object for setting the user as logged in.
 * @property {string} userId - The user ID of the logged-in user.
 * @property {string} email - The email address of the logged-in user.
 * @property {string} groups - The groups the logged-in user belongs to.
 * @property {string} birthdate - The birthdate of the logged-in user.
 * @property {string} givenname - The given name of the logged-in user.
 * @property {string} familyname - The family name of the logged-in user.
 *
 * @typedef {Object} AuthSlice - The Redux slice object for managing the authentication state.
 * @property {string} name - The name of the slice.
 * @property {AuthState} initialState - The initial state of the slice.
 * @property {Object} reducers - The reducer functions for updating the state.
 *
 * @type {AuthSlice}
 */
import { createSlice } from "@reduxjs/toolkit";

/**
 * Redux slice for managing the authentication state.
 *
 */
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
