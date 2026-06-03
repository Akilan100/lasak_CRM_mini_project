import React, { useMemo } from "react";
import useMappingStore from "../../store/mappingStore";
import { useFilters } from "../../context/FilterContext";
import {
  normalizeRows,
  applyFilters,
  getPaymentRows,
  calculatePaymentAnalytics,
} from "../../services/analyticsEngine";
import EntityTable from "../../components/common/EntityTable";
import KpiCard from "../../components/common/KpiCard";
import ExportControls from "../../components/common/ExportControls";
import { formatCurrency } from "../../utils/formatCurrency";

export default function Payments() {
  const { sheets, currentSheet, isLoading } = useMappingStore();
  const { filters } = useFilters();

  const analytics = useMemo(() => {
    const sheet = currentSheet ? sheets[currentSheet] : null;
    if (!sheet?.headers || !sheet?.rows) return null;
    const normalized = normalizeRows(sheet.headers, sheet.rows, currentSheet);
    const filtered = applyFilters(normalized, filters);
    const summary = calculatePaymentAnalytics(filtered);
    const fullyPaidStudents = new Set(
      filtered.filter((r) => r.isPaid && r.studentKey).map((r) => r.studentKey)
    ).size;
    return {
      rows: getPaymentRows(filtered),
      summary,
      fullyPaidStudents,
    };
  }, [sheets, currentSheet, filters]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64 text-gray-500 dark:text-gray-400">
        Loading payments…
      </div>
    );
  }

  if (!analytics) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center space-y-3 bg-white dark:bg-gray-800 p-8 rounded-lg border dark:border-gray-700 shadow-sm max-w-sm">
          <div className="text-4xl">💳</div>
          <div className="text-lg font-semibold">No payment data</div>
          <div className="text-sm text-gray-500 dark:text-gray-400">
            Upload an Excel file to view payment information.
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
    { header: "Course", accessor: "courseName" },
    { header: "Branch", accessor: "branchName" },
    {
      header: "Total Fee",
      accessor: "totalFee",
      render: (row) => (row.totalFee != null ? formatCurrency(row.totalFee) : "-"),
    },
    {
      header: "Paid",
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
    {
      header: "Status",
      accessor: "paymentStatus",
      render: (row) => {
        const badge = row.isPaid
          ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
          : row.isUnpaid || row.isPending
          ? "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200"
          : "bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-300";
        const label = row.isPaid ? "Paid" : row.isUnpaid || row.isPending ? "Pending" : "-";
        return (
          <span className={`px-2 py-1 rounded text-xs font-medium ${badge}`}>
            {label}
          </span>
        );
      },
    },
    {
      header: "EMI",
      accessor: "isEMI",
      render: (row) =>
        row.isEMI ? (
          <span className="px-2 py-1 rounded text-xs font-medium bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200">
            EMI
          </span>
        ) : (
          <span className="text-gray-400">—</span>
        ),
    },
  ];

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-5 gap-4">
        <KpiCard title="Total Revenue"    value={formatCurrency(summary.totalRevenue ?? 0)} />
        <KpiCard title="Collected"        value={formatCurrency(summary.collectedRevenue ?? 0)} />
        <KpiCard title="Pending"          value={formatCurrency(summary.pendingRevenue ?? 0)} />
        <KpiCard title="EMI Revenue"      value={formatCurrency(summary.emiRevenue ?? 0)} />
        <KpiCard title="Fully Paid"       value={analytics.fullyPaidStudents} />
      </div>
      <ExportControls rows={rows} name="payments" />
      <EntityTable title="Payments" columns={columns} rows={rows} />
    </div>
  );
}
