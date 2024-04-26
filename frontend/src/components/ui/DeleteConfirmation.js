import React, { useContext } from 'react';
import { Button, Stack } from "@mui/material";
import ModalContext from "../../context/ModalContext";

const DeleteProductConfirmation = ({ setItemToDelete, itemToDelete, deleteFunction, idToDelete}) => {
    const { handleClose } = useContext(ModalContext);
    const executeDeleteFunction = () => {
        handleClose();
        setItemToDelete(idToDelete)
        deleteFunction();
    }
    return (
        <Stack spacing={2}>
            <span>Are you about to delete: "{itemToDelete}"</span>
            <Stack spacing={2} direction={"row"} >
                <Button onClick={handleClose} variant={"outlined"} fullWidth>Cancel</Button>
                <Button onClick={executeDeleteFunction} variant={"outlined"} fullWidth>Delete</Button>
            </Stack>
        </Stack>
    );
}; export default DeleteProductConfirmation;
