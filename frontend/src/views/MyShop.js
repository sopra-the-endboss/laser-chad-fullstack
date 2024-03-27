import React, {useEffect, useState} from "react";
import MyShopMock from '../data/MyShopMock.json'
import {Badge, Chip, Divider, List, ListItem, ListItemAvatar, ListItemText, Stack} from "@mui/material";
import SellProduct from "../components/ProductManagement/SellProduct";
import CustomModal from "../components/ui/CustomModal";
import DeleteIcon from "@mui/icons-material/Delete";
import Typography from "@mui/material/Typography";
const MyShop = () => {

    //verify that user is logged in has already been done by the routing guard
    const [shopData, setShopData] = useState([]);

    useEffect(() => {
        //myshop is similar to allProductDetailsMock without the technical details.
        setShopData(MyShopMock);
    }, []);

    console.log(shopData)

    return (
        <Stack spacing={2} sx={{width: "100%"}}>
            {/* move this to top right */}
            <CustomModal openModalText={"Add new Product"}>
                <SellProduct />
            </CustomModal>
            {/* add list with all shop items */}
            <List sx={{ width: '100%' }}>
                {shopData?.map(product => (
                    <>
                        <ListItem
                            secondaryAction={
                                <Stack direction={"row"} sx={{alignItems: "center"}} spacing={2}>
                                    <Chip label={product?.brand} color="success"/>
                                    <Chip label={product?.category} color="success"/>
                                    <DeleteIcon />
                                    <DeleteIcon />
                                </Stack>
                            }
                        >
                            <ListItemAvatar>
                                <img src={product?.images[0]} alt={"product image"} width={"40px"} height={"40px"}/>
                            </ListItemAvatar>
                            <ListItemText
                                primary={
                                    <>
                                        {product.product}
                                    </>
                                }
                                secondary={
                                    <Stack direction={"row"} spacing={2}>
                                        <Typography
                                            sx={{ display: 'inline' }}
                                            component="span"
                                            variant="body2"
                                            color="red"
                                        >
                                            {"$ " + product.price}
                                        </Typography>
                                        <Typography
                                            sx={{ display: 'inline' }}
                                            component="span"
                                            variant="body2"
                                            color="text.primary"
                                        >
                                            {product.subheader}
                                        </Typography>
                                    </Stack>
                                }
                            />

                        </ListItem>
                        <Divider />
                    </>

                ))}
            </List>
        </Stack>
    );
}; export default MyShop;