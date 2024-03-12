import * as React from 'react';
import { useTheme } from '@mui/material/styles';
import Box from '@mui/material/Box';
import MobileStepper from '@mui/material/MobileStepper';
import Button from '@mui/material/Button';
import KeyboardArrowLeft from '@mui/icons-material/KeyboardArrowLeft';
import KeyboardArrowRight from '@mui/icons-material/KeyboardArrowRight';
import SwipeableViews from 'react-swipeable-views';
import { autoPlay } from 'react-swipeable-views-utils';
import {CardActionArea} from "@mui/material";
import CardContent from "@mui/material/CardContent";
import Card from "@mui/material/Card";
import {CardContentComponent} from "./CardContentComponent";

const AutoPlaySwipeableViews = autoPlay(SwipeableViews);
function CarouselComponent({carouselData, clickable=true, onCardInteract}) {
    const theme = useTheme();
    const [activeStep, setActiveStep] = React.useState(0);

    if(carouselData){
        const maxSteps = carouselData?.length;

        const handleNext = (e) => {
            e.stopPropagation();
            setActiveStep((prevActiveStep) => prevActiveStep + 1);
        };

        const handleBack = (e) => {
            e.stopPropagation();
            setActiveStep((prevActiveStep) => prevActiveStep - 1);
        };

        const handleStepChange = (step) => {
            setActiveStep(step);
        };

        return (

            <Card sx={{height: "100%", maxHeight: 635}} onClick={() => onCardInteract(clickable)}>
                <CardActionArea sx={{height: "100%"}}>
                    <CardContent sx={{padding: 0}}>
                        <Box sx={{flexGrow: 1 }}>
                            <AutoPlaySwipeableViews
                                axis={theme.direction === 'rtl' ? 'x-reverse' : 'x'}
                                index={activeStep}
                                onChangeIndex={handleStepChange}
                                enableMouseEvents
                            >
                                {carouselData?.map((step, index) => (
                                    <div key={step.product}>
                                        {Math.abs(activeStep - index) <= 2 ? (
                                            <Box
                                                component="img"
                                                sx={{
                                                    display: 'block',
                                                    overflow: 'hidden',
                                                    width: '100%',
                                                }}
                                                src={step?.image}
                                                alt={step?.product}
                                            />
                                        ) : null}
                                    </div>
                                ))}
                            </AutoPlaySwipeableViews>
                            <CardContentComponent
                                title={carouselData[activeStep]?.product}
                                formatted_text={carouselData[activeStep]?.formatted_text}
                                category={carouselData[activeStep]?.category}
                                price={carouselData[activeStep]?.price}
                                description={carouselData[activeStep]?.description}
                                height={110}
                                brand={carouselData[activeStep]?.brand}
                            />

                            <MobileStepper
                                style={{backgroundColor: "white"}}
                                steps={maxSteps}
                                position="static"
                                activeStep={activeStep}
                                nextButton={
                                    <Button
                                        size="small"
                                        onClick={handleNext}
                                        disabled={activeStep === maxSteps - 1}
                                    >
                                        {theme.direction === 'rtl' ? (
                                            <KeyboardArrowLeft />
                                        ) : (
                                            <KeyboardArrowRight />
                                        )}
                                    </Button>
                                }
                                backButton={
                                    <Button size="small" onClick={handleBack} disabled={activeStep === 0}>
                                        {theme.direction === 'rtl' ? (
                                            <KeyboardArrowRight />
                                        ) : (
                                            <KeyboardArrowLeft />
                                        )}
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
