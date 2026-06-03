// ─── Helpers ────────────────────────────────────────────────────────────────

function normalizeText(value) {
  if (value === undefined || value === null) return "";
  return String(value).trim();
}

function parseNumber(value) {
  if (value === null || value === undefined || value === "") return null;
  if (typeof value === "number") return Number.isFinite(value) ? value : null;
  const cleaned = String(value).replace(/[^0-9.\-]/g, "");
  const parsed = Number(cleaned);
  return Number.isFinite(parsed) ? parsed : null;
}

function parseDate(value) {
  if (!value) return null;
  if (value instanceof Date) return Number.isNaN(value.valueOf()) ? null : value;
  const d = new Date(normalizeText(value));
  return Number.isNaN(d.valueOf()) ? null : d;
}

function normalizeStatus(value) {
  const v = String(value || "")
    .trim()
    .toLowerCase()
    .replace(/[-_\s]/g, "");
  if (!v) return "";
  if (/^(completed|complete|graduated|done|finished)$/.test(v)) return "completed";
  if (/^(ongoing|active|inprogress|onprogress|on-going|ongoing)$/.test(v) || /inprogress/.test(v))
    return "ongoing";
  if (/^(dropped|drop|cancelled|withdrawn|inactive)$/.test(v)) return "dropped";
  if (/^(pending|pendingpayment|due)$/.test(v)) return "pending";
  if (/^(paid|settled|closed)$/.test(v)) return "paid";
  if (/^(overdue)$/.test(v)) return "overdue";
  return v;
}

function groupByCount(rows, keyFn) {
  return rows.reduce((acc, row) => {
    const key = keyFn(row) || "Unknown";
    acc[key] = (acc[key] || 0) + 1;
    return acc;
  }, {});
}

function groupBySum(rows, keyFn, valueFn) {
  return rows.reduce((acc, row) => {
    const key = keyFn(row) || "Unknown";
    acc[key] = (acc[key] || 0) + (valueFn(row) || 0);
    return acc;
  }, {});
}

function toArray(group, label = "name") {
  return Object.entries(group)
    .map(([name, value]) => ({ [label]: name, value }))
    .sort((a, b) => b.value - a.value);
}

function rowRevenue(row) {
  return row.totalFee != null ? row.totalFee : row.paymentAmount != null ? row.paymentAmount : 0;
}

// ─── Enrolled Sheet Fixed Mapping ───────────────────────────────────────────

export function buildEnrolledFieldMap(headers) {
  const norm = (h) => String(h || "").trim().toUpperCase().replace(/\s+/g, " ");
  const normed = headers.map(norm);

  const expected = [
    "ISM", "NAME", "NUMBER", "AD NO", "COURSE", "STATUS", "FEES", "PAID",
    "ON", "BALANCE", "BALANCE STATUS", "EMI/INSTALLMENT", "DISBURSED/ DUE",
    "ON ACC", "BRANCH", "MODE", "TIMING", "TRAINER", "START DATE", "END DATE",
    "COMPLETION STATUS",
  ];

  const map = {};
  expected.forEach((name) => {
    const idx = normed.findIndex((h) => h === name);
    if (idx !== -1) map[name] = idx;
  });

  return {
    studentName:      map["NAME"],
    studentPhone:     map["NUMBER"],
    admissionNo:      map["AD NO"],
    courseName:       map["COURSE"],
    enrollmentStatus: map["STATUS"],
    totalFee:         map["FEES"],
    paymentAmount:    map["PAID"],
    paymentOn:        map["ON"],
    balanceAmount:    map["BALANCE"],
    balanceStatus:    map["BALANCE STATUS"],
    paymentType:      map["EMI/INSTALLMENT"],
    dueAmount:        map["DISBURSED/ DUE"],
    accountDate:      map["ON ACC"],
    branchName:       map["BRANCH"],
    mode:             map["MODE"],
    timing:           map["TIMING"],
    trainerName:      map["TRAINER"],
    startDate:        map["START DATE"],
    endDate:          map["END DATE"],
    completionStatus: map["COMPLETION STATUS"],
  };
}

// ─── Generic Field Map (non-Enrolled sheets) ────────────────────────────────

