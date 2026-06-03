import React from "react";
import {
  BarChart, Bar, XAxis, YAxis, Tooltip,
  ResponsiveContainer, CartesianGrid, Cell,
} from "recharts";
import { formatCurrency } from "../../utils/formatCurrency";

const DEPT_COLORS = {
  "MECH":   "#6366f1",
  "CSE/IT": "#06b6d4",
  "CIVIL":  "#f59e0b",
  "ARTS":   "#ec4899",
  "KIDS":   "#10b981",
  "OTHER":  "#9ca3af",
};

export default function DepartmentRevenueChart({ data, onDrillDown }) {
  if (!data || data.length === 0) {
    return (
      <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-sm border dark:border-gray-700">
        <h3 className="mb-2 font-semibold">Revenue by Department</h3>
        <div className="flex items-center justify-center h-[280px] text-sm text-gray-400">No data available</div>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-sm border dark:border-gray-700">
      <h3 className="mb-1 font-semibold">
        Revenue by Department
        {onDrillDown && (
          <span className="ml-2 text-xs font-normal text-indigo-400">click bar to explore</span>
        )}
      </h3>
      <div style={{ width: "100%", height: 280 }}>
        <ResponsiveContainer>
          <BarChart
            data={data}
            layout="vertical"
            margin={{ top: 4, right: 16, left: 8, bottom: 4 }}
          >
            <CartesianGrid strokeDasharray="3 3" horizontal={false} />
            <XAxis
              type="number"
              tickFormatter={(v) => formatCurrency(v, { compact: true })}
              tick={{ fontSize: 11 }}
            />
            <YAxis
              type="category"
              dataKey="name"
              tick={{ fontSize: 12 }}
              width={60}
            />
            <Tooltip formatter={(value) => [formatCurrency(value), "Revenue"]} />
            <Bar
              dataKey="value"
              radius={[0, 4, 4, 0]}
              cursor={onDrillDown ? "pointer" : "default"}
              onClick={onDrillDown ? (entry) => onDrillDown(entry.name) : undefined}
            >
              {data.map((entry) => (
                <Cell key={entry.name} fill={DEPT_COLORS[entry.name] ?? "#9ca3af"} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
