import {Chip, Skeleton} from "@mui/material";
import Typography from "@mui/material/Typography";
import * as React from "react";
import CardContent from "@mui/material/CardContent";
import {useNavigate} from "react-router-dom";

export function CardContentComponent({
                                         product_title, category, price, description, height, brand, clickable = true, loading
                                     }) {
    const navigate = useNavigate();
    const onChipInteract = (e) => {
        e.stopPropagation(); // stopping the click to go further
        if (clickable) {
            navigate("/categories/" + category);
        }
    };

    return (<CardContent
        sx={{
            paddingTop: "0px",
            minHeight: height,
            display: "flex",
            flexDirection: "column",
            justifyContent: "space-between",
        }}
    >
        <Typography gutterBottom variant="h8" component="span">
            {loading ? (
                <Skeleton />
            ) : (
                <><span style={{fontWeight: "bold"}}>{brand}</span> {product_title}</>
            )}
        </Typography>
        <Typography variant="body2" color="text.secondary" component="div">
            {loading ? (
                <>
                    <Skeleton width="40%"/>
                    <Skeleton />
                    <Skeleton />
                </>
            ) : (
                <>
                    {category && (<Chip
                        label={category}
                        component="a"
                        variant="outlined"
                        clickable
                        onClick={onChipInteract}
                        size={"small"}
                    />)}

                    <Typography
                        gutterBottom
                        variant="h8"
                        component="div"
                        style={{color: "red"}}
                    >
                        {price?.toFixed(2)}
                    </Typography>

                    {description ?? "Lorem ipsum dolor sit"}

                </>
            )}
        </Typography>
    </CardContent>);
}
