import { useDispatch } from "react-redux";
import { addToCart } from "../reducers/slices/cartSlice";

export const useCartManagement = (apigBaseUrl) => {
  const dispatch = useDispatch();

  const getCart = async (userId) => {
    // Send GET to get the cart
    // Return: Array with the fetched cart items
    try {
      const settings = {
        method: "GET",
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
        },
      };
      const res = await fetch(`${apigBaseUrl}/cart/${userId}`, settings);
      const data = await res.json();

      if (res.ok) {
        return data.products;
      } else {
        return [];
      }
    } catch (error) {
      console.error(error);
      return [];
    }
  };

  const fillCart = (cartToFill) => {
    // Given a fetched cart, fill the state

    if (cartToFill.length === 0) {
    } else {
      for (const item of cartToFill) {
        const item_to_add = { ...item };
        const item_quantity = item.quantity;
        for (let q_counter = 0; q_counter < item_quantity; q_counter++) {
          console.log(
            `fillCart: Send quantity_counter ${q_counter} for product_id ${item.product_id}`
          );
          dispatch(addToCart(item_to_add));
        }
      }
    }
  };

  return { getCart, fillCart };
};
