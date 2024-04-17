import React from "react";
import { useSelector } from "react-redux";
import "../App.css";
import EditIcon from "@mui/icons-material/Edit";
import { useState } from "react";
import { updateUserAttributes } from "aws-amplify/auth";
import { useDispatch } from "react-redux";
import { setUserLoggedIn } from "../reducers/slices/authSlice";
import {
  Button,
  Grid,
  TextField,
  Typography,
  Box,
  IconButton,
  Divider,
} from "@mui/material";

/**
 * Displays and allows editing of the current user's account details.
 *
 * This component fetches and displays the user's account information such as full name, email, and birthdate
 * from the Redux store's auth state. Users can toggle edit mode to update their information, which is then
 * saved using AWS Amplify's `updateUserAttributes` function and updated in the Redux store.
 *
 * The editing state is managed locally within the component, allowing the user to modify their information
 * in a form. Upon saving, the updated information is dispatched to the Redux store to update the global state,
 * and the local editing state is turned off.
 *
 * @component
 * @example
 * return <AccountDetails />;
 *
 * @requires react-redux - To fetch and update the authentication state from the Redux store.
 * @requires aws-amplify/auth - To update user attributes in the backend.
 * @requires @mui/material - For the UI components.
 * @requires ../reducers/slices/authSlice - To dispatch user information updates to the Redux store.
 */

const AccountDetails = () => {
  const authState = useSelector((state) => state.auth);
  const [isEditing, setIsEditing] = useState(false);
  const [editState, setEditState] = useState(authState);
  const dispatch = useDispatch();

  const handleEditToggle = () => {
    setIsEditing(!isEditing);
    if (isEditing) {
      setEditState(authState);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setEditState((prevState) => ({
      ...prevState,
      [name]: value,
    }));
  };

  const handleUpdate = async () => {
    const { givenname, familyname, email, birthdate } = editState;

    try {
      updateUserAttributes({
        userAttributes: {
          given_name: givenname,
          family_name: familyname,
          email: email,
          birthdate: birthdate,
        },
      });
      dispatch(setUserLoggedIn(editState));
      setIsEditing(false);
    } catch (error) {
      console.error("Error updating user attributes", error);
    }
  };

  return (
    <Box
      sx={{
        bgcolor: "white",
        overflow: "hidden",
        boxShadow: 1,
        borderRadius: "12px",
        border: 1,
        borderColor: "grey.300",
        p: 2,
        maxWidth: "600px",
      }}
    >
      <Typography variant="h6" color="textPrimary" gutterBottom>
        User Account
      </Typography>
      <Typography variant="body2" color="textSecondary">
        Account Type: {authState.groups}
      </Typography>
      <Divider sx={{ my: 2 }} />

      {isEditing ? (
        <React.Fragment>
          <Grid container spacing={2} alignItems="center">
            <Grid item xs={6}>
              <Typography>Givenname</Typography>
            </Grid>
            <Grid item xs={6}>
              <TextField
                fullWidth
                name="givenname"
                variant="outlined"
                value={editState.givenname || ""}
                onChange={handleInputChange}
              />
            </Grid>

            <Grid item xs={6}>
              <Typography>Familyname</Typography>
            </Grid>
            <Grid item xs={6}>
              <TextField
                fullWidth
                name="familyname"
                variant="outlined"
                value={editState.familyname || ""}
                onChange={handleInputChange}
              />
            </Grid>

            <Grid item xs={6}>
              <Typography>Birthdate</Typography>
            </Grid>
            <Grid item xs={6}>
              <TextField
                fullWidth
                name="birthdate"
                type="date"
                variant="outlined"
                value={editState.birthdate || ""}
                onChange={handleInputChange}
                InputLabelProps={{
                  shrink: true,
                }}
              />
            </Grid>

            <Grid item xs={6}>
              <Typography>Email</Typography>
            </Grid>
            <Grid item xs={6}>
              <TextField
                fullWidth
                name="email"
                variant="outlined"
                value={editState.email || ""}
                onChange={handleInputChange}
              />
            </Grid>

            <Grid item xs={12}>
              <Button
                variant="contained"
                color="primary"
                onClick={handleUpdate}
              >
                Save
              </Button>
            </Grid>
          </Grid>
        </React.Fragment>
      ) : (
        <React.Fragment>
          <Grid container spacing={2}>
            <Grid item xs={6}>
              <Typography>Full name:</Typography>
            </Grid>
            <Grid item xs={6}>
              <Typography>
                {authState.givenname + " " + authState.familyname}{" "}
              </Typography>
            </Grid>
            <Grid item xs={6}>
              <Typography>Email address: </Typography>
            </Grid>
            <Grid item xs={6}>
              <Typography>{authState.email}</Typography>
            </Grid>
            <Grid item xs={6}>
              <Typography>Birthdate:</Typography>
            </Grid>
            <Grid item xs={6}>
              <Typography>{authState.birthdate}</Typography>
            </Grid>
          </Grid>
          <IconButton onClick={handleEditToggle} size="large">
            <EditIcon />
          </IconButton>
        </React.Fragment>
      )}
    </Box>
  );
};

export default AccountDetails;