const FIELD_DEFINITIONS = {
  studentName:      [/student.*name/i, /^name$/i, /full.*name/i],
  studentEmail:     [/email/i, /e-?mail/i],
  studentPhone:     [/phone|mobile|contact/i],
  enrollmentStatus: [/student.*status/i, /^status$/i, /enrollment.*status/i],
  courseName:       [/course|program|subject|training/i],
  courseFee:        [/fee|amount|price|cost|tuition/i],
  branchName:       [/branch|center|campus|location|region/i],
  trainerName:      [/trainer|instructor|teacher|mentor|coach|staff/i],
  paymentAmount:    [/payment.*amount|^amount$|fee|paid.*amount|total.*paid/i],
  paymentDate:      [/payment.*date|paid.*date|date.*paid|^date$/i],
  paymentStatus:    [/payment.*status|^status$|paid|pending|due|overdue/i],
  emiIndicator:     [/emi|installment/i],
};

function scoreHeader(header, patterns) {
  const n = normalizeText(header).toLowerCase();
  return patterns.reduce((s, p) => s + (p.test(n) ? 10 : 0), 0);
}

export function buildFieldMap(headers) {
  const fieldMap = {};
  headers.forEach((header, index) => {
    let best = { field: null, score: 0 };
    for (const [field, patterns] of Object.entries(FIELD_DEFINITIONS)) {
      const score = scoreHeader(header, patterns);
      if (score > best.score) best = { field, score };
    }
    if (best.field && best.score > 0 && fieldMap[best.field] == null) {
      fieldMap[best.field] = index;
    }
  });
  return fieldMap;
}

// ─── Row Normalization ───────────────────────────────────────────────────────

function isEnrolledSheet(sheetName) {
  return normalizeText(sheetName).toLowerCase().includes("enrolled");
}

export function normalizeRows(headers, rows, sheetName = "") {
  if (isEnrolledSheet(sheetName)) {
    const map = buildEnrolledFieldMap(headers);

    return rows
      .map((row, rowIndex) => {
        const get = (field) => {
          const idx = map[field];
          return idx != null ? row[idx] : undefined;
        };

        const studentName = normalizeText(get("studentName"));
        if (!studentName) return null;

        const fees     = parseNumber(get("totalFee"))    ?? 0;
        const paid     = parseNumber(get("paymentAmount")) ?? 0;
        const balance  = parseNumber(get("balanceAmount")) ?? 0;

        const completionRaw  = normalizeText(get("completionStatus"));
        const completionStatus = normalizeStatus(completionRaw) || "unknown";

        const enrollmentStatus = normalizeText(get("enrollmentStatus"));
        const paymentType      = normalizeText(get("paymentType"));
        const branchName       = normalizeText(get("branchName"));
        const courseName       = normalizeText(get("courseName"));
        const trainerName      = normalizeText(get("trainerName"));

        const isEMI     = /emi/i.test(enrollmentStatus) || /emi/i.test(paymentType);
        const isPaid    = balance <= 0 && paid > 0;
        const isUnpaid  = paid === 0 && fees > 0;

        return {
          rawRow: row,
          sourceIndex: rowIndex,
          studentName,
          studentPhone:  normalizeText(get("studentPhone")),
          admissionNo:   normalizeText(get("admissionNo")),
          courseName,
          branchName,
          trainerName,
          enrollmentStatus,
          completionStatus,
          paymentType,
          totalFee:      fees,
          paymentAmount: paid,
          balanceAmount: balance,
          isEMI,
          isPaid,
          isUnpaid,
          isPending:     isUnpaid, // alias so generic functions work too
          isCompleted:   completionStatus === "completed",
          isOngoing:     completionStatus === "ongoing",
          isDropped:     completionStatus === "dropped",
          studentKey:    studentName || `row-${rowIndex}`,
          location:      branchName || courseName || "",
          // payment-related fields expected by payment analytics
          paymentStatus: balance <= 0 && paid > 0 ? "paid" : balance > 0 ? "pending" : "",
          paymentDate:   null,
          enrollmentDate: null,
        };
      })
      .filter(Boolean);
  }

  // Generic (non-Enrolled) path
  const fieldMap = buildFieldMap(headers);
  return rows.map((row, rowIndex) => {
    const get = (field) => {
      const idx = fieldMap[field];
      return idx != null ? row[idx] : undefined;
    };

    const paymentAmount = parseNumber(get("paymentAmount")) ?? parseNumber(get("courseFee"));
    const courseFee     = parseNumber(get("courseFee"));
    const paymentDate   = parseDate(get("paymentDate"));
    const enrollmentDate = parseDate(get("enrollmentDate") ?? get("paymentDate"));
    const studentStatus  = normalizeStatus(get("enrollmentStatus") || "");
    const paymentStatus  = normalizeStatus(get("paymentStatus") || "");
    const branchName     = normalizeText(get("branchName") || "");
    const courseName     = normalizeText(get("courseName") || "");
    const trainerName    = normalizeText(get("trainerName") || "");

    const isEMI      = /emi|installment/i.test(normalizeText(get("emiIndicator")) || paymentStatus);
    const isPaid     = paymentStatus === "paid" || studentStatus === "paid";
    const isPending  = paymentStatus === "pending" || studentStatus === "pending";
    const isUnpaid   = isPending;
    const isCompleted = studentStatus === "completed";
    const isOngoing  = studentStatus === "ongoing";
    const isDropped  = studentStatus === "dropped";

    return {
      rawRow: row,
      sourceIndex: rowIndex,
      studentName:     normalizeText(get("studentName") || ""),
      studentEmail:    normalizeText(get("studentEmail") || ""),
      studentPhone:    normalizeText(get("studentPhone") || ""),
      courseName,
      branchName,
      trainerName,
      enrollmentStatus: studentStatus,
      completionStatus: studentStatus,
      paymentAmount,
      courseFee,
      totalFee:        courseFee ?? paymentAmount,
      balanceAmount:   null,
      paymentDate,
      enrollmentDate,
      paymentStatus,
      studentStatus,
      location:        branchName || courseName || "",
      isEMI, isPaid, isPending, isUnpaid,
      isCompleted, isOngoing, isDropped,
      studentKey:      normalizeText(get("studentEmail") || get("studentName") || "") || `row-${rowIndex}`,
    };
  });
}

