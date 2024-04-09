import {
    Chip,
    Grid,
    Paper,
    Rating,
    TableBody,
    Table,
    Button,
    TableContainer, Stack
} from "@mui/material";
import React, {useEffect, useState} from "react";
import ProductDetails from "../data/ProductDetails.json"
import ProductComments from "../data/ProductComments.json"
import {useParams} from "react-router-dom";
import CarouselComponent from "../components/ProductOverview/CarouselComponent";
import Typography from "@mui/material/Typography";
import { useDispatch } from "react-redux";
import { addToCart } from "../reducers/slices/cartSlice";
import {ProductDetailRow} from "../components/ProductDetails/ProductRowDetails";



export const ProductDetail = ({details, previousStep, nextStep}) => {
    console.log(details)
    const [productDetails, setProductDetails] = useState({technical_details: {}, product: "", ...details});
    const [productComments, setProductComments] = useState([]);
    const {product_id} = useParams();
    const dispatch = useDispatch();

  useEffect(() => {
    //TODO: fetch Product deatails for this stuff from backend
    // I expect an object, that's why the [0]
    if (!details)
        setProductDetails(
            ProductDetails.filter(
                (productDetail) => productDetail.product_id === parseInt(product_id)
            )[0]
        );

  }, [product_id, details]);
    useEffect(() => {
        //TODO: fetch Product deatails for this stuff from backend
        // I expect an object, that's why the [0]
        if (!details){
            console.log(details);
            setProductDetails(ProductDetails.filter(productDetail => productDetail.product_id === parseInt(product_id))[0]);
        }
    }, [product_id, details]);

  useEffect(() => {
    //TODO: fetch Product deatails for this stuff from backend
    //ProductComments
      if(!details)
        setProductComments(
          ProductComments.filter(
            (productComment) => productComment.product_id === parseInt(product_id)
          )[0]
        );
  }, [product_id, details]);

    return (
        <Grid container>
            <Grid item xs={8} sx={{ borderRight: 1, borderColor: "divider" }} >
                <CarouselComponent carouselData={productDetails} clickable={false}/>
            </Grid>
            <Grid item xs={4} sx={{ paddingLeft: "16px"}}>
                <Grid container spacing={2}>
                    <Grid item xs={12}>
                        <Typography gutterBottom variant="h3" component="div" color="red" align="left">
                            ${productDetails?.price}
                        </Typography>
                        <Typography gutterBottom variant="h5" component="div" color="black" style={{fontWeight: 'bold'}}
                                    align="left">
                            {productDetails?.brand} <Typography gutterBottom variant="h5" component="span" color="black"
                                                                align="left">{productDetails?.product}</Typography>
                        </Typography>
                        <Typography gutterBottom variant="body2" color="text.secondary" align="left">
                            {productDetails?.subheader}
                        </Typography>
                        {/* Description */}
                        <Typography gutterBottom variant="body1" align="left">
                            {productDetails?.description}
                        </Typography>
                        {/* Availability */}
                        <Chip label={productDetails?.availability} color="success"/>
                        <Chip label={"Warranty: " + productDetails?.warranty} color="primary"/>
                    </Grid>
                    <Grid item xs={12}>
                        <Rating
                            name="user-rating"
                            value={productComments?.reviews?.reduce((acc, review) => acc + review.rating, 0) / productComments?.reviews?.length}
                            readOnly
                        />
                    </Grid>
                    <Grid item xs={12}>
                        <Button
                            variant="contained"
                            color="primary"
                            onClick={() =>
                                dispatch(
                                    addToCart({
                                        ...productDetails,
                                        img: productDetails?.images[0],
                                    })
                                ) && console.log("Added to cart: ", productDetails)
                            }
                            disabled={details}
                        >
                            Add to Cart
                        </Button>
                    </Grid>
                    <Grid item xs={12}>
                        <Button variant="outlined" color="primary" disabled={details}>Pin Product</Button>
                    </Grid>
                </Grid>
                <Grid item xs={12}>
                    <Typography variant="h6" align="left">Comments</Typography>
                    {productComments?.reviews?.map((review, i) => (
                        <Paper key={i} elevation={1} sx={{p: 2, mb: 2}}>
                            <Typography variant="subtitle2">{review?.user}</Typography>
                            <Typography variant="body2" color="text.secondary">{review?.comment}</Typography>
                        </Paper>
                    ))}
                </Grid>
            </Grid>
            <Grid item xs={12} sx={{ borderTop: 1, borderColor: "divider", paddingBottom: "16px", paddingTop: "16px"}}>
                <Grid item xs={12}>
                    <Typography variant="h6" align="left">Specs</Typography>
                    <TableContainer component={Paper}>
                        <Table aria-label="collapsible table">
                            <TableBody>
                                {Object.entries(productDetails?.technical_details || {}).map(([key, value], index) => (
                                    <ProductDetailRow key={index} detailKey={key} detailValue={value} />
                                ))}
                            </TableBody>
                        </Table>
                    </TableContainer>
                </Grid>
            </Grid>
            {
                details && (
                    <Stack spacing={2} direction="row"       justifyContent="center" // Center the items horizontally
                           alignItems="center" // Align items vertically in the center (if needed)
                           sx={{ width: '100%', display: 'flex' }} // Ensure the Stack takes the full width and displays as flex
                    >
                        <Button variant="outlined" component="label" fullWidth onClick={previousStep}>Previous</Button>
                        <Button variant="contained" component="label" fullWidth onClick={nextStep}>Post</Button>
                    </Stack>
                )
            }
        </Grid>
    )
};
