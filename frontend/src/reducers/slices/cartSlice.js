import { createSlice } from "@reduxjs/toolkit";

/**
 * The initial state for the cart slice.
 *
 * @type {{cartItems: Array}}
 */
const initialState = {
  cartItems: [],
};

/**
 * Slice for managing cart operations.
 *
 * This slice contains reducers for adding items to the cart, reducing the quantity of an item,
 * and removing an item completely from the cart. It operates on the premise that each item
 * in the cart is unique and identified by a `product_id`.
 */
const cartSlice = createSlice({
  name: "cart",
  initialState,
  reducers: {
    /**
     * Adds an item to the cart or increases its quantity if it already exists.
     *
     * @param {Object} state - The current state of the cart.
     * @param {Object} action - An action object containing the item's details.
     * @param {string} action.payload.brand - The brand of the product.
     * @param {number} action.payload.product_id - The unique identifier for the product.
     * @param {string} action.payload.product - Product name.
     * @param {number} action.payload.price - The price of the product.
     * @param {array} action.payload.images - The images URLs of the product.
     */
    addToCart: (state, action) => {
      const { brand, product_id, product, price, images } = action.payload;
      const existingIndex = state.cartItems.findIndex(
        (item) => item.product_id === action.payload.product_id
      );

      if (existingIndex >= 0) {
        state.cartItems[existingIndex].quantity += 1;
      } else {
        state.cartItems.push({
          brand,
          product_id,
          product,
          price,
          images,
          quantity: 1,
        });
      }
    },
    /**
     * Reduces the quantity of an item in the cart. If the quantity reaches 0, the item is removed.
     *
     * @param {Object} state - The current state of the cart.
     * @param {Object} action - An action object containing the product_id to identify the item.
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
     * Removes an item from the cart.
     *
     * @param {Object} state - The current state of the cart.
     * @param {Object} action - An action object containing the product_id to identify the item.
     */
    removeFromCart: (state, action) => {
      const productIndex = state.cartItems.findIndex(
        (item) => item.product_id === action.payload
      );
      state.cartItems.splice(productIndex, 1);
    },

    /**
     * Removes everything from the cart.
     *
     * @param {Object} state - The current state of the cart.
     * @param {Object} action - An action object which is empty/not used
     */
    clearCart: (state, action) => {
      state.cartItems = [];
    },
  },
});

/**
 * Exported actions from the cartSlice for use in dispatching changes to the cart state.
 */
export const { addToCart, reduceQuantity, removeFromCart, clearCart } =
  cartSlice.actions;
export default cartSlice.reducer;
