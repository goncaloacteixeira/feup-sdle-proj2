import {Container, Grid, Link} from "@mui/material";
import LetterAvatar from "./LetterAvatar";
import SubModal from "./SubModal";
import Post from "./Post";
import React from "react";
import axios from "axios";
import { Button } from "@mui/material";

export default function ProfileSelf({username, data}) {
  const [followersOpen, setFollowersOpen] = React.useState(false);
  const [followingOpen, setFollowingOpen] = React.useState(false);

  const handleFollowersOpen = () => setFollowersOpen(true);
  const handleFollowingOpen = () => setFollowingOpen(true);

  return (
    <Container maxWidth="md">
      <Grid container spacing={2} sx={{my: 3}} justifyContent="center" alignItems="center">
        <Grid item>
          <LetterAvatar name={username}/>
        </Grid>
        <Grid item>
          <Grid container spacing={2} direction="column">
            <Grid item>
              <span>{username}</span>
            </Grid>
            <Grid item>
              <Grid container spacing={2} direction="row">
                <Grid item>
                  <span><b>{data.record.posts.length}</b> posts</span>
                </Grid>
                <Grid item>
                  <Grid container spacing={2} direction="row">
                    <Grid item>
                      <Link className="customLink" underline="none"
                            onClick={handleFollowersOpen}><b>{data.record.subscribers.length}</b> followers</Link>
                      <SubModal open={followersOpen} handleClose={() => setFollowersOpen(false)}
                                usersList={data.record.subscribers} followingList={data.record.subscribed}/>
                    </Grid>
                    <Grid item>
                      <Link className="customLink" underline="none"
                            onClick={handleFollowingOpen}><b>{data.record.subscribed.length}</b> following</Link>
                      <SubModal open={followingOpen} handleClose={() => setFollowingOpen(false)}
                                usersList={data.record.subscribed} followingList={data.record.subscribed}/>
                    </Grid>
                  </Grid>
                </Grid>
              </Grid>
            </Grid>
          </Grid>
        </Grid>
      </Grid>
      <hr/>
      <Grid container justifyContent="stretch" spacing={3}>
        {data.record.posts.map(x => {
          return (
            <Grid key={x.id} item xs={12}>
              <Post author={x.author} content={x.data}/>
            </Grid>
          )
        })}
      </Grid>
    </Container>
  )
}