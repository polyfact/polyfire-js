import PolyfireClientBuilder from "../lib/client";

declare const window: Window & {
    PolyfireClientBuilder: typeof PolyfireClientBuilder;
};

window.PolyfireClientBuilder = PolyfireClientBuilder;
