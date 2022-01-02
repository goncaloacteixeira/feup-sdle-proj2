import {Container, Grid, Link} from "@mui/material";
import LetterAvatar from "./LetterAvatar";
import React from "react";

export default function ProfileUnsub({username}) {
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
            </Grid>
          </Grid>
        </Grid>
      </Grid>
      <hr/>
      <h1>Follow to see this user's posts and information.</h1>
    </Container>
  )
}