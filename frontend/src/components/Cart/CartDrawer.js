import React from "react";
import { Drawer } from "@mui/material";
import Cart from "./Cart";
import { addToCart, removeFromCart } from "../../reducers/slices/cartSlice";
import { useDispatch, useSelector } from "react-redux";

const CartDrawer = ({ isOpen, toggleCart }) => {
  const dispatch = useDispatch();
  const cartItems = useSelector((state) => state.cart.cartItems);

  const handleAddToCart = (clickedItem) => {
    console.log("Adding to cart", clickedItem);
    console.log("current cart", cartItems);
    dispatch(addToCart(clickedItem));
  };

  const handleRemoveFromCart = (id) => {
    dispatch(removeFromCart(id));
  };

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
      <Cart
        cartItems={cartItems}
        addToCart={handleAddToCart}
        removeFromCart={handleRemoveFromCart}
      />
    </Drawer>
  );
};

export default CartDrawer;
