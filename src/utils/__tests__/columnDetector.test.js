/**
 * Column Detection Test Suite
 * Demonstrates detection accuracy with various column naming conventions
 */

import {
  detectEntityColumns,
  guessPrimaryEntity,
} from "../utils/columnDetector";

// Test Case 1: Standard column names
export function testStandardColumns() {
  const headers = [
    "Student Name",
    "Email Address",
    "Phone Number",
    "Enrollment Date",
    "Student Status",
    "Course Enrolled",
    "Branch Location",
    "Amount Paid",
    "Payment Date",
    "Lead Source",
  ];

  const detection = detectEntityColumns(headers);
  console.log("Test 1 - Standard Columns:", detection);
  return detection;
}

// Test Case 2: Varied column names
export function testVariedColumns() {
  const headers = [
    "Name",
    "Email",
    "Phone",
    "Enrolled",
    "Active",
    "Course",
    "Center",
    "Fee",
    "Date",
    "Source",
  ];

  const detection = detectEntityColumns(headers);
  console.log("Test 2 - Varied Columns:", detection);
  return detection;
}

// Test Case 3: Real-world messy data
export function testMessyColumns() {
  const headers = [
    "Student_Name",
    "student_email",
    "PHONE",
    "enrollment_date",
    "status",
    "course_name",
    "branch_name",
    "amount",
    "date_paid",
    "lead_origin",
    "trainer_name",
    "program_duration",
  ];

  const detection = detectEntityColumns(headers);
  console.log("Test 3 - Messy Columns:", detection);
  return detection;
}

// Test Case 4: Primary entity detection
export function testPrimaryEntityDetection() {
  const cases = [
    {
      name: "Student-focused",
      headers: ["Student ID", "Name", "Email", "Phone", "Enrollment", "Course"],
    },
    {
      name: "Payment-focused",
      headers: [
        "Invoice No",
        "Student Name",
        "Amount",
        "Payment Date",
        "Status",
        "Transaction ID",
      ],
    },
    {
      name: "Lead-focused",
      headers: [
        "Lead ID",
        "Contact Name",
        "Email",
        "Phone",
        "Inquiry Date",
        "Source",
        "Status",
      ],
    },
    {
      name: "Course-focused",
      headers: [
        "Course Code",
        "Course Name",
        "Duration",
        "Fee",
        "Instructor",
        "Start Date",
      ],
    },
  ];

  cases.forEach((testCase) => {
    const primary = guessPrimaryEntity(testCase.headers);
    console.log(`Primary Entity (${testCase.name}):`, primary);
  });
}

// Test Case 5: Mixed entities
export function testMixedEntities() {
  const headers = [
    "student_id",
    "student_name",
    "email",
    "phone",
    "course",
    "branch",
    "trainer_assigned",
    "enrollment_date",
    "payment_amount",
    "payment_date",
    "payment_status",
    "lead_source",
  ];

  const detection = detectEntityColumns(headers);
  console.log("Test 5 - Mixed Entities:", detection);

  // Show summary
  const summary = Object.entries(detection).map(([entity, columns]) => ({
    entity,
    count: columns.length,
    topMatch: columns[0]?.header || "none",
  }));

  console.table(summary);
  return detection;
}

// Scoring detail test
export function testScoringDetails() {
  const headers = ["Student Name", "Amount", "Trainer", "Course"];

  console.log("Detailed Scoring:");
  console.log("================");

  for (const header of headers) {
    const scores = {};
    for (const entity of [
      "student",
      "payment",
      "lead",
      "course",
      "branch",
      "trainer",
    ]) {
      // Simplified scoring for demo
      const patterns = {
        student: /student|name/i,
        payment: /amount|paid|fee/i,
        lead: /lead|contact|source/i,
        course: /course|program/i,
        branch: /branch|location/i,
        trainer: /trainer|instructor|teacher/i,
      };

      scores[entity] = patterns[entity].test(header) ? 10 : 0;
    }
    console.log(`"${header}":`, scores);
  }
}

// Run all tests
export function runAllTests() {
  console.log("=== Column Detection Tests ===\n");
  testStandardColumns();
  testVariedColumns();
  testMessyColumns();
  testPrimaryEntityDetection();
  testMixedEntities();
  testScoringDetails();
  console.log("\n=== Tests Complete ===");
}

// Quick validation test
export function quickTest() {
  const headers = [
    "Student Name",
    "Email",
    "Amount Paid",
    "Payment Date",
    "Course",
  ];
  const detection = detectEntityColumns(headers);

  const results = {
    studentsDetected: detection.students.length > 0,
    paymentsDetected: detection.payments.length > 0,
    coursesDetected: detection.courses.length > 0,
    primaryEntity: guessPrimaryEntity(headers),
  };

  console.log("Quick Test Results:", results);
  return (
    results.studentsDetected &&
    results.paymentsDetected &&
    results.coursesDetected
  );
}
