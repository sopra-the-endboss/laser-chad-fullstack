import * as React from 'react';
import {CardActionArea} from "@mui/material";
import CardContent from "@mui/material/CardContent";
import Card from "@mui/material/Card";
import {CardContentComponent} from "./CardContentComponent";
import Carousel from 'react-multi-carousel';
import "react-multi-carousel/lib/styles.css";
import CardMedia from "@mui/material/CardMedia";

function CarouselComponent({carouselData, clickable = true, onCardInteract}) {

    if (carouselData) {

        // Normalize the carousel data to always have an 'images' array
        const normalizedCarouselData = Array.isArray(carouselData) ? carouselData.map(item => {
            return {
                ...item,
                images: item.images || [item.image]
            };
        }) : [{
            ...carouselData,
            images: carouselData.images || [carouselData.image]
        }];

        const carouselContent = (item, image) => {
            return (
                <Card sx={{
                    display: 'flex',
                    flexDirection: 'column',
                    height: '100%', // Ensure the card takes up the full height
                }} onClick={() => {
                    clickable && onCardInteract(clickable, item?.product_id)
                }}>
                    <CardActionArea sx={{flexGrow: 1}}> {/* flexGrow allows the card to grow */}
                        <CardMedia
                            component="img"
                            image={image}
                            alt={"Product description"}
                            sx={{height: 'auto', maxWidth: '100%'}} // Set height to auto
                        />
                        {clickable && <CardContent sx={{
                            flexGrow: 1, // Allows card content to take up remaining space
                            padding: 0,
                            display: 'flex', // Using flex layout
                            flexDirection: 'column', // Stack children vertically
                            justifyContent: 'end' // Align content to the bottom
                        }}>
                            <CardContentComponent
                                title={item['product']}
                                formatted_text={item?.formatted_text}
                                category={item?.category}
                                price={item?.price}
                                description={item?.description}
                                height={157}
                                brand={item?.brand}
                            />
                        </CardContent>}
                    </CardActionArea>
                </Card>
            );
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
                            max: 3000,
                            min: 1024
                        },
                        items: 1
                    },
                    mobile: {
                        breakpoint: {
                            max: 464,
                            min: 0
                        },
                        items: 1
                    },
                    tablet: {
                        breakpoint: {
                            max: 1024,
                            min: 464
                        },
                        items: 1
                    }
                }}
                sliderClass=""
                slidesToSlide={1}
                swipeable
            >
                {normalizedCarouselData?.map((item) => (
                    item.images.map((image, imgIndex) => (
                        carouselContent(item, image, imgIndex)
                    ))
                ))}
            </Carousel>
        );
    }
}

export default CarouselComponent;
