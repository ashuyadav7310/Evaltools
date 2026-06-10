import { useState, useRef, useCallback } from 'react';
import { blobToBase64 } from '../lib/audio-utils';

export interface RecordedAudioPayload {
  audioBase64: string;
  mimeType: string;
  durationSeconds: number;
}

export function useAudioRecorder() {
  const [isRecording, setIsRecording] = useState(false);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const mimeTypeRef = useRef("audio/webm");
  const startedAtRef = useRef<number | null>(null);

  const startRecording = useCallback(async () => {
    try {
      if (!navigator.mediaDevices?.getUserMedia || typeof MediaRecorder === "undefined") {
        throw new Error("Audio recording is not supported in this browser");
      }

      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const supportedMimeType =
        ["audio/webm;codecs=opus", "audio/webm", "audio/mp4", "audio/ogg;codecs=opus"]
          .find((candidate) => MediaRecorder.isTypeSupported(candidate)) ?? "";
      const options = supportedMimeType ? { mimeType: supportedMimeType } : undefined;
      const recorder = new MediaRecorder(stream, options);
      
      mediaRecorderRef.current = recorder;
      chunksRef.current = [];
      mimeTypeRef.current = recorder.mimeType || supportedMimeType || "audio/webm";
      startedAtRef.current = performance.now();

      recorder.ondataavailable = (e) => {
        if (e.data.size > 0) {
          chunksRef.current.push(e.data);
        }
      };

      recorder.start(100); // Time slice to ensure we get data
      setIsRecording(true);
    } catch (err) {
      console.error('Failed to start recording:', err);
      throw err;
    }
  }, []);

  const stopRecording = useCallback((): Promise<RecordedAudioPayload> => {
    return new Promise((resolve, reject) => {
      const recorder = mediaRecorderRef.current;
      if (!recorder || recorder.state === 'inactive') {
        reject(new Error('Recorder is not active'));
        return;
      }

      recorder.onstop = async () => {
        setIsRecording(false);
        const blob = new Blob(chunksRef.current, { type: recorder.mimeType });
        const startedAt = startedAtRef.current;
        const durationSeconds = startedAt ? Math.max((performance.now() - startedAt) / 1000, 0) : 0;
        
        // Stop all tracks to release microphone
        recorder.stream.getTracks().forEach(track => track.stop());
        
        try {
          const base64 = await blobToBase64(blob);
          resolve({
            audioBase64: base64,
            mimeType: mimeTypeRef.current,
            durationSeconds: Number(durationSeconds.toFixed(2)),
          });
        } catch (err) {
          reject(err);
        }
      };

      recorder.stop();
    });
  }, []);

  return { isRecording, startRecording, stopRecording };
}
