import {Button, Grid, Link} from "@mui/material";
import React from "react";
import LetterAvatar from "./LetterAvatar";

export default function UserCard({username, checked, handler}) {


    return (<Grid container alignItems="center" justifyContent="space-between">
        <Grid item>
            <Grid container spacing={3} alignItems="center">
                <Grid item>
                    <LetterAvatar name={username}/>
                </Grid>
                <Grid item>
                    <Link href={"/profile/" + username} color="inherit" underline="hover"
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