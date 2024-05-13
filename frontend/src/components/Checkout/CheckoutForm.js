import React, { useState } from "react";

import {
  PaymentElement,
  useStripe,
  useElements,
} from "@stripe/react-stripe-js";
import { Button } from "@mui/material";

/**
 * CheckoutForm Component
 * This component handles the payment process using Stripe's PaymentElement.
 * Users can submit their payment details through Stripe's UI components. It also manages
 * validation and error handling during the payment submission process.
 *
 * The component allows setting a buy option flag through a callback prop upon successful validation
 * of payment information, indicating that the payment info is confirmed and can proceed to final checkout.
 *
 * @component
 * @param {Object} props - The properties passed to the component.
 * @param {function(boolean):void} props.setBuyOption - A callback function to set the buy option
 *        indicating that the payment information is valid and ready to proceed.
 *
 * @example
 * return (
 *   <CheckoutForm setBuyOption={setBuyOptionCallback} />
 * )
 */

const CheckoutForm = ({ setBuyOption }) => {
  const stripe = useStripe();
  const elements = useElements();

  const [errorMessage, setErrorMessage] = useState(null);
  /**
   * Handles the submission of the payment form.
   * Validates the payment details using Stripe's PaymentElement and updates the local state based on the outcome.
   * Sets the buy option flag if the payment details are valid.
   *
   * @param {React.FormEvent} event - The form submission event.
   */
  const handleSubmit = async (event) => {
    event.preventDefault();
    // Early exit if Stripe Elements have not been fully loaded
    if (elements == null) {
      return;
    }

    // Trigger form validation and wallet collection
    const { error: submitError } = await elements.submit();
    if (submitError) {
      // Show error to your customer
      setErrorMessage(submitError.message);
      return;
    }
    setErrorMessage("");
    setBuyOption(true);
  };

  return (
    <form onSubmit={handleSubmit}>
      <PaymentElement />
      <Button
        type="submit"
        variant={"outlined"}
        disabled={!stripe || !elements}
        style={{ marginTop: "20px" }}
      >
        Confirm Payment information
      </Button>
      {/* Show error message to your customers */}
      {errorMessage && <div style={{ color: "#df1b41" }}>{errorMessage}</div>}
    </form>
  );
};
export default CheckoutForm;
