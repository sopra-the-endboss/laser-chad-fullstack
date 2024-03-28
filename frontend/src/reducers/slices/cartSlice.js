import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  cartItems: [
    // {
    //   brand: "testBrand",
    //   product_id: 1,
    //   title: "Testing",
    //   price: 29.99,
    //   quantity: 1,
    // },
  ],
};

const cartSlice = createSlice({
  name: "cart",
  initialState,
  reducers: {
    addToCart: (state, action) => {
      console.log("Adding to cart", action.payload);
      const { brand, product_id, title, price } = action.payload;
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
          quantity: 1,
        });
      }
    },
    // Action to remove an item from the cart
    removeFromCart: (state, action) => {
      //Implement correct remove function!
      state.cartItems = state.cartItems.filter(
        (item) => item.product_id !== action.payload
      );
    },
  },
});

// Export actions
export const { addToCart, removeFromCart } = cartSlice.actions;

// Export reducer
export default cartSlice.reducer;
