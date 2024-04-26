import { useEffect } from "react";
import { useDispatch } from "react-redux";
import { Hub } from "aws-amplify/utils";
import { fetchAuthSession } from "aws-amplify/auth";
import { setUserLoggedIn, setUserLoggedOut } from "./slices/authSlice";

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

  useEffect(() => {
    // Function to check current user's authentication status
    const checkCurrentUser = async () => {
      try {
        const session = await fetchAuthSession();
        const idToken = session.tokens.idToken.payload;
        // if there is an idToken, dispatch the user data to the state store
        if (idToken) {
          const userData = {
            userId: idToken.sub,
            email: idToken.email,
            groups: idToken["cognito:groups"],
            birthdate: idToken.birthdate,
            givenname: idToken.given_name,
            familyname: idToken.family_name,
          };
          dispatch(setUserLoggedIn(userData));
        }
      } catch (error) {
        console.log("Error fetching current user", error);
        dispatch(setUserLoggedOut());
      }
    };

    // Call the function to check the current user's authentication status
    checkCurrentUser();

    // Set up the listener for authentication events
    const removeListener = Hub.listen("auth", ({ payload: { event } }) => {
      console.log(event);
      if (event === "signedIn") {
        checkCurrentUser();
      } else if (event === "signedOut") {
        dispatch(setUserLoggedOut());
      } else if (event === "signedUp") {
        // Implement selection of buyer or seller and integration to user group in cognito
      }
    });
    // Cleanup listener on component unmount
    return () => removeListener();
  }, [dispatch]);
};

export default useAuth;
