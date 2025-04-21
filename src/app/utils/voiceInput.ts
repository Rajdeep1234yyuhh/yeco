/* eslint-disable @typescript-eslint/no-explicit-any */
const SpeechRecognition =
  (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

interface CustomSpeechRecognitionEvent extends Event {
  results: SpeechRecognitionResultList;
}

interface CustomSpeechRecognitionErrorEvent extends Event {
  error: string;
}

export function startVoiceInput(onResult: (transcript: string) => void) {
  if (!SpeechRecognition) {
    alert("Speech recognition is not supported in this browser.");
    return;
  }

  const recognition = new SpeechRecognition();
  recognition.lang = "en-US";
  recognition.interimResults = false;
  recognition.maxAlternatives = 1;

  recognition.onresult = (event: Event) => {
    const speechEvent = event as CustomSpeechRecognitionEvent;
    const transcript = speechEvent.results[0][0].transcript;
    onResult(transcript);
  };

  recognition.onerror = (event: Event) => {
    const errorEvent = event as CustomSpeechRecognitionErrorEvent;
    console.error("Speech recognition error:", errorEvent.error);
  };

  recognition.start();
}
