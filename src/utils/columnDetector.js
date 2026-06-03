/**
 * Automatic column detection heuristics for different data entities
 */

const KEYWORD_PATTERNS = {
  student: {
    keywords: [
      "student",
      "name",
      "email",
      "phone",
      "enrollment",
      "student_id",
      "sid",
    ],
    patterns: [/student/i, /name/i, /email/i, /phone/i, /enrollment/i],
  },
  payment: {
    keywords: [
      "payment",
      "amount",
      "date",
      "status",
      "invoice",
      "transaction",
      "paid",
      "fee",
    ],
    patterns: [/payment|amount|date|status|invoice|transaction|paid|fee/i],
  },
  lead: {
    keywords: [
      "lead",
      "prospect",
      "contact",
      "inquiry",
      "source",
      "status",
      "interested",
    ],
    patterns: [/lead|prospect|contact|inquiry|source|interested/i],
  },
  course: {
    keywords: [
      "course",
      "program",
      "subject",
      "curriculum",
      "duration",
      "fee",
      "instructor",
    ],
    patterns: [/course|program|subject|curriculum|duration|instructor/i],
  },
  branch: {
    keywords: [
      "branch",
      "location",
      "center",
      "office",
      "address",
      "city",
      "region",
    ],
    patterns: [/branch|location|center|office|address|city|region/i],
  },
  trainer: {
    keywords: ["trainer", "instructor", "teacher", "mentor", "coach", "staff"],
    patterns: [/trainer|instructor|teacher|mentor|coach|staff/i],
  },
};

const REQUIRED_DETECTION_FIELDS = {
  students: ["student", "name", "email", "phone", "enrollment", "status"],
  payments: ["payment", "amount", "date", "status"],
  leads: ["lead", "source", "status"],
  courses: ["course", "program", "subject"],
  branches: ["branch", "location", "city"],
  trainers: ["trainer", "instructor", "coach"],
};

function extractMatchReasons(header, entityType) {
  const config = KEYWORD_PATTERNS[entityType];
  if (!config) return [];
  const headerLower = String(header).toLowerCase();
  const reasons = new Set();

  for (const keyword of config.keywords) {
    if (headerLower.includes(keyword)) {
      reasons.add(`keyword "${keyword}"`);
    }
  }

  for (const pattern of config.patterns) {
    if (pattern.test(headerLower)) {
      reasons.add(`pattern ${pattern}`);
    }
  }

  if (config.keywords.includes(headerLower)) {
    reasons.add("exact match");
  }

  return Array.from(reasons);
}

function getEntityKeyMapping() {
  return {
    students: "student",
    payments: "payment",
    leads: "lead",
    courses: "course",
    branches: "branch",
    trainers: "trainer",
  };
}

function getMissingRequiredFields(headers) {
  const normalized = headers.map((header) =>
    String(header || "").toLowerCase(),
  );
  return Object.entries(REQUIRED_DETECTION_FIELDS).reduce(
    (acc, [entity, requiredFields]) => {
      const missing = requiredFields.filter(
        (required) =>
          !normalized.some((headerValue) => headerValue.includes(required)),
      );

      acc[entity] = missing;
      return acc;
    },
    {},
  );
}

export function classifyColumns(headers) {
  return headers.map((header, index) => {
    const scoreDetails = Object.entries(KEYWORD_PATTERNS).map(([entity]) => {
      const score = scoreColumn(header, entity);
      return {
        entity,
        score,
        reasons: extractMatchReasons(header, entity),
      };
    });

    const best = scoreDetails.reduce(
      (bestSoFar, current) =>
        current.score > bestSoFar.score ? current : bestSoFar,
      { entity: "unmapped", score: 0, reasons: [] },
    );

    return {
      index,
      header,
      bestEntity: best.score > 0 ? best.entity : "unmapped",
      bestScore: best.score,
      bestReasons: best.reasons,
      scoreDetails,
    };
  });
}

/**
 * Score column header based on keyword matches
 */
function scoreColumn(header, entityType) {
  const config = KEYWORD_PATTERNS[entityType];
  if (!config) return 0;

  const headerLower = String(header).toLowerCase().trim();
  let score = 0;

  // Check keyword matches
  for (const keyword of config.keywords) {
    if (headerLower.includes(keyword)) {
      score += 10;
    }
  }

  // Check pattern matches
  for (const pattern of config.patterns) {
    if (pattern.test(headerLower)) {
      score += 5;
    }
  }

  // Boost for exact matches
  if (config.keywords.includes(headerLower)) {
    score += 20;
  }

  return score;
}

/**
 * Detect entity type from column headers
 */
export function detectEntityColumns(headers) {
  const result = {
    students: [],
    payments: [],
    leads: [],
    courses: [],
    branches: [],
    trainers: [],
  };

  const entityMapping = getEntityKeyMapping();
  const scalarHeaders = headers.map((header, idx) => ({ header, index: idx }));

  const scoredColumns = scalarHeaders.map((column) => {
    const scores = Object.entries(entityMapping).map(
      ([entityKey, entityType]) => {
        const score = scoreColumn(column.header, entityType);
        return {
          entity: entityKey,
          type: entityType,
          score,
          reasons: extractMatchReasons(column.header, entityType),
        };
      },
    );

    return {
      ...column,
      scores,
    };
  });

  for (const [entityKey] of Object.entries(result)) {
    const scored = scoredColumns
      .map((column) => ({
        header: column.header,
        index: column.index,
        score:
          column.scores.find((score) => score.entity === entityKey)?.score || 0,
        reasons:
          column.scores.find((score) => score.entity === entityKey)?.reasons ||
          [],
      }))
      .filter((item) => item.score > 0)
      .sort((a, b) => b.score - a.score);

    result[entityKey] = scored.slice(0, 3).map((item) => ({
      index: item.index,
      header: item.header,
      score: item.score,
      reasons: item.reasons,
    }));
  }

  return result;
}

/**
 * Guess primary data entity from columns
 */
export function guessPrimaryEntity(headers) {
  const detection = detectEntityColumns(headers);
  let maxScore = 0;
  let primaryEntity = null;

  for (const [entity, cols] of Object.entries(detection)) {
    const totalScore = cols.reduce((sum, col) => sum + col.score, 0);
    if (totalScore > maxScore) {
      maxScore = totalScore;
      primaryEntity = entity;
    }
  }

  return primaryEntity || "students";
}

export function analyzeColumns(headers) {
  return classifyColumns(headers).map((column) => ({
    index: column.index,
    header: column.header,
    detectedEntity: column.bestEntity,
    confidence: column.bestScore,
    reasons: column.bestReasons,
    scoreDetails: column.scoreDetails,
  }));
}

/**
 * Parse sheet and extract metadata
 */
export function analyzeSheet(worksheet, sheetName) {
  const headers = worksheet[0] || [];
  const rows = worksheet.slice(1);
  const rowCount = worksheet.length;
  const columnAnalysis = analyzeColumns(headers);

  return {
    sheetName,
    headerCount: headers.length,
    rowCount: rowCount - 1,
    headers,
    rows,
    detection: detectEntityColumns(headers),
    columnAnalysis,
    unmappedColumns: columnAnalysis.filter(
      (column) => column.detectedEntity === "unmapped",
    ),
    missingFields: getMissingRequiredFields(headers),
    primaryEntity: guessPrimaryEntity(headers),
    sampleData: rows.slice(0, 5),
  };
}
