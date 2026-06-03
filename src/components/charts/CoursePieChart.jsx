import React from "react";
import {
  PieChart, Pie, Cell, Tooltip,
  ResponsiveContainer, Legend,
} from "recharts";

const COLORS = [
  "#6366f1", "#06b6d4", "#f59e0b", "#ef4444", "#10b981",
  "#8b5cf6", "#ec4899", "#0ea5e9", "#84cc16", "#f97316",
];

export default function CoursePieChart({ data, onDrillDown }) {
  if (!data || data.length === 0) {
    return (
      <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-sm border dark:border-gray-700">
        <h3 className="mb-2 font-semibold">Course Distribution</h3>
        <div className="flex items-center justify-center h-[240px] text-sm text-gray-400">No data available</div>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-sm border dark:border-gray-700">
      <h3 className="mb-2 font-semibold">
        Course Distribution
        {onDrillDown && <span className="ml-2 text-xs font-normal text-indigo-400">click slice to drill down</span>}
      </h3>
      <div style={{ width: "100%", height: 240 }}>
        <ResponsiveContainer>
          <PieChart>
            <Pie
              data={data}
              dataKey="value"
              nameKey="name"
              outerRadius={80}
              innerRadius={30}
              cursor={onDrillDown ? "pointer" : "default"}
              onClick={onDrillDown ? (entry) => onDrillDown(entry.name) : undefined}
            >
              {data.map((_, index) => (
                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
              ))}
            </Pie>
            <Tooltip formatter={(value, name) => [value, name]} />
            <Legend iconSize={10} />
          </PieChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
