import {FormControl, Grid, InputLabel, OutlinedInput, Alert} from "@mui/material";
import Button from "@mui/material/Button";
import React from "react";
import axios from "axios";
import PostAlert from "./PostAlert";

export default function NewPostForm() {
    const [submitted, setSubmitted] = React.useState(false);
    const [alertOpen, setAlertOpen] = React.useState(true);

    const handleSubmit = e => {
        e.preventDefault();

        axios.post('/p2p/posts', {post: e.target.post.value})
            .then((res) => console.log(res));

        setSubmitted(true);
        setAlertOpen(true);
        e.target.post.value = "";
    }

    return (
        <Grid mb={3} onSubmit={handleSubmit} component="form" container spacing={2}>
            <Grid item xs={12}>
            {submitted ? <PostAlert open={alertOpen} setOpen={setAlertOpen} message="Post submited successfully! Reload to see changes."/> : null}

            </Grid>
            <Grid item xs={12}>
                <FormControl fullWidth>
                    <InputLabel name="post" htmlFor="post">New Post</InputLabel>
                    <OutlinedInput multiline name="post" required id="post" label="New Post"/>
                </FormControl>
            </Grid>
            <Grid item xs={12} alignSelf="end" align="right">
                <label htmlFor="post-button">
                    <Button type="submit" variant="outlined">POST</Button>
                </label>
            </Grid>
        </Grid>
    );
}