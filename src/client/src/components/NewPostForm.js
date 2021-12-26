import {FormControl, Grid, InputLabel, OutlinedInput} from "@mui/material";
import Button from "@mui/material/Button";
import React from "react";
import axios from "axios";

export default function NewPostForm() {
    const handleSubmit = e => {
        e.preventDefault();

        axios.post('/p2p/posts', {post: e.target.post.value})
            .then((res) => console.log(res));
    }

    return (
        <Grid mb={3} onSubmit={handleSubmit} component="form" container spacing={2}>
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