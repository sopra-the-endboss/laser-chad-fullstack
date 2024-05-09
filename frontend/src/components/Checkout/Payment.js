import {Elements} from "@stripe/react-stripe-js";
import {loadStripe} from "@stripe/stripe-js";
import CheckoutForm from "./CheckoutForm";


const stripePromise = loadStripe('pk_test_6pRNASCoBOKtIshFeQd4XMUh');

const options = {
    mode: 'payment',
    amount: 1099,
    currency: 'usd',
    locale: 'en',
    // Fully customizable with appearance API.
    appearance: {
        /*...*/
    },
};


const Payment = ({setBuyOption}) => (
    <Elements stripe={stripePromise} options={options}>
        <CheckoutForm setBuyOption={setBuyOption}/>
    </Elements>
); export default Payment;
