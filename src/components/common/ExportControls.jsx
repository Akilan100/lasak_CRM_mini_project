import React from "react";
import {
  exportDataToCsv,
  exportDataToExcel,
} from "../../services/exportService";

export default function ExportControls({ rows, name }) {
  const disabled = !rows || rows.length === 0;

  return (
    <div className="flex flex-wrap gap-3 items-center mb-4">
      <span className="text-sm text-gray-500 dark:text-gray-400">
        Export current data:
      </span>
      <button
        onClick={() => exportDataToCsv(rows, `${name}-export`)}
        disabled={disabled}
        className="rounded-md bg-indigo-600 px-4 py-2 text-sm font-semibold text-white hover:bg-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        CSV
      </button>
      <button
        onClick={() => exportDataToExcel(rows, `${name}-export`)}
        disabled={disabled}
        className="rounded-md bg-slate-600 px-4 py-2 text-sm font-semibold text-white hover:bg-slate-500 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        Excel
      </button>
    </div>
  );
}
