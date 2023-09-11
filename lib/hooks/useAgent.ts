import { useState, useEffect } from "react";
import usePolyfact from "./usePolyfact";

export const examples: string[] = [
    "Question: What is the elevation range for the area that the eastern sector of the Colorado orogeny extends into?\nThought: I need to search Colorado orogeny, find the area that the eastern sector of the Colorado orogeny extends into, then find the elevation range of the area.\nAction: Search[Colorado orogeny]\nObservation: The Colorado orogeny was an episode of mountain building (an orogeny) in Colorado and surrounding areas.\nThought: It does not mention the eastern sector. So I need to look up eastern sector.\nAction: Lookup[eastern sector]\nObservation: (Result 1 / 1) The eastern sector extends into the High Plains and is called the Central Plains orogeny.\nThought: The eastern sector of Colorado orogeny extends into the High Plains. So I need to search High Plains and find its elevation range.\nAction: Search[High Plains]\nObservation: High Plains refers to one of two distinct land regions\nThought: I need to instead search High Plains (United States).\nAction: Search[High Plains (United States)]\nObservation: The High Plains are a subregion of the Great Plains. From east to west, the High Plains rise in elevation from around 1,800 to 7,000 ft (550 to 2,130 m).[3]\nThought: High Plains rise in elevation from around 1,800 to 7,000 ft, so the answer is 1,800 to 7,000 ft.\nAction: Finish[1,800 to 7,000 ft]",
    'Question: Musician and satirist Allie Goertz wrote a song about the "The Simpsons" character Milhouse, who Matt Groening named after who?\nThought: The question simplifies to "The Simpsons" character Milhouse is named after who. I only need to search Milhouse and find who it is named after.\nAction: Search[Milhouse]\nObservation: Milhouse Mussolini Van Houten is a recurring character in the Fox animated television series The Simpsons voiced by Pamela Hayden and created by Matt Groening.\nThought: The paragraph does not tell who Milhouse is named after, maybe I can look up "named after".\nAction: Lookup[named after]\nObservation: (Result 1 / 1) Milhouse was named after U.S. president Richard Nixon, whose middle name was Milhous.\nThought: Milhouse was named after U.S. president Richard Nixon, so the answer is Richard Nixon.\nAction: Finish[Richard Nixon]',
    "Question: Which documentary is about Finnish rock groups, Adam Clayton Powell or The Saimaa Gesture?\nThought: I need to search Adam Clayton Powell and The Saimaa Gesture, and find which documentary is about Finnish rock groups.\nAction: Search[Adam Clayton Powell]\nObservation: Could not find [Adam Clayton Powell]. Similar: [’Adam Clayton Powell III’, ’Seventh Avenue (Manhattan)’, ’Adam Clayton Powell Jr. State Office Building’, ’Isabel Washington Powell’, ’Adam Powell’, ’Adam Clayton Powell (film)’, ’Giancarlo Esposito’].\nThought: To find the documentary, I can search Adam Clayton Powell (film).\nAction: Search[Adam Clayton Powell (film)]\nObservation: Adam Clayton Powell is a 1989 American documentary film directed by Richard Kilberg. The film is about the rise and fall of influential African-American politician Adam Clayton Powell Jr.[3][4] It was later aired as part of the PBS series The American Experience.\nThought: Adam Clayton Powell (film) is a documentary about an African-American politician, not Finnish rock groups. So the documentary about Finnish rock groups must instead be The Saimaa Gesture.\nAction: Finish[The Saimaa Gesture]",
    "Question: What profession does Nicholas Ray and Elia Kazan have in common?\nThought: I need to search Nicholas Ray and Elia Kazan, find their professions, then find the profession they have in common.\nAction: Search[Nicholas Ray]\nObservation: Nicholas Ray (born Raymond Nicholas Kienzle Jr., August 7, 1911 - June 16, 1979) was an American film director, screenwriter, and actor best known for the 1955 film Rebel Without a Cause.\nThought: Professions of Nicholas Ray are director, screenwriter, and actor. I need to search Elia Kazan next and find his professions.\nAction: Search[Elia Kazan]\nObservation: Elia Kazan was an American film and theatre director, producer, screenwriter and actor.\nThought: Professions of Elia Kazan are director, producer, screenwriter, and actor. So profession Nicholas Ray and Elia Kazan have in common is director, screenwriter, and actor.\nAction: Finish[director, screenwriter, actor]",
    "Question: Which magazine was started first Arthur’s Magazine or First for Women?\nThought: I need to search Arthur’s Magazine and First for Women, and find which was started first.\nAction: Search[Arthur’s Magazine]\nObservation: Arthur’s Magazine (1844-1846) was an American literary periodical published in Philadelphia in the 19th century.\nThought: Arthur’s Magazine was started in 1844. I need to search First for Women next.\nAction: Search[First for Women]\nObservation: First for Women is a woman’s magazine published by Bauer Media Group in the USA.[1] The magazine was started in 1989.\nThought: First for Women was started in 1989. 1844 (Arthur’s Magazine) < 1989 (First for Women), so Arthur’s Magazine was started first.\nAction: Finish[Arthur’s Magazine]",
    "Question: Were Pavel Urysohn and Leonid Levin known for the same type of work?\nThought: I need to search Pavel Urysohn and Leonid Levin, find their types of work, then find if they are the same.\nAction: Search[Pavel Urysohn]\nObservation: Pavel Samuilovich Urysohn (February 3, 1898 - August 17, 1924) was a Soviet mathematician who is best known for his contributions in dimension theory.\nThought: Pavel Urysohn is a mathematician. I need to search Leonid Levin next and find its type of work.\nAction: Search[Leonid Levin]\nAction: Search[Leonid Levin]\nObservation: Leonid Anatolievich Levin is a Soviet-American mathematician and computer scientist.\nThought: Leonid Levin is a mathematician and computer scientist. So Pavel Urysohn and Leonid Levin have the same type of work.\nAction: Finish[yes]",
];

