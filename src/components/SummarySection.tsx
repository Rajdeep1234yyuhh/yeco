"use client";
import React from "react";

type SummarySectionProps = {
  title: string;
  data: {
    label: string;
    avg: number;
    date?: string; // for hourly mood
  }[];
  visible: boolean;
  toggleSection: () => void;
  selectedDate: string;
  setSelectedDate?: (date: string) => void; // optional
};

export default function SummarySection({
  title,
  data,
  visible,
  toggleSection,
  selectedDate,
  setSelectedDate,
}: SummarySectionProps) {
  // For hourly mood only: filter by selectedDate
  const isHourly = title.includes("Hourly");
  const filteredData =
    isHourly && selectedDate
      ? data.filter((item) => item.label.includes(selectedDate))
      : data;

  return (
    <div className="bg-gray-800 p-4 rounded-xl shadow-md">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-semibold">{title}</h2>
        <button
          onClick={toggleSection}
          className="bg-yellow-500 text-black px-3 py-1 rounded hover:bg-yellow-600"
        >
          {visible ? "Collapse" : "Expand"}
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
        <ul className="space-y-2">
          {filteredData.map((item, index) => (
            <li key={index} className="flex justify-between">
              <span>{item.label}</span>
              <span className="font-bold">{item.avg}</span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
