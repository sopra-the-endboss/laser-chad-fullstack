import React, {useContext, useState, useEffect} from "react";
import {Button, Grid, Rating, Stack, TextField} from "@mui/material";
import ModalContext from "../../context/ModalContext";
import Typography from "@mui/material/Typography";
import {usePostComment} from "../../utils/apiCalls";
import {useParams} from "react-router-dom";
import { v4 as uuidv4 } from 'uuid';

export const AddComment = ({user, setProductComments, setLoadingComments, productComments}) => {

    const [rating, setRating] = useState(0);
    const [newReview, setNewReview] = useState('');
    const [newTitle, setNewTitle] = useState('');
    const [submissionElement, setSubmissionElement] = useState({});
    const {handleClose} = useContext(ModalContext);
    const {product_id} = useParams();
    const postComment = usePostComment(setLoadingComments, setProductComments, submissionElement, productComments, product_id);
    const submitComment = () => {
        // setLoadingComments(true); // TODO: WHY THE EVERLOVING FUCK DOES THIS LINE PREVENT THE postComment() execution????!!!!
        // if setLoadingComments(true) is executed, the post of a new comment does not work

        // Create unique uuid for review
        const review_id = uuidv4();

        const submitElement = {
            user: user.givenname.concat(" ", user.familyname),
            user_id: user.userId,
            rating: rating,
            title: newTitle,
            review: newReview,
            date: new Date().toISOString().split('T')[0],
            review_id: review_id

        };
        console.log("submitElement", submitElement);
        setSubmissionElement(submitElement);
    }

    useEffect(() => {
        if (Object.keys(submissionElement).length > 0) {
            console.log("submissionElement to be posted:", submissionElement);
            postComment();
            handleClose();
        }
    }, [submissionElement])

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
                            Title
                        </Typography>
                        <TextField
                            label="Title to your review"
                            multiline
                            rows={2}
                            variant="standard"
                            onChange={(newValue) => setNewTitle(newValue.target.value)}
                            value={newTitle}
                            style={{width: "100%"}}
                        />
                    </div>
                    <div>
                        <Typography variant="title" component="div">
                            Review
                        </Typography>
                        <TextField
                            label="What's on your mind..."
                            multiline
                            rows={6}
                            variant="standard"
                            onChange={(newValue) => setNewReview(newValue.target.value)}
                            value={newReview}
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
