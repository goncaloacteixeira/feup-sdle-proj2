import React from "react";
import {Grid, List, ListItem, ListItemButton, ListItemAvatar, Avatar, ListItemText, Button, Link } from "@mui/material";
import axios from "axios";

export default function SidePanel(props) {
    //This will change after firebase and we can obtain all users, for now not showing current user or bootstraps
    const removeBootstrapNodes = () => {
        let users = [];
        props.info.discovered.map((value) => {
            if(value.username !== 'bootstrap node' && value.username !== props.info.data.username) {
                users.push(value);
            }
        })
        return users;
    }

    let positions = [];
    let state = new Array(removeBootstrapNodes().length).fill(false);
    const givePositions = () => {
        removeBootstrapNodes().map((sponsor, index) => {
        props.info.data.subscribed.map((s) => {
            if(sponsor.username === s) {
            positions.push(index);
            }
        })
        })
    }
    givePositions();

    const makeState = () => {
        state.map((s, index) => {
        positions.map((pos) => {
            if(pos === index) {
            state[index] = true
            }
        })
        })
    }
    makeState();
    const [checkedState, setCheckedState] = React.useState(state);

    const handleClick = (e, position) => {
        e.preventDefault();
        const updatedCheckedState = checkedState.map((item, index) =>
            index === position ? !item : item);

        if(!isSubscribed(e.target.id)) {
            axios.post('/p2p/subscribe', {username: e.target.id})
            .then((res) => {
                console.log(res);
                if(res.status === 200) {
                    setCheckedState(updatedCheckedState);
                }
            });
        }
        else {
            axios.post('/p2p/unsubscribe', {username: e.target.id})
            .then((res) => {
                console.log(res);
                if(res.status === 200) {
                    setCheckedState(updatedCheckedState);
                }
            });
        }
        
    }

    const isSubscribed = (username) => {
        let flag = false;
        props.info.data.subscribed.map((sub) => {
            if(sub === username) {
                flag = true;
            }
        })

        return flag;
    }

    return (
        <Grid container>
            <Grid item xs={12}>
                <h2>Users</h2>
                <List dense sx={{
                    width: '100%',
                    maxWidth: 360,
                    bgcolor: 'background.paper',
                    position: 'relative',
                    overflow: 'auto',
                    maxHeight: 400,
                    '& ul': { padding: 0 },
                }}>
                    {removeBootstrapNodes().map((value, index) => {
                        const labelId = `checkbox-list-secondary-label-${value.username}`;
                        return (
                            <ListItem
                                key={value.username}
                                secondaryAction={
                                    <Button variant={ checkedState[index] ? 'outlined' : 'contained' } onClick={(e) => handleClick(e, index)} size="small" id={value.username}>{ checkedState[index] ? 'Following' : 'Follow' }</Button>
                                }
                                disablePadding
                            >
                                <ListItemButton>
                                <ListItemAvatar>
                                    <Avatar>H</Avatar>
                                </ListItemAvatar>
                                <ListItemText id={labelId}>
                                    <Link href="#" color="inherit" underline="hover">{value.username}</Link>
                                </ListItemText>
                                </ListItemButton>
                            </ListItem>
                        );
                    })}
                </List>
            </Grid>
        </Grid>
    );

}