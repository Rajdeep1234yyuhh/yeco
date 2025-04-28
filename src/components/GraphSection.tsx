"use client";
import React from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  ResponsiveContainer,
} from "recharts";
import { ChevronDown, ChevronRight } from "lucide-react";

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

export default function GraphSection({
  title,
  data,
  visible,
  toggleSection,
  selectedDate,
  setSelectedDate,
}: GraphSectionProps) {
  const isHourly = title.includes("Hourly");

  const filteredData =
    isHourly && selectedDate
      ? data.filter((d) => d.label.includes(selectedDate))
      : data;

  return (
    <div className="bg-gray-800 p-4 rounded-xl shadow-md">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-semibold text-white">{title}</h2>
        <button
          onClick={toggleSection}
          className="p-2 rounded-full bg-yellow-500 hover:bg-yellow-600 transition-colors shadow-lg focus:outline-none focus:ring-2 focus:ring-yellow-400"
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
        <div className="mb-4">
          <label className="block text-sm mb-1 text-white">Select Date:</label>
          <input
            type="date"
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
            className="bg-gray-700 text-white px-3 py-1 rounded"
          />
        </div>
      )}

      {visible && (
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={filteredData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="label" />
            <YAxis domain={[0, 1]} />
            <Tooltip />
            <Line
              type="monotone"
              dataKey="avg"
              stroke="#82ca9d"
              strokeWidth={2}
            />
          </LineChart>
        </ResponsiveContainer>
      )}
    </div>
  );
}
