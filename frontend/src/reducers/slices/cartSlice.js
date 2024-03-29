import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  cartItems: [],
};

const cartSlice = createSlice({
  name: "cart",
  initialState,
  reducers: {
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
    // Action to reduce the quantity of an item in the cart
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
