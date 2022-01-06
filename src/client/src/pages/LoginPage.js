import React from "react";
import {Grid, Box, Typography, FormControl, InputLabel, OutlinedInput, Button, Alert, Link} from '@mui/material';
import Background from '../bg.png'
import {signInWithEmailAndPassword} from "firebase/auth";
import {auth, db} from "../fire";
import {doc, getDoc} from "firebase/firestore";
import axios from "axios";
import { useNavigate } from "react-router-dom";

import '../styles/login.css';

export default function LoginPage() {
  const [email, setEmail] = React.useState(null);
  const [password, setPassword] = React.useState(null);
  const [loginError, setLogginError] = React.useState(null);
  let navigate = useNavigate();
  const handleLogin = (e) => {
    e.preventDefault();

    signInWithEmailAndPassword(auth, email, password)
      .catch((error) => {
        console.error('Login:', error.code);
        switch (error.code) {
          case 'auth/wrong-password':
            return setLogginError("Wrong Password");
          case 'auth/user-not-found':
            return setLogginError("User not found");
          default:
            return setLogginError("Error on Login");
        }
      })
      .then(async (userCredential) => {
        // search for the user on the database
        const user = userCredential.user;
        console.log(user);
        const docSnap = await getDoc(doc(db, "users", user.uid));
        if (docSnap.exists()) {
          console.log("Document data:", docSnap.data());
          const data = docSnap.data();

          axios.post('/p2p/start', {
            username: data.username,
            privKey: data.privKey,
            id: data.id,
            pubKey: data.pubKey,
          }).then((res) => {
            console.log(res.data);
          });
          navigate("/");
        } else {
          console.log("No such document!");
        }
      });
  }

  const style = {
    width: '100vw',
    height: '100vh',
    backgroundImage: `linear-gradient(rgba(0, 0, 0, 0.5), rgba(0, 0, 0, 0.5)), url(${Background})`,
    backgroundSize: 'cover',
    backgroundRepeat: 'no-repeat',
  };

  return (
    <div style={style}>
      <Grid
        container
        spacing={0}
        direction="column"
        alignItems="center"
        justifyContent="center"
        style={{ minHeight: '100vh' }}
      >
        <Grid item className="colorGrid" justifyContent="center" xs={3}>
          <Typography variant="h1" color="primary" mb={8} mt={1} align="center">
            Login
          </Typography>
          {loginError ? <Alert severity="error" >{loginError}</Alert> : null}
          <Grid my={1} component="form" onSubmit={handleLogin} container spacing={2}>
            <Grid item xs={8} align="center">
              <FormControl fullWidth>
                <InputLabel htmlFor="login-email">Email</InputLabel>
                <OutlinedInput
                  className="input"
                  required
                  type="email"
                  onChange={(e) => setEmail(e.target.value)}
                  label="Email"
                  id="login-email"
                  color="primary"/>
              </FormControl>
            </Grid>
            <Grid item xs={8}>
              <FormControl fullWidth>
                <InputLabel htmlFor="login-password">Password</InputLabel>
                <OutlinedInput
                  className="input"
                  required type="password"
                  onChange={(e) => setPassword(e.target.value)}
                  label="Password"
                  id="login-password"/>
              </FormControl>
            </Grid>
            <Grid item xs={8} align="center" mt={2} mb={5}>
              <FormControl>
                <Button variant="contained" type="submit" label="Login" id="login-submit" mb={1}>Login</Button>
                <Typography color="primary">Don't have an account? <Link href="/signup" >Sign Up!</Link></Typography>
              </FormControl>
            </Grid>
          </Grid>
        </Grid>
      </Grid>
    </div>
  );
}