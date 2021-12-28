import './App.css';
import React from "react";
import CustomAppBar from "./components/AppBar";
import {Alert, AppBar, FormControl, Grid, InputLabel, OutlinedInput, Toolbar} from "@mui/material";
import DevModal from "./components/DevModal";
import Feed from "./components/Feed";
import NewPostForm from "./components/NewPostForm";
import Button from "@mui/material/Button";
import axios from "axios";
import SidePanel from "./components/SidePanel";

function App() {
    const [info, setInfo] = React.useState(null);

    React.useEffect(() => {
        fetch("/p2p/info")
            .then((res) => res.json())
            .then((data) => setInfo(data));
    }, []);

    // method to export a record to a downloadable JSON file
    const exportRecord = () => {
        axios.get('/exports/record')
            .then((result) => {
                const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(result.data, null, 2));
                const dlAnchorElem = document.createElement('a');
                dlAnchorElem.setAttribute("href",     dataStr     );
                dlAnchorElem.setAttribute("download", "record.json");
                dlAnchorElem.click();
                dlAnchorElem.remove();
            });
    }

    return (
        <div>
            <CustomAppBar/>
            {!info ? 'Starting node...' :
                <Alert severity="success">
                    Node Started! Current PeerId: {info.data.peerId}
                    <Grid container>
                        <Grid item>
                            <DevModal />
                        </Grid>
                        <Grid item>
                            <Button onClick={exportRecord}>Export Record</Button>
                        </Grid>
                    </Grid>
                </Alert>
            }
            <Grid container>
                <Grid item p={4} xs={3}>
                    {
                        !info ? 'Finding users...':  <SidePanel info={info}/>
                    }
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
