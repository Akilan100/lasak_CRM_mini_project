import React from "react";
import { formatCurrency } from "../../utils/formatCurrency";

function InsightRow({ icon, label, value, highlight }) {
  return (
    <div className={`flex items-start justify-between gap-3 py-2.5 border-b last:border-b-0 border-gray-100 dark:border-gray-700 ${highlight ? "text-amber-600 dark:text-amber-400" : ""}`}>
      <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400 shrink-0">
        <span>{icon}</span>
        <span>{label}</span>
      </div>
      <div className={`text-sm font-semibold text-right ${highlight ? "text-amber-600 dark:text-amber-400" : "text-gray-900 dark:text-white"}`}>
        {value}
      </div>
    </div>
  );
}

export default function InsightsPanel({ analytics }) {
  if (!analytics) return null;

  const { summary, studentAnalytics, paymentAnalytics, courseAnalytics, branchAnalytics, trainerAnalytics } = analytics;

  const collectionRate = summary.totalRevenue > 0
    ? Math.round((summary.collectedRevenue / summary.totalRevenue) * 100)
    : 0;

  const topCourse   = courseAnalytics?.revenuePerCourse?.[0];
  const topBranch   = branchAnalytics?.revenuePerBranch?.[0];
  const topTrainer  = studentAnalytics?.studentsByTrainer?.[0];
  const emiBalance  = summary.pendingRevenue ?? 0;

  const isPendingHigh = collectionRate < 70;

  const insights = [
    topCourse  && { icon: "🏆", label: "Highest Revenue Course",   value: topCourse.name },
    topBranch  && { icon: "🏢", label: "Top Performing Branch",     value: topBranch.name },
    topTrainer && { icon: "👨‍🏫", label: "Trainer with Most Students", value: `${topTrainer.name} (${topTrainer.value})` },
    {
      icon: "💰",
      label: "Collection Rate",
      value: `${collectionRate}%`,
      highlight: isPendingHigh,
    },
    summary.pendingRevenue > 0 && {
      icon: "📉",
      label: "Pending Revenue",
      value: formatCurrency(summary.pendingRevenue),
      highlight: isPendingHigh,
    },
    summary.emiStudents > 0 && {
      icon: "⚡",
      label: "EMI Students",
      value: summary.emiStudents,
    },
    summary.droppedStudents > 0 && {
      icon: "⚠️",
      label: "Dropped Students",
      value: summary.droppedStudents,
      highlight: summary.droppedStudents > summary.totalStudents * 0.1,
    },
    summary.completedStudents > 0 && {
      icon: "✅",
      label: "Completion Rate",
      value: summary.totalStudents > 0
        ? `${Math.round((summary.completedStudents / summary.totalStudents) * 100)}%`
        : "—",
    },
  ].filter(Boolean);

  return (
    <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-sm border dark:border-gray-700">
      <h3 className="font-semibold mb-1">Key Insights</h3>
      <p className="text-xs text-gray-400 dark:text-gray-500 mb-3">
        Auto-generated from uploaded workbook data
      </p>
      <div>
        {insights.map((item, i) => (
          <InsightRow key={i} {...item} />
        ))}
        {insights.length === 0 && (
          <div className="text-sm text-gray-400 py-4 text-center">
            No insights available yet
          </div>
        )}
      </div>
    </div>
  );
}
