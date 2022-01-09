import {Button, Container, Divider, Grid, Typography} from "@mui/material";
import LetterAvatar from "./LetterAvatar";
import React from "react";
import axios from "axios";

export default function ProfileUnsub({username}) {
  const handleFollow = e => {
    console.log("Following:", username);
    axios.post('/p2p/subscribe', {username: username})
      .then(res => {
        console.log("Finished Request")
        if (res.data.message !== "ERR_NOT_FOUND") {
          window.location.reload();
        }
      });
  }

  return (
    <Container>
      <Grid container spacing={2} sx={{mt: 1, mb: 3}} direction="row" justifyContent="center" alignItems="center">
        <Grid item xs="auto" sx={{mr: 3}}>
          <LetterAvatar name={username} size={5}/>
        </Grid>
        <Grid container item xs="auto" spacing={4} direction="row" alignItems="center">
          <Grid item>
            <Typography variant="h5" component="span"><b>{username}</b></Typography>
          </Grid>
          <Grid item>
            <Button onClick={handleFollow} variant="contained">Follow</Button>
          </Grid>
        </Grid>
      </Grid>
      <Divider variant="middle"/>
      <Typography variant="h5" align="center" sx={{mt: 5}}>
        Follow to see this user's posts and information.
      </Typography>
    </Container>
  )
}