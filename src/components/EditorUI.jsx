/* eslint-disable no-unused-vars */
import React, { useState, useMemo } from "react";
import { useStore } from "../store/useStore";
import { generateExportCode, downloadExportFile } from "../utils/exportUtils";
import { Trash2 } from "lucide-react";

// ==========================================
// KOPONEN BUTTON (100% SVG ASLI)
// ==========================================
const Button = ({
  variant = "default",
  className = "",
  active,
  children,
  ...props
}) => {
  let variantClass = "";
  if (variant === "default") {
    variantClass =
      "bg-[color:var(--bg-hover)] hover:bg-[color:var(--border)] text-[color:var(--text-main)] border-[color:var(--border)]";
  } else if (variant === "accent") {
    variantClass =
      "bg-[color:var(--accent)] hover:bg-[color:var(--accent-hover)] text-white border-[color:var(--accent)]";
  } else if (variant === "danger") {
    variantClass =
      "bg-[rgba(239,68,68,0.1)] hover:bg-[color:var(--danger)] text-[color:var(--danger)] hover:text-white border-[color:rgba(239,68,68,0.3)]";
  } else if (variant === "tool") {
    variantClass = active
      ? "bg-[rgba(16,185,129,0.2)] text-[color:var(--accent)] border-[color:var(--accent)] border"
      : "bg-transparent hover:bg-[color:var(--bg-hover)] text-[color:var(--text-muted)] hover:text-[color:var(--text-main)] border-transparent border";
  }

  const baseClass =
    variant === "tool"
      ? `w-[42px] h-[42px] flex items-center justify-center rounded-[8px] transition-all cursor-pointer ${variantClass} ${className}`
      : `border rounded-[6px] px-[12px] py-[6px] flex items-center justify-center gap-[6px] text-[12px] font-medium transition-all cursor-pointer ${variantClass} ${className}`;

  return (
    <button className={baseClass} {...props}>
      {children}
    </button>
  );
};

