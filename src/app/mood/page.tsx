/* eslint-disable @typescript-eslint/no-explicit-any */
"use client"; // Mark as a client component

import { useEffect, useState } from "react";
import GraphSection from "../../components/GraphSection";
import SummarySection from "../../components/SummarySection";

type DailyMood = { date: string; avg: number };
type WeeklyMood = { week: string; avg: number };
type HourlyMood = { hour: string; avg: number; date: string };

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
  const today = new Date().toISOString().split("T")[0];
  const [selectedDate, setSelectedDate] = useState<string>(today);

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

  {
    /*const filteredHourlyData = selectedDate
     ? hourlyData.filter((h) => h.date === selectedDate)
     : hourlyData;*/
  }

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
          <GraphSection
            title="⏰ Hourly Mood"
            data={hourlyData.map((h) => ({
              label: `${h.date} ${h.hour}`,
              avg: h.avg,
              date: h.date,
            }))}
            visible={visibleSections.hourly}
            toggleSection={() => toggleSection("hourly")}
            selectedDate={selectedDate}
            setSelectedDate={setSelectedDate}
          />
          <GraphSection
            title="📅 Daily Mood"
            data={dailyData.map((d) => ({ label: d.date, avg: d.avg }))} // Include label and avg
            visible={visibleSections.daily}
            toggleSection={() => toggleSection("daily")}
            selectedDate={selectedDate}
            setSelectedDate={setSelectedDate}
          />
          <GraphSection
            title="📆 Weekly Mood"
            data={weeklyData.map((w) => ({ label: w.week, avg: w.avg }))} // Include label and avg
            visible={visibleSections.weekly}
            toggleSection={() => toggleSection("weekly")}
            selectedDate={selectedDate}
            setSelectedDate={setSelectedDate}
          />
        </>
      ) : (
        <>
          <SummarySection
            title="⏰ Hourly Mood Summary"
            data={hourlyData.map((h) => ({
              label: `${h.date} ${h.hour}`,
              avg: h.avg,
              date: h.date,
            }))}
            visible={visibleSections.hourly}
            toggleSection={() => toggleSection("hourly")}
            selectedDate={selectedDate}
            setSelectedDate={setSelectedDate}
          />
          <SummarySection
            title="📅 Daily Mood Summary"
            data={dailyData.map((d) => ({ label: d.date, avg: d.avg }))}
            visible={visibleSections.daily}
            toggleSection={() => toggleSection("daily")}
            selectedDate={selectedDate}
          />
          <SummarySection
            title="📆 Weekly Mood Summary"
            data={weeklyData.map((w) => ({ label: w.week, avg: w.avg }))}
            visible={visibleSections.weekly}
            toggleSection={() => toggleSection("weekly")}
            selectedDate={selectedDate}
          />
        </>
      )}
    </div>
  );
}
