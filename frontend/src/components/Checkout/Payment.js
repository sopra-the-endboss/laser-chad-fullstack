import "../../App.css";
import React, { useState } from "react";
import { Button, TextField, Grid } from "@mui/material";

const Payment = () => {
  const [editState, setEditState] = useState();

  const cardFields = [
    { name: "cardName", label: "Name on card", autoComplete: "cc-name" },
    {
      name: "cardNumber",
      label: "Credit card number",
      autoComplete: "cc-number",
    },
    { name: "cardExp", label: "Expiry date", autoComplete: "cc-exp" },
    { name: "cardCVV", label: "CVV", autoComplete: "cc-csc" },
  ];

  //   const handleInputChange = (e) => {
  //     const { name, value } = e.target;
  //     setEditState((prevState) => ({
  //       ...prevState,
  //       [name]: value,
  //     }));
  //   };

  //   const handleUpdate = async () => {
  //     const { cardName, cardNumber, cardExp, cardCVV } = cardFields;
  //   };

  return (
    <React.Fragment>
      <Grid container spacing={3}>
        {cardFields.map((field) => (
          <Grid item xs={12} sm={6} key={field.name}>
            <TextField
              required
              name={field.name}
              label={field.label}
              fullWidth
              autoComplete={field.autoComplete}
              variant="outlined"
              //   value={editState[field.name]}
              //   onChange={handleInputChange}
            />
          </Grid>
        ))}
        <Grid item xs={12}>
          <Button
            // onClick={handleUpdate}
            type="submit"
            fullWidth
            variant="contained"
            color="primary"
          >
            Submit
          </Button>
        </Grid>
      </Grid>
    </React.Fragment>
  );
};

export default Payment;
