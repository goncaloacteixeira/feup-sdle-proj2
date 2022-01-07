import * as React from 'react';
import AppBar from '@mui/material/AppBar';
import Box from '@mui/material/Box';
import Toolbar from '@mui/material/Toolbar';
import {Link} from "@mui/material";
import {useNavigate} from "react-router-dom";

import "../styles/appbar.css";

import {auth} from '../fire';
import axios from "axios";

export default function CustomAppBar() {
  let navigate = useNavigate();

  const handleLogout = () => {
    axios.post('/p2p/logout')
      .then(async (res) => {
        await auth.signOut();
        localStorage.clear();
        navigate('/');
      })
  }

  return (
    <Box sx={{flexGrow: 1}}>
      <AppBar position="static" color="secondary">
        <Toolbar>
          <Link href="/" variant="h4" className="navbarLink" sx={{flexGrow: 1}}>Tuiter</Link>
          <Link href="/dev" variant="h6" className="navbarLink" sx={{mr: 3}}>Dev</Link>
          <Link href={`/profile/${localStorage.getItem('username')}`} variant="h6" className="navbarLink" sx={{mr: 3}}>Profile</Link>
          <Link onClick={handleLogout} variant="h6" className="navbarLink">Logout</Link>
        </Toolbar>
      </AppBar>
    </Box>
  ) ;
}
