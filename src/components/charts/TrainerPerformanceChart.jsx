import React from "react";
import {
  BarChart, Bar, XAxis, YAxis, Tooltip,
  ResponsiveContainer, CartesianGrid, Cell,
} from "recharts";

export default function TrainerPerformanceChart({ data, onDrillDown }) {
  if (!data || data.length === 0) {
    return (
      <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-sm border dark:border-gray-700">
        <h3 className="mb-2 font-semibold">Trainer Completion Rate</h3>
        <div className="flex items-center justify-center h-[260px] text-sm text-gray-400">No data available</div>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-sm border dark:border-gray-700">
      <h3 className="mb-2 font-semibold">
        Trainer Completion Rate
        {onDrillDown && <span className="ml-2 text-xs font-normal text-indigo-400">click bar to drill down</span>}
      </h3>
      <div style={{ width: "100%", height: 260 }}>
        <ResponsiveContainer>
          <BarChart data={data} margin={{ top: 4, right: 8, left: 0, bottom: 4 }}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} />
            <XAxis dataKey="name" tick={{ fontSize: 12 }} />
            <YAxis domain={[0, 100]} tickFormatter={(v) => `${v}%`} tick={{ fontSize: 12 }} />
            <Tooltip formatter={(value) => [`${value}%`, "Completion Rate"]} />
            <Bar
              dataKey="completionRate"
              radius={[4, 4, 0, 0]}
              cursor={onDrillDown ? "pointer" : "default"}
              onClick={onDrillDown ? (entry) => onDrillDown(entry.name) : undefined}
            >
              {data.map((_, i) => <Cell key={i} fill="#22c55e" />)}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
