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
    user: {
      userId: null,
      email: null,
      birthdate: null,
      givenname: null,
      familyname: null,
      role: null,
      address: null,
      county: null,
      zip: null,
      city: null,
    },
  },
  reducers: {
    /**
     * Sets the user as logged in and updates user information in the state.
     *
     * @param {Object} state - The current state of the auth slice.
     * @param {Object} action - An action object containing the user information.
     * @param {string} action.payload.userId - The user's unique identifier.
     * @param {string} action.payload.email - The user's email address.
     * @param {string} action.payload.birthdate - The user's birth date.
     * @param {string} action.payload.givenname - The user's given name.
     * @param {string} action.payload.familyname - The user's family name.
     * @param {string} action.payload.role - The user's role (Buyer or Seller).
     * @param {string} action.payload.address - The user's address.
     * @param {string} action.payload.county - The user's county.
     * @param {string} action.payload.zip - The user's zip code.
     * @param {string} action.payload.city - The user's city.
     */

    setUserLoggedIn: (state, action) => {
      state.isLoggedIn = true;
      state.user = { ...state.user, ...action.payload }; // Update all properties in user object
    },
    /**
     * Resets the authentication state, effectively logging the user out.
     *
     * @param {Object} state - The current state of the auth slice.
     */
    setUserLoggedOut: (state) => {
      state.isLoggedIn = false;
      state.user = {
        userId: null,
        email: null,
        birthdate: null,
        givenname: null,
        familyname: null,
        role: null,
        address: null,
        county: null,
        zip: null,
        city: null,
      };
    },
    /**
     * Updates a specific detail of the user's profile.
     * This reducer is used to update single attributes of the user's information based on the payload.
     *
     * @param {Object} state - The current state of the auth slice.
     * @param {Object} action - Contains the attribute to update and its new value.
     * @param {string} action.payload.attribute - The attribute of the user object to update.
     * @param {any} action.payload.value - The new value for the specified attribute.
     */
    updateUserDetail: (state, action) => {
      const { attribute, value } = action.payload;
      if (state.user.hasOwnProperty(attribute)) {
        state.user[attribute] = value;
      }
    },
  },
});

export const { setUserLoggedIn, setUserLoggedOut, updateUserDetail } =
  authSlice.actions;
export default authSlice.reducer;
