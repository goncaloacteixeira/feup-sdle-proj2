import React from "react";
import CustomAppBar from "../components/AppBar";
import {CircularProgress, Grid} from "@mui/material";
import DevBar from "../components/DevBar";
import Feed from "../components/Feed";
import NewPostForm from "../components/NewPostForm";
import SidePanel from "../components/SidePanel";
import axios from "axios";

export default function MainPage() {
    const [info, setInfo] = React.useState(null);

    // this fancy stuff keeps sending the request for 1 min, while the node is starting
    // so we dont get messed up errors :)
    React.useEffect(() => {
        const startTime = new Date().getTime();
        const interval = setInterval(function () {
            axios.get('/p2p/info').then(res => {
                if (res.status !== 400) {
                    setInfo(res.data);
                    console.log("Got Info");
                    clearInterval(interval);
                }
            });
            if (new Date().getTime() - startTime > 60000) {
                console.log("Hang Up getting info");
                clearInterval(interval);
            }
        }, 2000);
    }, []);

    return (
        <div className="MainPage">
            {!info ?
                <CircularProgress/> :
                <div>
                    <CustomAppBar/>
                    <DevBar data={info.data}/>
                    <Grid container>
                        <Grid item p={4} xs={3}>
                            <SidePanel info={info} />
                        </Grid>
                        <Grid p={4} item xs={9}>
                            <NewPostForm/>
                            <Feed/>
                        </Grid>
                    </Grid>
                </div>
            }
        </div>
    );
}