// import React from "react";
// import {
//   Dialog,
//   DialogTitle,
//   List,
//   ListItem,
//   ListItemText,
// } from "@mui/material";
// import { useDispatch } from "react-redux";
// import { updateUserAttribute } from "../../reducers/slices/authSlice";
// import { fetchAuthSession } from "aws-amplify/auth";
// import { Auth } from "aws-amplify";

// const RoleSelectionModal = ({ open, onClose }) => {
//   const dispatch = useDispatch();
//   const handleSelectRole = async (role) => {
//     const user = await Auth.currentAuthenticatedUser();
//     console.log("User", user);
//     dispatch(updateUserDetail({ attribute: "role", value: role }));
//     try {
//       // updateUserAttributes({
//       //   "AccessToken": user.signInUserSession.accessToken.jwtToken,
//       // },
//       //   "userAttributes": [
//       //     {
//       //       "Name": "custom:role",
//       //       "Value": role
//       //     }
//       //   ]
//       // );
//       console.log("Role updated successfully", role);
//     } catch (error) {
//       console.error("Error updating user attribute", error);
//     }
//     onClose();
//   };

//   return (
//     <Dialog open={open} onClose={() => onClose()}>
//       <DialogTitle>Choose Your Role</DialogTitle>
//       <List>
//         <ListItem button onClick={() => handleSelectRole("Buyer")}>
//           <ListItemText primary="Buyer" />
//         </ListItem>
//         <ListItem button onClick={() => handleSelectRole("Seller")}>
//           <ListItemText primary="Seller" />
//         </ListItem>
//       </List>
//     </Dialog>
//   );
// };

// export default RoleSelectionModal;

// //   return (
// //     <Box>
// //       <Box>
// //         <FormControl>
// //           <FormLabel>Account Type</FormLabel>
// //           <RadioGroup
// //             defaultValue="Buyer"
// //             name="radio-buttons-group"
// //             value={value}
// //           >
// //             <FormControlLabel value="Buyer" control={<Radio />} label="Buyer" />
// //             <FormControlLabel
// //               value="Seller"
// //               control={<Radio />}
// //               label="Seller"
// //             />
// //           </RadioGroup>
// //         </FormControl>
// //       </Box>
// //       <Button
// //         variant="contained"
// //         color="primary"
// //         onClick={() => handleChange(value)}
// //       >
// //         Save
// //       </Button>
// //     </Box>
// //   );
// // };

// // export default RoleSelectionModal;
