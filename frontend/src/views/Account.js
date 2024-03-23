import React from "react";
import { Amplify } from "aws-amplify";
import { Authenticator } from "@aws-amplify/ui-react";
import "@aws-amplify/ui-react/styles.css";
import config from "../config/amplifyconfiguration.json";
import AccountDetails from "./AccountDetails";

Amplify.configure(config);

const AmplifyLogin = () => {
  return (
    <div className="authenticator">
      <Authenticator>
        {({ signOut, user }) => (
          <div>
            <AccountDetails />
            <button onClick={signOut}>Sign out</button>
          </div>
        )}
      </Authenticator>
    </div>
  );
};
export default AmplifyLogin;
