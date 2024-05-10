import "../../App.css";
import React, { useState } from "react";

import { Button, TextField, Grid } from "@mui/material";
import { updateUserAttributes } from "aws-amplify/auth";
import { useDispatch } from "react-redux";
import { setUserLoggedIn } from "../../reducers/slices/authSlice";
import { useSelector } from "react-redux";

const AccountSummary = () => {
  const authState = useSelector((state) => state.auth.user);
  const [isEditing, setIsEditing] = useState(false);
  const [editState, setEditState] = useState(authState);
  const dispatch = useDispatch();

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setEditState((prevState) => ({
      ...prevState,
      [name]: value,
    }));
  };

  const handleEditToggle = () => {
    setIsEditing(!isEditing);
    if (isEditing) {
      setEditState(authState);
    }
  };

  const handleUpdate = async () => {
    const { givenname, familyname, email, address, county, zip, city } =
      editState;

    let userAttributes = {
      given_name: givenname,
      family_name: familyname,
      email: email,
      address: address,
      "custom:county": county,
      "custom:zip": zip,
      "custom:city": city,
    };

    try {
      updateUserAttributes({
        userAttributes: userAttributes,
      });
      dispatch(setUserLoggedIn(editState));
      setIsEditing(false);
    } catch (error) {
      console.error("Error updating user attributes", error);
    }
  };

  const formFields = [
    { name: "givenname", label: "Givenname", autoComplete: "givenname" },
    { name: "familyname", label: "Familyname", autoComplete: "familyname" },
    { name: "email", label: "Email", autoComplete: "email" },
    {
      name: "address",
      label: "Address",
      autoComplete: "shipping address-line1",
    },
    { name: "city", label: "City", autoComplete: "shipping address-level2" },
    { name: "county", label: "County", autoComplete: "county" },
    {
      name: "zip",
      label: "Zip / Postal code",
      autoComplete: "shipping postal-code",
    },
  ];

  return (
    <React.Fragment>
      {isEditing ? (
        <React.Fragment>
          <Grid container spacing={3}>
            {formFields.map((field) => (
              <Grid item xs={12} sm={12} key={field.name}>
                <TextField
                  required
                  name={field.name}
                  label={field.label}
                  fullWidth
                  autoComplete={field.autoComplete}
                  variant="outlined"
                  value={editState[field.name]}
                  onChange={handleInputChange}
                />
              </Grid>
            ))}
            <Grid item xs={12}>
              <Button
                onClick={handleUpdate}
                type="submit"
                fullWidth
                variant="contained"
                color="primary"
              >
                Submit
              </Button>
            </Grid>
          </Grid>
        </React.Fragment>
      ) : (
        <React.Fragment>
          <div>
            <h3 className="accountH3">Delivery Information</h3>
            <p className="textLeftBound">
              {authState.givenname + " " + authState.familyname}
            </p>
            <p className="textLeftBound">{authState.address}</p>
            <p className="textLeftBound">
              {authState.zip || ""} {authState.city || ""} {authState.county || ""}
            </p>
            <h3 className="accountH3">Delivery method</h3>
            <p className="textLeftBound">Shipping</p>
          </div>
          <div className="buttonRight">
            <Button onClick={handleEditToggle} variant="contained" size="small">
              Edit
            </Button>
          </div>
        </React.Fragment>
      )}
    </React.Fragment>
  );
};

export default AccountSummary;
