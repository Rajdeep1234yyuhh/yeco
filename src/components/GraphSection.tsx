/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unused-vars */
"use client";
import React, { useMemo } from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  ResponsiveContainer,
  ReferenceLine,
  Legend,
  Area,
  ComposedChart,
} from "recharts";
import { ChevronDown, ChevronRight, Info } from "lucide-react";

type GraphSectionProps = {
  title: string;
  data: {
    label: string;
    avg: number;
    date?: string; // for filtering hourly mood
  }[];
  visible: boolean;
  toggleSection: () => void;
  selectedDate: string;
  setSelectedDate?: (date: string) => void;
};

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-gray-900 p-3 rounded shadow-lg border border-gray-700">
        <p className="text-gray-300 text-sm">{`${label}`}</p>
        <p className="text-emerald-400 font-semibold">
          {`Mood: ${(payload[0].value * 100).toFixed(0)}%`}
        </p>
      </div>
    );
  }
  return null;
};

export default function GraphSection({
  title,
  data,
  visible,
  toggleSection,
  selectedDate,
  setSelectedDate,
}: GraphSectionProps) {
  const isHourly = title.includes("Hourly");

  const filteredData = useMemo(() => {
    return isHourly && selectedDate
      ? data.filter((d) => d.label.includes(selectedDate))
      : data;
  }, [data, isHourly, selectedDate]);

  // Calculate statistics
  const stats = useMemo(() => {
    if (filteredData.length === 0) return { avg: 0, min: 0, max: 0 };
    const values = filteredData.map((d) => d.avg);
    return {
      avg: values.reduce((a, b) => a + b, 0) / values.length,
      min: Math.min(...values),
      max: Math.max(...values),
    };
  }, [filteredData]);

  // Get dates available for filtering (for hourly view)
  const availableDates = useMemo(() => {
    if (!isHourly) return [];
    const dates = new Set();
    data.forEach((item) => {
      if (item.date) dates.add(item.date);
    });
    return Array.from(dates).sort();
  }, [data, isHourly]);

  return (
    <div className="bg-gray-800 p-5 rounded-xl shadow-md border border-gray-700">
      <div className="flex justify-between items-center mb-4">
        <div className="flex items-center gap-2">
          <h2 className="text-xl font-semibold text-white">{title}</h2>
          <div className="bg-gray-700 px-2 py-1 rounded text-xs text-gray-300">
            {filteredData.length} data points
          </div>
        </div>
        <button
          onClick={toggleSection}
          className="p-2 rounded-full bg-gradient-to-r from-yellow-500 to-amber-500 hover:from-yellow-600 hover:to-amber-600 transition-all shadow-lg focus:outline-none focus:ring-2 focus:ring-yellow-400"
          title={visible ? "Collapse" : "Expand"}
        >
          {visible ? (
            <ChevronDown className="w-5 h-5 text-black" />
          ) : (
            <ChevronRight className="w-5 h-5 text-black" />
          )}
        </button>
      </div>

      {isHourly && setSelectedDate && (
        <div className="mb-6 flex flex-wrap gap-4 items-center">
          <div>
            <label className="block text-sm mb-1 text-gray-300">
              Select Date:
            </label>
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="bg-gray-700 text-white px-3 py-2 rounded border border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {availableDates.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {availableDates.slice(0, 5).map((date) => (
                <button
                  key={date as string}
                  onClick={() => setSelectedDate(date as string)}
                  className={`px-3 py-1 text-xs rounded-full transition ${
                    date === selectedDate
                      ? "bg-blue-600 text-white"
                      : "bg-gray-700 text-gray-300 hover:bg-gray-600"
                  }`}
                >
                  {date as string}
                </button>
              ))}
              {availableDates.length > 5 && (
                <span className="text-gray-400 text-xs px-2 py-1">
                  +{availableDates.length - 5} more
                </span>
              )}
            </div>
          )}
        </div>
      )}

      {visible && (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-4">
            <div className="bg-gray-700 p-3 rounded-lg">
              <div className="text-gray-400 text-xs mb-1">Average Mood</div>
              <div className="text-2xl font-bold text-emerald-400">
                {(stats.avg * 100).toFixed(0)}%
              </div>
            </div>
            <div className="bg-gray-700 p-3 rounded-lg">
              <div className="text-gray-400 text-xs mb-1">Peak Mood</div>
              <div className="text-2xl font-bold text-emerald-400">
                {(stats.max * 100).toFixed(0)}%
              </div>
            </div>
            <div className="bg-gray-700 p-3 rounded-lg">
              <div className="text-gray-400 text-xs mb-1">Lowest Mood</div>
              <div className="text-2xl font-bold text-emerald-400">
                {(stats.min * 100).toFixed(0)}%
              </div>
            </div>
          </div>

          <ResponsiveContainer width="100%" height={350}>
            <ComposedChart data={filteredData}>
              <defs>
                <linearGradient id="colorMood" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#82ca9d" stopOpacity={0.8} />
                  <stop offset="95%" stopColor="#82ca9d" stopOpacity={0.1} />
                </linearGradient>
              </defs>
              <CartesianGrid
                strokeDasharray="3 3"
                stroke="#555"
                opacity={0.3}
              />
              <XAxis
                dataKey="label"
                tick={{ fill: "#aaa", fontSize: 12 }}
                tickLine={{ stroke: "#555" }}
                axisLine={{ stroke: "#555" }}
              />
              <YAxis
                domain={[0, 1]}
                tickFormatter={(value) => `${(value * 100).toFixed(0)}%`}
                tick={{ fill: "#aaa", fontSize: 12 }}
                tickLine={{ stroke: "#555" }}
                axisLine={{ stroke: "#555" }}
              />
              <Tooltip content={<CustomTooltip />} />
              <Legend />
              <ReferenceLine
                y={stats.avg}
                stroke="#fff"
                strokeDasharray="3 3"
                label={{
                  value: "Average",
                  position: "right",
                  fill: "#fff",
                  fontSize: 12,
                }}
              />
              <Area
                type="monotone"
                dataKey="avg"
                name="Mood Level"
                stroke="#82ca9d"
                fillOpacity={1}
                fill="url(#colorMood)"
              />
              <Line
                type="monotone"
                dataKey="avg"
                name="Mood Level"
                stroke="#82ca9d"
                strokeWidth={3}
                dot={{ r: 4, strokeWidth: 2, fill: "#222" }}
                activeDot={{ r: 6, stroke: "#fff", strokeWidth: 2 }}
              />
            </ComposedChart>
          </ResponsiveContainer>

          {filteredData.length === 0 && (
            <div className="flex items-center justify-center h-40 text-gray-400">
              <div className="flex items-center gap-2">
                <Info size={18} />
                <span>No data available for the selected filters</span>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
