import React from "react";
import { useFilters } from "../../context/FilterContext";

export default function FilterBar() {
  const { filters, setFilter, resetFilters, options } = useFilters();

  const hasActiveFilters = Object.values(filters).some((v) => v !== "");

  const renderSelect = (label, field, choices) => (
    <label key={field} className="space-y-1 text-sm text-gray-700 dark:text-gray-200">
      <div className="font-medium">{label}</div>
      <select
        value={filters[field] ?? ""}
        onChange={(e) => setFilter(field, e.target.value)}
        className="w-full rounded-md border border-gray-200 bg-white text-sm text-gray-700 px-2 py-1.5 shadow-sm focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-100"
      >
        <option value="">All</option>
        {choices.map((opt) => (
          <option key={opt} value={opt}>
            {opt}
          </option>
        ))}
      </select>
    </label>
  );

  return (
    <div className="bg-white dark:bg-gray-800 p-4 rounded-lg border dark:border-gray-700 shadow-sm mb-6">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-3 flex-1">
          {renderSelect("Branch",         "branch",        options.branches        ?? [])}
          {renderSelect("Course",         "course",        options.courses         ?? [])}
          {renderSelect("Trainer",        "trainer",       options.trainers        ?? [])}
          {renderSelect("Student Status", "studentStatus", options.studentStatuses ?? [])}
          {renderSelect("Payment Status", "paymentStatus", options.paymentStatuses ?? [])}
          {renderSelect("Location",       "location",      options.locations       ?? [])}
        </div>
        <button
          onClick={resetFilters}
          disabled={!hasActiveFilters}
          className="self-end inline-flex items-center justify-center rounded-md bg-indigo-600 px-4 py-2 text-sm font-semibold text-white hover:bg-indigo-500 disabled:opacity-40 disabled:cursor-not-allowed transition-colors whitespace-nowrap"
        >
          Reset Filters
        </button>
      </div>
    </div>
  );
}
