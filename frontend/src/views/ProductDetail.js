import {Container, Grid} from "@mui/material";
import React, {useEffect, useState} from "react";
import ProductDetails from "../data/ProductDetails.json"
import ProductComments from "../data/ProductComments.json"
import {useParams} from "react-router-dom";
import CarouselComponent from "../components/ProductOverview/CarouselComponent";
import ProductComponent from "../components/ProductOverview/ProductComponent";
import sport from "../assets/sports.jpg";
import Typography from "@mui/material/Typography";

export const ProductDetail = () => {

    const [productDetails, setProductDetails] = useState({});
    const {product_id} = useParams();

    useEffect(() => {
        //TODO: fetch Product deatails for this stuff from backend
        // I expect an object, that's why the [0]
        setProductDetails(ProductDetails.filter(productDetail => productDetail.product_id == product_id)[0]);
    }, [ProductDetails]);

    useEffect(() => {
        //TODO: fetch Product deatails for this stuff from backend
        //ProductComments
    }, [ProductComments]);

    return (
        <>
            <Grid item xs={8}>
                <CarouselComponent carouselData={productDetails} clickable={false}/>
            </Grid>
            <Grid item xs={4}>
                <Grid container spacing={2}>
                    <Grid item xs={12}>
                        <Typography gutterBottom variant="h3" component="div" color={"red"} align={"left"}>
                            {productDetails.price}
                        </Typography>
                        <Typography gutterBottom variant="h5" component="div" color={"black"} style={{fontWeight: "bold"}} align={"left"}>
                            {productDetails.brand} <Typography gutterBottom variant="h5" component="span" color={"black"} align={"left"}>{productDetails.product}</Typography>
                        </Typography>
                        <Typography gutterBottom variant="body2" color="text.secondary" align={"left"}>
                            {productDetails?.subheader}
                        </Typography>

                    </Grid>

                    <Grid item xs={12}>


                    </Grid>
                </Grid>
            </Grid>
            {/* GRID */}
            {/* 2/3 image carousel view */}
            {/* 1/3 price */}
        </>
    )
};
