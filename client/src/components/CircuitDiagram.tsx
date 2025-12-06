import { useCircuitStore } from "@/lib/store";
import { motion } from "framer-motion";
import { useEffect, useRef } from "react";

export function CircuitDiagram() {
  const { n, meshes } = useCircuitStore();
  const containerRef = useRef<HTMLDivElement>(null);

  // Calculate layout
  // We'll arrange meshes in a row for simplicity: M1 -- M2 -- M3
  // This supports the linear chain coupling nicely.
  // SVG ViewBox width depends on N.

  const meshWidth = 150;
  const meshHeight = 150;
  const spacing = 50; // Space between mesh centers

  // Actually, let's overlap them slightly to show "sharing"
  // M1 center (100, 100), M2 center (250, 100)...
  // Shared leg is the vertical line between them.

  return (
    <div
      className="w-full h-[300px] bg-black/40 rounded-xl border border-primary/20 relative overflow-hidden flex items-center justify-center"
      ref={containerRef}
    >
      <div className="absolute top-2 left-2 text-xs font-mono text-primary/50">
        VISUALIZAÇÃO ESQUEMÁTICA (LIVE)
      </div>

      <svg
        width="100%"
        height="100%"
        viewBox={`0 0 ${n * 200} 250`}
        preserveAspectRatio="xMidYMid meet"
      >
        <defs>
          <filter id="glow" x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur stdDeviation="2" result="blur" />
            <feComposite in="SourceGraphic" in2="blur" operator="over" />
          </filter>
        </defs>

        {/* Draw Meshes */}
        {Array.from({ length: n }).map((_, i) => {
          const x = 100 + i * 180;
          const y = 125;
          const size = 100; // half size (radius-ish)

          // Box coordinates
          const left = x - 70;
          const right = x + 70;
          const top = y - 70;
          const bottom = y + 70;

          // Mesh Loop
          return (
            <g key={`mesh-${i}`}>
              {/* Main Loop Rectangle */}
              <rect
                x={left}
                y={top}
                width={140}
                height={140}
                fill="none"
                stroke="#00f3ff"
                strokeWidth="2"
                rx="10"
                className="opacity-50"
              />

              {/* Mesh Label */}
              <text
                x={x}
                y={y}
                fill="#00f3ff"
                textAnchor="middle"
                dominantBaseline="middle"
                className="text-2xl font-bold opacity-20 font-display"
              >
                M{i + 1}
              </text>

              {/* Current Arrow (Circular) */}
              <path
                d={`M ${x - 20} ${y} A 20 20 0 1 1 ${x + 20} ${y}`}
                fill="none"
                stroke="#fcee0a"
                strokeWidth="2"
                strokeDasharray="4 4"
                className="animate-[spin_3s_linear_infinite] opacity-50"
              />
              <text
                x={x}
                y={y + 35}
                fill="#fcee0a"
                textAnchor="middle"
                fontSize="10"
                fontFamily="monospace"
              >
                I{i + 1}
              </text>
            </g>
          );
        })}

        {/* Draw Components */}
        {meshes.map((mesh, i) => {
          const x = 100 + i * 180;
          const y = 125;
          const top = y - 70;
          const bottom = y + 70;
          const left = x - 70;
          const right = x + 70;

          // Distribute non-shared components on Top, Bottom, Left
          const nonSharedResistors = mesh.resistors.filter(
            (r) => r.sharedWith === null
          );
          const sources = mesh.sources;

          // Simplified placement logic for visualization
          // Top: Sources
          // Left: Non-shared Resistors (first half)
          // Bottom: Non-shared Resistors (second half)

          return (
            <g key={`comps-${i}`}>
              {/* Sources on Top Edge */}
              {sources.map((s, idx) => (
                <g
                  key={s.id}
                  transform={`translate(${
                    x + idx * 20 - (sources.length - 1) * 10
                  }, ${top})`}
                >
                  <circle r="8" fill="#000" stroke="#ff00ff" strokeWidth="2" />
                  <text
                    y="-12"
                    textAnchor="middle"
                    fill="#ff00ff"
                    fontSize="10"
                  >
                    {s.value}V
                  </text>
                  <text
                    y="3"
                    textAnchor="middle"
                    fill="#ff00ff"
                    fontSize="10"
                    fontWeight="bold"
                  >
                    +
                  </text>
                </g>
              ))}

              {/* Resistors on Left Edge (if not first mesh, might clash with previous shared, but assume simple layout) */}
              {nonSharedResistors.map((r, idx) => {
                // Spread them around left/bottom
                const side = idx % 2 === 0 ? "left" : "bottom";
                const posX = side === "left" ? left : x;
                const posY = side === "left" ? y : bottom;

                return (
                  <g key={r.id} transform={`translate(${posX}, ${posY})`}>
                    <rect
                      x="-6"
                      y="-10"
                      width="12"
                      height="20"
                      fill="#000"
                      stroke="#00f3ff"
                      strokeWidth="2"
                    />
                    <text
                      y="-15"
                      textAnchor="middle"
                      fill="#00f3ff"
                      fontSize="10"
                    >
                      {r.value}Ω
                    </text>
                  </g>
                );
              })}

              {/* SHARED Resistors on Right Edge (connecting to next mesh) */}
              {mesh.resistors
                .filter((r) => r.sharedWith !== null)
                .map((r, idx) => {
                  if (r.sharedWith === i + 1) {
                    // Right edge
                    return (
                      <g key={r.id} transform={`translate(${right}, ${y})`}>
                        <rect
                          x="-6"
                          y="-10"
                          width="12"
                          height="20"
                          fill="#000"
                          stroke="#fcee0a"
                          strokeWidth="2"
                        />
                        <text
                          y="-15"
                          textAnchor="middle"
                          fill="#fcee0a"
                          fontSize="10"
                        >
                          {r.value}Ω
                        </text>
                        <text
                          y="25"
                          textAnchor="middle"
                          fill="#fcee0a"
                          fontSize="8"
                          opacity="0.7"
                        >
                          R{i + 1}
                          {r.sharedWith! + 1}
                        </text>
                      </g>
                    );
                  }
                  // If shared with previous, technically we draw it on left edge.
                  else if (r.sharedWith === i - 1) {
                    return (
                      <g key={r.id} transform={`translate(${left}, ${y})`}>
                        <rect
                          x="-6"
                          y="-10"
                          width="12"
                          height="20"
                          fill="#000"
                          stroke="#fcee0a"
                          strokeWidth="2"
                        />
                        <text
                          y="-15"
                          textAnchor="middle"
                          fill="#fcee0a"
                          fontSize="10"
                        >
                          {r.value}Ω
                        </text>
                      </g>
                    );
                  }
                  return null;
                })}
            </g>
          );
        })}
      </svg>
    </div>
  );
}
