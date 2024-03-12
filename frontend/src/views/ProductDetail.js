import {Grid, Paper, Rating} from "@mui/material";
import React, {useEffect, useState} from "react";
import ProductDetails from "../data/ProductDetails.json"
import ProductComments from "../data/ProductComments.json"
import {useParams} from "react-router-dom";
import CarouselComponent from "../components/ProductOverview/CarouselComponent";
import Typography from "@mui/material/Typography";
import Button from "@mui/material/Button";

export const ProductDetail = () => {

    const [productDetails, setProductDetails] = useState({technical_details: {}});
    const [productComments, setProductComments] = useState([]);
    const {product_id} = useParams();

    useEffect(() => {
        //TODO: fetch Product deatails for this stuff from backend
        // I expect an object, that's why the [0]
        setProductDetails(ProductDetails.filter(productDetail => productDetail.product_id === parseInt(product_id))[0]);
    }, [ProductDetails]);

    useEffect(() => {
        //TODO: fetch Product deatails for this stuff from backend
        //ProductComments
        setProductComments(ProductComments.filter(productComment => productComment.product_id === parseInt(product_id))[0]);
    }, [ProductComments]);

    console.log(productDetails);
    console.log(productComments);

    return (
        <>
            <Grid item xs={8}>
                <CarouselComponent carouselData={productDetails} clickable={false}/>
            </Grid>
            <Grid item xs={4}>
                <Grid container spacing={2}>
                    <Grid item xs={12}>
                        <Typography gutterBottom variant="h3" component="div" color="red" align="left">
                            ${productDetails.price}
                        </Typography>
                        <Typography gutterBottom variant="h5" component="div" color="black" style={{ fontWeight: 'bold' }} align="left">
                            {productDetails.brand} <Typography gutterBottom variant="h5" component="span" color="black" align="left">{productDetails.product}</Typography>
                        </Typography>
                        <Typography gutterBottom variant="body2" color="text.secondary" align="left">
                            {productDetails?.subheader}
                        </Typography>
                    </Grid>

                    <Grid item xs={12}>
                        <Rating
                            name="user-rating"
                            value={productComments?.reviews?.reduce((acc, review) => acc + review.rating, 0) / productComments?.reviews?.length}
                            readOnly
                        />
                    </Grid>

                    <Grid item xs={12}>
                        <Button variant="contained" color="primary">Buy Now</Button>
                    </Grid>

                    <Grid item xs={12}>
                        <Button variant="outlined" color="primary">Pin Product</Button>
                    </Grid>
                </Grid>
                <Grid item xs={12}>
                    <Typography variant="h6" align="left">Specs</Typography>
                    <Paper elevation={0} variant="outlined" square sx={{ p: 2 }}>
                        {/* Display each technical detail */}
                        {Object.entries(productDetails?.technical_details).map(([key, value], i) => (
                            <Typography key={i} gutterBottom variant="body2" color="text.secondary" align="left">
                                {`${key}: ${value}`}
                            </Typography>
                        ))}
                    </Paper>
                </Grid>

                <Grid item xs={12}>
                    <Typography variant="h6" align="left">Comments</Typography>
                    {productComments?.reviews?.map((review, i) => (
                        <Paper key={i} elevation={1} sx={{ p: 2, mb: 2 }}>
                            <Typography variant="subtitle2">{review?.user}</Typography>
                            <Typography variant="body2" color="text.secondary">{review?.comment}</Typography>
                        </Paper>
                    ))}
                </Grid>
            </Grid>
        </>
    )
};
