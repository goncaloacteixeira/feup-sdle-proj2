import './App.css';
import React from "react";
import CustomAppBar from "./components/AppBar";
import {Alert} from "@mui/material";
import Feed from "./components/Feed";
import DevModal from "./components/DevModal";

function App() {
    const [data, setData] = React.useState(null);

    React.useEffect(() => {
        fetch("/p2p/start")
            .then((res) => res.json())
            .then((data) => {
                setData(data);
                console.log(data)
            });
    }, []);

    return (
        <div>
            <CustomAppBar/>
            {!data ? 'Starting node...' :
                <Alert severity="success">Node Started! Current PeerId: {data.peerId}<DevModal /></Alert>
            }

            <Feed />
        </div>
    );
}

export default App;
