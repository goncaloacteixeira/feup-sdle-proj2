import * as React from 'react';
import {Modal, Box, Grid} from "@mui/material";
import axios from "axios";
import UserCard from "./UserCard";

export default function SubModal({open, handleClose, usersList, followingList}) {
  let usernames = usersList;
  let following = followingList;

  const style = {
    position: 'absolute',
    overflowY: 'scroll',
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%)',
    bgcolor: 'background.paper',
    boxShadow: 24,
    width: '30%',
    height: '60%',
    p: 2,
  };

  const handleClick = (e, uname) => {
    e.preventDefault();

    if (following.includes(uname)) {
      axios.post('/p2p/unsubscribe', {username: uname})
        .then(res => {
          console.log(res.data);
          window.location.reload(false);
        });
    } else {
      axios.post('/p2p/subscribe', {username: uname})
        .then(res => {
          console.log(res.data);
          window.location.reload(false);
        });
    }
  }

  return (
    <Modal
      open={open}
      onClose={handleClose}
      aria-labelledby="modal-modal-title"
      aria-describedby="modal-modal-description"
    >
      <Box sx={style}>
        <Grid container spacing={2} direction="column">
          {usernames.map((value, index) => {
            return (
              <Grid item key={value}>
                <UserCard handler={(e) => handleClick(e, value)} username={value}
                          checked={following.includes(value)}/>
              </Grid>
            )
          })}
        </Grid>
      </Box>
    </Modal>
  )
}