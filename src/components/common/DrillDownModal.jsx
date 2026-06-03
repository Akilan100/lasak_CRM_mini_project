import React, { useState, useMemo, useEffect, useCallback } from "react";
import { FiX, FiSearch, FiDownload } from "react-icons/fi";
import { formatCurrency } from "../../utils/formatCurrency";

const PAGE_SIZE = 20;

const COLUMNS = [
  { header: "Name",             key: "studentName" },
  { header: "Phone",            key: "studentPhone" },
  { header: "Course",           key: "courseName" },
  { header: "Branch",           key: "branchName" },
  { header: "Trainer",          key: "trainerName" },
  { header: "Status",           key: "enrollmentStatus" },
  { header: "Completion",       key: "completionStatus" },
  { header: "Fees",             key: "totalFee",       format: "currency" },
  { header: "Paid",             key: "paymentAmount",  format: "currency" },
  { header: "Balance",          key: "balanceAmount",  format: "currency" },
];

function cellValue(row, col) {
  const raw = row[col.key];
  if (raw == null || raw === "") return "—";
  if (col.format === "currency") return formatCurrency(raw);
  return String(raw);
}

function exportCsv(rows, title) {
  const headers = COLUMNS.map((c) => c.header);
  const lines = [
    headers.join(","),
    ...rows.map((row) =>
      COLUMNS.map((col) => {
        const v = row[col.key];
        if (v == null || v === "") return "";
        const s = String(v).replace(/"/g, '""');
        return `"${s}"`;
      }).join(",")
    ),
  ];
  const blob = new Blob([lines.join("\n")], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `${title.replace(/\s+/g, "_")}.csv`;
  a.click();
  URL.revokeObjectURL(url);
}

export default function DrillDownModal({ open, title, rows, onClose }) {
  const [search, setSearch] = useState("");
  const [page, setPage]     = useState(1);

  // Reset search + page whenever modal opens with new data
  useEffect(() => {
    if (open) { setSearch(""); setPage(1); }
  }, [open, title]);

  const filtered = useMemo(() => {
    if (!search.trim()) return rows;
    const q = search.trim().toLowerCase();
    return rows.filter((r) =>
      COLUMNS.some((col) => {
        const v = r[col.key];
        return v != null && String(v).toLowerCase().includes(q);
      })
    );
  }, [rows, search]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const paginated  = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  // Revenue summary (only meaningful when fee fields exist)
  const hasFees = rows.some((r) => r.totalFee != null);
  const revSummary = useMemo(() => {
    if (!hasFees) return null;
    return {
      totalFee:      rows.reduce((s, r) => s + (r.totalFee      ?? 0), 0),
      paymentAmount: rows.reduce((s, r) => s + (r.paymentAmount ?? 0), 0),
      balanceAmount: rows.reduce((s, r) => s + (r.balanceAmount ?? 0), 0),
    };
  }, [rows, hasFees]);

  const handleSearchChange = useCallback((e) => {
    setSearch(e.target.value);
    setPage(1);
  }, []);

  // Close on Escape
  useEffect(() => {
    if (!open) return;
    const handler = (e) => { if (e.key === "Escape") onClose(); };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [open, onClose]);

  if (!open) return null;

  return (
    // Backdrop
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ backgroundColor: "rgba(0,0,0,0.5)" }}
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      {/* Panel */}
      <div className="bg-white dark:bg-gray-900 rounded-xl shadow-2xl flex flex-col w-full max-w-5xl max-h-[90vh] border dark:border-gray-700">

        {/* ── Header ── */}
        <div className="flex items-center justify-between px-5 py-4 border-b dark:border-gray-700 flex-shrink-0">
          <div>
            <div className="text-base font-semibold text-gray-900 dark:text-white">{title}</div>
            <div className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
              {filtered.length} of {rows.length} record{rows.length !== 1 ? "s" : ""}
              {search && ` matching "${search}"`}
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-500 hover:text-gray-700 dark:hover:text-gray-200 transition-colors"
          >
            <FiX size={18} />
          </button>
        </div>

        {/* ── Revenue summary strip ── */}
        {revSummary && (
          <div className="flex flex-wrap gap-6 px-5 py-3 bg-gray-50 dark:bg-gray-800/50 border-b dark:border-gray-700 flex-shrink-0">
            {[
              ["Total Fees",  revSummary.totalFee],
              ["Collected",   revSummary.paymentAmount],
              ["Balance Due", revSummary.balanceAmount],
            ].map(([label, val]) => (
              <div key={label} className="flex flex-col">
                <span className="text-xs text-gray-500 dark:text-gray-400">{label}</span>
                <span className="text-sm font-semibold text-gray-900 dark:text-white">
                  {formatCurrency(val)}
                </span>
              </div>
            ))}
          </div>
        )}

        {/* ── Toolbar ── */}
        <div className="flex items-center gap-3 px-5 py-3 border-b dark:border-gray-700 flex-shrink-0">
          <div className="relative flex-1 max-w-xs">
            <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={14} />
            <input
              type="text"
              value={search}
              onChange={handleSearchChange}
              placeholder="Search records…"
              className="w-full pl-8 pr-3 py-1.5 text-sm rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>
          <button
            onClick={() => exportCsv(filtered, title)}
            disabled={filtered.length === 0}
            className="flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium rounded-lg bg-indigo-600 text-white hover:bg-indigo-500 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
          >
            <FiDownload size={14} />
            Export CSV
          </button>
        </div>

        {/* ── Table ── */}
        <div className="overflow-auto flex-1 min-h-0">
          {paginated.length === 0 ? (
            <div className="flex items-center justify-center h-32 text-sm text-gray-400">
              No records found
            </div>
          ) : (
            <table className="min-w-full text-sm border-separate border-spacing-0">
              <thead className="sticky top-0 z-10">
                <tr>
                  {COLUMNS.map((col) => (
                    <th
                      key={col.key}
                      className="px-3 py-2.5 text-left text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400 bg-gray-50 dark:bg-gray-800 border-b dark:border-gray-700 whitespace-nowrap"
                    >
                      {col.header}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {paginated.map((row, i) => (
                  <tr
                    key={row.studentKey ?? i}
                    className="hover:bg-gray-50 dark:hover:bg-gray-800/60 transition-colors"
                  >
                    {COLUMNS.map((col) => (
                      <td
                        key={col.key}
                        className="px-3 py-2 text-gray-700 dark:text-gray-300 border-b border-gray-100 dark:border-gray-800 whitespace-nowrap max-w-[180px] truncate"
                        title={String(row[col.key] ?? "")}
                      >
                        {col.key === "completionStatus" || col.key === "enrollmentStatus" ? (
                          <StatusBadge value={row[col.key]} />
                        ) : (
                          cellValue(row, col)
                        )}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        {/* ── Pagination ── */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between px-5 py-3 border-t dark:border-gray-700 flex-shrink-0 text-sm">
            <span className="text-gray-500 dark:text-gray-400">
              Page {page} of {totalPages}
            </span>
            <div className="flex gap-2">
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page === 1}
                className="px-3 py-1 rounded border dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-800 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
              >
                Previous
              </button>
              <button
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
                className="px-3 py-1 rounded border dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-800 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
              >
                Next
              </button>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}

// ── Status badge helper ─────────────────────────────────────────────────────
const STATUS_STYLES = {
  completed: "bg-green-100 text-green-800 dark:bg-green-900/40 dark:text-green-300",
  ongoing:   "bg-indigo-100 text-indigo-800 dark:bg-indigo-900/40 dark:text-indigo-300",
  dropped:   "bg-red-100 text-red-800 dark:bg-red-900/40 dark:text-red-300",
  pending:   "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/40 dark:text-yellow-300",
  unknown:   "bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400",
};

function StatusBadge({ value }) {
  if (!value) return <span className="text-gray-400">—</span>;
  const key = String(value).toLowerCase();
  const style = STATUS_STYLES[key] ?? STATUS_STYLES.unknown;
  return (
    <span className={`inline-block px-2 py-0.5 rounded text-xs font-medium capitalize ${style}`}>
      {value}
    </span>
  );
}
