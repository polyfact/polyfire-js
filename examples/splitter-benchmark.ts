import { readFileSync } from "fs";
import { splitString } from "../lib/index";

const timer = function (name: string) {
    const start = new Date();
    return {
        stop: function () {
            const end = new Date();
            const time = end.getTime() - start.getTime();
            console.log("Timer:", name, "finished in", time, "ms");
        },
    };
};

function benchmark(fn: () => void, iterations: number) {
    const t = timer("Benchmark");
    for (let i = 0; i < iterations; i++) {
        fn();
    }
    t.stop();
}

(async () => {
    const file = await readFileSync("./examples/test-split.txt", "utf8");

    benchmark(() => {
        splitString(file, 500);
    }, 1);
})();
