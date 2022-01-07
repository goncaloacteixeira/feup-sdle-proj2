import React from "react";
import {Grid, Typography, FormControl, InputLabel, OutlinedInput, Button, Alert, Link} from '@mui/material';
import Background from '../bg.png'
import axios from "axios";

import '../styles/login.css';

export default function SignUpPage() {
  const [newEmail, setNewEmail] = React.useState(null);
  const [newUsername, setNewUsername] = React.useState(null);
  const [newPassword, setNewPassword] = React.useState(null);
  const [newPasswordConfirm, setNewPasswordConfirm] = React.useState(null);
  const [signupError, setSignupError] = React.useState(null);
  const [signupSuccess, setSignupSuccess] = React.useState(false);

  const handleSignup = (e) => {
    e.preventDefault();

    if (newPassword !== newPasswordConfirm) {
      setSignupError("Passwords do not match");
      return "ERROR";
    }

    axios.post('/p2p/signup', {
      username: newUsername,
      email: newEmail,
      password: newPassword
    }).then((res) => {
      switch (res.data.message) {
        case 'OK':
          setSignupError(null);
          return setSignupSuccess(true);
        case 'USERNAME_EXISTS':
          setSignupSuccess(false);
          return setSignupError("Username already exists");
        case 'auth/weak-password':
          setSignupSuccess(false);
          return setSignupError("Weak Password");
        case 'auth/email-already-in-use':
          setSignupSuccess(false);
          return setSignupError("Email already exists");
        default:
          setSignupSuccess(false);
          return setSignupError("Error Signing Up");
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
          <Typography variant="h2" color="primary" mb={8} mt={5} align="center">
            Sign Up
          </Typography>
          <Grid my={1} component="form" onSubmit={handleSignup} container spacing={2}>
            <Grid item xs={8}>
              {signupError ? <Alert severity="error">{signupError}</Alert> : null}
              {signupSuccess ? <Alert severity="success">Account Created! You can now login</Alert> : null}
            </Grid>
            <Grid item xs={8} align="center">
              <FormControl fullWidth>
                <FormControl fullWidth>
                  <InputLabel htmlFor="signup-email">Email</InputLabel>
                  <OutlinedInput
                    required
                    type="email"
                    onChange={(e) => setNewEmail(e.target.value)}
                    label="Email"
                    id="signup-email"/>
                </FormControl>
              </FormControl>
            </Grid>
            <Grid item xs={8}>
              <FormControl fullWidth>
                <InputLabel htmlFor="signup-username">Username</InputLabel>
                <OutlinedInput
                  required
                  onChange={(e) => setNewUsername(e.target.value)}
                  label="Username"
                  id="signup-username"/>
              </FormControl>
            </Grid>
            <Grid item xs={8}>
              <FormControl fullWidth>
                <InputLabel htmlFor="signup-password">Password</InputLabel>
                <OutlinedInput
                  required type="password"
                  onChange={(e) => setNewPassword(e.target.value)}
                  label="Password"
                  id="signup-password"/>
              </FormControl>
            </Grid>
            <Grid item xs={8}>
              <FormControl fullWidth>
                <InputLabel htmlFor="signup-password-confirm">Confirm Password</InputLabel>
                <OutlinedInput
                  required type="password"
                  onChange={(e) => setNewPasswordConfirm(e.target.value)}
                  label="Confirm Password"
                  id="signup-password-confirm"/>
              </FormControl>
            </Grid>
            <Grid item xs={8} align="center" mt={2} mb={5}>
              <FormControl style={{width: '100%'}}>
                <Grid container justifyContent="space-between" alignItems="center">
                  <Grid item>
                    <Typography color="primary">Already have an account? <Link href="/login" >Login!</Link></Typography>
                  </Grid>
                  <Grid item>
                    <Button variant="contained" type="submit" label="SignUp" id="signup-submit" mb={1}>Sign up</Button>
                  </Grid>
                </Grid>
              </FormControl>
            </Grid>
          </Grid>
        </Grid>
      </Grid>
    </div>
  );
}