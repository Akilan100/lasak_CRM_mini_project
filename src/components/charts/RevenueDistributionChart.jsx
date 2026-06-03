import React from "react";
import {
  PieChart, Pie, Cell, Tooltip,
  ResponsiveContainer, Legend,
} from "recharts";
import { formatCurrency } from "../../utils/formatCurrency";

const COLORS = {
  Collected:     "#10b981",
  Pending:       "#f59e0b",
  "EMI Balance": "#6366f1",
};

function CustomTooltip({ active, payload }) {
  if (!active || !payload?.length) return null;
  const { name, value, total } = payload[0].payload;
  const pct = total > 0 ? Math.round((value / total) * 100) : 0;
  return (
    <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded px-3 py-2 shadow text-sm">
      <div className="font-semibold">{name}</div>
      <div>{formatCurrency(value)}</div>
      <div className="text-gray-500 text-xs">{pct}% of total</div>
    </div>
  );
}

function renderLabel({ cx, cy, midAngle, innerRadius, outerRadius, percent }) {
  if (percent < 0.05) return null;
  const RADIAN = Math.PI / 180;
  const r = innerRadius + (outerRadius - innerRadius) * 0.55;
  const x = cx + r * Math.cos(-midAngle * RADIAN);
  const y = cy + r * Math.sin(-midAngle * RADIAN);
  return (
    <text x={x} y={y} fill="#fff" textAnchor="middle" dominantBaseline="central" fontSize={12} fontWeight={600}>
      {`${Math.round(percent * 100)}%`}
    </text>
  );
}

export default function RevenueDistributionChart({ collected = 0, pending = 0, emiBalance = 0, onDrillDown }) {
  const total = collected + pending;

  if (total === 0) {
    return (
      <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-sm border dark:border-gray-700">
        <h3 className="mb-2 font-semibold">Revenue Distribution</h3>
        <div className="flex items-center justify-center h-[260px] text-sm text-gray-400">No revenue data available</div>
      </div>
    );
  }

  const data = [
    { name: "Collected",   value: collected,  total },
    { name: "Pending",     value: pending,    total },
    { name: "EMI Balance", value: emiBalance, total },
  ].filter((d) => d.value > 0);

  return (
    <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-sm border dark:border-gray-700">
      <h3 className="mb-2 font-semibold">
        Revenue Distribution
        {onDrillDown && <span className="ml-2 text-xs font-normal text-indigo-400">click slice to drill down</span>}
      </h3>
      <div style={{ width: "100%", height: 260 }}>
        <ResponsiveContainer>
          <PieChart>
            <Pie
              data={data}
              dataKey="value"
              nameKey="name"
              outerRadius={95}
              innerRadius={42}
              labelLine={false}
              label={renderLabel}
              cursor={onDrillDown ? "pointer" : "default"}
              onClick={onDrillDown ? (entry) => onDrillDown(entry.name) : undefined}
            >
              {data.map((entry) => (
                <Cell key={entry.name} fill={COLORS[entry.name] ?? "#9ca3af"} />
              ))}
            </Pie>
            <Tooltip content={<CustomTooltip />} />
            <Legend
              iconType="circle"
              iconSize={10}
              formatter={(value) => (
                <span className="text-xs text-gray-700 dark:text-gray-300">{value}</span>
              )}
            />
          </PieChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
