import React from "react";
import { Drawer, Button } from "@mui/material";
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
      <Box sx={{}}>
        <Box
          sx={{
            fontSize: "24px",
            position: "fixed",
            top: "0px",
            height: "50px",
            backgroundColor: "White",
            width: "100%",
          }}
        >
          <span>Your Shopping Cart</span>
        </Box>
        <Box
          sx={{ overflowY: "auto", marginBottom: "100px", marginTop: "50px" }}
        >
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
        </Box>
        <Box
          sx={{
            position: "fixed",
            bottom: "0px",
            paddingBottom: "20px",
            height: "100px",
            backgroundColor: "White",
            width: "100%",
          }}
        >
          <Typography variant="h6" align="left" margin={2} display="table">
            Total: $
            {cartItems
              .reduce((acc, item) => acc + item.quantity * item.price, 0)
              .toFixed(2)}
          </Typography>
          <Button
            variant="contained"
            color="primary"
            disabled={cartItems.length === 0}
            onClick={() => navigate("/checkout")}
          >
            Proceed to Checkout
          </Button>
        </Box>
      </Box>
    </Drawer>
  );
};

export default CartDrawer;
