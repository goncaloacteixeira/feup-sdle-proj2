import * as React from 'react';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';
import Modal from '@mui/material/Modal';
import axios from 'axios';
import DiscoveredPeersGrid from "./DiscoveredPeersGrid";
import styled from "@emotion/styled";
import { CircularProgress } from '@mui/material';

styled('input')({
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
            });
    };
    const handleClose = () => setOpen(false);

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
                    {!data ? <CircularProgress /> :
                        <div>
                            <DiscoveredPeersGrid peers={data.discovered}/>
                        </div>
                    }
                </Box>
            </Modal>
        </div>
    );
}