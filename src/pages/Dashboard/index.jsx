import React, { useMemo, useCallback, useState } from "react";
import KpiCard from "../../components/common/KpiCard";
import RevenueLineChart from "../../components/charts/RevenueLineChart";
import BranchBarChart from "../../components/charts/BranchBarChart";
import CoursePieChart from "../../components/charts/CoursePieChart";
import EnrollmentAreaChart from "../../components/charts/EnrollmentAreaChart";
import TrainerPerformanceChart from "../../components/charts/TrainerPerformanceChart";
import BranchComparisonChart from "../../components/charts/BranchComparisonChart";
import RevenueByCourseChart from "../../components/charts/RevenueByCourseChart";
import PaymentDistributionChart from "../../components/charts/PaymentDistributionChart";
import RevenueDistributionChart from "../../components/charts/RevenueDistributionChart";
import DepartmentDonutChart from "../../components/charts/DepartmentDonutChart";
import DepartmentRevenueChart from "../../components/charts/DepartmentRevenueChart";
import InsightsPanel from "../../components/common/InsightsPanel";
import TopPerformers from "../../components/common/TopPerformers";
import DrillDownModal from "../../components/common/DrillDownModal";
import DepartmentDrillModal from "../../components/common/DepartmentDrillModal";
import DepartmentInsights from "../../components/common/DepartmentInsights";
import useMappingStore from "../../store/mappingStore";
import { useFilters } from "../../context/FilterContext";
import { useDrillDown } from "../../hooks/useDrillDown";
import {
  normalizeRows,
  calculateDashboardAnalytics,
  applyFilters,
} from "../../services/analyticsEngine";
import { calculateDepartmentAnalytics } from "../../utils/departmentMapping";
import { formatCurrency } from "../../utils/formatCurrency";

function fmt(value) {
  if (value === null || value === undefined) return "0";
  if (typeof value === "number") return value.toLocaleString("en-IN");
  return value;
}

function cmp(a, b) {
  return String(a ?? "").trim().toLowerCase() === String(b ?? "").trim().toLowerCase();
}

