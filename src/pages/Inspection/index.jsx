import React, { useMemo } from "react";
import useMappingStore from "../../store/mappingStore";
import DataMapper from "../../components/common/DataMapper";

export default function Inspection() {
  const { sheets, currentSheet, setCurrentSheet } = useMappingStore();
  const sheetNames = Object.keys(sheets);
  const sheet = currentSheet ? sheets[currentSheet] : sheets[sheetNames?.[0]];

  const warnings = useMemo(() => {
    if (!sheet) return ["No sheet is currently loaded."];
    const issues = [];
    if (!sheet.headers?.length)
      issues.push("No headers detected in the selected sheet.");
    if (!sheet.rows?.length)
      issues.push("The selected sheet contains no data rows.");
    if (!sheet.detection?.students?.length)
      issues.push("No student fields detected.");
    if (!sheet.detection?.payments?.length)
      issues.push("No payment fields detected.");
    if (!sheet.detection?.leads?.length)
      issues.push("No lead fields detected.");
    if (!sheet.detection?.courses?.length)
      issues.push("No course fields detected.");
    if (!sheet.detection?.branches?.length)
      issues.push("No branch fields detected.");
    if (!sheet.detection?.trainers?.length)
      issues.push("No trainer fields detected.");

    if (sheet.missingFields) {
      for (const [entity, fields] of Object.entries(sheet.missingFields)) {
        if (fields.length > 0) {
          issues.push(`Missing ${entity} fields: ${fields.join(", ")}`);
        }
      }
    }

    return issues;
  }, [sheet]);

  return (
    <div className="space-y-6">
      <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm border dark:border-gray-700">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="text-lg font-semibold">Data Inspection</h2>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
              Review detected sheet names, entity mappings, confidence scores,
              and sample values.
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            {sheetNames.map((name) => (
              <button
                key={name}
                onClick={() => setCurrentSheet(name)}
                className={`px-3 py-2 rounded text-sm font-medium transition-colors ${
                  currentSheet === name
                    ? "bg-indigo-600 text-white"
                    : "bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-200"
                }`}
              >
                {name}
              </button>
            ))}
          </div>
        </div>
      </div>

      {!sheet && (
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm border dark:border-gray-700">
          <p className="text-sm text-gray-500">
            Upload an Excel file first to inspect sheet detection.
          </p>
        </div>
      )}

      {sheet && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            <div className="bg-white dark:bg-gray-800 p-4 rounded-lg border dark:border-gray-700">
              <div className="text-sm uppercase text-gray-500">Sheet Name</div>
              <div className="mt-2 text-lg font-semibold">
                {sheet.sheetName}
              </div>
            </div>
            <div className="bg-white dark:bg-gray-800 p-4 rounded-lg border dark:border-gray-700">
              <div className="text-sm uppercase text-gray-500">Headers</div>
              <div className="mt-2 text-lg font-semibold">
                {sheet.headerCount}
              </div>
            </div>
            <div className="bg-white dark:bg-gray-800 p-4 rounded-lg border dark:border-gray-700">
              <div className="text-sm uppercase text-gray-500">Rows</div>
              <div className="mt-2 text-lg font-semibold">{sheet.rowCount}</div>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm border dark:border-gray-700">
            <h3 className="text-lg font-semibold mb-3">Detected Issues</h3>
            {warnings.length > 0 ? (
              <ul className="space-y-2 text-sm text-gray-600 dark:text-gray-300">
                {warnings.map((issue, idx) => (
                  <li
                    key={idx}
                    className="rounded border border-red-200 dark:border-red-700 bg-red-50 dark:bg-red-900 p-3"
                  >
                    {issue}
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-sm text-green-700 dark:text-green-300">
                No issues detected. Mapping confidence is healthy.
              </p>
            )}
          </div>

          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm border dark:border-gray-700">
            <DataMapper analysis={sheet} />
          </div>
        </div>
      )}
    </div>
  );
}
