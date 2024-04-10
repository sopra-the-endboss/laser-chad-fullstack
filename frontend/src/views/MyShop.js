import React, {useEffect, useState} from "react";
import MyShopMock from '../data/MyShopMock.json'
import {Box, Chip, Divider, List, ListItem, ListItemAvatar, ListItemText, Skeleton, Stack} from "@mui/material";
import SellProduct from "../components/ProductManagement/SellProduct";
import CustomModal from "../components/ui/CustomModal";
import DeleteIcon from "@mui/icons-material/Delete";
import Typography from "@mui/material/Typography";
import EditIcon from '@mui/icons-material/Edit';
import DeleteProductConfirmation from "../components/ui/DeleteConfirmation";

const MyShop = () => {

    //verify that user is logged in has already been done by the routing guard
    const [shopData, setShopData] = useState([]);

    const [loading, setLoading] = useState(true);

    useEffect(() => {
        //myshop is similar to allProductDetailsMock without the technical details.
        setShopData(MyShopMock);
        setLoading(false);
    }, []);

    const deleteProduct = async () => {
        console.log("Delete Product clicked");
    };

    return (
        <Stack spacing={2} sx={{width: "100%"}}>
            {/* move this to top right */}
            <CustomModal openModalText={"Add new Product"}>
                <SellProduct/>
            </CustomModal>
            {/* add list with all shop items */}
            <List sx={{width: '100%'}}>
                {loading ? (Array.from(new Array(5)).map(() => (
                    <div>
                        <ListItem
                            secondaryAction={
                                <Stack direction={"row"} sx={{alignItems: "center"}} spacing={2}>
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
                                </Stack>
                            }
                        >
                            <ListItemAvatar>
                                <Skeleton
                                    variant="rectangular"
                                    width={40}
                                    height={40}
                                />
                            </ListItemAvatar>
                            <ListItemText
                                primary={
                                    <>
                                        <Skeleton
                                            variant="text"
                                            width={280}
                                            height={40}
                                        />
                                    </>
                                }
                                secondary={
                                    <>
                                      <span style={{
                                          display: 'flex',
                                          flexDirection: 'row',
                                          gap: '16px'
                                      }}>
                                          <>
                                            <Skeleton
                                                variant="text"
                                                width={70}
                                                height={24}
                                            />
                                            <Skeleton
                                                variant="text"
                                                width={360}
                                                height={24}
                                            />
                                          </>
                                      </span>
                                    </>
                                }
                            />

                        </ListItem>
                        <Divider/>
                    </div>
                    )
                )
                ) : (
                    shopData?.map(product => (
                        <div key={product.product}>
                            <ListItem
                                secondaryAction={
                                    <Stack direction={"row"} sx={{alignItems: "center"}} spacing={2}>
                                        <Chip label={product?.brand} color="success"/>
                                        <Chip label={product?.category} color="success"/>
                                        <CustomModal icon={<EditIcon/>}>
                                            <SellProduct propData={product}/>
                                        </CustomModal>
                                        <CustomModal icon={<DeleteIcon/>}>
                                            <DeleteProductConfirmation itemToDelete={product.product}
                                                                       deleteFunction={deleteProduct}/>
                                        </CustomModal>
                                    </Stack>
                                }
                            >
                                <ListItemAvatar>
                                    <img src={product?.images[0]} alt={"product"} width={"40px"} height={"40px"}/>
                                </ListItemAvatar>
                                <ListItemText
                                    primary={
                                        <>
                                            {product.product}
                                        </>
                                    }
                                    secondary={
                                        <>
                                      <span style={{
                                          display: 'flex',
                                          flexDirection: 'row',
                                          gap: '16px'
                                      }}>
                                          <Typography
                                              sx={{display: 'inline'}}
                                              component="span"
                                              variant="body2"
                                              color="red"
                                          >
                                          {"$ " + product.price}
                                        </Typography>
                                        <Typography
                                            sx={{display: 'inline'}}
                                            component="span"
                                            variant="body2"
                                            color="text.primary"
                                        >
                                          {product.subheader}
                                        </Typography>
                                      </span>
                                        </>
                                    }
                                />

                            </ListItem>
                            <Divider/>
                        </div>

                    ))
                )}
            </List>
        </Stack>
    );
};
export default MyShop;
