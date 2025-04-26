"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Line } from "react-chartjs-2";
import {
  Chart as ChartJS,
  LineElement,
  CategoryScale,
  LinearScale,
  PointElement,
  Tooltip,
} from "chart.js";

ChartJS.register(
  LineElement,
  CategoryScale,
  LinearScale,
  PointElement,
  Tooltip
);

type ScoreEntry = {
  score: number;
  timestamp: string;
};

type ExerciseEntry = {
  score: number;
  exercise: string;
  timestamp: string;
};

export default function ExerciseSuggestion() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [suggestion, setSuggestion] = useState("");
  const [exerciseLogs, setExerciseLogs] = useState<ExerciseEntry[]>([]);
  const [graphData, setGraphData] = useState<{ date: string; score: number }[]>(
    []
  );

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login");
    }
  }, [status, router]);

  useEffect(() => {
    const stored = localStorage.getItem("exerciseSuggestions");
    if (stored) {
      const parsed: ExerciseEntry[] = JSON.parse(stored);
      setExerciseLogs(parsed);
    }
  }, []);

  useEffect(() => {
    const emotionLogs = JSON.parse(localStorage.getItem("emotionLogs") || "{}");
    const email = localStorage.getItem("currentUserEmail") || "guest";
    const userScores: ScoreEntry[] = emotionLogs[email] || [];

    if (userScores.length) {
      preloadGraph(userScores);
    }
  }, [exerciseLogs]);

  const preloadGraph = (userScores: ScoreEntry[]) => {
    const groupedScores: { [date: string]: number[] } = {};

    userScores.forEach((entry) => {
      const date = new Date(entry.timestamp).toISOString().split("T")[0];
      if (!groupedScores[date]) {
        groupedScores[date] = [];
      }
      groupedScores[date].push(entry.score);
    });

    const today = new Date();
    const preDaysData: { date: string; score: number }[] = [];

    for (let i = 5; i >= 1; i--) {
      const day = new Date(today);
      day.setDate(day.getDate() - i);
      const dayString = day.toISOString().split("T")[0];
      const scores = groupedScores[dayString] || [];
      const avg = scores.length
        ? scores.reduce((a, b) => a + b) / scores.length
        : 0;
      preDaysData.push({ date: dayString, score: parseFloat(avg.toFixed(2)) });
    }

    // Add the first stored exercise score (if any)
    if (exerciseLogs.length > 0) {
      const firstExercise = exerciseLogs[0];
      preDaysData.push({
        date: new Date(firstExercise.timestamp).toISOString().split("T")[0],
        score: firstExercise.score,
      });
    }

    setGraphData(preDaysData);
  };

  const generateSuggestion = () => {
    const emotionLogs = JSON.parse(localStorage.getItem("emotionLogs") || "{}");
    const email = localStorage.getItem("currentUserEmail") || "guest";
    const userScores: ScoreEntry[] = emotionLogs[email] || [];

    if (!userScores.length) {
      setSuggestion("No emotion data found. Please chat first!");
      return;
    }

    const lastScores = userScores.slice(-5);
    const emotionLabels = lastScores.map((entry) =>
      scoreToEmotion(entry.score)
    );

    const moodCount: Record<string, number> = {};
    emotionLabels.forEach((emotion) => {
      moodCount[emotion] = (moodCount[emotion] || 0) + 1;
    });

    const sortedMoods = Object.entries(moodCount).sort((a, b) => b[1] - a[1]);
    const mostCommonEmotion =
      sortedMoods.length > 0 ? sortedMoods[0][0] : "neutral";

    let exercise = "Take a walk outside for 10 minutes";
    if (mostCommonEmotion === "sad") {
      exercise = "Try deep breathing exercises for 5 minutes";
    } else if (mostCommonEmotion === "angry") {
      exercise = "Do some light stretching or yoga";
    } else if (mostCommonEmotion === "anxious") {
      exercise = "Try a short guided meditation session";
    } else if (mostCommonEmotion === "happy") {
      exercise = "Keep a gratitude journal today";
    } else if (mostCommonEmotion === "neutral") {
      exercise = "Listen to calming music and relax";
    }

    const latestScore = lastScores[lastScores.length - 1].score;
    const timestamp = new Date().toISOString();
    const newEntry: ExerciseEntry = { score: latestScore, exercise, timestamp };

    const updatedLogs = [...exerciseLogs, newEntry];
    setExerciseLogs(updatedLogs);
    localStorage.setItem("exerciseSuggestions", JSON.stringify(updatedLogs));

    setSuggestion(
      `Based on your recent mood (${mostCommonEmotion}), we suggest: ${exercise}`
    );
  };

  const scoreToEmotion = (score: number): string => {
    if (score <= -5) return "very sad";
    if (score <= -1) return "sad";
    if (score <= 3) return "anxious";
    if (score <= 6) return "neutral";
    if (score <= 8.5) return "happy";
    return "very excited";
  };

  const chartData = {
    labels: graphData.map((entry) => new Date(entry.date).toLocaleDateString()),
    datasets: [
      {
        label: "Mood Score",
        data: graphData.map((entry) => entry.score),
        borderColor: "#10B981",
        backgroundColor: graphData.map((_, idx) =>
          idx === 5 ? "#F59E0B" : "#6EE7B7"
        ), // 6th point different
        pointBackgroundColor: graphData.map((_, idx) =>
          idx === 5 ? "#F59E0B" : "#10B981"
        ),
        pointBorderColor: graphData.map((_, idx) =>
          idx === 5 ? "#FBBF24" : "#10B981"
        ),
        pointRadius: graphData.map((_, idx) => (idx === 5 ? 8 : 6)),
        pointStyle: graphData.map((_, idx) => (idx === 5 ? "star" : "circle")),
        fill: false,
        tension: 0.4,
      },
    ],
  };

  const chartOptions = {
    scales: {
      y: {
        min: -10,
        max: 10,
        ticks: {
          stepSize: 2,
        },
      },
    },
  };

  if (status === "loading") {
    return (
      <main className="min-h-screen flex items-center justify-center bg-gray-900 text-white">
        <p>Loading...</p>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-gradient-to-br from-blue-900 to-indigo-950 flex flex-col items-center justify-center text-white p-6">
      <h1 className="text-3xl font-bold mb-6">🧘 Exercise Suggestion</h1>

      <button
        onClick={generateSuggestion}
        className="bg-green-500 hover:bg-green-600 text-white font-semibold py-2 px-6 rounded-lg transition-all"
      >
        Generate Suggestion
      </button>

      {suggestion && (
        <div className="mt-8 bg-white text-black rounded-lg p-6 shadow-lg max-w-md text-center">
          <p className="text-lg font-medium">{suggestion}</p>
        </div>
      )}

      <div className="w-full max-w-4xl mt-12 bg-white p-6 rounded-xl shadow-lg">
        <Line data={chartData} options={chartOptions} />
      </div>
    </main>
  );
}
