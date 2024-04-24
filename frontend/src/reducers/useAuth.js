import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Hub } from "aws-amplify/utils";
import { setUserLoggedIn, setUserLoggedOut } from "./slices/authSlice";
import CognitoAccount from "../components/Account/CognitoAccount";
import { addToCart, clearCart } from "./slices/cartSlice";

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
  const apigBaseUrl = useSelector(state => state.apigBaseUrl);
  
  // Login Cart
  const getCart = async (userId) => {
    // Send GET to get the cart
    // Return: Array with the fetched cart items
    try {
      const settings = {
        method: 'GET',
        headers: {
            Accept: 'application/json',
            'Content-Type': 'application/json',
        }
      };
      const res = await fetch(apigBaseUrl + `/cart/${userId}`, settings);
      const data = await res.json();

      if (res.ok) {
        console.log(`DEBUG getCart : res.ok`);
        return(data.products);
      } else {
        console.log(`DEBUG getCart : res.statusCode ${res.status}`);
        console.log(`DEBUG getCart : This is the data: ${JSON.stringify(data)}`);
        return([]);
      }
      
    } catch (error) {
      console.error(error);
      return([]);
    }
  }

  const fillCart = (cartToFill) => {
    // Given a fetched cart, fill the state
    console.log(`fillCart : This is the cartToFill to fill: ${JSON.stringify(cartToFill)}`);
    
    if (cartToFill.length === 0) {
      console.log("fillCart : cartToFill is empty, do nothing");
    } else {
      for (const item of cartToFill) {
        const item_to_add = {};
        item_to_add['product_id'] = item.product_id;
        const item_qty = item.qty;
        for (let q_counter=0; q_counter < item_qty; q_counter++) {
          console.log(`fillCart: Send quantity_counter ${q_counter} for product_id ${item.product_id}`);
          dispatch(addToCart(item_to_add));
        }
      }
    }
  }

  const loginCart = async () => {
    
    let currentUserId = null;

    // Get the user data
    console.log(`loginCart: Get user data via CognitoAccount`)
    const { attributes } = await CognitoAccount();
    console.log(`loginCart: This is the userId: ${attributes.sub}`);

    // Catch missing userId
    currentUserId = attributes.sub;
    if (currentUserId === null || typeof currentUserId === "undefined") {
      console.log("loginCart: currentUserId is null or undefined, return empty cart");
      fillCart([]);
    } else {
      // clear the current cartItems before fetching
      console.log("loginCart: Clear the cart");
      dispatch(clearCart());
      
      // use userId to make HTTP request, fill cartItems with result (empty if error)
      console.log(`loginCart: Fetch cart for user ${currentUserId}`);
      const getResult = await getCart(currentUserId);
      fillCart(getResult);
    }
  }

  useEffect(() => {
    // Function to check current user's authentication status
    const checkCurrentUser = async () => {
      try {
        const { attributes } = await CognitoAccount();

        // if there is an idToken, dispatch the user data to the state store
        if (attributes) {
          const userData = {
            user: {
              userId: attributes.sub,
              email: attributes.email,
              birthdate: attributes.birthdate,
              givenname: attributes.given_name,
              familyname: attributes.family_name,
              role: attributes["custom:role"],
              address: attributes.address,
              county: attributes["custom:county"],
              zip: attributes["custom:zip"],
            },
          };

          dispatch(setUserLoggedIn(userData.user));
        }
      } catch (error) {
        console.log("Error fetching current user", error);
        // dispatch(setUserLoggedOut());
      }
    };

    // Call the function to check the current user's authentication status
    checkCurrentUser();

    // Set up the listener for authentication events
    const removeListener = Hub.listen("auth", ({ payload: { event } }) => {
      console.log(event);
      if (event === "signedIn") {
        checkCurrentUser();
        loginCart();
      } else if (event === "signedOut") {
        dispatch(setUserLoggedOut());
      } else if (event === "signedUp") {
      }
    });
    // Cleanup listener on component unmount
    return () => removeListener();
  }, [dispatch]);
};

export default useAuth;
