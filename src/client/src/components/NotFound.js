import { Grid, Typography } from "@mui/material";

export default function NotFound() {
  return (
    <Grid
    style={{height: '100vh'}}
      justifyContent="center"
      alignItems="center"
      direction="column"
      spacing={10}
      container
    >
      <Grid item>
        <Typography variant="h1" color="primary">
          Page not Found
        </Typography>
      </Grid>
      <Grid item>
        <Typography variant="h4">The content could not be found</Typography>
      </Grid>
    </Grid>
  );
}
