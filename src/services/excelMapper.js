import * as XLSX from "xlsx";
import { analyzeSheet } from "../utils/columnDetector";

/**
 * Parse Excel file and extract sheet data with analysis
 */
export async function parseExcelFile(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = (e) => {
      try {
        const data = e.target.result;
        const workbook = XLSX.read(data, { type: "array" });
        const sheets = {};

        // Parse each sheet
        for (const sheetName of workbook.SheetNames) {
          const worksheet = workbook.Sheets[sheetName];
          const data = XLSX.utils.sheet_to_json(worksheet, { header: 1 });
          sheets[sheetName] = analyzeSheet(data, sheetName);
        }

        resolve({
          fileName: file.name,
          sheets,
          sheetNames: workbook.SheetNames,
        });
      } catch (err) {
        reject(err);
      }
    };

    reader.onerror = () => reject(new Error("Failed to read file"));
    reader.readAsArrayBuffer(file);
  });
}

/**
 * Map raw data based on column mapping
 */
export function mapData(rawData, columnMapping) {
  if (!rawData || !columnMapping) return [];

  return rawData.map((row) => {
    const mapped = {};
    for (const [field, colIdx] of Object.entries(columnMapping)) {
      if (colIdx !== null && colIdx !== undefined) {
        mapped[field] = row[colIdx];
      }
    }
    return mapped;
  });
}

/**
 * Extract data for specific entity
 */
export function extractEntity(sheets, sheetName, entityType, columnMapping) {
  const sheet = sheets[sheetName];
  if (!sheet) return [];

  const rows = sheet.rows || [];
  return mapData(rows, columnMapping[entityType] || {});
}
