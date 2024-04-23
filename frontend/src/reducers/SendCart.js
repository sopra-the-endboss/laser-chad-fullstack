import { useSelector } from "react-redux";

export const SendCart = () => {
  const authState = useSelector((state) => state.auth.user);
  const cartState = useSelector((state) => state.cart.cartItems);
  console.log("sending cart to backend...");
  console.log("User: ", authState.user.userId);
  console.log("Cart: ", cartState);
};
