import React, {useState} from 'react';
import {Stepper, Step, StepLabel, Button, Box, CircularProgress, Stack} from '@mui/material';
import {ProductDetail} from "../../views/ProductDetail";
import Typography from "@mui/material/Typography";
import ProductContent from "./ProductContent";
import {Link} from "react-router-dom";
import {usePostNewProduct} from "../../utils/apiCalls";

const SellProduct = ({propData, setLoadingMyShop}) => {

    const [activeStep, setActiveStep] = useState(0);

    const steps = ['Enter Product Details', 'Preview Product', 'Publish Product'];

    const [collectedData, setCollectedData] = useState(propData || {});
    const [loading, setLoading] = useState(true);
    const [createdProductId, setCreatedProductId] = useState(10);
    const postNewProduct = usePostNewProduct(collectedData, setLoading, setCreatedProductId, setLoadingMyShop);

    const handleNext = () => {
        setActiveStep((prevActiveStep) => prevActiveStep + 1);
        postNewProduct().then(
            (data) => {
                console.log("Product created");
                setLoadingMyShop(true);
            }, catchError => {
                console.log("Error creating new product");
            }
        );
    };
    const handleBack = () => {
        setActiveStep((prevActiveStep) => prevActiveStep - 1);
    };

    function getStepContent(stepIndex) {
        switch (stepIndex) {
            case 0:
                return (
                    <ProductContent
                        collectedData={collectedData}
                        setCollectedData={setCollectedData}
                        setActiveStep={setActiveStep}
                    />
                );
            case 1:
                return (
                    // Render the preview of the entered data
                    // hideComments is set to true, do not allow to add a comment in the preview
                    <ProductDetail 
                        details={collectedData}
                        previousStep={handleBack} 
                        nextStep={handleNext}
                        hideComments={true}
                    />
                );
            case 2:
                return (
                    // Confirmation message or any additional information before publishing
                    <Stack style={{alignItems: "center", display: "flex"}} gap={2}>
                        {loading ? <Typography>Creating your product...</Typography> : <Typography>Product created.</Typography>}
                        {loading ? <CircularProgress color="inherit" /> : <Link to={"/product/"+createdProductId}>Check out your new product</Link>}
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
