import React from "react";
import { formatCurrency } from "../../utils/formatCurrency";

function PerformerCard({ icon, label, name, students, revenue }) {
  if (!name) return null;
  return (
    <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-sm border dark:border-gray-700 flex flex-col gap-3 hover:shadow-md transition-shadow">
      <div className="flex items-center gap-2">
        <span className="text-xl">{icon}</span>
        <span className="text-xs font-medium uppercase tracking-wide text-gray-500 dark:text-gray-400">
          {label}
        </span>
      </div>
      <div className="text-base font-bold text-gray-900 dark:text-white truncate" title={name}>
        {name}
      </div>
      <div className="flex items-center gap-4 text-sm text-gray-500 dark:text-gray-400">
        {students != null && (
          <div className="flex items-center gap-1">
            <span className="text-indigo-500 font-semibold">{students}</span>
            <span>students</span>
          </div>
        )}
        {revenue != null && revenue > 0 && (
          <div className="flex items-center gap-1">
            <span className="text-emerald-500 font-semibold">
              {formatCurrency(revenue, { compact: true })}
            </span>
            <span>revenue</span>
          </div>
        )}
      </div>
    </div>
  );
}

export default function TopPerformers({ courseAnalytics, branchAnalytics, trainerAnalytics, studentAnalytics }) {
  const topCourse  = courseAnalytics?.studentsPerCourse?.[0];
  const topCourseRev = courseAnalytics?.revenuePerCourse?.[0];

  const topBranch  = branchAnalytics?.studentsPerBranch?.[0];
  const topBranchRev = branchAnalytics?.revenuePerBranch?.[0];

  const topTrainer = studentAnalytics?.studentsByTrainer?.[0];
  const topTrainerRev = trainerAnalytics?.revenuePerTrainer?.[0];

  if (!topCourse && !topBranch && !topTrainer) return null;

  return (
    <div>
      <div className="text-sm font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-3">
        Top Performers
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <PerformerCard
          icon="📚"
          label="Top Course"
          name={topCourse?.name}
          students={topCourse?.value}
          revenue={topCourseRev?.name === topCourse?.name ? topCourseRev?.value : null}
        />
        <PerformerCard
          icon="🏢"
          label="Top Branch"
          name={topBranch?.name}
          students={topBranch?.value}
          revenue={topBranchRev?.name === topBranch?.name ? topBranchRev?.value : null}
        />
        <PerformerCard
          icon="🧑🏫"
          label="Top Trainer"
          name={topTrainer?.name}
          students={topTrainer?.value}
          revenue={topTrainerRev?.name === topTrainer?.name ? topTrainerRev?.value : null}
        />
      </div>
    </div>
  );
}
