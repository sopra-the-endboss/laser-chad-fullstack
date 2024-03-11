import * as React from "react";
import Card from "@mui/material/Card";
import CardMedia from "@mui/material/CardMedia";
import {CardActionArea} from "@mui/material";
import {CardContentComponent} from "../components/CardContentComponent";

export default function ProductCategories({ title, img, description, formatted_text, price, category}) {

  const onCardInteract = () => {
    console.log("redirect to product");
  }

  return (
    <Card sx={{ height: 310}} onClick={onCardInteract}>
      <CardActionArea>
        <CardMedia
          component="img"
          height="140"
          image={img}
          alt="green iguana"
        />
        <CardContentComponent
          formatted_text={formatted_text}
          title={title}
          description={description}
          price={price}
          category={category}
          />
      </CardActionArea>
    </Card>
  );
}
