import { useDispatch } from "react-redux";
import { setUserLoggedIn } from "../reducers/slices/authSlice";
import CognitoAccount from "../components/Account/CognitoAccount";

export const useCurrentUser = () => {
  const dispatch = useDispatch();

  const checkCurrentUser = async () => {
    try {
      const { attributes } = await CognitoAccount();
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
            city: attributes["custom:city"],
          },
        };

        dispatch(setUserLoggedIn(userData.user));
      }
    } catch (error) {
      console.error("Error fetching current user", error);
    }
  };

  return { checkCurrentUser };
};