export function TopMenu() {
  const {
    t,
    engineActions,
    setStore,
    showGrid,
    openModal,
    showAiPanel,
    setShowAiPanel,
    activeView,
  } = useStore();
  const T = t();
  return (
    <header className="h-12.5 bg-(--bg-panel) border-b border-(--border) flex items-center justify-between px-3.75 z-200 transition-colors duration-300">
      <div className="font-bold text-[16px] text-(--text-main) flex items-center gap-2">
        <svg
          width="22"
          height="22"
          viewBox="0 0 24 24"
          fill="var(--accent)"
          stroke="none"
        >
          <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"></path>
          <polyline
            points="3.27 6.96 12 12.01 20.73 6.96"
            stroke="var(--accent)"
          ></polyline>
          <line
            x1="12"
            y1="22.08"
            x2="12"
            y2="12"
            stroke="var(--accent)"
          ></line>
        </svg>
        Voxel Studio
      </div>
      <div className="flex items-center gap-2">
        <Button
          onClick={() => engineActions?.undo()}
          title={T.undo + " (Ctrl+Z)"}
        >
          <svg
            width="14"
            height="14"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M3 7v6h6" />
            <path d="M21 17a9 9 0 0 0-9-9 9 9 0 0 0-6 2.3L3 13" />
          </svg>
        </Button>
        <Button
          onClick={() => engineActions?.redo()}
          title={T.redo + " (Ctrl+Y)"}
        >
          <svg
            width="14"
            height="14"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M21 7v6h-6" />
            <path d="M3 17a9 9 0 0 1 9-9 9 9 0 0 1 6 2.3l3 2.7" />
          </svg>
        </Button>
        <div className="w-px h-5 bg-(--border) mx-1.25"></div>

        <div className="flex bg-(--bg-dark) border border-(--border) rounded-md overflow-hidden">
          <button
            className={`px-3 py-1.5 text-[11px] font-semibold cursor-pointer transition-colors duration-200 border-r border-(--border) ${activeView === "iso" ? "bg-(--bg-panel) text-(--accent)" : "bg-transparent text-(--text-muted) hover:bg-(--bg-hover) hover:text-(--text-main)"}`}
            onClick={() => engineActions?.setView("iso")}
          >
            Iso
          </button>
          <button
            className={`px-3 py-1.5 text-[11px] font-semibold cursor-pointer transition-colors duration-200 border-r border-(--border) ${activeView === "top" ? "bg-(--bg-panel) text-(--accent)" : "bg-transparent text-(--text-muted) hover:bg-(--bg-hover) hover:text-(--text-main)"}`}
            onClick={() => engineActions?.setView("top")}
          >
            {T.top}
          </button>
          <button
            className={`px-3 py-1.5 text-[11px] font-semibold cursor-pointer transition-colors duration-200 ${activeView === "front" ? "bg-(--bg-panel) text-(--accent)" : "bg-transparent text-(--text-muted) hover:bg-(--bg-hover) hover:text-(--text-main)"}`}
            onClick={() => engineActions?.setView("front")}
          >
            {T.front}
          </button>
        </div>

        <div className="w-px h-5 bg-(--border) mx-1.25"></div>
        <Button
          onClick={() => {
            setStore({ showGrid: !showGrid });
            setTimeout(() => engineActions?.toggleGrid(), 50);
          }}
          title="Toggle Grid (G)"
        >
          <svg
            width="14"
            height="14"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
            <line x1="3" y1="9" x2="21" y2="9" />
            <line x1="3" y1="15" x2="21" y2="15" />
            <line x1="9" y1="3" x2="9" y2="21" />
            <line x1="15" y1="3" x2="15" y2="21" />
          </svg>
        </Button>
        <Button onClick={() => openModal("newProj")}>
          <svg
            width="14"
            height="14"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M12 5v14M5 12h14" />
          </svg>{" "}
          {T.new}
        </Button>
        <Button onClick={() => openModal("saveProj")}>
          <svg
            width="14"
            height="14"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z" />
            <polyline points="17 21 17 13 7 13 7 21" />
            <polyline points="7 3 7 8 15 8" />
          </svg>{" "}
          {T.save}
        </Button>
        <Button onClick={() => openModal("loadProj")}>
          <svg
            width="14"
            height="14"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z" />
          </svg>{" "}
          {T.load}
        </Button>
        <div className="w-px h-5 bg-(--border) mx-1.25"></div>
        <Button
          variant="accent"
          onClick={() => setShowAiPanel(!showAiPanel)}
          style={{
            background: "linear-gradient(135deg, #10b981, #0ea5e9)",
            border: "none",
          }}
        >
          <svg
            width="14"
            height="14"
            viewBox="0 0 24 24"
            fill="none"
            stroke="#fff"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83" />
          </svg>{" "}
          AI Agent
        </Button>
        <Button
          onClick={() => openModal("export")}
          style={{ marginLeft: "5px" }}
        >
          <svg
            width="14"
            height="14"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
            <polyline points="17 8 12 3 7 8" />
            <line x1="12" y1="3" x2="12" y2="15" />
          </svg>{" "}
          {T.export}
        </Button>
        <Button variant="danger" onClick={() => openModal("clearConfirm")}>
          <svg
            width="14"
            height="14"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <polyline points="3 6 5 6 21 6" />
            <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
            <line x1="10" y1="11" x2="10" y2="17" />
            <line x1="14" y1="11" x2="14" y2="17" />
          </svg>{" "}
          {T.clear}
        </Button>
        <div className="w-px h-5 bg-(--border) mx-1.25"></div>
        <Button onClick={() => openModal("settings")} title={T.settings}>
          <svg
            width="14"
            height="14"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <circle cx="12" cy="12" r="3" />
            <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9c.26.6.8.98 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z" />
          </svg>
        </Button>
      </div>
    </header>
  );
}

// 100% SVG ASLI VUE DI SIDEBAR
export function Sidebar() {
  const { currentTool, setStore, t, showTooltips, engineActions } = useStore();
  const tools = [
    {
      id: "select",
      svg: (
        <svg
          width="20"
          height="20"
          viewBox="0 0 24 24"
          fill="currentColor"
          stroke="none"
        >
          <path d="M3 3l7.07 16.97 2.51-7.39 7.39-2.51L3 3z" />
        </svg>
      ),
      tip: t().toolSel,
    },
    {
      id: "move",
      svg: (
        <svg
          width="20"
          height="20"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
        >
          <path d="M5 9l-3 3 3 3M9 5l3-3 3 3M19 9l3 3-3 3M9 19l3 3 3 3M2 12h20M12 2v20" />
        </svg>
      ),
      tip: t().toolMove,
    },
    {
      id: "pen",
      svg: (
        <svg
          width="20"
          height="20"
          viewBox="0 0 24 24"
          fill="currentColor"
          stroke="none"
        >
          <path d="M12 19l7-7 3 3-7 7-3-3z" />
          <path d="M18 13l-1.5-7.5L2 2l3.5 14.5L13 18l5-5z" />
        </svg>
      ),
      tip: t().toolPen,
    },
    {
      id: "line",
      svg: (
        <svg
          width="20"
          height="20"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
        >
          <line x1="4" y1="20" x2="20" y2="4" />
          <circle cx="4" cy="20" r="2" />
          <circle cx="20" cy="4" r="2" />
        </svg>
      ),
      tip: t().toolLine,
    },
    {
      id: "box",
      svg: (
        <svg
          width="20"
          height="20"
          viewBox="0 0 24 24"
          fill="currentColor"
          stroke="none"
        >
          <rect x="3" y="3" width="18" height="18" rx="2" />
        </svg>
      ),
      tip: t().toolBox,
    },
    {
      id: "erase",
      svg: (
        <svg
          width="20"
          height="20"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
        >
          <path d="M21 7L7 21M7 7l14 14" />
        </svg>
      ),
      tip: t().toolErase,
    },
    {
      id: "paint",
      svg: (
        <svg
          width="20"
          height="20"
          viewBox="0 0 24 24"
          fill="currentColor"
          stroke="none"
        >
          <path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
        </svg>
      ),
      tip: t().toolPaint,
    },
    {
      id: "pick",
      svg: (
        <svg
          width="20"
          height="20"
          viewBox="0 0 24 24"
          fill="currentColor"
          stroke="none"
        >
          <path d="M17 3a2.828 2.828 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5L17 3z" />
        </svg>
      ),
      tip: t().toolPick,
    },
  ];

  return (
    <aside className="w-15 bg-(--bg-panel) border-r border-(--border) flex flex-col items-center py-3.75 gap-2.5 z-100 transition-colors duration-300">
      {tools.map((tool) => (
        <div key={tool.id} className="relative group flex justify-center">
          <Button
            variant="tool"
            active={currentTool === tool.id}
            onClick={() => {
              setStore({ currentTool: tool.id });
              engineActions?.cancelDrawing();
            }}
          >
            {tool.svg}
          </Button>
          {showTooltips && (
            <div className="absolute left-13.75 top-1/2 -translate-y-1/2 bg-(--tooltip-bg) text-(--tooltip-text) px-2.5 py-1.5 rounded-md text-[11px] font-medium whitespace-nowrap opacity-0 group-hover:opacity-100 pointer-events-none transition-all duration-200 z-1000 shadow-md">
              {tool.tip}
            </div>
          )}
        </div>
      ))}
    </aside>
  );
}

