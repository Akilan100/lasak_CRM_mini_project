import React from "react";
import { formatCurrency } from "../../utils/formatCurrency";

function InsightRow({ icon, label, value, sub, highlight }) {
  return (
    <div className={`flex items-start justify-between gap-3 py-2.5 border-b last:border-b-0 border-gray-100 dark:border-gray-700`}>
      <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400 shrink-0">
        <span>{icon}</span>
        <span>{label}</span>
      </div>
      <div className="text-right">
        <div className={`text-sm font-semibold ${highlight ? "text-amber-600 dark:text-amber-400" : "text-gray-900 dark:text-white"}`}>
          {value}
        </div>
        {sub && <div className="text-xs text-gray-400 dark:text-gray-500">{sub}</div>}
      </div>
    </div>
  );
}

export default function DepartmentInsights({ insights }) {
  if (!insights) return null;

  const {
    highestRevenueDept,
    mostPopularDept,
    lowestEnrollmentDept,
    highestCollectionDept,
    highestPendingDept,
  } = insights;

  const rows = [
    highestRevenueDept && {
      icon: "💰", label: "Highest Revenue Dept",
      value: highestRevenueDept.name,
      sub: formatCurrency(highestRevenueDept.revenue),
    },
    mostPopularDept && {
      icon: "🏆", label: "Most Popular Dept",
      value: mostPopularDept.name,
      sub: `${mostPopularDept.students} students`,
    },
    lowestEnrollmentDept && {
      icon: "📉", label: "Lowest Enrollment Dept",
      value: lowestEnrollmentDept.name,
      sub: `${lowestEnrollmentDept.students} students`,
      highlight: true,
    },
    highestCollectionDept && {
      icon: "✅", label: "Best Collection Rate",
      value: highestCollectionDept.name,
      sub: highestCollectionDept.revenue > 0
        ? `${Math.round((highestCollectionDept.collected / highestCollectionDept.revenue) * 100)}%`
        : "—",
    },
    highestPendingDept && {
      icon: "⚠️", label: "Highest Pending Dept",
      value: highestPendingDept.name,
      sub: formatCurrency(highestPendingDept.pending),
      highlight: true,
    },
  ].filter(Boolean);

  return (
    <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-sm border dark:border-gray-700">
      <h3 className="font-semibold mb-1">Department Insights</h3>
      <p className="text-xs text-gray-400 dark:text-gray-500 mb-3">Auto-generated from department data</p>
      <div>
        {rows.map((item, i) => <InsightRow key={i} {...item} />)}
        {rows.length === 0 && (
          <div className="text-sm text-gray-400 py-4 text-center">No insights available</div>
        )}
      </div>
    </div>
  );
}
