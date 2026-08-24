import { createContext, useContext, useState, useEffect, useRef } from "react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

// ─── Context ────────────────────────────────────────────────────────────────
const PieContext = createContext(null);

function usePie() {
  const ctx = useContext(PieContext);
  if (!ctx) throw new Error("PieSlice / PieCenter must be used inside <PieChart>");
  return ctx;
}

// ─── Helpers ────────────────────────────────────────────────────────────────
const defaultColors = [
  "var(--chart-1)",
  "var(--chart-2)",
  "var(--chart-3)",
  "var(--chart-4)",
  "var(--chart-5)",
];

function polarToCartesian(cx, cy, r, angleDeg) {
  const rad = (angleDeg - 90) * (Math.PI / 180);
  return {
    x: cx + r * Math.cos(rad),
    y: cy + r * Math.sin(rad),
  };
}

function arcPath(cx, cy, outerR, innerR, startDeg, endDeg, cornerR = 0) {
  // clamp to avoid full circle SVG issues
  const sweep = Math.min(endDeg - startDeg, 359.9999);
  const largeArc = sweep > 180 ? 1 : 0;

  const os = polarToCartesian(cx, cy, outerR, startDeg);
  const oe = polarToCartesian(cx, cy, outerR, startDeg + sweep);
  const is = polarToCartesian(cx, cy, innerR, startDeg + sweep);
  const ie = polarToCartesian(cx, cy, innerR, startDeg);

  if (innerR === 0) {
    return [
      `M ${cx} ${cy}`,
      `L ${os.x} ${os.y}`,
      `A ${outerR} ${outerR} 0 ${largeArc} 1 ${oe.x} ${oe.y}`,
      "Z",
    ].join(" ");
  }

  return [
    `M ${os.x} ${os.y}`,
    `A ${outerR} ${outerR} 0 ${largeArc} 1 ${oe.x} ${oe.y}`,
    `L ${is.x} ${is.y}`,
    `A ${innerR} ${innerR} 0 ${largeArc} 0 ${ie.x} ${ie.y}`,
    "Z",
  ].join(" ");
}

function buildSlices(data, startAngle = 0, endAngle = 360, padAngleDeg = 0) {
  const total = data.reduce((s, d) => s + d.value, 0);
  const range = endAngle - startAngle;
  let cursor = startAngle;
  return data.map((d, i) => {
    const sweep = (d.value / total) * range - padAngleDeg;
    const slice = { startDeg: cursor, endDeg: cursor + sweep, midDeg: cursor + sweep / 2, value: d.value, label: d.label };
    cursor += sweep + padAngleDeg;
    return slice;
  });
}

// ─── PieChart ───────────────────────────────────────────────────────────────
export function PieChart({
  data = [],
  size,
  innerRadius = 0,
  padAngle = 0,
  cornerRadius = 0,
  startAngle = 0,
  endAngle = 360,
  hoveredIndex: controlledHovered,
  onHoverChange,
  className,
  children,
}) {
  const containerRef = useRef(null);
  const [containerSize, setContainerSize] = useState(size ?? 280);
  const [mounted, setMounted] = useState(false);
  const [internalHovered, setInternalHovered] = useState(null);

  useEffect(() => {
    setMounted(true);
    if (size) return;
    const el = containerRef.current;
    if (!el) return;
    const ro = new ResizeObserver(([entry]) => {
      const w = entry.contentRect.width;
      if (w > 0) setContainerSize(w);
    });
    ro.observe(el);
    return () => ro.disconnect();
  }, [size]);

  const isControlled = controlledHovered !== undefined;
  const hoveredIndex = isControlled ? controlledHovered : internalHovered;

  function setHoveredIndex(idx) {
    if (!isControlled) setInternalHovered(idx);
    onHoverChange?.(idx);
  }

  const svgSize = containerSize;
  const cx = svgSize / 2;
  const cy = svgSize / 2;
  const outerR = svgSize / 2 - 4;
  const innerR = innerRadius;
  const total = data.reduce((s, d) => s + d.value, 0);
  const padAngleDeg = (padAngle * 180) / Math.PI;
  const slices = buildSlices(data, startAngle, endAngle, padAngleDeg);

  return (
    <PieContext.Provider
      value={{
        data, slices, cx, cy, outerR, innerR,
        cornerRadius, total, hoveredIndex, setHoveredIndex, mounted,
      }}
    >
      <div ref={containerRef} className={cn("relative w-full", className)}>
        <svg
          width={svgSize}
          height={svgSize}
          viewBox={`0 0 ${svgSize} ${svgSize}`}
        >
          {children}
        </svg>
      </div>
    </PieContext.Provider>
  );
}

