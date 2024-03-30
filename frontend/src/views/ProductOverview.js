import {Box, Grid, Typography} from "@mui/material";
import React, {useEffect, useState} from "react";
import ProductComponent from "../components/ProductOverview/ProductComponent";
import CarouselComponent from "../components/ProductOverview/CarouselComponent";
import {useNavigate, useParams} from 'react-router-dom';


const ProductOverview = ({isSearchQuerySubmitted, data, setCategoryFilter}) => {
    const [carouselData, setCarouselData] = useState([]);
    const [productData, setProductData] = useState([]);
    const navigate = useNavigate();
    const {categoryFilter} = useParams();

    useEffect(() => {
        setCarouselData(data.filter(e => e.highlighted));
        setProductData(data.filter(e => !e.highlighted));
    }, [data]);

    useEffect(() => {
        if(categoryFilter)
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
                                HPLaserChads E-Commerce Solution is a platform where you can buy and sell products. We have a wide range of products from different merchants. You can buy and sell products of your choice.
                            </Typography>
                        </Box>
                    </Grid>
                    {carouselData.length > 0 && (
                        <>
                            <Grid item xs={8}>
                                <CarouselComponent carouselData={carouselData} onCardInteract={onCardInteract}/>
                            </Grid>
                            <Grid item xs={4}>
                                <Grid container spacing={2}>
                                    <Grid item xs={12}>
                                        <ProductComponent title={"Comment Section"} img={"https://preview.redd.it/madoka-ayukawa-from-kimagure-orange-road-1987-v0-fx15w3vtkjz81.png?width=640&crop=smart&auto=webp&s=471f01d04aec447193f23c558de3746b8e61e25a"}
                                                          description={"Show top comment of the day or something or different product highlight"}
                                                          onCardInteract={onCardInteract}/>
                                    </Grid>

                                    <Grid item xs={12}>
                                        <ProductComponent title={"News"} img={"https://preview.redd.it/madoka-ayukawa-from-kimagure-orange-road-1987-v0-fx15w3vtkjz81.png?width=640&crop=smart&auto=webp&s=471f01d04aec447193f23c558de3746b8e61e25a"}
                                                          description={"Show some news related to products or a blog post or something"}
                                                          onCardInteract={onCardInteract}/>
                                    </Grid>
                                </Grid>
                            </Grid>
                        </>
                    )}
                </>
            }
            {productData?.map((product, index) => (
                <Grid item xs={3} key={index}>
                    <ProductComponent {...product} title={product.product} img={ product.image} onCardInteract={onCardInteract}/>
                </Grid>
            ))}
        </>
    );
}

export default ProductOverview;
