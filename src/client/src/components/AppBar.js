import * as React from 'react';
import AppBar from '@mui/material/AppBar';
import Box from '@mui/material/Box';
import Toolbar from '@mui/material/Toolbar';
import Typography from '@mui/material/Typography';
import {Button} from "@mui/material";

import {auth} from '../fire';

export default function CustomAppBar() {
    const handleLogout = () => {
        auth.signOut();
    }

    return (
        <Box sx={{ flexGrow: 1 }}>
            <AppBar position="static">
                <Toolbar>
                    <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
                        SDLE PROJECT
                    </Typography>
                    <Button style={{color: "white"}} onClick={handleLogout} variant="text">Log Out</Button>
                </Toolbar>
            </AppBar>
        </Box>
    );
}
