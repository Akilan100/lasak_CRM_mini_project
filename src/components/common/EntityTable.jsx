import React from "react";

export default function EntityTable({ title, columns, rows }) {
  if (!rows || rows.length === 0) {
    return (
      <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm border dark:border-gray-700">
        <h2 className="text-lg font-semibold mb-2">{title}</h2>
        <p className="text-sm text-gray-500">
          No data available. Upload an Excel file and map your columns to enable
          this table.
        </p>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm border dark:border-gray-700 overflow-x-auto">
      <h2 className="text-lg font-semibold mb-4">{title}</h2>
      <table className="min-w-full text-sm text-left">
        <thead>
          <tr className="border-b dark:border-gray-700">
            {columns.map((col) => (
              <th
                key={col.accessor}
                className="px-3 py-2 font-medium text-gray-600 dark:text-gray-300"
              >
                {col.header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, index) => (
            <tr
              key={index}
              className="border-b last:border-b-0 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-900"
            >
              {columns.map((col) => (
                <td
                  key={col.accessor}
                  className="px-3 py-2 align-top text-gray-700 dark:text-gray-200"
                >
                  {col.render ? col.render(row) : (row[col.accessor] ?? "-")}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
