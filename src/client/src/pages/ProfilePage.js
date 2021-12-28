import React from "react";
import { Container, Grid, Button, Modal } from "@mui/material";
import { useParams } from 'react-router-dom';

import CustomAppBar from "../components/AppBar";
import LetterAvatar from "../components/LetterAvatar";

export default function ProfilePage() {
    const { username } = useParams();

    const [record, setRecord] = React.useState(null);

    React.useEffect(() => {
        fetch("/p2p/records/" + username)
            .then((res) => res.json())
            .then((res) => setRecord(res.message));
    }, []);

    return (
        <div className="ProfilePage">
            <CustomAppBar/>
            {!record ? 'Starting node...' :
                <Container maxWidth="md">
                    <Grid container spacing={2} sx={{ my: 3 }} justifyContent="center" alignItems="center">
                        <Grid item>
                            <LetterAvatar name={username} />
                        </Grid>
                        <Grid item>
                            <Grid container spacing={2} direction="column">
                                <Grid item>
                                    <span>{username}</span>
                                </Grid>
                                <Grid item>
                                    <Grid container spacing={2} direction="row">
                                        <Grid item>
                                            <span><b>{ record.posts.length }</b> posts</span>
                                        </Grid>
                                        <Grid item>
                                            <span><b>{ record.subscribers.length }</b> followers</span>
                                        </Grid>
                                        <Grid item>
                                            <span><b>{ record.subscribed.length }</b> following</span>
                                        </Grid>
                                    </Grid>
                                </Grid>
                            </Grid>
                        </Grid>
                    </Grid>
                    <hr />
                </Container>
            }
        </div>
    );
}