// ─── Filters ─────────────────────────────────────────────────────────────────

export function applyFilters(rows, filters = {}) {
  return rows.filter((row) => {
    if (filters.branch && normalizeText(row.branchName).toLowerCase() !== normalizeText(filters.branch).toLowerCase()) return false;
    if (filters.course && normalizeText(row.courseName).toLowerCase() !== normalizeText(filters.course).toLowerCase()) return false;
    if (filters.trainer && normalizeText(row.trainerName).toLowerCase() !== normalizeText(filters.trainer).toLowerCase()) return false;
    if (filters.studentStatus && normalizeText(row.completionStatus || row.enrollmentStatus).toLowerCase() !== normalizeText(filters.studentStatus).toLowerCase()) return false;
    if (filters.paymentStatus && normalizeText(row.paymentStatus).toLowerCase() !== normalizeText(filters.paymentStatus).toLowerCase()) return false;
    if (filters.location && normalizeText(row.location).toLowerCase() !== normalizeText(filters.location).toLowerCase()) return false;
    return true;
  });
}

// ─── Row Selectors ───────────────────────────────────────────────────────────

export function getStudentRows(rows) {
  return rows.filter((r) => r.studentName || r.courseName || r.branchName);
}

export function getPaymentRows(rows) {
  return rows.filter((r) => r.totalFee != null || r.paymentAmount != null || r.paymentStatus);
}

export function getCourseRows(rows) {
  return rows.filter((r) => r.courseName);
}

export function getBranchRows(rows) {
  return rows.filter((r) => r.branchName);
}

export function getTrainerRows(rows) {
  return rows.filter((r) => r.trainerName);
}

// ─── Analytics ───────────────────────────────────────────────────────────────

export function calculateStudentAnalytics(rows = []) {
  const current = getStudentRows(rows);
  const totalStudents    = new Set(current.map((r) => r.studentKey)).size;
  const paidStudents     = current.filter((r) => r.isPaid).length;
  const emiStudents      = current.filter((r) => r.isEMI).length;
  const unpaidStudents   = current.filter((r) => r.isUnpaid || r.isPending).length;
  const completedStudents = current.filter((r) => r.isCompleted).length;
  const ongoingStudents  = current.filter((r) => r.isOngoing).length;
  const droppedStudents  = current.filter((r) => r.isDropped).length;

  const studentsByBranch    = toArray(groupByCount(current, (r) => r.branchName || "Unknown"));
  const studentsByCourse    = toArray(groupByCount(current, (r) => r.courseName || "Unknown"));
  const studentsByTrainer   = toArray(groupByCount(current, (r) => r.trainerName || "Unknown"));
  const studentStatusBreakdown = toArray(
    groupByCount(current, (r) => r.completionStatus || r.enrollmentStatus || "Unknown")
  );

  return {
    totalStudents,
    paidStudents,
    emiStudents,
    unpaidStudents,
    completedStudents,
    ongoingStudents,
    droppedStudents,
    studentsByBranch,
    studentsByCourse,
    studentsByTrainer,
    studentStatusBreakdown,
  };
}

