import React from "react";

export default function KpiCard({ title, value, delta, accent }) {
  return (
    <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-sm border dark:border-gray-700 flex flex-col gap-1 min-w-0 hover:shadow-md hover:-translate-y-0.5 transition-all duration-150 cursor-default">
      <div className="text-xs font-medium uppercase tracking-wide text-gray-500 dark:text-gray-400 truncate">
        {title}
      </div>
      <div
        className="text-xl font-bold text-gray-900 dark:text-white truncate"
        title={String(value ?? "")}
      >
        {value ?? "—"}
      </div>
      {delta !== undefined && delta !== null && (
        <div className="text-xs text-green-500 font-medium">{delta}</div>
      )}
    </div>
  );
}
