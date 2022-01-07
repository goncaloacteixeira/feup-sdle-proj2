import React from "react";
import axios from "axios";
import LoadingPage from "./LoadingPage";
import CustomAppBar from "../components/AppBar";
import DiscoveredPeersGrid from "../components/DiscoveredPeersGrid";
import DevBar from "../components/DevBar";
import {Box} from "@mui/material";

export default function DevPage() {
    const [data, setData] = React.useState(null);

    React.useEffect(() => {
        axios.get('/p2p/info')
            .then(res => setData(res.data));
    }, []);

    if (!data) {
        return <LoadingPage/>
    }

    return (
        <div style={{height: '100vh'}}>
            <CustomAppBar/>
            <DevBar data={data.data}/>
            <Box p={3}>
                <DiscoveredPeersGrid peers={data.discovered}/>
            </Box>

        </div>
    )
}