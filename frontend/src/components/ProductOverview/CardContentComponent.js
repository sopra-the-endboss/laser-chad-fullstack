import {Chip} from "@mui/material";
import Typography from "@mui/material/Typography";
import * as React from "react";
import CardContent from "@mui/material/CardContent";
import {useNavigate} from "react-router-dom";

export function CardContentComponent({formatted_text, title, category, price, description, height, brand, clickable = true}){
    const navigate = useNavigate();
    const onChipInteract = (e) => {
        e.stopPropagation(); // stopping the click to go further
        if(clickable){
            navigate('/categories/'+category);
        }
    }

    return (
        <CardContent sx={{ minHeight: height, display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
            {formatted_text && <span style={{position: "absolute", left: "10px", top: "20px"}}><Chip
                label={formatted_text}
                variant="filled"
                color={"error"}
                size={"small"}
            /></span>}
            <Typography gutterBottom variant="h6" component="span">
                <span style={{fontWeight: "bold"}}>{brand}</span> {title}
            </Typography>
            <Typography variant="body2" color="text.secondary">
                {category &&
                    <Chip
                        label={category}
                        component="a"
                        variant="outlined"
                        clickable
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
