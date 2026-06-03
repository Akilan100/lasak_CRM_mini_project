import React, { useMemo } from "react";
import useMappingStore from "../../store/mappingStore";
import { useFilters } from "../../context/FilterContext";
import {
  normalizeRows,
  applyFilters,
  calculateTrainerAnalytics,
} from "../../services/analyticsEngine";
import EntityTable from "../../components/common/EntityTable";
import KpiCard from "../../components/common/KpiCard";
import ExportControls from "../../components/common/ExportControls";
import { formatCurrency } from "../../utils/formatCurrency";

export default function Trainers() {
  const { sheets, currentSheet, isLoading } = useMappingStore();
  const { filters } = useFilters();

  const analytics = useMemo(() => {
    const sheet = currentSheet ? sheets[currentSheet] : null;
    if (!sheet?.headers || !sheet?.rows) return null;
    const normalized = normalizeRows(sheet.headers, sheet.rows, currentSheet);
    const filtered = applyFilters(normalized, filters);
    const ta = calculateTrainerAnalytics(filtered);

    const rows = ta.studentsPerTrainer.map((item) => ({
      trainerName:    item.name,
      students:       item.value,
      revenue:        ta.revenuePerTrainer.find((e) => e.name === item.name)?.value ?? 0,
      completionRate: `${ta.completionRatePerTrainer.find((e) => e.name === item.name)?.completionRate ?? 0}%`,
    }));

    return { rows, trainerAnalytics: ta };
  }, [sheets, currentSheet, filters]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64 text-gray-500 dark:text-gray-400">
        Loading trainers…
      </div>
    );
  }

  if (!analytics) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center space-y-3 bg-white dark:bg-gray-800 p-8 rounded-lg border dark:border-gray-700 shadow-sm max-w-sm">
          <div className="text-4xl">🧑‍🏫</div>
          <div className="text-lg font-semibold">No trainer data</div>
          <div className="text-sm text-gray-500 dark:text-gray-400">
            Upload an Excel file to view trainer information.
          </div>
          <a
            href="/upload"
            className="inline-block mt-2 px-4 py-2 bg-indigo-600 text-white text-sm font-medium rounded hover:bg-indigo-500 transition-colors"
          >
            Upload Excel
          </a>
        </div>
      </div>
    );
  }

  const rows = analytics.rows;
  const ta = analytics.trainerAnalytics;
  const totalTrainers       = ta.studentsPerTrainer.length;
  const bestByStudents      = ta.studentsPerTrainer[0]?.name || "—";
  const bestByCompletion    = ta.completionRatePerTrainer[0]?.name || "—";

  const columns = [
    { header: "Trainer",    accessor: "trainerName" },
    { header: "Students",   accessor: "students" },
    {
      header: "Revenue",
      accessor: "revenue",
      render: (row) => formatCurrency(row.revenue),
    },
    { header: "Completion", accessor: "completionRate" },
  ];

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <KpiCard title="Total Trainers"           value={totalTrainers} />
        <KpiCard title="Most Students"            value={bestByStudents} />
        <KpiCard title="Best Completion Rate"     value={bestByCompletion} />
      </div>
      <ExportControls rows={rows} name="trainers" />
      <EntityTable title="Trainers" columns={columns} rows={rows} />
    </div>
  );
}
