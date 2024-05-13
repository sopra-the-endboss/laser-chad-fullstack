import { createSlice } from "@reduxjs/toolkit";

/**
 * Initial state of the orders slice.
 * It includes an array to store order objects.
 */
const initialState = {
  orders: [],
};

/**
 * Redux slice for managing orders.
 * This slice includes actions for adding new orders to the state and clearing the order history.
 */

const orderSlice = createSlice({
  name: "orders",
  initialState,
  reducers: {
    /**
     * Adds orders to the state if they don't already exist based on the `order_id`.
     * New orders are added only if there isn't an existing order with the same `order_id` in the state.
     *
     * @param {Object} state - The current state of the orders slice.
     * @param {Object} action - An action object containing the array of orders to potentially add.
     */
    addOrders: (state, action) => {
      action.payload.forEach((order) => {
        const existingOrder = state.orders.some(
          (existing) => existing.order_id === order.order_id
        );

        if (!existingOrder) {
          state.orders.push(order);
        }
      });
    },

    /**
     * Clears all order history from the state.
     * This action resets the `orders` array to an empty array.
     *
     * @param {Object} state - The current state of the orders slice.
     */

    clearOrderHistory: (state) => {
      state.orders = [];
    },
  },
});

export const { addOrders, clearOrderHistory } = orderSlice.actions;
export default orderSlice.reducer;
