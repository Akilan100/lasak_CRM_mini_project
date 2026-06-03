import React, { useMemo } from "react";
import useMappingStore from "../../store/mappingStore";
import { useFilters } from "../../context/FilterContext";
import {
  normalizeRows,
  applyFilters,
  getStudentRows,
  calculateStudentAnalytics,
} from "../../services/analyticsEngine";
import EntityTable from "../../components/common/EntityTable";
import KpiCard from "../../components/common/KpiCard";
import ExportControls from "../../components/common/ExportControls";
import { formatCurrency } from "../../utils/formatCurrency";

export default function Students() {
  const { sheets, currentSheet, isLoading } = useMappingStore();
  const { filters } = useFilters();

  const analytics = useMemo(() => {
    const sheet = currentSheet ? sheets[currentSheet] : null;
    if (!sheet?.headers || !sheet?.rows) return null;
    const normalized = normalizeRows(sheet.headers, sheet.rows, currentSheet);
    const filtered = applyFilters(normalized, filters);
    return {
      rows: getStudentRows(filtered),
      summary: calculateStudentAnalytics(filtered),
    };
  }, [sheets, currentSheet, filters]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64 text-gray-500 dark:text-gray-400">
        Loading students…
      </div>
    );
  }

  if (!analytics) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center space-y-3 bg-white dark:bg-gray-800 p-8 rounded-lg border dark:border-gray-700 shadow-sm max-w-sm">
          <div className="text-4xl">👥</div>
          <div className="text-lg font-semibold">No student data</div>
          <div className="text-sm text-gray-500 dark:text-gray-400">
            Upload an Excel file to view student information.
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
  const summary = analytics.summary;

  const columns = [
    { header: "Student", accessor: "studentName" },
    { header: "Phone", accessor: "studentPhone" },
    { header: "Course", accessor: "courseName" },
    { header: "Branch", accessor: "branchName" },
    { header: "Trainer", accessor: "trainerName" },
    { header: "Status", accessor: "completionStatus", render: (row) => {
      const status = row.completionStatus || row.enrollmentStatus || "-";
      return (
        <span className="capitalize">
          {status}
        </span>
      );
    }},
    {
      header: "Payment Status",
      accessor: "paymentStatus",
      render: (row) => {
        const badge = row.isPaid
          ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
          : row.isPending || row.isUnpaid
          ? "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200"
          : "bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-300";
        const label = row.isPaid ? "Paid" : row.isPending || row.isUnpaid ? "Pending" : "-";
        return (
          <span className={`px-2 py-1 rounded text-xs font-medium ${badge}`}>
            {label}
          </span>
        );
      },
    },
    {
      header: "Total Fee",
      accessor: "totalFee",
      render: (row) =>
        row.totalFee != null ? formatCurrency(row.totalFee) : "-",
    },
    {
      header: "Paid Amount",
      accessor: "paymentAmount",
      render: (row) =>
        row.paymentAmount != null ? formatCurrency(row.paymentAmount) : "-",
    },
    {
      header: "Balance",
      accessor: "balanceAmount",
      render: (row) =>
        row.balanceAmount != null ? formatCurrency(row.balanceAmount) : "-",
    },
  ];

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-5 gap-4">
        <KpiCard title="Total Students" value={summary.totalStudents || 0} />
        <KpiCard title="Paid Students" value={summary.paidStudents || 0} />
        <KpiCard title="Completed" value={summary.completedStudents || 0} />
        <KpiCard title="Ongoing" value={summary.ongoingStudents || 0} />
        <KpiCard title="Dropped" value={summary.droppedStudents || 0} />
      </div>
      <ExportControls rows={rows} name="students" />
      <EntityTable title="Students" columns={columns} rows={rows} />
    </div>
  );
}
