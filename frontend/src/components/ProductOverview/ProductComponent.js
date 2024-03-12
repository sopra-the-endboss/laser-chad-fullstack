import * as React from "react";
import Card from "@mui/material/Card";
import CardMedia from "@mui/material/CardMedia";
import {CardActionArea} from "@mui/material";
import {CardContentComponent} from "./CardContentComponent";

export default function ProductComponent({ product_id, brand, title, img, description, formatted_text, price, category, clickable = true, onCardInteract}) {

  return (
    <Card sx={{ height: 310}} onClick={() => onCardInteract(clickable, product_id)}>
      <CardActionArea>
        <CardMedia
          component="img"
          image={img}
          alt="green iguana"
          sx={{height: 160}}
        />
        <CardContentComponent
          formatted_text={formatted_text}
          title={title}
          description={description}
          price={price}
          category={category}
          brand={brand}
          height={150}
          />
      </CardActionArea>
    </Card>
  );
}
