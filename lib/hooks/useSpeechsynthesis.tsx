/* eslint-env browser */

import React, {
    useState,
    useEffect,
    useCallback,
    ReactNode,
    createContext,
    useContext,
} from "react";

export type SpeechSynthesisOptions = Partial<SpeechSynthesisUtterance>;

export type UseSpeechSynthesis = {
    togglePlay: (content: string, speechId: string) => void;
    togglePause: () => void;
    speaking: boolean;
    isPaused: boolean;
    activeSpeechId: string | null;
    voices: SpeechSynthesisVoice[];
};

export type SpeechContextType = {
    startSpeaking: (content: string, speechId: string) => void;
    togglePause: () => void;
    speaking: boolean;
    isPaused: boolean;
    activeSpeechId: string | null;
    voices?: SpeechSynthesisVoice[];
};

const defaultOptions: SpeechSynthesisOptions = {
    pitch: 1,
    rate: 1,
};

// Hook

const useSpeechSynthesis = (
    onActiveSpeechChange?: (speechId: string | null) => void,
    options: SpeechSynthesisOptions = defaultOptions,
): UseSpeechSynthesis => {
    const [speaking, setSpeaking] = useState(false);
    const [isPaused, setIsPaused] = useState(false);
    const [voices, setVoices] = useState<SpeechSynthesisVoice[]>([]);
    const [activeSpeechId, setActiveSpeechId] = useState<string | null>(null);

    const stop = useCallback(() => {
        window.speechSynthesis.cancel();
    }, []);

    const pause = useCallback(() => {
        window.speechSynthesis.pause();
    }, []);

    const resume = useCallback(() => {
        window.speechSynthesis.resume();
    }, []);

    const isCurrentlySpeaking = useCallback(() => {
        return window.speechSynthesis.speaking;
    }, []);

    const speakSentence = useCallback(
        (sentence: string, voiceIndex: number) => {
            const utterance = new SpeechSynthesisUtterance(sentence);
            if (voices.length > 0 && voices[voiceIndex]) {
                utterance.voice = voices[voiceIndex];
            }

            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            const utteranceWithOptions = utterance as any;

            Object.keys(options).forEach((key) => {
                if (key in utterance) {
                    utteranceWithOptions[key] = options[key as keyof SpeechSynthesisOptions];
                }
            });

            window.speechSynthesis.speak(utteranceWithOptions as SpeechSynthesisUtterance);
        },
        [voices, options],
    );

    const start = useCallback(
        (text: string, voiceIndex = 0) => {
            const speak = () => {
                const sentences = text.match(/[^.!?]+[.!?]+/g);
                if (sentences) {
                    sentences.forEach((sentence) => speakSentence(sentence, voiceIndex));
                } else {
                    speakSentence(text, voiceIndex);
                }
            };

            if (voices.length > 0 && !isCurrentlySpeaking()) {
                speak();
            }
        },
        [speakSentence, voices],
    );

    useEffect(() => {
        const checkSpeaking = () => {
            setSpeaking(window.speechSynthesis.speaking);
        };
        const interval = setInterval(checkSpeaking, 100);
        return () => clearInterval(interval);
    }, []);

    useEffect(() => {
        setVoices(window.speechSynthesis.getVoices());

        const handleVoicesChanged = () => {
            setVoices(window.speechSynthesis.getVoices());
        };
        window.speechSynthesis.onvoiceschanged = handleVoicesChanged;

        return () => {
            window.speechSynthesis.onvoiceschanged = null;
        };
    }, []);

    const togglePlay = useCallback(
        (content: string, speechId: string) => {
            if (speaking && activeSpeechId === speechId) {
                stop();
                setSpeaking(false);
                setActiveSpeechId(null);
                onActiveSpeechChange?.(null);
            } else {
                start(content);
                setSpeaking(true);
                setIsPaused(false);
                setActiveSpeechId(speechId);
                onActiveSpeechChange?.(speechId);
            }
        },
        [speaking, activeSpeechId, stop, onActiveSpeechChange, start],
    );

    const togglePause = useCallback(() => {
        if (isPaused) {
            resume();
        } else {
            pause();
        }
        setIsPaused(!isPaused);
    }, [isPaused, pause, resume]);

    return {
        togglePlay,
        togglePause,
        speaking,
        isPaused,
        activeSpeechId,
        voices,
    };
};

// Context

const SpeechContext = createContext<SpeechContextType>({
    startSpeaking: () => {},
    togglePause: () => {},
    speaking: false,
    isPaused: false,
    activeSpeechId: null,
});

const useSpeechContext = (): SpeechContextType => useContext(SpeechContext);

export default useSpeechContext;

export const SpeechProvider = ({
    children,
    options,
}: {
    children: ReactNode;
    options?: SpeechSynthesisOptions;
}): ReactNode => {
    const [activeSpeechId, setActiveSpeechId] = useState<string | null>(null);
    const { togglePlay, togglePause, speaking, isPaused, voices } = useSpeechSynthesis(
        (newActiveSpeechId) => {
            setActiveSpeechId(newActiveSpeechId);
        },
        options,
    );

    const startSpeaking = (content: string, speechId: string) => {
        if (activeSpeechId && activeSpeechId !== speechId) {
            togglePlay("", activeSpeechId);
        }
        togglePlay(content, speechId);
    };

    return (
        <SpeechContext.Provider
            value={{
                startSpeaking,
                togglePause,
                speaking,
                isPaused,
                activeSpeechId,
                voices,
            }}
        >
            {children}
        </SpeechContext.Provider>
    );
};
