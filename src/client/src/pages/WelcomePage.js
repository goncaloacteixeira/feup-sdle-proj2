import React from "react";
import CustomAppBar from "../components/AppBar";
import {signInWithEmailAndPassword} from 'firebase/auth';
import {auth, db} from '../fire';
import {doc, getDoc} from "firebase/firestore";
import axios from "axios";

export default function WelcomePage(props) {
    const [email, setEmail] = React.useState(null);
    const [password, setPassword] = React.useState(null);

    const handleSubmit = (e) => {
        e.preventDefault();
        console.log(`submitted email: 
          ${email} password: ${password}`);
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
                    });

                } else {
                    // doc.data() will be undefined in this case
                    console.log("No such document!");
                }
            });
    }

    return (
        <div>
            <CustomAppBar/>
            <h2>Login</h2>
            <form onSubmit={handleSubmit}>
                <input
                    type="text"
                    onChange={({target}) =>
                        setEmail(target.value)}
                    placeholder="Email"
                />
                <br/>
                <input
                    type="password"
                    onChange={({target}) =>
                        setPassword(target.value)}
                    placeholder="Password"
                />
                <br/>
                <button type="submit">
                    Sign in
                </button>
            </form>
        </div>
    )
}