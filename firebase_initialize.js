// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyDiXPzPqxWk6m7Y6hnAuBBytHv-A-AJCGQ",
  authDomain: "meteo-vitals-a84cc.firebaseapp.com",
  projectId: "meteo-vitals-a84cc",
  storageBucket: "meteo-vitals-a84cc.appspot.com",
  messagingSenderId: "329885935486",
  appId: "1:329885935486:web:c8e4c5e494bb4b1d3ff52f"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

window.app = app;