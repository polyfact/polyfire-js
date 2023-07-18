import { getEncoding, TiktokenEncoding } from "js-tiktoken";

function stirling(n: number) {
    return (n / Math.E) ** n * Math.sqrt(2.0 * Math.PI * n);
}

function binomialScore(curr: number, max: number) {
    const n = 30.0;
    const k = (n - 2.0) * (curr / max) + 1;
    return Math.sqrt((stirling(n) / (stirling(k) * stirling(n - k))) * 0.5 ** k * 0.5 ** (n - k));
}

function newLineScore(s: string, i: number) {
    if (s.length === i + 1 || s[i] !== "\n") {
        return 1.0;
    }

    if (s[i + 1] === "\n") {
        return 50.0;
    }
    return 5.0;
}

function binarySplit(s: string) {
    let maxScore = 0.0;
    let maxScoreI = 0;
    let lastNewLine = -1;
    for (let i = 0; i < s.length; i++) {
        let score = binomialScore(i, s.length) * newLineScore(s, i);

        if (s[i] === "\n") {
            if (s[lastNewLine + 1] !== "\t") {
                score *= 50.0;
            }
            lastNewLine = i;
        }

        if (s[i] === " ") {
            score *= 2.0;
        }

        if (score > maxScore) {
            maxScore = score;
            maxScoreI = i;
        }
    }

    return [s.slice(0, maxScoreI), s.slice(maxScoreI)];
}

function tokenCount(s: string, model: TiktokenEncoding = "cl100k_base"): number {
    const enc = getEncoding(model);
    return enc.encode(s).length;
}

export function splitString(s: string, maxToken: number): string[] {
    if (tokenCount(s) < maxToken) {
        return [s];
    }

    const [left, right] = binarySplit(s);

    return [...splitString(left, maxToken), ...splitString(right, maxToken)];
}
