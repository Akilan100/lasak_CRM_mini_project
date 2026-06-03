# Data Mapping Layer Documentation

## Overview

The Lasak Analytics Dashboard includes an **automatic Excel column detection and mapping system** that intelligently identifies student, payment, lead, course, branch, and trainer data from uploaded Excel files.

---

## Architecture

### Files & Components

| File                                   | Purpose                                    |
| -------------------------------------- | ------------------------------------------ |
| `src/utils/columnDetector.js`          | Keyword-based column detection heuristics  |
| `src/services/excelMapper.js`          | Excel parsing and data extraction logic    |
| `src/store/mappingStore.js`            | Zustand state management for mapping       |
| `src/components/common/DataMapper.jsx` | UI for viewing detected columns            |
| `src/utils/mappingHelper.js`           | Utility functions for the mapping workflow |
| `src/pages/Upload/index.jsx`           | Upload page with file input and mapper     |

---

## How It Works

### 1. Column Detection Algorithm

The system scores each column header based on:

- **Keyword Matching** (+10 points per keyword match)
  - Examples: `student`, `payment`, `course`, `branch`, `trainer`, `lead`
- **Pattern Matching** (+5 points per regex match)
  - Patterns like `student|name|email|phone|enrollment` for Students
  - `payment|amount|date|status|invoice|transaction|paid|fee` for Payments
- **Exact Matches** (+20 points for exact keyword match)

### 2. Entity Detection

The detector identifies columns for:

- **Students** - Name, email, phone, enrollment date, status
- **Payments** - Amount, date, status, invoice, transaction ID
- **Leads** - Contact info, inquiry source, status, interest level
- **Courses** - Course name, duration, fee, instructor, curriculum
- **Branches** - Location, center, office, address, city
- **Trainers** - Instructor, trainer, teacher, mentor, staff

---

## Usage Examples

### Basic File Upload & Analysis

```javascript
import { parseExcelFile } from "@/services/excelMapper";
import useMappingStore from "@/store/mappingStore";

// Upload and parse file
const handleUpload = async (file) => {
  const { sheets, sheetNames } = await parseExcelFile(file);
  useMappingStore.setState({ sheets, currentSheet: sheetNames[0] });
};
```

### Access Sheet Analysis

```javascript
const { sheets, currentSheet } = useMappingStore();
const analysis = sheets[currentSheet];

// Analysis includes:
// - headers: Array of column names
// - detection: Detected columns by entity type
// - primaryEntity: Primary data entity (e.g., 'students')
// - sampleData: First 3 rows for preview
```

### Extract Entity Data

```javascript
import { mapData } from "@/services/excelMapper";

// Get students
const studentColumns = analysis.detection.students;
const studentMapping = studentColumns.reduce((acc, col) => {
  acc[col.header] = col.index;
  return acc;
}, {});

const students = mapData(analysis.sampleData, studentMapping);
```

---

## Supported Column Patterns

### Students

- Keywords: `student`, `name`, `email`, `phone`, `enrollment`, `student_id`, `sid`
- Patterns: `/student|name|email|phone|enrollment/i`

### Payments

- Keywords: `payment`, `amount`, `date`, `status`, `invoice`, `transaction`, `paid`, `fee`
- Patterns: `/payment|amount|date|status|invoice|transaction|paid|fee/i`

### Leads

- Keywords: `lead`, `prospect`, `contact`, `inquiry`, `source`, `status`, `interested`
- Patterns: `/lead|prospect|contact|inquiry|source|interested/i`

### Courses

- Keywords: `course`, `program`, `subject`, `curriculum`, `duration`, `fee`, `instructor`
- Patterns: `/course|program|subject|curriculum|duration|instructor/i`

### Branches

- Keywords: `branch`, `location`, `center`, `office`, `address`, `city`, `region`
- Patterns: `/branch|location|center|office|address|city|region/i`

### Trainers

- Keywords: `trainer`, `instructor`, `teacher`, `mentor`, `coach`, `staff`
- Patterns: `/trainer|instructor|teacher|mentor|coach|staff/i`

---

## State Management (Zustand)

### Store: `useMappingStore`

```javascript
{
  // File data
  excelFile: string | null,
  sheets: object,
  currentSheet: string | null,

  // Mapping
  columnMapping: object,
  mappingValidation: object,

  // UI
  isLoading: boolean,
  error: string | null,
  success: string | null,
}
```

### Actions

```javascript
// Set Excel file with sheets
setExcelFile(file, sheets, sheetNames);

// Switch sheets
setCurrentSheet(sheetName);

// Update column mapping
setColumnMapping(mapping);
updateColumnMapping(entity, fieldMapping);

// Validation
setMappingValidation(validation);

// UI state
setLoading(isLoading);
setError(error);
setSuccess(success);

// Reset all
reset();
```

---

## Detection Scoring Example

Given headers: `['Student Name', 'Email', 'Amount', 'Date Paid', 'Course']`

**Scores:**

| Header       | Student | Payment | Lead   | Course | Branch | Trainer |
| ------------ | ------- | ------- | ------ | ------ | ------ | ------- |
| Student Name | **30**  | 0       | 0      | 0      | 0      | 0       |
| Email        | **10**  | 5       | **15** | 0      | 0      | 0       |
| Amount       | 0       | **20**  | 0      | 0      | 0      | 0       |
| Date Paid    | 0       | **20**  | 0      | 0      | 0      | 0       |
| Course       | 0       | 0       | 0      | **20** | 0      | 0       |

**Result:** Primary entity = `students` (highest total score)

---

## Extending Detection

To add custom patterns, update `src/utils/columnDetector.js`:

```javascript
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
      "your_custom_keyword",
    ],
    patterns: [/student|name|email|phone|enrollment|your_pattern/i],
  },
  // ... other entities
};
```

---

## Workflow: Upload → Detect → Map → Import

1. **Upload** - User selects Excel file
2. **Parse** - File is read and analyzed
3. **Detect** - Columns are scored and categorized
4. **Review** - User sees detection results in UI
5. **Map** - User can manually adjust column mapping
6. **Validate** - Mapping is validated before import
7. **Import** - Data is extracted and stored

---

## Integration Points

### Current Integration

- **Upload Page** (`src/pages/Upload/index.jsx`) - Full upload and detection UI

### Future Integration Points

- Import modal with manual column reassignment
- Batch import queue with status tracking
- Data validation rules per entity
- Duplicate detection (students, leads)
- Auto-categorization of lead sources
- Payment reconciliation
- Branch/trainer hierarchy validation

---

## Performance Notes

- Parser uses web workers for large files (via XLSX)
- Sheet-by-sheet processing to avoid memory issues
- Detection runs in O(n\*m) where n=headers, m=entities
- UI updates use Zustand for efficient state management

---

## Testing Your Excel Files

1. Navigate to **Upload Excel** page
2. Click upload zone or drag-drop your .xlsx file
3. System automatically detects columns by entity type
4. Review the detection results:
   - Primary entity (highest confidence)
   - Detected columns per entity with confidence scores
   - Column reference grid
   - Sample data preview (first 3 rows)
5. Sheets are shown as tabs if workbook has multiple sheets

---

## Sample Template

Download the built-in template from the Upload page. It includes:

- Student columns: Name, Email, Phone, Enrollment Date, Status
- Course info: Course, Branch
- Payment tracking: Amount Paid, Payment Date
- Lead source: Lead Source

Adapt it to your actual data structure; the detector will auto-identify columns.
