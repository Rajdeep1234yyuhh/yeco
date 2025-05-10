/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
"use client"; // Mark as a client component

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import GraphSection from "../../components/GraphSection";
import SummarySection from "../../components/SummarySection";
import Navbar from "../../components/Nav";
import { BarChart, LineChart } from "lucide-react";

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
    <>
      <Navbar />
      <div className="pt-20 p-6 space-y-8 bg-gray-900 text-white min-h-screen">
        <div className="flex items-center gap-3">
          <h1 className="text-xl font-semibold text-white">Mood Analytics</h1>
          <div className="flex items-center gap-3 ml-auto">
            <span className="text-sm font-medium text-slate-300">
              {showGraph ? "Graph View" : "List View"}
            </span>
            <button
              onClick={() => setShowGraph(!showGraph)}
              className={`group relative inline-flex h-7 w-14 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-slate-900 ${
                showGraph ? "bg-blue-500" : "bg-slate-700"
              }`}
            >
              <span className="sr-only">Toggle view mode</span>
              <span
                className={`pointer-events-none relative inline-block h-4 w-4 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                  showGraph ? "translate-x-6" : "translate-x-1"
                }`}
              >
                {showGraph ? (
                  <BarChart className="h-3 w-3 text-blue-500 m-0.5" />
                ) : (
                  <LineChart className="h-3 w-3 text-slate-700 m-0.5" />
                )}
              </span>
            </button>
          </div>
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
    </>
  );
}
