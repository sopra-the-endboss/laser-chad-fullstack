import React from "react";
import { useSelector } from "react-redux";
import "../App.css";
import EditIcon from "@mui/icons-material/Edit";
import { useState } from "react";
import { updateUserAttributes } from "aws-amplify/auth";
import { useDispatch } from "react-redux";
import { setUserLoggedIn } from "../reducers/slices/authSlice";
import { addToCart } from "../reducers/slices/cartSlice";
import {
  Button,
  Grid,
  TextField,
  Typography,
  Box,
  IconButton,
  Divider,
} from "@mui/material";

/**
 * Displays and allows editing of the current user's account details.
 *
 * This component fetches and displays the user's account information such as full name, email, and birthdate
 * from the Redux store's auth state. Users can toggle edit mode to update their information, which is then
 * saved using AWS Amplify's `updateUserAttributes` function and updated in the Redux store.
 *
 * The editing state is managed locally within the component, allowing the user to modify their information
 * in a form. Upon saving, the updated information is dispatched to the Redux store to update the global state,
 * and the local editing state is turned off.
 *
 * @component
 * @example
 * return <AccountDetails />;
 *
 * @requires react-redux - To fetch and update the authentication state from the Redux store.
 * @requires aws-amplify/auth - To update user attributes in the backend.
 * @requires @mui/material - For the UI components.
 * @requires ../reducers/slices/authSlice - To dispatch user information updates to the Redux store.
 */

const AccountDetails = () => {
  const authState = useSelector((state) => state.auth.user);
  const [isEditing, setIsEditing] = useState(false);
  const [editState, setEditState] = useState(authState);
  const dispatch = useDispatch();

  // Add Mock Product for checkout process development

  const addMockProduct = () => {
    const mock = {
      brand: "Apple",
      product_id: "1",
      title: "iphone 13 pro max",
      price: Number(799.9),
      img: "https://www.digitec.ch/im/productimages/5/6/4/4/7/4/1/9/1/3/5/2/5/4/9/4/6/2/caac20ef-b06f-41e9-a0bf-d88900ec25b3.jpg?impolicy=ProductTileImage&resizeWidth=500&resizeHeight=375&cropWidth=500&cropHeight=375&resizeType=downsize&quality=high",
    };
    dispatch(addToCart(mock));
  };

  const formFields = [
    {
      name: "givenname",
      label: "Givenname",
      autoComplete: "givenname",
      value: authState.givenname,
    },
    {
      name: "familyname",
      label: "Familyname",
      autoComplete: "familyname",
      value: authState.familyname,
    },
    {
      name: "birthdate",
      label: "Birthdate",
      autoComplete: "birthdate",
      value: authState.birthdate,
      type: "date",
    },
    {
      name: "email",
      label: "Email",
      autoComplete: "email",
      value: authState.email,
    },
    {
      name: "address",
      label: "Address",
      autoComplete: "shipping address-line1",
      value: authState.address,
      type: "address",
    },
    {
      name: "city",
      label: "City",
      autoComplete: "shipping address-level2",
      value: authState.city,
      type: "address",
    },
    {
      name: "zip",
      label: "Zip / Postal code",
      autoComplete: "shipping postal-code",
      value: authState.zip,
      type: "address",
    },
    {
      name: "county",
      label: "County",
      autoComplete: "shipping address-level2",
      value: authState.county,
      type: "address",
    },
  ];

  const handleEditToggle = () => {
    setIsEditing(!isEditing);
    if (isEditing) {
      setEditState(authState);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setEditState((prevState) => ({
      ...prevState,
      [name]: value,
    }));
  };

  const handleUpdate = async () => {
    const {
      givenname,
      familyname,
      email,
      birthdate,
      address,
      county,
      zip,
      city,
    } = editState;

    let userAttributes = {
      given_name: givenname,
      family_name: familyname,
      email: email,
      birthdate: birthdate,
    };

    if (address) userAttributes["address"] = address;
    if (county) userAttributes["custom:county"] = county;
    if (zip) userAttributes["custom:zip"] = zip;
    if (city) userAttributes["custom:city"] = city;
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

  return (
    <Box
      sx={{
        bgcolor: "white",
        overflow: "hidden",
        boxShadow: 1,
        borderRadius: "12px",
        border: 1,
        borderColor: "grey.300",
        p: 2,
        maxWidth: "600px",
      }}
    >
      <Typography variant="h6" color="textPrimary" gutterBottom>
        User Account
      </Typography>
      <Typography variant="body2" color="textSecondary">
        Account Type: {authState.role}
      </Typography>
      <Divider sx={{ my: 2 }} />
      {isEditing ? (
        <React.Fragment>
          <Grid container spacing={3}>
            {formFields.map((field) => (
              <Grid
                item
                xs={12}
                sm={field.type === "address" ? 6 : 12}
                key={field.name}
              >
                <TextField
                  required
                  name={field.name}
                  label={field.label}
                  fullWidth
                  autoComplete={field.autoComplete}
                  variant="outlined"
                  value={editState[field.name] || ""}
                  onChange={handleInputChange}
                />
              </Grid>
            ))}

            <Grid item xs={12}>
              <Button
                variant="contained"
                color="primary"
                onClick={handleUpdate}
              >
                Save
              </Button>
            </Grid>
          </Grid>
        </React.Fragment>
      ) : (
        <React.Fragment>
          <Grid container spacing={3}>
            {formFields.map((field, index) => (
              <React.Fragment key={index}>
                <Grid item xs={6}>
                  <Typography>{field.label}:</Typography>
                </Grid>
                <Grid item xs={6}>
                  <Typography>{field.value}</Typography>
                </Grid>
              </React.Fragment>
            ))}
          </Grid>
          <IconButton onClick={handleEditToggle} size="large">
            <EditIcon />
          </IconButton>
          {/* Add Mock Product for checkout process development */}
          <button onClick={addMockProduct}>Add to Cart</button>
        </React.Fragment>
      )}
    </Box>
  );
};

export default AccountDetails;
