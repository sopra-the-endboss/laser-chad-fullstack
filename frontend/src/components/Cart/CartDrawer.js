import React from "react";
import { Drawer, Button, Divider } from "@mui/material";
import { useSelector } from "react-redux";
import { Box } from "@mui/material";
import Typography from "@mui/material/Typography";
import CartItem from "./CartItem";
import { useNavigate } from "react-router-dom";

/**
 * Component to render the shopping cart as a drawer
 * @component
 * @returns {React} A React element that renders a drawer on the right side of the page
 */
const CartDrawer = ({ isOpen, toggleCart }) => {
  const cartItems = useSelector((state) => state.cart.cartItems);
  const navigate = useNavigate();
  /**
   * A function to check if a cart item is clickable and navigate the user to the clicked product if true
   * @param {boolean} clickable
   * @param {int} id
   */
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
      <Box sx={{ margin: 2 }}>
        <Box
          sx={{
            fontSize: "24px",
            position: "fixed",
            top: "0px",
            height: "50px",
            backgroundColor: "White",
            width: "100%",
            zIndex: 2,
          }}
        >
          <span>Your Shopping Cart</span>
        </Box>

        <Box
          sx={{
            overflowY: "auto",
            marginBottom: "120px",
            marginTop: "50px",
            paddingTop: "2px",
            zIndex: 1,
          }}
        >
          <Divider />
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
            height: "120px",
            backgroundColor: "White",
            width: "100%",
            zIndex: 2,
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
