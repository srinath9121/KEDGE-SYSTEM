# 🛡️ KEDGE SYSTEM — Operations & Facility Command Center

> **Next-Generation Security Services, Workforce Telemetry & Digital Operations Dashboard**  
> Built with **React 19**, **Vite**, **Three.js**, **Anime.js**, **Framer Motion**, and **Recharts**.

---

## 🌟 Overview

**KEDGE System** is an enterprise-grade facility management and security operations command center designed to give **Owners**, **Site Executives**, and **Staff Workers** unified real-time visibility into post coverage, financials, SLA compliance, and digital support queues.

Featuring a sleek **dark-mode cyberpunk aesthetic**, high-density visual telemetry, and instant client-side data ingestion, KEDGE turns complex operational data into immediate actionable insights.

---

## 🔥 Key Highlights & Features

### 🔑 1. Role-Based Access Control (RBAC) Switcher
* **Dual View Modes**: Instantly toggle between **🔑 Owner / Management** command center and **🪪 Staff / Worker** portal with zero page reloads.
* **Role-Aware Sidebar Navigation**: Dynamically renders executive controls (*Security, Financials, Vendors, Payroll*) or worker tools (*Shift Rosters, Salary Documents, Assigned Tasks*).

### 📥 2. Client-Side Data Ingestion Module
* **Drag-and-Drop Batch Upload**: Ingest `.csv` and `.txt` files directly in the browser via HTML5 `FileReader` — 100% client-side privacy.
* **Downloadable Preset CSV Templates**: Download sample CSV schemas for Revenue Trends (`sample_revenue_cost.csv`), Alerts (`sample_alerts.csv`), and Zone Guard Rosters (`sample_zone_roster.csv`).
* **Live Dynamic Dashboard Re-population**: Update financial line charts, operational alert feeds, and post matrices in real time.
* **Session Audit Trail Log**: Track recent file imports with timestamping, record counts, and status checks.

### 📦 3. 3D Isometric Three.js Loading Screen
* **4×4×4 Exploding Cube Grid**: Rendered using Three.js instanced meshes and `anime.js` easing functions.
* **Automatic Dismissal & WebGL Fallback**: Engineered with `useRef` lifecycle safety and fallback handling for smooth cross-browser rendering.

### 📊 4. High-Density Telemetry & Data Visualizations
* **Financial Trends & Profit Split**: Dual-axis line charts and custom SVG `BklitPieChart` with hover slice translations and high-contrast text rendering.
* **Digital Operations Suite**: Monitor Web Traffic, Core Web Vitals (RUM), Live Support Queues, and Support Team Shift Availability.

---

## 🛠️ Technology Stack

| Technology | Role in KEDGE System |
| :--- | :--- |
| **React 19** | Core UI Architecture & Declarative Component State |
| **Vite 8** | Lightning-fast HMR Dev Server & Production Bundling |
| **Three.js** | 3D WebGL Instanced Cube Grid & Spatial Geometry |
| **Anime.js 4** | Math-based Staggered Animations & Easing Curves |
| **Framer Motion 13** | Fluid Page Transitions, Drawer Modals & Micro-Interactions |
| **Recharts 3** | Responsive Financial Trend Graphs & Zone Metric Displays |
| **Lucide Icons** | Minimalist Vector Icon System |
| **Tailwind CSS 4** | Atomic Design Tokens & Glassmorphism Surfaces |

---

## 📂 Project Architecture

```
dashboard-app/
├── public/
├── src/
│   ├── components/
│   │   ├── LoadingScreen.jsx         # 3D Three.js + Anime.js loading animation
│   │   └── ui/
│   │       ├── digital-twin.jsx      # 3D Isometric building visualization
│   │       ├── pie-chart.jsx          # Custom SVG interactive pie chart
│   │       ├── ring-chart.jsx         # Radial status ring visualization
│   │       └── avatar.jsx, dialog.jsx # Radix UI primitive wrappers
│   ├── KEDGEDashboard.jsx            # Primary Command Center & RBAC App Container
│   ├── App.jsx                       # Root App Entry
│   └── main.jsx                      # Vite DOM Mount
├── package.json
└── vite.config.js
```

---

## 🚀 Getting Started

### Prerequisites
* **Node.js**: `v18.0.0` or higher
* **npm**: `v9.0.0` or higher

### Installation & Local Setup

```bash
# 1. Clone the repository
git clone https://github.com/srinath9121/KEDGE-SYSTEM.git

# 2. Navigate to the project directory
cd KEDGE-SYSTEM/dashboard-app

# 3. Install dependencies
npm install

# 4. Start local development server
npm run dev
```

The application will be accessible at:
👉 `http://localhost:5173/`

### Production Build

```bash
# Compile and bundle client asset
npm run build

# Preview production build locally
npm run preview
```

---

## 🤝 Contributing & Pull Requests

1. Create your feature branch: `git checkout -b feature/your-feature-name`
2. Commit your changes: `git commit -m "feat: Add your feature description"`
3. Push to GitHub: `git push -u origin feature/your-feature-name`
4. Open a Compare & Pull Request on GitHub.

---

### 📄 License
Distributed under the **MIT License**. Created for KEDGE Operations & Security Services.
