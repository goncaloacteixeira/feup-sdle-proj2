import {Button, Container, Divider, Grid, Link, Typography} from "@mui/material";
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
      <Grid container spacing={2} sx={{mt: 1, mb: 3}} direction="row" justifyContent="center" alignItems="center">
        <Grid item xs="auto" sx={{mr: 3}}>
          <LetterAvatar name={username} size={5}/>
        </Grid>
        <Grid container item xs="auto" spacing={4} direction="row" alignItems="center">
          <Grid item>
            <Typography variant="h5" component="span">{username}</Typography>
          </Grid>
          <Grid item>
            <Button onClick={handleUnfollow} variant="outlined">Unfollow</Button>
          </Grid>
        </Grid>
      </Grid>
      <Divider variant="middle"/>
      <Typography variant="h5" align="center" sx={{mt: 5}}>
        This user hasn't published on the network yet.
      </Typography>
    </Container>
  )
}