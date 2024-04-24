import { useDispatch } from "react-redux";
import { Hub } from "aws-amplify/utils";
import { setUserLoggedOut } from "../reducers/slices/authSlice";
import { useEffect } from "react";

export const useAuthListener = (checkCurrentUser, loginCart) => {
  const dispatch = useDispatch();

  useEffect(() => {
    const removeListener = Hub.listen("auth", ({ payload: { event } }) => {
      if (event === "signedIn") {
        checkCurrentUser();
        loginCart();
      } else if (event === "signedOut") {
        dispatch(setUserLoggedOut());
      }
    });

    return () => removeListener();
  }, [dispatch, checkCurrentUser, loginCart]);
};
