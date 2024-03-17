import React from "react";
import { Amplify } from "aws-amplify";
import { Authenticator } from "@aws-amplify/ui-react";
import "@aws-amplify/ui-react/styles.css";
import config from "../config/amplifyconfiguration.json";

Amplify.configure(config);

function amplifyLogin() {
  return (
    <div className="authenticator">
      <Authenticator>
        {({ signOut, user }) => (
          <div>
            <h1>Logged in</h1>
            <p>Welcome {user.username}</p>
            <button onClick={signOut}>Sign out</button>
          </div>
        )}
      </Authenticator>
    </div>
  );
}

export default amplifyLogin;
