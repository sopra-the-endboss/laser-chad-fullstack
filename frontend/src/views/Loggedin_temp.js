import React, { useEffect } from "react";
import { CognitoUserPool } from "amazon-cognito-identity-js";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";

const userPool = new CognitoUserPool({
  UserPoolId: process.env.REACT_APP_USERPOOL_ID,
  ClientId: process.env.REACT_APP_APPCLIENT_ID,
});

const Loggedin_temp = () => {
  const navigate = useNavigate();
  const userData = useSelector((state) => state.auth.userData);
  console.log("userData", userData);
  const signOut = () => {
    const cognitoUser = userPool.getCurrentUser();

    if (cognitoUser != null) {
      cognitoUser.signOut();
    }

    navigate("/");
  };

  return (
    <div className="Container">
      <h1 className="Greeting">Hi {userData.name}!</h1>
      <button
        className="SignoutButton"
        onClick={() => {
          signOut();
        }}
      >
        Logout
      </button>
    </div>
  );
};

export default Loggedin_temp;
