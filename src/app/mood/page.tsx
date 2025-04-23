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
type HourlyMood = { hour: string; avg: number };

export default function MoodTrends() {
  const [dailyData, setDailyData] = useState<DailyMood[]>([]);
  const [weeklyData, setWeeklyData] = useState<WeeklyMood[]>([]);
  const [hourlyData, setHourlyData] = useState<HourlyMood[]>([]);
  const [showGraph, setShowGraph] = useState(false);
  const [visibleSections, setVisibleSections] = useState({
    daily: true,
    weekly: true,
    hourly: true,
  });
  const [selectedDate, setSelectedDate] = useState<string>("");

  const toggleSection = (section: keyof typeof visibleSections) => {
    setVisibleSections((prev) => ({ ...prev, [section]: !prev[section] }));
  };

  useEffect(() => {
    const raw = JSON.parse(localStorage.getItem("emotionLogs") || "{}");
    const user = Object.keys(raw)[0] || "guest";
    const logs = raw[user] || [];

    const daily: Record<string, number[]> = {};
    const weekly: Record<string, number[]> = {};
    const hourly: Record<string, number[]> = {};

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

      const hourLabel = `${dateObj.toLocaleTimeString([], {
        hour: "2-digit",
        hour12: false,
      })}:00`;

      const isoDate = dateObj.toISOString().split("T")[0];

      if (!daily[dayLabel]) daily[dayLabel] = [];
      daily[dayLabel].push(log.score);

      if (!weekly[wkLabel]) weekly[wkLabel] = [];
      weekly[wkLabel].push(log.score);

      if (!hourly[`${isoDate}_${hourLabel}`])
        hourly[`${isoDate}_${hourLabel}`] = [];
      hourly[`${isoDate}_${hourLabel}`].push(log.score);
    });

    const dailyAvg = Object.entries(daily).map(([date, scores]) => ({
      date,
      avg: +(scores.reduce((a, b) => a + b, 0) / scores.length).toFixed(2),
    }));

    const weeklyAvg = Object.entries(weekly).map(([week, scores]) => ({
      week,
      avg: +(scores.reduce((a, b) => a + b, 0) / scores.length).toFixed(2),
    }));

    const hourlyAvg = Object.entries(hourly).map(([key, scores]) => {
      const [date, hour] = key.split("_");
      return {
        hour,
        date,
        avg: +(scores.reduce((a, b) => a + b, 0) / scores.length).toFixed(2),
      };
    });

    setDailyData(dailyAvg);
    setWeeklyData(weeklyAvg);
    setHourlyData(hourlyAvg);
  }, []);

  const filteredHourlyData = selectedDate
    ? hourlyData.filter((h) => h.date === selectedDate)
    : hourlyData;

  return (
    <div className="p-6 space-y-6 bg-gray-900 text-white min-h-screen">
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
          <div className="bg-gray-800 rounded-xl p-4 shadow-md">
            <div
              className="flex justify-between items-center cursor-pointer"
              onClick={() => toggleSection("daily")}
            >
              <h2 className="text-lg font-semibold">📅 Daily Mood (Graph)</h2>
              <span>{visibleSections.daily ? "▼" : "▶"}</span>
            </div>
            {visibleSections.daily && (
              <div className="mt-4">
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
              </div>
            )}
          </div>

          <div className="bg-gray-800 rounded-xl p-4 shadow-md mt-6">
            <div
              className="flex justify-between items-center cursor-pointer"
              onClick={() => toggleSection("weekly")}
            >
              <h2 className="text-lg font-semibold">📆 Weekly Mood (Graph)</h2>
              <span>{visibleSections.weekly ? "▼" : "▶"}</span>
            </div>
            {visibleSections.weekly && (
              <div className="mt-4">
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
              </div>
            )}
          </div>

          <div className="bg-gray-800 rounded-xl p-4 shadow-md mt-6">
            <div
              className="flex justify-between items-center cursor-pointer"
              onClick={() => toggleSection("hourly")}
            >
              <h2 className="text-lg font-semibold">⏰ Hourly Mood (Graph)</h2>
              <span>{visibleSections.hourly ? "▼" : "▶"}</span>
            </div>
            {visibleSections.hourly && (
              <>
                <div className="mt-4 mb-4">
                  <label className="block mb-2 font-medium">
                    Select a Date:
                  </label>
                  <input
                    type="date"
                    className="bg-gray-700 text-white px-4 py-2 rounded shadow"
                    value={selectedDate}
                    onChange={(e) => setSelectedDate(e.target.value)}
                  />
                </div>
                <Line
                  data={{
                    labels: filteredHourlyData.map((h) => h.hour),
                    datasets: [
                      {
                        label: "Hourly Mood",
                        data: filteredHourlyData.map((h) => h.avg),
                        borderColor: "#10b981",
                        backgroundColor: "rgba(16, 185, 129, 0.2)",
                        tension: 0.4,
                      },
                    ],
                  }}
                />
              </>
            )}
          </div>
        </>
      ) : (
        <>
          {!showGraph ? (
            <>
              <div className="bg-gray-800 rounded-xl p-4 shadow-md">
                <div
                  className="flex justify-between items-center cursor-pointer"
                  onClick={() => toggleSection("daily")}
                >
                  <h2 className="text-xl font-bold">📅 Daily Mood Summary</h2>
                  <span>{visibleSections.daily ? "▼" : "▶"}</span>
                </div>
                {visibleSections.daily && (
                  <ul className="mb-8 space-y-2 mt-4">
                    {dailyData.map((d, i) => (
                      <li
                        key={i}
                        className="text-white bg-gray-700 p-3 rounded shadow"
                      >
                        <strong>{d.date}</strong> — Mood Score:{" "}
                        <span
                          className={
                            d.avg >= 2
                              ? "text-green-400"
                              : d.avg > 0
                              ? "text-lime-400"
                              : d.avg === 0
                              ? "text-gray-400"
                              : "text-red-400"
                          }
                        >
                          {d.avg}
                        </span>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
              <div className="bg-gray-800 rounded-xl p-4 shadow-md mt-6">
                <div
                  className="flex justify-between items-center cursor-pointer"
                  onClick={() => toggleSection("weekly")}
                >
                  <h2 className="text-xl font-bold">📆 Weekly Mood Summary</h2>
                  <span>{visibleSections.weekly ? "▼" : "▶"}</span>
                </div>
                {visibleSections.weekly && (
                  <ul className="space-y-2 mt-4">
                    {weeklyData.map((w, i) => (
                      <li
                        key={i}
                        className="text-white bg-gray-700 p-3 rounded shadow"
                      >
                        <strong>{w.week}</strong> — Mood Score:{" "}
                        <span
                          className={
                            w.avg >= 2
                              ? "text-green-400"
                              : w.avg > 0
                              ? "text-lime-400"
                              : w.avg === 0
                              ? "text-gray-400"
                              : "text-red-400"
                          }
                        >
                          {w.avg}
                        </span>
                      </li>
                    ))}
                  </ul>
                )}
              </div>

              <div className="bg-gray-800 rounded-xl p-4 shadow-md mt-6">
                <div
                  className="flex justify-between items-center cursor-pointer"
                  onClick={() => toggleSection("hourly")}
                >
                  <h2 className="text-xl font-bold">⏰ Hourly Mood Summary</h2>
                  <span>{visibleSections.hourly ? "▼" : "▶"}</span>
                </div>
                {visibleSections.hourly && (
                  <>
                    <div className="mt-4 mb-4">
                      <label className="block mb-2 font-medium">
                        Select a Date:
                      </label>
                      <input
                        type="date"
                        className="bg-gray-700 text-white px-4 py-2 rounded shadow"
                        value={selectedDate}
                        onChange={(e) => setSelectedDate(e.target.value)}
                      />
                    </div>
                    <ul className="space-y-2 mt-4">
                      {filteredHourlyData.map((h, i) => (
                        <li
                          key={i}
                          className="text-white bg-gray-700 p-3 rounded shadow"
                        >
                          <strong>
                            {h.date} — {h.hour}
                          </strong>{" "}
                          — Mood Score:{" "}
                          <span
                            className={
                              h.avg >= 2
                                ? "text-green-400"
                                : h.avg > 0
                                ? "text-lime-400"
                                : h.avg === 0
                                ? "text-gray-400"
                                : "text-red-400"
                            }
                          >
                            {h.avg}
                          </span>
                        </li>
                      ))}
                    </ul>
                  </>
                )}
              </div>
            </>
          ) : null}
        </>
      )}
    </div>
  );
}
