import React from "react";
import {
  BarChart, Bar, XAxis, YAxis, Tooltip,
  ResponsiveContainer, CartesianGrid, Cell,
} from "recharts";

const STATUS_COLORS = {
  completed: "#10b981",
  ongoing:   "#6366f1",
  dropped:   "#ef4444",
  pending:   "#f59e0b",
  unknown:   "#9ca3af",
};

function getColor(name = "") {
  return STATUS_COLORS[name.toLowerCase()] ?? "#6366f1";
}

export default function EnrollmentAreaChart({ data, onDrillDown }) {
  if (!data || data.length === 0) {
    return (
      <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-sm border dark:border-gray-700">
        <h3 className="mb-2 font-semibold">Completion Status</h3>
        <div className="flex items-center justify-center h-[220px] text-sm text-gray-400">No data available</div>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-sm border dark:border-gray-700">
      <h3 className="mb-2 font-semibold">
        Completion Status
        {onDrillDown && <span className="ml-2 text-xs font-normal text-indigo-400">click bar to drill down</span>}
      </h3>
      <div style={{ width: "100%", height: 220 }}>
        <ResponsiveContainer>
          <BarChart data={data} margin={{ top: 4, right: 8, left: 0, bottom: 4 }}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} />
            <XAxis dataKey="name" tick={{ fontSize: 12 }} />
            <YAxis allowDecimals={false} tick={{ fontSize: 12 }} />
            <Tooltip
              formatter={(value) => [value, "Students"]}
              labelFormatter={(label) => label.charAt(0).toUpperCase() + label.slice(1)}
            />
            <Bar
              dataKey="value"
              radius={[4, 4, 0, 0]}
              cursor={onDrillDown ? "pointer" : "default"}
              onClick={onDrillDown ? (entry) => onDrillDown(entry.name) : undefined}
            >
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={getColor(entry.name)} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
