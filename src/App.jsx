/* eslint-disable no-unused-vars */
import React, { useEffect } from "react";
import {
  TopMenu,
  Sidebar,
  PropertiesPanel,
  StatusBar,
  AppModals,
  AIPanel,
} from "./components/EditorUI";
import VoxelCanvas from "./components/VoxelCanvas";
import { useStore } from "./store/useStore";

export default function App() {
  const { theme } = useStore();

  useEffect(() => {
    const htmlRoot = document.documentElement;
    if (theme === "light") {
      htmlRoot.classList.remove("dark");
      htmlRoot.classList.add("theme-light");
    } else {
      htmlRoot.classList.remove("theme-light");
      htmlRoot.classList.add("dark");
    }
  }, [theme]);

  useEffect(() => {
    const handleKeyDown = (e) => {
      // Abaikan shortcut jika pengguna sedang mengetik di dalam input/textarea
      if (["INPUT", "TEXTAREA", "SELECT"].includes(e.target.tagName)) return;

      const k = e.key.toLowerCase();
      const s = useStore.getState();
      const engine = s.engineActions;
      if (!engine) return;

      if (e.key === "Escape") {
        engine.cancelDrawing();
        return;
      }

      if (e.ctrlKey) {
        if (k === "z" && e.shiftKey) {
          e.preventDefault();
          engine.redo();
        } else if (k === "z") {
          e.preventDefault();
          engine.undo();
        }
        if (k === "y") {
          e.preventDefault();
          engine.redo();
        }
        if (k === "a") {
          e.preventDefault();
          engine.selectAll();
        }
        if (k === "s") {
          e.preventDefault();
          s.openModal("saveProj");
        }
        if (k === "e") {
          e.preventDefault();
          s.openModal("export");
        }
      } else {
        if (k === "x") s.setStore({ axisLock: "x" });
        if (k === "y") s.setStore({ axisLock: "y" });
        if (k === "z") s.setStore({ axisLock: "z" });

        if (k === "m") {
          s.setStore({ currentTool: "move" });
          engine.cancelDrawing();
        }
        if (k === "v") {
          s.setStore({ currentTool: "select" });
          engine.cancelDrawing();
        }
        if (k === "b") {
          s.setStore({ currentTool: "pen" });
          engine.cancelDrawing();
        }
        if (k === "l") {
          s.setStore({ currentTool: "line" });
          engine.cancelDrawing();
        }
        if (k === "u") {
          s.setStore({ currentTool: "box" });
          engine.cancelDrawing();
        }
        if (k === "e") {
          s.setStore({ currentTool: "erase" });
          engine.cancelDrawing();
        }
        if (k === "p") {
          s.setStore({ currentTool: "paint" });
          engine.cancelDrawing();
        }
        if (k === "i") {
          s.setStore({ currentTool: "pick" });
          engine.cancelDrawing();
        }

        if (k === "g") {
          s.setStore({ showGrid: !s.showGrid });
          setTimeout(() => engine.toggleGrid(), 50);
        }
        if (k === "1") {
          s.setStore({ activeView: "iso" });
          engine.setView("iso");
        }
        if (k === "2") {
          s.setStore({ activeView: "top" });
          engine.setView("top");
        }
        if (k === "3") {
          s.setStore({ activeView: "front" });
          engine.setView("front");
        }

        if (e.key === "Delete") engine.deleteSelected();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  return (
    <div
      className="flex flex-col h-screen w-full overflow-hidden select-none font-sans"
      style={{ backgroundColor: "var(--bg-dark)", color: "var(--text-main)" }}
    >
      <TopMenu />
      <div className="flex flex-1 h-[calc(100vh-76px)] relative">
        <Sidebar />
        <VoxelCanvas />
        <PropertiesPanel />
      </div>
      <StatusBar />
      <AppModals />
      <AIPanel />
    </div>
  );
}
