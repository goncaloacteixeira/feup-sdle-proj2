import React from "react";
import {Grid, List, ListItem, ListItemButton, ListItemAvatar, Avatar, ListItemText, Button, Link } from "@mui/material";
import axios from "axios";

export default function SidePanel(props) {
    //This will change after firebase and we can obtain all users, for now not showing current user or bootstraps
    const removeBootstrapNodes = () => {
        let users = [];
        props.info.discovered.forEach(value => {
            if(value.username !== 'bootstrap node' && value.username !== props.info.data.username) {
                users.push(value);
            }
        });
        return users;
    }

    const makeState = () => {
        let state = new Array(removeBootstrapNodes().length).fill(false);
        removeBootstrapNodes().map((node, index) => {
        props.info.data.subscribed.map((n) => {
            if(node.username === n) {
                state[index] = true;
            }
        })
        })

        return state;
    }

    const [checkedState, setCheckedState] = React.useState(makeState());

    const handleClick = (e, position) => {
        e.preventDefault();
        const updatedCheckedState = checkedState.map((item, index) =>
            index === position ? !item : item);

        if(!checkedState[position]) {
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

    return (
        <Grid container>
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
    );

}