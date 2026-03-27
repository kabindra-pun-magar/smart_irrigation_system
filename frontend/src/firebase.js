import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyBuQJltt9mSSlrVjNCJRjJjQ5xS1NjB4wg",
  authDomain: "smart-irrigation-system-d5d8b.firebaseapp.com",
  projectId: "smart-irrigation-system-d5d8b",
  storageBucket: "smart-irrigation-system-d5d8b.appspot.com",
  messagingSenderId: "235927111168",
  appId: "1:235927111168:web:efcc7d1e6c90958a0bfae5"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// ✅ THIS LINE IS THE MOST IMPORTANT
export const auth = getAuth(app);