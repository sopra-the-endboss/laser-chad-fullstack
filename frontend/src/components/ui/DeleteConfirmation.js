import React, { useContext } from "react";
import { Button, Stack } from "@mui/material";
import ModalContext from "../../context/ModalContext";

const DeleteConfirmation = ({ setItemToDelete, itemToDelete }) => {
  const { handleClose } = useContext(ModalContext);
  const setupDeleteFunction = () => {
    handleClose();
    setItemToDelete(itemToDelete);
  };

  return (
    <Stack spacing={2}>
      <span>Are you about to delete: "{itemToDelete.review}"</span>
      <Stack spacing={2} direction={"row"}>
        <Button onClick={handleClose} variant={"outlined"} fullWidth>
          Cancel
        </Button>
        <Button onClick={setupDeleteFunction} variant={"outlined"} fullWidth>
          Delete
        </Button>
      </Stack>
    </Stack>
  );
};
export default DeleteConfirmation;
