import React from "react";
import { Divider, Drawer } from "@mui/material";

import { useSelector } from "react-redux";
import { Box } from "@mui/material";
import Typography from "@mui/material/Typography";
import CartItem from "./CartItem";
import { useNavigate } from "react-router-dom";

const CartDrawer = ({ isOpen, toggleCart }) => {
  const cartItems = useSelector((state) => state.cart.cartItems);
  const navigate = useNavigate();
  const onCardInteract = (clickable, id) => {
    if (clickable) {
      navigate("/product/" + id);
      toggleCart(false)();
    }
  };
  return (
    <Drawer
      open={isOpen}
      onClose={toggleCart(false)}
      anchor="right"
      PaperProps={{
        sx: {
          width: 400,
        },
      }}
    >
      <Box sx={{ fontSize: "24px", marginLeft: 2 }}>Your Shopping Cart</Box>
      <Divider variant="middle" />
      {cartItems.length === 0 ? (
        <Typography variant="p" align="left" margin={2}>
          No items in cart.
        </Typography>
      ) : (
        cartItems.map((item) => (
          <CartItem
            key={item.product_id}
            item={item}
            onCardInteract={onCardInteract}
          />
        ))
      )}
      <Typography variant="h6" align="left" margin={2} display="table">
        Total: $
        {cartItems
          .reduce((acc, item) => acc + item.quantity * item.price, 0)
          .toFixed(2)}
      </Typography>
    </Drawer>
  );
};

export default CartDrawer;
