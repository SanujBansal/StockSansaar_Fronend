import React from "react";
import ReactDOM from "react-dom";
import "./index.css";
import * as Sentry from "@sentry/react";
import { Integrations } from "@sentry/tracing";
import App from "./App";
import reportWebVitals from "./reportWebVitals";
Sentry.init({
  dsn: "https://35e37a041b2c4991aeb97b7e02844ba2@o1041000.ingest.sentry.io/6009970",
  integrations: [new Integrations.BrowserTracing()],

  // Set tracesSampleRate to 1.0 to capture 100%
  // of transactions for performance monitoring.
  // We recommend adjusting this value in production
  tracesSampleRate: 1.0,
});
ReactDOM.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
  document.getElementById("root")
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
