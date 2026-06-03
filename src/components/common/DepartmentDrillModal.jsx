import React, { useState, useEffect, useCallback } from "react";
import { FiX, FiChevronRight, FiDownload } from "react-icons/fi";
import { formatCurrency } from "../../utils/formatCurrency";
import DrillDownModal from "./DrillDownModal";

const DEPT_COLORS = {
  "MECH":   "bg-indigo-500",
  "CSE/IT": "bg-cyan-500",
  "CIVIL":  "bg-amber-500",
  "ARTS":   "bg-pink-500",
  "KIDS":   "bg-emerald-500",
  "OTHER":  "bg-gray-400",
};

function exportCoursesCsv(courses, deptName) {
  const headers = ["Course", "Students", "Revenue", "Collected", "Balance Due", "Trainers"];
  const lines = [
    headers.join(","),
    ...courses.map((c) =>
      [
        `"${c.name}"`,
        c.students,
        c.revenue,
        c.collected,
        c.pending,
        c.trainerCount,
      ].join(",")
    ),
  ];
  const blob = new Blob([lines.join("\n")], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `${deptName}_courses.csv`;
  a.click();
  URL.revokeObjectURL(url);
}

export default function DepartmentDrillModal({ open, deptData, onClose }) {
  // Second-level: student records for a specific course
  const [courseModal, setCourseModal] = useState({ open: false, title: "", rows: [] });

  // Reset second level when department changes or modal closes
  useEffect(() => {
    setCourseModal({ open: false, title: "", rows: [] });
  }, [open, deptData?.name]);

  // Escape key
  useEffect(() => {
    if (!open) return;
    const handler = (e) => { if (e.key === "Escape" && !courseModal.open) onClose(); };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [open, onClose, courseModal.open]);

  const handleCourseClick = useCallback((course) => {
    setCourseModal({
      open:  true,
      title: `Students in ${course.name}`,
      rows:  course.rows,
    });
  }, []);

  const closeCourseModal = useCallback(() => {
    setCourseModal((s) => ({ ...s, open: false }));
  }, []);

  if (!open || !deptData) return null;

  const { name, students, revenue, collected, pending, courses } = deptData;
  const dotColor = DEPT_COLORS[name] ?? "bg-gray-400";
  const collectionRate = revenue > 0 ? Math.round((collected / revenue) * 100) : 0;

  return (
    <>
      {/* ── Backdrop ── */}
      <div
        className="fixed inset-0 z-50 flex items-center justify-center p-4"
        style={{ backgroundColor: "rgba(0,0,0,0.55)" }}
        onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
      >
        {/* ── Panel ── */}
        <div className="bg-white dark:bg-gray-900 rounded-xl shadow-2xl flex flex-col w-full max-w-3xl max-h-[88vh] border dark:border-gray-700">

          {/* Header */}
          <div className="flex items-center justify-between px-5 py-4 border-b dark:border-gray-700 flex-shrink-0">
            <div className="flex items-center gap-3">
              <span className={`inline-block w-3 h-3 rounded-full ${dotColor}`} />
              <div>
                <div className="text-base font-semibold text-gray-900 dark:text-white">
                  {name} Department
                </div>
                <div className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                  {courses.length} course{courses.length !== 1 ? "s" : ""} · {students} students
                </div>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-500 hover:text-gray-700 dark:hover:text-gray-200 transition-colors"
            >
              <FiX size={18} />
            </button>
          </div>

          {/* Summary strip */}
          <div className="flex flex-wrap gap-6 px-5 py-3 bg-gray-50 dark:bg-gray-800/50 border-b dark:border-gray-700 flex-shrink-0">
            {[
              ["Total Revenue",   formatCurrency(revenue)],
              ["Collected",       formatCurrency(collected)],
              ["Pending",         formatCurrency(pending)],
              ["Collection Rate", `${collectionRate}%`],
            ].map(([label, val]) => (
              <div key={label} className="flex flex-col">
                <span className="text-xs text-gray-500 dark:text-gray-400">{label}</span>
                <span className="text-sm font-semibold text-gray-900 dark:text-white">{val}</span>
              </div>
            ))}
          </div>

          {/* Toolbar */}
          <div className="flex items-center justify-between px-5 py-3 border-b dark:border-gray-700 flex-shrink-0">
            <span className="text-xs text-gray-500 dark:text-gray-400">
              Click any course to view student records
            </span>
            <button
              onClick={() => exportCoursesCsv(courses, name)}
              className="flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium rounded-lg bg-indigo-600 text-white hover:bg-indigo-500 transition-colors"
            >
              <FiDownload size={14} />
              Export CSV
            </button>
          </div>

          {/* Course table */}
          <div className="overflow-auto flex-1 min-h-0">
            <table className="min-w-full text-sm border-separate border-spacing-0">
              <thead className="sticky top-0 z-10">
                <tr>
                  {["Course", "Students", "Revenue", "Collected", "Balance Due", "Trainers", ""].map((h) => (
                    <th
                      key={h}
                      className="px-3 py-2.5 text-left text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400 bg-gray-50 dark:bg-gray-800 border-b dark:border-gray-700 whitespace-nowrap"
                    >
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {courses.map((course) => (
                  <tr
                    key={course.name}
                    onClick={() => handleCourseClick(course)}
                    className="cursor-pointer hover:bg-indigo-50 dark:hover:bg-indigo-900/20 transition-colors"
                  >
                    <td className="px-3 py-2.5 font-medium text-gray-900 dark:text-white border-b border-gray-100 dark:border-gray-800 max-w-[200px] truncate" title={course.name}>
                      {course.name}
                    </td>
                    <td className="px-3 py-2.5 text-gray-700 dark:text-gray-300 border-b border-gray-100 dark:border-gray-800 tabular-nums">
                      {course.students}
                    </td>
                    <td className="px-3 py-2.5 text-gray-700 dark:text-gray-300 border-b border-gray-100 dark:border-gray-800 tabular-nums">
                      {formatCurrency(course.revenue)}
                    </td>
                    <td className="px-3 py-2.5 text-emerald-700 dark:text-emerald-400 border-b border-gray-100 dark:border-gray-800 tabular-nums">
                      {formatCurrency(course.collected)}
                    </td>
                    <td className="px-3 py-2.5 text-amber-700 dark:text-amber-400 border-b border-gray-100 dark:border-gray-800 tabular-nums">
                      {formatCurrency(course.pending)}
                    </td>
                    <td className="px-3 py-2.5 text-gray-500 dark:text-gray-400 border-b border-gray-100 dark:border-gray-800 tabular-nums">
                      {course.trainerCount}
                    </td>
                    <td className="px-3 py-2.5 border-b border-gray-100 dark:border-gray-800">
                      <FiChevronRight className="text-gray-400" size={14} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

        </div>
      </div>

      {/* Level-2: student records for selected course */}
      <DrillDownModal
        open={courseModal.open}
        title={courseModal.title}
        rows={courseModal.rows}
        onClose={closeCourseModal}
      />
    </>
  );
}
