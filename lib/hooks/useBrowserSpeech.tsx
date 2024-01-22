/* eslint-env browser */

import React, {
    useState,
    useEffect,
    useCallback,
    ReactNode,
    createContext,
    useContext,
} from "react";

export type BrowserSpeechOptions = Partial<SpeechSynthesisUtterance>;

export type UseBrowserSpeech = {
    togglePlay: (content: string, speechId: string) => void;
    togglePause: () => void;
    speaking: boolean;
    isPaused: boolean;
    activeSpeechId: string | null;
    voices: SpeechSynthesisVoice[];
};

export type BrowserSpeechContextType = {
    startSpeaking: (content: string, speechId: string) => void;
    togglePause: () => void;
    speaking: boolean;
    isPaused: boolean;
    activeSpeechId: string | null;
    voices?: SpeechSynthesisVoice[];
};

const defaultOptions: BrowserSpeechOptions = {
    pitch: 1,
    rate: 1,
};

// Hook

export const useBrowserSpeech = (
    onActiveSpeechChange?: (speechId: string | null) => void,
    options: BrowserSpeechOptions = defaultOptions,
): UseBrowserSpeech => {
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
                    utteranceWithOptions[key] = options[key as keyof BrowserSpeechOptions];
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

const BrowserSpeechContext = createContext<BrowserSpeechContextType>({
    startSpeaking: () => {},
    togglePause: () => {},
    speaking: false,
    isPaused: false,
    activeSpeechId: null,
});

export const useBrowserSpeechContext = (): BrowserSpeechContextType =>
    useContext(BrowserSpeechContext);

export const BrowserSpeechProvider = ({
    children,
    options,
}: {
    children: ReactNode;
    options?: BrowserSpeechOptions;
}): ReactNode => {
    const [activeSpeechId, setActiveSpeechId] = useState<string | null>(null);
    const { togglePlay, togglePause, speaking, isPaused, voices } = useBrowserSpeech(
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
        <BrowserSpeechContext.Provider
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
        </BrowserSpeechContext.Provider>
    );
};
