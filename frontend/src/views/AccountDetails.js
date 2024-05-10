import React from "react";
import { useSelector } from "react-redux";
import "../App.css";
import EditIcon from "@mui/icons-material/Edit";
import { useState } from "react";
import { updateUserAttributes } from "aws-amplify/auth";
import { useDispatch } from "react-redux";
import { setUserLoggedIn } from "../reducers/slices/authSlice";
import OrderItem from "../components/Account/OrderItem";
import { useNavigate } from "react-router-dom";
import {
  Button,
  Grid,
  TextField,
  Typography,
  Box,
  IconButton,
  Divider,
  Accordion,
  AccordionDetails,
  AccordionSummary,
} from "@mui/material";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";

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
  const apigBaseUrl = useSelector((state) => state.apigBaseUrl);
  const [isEditing, setIsEditing] = useState(false);
  const [editState, setEditState] = useState(authState);
  const dispatch = useDispatch();
  const orderState = useSelector((state) => state.orders);
  const orderItems = useSelector((state) => state.orders.orders);
  const navigate = useNavigate();

  const onCardInteract = (clickable, id) => {
    if (clickable) {
      navigate("/product/" + id);
    }
  };

  const accountFields = [
    {
      name: "fullname",
      label: "Fullname",
      autoComplete: "fullname",
      value: authState.givenname + " " + authState.familyname,
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
      name: "fulladdress",
      label: "Fulladdress",
      autoComplete: "shipping address-level2",
      value: authState.zip + " " + authState.city + " " + authState.county,
      type: "address",
    },
  ];
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
        <>
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
        </>
      ) : (
        <>
          <h3 className="accountH3">
            Account Details
            <IconButton onClick={handleEditToggle} size="tiny">
              <EditIcon />
            </IconButton>
          </h3>

          {accountFields.map((field) => (
            <p className="textLeftBound">{field.value}</p>
          ))}

          <Divider sx={{ marginBottom: "10px", marginTop: "10px" }} />

          <Accordion>
            <AccordionSummary
              expandIcon={<ExpandMoreIcon />}
              aria-controls="panel1a-content"
              id="panel1a-header"
            >
              <Typography variant="h6" gutterBottom>
                Order History
              </Typography>
            </AccordionSummary>
            <AccordionDetails>
              {orderItems?.map((item) => (
                <Accordion>
                  <AccordionSummary
                    expandIcon={<ExpandMoreIcon />}
                    aria-controls="panel1a-content"
                    id="panel1a-header"
                  >
                    <div className="textLeftBound">
                      <p>
                        Order {item.order_id} from {item.date}
                      </p>
                      <p>Status: {item.status}</p>
                    </div>
                  </AccordionSummary>
                  <AccordionDetails>
                    {item.products?.map((product) => (
                      <OrderItem
                        key={product.product_id}
                        item={product}
                        onCardInteract={onCardInteract}
                      />
                    ))}
                  </AccordionDetails>
                </Accordion>
              ))}
            </AccordionDetails>
          </Accordion>
        </>
      )}
    </Box>
  );
};

export default AccountDetails;
