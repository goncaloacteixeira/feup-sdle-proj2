// Import the functions you need from the SDKs you need
const { initializeApp } = require("firebase/app");
const { getAnalytics } = require("firebase/analytics");
const { getAuth, createUserWithEmailAndPassword } = require ("firebase/auth");
const { getFirestore } =  require("firebase/firestore");
const { collection, query, where, getDocs, setDoc, doc} = require("firebase/firestore");

// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
    apiKey: "AIzaSyBfKvjwNiXnJuQKjSuvBHrZeJ4L7Rbyf3c",
    authDomain: "sdle-project.firebaseapp.com",
    projectId: "sdle-project",
    storageBucket: "sdle-project.appspot.com",
    messagingSenderId: "163428417482",
    appId: "1:163428417482:web:eeb508986a045752d95933",
    measurementId: "G-HKHLFLNPR3"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

const auth = getAuth(app);
const db = getFirestore();

const get_user_id_by_username = async (username) => {
    const usersRef = collection(db, "users");
    const q = query(usersRef, where("username", "==", username));

    const querySnapshot = await getDocs(q);
    if (querySnapshot.docs.length === 0) {
        return null;
    }

    return querySnapshot.docs[0].data();
}

const signup_create_peer_id = async (email, password, username, peerIdJSON) => {
    const usersRef = collection(db, "users");
    const q = query(usersRef, where("username", "==", username));

    const querySnapshot = await getDocs(q);
    if (querySnapshot.docs.length !== 0) {
        return "USERNAME_EXISTS";
    }

    const auth = getAuth();

    return new Promise(resolve => {
        createUserWithEmailAndPassword(auth, email, password)
            .then(async (userCredential) => {
                // Signed in
                const user = userCredential.user;
                // Add a new document in collection "cities"
                await setDoc(doc(db, "users", user.uid), {
                    id: peerIdJSON.id,
                    pubKey: peerIdJSON.pubKey,
                    privKey: peerIdJSON.privKey,
                    username: username
                });
                return resolve("OK");
            })
            .catch((error) => {
                console.log(error.code);
                return resolve(error.code)
            });
    })

}

const get_all_usernames = async () => {
    let data = [];
    const querySnapshot = await getDocs(collection(db, "users"));
    for await(const doc of querySnapshot.docs) {
        data.push(doc.data().username);
    }
    return data;
}

const get_username = async (queryStr) => {
    let data = [];
    const usersRef = collection(db, "users");
    const q = query(usersRef, where("username", "==", queryStr));
    const querySnapshot = await getDocs(q);
    
    for (const doc of querySnapshot.docs) {
        data.push(doc.data().username);
    }

    return data;
}


module.exports = { auth, db, get_user_id_by_username, signup_create_peer_id, get_all_usernames, get_username };

