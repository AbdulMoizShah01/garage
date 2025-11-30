import firebase from "firebase/compat/app";
import "firebase/compat/auth";
import "firebase/compat/firestore"; // ✅ Add this for Firestore

// Your web app's Firebase configuration
const firebaseConfig = {
    apiKey: "AIzaSyAuk8EFzGPD0DGYsFFmLdGz4izJvYzMf0c",
    authDomain: "garage-d1fd0.firebaseapp.com",
    projectId: "garage-d1fd0",
    storageBucket: "garage-d1fd0.firebasestorage.app",
    messagingSenderId: "529390858772",
    appId: "1:529390858772:web:09b13a508a5c9984676d01"
};

// Initialize Firebase
const app = firebase.initializeApp(firebaseConfig);
const auth = firebase.auth(app);
const firestore = firebase.firestore(app); // ✅ Correct way for compat

const firebaseSDK = { app, auth, firestore };

export default firebaseSDK;