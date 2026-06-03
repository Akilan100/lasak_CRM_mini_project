import React from "react";
import useMappingStore from "../../store/mappingStore";
import {
  normalizeRows,
  buildFieldMap,
  buildEnrolledFieldMap,
} from "../../services/analyticsEngine";

export default function DebugAnalytics() {
  const { sheets, currentSheet } = useMappingStore();
  const sheet = currentSheet ? sheets[currentSheet] : null;
  if (!sheet || !sheet.headers || !sheet.rows) return null;

  const isEnrolled = String(currentSheet || "")
    .toLowerCase()
    .includes("enrolled");
  const fieldMap = isEnrolled
    ? buildEnrolledFieldMap(sheet.headers)
    : buildFieldMap(sheet.headers);

  const processed = normalizeRows(
    sheet.headers,
    sheet.rows || [],
    currentSheet || "",
  );

  const mappedFields = {
    studentName: fieldMap.studentName ?? null,
    totalFee: fieldMap.totalFee ?? fieldMap.courseFee ?? null,
    paidAmount: fieldMap.paymentAmount ?? null,
    balanceAmount: fieldMap.balanceAmount ?? null,
    completionStatus:
      fieldMap.completionStatus ?? fieldMap.studentStatus ?? null,
  };

  // If this is the Enrolled sheet, compute KPIs per fixed rules
  const enrolledKpis = isEnrolled
    ? {
        validStudents: processed.length,
        paidStudents: processed.filter((r) => r.isPaid).length,
        emiStudents: processed.filter((r) => r.isEMI).length,
        unpaidStudents: processed.filter((r) => r.isUnpaid).length,
        completedStudents: processed.filter((r) => r.isCompleted).length,
        ongoingStudents: processed.filter((r) => r.isOngoing).length,
        droppedStudents: processed.filter((r) => r.isDropped).length,
        totalRevenue: processed.reduce((s, r) => s + (r.totalFee || 0), 0),
        collectedRevenue: processed.reduce(
          (s, r) => s + (r.paymentAmount || 0),
          0,
        ),
        pendingRevenue: processed.reduce(
          (s, r) => s + (r.balanceAmount || 0),
          0,
        ),
        emiRevenue: processed
          .filter((r) => r.isEMI)
          .reduce((s, r) => s + (r.totalFee || 0), 0),
      }
    : null;

  return (
    <div className="bg-gray-50 dark:bg-gray-900 p-4 rounded border border-gray-200 dark:border-gray-700">
      <div className="flex items-center justify-between mb-3">
        <div>
          <div className="font-semibold">Debug Analytics</div>
          <p className="text-xs text-gray-500 dark:text-gray-400">
            Shows mapped field indices and first 5 processed rows after
            normalization.
          </p>
        </div>
        <div className="text-xs text-gray-500">
          Sheet: {currentSheet || "(unknown)"}
        </div>
      </div>

      <div className="mb-3 text-sm">
        <div className="font-medium">Mapped Fields (header index)</div>
        <div className="grid grid-cols-2 gap-2 text-xs mt-2">
          {Object.entries(mappedFields).map(([k, v]) => (
            <div key={k} className="flex items-center gap-2">
              <div className="w-36 text-gray-700 dark:text-gray-200">{k}:</div>
              <div className="font-mono text-sm text-indigo-700 dark:text-indigo-300">
                {v !== null ? String(v) : "(not mapped)"}
              </div>
            </div>
          ))}
        </div>
      </div>

      <div>
        {isEnrolled && enrolledKpis ? (
          <div>
            <div className="grid grid-cols-2 gap-2 mb-3 text-sm">
              <div>Valid Students: {enrolledKpis.validStudents}</div>
              <div>Paid Students: {enrolledKpis.paidStudents}</div>
              <div>EMI Students: {enrolledKpis.emiStudents}</div>
              <div>Unpaid Students: {enrolledKpis.unpaidStudents}</div>
              <div>Completed Students: {enrolledKpis.completedStudents}</div>
              <div>Ongoing Students: {enrolledKpis.ongoingStudents}</div>
              <div>Dropped Students: {enrolledKpis.droppedStudents}</div>
              <div>Total Revenue: {enrolledKpis.totalRevenue}</div>
              <div>Collected Revenue: {enrolledKpis.collectedRevenue}</div>
              <div>Pending Revenue: {enrolledKpis.pendingRevenue}</div>
              <div>EMI Revenue: {enrolledKpis.emiRevenue}</div>
            </div>

            <div className="font-medium mb-2">First 5 Processed Rows</div>
            <div className="overflow-x-auto">
              <table className="min-w-full text-xs">
                <thead>
                  <tr className="text-left text-gray-600 dark:text-gray-300">
                    <th className="px-2 py-1">#</th>
                    <th className="px-2 py-1">NAME</th>
                    <th className="px-2 py-1">FEES</th>
                    <th className="px-2 py-1">PAID</th>
                    <th className="px-2 py-1">BALANCE</th>
                    <th className="px-2 py-1">STATUS</th>
                    <th className="px-2 py-1">EMI/INSTALLMENT</th>
                    <th className="px-2 py-1">Completion Status</th>
                  </tr>
                </thead>
                <tbody>
                  {processed.slice(0, 5).map((r, i) => (
                    <tr
                      key={i}
                      className="border-b border-gray-200 dark:border-gray-700"
                    >
                      <td className="px-2 py-1">{i}</td>
                      <td className="px-2 py-1">{r.studentName || ""}</td>
                      <td className="px-2 py-1">
                        {r.totalFee != null ? r.totalFee : ""}
                      </td>
                      <td className="px-2 py-1">
                        {r.paymentAmount != null ? r.paymentAmount : ""}
                      </td>
                      <td className="px-2 py-1">
                        {r.balanceAmount != null ? r.balanceAmount : ""}
                      </td>
                      <td className="px-2 py-1">{r.enrollmentStatus || ""}</td>
                      <td className="px-2 py-1">{r.paymentType || ""}</td>
                      <td className="px-2 py-1">{r.completionStatus || ""}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        ) : (
          <div>
            <div className="font-medium mb-2">First 5 Processed Rows</div>
            <div className="overflow-x-auto">
              <table className="min-w-full text-xs">
                <thead>
                  <tr className="text-left text-gray-600 dark:text-gray-300">
                    <th className="px-2 py-1">#</th>
                    <th className="px-2 py-1">studentName</th>
                    <th className="px-2 py-1">completionStatus</th>
                    <th className="px-2 py-1">studentStatus</th>
                    <th className="px-2 py-1">isPaid</th>
                    <th className="px-2 py-1">paymentAmount</th>
                    <th className="px-2 py-1">courseFee</th>
                    <th className="px-2 py-1">balanceAmount</th>
                  </tr>
                </thead>
                <tbody>
                  {processed.slice(0, 5).map((r, i) => (
                    <tr
                      key={i}
                      className="border-b border-gray-200 dark:border-gray-700"
                    >
                      <td className="px-2 py-1">{i}</td>
                      <td className="px-2 py-1">{r.studentName || ""}</td>
                      <td className="px-2 py-1">{r.completionStatus || ""}</td>
                      <td className="px-2 py-1">{r.studentStatus || ""}</td>
                      <td className="px-2 py-1">{String(!!r.isPaid)}</td>
                      <td className="px-2 py-1">
                        {r.paymentAmount != null ? r.paymentAmount : ""}
                      </td>
                      <td className="px-2 py-1">
                        {r.courseFee != null ? r.courseFee : ""}
                      </td>
                      <td className="px-2 py-1">
                        {r.balanceAmount != null ? r.balanceAmount : ""}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
