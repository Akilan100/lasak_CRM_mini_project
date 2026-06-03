# Lasak Analytics Dashboard

Starter Vite + React + Tailwind project for a professional analytics dashboard.

## Installation & Setup

Install dependencies:

```bash
npm install
```

Start the development server:

```bash
npm run dev
```

The app will be available at `http://localhost:5173/`

---

## Features

### 📊 Dashboard

- KPI cards showing key metrics
- Revenue trend line chart
- Student distribution by branch
- Course enrollment pie chart
- Monthly enrollment area chart
- Dark/light theme toggle
- Responsive sidebar navigation

### 📤 Automatic Excel Data Mapping

Upload Excel files and automatically detect columns for:

- **Students** - Name, email, enrollment data
- **Payments** - Amounts, dates, transaction status
- **Leads** - Contact info, source, inquiry status
- **Courses** - Course name, duration, fees
- **Branches** - Location, center details
- **Trainers** - Instructor, staff information

**Features:**

- Intelligent column header analysis using keyword matching
- Automatic entity type detection
- Multi-sheet support
- Sample data preview
- Column confidence scoring
- Extensible keyword patterns

See [DATA_MAPPING_README.md](./DATA_MAPPING_README.md) for detailed documentation.

### 🎨 UI/UX

- Modern SaaS dashboard design
- Tailwind CSS styling
- Responsive layout
- Mobile-optimized sidebar
- Dark mode support
- Smooth transitions and hover effects

### 🛣️ Routing

Routes configured with React Router:

- `/` - Dashboard (home)
- `/students` - Students management
- `/payments` - Payment tracking
- `/leads` - Lead management
- `/courses` - Course catalog
- `/branches` - Branch management
- `/trainers` - Trainer management
- `/analytics` - Advanced analytics
- `/upload` - Excel file upload & mapping
- `/login` - Login page

### 📦 State Management

- **Zustand** for lightweight global state
- Theme store for dark/light mode
- Mapping store for Excel data management

### 📈 Charts

- **Recharts** for responsive visualizations
- Line charts, bar charts, pie charts, area charts
- Mock data included for testing

---

## Project Structure

```
src/
├── assets/                 # Images, fonts, icons
├── components/
│   ├── common/            # Reusable components (KpiCard, etc.)
│   ├── dashboard/         # Layout components (Sidebar, TopNav)
│   └── charts/            # Chart components (Recharts)
├── pages/                 # Page components for routes
├── layouts/               # Layout wrappers (DashboardLayout)
├── routes/                # Router configuration
├── services/              # API services, Excel mapper
├── hooks/                 # Custom React hooks
├── store/                 # Zustand stores
├── utils/                 # Utility functions
├── constants/             # App constants
├── data/                  # Mock data
├── App.jsx                # Root component
└── main.jsx               # Entry point
```

---

## Technology Stack

| Tool                 | Version |
| -------------------- | ------- |
| React                | 18.2.0  |
| Vite                 | 5.2.0   |
| Tailwind CSS         | 3.x     |
| React Router         | 6.16.0  |
| Recharts             | 2.6.2   |
| Zustand              | 4.4.0   |
| Axios                | 1.5.0   |
| React Icons          | 4.11.0  |
| XLSX (Excel parsing) | 0.18.5  |

---

## Configuration Files

- `vite.config.js` - Vite build configuration
- `tailwind.config.cjs` - Tailwind CSS configuration
- `postcss.config.cjs` - PostCSS plugins
- `package.json` - Dependencies and scripts
- `.gitignore` - Git exclusions

---

## Scripts

```bash
# Development server
npm run dev

# Production build
npm run build

# Preview production build locally
npm run preview
```

---

## Data Mapping Layer

The Excel mapping system includes:

- **Auto-detection** of student, payment, lead, course, branch, and trainer columns
- **Scoring algorithm** based on keyword and pattern matching
- **Multi-sheet support** for complex Excel workbooks
- **Sample data preview** for verification
- **Confidence scores** for each detected column
- **Extensible patterns** for custom column naming

**Usage:**

1. Go to **Upload Excel** page
2. Upload or drag-drop an Excel file
3. System automatically detects columns by entity type
4. Review detection results with confidence scores
5. View sample data to verify accuracy

See [DATA_MAPPING_README.md](./DATA_MAPPING_README.md) for API usage and extension guide.

---

## Development Notes

- No backend or database required yet
- Using mock/dummy data for testing
- All styles are Tailwind CSS (no CSS files)
- Dark mode is toggled via theme store
- Responsive design works on mobile (with hamburger menu in future)

---

## Future Enhancements

- [ ] Mobile hamburger menu
- [ ] Manual column remapping UI
- [ ] Batch data import with validation
- [ ] Export mapped data to JSON/CSV
- [ ] Backend API integration
- [ ] Database connection
- [ ] User authentication
- [ ] Settings page
- [ ] PDF export of reports
- [ ] Custom dashboard widgets
