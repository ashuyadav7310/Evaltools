# backend/services/speech_to_text.py
from openai import OpenAI
from backend.config import get_settings

settings = get_settings()
client = OpenAI(api_key=settings.OPENAI_API_KEY)

def transcribe_audio(audio_path: str) -> str:
    """
    Convert audio to text using OpenAI Whisper API
    Configured for RAW transcription with fillers and hesitations
    """
    try:
        with open(audio_path, "rb") as audio_file:
            transcript = client.audio.transcriptions.create(
                model="whisper-1",
                file=audio_file,
                response_format="verbose_json",  # Get detailed output
                language="en",  # Specify English for better accuracy
                prompt="Transcribe exactly as spoken including um, uh, like, you know, and all filler words. Include pauses and hesitations.",  # Guide for literal transcription
                temperature=0.0  # Most literal transcription (0.0 = deterministic)
            )
            
            # Extract the text from verbose response
            return transcript.text
            
    except Exception as e:
        raise Exception(f"Speech-to-text failed: {str(e)}")