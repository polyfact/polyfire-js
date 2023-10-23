import ReactDOM from "react-dom/client";
import { PolyfireProvider } from "polyfire-js/hooks";
import "./index.css";
import App from "./App";
import reportWebVitals from "./reportWebVitals";

const root = ReactDOM.createRoot(document.getElementById("root") as HTMLElement);
root.render(
    <PolyfireProvider project="your_project_slug_here">
        <App />
    </PolyfireProvider>,
);

reportWebVitals();
