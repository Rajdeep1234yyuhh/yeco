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

type GraphData = {
  date: string;
  score: number;
  emotion?: string;
  exercise?: string;
  improvementResult?: string;
  improvementCheck?: boolean;
  exerciseSuggestion?: string; // 🛠️ ADD this line
};

const generateNewExercise = (score: number): string => {
  if (score <= -6) {
    return "Practice 5 minutes of mindful breathing";
  } else if (score <= -2) {
    return "Take a relaxing walk in nature";
  } else if (score <= 1) {
    return "Write down 3 positive things about today";
  } else if (score <= 5) {
    return "Do a light 10-minute stretching routine";
  } else {
    return "Celebrate your progress with a relaxing activity you enjoy";
  }
};

const ExerciseSuggestion = () => {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { data: session, status } = useSession();
  const router = useRouter();
  const [suggestion, setSuggestion] = useState("");
  const [exerciseLogs, setExerciseLogs] = useState<ExerciseEntry[]>([]);
  const [graphData, setGraphData] = useState<GraphData[]>([]);

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

    const exerciseLogsByDate: { [date: string]: ExerciseEntry } = {};
    exerciseSuggestions.forEach((ex: ExerciseEntry) => {
      const exDate = new Date(ex.timestamp).toISOString().split("T")[0];
      exerciseLogsByDate[exDate] = ex;
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
      improvementCheck?: boolean; // 👈 new field
      improvementResult?: string; // 👈 new field
    }[] = [];

    allDates.forEach((date) => {
      const scores = groupedScores[date] || [];
      const exercise = exerciseLogsByDate[date];

      let avgScore = 0;
      if (scores.length > 0) {
        avgScore = scores.reduce((a, b) => a + b, 0) / scores.length;
      }

      if (exercise) {
        mergedData.push({
          date,
          score: exercise.score,
          emotion: "exercise_suggestion",
          exercise: exercise.exercise,
        });

        // 👇 Now check 3 days after exercise
        const targetDate = new Date(date);
        targetDate.setDate(targetDate.getDate() + 3);
        const targetDateStr = targetDate.toISOString().split("T")[0];

        if (
          groupedScores[targetDateStr] &&
          groupedScores[targetDateStr].length > 0
        ) {
          const futureAvgScore =
            groupedScores[targetDateStr].reduce((a, b) => a + b, 0) /
            groupedScores[targetDateStr].length;

          const improved = futureAvgScore > exercise.score;
          mergedData.push({
            date: targetDateStr,
            score: parseFloat(futureAvgScore.toFixed(2)),
            emotion: "improvement_check",
            improvementCheck: true,
            improvementResult: improved
              ? "Mood Improved ✅"
              : "Mood Not Improved ❌",
          });
          const improvementEntry: GraphData = {
            date: targetDateStr,
            score: parseFloat(futureAvgScore.toFixed(2)),
            emotion: "improvement_check",
            improvementCheck: true,
            improvementResult: improved
              ? "Mood Improved ✅"
              : "Mood Not Improved ❌",
          };
          if (!improved) {
            const newExercise = "Try a mindfulness session for 5 minutes"; // 💡 Or generate based on mood, see below
            const newEntry: ExerciseEntry = {
              score: parseFloat(futureAvgScore.toFixed(2)),
              exercise: newExercise,
              timestamp: new Date(targetDateStr).toISOString(),
              emotion: "retry",
            };
            improvementEntry.exerciseSuggestion = generateNewExercise(
              improvementEntry.score
            );

            // Update localStorage
            const updatedSuggestions = [...exerciseSuggestions, newEntry];
            localStorage.setItem(
              "exerciseSuggestions",
              JSON.stringify(updatedSuggestions)
            );

            // Update merged graph
            mergedData.push({
              date: targetDateStr,
              score: parseFloat(futureAvgScore.toFixed(2)),
              emotion: "retry_exercise",
              exercise: newExercise,
              improvementResult: "Mood Not Improved ❌", // optional
              improvementCheck: true, // optional
              exerciseSuggestion: generateNewExercise(
                parseFloat(futureAvgScore.toFixed(2))
              ),
            });
          }
        }
      } else {
        mergedData.push({
          date,
          score: parseFloat(avgScore.toFixed(2)),
          emotion: scoreToEmotion(avgScore),
        });
      }
    });

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

    const today = new Date().toISOString().split("T")[0];

    // Filter only entries before today
    const previousEntries = userScores.filter((entry) => {
      const entryDate = new Date(entry.timestamp).toISOString().split("T")[0];
      return entryDate < today;
    });

    // Sort by most recent first
    previousEntries.sort(
      (a, b) =>
        new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
    );

    // Pick the last 5 entries before today
    const lastFiveEntries = previousEntries.slice(0, 5);

    if (!lastFiveEntries.length) {
      setSuggestion(
        "No previous emotion data found before today. Please chat more!"
      );
      return;
    }

    // 🎯 Calculate the AVERAGE score
    const avgScore =
      lastFiveEntries.reduce((sum, entry) => sum + entry.score, 0) /
      lastFiveEntries.length;

    // 🎯 Find emotions for those 5 scores
    const emotionLabels = lastFiveEntries.map((entry) =>
      scoreToEmotion(entry.score)
    );

    const moodCount: Record<string, number> = {};
    emotionLabels.forEach((emotion) => {
      moodCount[emotion] = (moodCount[emotion] || 0) + 1;
    });

    const sortedMoods = Object.entries(moodCount).sort((a, b) => b[1] - a[1]);
    const mostCommonEmotion =
      sortedMoods.length > 0 ? sortedMoods[0][0] : "neutral";

    // 🎯 Decide Exercise based on most common mood
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

    const timestamp = new Date().toISOString();
    const todayDateString = new Date().toISOString().split("T")[0];

    // 🎯 Use avgScore here
    const newEntry: ExerciseEntry = {
      score: parseFloat(avgScore.toFixed(2)),
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

    // 🎯 Update graph with avgScore
    setGraphData((prev) => {
      const today = new Date().toISOString().split("T")[0];

      let updated = [...prev];
      const existingIndex = updated.findIndex((entry) => entry.date === today);

      if (existingIndex !== -1) {
        updated[existingIndex] = {
          ...updated[existingIndex],
          score: parseFloat(avgScore.toFixed(2)),
          emotion: mostCommonEmotion,
          exercise: exercise,
        };
      } else {
        updated.push({
          date: today,
          score: parseFloat(avgScore.toFixed(2)),
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
