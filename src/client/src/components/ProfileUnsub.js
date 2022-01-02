import {Button, Container, Grid, Typography} from "@mui/material";
import LetterAvatar from "./LetterAvatar";
import React from "react";
import axios from "axios";

export default function ProfileUnsub({username}) {
  const handleFollow = e => {
    console.log("Following:", username);
    axios.post('/p2p/subscribe', {username: username})
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
              <Button sx={{mx: 3}} onClick={handleFollow} variant="outlined">Follow</Button>
            </Grid>
          </Grid>
        </Grid>
      </Grid>
      <hr/>
      <Typography variant="h4">
        Follow to see this user's posts and information.
      </Typography>
    </Container>
  )
}