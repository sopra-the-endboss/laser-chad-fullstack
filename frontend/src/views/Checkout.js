import "../App.css";
import React, {useState} from "react";
import {
  Typography,
  Paper,
  Container,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Button,
} from "@mui/material";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import { useSelector, useDispatch } from "react-redux";

import AccountSummary from "../components/Checkout/AccountSummary";
import CartItem from "../components/Cart/CartItem";
import Payment from "../components/Checkout/Payment";
import { useNavigate } from "react-router-dom";
import { SendOrder } from "../functions/SendOrder";
import { clearCart } from "../reducers/slices/cartSlice";
import { SendCart } from "../functions/SendCart";

const CheckoutPage = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const cartItems = useSelector((state) => state.cart.cartItems);
  const authState = useSelector((state) => state.auth.user);
  const baseUrl = useSelector((state) => state.apigBaseUrl);

  const [buyOption, setBuyOption] = useState(false);

  const onCardInteract = (clickable, id) => {
    if (clickable) {
      navigate("/product/" + id);
    }
  };

  const sendOrder = async () => {
    await SendCart(authState.userId, cartItems, baseUrl);
    await SendOrder(authState.userId, baseUrl);
    dispatch(clearCart());
    navigate('/account');
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
            <Payment setBuyOption={setBuyOption} />
          </AccordionDetails>
        </Accordion>
        <div className="buttonRight" style={{ marginTop: "10px" }}>
          <Button variant="contained" onClick={sendOrder} disabled={(!buyOption)}>
            Buy Now
          </Button>
        </div>
      </Paper>
    </Container>
  );
};

export default CheckoutPage;
