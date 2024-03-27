import {useEffect, useState} from "react";
import MyShopMock from '../data/MyShopMock.json'
import {Stack} from "@mui/material";
const MyShop = () => {

    //verify that user is logged in has already been done by the routing guard
    const [shopData, setShopData] = useState([]);

    useEffect(() => {
        //myshop is similar to allProductDetailsMock without the technical details.
        setShopData(MyShopMock);
    }, []);

    return (
        <Stack spacing={2}>

        </Stack>
    );
}; export default MyShop;