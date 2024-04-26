import {
    Chip,
    Grid,
    Paper,
    Rating,
    TableBody,
    Table,
    Button,
    TableContainer, Stack, Skeleton, Box
} from "@mui/material";
import React, {useEffect, useState} from "react";
//import ProductDetails from "../data/ProductDetails.json"
//import ProductComments from "../data/ProductComments.json"
import {useParams} from "react-router-dom";
import CarouselComponent from "../components/ProductOverview/CarouselComponent";
import Typography from "@mui/material/Typography";
import {useDispatch, useSelector} from "react-redux";
import {addToCart} from "../reducers/slices/cartSlice";
import {ProductDetailRow} from "../components/ProductDetails/ProductRowDetails";
import {PRODUCT_COMMENT_ENDPOINT, PRODUCT_DETAIL_ENDPOINT} from "../utils/constants";
import { useSnackbar } from "notistack";
import {useFetchAllComments, useFetchProductDetails} from "../utils/apiCalls";

export const ProductDetail = ({details, previousStep, nextStep}) => {
    const [productDetails, setProductDetails] = useState({technical_details: {}, product: "", ...details});
    const [productComments, setProductComments] = useState([]);
    const {product_id} = useParams();
    const dispatch = useDispatch();
    const apigBaseUrl = useSelector(state => state.apigBaseUrl);

    const { enqueueSnackbar } = useSnackbar();

    const [loadingDetails, setLoadingDetails] = useState(true);
    const [loadingComments, setLoadingComments] = useState(true);

    const fetchComments = useFetchAllComments(details, product_id, setProductComments, setLoadingComments);
    const fetchDetails = useFetchProductDetails(details, product_id, setProductDetails, setLoadingDetails);

    useEffect(() => {
        fetchComments();
    }, [apigBaseUrl, product_id, details]);


    useEffect(() => {
        fetchDetails();
    }, [apigBaseUrl, product_id, details]);


    return (
        <Grid container>
            <Grid item xs={8} sx={{borderRight: 1, borderColor: "divider"}}>
                <CarouselComponent carouselData={productDetails} clickable={false} loading={loadingDetails}/>
            </Grid>
            <Grid item xs={4} sx={{paddingLeft: "16px"}}>
                <Grid container spacing={2}>
                    <Grid item xs={12}>
                        <Typography gutterBottom variant="h3" component="div" color="red" align="left">
                            {loadingDetails ? (
                                <Skeleton />
                            ) : (
                                <>${productDetails?.price}</>
                            )}
                        </Typography>
                        <Typography gutterBottom variant="h5" component="div" color="black" style={{fontWeight: 'bold'}}
                                    align="left">
                            {loadingDetails ? (
                                <Box display="flex" alignItems="center">
                                    {/* Skeleton for the first element */}
                                    <Skeleton variant="text" width={100} height={18} />

                                    {/* Add some space between the two skeletons */}
                                    <Box mx={2} /> {/* mx is margin horizontal */}

                                    {/* Skeleton for the second element */}
                                    <Skeleton variant="text" width={180} height={18} />
                                </Box>
                            ) : (
                                <>
                                    {productDetails?.brand} <Typography gutterBottom variant="h5" component="span" color="black"
                                                                        align="left">{productDetails?.product}</Typography>
                                </>
                            )}

                        </Typography>
                        <Typography gutterBottom variant="body2" color="text.secondary" align="left">

                            {loadingDetails ? (
                                <>
                                    <Skeleton variant="text" height={18}/>
                                    <Skeleton variant="text" width="40%" height={18}/>
                                </>
                            ) : (
                                productDetails?.subheader
                            )}
                        </Typography>

                        {/* Description */}
                        <Typography gutterBottom variant="body1" align="left">

                            {loadingDetails ? (
                                <>
                                    <Skeleton variant="text" width="80%" height={18} />
                                    <Skeleton variant="text" width="90%" height={18} />
                                </>
                            ) : (
                                productDetails?.description
                            )}
                        </Typography>

                        {/* Availability */}
                        {loadingDetails ? (
                                <Box display="flex" alignItems="center">
                                    <Skeleton
                                        variant="rectangular"
                                        width={70}
                                        height={20}
                                        style={{ borderRadius: '20px' }} // Adjust borderRadius for more or less curvature
                                    />
                                    <Box mx={2} />
                                    <Skeleton
                                        variant="rectangular"
                                        width={70}
                                        height={20}
                                        style={{ borderRadius: '20px' }} // Adjust borderRadius for more or less curvature
                                    />
                                </Box>
                            ) :
                            (<>
                                <Chip label={productDetails?.availability} color="success"/>
                                <Chip label={"Warranty: " + productDetails?.warranty} color="primary"/>
                            </>)
                        }
                    </Grid>
                    <Grid item xs={12}>
                        {loadingDetails ? (
                            <Skeleton variant="text" width="70%" height={18} />
                        ) : (
                            <Rating
                                name="user-rating"
                                value={productComments?.reviews?.reduce((acc, review) => acc + review.rating, 0) / productComments?.reviews?.length}
                                readOnly
                            />
                        )}
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
                            disabled={details || loadingDetails}
                        >
                            Add to Cart
                        </Button>
                    </Grid>
                    <Grid item xs={12}>
                        <Button variant="outlined" color="primary" disabled={loadingDetails}>Pin Product</Button>
                    </Grid>
                </Grid>
                <Grid item xs={12}>
                    <Typography variant="h6" align="left">Comments</Typography>
                    {loadingComments ? (
                        <>
                            <Skeleton variant="text" width="40%" height={18} />
                            <Skeleton variant={"rectangle"} height={80} />
                        </>

                    ) : (
                        productComments?.reviews?.map((review, i) => (
                            <Paper key={i} elevation={1} sx={{p: 2, mb: 2}}>
                                <Typography variant="subtitle2">{loadingDetails ? <Skeleton width={30}/> : review?.user}</Typography>
                                <Typography variant="body2" color="text.secondary">{loadingDetails ? <Skeleton /> : review?.comment}</Typography>
                            </Paper>
                        ))
                    )}
                </Grid>
            </Grid>
            <Grid item xs={12} sx={{borderTop: 1, borderColor: "divider", paddingBottom: "16px", paddingTop: "16px"}}>
                <Grid item xs={12}>
                    <Typography variant="h6" align="left">Specs</Typography>
                    <TableContainer component={Paper}>
                        <Table aria-label="collapsible table">
                            <TableBody>
                                {loadingDetails ? <Skeleton variant={"rectangle"} height={300} /> :
                                    Object.entries(productDetails?.technical_details || {}).map(([key, value], index) => (
                                        <ProductDetailRow key={index} detailKey={key} detailValue={value}/>
                                    ))}
                            </TableBody>
                        </Table>
                    </TableContainer>
                </Grid>
            </Grid>
            {
                details && (
                    <Stack spacing={2} direction="row" justifyContent="center" // Center the items horizontally
                           alignItems="center" // Align items vertically in the center (if needed)
                           sx={{
                               width: '100%',
                               display: 'flex'
                           }} // Ensure the Stack takes the full width and displays as flex
                    >
                        <Button disabled={loadingDetails} variant="outlined" component="label" fullWidth onClick={previousStep}>Previous</Button>
                        <Button disabled={loadingDetails} variant="contained" component="label" fullWidth onClick={nextStep}>Post</Button>
                    </Stack>
                )
            }
        </Grid>
    )
};
