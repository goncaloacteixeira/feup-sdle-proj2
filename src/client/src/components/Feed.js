import {Grid} from "@mui/material";
import Post from "./Post";

export default function Feed(props) {
    return (
        <Grid container justifyContent="stretch" spacing={3}>
            <Grid item xs={12}>
                <Post author="auth1" content="post1" />
            </Grid>
            <Grid item xs={12}>
                <Post author="auth1" content="post1" />
            </Grid>
            <Grid item xs={12}>
                <Post author="auth1" content="post1" />
            </Grid>
            <Grid item xs={12}>
                <Post author="auth1" content="post1" />
            </Grid>
            <Grid item xs={12}>
                <Post author="auth1" content="post1" />
            </Grid>
        </Grid>
    )
}