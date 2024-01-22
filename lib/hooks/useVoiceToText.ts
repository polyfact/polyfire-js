/* eslint-env browser */

import { useState, useEffect, useCallback } from "react";

interface MediaRecorderOptions {
    audioBitsPerSecond?: number;
    bitsPerSecond?: number;
    mimeType?: string;
    videoBitsPerSecond?: number;
}

type UseMediaRecorderOptions = {
    startKey?: string;
    stopKey?: string;
    recorderOption?: Omit<MediaRecorderOptions, "mimeType">;
    mimeType?: string;
    maxDuration?: number;
    onStart?: () => void;
    onStop?: (blobs: BlobPart[]) => void;
    onError?: (error: Error) => void;
    canRecord?: boolean;
};

type UseAudioRecorderReturn = {
    isRecording: boolean;
    startRecording: () => Promise<void>;
    stopRecording: () => void;
    isLoading: boolean;
    setIsLoading: (isLoading: boolean) => void;
};

const useVoiceToText = (
    { stopKey = "ArrowUp", startKey = "ArrowUp", ...args }: UseMediaRecorderOptions = {},
    deps: unknown[] = [],
): UseAudioRecorderReturn => {
    const [isRecording, setIsRecording] = useState<boolean>(false);
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [mediaRecorder, setMediaRecorder] = useState<MediaRecorder | null>(null);

    const stopRecording = useCallback(() => {
        if (mediaRecorder) {
            setIsRecording(false);
            mediaRecorder.stop();
        }
    }, [mediaRecorder, ...deps]);

    const startRecording = useCallback(async () => {
        if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
            try {
                const stream = await navigator.mediaDevices.getUserMedia({
                    audio: true,
                });
                const options: MediaRecorderOptions = {
                    ...args.recorderOption,
                    mimeType: args.mimeType || "audio/webm",
                };

                const recorder = new MediaRecorder(stream, options);
                const blobs: BlobPart[] = [];

                recorder.ondataavailable = (event: BlobEvent) => {
                    blobs.push(event.data);
                };

                recorder.onstart = () => args?.onStart?.();
                recorder.onstop = () => args?.onStop?.(blobs);

                recorder.onerror = () => {
                    args?.onError?.(new Error("Recorder error"));
                };

                if (args.maxDuration) {
                    setTimeout(() => {
                        if (isRecording) {
                            stopRecording();
                        }
                    }, args.maxDuration);
                }

                recorder.start();
                setMediaRecorder(recorder);
                setIsRecording(true);
            } catch (err) {
                console.error("Error accessing the microphone:", err);
                if (err instanceof Error) {
                    args?.onError?.(err);
                }
            }
        } else {
            console.error("MediaDevices API is not supported in this browser.");
        }
    }, [...deps]);

    useEffect(() => {
        const handleKeyDown = (event: KeyboardEvent) => {
            if (event.key === startKey && !isRecording && args.canRecord) {
                startRecording();
            }
        };

        const handleKeyUp = (event: KeyboardEvent) => {
            if (event.key === stopKey && isRecording) {
                stopRecording();
            }
        };

        window.addEventListener("keydown", handleKeyDown);
        window.addEventListener("keyup", handleKeyUp);

        return () => {
            window.removeEventListener("keydown", handleKeyDown);
            window.removeEventListener("keyup", handleKeyUp);
        };
    }, [startKey, stopKey, isRecording, startRecording, stopRecording, ...deps]);

    return {
        isRecording,
        startRecording,
        stopRecording,
        isLoading,
        setIsLoading,
    };
};

export default useVoiceToText;
