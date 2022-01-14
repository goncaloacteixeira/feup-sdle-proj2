// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
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

export { auth, db };