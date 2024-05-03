import "../App.css";
import React, { useState } from "react";
import {
  Button,
  TextField,
  Typography,
  Grid,
  Paper,
  Container,
  Accordion,
  AccordionSummary,
  AccordionDetails,
} from "@mui/material";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import { useSelector } from "react-redux";
import { updateUserAttributes } from "aws-amplify/auth";
import { useDispatch } from "react-redux";
import { setUserLoggedIn } from "../reducers/slices/authSlice";

const CheckoutPage = () => {
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
    {
      name: "zip",
      label: "Zip / Postal code",
      autoComplete: "shipping postal-code",
    },
  ];

  //   const cardFields = [
  //     { name: "cardName", label: "Name on card", autoComplete: "cc-name" },
  //     {
  //       name: "cardNumber",
  //       label: "Credit card number",
  //       autoComplete: "cc-number",
  //     },
  //     { name: "cardExp", label: "Expiry date", autoComplete: "cc-exp" },
  //     { name: "cardCVV", label: "CVV", autoComplete: "cc-csc" },
  //   ];

  return (
    <Container component="main" maxWidth="md">
      <Paper elevation={3} style={{ padding: "20px", marginTop: "20px" }}>
        <Typography variant="h6" gutterBottom>
          Checkout
        </Typography>
        <Accordion>
          <AccordionSummary
            expandIcon={<ExpandMoreIcon />}
            aria-controls="panel1a-content"
            id="panel1a-header"
          >
            <Typography variant="h6" gutterBottom>
              Delivery
            </Typography>
          </AccordionSummary>
          <AccordionDetails>
            {/* <AccountSummary
              userDetails={authState}
              onEdit={(handleEdit) => {}}
            /> */}
            {isEditing ? (
              <React.Fragment>
                <Grid container spacing={3}>
                  {formFields.map((field) => (
                    <Grid
                      item
                      xs={12}
                      sm={field.name.includes("card") ? 6 : 12}
                      key={field.name}
                    >
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
                  <h3 class="accountH3">Delivery Information</h3>
                  <p class="accountText">
                    {authState.givenname + " " + authState.familyname}
                  </p>
                  <p class="accountText">{authState.address}</p>
                  <p class="accountText">
                    {authState.zip +
                      " " +
                      authState.city +
                      " " +
                      authState.county}
                  </p>
                  <h3 class="accountH3">Delivery method</h3>
                  <p class="accountText">Shipping</p>
                </div>
                <div class="editButtonRight">
                  <Button
                    onClick={handleEditToggle}
                    variant="contained"
                    size="small"
                  >
                    Edit
                  </Button>
                </div>
              </React.Fragment>
            )}
          </AccordionDetails>
        </Accordion>
        <Accordion>
          <AccordionSummary
            expandIcon={<ExpandMoreIcon />}
            aria-controls="panel1a-content"
            id="panel1a-header"
          >
            <Typography variant="h6" gutterBottom>
              Order Overview
            </Typography>
          </AccordionSummary>
          <AccordionDetails>
            <Typography></Typography>
          </AccordionDetails>
        </Accordion>
        <Accordion>
          <AccordionSummary
            expandIcon={<ExpandMoreIcon />}
            aria-controls="panel1a-content"
            id="panel1a-header"
          >
            <Typography variant="h6" gutterBottom>
              Payment Information
            </Typography>
          </AccordionSummary>
          <AccordionDetails>
            <Typography></Typography>
          </AccordionDetails>
        </Accordion>
      </Paper>
    </Container>
  );
};

export default CheckoutPage;
