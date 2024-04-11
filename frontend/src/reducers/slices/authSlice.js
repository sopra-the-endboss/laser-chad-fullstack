/**
 * Redux slice for managing the authentication state.
 * This slice holds the state for the authentication
 * status of the user and assigns the user details when logged in.
 * @see {@link https://redux-toolkit.js.org/api/createSlice} for `createSlice` API.
 */
import { createSlice } from "@reduxjs/toolkit";

const authSlice = createSlice({
  name: "auth",
  initialState: {
    isLoggedIn: false,
    user: null,
  },
  reducers: {
    /**
     * Sets the user as logged in and updates user information in the state.
     *
     * @param {Object} state - The current state of the auth slice.
     * @param {Object} action - An action object containing the user information.
     * @param {string} action.payload.userId - The user's unique identifier.
     * @param {string} action.payload.email - The user's email address.
     * @param {Array<string>} action.payload.groups - Groups the user belongs to.
     * @param {string} action.payload.birthdate - The user's birth date.
     * @param {string} action.payload.givenname - The user's given name.
     * @param {string} action.payload.familyname - The user's family name.
     */

    setUserLoggedIn: (state, action) => {
      state.isLoggedIn = true;
      state.user = action.payload.userId;
      state.email = action.payload.email;
      state.groups = action.payload.groups;
      state.birthdate = action.payload.birthdate;
      state.givenname = action.payload.givenname;
      state.familyname = action.payload.familyname;
    },
    /**
     * Resets the authentication state, effectively logging the user out.
     *
     * @param {Object} state - The current state of the auth slice.
     */
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
