import {Box, Button, Modal} from "@mui/material";
import React from "react";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";

const CustomModal = ({openModalText, children}) => {


    const [open, setOpen] = React.useState(false);
    const handleOpen = () => {
        setOpen(true);
    };
    const handleClose = () => {
        setOpen(false);
    };
    return (
        <React.Fragment>
            <Button onClick={handleOpen}>{openModalText}</Button>
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
                            {children}
                        </CardContent>
                    </Card>
                </Box>
            </Modal>
        </React.Fragment>
    )
}; export default CustomModal;