import {Container} from "@mui/material";
import React, {useEffect, useState} from "react";
import ProductDetails from "../data/ProductDetails.json"
import ProductComments from "../data/ProductComments.json"
import {useParams} from "react-router-dom";

export const ProductDetail = () => {

    const [productDetails, setProductDetails] = useState({});
    const {product_id} = useParams();

    useEffect(() => {
        //TODO: fetch Product deatails for this stuff from backend
        // I expect an object, that's why the [0]
        setProductDetails(ProductDetails.filter(productDetail => productDetail.id == product_id)[0]);
    }, [ProductDetails]);

    useEffect(() => {
        //TODO: fetch Product deatails for this stuff from backend
        //ProductComments
    }, [ProductComments]);

    return (
        <>
            {/* GRID */}
            {/* 2/3 image carousel view */}
            {/* 1/3 price */}
        </>
    )
};
