import React, { useMemo } from "react";
import useMappingStore from "../../store/mappingStore";
import { useFilters } from "../../context/FilterContext";
import KpiCard from "../../components/common/KpiCard";
import { formatCurrency } from "../../utils/formatCurrency";
import {
  normalizeRows,
  calculateDashboardAnalytics,
  calculateGrowthRate,
  getTopItem,
} from "../../services/analyticsEngine";

export default function Analytics() {
  const { sheets, currentSheet, isLoading } = useMappingStore();
  const { filters } = useFilters();
  const sheet = currentSheet ? sheets[currentSheet] : null;

  const analytics = useMemo(() => {
    if (!sheet?.headers || !sheet?.rows) return null;
    const rows = normalizeRows(sheet.headers, sheet.rows, currentSheet || "");
    return calculateDashboardAnalytics(rows, filters);
  }, [sheet, currentSheet, filters]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64 text-gray-500 dark:text-gray-400">
        Loading analytics…
      </div>
    );
  }

  if (!analytics) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center space-y-3 bg-white dark:bg-gray-800 p-8 rounded-lg border dark:border-gray-700 shadow-sm max-w-sm">
          <div className="text-4xl">📈</div>
          <div className="text-lg font-semibold">No data loaded</div>
          <div className="text-sm text-gray-500 dark:text-gray-400">
            Upload an Excel file to view analytics.
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

  const summary  = analytics.summary;
  const payment  = analytics.paymentAnalytics;
  const student  = analytics.studentAnalytics;
  const branch   = analytics.branchAnalytics;
  const trainer  = analytics.trainerAnalytics;
  const course   = analytics.courseAnalytics;

  const topBranch  = getTopItem(branch?.revenuePerBranch ?? []);
  const topCourse  = getTopItem(course?.revenuePerCourse ?? []);
  const topTrainer = getTopItem(trainer?.revenuePerTrainer ?? []);

  const collectionRate = summary.totalRevenue > 0
    ? Math.round((summary.collectedRevenue / summary.totalRevenue) * 100)
    : 0;

  return (
    <div className="space-y-6">

      {/* Leaders */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        <KpiCard title="Top Branch by Revenue"  value={topBranch?.name  || "—"} />
        <KpiCard title="Top Course by Revenue"  value={topCourse?.name  || "—"} />
        <KpiCard title="Top Trainer by Revenue" value={topTrainer?.name || "—"} />
        <KpiCard title="Collection Rate"        value={`${collectionRate}%`} />
      </div>

      {/* Ranking summaries */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        <KpiCard title="Best Branch (Students)" value={student?.studentsByBranch?.[0]?.name  || "—"} />
        <KpiCard title="Best Course (Students)" value={student?.studentsByCourse?.[0]?.name  || "—"} />
        <KpiCard title="Best Trainer (Students)" value={student?.studentsByTrainer?.[0]?.name || "—"} />
        <KpiCard title="Top Completion Trainer" value={trainer?.completionRatePerTrainer?.[0]?.name || "—"} />
      </div>

      {/* Revenue summary */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm border dark:border-gray-700">
          <h3 className="text-base font-semibold mb-4">Revenue Summary</h3>
          <dl className="space-y-3 text-sm">
            {[
              ["Total Revenue",     formatCurrency(summary.totalRevenue)],
              ["Collected Revenue", formatCurrency(summary.collectedRevenue)],
              ["Pending Revenue",   formatCurrency(summary.pendingRevenue)],
              ["EMI Revenue",       formatCurrency(summary.emiRevenue)],
              ["Collection Rate",   `${collectionRate}%`],
            ].map(([label, val]) => (
              <div key={label} className="flex justify-between">
                <dt className="text-gray-500 dark:text-gray-400">{label}</dt>
                <dd className="font-medium">{val}</dd>
              </div>
            ))}
          </dl>
        </div>

        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm border dark:border-gray-700">
          <h3 className="text-base font-semibold mb-4">Student Summary</h3>
          <dl className="space-y-3 text-sm">
            {[
              ["Total Students",  summary.totalStudents],
              ["Paid Students",   summary.paidStudents],
              ["EMI Students",    summary.emiStudents],
              ["Unpaid Students", summary.unpaidStudents],
              ["Completed",       summary.completedStudents],
              ["Ongoing",         summary.ongoingStudents],
              ["Dropped",         summary.droppedStudents],
            ].map(([label, val]) => (
              <div key={label} className="flex justify-between">
                <dt className="text-gray-500 dark:text-gray-400">{label}</dt>
                <dd className="font-medium">{val ?? 0}</dd>
              </div>
            ))}
          </dl>
        </div>
      </div>

      {/* Branch + Trainer summary */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm border dark:border-gray-700">
          <h3 className="text-base font-semibold mb-4">Branch Summary</h3>
          <dl className="space-y-3 text-sm">
            {[
              ["Total Branches", summary.activeBranches],
              ["Top Branch (Revenue)", topBranch ? `${topBranch.name} — ${formatCurrency(topBranch.value)}` : "—"],
              ["Top Branch (Students)", student?.studentsByBranch?.[0]?.name || "—"],
            ].map(([label, val]) => (
              <div key={label} className="flex justify-between gap-4">
                <dt className="text-gray-500 dark:text-gray-400 shrink-0">{label}</dt>
                <dd className="font-medium text-right">{val ?? 0}</dd>
              </div>
            ))}
          </dl>
        </div>

        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm border dark:border-gray-700">
          <h3 className="text-base font-semibold mb-4">Trainer Summary</h3>
          <dl className="space-y-3 text-sm">
            {[
              ["Total Trainers", summary.activeTrainers],
              ["Top Trainer (Revenue)", topTrainer ? `${topTrainer.name} — ${formatCurrency(topTrainer.value)}` : "—"],
              ["Top Completion Rate", trainer?.completionRatePerTrainer?.[0]
                ? `${trainer.completionRatePerTrainer[0].name} — ${trainer.completionRatePerTrainer[0].completionRate}%`
                : "—"],
            ].map(([label, val]) => (
              <div key={label} className="flex justify-between gap-4">
                <dt className="text-gray-500 dark:text-gray-400 shrink-0">{label}</dt>
                <dd className="font-medium text-right">{val ?? 0}</dd>
              </div>
            ))}
          </dl>
        </div>
      </div>

    </div>
  );
}
