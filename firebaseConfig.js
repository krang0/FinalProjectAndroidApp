import { initializeApp } from "firebase/app";
import { initializeAuth, getReactNativePersistence } from 'firebase/auth';
import { getFirestore } from "firebase/firestore";
import ReactNativeAsyncStorage from '@react-native-async-storage/async-storage';

const firebaseConfig = {
  apiKey: "AIzaSyABngniQz7XFMoKX8kuQ0G7B7kxU6pGBUA",
  authDomain: "stylespot-9de3a.firebaseapp.com",
  projectId: "stylespot-9de3a",
  storageBucket: "stylespot-9de3a.firebasestorage.app",
  messagingSenderId: "236277874448",
  appId: "1:236277874448:web:d95af2cb439cf933836f95",
  measurementId: "G-YBWXE592T1"
};

const app = initializeApp(firebaseConfig);
export const auth = initializeAuth(app, {
  persistence: getReactNativePersistence(ReactNativeAsyncStorage)
});
export const db = getFirestore(app);