export function PropertiesPanel() {
  const {
    currentColor,
    setStore,
    engineActions,
    t,
    symX,
    symZ,
    selectedCount,
    currentTool,
    axisLock,
  } = useStore();
  const T = t();
  const palette = [
    "#FFFFFF",
    "#D4D4D8",
    "#71717A",
    "#27272A",
    "#000000",
    "#EF4444",
    "#F97316",
    "#F39C12",
    "#EAB308",
    "#84CC16",
    "#22C55E",
    "#10B981",
    "#06B6D4",
    "#0EA5E9",
    "#3B82F6",
    "#6366F1",
    "#8B5CF6",
    "#EC4899",
  ];

  return (
    <aside className="w-70 bg-(--bg-panel) border-l border-(--border) flex flex-col z-100 overflow-y-auto transition-colors duration-300">
      <div className="p-3.75 border-b border-(--border)">
        <div className="text-[11px] uppercase font-bold text-(--text-muted) mb-3.75 tracking-[1px] flex justify-between items-center">
          {T.colorPal}
        </div>
        <div className="flex items-center gap-2.5 mb-3">
          <input
            type="color"
            className="w-9 h-9 rounded-md cursor-pointer bg-transparent border-none p-0 [&::-webkit-color-swatch-wrapper]:p-0 [&::-webkit-color-swatch]:border [&::-webkit-color-swatch]:border-(--border) [&::-webkit-color-swatch]:rounded-md"
            value={currentColor}
            onChange={(e) => {
              setStore({ currentColor: e.target.value });
              engineActions?.applyColorToSelection(e.target.value);
            }}
          />
          <input
            type="text"
            className="flex-1 bg-(--bg-dark) border border-(--border) text-(--text-main) px-2.5 py-2 rounded-sm font-mono text-[13px] outline-none uppercase focus:border-(--accent) transition-colors"
            value={currentColor}
            onChange={(e) => {
              setStore({ currentColor: e.target.value });
              engineActions?.applyColorToSelection(e.target.value);
            }}
          />
        </div>
        <div className="grid grid-cols-6 gap-2">
          {palette.map((c) => (
            <div
              key={c}
              onClick={() => {
                setStore({ currentColor: c });
                engineActions?.applyColorToSelection(c);
              }}
              className="aspect-square rounded-sm cursor-pointer border-2 transition-all duration-100 hover:scale-110"
              style={{
                backgroundColor: c,
                borderColor:
                  currentColor.toUpperCase() === c.toUpperCase()
                    ? "var(--text-main)"
                    : "transparent",
                boxShadow:
                  currentColor.toUpperCase() === c.toUpperCase()
                    ? "0 0 8px rgba(0,0,0,0.3)"
                    : "none",
              }}
            />
          ))}
        </div>
      </div>

      {["box", "select"].includes(currentTool) && (
        <div className="p-3.75 border-b border-(--border)">
          <div className="text-[11px] uppercase font-bold text-(--text-muted) mb-3.75 tracking-[1px]">
            {T.planeLock}
          </div>
          <div className="flex bg-(--bg-dark) border border-(--border) rounded-md overflow-hidden">
            {["x", "y", "z"].map((a, idx) => (
              <button
                key={a}
                className={`flex-1 text-[11px] py-1.5 uppercase font-semibold transition-colors cursor-pointer ${idx !== 2 ? "border-r border-(--border)" : ""} ${axisLock === a ? "bg-(--bg-panel) text-(--accent)" : "bg-transparent text-(--text-muted) hover:bg-(--bg-hover) hover:text-(--text-main)"}`}
                onClick={() => setStore({ axisLock: a })}
              >
                {a}
              </button>
            ))}
          </div>
          <div className="text-[10px] text-(--text-muted) mt-2 text-center leading-[1.4]">
            {T.planeDesc}
          </div>
        </div>
      )}

      <div className="p-3.75 border-b border-(--border)">
        <div className="text-[11px] uppercase font-bold text-(--text-muted) mb-3.75 tracking-[1px]">
          {T.sym}
        </div>
        <div className="flex gap-3.75 text-(--text-main)">
          <label className="flex items-center gap-1.25 cursor-pointer text-[13px]">
            <input
              type="checkbox"
              checked={symX}
              onChange={(e) => setStore({ symX: e.target.checked })}
            />{" "}
            X-Axis
          </label>
          <label className="flex items-center gap-1.25 cursor-pointer text-[13px]">
            <input
              type="checkbox"
              checked={symZ}
              onChange={(e) => setStore({ symZ: e.target.checked })}
            />{" "}
            Z-Axis
          </label>
        </div>
      </div>

      {selectedCount > 0 && (
        <div className="p-3.75 border-b border-(--border)">
          <div className="text-[11px] uppercase font-bold text-(--text-muted) mb-3.75 tracking-[1px] flex justify-between items-center">
            {T.sel} ({selectedCount}){" "}
            <button
              className="text-[10px] bg-(--bg-hover) text-(--text-main) px-2 py-0.5 rounded-md border border-(--border) cursor-pointer"
              onClick={() => engineActions?.selectAll()}
            >
              {T.all}
            </button>
          </div>
          <div className="grid grid-cols-2 gap-1.25 mb-2">
            <Button
              className="w-full py-2.5! font-semibold! justify-center"
              onClick={() => engineActions?.transformSelection("rotY")}
            >
              ↻ {T.rotY}
            </Button>
            <Button
              className="w-full py-2.5! font-semibold! justify-center"
              onClick={() => engineActions?.transformSelection("mirX")}
            >
              ⇋ {T.flipX}
            </Button>
          </div>
          <Button
            variant="danger"
            className="w-full mt-2.5 py-2.5! font-semibold! justify-center"
            onClick={() => engineActions?.deleteSelected()}
          >
            <Trash2 /> {T.delSel}
          </Button>
        </div>
      )}
    </aside>
  );
}

