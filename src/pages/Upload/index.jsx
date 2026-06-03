import React, { useState } from "react";
import { FiUpload, FiAlertCircle, FiCheckCircle, FiInfo } from "react-icons/fi";
import DataMapper from "../../components/common/DataMapper";
import useMappingStore from "../../store/mappingStore";
import { parseExcelFile } from "../../services/excelMapper";
import { validateSheetData } from "../../services/analyticsEngine";

export default function Upload() {
  const [selectedSheet,  setSelectedSheet]  = useState(null);
  const [sheetAnalysis,  setSheetAnalysis]  = useState(null);
  const [fileList,       setFileList]       = useState(null);
  const [validationWarnings, setValidationWarnings] = useState([]);

  const {
    sheets,
    setExcelFile,
    setCurrentSheet,
    error,
    success,
    setError,
    setSuccess,
    isLoading,
  } = useMappingStore();

  const handleFileChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const allowed = [
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      "application/vnd.ms-excel",
    ];
    if (!allowed.includes(file.type) && !file.name.match(/\.(xlsx|xls)$/i)) {
      setError("Unsupported file type. Please upload an .xlsx or .xls file.");
      return;
    }

    useMappingStore.setState({ isLoading: true, error: null, success: null });
    setValidationWarnings([]);

    try {
      const { sheets: parsedSheets, sheetNames } = await parseExcelFile(file);

      if (!sheetNames || sheetNames.length === 0) {
        setError("No sheets found in the workbook.");
        return;
      }

      setExcelFile(file.name, parsedSheets, sheetNames);
      setFileList(sheetNames);

      const firstSheet = parsedSheets[sheetNames[0]];
      setSelectedSheet(sheetNames[0]);
      setSheetAnalysis(firstSheet);
      setCurrentSheet(sheetNames[0]);

      const warnings = validateSheetData(
        firstSheet.headers,
        firstSheet.rows,
        sheetNames[0]
      );
      setValidationWarnings(warnings);

      setSuccess(
        `Loaded ${sheetNames.length} sheet(s) from "${file.name}". ` +
        `${firstSheet.rowCount} rows detected.`
      );
    } catch (err) {
      setError(`Failed to parse workbook: ${err.message}`);
    } finally {
      useMappingStore.setState({ isLoading: false });
    }

    // Reset input so the same file can be re-uploaded
    e.target.value = "";
  };

  const handleSheetSelect = (sheetName) => {
    setSelectedSheet(sheetName);
    const analysis = sheets[sheetName];
    setSheetAnalysis(analysis);
    setCurrentSheet(sheetName);
    if (analysis) {
      const warnings = validateSheetData(analysis.headers, analysis.rows, sheetName);
      setValidationWarnings(warnings);
    }
  };

  return (
    <div className="space-y-6">

      {/* Upload card */}
      <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm border dark:border-gray-700">
        <h2 className="text-lg font-semibold mb-4">Upload Excel Workbook</h2>

        {error && (
          <div className="mb-4 flex items-start gap-3 p-3 bg-red-50 dark:bg-red-900/40 border border-red-200 dark:border-red-700 rounded">
            <FiAlertCircle className="text-red-500 mt-0.5 flex-shrink-0" />
            <p className="text-sm text-red-700 dark:text-red-300">{error}</p>
          </div>
        )}

        {success && (
          <div className="mb-4 flex items-start gap-3 p-3 bg-green-50 dark:bg-green-900/40 border border-green-200 dark:border-green-700 rounded">
            <FiCheckCircle className="text-green-500 mt-0.5 flex-shrink-0" />
            <p className="text-sm text-green-700 dark:text-green-300">{success}</p>
          </div>
        )}

        {validationWarnings.length > 0 && (
          <div className="mb-4 space-y-1">
            {validationWarnings.map((w, i) => (
              <div
                key={i}
                className="flex items-start gap-3 p-3 bg-yellow-50 dark:bg-yellow-900/40 border border-yellow-200 dark:border-yellow-700 rounded"
              >
                <FiInfo className="text-yellow-500 mt-0.5 flex-shrink-0" />
                <p className="text-sm text-yellow-800 dark:text-yellow-200">{w}</p>
              </div>
            ))}
          </div>
        )}

        <label className={`flex items-center justify-center w-full px-4 py-8 border-2 border-dashed rounded-lg transition-colors ${
          isLoading
            ? "border-gray-200 dark:border-gray-700 cursor-not-allowed"
            : "border-gray-300 dark:border-gray-600 cursor-pointer hover:border-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-950/20"
        }`}>
          <div className="flex flex-col items-center gap-2 select-none">
            <FiUpload className={`text-3xl ${isLoading ? "text-gray-300" : "text-gray-400"}`} />
            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
              {isLoading ? "Processing…" : "Click to upload or drag and drop"}
            </span>
            <span className="text-xs text-gray-400">.xlsx, .xls files only</span>
          </div>
          <input
            type="file"
            accept=".xlsx,.xls"
            onChange={handleFileChange}
            disabled={isLoading}
            className="hidden"
          />
        </label>
      </div>

      {/* Sheet tabs */}
      {fileList && fileList.length > 0 && (
        <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-sm border dark:border-gray-700">
          <div className="text-xs font-medium uppercase tracking-wide text-gray-500 dark:text-gray-400 mb-3">
            Sheets in workbook
          </div>
          <div className="flex gap-2 flex-wrap">
            {fileList.map((sheet) => (
              <button
                key={sheet}
                onClick={() => handleSheetSelect(sheet)}
                className={`px-4 py-2 rounded text-sm font-medium transition-colors ${
                  selectedSheet === sheet
                    ? "bg-indigo-600 text-white"
                    : "bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-200 hover:bg-gray-200 dark:hover:bg-gray-600"
                }`}
              >
                {sheet}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Column mapping display */}
      {sheetAnalysis && (
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm border dark:border-gray-700">
          <h3 className="text-base font-semibold mb-4">Column Detection & Mapping</h3>
          <DataMapper analysis={sheetAnalysis} />
        </div>
      )}
    </div>
  );
}