type Line = {
    type: "Question" | "Thought" | "Action" | "Observation";
    arg: string;
};

type Action = {
    type: "Search" | "Finish";
    arg: string;
};

export type Options = {
    provider?: "openai" | "cohere" | "llama" | "";
    model?: string;
    stop?: string[];
    temperature?: number;
    infos?: boolean;
};

type Agent =
    | {
          execute: (
              question: string,
              progress?: (step: string, result: string) => void,
          ) => Promise<string | null>;
          startOrStopAgent: (isRunning: boolean) => void;
          isRunning: boolean;
      }
    | { loading: boolean };

const useAgent = (options: Options = { provider: "openai", model: "gpt-3.5-turbo" }): Agent => {
    const { polyfact } = usePolyfact(null);

    const [isRunning, setIsRunning] = useState(true);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (polyfact) {
            setLoading(false);
        }
    }, [polyfact]);

    const parseLine = (line: string): Line => {
        console.info("Parsing line...");

        const [type, arg] = line.split(": ");

        if (!["Question", "Thought", "Action", "Observation"].includes(type)) {
            throw new Error("Unknown line type");
        }

        return {
            type: type as Line["type"],
            arg,
        };
    };

    const search = async (query: string) => {
        const page = (await polyfact?.generate(query, { ...options, web: true })) as string;

        console.log(page);

        const summary = await polyfact?.generate(
            `Explain the data below to answer to this query: "${query}":"\n\n${page}`,
            options,
        );

        console.log(summary);
        return summary;
    };

    const parseAction = (action: string): Action => {
        console.log("Parsing action...");
        const [type, arg] = action.split("[");

        if (!["Search", "Finish"].includes(type)) {
            throw new Error("Unknown action type");
        }

        return {
            type: type as Action["type"],
            arg: arg.split("]")[0],
        };
    };

    const executeAction = async (action: Action): Promise<string> => {
        console.log("Executing action...");

        if (action.type === "Search") {
            console.log(`Searching for ${action.arg}`);
            return (await search(action.arg as string)) as string;
        } else {
            return "Unknown action. Possible actions are Search[] and Finish[].";
        }
    };

    const execute = async (
        question: string,
        // eslint-disable-next-line @typescript-eslint/no-empty-function
        progress: (step: string, result: string) => void = () => {},
    ): Promise<string | null> => {
        console.info("Starting...");
        let history = `${examples.join("\n\n")}\n\nQuestion: ${question}`;

        let loop = 0;

        while (isRunning) {
            const result = (await polyfact?.generate(history, {
                ...options,
                stop: ["\nObservation:"],
            })) as string;

            progress("question", result);

            history += `\n${result}`;

            const lastLine = parseLine(result.trim().split("\n").slice(-1)[0]);

            if (lastLine.type !== "Action") {
                throw new Error("Expected action");
            }

            const action = parseAction(lastLine.arg);

            console.log({ loop });
            if (action.type === "Finish" || loop === 4) {
                progress("finish", action.arg);
                return action.arg;
            }

            const actionResult = await executeAction(action);

            progress("observation", actionResult);

            history += `\nObservation: ${actionResult}`;
            loop++;
        }

        return null;
    };
    if (polyfact) {
        return { execute, startOrStopAgent: setIsRunning, isRunning };
    }
    return { loading };
};

export default useAgent;
