import { useState } from "react";
import { cn } from "@/lib/utils";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  RadarChart,
  RadarGrid,
  RadarAxis,
  RadarLabels,
  RadarArea,
} from "@/components/ui/radar-chart";

// ─── Vendor Metrics ─────────────────────────────────────────────────────────
const vendorMetrics = [
  { key: "quality",     label: "Quality"     },
  { key: "delivery",   label: "Delivery"    },
  { key: "pricing",    label: "Pricing"     },
  { key: "support",    label: "Support"     },
  { key: "reliability",label: "Reliability" },
];

// ─── Vendor Data ─────────────────────────────────────────────────────────────
const vendorData = [
  {
    label: "Northwind Labs",
    color: "var(--chart-1)",
    values: { quality: 88, delivery: 75, pricing: 65, support: 90, reliability: 82 },
  },
  {
    label: "Blue River Co.",
    color: "var(--chart-2)",
    values: { quality: 72, delivery: 92, pricing: 80, support: 68, reliability: 77 },
  },
  {
    label: "Harbor Freight",
    color: "var(--chart-3)",
    values: { quality: 65, delivery: 60, pricing: 95, support: 72, reliability: 70 },
  },
];

// ─── Legend Item ─────────────────────────────────────────────────────────────
function LegendItem({ label, color, isHovered, isFaded, onEnter, onLeave }) {
  return (
    <button
      className={cn(
        "flex items-center gap-2 rounded-md px-2 py-1 text-sm transition-all",
        isHovered ? "bg-muted" : "",
        isFaded ? "opacity-40" : "opacity-100"
      )}
      onMouseEnter={onEnter}
      onMouseLeave={onLeave}
    >
      <span
        className="h-2.5 w-2.5 shrink-0 rounded-full"
        style={{ background: color }}
      />
      {label}
    </button>
  );
}

// ─── VendorRadarChart ─────────────────────────────────────────────────────────
export function VendorRadarChart({ className, ...props }) {
  const [hoveredIndex, setHoveredIndex] = useState(null);

  return (
    <Card
      className={cn("md:col-span-2 lg:col-span-2 shadow-none", className)}
      {...props}
    >
      <CardHeader>
        <CardTitle>Vendor Performance</CardTitle>
        <CardDescription>
          Comparing top vendors across 5 key metrics
        </CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col items-center gap-4">
        <RadarChart
          data={vendorData}
          metrics={vendorMetrics}
          levels={5}
          margin={56}
          animate
          hoveredIndex={hoveredIndex}
          onHoverChange={setHoveredIndex}
          className="max-w-xs"
        >
          <RadarGrid showLabels={false} />
          <RadarAxis />
          <RadarLabels offset={20} fontSize={11} />
          {vendorData.map((_, i) => (
            <RadarArea key={i} index={i} showPoints showGlow />
          ))}
        </RadarChart>

        {/* Legend */}
        <div className="flex flex-wrap justify-center gap-1">
          {vendorData.map((v, i) => (
            <LegendItem
              key={v.label}
              label={v.label}
              color={v.color}
              isHovered={hoveredIndex === i}
              isFaded={hoveredIndex !== null && hoveredIndex !== i}
              onEnter={() => setHoveredIndex(i)}
              onLeave={() => setHoveredIndex(null)}
            />
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
