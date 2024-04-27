import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";

import CognitoAccount from "../components/Account/CognitoAccount";
import { addToCart, clearCart } from "../reducers/slices/cartSlice";
import { useAuthListener } from "./useAuthListener";
import { useCartManagement } from "./useCartManagement";
import { useCurrentUser } from "./useCurrentUser";

/**
 * A custom hook that manages the authentication state of the user using AWS Amplify's Hub for listening to authentication events.
 *
 * Checks the current user's authentication status upon initial render and whenever authentication events (user signs in or out) occur.
 * Upon successfully fetching the user's authentication session, dispatches the user's information to the Redux store to update the auth state.
 * If now session is found, dispatches the user's logout.
 *
 * @example
 * // To use this hook, simply call it within a functional component.
 * useAuth();
 *
 * @requires aws-amplify/auth - For fetching the current user's authentication session.
 * @requires aws-amplify/utils - For listening to authentication-related events via the Hub module.
 * @requires react-redux - To dispatch actions to the Redux store.
 * @requires ./slices/authSlice - To import `setUserLoggedIn` and `setUserLoggedOut` actions.
 */
const useAuth = () => {
  const dispatch = useDispatch();
  const apigBaseUrl = useSelector((state) => state.apigBaseUrl);
  const { getCart, fillCart } = useCartManagement(apigBaseUrl);
  const { checkCurrentUser } = useCurrentUser();

  const loginCart = async () => {
    let currentUserId = null;

    // Get the user data
    console.log(`loginCart: Get user data via CognitoAccount`);
    const { attributes } = await CognitoAccount();
    console.log(`loginCart: This is the userId: ${attributes.sub}`);

    // Catch missing userId
    currentUserId = attributes?.sub;
    if (currentUserId === null || typeof currentUserId === "undefined") {
      console.log(
        "loginCart: currentUserId is null or undefined, return empty cart"
      );
      fillCart([]);
    } else {
      // clear the current cartItems before fetching
      console.log("loginCart: Clear the cart");
      dispatch(clearCart());

      // use userId to make HTTP request, fill cartItems with result (empty if error)
      console.log(`loginCart: Fetch cart for user ${currentUserId}`);
      const getCartItems = await getCart(currentUserId);
      fillCart(getCartItems);
    }
  };

  useAuthListener(checkCurrentUser, loginCart);
};

export default useAuth;
