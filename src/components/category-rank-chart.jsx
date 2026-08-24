import { useState } from "react";
import { cn } from "@/lib/utils";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { PieChart, PieSlice, PieCenter } from "@/components/ui/pie-chart";

// ─── Category Data ────────────────────────────────────────────────────────────
const categoryData = [
  { label: "Electronics",  value: 4250, color: "var(--chart-1)" },
  { label: "Clothing",     value: 3120, color: "var(--chart-2)" },
  { label: "Food & Bev",  value: 2100, color: "var(--chart-3)" },
  { label: "Home & Garden",value: 1580, color: "var(--chart-4)" },
  { label: "Sports",       value: 950,  color: "var(--chart-5)" },
];

const total = categoryData.reduce((s, d) => s + d.value, 0);

function formatCurrency(v) {
  if (v >= 1000) return `$${(v / 1000).toFixed(1)}k`;
  return `$${v}`;
}

// ─── CategoryRankChart ────────────────────────────────────────────────────────
export function CategoryRankChart({ className, ...props }) {
  const [hoveredIndex, setHoveredIndex] = useState(null);

  const activeItem =
    hoveredIndex !== null ? categoryData[hoveredIndex] : null;

  return (
    <Card
      className={cn("md:col-span-2 lg:col-span-2 shadow-none", className)}
      {...props}
    >
      <CardHeader>
        <CardTitle>Category Breakdown</CardTitle>
        <CardDescription>
          Revenue share by product category
        </CardDescription>
      </CardHeader>

      <CardContent className="flex flex-col items-center gap-6 sm:flex-row sm:items-start sm:justify-center">
        {/* Donut */}
        <div className="w-48 shrink-0">
          <PieChart
            data={categoryData}
            innerRadius={52}
            padAngle={0.03}
            cornerRadius={4}
            hoveredIndex={hoveredIndex}
            onHoverChange={setHoveredIndex}
          >
            {categoryData.map((_, i) => (
              <PieSlice
                key={i}
                index={i}
                hoverEffect="translate"
                hoverOffset={8}
                showGlow
              />
            ))}
            <PieCenter prefix="$" defaultLabel="Total">
              {({ label, value }) => (
                <div className="flex flex-col items-center text-center">
                  <span className="text-xl font-bold leading-none text-foreground">
                    {formatCurrency(value)}
                  </span>
                  <span className="mt-1 text-[11px] text-muted-foreground leading-tight max-w-[80px] truncate">
                    {label}
                  </span>
                </div>
              )}
            </PieCenter>
          </PieChart>
        </div>

        {/* Legend */}
        <div className="flex flex-col gap-2 py-1">
          {categoryData.map((item, i) => {
            const pct = ((item.value / total) * 100).toFixed(1);
            const isHovered = hoveredIndex === i;
            const isFaded = hoveredIndex !== null && !isHovered;
            return (
              <button
                key={item.label}
                className={cn(
                  "flex items-center gap-3 rounded-md px-2 py-1 text-left transition-all",
                  isHovered ? "bg-muted" : "hover:bg-muted/50",
                  isFaded ? "opacity-40" : "opacity-100"
                )}
                onMouseEnter={() => setHoveredIndex(i)}
                onMouseLeave={() => setHoveredIndex(null)}
              >
                <span
                  className="h-2.5 w-2.5 shrink-0 rounded-full"
                  style={{ background: item.color }}
                />
                <span className="flex-1 text-sm font-medium">{item.label}</span>
                <span className="text-xs text-muted-foreground">
                  {formatCurrency(item.value)}
                  <span className="ml-1 text-[10px] opacity-60">({pct}%)</span>
                </span>
              </button>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
