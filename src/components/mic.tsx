import { useState } from "react";

export default function mic() {
  const [input, setInput] = useState("");
  const [speakEnabled, setSpeakEnabled] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [interimTranscript, setInterimTranscript] = useState("");
  const sendMessage = async (value?: string) => {
    const content = value ?? input;
    if (!content.trim()) return;

    const emotion = analyzeEmotion(content);
    const userKey = user?.email || "guest";
    const logs = JSON.parse(localStorage.getItem("emotionLogs") || "{}");

    localStorage.setItem(
      "emotionLogs",
      JSON.stringify({
        ...logs,
        [userKey]: [...(logs[userKey] || []), emotion],
      })
    );

    if (checkForCrisis(content)) {
      setCrisisDetected(true);
      return;
    }
    setCrisisDetected(false);

    const systemPrompt: Message = {
      role: "system",
      content: `You are a compassionate, supportive mental health companion...`,
    };

    const newMessages: Message[] = [
      ...(messages.find((m) => m.role === "system")
        ? messages
        : [systemPrompt, ...messages]),
      { role: "user", content },
    ];

    setMessages(newMessages);
    setInput("");
    setStreamingMessage("");
    setIsStreaming(true);

    const res = await fetch("/api/chat", {
      method: "POST",
      body: JSON.stringify({ model: "yeco", messages: newMessages }),
    });

    const reader = res.body?.getReader();
    const decoder = new TextDecoder();
    let fullText = "";

    while (true) {
      const { value, done } = await reader!.read();
      if (done) break;
      const chunk = decoder.decode(value);
      const lines = chunk.split("\n").filter((l) => l.trim().startsWith("{"));
      for (const line of lines) {
        try {
          const json = JSON.parse(line);
          if (json.message?.content) {
            fullText += json.message.content;
            setStreamingMessage(fullText);
          }
        } catch (err) {
          console.error("Streaming error:", err);
        }
      }
    }

    setMessages([...newMessages, { role: "assistant", content: fullText }]);
    setStreamingMessage("");
    setIsStreaming(false);
    speakText(fullText);
  };
  const startVoiceInput = () => {
    const SpeechRecognition =
      (window as any).SpeechRecognition ||
      (window as any).webkitSpeechRecognition;

    if (!SpeechRecognition) {
      alert("Speech recognition not supported.");
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.lang = "en-US";
    recognition.interimResults = true;

    recognition.onstart = () => {
      setIsListening(true);
      setInterimTranscript("");
    };

    recognition.onend = () => {
      setIsListening(false);
    };

    recognition.onresult = (event: any) => {
      let finalTranscript = "";
      let interim = "";

      for (let i = event.resultIndex; i < event.results.length; i++) {
        const transcript = event.results[i][0].transcript;
        if (event.results[i].isFinal) {
          finalTranscript += transcript;
        } else {
          interim += transcript;
        }
      }

      if (finalTranscript) {
        setInput(finalTranscript);
        sendMessage(finalTranscript);
      } else {
        setInterimTranscript(interim);
      }
    };

    recognition.start();
  };
  return (
    <div>
      <button
        onClick={startVoiceInput}
        className={`p-2 rounded-lg transition ${
          isListening
            ? "bg-red-600 animate-pulse"
            : "bg-gray-600 hover:bg-gray-500"
        }`}
        title="Voice input"
      >
        <Mic size={20} className={isListening ? "animate-bounce" : ""} />
      </button>
    </div>
  );
}
