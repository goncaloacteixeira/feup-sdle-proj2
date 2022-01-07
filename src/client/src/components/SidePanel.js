import React from "react";
import {TextField, InputAdornment} from "@mui/material";
import SearchIcon from '@mui/icons-material/Search';

import {
    Grid,
    CircularProgress,
    Typography,
} from "@mui/material";
import axios from "axios";
import UserCard from "./UserCard";

export default function SidePanel() {
    const [usernames, setUsernames] = React.useState(null);
    const [checkedState, setCheckedState] = React.useState(null);
    const [info, setInfo] = React.useState(null);

    React.useEffect(() => {
        axios.get("/p2p/info").then((res) => setInfo(res.data));
    }, []);

    React.useEffect(() => {
        axios.get("/users").then((res) => setUsernames(res.data));
    }, [info]);

    React.useEffect(() => {
        if (!info) return;
        removeSelf();
        setCheckedState(makeState());
    }, [usernames]);

    const removeSelf = () => {
        const index = usernames.indexOf(info.data.username);
        if (index > -1) {
            usernames.splice(index, 1);
        }
    };

    const makeState = () => {
        let state = new Array(usernames.length).fill(false);
        usernames.map((node, index) => {
            info.data.subscribed.map((n) => {
                if (node === n) {
                    state[index] = true;
                }
            });
        });
        return state;
    };

    const handleClick = (e, position) => {
        e.preventDefault();
        const updatedCheckedState = checkedState.map((item, index) =>
            index === position ? !item : item
        );

        if (!checkedState[position]) {
            axios.post("/p2p/subscribe", {username: e.target.id}).then((res) => {
                if (res.status === 200) {
                    setCheckedState(updatedCheckedState);
                }
            });
        } else {
            axios.post("/p2p/unsubscribe", {username: e.target.id}).then((res) => {
                if (res.status === 200) {
                    setCheckedState(updatedCheckedState);
                }
            });
        }
    };

    const handleSearchChange = (e) => {
        console.log(e.target.value);

        axios.get("/users/" + e.target.value).then((res) => setUsernames(res.data));
    }

    return (
        <Grid container direction="column">
            <Grid item>
                <Grid container justifyContent="space-between" alignItems="center">
                    <Grid item>
                        <Typography variant="h4">
                            Users
                        </Typography>
                    </Grid>
                    <Grid item>
                        <TextField
                            size="small"
                            fullWidth
                            placeholder="Search users"
                            id="outlined-start-adornment"
                            sx={{m: 1}}
                            onChange={handleSearchChange}
                            InputProps={{
                                startAdornment: <InputAdornment position="start"><SearchIcon/></InputAdornment>,
                            }}
                        />
                    </Grid>
                </Grid>
            </Grid>
            <Grid item>
                {!info || !usernames || !checkedState ?
                    <CircularProgress/> :
                    (
                        <Grid container my={2} spacing={2} direction="column">
                            {usernames.map((value, index) => {
                                return (
                                    <Grid item key={value}>
                                        <UserCard handler={(e) => handleClick(e, index)} username={value}
                                                  checked={checkedState[index]}/>
                                    </Grid>
                                )
                            })}
                        </Grid>
                    )
                }
            </Grid>
        </Grid>
    );
}
