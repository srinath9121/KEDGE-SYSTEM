import { createContext, useContext, useState, useEffect, useRef } from "react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

const RingContext = createContext(null);

export function useRing() {
  const ctx = useContext(RingContext);
  if (!ctx) throw new Error("Ring / RingCenter must be used inside <RingChart>");
  return ctx;
}

export function RingChart({
  data = [],
  size,
  strokeWidth = 12,
  ringGap = 6,
  baseInnerRadius = 60,
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

  const rings = data.map((d, i) => {
    const r = baseInnerRadius + i * (strokeWidth + ringGap) + strokeWidth / 2;
    const circumference = 2 * Math.PI * r;
    const progress = Math.min(d.value / (d.maxValue || 100), 1);
    const dashoffset = circumference - progress * circumference;
    return { ...d, r, circumference, progress, dashoffset, index: i };
  });

  const total = data.reduce((s, d) => s + d.value, 0);

  return (
    <RingContext.Provider
      value={{
        data, rings, cx, cy, strokeWidth,
        total, hoveredIndex, setHoveredIndex, mounted,
      }}
    >
      <div ref={containerRef} className={cn("relative w-full", className)}>
        <svg
          width={svgSize}
          height={svgSize}
          viewBox={`0 0 ${svgSize} ${svgSize}`}
          style={{ transform: "rotate(-90deg)" }}
        >
          {children}
        </svg>
      </div>
    </RingContext.Provider>
  );
}

export function Ring({
  index,
  color,
  animate = true,
  showGlow = true,
  lineCap = "round",
  className,
}) {
  const { rings, cx, cy, strokeWidth, hoveredIndex, setHoveredIndex, mounted } = useRing();

  const ring = rings[index];
  if (!ring) return null;

  const ringColor = color ?? ring.color ?? "var(--primary)";
  const isHovered = hoveredIndex === index;
  const isFaded = hoveredIndex !== null && !isHovered;
  
  const scale = isHovered ? 1.02 : 1;
  const opacity = isFaded ? 0.35 : 1;

  return (
    <g
      className={cn("cursor-pointer", className)}
      onMouseEnter={() => setHoveredIndex(index)}
      onMouseLeave={() => setHoveredIndex(null)}
      style={{ transformOrigin: `${cx}px ${cy}px`, transition: "all 0.3s ease" }}
    >
      <circle
        cx={cx}
        cy={cy}
        r={ring.r}
        fill="none"
        stroke="#1E293B"
        strokeWidth={strokeWidth}
        opacity={isFaded ? 0.2 : 0.4}
        style={{ transition: "opacity 0.3s ease" }}
      />
      
      {showGlow && isHovered && (
        <motion.circle
          cx={cx}
          cy={cy}
          r={ring.r}
          fill="none"
          stroke={ringColor}
          strokeWidth={strokeWidth + 6}
          opacity={0.25}
          strokeDasharray={ring.circumference}
          strokeDashoffset={ring.dashoffset}
          strokeLinecap={lineCap}
          initial={{ opacity: 0 }}
          animate={{ opacity: 0.25 }}
        />
      )}

      <motion.circle
        cx={cx}
        cy={cy}
        r={ring.r}
        fill="none"
        stroke={ringColor}
        strokeWidth={strokeWidth}
        strokeLinecap={lineCap}
        strokeDasharray={ring.circumference}
        initial={animate ? { strokeDashoffset: ring.circumference, opacity: 0, scale: 0.9 } : false}
        animate={mounted ? { strokeDashoffset: ring.dashoffset, opacity, scale } : false}
        transition={{
          strokeDashoffset: { type: "spring", stiffness: 45, damping: 15, delay: index * 0.1 },
          opacity: { duration: 0.4 },
          scale: { type: "spring", stiffness: 300, damping: 20 }
        }}
      />
    </g>
  );
}

export function RingCenter({
  defaultLabel = "Total",
  formatValue = (v) => v.toLocaleString(),
  children,
  className,
}) {
  const { cx, cy, rings, hoveredIndex, total } = useRing();

  const activeItem = hoveredIndex !== null ? rings[hoveredIndex] : null;
  const label = activeItem ? activeItem.label : defaultLabel;
  const value = activeItem ? activeItem.value : total;
  const color = activeItem ? activeItem.color : "#F1F5F9"; // C.text

  if (children) {
    return (
      <g style={{ transform: "rotate(90deg)", transformOrigin: `${cx}px ${cy}px` }}>
         {children({ label, value, activeItem })}
      </g>
    );
  }

  const formatted = formatValue(value);

  return (
    <g className={className} style={{ transform: "rotate(90deg)", transformOrigin: `${cx}px ${cy}px` }}>
      <text
        x={cx} y={cy - 8}
        textAnchor="middle"
        dominantBaseline="middle"
        fontSize={24}
        fontWeight={700}
        fill={color}
        style={{ transition: "fill 0.3s ease" }}
      >
        {formatted}
      </text>
      <text
        x={cx} y={cy + 16}
        textAnchor="middle"
        dominantBaseline="middle"
        fontSize={12}
        fill="#94A3B8" // C.textMid
      >
        {label}
      </text>
    </g>
  );
}
