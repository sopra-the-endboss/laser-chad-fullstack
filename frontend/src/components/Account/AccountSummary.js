import "../../App.css";
import React from "react";

import { Button, TextField, Grid } from "@mui/material";

const AccountSummary = ({
  formFields,
  isEditing,
  editState,
  authState,
  handleInputChange,
  handleUpdate,
  handleEditToggle,
}) => {
  return (
    <React.Fragment>
      {isEditing ? (
        <React.Fragment>
          <Grid container spacing={3}>
            {formFields.map((field) => (
              <Grid
                item
                xs={12}
                sm={field.name.includes("card") ? 6 : 12}
                key={field.name}
              >
                <TextField
                  required
                  name={field.name}
                  label={field.label}
                  fullWidth
                  autoComplete={field.autoComplete}
                  variant="outlined"
                  value={editState[field.name]}
                  onChange={handleInputChange}
                />
              </Grid>
            ))}
            <Grid item xs={12}>
              <Button
                onClick={handleUpdate}
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
      ) : (
        <React.Fragment>
          <div>
            <h3 className="accountH3">Delivery Information</h3>
            <p className="accountText">
              {authState.givenname + " " + authState.familyname}
            </p>
            <p className="accountText">{authState.address}</p>
            <p className="accountText">
              {authState.zip + " " + authState.city + " " + authState.county}
            </p>
            <h3 className="accountH3">Delivery method</h3>
            <p className="accountText">Shipping</p>
          </div>
          <div className="editButtonRight">
            <Button onClick={handleEditToggle} variant="contained" size="small">
              Edit
            </Button>
          </div>
        </React.Fragment>
      )}
    </React.Fragment>
  );
};

export default AccountSummary;
