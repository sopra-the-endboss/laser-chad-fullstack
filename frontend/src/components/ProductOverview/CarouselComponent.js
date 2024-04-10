import * as React from 'react';
import {CardActionArea, Chip, IconButton, Skeleton} from "@mui/material";
import CardContent from "@mui/material/CardContent";
import Card from "@mui/material/Card";
import {CardContentComponent} from "./CardContentComponent";
import Carousel from 'react-multi-carousel';
import "react-multi-carousel/lib/styles.css";
import CardMedia from "@mui/material/CardMedia";
import {addToCart} from "../../reducers/slices/cartSlice";
import AddShoppingCartIcon from "@mui/icons-material/AddShoppingCart";
import {useDispatch} from "react-redux";

function CarouselComponent({carouselData, clickable = true, onCardInteract, loading}) {

    const dispatch = useDispatch();
    if (carouselData) {
        // Normalize the carousel data to always have an 'images' array
        const normalizedCarouselData = Array.isArray(carouselData) ? carouselData.map(item => {
            return {
                ...item, images: item.images || [item.image]
            };
        }) : [{
            ...carouselData, images: carouselData.images || [carouselData.image]
        }];

        const carouselContent = (item, image) => {

            return (<Card sx={{
                    display: 'flex', flexDirection: 'column', height: '100%', // Ensure the card takes up the full height
                }} onClick={() => {
                    clickable && onCardInteract(clickable, item?.product_id)
                }}>
                    <CardActionArea sx={{flexGrow: 1}}>
                        {item?.formatted_text && (<span style={{
                            position: 'absolute', top: 8, left: 8,
                        }}
                        >
                          <Chip
                              label={item.formatted_text}
                              variant="filled"
                              color={"error"}
                              size={"small"}
                          />
                        </span>)}
                        {loading ? (
                            <Skeleton height={474} variant="rectangular" />
                        ) : (
                            <CardMedia
                                component="img"
                                image={image}
                                alt={"Product description"}
                                sx={{height: 'auto', maxWidth: '100%'}} // Set height to auto
                            />
                        )}
                        {clickable && <CardContent sx={{
                            flexGrow: 1,
                            padding: 0, display: 'flex',
                            flexDirection: 'column',
                            justifyContent: 'end'
                        }}>
                            <CardContentComponent
                                title={item['product']}
                                formatted_text={item?.formatted_text}
                                category={item?.category}
                                price={item?.price}
                                description={item?.description}
                                height={157}
                                brand={item?.brand}
                                loading={loading}
                            />
                            <IconButton
                                sx={{
                                    position: 'absolute',
                                    bottom: 8,
                                    right: 8,
                                }}
                                size="small"
                                color="primary"
                                disabled={loading}
                                onClick={(event) => {
                                    event.stopPropagation();
                                    dispatch(addToCart({
                                        product_id: item.product_id,
                                        brand: item.brand,
                                        title: item.product,
                                        price: item.price,
                                        img: item.image
                                    }));
                                }}
                            >
                                <AddShoppingCartIcon fontSize="small"/>
                            </IconButton>
                        </CardContent>}
                    </CardActionArea>
                </Card>);
        }

        return (

            <Carousel
                additionalTransfrom={0}
                arrows
                autoPlay={false}
                autoPlaySpeed={3000}
                centerMode={false}
                className="carousel-style"
                containerClass="carousel-container"
                dotListClass=""
                draggable
                focusOnSelect={false}
                infinite
                minimumTouchDrag={80}
                pauseOnHover
                renderArrowsWhenDisabled={false}
                renderButtonGroupOutside={false}
                renderDotsOutside={false}
                responsive={{
                    desktop: {
                        breakpoint: {
                            max: 3000, min: 1024
                        }, items: 1
                    }, mobile: {
                        breakpoint: {
                            max: 464, min: 0
                        }, items: 1
                    }, tablet: {
                        breakpoint: {
                            max: 1024, min: 464
                        }, items: 1
                    }
                }}
                sliderClass=""
                slidesToSlide={1}
                swipeable
            >

                {
                    // check if loading, if so, create new array with 3 entires else take the carousel data
                    (loading ? [{images: ['sampleString']}, {images: ['sampleString']}, {images: ['sampleString']}] : normalizedCarouselData).map((item) => (
                        // use the items images array and map them.
                        item.images.map((image, imgIndex) => (
                            carouselContent(item, image, imgIndex)
                        ))
                    ))
                }
            </Carousel>);
    }
}

export default CarouselComponent;
