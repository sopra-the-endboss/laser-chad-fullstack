import {Box, Grid, Typography} from "@mui/material";
import sport from "../assets/sports.jpg";
import React, {useEffect, useState} from "react";
import ProductComponent from "../components/ProductOverview/ProductComponent";
import CarouselComponent from "../components/ProductOverview/CarouselComponent";
import {useNavigate} from 'react-router-dom';


const Home = ({isSearchQuerySubmitted, data}) => {
    const [carouselData, setCarouselData] = useState([]);
    const [productData, setProductData] = useState([]);
    const navigate = useNavigate();

    useEffect(() => {
        setCarouselData(data.filter(e => e.highlighted));
        setProductData(data.filter(e => !e.highlighted));
    }, [data]);

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
                            <Typography variant="p" component="p" sx={{color: "grey"}}>
                                HPLaserChads E-Commerce Solution is a platform where you can buy and
                                sell products. We have a wide range of products from different
                                merchants. You can buy and sell products of your choice.
                            </Typography>
                        </Box>
                    </Grid>
                    <Grid item xs={8}>
                        <CarouselComponent carouselData={carouselData} onCardInteract={onCardInteract}/>
                    </Grid>
                    <Grid item xs={4}>
                        <Grid container spacing={2}>
                            <Grid item xs={12}>
                                <ProductComponent img={sport} title={"Comment Section"}
                                                  description={"Show top comment of the day or something or different product highlight"}
                                                  onCardInteract={onCardInteract}/>
                            </Grid>

                            <Grid item xs={12}>
                                <ProductComponent img={sport} title={"News"}
                                                  description={"Show some news related to products or a blog post or something"}
                                                  onCardInteract={onCardInteract}/>
                            </Grid>
                        </Grid>
                    </Grid>
                </>
            }
            {productData?.map((product, index) => (
                <Grid item xs={3} key={index}>
                    <ProductComponent brand={product.brand} category={product.category} img={product.image}
                                      title={product.product} price={product.price}
                                      description={product.description} formatted_text={product.formatted_text}
                                      onCardInteract={onCardInteract} product_id={product.product_id}/>
                </Grid>
            ))}
        </>
    );
}

export default Home;
