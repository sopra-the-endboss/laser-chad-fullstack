import { Box, List, ListItem, Paper, Skeleton, Stack } from "@mui/material";
import Typography from "@mui/material/Typography";
import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";

import { useSelector } from "react-redux";
import DeleteIcon from "@mui/icons-material/Delete";
import DeleteConfirmation from "../ui/DeleteConfirmation";
import CustomModal from "../ui/CustomModal";
import AddIcon from "@mui/icons-material/Add";
import { AddComment } from "../ui/AddComment";
import { useDeleteComment } from "../../utils/apiCalls";

export const CommentaryComponent = ({
  productComments,
  setProductComments,
  loadingComments,
  setLoadingComments,
  productDetails, // TODO: Use this to check if the user is the seller of the product
  loadingDetails,
}) => {
  const auth = useSelector((state) => state.auth);
  const user = auth.user;
  const userId = auth.user.userId;
  const isLoggedIn = auth.isLoggedIn;
  const isSeller = user ? user?.role === "Seller" : false;
  const { product_id } = useParams();

  const [itemToDelete, setItemToDelete] = useState({});
  const deleteCommentHook = useDeleteComment(
    itemToDelete,
    setLoadingComments,
    product_id,
    setProductComments
  );

  const deleteComment = async () => {
    deleteCommentHook();
    setLoadingComments(true);
  };

  useEffect(() => {
    if (Object.keys(itemToDelete).length > 0) {
      console.log("itemToDelete to be deleted:", itemToDelete);
      deleteComment();
    }
    // adding fetchAllProducts into the dependencies leads to infinite calls. we dont do that here
    // eslint-disable-next-line
  }, [itemToDelete]);

  if (loadingComments) {
    return (
      <>
        <Skeleton variant={"rectangle"} height={130} />
      </>
    );
  } else {
    return (
      <>
        <Paper elevation={1} sx={{ p: 2, mb: 2 }}>
          <Box
            display="flex"
            justifyContent="space-between"
            alignItems="center"
          >
            <Typography variant="h6">Reviews</Typography>
            {
              // Every logged in user can add a comment, not tied to sales history
              isLoggedIn && (
                <CustomModal icon={<AddIcon />}>
                  <AddComment
                    setLoadingComments={setLoadingComments}
                    user={user}
                    setProductComments={setProductComments}
                    productComments={productComments}
                  />
                </CustomModal>
              )
            }
          </Box>
          <List
            sx={{
              width: "100%",
              maxWidth: 360,
              bgcolor: "background.paper",
              height: 180,
              overflow: "auto",
            }}
          >
            {productComments?.reviews?.map((review, i) => (
              <ListItem key={i}>
                <Box>
                  <Stack
                    direction={"row"}
                    sx={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "baseline",
                    }}
                  >
                    <Typography variant="subtitle1" component="span">
                      {review?.user}
                    </Typography>
                    <Typography variant="caption" sx={{ ml: 1, color: "red" }}>
                      {review?.rating}
                    </Typography>
                    <Typography variant="caption" sx={{ ml: 1 }}>
                      {review?.date}
                    </Typography>
                    {
                      // To delete a comment, therea are two options
                      // 1. The user must be a seller and and the seller_id must match the productss seller_id
                      // 2. The user must be the user that wrote the comment
                      // option 1
                      ((isSeller &&
                        "seller_id" in productDetails &&
                        productDetails.seller_id !== undefined &&
                        productDetails.seller_id === userId) ||
                        // option 2
                        (isLoggedIn &&
                          "user_id" in review &&
                          review.user_id === userId)) && (
                        <Typography variant="caption" sx={{ ml: 1 }}>
                          <CustomModal
                            icon={<DeleteIcon style={{ height: "18px" }} />}
                          >
                            <DeleteConfirmation
                              setItemToDelete={setItemToDelete}
                              itemToDelete={{ ...review }}
                            />
                          </CustomModal>
                        </Typography>
                      )
                    }
                  </Stack>
                  <Typography variant="body2" color="text.secondary">
                    {loadingDetails ? <Skeleton /> : review?.review}
                  </Typography>
                </Box>
              </ListItem>
            ))}
          </List>
        </Paper>
      </>
    );
  }
};
