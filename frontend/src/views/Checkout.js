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
  IconButton,
} from "@mui/material";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import EditIcon from "@mui/icons-material/Edit";
import { useSelector } from "react-redux";

const CheckoutPage = () => {
  const authState = useSelector((state) => state.auth.user);
  const [isEditing, setIsEditing] = useState(false);

  const [formData, setFormData] = useState({
    firstName: authState.givenname || "",
    lastName: authState.familyname || "",
    email: authState.email || "",
    address: authState.address || "",
    city: authState.city || "",
    zip: authState.zip || "",
    county: authState.county || "",
    cardName: "",
    cardNumber: "",
    cardExp: "",
    cardCVV: "",
  });

  const handleChange = (event) => {
    setFormData({
      ...formData,
      [event.target.name]: event.target.value,
    });
  };

  const handleEditToggle = () => {
    setIsEditing(!isEditing);
  };

  const formFields = [
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

  const handleSubmit = (event) => {
    event.preventDefault();
    console.log("Form data submitted:", formData);
  };

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
                <form onSubmit={handleSubmit}>
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
                          value={formData[field.name]}
                          onChange={handleChange}
                        />
                      </Grid>
                    ))}
                    <Grid item xs={12}>
                      <Button
                        onClick={handleEditToggle}
                        type="submit"
                        fullWidth
                        variant="contained"
                        color="primary"
                      >
                        Submit
                      </Button>
                    </Grid>
                  </Grid>
                </form>
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
                </div>
                <div class="editButtonRight">
                  <IconButton
                    onClick={handleEditToggle}
                    variant="contained"
                    size="small"
                  >
                    <EditIcon />
                  </IconButton>
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
