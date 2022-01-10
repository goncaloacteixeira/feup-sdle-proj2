import React from "react";
import CustomAppBar from "../components/AppBar";
import { Grid } from "@mui/material";
import Feed from "../components/Feed";
import NewPostForm from "../components/NewPostForm";
import SidePanel from "../components/SidePanel";

export default function MainPage() {
  const [newPost, setNewPost] = React.useState(null);

  const handleNewPost = (post) => {
    console.log(post);
    setNewPost(post)
  };

  return (
    <div className="MainPage">
      <CustomAppBar />
      <Grid container>
        <Grid item p={4} xs={4}>
          <SidePanel />
        </Grid>
        <Grid p={4} item xs={8}>
          <NewPostForm handleNewPost={handleNewPost} />
          <Feed newPost={newPost} />
        </Grid>
      </Grid>
    </div>
  );
}
