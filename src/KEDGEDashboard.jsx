import React, { useState, useEffect } from "react";
import { AnimatePresence, motion, useMotionValue, useMotionTemplate } from "framer-motion";
import {
  LineChart, Line, BarChart, Bar, RadarChart, Radar,
  PolarGrid, PolarAngleAxis, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, AreaChart, Area
} from "recharts";
import {
  TrendingUp, TrendingDown, ArrowUp, ArrowDown, ChevronUp, ChevronDown, Minus,
  EllipsisVertical, Send, CheckSquare, Globe, Activity, Shield, Home, DollarSign, Users, Settings, Layers, Star,
  RefreshCw, CheckCircle2, AlertTriangle, X, ChevronRight, Terminal, FileText, Eye, ShieldAlert
} from "lucide-react";

import { PieChart as BklitPieChart, PieSlice, PieCenter } from "./components/ui/pie-chart";
import { RingChart, Ring, RingCenter } from "./components/ui/ring-chart";
import LoadingScreen from "./components/LoadingScreen";


// ─── Design tokens ────────────────────────────────────────────────────────────
const C = {
  base:        "#09090B",
  surface:     "#18181B",
  border:      "#27272A",
  borderLight: "#3F3F46",
  blue:        "#2563EB",
  blueFaint:   "rgba(37,99,235,0.12)",
  green:       "#16A34A",
  greenFaint:  "rgba(22,163,74,0.12)",
  amber:       "#EA580C",
  amberFaint:  "rgba(234,88,12,0.12)",
  red:         "#DC2626",
  redFaint:    "rgba(220,38,38,0.12)",
  text:        "#FAFAFA",
  textMid:     "#A1A1AA",
  textDim:     "#52525B",
  mono:        "'IBM Plex Mono', monospace",
  sans:        "'Inter', sans-serif",
};

// ─── Shared UI Helpers ────────────────────────────────────────────────────────
function StatusIndicator({ color = "emerald", pulse = true }) {
  const bg = color === "emerald" ? "#10B981" : "#F59E0B";
  return (
    <span style={{ position: "relative", display: "inline-flex", width: 8, height: 8 }}>
      {pulse && (
        <span style={{
          position: "absolute", display: "inline-flex", height: "100%", width: "100%",
          borderRadius: "50%", background: bg, opacity: 0.75,
          animation: "ping 1.5s cubic-bezier(0, 0, 0.2, 1) infinite",
        }} />
      )}
      <span style={{
        position: "relative", display: "inline-block", borderRadius: "50%",
        width: 8, height: 8, background: bg
      }} />
    </span>
  );
}

const DeltaContext = React.createContext(null);
function useDeltaValue() {
  const context = React.useContext(DeltaContext);
  if (!context) throw new Error("Delta components must be used inside a Delta provider.");
  return context.value;
}
function Delta({ children, value, variant = "default", style }) {
  const isPositive = value > 0;
  const isNegative = value < 0;
  const color = isPositive ? C.green : isNegative ? C.red : C.textMid;
  const bg = isPositive ? C.greenFaint : isNegative ? C.redFaint : "transparent";

  const baseStyle = variant === "badge" ? {
    display: "inline-flex", alignItems: "center", gap: 4,
    padding: "4px 8px", borderRadius: 6, fontSize: 12, fontWeight: 600,
    background: bg, color: color, ...style
  } : {
    display: "inline-flex", alignItems: "center", gap: 4,
    fontSize: 12, color: color, ...style
  };

  return (
    <DeltaContext.Provider value={{ value }}>
      <div style={baseStyle}>
        {children}
      </div>
    </DeltaContext.Provider>
  );
}

function DeltaIcon({ variant = "default" }) {
  const value = useDeltaValue();
  const isPositive = value > 0;
  const isNegative = value < 0;

  if (!value || value === 0) {
    return <Minus size={12} />;
  }

  if (isPositive) {
    if (variant === "trend") return <TrendingUp size={12} />;
    if (variant === "arrow") return <ArrowUp size={12} />;
    return <ChevronUp size={12} />;
  } else {
    if (variant === "trend") return <TrendingDown size={12} />;
    if (variant === "arrow") return <ArrowDown size={12} />;
    return <ChevronDown size={12} />;
  }
}

function DeltaValue({ precision = 1, suffix = "%", absolute = true }) {
  const value = useDeltaValue();
  const formatted = (absolute ? Math.abs(value) : value).toFixed(precision);
  return <span>{formatted}{suffix}</span>;
}

const ShareBarListItemContext = React.createContext(null);

function ShareBarList({ children, style }) {
  return (
    <ul style={{
      position: "relative", zIndex: 10, display: "flex", flexDirection: "column",
      width: "100%", gap: 4, padding: 0, margin: "auto 0", listStyle: "none", ...style
    }}>
      {children}
    </ul>
  );
}

function ShareBarListItem({ children, value, style }) {
  const clamped = Math.min(100, Math.max(0, value));
  return (
    <ShareBarListItemContext.Provider value={{ value: clamped }}>
      <li style={{
        position: "relative", display: "flex", height: 44, alignItems: "center",
        gap: 8, overflow: "hidden", padding: "0 12px", ...style
      }}>
        {children}
      </li>
    </ShareBarListItemContext.Provider>
  );
}

function ShareBarListContent({ children, style }) {
  return (
    <div style={{
      zIndex: 10, display: "flex", width: "100%", alignItems: "center",
      justifyContent: "space-between", gap: 8, fontSize: 13, color: C.text, ...style
    }}>
      {children}
    </div>
  );
}

function ShareBarListLabel({ children, style }) {
  return <span style={{ textOverflow: "ellipsis", overflow: "hidden", whiteSpace: "nowrap", ...style }}>{children}</span>;
}

function ShareBarListValue({ children, style }) {
  return <span style={{ fontWeight: 500, fontFamily: C.mono, ...style }}>{children}</span>;
}

function ShareBarListFill({ color = C.blue, style }) {
  const ctx = React.useContext(ShareBarListItemContext);
  const value = ctx ? ctx.value : 0;
  const borderMixPercent = Math.min(100, Math.max(36, value * 1.75));
  const borderRightColor = `color-mix(in srgb, ${color} ${borderMixPercent}%, transparent)`;
  const fillStartColor = `color-mix(in srgb, ${color} 4%, transparent)`;
  const fillEndColor = `color-mix(in srgb, ${color} 36%, transparent)`;
  const backgroundImage = `linear-gradient(to right, ${fillStartColor}, ${fillEndColor})`;

  return (
    <div style={{
      position: "absolute", top: 0, left: 0, height: "100%", pointerEvents: "none",
      borderRight: `2px solid ${borderRightColor}`,
      backgroundImage,
      width: `${value}%`,
      transition: "width 0.3s ease",
      ...style
    }} />
  );
}

// ─── Mock data ────────────────────────────────────────────────────────────────
const revCostData = [
  { month:"Feb", Revenue:162, Cost:141, Profit: 21 },
  { month:"Mar", Revenue:168, Cost:145, Profit: 23 },
  { month:"Apr", Revenue:130, Cost:147, Profit: -17 },
  { month:"May", Revenue:175, Cost:150, Profit: 25 },
  { month:"Jun", Revenue:178, Cost:152, Profit: 26 },
  { month:"Jul", Revenue:140, Cost:157, Profit: -17 },
];

const housekeepingData = [
  { site:"Site A", score:88 },
  { site:"Site B", score:79 },
  { site:"Site C", score:95 },
  { site:"Site D", score:84 },
  { site:"Site E", score:91 },
];

const securityData = [
  { week:"W1", Incidents:3, Coverage:94 },
  { week:"W2", Incidents:1, Coverage:95 },
  { week:"W3", Incidents:2, Coverage:97 },
  { week:"W4", Incidents:1, Coverage:96 },
];

const vendorRadar = [
  { metric:"Reliability",    score:4.2 },
  { metric:"Cost",           score:3.6 },
  { metric:"Compliance",     score:4.5 },
  { metric:"Responsiveness", score:3.9 },
  { metric:"Quality",        score:4.1 },
];

const costSplit = [
  { name:"Security",    value:38, color:"#2563EB" },
  { name:"Housekeeping",value:26, color:"#16A34A" },
  { name:"Vendors",     value:18, color:"#EA580C" },
  { name:"Consumables", value:7,  color:"#EAB308" },
  { name:"Payroll Admin",value:6, color:"#DC2626" },
  { name:"Overheads",   value:5,  color:"#52525B" },
];

const payrollRows = [
  { label:"Gross Wages",             value:"₹1.42 Cr", variance:"+2.1%",   status:"green", tag:"Reconciled" },
  { label:"Overtime",                value:"₹9.8 L",   variance:"+18%",    status:"amber", tag:"Review" },
  { label:"PF / ESI Filing",         value:"₹31.2 L",  variance:"On time", status:"green", tag:"Filed" },
  { label:"Full & Final Settlements",value:"6 pending", variance:"—",      status:"red",   tag:"Delayed" },
];

const zoneRows = [
  { zone:"North Zone", posts:"38 / 40", cov:"95%", status:"green", tag:"Stable" },
  { zone:"South Zone", posts:"41 / 42", cov:"98%", status:"green", tag:"Clear" },
  { zone:"East Zone",  posts:"29 / 32", cov:"91%", status:"amber", tag:"Monitor" },
  { zone:"West Zone",  posts:"22 / 26", cov:"85%", status:"red",   tag:"Understaffed" },
];

const ownerAlerts = [
  { level:"critical", tag:"Renewal", msg:"Pest control contract (South Zone) expires in 22 days — no renewal initiated." },
  { level:"warning",  tag:"SLA",     msg:"Landscaping vendor missed 2 of 4 scheduled visits this month." },
  { level:"warning",  tag:"Cost",    msg:"Elevator AMC vendor quote 14% above last renewal — benchmarking in progress." },
];

const alerts = ownerAlerts;

// ─── Digital Analytics Mock Data ──────────────────────────────────────────────
const visitorChartData = [
  { month:"Jan", visitors:555 }, { month:"Feb", visitors:904 },
  { month:"Mar", visitors:727 }, { month:"Apr", visitors:801 },
  { month:"May", visitors:942 }, { month:"Jun", visitors:1048 },
  { month:"Jul", visitors:702 }, { month:"Aug", visitors:1103 },
  { month:"Sep", visitors:879 }, { month:"Oct", visitors:1046 },
  { month:"Nov", visitors:1407 }, { month:"Dec", visitors:548 },
];
const totalVisitors = visitorChartData.reduce((s, r) => s + r.visitors, 0);

const deviceData = [
  { label:"Mobile", share:65 },
  { label:"Desktop", share:33 },
  { label:"Tablet", share:2 },
];

const audienceData = [
  { label:"Returning visitors", share:54 },
  { label:"New visitors", share:41 },
  { label:"Logged-in users", share:5 },
];

const browserData = [
  { label:"Chrome", share:58 },
  { label:"Safari", share:22 },
  { label:"Edge", share:9 },
  { label:"Firefox", share:7 },
  { label:"Other", share:4 },
];

const topPagesData = [
  { path:"/", visits:18420, delta:4.1 },
  { path:"/pricing", visits:6280, delta:12.4 },
  { path:"/blog/product-updates", visits:4110, delta:-2.0 },
  { path:"/docs/getting-started", visits:3920, delta:6.8 },
  { path:"/changelog", visits:2150, delta:0.4 },
];

const topCountriesData = [
  { country:"India", flag:"🇮🇳", pct:42 },
  { country:"United States", flag:"🇺🇸", pct:28 },
  { country:"Germany", flag:"🇩🇪", pct:12 },
  { country:"United Kingdom", flag:"🇬🇧", pct:9 },
  { country:"Canada", flag:"🇨🇦", pct:5 },
];

const topReferrersData = [
  { source:"google.com", share:41 },
  { source:"twitter.com", share:18 },
  { source:"linkedin.com", share:14 },
  { source:"github.com", share:12 },
  { source:"(direct)", share:15 },
];

const trafficSourcesData = [
  { name:"Direct", value:35, color:"#2563EB" },
  { name:"Organic Search", value:30, color:"#16A34A" },
  { name:"Social", value:18, color:"#EA580C" },
  { name:"Referral", value:12, color:"#EAB308" },
  { name:"Email", value:5, color:"#DC2626" },
];

const webVitalsData = [
  { metric:"LCP", value:"1.8s", target:"< 2.5s", score:92, status:"green" },
  { metric:"FID", value:"45ms", target:"< 100ms", score:96, status:"green" },
  { metric:"CLS", value:"0.12", target:"< 0.1", score:78, status:"amber" },
  { metric:"TTFB", value:"320ms", target:"< 800ms", score:88, status:"green" },
];

