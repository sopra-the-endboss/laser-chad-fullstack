import * as React from "react";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import CardMedia from "@mui/material/CardMedia";
import Typography from "@mui/material/Typography";
import { CardActionArea } from "@mui/material";

export default function ProductCategories({ title, img, description, formatted_text, price}) {
  return (
    <Card sx={{ height: 310}}>
      <CardActionArea>
        <CardMedia
          component="img"
          height="140"
          image={img}
          alt="green iguana"
        />
        <CardContent sx={{ height: 310}}>
          <Typography gutterBottom variant="h5" component="div">
            <span style={{color: "red", textDecoration: "underline"}}>{formatted_text?.toUpperCase()}</span> {title}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {description ?? "Lorem ipsum dolor sit amet consectetur adipisicing elit. Quisquam, quod."}
          </Typography>
        </CardContent>
      </CardActionArea>
    </Card>
  );
}
