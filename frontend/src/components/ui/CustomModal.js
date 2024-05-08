import {Box, Button, IconButton, Modal} from "@mui/material";
import React, {useState} from "react";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import ModalContext from "../../context/ModalContext";

const CustomModal = ({openModalText, icon, children}) => {


    const [open, setOpen] = useState(false);
    const handleOpen = (e) => {
        e?.stopPropagation();
        setOpen(true);
    }
    const handleClose = (e) => {
        e?.stopPropagation();
        setOpen(false);
    }

    return (
        <>
            {icon ? (
                <IconButton onClick={e => handleOpen(e)} variant={"outlined"}>
                    {icon}
                </IconButton>
            ) : (
                <Button onClick={e => handleOpen(e)} variant={"outlined"}>{openModalText}</Button>
            )}
            <Modal
                open={open}
                onClose={handleClose}
                aria-labelledby="modal-modal-title"
                aria-describedby="modal-modal-description"
            >
                <Box
                    sx={{
                        display: 'flex',
                        justifyContent: 'center',
                        alignItems: 'center',
                        overflowY: 'auto',
                        padding: '16px',
                        height: '100vh', // Full screen height
                    }}
                    onClick={handleClose}
                >
                    <Card sx={{ width: 700, maxHeight: '90vh', overflowY: 'auto' }} onClick={(e) => e.stopPropagation()}>
                        <CardContent>
                            <ModalContext.Provider value={{ handleClose }}>
                                {children}
                            </ModalContext.Provider>
                        </CardContent>
                    </Card>
                </Box>
            </Modal>
        </>
    )
}; export default CustomModal;
