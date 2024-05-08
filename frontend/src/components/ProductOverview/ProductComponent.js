import * as React from "react";
import Card from "@mui/material/Card";
import CardMedia from "@mui/material/CardMedia";
import CardContent from "@mui/material/CardContent";
import {CardContentComponent} from "./CardContentComponent";
import {Chip, IconButton, Skeleton} from "@mui/material";
import AddShoppingCartIcon from "@mui/icons-material/AddShoppingCart";
import {useDispatch} from "react-redux";
import {addToCart} from "../../reducers/slices/cartSlice";

export default function ProductComponent({

        // Those are the props from the product object, they are passed to the addToCart function
        product_id,
        brand,
        product,
        images,
        description,
        formatted_text,
        price,
        category,

        onCardInteract,
        loading
    }) {

    const dispatch = useDispatch();

    return (<Card
        sx={{height: 310, position: "relative"}}
        data-testid="product-card"
    >
        {formatted_text && (<span style={{
            position: 'absolute', top: 8, left: 8,
        }}>
                  <Chip
                      label={formatted_text}
                      variant="filled"
                      color={"error"}
                      size={"small"}
                  />
            </span>)}

        {loading ? (
            <Skeleton variant="rectangular" height={160}/>
        ) : (
            <CardMedia
                component="img"
                image={images}
                alt={product}
                sx={{height: 160, cursor: "pointer"}}
                onClick={() => onCardInteract(true, product_id)}
            />)
        }

        <CardContent>
            <CardContentComponent
                formatted_text={formatted_text}
                product_title={product}
                description={description}
                price={price}
                category={category}
                brand={brand}
                loading={loading}
            />
        </CardContent>

        <IconButton
            sx={{
                position: 'absolute', bottom: 8, right: 8,
            }}
            size="small"
            color="primary"
            disabled={loading}
            onClick={(event) => {
                event.stopPropagation();
                const productToCart = {product_id,brand,product,images,description,formatted_text,price,category,}
                dispatch(addToCart(productToCart));
                console.log("Added to cart: ", productToCart);
            }}
        >
            <AddShoppingCartIcon fontSize="small"/>
        </IconButton>
    </Card>)
        ;
}
