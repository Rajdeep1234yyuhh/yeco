"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import ExerciseChart from "../../components/ExerciseChart";
import ExerciseButton from "../utils/ExerciseButton";
import ExerciseResult from "../../components/ExerciseResult";

type ScoreEntry = {
  score: number;
  timestamp: string;
};

type ExerciseEntry = {
  score: number;
  exercise: string;
  timestamp: string;
  emotion?: string; // Added emotion property
};

const ExerciseSuggestion = () => {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [suggestion, setSuggestion] = useState("");
  const [exerciseLogs, setExerciseLogs] = useState<ExerciseEntry[]>([]);
  const [graphData, setGraphData] = useState<
    { date: string; score: number; emotion?: string; exercise?: string }[]
  >([]);

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/");
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

    const exerciseSuggestions = JSON.parse(
      localStorage.getItem("exerciseSuggestions") || "[]"
    );

    // Build exercise logs
    const exerciseLogsByDate: { [date: string]: ExerciseEntry } = {};
    exerciseSuggestions.forEach((ex: ExerciseEntry) => {
      const exDate = new Date(ex.timestamp).toISOString().split("T")[0];
      exerciseLogsByDate[exDate] = ex; // if multiple exercises, last one wins
    });

    const allDates = new Set([
      ...Object.keys(groupedScores),
      ...Object.keys(exerciseLogsByDate),
    ]);

    const mergedData: {
      date: string;
      score: number;
      emotion?: string;
      exercise?: string;
    }[] = [];

    allDates.forEach((date) => {
      const scores = groupedScores[date] || [];
      const exercise = exerciseLogsByDate[date];

      let avgScore = 0;
      if (scores.length > 0) {
        avgScore = scores.reduce((a, b) => a + b, 0) / scores.length;
      }

      if (exercise) {
        // If exercise exists for this date, we prioritize it
        mergedData.push({
          date,
          score: exercise.score,
          emotion: "exercise_suggestion",
          exercise: exercise.exercise,
        });
      } else {
        mergedData.push({
          date,
          score: parseFloat(avgScore.toFixed(2)),
          emotion: scoreToEmotion(avgScore),
        });
      }
    });

    // Sort by date
    mergedData.sort((a, b) => (a.date > b.date ? 1 : -1));

    setGraphData(mergedData);
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
    const todayDateString = new Date().toISOString().split("T")[0];

    const newEntry: ExerciseEntry = {
      score: latestScore,
      exercise,
      timestamp,
      emotion: mostCommonEmotion,
    };

    const updatedLogs = [...exerciseLogs, newEntry];
    setExerciseLogs(updatedLogs);
    localStorage.setItem("exerciseSuggestions", JSON.stringify(updatedLogs));

    setSuggestion(
      `Based on your recent mood (${mostCommonEmotion}), we suggest: ${exercise}`
    );

    const newGraphPoint = {
      date: todayDateString,
      score: latestScore,
      emotion: mostCommonEmotion,
      exercise: exercise,
    };

    setGraphData((prev) => {
      const today = new Date().toISOString().split("T")[0];

      let updated = [...prev];
      const existingIndex = updated.findIndex((entry) => entry.date === today);

      if (existingIndex !== -1) {
        // If today's entry exists, update it
        updated[existingIndex] = {
          ...updated[existingIndex],
          score: latestScore,
          emotion: mostCommonEmotion,
          exercise: exercise,
        };
      } else {
        // Otherwise add a new entry
        updated.push({
          date: today,
          score: latestScore,
          emotion: mostCommonEmotion,
          exercise: exercise,
        });
      }

      return updated.sort((a, b) => (a.date > b.date ? 1 : -1));
    });
  };

  const scoreToEmotion = (score: number): string => {
    if (score <= -5) return "very sad";
    if (score <= -1) return "sad";
    if (score <= 3) return "anxious";
    if (score <= 6) return "neutral";
    if (score <= 8.5) return "happy";
    return "very excited";
  };

  return (
    <main className="min-h-screen bg-gradient-to-br from-blue-900 to-indigo-950 flex flex-col items-center justify-center text-white p-6">
      <h1 className="text-3xl font-bold mb-6">🧘 Exercise Suggestion</h1>

      <ExerciseButton onClick={generateSuggestion} />
      <ExerciseResult suggestion={suggestion} />
      <ExerciseChart graphData={graphData} />
    </main>
  );
};

export default ExerciseSuggestion;
