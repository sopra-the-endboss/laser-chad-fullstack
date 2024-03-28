import {Box, Button, IconButton, Modal} from "@mui/material";
import React from "react";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";


/**
 * TODO: merge from branch #20
 * - endpoints url will get specific id, called in App js
 * - playground consists of database calls
 * - endpoints are defeind in teams / excel
 *
 */


const CustomModal = ({openModalText, icon, children}) => {


    const [open, setOpen] = React.useState(false);
    const handleOpen = () => {
        setOpen(true);
    };
    const handleClose = () => {
        setOpen(false);
    };

    return (
        <React.Fragment>
            {icon ? (
                <IconButton onClick={handleOpen} variant={"outlined"}>
                    {icon}
                </IconButton>
            ) : (
                <Button onClick={handleOpen} variant={"outlined"}>{openModalText}</Button>
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
                            {children}
                        </CardContent>
                    </Card>
                </Box>
            </Modal>
        </React.Fragment>
    )
}; export default CustomModal;