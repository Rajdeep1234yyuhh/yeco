"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import ExerciseChart from "../../components/ExerciseChart";
import ExerciseButton from "../utils/ExerciseButton";
import ExerciseResult from "../../components/ExerciseResult";
import Navbar from "../../components/Nav";

type ScoreEntry = {
  score: number;
  timestamp: string;
};

type ExerciseEntry = {
  score: number;
  exercise: string;
  timestamp: string;
  emotion?: string;
  originalDate?: string;
};

type GraphData = {
  date: string;
  score: number;
  emotion?: string;
  exercise?: string;
  improvementResult?: string;
  improvementCheck?: boolean;
  exerciseSuggestion?: string;
};

const ExerciseSuggestion = () => {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [suggestion, setSuggestion] = useState("");
  const [exerciseLogs, setExerciseLogs] = useState<ExerciseEntry[]>([]);
  const [graphData, setGraphData] = useState<GraphData[]>([]);

  const email = session?.user?.email || "guest";

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/");
    }
  }, [status, router]);

  useEffect(() => {
    const allSuggestions = JSON.parse(
      localStorage.getItem("exerciseSuggestionsByUser") || "{}"
    );
    const userSuggestions: ExerciseEntry[] = allSuggestions[email] || [];
    setExerciseLogs(userSuggestions);
  }, [email]);

  useEffect(() => {
    const emotionLogs = JSON.parse(localStorage.getItem("emotionLogs") || "{}");
    const userScores: ScoreEntry[] = emotionLogs[email] || [];

    if (userScores.length) {
      preloadGraph(userScores);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [exerciseLogs]);

  const getExerciseByEmotion = (emotion: string): string => {
    switch (emotion) {
      case "very sad":
        return "Every morning, do 5 minutes of slow breathing and write down 3 gentle affirmations.";
      case "sad":
        return "Practice 5-minute deep breathing and write one thing you're grateful for every day.";
      case "lonely":
        return "Each day, message a friend or join an online community chat to feel more connected.";
      case "anxious":
        return "Do a 5-minute guided meditation every morning and jot down your top 3 priorities.";
      case "neutral":
        return "Start your day with 3 minutes of stretching and end with journaling your thoughts.";
      case "happy":
        return "Keep a daily gratitude journal and take a mindful walk to maintain your good mood.";
      case "very excited":
        return "Channel your energy daily into a hobby or creative activity for 15 minutes.";
      default:
        return "Take 10 minutes each day to breathe, stretch, and reflect quietly.";
    }
  };

  const preloadGraph = (userScores: ScoreEntry[]) => {
    const groupedScores: { [date: string]: number[] } = {};

    userScores.forEach((entry) => {
      const date = new Date(entry.timestamp).toISOString().split("T")[0];
      if (!groupedScores[date]) {
        groupedScores[date] = [];
      }
      groupedScores[date].push(entry.score);
    });

    const allSuggestions = JSON.parse(
      localStorage.getItem("exerciseSuggestionsByUser") || "{}"
    );
    const exerciseSuggestions: ExerciseEntry[] = allSuggestions[email] || [];

    const exerciseLogsByDate: { [date: string]: ExerciseEntry } = {};
    exerciseSuggestions.forEach((ex) => {
      const exDate = new Date(ex.timestamp).toISOString().split("T")[0];
      exerciseLogsByDate[exDate] = ex;
    });

    const allDates = new Set([
      ...Object.keys(groupedScores),
      ...Object.keys(exerciseLogsByDate),
    ]);

    const mergedData: GraphData[] = [];

    allDates.forEach((date) => {
      const scores = groupedScores[date] || [];
      const exercise = exerciseLogsByDate[date];

      let avgScore = 0;
      if (scores.length > 0) {
        avgScore = scores.reduce((a, b) => a + b, 0) / scores.length;
      }

      if (exercise) {
        let existingEntry = mergedData.find((d) => d.date === date);
        if (!existingEntry) {
          existingEntry = {
            date,
            score: exercise.score,
          };
          mergedData.push(existingEntry);
        }
        existingEntry.exercise = exercise.exercise;
        existingEntry.emotion = "exercise_suggestion";
      } else {
        mergedData.push({
          date,
          score: parseFloat(avgScore.toFixed(2)),
          emotion: scoreToEmotion(avgScore),
        });
      }

      if (exercise) {
        const targetDate = new Date(date);
        targetDate.setDate(targetDate.getDate() + 3);
        const targetDateStr = targetDate.toISOString().split("T")[0];

        if (groupedScores[targetDateStr]?.length > 0) {
          const futureAvgScore =
            groupedScores[targetDateStr].reduce((a, b) => a + b, 0) /
            groupedScores[targetDateStr].length;

          let existingFutureEntry = mergedData.find(
            (d) => d.date === targetDateStr
          );

          if (!existingFutureEntry) {
            existingFutureEntry = {
              date: targetDateStr,
              score: parseFloat(futureAvgScore.toFixed(2)),
            };
            mergedData.push(existingFutureEntry);
          }

          const originalDateStr = exercise.originalDate || date;
          const originalScore =
            exerciseLogsByDate[originalDateStr]?.score ?? exercise.score;

          const improved = futureAvgScore > originalScore;

          existingFutureEntry.improvementCheck = true;
          existingFutureEntry.improvementResult = improved
            ? "Mood Improved ✅"
            : "Mood Not Improved ❌";

          if (!improved) {
            const fallbackEmotion = scoreToEmotion(futureAvgScore);
            const newExercise = getExerciseByEmotion(fallbackEmotion);

            existingFutureEntry.exercise = newExercise;
            existingFutureEntry.emotion = "retry_exercise";

            const newEntry: ExerciseEntry = {
              score: parseFloat(futureAvgScore.toFixed(2)),
              exercise: newExercise,
              timestamp: new Date(targetDateStr).toISOString(),
              emotion: "retry",
            };

            const updatedSuggestions = [...exerciseSuggestions, newEntry];
            const updatedAll = {
              ...allSuggestions,
              [email]: updatedSuggestions,
            };
            localStorage.setItem(
              "exerciseSuggestionsByUser",
              JSON.stringify(updatedAll)
            );
          } else if (!existingFutureEntry.emotion) {
            existingFutureEntry.emotion = "improvement_check";
          }
        }
      }
    });

    mergedData.sort((a, b) => (a.date > b.date ? 1 : -1));
    setGraphData(mergedData);
  };

  const generateSuggestion = () => {
    const emotionLogs = JSON.parse(localStorage.getItem("emotionLogs") || "{}");
    const userScores: ScoreEntry[] = emotionLogs[email] || [];

    if (!userScores.length) {
      setSuggestion("No emotion data found. Please chat first!");
      return;
    }

    const today = new Date().toISOString().split("T")[0];
    const previousEntries = userScores.filter((entry) => {
      const entryDate = new Date(entry.timestamp).toISOString().split("T")[0];
      return entryDate < today;
    });

    previousEntries.sort(
      (a, b) =>
        new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
    );

    const lastFiveEntries = previousEntries.slice(0, 5);

    if (!lastFiveEntries.length) {
      setSuggestion(
        "No previous emotion data found before today. Please chat more!"
      );
      return;
    }

    const avgScore =
      lastFiveEntries.reduce((sum, entry) => sum + entry.score, 0) /
      lastFiveEntries.length;

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

    const exercise = getExerciseByEmotion(mostCommonEmotion);
    const timestamp = new Date().toISOString();

    const newEntry: ExerciseEntry = {
      score: parseFloat(avgScore.toFixed(2)),
      exercise,
      timestamp,
      emotion: mostCommonEmotion,
    };

    const updatedLogs = [...exerciseLogs, newEntry];
    setExerciseLogs(updatedLogs);

    const allSuggestions = JSON.parse(
      localStorage.getItem("exerciseSuggestionsByUser") || "{}"
    );
    const updatedAll = {
      ...allSuggestions,
      [email]: updatedLogs,
    };

    localStorage.setItem(
      "exerciseSuggestionsByUser",
      JSON.stringify(updatedAll)
    );

    setSuggestion(
      `Based on your recent mood (${mostCommonEmotion}), we suggest: ${exercise}`
    );

    setGraphData((prev) => {
      const today = new Date().toISOString().split("T")[0];
      const updated = [...prev];
      const existingIndex = updated.findIndex((entry) => entry.date === today);

      if (existingIndex !== -1) {
        updated[existingIndex] = {
          ...updated[existingIndex],
          score: parseFloat(avgScore.toFixed(2)),
          emotion: mostCommonEmotion,
          exercise,
        };
      } else {
        updated.push({
          date: today,
          score: parseFloat(avgScore.toFixed(2)),
          emotion: mostCommonEmotion,
          exercise,
        });
      }

      return updated.sort((a, b) => (a.date > b.date ? 1 : -1));
    });
  };

  const scoreToEmotion = (score: number): string => {
    if (score <= -7) return "very sad";
    if (score <= -3) return "sad";
    if (score <= -1) return "lonely";
    if (score === 0) return "neutral";
    if (score <= 2) return "anxious";
    if (score <= 5) return "happy";
    return "very excited";
  };

  return (
    <>
      <Navbar />
      <main className="min-h-screen w-full bg-gradient-to-b from-gray-900 via-gray-800 to-black flex flex-col items-center py-20 px-4 md:px-8 text-gray-100 relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(76,81,191,0.1)_0%,rgba(0,0,0,0)_70%)]"></div>
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_80%,rgba(76,191,140,0.07)_0%,rgba(0,0,0,0)_70%)]"></div>

        <div className="z-10 flex flex-col items-center w-full max-w-4xl mx-auto">
          <div className="w-full flex flex-col items-center mb-8">
            <label className="flex items-center justify-center gap-3 p-3 rounded-lg bg-opacity-20 bg-gradient-to-r from-teal-500/10 to-green-500/10 backdrop-blur-sm border border-teal-500/20 cursor-pointer max-w-md">
              <span className="text-l md:text-xl font-medium text-teal-400">
                Exercise Suggestion
              </span>
              <ExerciseButton onClick={generateSuggestion} />
            </label>
            <ExerciseResult suggestion={suggestion} />
          </div>

          <div className="w-full">
            <ExerciseChart graphData={graphData} />
          </div>
        </div>
      </main>
    </>
  );
};

export default ExerciseSuggestion;
