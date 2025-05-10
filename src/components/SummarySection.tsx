"use client";
import React from "react";
import { ChevronDown, ChevronRight } from "lucide-react";

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
  const isHourly = title.includes("Hourly");
  const filteredData =
    isHourly && selectedDate
      ? data.filter((item) => item.label.includes(selectedDate))
      : data;

  return (
    <div className="bg-slate-800 rounded-lg shadow-lg border border-slate-700">
      <div className="flex justify-between items-center p-4 border-b border-slate-700">
        <h2 className="text-lg font-medium text-white tracking-tight">
          {title}
        </h2>
        <button
          onClick={toggleSection}
          className="p-1.5 rounded-md bg-blue-500 hover:bg-blue-600 text-white transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:ring-offset-2 focus:ring-offset-slate-800"
          title={visible ? "Collapse" : "Expand"}
        >
          {visible ? (
            <ChevronDown className="w-4 h-4" />
          ) : (
            <ChevronRight className="w-4 h-4" />
          )}
        </button>
      </div>

      {visible && (
        <div className="p-4">
          {isHourly && setSelectedDate && (
            <div className="mb-4">
              <label className="block text-sm font-medium text-slate-300 mb-1.5">
                Select Date
              </label>
              <input
                type="date"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                className="bg-slate-700 text-white px-3 py-2 rounded-md border border-slate-600 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 w-full sm:w-auto"
              />
            </div>
          )}

          {filteredData.length > 0 ? (
            <ul className="divide-y divide-slate-700">
              {filteredData.map((item, index) => (
                <li
                  key={index}
                  className="flex justify-between items-center py-2.5 text-sm"
                >
                  <span className="text-slate-300">{item.label}</span>
                  <span className="font-semibold text-white bg-slate-700 px-2.5 py-1 rounded-full">
                    {item.avg}
                  </span>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-slate-400 text-sm italic py-2">
              No data available for this selection.
            </p>
          )}
        </div>
      )}
    </div>
  );
}
