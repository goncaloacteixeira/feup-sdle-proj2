import {CircularProgress, Grid} from "@mui/material";
import Post from "./Post";
import axios from "axios";
import React from "react";

export default function Feed(props) {
    const [data, setData] = React.useState(null);

    React.useEffect(() => {
        axios.get('/p2p/feed')
            .then((res) => setData(res.data.message));
    }, [])

    return (
        <Grid container justifyContent="stretch" spacing={3}>
            {!data ?
                <CircularProgress/> :
                data.map(x => {
                    return (
                        <Grid key={x.id} item xs={12}>
                            <Post author={x.author} content={x.data}/>
                        </Grid>
                    )
                })
            }
        </Grid>
    )
}