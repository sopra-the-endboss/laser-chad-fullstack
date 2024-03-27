import {useEffect, useState} from "react";
import MyShopMock from '../data/MyShopMock.json'
import {Stack} from "@mui/material";
import SellProduct from "../components/ProductManagement/SellProduct";
import CustomModal from "../components/ui/CustomModal";
const MyShop = () => {

    //verify that user is logged in has already been done by the routing guard
    const [shopData, setShopData] = useState([]);

    useEffect(() => {
        //myshop is similar to allProductDetailsMock without the technical details.
        setShopData(MyShopMock);
    }, []);

    return (
        <Stack spacing={2}>
            <CustomModal openModalText={"Add new Product"}>
                <SellProduct />
            </CustomModal>
        </Stack>
    );
}; export default MyShop;