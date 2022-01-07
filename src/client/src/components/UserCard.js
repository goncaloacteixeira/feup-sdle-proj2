import {Avatar, Button, Grid, Link} from "@mui/material";
import React from "react";

export default function UserCard({username, checked, handler}) {


    return (<Grid container alignItems="center" justifyContent="space-between">
        <Grid item>
            <Grid container spacing={3} alignItems="center">
                <Grid item>
                    <Avatar>{username[0].toUpperCase()}</Avatar>
                </Grid>
                <Grid item>
                    <Link href={"/profile/" + username} color="inherit" hover="underline"
                          variant="body1">{username}</Link>
                </Grid>
            </Grid>
        </Grid>
        <Grid item>
            <Button
                variant={checked ? "outlined" : "contained"}
                size="small"
                onClick={handler}
                id={username}
            >
                {checked ? "Following" : "Follow"}
            </Button>
        </Grid>
    </Grid>)
}