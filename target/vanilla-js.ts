import PolyfactClientBuilder from "../lib/client";

declare const window: Window & {
    PolyfactClientBuilder: typeof PolyfactClientBuilder;
};

window.PolyfactClientBuilder = PolyfactClientBuilder;
