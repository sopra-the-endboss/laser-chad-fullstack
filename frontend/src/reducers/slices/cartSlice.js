import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  cartItems: [],
};

/**
 * Redux slice for managing the cart state.
 *
 * @typedef {Object} CartState
 * @property {Array} cartItems - An array of items in the cart.
 *
 * @typedef {Object} CartItem
 * @property {string} brand - The brand of the product.
 * @property {string} product_id - The ID of the product.
 * @property {string} title - The title of the product.
 * @property {number} price - The price of the product.
 * @property {string} img - The image URL of the product.
 * @property {number} quantity - The quantity of the product in the cart.
 *
 * @typedef {Object} AddToCartActionPayload
 * @property {string} brand - The brand of the product.
 * @property {string} product_id - The ID of the product.
 * @property {string} title - The title of the product.
 * @property {number} price - The price of the product.
 * @property {string} img - The image URL of the product.
 *
 * @typedef {Object} ReduceQuantityActionPayload
 * @property {string} product_id - The ID of the product.
 *
 * @typedef {Object} RemoveFromCartActionPayload
 * @property {string} product_id - The ID of the product.
 *
 * @typedef {Object} CartSlice
 * @property {function} addToCart - Action creator for adding an item to the cart.
 * @property {function} reduceQuantity - Action creator for reducing the quantity of an item in the cart.
 * @property {function} removeFromCart - Action creator for removing an item from the cart.
 *
 * @type {CartState}
 */
const cartSlice = createSlice({
  name: "cart",
  initialState,
  reducers: {
    /**
     * Action to add an item to the cart.
     *
     * @param {CartState} state - The current cart state.
     * @param {AddToCartActionPayload} action - The action payload containing the item details.
     */
    addToCart: (state, action) => {
      const { brand, product_id, title, price, img } = action.payload;
      const existingIndex = state.cartItems.findIndex(
        (item) => item.product_id === action.payload.product_id
      );

      if (existingIndex >= 0) {
        state.cartItems[existingIndex].quantity += 1;
      } else {
        state.cartItems.push({
          brand,
          product_id,
          title,
          price,
          img,
          quantity: 1,
        });
      }
    },

    /**
     * Action to reduce the quantity of an item in the cart.
     *
     * @param {CartState} state - The current cart state.
     * @param {ReduceQuantityActionPayload} action - The action payload containing the product ID.
     */
    reduceQuantity: (state, action) => {
      const productIndex = state.cartItems.findIndex(
        (item) => item.product_id === action.payload
      );
      if (productIndex >= 0) {
        if (state.cartItems[productIndex].quantity > 1) {
          state.cartItems[productIndex].quantity -= 1;
        } else {
          state.cartItems.splice(productIndex, 1);
        }
      }
    },

    /**
     * Action to remove an item from the cart.
     *
     * @param {CartState} state - The current cart state.
     * @param {RemoveFromCartActionPayload} action - The action payload containing the product ID.
     */
    removeFromCart: (state, action) => {
      const productIndex = state.cartItems.findIndex(
        (item) => item.product_id === action.payload
      );
      state.cartItems.splice(productIndex, 1);
    },
  },
});

// Export actions
export const { addToCart, reduceQuantity, removeFromCart } = cartSlice.actions;

// Export reducer
export default cartSlice.reducer;
