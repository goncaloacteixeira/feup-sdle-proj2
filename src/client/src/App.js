import './App.css';
import React from "react";
import CustomAppBar from "./components/AppBar";
import {Alert, AppBar, FormControl, Grid, InputLabel, OutlinedInput, Toolbar} from "@mui/material";
import DevModal from "./components/DevModal";
import Feed from "./components/Feed";
import NewPostForm from "./components/NewPostForm";

function App() {
    const [data, setData] = React.useState(null);

    React.useEffect(() => {
        fetch("/p2p/info")
            .then((res) => res.json())
            .then((data) => setData(data.data));
    }, []);

    return (
        <div>
            <CustomAppBar/>
            {!data ? 'Starting node...' :
                <Alert severity="success">Node Started! Current PeerId: {data.peerId}<DevModal /></Alert>
            }
            <Grid container>
                <Grid item style={{backgroundColor: "blue"}} xs={3}>
                    panel
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
