import React from "react";
import { Container, Grid, Link } from "@mui/material";
import { useParams } from 'react-router-dom';

import '../styles/profile.css';
import CustomAppBar from "../components/AppBar";
import LetterAvatar from "../components/LetterAvatar";
import SubModal from "../components/SubModal";

export default function ProfilePage() {
    const { username } = useParams();

    const [followersOpen, setFollowersOpen] = React.useState(false);
    const [followingOpen, setFollowingOpen] = React.useState(false);

    const handleFollowersOpen = () => setFollowersOpen(true);
    const handleFollowingOpen = () => setFollowingOpen(true);

    const [record, setRecord] = React.useState(null);

    React.useEffect(() => {
        fetch("/p2p/profiles/" + username)
            .then((res) => res.json())
            .then((res) => {
                if (res.message === "ERR_NOT_SUBSCRIBED") {
                    // lida com isto bidon
                    setRecord({
                        username: username,
                        subscribers: [],
                        subscribed: [],
                        posts: [],
                    });
                } else {
                    setRecord(res.message);
                }
            });
    }, []);

    let followersList;
    let followingList;
    if (record) {
        followersList = record.subscribers;
        followingList = record.subscribed;
    }
    

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
                                            <Link className="customLink" underline="none" onClick={handleFollowersOpen}><b>{ followersList.length }</b> followers</Link>
                                            <SubModal open={followersOpen} handleClose={() => setFollowersOpen(false)} usersList={followersList} followingList={followersList} ></SubModal>
                                        </Grid>
                                        <Grid item>
                                            <Link className="customLink" underline="none" onClick={handleFollowingOpen}><b>{ followersList.length }</b> following</Link>
                                            <SubModal open={followingOpen} handleClose={() => setFollowingOpen(false)} usersList={followersList} followingList={followersList} ></SubModal>
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