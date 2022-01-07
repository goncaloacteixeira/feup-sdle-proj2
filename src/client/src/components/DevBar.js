import React from "react";
import {Alert, Grid, Button} from "@mui/material";
import DevModal from "./DevModal";
import axios from "axios";

export default function DevBar({data}) {
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

    const exportFeed = () => {
        axios.get('/exports/feed')
            .then((result) => {
                const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(result.data, null, 2));
                const dlAnchorElem = document.createElement('a');
                dlAnchorElem.setAttribute("href",     dataStr     );
                dlAnchorElem.setAttribute("download", "feed.json");
                dlAnchorElem.click();
                dlAnchorElem.remove();
            });
    }

    return (
        <div className="DevBar">
            <Alert severity="success">
                Node Started! Current PeerId: { data.peerId }
                <Grid container>
                    <Grid item>
                        <Button onClick={exportRecord}>Export Record</Button>
                    </Grid>
                    <Grid item>
                        <Button onClick={exportFeed}>Export Feed</Button>
                    </Grid>
                </Grid>
            </Alert>
        </div>   
    )
}