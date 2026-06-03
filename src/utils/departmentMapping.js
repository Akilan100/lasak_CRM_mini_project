// ─── Course → Department Mapping ─────────────────────────────────────────────

export const DEPARTMENTS = ["MECH", "CSE/IT", "CIVIL", "ARTS", "KIDS"];

// Full course names (for display / documentation)
const DEPT_COURSES = {
  MECH: [
    "AutoCAD Mechanical",
    "Autodesk Inventor Course",
    "Wiring Harness Design Course",
    "3D Printing & Prototyping",
    "SolidWorks Masterclass",
    "Creo Parametric Course",
    "CATIA V5 Course",
    "ANSYS Simulation Course",
    "HyperMesh Course",
    "ANSA Pre-Processing Course",
    "Computational Fluid Dynamics (CFD)",
    "NX CAD (Unigraphics) Course",
    // Short codes used in Excel
    "AutoCAD",
    "AUTOCAD",
    "CATIA",
    "SOLIDWORKS",
    "Mech Combo",
    "MECH COMBO",
    "CREO",
    "ANSYS",
    "HYPERMESH",
    "NX CAD",
    "INVENTOR",
    "WIRING HARNESS",
    "CFD",
    "ANSA",
  ],
  "CSE/IT": [
    "Full Stack Web Development",
    "Python Programming",
    "Java Programming",
    "Software Testing",
    "Data Analytics",
    "Digital Marketing",
    "UI/UX Design",
    // Short codes used in Excel
    "CYBER-S",
    "DA",
    "P-FSD",
    "Scrum Master",
    "SCRUM MASTER",
    "FSD",
    "PYTHON",
    "JAVA",
    "ST",
    "DM",
    "UI/UX",
    "UIUX",
    "DATA ANALYTICS",
    "DIGITAL MARKETING",
    "CYBER SECURITY",
    "CYBERSECURITY",
  ],
  CIVIL: [
    "Civil CAD",
    "Revit Architecture",
    "SketchUp for Civil Engineering",
    "STAAD.Pro",
    "BIM Professional",
    // Short codes used in Excel
    "CIVIL",
    "Civil Combo",
    "CIVIL COMBO",
    "REVIT",
    "SKETCHUP",
    "STAAD",
    "BIM",
  ],
  ARTS: [
    "Graphic Design",
    "Video Editing",
    "Digital Marketing (Media)",
    "MS Office",
    "Tally with GST",
    // Short codes used in Excel
    "GD",
    "VE",
    "MS OFFICE",
    "TALLY",
    "TALLY WITH GST",
    "GRAPHIC DESIGN",
    "VIDEO EDITING",
  ],
  KIDS: [
    "Scratch Programming",
    "Robotics Basics",
    "AI Basics for Kids",
    "Computer Fundamentals",
    // Short codes used in Excel
    "SCRATCH",
    "ROBOTICS",
    "AI BASICS",
    "COMPUTER FUNDAMENTALS",
    "KIDS",
  ],
};

// ── Normalization ─────────────────────────────────────────────────────────────

/** Uppercase + trim, collapse internal spaces */
function normalizeCourse(course) {
  if (!course) return "";
  return String(course).trim().toUpperCase().replace(/\s+/g, " ");
}

// ── Exact-match lookup (built once at module load) ────────────────────────────

const EXACT_LOOKUP = {}; // normalized course string → department

for (const [dept, courses] of Object.entries(DEPT_COURSES)) {
  for (const course of courses) {
    EXACT_LOOKUP[normalizeCourse(course)] = dept;
  }
}

// ── Keyword fallback rules (checked in order when exact match fails) ──────────
// Each rule: [department, test function]
// The first matching rule wins.

const KEYWORD_RULES = [
  // MECH keywords
  ["MECH",   (n) => /AUTOCAD|CATIA|SOLIDWORKS|CREO|ANSYS|HYPERMESH|INVENTOR|WIRING|HARNESS|CFD|NX\s*CAD|ANSA|MECH\s*COMBO|3D\s*PRINT|PROTOTYP/.test(n)],
  // CSE/IT keywords
  ["CSE/IT", (n) => /CYBER|P-FSD|FSD|FULL\s*STACK|PYTHON|JAVA|SCRUM|DATA\s*ANAL|DIGITAL\s*MARKET|UI.UX|UIUX|SOFTWARE\s*TEST/.test(n)],
  // CIVIL keywords
  ["CIVIL",  (n) => /\bCIVIL\b|REVIT|SKETCHUP|STAAD|BIM/.test(n)],
  // ARTS keywords
  ["ARTS",   (n) => /GRAPHIC|VIDEO\s*EDIT|MS\s*OFFICE|TALLY|GST/.test(n)],
  // KIDS keywords
  ["KIDS",   (n) => /SCRATCH|ROBOTICS|AI\s*BASICS|COMPUTER\s*FUND/.test(n)],
];

