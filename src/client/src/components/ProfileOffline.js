import {Button, Container, Grid, Link, Typography} from "@mui/material";
import LetterAvatar from "./LetterAvatar";
import React from "react";
import axios from "axios";

export default function ProfileOffline({username}) {
  const handleUnfollow = e => {
    axios.post('/p2p/unsubscribe', {username: username})
    .then(res => {
      if (res.data.message !== "ERR_NOT_FOUND") {
        window.location.reload(false);
      }
    });
  }

  return (
    <Container maxWidth="md">
      <Grid container spacing={2} sx={{my: 3}} justifyContent="center" alignItems="center">
        <Grid item>
          <LetterAvatar name={username}/>
        </Grid>
        <Grid item>
          <Grid container spacing={2} direction="column">
            <Grid item>
              <span>{username}</span>
              <Button sx={{mx: 3}} onClick={handleUnfollow} variant="outlined">Unfollow</Button>
            </Grid>
          </Grid>
        </Grid>
      </Grid>
      <hr/>
      <Typography variant="h4">
        This user hasn't published on the network yet.
      </Typography>
    </Container>
  )
}