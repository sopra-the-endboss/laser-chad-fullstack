import React from "react";
import { Drawer } from "@mui/material";
import Cart from "./Cart";
import { addToCart, removeFromCart } from "../../reducers/slices/cartSlice";
import { useDispatch, useSelector } from "react-redux";
import { Button, Box } from "@mui/material";
import { useEffect } from "react";

const CartDrawer = ({ isOpen, toggleCart }) => {
  const dispatch = useDispatch();
  const cartItems = useSelector((state) => state.cart.cartItems);
  useEffect(() => {
    console.log("Current cartItems state:", cartItems);
  }, [cartItems]);

  // const cartContent = cart.map((item) => (
  //   <Box key={item.id}>
  //     <Box
  //       display={"flex"}
  //       sx={{ pt: 2, pb: 2 }}
  //       alignItems={"start"}
  //       justifyContent={"space-between"}
  //     ></Box>
  //   </Box>
  // ));

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
      <div>
        <h2>Your Cart</h2>
        {cartItems.length === 0 ? (
          <p>No items in cart.</p>
        ) : (
          cartItems.map((item) => (
            <div key={item.product_id}>
              <Box
                display={"flex"}
                sx={{ pt: 2, pb: 2 }}
                alignItems={"start"}
                justifyContent={"space-between"}
              >
                <h3>{item.brand}</h3>
                <p>Price: ${item.price}</p>
              </Box>

              <Button onClick={() => dispatch(removeFromCart(item.product_id))}>
                Remove
              </Button>
            </div>
          ))
        )}
      </div>
    </Drawer>
  );
};

export default CartDrawer;
