import React from "react";
import { CognitoUserAttribute } from "amazon-cognito-identity-js";
import CognitoAccount from "./CognitoAccount";

import {
  Dialog,
  DialogTitle,
  List,
  ListItem,
  ListItemText,
} from "@mui/material";
import { useDispatch } from "react-redux";
import { updateUserDetail } from "../../reducers/slices/authSlice";

/**
 * A dialog component that allows users to select and update their role.
 * This component interfaces with AWS Cognito to update user attributes and synchronizes the user's role in the Redux store.
 *
 * The component shows a modal dialog with options to select either "Buyer" or "Seller" as a user role.
 * Upon selecting a role, it updates the role in both Cognito and the Redux store, then closes the dialog.
 *
 * @component
 * @param {Object} props - The properties passed to the UpdateRole component.
 * @param {boolean} props.open - Controls the visibility of the dialog; true shows the dialog, false hides it.
 * @param {function} props.onClose - Function to call when the dialog needs to be closed after updating the role or on cancellation.
 *
 * @example
 * <UpdateRole
 *   open={true}
 *   onClose={() => console.log("Dialog closed")}
 * />
 */

const UpdateRole = ({ open, onClose }) => {
  const dispatch = useDispatch();

  /**
   * Handles the role selection and updates the user's role both in AWS Cognito and the Redux store.
   * It first dispatches the role to the Redux store and then attempts to update it in Cognito.
   * If the Cognito update is successful, it closes the dialog; otherwise, it logs the error.
   *
   * @param {string} selectedRole - The role selected by the user ("Buyer" or "Seller").
   */

  const handleSelectRole = (selectedRole) => {
    // Update the role in the Redux store
    dispatch(updateUserDetail({ attribute: "role", value: selectedRole }));
    // Update the role in AWS Cognito
    CognitoAccount()
      .then(({ user }) => {
        const update = [
          new CognitoUserAttribute({
            Name: "custom:role",
            Value: selectedRole,
          }),
        ];
        console.log("Updating user attributes:", update);
        user.updateAttributes(update, (err, result) => {
          if (err) {
            console.error(err);
          } else {
            console.log("Role update result:", result);
          }
          onClose();
        });
      })
      .catch((err) => {
        console.error("Error during user attribute update:", err);
      });
  };

  return (
    <Dialog open={open}>
      <DialogTitle>Choose Your Role</DialogTitle>
      <List>
        <ListItem button onClick={() => handleSelectRole("Buyer")}>
          <ListItemText primary="Buyer" />
        </ListItem>
        <ListItem button onClick={() => handleSelectRole("Seller")}>
          <ListItemText primary="Seller" />
        </ListItem>
      </List>
    </Dialog>
  );
};

export default UpdateRole;
