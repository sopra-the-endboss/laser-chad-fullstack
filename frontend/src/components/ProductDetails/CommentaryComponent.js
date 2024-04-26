import {Paper, Skeleton} from "@mui/material";
import Typography from "@mui/material/Typography";
import React from "react";

export const CommentaryComponent = (loadingComments, productComments) => {


    // add a popover for some comment input
    // the comment should include a rating
    // a comment itself
    // the username
    // the date

    // the popover should therefore enable the user to set a rating
    // and set a comment.
    // the user can also cancel and post the comment.

    // preferably only to products he / she bought. endpoint however is not yet in place.
    // therefore atm at any product.


    return (
        {loadingComments ? (
                <>
                    <Skeleton variant="text" width="40%" height={18} />
                    <Skeleton variant={"rectangle"} height={80} />
                </>

            ) : (
                productComments?.reviews?.map((review, i) => (
                    <Paper key={i} elevation={1} sx={{p: 2, mb: 2}}>
                        <Typography variant="subtitle2">{loadingDetails ? <Skeleton width={30}/> : review?.user}</Typography>
                        <Typography variant="body2" color="text.secondary">{loadingDetails ? <Skeleton /> : review?.comment}</Typography>
                    </Paper>
                ))
            )}
    )

};
