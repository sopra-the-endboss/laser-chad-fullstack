import {CardActionArea, Grid, Typography} from "@mui/material";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import CategoryJson from "../data/CategoryMock.json";
import {useNavigate} from "react-router-dom";

export const Categories = () => {
    const navigate = useNavigate();
    return (
        <>
            <Grid container spacing={2}>
                {CategoryJson.map((category) => (
                    <Grid item key={category.id} xs={12} sm={6} md={3}>
                        <Card onClick={() => navigate('/categories/'+ category.name)}>
                            <CardActionArea>
                                <CardContent>
                                    <Typography gutterBottom variant="h5" component="h2">
                                        {category.name}
                                    </Typography>
                                </CardContent>
                            </CardActionArea>
                        </Card>
                    </Grid>
                ))}
            </Grid>
        </>
    );
};
