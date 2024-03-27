import {
    Chip,
    Grid,
    Paper,
    Rating,
    TableBody,
    Table,
    Button,
    TableContainer
} from "@mui/material";
import React, {useEffect, useState} from "react";
import ProductDetails from "../data/ProductDetails.json"
import ProductComments from "../data/ProductComments.json"
import {useParams} from "react-router-dom";
import CarouselComponent from "../components/ProductOverview/CarouselComponent";
import Typography from "@mui/material/Typography";
import {ProductDetailRow} from "../components/ProductDetails/ProductRowDetails";



export const ProductDetail = ({details}) => {
    console.log(details)
    const [productDetails, setProductDetails] = useState({technical_details: {}, ...details});
    const [productComments, setProductComments] = useState([]);
    const {product_id} = useParams();

    useEffect(() => {
        //TODO: fetch Product deatails for this stuff from backend
        // I expect an object, that's why the [0]
        if (!details)
            setProductDetails(ProductDetails.filter(productDetail => productDetail.product_id === parseInt(product_id))[0]);
    }, [product_id, details]);

    useEffect(() => {
        //TODO: fetch Product deatails for this stuff from backend
        //ProductComments
        if (!details)
            setProductComments(ProductComments.filter(productComment => productComment.product_id === parseInt(product_id))[0]);
    }, [product_id, details]);

    return (
        <Grid container xs={12}>
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
                                                                align="left">{productDetails['product']}</Typography>
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
                        <Button variant="contained" color="primary">Buy Now</Button>
                    </Grid>
                    <Grid item xs={12}>
                        <Button variant="outlined" color="primary">Pin Product</Button>
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
            <Grid item xs={12} sx={{ borderTop: 1, borderColor: "divider", padding: "16px"}}>
                <Grid item xs={12}>
                    <Typography variant="h6" align="left">Specs</Typography>
                    <TableContainer component={Paper}>
                        <Table aria-label="collapsible table">
                            <TableBody>
                                {Object.entries(productDetails.technical_details).map(([key, value], index) => (
                                    <ProductDetailRow key={index} detailKey={key} detailValue={value} />
                                ))}
                            </TableBody>
                        </Table>
                    </TableContainer>
                </Grid>
            </Grid>
        </Grid>
    )
};
