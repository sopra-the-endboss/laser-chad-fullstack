import {
    Badge,
    Chip,
    Grid,
    Paper,
    Rating,
    TableBody,
    TableCell,
    TableRow,
    Table,
    Collapse,
    Button,
    Box, TableHead, TableContainer, IconButton
} from "@mui/material";
import React, {useEffect, useState} from "react";
import ProductDetails from "../data/ProductDetails.json"
import ProductComments from "../data/ProductComments.json"
import {useParams} from "react-router-dom";
import CarouselComponent from "../components/ProductOverview/CarouselComponent";
import Typography from "@mui/material/Typography";
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import KeyboardArrowUpIcon from '@mui/icons-material/KeyboardArrowUp';

function ProductDetailRow({ detailKey, detailValue }) {
    const [open, setOpen] = useState(false);
    const isPortsDetail = detailKey === 'ports';

    return (
        <React.Fragment>
            <TableRow sx={{ '& > *': { borderBottom: 'unset' } }}>
                <TableCell>
                    {isPortsDetail && (
                        <IconButton
                            aria-label="expand row"
                            size="small"
                            onClick={() => setOpen(!open)}
                        >
                            {open ? <KeyboardArrowUpIcon /> : <KeyboardArrowDownIcon />}
                        </IconButton>
                    )}
                </TableCell>
                <TableCell component="th" scope="row">{detailKey}</TableCell>
                <TableCell align="right">{!isPortsDetail && detailValue.toString()}</TableCell>
            </TableRow>
            {isPortsDetail && (
                <TableRow>
                    <TableCell style={{ paddingBottom: 0, paddingTop: 0 }} colSpan={6}>
                        <Collapse in={open} timeout="auto" unmountOnExit>
                            <Box sx={{ margin: 1 }}>
                                <Typography variant="h6" gutterBottom component="div">
                                    Ports Details
                                </Typography>
                                <Table size="small" aria-label="purchases">
                                    <TableHead>
                                        <TableRow>
                                            <TableCell>Port Type</TableCell>
                                            <TableCell align="right">Count</TableCell>
                                        </TableRow>
                                    </TableHead>
                                    <TableBody>
                                        {Object.entries(detailValue).map(([port, count]) => (
                                            <TableRow key={port}>
                                                <TableCell component="th" scope="row">
                                                    {port}
                                                </TableCell>
                                                <TableCell align="right">{count}</TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            </Box>
                        </Collapse>
                    </TableCell>
                </TableRow>
            )}
        </React.Fragment>
    );
}

export const ProductDetail = ({details}) => {
    const [open, setOpen] = useState(false);
    const [productDetails, setProductDetails] = useState({...details, technical_details: {}});
    const [productComments, setProductComments] = useState([]);
    const {product_id} = useParams();

    useEffect(() => {
        //TODO: fetch Product deatails for this stuff from backend
        // I expect an object, that's why the [0]
        if (!details)
            setProductDetails(ProductDetails.filter(productDetail => productDetail.product_id === parseInt(product_id))[0]);
    }, [product_id]);

    useEffect(() => {
        //TODO: fetch Product deatails for this stuff from backend
        //ProductComments
        if (!details)
            setProductComments(ProductComments.filter(productComment => productComment.product_id === parseInt(product_id))[0]);
    }, [product_id]);

    return (
        <>
            <Grid item xs={8}>
                <CarouselComponent carouselData={productDetails} clickable={false}/>
            </Grid>
            <Grid item xs={4}>
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
                    {/* Warranty as badge */}
                    <Badge badgeContent={productDetails?.warranty} color="primary">
                        <Typography variant="h6" align="left">Warranty</Typography>
                    </Badge>
                </Grid>
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
        </>
    )
};
