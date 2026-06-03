import React from "react";
import { FiX, FiAlertCircle } from "react-icons/fi";

/**
 * Data Mapper UI Component - Shows automatic column detection and allows manual override
 */
export default function DataMapper({ analysis }) {
  if (!analysis) return null;

  const {
    headers,
    detection,
    primaryEntity,
    rowCount,
    sampleData,
    columnAnalysis = [],
    unmappedColumns = [],
    missingFields = {},
  } = analysis;

  const entityCounts = Object.fromEntries(
    Object.entries(detection).map(([entity, columns]) => [
      entity,
      columns.length,
    ]),
  );

  const missingSummary = Object.entries(missingFields).filter(
    ([, fields]) => fields.length > 0,
  );

  return (
    <div className="space-y-6">
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div className="bg-blue-50 dark:bg-blue-900 border border-blue-200 dark:border-blue-700 p-4 rounded">
          <div className="text-sm uppercase tracking-wide text-blue-700 dark:text-blue-200">
            Primary Entity
          </div>
          <div className="mt-2 text-lg font-semibold text-blue-900 dark:text-white">
            {primaryEntity}
          </div>
        </div>
        <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 p-4 rounded">
          <div className="text-sm uppercase tracking-wide text-gray-500 dark:text-gray-400">
            Columns
          </div>
          <div className="mt-2 text-lg font-semibold">{headers.length}</div>
        </div>
        <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 p-4 rounded">
          <div className="text-sm uppercase tracking-wide text-gray-500 dark:text-gray-400">
            Data Rows
          </div>
          <div className="mt-2 text-lg font-semibold">{rowCount}</div>
        </div>
        <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 p-4 rounded">
          <div className="text-sm uppercase tracking-wide text-gray-500 dark:text-gray-400">
            Unmapped
          </div>
          <div className="mt-2 text-lg font-semibold">
            {unmappedColumns.length}
          </div>
        </div>
      </div>

      <div className="bg-white dark:bg-gray-800 p-4 rounded border dark:border-gray-700">
        <div className="flex items-center justify-between mb-3">
          <div>
            <div className="font-semibold">Entity Detection Results</div>
            <p className="text-xs text-gray-500 dark:text-gray-400">
              Top candidates for each entity with detection confidence and
              reasons.
            </p>
          </div>
          <div className="text-xs text-gray-500 dark:text-gray-400">
            {Object.entries(entityCounts)
              .map(([entity, count]) => `${entity}: ${count}`)
              .join(" · ")}
          </div>
        </div>
        <div className="grid gap-4 lg:grid-cols-2">
          {Object.entries(detection).map(([entity, columns]) => (
            <div
              key={entity}
              className="bg-gray-50 dark:bg-gray-900 p-4 rounded border border-gray-200 dark:border-gray-700"
            >
              <div className="font-semibold capitalize mb-2">{entity}</div>
              {columns.length > 0 ? (
                <div className="space-y-2">
                  {columns.map((col, idx) => (
                    <div
                      key={idx}
                      className="flex flex-col gap-2 text-sm p-3 bg-white dark:bg-gray-800 rounded border border-gray-200 dark:border-gray-700"
                    >
                      <div className="flex items-center justify-between gap-2">
                        <span className="font-medium truncate">
                          {col.header}
                        </span>
                        <span className="text-xs text-gray-500">
                          col {col.index}
                        </span>
                      </div>
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="text-xs text-white bg-indigo-600 rounded-full px-2 py-0.5">
                          {col.score}
                        </span>
                        <span className="text-xs text-gray-500">
                          {col.reasons?.length
                            ? col.reasons.join(", ")
                            : "No explicit match reason"}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-xs text-gray-500">
                  No columns detected for this entity.
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      <div className="bg-white dark:bg-gray-800 p-4 rounded border dark:border-gray-700">
        <div className="flex items-center justify-between mb-3">
          <div>
            <div className="font-semibold">Column Diagnostics</div>
            <p className="text-xs text-gray-500 dark:text-gray-400">
              All headers classified with entity confidence and match reasons.
            </p>
          </div>
          <span className="text-xs text-gray-500 dark:text-gray-400">
            {columnAnalysis.length} headers analyzed
          </span>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full text-xs border-separate border-spacing-0">
            <thead>
              <tr className="bg-gray-100 dark:bg-gray-900 text-left text-gray-600 dark:text-gray-300">
                <th className="px-3 py-2 font-semibold">#</th>
                <th className="px-3 py-2 font-semibold">Header</th>
                <th className="px-3 py-2 font-semibold">Detected Entity</th>
                <th className="px-3 py-2 font-semibold">Confidence</th>
                <th className="px-3 py-2 font-semibold">Reasons</th>
              </tr>
            </thead>
            <tbody>
              {columnAnalysis.map((col) => (
                <tr
                  key={col.index}
                  className="border-b border-gray-200 dark:border-gray-700"
                >
                  <td className="px-3 py-2 text-gray-600 dark:text-gray-300">
                    {col.index}
                  </td>
                  <td className="px-3 py-2 text-gray-700 dark:text-gray-200">
                    {col.header}
                  </td>
                  <td className="px-3 py-2 capitalize text-gray-700 dark:text-gray-200">
                    {col.detectedEntity}
                  </td>
                  <td className="px-3 py-2 text-gray-700 dark:text-gray-200">
                    <span className="inline-flex items-center rounded-full bg-gray-100 dark:bg-gray-900 px-2 py-0.5 text-xs font-semibold text-gray-700 dark:text-gray-200">
                      {col.confidence}
                    </span>
                  </td>
                  <td className="px-3 py-2 text-gray-500 dark:text-gray-400">
                    {col.reasons?.length > 0 ? col.reasons.join(", ") : "None"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {unmappedColumns.length > 0 && (
        <div className="bg-white dark:bg-gray-800 p-4 rounded border border-red-200 dark:border-red-700">
          <div className="flex items-center gap-2 mb-2 text-sm font-semibold text-red-700 dark:text-red-300">
            <FiX /> Rejected / Unmapped Columns
          </div>
          <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
            {unmappedColumns.map((col) => (
              <div
                key={col.index}
                className="rounded bg-red-50 dark:bg-red-900 p-2 text-xs text-red-700 dark:text-red-200"
              >
                <div className="font-semibold">
                  [{col.index}] {col.header}
                </div>
                <div className="text-gray-600 dark:text-gray-300">
                  Confidence {col.confidence}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {missingSummary.length > 0 && (
        <div className="bg-white dark:bg-gray-800 p-4 rounded border border-orange-200 dark:border-orange-700">
          <div className="flex items-center gap-2 mb-2 text-sm font-semibold text-orange-700 dark:text-orange-200">
            <FiAlertCircle /> Missing Required Fields
          </div>
          <div className="space-y-3 text-xs text-gray-700 dark:text-gray-300">
            {missingSummary.map(([entity, fields]) => (
              <div key={entity}>
                <div className="font-semibold capitalize">{entity}</div>
                <div>{fields.join(", ")}</div>
              </div>
            ))}
          </div>
        </div>
      )}

      {sampleData.length > 0 && (
        <div className="bg-white dark:bg-gray-800 p-4 rounded border dark:border-gray-700">
          <div className="font-semibold mb-3">Sample Data (First 5 Rows)</div>
          <div className="overflow-x-auto">
            <table className="min-w-full text-xs">
              <thead>
                <tr className="border-b border-gray-200 dark:border-gray-700">
                  {headers.slice(0, 8).map((h, i) => (
                    <th
                      key={i}
                      className="text-left px-2 py-2 font-semibold text-gray-600 dark:text-gray-400"
                    >
                      {h}
                    </th>
                  ))}
                  {headers.length > 8 && (
                    <th className="text-left px-2 py-2 text-gray-500">
                      +{headers.length - 8} more
                    </th>
                  )}
                </tr>
              </thead>
              <tbody>
                {sampleData.map((row, ridx) => (
                  <tr
                    key={ridx}
                    className="border-b border-gray-200 dark:border-gray-700"
                  >
                    {headers.slice(0, 8).map((_, cidx) => (
                      <td
                        key={cidx}
                        className="px-2 py-2 text-gray-700 dark:text-gray-300"
                      >
                        {String(row[cidx] || "").slice(0, 30)}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

    </div>
  );
}
