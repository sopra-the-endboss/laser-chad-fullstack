import React, { useContext } from "react";
import { Button, Stack } from "@mui/material";
import ModalContext from "../../context/ModalContext";

const DeleteConfirmationMyShop = ({ setProductToDelete, productToDelete }) => {
  const { handleClose } = useContext(ModalContext);
  const setupDeleteFunction = () => {
    handleClose();
    setProductToDelete(productToDelete);
  };

  return (
    <Stack spacing={2}>
      <span>Are you about to delete: "{productToDelete.product}"</span>
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
export default DeleteConfirmationMyShop;
