import { createContext, useContext, useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";

// ─── Context ────────────────────────────────────────────────────────────────
const RadarContext = createContext(null);

function useRadar() {
  const ctx = useContext(RadarContext);
  if (!ctx) throw new Error("Radar sub-components must be used inside <RadarChart>");
  return ctx;
}

// ─── Helpers ────────────────────────────────────────────────────────────────
function getAngle(index, total) {
  return (Math.PI * 2 * index) / total - Math.PI / 2;
}

function getPoint(cx, cy, r, angle) {
  return {
    x: cx + r * Math.cos(angle),
    y: cy + r * Math.sin(angle),
  };
}

function getPolygonPoints(cx, cy, radius, metrics, values) {
  return metrics.map((m, i) => {
    const angle = getAngle(i, metrics.length);
    const val = (values[m.key] ?? 0) / 100;
    return getPoint(cx, cy, radius * val, angle);
  });
}

function pointsToPath(pts) {
  if (!pts.length) return "";
  return pts.map((p, i) => `${i === 0 ? "M" : "L"}${p.x.toFixed(2)},${p.y.toFixed(2)}`).join(" ") + " Z";
}

// ─── RadarChart (root) ──────────────────────────────────────────────────────
export function RadarChart({
  data = [],
  metrics = [],
  size,
  levels = 5,
  margin = 64,
  animate = true,
  hoveredIndex: controlledHovered,
  onHoverChange,
  className,
  children,
}) {
  const containerRef = useRef(null);
  const [containerSize, setContainerSize] = useState(size ?? 320);
  const [hoveredIndex, setHoveredIndexLocal] = useState(null);
  const [mounted, setMounted] = useState(false);

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
  const hovered = isControlled ? controlledHovered : hoveredIndex;

  function setHoveredIndex(idx) {
    if (!isControlled) setHoveredIndexLocal(idx);
    onHoverChange?.(idx);
  }

  const svgSize = containerSize;
  const cx = svgSize / 2;
  const cy = svgSize / 2;
  const radius = svgSize / 2 - margin;

  return (
    <RadarContext.Provider
      value={{
        data, metrics, levels, margin,
        cx, cy, radius, svgSize,
        hoveredIndex: hovered,
        setHoveredIndex,
        getPointPosition: (metricKey, value) => {
          const idx = metrics.findIndex((m) => m.key === metricKey);
          if (idx === -1) return { x: cx, y: cy };
          const angle = getAngle(idx, metrics.length);
          return getPoint(cx, cy, radius * (value / 100), angle);
        },
        animate,
        mounted,
      }}
    >
      <div ref={containerRef} className={cn("w-full", className)}>
        <svg
          width={svgSize}
          height={svgSize}
          viewBox={`0 0 ${svgSize} ${svgSize}`}
          className="overflow-visible"
        >
          {children}
        </svg>
      </div>
    </RadarContext.Provider>
  );
}

// ─── RadarGrid ──────────────────────────────────────────────────────────────
export function RadarGrid({ showLabels = true, className }) {
  const { cx, cy, radius, levels, metrics, animate, mounted } = useRadar();

  return (
    <g className={className}>
      {Array.from({ length: levels }).map((_, li) => {
        const r = (radius * (li + 1)) / levels;
        const pts = metrics.map((_, mi) => {
          const angle = getAngle(mi, metrics.length);
          return getPoint(cx, cy, r, angle);
        });
        const d = pointsToPath(pts);
        return (
          <motion.path
            key={li}
            d={d}
            fill="none"
            stroke="var(--border)"
            strokeWidth={1}
            strokeOpacity={0.5}
            initial={animate ? { pathLength: 0, opacity: 0 } : false}
            animate={mounted ? { pathLength: 1, opacity: 1 } : false}
            transition={{ duration: 0.6, delay: li * 0.08, ease: "easeOut" }}
          />
        );
      })}
    </g>
  );
}

// ─── RadarAxis ──────────────────────────────────────────────────────────────
export function RadarAxis({ className }) {
  const { cx, cy, radius, metrics, animate, mounted } = useRadar();
  return (
    <g className={className}>
      {metrics.map((m, i) => {
        const angle = getAngle(i, metrics.length);
        const pt = getPoint(cx, cy, radius, angle);
        return (
          <motion.line
            key={m.key}
            x1={cx} y1={cy}
            x2={pt.x} y2={pt.y}
            stroke="var(--border)"
            strokeWidth={1}
            strokeOpacity={0.4}
            initial={animate ? { scaleY: 0, originY: cy } : false}
            animate={mounted ? { scaleY: 1 } : false}
            transition={{ duration: 0.5, delay: i * 0.06, ease: "easeOut" }}
          />
        );
      })}
    </g>
  );
}

// ─── RadarLabels ────────────────────────────────────────────────────────────
export function RadarLabels({ offset = 24, fontSize = 11, interactive = false, className }) {
  const { cx, cy, radius, metrics, animate, mounted, hoveredIndex, setHoveredIndex } = useRadar();

  return (
    <g className={className}>
      {metrics.map((m, i) => {
        const angle = getAngle(i, metrics.length);
        const pt = getPoint(cx, cy, radius + offset, angle);
        const anchor =
          Math.abs(pt.x - cx) < 4 ? "middle" : pt.x < cx ? "end" : "start";

        return (
          <motion.text
            key={m.key}
            x={pt.x}
            y={pt.y}
            textAnchor={anchor}
            dominantBaseline="middle"
            fontSize={fontSize}
            fill="var(--muted-foreground)"
            className={interactive ? "cursor-pointer" : ""}
            initial={animate ? { opacity: 0 } : false}
            animate={mounted ? { opacity: 1 } : false}
            transition={{ duration: 0.4, delay: 0.4 + i * 0.05 }}
          >
            {m.label}
          </motion.text>
        );
      })}
    </g>
  );
}

// ─── RadarArea ──────────────────────────────────────────────────────────────
export function RadarArea({ index, color, showPoints = true, showGlow = true, className }) {
  const { data, metrics, cx, cy, radius, hoveredIndex, setHoveredIndex, animate, mounted } = useRadar();
  const series = data[index];
  if (!series) return null;

  const seriesColor = color ?? series.color ?? `var(--chart-${(index % 5) + 1})`;
  const isHovered = hoveredIndex === index;
  const isFaded = hoveredIndex !== null && !isHovered;

  const pts = getPolygonPoints(cx, cy, radius, metrics, series.values);
  const pathD = pointsToPath(pts);

  // Build a "zero" path for mount animation
  const zeroPts = metrics.map((_, i) => getPoint(cx, cy, 0, getAngle(i, metrics.length)));
  const zeroD = pointsToPath(zeroPts);

  return (
    <g
      className={cn("cursor-pointer", className)}
      onMouseEnter={() => setHoveredIndex(index)}
      onMouseLeave={() => setHoveredIndex(null)}
    >
      {/* Glow on hover */}
      {showGlow && isHovered && (
        <motion.path
          d={pathD}
          fill={seriesColor}
          fillOpacity={0.15}
          stroke={seriesColor}
          strokeWidth={8}
          strokeOpacity={0.2}
          strokeLinejoin="round"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        />
      )}

      {/* Main area */}
      <motion.path
        d={pathD}
        fill={seriesColor}
        fillOpacity={isHovered ? 0.25 : isFaded ? 0.05 : 0.15}
        stroke={seriesColor}
        strokeWidth={isHovered ? 2.5 : 1.5}
        strokeOpacity={isFaded ? 0.3 : 1}
        strokeLinejoin="round"
        initial={animate ? { d: zeroD } : false}
        animate={mounted ? { d: pathD } : false}
        transition={{ duration: 0.7, delay: index * 0.1, ease: [0.34, 1.56, 0.64, 1] }}
      />

      {/* Data points */}
      {showPoints &&
        pts.map((pt, pi) => (
          <motion.circle
            key={pi}
            cx={pt.x}
            cy={pt.y}
            r={isHovered ? 4 : 3}
            fill={seriesColor}
            fillOpacity={isFaded ? 0.2 : 1}
            initial={animate ? { r: 0, opacity: 0 } : false}
            animate={mounted ? { r: isHovered ? 4 : 3, opacity: isFaded ? 0.2 : 1 } : false}
            transition={{ duration: 0.4, delay: 0.7 + index * 0.1 + pi * 0.02 }}
          />
        ))}
    </g>
  );
}
