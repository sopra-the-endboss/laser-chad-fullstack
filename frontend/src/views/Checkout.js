import "../App.css";
import React, { useState } from "react";
import {
  Typography,
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
import AccountSummary from "../components/Account/AccountSummary";
import CartItem from "../components/Cart/CartItem";
import { useNavigate } from "react-router-dom";

const CheckoutPage = () => {
  const authState = useSelector((state) => state.auth.user);
  const [isEditing, setIsEditing] = useState(false);
  const [editState, setEditState] = useState(authState);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const cartItems = useSelector((state) => state.cart.cartItems);

  const onCardInteract = (clickable, id) => {
    if (clickable) {
      navigate("/product/" + id);
    }
  };

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
            <AccountSummary
              formFields={formFields}
              isEditing={isEditing}
              editState={editState}
              authState={authState}
              handleInputChange={handleInputChange}
              handleUpdate={handleUpdate}
              handleEditToggle={handleEditToggle}
            />
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
            {cartItems.map((item) => (
              <CartItem
                key={item.product_id}
                item={item}
                onCardInteract={onCardInteract}
              />
            ))}
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
