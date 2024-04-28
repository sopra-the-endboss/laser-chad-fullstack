import React, {useContext, useState} from "react";
import {Button, Grid, Rating, Stack, TextField} from "@mui/material";
import ModalContext from "../../context/ModalContext";
import Typography from "@mui/material/Typography";
import {usePostComment} from "../../utils/apiCalls";
import {useParams} from "react-router-dom";

export const AddComment = ({user, setProductComments, setLoading, productComments}) => {

    const [rating, setRating] = useState(0);
    const [newComment, setNewComment] = useState('');
    const [submissionElement, setSubmissionElement] = useState({});
    const {handleClose} = useContext(ModalContext);
    const {product_id} = useParams();
    const postComment = usePostComment(setLoading, setProductComments, submissionElement, productComments, product_id);
    const submitComment = () => {
        setLoading(true);
        const submitElement = {
            rating: rating,
            comment: newComment,
            user: user,
            date: new Date()
        };
        setSubmissionElement(submitElement);
        postComment();
        handleClose();
    }

    return (

        <Grid container spacing={2}>
            <Grid xs={2}>
                <></>{/*just some random styling stuff leave empty*/}
            </Grid>
            <Grid xs={8}>
                <Stack direction={"column"} gap={3} style={{padding: "10px"}}>
                    <div>
                        <Typography variant="title" component="div">
                            Rating
                        </Typography>
                        <div style={{alignItems: "center", justifyContent: "center", display: 'flex'}}>
                            <Rating
                                value={rating}
                                onChange={(event, newValue) => {
                                    setRating(newValue);
                                }}

                            />
                        </div>
                    </div>
                    <div>
                        <Typography variant="title" component="div">
                            Comment
                        </Typography>
                        <TextField
                            label="What's on your mind..."
                            multiline
                            rows={6}
                            variant="standard"
                            onChange={(newValue) => setNewComment(newValue.target.value)}
                            value={newComment}
                            style={{width: "100%"}}
                        />
                    </div>
                    <div>
                        <Button variant="contained" style={{width: "100%"}} onClick={submitComment}>Submit</Button>
                    </div>
                </Stack>
            </Grid>
            <Grid xs={2}>
                <></>{/*just some random styling stuff leave empty*/}
            </Grid>
        </Grid>
    )
}
