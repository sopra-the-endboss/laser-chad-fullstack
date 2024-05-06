import {Box, List, ListItem, Paper, Skeleton, Stack} from "@mui/material";
import Typography from "@mui/material/Typography";
import React, {useState} from "react";

import {useSelector} from "react-redux";
import DeleteIcon from "@mui/icons-material/Delete";
import DeleteConfirmation from "../ui/DeleteConfirmation";
import CustomModal from "../ui/CustomModal";
import AddIcon from "@mui/icons-material/Add";
import {AddComment} from "../ui/AddComment";
import {useDeleteComment} from "../../utils/apiCalls";


export const CommentaryComponent = ({setLoading, loadingComments, loadingDetails, productComments, setProductComments}) => {
    const auth = useSelector((state) => state.auth);
    const user = auth.user;
    const isLoggedIn = auth.isLoggedIn;
    const isSeller = user ? user?.role === "Seller" : false;

    const [itemToDelete, setItemToDelete] = useState(0);
    const deleteCommentHook = useDeleteComment(itemToDelete, setLoading);

    const deleteComment = async () => {
        setLoading(true);
        deleteCommentHook();
    };

    if (loadingComments) {
        return (
            <>
                <Skeleton variant={"rectangle"} height={130}/>
            </>
        );
    } else {

        return (
            <>
                <Paper elevation={1} sx={{ p: 2, mb: 2 }}>
                    <Box display="flex" justifyContent="space-between" alignItems="center">
                        <Typography variant="h6">Reviews</Typography>
                        {isLoggedIn && (
                            <CustomModal icon={<AddIcon />}>
                                <AddComment
                                    setLoading={setLoading}
                                    user={user}
                                    setProductComments={setProductComments}
                                    productComments={productComments}
                                />
                            </CustomModal>
                        )}
                    </Box>
                    <List sx={{ width: '100%', maxWidth: 360, bgcolor: 'background.paper', height: 180, overflow: 'auto' }}>
                        {productComments?.reviews?.map((review, i) => (
                                <ListItem key={i}>
                                    <Box>
                                        <Stack direction={"row"} sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
                                            <Typography variant="subtitle1" component="span">
                                                {/* {loadingDetails ? <Skeleton width={100}/> : review?.user} */}
                                                {review?.user}
                                            </Typography>
                                            <Typography variant="caption" sx={{ ml: 1, color: "red" }}>
                                                {review?.rating}
                                            </Typography>
                                            <Typography variant="caption" sx={{ ml: 1 }}>
                                                {review?.date}
                                            </Typography>
                                            {
                                                isSeller && (
                                                    <Typography variant="caption" sx={{ ml: 1 }}>
                                                        <CustomModal icon={<DeleteIcon style={{height: '18px'}}/>}>
                                                            <DeleteConfirmation
                                                                setItemToDelete={setItemToDelete}
                                                                idToDelete={review.review_id}
                                                                deleteFunction={deleteComment}
                                                                itemToDelete={review.review} />
                                                        </CustomModal>
                                                    </Typography>
                                                )
                                            }
                                        </Stack>
                                        <Typography variant="body2" color="text.secondary">
                                            {loadingDetails ? <Skeleton/> : review?.review}
                                        </Typography>
                                    </Box>
                                </ListItem>
                            ))
                        }
                    </List>
                </Paper>
            </>
        );
    }

};
