import React, {useState} from 'react';
import {Stepper, Step, StepLabel, Button, Box, CircularProgress, Stack} from '@mui/material';
import {ProductDetail} from "../../views/ProductDetail";
import Typography from "@mui/material/Typography";
import ProductContent from "./ProductContent";
import {Link} from "react-router-dom";

const SellProduct = ({propData}) => {

    const [activeStep, setActiveStep] = useState(0);

    const steps = ['Enter Product Details', 'Preview Product', 'Publish Product'];

    const [collectedData, setCollectedData] = useState(propData || {});
    const [loading, setLoading] = useState(true);
    const handleNext = () => {
        setActiveStep((prevActiveStep) => prevActiveStep + 1);
        // TODO: now publish
        // let loader run
        // show success post
        setTimeout(() => {
            // This code block simulates the completion of the upload process
            setLoading(false);
        }, 2000);
    };

    const handleBack = () => {
        setActiveStep((prevActiveStep) => prevActiveStep - 1);
    };

    function getStepContent(stepIndex) {
        switch (stepIndex) {
            case 0:
                return (
                    <ProductContent collectedData={collectedData} setCollectedData={setCollectedData} setActiveStep={setActiveStep} />
                );
            case 1:
                return (
                    // Render the preview of the entered data
                    <ProductDetail details={collectedData} nextStep={handleNext} previousStep={handleBack} />
                );
            case 2:
                return (
                    // Confirmation message or any additional information before publishing
                    <Stack style={{alignItems: "center", display: "flex"}} gap={2}>
                        <Typography>Creating your product...</Typography>
                        {loading ? <CircularProgress color="inherit" /> : <Link to={"/product/10"}>Check out your new product</Link>}
                    </Stack>
                );
            default:
                return 'Unknown step';
        }
    }
    const handleReset = () => {
        setActiveStep(0);
    };


    return (
        <Box sx={{ width: '100%' }}>
            <Stepper activeStep={activeStep} alternativeLabel>
                {steps.map((label) => (
                    <Step key={label}>
                        <StepLabel>{label}</StepLabel>
                    </Step>
                ))}
            </Stepper>
            <div>
                {activeStep === steps.length ? (
                    <div>
                        <Typography sx={{ mt: 2, mb: 1 }}>All steps completed - your product is ready to be published.</Typography>
                        <Box>
                            <Button onClick={handleReset}>Reset</Button>
                        </Box>
                    </div>
                ) : (
                    <div>
                        <Typography sx={{ mt: 2, mb: 1 }}>{getStepContent(activeStep)}</Typography>
                    </div>
                )}
            </div>
        </Box>
    );
};

export default SellProduct;
