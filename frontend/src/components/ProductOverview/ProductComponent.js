import * as React from "react";
import Card from "@mui/material/Card";
import CardMedia from "@mui/material/CardMedia";
import CardContent from "@mui/material/CardContent";
import {CardContentComponent} from "./CardContentComponent";
import {IconButton} from "@mui/material";
import AddShoppingCartIcon from "@mui/icons-material/AddShoppingCart";
import {useDispatch} from "react-redux";
import {addToCart} from "../../reducers/slices/cartSlice";

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
            sx={{ height: 310}}
            data-testid="product-card"
        >
            {/* Separated the image into its own CardMedia component */}
            <CardMedia
                component="img"
                image={img}
                alt={title}
                sx={{height: 160, cursor: "pointer"}}
                onClick={() => onCardInteract(true, product_id)}
            />

            <CardContent>
                <CardContentComponent
                    formatted_text={formatted_text}
                    title={title}
                    description={description}
                    price={price}
                    category={category}
                    brand={brand}
                />
            </CardContent>

            <IconButton
                sx={{
                    position: "absolute",
                    marginTop: "-70px",
                    marginLeft: "100px"
                }}
                size="small"
                color="primary"
                onClick={(event) => {
                    event.stopPropagation();
                    dispatch(addToCart({product_id, brand, title, price, img}));
                }}
            >
                <AddShoppingCartIcon fontSize="small"/>
            </IconButton>
        </Card>
    );
}
