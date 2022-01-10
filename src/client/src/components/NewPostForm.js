import {FormControl, Grid, InputLabel, OutlinedInput, Alert, InputAdornment, Typography} from "@mui/material";
import Button from "@mui/material/Button";
import React from "react";
import axios from "axios";
import PostAlert from "./PostAlert";

export default function NewPostForm({handleNewPost}) {
    const [chars, setChars] = React.useState(0);

    const handleSubmit = e => {
        e.preventDefault();

        axios.post('/p2p/posts', {post: e.target.post.value})
            .then((res) => {
                e.target.post.value = "";
                setChars(0);
                handleNewPost(res.data.record.posts[res.data.record.posts.length - 1]);
            });
    }

    const onChange = e => {
        if (e.target.value.length >= 240) {
            e.target.value = e.target.value.substring(0, 240);
        }
        setChars(e.target.value.length);
    }

    return (
        <Grid mb={3} onSubmit={handleSubmit} component="form" container spacing={2}>
            <Grid item xs={12}>
                <FormControl fullWidth>
                    <InputLabel name="post" htmlFor="post">New Post</InputLabel>
                    <OutlinedInput
                        maxRows={4}
                        rows={2}
                        multiline
                        name="post"
                        required
                        id="post"
                        label="New Post"
                        onChange={onChange}
                    />
                </FormControl>
            </Grid>
            <Grid item xs={12} alignSelf="end" align="right">
                <Grid container spacing={1} justifyContent="flex-end" alignItems="center">
                    <Grid item>
                        <Typography color="secondary" variant="body2">
                            {`${chars}/240`}
                        </Typography>
                    </Grid>
                    <Grid item>
                        <label htmlFor="post-button">
                            <Button type="submit" variant="contained">POST</Button>
                        </label>
                    </Grid>
                </Grid>

            </Grid>
        </Grid>
    );
}