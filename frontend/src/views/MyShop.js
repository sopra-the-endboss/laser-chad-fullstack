import React, { useEffect, useState } from "react";
import {
  Box,
  Chip,
  Divider,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  Skeleton,
  Stack,
} from "@mui/material";
import SellProduct from "../components/ProductManagement/SellProduct";
import CustomModal from "../components/ui/CustomModal";
import DeleteIcon from "@mui/icons-material/Delete";
import Typography from "@mui/material/Typography";
import EditIcon from "@mui/icons-material/Edit";
import DeleteConfirmationMyShop from "../components/ui/DeleteConfirmationMyShop";
import { useDeleteProduct, useFetchProductsSeller } from "../utils/apiCalls";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";

const MyShop = ({ setRefresh, refresh }) => {
  const navigate = useNavigate();

  // Get the current seller_id
  const auth = useSelector((state) => state.auth);
  const seller_id = auth.user.userId;

  // verify that user is logged in has already been done by the routing guard
  const [shopData, setShopData] = useState([]);

  const [loading, setLoading] = useState(true);
  const [productToDelete, setProductToDelete] = useState({});

  const deleteProductHook = useDeleteProduct(productToDelete.product_id);
  const fetchProductsSeller = useFetchProductsSeller(seller_id);

  const handleClickToProduct = (e, product_id) => {
    e.stopPropagation();
    if (product_id) {
      navigate("/product/" + product_id);
    }
  };

  const deleteProduct = async () => {
    deleteProductHook()
      .then(() => {
        console.log("Product deleted");
        setLoading(true);
        setRefresh((prevState) => !prevState);
        // pop product from list
      })
      .catch(() => {
        console.log("Error deleting product");
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchProductsSeller()
      .then((data) => {
        setShopData(data);
        setLoading(false);
      })
      .catch((error) => {});
    // adding fetchAllProducts into the dependencies leads to infinite calls. we dont do that here
    // eslint-disable-next-line
  }, [loading, refresh]);

  useEffect(() => {
    if (Object.keys(productToDelete).length > 0) {
      if (productToDelete.product_id !== undefined) {
        console.log("productToDelete to be deleted:", productToDelete);
        deleteProduct();
      }
    }
    // adding fetchAllProducts into the dependencies leads to infinite calls. we dont do that here
    // eslint-disable-next-line
  }, [productToDelete]);

  return (
    <Stack spacing={2} sx={{ width: "100%" }}>
      {/* move this to top right */}
      <CustomModal openModalText={"Add new Product"}>
        <SellProduct setLoadingMyShop={setLoading} setRefresh={setRefresh} />
      </CustomModal>
      {/* add list with all shop items */}
      <List sx={{ width: "100%" }}>
        {loading
          ? Array.from(new Array(5)).map(() => (
              <div>
                <ListItem
                  secondaryAction={
                    <Stack
                      direction={"row"}
                      sx={{ alignItems: "center" }}
                      spacing={2}
                    >
                      <Box display="flex" alignItems="center">
                        <Skeleton
                          variant="rectangular"
                          width={70}
                          height={20}
                          style={{ borderRadius: "20px" }} // Adjust borderRadius for more or less curvature
                        />
                        <Box mx={2} />
                        <Skeleton
                          variant="rectangular"
                          width={70}
                          height={20}
                          style={{ borderRadius: "20px" }} // Adjust borderRadius for more or less curvature
                        />
                      </Box>
                    </Stack>
                  }
                >
                  <ListItemAvatar>
                    <Skeleton variant="rectangular" width={40} height={40} />
                  </ListItemAvatar>
                  <ListItemText
                    primary={
                      <>
                        <Skeleton variant="text" width={280} height={40} />
                      </>
                    }
                    secondary={
                      <>
                        <span
                          style={{
                            display: "flex",
                            flexDirection: "row",
                            gap: "16px",
                          }}
                        >
                          <>
                            <Skeleton variant="text" width={70} height={24} />
                            <Skeleton variant="text" width={360} height={24} />
                          </>
                        </span>
                      </>
                    }
                  />
                </ListItem>
                <Divider />
              </div>
            ))
          : shopData?.map((product) => (
              <div key={product.product}>
                <ListItem
                  className={"list-item-hover"}
                  onClick={(e) => handleClickToProduct(e, product.product_id)}
                  secondaryAction={
                    <Stack
                      direction={"row"}
                      sx={{ alignItems: "center" }}
                      spacing={2}
                    >
                      {product.brand && (
                        <Chip label={product.brand} color="success" />
                      )}
                      {product.category && (
                        <Chip label={product.category} color="success" />
                      )}
                      <CustomModal icon={<EditIcon />}>
                        <SellProduct
                          propData={product}
                          setLoadingMyShop={setLoading}
                          setRefresh={setRefresh}
                        />
                      </CustomModal>
                      <CustomModal icon={<DeleteIcon />}>
                        <DeleteConfirmationMyShop
                          setProductToDelete={setProductToDelete}
                          productToDelete={{ ...product }}
                        />
                      </CustomModal>
                    </Stack>
                  }
                >
                  <ListItemAvatar>
                    <img
                      src={product?.images[0]}
                      width={"40px"}
                      height={"40px"}
                      alt={"product_image"}
                    />
                  </ListItemAvatar>
                  <ListItemText
                    primary={<>{product.product}</>}
                    secondary={
                      <>
                        <span
                          style={{
                            display: "flex",
                            flexDirection: "row",
                            gap: "16px",
                          }}
                        >
                          <Typography
                            sx={{ display: "inline" }}
                            component="span"
                            variant="body2"
                            color="red"
                          >
                            {"$ " + product.price}
                          </Typography>
                          <Typography
                            sx={{ display: "inline" }}
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
                <Divider />
              </div>
            ))}
      </List>
    </Stack>
  );
};
export default MyShop;