const initialTeammates = [
  { id:"amelia", name:"Amelia Park", status:"Online", open:9 },
  { id:"noah", name:"Noah Ibarra", status:"Online", open:7 },
  { id:"priya", name:"Priya Desai", status:"Away", open:4 },
  { id:"marcus", name:"Marcus Chen", status:"Online", open:11 },
  { id:"emily", name:"Emily Johnson", status:"Away", open:2 },
];

// ─── Navigation Items ─────────────────────────────────────────────────────────
const facilityNavItems = [
  { id:"overview",     icon:"⊞", label:"Overview" },
  { id:"security",     icon:"◉", label:"Security" },
  { id:"housekeeping", icon:"✦", label:"Housekeeping" },
  { id:"payroll",      icon:"$", label:"Payroll" },
  { id:"vendors",      icon:"◈", label:"Vendors" },
  { id:"financials",   icon:"↗", label:"Financials" },
];

const staffNavItems = [
  { id:"staff_overview", icon:"⊞", label:"My Dashboard" },
  { id:"attendance",     icon:"◉", label:"Attendance & Shifts" },
  { id:"payslips",       icon:"$", label:"Salary / Payslips" },
  { id:"tasks",          icon:"✦", label:"Assigned Tasks" },
  { id:"notices",        icon:"◈", label:"Company Notices" },
];

const digitalNavItems = [
  { id:"dataingestion", icon:"📥", label:"Data Ingestion" },
  { id:"webtraffic",    icon:"📊", label:"Web Traffic" },
  { id:"livequeue",     icon:"⚡", label:"Live Queue" },
  { id:"webvitals",     icon:"💡", label:"Web Vitals" },
  { id:"supportteam",   icon:"👥", label:"Support Team" },
];

const navItems = facilityNavItems;

// ─── Shared chart config ──────────────────────────────────────────────────────
const ttStyle = {
  contentStyle:{ background:"#111827", border:"1px solid #1E293B", borderRadius:8, fontSize:12, color:"#F1F5F9" },
  labelStyle:  { color:"#94A3B8" },
};
const gridStyle = { stroke:"#1E293B" };
const axisStyle = { tick:{ fontSize:11, fill:"#94A3B8" } };

// ─── Reusable UI components ───────────────────────────────────────────────────
function Badge({ status, label }) {
  const map = {
    green:{ bg:C.greenFaint, color:C.green },
    amber:{ bg:C.amberFaint, color:C.amber },
    red:  { bg:C.redFaint,   color:C.red   },
  };
  const s = map[status] || map.green;
  return (
    <span style={{
      display:"inline-flex", alignItems:"center", gap:5,
      padding:"3px 10px", borderRadius:20,
      fontSize:11, fontWeight:500, background:s.bg, color:s.color,
    }}>
      <span style={{ width:5, height:5, borderRadius:"50%", background:s.color }} />
      {label}
    </span>
  );
}
function AnimatedNumber({ children }) {
  const [count, setCount] = useState(0);
  const text = String(children);
  // Match prefix, number (with possible decimals/commas), and suffix
  const match = text.match(/^([^0-9.-]*)([0-9,.-]+)(.*)$/);
  
  useEffect(() => {
    if (!match) return;
    const target = parseFloat(match[2].replace(/,/g, ''));
    if (isNaN(target)) return;
    
    let startTime = null;
    const duration = 1500;
    const step = (timestamp) => {
      if (!startTime) startTime = timestamp;
      const progress = Math.min((timestamp - startTime) / duration, 1);
      // easeOutExpo
      const easeProgress = progress === 1 ? 1 : 1 - Math.pow(2, -10 * progress);
      setCount(easeProgress * target);
      if (progress < 1) window.requestAnimationFrame(step);
    };
    window.requestAnimationFrame(step);
  }, [text]); // re-run if text changes

  if (!match) return <>{text}</>;
  const prefix = match[1];
  const numStr = match[2];
  const suffix = match[3];
  const decimals = numStr.includes('.') ? numStr.split('.')[1].length : 0;
  
  return <>{prefix}{count.toFixed(decimals)}{suffix}</>;
}


