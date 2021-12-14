import { getAuth } from "@firebase/auth";
import axios from "axios";
import { initializeApp } from "firebase/app";
import React, { useEffect, useState } from "react";
import CryptoJS from "crypto-js";
import { BASE_URL } from "./constants/appConstants";
// eslint-disable-next-line @typescript-eslint/no-unused-vars
const app = initializeApp({
  apiKey: process.env.REACT_APP_FIREBASE_KEY,
  authDomain: process.env.REACT_APP_FIREBASE_DOMAIN,
  projectId: process.env.REACT_APP_FIREBASE_PROJECT_ID,
  storageBucket: process.env.REACT_APP_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.REACT_APP_FIREBASE_SENDER_ID,
  appId: process.env.REACT_APP_FIREBASE_APP_ID,
  measurementId: process.env.REACT_APP_FIREBASE_MEASUREMENT_ID,
});
const auth = getAuth();
axios.interceptors.request.use(async (config) => {
  if (config.url?.includes(BASE_URL)) {
    console.log(config);
    config!.params = {
      ...config.params,
      token: CryptoJS.AES.encrypt(
        await auth.currentUser?.getIdToken(),
        process.env.REACT_APP_TOKEN_KEY
      ).toString(),
    };
  }
  return config;
});
export const AuthContext = React.createContext({ auth });

export const AuthProvider = ({ children }: any) => {
  const [pending, setPending] = useState(true);

  useEffect(() => {
    auth.onAuthStateChanged((user: any) => {
      setPending(false);
    });
  }, []);

  if (pending) {
    return (
      <div className="loadingContainer">
        <div className="loader"></div>
      </div>
    );
  }

  return (
    <AuthContext.Provider
      value={{
        auth,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
