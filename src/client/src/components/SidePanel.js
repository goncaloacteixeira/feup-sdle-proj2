import React from "react";
import { TextField, InputAdornment } from "@mui/material";
import SearchIcon from '@mui/icons-material/Search';

import {
  Grid,
  List,
  ListItem,
  ListItemButton,
  ListItemAvatar,
  Avatar,
  ListItemText,
  Button,
  Link,
  CircularProgress,
  Typography,
} from "@mui/material";
import axios from "axios";

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
      axios.post("/p2p/subscribe", { username: e.target.id }).then((res) => {
        if (res.status === 200) {
          setCheckedState(updatedCheckedState);
        }
      });
    } else {
      axios.post("/p2p/unsubscribe", { username: e.target.id }).then((res) => {
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
    <Grid container alignItems="center">
      <Typography mx={2} variant="h4">
          Users
      </Typography>
      <Grid item>
      <TextField 
          size="small"
          fullWidth
          placeholder="Search users"
          id="outlined-start-adornment"
          sx={{ m: 1, width: '25ch' }}
          onChange={handleSearchChange}
          InputProps={{
            startAdornment: <InputAdornment position="start"><SearchIcon /></InputAdornment>,
          }}
        />
      </Grid>
      {!info || !usernames || !checkedState ? (
        <CircularProgress />
      ) : (
        <List
          dense
          sx={{
            width: "100%",
            maxWidth: 360,
            bgcolor: "background.paper",
            position: "relative",
            overflow: "auto",
            maxHeight: 400,
            "& ul": { padding: 0 },
          }}
        >
          {usernames.map((value, index) => {
            const labelId = `checkbox-list-secondary-label-${value}`;
            return (
              <ListItem
                key={value}
                secondaryAction={
                  <Button
                    variant={checkedState[index] ? "outlined" : "contained"}
                    onClick={(e) => handleClick(e, index)}
                    size="small"
                    id={value}
                  >
                    {checkedState[index] ? "Following" : "Follow"}
                  </Button>
                }
                disablePadding
              >
                <ListItemButton>
                  <ListItemAvatar>
                    <Avatar>{value[0].toUpperCase()}</Avatar>
                  </ListItemAvatar>
                  <ListItemText id={labelId}>
                    <Link
                      href={"/profile/" + value}
                      color="inherit"
                      underline="hover"
                    >
                      {value}
                    </Link>
                  </ListItemText>
                </ListItemButton>
              </ListItem>
            );
          })}
        </List>
      )}
    </Grid>
  );
}
