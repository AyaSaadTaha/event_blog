import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth";
import { getStorage } from "firebase/storage";

const firebaseConfig = {
    apiKey: "AIzaSyCv9OgbxWBjjh33y4aT9NHPiCz44tADVE0",
    authDomain: "webblog-ae5d1.firebaseapp.com",
    projectId: "webblog-ae5d1",
    storageBucket: "webblog-ae5d1.firebasestorage.app",
    messagingSenderId: "290819825852",
    appId: "1:290819825852:web:3b6b3aa19319b4170a30b9",
    measurementId: "G-BLL6NFKXE6"
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
export const auth = getAuth(app);
export const storage = getStorage(app);