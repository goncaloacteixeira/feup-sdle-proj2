import './App.css';
import React from "react";
import CustomAppBar from "./components/AppBar";
import {Alert, AppBar, FormControl, Grid, InputLabel, OutlinedInput, Toolbar} from "@mui/material";
import DevBar from "./components/DevBar";
import Feed from "./components/Feed";
import NewPostForm from "./components/NewPostForm";
import SidePanel from "./components/SidePanel";

function App() {
    const [info, setInfo] = React.useState(null);

    React.useEffect(() => {
        fetch("/p2p/info")
            .then((res) => res.json())
            .then((data) => setInfo(data));
    }, []);

    return (
        <div>
            <CustomAppBar/>
            {!info ? 'Starting node...' : <DevBar data={info.data}></DevBar>}
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

export default App;
