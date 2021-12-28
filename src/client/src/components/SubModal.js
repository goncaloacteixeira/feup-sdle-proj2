import * as React from 'react';
import { Modal, Box, Grid, List, ListItem, ListItemButton, ListItemAvatar, Avatar, ListItemText, Button, Link } from "@mui/material";
import axios from "axios";

export default function SubModal({open, handleClose, usersList, followingList}) {
    let users = new Array(usersList);
    let following = new Array(followingList);

    const style = {
        position: 'absolute',
        top: '50%',
        left: '50%',
        transform: 'translate(-50%, -50%)',
        bgcolor: 'background.paper',
        boxShadow: 24,
        p: 2,
    };

    return (
        <Modal
            open={open}
            onClose={handleClose}
            aria-labelledby="modal-modal-title"
            aria-describedby="modal-modal-description"
        >
            <Box sx={style}>
                <List dense sx={{ width: '100%', maxWidth: 360, bgcolor: 'background.paper' }}>
                    {users.forEach((username) => {
                        { console.log(username) }
                        const labelId = `checkbox-list-secondary-label-${username}`;
                    })}
                </List>
            </Box>
        </Modal>
    )
}