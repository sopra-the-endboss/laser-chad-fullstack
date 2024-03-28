import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  cartItems: [],
};

const cartSlice = createSlice({
  name: "cart",
  initialState,
  reducers: {
    addToCart: (state, action) => {
      console.log("Adding to cart", action.payload);
      const { brand, product_id, title, price, img } = action.payload;
      const existingIndex = state.cartItems.findIndex(
        (item) => item.product_id === action.payload.product_id
      );

      if (existingIndex >= 0) {
        state.cartItems[existingIndex].quantity += 1;
        console.log("Existing Product +1"); // Assuming a quantity field for cart item
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
    // Action to remove an item from the cart
    removeFromCart: (state, action) => {
      const productIndex = state.cartItems.findIndex(item => item.product_id === action.payload);
      if (productIndex >= 0) {
        if (state.cartItems[productIndex].quantity > 1) {
          state.cartItems[productIndex].quantity -= 1
        } else {
          state.cartItems.splice(productIndex, 1);
        }
      }
    }
  }
  
});

// Export actions
export const { addToCart, removeFromCart } = cartSlice.actions;

// Export reducer
export default cartSlice.reducer;
