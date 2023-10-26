import ReactDOM from "react-dom/client";
import { PolyfireProvider } from "polyfire-js/hooks";
import "./index.css";
import App from "./App";
import reportWebVitals from "./reportWebVitals";

const root = ReactDOM.createRoot(document.getElementById("root") as HTMLElement);
root.render(
    <PolyfireProvider project={process.env.REACT_APP_PROJECT_ID || "your_project_id"}>
        <App />
    </PolyfireProvider>,
);

reportWebVitals();