export default function Dashboard() {
  const { sheets, currentSheet, isLoading } = useMappingStore();
  const { filters } = useFilters();
  const sheet = currentSheet ? sheets[currentSheet] : null;

  const { drillDown, openDrillDown, closeDrillDown } = useDrillDown();

  // Department drill: opens DepartmentDrillModal with the full dept object
  const [deptDrill, setDeptDrill] = useState({ open: false, deptData: null });

  // ── Core data ──────────────────────────────────────────────────────────────
  const { analytics, filteredRows } = useMemo(() => {
    if (!sheet?.headers || !sheet?.rows) return { analytics: null, filteredRows: [] };
    const rows = normalizeRows(sheet.headers, sheet.rows, currentSheet || "");
    const filtered = applyFilters(rows, filters);
    return {
      analytics: calculateDashboardAnalytics(rows, filters),
      filteredRows: filtered,
    };
  }, [sheet, currentSheet, filters]);

  // ── Department analytics (derived from same filteredRows) ──────────────────
  const deptAnalytics = useMemo(
    () => calculateDepartmentAnalytics(filteredRows),
    [filteredRows]
  );

  // ── Chart datasets ─────────────────────────────────────────────────────────
  const revenueByBranchData = useMemo(
    () => (analytics?.paymentAnalytics?.revenueByBranch ?? []).map((it) => ({ month: it.name, revenue: it.value })),
    [analytics]
  );
  const branchData = useMemo(
    () => (analytics?.studentAnalytics?.studentsByBranch ?? []).map((it) => ({ branch: it.name, students: it.value })),
    [analytics]
  );
  const courseData = useMemo(
    () => (analytics?.courseAnalytics?.studentsPerCourse ?? []).map((it) => ({ name: it.name, value: it.value })),
    [analytics]
  );
  const enrollmentData = useMemo(
    () => (analytics?.studentAnalytics?.studentStatusBreakdown ?? []).map((it) => ({ name: it.name, value: it.value })),
    [analytics]
  );
  const emiBalance = useMemo(
    () => filteredRows.filter((r) => r.isEMI).reduce((s, r) => s + (r.balanceAmount ?? 0), 0),
    [filteredRows]
  );

  const trainerData   = analytics?.trainerAnalytics?.completionRatePerTrainer ?? [];
  const branchRevData = analytics?.branchAnalytics?.revenuePerBranch ?? [];
  const courseRevData = analytics?.courseAnalytics?.revenuePerCourse ?? [];
  const summary       = analytics?.summary ?? {};
  const topDept       = deptAnalytics.topDept;

  // ── Drill-down handlers ────────────────────────────────────────────────────
  const drillByBranch = useCallback((branchName) => {
    openDrillDown(`Students in ${branchName}`, filteredRows.filter((r) => cmp(r.branchName, branchName)));
  }, [filteredRows, openDrillDown]);

  const drillByCourse = useCallback((courseName) => {
    openDrillDown(`Students in ${courseName}`, filteredRows.filter((r) => cmp(r.courseName, courseName)));
  }, [filteredRows, openDrillDown]);

  const drillByTrainer = useCallback((trainerName) => {
    openDrillDown(`Students under ${trainerName}`, filteredRows.filter((r) => cmp(r.trainerName, trainerName)));
  }, [filteredRows, openDrillDown]);

  const drillByCompletionStatus = useCallback((status) => {
    const label = status.charAt(0).toUpperCase() + status.slice(1);
    openDrillDown(`${label} Students`, filteredRows.filter((r) => cmp(r.completionStatus, status)));
  }, [filteredRows, openDrillDown]);

  const drillByPaymentSegment = useCallback((segment) => {
    const map = {
      Paid:   [filteredRows.filter((r) => r.isPaid),   "Paid Students"],
      EMI:    [filteredRows.filter((r) => r.isEMI),    "EMI Students"],
      Unpaid: [filteredRows.filter((r) => r.isUnpaid), "Unpaid Students"],
    };
    const [rows, title] = map[segment] ?? [[], segment];
    openDrillDown(title, rows);
  }, [filteredRows, openDrillDown]);

  const drillByRevenueSegment = useCallback((segment) => {
    const map = {
      Collected:     [filteredRows.filter((r) => r.isPaid),                 "Collected Revenue — Students"],
      Pending:       [filteredRows.filter((r) => r.isUnpaid || r.isPending), "Pending Revenue — Students"],
      "EMI Balance": [filteredRows.filter((r) => r.isEMI),                  "EMI Balance — Students"],
    };
    const [rows, title] = map[segment] ?? [[], segment];
    openDrillDown(title, rows);
  }, [filteredRows, openDrillDown]);

  // Department drill: open the two-level dept modal
  const drillByDepartment = useCallback((deptName) => {
    const dept = deptAnalytics.departments.find((d) => d.name === deptName);
    if (dept) setDeptDrill({ open: true, deptData: dept });
  }, [deptAnalytics]);

  const closeDeptDrill = useCallback(() => {
    setDeptDrill({ open: false, deptData: null });
  }, []);

  // ── Loading / empty ────────────────────────────────────────────────────────
  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64 text-gray-500 dark:text-gray-400">
        <div className="text-center space-y-2">
          <div className="text-lg font-medium">Processing workbook…</div>
          <div className="text-sm">This may take a moment for large files.</div>
        </div>
      </div>
    );
  }

  if (!sheet) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center space-y-3 bg-white dark:bg-gray-800 p-8 rounded-lg border dark:border-gray-700 shadow-sm max-w-sm">
          <div className="text-4xl">📊</div>
          <div className="text-lg font-semibold">No data loaded</div>
          <div className="text-sm text-gray-500 dark:text-gray-400">
            Upload an Excel workbook to populate the dashboard.
          </div>
          <a href="/upload" className="inline-block mt-2 px-4 py-2 bg-indigo-600 text-white text-sm font-medium rounded hover:bg-indigo-500 transition-colors">
            Upload Excel
          </a>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="space-y-6">

        {/* ── KPI Grid ────────────────────────────────────────────────────── */}
        <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-4 gap-4">
          <KpiCard title="Total Students"  value={fmt(summary.totalStudents)} />
          <KpiCard title="Paid"            value={fmt(summary.paidStudents)} />
          <KpiCard title="EMI Students"    value={fmt(summary.emiStudents)} />
          <KpiCard title="Unpaid"          value={fmt(summary.unpaidStudents)} />
          <KpiCard title="Completed"       value={fmt(summary.completedStudents)} />
          <KpiCard title="Ongoing"         value={fmt(summary.ongoingStudents)} />
          <KpiCard title="Dropped"         value={fmt(summary.droppedStudents)} />
          <KpiCard title="Active Courses"  value={fmt(summary.activeCourses)} />
          <KpiCard title="Active Branches" value={fmt(summary.activeBranches)} />
          <KpiCard title="Active Trainers" value={fmt(summary.activeTrainers)} />
          <KpiCard title="Total Revenue"   value={formatCurrency(summary.totalRevenue)} />
          <KpiCard title="Collected"       value={formatCurrency(summary.collectedRevenue)} />
          <KpiCard title="Pending"         value={formatCurrency(summary.pendingRevenue)} />
          {topDept ? (
            <KpiCard
              title="Top Department"
              value={topDept.name}
              delta={`${topDept.students} students · ${formatCurrency(topDept.revenue, { compact: true })}`}
            />
          ) : (
            <KpiCard title="EMI Revenue" value={formatCurrency(summary.emiRevenue)} />
          )}
        </div>

        {/* ── Top Performers ──────────────────────────────────────────────── */}
        {analytics && (
          <TopPerformers
            courseAnalytics={analytics.courseAnalytics}
            branchAnalytics={analytics.branchAnalytics}
            trainerAnalytics={analytics.trainerAnalytics}
            studentAnalytics={analytics.studentAnalytics}
          />
        )}

        {/* ── Insights + Payment pie + Revenue pie ────────────────────────── */}
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-4">
          <InsightsPanel analytics={analytics} />
          <PaymentDistributionChart
            paid={summary.paidStudents ?? 0}
            emi={summary.emiStudents ?? 0}
            unpaid={summary.unpaidStudents ?? 0}
            onDrillDown={drillByPaymentSegment}
          />
          <RevenueDistributionChart
            collected={summary.collectedRevenue ?? 0}
            pending={summary.pendingRevenue ?? 0}
            emiBalance={emiBalance}
            onDrillDown={drillByRevenueSegment}
          />
        </div>

        {/* ── Row 1: Revenue by branch + Course distribution ──────────────── */}
        <div className="grid grid-cols-1 xl:grid-cols-12 gap-4">
          <div className="xl:col-span-8">
            <RevenueLineChart data={revenueByBranchData} onDrillDown={drillByBranch} />
          </div>
          <div className="xl:col-span-4">
            <CoursePieChart data={courseData} onDrillDown={drillByCourse} />
          </div>
        </div>

        {/* ── Row 2: Students by branch + Completion status ───────────────── */}
        <div className="grid grid-cols-1 xl:grid-cols-12 gap-4">
          <div className="xl:col-span-6">
            <BranchBarChart data={branchData} onDrillDown={drillByBranch} />
          </div>
          <div className="xl:col-span-6">
            <EnrollmentAreaChart data={enrollmentData} onDrillDown={drillByCompletionStatus} />
          </div>
        </div>

        {/* ══ Department Analytics ═══════════════════════════════════════════ */}
        <div>
          <div className="flex items-center gap-2 mb-3">
            <div className="text-sm font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide">
              Department Analytics
            </div>
            <div className="flex-1 border-t border-gray-200 dark:border-gray-700" />
          </div>

          {/* Dept donut + Revenue bar */}
          <div className="grid grid-cols-1 xl:grid-cols-12 gap-4">
            <div className="xl:col-span-5">
              <DepartmentDonutChart
                data={deptAnalytics.studentsByDept}
                onDrillDown={drillByDepartment}
              />
            </div>
            <div className="xl:col-span-4">
              <DepartmentRevenueChart
                data={deptAnalytics.revenueByDept}
                onDrillDown={drillByDepartment}
              />
            </div>
            <div className="xl:col-span-3">
              <DepartmentInsights insights={deptAnalytics.insights} />
            </div>
          </div>

          {/* Department summary cards — show known departments only; OTHER is still reachable via chart drill-down */}
          {deptAnalytics.knownDepts.length > 0 && (
            <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-5 gap-3 mt-4">
              {deptAnalytics.knownDepts.map((dept) => (
                <button
                  key={dept.name}
                  onClick={() => drillByDepartment(dept.name)}
                  className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-sm border dark:border-gray-700 text-left hover:shadow-md hover:-translate-y-0.5 hover:border-indigo-300 dark:hover:border-indigo-600 transition-all duration-150 group"
                >
                  <div className="text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400 mb-1.5 group-hover:text-indigo-500 transition-colors">
                    {dept.name}
                  </div>
                  <div className="text-xl font-bold text-gray-900 dark:text-white">
                    {dept.students}
                  </div>
                  <div className="text-xs text-gray-400 dark:text-gray-500 mt-0.5">
                    {formatCurrency(dept.revenue, { compact: true })} revenue
                  </div>
                  <div className="text-xs text-gray-400 dark:text-gray-500">
                    {dept.courses.length} course{dept.courses.length !== 1 ? "s" : ""}
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* ── Row 3: Trainer + Branch revenue + Course revenue ────────────── */}
        <div className="grid grid-cols-1 xl:grid-cols-12 gap-4">
          <div className="xl:col-span-4">
            <TrainerPerformanceChart data={trainerData} onDrillDown={drillByTrainer} />
          </div>
          <div className="xl:col-span-4">
            <BranchComparisonChart data={branchRevData} onDrillDown={drillByBranch} />
          </div>
          <div className="xl:col-span-4">
            <RevenueByCourseChart data={courseRevData} onDrillDown={drillByCourse} />
          </div>
        </div>

      </div>

      {/* ── Modals ────────────────────────────────────────────────────────── */}
      <DrillDownModal
        open={drillDown.open}
        title={drillDown.title}
        rows={drillDown.rows}
        onClose={closeDrillDown}
      />
      <DepartmentDrillModal
        open={deptDrill.open}
        deptData={deptDrill.deptData}
        onClose={closeDeptDrill}
      />
    </>
  );
}
