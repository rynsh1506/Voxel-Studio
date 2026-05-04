import { useEffect, useRef, useMemo } from "react";
import { createEngine } from "../engine/threeEngine";
import { useStore } from "../store/useStore";

export default function VoxelCanvas() {
  const containerRef = useRef(null);
  const isOrbiting = useStore((s) => s.isOrbiting);
  const engine = useMemo(() => createEngine(), []);

  useEffect(() => {
    if (!containerRef.current) return;
    const cleanup = engine.init(containerRef.current);
    return cleanup;
  }, [engine]);

  return (
    <main
      ref={containerRef}
      tabIndex={1}
      className={`flex-1 relative overflow-hidden outline-none transition-colors duration-300 ${isOrbiting ? "cursor-grabbing" : "cursor-crosshair"} bg-[#1a1a1a] dark:bg-[#1a1a1a]`}
      // Background canvas bisa diset sesuai tema
    />
  );
}
