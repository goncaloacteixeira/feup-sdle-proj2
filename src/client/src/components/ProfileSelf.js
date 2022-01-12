import {Container, Divider, Grid, Link, Typography} from "@mui/material";
import LetterAvatar from "./LetterAvatar";
import SubModal from "./SubModal";
import Post from "./Post";
import React from "react";

export default function ProfileSelf({username, data}) {
  const [followersOpen, setFollowersOpen] = React.useState(false);
  const [followingOpen, setFollowingOpen] = React.useState(false);

  const handleFollowersOpen = () => setFollowersOpen(data.record.subscribers.length > 0);
  const handleFollowingOpen = () => setFollowingOpen(data.record.subscribed.length > 0);

  return (
    <Container>
      <Grid container spacing={2} sx={{mt: 1, mb: 3}} direction="row" justifyContent="center" alignItems="center">
        <Grid item xs="auto" sx={{mr: 3}}>
          <LetterAvatar name={username} size={5}/>
        </Grid>
        <Grid container item xs="auto" spacing={2} direction="column" justifyContent="center">
          <Grid container item xs="auto" spacing={4} direction="row" alignItems="center">
            <Grid item>
              <Typography variant="h5" component="span"><b>{username}</b></Typography>
            </Grid>
          </Grid>
          <Grid container item spacing={3} direction="row">
            <Grid item>
              <Typography component="span"><b>{data.record.posts.length}</b> posts</Typography>
            </Grid>
            <Grid item>
              <Link className="customLink" underline="none" component="span"
                    onClick={handleFollowersOpen}><b>{data.record.subscribers.length}</b> followers</Link>
              <SubModal open={followersOpen} handleClose={() => setFollowersOpen(false)}
                        usersList={data.record.subscribers} followingList={data.record.subscribed}/>
            </Grid>
            <Grid item>
              <Link className="customLink" underline="none" component="span"
                    onClick={handleFollowingOpen}><b>{data.record.subscribed.length}</b> following</Link>
              <SubModal open={followingOpen} handleClose={() => setFollowingOpen(false)}
                        usersList={data.record.subscribed} followingList={data.record.subscribed}/>
            </Grid>
          </Grid>
        </Grid>
      </Grid>
      <Divider variant="middle"/>
      <Grid container justifyContent="stretch" sx={{mt: 1}} spacing={3}>
        {data.record.posts.map(x => {
          return (
            <Grid key={x.id} item xs={12}>
              <Post timestamp={x.timestamp} author={x.author} content={x.data}/>
            </Grid>
          )
        })}
      </Grid>
    </Container>
  )
}