// ── Exported helpers ──────────────────────────────────────────────────────────

/**
 * Returns the department for a course name.
 * 1. Tries exact normalized match.
 * 2. Falls back to keyword pattern matching.
 * 3. Returns "OTHER" if nothing matches.
 */
export function getDepartmentFromCourse(courseName) {
  if (!courseName) return "OTHER";
  const n = normalizeCourse(courseName);
  if (!n) return "OTHER";

  // 1. Exact match
  if (EXACT_LOOKUP[n]) return EXACT_LOOKUP[n];

  // 2. Keyword fallback
  for (const [dept, test] of KEYWORD_RULES) {
    if (test(n)) return dept;
  }

  return "OTHER";
}

// ─── Department Analytics ─────────────────────────────────────────────────────

/**
 * Derives department-level analytics from already-normalized+filtered rows.
 * Does NOT re-parse — uses the exact same row objects the charts were built from.
 */
export function calculateDepartmentAnalytics(rows = []) {
  const deptMap = {};

  for (const row of rows) {
    const d = getDepartmentFromCourse(row.courseName);

    if (!deptMap[d]) {
      deptMap[d] = {
        name:      d,
        students:  0,
        revenue:   0,
        collected: 0,
        pending:   0,
        courses:   {},
        rows:      [],
      };
    }

    const dept = deptMap[d];
    dept.students  += 1;
    dept.revenue   += row.totalFee      ?? 0;
    dept.collected += row.paymentAmount ?? 0;
    dept.pending   += row.balanceAmount ?? 0;
    dept.rows.push(row);

    // Per-course breakdown inside this department
    const cn = row.courseName || "Unknown";
    if (!dept.courses[cn]) {
      dept.courses[cn] = {
        name:      cn,
        students:  0,
        revenue:   0,
        collected: 0,
        pending:   0,
        trainers:  new Set(),
        rows:      [],
      };
    }
    const c = dept.courses[cn];
    c.students  += 1;
    c.revenue   += row.totalFee      ?? 0;
    c.collected += row.paymentAmount ?? 0;
    c.pending   += row.balanceAmount ?? 0;
    if (row.trainerName) c.trainers.add(row.trainerName);
    c.rows.push(row);
  }

  // Convert to sorted arrays; exclude OTHER from insight calculations if desired
  const departments = Object.values(deptMap)
    .sort((a, b) => b.students - a.students)
    .map((dept) => ({
      ...dept,
      courses: Object.values(dept.courses)
        .sort((a, b) => b.students - a.students)
        .map((c) => ({ ...c, trainerCount: c.trainers.size })),
    }));

  // Exclude OTHER from chart/insight arrays (show it only in drill-down)
  const knownDepts = departments.filter((d) => d.name !== "OTHER");

  const topDept        = knownDepts[0] ?? departments[0] ?? null;
  const studentsByDept = knownDepts.map((d) => ({ name: d.name, value: d.students }));
  const revenueByDept  = [...knownDepts]
    .sort((a, b) => b.revenue - a.revenue)
    .map((d) => ({ name: d.name, value: d.revenue }));

  const insightBase = knownDepts.length > 0 ? knownDepts : departments;

  const highestRevenueDept    = [...insightBase].sort((a, b) => b.revenue  - a.revenue)[0]  ?? null;
  const mostPopularDept       = [...insightBase].sort((a, b) => b.students - a.students)[0] ?? null;
  const lowestEnrollmentDept  = insightBase.filter((d) => d.students > 0).sort((a, b) => a.students - b.students)[0] ?? null;
  const highestCollectionDept = [...insightBase].sort((a, b) => {
    const ra = a.revenue > 0 ? a.collected / a.revenue : 0;
    const rb = b.revenue > 0 ? b.collected / b.revenue : 0;
    return rb - ra;
  })[0] ?? null;
  const highestPendingDept    = [...insightBase].sort((a, b) => b.pending - a.pending)[0] ?? null;

  return {
    departments,          // all including OTHER (used for drill-down cards)
    knownDepts,           // excludes OTHER (used for charts/insights)
    topDept,
    studentsByDept,
    revenueByDept,
    insights: {
      highestRevenueDept,
      mostPopularDept,
      lowestEnrollmentDept,
      highestCollectionDept,
      highestPendingDept,
    },
  };
}
