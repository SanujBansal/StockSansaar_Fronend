/* eslint-disable no-undef */
import React, { createContext, useContext, useState, useEffect } from "react";

// Context.
export const KiteContext = createContext({});

// Create a custom hook to use the context.
export const useKiteScriptContext = () => useContext(KiteContext);

// Provider of context.
const KiteProvider = ({ children }) => {
  const [hasLoaded, setHasLoaded] = useState(false);
  const [isReady, setIsReady] = useState(false);
  const [kite, setKite] = useState();

  /**
   * Extra security measure to check if the script has
   * already been included in the DOM
   */
  const scriptAlreadyExists = () =>
    document.querySelector("script#kite-publisher") !== null;

  /**
   * Append the script to the document.
   * Whenever the script has been loaded it will
   * set the isLoaded state to true.
   */
  const appendSdkScript = () => {
    console.log("script appended0");
    const script = document.createElement("script");
    script.id = "kite-publisher";
    script.src = "https://kite.trade/publisher.js?v=3";
    script.async = true;
    script.defer = true;
    // script.crossOrigin = "anonymous";
    script.onload = () => setHasLoaded(true);
    document.body.append(script);
  };

  /**
   * Runs first time when component is mounted
   * and adds the script to the document.
   */
  useEffect(() => {
    if (!scriptAlreadyExists()) {
      appendSdkScript();
    }
  }, []);

  /**
   * Whenever the script has loaded initialize the
   * FB SDK with the init method. This will then set
   * the isReady state to true and passes that
   * through the context to the consumers.
   */
  useEffect(() => {
    if (hasLoaded === true) {
      KiteConnect.ready(function () {
        // Initialize a new Kite instance.
        // You can initialize multiple instances if you need.
        const kite = new KiteConnect(process.env.REACT_APP_KITE_API_KEY);
        setKite(kite);
        console.log(kite);
      });
      setIsReady(true);
    }
  }, [hasLoaded]);

  return (
    <KiteContext.Provider value={{ isReady, hasLoaded, kite }}>
      {children}
    </KiteContext.Provider>
  );
};

export default KiteProvider;
