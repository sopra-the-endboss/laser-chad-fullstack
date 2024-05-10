import { useDispatch } from "react-redux";
import { addOrders } from "../reducers/slices/orderSlice";

export const useGetOrder = () => {
  const dispatch = useDispatch();

  const getOrder = async (userId, baseUrl) => {
    try {
      const settings = {
        method: "GET",
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
        },
      };

      const res = await fetch(`${baseUrl}/order/${userId}`, settings);
      const data = await res.json();
      if (res.ok) {
        dispatch(addOrders(data[0].orders));
      } else {
        return [];
      }
    } catch (error) {
      console.error(error);
      return [];
    }
  };

  return { getOrder };
};
