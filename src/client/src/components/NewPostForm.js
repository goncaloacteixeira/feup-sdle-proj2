import {FormControl, Grid, InputLabel, OutlinedInput, Alert, InputAdornment, Typography} from "@mui/material";
import Button from "@mui/material/Button";
import React from "react";
import axios from "axios";
import PostAlert from "./PostAlert";

export default function NewPostForm() {
    const [submitted, setSubmitted] = React.useState(false);
    const [alertOpen, setAlertOpen] = React.useState(true);
    const [chars, setChars] = React.useState(0);

    const handleSubmit = e => {
        e.preventDefault();

        axios.post('/p2p/posts', {post: e.target.post.value})
            .then((res) => console.log(res));

        setSubmitted(true);
        setAlertOpen(true);
        e.target.post.value = "";
        setChars(0);
    }

    const onChange = e => {
        if (e.target.value.length >= 240) {
            e.target.value = e.target.value.substring(0, 240);
        }
        setChars(e.target.value.length);
    }

    return (
        <Grid mb={3} onSubmit={handleSubmit} component="form" container spacing={2}>
            {submitted ?
                <Grid item xs={12}>
                    <PostAlert open={alertOpen} setOpen={setAlertOpen}
                               message="Post submited successfully! Reload to see changes."/>
                </Grid> :
                null
            }
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