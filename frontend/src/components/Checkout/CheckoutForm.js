import React, {useState} from 'react';

import {
    PaymentElement,
    useStripe,
    useElements,
} from '@stripe/react-stripe-js';
import {Button} from "@mui/material";

const CheckoutForm = ({setBuyOption}) => {
    const stripe = useStripe();
    const elements = useElements();

    const [errorMessage, setErrorMessage] = useState(null);

    const handleSubmit = async (event) => {
        event.preventDefault();

        if (elements == null) {
            return;
        }

        // Trigger form validation and wallet collection
        const {error: submitError} = await elements.submit();
        if (submitError) {
            // Show error to your customer
            setErrorMessage(submitError.message);
            return;
        }
        setErrorMessage('');
        setBuyOption(true);
    };

    return (
        <form onSubmit={handleSubmit}>
            <PaymentElement />
            <Button type="submit" variant={'outlined'} disabled={!stripe || !elements} style={{marginTop: '20px'}}>
                Confirm Payment information
            </Button>
            {/* Show error message to your customers */}
            {errorMessage && <div style={{color: '#df1b41'}}>{errorMessage}</div>}
        </form>
    );
}; export default CheckoutForm;
