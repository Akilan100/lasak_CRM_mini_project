/**
 * Data Mapping Utility Helper
 * Demonstrates how to use the Excel mapping system
 */

import { parseExcelFile, mapData } from "../services/excelMapper";
import {
  detectEntityColumns,
  guessPrimaryEntity,
} from "../utils/columnDetector";

/**
 * Full workflow example for Excel processing
 */
export async function processExcelWorkflow(file) {
  try {
    // Step 1: Parse the Excel file
    const parsed = await parseExcelFile(file);
    console.log("Parsed sheets:", parsed.sheetNames);

    // Step 2: Get analysis for first sheet
    const firstSheet = parsed.sheets[parsed.sheetNames[0]];
    console.log("Sheet analysis:", firstSheet);

    // Step 3: Review detected columns
    const detection = firstSheet.detection;
    console.log("Detected entities:", detection);

    // Step 4: Get primary entity type
    const primary = firstSheet.primaryEntity;
    console.log("Primary entity:", primary);

    return {
      file: parsed.fileName,
      sheets: parsed.sheets,
      detection,
      primaryEntity: primary,
    };
  } catch (error) {
    console.error("Error processing Excel:", error);
    throw error;
  }
}

/**
 * Extract specific entity data from sheet
 */
export function extractEntityData(analysis, entityType) {
  const columns = analysis.detection[entityType] || [];
  if (columns.length === 0) {
    console.warn(`No columns detected for ${entityType}`);
    return [];
  }

  // Build column index mapping
  const mapping = {};
  columns.forEach((col, idx) => {
    mapping[`field_${idx}`] = col.index;
  });

  // Map raw data
  const data = analysis.sampleData || [];
  return mapData(data, mapping);
}

/**
 * Validate mapping before import
 */
export function validateMapping(analysis, mapping) {
  const errors = [];
  const warnings = [];

  // Check if critical entities are mapped
  const entities = Object.keys(analysis.detection);
  for (const entity of entities) {
    const cols = mapping[entity];
    if (!cols || Object.keys(cols).length === 0) {
      warnings.push(`No columns mapped for ${entity}`);
    }
  }

  // Check for unmapped columns
  const mappedIndices = new Set();
  for (const entity in mapping) {
    for (const field in mapping[entity]) {
      mappedIndices.add(mapping[entity][field]);
    }
  }

  if (mappedIndices.size < analysis.headers.length) {
    warnings.push(
      `${analysis.headers.length - mappedIndices.size} columns are unmapped`,
    );
  }

  return { isValid: errors.length === 0, errors, warnings };
}

/**
 * Generate default mapping from detection
 */
export function generateDefaultMapping(analysis) {
  const mapping = {};
  const detection = analysis.detection;

  for (const [entity, columns] of Object.entries(detection)) {
    mapping[entity] = {};
    columns.forEach((col, idx) => {
      mapping[entity][`${entity}_${idx}`] = col.index;
    });
  }

  return mapping;
}

/**
 * Export mapped data to JSON
 */
export function exportToJSON(analysis, mapping) {
  const data = {};

  for (const entity in mapping) {
    const cols = mapping[entity];
    data[entity] = [];

    analysis.sampleData?.forEach((row) => {
      const record = {};
      for (const [field, idx] of Object.entries(cols)) {
        record[field] = row[idx];
      }
      data[entity].push(record);
    });
  }

  return data;
}