export function StatusBar() {
  const { statusMsgKey, t, gridSize, voxelCount, isExtrudingUI } = useStore();
  return (
    <footer className="h-6.25 bg-(--bg-panel) border-t border-(--border) flex items-center justify-between px-3.75 text-[11px] font-mono text-(--text-muted) z-200 transition-colors duration-300">
      <div className="flex gap-5">
        <span
          className={`font-bold ${isExtrudingUI ? "text-(--warning) animate-pulse" : "text-(--accent)"}`}
        >
          {t()[statusMsgKey] || statusMsgKey}
        </span>
        {/* DOM DIUPDATE LANGSUNG DARI THREE.JS TANPA REACT RENDERS */}
        <span id="coord-display">X: 0 | Y: 0 | Z: 0</span>
      </div>
      <div className="flex gap-5">
        <span>
          Grid: {gridSize}x{gridSize}
        </span>
        <span>
          Voxels: <b className="text-(--text-main)">{voxelCount}</b>
        </span>
      </div>
    </footer>
  );
}

export function AppModals() {
  const {
    modals,
    closeModal,
    t,
    engineActions,
    gridSize,
    setStore,
    lang,
    theme,
    showTooltips,
    geminiApiKey,
  } = useStore();
  const T = t();
  const [tempGrid, setTempGrid] = useState(gridSize);
  const [projName, setProjName] = useState("");
  const [exportOpt, setExportOpt] = useState({
    format: "html_3d",
    bg: "#1a1a1a",
    autoRotate: true,
  });
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  const savedList = useMemo(() => {
    if (!modals.loadProj) return [];
    return JSON.parse(localStorage.getItem("vPro_Saves") || "[]");
  }, [modals.loadProj, refreshTrigger]);

  const exportCodeStr = useMemo(() => {
    if (!modals.export) return "";
    return generateExportCode(
      exportOpt.format,
      engineActions?.getVoxelsData() || [],
      exportOpt,
    );
  }, [
    modals.export,
    exportOpt.format,
    exportOpt.bg,
    exportOpt.autoRotate,
    engineActions,
  ]);

  const handleCreateNew = () => {
    setStore({ gridSize: tempGrid });
    engineActions?.clearAll(false);
    engineActions?.forceRebuildGrid(tempGrid);
    engineActions?.manualSaveState();
    closeModal("newProj");
  };
  const handleSave = () => {
    let saves = JSON.parse(localStorage.getItem("vPro_Saves") || "[]");
    saves.push({
      id: Date.now(),
      name: projName || "Untitled Project",
      date: new Date().toLocaleString(),
      data: {
        g: gridSize,
        v: engineActions
          ?.getVoxelsData()
          .map((v) => ({ gx: v.gx, gy: v.gy, gz: v.gz, c: v.c })),
      },
    });
    localStorage.setItem("vPro_Saves", JSON.stringify(saves));
    setRefreshTrigger((prev) => prev + 1);
    closeModal("saveProj");
    setProjName("");
  };
  const handleLoad = (proj) => {
    engineActions?.clearAll(false);
    setStore({ gridSize: proj.data.g || 16 });
    engineActions?.forceRebuildGrid(proj.data.g || 16);
    proj.data.v.forEach((v) =>
      engineActions?.manualAddVoxel(v.gx, v.gy, v.gz, v.c),
    );
    engineActions?.manualSaveState();
    closeModal("loadProj");
  };
  const handleDeleteSave = (id) => {
    if (window.confirm("Hapus file save?")) {
      let saves = JSON.parse(localStorage.getItem("vPro_Saves") || "[]");
      saves = saves.filter((s) => s.id !== id);
      localStorage.setItem("vPro_Saves", JSON.stringify(saves));
      setRefreshTrigger((prev) => prev + 1);
    }
  };

  const updateSetting = (key, value) => {
    setStore({ [key]: value });
    if (key === "theme") {
      setTimeout(() => engineActions?.forceRebuildGrid(gridSize), 10);
    }
  };

  return (
    <>
      {modals.newProj && (
        <div className="fixed top-0 left-0 w-full h-full bg-[rgba(0,0,0,0.7)] backdrop-blur-[3px] flex justify-center items-center z-300">
          <div className="bg-(--bg-panel) border border-(--border) w-87.5 max-w-[90%] rounded-xl p-6.25 shadow-[0_20px_50px_rgba(0,0,0,0.5)] flex flex-col">
            <h2 className="text-[18px] mb-3.75 flex justify-between items-center border-b border-(--border) pb-2.5 text-(--text-main) font-bold">
              ✨ {T.newProj}{" "}
              <span
                className="cursor-pointer text-(--text-muted) hover:text-(--danger)"
                onClick={() => closeModal("newProj")}
              >
                ✕
              </span>
            </h2>
            <label className="block text-[13px] text-(--text-muted) mb-2">
              {T.gridTiles}
            </label>
            <input
              type="number"
              className="w-full bg-(--bg-dark) text-(--text-main) border border-(--border) p-2.5 rounded-sm outline-none focus:border-(--accent)"
              value={tempGrid}
              onChange={(e) => setTempGrid(Number(e.target.value))}
            />
            <p className="text-[11px] text-(--warning) mt-2 mb-3.75">
              {T.warnClear}
            </p>
            <Button
              variant="accent"
              className="w-full justify-center py-2.5! font-semibold!"
              onClick={handleCreateNew}
            >
              {T.createProj}
            </Button>
          </div>
        </div>
      )}

      {modals.saveProj && (
        <div className="fixed top-0 left-0 w-full h-full bg-[rgba(0,0,0,0.7)] backdrop-blur-[3px] flex justify-center items-center z-300">
          <div className="bg-(--bg-panel) border border-(--border) w-87.5 max-w-[90%] rounded-xl p-6.25 shadow-[0_20px_50px_rgba(0,0,0,0.5)] flex flex-col">
            <h2 className="text-[18px] mb-3.75 flex justify-between items-center border-b border-(--border) pb-2.5 text-(--text-main) font-bold">
              💾 {T.saveProj}{" "}
              <span
                className="cursor-pointer text-(--text-muted) hover:text-(--danger)"
                onClick={() => closeModal("saveProj")}
              >
                ✕
              </span>
            </h2>
            <label className="block text-[13px] text-(--text-muted) mb-2">
              {T.projName}
            </label>
            <input
              type="text"
              className="w-full bg-(--bg-dark) text-(--text-main) border border-(--border) p-2.5 rounded-sm outline-none focus:border-(--accent) mb-3.75"
              value={projName}
              onChange={(e) => setProjName(e.target.value)}
              placeholder="Contoh: Rumah Voxelku"
            />
            <Button
              variant="accent"
              className="w-full justify-center py-2.5! font-semibold!"
              onClick={handleSave}
            >
              {T.saveNow}
            </Button>
          </div>
        </div>
      )}

      {modals.loadProj && (
        <div className="fixed top-0 left-0 w-full h-full bg-[rgba(0,0,0,0.7)] backdrop-blur-[3px] flex justify-center items-center z-300">
          <div className="bg-(--bg-panel) border border-(--border) w-112.5 max-w-[90%] rounded-xl p-6.25 shadow-[0_20px_50px_rgba(0,0,0,0.5)] flex flex-col">
            <h2 className="text-[18px] mb-3.75 flex justify-between items-center border-b border-(--border) pb-2.5 text-(--text-main) font-bold">
              📂 {T.loadProj}{" "}
              <span
                className="cursor-pointer text-(--text-muted) hover:text-(--danger)"
                onClick={() => closeModal("loadProj")}
              >
                ✕
              </span>
            </h2>
            <div className="max-h-62.5 overflow-y-auto bg-(--bg-dark) border border-(--border) rounded-md p-1.25 mb-3.75">
              {savedList.length === 0 ? (
                <div className="p-7.5 text-center text-(--text-muted) border border-dashed border-(--border) rounded-md">
                  {T.noSaves}
                </div>
              ) : (
                savedList.map((p) => (
                  <div
                    key={p.id}
                    className="flex justify-between items-center p-2.5 border-b border-(--border) hover:bg-(--bg-panel) last:border-b-0"
                  >
                    <div className="flex flex-col gap-1">
                      <span className="font-semibold text-[13px] text-(--text-main)">
                        {p.name}
                      </span>
                      <span className="text-[11px] text-(--text-muted)">
                        {p.date} • Grid: {p.data.g}x{p.data.g} • Voxel:{" "}
                        {p.data.v.length}
                      </span>
                    </div>
                    <div className="flex gap-1.25">
                      <Button variant="accent" onClick={() => handleLoad(p)}>
                        Load
                      </Button>
                      <Button
                        variant="danger"
                        onClick={() => handleDeleteSave(p.id)}
                      >
                        <svg
                          viewBox="0 0 24 24"
                          style={{
                            width: 14,
                            height: 14,
                            stroke: "currentColor",
                            fill: "none",
                            strokeWidth: 2,
                            strokeLinecap: "round",
                            strokeLinejoin: "round",
                          }}
                        >
                          <polyline points="3 6 5 6 21 6" />
                          <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                        </svg>
                      </Button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}

      {modals.clearConfirm && (
        <div className="fixed top-0 left-0 w-full h-full bg-[rgba(0,0,0,0.7)] backdrop-blur-[3px] flex justify-center items-center z-300">
          <div className="bg-(--bg-panel) border border-(--border) w-87.5 max-w-[90%] rounded-xl p-6.25 shadow-[0_20px_50px_rgba(0,0,0,0.5)] flex flex-col">
            <h2 className="text-[18px] mb-3.75 flex justify-between items-center border-b border-[rgba(239,68,68,0.3)] pb-2.5 text-(--danger) font-bold">
              ⚠️ {T.clearAll}
            </h2>
            <p className="text-[13px] text-(--text-main) mb-6.25 mt-3.75 leading-normal">
              {T.clearWarn}
            </p>
            <div className="flex gap-2.5">
              <Button
                className="w-full justify-center py-2.5! font-semibold!"
                onClick={() => closeModal("clearConfirm")}
              >
                {T.cancel}
              </Button>
              <Button
                variant="danger"
                className="w-full justify-center py-2.5! font-semibold!"
                onClick={() => {
                  engineActions?.clearAll();
                  closeModal("clearConfirm");
                }}
              >
                {T.yesClear}
              </Button>
            </div>
          </div>
        </div>
      )}

      {modals.export && (
        <div className="fixed top-0 left-0 w-full h-full bg-[rgba(0,0,0,0.7)] backdrop-blur-[3px] flex justify-center items-center z-300">
          <div className="bg-(--bg-panel) border border-(--border) w-137.5 max-w-[90%] rounded-xl p-6.25 shadow-[0_20px_50px_rgba(0,0,0,0.5)] flex flex-col">
            <h2 className="text-[18px] mb-3.75 flex justify-between items-center border-b border-(--border) pb-2.5 text-(--text-main) font-bold">
              🚀 {T.exportHead}{" "}
              <span
                className="cursor-pointer text-(--text-muted) hover:text-(--danger)"
                onClick={() => closeModal("export")}
              >
                ✕
              </span>
            </h2>
            <div className="grid grid-cols-2 gap-2.5 mb-3.75">
              <div>
                <label className="block text-[13px] text-(--text-muted) mb-1.5">
                  {T.format}
                </label>
                <select
                  className="w-full bg-(--bg-dark) text-(--text-main) border border-(--border) p-2.5 rounded-sm outline-none focus:border-(--accent)"
                  value={exportOpt.format}
                  onChange={(e) =>
                    setExportOpt({ ...exportOpt, format: e.target.value })
                  }
                >
                  <option value="html_3d">HTML (Interactive 3D)</option>
                  <option value="html_css">HTML (Static CSS)</option>
                  <option value="obj">OBJ (Standard 3D Model)</option>
                  <option value="json">JSON (Data)</option>
                </select>
              </div>
              {exportOpt.format === "html_3d" && (
                <div>
                  <label className="block text-[13px] text-(--text-muted) mb-1.5">
                    {T.bgCol}
                  </label>
                  <input
                    type="color"
                    className="w-full h-8.75 rounded-sm cursor-pointer bg-transparent border-none p-0 [&::-webkit-color-swatch-wrapper]:p-0 [&::-webkit-color-swatch]:border [&::-webkit-color-swatch]:border-(--border) [&::-webkit-color-swatch]:rounded-sm"
                    value={exportOpt.bg}
                    onChange={(e) =>
                      setExportOpt({ ...exportOpt, bg: e.target.value })
                    }
                  />
                </div>
              )}
              {exportOpt.format === "html_3d" && (
                <div className="col-span-2">
                  <label className="flex items-center gap-2 cursor-pointer text-[13px] text-(--text-main)">
                    <input
                      type="checkbox"
                      checked={exportOpt.autoRotate}
                      onChange={(e) =>
                        setExportOpt({
                          ...exportOpt,
                          autoRotate: e.target.checked,
                        })
                      }
                    />{" "}
                    {T.autoRot}
                  </label>
                </div>
              )}
            </div>
            <textarea
              readOnly
              className="w-full h-50 bg-(--bg-dark) text-[#10b981] border border-(--border) rounded-md p-3.75 font-mono text-[12px] resize-none mb-3.75 whitespace-pre outline-none"
              value={exportCodeStr}
            />
            <div className="flex gap-2.5 mt-3.75">
              <Button
                className="w-full justify-center py-2.5! font-semibold!"
                onClick={() => {
                  navigator.clipboard.writeText(exportCodeStr);
                  alert(T.copied);
                }}
              >
                📋 {T.copyCode}
              </Button>
              <Button
                variant="accent"
                className="w-full justify-center py-2.5! font-semibold!"
                onClick={() =>
                  downloadExportFile(exportCodeStr, exportOpt.format)
                }
              >
                💾 {T.dlFile}
              </Button>
            </div>
          </div>
        </div>
      )}

      {modals.settings && (
        <div className="fixed top-0 left-0 w-full h-full bg-[rgba(0,0,0,0.7)] backdrop-blur-[3px] flex justify-center items-center z-300">
          <div className="bg-(--bg-panel) border border-(--border) w-100 max-w-[90%] rounded-xl p-6.25 shadow-[0_20px_50px_rgba(0,0,0,0.5)] flex flex-col">
            <h2 className="text-[18px] mb-3.75 flex justify-between items-center border-b border-(--border) pb-2.5 text-(--text-main) font-bold">
              ⚙️ {T.settings}{" "}
              <span
                className="cursor-pointer text-(--text-muted) hover:text-(--danger)"
                onClick={() => closeModal("settings")}
              >
                ✕
              </span>
            </h2>
            <div className="flex flex-col gap-3.75 mt-3.75 mb-6.25">
              <div>
                <label className="block text-[13px] text-(--text-muted) mb-2">
                  {T.lang} / Language
                </label>
                <select
                  className="w-full bg-(--bg-dark) text-(--text-main) border border-(--border) p-2.5 rounded-sm outline-none focus:border-(--accent)"
                  value={lang}
                  onChange={(e) => updateSetting("lang", e.target.value)}
                >
                  <option value="id">Bahasa Indonesia</option>
                  <option value="en">English</option>
                </select>
              </div>
              <div>
                <label className="block text-[13px] text-(--text-muted) mb-2">
                  {T.theme}
                </label>
                <select
                  className="w-full bg-(--bg-dark) text-(--text-main) border border-(--border) p-2.5 rounded-sm outline-none focus:border-(--accent)"
                  value={theme}
                  onChange={(e) => updateSetting("theme", e.target.value)}
                >
                  <option value="dark">{T.themeDark}</option>
                  <option value="light">{T.themeLight}</option>
                </select>
              </div>
              <div>
                <label className="block text-[13px] text-(--text-muted) mb-2">
                  Gemini API Key (AI Agent)
                </label>
                <input
                  type="password"
                  placeholder="AI token: AIzaSy..."
                  className="w-full bg-(--bg-dark) text-(--text-main) border border-(--border) p-2.5 rounded-sm outline-none focus:border-(--accent)"
                  value={geminiApiKey}
                  onChange={(e) =>
                    updateSetting("geminiApiKey", e.target.value)
                  }
                />
              </div>
              <div className="mt-2.5">
                <label className="flex items-center gap-2 cursor-pointer text-[13px] text-(--text-main)">
                  <input
                    type="checkbox"
                    checked={showTooltips}
                    onChange={(e) =>
                      updateSetting("showTooltips", e.target.checked)
                    }
                  />
                  {T.showTooltips}
                </label>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

export function AIPanel() {
  const {
    showAiPanel,
    setShowAiPanel,
    t,
    engineActions,
    gridSize,
    geminiApiKey,
  } = useStore();
  const [prompt, setPrompt] = useState("");
  const [loading, setLoading] = useState(false);
  const T = t();
  if (!showAiPanel) return null;
  const generateWithAI = async () => {
    if (!prompt.trim()) return;
    if (!geminiApiKey || geminiApiKey.trim() === "") {
      alert(
        "Mohon masukkan Gemini API Key di menu Pengaturan (Settings) terlebih dahulu.",
      );
      return;
    }
    setLoading(true);
    const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-preview-09-2025:generateContent?key=${geminiApiKey.trim()}`;
    let currentContext = (engineActions?.getVoxelsData() || [])
      .map((v) => `[${v.gx},${v.gy},${v.gz},${v.c}]`)
      .join(";");
    let contextPrompt =
      currentContext.length > 0
        ? `Konteks kanvas saat ini (x,y,z,colorHex): ${currentContext}. Anda harus mengingat struktur ini dan jangan menimpanya.`
        : `Kanvas kosong. Bangun bebas.`;
    const systemPrompt = `Anda adalah Voxel Art Generator Agent. Grid 3D ${gridSize}x${gridSize}. Batas: X(0-${gridSize - 1}), Z(0-${gridSize - 1}), Y(0 ke atas). Tengah: X=${Math.floor(gridSize / 2)}, Z=${Math.floor(gridSize / 2)}. ${contextPrompt} Tugas: Buat JSON koordinat voxel berdasarkan instruksi. PENTING: Output HARUS JSON valid tanpa markdown. format schema: { "voxels": [{"x":int, "y":int, "z":int, "color": "#hex"}] }`;
    const payload = {
      contents: [{ parts: [{ text: prompt }] }],
      systemInstruction: { parts: [{ text: systemPrompt }] },
      generationConfig: { responseMimeType: "application/json" },
    };
    try {
      const res = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!res.ok)
        throw new Error("Gagal mengambil respon. Pastikan API Key valid.");
      const data = await res.json();
      const text = data.candidates?.[0]?.content?.parts?.[0]?.text;
      if (text) {
        JSON.parse(text).voxels.forEach((v) => {
          let nx = Math.max(0, Math.min(gridSize - 1, v.x)),
            ny = Math.max(0, v.y),
            nz = Math.max(0, Math.min(gridSize - 1, v.z));
          engineActions?.manualAddVoxel(
            nx,
            ny,
            nz,
            v.color.startsWith("#") ? v.color : `#${v.color}`,
          );
        });
        engineActions?.manualSaveState();
        setPrompt("");
      }
    } catch (err) {
      console.error("AI Error:", err);
      alert(err.message);
    }
    setLoading(false);
    setShowAiPanel(false);
  };

  return (
    <div className="fixed bottom-5 right-5 w-87.5 bg-(--bg-panel) border border-(--accent) rounded-xl p-5 shadow-[0_10px_40px_rgba(0,0,0,0.5)] z-400 flex flex-col gap-2.5 transition-colors duration-300">
      <h3 className="text-[14px] font-bold m-0 flex justify-between items-center text-(--accent)">
        ✨ Gemini Voxel Agent{" "}
        <span
          className="cursor-pointer text-(--text-muted) hover:text-(--text-main)"
          onClick={() => setShowAiPanel(false)}
        >
          ✕
        </span>
      </h3>
      {loading ? (
        <div className="flex items-center justify-center gap-2.5 h-20 text-[12px] font-bold text-(--accent)">
          <div className="w-5 h-5 border-[3px] rounded-full animate-spin border-(--border) border-t-(--accent)" />{" "}
          {T.aiLoading}
        </div>
      ) : (
        <div className="flex flex-col gap-2.5">
          <textarea
            className="w-full h-20 bg-(--bg-dark) text-(--text-main) border border-(--border) rounded-md p-2.5 text-[12px] resize-none outline-none focus:border-(--accent) transition-colors"
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            placeholder={T.aiPlaceholder}
          />
          <Button
            variant="accent"
            className="w-full justify-center py-2.5! font-semibold! m-0 border-none bg-[linear-gradient(135deg,#10b981,#0ea5e9)]"
            onClick={generateWithAI}
          >
            🚀 {T.aiGenerate}
          </Button>
          <span className="text-[10px] leading-[1.3] text-(--text-muted)">
            {T.aiHint}
          </span>
        </div>
      )}
    </div>
  );
}