function KpiCard({ label, value, sub, change, changeUp, accent }) {
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);

  function handleMouseMove({ currentTarget, clientX, clientY }) {
    const { left, top } = currentTarget.getBoundingClientRect();
    mouseX.set(clientX - left);
    mouseY.set(clientY - top);
  }

  return (
    <motion.div
      onMouseMove={handleMouseMove}
      initial={{ opacity: 0, y: 15 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      whileHover={{ y: -2, boxShadow: `0 8px 30px rgba(0,0,0,0.5), 0 0 0 1px ${accent || C.blue}40` }}
      transition={{ duration: 0.4 }}
      style={{
        position: "relative",
        background:C.surface, border:`1px solid ${C.border}`,
        borderRadius:12, padding:"20px 22px",
        borderTop:`2px solid ${accent || C.blue}`,
        overflow: "hidden"
      }}
    >
      <motion.div
        style={{
          position: "absolute", top: 0, left: 0, right: 0, bottom: 0, pointerEvents: "none",
          background: useMotionTemplate`radial-gradient(300px circle at ${mouseX}px ${mouseY}px, ${accent ? accent + '15' : 'rgba(37, 99, 235, 0.08)'}, transparent 80%)`,
          opacity: 0, transition: "opacity 0.3s"
        }}
        whileHover={{ opacity: 1 }}
      />
      <div style={{ position: "relative", zIndex: 1 }}>
        <div style={{ fontSize:12, fontWeight:500, color:C.textMid, marginBottom:10 }}>{label}</div>
        <div style={{ fontSize:28, fontWeight:700, color:C.text, lineHeight:1, fontVariantNumeric: "tabular-nums" }}>
          <AnimatedNumber>{value}</AnimatedNumber>
          {sub && <span style={{ fontSize:14, fontWeight:400, color:C.textMid, marginLeft:4 }}>{sub}</span>}
        </div>
        {change && (
          <div style={{ fontSize:12, color:changeUp ? C.green : C.red, marginTop:8, display:"flex", alignItems:"center", gap:4 }}>
            {changeUp ? "↑" : "↓"} {change}
          </div>
        )}
      </div>
    </motion.div>
  );
}

function Card({ title, subtitle, children, action }) {
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);

  function handleMouseMove({ currentTarget, clientX, clientY }) {
    const { left, top } = currentTarget.getBoundingClientRect();
    mouseX.set(clientX - left);
    mouseY.set(clientY - top);
  }

  return (
    <motion.div 
      onMouseMove={handleMouseMove}
      initial={{ opacity: 0, y: 15 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      whileHover={{ boxShadow: `0 8px 30px rgba(0,0,0,0.5), 0 0 0 1px ${C.borderLight}` }}
      transition={{ duration: 0.4 }}
      style={{ position: "relative", background:C.surface, border:`1px solid ${C.border}`, borderRadius:12, padding:"20px 22px", overflow: "hidden" }}
    >
      <motion.div
        style={{
          position: "absolute", top: 0, left: 0, right: 0, bottom: 0, pointerEvents: "none", zIndex: 0,
          background: useMotionTemplate`radial-gradient(400px circle at ${mouseX}px ${mouseY}px, rgba(255,255,255,0.03), transparent 80%)`,
          opacity: 0, transition: "opacity 0.3s"
        }}
        whileHover={{ opacity: 1 }}
      />
      <div style={{ position: "relative", zIndex: 1 }}>
        <div style={{
          display:"flex", alignItems:"center", justifyContent:"space-between",
          marginBottom:18, paddingBottom:14, borderBottom:`1px solid ${C.border}`,
        }}>
          <div>
            <div style={{ fontSize:14, fontWeight:600, color:C.text }}>{title}</div>
            {subtitle && <div style={{ fontSize:12, color:C.textMid, marginTop:2 }}>{subtitle}</div>}
          </div>
          {action && (
            <button style={{
              fontSize:12, fontWeight:500, color:C.blue, background:"none",
              border:`1px solid ${C.borderLight}`, borderRadius:6, padding:"5px 12px", cursor:"pointer",
            }}>{action}</button>
          )}
        </div>
        {children}
      </div>
    </motion.div>
  );
}

function HBarRow({ label, pct, color }) {
  return (
    <div style={{ display:"grid", gridTemplateColumns:"130px 1fr 40px", alignItems:"center", gap:12 }}>
      <span style={{ fontSize:12, color:C.textMid }}>{label}</span>
      <div style={{ height:6, background:C.border, borderRadius:99, overflow:"hidden" }}>
        <div style={{ height:"100%", width:`${pct}%`, background:color || C.blue, borderRadius:99 }} />
      </div>
      <span style={{ fontSize:12, fontWeight:600, color:C.text, textAlign:"right" }}>{pct}%</span>
    </div>
  );
}

function AlertItem({ level, tag, msg }) {
  const isCrit = level === "critical";
  return (
    <div style={{
      display:"flex", alignItems:"flex-start", gap:12,
      padding:"12px 14px", borderRadius:8,
      background: isCrit ? C.redFaint : C.amberFaint,
      border:`1px solid ${(isCrit ? C.red : C.amber)}30`,
    }}>
      <span style={{
        fontSize:10, fontWeight:700, letterSpacing:0.5, textTransform:"uppercase",
        color: isCrit ? C.red : C.amber, padding:"2px 8px", borderRadius:4,
        whiteSpace:"nowrap", marginTop:1,
        border:`1px solid ${(isCrit ? C.red : C.amber)}50`,
      }}>{tag}</span>
      <span style={{ fontSize:13, color:C.text, lineHeight:1.5 }}>{msg}</span>
    </div>
  );
}

// ─── Sidebar ──────────────────────────────────────────────────────────────────
function Sidebar({ active, onSelect, role, collapsed, onToggle }) {
  const getNavItems = () => {
    if (role === "staff") {
      return [{ category: "Staff Workportal", items: staffNavItems }];
    }
    return [
      { category: "Management Controls", items: facilityNavItems },
      { category: "Digital Operations", items: digitalNavItems },
    ];
  };

  const sections = getNavItems();

  return (
    <motion.aside 
      animate={{ width: collapsed ? 80 : 220 }}
      transition={{ type: "spring", stiffness: 300, damping: 30 }}
      style={{
        minHeight:"100vh", background:C.surface,
        borderRight:`1px solid ${C.border}`,
        display:"flex", flexDirection:"column",
        position:"fixed", top:0, left:0, zIndex:30,
        overflow: "hidden", whiteSpace: "nowrap"
      }}
    >
      <div style={{ padding:"22px 20px 18px", borderBottom:`1px solid ${C.border}`, display:"flex", alignItems:"center", justifyContent:"space-between" }}>
        <div 
          onClick={collapsed ? onToggle : undefined}
          style={{ display:"flex", alignItems:"center", gap:10, cursor: collapsed ? "pointer" : "default" }}
        >
          <div style={{
            width:32, height:32, background: role === "staff" ? C.green : C.blue, borderRadius:8,
            display:"flex", alignItems:"center", justifyContent:"center",
            fontSize:15, fontWeight:800, color:"#fff", flexShrink: 0,
            transition: "background 0.3s"
          }}>K</div>
          <motion.div animate={{ opacity: collapsed ? 0 : 1, width: collapsed ? 0 : "auto" }}>
            <div style={{ fontSize:15, fontWeight:700, color:C.text, letterSpacing:0.3 }}>KEDGE</div>
            <div style={{ fontSize:10, color: role === "staff" ? C.green : C.textDim, letterSpacing:0.5, textTransform:"uppercase", fontWeight:600 }}>
              {role === "staff" ? "Staff Portal" : "Owner Console"}
            </div>
          </motion.div>
        </div>
        <button onClick={onToggle} style={{ background:"transparent", border:"none", color:C.textMid, cursor:"pointer", display: collapsed ? "none" : "block" }}>
          <Minus size={18} />
        </button>
      </div>

      <nav style={{ padding:"12px 10px", flex:1, overflowY:"auto", overflowX: "hidden" }}>
        {sections.map((section, sIdx) => (
          <div key={section.category} style={{ marginBottom:16 }}>
            <motion.div 
              animate={{ opacity: collapsed ? 0 : 1, height: collapsed ? 0 : "auto" }}
              style={{ fontSize:10, fontWeight:600, color:C.textDim, letterSpacing:1, textTransform:"uppercase", padding:"8px 10px 6px" }}>
              {section.category}
            </motion.div>
            {section.items.map(({ id, icon, label }) => {
              const on = active === id;
              const activeColor = role === "staff" ? C.green : C.blue;
              const activeBg = role === "staff" ? C.greenFaint : C.blueFaint;
              return (
                <motion.button 
                  key={id} 
                  onClick={() => onSelect(id)} 
                  whileHover={!on ? { x: 4, backgroundColor: "rgba(255, 255, 255, 0.04)" } : {}}
                  transition={{ type: "spring", stiffness: 400, damping: 25 }}
                  style={{
                    display:"flex", alignItems:"center", gap:10, width:"100%",
                    padding:"9px 12px", borderRadius:7, marginBottom:2,
                    background: on ? activeBg : "transparent",
                    border:"none", borderLeft:`2px solid ${on ? activeColor : "transparent"}`,
                    color: on ? activeColor : C.textMid,
                    fontSize:13, fontWeight: on ? 600 : 400,
                    cursor:"pointer", textAlign:"left", position: "relative"
                  }}>
                  <span style={{ fontSize:14, flexShrink: 0, minWidth: 24, display: "flex", justifyContent: "center" }}>{icon}</span>
                  <motion.span animate={{ opacity: collapsed ? 0 : 1 }}>{label}</motion.span>
                </motion.button>
              );
            })}
          </div>
        ))}
      </nav>

      <div style={{ padding:"14px 16px", borderTop:`1px solid ${C.border}`, display:"flex", alignItems:"center", gap:10 }}>
        <div style={{
          width:30, height:30, borderRadius:"50%", flexShrink: 0,
          background: role === "staff" 
            ? `linear-gradient(135deg, ${C.green}, #059669)` 
            : `linear-gradient(135deg, ${C.blue}, #6366F1)`,
          display:"flex", alignItems:"center", justifyContent:"center",
          fontSize:12, fontWeight:700, color:"#fff", cursor: "pointer"
        }} onClick={onToggle}>{role === "staff" ? "S" : "O"}</div>
        <motion.div animate={{ opacity: collapsed ? 0 : 1 }}>
          <div style={{ fontSize:13, fontWeight:500, color:C.text }}>
            {role === "staff" ? "Rajesh Kumar" : "Owner / Mgmt"}
          </div>
          <div style={{ fontSize:11, color:C.textDim }}>
            {role === "staff" ? "Site Supervisor (South)" : "Full Administrative Access"}
          </div>
        </motion.div>
      </div>
    </motion.aside>
  );
}

function Header({ label, role, setRole }) {
  const [time, setTime] = useState("");
  useEffect(() => {
    const tick = () => setTime(new Date().toLocaleTimeString("en-IN", { hour12:false }));
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, []);

  return (
    <div style={{
      display:"flex", alignItems:"center", justifyContent:"space-between",
      padding:"16px 28px", borderBottom:`1px solid ${C.border}`,
      background:C.surface, position:"sticky", top:0, zIndex:20,
    }}>
      <div>
        <div style={{ fontSize:18, fontWeight:700, color:C.text }}>{label}</div>
        <div style={{ fontSize:12, color:C.textMid, marginTop:2 }}>Last updated · {time}</div>
      </div>
      <div style={{ display:"flex", alignItems:"center", gap:16 }}>
        {/* Role Switcher Pills */}
        <div style={{ display:"flex", flexDirection:"column", alignItems:"flex-end", gap:2 }}>
          <span style={{ fontSize:10, textTransform:"uppercase", color:C.textDim, fontWeight:600, letterSpacing:0.5 }}>View Mode</span>
          <div style={{
            display:"flex", background:C.base, border:`1px solid ${C.border}`,
            borderRadius:8, padding:3, gap:2
          }}>
            {[
              { id: "owner", label: "🔑 Owner / Mgmt" },
              { id: "staff", label: "🪪 Staff / Worker" }
            ].map(r => (
              <button
                key={r.id}
                onClick={() => setRole(r.id)}
                style={{
                  background: role === r.id ? (r.id === "staff" ? C.green : C.blue) : "transparent",
                  color: role === r.id ? "#fff" : C.textMid,
                  border: "none", borderRadius: 6, padding: "5px 14px",
                  fontSize: 12, fontWeight: 600, cursor: "pointer",
                  transition: "all 0.2s ease",
                  boxShadow: role === r.id ? "0 2px 8px rgba(0,0,0,0.3)" : "none"
                }}
              >
                {r.label}
              </button>
            ))}
          </div>
        </div>

        <div style={{
          display:"flex", alignItems:"center", gap:6, fontSize:12, fontWeight:500,
          color:C.green, background:C.greenFaint, padding:"6px 12px", borderRadius:20,
        }}>
          <span style={{ width:6, height:6, borderRadius:"50%", background:C.green }} />
          All Systems Live
        </div>
      </div>
    </div>
  );
}

// ─── Pages ────────────────────────────────────────────────────────────────────
function StaffOverviewPage() {
  return (
    <div style={{ display:"flex", flexDirection:"column", gap:24 }}>
      <div style={{ display:"grid", gridTemplateColumns:"repeat(4,1fr)", gap:16 }}>
        <KpiCard label="Next Scheduled Shift" value="18:00 Today" sub="South Zone" change="Shift A - Night" changeUp accent={C.green} />
        <KpiCard label="Attendance Score" value="98.2%" sub="MTD" change="100% on-time" changeUp accent={C.green} />
        <KpiCard label="Pending Tasks" value="3" sub="action required" change="1 Urgent Notice" changeUp={false} accent={C.amber} />
        <KpiCard label="Last Payslip" value="₹24,500" sub="Jul 2026" change="Disbursed Aug 5" changeUp accent={C.blue} />
      </div>

      <div style={{ display:"grid", gridTemplateColumns:"1.4fr 1fr", gap:16 }}>
        <Card title="My Upcoming Shifts" subtitle="Assigned site posts for current week">
          <div style={{ display:"flex", flexDirection:"column", gap:10 }}>
            {[
              { day:"Today (Tue, Aug 25)", time:"18:00 - 02:00", site:"South Zone - Main Gate", status:"Upcoming", color:"green" },
              { day:"Tomorrow (Wed, Aug 26)", time:"18:00 - 02:00", site:"South Zone - Tower B", status:"Scheduled", color:"green" },
              { day:"Thursday (Thu, Aug 27)", time:"18:00 - 02:00", site:"South Zone - Main Gate", status:"Scheduled", color:"green" },
              { day:"Friday (Fri, Aug 28)", time:"—", site:"Weekly Rest Day", status:"Off", color:"amber" },
              { day:"Saturday (Sat, Aug 29)", time:"08:00 - 16:00", site:"North Zone - Overflow", status:"Scheduled", color:"green" },
            ].map((s, i) => (
              <div key={i} style={{
                display:"flex", alignItems:"center", justifyContent:"space-between",
                padding:"10px 14px", borderRadius:8, background:C.base, border:`1px solid ${C.border}`
              }}>
                <div>
                  <div style={{ fontSize:13, fontWeight:600, color:C.text }}>{s.day}</div>
                  <div style={{ fontSize:12, color:C.textMid, marginTop:2 }}>{s.site}</div>
                </div>
                <div style={{ display:"flex", alignItems:"center", gap:12 }}>
                  <span style={{ fontSize:12, fontFamily:C.mono, color:C.textMid }}>{s.time}</span>
                  <Badge status={s.color} label={s.status} />
                </div>
              </div>
            ))}
          </div>
        </Card>

        <Card title="Assigned Tasks & Duty Notices" subtitle="Action required">
          <div style={{ display:"flex", flexDirection:"column", gap:12 }}>
            <AlertItem level="critical" tag="Required" msg="Complete biometric verification re-enrollment at South Zone office before Aug 28." />
            <AlertItem level="warning" tag="Notice" msg="New patrol logging procedure active starting Sept 1 — download updated KEDGE Staff App." />
            <AlertItem level="warning" tag="Grievance" msg="Overtime discrepancy ticket #4821 resolved & added to next payroll." />
          </div>
        </Card>
      </div>

      <Card title="Quick Actions for Staff" subtitle="Self-service portal options">
        <div style={{ display:"grid", gridTemplateColumns:"repeat(4,1fr)", gap:14 }}>
          {[
            { title:"Apply for Leave", desc:"Request planned leave or casual day off", icon:"📅" },
            { title:"Download Payslips", desc:"Get salary slips for current fiscal year", icon:"📄" },
            { title:"Log Incident / Report", desc:"File immediate safety or post report", icon:"⚠️" },
            { title:"Support & Grievances", desc:"Contact HR or Site Supervisor", icon:"💬" },
          ].map((act, i) => (
            <div key={i} style={{
              background:C.base, border:`1px solid ${C.border}`, borderRadius:8,
              padding:16, cursor:"pointer", transition:"border-color 0.2s"
            }}>
              <div style={{ fontSize:20, marginBottom:8 }}>{act.icon}</div>
              <div style={{ fontSize:13, fontWeight:600, color:C.text }}>{act.title}</div>
              <div style={{ fontSize:11, color:C.textMid, marginTop:4, lineHeight:1.4 }}>{act.desc}</div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}

function OverviewPage({ revCost = revCostData, alertsList = alerts }) {
  const dataMax = Math.max(...revCost.map(i => i.Profit || 0));
  const dataMin = Math.min(...revCost.map(i => i.Profit || 0));
  const off = dataMax <= 0 ? 0 : dataMin >= 0 ? 1 : dataMax / (dataMax - dataMin);

  return (
    <div style={{ display:"flex", flexDirection:"column", gap:24 }}>
      <div style={{ display:"grid", gridTemplateColumns:"repeat(4,1fr)", gap:16 }}>
        <KpiCard label="Total Workforce"  value="891"       sub="staff"  change="12 vs last month"    changeUp accent={C.blue} />
        <KpiCard label="Attendance Rate"  value="91.4%"                  change="1.2% below target"   changeUp={false} accent={C.red} />
        <KpiCard label="Active Sites"     value="14"        sub="sites"  change="All operational"     changeUp accent={C.green} />
        <KpiCard label="Monthly Revenue"  value="₹1.84 Cr"              change="3.4% vs last month"  changeUp accent={C.green} />
      </div>
      <div style={{ display:"grid", gridTemplateColumns:"1.4fr 1fr", gap:16 }}>
        <Card title="Profit/Loss Trend" subtitle="Revenue, Cost & Net Profit · ₹ Lakhs">
          <div style={{ height:200 }}>
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={revCost}>
                <defs>
                  <linearGradient id="splitColor" x1="0" y1="0" x2="0" y2="1">
                    <stop offset={off} stopColor="#10B981" stopOpacity={1} />
                    <stop offset={off} stopColor="#EF4444" stopOpacity={1} />
                  </linearGradient>
                </defs>
                <CartesianGrid {...gridStyle} />
                <XAxis dataKey="month" {...axisStyle} />
                <YAxis {...axisStyle} />
                <Tooltip {...ttStyle} />
                <Legend wrapperStyle={{ fontSize:12, color:C.textMid }} />
                <Line type="monotone" dataKey="Profit" stroke="url(#splitColor)" strokeWidth={3} dot={false} />
                <Line type="monotone" dataKey="Revenue" stroke={C.blue} strokeWidth={2} dot={false} strokeOpacity={0.25} />
                <Line type="monotone" dataKey="Cost" stroke={C.textDim} strokeWidth={2} dot={false} strokeDasharray="4 3" strokeOpacity={0.25} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </Card>
        <Card title="Cost Split" subtitle="Month to date">
          <div style={{ height:200, display: "flex", alignItems: "center", gap: 20 }}>
            <div style={{ flex: 1, position: "relative", height: "100%", display: "flex", alignItems: "center" }}>
              <BklitPieChart 
                data={costSplit.map(d => ({ label: d.name, value: d.value, color: d.color }))}
                size={180}
                innerRadius={55}
                padAngle={0.03}
                cornerRadius={4}
              >
                {costSplit.map((_, i) => (
                  <PieSlice key={i} index={i} hoverEffect="translate" />
                ))}
                <PieCenter defaultLabel="Total" prefix="₹" suffix=" L" />
              </BklitPieChart>
            </div>
            
            <div style={{ display: "flex", flexDirection: "column", gap: 10, flex: 1 }}>
              {costSplit.map((item, idx) => (
                <div key={idx} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", fontSize: 12 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                    <span style={{ width: 8, height: 8, borderRadius: "50%", background: item.color }} />
                    <span style={{ color: C.textMid }}>{item.name}</span>
                  </div>
                  <div style={{ display: "flex", gap: 12, fontFamily: C.mono }}>
                    <span style={{ color: C.textMid }}>{item.value} L</span>
                    <span style={{ fontWeight: 600, color: C.text }}>{item.value}%</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </Card>
      </div>

      <Card title="Active Alerts" subtitle={`${alertsList.length} items need attention`}>
        <div style={{ display:"flex", flexDirection:"column", gap:10 }}>
          {alertsList.map((a, i) => <AlertItem key={i} {...a} />)}
        </div>
      </Card>
    </div>
  );
}

function SecurityPage() {
  return (
    <div style={{ display:"flex", flexDirection:"column", gap:20 }}>
      <div style={{ display:"grid", gridTemplateColumns:"repeat(3,1fr)", gap:16 }}>
        <KpiCard label="On-Post Coverage"  value="96%"    change="Above 95% target"    changeUp accent={C.green} />
        <KpiCard label="Incidents MTD"     value="7"      change="4 resolved"           changeUp accent={C.amber} />
        <KpiCard label="Avg Response Time" value="4.2 m"  change="0.3m better vs last" changeUp accent={C.blue} />
      </div>
      <div style={{ display:"grid", gridTemplateColumns:"1.2fr 1fr", gap:16 }}>
        <Card title="Weekly Incidents & Coverage" subtitle="Current month">
          <div style={{ height:210 }}>
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={securityData}>
                <CartesianGrid {...gridStyle} />
                <XAxis dataKey="week" {...axisStyle} />
                <YAxis yAxisId="l" domain={[0,6]}      {...axisStyle} />
                <YAxis yAxisId="r" orientation="right" domain={[80,100]} {...axisStyle} />
                <Tooltip {...ttStyle} />
                <Legend wrapperStyle={{ fontSize:12, color:C.textMid }} />
                <Line yAxisId="l" type="monotone" dataKey="Incidents" stroke={C.red}   strokeWidth={2} dot={{ r:4, fill:C.red }} />
                <Line yAxisId="r" type="monotone" dataKey="Coverage"  stroke={C.green} strokeWidth={2} dot={{ r:4, fill:C.green }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </Card>
        <Card title="Zone Summary" subtitle="479 guards deployed">
          {zoneRows.map(r => (
            <div key={r.zone} style={{
              display:"grid", gridTemplateColumns:"1fr auto auto auto",
              alignItems:"center", gap:12,
              padding:"10px 0", borderBottom:`1px solid ${C.border}`,
            }}>
              <span style={{ fontSize:13, fontWeight:500, color:C.text }}>{r.zone}</span>
              <span style={{ fontSize:12, color:C.textMid, fontFamily:C.mono }}>{r.posts}</span>
              <span style={{ fontSize:12, color:C.textMid }}>{r.cov}</span>
              <Badge status={r.status} label={r.tag} />
            </div>
          ))}
        </Card>
      </div>
    </div>
  );
}

function HousekeepingPage() {
  const bars = [
    { label:"Restroom Hygiene",   pct:94, color:C.green },
    { label:"Floor & Common Area",pct:89, color:C.green },
    { label:"Waste Management",   pct:78, color:C.amber },
    { label:"Pantry & Cafeteria", pct:96, color:C.green },
  ];
  return (
    <div style={{ display:"flex", flexDirection:"column", gap:20 }}>
      <div style={{ display:"grid", gridTemplateColumns:"repeat(3,1fr)", gap:16 }}>
        <KpiCard label="Audit Score"          value="4.4 / 5" change="Above 4.0 target"       changeUp accent={C.green} />
        <KpiCard label="Checklist Compliance" value="92%"     change="3% below last month"     changeUp={false} accent={C.amber} />
        <KpiCard label="Consumable Overrun"   value="11%"     change="Budget breach — review"  changeUp={false} accent={C.red} />
      </div>
      <div style={{ display:"grid", gridTemplateColumns:"1.2fr 1fr", gap:16 }}>
        <Card title="Audit Scores by Site" subtitle="312 housekeeping staff">
          <div style={{ height:210 }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={housekeepingData} barSize={28}>
                <CartesianGrid {...gridStyle} />
                <XAxis dataKey="site" {...axisStyle} />
                <YAxis domain={[0,100]} {...axisStyle} />
                <Tooltip {...ttStyle} />
                <Bar dataKey="score" fill={C.blue} radius={[4,4,0,0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>
        <Card title="Category Breakdown" subtitle="Cleanliness performance">
          <div style={{ display:"flex", flexDirection:"column", gap:14, paddingTop:4 }}>
            {bars.map(b => <HBarRow key={b.label} {...b} />)}
          </div>
        </Card>
      </div>
    </div>
  );
}

function PayrollPage() {
  const monthlyData = [
    { month:"Feb", cost:128 }, { month:"Mar", cost:131 },
    { month:"Apr", cost:135 }, { month:"May", cost:138 },
    { month:"Jun", cost:140 }, { month:"Jul", cost:142 },
  ];
  return (
    <div style={{ display:"flex", flexDirection:"column", gap:20 }}>
      <div style={{ display:"grid", gridTemplateColumns:"repeat(3,1fr)", gap:16 }}>
        <KpiCard label="On-Time Disbursal" value="100%"    change="All salaries paid"   changeUp accent={C.green} />
        <KpiCard label="Statutory Dues"    value="₹31.2 L" change="PF + ESI filed"      changeUp accent={C.blue} />
        <KpiCard label="Open Grievances"   value="14"      change="6 pending review"    changeUp={false} accent={C.red} />
      </div>
      <div style={{ display:"grid", gridTemplateColumns:"1.2fr 1fr", gap:16 }}>
        <Card title="Payroll Cost Trend" subtitle="₹ Lakhs · 6 months">
          <div style={{ height:210 }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={monthlyData} barSize={28}>
                <CartesianGrid {...gridStyle} />
                <XAxis dataKey="month" {...axisStyle} />
                <YAxis {...axisStyle} />
                <Tooltip {...ttStyle} />
                <Bar dataKey="cost" fill={C.blue} radius={[4,4,0,0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>
        <Card title="This Cycle Breakdown" subtitle="891 headcount">
          {payrollRows.map((r, i) => (
            <div key={i} style={{
              display:"grid", gridTemplateColumns:"1fr auto auto",
              alignItems:"center", gap:12,
              padding:"10px 0", borderBottom:`1px solid ${C.border}`,
            }}>
              <div>
                <div style={{ fontSize:13, fontWeight:500, color:C.text }}>{r.label}</div>
                <div style={{ fontSize:11, color:C.textMid, marginTop:2 }}>{r.variance}</div>
              </div>
              <span style={{ fontSize:13, fontFamily:C.mono, color:C.text }}>{r.value}</span>
              <Badge status={r.status} label={r.tag} />
            </div>
          ))}
        </Card>
      </div>
    </div>
  );
}

// ─── Inline Radar Chart helpers ───────────────────────────────────────────────
function radarAngle(i, total) { return (Math.PI * 2 * i) / total - Math.PI / 2; }
function radarPt(cx, cy, r, angle) { return { x: cx + r * Math.cos(angle), y: cy + r * Math.sin(angle) }; }
function radarPath(cx, cy, r, metrics, values) {
  return metrics.map((m, i) => {
    const a = radarAngle(i, metrics.length);
    const v = (values[m] ?? 0) / 5; // scores out of 5
    return radarPt(cx, cy, r * v, a);
  });
}
function ptsToD(pts) {
  return pts.map((p, i) => `${i === 0 ? "M" : "L"}${p.x.toFixed(1)},${p.y.toFixed(1)}`).join(" ") + " Z";
}

function VendorRadarInline() {
  const [hovered, setHovered] = useState(null);
  const svgSize = 240; const cx = svgSize / 2; const cy = svgSize / 2; const radius = 88;
  const levels = 5;
  const metrics = ["Reliability", "Cost", "Compliance", "Responsiveness", "Quality"];
  const vendors = [
    { label:"Northwind Labs",  color:C.blue,  values:{ Reliability:4.2, Cost:3.6, Compliance:4.5, Responsiveness:3.9, Quality:4.1 } },
    { label:"Blue River Co.", color:C.green, values:{ Reliability:3.8, Cost:4.4, Compliance:3.9, Responsiveness:4.6, Quality:3.7 } },
    { label:"Harbor Freight", color:C.amber, values:{ Reliability:3.4, Cost:4.8, Compliance:3.6, Responsiveness:3.2, Quality:3.9 } },
  ];
  return (
    <div style={{ display:"flex", flexDirection:"column", alignItems:"center", gap:14 }}>
      <svg width={svgSize} height={svgSize} viewBox={`0 0 ${svgSize} ${svgSize}`} style={{ overflow:"visible" }}>
        {/* Grid circles */}
        {Array.from({ length: levels }).map((_, li) => {
          const r = (radius * (li + 1)) / levels;
          const pts = metrics.map((_, mi) => radarPt(cx, cy, r, radarAngle(mi, metrics.length)));
          return <polygon key={li} points={pts.map(p => `${p.x},${p.y}`).join(" ")} fill="none" stroke={C.border} strokeOpacity={0.5} strokeWidth={1} />;
        })}
        {/* Axes */}
        {metrics.map((m, i) => {
          const pt = radarPt(cx, cy, radius, radarAngle(i, metrics.length));
          return <line key={m} x1={cx} y1={cy} x2={pt.x} y2={pt.y} stroke={C.border} strokeOpacity={0.4} strokeWidth={1} />;
        })}
        {/* Labels */}
        {metrics.map((m, i) => {
          const a = radarAngle(i, metrics.length);
          const pt = radarPt(cx, cy, radius + 20, a);
          const anchor = Math.abs(pt.x - cx) < 4 ? "middle" : pt.x < cx ? "end" : "start";
          return <text key={m} x={pt.x} y={pt.y} textAnchor={anchor} dominantBaseline="middle" fontSize={10} fill={C.textMid}>{m}</text>;
        })}
        {/* Vendor areas */}
        {vendors.map((v, vi) => {
          const pts = radarPath(cx, cy, radius, metrics, v.values);
          const d = ptsToD(pts);
          const isH = hovered === vi; const isF = hovered !== null && !isH;
          return (
            <g key={v.label} onMouseEnter={() => setHovered(vi)} onMouseLeave={() => setHovered(null)} style={{ cursor:"pointer" }}>
              <path d={d} fill={v.color} fillOpacity={isH ? 0.28 : isF ? 0.04 : 0.13}
                stroke={v.color} strokeWidth={isH ? 2.5 : 1.5} strokeOpacity={isF ? 0.25 : 1} strokeLinejoin="round" />
              {pts.map((pt, pi) => (
                <circle key={pi} cx={pt.x} cy={pt.y} r={isH ? 4 : 2.5} fill={v.color} fillOpacity={isF ? 0.2 : 1} />
              ))}
            </g>
          );
        })}
      </svg>
      {/* Legend */}
      <div style={{ display:"flex", gap:10, flexWrap:"wrap", justifyContent:"center" }}>
        {vendors.map((v, vi) => {
          const isH = hovered === vi; const isF = hovered !== null && !isH;
          return (
            <button key={v.label}
              onMouseEnter={() => setHovered(vi)} onMouseLeave={() => setHovered(null)}
              style={{
                display:"flex", alignItems:"center", gap:6, padding:"4px 10px",
                borderRadius:6, border:"none", background: isH ? C.border : "transparent",
                opacity: isF ? 0.35 : 1, cursor:"pointer", fontSize:12, color:C.text, transition:"all 0.15s"
              }}
            >
              <span style={{ width:8, height:8, borderRadius:"50%", background:v.color, display:"inline-block", flexShrink:0 }} />
              {v.label}
            </button>
          );
        })}
      </div>
    </div>
  );
}

function VendorsPage() {
  return (
    <div style={{ display:"flex", flexDirection:"column", gap:20 }}>
      <div style={{ display:"grid", gridTemplateColumns:"repeat(3,1fr)", gap:16 }}>
        <KpiCard label="Active Contracts"   value="18"      change="22 total vendors"         changeUp accent={C.blue} />
        <KpiCard label="Avg Vendor Score"   value="4.1 / 5" change="0.2 up vs last quarter"   changeUp accent={C.green} />
        <KpiCard label="Expiring < 60 days" value="3"       change="Action needed"             changeUp={false} accent={C.red} />
      </div>
      <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:16 }}>
        <Card title="Vendor Performance Radar" subtitle="Comparing 3 top vendors across 5 metrics">
          <VendorRadarInline />
        </Card>
        <Card title="Vendor Alerts" subtitle="Items requiring action">
          <div style={{ display:"flex", flexDirection:"column", gap:10 }}>
            {alerts.map((a, i) => <AlertItem key={i} {...a} />)}
          </div>
        </Card>
      </div>
    </div>
  );
}

function DonutCostSplit() {
  const [hovered, setHovered] = useState(null);
  const data = costSplit;
  const total = data.reduce((s, d) => s + d.value, 0);

  const svgSize = 180;
  const cx = svgSize / 2;
  const cy = svgSize / 2;
  const outerR = 75;
  const innerR = 42;

  let cumulativePercent = 0;
  const slices = data.map((d, i) => {
    const percent = d.value / total;
    const startAngle = cumulativePercent * 360;
    const endAngle = (cumulativePercent + percent) * 360;
    cumulativePercent += percent;
    return {
      ...d,
      startAngle,
      endAngle,
      midAngle: startAngle + (endAngle - startAngle) / 2
    };
  });

  function getPathData(startAngle, endAngle) {
    const startRad = (startAngle - 90) * Math.PI / 180;
    const endRad = (endAngle - 90) * Math.PI / 180;

    const x1_o = cx + outerR * Math.cos(startRad);
    const y1_o = cy + outerR * Math.sin(startRad);
    const x2_o = cx + outerR * Math.cos(endRad);
    const y2_o = cy + outerR * Math.sin(endRad);

    const x1_i = cx + innerR * Math.cos(endRad);
    const y1_i = cy + innerR * Math.sin(endRad);
    const x2_i = cx + innerR * Math.cos(startRad);
    const y2_i = cy + innerR * Math.sin(startRad);

    const largeArcFlag = endAngle - startAngle > 180 ? 1 : 0;

    return [
      `M ${x1_o} ${y1_o}`,
      `A ${outerR} ${outerR} 0 ${largeArcFlag} 1 ${x2_o} ${y2_o}`,
      `L ${x1_i} ${y1_i}`,
      `A ${innerR} ${innerR} 0 ${largeArcFlag} 0 ${x2_i} ${y2_i}`,
      `Z`
    ].join(" ");
  }

  const activeItem = hovered !== null ? data[hovered] : null;

  return (
    <div style={{ display:"flex", alignItems:"center", gap:24, justifyContent:"center", flexWrap:"wrap", padding:"10px 0" }}>
      <div style={{ position:"relative", width:svgSize, height:svgSize }}>
        <svg width={svgSize} height={svgSize} viewBox={`0 0 ${svgSize} ${svgSize}`} style={{ overflow:"visible" }}>
          {slices.map((slice, i) => {
            const isH = hovered === i;
            const isF = hovered !== null && !isH;
            const path = getPathData(slice.startAngle, slice.endAngle);
            
            const midRad = (slice.midAngle - 90) * Math.PI / 180;
            const tx = isH ? Math.cos(midRad) * 4 : 0;
            const ty = isH ? Math.sin(midRad) * 4 : 0;

            return (
              <g key={slice.name} 
                onMouseEnter={() => setHovered(i)} 
                onMouseLeave={() => setHovered(null)} 
                style={{ cursor:"pointer", transition:"transform 0.2s" }}
                transform={`translate(${tx}, ${ty})`}
              >
                {isH && (
                  <path d={path} fill={slice.color} fillOpacity={0.2} stroke={slice.color} strokeWidth={6} strokeOpacity={0.15} />
                )}
                <path d={path} fill={slice.color} fillOpacity={isF ? 0.35 : 1} stroke={C.surface} strokeWidth={1.5} style={{ transition:"fill-opacity 0.2s" }} />
              </g>
            );
          })}
        </svg>
        <div style={{
          position:"absolute", top:0, left:0, width:svgSize, height:svgSize,
          display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center",
          pointerEvents:"none", textAlign:"center"
        }}>
          <span style={{ fontSize:18, fontWeight:700, color:C.text }}>
            {activeItem ? `${activeItem.value}%` : "100%"}
          </span>
          <span style={{ fontSize:10, color:C.textMid, marginTop:2, maxWidth:76, overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>
            {activeItem ? activeItem.name : "Total Cost"}
          </span>
        </div>
      </div>

      <div style={{ display:"flex", flexDirection:"column", gap:6 }}>
        {data.map((item, i) => {
          const isH = hovered === i;
          const isF = hovered !== null && !isH;
          return (
            <div key={item.name}
              onMouseEnter={() => setHovered(i)}
              onMouseLeave={() => setHovered(null)}
              style={{
                display:"flex", alignItems:"center", gap:8, fontSize:12,
                opacity: isF ? 0.4 : 1, transition:"opacity 0.2s", cursor:"pointer",
                padding:"2px 6px", borderRadius:4, background: isH ? C.border : "transparent"
              }}
            >
              <span style={{ width:8, height:8, borderRadius:"50%", background:item.color, display:"inline-block" }} />
              <span style={{ color:C.textMid, flex:1, width:88 }}>{item.name}</span>
              <span style={{ color:C.text, fontFamily:C.mono, fontWeight:600 }}>{item.value}%</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function FinancialsPage() {
  return (
    <div style={{ display:"flex", flexDirection:"column", gap:20 }}>
      <div style={{ display:"grid", gridTemplateColumns:"repeat(4,1fr)", gap:16 }}>
        <KpiCard label="Monthly Revenue" value="₹1.84 Cr" change="3.4% vs last month"  changeUp accent={C.blue} />
        <KpiCard label="Total Cost"      value="₹1.57 Cr" change="3.3% vs last month"  changeUp={false} accent={C.amber} />
        <KpiCard label="Gross Margin"    value="14.7%"     change="0.1% improvement"    changeUp accent={C.green} />
        <KpiCard label="EBITDA"          value="₹27.1 L"   change="Healthy range"       changeUp accent={C.green} />
      </div>
      <div style={{ display:"grid", gridTemplateColumns:"1.4fr 1fr", gap:16 }}>
        <Card title="Revenue vs. Cost" subtitle="6 months · ₹ Lakhs">
          <div style={{ height:210 }}>
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={revCostData}>
                <CartesianGrid {...gridStyle} />
                <XAxis dataKey="month" {...axisStyle} />
                <YAxis {...axisStyle} />
                <Tooltip {...ttStyle} />
                <Legend wrapperStyle={{ fontSize:12, color:C.textMid }} />
                <Line type="monotone" dataKey="Revenue" stroke={C.blue}    strokeWidth={2} dot={false} />
                <Line type="monotone" dataKey="Cost"    stroke={C.textDim} strokeWidth={2} dot={false} strokeDasharray="4 3" />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </Card>
        <Card title="Cost Split" subtitle="Month to date">
          <DonutCostSplit />
        </Card>
      </div>
      <Card title="Financial Summary" subtitle="Current period">
        <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:0 }}>
          {[
            ["Gross Wages",      "₹1.42 Cr", C.text],
            ["Overtime",         "₹9.8 L",   C.amber],
            ["Vendor Payments",  "₹33.1 L",  C.text],
            ["Statutory Dues",   "₹31.2 L",  C.text],
            ["Consumables",      "₹12.9 L",  C.text],
            ["Net Profit (Est.)","₹27.1 L",  C.green],
          ].map(([lbl, val, color], i) => (
            <div key={i} style={{
              display:"flex", justifyContent:"space-between",
              padding:"11px 12px", borderBottom:`1px solid ${C.border}`,
              borderRight: i % 2 === 0 ? `1px solid ${C.border}` : "none",
            }}>
              <span style={{ fontSize:13, color:C.textMid }}>{lbl}</span>
              <span style={{ fontSize:13, fontWeight:600, color, fontFamily:C.mono }}>{val}</span>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}

// ─── Digital Analytics Widgets ────────────────────────────────────────────────
function VisitorsChart() {
  return (
    <Card title="Total Visitors" subtitle="Total visitors in the last 12 months">
      <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start", marginTop:-10, marginBottom:15 }}>
        <div style={{ fontSize:28, fontWeight:700, color:C.text, fontFamily:C.mono }}>{totalVisitors.toLocaleString()}</div>
        <Delta value={7.2} variant="badge">
          <DeltaIcon variant="trend" />
          <DeltaValue />
          <span style={{ fontSize:10, marginLeft:2, color:C.textMid }}>vs prior 12 months</span>
        </Delta>
      </div>
      <div style={{ height:200 }}>
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={visitorChartData} margin={{ left:0, right:0, top:10, bottom:0 }}>
            <defs>
              <linearGradient id="visitorsGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor={C.blue} stopOpacity={0.35}/>
                <stop offset="95%" stopColor={C.blue} stopOpacity={0}/>
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#1E293B" vertical={false} />
            <XAxis dataKey="month" tickFormatter={v => v.slice(0,3)} tick={{ fontSize:11, fill:C.textMid }} axisLine={false} tickLine={false} />
            <Tooltip contentStyle={{ background:"#111827", border:"1px solid #1E293B", borderRadius:8, fontSize:12, color:"#F1F5F9" }} />
            <Area type="monotone" dataKey="visitors" stroke={C.blue} strokeWidth={2} fillOpacity={1} fill="url(#visitorsGrad)" dot={{ r:2.5, fill:C.blue, strokeWidth:1 }} isAnimationActive={false} />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </Card>
  );
}

function OnlineNow() {
  const devices = [
    { label:"Mobile", share:65, color:C.blue },
    { label:"Desktop", share:33, color:C.green },
    { label:"Tablet", share:2, color:C.amber },
  ];
  return (
    <Card title="Active Now" subtitle="Visitors online in the last 5 minutes">
      <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start", marginTop:-10, marginBottom:15 }}>
        <div style={{ display:"flex", alignItems:"center", gap:8 }}>
          <span style={{ fontSize:32, fontWeight:700, color:C.text, fontFamily:C.mono }}>94</span>
          <span style={{ display:"flex", alignItems:"center", gap:4, fontSize:11, color:C.green }}>
            <StatusIndicator color="emerald" pulse={true} />
            online
          </span>
        </div>
        <Delta value={14.8} variant="badge">
          <DeltaIcon variant="trend" />
          <DeltaValue />
        </Delta>
      </div>
      <div style={{ padding:"10px 0" }}>
        <ShareBarList>
          {devices.map((d) => (
            <ShareBarListItem key={d.label} value={d.share}>
              <ShareBarListContent>
                <ShareBarListLabel>{d.label}</ShareBarListLabel>
                <ShareBarListValue>{d.share}%</ShareBarListValue>
              </ShareBarListContent>
              <ShareBarListFill color={d.color} />
            </ShareBarListItem>
          ))}
        </ShareBarList>
      </div>
    </Card>
  );
}

function AudienceMix() {
  const segments = [
    { label:"Returning visitors", share:54, color:C.blue },
    { label:"New visitors", share:41, color:C.green },
    { label:"Logged-in users", share:5, color:C.amber },
  ];
  return (
    <Card title="Audience Mix" subtitle="Session split by familiarity in the last 12 months">
      <div style={{ padding:"10px 0" }}>
        <ShareBarList>
          {segments.map((row) => (
            <ShareBarListItem key={row.label} value={row.share}>
              <ShareBarListContent>
                <ShareBarListLabel>{row.label}</ShareBarListLabel>
                <ShareBarListValue>{row.share}%</ShareBarListValue>
              </ShareBarListContent>
              <ShareBarListFill color={row.color} />
            </ShareBarListItem>
          ))}
        </ShareBarList>
      </div>
    </Card>
  );
}

function BrowserShare() {
  const browsers = [
    { label:"Chrome", share:58, color:C.blue },
    { label:"Safari", share:22, color:C.green },
    { label:"Edge", share:9, color:C.amber },
    { label:"Firefox", share:7, color:C.red },
    { label:"Other", share:4, color:C.textMid },
  ];
  return (
    <Card title="Browsers" subtitle="Share of sessions by primary browser family">
      <div style={{ padding:"10px 0" }}>
        <ShareBarList>
          {browsers.map((row) => (
            <ShareBarListItem key={row.label} value={row.share}>
              <ShareBarListContent>
                <ShareBarListLabel>{row.label}</ShareBarListLabel>
                <ShareBarListValue>{row.share}%</ShareBarListValue>
              </ShareBarListContent>
              <ShareBarListFill color={row.color} />
            </ShareBarListItem>
          ))}
        </ShareBarList>
      </div>
    </Card>
  );
}

function TeamOnDuty() {
  const [teammates, setTeammates] = useState([
    { id:"amelia", name:"Amelia Park", status:"Online", open:9, image:"https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=80" },
    { id:"noah", name:"Noah Ibarra", status:"Online", open:7, image:"https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=80" },
    { id:"priya", name:"Priya Desai", status:"Away", open:4, image:"https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=80" },
    { id:"marcus", name:"Marcus Chen", status:"Online", open:11, image:"https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=80" },
    { id:"emily", name:"Emily Johnson", status:"Away", open:2, image:"https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=80" },
  ]);

  const [activeMenuId, setActiveMenuId] = useState(null);

  function pullNextConversation(id) {
    setTeammates((prev) =>
      prev.map((t) =>
        t.id === id ? { ...t, open: Math.max(0, t.open - 1) } : t
      )
    );
    setActiveMenuId(null);
  }

  return (
    <Card title="Team on Duty" subtitle="Who is carrying the queue right now">
      <ul style={{ display:"flex", flexDirection:"column", gap:0, padding:0, margin:0, listStyle:"none" }}>
        {teammates.map((t, idx) => (
          <li key={t.id} style={{
            display:"flex", alignItems:"center", gap:12, padding:"12px 0",
            borderBottom: idx === teammates.length - 1 ? "none" : `1px solid ${C.border}`,
            position:"relative"
          }}>
            {/* Avatar */}
            <div style={{ position:"relative", width:32, height:32, borderRadius:"50%", overflow:"hidden", background:C.border }}>
              <img src={t.image} alt={t.name} style={{ width:"100%", height:"100%", objectFit:"cover" }} />
            </div>

            {/* Info */}
            <div style={{ flex:1, minWidth:0 }}>
              <div style={{ fontSize:13, fontWeight:500, color:C.text }}>{t.name}</div>
              <div style={{ display:"flex", alignItems:"center", gap:8, fontSize:11, color:C.textMid, marginTop:2 }}>
                <span style={{ display:"flex", alignItems:"center", gap:4 }}>
                  <StatusIndicator color={t.status === "Online" ? "emerald" : "amber"} pulse={t.status === "Online"} />
                  {t.status}
                </span>
                <span style={{ width:3, height:3, borderRadius:"50%", background:C.textDim }} />
                <span style={{ fontFamily:C.mono }}>{t.open} assigned</span>
              </div>
            </div>

            {/* Dropdown Action */}
            <div style={{ position:"relative" }}>
              <button
                onClick={() => setActiveMenuId(activeMenuId === t.id ? null : t.id)}
                style={{
                  background:"none", border:"none", color:C.textMid, cursor:"pointer",
                  padding:6, borderRadius:4, display:"flex", alignItems:"center"
                }}
              >
                <EllipsisVertical size={16} />
              </button>

              {activeMenuId === t.id && (
                <>
                  <div
                    onClick={() => setActiveMenuId(null)}
                    style={{ position:"fixed", top:0, left:0, right:0, bottom:0, zIndex:998 }}
                  />
                  <div style={{
                    position:"absolute", right:0, top:"100%", zIndex:999,
                    background:C.surface, border:`1px solid ${C.border}`, borderRadius:8,
                    width:180, padding:"6px 0", boxShadow:"0 10px 25px rgba(0,0,0,0.5)"
                  }}>
                    <div style={{ padding:"6px 12px", fontSize:11, color:C.textDim, fontWeight:600 }}>{t.name}</div>
                    <div style={{ height:1, background:C.border, margin:"4px 0" }} />
                    <button
                      onClick={() => { alert(`Message sent to ${t.name}`); setActiveMenuId(null); }}
                      style={{
                        display:"flex", alignItems:"center", gap:8, width:"100%", background:"none",
                        border:"none", padding:"8px 12px", fontSize:12, color:C.text, textAlign:"left", cursor:"pointer"
                      }}
                    >
                      <Send size={14} style={{ color:C.textMid }} />
                      Message
                    </button>
                    <button
                      disabled={t.open === 0}
                      onClick={() => pullNextConversation(t.id)}
                      style={{
                        display:"flex", alignItems:"center", gap:8, width:"100%", background:"none",
                        border:"none", padding:"8px 12px", fontSize:12, color:t.open === 0 ? C.textDim : C.text,
                        textAlign:"left", cursor:t.open === 0 ? "not-allowed" : "pointer"
                      }}
                    >
                      <CheckSquare size={14} style={{ color:C.textMid }} />
                      Pull conversation
                    </button>
                  </div>
                </>
              )}
            </div>
          </li>
        ))}
      </ul>
    </Card>
  );
}

function TopPages() {
  return (
    <Card title="Top Pages" subtitle="First page in session, ranked by visits">
      <table style={{ width:"100%", borderCollapse:"collapse", fontSize:13, marginTop:4 }}>
        <thead>
          <tr style={{ borderBottom:`1px solid ${C.border}`, color:C.textMid, textAlign:"left" }}>
            <th style={{ padding:"8px 4px", fontWeight:500 }}>Path</th>
            <th style={{ padding:"8px 4px", fontWeight:500, textAlign:"right" }}>Visits</th>
            <th style={{ padding:"8px 4px", fontWeight:500, textAlign:"right" }}>Delta</th>
          </tr>
        </thead>
        <tbody>
          {topPagesData.map((row, i) => (
            <tr key={i} style={{ borderBottom: i === topPagesData.length - 1 ? "none" : `1px solid ${C.border}` }}>
              <td style={{ padding:"10px 4px", color:C.text, fontFamily:C.mono, fontSize:12 }}>{row.path}</td>
              <td style={{ padding:"10px 4px", color:C.text, textAlign:"right", fontFamily:C.mono }}>{row.visits.toLocaleString()}</td>
              <td style={{ padding:"10px 4px", textAlign:"right" }}>
                <Delta value={row.delta}>
                  <DeltaIcon variant="chevron" />
                  <DeltaValue precision={1} suffix="%" />
                </Delta>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </Card>
  );
}

function TopCountries() {
  return (
    <Card title="Top Countries" subtitle="Visitor breakdown by country in the last 12 months">
      <div style={{ display:"flex", flexDirection:"column", gap:14, padding:"4px 0" }}>
        {topCountriesData.map((c, i) => (
          <div key={i} style={{ display:"grid", gridTemplateColumns:"24px 120px 1fr 40px", alignItems:"center", gap:10 }}>
            <span style={{ fontSize:16 }}>{c.flag}</span>
            <span style={{ fontSize:13, color:C.text }}>{c.country}</span>
            <div style={{ height:6, background:C.border, borderRadius:99, overflow:"hidden" }}>
              <div style={{ height:"100%", width:`${c.pct}%`, background:C.blue, borderRadius:99 }} />
            </div>
            <span style={{ fontSize:12, fontWeight:600, color:C.text, textAlign:"right" }}>{c.pct}%</span>
          </div>
        ))}
      </div>
    </Card>
  );
}

function TopReferrers() {
  return (
    <Card title="Top Referrers" subtitle="Top incoming referral domains">
      <div style={{ padding:"4px 0" }}>
        <ShareBarList>
          {topReferrersData.map((r, i) => (
            <ShareBarListItem key={i} value={r.share} style={{ height:38, padding:"0 8px" }}>
              <ShareBarListContent style={{ fontSize:12 }}>
                <ShareBarListLabel>{r.source}</ShareBarListLabel>
                <ShareBarListValue>{r.share}%</ShareBarListValue>
              </ShareBarListContent>
              <ShareBarListFill color={C.blue} />
            </ShareBarListItem>
          ))}
        </ShareBarList>
      </div>
    </Card>
  );
}

function TrafficSourcesChart() {
  return (
    <Card title="Traffic Sources" subtitle="Visitor channels by percentage">
      <div style={{ display:"flex", flexDirection:"column", gap:14, paddingTop:10 }}>
        {trafficSourcesData.map((s, i) => (
          <div key={i} style={{ display:"grid", gridTemplateColumns:"120px 1fr 40px", alignItems:"center", gap:12 }}>
            <span style={{ fontSize:12, color:C.textMid }}>{s.name}</span>
            <div style={{ height:8, background:C.border, borderRadius:99, overflow:"hidden" }}>
              <div style={{ height:"100%", width:`${s.value}%`, background:s.color, borderRadius:99 }} />
            </div>
            <span style={{ fontSize:12, fontWeight:600, color:C.text, textAlign:"right" }}>{s.value}%</span>
          </div>
        ))}
      </div>
    </Card>
  );
}

function WebVitals() {
  return (
    <Card title="Core Web Vitals" subtitle="Real user monitoring (RUM) performance">
      <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:12, marginTop:4 }}>
        {webVitalsData.map((v, i) => (
          <div key={i} style={{
            background:C.base, border:`1px solid ${C.border}`, borderRadius:8,
            padding:12, display:"flex", flexDirection:"column", gap:6
          }}>
            <div style={{ fontSize:11, color:C.textMid, fontWeight:500, textOverflow:"ellipsis", overflow:"hidden", whiteSpace:"nowrap" }}>{v.metric}</div>
            <div style={{ display:"flex", alignItems:"baseline", justifyContent:"space-between" }}>
              <span style={{ fontSize:18, fontWeight:700, color:C.text, fontFamily:C.mono }}>{v.value}</span>
              <Badge status={v.status} label={v.status === "green" ? "Good" : "Needs Review"} />
            </div>
            <div style={{ fontSize:10, color:C.textDim }}>Target {v.target}</div>
          </div>
        ))}
      </div>
    </Card>
  );
}

// ─── Digital Analytics Pages ──────────────────────────────────────────────────
function WebTrafficPage() {
  return (
    <div style={{ display:"flex", flexDirection:"column", gap:24 }}>
      <div style={{ display:"grid", gridTemplateColumns:"1.5fr 1fr", gap:16 }}>
        <VisitorsChart />
        <OnlineNow />
      </div>
      <div style={{ display:"grid", gridTemplateColumns:"repeat(3, 1fr)", gap:16 }}>
        <TrafficSourcesChart />
        <AudienceMix />
        <BrowserShare />
      </div>
      <div style={{ display:"grid", gridTemplateColumns:"1.2fr 1fr 1fr", gap:16 }}>
        <TopPages />
        <TopReferrers />
        <TopCountries />
      </div>
    </div>
  );
}

// ─── Animated Counter ─────────────────────────────────────────────────────────
function AnimatedCounter({ value, decimals = 0, suffix = "" }) {
  const [displayed, setDisplayed] = React.useState(value);
  const prev = React.useRef(value);
  React.useEffect(() => {
    const start = prev.current;
    const end = value;
    const duration = 900;
    const startTime = performance.now();
    const frame = (now) => {
      const progress = Math.min((now - startTime) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setDisplayed(start + (end - start) * eased);
      if (progress < 1) requestAnimationFrame(frame);
      else prev.current = end;
    };
    requestAnimationFrame(frame);
  }, [value]);
  const formatted = decimals > 0
    ? displayed.toFixed(decimals)
    : Math.round(displayed).toLocaleString();
  return <span>{formatted}{suffix}</span>;
}

// ─── Live Sparkline ───────────────────────────────────────────────────────────
function LiveSparkline({ data, color, width = 200, height = 48 }) {
  const max = Math.max(...data, 1);
  const min = Math.min(...data);
  const pts = data.map((v, i) => {
    const x = (i / (data.length - 1)) * width;
    const y = height - ((v - min) / (max - min || 1)) * height;
    return `${x.toFixed(1)},${y.toFixed(1)}`;
  }).join(" ");
  const pathD = `M ${pts.split(" ").join(" L ")}`;
  return (
    <svg width={width} height={height} style={{ overflow: "visible" }}>
      <motion.path
        key={pathD}
        d={pathD}
        fill="none"
        stroke={color}
        strokeWidth={2.5}
        strokeLinecap="round"
        strokeLinejoin="round"
        initial={{ pathLength: 0, opacity: 0 }}
        animate={{ pathLength: 1, opacity: 1 }}
        transition={{ duration: 0.7, ease: "easeOut" }}
      />
      {/* Zero baseline */}
      <line x1={0} y1={height} x2={width} y2={height} stroke={C.border} strokeWidth={1} />
    </svg>
  );
}

// ─── Live Stat Card ───────────────────────────────────────────────────────────
function LiveStatCard({ label, value, suffix, decimals, delta, sparkData, color, accent }) {
  const isUp = delta >= 0;
  return (
    <div style={{
      background: C.surface, border: `1px solid ${C.border}`, borderRadius: 12,
      padding: "20px 22px", display: "flex", flexDirection: "column", gap: 10,
      position: "relative", overflow: "hidden"
    }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
        <div>
          <div style={{ fontSize: 11, color: C.textMid, fontWeight: 500, letterSpacing: "0.05em", textTransform: "uppercase", marginBottom: 6 }}>{label}</div>
          <div style={{ fontSize: 36, fontWeight: 800, color: C.text, fontFamily: C.mono, lineHeight: 1 }}>
            <AnimatedCounter value={value} suffix={suffix} decimals={decimals} />
          </div>
        </div>
        <div style={{
          display: "flex", alignItems: "center", gap: 4,
          background: isUp ? C.greenFaint : C.redFaint,
          color: isUp ? C.green : C.red,
          borderRadius: 99, padding: "4px 10px", fontSize: 12, fontWeight: 700, fontFamily: C.mono
        }}>
          {isUp ? "↑" : "↓"} {Math.abs(delta).toFixed(1)}%
        </div>
      </div>
      <LiveSparkline data={sparkData} color={accent || color} width={200} height={40} />
      <div style={{
        position: "absolute", bottom: 0, left: 0, right: 0, height: 3,
        background: accent, borderRadius: "0 0 12px 12px", opacity: 0.7
      }} />
    </div>
  );
}

// ─── Live Queue Page ──────────────────────────────────────────────────────────
function LiveQueuePage() {
  const TICK_MS = 2500;
  const SPARK_LEN = 14;

  const seed = (base, noise) => base + (Math.random() - 0.5) * noise;

  const [epm,  setEpm]  = React.useState(342);
  const [wait, setWait] = React.useState(1.8);
  const [sla,  setSla]  = React.useState(98.2);
  const [chats,setChats]= React.useState(33);

  const [epmSpark,   setEpmSpark]   = React.useState(() => Array.from({length: SPARK_LEN}, (_, i) => 300 + i * 4));
  const [waitSpark,  setWaitSpark]  = React.useState(() => Array.from({length: SPARK_LEN}, () => seed(1.8, 0.5)));
  const [slaSpark,   setSlaSpark]   = React.useState(() => Array.from({length: SPARK_LEN}, () => seed(98, 1)));
  const [chatsSpark, setChatsSpark] = React.useState(() => Array.from({length: SPARK_LEN}, () => Math.round(seed(33, 8))));

  const [epmDelta,  setEpmDelta]  = React.useState(4.2);
  const [waitDelta, setWaitDelta] = React.useState(-2.1);
  const [slaDelta,  setSlaDelta]  = React.useState(0.3);
  const [chatsDelta,setChatsDelta]= React.useState(6.1);

  const [tick, setTick] = React.useState(0);

  React.useEffect(() => {
    const id = setInterval(() => setTick(t => t + 1), TICK_MS);
    return () => clearInterval(id);
  }, []);

  React.useEffect(() => {
    const newEpm   = Math.max(200, Math.round(seed(epm, 40)));
    const newWait  = Math.max(0.5, parseFloat(seed(wait, 0.6).toFixed(1)));
    const newSla   = Math.min(100, Math.max(94, parseFloat(seed(sla, 1).toFixed(1))));
    const newChats = Math.max(10, Math.round(seed(chats, 10)));

    setEpmDelta(parseFloat(((newEpm - epm) / epm * 100).toFixed(1)));
    setWaitDelta(parseFloat(((newWait - wait) / wait * 100).toFixed(1)));
    setSlaDelta(parseFloat(((newSla - sla) / sla * 100).toFixed(1)));
    setChatsDelta(parseFloat(((newChats - chats) / chats * 100).toFixed(1)));

    setEpm(newEpm);
    setWait(newWait);
    setSla(newSla);
    setChats(newChats);

    setEpmSpark(s   => [...s.slice(1), newEpm]);
    setWaitSpark(s  => [...s.slice(1), newWait]);
    setSlaSpark(s   => [...s.slice(1), newSla]);
    setChatsSpark(s => [...s.slice(1), newChats]);
  }, [tick]);

  return (
    <div style={{ display:"flex", flexDirection:"column", gap:24 }}>
      {/* Live header */}
      <div style={{ display:"flex", alignItems:"center", gap:10 }}>
        <motion.span
          animate={{ opacity: [1, 0.2, 1] }}
          transition={{ repeat: Infinity, duration: 1.4, ease: "easeInOut" }}
          style={{ width:10, height:10, borderRadius:"50%", background:"#16A34A", display:"inline-block" }}
        />
        <span style={{ fontSize:13, color:C.green, fontWeight:600, letterSpacing:"0.05em" }}>LIVE — updating every 2.5s</span>
      </div>

      {/* 4 live stat cards */}
      <div style={{ display:"grid", gridTemplateColumns:"repeat(2, 1fr)", gap:16 }}>
        <LiveStatCard label="Events Per Minute" value={epm} suffix="" decimals={0} delta={epmDelta} sparkData={epmSpark} accent={C.blue} />
        <LiveStatCard label="Avg Wait Time" value={wait} suffix=" min" decimals={1} delta={waitDelta} sparkData={waitSpark} accent={C.amber} />
        <LiveStatCard label="SLA Compliance" value={sla} suffix="%" decimals={1} delta={slaDelta} sparkData={slaSpark} accent={C.green} />
        <LiveStatCard label="Active Chats" value={chats} suffix="" decimals={0} delta={chatsDelta} sparkData={chatsSpark} accent="#6366F1" />
      </div>

      {/* Team and queue details */}
      <div style={{ display:"grid", gridTemplateColumns:"1.4fr 1fr", gap:16 }}>
        <TeamOnDuty />
        <Card title="Queue Health" subtitle="Last 60 seconds snapshot">
          <div style={{ display:"flex", flexDirection:"column", gap:14, marginTop:8 }}>
            {[
              { label:"Resolved tickets", val: Math.round(epm * 0.4), color: C.green },
              { label:"Escalated tickets", val: Math.round(epm * 0.05), color: C.red },
              { label:"In-progress", val: Math.round(epm * 0.55), color: C.blue },
            ].map((row, i) => (
              <div key={i} style={{ display:"flex", justifyContent:"space-between", alignItems:"center" }}>
                <div style={{ display:"flex", alignItems:"center", gap:8 }}>
                  <span style={{ width:8, height:8, borderRadius:"50%", background: row.color }} />
                  <span style={{ fontSize:13, color:C.textMid }}>{row.label}</span>
                </div>
                <span style={{ fontFamily:C.mono, fontWeight:700, color:C.text, fontSize:14 }}>
                  <AnimatedCounter value={row.val} />
                </span>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
}

function WebVitalsPage() {
  return (
    <div style={{ display:"flex", flexDirection:"column", gap:20 }}>
      <WebVitals />
      <Card title="RUM Performance Over Time" subtitle="Synthetic audits & performance health metrics">
        <div style={{ height:200 }}>
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={visitorChartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#1E293B" vertical={false} />
              <XAxis dataKey="month" tick={{ fontSize:11, fill:C.textMid }} />
              <YAxis domain={[0, 100]} tick={{ fontSize:11, fill:C.textMid }} />
              <Tooltip contentStyle={{ background:"#111827", border:"1px solid #1E293B", color:"#fff" }} />
              <Line type="monotone" dataKey="visitors" stroke={C.blue} strokeWidth={2} dot={false} name="Perf Score %" />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </Card>
    </div>
  );
}

function SupportTeamPage() {
  return (
    <div style={{ display:"flex", flexDirection:"column", gap:20 }}>
      <TeamOnDuty />
    </div>
  );
}

// ─── Combined Mode Page ───────────────────────────────────────────────────────
function CombinedOverviewPage() {
  return (
    <div style={{ display:"flex", flexDirection:"column", gap:24 }}>
      {/* Mixed physical & digital summary cards */}
      <div style={{ display:"grid", gridTemplateColumns:"repeat(4, 1fr)", gap:16 }}>
        <KpiCard label="Facility Workforce" value="891 staff" change="12 vs last month" changeUp accent={C.blue} />
        <KpiCard label="Online Visitors" value="94 users" change="14.8% up now" changeUp accent={C.green} />
        <KpiCard label="Monthly Revenue" value="₹1.84 Cr" change="3.4% vs last month" changeUp accent={C.green} />
        <KpiCard label="System Performance" value="92 / 100" change="Core Web Vitals Good" changeUp accent={C.blue} />
      </div>

      <div style={{ display:"grid", gridTemplateColumns:"1.4fr 1fr", gap:16 }}>
        <Card title="Combined Revenue & Traffic" subtitle="Revenue trends & website visitor correlation">
          <div style={{ height:200 }}>
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={visitorChartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1E293B" />
                <XAxis dataKey="month" tick={{ fontSize:11, fill:C.textMid }} />
                <YAxis tick={{ fontSize:11, fill:C.textMid }} />
                <Tooltip contentStyle={{ background:"#111827", border:"1px solid #1E293B", color:"#fff" }} />
                <Line type="monotone" dataKey="visitors" stroke={C.blue} strokeWidth={2} name="Web Visitors" />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </Card>
        <TeamOnDuty />
      </div>

      <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:16 }}>
        <Card title="Active Alerts" subtitle="Facility events needing attention">
          <div style={{ display:"flex", flexDirection:"column", gap:10 }}>
            {alerts.map((a, i) => <AlertItem key={i} {...a} />)}
          </div>
        </Card>
        <WebVitals />
      </div>
    </div>
  );
}

// ─── Data Ingestion Page Component ───────────────────────────────────────────
function DataIngestionPage({ onIngestData }) {
  const [file, setFile] = useState(null);
  const [parsedRows, setParsedRows] = useState([]);
  const [headers, setHeaders] = useState([]);
  const [targetDataset, setTargetDataset] = useState("revCost");
  const [isDragOver, setIsDragOver] = useState(false);
  const [statusMsg, setStatusMsg] = useState(null);
  const [ingestLogs, setIngestLogs] = useState([
    { id: 1, name: "q2_financials_final.csv", target: "Revenue & Profit Trends", rows: 6, time: "Today, 18:42", status: "Success" },
    { id: 2, name: "north_zone_shifts_aug.csv", target: "Zone Guard Allocation", rows: 4, time: "Yesterday, 11:15", status: "Success" }
  ]);

  const handleFileSelect = (selectedFile) => {
    if (!selectedFile) return;
    setFile(selectedFile);
    setStatusMsg(null);

    const reader = new FileReader();
    reader.onload = (e) => {
      const text = e.target.result;
      parseCSV(text);
    };
    reader.readAsText(selectedFile);
  };

  const parseCSV = (csvText) => {
    const lines = csvText.split(/\r\n|\n/).filter(line => line.trim() !== "");
    if (lines.length === 0) return;

    const parsedHeaders = lines[0].split(",").map(h => h.trim().replace(/^"|"$/g, ''));
    const rows = lines.slice(1).map(line => {
      const values = line.split(",").map(v => v.trim().replace(/^"|"$/g, ''));
      const rowObj = {};
      parsedHeaders.forEach((h, idx) => {
        rowObj[h] = values[idx] || "";
      });
      return rowObj;
    });

    setHeaders(parsedHeaders);
    setParsedRows(rows);
  };

  const downloadSampleCSV = (type) => {
    let content = "";
    let filename = "";
    if (type === "revCost") {
      filename = "sample_revenue_cost.csv";
      content = "month,Revenue,Cost,Profit\nJul,195,142,53\nAug,210,148,62\nSep,225,152,73\nOct,240,160,80";
    } else if (type === "alerts") {
      filename = "sample_alerts.csv";
      content = "level,tag,msg\ncritical,Security Breach,Unverified entry reported at East Perimeter Gate 3.\nwarning,Attendance Drop,South Zone shift coverage dropped to 88% due to transport delay.\nwarning,Equipment Defect,CCTV Sensor #14 offline for maintenance.";
    } else if (type === "zones") {
      filename = "sample_zone_roster.csv";
      content = "zone,posts,cov,tag\nCentral Hub Zone,35 / 35,100%,Optimal\nNorth Industrial,42 / 45,93%,Good\nWest Commercial,18 / 24,75%,Understaffed";
    }

    const blob = new Blob([content], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleApplyIngestion = () => {
    if (parsedRows.length === 0) return;

    onIngestData(targetDataset, parsedRows);

    const targetLabel = targetDataset === "revCost" ? "Revenue & Profit Trends" : targetDataset === "alerts" ? "Active Operational Alerts" : "Zone Guard Allocation";

    setIngestLogs(prev => [
      {
        id: Date.now(),
        name: file ? file.name : "custom_ingested.csv",
        target: targetLabel,
        rows: parsedRows.length,
        time: new Date().toLocaleTimeString("en-IN", { hour12: false }),
        status: "Success"
      },
      ...prev
    ]);

    setStatusMsg({ type: "success", text: `Successfully ingested ${parsedRows.length} records into ${targetLabel}!` });
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
      <Card title="Data Ingestion & CSV Batch Upload" subtitle="Upload spreadsheets to update live dashboard charts and KPIs in real-time">
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 16, flexWrap: "wrap" }}>
          <div style={{ fontSize: 13, color: C.textMid, maxWidth: 500, lineHeight: 1.5 }}>
            Upload customer CSV spreadsheets to dynamically re-populate financial graphs, alert feeds, or guard roster tables across the entire command center.
          </div>
          <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
            <button
              onClick={() => downloadSampleCSV("revCost")}
              style={{ background: C.base, border: `1px solid ${C.border}`, color: C.text, padding: "8px 12px", borderRadius: 6, fontSize: 12, fontWeight: 500, cursor: "pointer", display: "flex", alignItems: "center", gap: 6 }}
            >
              📥 Revenue Sample CSV
            </button>
            <button
              onClick={() => downloadSampleCSV("alerts")}
              style={{ background: C.base, border: `1px solid ${C.border}`, color: C.text, padding: "8px 12px", borderRadius: 6, fontSize: 12, fontWeight: 500, cursor: "pointer", display: "flex", alignItems: "center", gap: 6 }}
            >
              📥 Alerts Sample CSV
            </button>
            <button
              onClick={() => downloadSampleCSV("zones")}
              style={{ background: C.base, border: `1px solid ${C.border}`, color: C.text, padding: "8px 12px", borderRadius: 6, fontSize: 12, fontWeight: 500, cursor: "pointer", display: "flex", alignItems: "center", gap: 6 }}
            >
              📥 Zone Roster CSV
            </button>
          </div>
        </div>
      </Card>

      <div style={{ display: "grid", gridTemplateColumns: "1.2fr 1fr", gap: 16 }}>
        <Card title="1. Select or Drag CSV File" subtitle="Supported formats: .csv, .txt (Comma separated values)">
          <div
            onDragOver={(e) => { e.preventDefault(); setIsDragOver(true); }}
            onDragLeave={() => setIsDragOver(false)}
            onDrop={(e) => {
              e.preventDefault();
              setIsDragOver(false);
              if (e.dataTransfer.files && e.dataTransfer.files[0]) {
                handleFileSelect(e.dataTransfer.files[0]);
              }
            }}
            style={{
              border: `2px dashed ${isDragOver ? C.blue : C.borderLight}`,
              borderRadius: 10,
              padding: "36px 20px",
              textAlign: "center",
              background: isDragOver ? C.blueFaint : C.base,
              transition: "all 0.2s ease",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              gap: 12,
              cursor: "pointer"
            }}
            onClick={() => document.getElementById("csvInput").click()}
          >
            <input
              id="csvInput"
              type="file"
              accept=".csv, .txt"
              style={{ display: "none" }}
              onChange={(e) => e.target.files && handleFileSelect(e.target.files[0])}
            />
            <div style={{ width: 48, height: 48, borderRadius: "50%", background: C.surface, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 22, color: C.blue, border: `1px solid ${C.border}` }}>
              📂
            </div>
            <div>
              <div style={{ fontSize: 14, fontWeight: 600, color: C.text }}>
                {file ? file.name : "Click to browse or drop CSV file here"}
              </div>
              <div style={{ fontSize: 11, color: C.textDim, marginTop: 4 }}>
                {file ? `${(file.size / 1024).toFixed(1)} KB • ${parsedRows.length} rows detected` : "Maximum file size 10MB"}
              </div>
            </div>
          </div>
        </Card>

        <Card title="2. Map Target & Ingest" subtitle="Choose which dashboard section to update">
          <div style={{ display: "flex", flexDirection: "column", gap: 16, height: "100%", justifyContent: "space-between" }}>
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              <label style={{ fontSize: 12, fontWeight: 600, color: C.textMid }}>Select Target Dataset:</label>
              <select
                value={targetDataset}
                onChange={(e) => setTargetDataset(e.target.value)}
                style={{
                  background: C.base, border: `1px solid ${C.border}`, color: C.text,
                  padding: "10px 12px", borderRadius: 8, fontSize: 13, outline: "none"
                }}
              >
                <option value="revCost">Revenue & Cost Financial Trend (Line Chart)</option>
                <option value="alerts">Active Operational Alerts Feed</option>
                <option value="zones">Zone Guard Deployment Roster</option>
              </select>

              <div style={{ background: C.base, border: `1px solid ${C.border}`, borderRadius: 8, padding: 12, fontSize: 12, color: C.textMid, lineHeight: 1.5, marginTop: 4 }}>
                <span style={{ color: C.blue, fontWeight: 600 }}>Schema Requirement:</span>
                {targetDataset === "revCost" && " Requires columns: month, Revenue, Cost, Profit (e.g. Jul, 195, 142, 53)"}
                {targetDataset === "alerts" && " Requires columns: level, tag, msg (e.g. critical, SLA, West Zone breach)"}
                {targetDataset === "zones" && " Requires columns: zone, posts, cov, tag (e.g. West Zone, 22 / 26, 85%, Understaffed)"}
              </div>
            </div>

            {statusMsg && (
              <div style={{
                padding: "10px 12px", borderRadius: 6, fontSize: 12, fontWeight: 600,
                background: statusMsg.type === "success" ? C.greenFaint : C.redFaint,
                color: statusMsg.type === "success" ? C.green : C.red,
                border: `1px solid ${statusMsg.type === "success" ? C.green + '40' : C.red + '40'}`
              }}>
                {statusMsg.text}
              </div>
            )}

            <button
              onClick={handleApplyIngestion}
              disabled={parsedRows.length === 0}
              style={{
                background: parsedRows.length > 0 ? C.blue : C.border,
                color: parsedRows.length > 0 ? "#fff" : C.textDim,
                border: "none", borderRadius: 8, padding: "12px 16px",
                fontSize: 13, fontWeight: 700, cursor: parsedRows.length > 0 ? "pointer" : "not-allowed",
                transition: "all 0.2s ease"
              }}
            >
              🚀 Ingest {parsedRows.length > 0 ? `${parsedRows.length} Records` : "Data"} into Dashboard
            </button>
          </div>
        </Card>
      </div>

      {parsedRows.length > 0 && (
        <Card title={`Parsed Preview (${parsedRows.length} Records)`} subtitle="First 10 rows extracted from uploaded file">
          <div style={{ overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 12, textAlign: "left" }}>
              <thead>
                <tr style={{ background: C.base, borderBottom: `1px solid ${C.border}` }}>
                  {headers.map((h, i) => (
                    <th key={i} style={{ padding: "10px 14px", color: C.blue, textTransform: "uppercase", fontSize: 10, letterSpacing: 0.5 }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {parsedRows.slice(0, 10).map((row, rIdx) => (
                  <tr key={rIdx} style={{ borderBottom: `1px solid ${C.border}` }}>
                    {headers.map((h, cIdx) => (
                      <td key={cIdx} style={{ padding: "10px 14px", color: C.text, fontFamily: C.mono }}>{row[h]}</td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}

      <Card title="Ingestion History & Audit Trail" subtitle="Recent data imports performed in this session">
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          {ingestLogs.map((log) => (
            <div key={log.id} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "10px 14px", background: C.base, borderRadius: 6, border: `1px solid ${C.border}`, fontSize: 12 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                <span style={{ fontSize: 16 }}>📄</span>
                <div>
                  <div style={{ fontWeight: 600, color: C.text }}>{log.name}</div>
                  <div style={{ fontSize: 11, color: C.textMid, marginTop: 2 }}>Target: {log.target} • {log.rows} records</div>
                </div>
              </div>
              <div style={{ textAlign: "right" }}>
                <span style={{ color: C.green, fontWeight: 600, display: "block" }}>{log.status}</span>
                <span style={{ fontSize: 10, color: C.textDim, fontFamily: C.mono }}>{log.time}</span>
              </div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}

export default function KEDGEDashboard() {
  const [loading, setLoading] = useState(true);
  const [role, setRole] = useState("owner"); // "owner" | "staff"
  const [activePage, setActivePage] = useState("overview");
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  // Dynamic datasets for Ingestion Module
  const [liveRevCostData, setLiveRevCostData] = useState(revCostData);
  const [liveAlertsData, setLiveAlertsData] = useState(alerts);
  const [liveZoneRowsData, setLiveZoneRowsData] = useState(zoneRows);

  const handleIngestData = (targetDataset, rows) => {
    if (targetDataset === "revCost") {
      const formatted = rows.map(r => ({
        month: r.month || r.Month || "New",
        Revenue: Number(r.Revenue) || 0,
        Cost: Number(r.Cost) || 0,
        Profit: Number(r.Profit) || 0,
      }));
      setLiveRevCostData(formatted);
    } else if (targetDataset === "alerts") {
      const formatted = rows.map(r => ({
        level: r.level || "warning",
        tag: r.tag || "Custom Alert",
        msg: r.msg || r.message || "Ingested security event."
      }));
      setLiveAlertsData(formatted);
    } else if (targetDataset === "zones") {
      const formatted = rows.map(r => ({
        zone: r.zone || "New Zone",
        posts: r.posts || "10 / 10",
        cov: r.cov || "100%",
        status: (r.tag || "").toLowerCase().includes("under") ? "red" : "green",
        tag: r.tag || "Active"
      }));
      setLiveZoneRowsData(formatted);
    }
  };

  // Guarantee loading screen dismissal after initial mount
  useEffect(() => {
    const loaderTimer = setTimeout(() => {
      setLoading(false);
    }, 1200);
    return () => clearTimeout(loaderTimer);
  }, []);

  // Keep active page valid when switching roles
  useEffect(() => {
    if (role === "staff") {
      if (!staffNavItems.some(i => i.id === activePage)) {
        setActivePage("staff_overview");
      }
    } else {
      if (activePage === "staff_overview" || activePage === "attendance" || activePage === "payslips" || activePage === "tasks" || activePage === "notices") {
        setActivePage("overview");
      }
    }
  }, [role]);

  const pages = {
    // Owner / Management Views
    overview:       { label: "Owner Command Center", Component: () => <OverviewPage revCost={liveRevCostData} alertsList={liveAlertsData} /> },
    security:       { label: "Security Operations & Post Coverage", Component: SecurityPage },
    housekeeping:   { label: "Housekeeping Operations & Audits", Component: HousekeepingPage },
    payroll:        { label: "Payroll & Statutory Disbursals", Component: PayrollPage },
    vendors:        { label: "Vendors & Contract Compliance", Component: VendorsPage },
    financials:     { label: "Financial Snapshot & Margin Analysis", Component: FinancialsPage },
    
    // Digital Ops Views
    dataingestion:  { label: "Data Ingestion & CSV Import Hub", Component: () => <DataIngestionPage onIngestData={handleIngestData} /> },
    webtraffic:     { label: "Web Traffic Analytics", Component: WebTrafficPage },
    livequeue:      { label: "Live Queue & Support Metrics", Component: LiveQueuePage },
    webvitals:      { label: "Core Web Vitals RUM", Component: WebVitalsPage },
    supportteam:    { label: "Support Team Shift Queue", Component: SupportTeamPage },

    // Staff / Worker Views
    staff_overview: { label: "My Staff Portal Dashboard", Component: StaffOverviewPage },
    attendance:     { label: "My Attendance & Shift Roster", Component: StaffOverviewPage },
    payslips:       { label: "My Salary & Payslip Documents", Component: StaffOverviewPage },
    tasks:          { label: "My Assigned Post Tasks", Component: StaffOverviewPage },
    notices:        { label: "Company Notices & Guidelines", Component: StaffOverviewPage },
  };

  const { label, Component } = pages[activePage] || (role === "staff" ? pages["staff_overview"] : pages["overview"]);

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&family=IBM+Plex+Mono:wght@400;500;600&display=swap');
        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
        body { background: #09090B; }
        button { font-family: 'Inter', sans-serif; }
        ::-webkit-scrollbar { width: 5px; }
        ::-webkit-scrollbar-track { background: #0A0F1E; }
        ::-webkit-scrollbar-thumb { background: #1E293B; border-radius: 3px; }
        
        @keyframes ping {
          75%, 100% {
            transform: scale(2.2);
            opacity: 0;
          }
        }
      `}</style>

      <AnimatePresence>
        {loading && (
          <motion.div
            key="kedge-loader"
            initial={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.8, ease: "easeInOut" }}
            style={{ position: "fixed", inset: 0, zIndex: 99999 }}
          >
            <LoadingScreen onComplete={() => setLoading(false)} duration={3000} />
          </motion.div>
        )}
      </AnimatePresence>

      <div style={{ display:"flex", minHeight:"100vh", background:C.base, fontFamily:C.sans, color:C.text }}>
        <Sidebar active={activePage} onSelect={setActivePage} role={role} collapsed={sidebarCollapsed} onToggle={() => setSidebarCollapsed(!sidebarCollapsed)} />
        <motion.div 
          animate={{ marginLeft: sidebarCollapsed ? 80 : 220 }}
          transition={{ type: "spring", stiffness: 300, damping: 30 }}
          style={{ flex:1, display:"flex", flexDirection:"column" }}
        >
          <Header label={label} role={role} setRole={setRole} />
          <main style={{ padding:"24px 28px 48px", flex:1, position: "relative" }}>
            <AnimatePresence mode="wait">
              <motion.div
                key={activePage}
                initial={{ opacity: 0, scale: 0.97, y: 20, filter: "blur(8px)" }}
                animate={{ opacity: 1, scale: 1, y: 0, filter: "blur(0px)" }}
                exit={{ opacity: 0, scale: 1.03, y: -20, filter: "blur(8px)" }}
                transition={{ type: "spring", stiffness: 300, damping: 25, mass: 0.8 }}
                style={{ width: "100%", height: "100%" }}
              >
                <Component />
              </motion.div>
            </AnimatePresence>
          </main>
        </motion.div>
      </div>
    </>
  );
}
