import {Box, Grid, Typography} from "@mui/material";
import React, {useEffect, useState} from "react";
import ProductComponent from "../components/ProductOverview/ProductComponent";
import CarouselComponent from "../components/ProductOverview/CarouselComponent";
import {useNavigate, useParams} from 'react-router-dom';


const ProductOverview = ({isSearchQuerySubmitted, data, setCategoryFilter, loading}) => {
    const [carouselData, setCarouselData] = useState([]);
    const [productData, setProductData] = useState([]);
    const navigate = useNavigate();
    const {categoryFilter} = useParams();

    useEffect(() => {
        setCarouselData(data.filter(e => e.highlighted));
        setProductData(data.filter(e => !e.highlighted));
    }, [data]);

    useEffect(() => {
        if (categoryFilter)
            setCategoryFilter(categoryFilter);
    }, [categoryFilter, setCategoryFilter])

    const onCardInteract = (clickable, id) => {
        if (clickable) {
            navigate('/product/' + id);
        }
    }

    return (
        <>
            {!isSearchQuerySubmitted &&
                <>
                    <Grid item xs={12}>
                        <Box>
                            <Typography variant="h3" component="p">
                                HPLaserChads E-Commerce Solution
                            </Typography>

                            <Box className="roundedD"></Box>
                        </Box>
                    </Grid>
                    <Grid item xs={12}>
                        <Typography variant="h5" component="p" sx={{color: "grey"}}>
                            Welcome to the LaserChads
                        </Typography>
                        <Box py={2} sx={{textAlign: "center", width: "70%", margin: "auto"}}>
                            <Typography variant="body1" sx={{color: "grey"}}>
                                HPLaserChads E-Commerce Solution is a platform where you can buy and sell products. We
                                have a wide range of products from different merchants. You can buy and sell products of
                                your choice.
                            </Typography>
                        </Box>
                    </Grid>
                    {((!loading && carouselData.length > 0) || loading) && (
                        <>
                            <Grid item xs={8}>
                                <CarouselComponent carouselData={carouselData} onCardInteract={onCardInteract} loading={loading}/>
                            </Grid>
                            <Grid item xs={4}>
                                {(productData.length > 2) && (
                                    <Grid container spacing={2}>
                                        {productData.slice(0,2).map((product, index) => (
                                            <Grid item xs={12} key={index}>
                                                <ProductComponent
                                                    {...product}
                                                    onCardInteract={onCardInteract}
                                                    loading={loading}
                                                />
                                            </Grid>
                                        ))}
                                    </Grid>

                                )}
                            </Grid>
                        </>
                    )}
                </>
            }
            {(loading ? Array.from(new Array(12)) : productData).map((product, index) => (
                <Grid item xs={3} key={index}>
                    <ProductComponent
                        {...product}
                        onCardInteract={onCardInteract}
                        loading={loading}
                    />
                </Grid>
            ))}
        </>
    );
}

export default ProductOverview;
