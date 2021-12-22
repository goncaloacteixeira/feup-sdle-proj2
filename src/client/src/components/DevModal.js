import * as React from 'react';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';
import Modal from '@mui/material/Modal';
import axios from 'axios';
import DiscoveredPeersGrid from "./DiscoveredPeersGrid";
import {FormControl, Grid, IconButton, InputLabel, OutlinedInput} from "@mui/material";
import styled from "@emotion/styled";
import {render} from "react-dom";

const Input = styled('input')({
    display: 'none',
});

const style = {
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%)',
    bgcolor: 'background.paper',
    border: '2px solid #000',
    boxShadow: 24,
    width: '90%',
    p: 4,
};

export default function DevModal() {
    const [open, setOpen] = React.useState(false);
    const [data, setData] = React.useState(null);

    const handleOpen = () => {
        setOpen(true);
        axios.get('/p2p/info')
            .then(res => {
                setData(res.data);
                console.log(res.data);
            });
    };
    const handleClose = () => setOpen(false);

    const handleSubmitUsername = e => {
        e.preventDefault();

        axios.post('/p2p/info',
            {
                username: e.target.username.value,
            }).then((res) => {
            console.log(res);
        })
    }

    return (
        <div>
            <Button onClick={handleOpen}>Open Dev Panel</Button>
            <Modal
                open={open}
                onClose={handleClose}
                aria-labelledby="modal-modal-title"
                aria-describedby="modal-modal-description"
            >
                <Box sx={style}>
                    <Typography id="modal-modal-title" variant="h6" component="h2">
                        Developer Information
                    </Typography>
                    {!data ? "Loading..." :
                        <div>
                            <Grid component="form" onSubmit={handleSubmitUsername} py={3} container spacing={3}>
                                <Grid item xs={10}>
                                    <FormControl fullWidth>
                                        <InputLabel name="username" htmlFor="search-query">Username</InputLabel>
                                        <OutlinedInput required defaultValue={data.data.username} id="username"
                                                       label="Username"/>
                                    </FormControl>
                                </Grid>

                                <Grid item xs={2} alignSelf="center" align="center">
                                    <label htmlFor="search-button">
                                        <Button type="submit" variant="outlined">SUBMIT</Button>
                                    </label>
                                </Grid>

                            </Grid>
                            <DiscoveredPeersGrid peers={data.discovered}/>
                        </div>
                    }

                </Box>
            </Modal>
        </div>
    );
}