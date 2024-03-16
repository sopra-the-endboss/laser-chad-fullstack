import React from "react";
import { Amplify } from "aws-amplify";
import { withAuthenticator } from "@aws-amplify/ui-react";
import "@aws-amplify/ui-react/styles.css";
import config from "../config/amplifyconfiguration.json";

Amplify.configure(config);
const amplifyLogin = ({ signOut, user }) => {
  return (
    <div>
      <h1>Logged in</h1>
      <p>Welcome, {user.username}</p>
      <button onClick={signOut}>Sign out</button>
    </div>
  );
};

export default withAuthenticator(amplifyLogin);
