import * as React from 'react';
import {useTheme} from '@mui/material/styles';
import Box from '@mui/material/Box';
import MobileStepper from '@mui/material/MobileStepper';
import Button from '@mui/material/Button';
import KeyboardArrowLeft from '@mui/icons-material/KeyboardArrowLeft';
import KeyboardArrowRight from '@mui/icons-material/KeyboardArrowRight';
import SwipeableViews from 'react-swipeable-views';
import {autoPlay} from 'react-swipeable-views-utils';
import {CardActionArea} from "@mui/material";
import CardContent from "@mui/material/CardContent";
import Card from "@mui/material/Card";
import {CardContentComponent} from "./CardContentComponent";

const AutoPlaySwipeableViews = autoPlay(SwipeableViews);

function CarouselComponent({carouselData, clickable = true, onCardInteract}) {
    const theme = useTheme();
    const [activeStep, setActiveStep] = React.useState(0);

    if (carouselData) {
        const maxSteps = Array.isArray(carouselData) ? carouselData?.length : carouselData.images?.length;

        const handleNext = (e) => {
            e.stopPropagation();
            setActiveStep((prevActiveStep) => (prevActiveStep+1) % maxSteps);
        };

        const handleBack = (e) => {
            e.stopPropagation();
            setActiveStep((prevActiveStep) => (prevActiveStep-1+ maxSteps) % maxSteps);
        };

        const handleStepChange = (step) => {
            setActiveStep(step);
        };

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

        return (

            <Card sx={{height: "100%", maxHeight: 635}} onClick={() => {
                clickable && onCardInteract(clickable, carouselData[activeStep]?.product_id)
            }}>
                <CardActionArea sx={{height: "100%"}}>
                    <CardContent sx={{padding: 0}}>
                        <Box sx={{flexGrow: 1}}>
                            <AutoPlaySwipeableViews
                                axis={theme.direction === 'rtl' ? 'x-reverse' : 'x'}
                                index={activeStep}
                                onChangeIndex={handleStepChange}
                                enableMouseEvents
                            >
                                {normalizedCarouselData?.map((item, index) => (
                                    item.images.map((image, imgIndex) => (
                                        <div key={`${item?.product_id}_${imgIndex}`}>
                                            {Math.abs(activeStep - index) <= maxSteps ? (
                                                <Box
                                                    component="img"
                                                    sx={{
                                                        display: 'block',
                                                        overflow: 'hidden',
                                                        width: '100%',
                                                    }}
                                                    src={image}
                                                    alt={item?.product}
                                                />
                                            ) : null}
                                        </div>
                                    ))
                                ))}
                            </AutoPlaySwipeableViews>
                            {clickable &&
                                <CardContentComponent
                                    title={carouselData[activeStep]?.product}
                                    formatted_text={carouselData[activeStep]?.formatted_text}
                                    category={carouselData[activeStep]?.category}
                                    price={carouselData[activeStep]?.price}
                                    description={carouselData[activeStep]?.description}
                                    height={110}
                                    brand={carouselData[activeStep]?.brand}
                                />
                            }

                            <MobileStepper
                                style={{backgroundColor: "white"}}
                                steps={maxSteps}
                                position="static"
                                activeStep={activeStep}
                                nextButton={
                                    <Button
                                        size="small"
                                        onClick={handleNext}
                                    >
                                        <KeyboardArrowRight/>
                                    </Button>
                                }
                                backButton={
                                    <Button size="small" onClick={handleBack}>
                                        <KeyboardArrowLeft/>
                                    </Button>
                                }
                            />
                        </Box>
                    </CardContent>
                </CardActionArea>
            </Card>
        );
    }
}

export default CarouselComponent;