export function calculatePaymentAnalytics(rows = []) {
  const current = getPaymentRows(rows);

  const totalRevenue     = current.reduce((s, r) => s + rowRevenue(r), 0);
  const collectedRevenue = current.reduce((s, r) => s + (r.paymentAmount ?? 0), 0);
  // Pending = sum of balance fields (for Enrolled sheet) or rows where isPending
  const pendingRevenue   = current.reduce((s, r) => {
    if (r.balanceAmount != null) return s + r.balanceAmount;
    if (r.isPending) return s + rowRevenue(r);
    return s;
  }, 0);

  const emiRevenue = current
    .filter((r) => r.isEMI)
    .reduce((s, r) => s + rowRevenue(r), 0);

  const revenueByBranch = toArray(
    groupBySum(current, (r) => r.branchName || "Unknown", rowRevenue)
  );
  const revenueByCourse = toArray(
    groupBySum(current, (r) => r.courseName || "Unknown", rowRevenue)
  );
  const revenueByTrainer = toArray(
    groupBySum(current, (r) => r.trainerName || "Unknown", rowRevenue)
  );

  return {
    totalRevenue,
    collectedRevenue,
    pendingRevenue,
    emiRevenue,
    revenueByBranch,
    revenueByCourse,
    revenueByTrainer,
  };
}

export function calculateCourseAnalytics(rows = []) {
  const current = getCourseRows(rows);

  const studentsPerCourse = toArray(groupByCount(current, (r) => r.courseName || "Unknown"));
  const revenuePerCourse  = toArray(groupBySum(current, (r) => r.courseName || "Unknown", rowRevenue));

  const completionMap = current.reduce((acc, r) => {
    const key = r.courseName || "Unknown";
    acc[key] = acc[key] || { total: 0, completed: 0 };
    acc[key].total += 1;
    if (r.isCompleted) acc[key].completed += 1;
    return acc;
  }, {});

  const completionRateByCourse = Object.entries(completionMap).map(([name, v]) => ({
    name,
    completionRate: v.total === 0 ? 0 : Math.round((v.completed / v.total) * 100),
    total: v.total,
  })).sort((a, b) => b.total - a.total);

  const topCourses    = [...studentsPerCourse].slice(0, 5);
  const bottomCourses = [...studentsPerCourse].slice(-5).reverse();

  return { studentsPerCourse, revenuePerCourse, completionRateByCourse, topCourses, bottomCourses };
}

export function calculateBranchAnalytics(rows = []) {
  const current = getBranchRows(rows);

  const studentsPerBranch  = toArray(groupByCount(current, (r) => r.branchName || "Unknown"));
  const revenuePerBranch   = toArray(groupBySum(current, (r) => r.branchName || "Unknown", rowRevenue));
  const branchRanking      = [...revenuePerBranch];

  return { studentsPerBranch, revenuePerBranch, branchRanking };
}

export function calculateTrainerAnalytics(rows = []) {
  const current = getTrainerRows(rows);

  const studentsPerTrainer = toArray(groupByCount(current, (r) => r.trainerName || "Unknown"));
  const revenuePerTrainer  = toArray(groupBySum(current, (r) => r.trainerName || "Unknown", rowRevenue));

  const completionMap = current.reduce((acc, r) => {
    const key = r.trainerName || "Unknown";
    acc[key] = acc[key] || { total: 0, completed: 0 };
    acc[key].total += 1;
    if (r.isCompleted) acc[key].completed += 1;
    return acc;
  }, {});

  const completionRatePerTrainer = Object.entries(completionMap).map(([name, v]) => ({
    name,
    completionRate: v.total === 0 ? 0 : Math.round((v.completed / v.total) * 100),
  })).sort((a, b) => b.completionRate - a.completionRate);

  const trainerRanking = [...studentsPerTrainer];

  return { studentsPerTrainer, revenuePerTrainer, completionRatePerTrainer, trainerRanking };
}

