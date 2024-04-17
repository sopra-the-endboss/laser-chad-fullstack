import React, { useEffect, useState } from "react";
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

const Attributes = (open, onClose) => {
  const dispatch = useDispatch();
  const [role, setRole] = useState("");

  useEffect(() => {
    CognitoAccount()
      .then((attributes) => {
        const userRole = attributes["custom:role"] || "";
        setRole(userRole);
      })
      .catch((err) => {
        console.error("Error retrieving user session:", err);
      });
  }, []);

  const handleSelectRole = (selectedRole) => {
    setRole(selectedRole);
    dispatch(updateUserDetail({ attribute: "role", value: selectedRole }));

    CognitoAccount()
      .then(({ user }) => {
        const attributes = [
          new CognitoUserAttribute({ Name: "custom:role", Value: role }),
        ];

        user.updateAttributes(attributes, (err, result) => {
          if (err) {
            console.error(err);
          } else {
            console.log(result);
          }
        });
      })
      .catch((err) => {
        console.error("Error during user attribute update:", err);
      });
  };

  return (
    <Dialog open={open} onClose={onClose}>
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

export default Attributes;
