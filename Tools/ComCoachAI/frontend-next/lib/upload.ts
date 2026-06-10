import { API_BASE_URL } from "@/lib/api";
import type { ParticipantResult } from "@/lib/types";

export function uploadParticipantAudio(
  participantId: number,
  blob: Blob,
  filename: string,
  onProgress: (percent: number) => void,
): Promise<ParticipantResult> {
  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    const body = new FormData();
    body.set("audio_file", blob, filename);

    xhr.upload.onprogress = (event) => {
      if (event.lengthComputable) onProgress(Math.round((event.loaded / event.total) * 100));
    };
    xhr.onload = () => {
      if (xhr.status >= 200 && xhr.status < 300) {
        resolve(JSON.parse(xhr.responseText));
      } else {
        reject(new Error(xhr.responseText || `Upload failed with ${xhr.status}`));
      }
    };
    xhr.onerror = () => reject(new Error("Network error while uploading audio."));
    xhr.ontimeout = () => reject(new Error("Upload timed out. The recording is still saved locally."));
    xhr.timeout = 180_000;
    xhr.open("POST", `${API_BASE_URL}/participant/submit-audio/${participantId}`);
    xhr.send(body);
  });
}
