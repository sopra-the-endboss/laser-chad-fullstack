import React from "react";
import { Divider, Drawer } from "@mui/material";
// import Cart from "./Cart";
import { addToCart, removeFromCart } from "../../reducers/slices/cartSlice";
import { useDispatch, useSelector } from "react-redux";
import { Button, Box } from "@mui/material";
import Typography from "@mui/material/Typography";

const CartDrawer = ({ isOpen, toggleCart }) => {
  const dispatch = useDispatch();
  const cartItems = useSelector((state) => state.cart.cartItems);

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
      <ul>
        <Box sx={{ fontSize: "24px", marginLeft: 2 }}>Your Cart</Box>
        <Divider variant="middle" />
        {cartItems.length === 0 ? (
          <Typography variant="p" align="left" margin={2}>
            No items in cart.
          </Typography>
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
                <p>Subtotal: ${item.quantity * item.price}</p>
                <img
                  src={item.img}
                  alt={item.title}
                  style={{
                    maxWidth: "80px",
                    maxHeight: "80px",
                    objectFit: "contain",
                    marginRight: 10,
                  }}
                />
              </Box>
              <div style={{ display: "flex", marginLeft: 5 }}>
                <Button
                  size="small"
                  variant="contained"
                  onClick={() => dispatch(removeFromCart(item.product_id))}
                >
                  -
                </Button>
                <Box sx={{ marginRight: 5, marginLeft: 5, display: "inline" }}>
                  {item.quantity}
                </Box>
                <Button
                  size="small"
                  variant="contained"
                  onClick={() => dispatch(addToCart(item))}
                >
                  +
                </Button>
              </div>
            </div>
          ))
        )}
        <Typography variant="h6" align="left" margin={2} display="table">
          Total: $
          {cartItems
            .reduce((acc, item) => acc + item.quantity * item.price, 0)
            .toFixed(2)}
        </Typography>
      </ul>
    </Drawer>
  );
};

export default CartDrawer;
