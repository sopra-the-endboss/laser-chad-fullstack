import React from "react";
import {
  CognitoUserPool,
  CognitoUserAttribute,
} from "amazon-cognito-identity-js";
import { useFormik } from "formik";
import * as Yup from "yup";
import { useNavigate } from "react-router-dom";
import { TextField, Button } from "@mui/material";
import { v4 as uuidv4 } from "uuid";

// styling
import "./styles/SignUp.scss";

const userPool = new CognitoUserPool({
  UserPoolId: process.env.REACT_APP_USERPOOL_ID,
  ClientId: process.env.REACT_APP_APPCLIENT_ID,
});

export const SignUp = () => {
  const navigate = useNavigate();

  const handleSubmit = (values) => {
    const email = values.email.trim();
    const password = values.password.trim();
    const username = uuidv4();
    const attributeList = [
      new CognitoUserAttribute({
        Name: "email",
        Value: email,
      }),
      new CognitoUserAttribute({
        Name: "given_name",
        Value: values.given_name,
      }),
      new CognitoUserAttribute({
        Name: "family_name",
        Value: values.family_name,
      }),
      new CognitoUserAttribute({
        Name: "birthdate",
        Value: values.birthdate,
      }),
      new CognitoUserAttribute({
        Name: "address",
        Value: values.address,
      }),
    ];
    userPool.signUp(username, password, attributeList, null, (err, result) => {
      if (err) {
        console.error(err);
        return;
      }
      console.log(result);
      navigate("/logged_in"); // Redirect to the logged in userpage needs to be replaced once logged in state is implemented
    });
  };
  const formik = useFormik({
    initialValues: {
      given_name: "",
      family_name: "",
      birthdate: "",
      address: "",
      email: "",
      password: "",
    },
    validationSchema: Yup.object({
      given_name: Yup.string()
        .max(30, "Must be 15 characters or less")
        .required("Required"),
      family_name: Yup.string()
        .max(30, "Must be 15 characters or less")
        .required("Required"),
      birthdate: Yup.date().required("Required"),
      address: Yup.string().required("Required"),
      email: Yup.string().email("Invalid email address").required("Required"),
      password: Yup.string()
        .required("Required")
        .matches(/[0-9]/, "Password requires a number")
        .matches(/[a-z]/, "Password requires a lowercase letter")
        .matches(/[A-Z]/, "Password requires an uppercase letter")
        .matches(/[^\w]/, "Password requires a symbol")
        .min(8, "Must be 8 characters or more"),
    }),
    onSubmit: (values) => {
      handleSubmit(values);
    },
  });

  return (
    <>
      <div className="signup__container">
        <div className="signup__form" onSubmit={formik.handleSubmit}>
          <h1>Sign Up</h1>
          <TextField
            className="signup__inputField"
            name="given_name"
            label="Given Name"
            type="text"
            onChange={formik.handleChange}
            onBlur={formik.handleBlur}
            value={formik.values.given_name}
          />
          {formik.touched.given_name && formik.errors.given_name ? (
            <div className="signup__error">{formik.errors.given_name}</div>
          ) : null}

          <TextField
            className="signup__inputField"
            name="family_name"
            label="Family Name"
            type="text"
            onChange={formik.handleChange}
            onBlur={formik.handleBlur}
            value={formik.values.family_name}
          />
          {formik.touched.family_name && formik.errors.family_name ? (
            <div className="signup__error">{formik.errors.family_name}</div>
          ) : null}

          <TextField
            className="signup__inputField"
            name="birthdate"
            type="date"
            onChange={formik.handleChange}
            onBlur={formik.handleBlur}
            value={formik.values.birthdate}
          />
          {formik.touched.birthdate && formik.errors.birthdate ? (
            <div className="signup__error">{formik.errors.birthdate}</div>
          ) : null}

          <TextField
            className="signup__inputField"
            name="address"
            label="Address"
            type="text"
            onChange={formik.handleChange}
            onBlur={formik.handleBlur}
            value={formik.values.address}
          />
          {formik.touched.address && formik.errors.address ? (
            <div className="signup__error">{formik.errors.address}</div>
          ) : null}

          <TextField
            className="signup__inputField"
            name="email"
            label="Email"
            type="email"
            onChange={formik.handleChange}
            onBlur={formik.handleBlur}
            value={formik.values.email}
          />
          {formik.touched.email && formik.errors.email ? (
            <div className="signup__error">{formik.errors.email}</div>
          ) : null}

          <TextField
            className="signup__inputField"
            name="password"
            label="Password"
            type="password"
            onChange={formik.handleChange}
            onBlur={formik.handleBlur}
            value={formik.values.password}
          />
          {formik.touched.password && formik.errors.password ? (
            <div className="signup__error">{formik.errors.password}</div>
          ) : null}

          {/* <div className="signup__fieldName" htmlFor="confirmPassword">
                    Confirm Password
                </div>
                <input
                    className="signup__inputField"
                    name="confirmPassword"
                    type="password"
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                    value={formik.values.confirmPassword}
                />
                {formik.touched.confirmPassword && formik.errors.confirmPassword ? (
                    <div className="signup__error">{formik.errors.confirmPassword}</div>
                ) : null} */}

          <Button
            type="submit"
            variant="contained"
            name="Submit"
            color="primary"
            onClick={() => handleSubmit(formik.values)}
            sx={{ width: 400, marginTop: "10px" }}
          >
            Submit
          </Button>
        </div>
      </div>
    </>
  );
};

export default SignUp;
