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
            <button
              class="bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-4 rounded"
              style={{ float: "right", marginTop: "10px" }}
              onClick={signOut}
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
