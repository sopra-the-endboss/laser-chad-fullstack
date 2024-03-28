import * as React from "react";
import Card from "@mui/material/Card";
import CardMedia from "@mui/material/CardMedia";
import CardContent from "@mui/material/CardContent"; // Use CardContent for better control
import { CardContentComponent } from "./CardContentComponent";
import { Button, Box } from "@mui/material";
import AddShoppingCartIcon from "@mui/icons-material/AddShoppingCart";
import { useDispatch } from "react-redux";
import { addToCart } from "../../reducers/slices/cartSlice";

export default function ProductComponent({
  product_id,
  brand,
  title,
  img,
  description,
  formatted_text,
  price,
  category,
  onCardInteract,
}) {
  const dispatch = useDispatch();

  return (
    <Card
      sx={{ maxWidth: 345, position: "relative" }}
      data-testid="product-card"
    >
      {/* Separated the image into its own CardMedia component */}
      <CardMedia
        component="img"
        image={img}
        alt={title}
        sx={{ height: 160 }}
        onClick={() => onCardInteract(true, product_id)}
      />

      <CardContent sx={{ paddingBottom: "16px !important" }}>
        {" "}
        <CardContentComponent
          formatted_text={formatted_text}
          title={title}
          description={description}
          price={price}
          category={category}
          brand={brand}
        />
      </CardContent>

      <Box sx={{ position: "absolute", bottom: 8, right: 8, zIndex: 1 }}>
        <Button
          size="small"
          color="primary"
          onClick={(event) => {
            event.stopPropagation();
            dispatch(addToCart({ product_id, brand, title, price }));
          }}
        >
          <AddShoppingCartIcon fontSize="small" />
        </Button>
      </Box>
    </Card>
  );
}
