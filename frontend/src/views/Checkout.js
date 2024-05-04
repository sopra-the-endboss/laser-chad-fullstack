import "../App.css";
import React from "react";
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

import AccountSummary from "../components/Account/AccountSummary";
import CartItem from "../components/Cart/CartItem";
import { useNavigate } from "react-router-dom";

const CheckoutPage = () => {
  const navigate = useNavigate();
  const cartItems = useSelector((state) => state.cart.cartItems);

  const onCardInteract = (clickable, id) => {
    if (clickable) {
      navigate("/product/" + id);
    }
  };

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
            <AccountSummary />
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
