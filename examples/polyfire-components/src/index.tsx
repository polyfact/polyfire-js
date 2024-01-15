import React from "react";
import ReactDOM from "react-dom/client";
import "./index.css";
import App from "./App";
import reportWebVitals from "./reportWebVitals";
import { PolyfireProvider } from "polyfire-js/hooks";

const root = ReactDOM.createRoot(document.getElementById("root") as HTMLElement);
root.render(
    <PolyfireProvider
        project={process.env.REACT_APP_PROJECT_ID || "test_50"}
        endpoint={process.env.REACT_APP_ENDPOINT || "https://api.polyfire.com"}
    >
        <App />
    </PolyfireProvider>,
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
