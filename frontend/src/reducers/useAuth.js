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
  const cartItems = useSelector((state) => state.cart.cartItems);
  
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
      // clear the current cartItems
      console.log(`loginCart: This is the current cartItems ${JSON.stringify(cartItems)}`);
      console.log("Clear the cart");
      dispatch(clearCart());
      console.log(`loginCart: This is the cartItems after clearing ${JSON.stringify(cartItems)}`);

      // use userId to make HTTP request, set the state GetResponse with the result
      console.log(`loginCart: Fetch cart for user ${currentUserId}`);
      const getResult = await getCart(currentUserId);
      fillCart(getResult);
    }
  }

  // Logout Cart
  const postCart = async (userId) => {
    // Send POST to create a cart if not exists
    try {
      const settings = {
        method: 'POST',
        headers: {
            Accept: 'application/json',
            'Content-Type': 'application/json',
        }
      };
      const res = await fetch(apigBaseUrl + `/cart/${userId}`, settings);
      const data = await res.json();

      if (res.ok || res.status === 409) {
        console.log(`DEBUG postCart : res.ok or duplicated, also fine`);
      } else {
        console.log(`ERROR Post cart for userId ${userId}, returned ${res.status}`);
        console.log(`ERROR Post cart with data ${data}`);
      }
      
    } catch (error) {
      console.error(error);
    }
  }

  const putCart = async (userId, putBody) => {
    // Send PUT to place product_id or increase qty by 1
    console.log(`DEBUG putCart : This is the putBody ${JSON.stringify(putBody)}`);

    try {
      const settings = {
        method: 'PUT',
        headers: {
            Accept: 'application/json',
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(putBody)
      };
      const res = await fetch(apigBaseUrl + `/cart/${userId}`, settings);
      const data = await res.json();

      if (res.ok) {
        console.log(`DEBUG putCart : res.ok`);
      } else {
        console.log(`ERROR putCart : for userId ${userId}, returned ${res.status}`);
        console.log(`ERROR putCart : with data ${data}`);
      }
      
    } catch (error) {
      console.error(error);
    }
  }

  const logoutCart = async () => {
    
    // Get the user data from localStorage
    console.log(`logoutCart: Get user data via localStorage`)
    let localStorageRaw = localStorage.getItem("persist:root");
    // console.log(`logoutCart: This is the raw persist:root ${localStorageRaw}`);
    
    // Parse the string into JSON object
    const localStorageParsed = JSON.parse(localStorageRaw);
    // console.log(`logoutCart: This is the localStorageParsed: ${JSON.stringify(localStorageParsed)}`);
    const auth = localStorageParsed.auth;
    // console.log(`logoutCart: This is the auth: ${JSON.stringify(auth)}`);
    // Remove extra escape characters
    const authClean = auth.replace(/\\"/g, '"');
    // console.log(`logoutCart: This is the authClean ${authClean}`);
    const authParsed = JSON.parse(authClean);
    // console.log(`logoutCart: This is the authParsed ${JSON.stringify(authParsed)}`);
    const user = authParsed.user;
    // console.log(`logoutCart: This is the user ${JSON.stringify(user)}`);
    const userId = user.userId;
    // console.log(`logoutCart: This is the userId ${userId}`);
    
    // First post a cart with userId. If the userId does not have a cart yet, it will be created
    await postCart(userId);

    console.log(`logoutCart: This is the current cartItems ${JSON.stringify(cartItems)}`)
      
    // Loop through cartItems, put every item to backend, qty by qty
    for (const item of cartItems) {
      const item_qty = item.quantity;
      console.log(`logoutCart: item ${item.product_id} with quantity ${item.quantity}`);
      for (let q_counter=0; q_counter < item_qty; q_counter++) {
        console.log(`logoutCart: Send quantity_counter ${q_counter}`);
        await putCart(userId, item);
      }
    }

    // // Clear the cartItems
    // console.log(`logoutCart : This is the current cartItems before clearing ${JSON.stringify(cartItems)}`);
    // console.log("logoutCart : Clear the cart");
    // dispatch(clearCart());
    // console.log(`logoutCart : This is the cartItems after clearing ${JSON.stringify(cartItems)}`);

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
        logoutCart();
        dispatch(setUserLoggedOut());
      } else if (event === "signedUp") {
      }
    });
    // Cleanup listener on component unmount
    return () => removeListener();
  }, [dispatch]);
};

export default useAuth;