// ─── PieSlice ────────────────────────────────────────────────────────────────
export function PieSlice({
  index,
  color,
  fill,
  animate = true,
  showGlow = true,
  hoverEffect = "translate",
  hoverOffset = 8,
  className,
}) {
  const { data, slices, cx, cy, outerR, innerR, cornerRadius, hoveredIndex, setHoveredIndex, mounted } = usePie();

  const slice = slices[index];
  const item = data[index];
  if (!slice || !item) return null;

  const sliceColor = color ?? item.color ?? defaultColors[index % defaultColors.length];
  const fillVal = fill ?? sliceColor;
  const isHovered = hoveredIndex === index;
  const isFaded = hoveredIndex !== null && !isHovered;

  const d = arcPath(cx, cy, outerR, innerR, slice.startDeg, slice.endDeg, cornerRadius);

  // Translate toward midpoint for hover
  const midRad = (slice.midDeg - 90) * (Math.PI / 180);
  const tx = isHovered && hoverEffect === "translate" ? Math.cos(midRad) * hoverOffset : 0;
  const ty = isHovered && hoverEffect === "translate" ? Math.sin(midRad) * hoverOffset : 0;
  const scale = isHovered && hoverEffect === "grow" ? 1.05 : 1;

  return (
    <g
      className={cn("cursor-pointer", className)}
      onMouseEnter={() => setHoveredIndex(index)}
      onMouseLeave={() => setHoveredIndex(null)}
    >
      {/* Glow */}
      {showGlow && isHovered && (
        <motion.path
          d={d}
          fill={sliceColor}
          fillOpacity={0.3}
          stroke={sliceColor}
          strokeWidth={6}
          strokeOpacity={0.25}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.2 }}
        />
      )}

      {/* Main slice */}
      <motion.path
        d={d}
        fill={fillVal}
        fillOpacity={isFaded ? 0.35 : 1}
        stroke="var(--background)"
        strokeWidth={1.5}
        initial={animate ? { scale: 0, opacity: 0, originX: cx, originY: cy } : false}
        animate={
          mounted
            ? { scale, opacity: 1, x: tx, y: ty }
            : false
        }
        transition={{
          scale: { type: "spring", stiffness: 260, damping: 20 },
          opacity: { duration: 0.4, delay: index * 0.07 },
          x: { type: "spring", stiffness: 300, damping: 25 },
          y: { type: "spring", stiffness: 300, damping: 25 },
        }}
      />
    </g>
  );
}

// ─── PieCenter ───────────────────────────────────────────────────────────────
export function PieCenter({
  defaultLabel = "Total",
  prefix = "",
  suffix = "",
  children,
  className,
}) {
  const { cx, cy, innerR, data, hoveredIndex, total } = usePie();
  if (!innerR) return null;

  const activeItem = hoveredIndex !== null ? data[hoveredIndex] : null;
  const label = activeItem ? activeItem.label : defaultLabel;
  const value = activeItem ? activeItem.value : total;

  if (children) {
    return (
      <foreignObject x={cx - innerR} y={cy - innerR} width={innerR * 2} height={innerR * 2}>
        <div className="flex h-full w-full items-center justify-center">
          {children({ label, value, activeItem })}
        </div>
      </foreignObject>
    );
  }

  const formatted = new Intl.NumberFormat("en-US").format(value);

  return (
    <g className={className}>
      <text
        x={cx} y={cy - 8}
        textAnchor="middle"
        dominantBaseline="middle"
        fontSize={22}
        fontWeight={700}
        fill="var(--foreground)"
      >
        {prefix}{formatted}{suffix}
      </text>
      <text
        x={cx} y={cy + 16}
        textAnchor="middle"
        dominantBaseline="middle"
        fontSize={12}
        fill="var(--muted-foreground)"
      >
        {label}
      </text>
    </g>
  );
}
