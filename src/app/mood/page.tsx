/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
"use client"; // Mark as a client component

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
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
  const [showGraph, setShowGraph] = useState(true);
  const [visibleSections, setVisibleSections] = useState({
    daily: false,
    weekly: false,
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

    const dailyAvg = Object.entries(daily)
      .map(([date, scores]) => ({
        date,
        avg: +(scores.reduce((a, b) => a + b, 0) / scores.length).toFixed(2),
      }))
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

    const weeklyAvg = Object.entries(weekly)
      .map(([week, scores]) => ({
        week,
        avg: +(scores.reduce((a, b) => a + b, 0) / scores.length).toFixed(2),
      }))
      .sort((a, b) => {
        const [wA, mA] = a.week.match(/\d+/g) || [];
        const [wB, mB] = b.week.match(/\d+/g) || [];
        return parseInt(wA ?? "0") - parseInt(wB ?? "0");
      });

    const hourlyAvg = Object.entries(hourly)
      .map(([key, scores]) => {
        const [date, hour] = key.split("_");
        return {
          hour,
          date,
          avg: +(scores.reduce((a, b) => a + b, 0) / scores.length).toFixed(2),
        };
      })
      .sort((a, b) => {
        const d1 = new Date(`${a.date}T${a.hour}`);
        const d2 = new Date(`${b.date}T${b.hour}`);
        return d1.getTime() - d2.getTime();
      });

    setDailyData(dailyAvg);
    setWeeklyData(weeklyAvg);
    setHourlyData(hourlyAvg);
  }, []);

  const { data: session, status } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/");
    }
  }, [status, router]);

  if (status === "loading") {
    return <div className="p-6 text-white">Checking authentication...</div>;
  }

  if (!session) {
    return null;
  }

  return (
    <div className="p-6 space-y-8 bg-gray-900 text-white min-h-screen">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-bold">📊 Mood Trends</h1>
        <div className="flex items-center space-x-2">
          <span className="text-xl">{showGraph ? "📈" : "📝"}</span>
          <label className="relative inline-flex items-center cursor-pointer">
            <input
              type="checkbox"
              checked={showGraph}
              onChange={() => setShowGraph(!showGraph)}
              className="sr-only peer"
            />
            <div className="w-11 h-6 bg-gray-600 rounded-full peer peer-checked:bg-blue-600 transition-all duration-300"></div>
            <div className="absolute left-1 top-1 w-4 h-4 bg-white rounded-full transition-transform duration-300 transform peer-checked:translate-x-5"></div>
          </label>
        </div>
      </div>
      {/* Navigation Buttons */}
      <div className="flex justify-center gap-4 mt-10">
        <button
          onClick={() => router.push("/")}
          className="px-4 py-2 bg-blue-600 rounded-xl hover:bg-blue-700 transition-colors"
        >
          🏠 Go to Homepage
        </button>
        <button
          onClick={() => router.push("/bot")}
          className="px-4 py-2 bg-green-600 rounded-xl hover:bg-green-700 transition-colors"
        >
          🤖 Go to Image Bot
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
            data={dailyData.map((d) => ({ label: d.date, avg: d.avg }))}
            visible={visibleSections.daily}
            toggleSection={() => toggleSection("daily")}
            selectedDate={selectedDate}
            setSelectedDate={setSelectedDate}
          />
          <GraphSection
            title="📆 Weekly Mood"
            data={weeklyData.map((w) => ({ label: w.week, avg: w.avg }))}
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
