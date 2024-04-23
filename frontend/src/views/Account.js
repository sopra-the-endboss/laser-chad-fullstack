import React from "react";
import { Amplify } from "aws-amplify";
import { Authenticator } from "@aws-amplify/ui-react";
import "@aws-amplify/ui-react/styles.css";
import config from "../config/amplifyconfiguration.json";
import AccountDetails from "./AccountDetails";
import { useSelector } from "react-redux";
import { signOut } from "aws-amplify/auth";

/**
 * A component that uses AWS Amplify's Authenticator to manage user authentication.
 *
 * @example
 * // Simply use this component in your app to add an authentication flow with account details.
 * <AmplifyLogin />
 *
 * @requires aws-amplify - For initializing Amplify with the provided configuration and using its Authenticator component.
 * @requires @aws-amplify/ui-react - For UI components that integrate with AWS Amplify services.
 * @requires ../config/amplifyconfiguration.json - For Amplify project-specific configuration.
 * @requires ./AccountDetails - To display the authenticated user's account details.
 */

Amplify.configure(config);

const AmplifyLogin = () => {
  const authState = useSelector((state) => state.auth.user);
  const cartState = useSelector((state) => state.cart.cartItems);

  const SaveCartData = async () => {
    console.log("sending cart to backend...");
    console.log("Data: ", authState.userId, cartState);
    signOut();
  };
  return (
    <div className="authenticator">
      <Authenticator>
        {({ signOut, user }) => (
          <div>
            <AccountDetails />
            {/** TODO: Change to Material UI Button*/}
            <button
              class="bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-4 rounded"
              style={{ float: "right", marginTop: "10px" }}
              onClick={SaveCartData}
            >
              Sign out
            </button>
          </div>
        )}
      </Authenticator>
    </div>
  );
};
export default AmplifyLogin;
