"use client";

import { useEffect, useState } from "react";
import { Line } from "react-chartjs-2";
import {
  Chart as ChartJS,
  LineElement,
  CategoryScale,
  LinearScale,
  PointElement,
  Tooltip,
  Legend,
} from "chart.js";

ChartJS.register(
  LineElement,
  CategoryScale,
  LinearScale,
  PointElement,
  Tooltip,
  Legend
);

type DailyMood = { date: string; avg: number };
type WeeklyMood = { week: string; avg: number };

export default function MoodTrends() {
  const [dailyData, setDailyData] = useState<DailyMood[]>([]);
  const [weeklyData, setWeeklyData] = useState<WeeklyMood[]>([]);
  const [showGraph, setShowGraph] = useState(false);

  useEffect(() => {
    const raw = JSON.parse(localStorage.getItem("emotionLogs") || "{}");
    const user = Object.keys(raw)[0] || "guest";
    const logs = raw[user] || [];

    const daily: Record<string, number[]> = {};
    const weekly: Record<string, number[]> = {};

    const weekKey = (date: Date) =>
      `${date.getFullYear()}-W${Math.ceil(date.getDate() / 7)}`;

    logs.forEach((log: any) => {
      const dateObj = new Date(log.timestamp);
      const dayLabel = dateObj.toLocaleDateString("en-US", {
        weekday: "long",
        month: "short",
        day: "numeric",
      });

      const wkLabel = `Week ${Math.ceil(
        dateObj.getDate() / 7
      )} of ${dateObj.toLocaleString("default", {
        month: "long",
      })}`;

      if (!daily[dayLabel]) daily[dayLabel] = [];
      daily[dayLabel].push(log.score);

      if (!weekly[wkLabel]) weekly[wkLabel] = [];
      weekly[wkLabel].push(log.score);
    });

    const dailyAvg = Object.entries(daily).map(([date, scores]) => ({
      date,
      avg: +(scores.reduce((a, b) => a + b, 0) / scores.length).toFixed(2),
    }));

    const weeklyAvg = Object.entries(weekly).map(([week, scores]) => ({
      week,
      avg: +(scores.reduce((a, b) => a + b, 0) / scores.length).toFixed(2),
    }));

    setDailyData(dailyAvg);
    setWeeklyData(weeklyAvg);
  }, []);

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">📊 Mood Trends</h1>
        <button
          onClick={() => setShowGraph(!showGraph)}
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
        >
          {showGraph ? "📝 Show List View" : "📈 Show Graph View"}
        </button>
      </div>

      {showGraph ? (
        <>
          <h2 className="text-lg font-semibold">Daily Mood (Graph)</h2>
          <Line
            data={{
              labels: dailyData.map((d) => d.date),
              datasets: [
                {
                  label: "Daily Mood",
                  data: dailyData.map((d) => d.avg),
                  borderColor: "#3b82f6",
                  backgroundColor: "rgba(59, 130, 246, 0.2)",
                  tension: 0.4,
                },
              ],
            }}
          />

          <h2 className="text-lg font-semibold mt-10">Weekly Mood (Graph)</h2>
          <Line
            data={{
              labels: weeklyData.map((w) => w.week),
              datasets: [
                {
                  label: "Weekly Mood",
                  data: weeklyData.map((w) => w.avg),
                  borderColor: "#f97316",
                  backgroundColor: "rgba(249, 115, 22, 0.2)",
                  tension: 0.4,
                },
              ],
            }}
          />
        </>
      ) : (
        <>
          <h2 className="text-xl font-bold">📅 Daily Mood Summary</h2>
          <ul className="mb-8 space-y-2">
            {dailyData.map((d, i) => (
              <li key={i} className="text-black bg-gray-100 p-3 rounded shadow">
                <strong>{d.date}</strong> — Mood Score:{" "}
                <span
                  className={
                    d.avg >= 2
                      ? "text-green-600"
                      : d.avg > 0
                      ? "text-lime-600"
                      : d.avg === 0
                      ? "text-gray-500"
                      : "text-red-600"
                  }
                >
                  {d.avg}
                </span>
              </li>
            ))}
          </ul>

          <h2 className="text-xl font-bold">📆 Weekly Mood Summary</h2>
          <ul className="space-y-2">
            {weeklyData.map((w, i) => (
              <li key={i} className="text-black bg-gray-100 p-3 rounded shadow">
                <strong>{w.week}</strong> — Mood Score:{" "}
                <span
                  className={
                    w.avg >= 2
                      ? "text-green-600"
                      : w.avg > 0
                      ? "text-lime-600"
                      : w.avg === 0
                      ? "text-gray-500"
                      : "text-red-600"
                  }
                >
                  {w.avg}
                </span>
              </li>
            ))}
          </ul>
        </>
      )}
    </div>
  );
}
