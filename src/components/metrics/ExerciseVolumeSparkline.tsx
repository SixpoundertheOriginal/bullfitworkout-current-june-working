
import React from "react";
import { cn } from "@/lib/utils";

interface ExerciseVolumeSparklineProps {
  volumes: number[];
  positive?: boolean;
  negative?: boolean;
}

export const ExerciseVolumeSparkline: React.FC<ExerciseVolumeSparklineProps> = ({
  volumes,
  positive,
  negative,
}) => {
  // Chart sizing & values
  const width = 80;
  const height = 22;
  const padY = 4; // Vertical padding
  const barCount = Math.max(5, Math.min(volumes.length, 12));
  const data = volumes.slice(-barCount); // last N points

  const min = Math.min(...data);
  const max = Math.max(...data, 1); // avoid divide-by-zero

  // Animate new bar with an extra class
  const animationClass = "animate-fade-in";

  return (
    <svg width={width} height={height} viewBox={`0 0 ${width} ${height}`} aria-label="Volume sparkline" className="mx-2">
      {data.map((v, i) => {
        const barW = width / barCount - 2;
        const barX = i * (width / barCount);
        const valPct = (v - min) / (max - min || 1);
        const barH = Math.max(2, (height - padY * 2) * valPct);
        let color = "#8B5CF6"; // purple base
        if (positive) color = "#22c55e"; // Tailwind green-500
        if (negative) color = "#ea384c"; // from instructions, strong red

        return (
          <rect
            key={i}
            x={barX}
            y={height - padY - barH}
            width={barW}
            height={barH}
            rx={2}
            className={cn("transition-all", i === data.length - 1 && animationClass)}
            fill={color}
            opacity={i === data.length - 1 ? 0.85 : 0.5}
          />
        );
      })}
    </svg>
  );
};
