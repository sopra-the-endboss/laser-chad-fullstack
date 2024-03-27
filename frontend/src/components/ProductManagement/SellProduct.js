import React, {useState} from 'react';
import { Stepper, Step, StepLabel, Button, Box } from '@mui/material';
import {ProductDetail} from "../../views/ProductDetail";
import Typography from "@mui/material/Typography";
import ProductContent from "./ProductContent";

const SellProduct = () => {

    const [activeStep, setActiveStep] = useState(0);

    const steps = ['Enter Product Details', 'Preview Product', 'Publish Product'];

    const [collectedData, setCollectedData] = useState({});

    function getStepContent(stepIndex) {
        switch (stepIndex) {
            case 0:
                return (
                    <ProductContent setCollectedData={setCollectedData} setActiveStep={setActiveStep} />
                );
            case 1:
                return (
                    // Render the preview of the entered data
                    <ProductDetail details={collectedData} />
                );
            case 2:
                return (
                    // Confirmation message or any additional information before publishing
                    <Typography>Review and confirm your product details before publishing.</Typography>
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
