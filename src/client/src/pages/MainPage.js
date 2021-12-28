import React from "react";
import CustomAppBar from "../components/AppBar";
import {Grid} from "@mui/material";
import DevBar from "../components/DevBar";
import Feed from "../components/Feed";
import NewPostForm from "../components/NewPostForm";
import SidePanel from "../components/SidePanel";

export default function MainPage() {
    const [info, setInfo] = React.useState(null);

    React.useEffect(() => {
        fetch("/p2p/info")
            .then((res) => res.json())
            .then((data) => setInfo(data));
    }, []);

    return (
        <div className="MainPage">
            <CustomAppBar/>
            {!info ? 'Starting node...' : <DevBar data={info.data} />}
            <Grid container>
                <Grid item p={4} xs={3}>
                    <SidePanel />
                </Grid>
                <Grid p={4} item xs={9}>
                    <NewPostForm />
                    <Feed />
                </Grid>
            </Grid>
        </div>
    );
}