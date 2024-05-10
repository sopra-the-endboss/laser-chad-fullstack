import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  orders: [],
};

const orderSlice = createSlice({
  name: "orders",
  initialState,
  reducers: {
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
    clearOrderHistory: (state) => {
      console.log("clearing History");
      state.orders = [];
    },
  },
});

export const { addOrders, clearOrderHistory } = orderSlice.actions;
export default orderSlice.reducer;
