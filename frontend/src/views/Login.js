import React, { useState } from "react";
import { TextField, Button } from "@mui/material";
import {
  CognitoUserPool,
  CognitoUser,
  AuthenticationDetails,
} from "amazon-cognito-identity-js";
import { useFormik } from "formik";
import * as Yup from "yup";
import { useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";
import { updateData } from "../reducers/slices/authSlice";

import "./styles/Login.scss";

const userPool = new CognitoUserPool({
  UserPoolId: process.env.REACT_APP_USERPOOL_ID,
  ClientId: process.env.REACT_APP_APPCLIENT_ID,
});

const Login = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const handleSubmit = (values) => {
    const cognitoUser = new CognitoUser({
      Username: values.email,
      Pool: userPool,
    });

    const authenticationDetails = new AuthenticationDetails({
      Username: values.email,
      Password: values.password,
    });

    cognitoUser.authenticateUser(authenticationDetails, {
      onSuccess: (result) => {
        cognitoUser.getUserAttributes(function (err, result) {
          if (err) {
            console.log("err", err);
            return;
          }
          dispatch(
            updateData({
              name: result[2].Value,
              email: values.email,
            })
          );
          navigate("/logged_in");
        });
      },
      onFailure: (err) => {
        console.log("login failed", err);
      },
    });
  };

  const formik = useFormik({
    initialValues: {
      email: "",
      password: "",
    },
    validationSchema: Yup.object({
      email: Yup.string().email("Invalid email address").required("Required"),
      password: Yup.string().required("No password provided."),
    }),
    onSubmit: (values) => {
      handleSubmit(values);
    },
  });

  return (
    <>
      <div className="login__container">
        <div className="login__form" onSubmit={formik.handleSubmit}>
          <h1>Sign In</h1>

          <TextField
            className="login__inputField"
            name="email"
            label="Email"
            type="email"
            onChange={formik.handleChange}
            onBlur={formik.handleBlur}
            value={formik.values.email}
          />
          {formik.touched.email && formik.errors.email ? (
            <div className="login__error">{formik.errors.email}</div>
          ) : null}

          <TextField
            className="login__inputField"
            name="password"
            label="Password"
            type="password"
            onChange={formik.handleChange}
            onBlur={formik.handleBlur}
            value={formik.values.password}
          />
          {formik.touched.password && formik.errors.password ? (
            <div className="login__error">{formik.errors.password}</div>
          ) : null}

          <Button
            type="login"
            variant="contained"
            color="primary"
            onClick={() => handleSubmit(formik.values)}
            sx={{ width: 400, marginTop: "10px" }}
          >
            {" "}
            Log in{" "}
          </Button>
        </div>
      </div>
    </>
  );
};

export default Login;
