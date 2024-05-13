import React from "react";

import {
  Typography,
  CardContent,
  CardMedia,
  Divider,
  List,
} from "@mui/material";

/**
 * Represents a single cart item in a list of shopping cart items.
 * This component displays the cart item's image, name, brand, and price.
 * It also handles interactions, allowing the user to click on the image to navigate to the product detail page.
 *
 * @param {Object} props - The properties passed to the component.
 * @param {Object} props.item - The cart item data to be displayed.
 * @param {string} props.item.product_id - The unique identifier for the product.
 * @param {string[]} props.item.images - Array containing URLs of images associated with the product.
 * @param {string} props.item.product - The name of the product.
 * @param {string} props.item.brand - The brand of the product.
 * @param {number} props.item.price - The price of the product.
 * @param {function(boolean, string):void} props.onCardInteract - A function to handle interactions with the card,
 *          specifically designed to navigate to the product detail upon clicking the product image.
 *          The function takes a boolean to signify interaction ability and the product's ID.
 *
 * @example
 * <CartItem
 *   item={{
 *     product_id: "1",
 *     images: ["http://example.com/image.jpg"],
 *     product: "Example Product",
 *     brand: "Example Brand",
 *     price: 19.99
 *   }}
 *   onCardInteract={(clickable, id) => navigateToProductPage(id)}
 * />
 */

const CartItem = ({ item, onCardInteract }) => {
  return (
    <List sx={{ display: "flex", marginBottom: 2 }}>
      <CardMedia
        component="img"
        sx={{
          width: 100,
          height: 100,
          margin: 2,
          cursor: "pointer",
        }}
        image={item?.images && item.images[0]} // try to fetch the first image from the images array, undefined otherwise
        alt={item.product}
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
            {item.product}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {item.brand}
          </Typography>
        </div>

        <Typography variant="body2">
          Price: ${Number(item.price)?.toFixed(2)}
        </Typography>
        <Divider />
      </CardContent>
    </List>
  );
};

export default CartItem;
