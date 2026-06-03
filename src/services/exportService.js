import * as XLSX from "xlsx";

function normalizeCell(value) {
  if (value instanceof Date) return value.toISOString().split("T")[0];
  if (value == null) return "";
  return String(value);
}

export function exportDataToCsv(rows, fileName) {
  if (!rows || rows.length === 0) return;
  const headers = Object.keys(rows[0]);
  const csvRows = [headers.join(",")];
  rows.forEach((row) => {
    const values = headers.map((header) => {
      const cell = normalizeCell(row[header]);
      const escaped = cell.replace(/"/g, '""');
      return `"${escaped}"`;
    });
    csvRows.push(values.join(","));
  });
  const blob = new Blob([csvRows.join("\n")], {
    type: "text/csv;charset=utf-8;",
  });
  const link = document.createElement("a");
  link.href = URL.createObjectURL(blob);
  link.download = `${fileName}.csv`;
  link.click();
  URL.revokeObjectURL(link.href);
}

export function exportDataToExcel(rows, fileName) {
  if (!rows || rows.length === 0) return;
  const normalized = rows.map((row) =>
    Object.fromEntries(
      Object.entries(row).map(([key, value]) => [key, normalizeCell(value)]),
    ),
  );
  const worksheet = XLSX.utils.json_to_sheet(normalized);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, "Data");
  XLSX.writeFile(workbook, `${fileName}.xlsx`);
}
