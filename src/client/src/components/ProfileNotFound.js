import { Container, Grid, Typography } from "@mui/material";

import React from "react";


export default function ProfileNotFound({ username }) {
  return (
    <Container maxWidth="md">
      <Grid
        justifyContent="center"
        alignItems="center"
        direction="column"
        spacing={10}
        container
        height="80vh"
      >
        <Grid item>
          <Typography variant="h3" color="primary">
            User not Found - {username}
          </Typography>
        </Grid>
        <Grid item>
          <Typography variant="h4">The user your were looking for could not be found</Typography>
        </Grid>
      </Grid>
    </Container>
  );
}
