export async function blobToBase64(blob: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      if (typeof reader.result === 'string') {
        // Remove the data URL prefix (e.g., "data:audio/webm;base64,")
        const base64 = reader.result.split(',')[1];
        resolve(base64);
      } else {
        reject(new Error('Failed to convert blob to base64'));
      }
    };
    reader.onerror = reject;
    reader.readAsDataURL(blob);
  });
}

export function playBase64Audio(base64Audio: string, format: string = 'mp3'): Promise<number> {
  return new Promise((resolve, reject) => {
    try {
      const audioUrl = `data:audio/${format};base64,${base64Audio}`;
      const audio = new Audio(audioUrl);
      const startedAt = performance.now();
      
      audio.onended = () => {
        const durationSeconds = Math.max((performance.now() - startedAt) / 1000, 0);
        resolve(durationSeconds);
      };
      audio.onerror = (e) => reject(e);
      
      audio.play().catch(reject);
    } catch (e) {
      reject(e);
    }
  });
}
