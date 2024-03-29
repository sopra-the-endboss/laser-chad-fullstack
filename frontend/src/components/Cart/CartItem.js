import React from "react";
import Card from "@mui/material/Card";
import CardMedia from "@mui/material/CardMedia";
import CardContent from "@mui/material/CardContent";
import Typography from "@mui/material/Typography";
import IconButton from "@mui/material/IconButton";
import RemoveIcon from "@mui/icons-material/Remove";
import AddIcon from "@mui/icons-material/Add";
import DeleteIcon from "@mui/icons-material/Delete";
import ButtonGroup from "@mui/material/ButtonGroup";
import { useDispatch } from "react-redux";
import {
  addToCart,
  reduceQuantity,
  removeFromCart,
} from "../../reducers/slices/cartSlice";

const CartItem = ({ item, onCardInteract }) => {
  const dispatch = useDispatch();
  return (
    <Card sx={{ display: "flex", marginBottom: 2 }}>
      <CardMedia
        component="img"
        sx={{
          width: 100,
          height: 100,
          margin: 2,
          cursor: "pointer",
        }}
        image={item.img}
        alt={item.title}
        onClick={() => onCardInteract(true, item.product_id)}
      />
      <CardContent
        sx={{
          flex: "1 0 auto",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
        }}
      >
        <div>
          <Typography variant="subtitle1" component="h2">
            {item.brand}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {item.title}
          </Typography>
        </div>
        <div>
          <ButtonGroup size="small" aria-label="small outlined button group">
            <IconButton
              onClick={() => dispatch(reduceQuantity(item.product_id))}
            >
              <RemoveIcon />
            </IconButton>
            <Typography sx={{ padding: 1 }}>{item.quantity}</Typography>
            <IconButton onClick={() => dispatch(addToCart(item))}>
              <AddIcon />
            </IconButton>
          </ButtonGroup>
          <IconButton
            aria-label="delete"
            onClick={() => dispatch(removeFromCart(item.product_id))}
          >
            <DeleteIcon />
          </IconButton>
        </div>
        <Typography variant="body2">
          Price: ${item.price?.toFixed(2)}
        </Typography>
        <Typography variant="body2">
          Total: ${(item?.quantity * item.price)?.toFixed(2)}
        </Typography>
      </CardContent>
    </Card>
  );
};

export default CartItem;
