import * as React from 'react';
import { Modal, Box, List, ListItem, ListItemAvatar, Avatar, ListItemText, Button, Link } from "@mui/material";
import axios from "axios";

export default function SubModal({open, handleClose, usersList, followingList}) {
    let usernames = usersList;
    let following = followingList;

    let [username, setUsername] = React.useState(null);

    React.useEffect(() => {
        axios.get('/p2p/record')
        .then(res => setUsername(res.data.message.username)); 
    }, []);

    const style = {
        position: 'absolute',
        top: '50%',
        left: '50%',
        transform: 'translate(-50%, -50%)',
        bgcolor: 'background.paper',
        boxShadow: 24,
        width: '40%',
        p: 2,
    };

    const handleFollow = (uname) => {
        axios.post('/p2p/subscribe', {username: uname})
            .then(res => {
                console.log(res.data);
                window.location.reload(false);
            });
    }

    const handleUnfollow = (uname) => {
        axios.post('/p2p/unsubscribe', {username: uname})
            .then(res => {
                console.log(res.data);
                window.location.reload(false);
            });
    }

    const getButton = (uname) => {
        if (username === uname) {
            return null;
        }

        return following.includes(uname) ?
            <Button onClick={() => handleUnfollow(uname)} variant="contained">Unfollow</Button>
            :
            <Button onClick={() => handleFollow(uname)} variant="outlined">Follow</Button>
    }

    return (
        <Modal
            open={open}
            onClose={handleClose}
            aria-labelledby="modal-modal-title"
            aria-describedby="modal-modal-description"
        >
            <Box sx={style}>
                <List align="center" dense sx={{ width: '100%', maxWidth: 360, bgcolor: 'background.paper' }}>
                {usernames.map((value, index) => {
                    const labelId = `checkbox-list-secondary-label-${value}`;
                    return (
                        <ListItem
                            key={value}
                            disablePadding
                        >
                            <ListItemAvatar>
                                <Avatar>{value[0]}</Avatar>
                            </ListItemAvatar>
                            <ListItemText id={labelId}>
                                <Link href={"/profile/" + value} color="inherit" underline="hover">{value}</Link>
                            </ListItemText>                          
                            {username !== null ? getButton(value) : null}
                        </ListItem>
                    );
                })}
                </List>
            </Box>
        </Modal>
    )
}