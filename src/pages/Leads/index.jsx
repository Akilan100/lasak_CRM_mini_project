import React from "react";

export default function Leads() {
  return (
    <div className="flex items-center justify-center h-64">
      <div className="text-center space-y-3 bg-white dark:bg-gray-800 p-8 rounded-lg border dark:border-gray-700 shadow-sm max-w-sm">
        <div className="text-4xl">📋</div>
        <div className="text-lg font-semibold">Leads not available</div>
        <div className="text-sm text-gray-500 dark:text-gray-400">
          The Enrolled sheet does not contain lead source or lead status data.
          Upload a dedicated leads sheet to enable this section.
        </div>
      </div>
    </div>
  );
}