export function calculateDashboardAnalytics(rows = [], filters = {}) {
  const filtered  = applyFilters(rows, filters);
  const student   = calculateStudentAnalytics(filtered);
  const payment   = calculatePaymentAnalytics(filtered);
  const course    = calculateCourseAnalytics(filtered);
  const branch    = calculateBranchAnalytics(filtered);
  const trainer   = calculateTrainerAnalytics(filtered);

  return {
    summary: {
      totalStudents:     student.totalStudents,
      paidStudents:      student.paidStudents,
      emiStudents:       student.emiStudents,
      unpaidStudents:    student.unpaidStudents,
      completedStudents: student.completedStudents,
      ongoingStudents:   student.ongoingStudents,
      droppedStudents:   student.droppedStudents,
      totalRevenue:      payment.totalRevenue,
      collectedRevenue:  payment.collectedRevenue,
      pendingRevenue:    payment.pendingRevenue,
      emiRevenue:        payment.emiRevenue,
      activeCourses:  new Set(filtered.map((r) => normalizeText(r.courseName)).filter(Boolean)).size,
      activeBranches: new Set(filtered.map((r) => normalizeText(r.branchName)).filter(Boolean)).size,
      activeTrainers: new Set(filtered.map((r) => normalizeText(r.trainerName)).filter(Boolean)).size,
    },
    studentAnalytics: student,
    paymentAnalytics: payment,
    courseAnalytics:  course,
    branchAnalytics:  branch,
    trainerAnalytics: trainer,
  };
}

// ─── Utilities ───────────────────────────────────────────────────────────────

export function calculateGrowthRate(items, field) {
  const sorted = [...items].filter((i) => i[field] != null);
  if (sorted.length < 2) return 0;
  const last = sorted[sorted.length - 1][field] || 0;
  const prev = sorted[sorted.length - 2][field] || 0;
  if (prev === 0) return last === 0 ? 0 : 100;
  return Math.round(((last - prev) / Math.abs(prev)) * 100);
}

export function getTopItem(items, valueKey = "value") {
  if (!items || items.length === 0) return null;
  return [...items].sort((a, b) => (b[valueKey] || 0) - (a[valueKey] || 0))[0];
}

export function getFilterOptions(headers, rows, sheetName = "") {
  const normalized = normalizeRows(headers, rows, sheetName);
  return {
    branches:       [...new Set(normalized.map((r) => r.branchName || "").filter(Boolean))].sort(),
    courses:        [...new Set(normalized.map((r) => r.courseName || "").filter(Boolean))].sort(),
    trainers:       [...new Set(normalized.map((r) => r.trainerName || "").filter(Boolean))].sort(),
    studentStatuses:[...new Set(normalized.map((r) => r.completionStatus || r.enrollmentStatus || "").filter(Boolean))].sort(),
    paymentStatuses:[...new Set(normalized.map((r) => r.paymentStatus || "").filter(Boolean))].sort(),
    locations:      [...new Set(normalized.map((r) => r.location || "").filter(Boolean))].sort(),
  };
}

// ─── Validation ──────────────────────────────────────────────────────────────

export function validateSheetData(headers, rows, sheetName = "") {
  const warnings = [];

  if (!headers || headers.length === 0) {
    warnings.push("No column headers found in this sheet.");
    return warnings;
  }
  if (!rows || rows.length === 0) {
    warnings.push("No data rows found in this sheet.");
    return warnings;
  }

  if (isEnrolledSheet(sheetName)) {
    const map = buildEnrolledFieldMap(headers);
    const required = ["studentName", "courseName", "branchName", "totalFee", "paymentAmount", "balanceAmount"];
    required.forEach((field) => {
      if (map[field] == null) {
        const label = field.replace(/([A-Z])/g, " $1").toLowerCase();
        warnings.push(`Expected column not found: ${label.trim()}.`);
      }
    });
    const validRows = rows.filter((r) => normalizeText(r[map.studentName]) !== "");
    if (validRows.length === 0) warnings.push("No valid student rows found (all NAME cells are empty).");
    else if (validRows.length < rows.length) {
      warnings.push(`${rows.length - validRows.length} rows skipped (empty NAME).`);
    }
  }

  return warnings;
}
