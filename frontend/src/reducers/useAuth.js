import { useEffect } from "react";
import { useDispatch } from "react-redux";
import { Hub } from "aws-amplify/utils";
import { setUserLoggedIn, setUserLoggedOut } from "./slices/authSlice";
import CognitoAccount from "../components/Account/CognitoAccount";

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
      }
    });
    // Cleanup listener on component unmount
    return () => removeListener();
  }, [dispatch]);
};

export default useAuth;
