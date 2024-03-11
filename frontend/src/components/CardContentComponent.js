import {Chip} from "@mui/material";
import Typography from "@mui/material/Typography";
import * as React from "react";
import CardContent from "@mui/material/CardContent";

export function CardContentComponent({formatted_text, title, category, price, description, height}){

    const onChipInteract = () => {
        console.log("redirect to category");
    }

    return (
        <CardContent sx={{ height: height}}>
            {formatted_text && <span style={{position: "absolute", left: "10px", top: "20px"}}><Chip
                label={formatted_text}
                variant="filled"
                color={"error"}
                size={"small"}
            /></span>}
            <Typography gutterBottom variant="h5" component="span">
                {title}
            </Typography>
            <Typography variant="body2" color="text.secondary">
                {category &&
                    <Chip
                        label={category}
                        component="a"
                        variant="outlined"
                        onClick={onChipInteract}
                        size={"small"}
                    />}

                <Typography gutterBottom variant="h8" component="div" style={{color: "red"}}>
                    {price?.toFixed(2)}
                </Typography>

                {description ?? "Lorem ipsum dolor sit amet consectetur adipisicing elit. Quisquam, quod."}
            </Typography>
        </CardContent>
    )
}
