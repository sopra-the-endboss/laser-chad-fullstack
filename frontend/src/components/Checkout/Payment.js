import { Elements } from "@stripe/react-stripe-js";
import { loadStripe } from "@stripe/stripe-js";
import CheckoutForm from "./CheckoutForm";

const stripePromise = loadStripe("pk_test_6pRNASCoBOKtIshFeQd4XMUh");

const options = {
  mode: "payment",
  amount: 1099,
  currency: "usd",
  locale: "en",
};

/**
 * Payment Component
 * This component sets up the Stripe payment environment using Stripe Elements.
 * It loads and configures Stripe with the given public API key and passes additional options
 * necessary for the payment process. The CheckoutForm component is nested inside to handle
 * the actual payment form and submission logic.
 *
 * This setup is necessary to inject the Stripe.js configuration into the React context, which
 * `CheckoutForm` can access to manage and submit payment information securely.
 *
 * @component
 * @param {Object} props - The properties passed to the component.
 * @param {function(boolean):void} props.setBuyOption - A callback function to update the state in the parent component
 *        indicating that the payment information has been successfully validated and can proceed with the transaction.
 *
 * @example
 * return (
 *   <Payment setBuyOption={setBuyOptionCallback} />
 * )
 */

const Payment = ({ setBuyOption }) => (
  <Elements stripe={stripePromise} options={options}>
    <CheckoutForm setBuyOption={setBuyOption} />
  </Elements>
);
export default Payment;
