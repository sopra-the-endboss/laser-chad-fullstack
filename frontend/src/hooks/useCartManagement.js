import { useDispatch } from "react-redux";
import { addToCart, clearCart } from "../reducers/slices/cartSlice";

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
        console.log(`DEBUG getCart : res.ok`);
        return data.products;
      } else {
        console.log(`DEBUG getCart : res.statusCode ${res.status}`);
        console.log(
          `DEBUG getCart : This is the data: ${JSON.stringify(data)}`
        );
        return [];
      }
    } catch (error) {
      console.error(error);
      return [];
    }
  };

  const fillCart = (cartToFill) => {
    // Given a fetched cart, fill the state
    console.log(
      `fillCart : This is the cartToFill to fill: ${JSON.stringify(cartToFill)}`
    );
    if (cartToFill.length === 0) {
      console.log("fillCart : cartToFill is empty, do nothing");
    } else {
      for (const item of cartToFill) {
        const item_to_add = {};
        item_to_add["product_id"] = item.product_id;
        const item_qty = item.qty;
        for (let q_counter = 0; q_counter < item_qty; q_counter++) {
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
