import { CircularProgress, Grid, LinearProgress, Typography } from "@mui/material";

export default function LoadingPage() {
  return (
    <Grid
      direction="column"
      justifyContent="center"
      alignItems="center"
      spacing={2}
      container
      style={{ height: "100vh", width: "100vw" }}
    >
      <Grid item>
        <CircularProgress />
      </Grid>
      <Grid item>
        <Typography variant="h5">Loading</Typography>
      </Grid>
    </Grid>
  );
}
