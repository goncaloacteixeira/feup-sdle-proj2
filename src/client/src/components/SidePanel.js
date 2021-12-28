import React from "react";
import {Grid, List, ListItem, ListItemButton, ListItemAvatar, Avatar, ListItemText, Button, Link } from "@mui/material";

export default function SidePanel(props) {
    console.log(props);

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

    const handleClick = (e) => {
        e.preventDefault();
        //TODO => make post request 

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
                <List dense sx={{ width: '100%', maxWidth: 360, bgcolor: 'background.paper' }}>
                    {removeBootstrapNodes().map((value) => {
                        const labelId = `checkbox-list-secondary-label-${value.username}`;
                        return (
                            <ListItem
                                key={value.username}
                                secondaryAction={
                                    <Button variant={ isSubscribed(value.username) ? 'outlined' : 'contained' } onClick={(e) => { handleClick(e) }} size="small" id={value.username}>{ isSubscribed(value.username) ? 'Following' : 'Follow' }</Button>
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