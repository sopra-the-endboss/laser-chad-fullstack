import React from "react";
import { Drawer, Button, Divider } from "@mui/material";
import { useSelector } from "react-redux";
import { Box } from "@mui/material";
import Typography from "@mui/material/Typography";
import CartItem from "./CartItem";
import { useNavigate } from "react-router-dom";

/**
 * Renders a shopping cart interface as a slide-out drawer using Material UI components.
 *
 * The drawer displays the current items in the shopping cart, fetched from the Redux store using `useSelector`.
 * It provides a summary of the items and a button to proceed to checkout, which navigates the user to a checkout page.
 * The `Drawer` is from Material UI and is controlled via the `isOpen` prop for showing or hiding the cart drawer.
 * Each cart item is rendered using the `CartItem` component, allowing for interactions such as navigation to the product detail page.
 *
 * @component
 * @example
 * const isOpen = true;
 * const toggleCart = () => console.log('Toggle cart drawer');
 * return <CartDrawer isOpen={isOpen} toggleCart={toggleCart} />;
 *
 * @param {Object} props - Props for configuring the CartDrawer component.
 * @param {boolean} props.isOpen - State indicating whether the cart drawer is open.
 * @param {function} props.toggleCart - Function to toggle the cart drawer's visibility.
 */

const CartDrawer = ({ isOpen, toggleCart }) => {
  const cartItems = useSelector((state) => state.cart.cartItems);
  const navigate = useNavigate();
  const onCardInteract = (clickable, id) => {
    if (clickable) {
      navigate("/product/" + id);
      toggleCart(false)();
    }
  };

  const checkOut = () => {
    navigate("/checkout");
    toggleCart(false)();
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
            onClick={checkOut}
          >
            Proceed to Checkout
          </Button>
        </Box>
      </Box>
    </Drawer>
  );
};

export default CartDrawer;
