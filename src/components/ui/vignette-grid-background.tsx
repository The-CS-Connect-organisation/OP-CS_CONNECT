import { cn } from "@/lib/utils";

interface GridVignetteBackgroundProps {
  size?: number;
  x?: number;
  y?: number;
  horizontalVignetteSize?: number;
  verticalVignetteSize?: number;
  intensity?: number;
}

export function GridVignetteBackground({
  className,
  size = 48,
  x = 50,
  y = 50,
  horizontalVignetteSize = 100,
  verticalVignetteSize = 100,
  intensity = 0,
}: React.ComponentProps<"div"> & GridVignetteBackgroundProps) {
  return (
    <div
      className={cn(
        "absolute inset-0 z-0 opacity-40 bg-[image:linear-gradient(to_right,rgba(249,115,22,0.15),transparent_1px),linear-gradient(to_bottom,rgba(249,115,22,0.15),transparent_1px)]",
        className
      )}
      style={{
        backgroundSize: `${size}px ${size}px`,
        maskImage: `radial-gradient(ellipse ${horizontalVignetteSize}% ${verticalVignetteSize}% at ${x}% ${y}%, black ${
          100 - intensity
        }%, transparent 100%)`,
      }}
    />
  );
}
