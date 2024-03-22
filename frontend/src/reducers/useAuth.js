import { useEffect } from "react";
import { useDispatch } from "react-redux";
import { Hub } from "aws-amplify/utils";
import { getCurrentUser } from "aws-amplify/auth";
import { setUserLoggedIn, setUserLoggedOut } from "./slices/authSlice";

const useAuth = () => {
  const dispatch = useDispatch();

  useEffect(() => {
    // Function to check current user's authentication status
    const checkCurrentUser = async () => {
      try {
        const user = await getCurrentUser();
        if (user) {
          dispatch(setUserLoggedIn());
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
      if (event === "signIn") {
        dispatch(setUserLoggedIn());
      } else if (event === "signOut") {
        dispatch(setUserLoggedOut());
      }
    });

    // Cleanup listener on component unmount
    return () => removeListener();
  }, [dispatch]);
};

export default useAuth;
