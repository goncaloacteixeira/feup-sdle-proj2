import React from "react";
import CustomAppBar from "../components/AppBar";
import {signInWithEmailAndPassword} from 'firebase/auth';
import {auth, db} from '../fire';
import {doc, getDoc} from "firebase/firestore";
import axios from "axios";
import {Button, FormControl, FormHelperText, Grid, Input, InputLabel, OutlinedInput, Typography} from "@mui/material";

import '../styles/welcome.css';

export default function WelcomePage(props) {
    const [email, setEmail] = React.useState(null);
    const [password, setPassword] = React.useState(null);

    const [newEmail, setNewEmail] = React.useState(null);
    const [newUsername, setNewUsername] = React.useState(null);
    const [newPassword, setNewPassword] = React.useState(null);
    const [newPasswordConfirm, setNewPasswordConfirm] = React.useState(null);

    const handleLogin = (e) => {
        e.preventDefault();

        signInWithEmailAndPassword(auth, email, password)
            .catch((error) => {
                console.error('Incorrect username or password');
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
                        if (res.data === "OK") {
                            setNewEmail("");
                            setNewUsername("");
                            setNewPassword("");
                            setNewPasswordConfirm("");
                        }
                    });

                } else {
                    // doc.data() will be undefined in this case
                    console.log("No such document!");
                }
            });
    }

    const handleSignup = (e) => {
        e.preventDefault();

        if (newPassword !== newPasswordConfirm) {
            return "ERROR";
        }

        axios.post('/p2p/signup', {
            username: newUsername,
            email: newEmail,
            password: newPassword
        }).then((res) => console.log(res.data));
    }

    return (
        <div className="welcome">
            <CustomAppBar/>

            <Grid container spacing={5} className="content" alignContent="center" p={5}>
                <Grid item xs={6}>
                    <Typography variant="h3">
                        Login
                    </Typography>
                    <Grid component="form" onSubmit={handleLogin} container spacing={2} my={5}>
                        <Grid item xs={12}>
                            <FormControl fullWidth>
                                <InputLabel htmlFor="login-email">Email</InputLabel>
                                <OutlinedInput
                                    required
                                    type="email"
                                    onChange={(e) => setEmail(e.target.value)}
                                    label="Email"
                                    id="login-email"/>
                            </FormControl>
                        </Grid>
                        <Grid item xs={12}>
                            <FormControl fullWidth>
                                <InputLabel htmlFor="login-password">Password</InputLabel>
                                <OutlinedInput
                                    required type="password"
                                    onChange={(e) => setPassword(e.target.value)}
                                    label="Password"
                                    id="login-password"/>
                            </FormControl>
                        </Grid>
                        <Grid item xs={12} align="right">
                            <FormControl>
                                <Button variant="contained" type="submit" label="Login" id="login-submit">Login</Button>
                            </FormControl>
                        </Grid>
                    </Grid>

                </Grid>
                <Grid item xs={6}>
                    <Typography variant="h3">
                        Signup
                    </Typography>

                    <Grid component="form" onSubmit={handleSignup} container spacing={2} my={5}>
                        <Grid item xs={12}>
                            <FormControl fullWidth>
                                <InputLabel htmlFor="signup-email">Email</InputLabel>
                                <OutlinedInput
                                    required
                                    type="email"
                                    onChange={(e) => setNewEmail(e.target.value)}
                                    label="Email"
                                    id="signup-email"/>
                            </FormControl>
                        </Grid>
                        <Grid item xs={12}>
                            <FormControl fullWidth>
                                <InputLabel htmlFor="signup-username">Username</InputLabel>
                                <OutlinedInput
                                    required
                                    onChange={(e) => setNewUsername(e.target.value)}
                                    label="Username"
                                    id="signup-username"/>
                            </FormControl>
                        </Grid>
                        <Grid item xs={6}>
                            <FormControl fullWidth>
                                <InputLabel htmlFor="signup-password">Password</InputLabel>
                                <OutlinedInput
                                    required type="password"
                                    onChange={(e) => setNewPassword(e.target.value)}
                                    label="Password"
                                    id="signup-password"/>
                            </FormControl>
                        </Grid>
                        <Grid item xs={6}>
                            <FormControl fullWidth>
                                <InputLabel htmlFor="signup-password-confirm">Confirm Password</InputLabel>
                                <OutlinedInput
                                    required type="password"
                                    onChange={(e) => setNewPasswordConfirm(e.target.value)}
                                    label="Confirm Password"
                                    id="signup-password-confirm"/>
                            </FormControl>
                        </Grid>
                        <Grid item xs={12} align="right">
                            <FormControl>
                                <Button variant="contained" type="submit" label="Login" id="signup-submit">Signup</Button>
                            </FormControl>
                        </Grid>
                    </Grid>

                </Grid>
            </Grid>
        </div>
    )
}