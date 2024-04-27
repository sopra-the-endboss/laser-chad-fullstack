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

const UpdateRole = ({ open, onClose }) => {
  const dispatch = useDispatch();

  const handleSelectRole = (selectedRole) => {
    dispatch(updateUserDetail({ attribute: "role", value: selectedRole }));

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
