# Voxel Studio Pro 🧱

Voxel Studio Pro is a lightweight, web-based 3D voxel editor built with React and Three.js. It features a robust set of drawing tools, plane locking, symmetry modeling, and an integrated Gemini AI Agent to generate voxel structures directly from text prompts.

## ✨ Features

- **Advanced Voxel Tools:** Select, Move (with clone), Pen, Line, Box, Erase, Paint, and Color Picker.
- **Gemini AI Agent:** Generate 3D voxel art automatically by typing prompts (requires Gemini API Key).
- **Smart Drawing Aids:**
  - X, Y, Z Plane Locking for precise extrusion.
  - X and Z Axis Symmetry (Mirror) drawing.
- **Local Project Management:** Save and load your projects directly to/from browser LocalStorage.
- **Multiple Export Formats:** Export your creations as `OBJ` (Standard 3D Model), `JSON`, `HTML (Interactive 3D)`, or `HTML (Static CSS)`.
- **Customization:** Adjustable grid sizes (16x16, 32x32, 64x64, or custom) and Dark/Light theme support.

## 🛠️ Tech Stack

- **Frontend:** React, Tailwind CSS
- **3D Engine:** Three.js
- **State Management:** Zustand (with persist middleware)
- **AI Integration:** Google Gemini API
- **Icons:** Custom SVG (Original)

## 🚀 Getting Started

To get a local copy up and running, follow these steps.

### Prerequisites

- Node.js and npm installed on your machine.

### Installation

1. Clone the repository:

   ```bash
   git clone https://github.com/rynsh1506/Voxel-Studio.git
   ```

2. Navigate to the project directory:
   ```bash
   cd Voxel-Studio
   ```
3. Install dependencies:
   ```bash
   npm install
   ```
4. Start the development server:
   ```bash
   npm run dev
   ```

## ⌨️ Keyboard Shortcuts

Speed up your workflow with these hotkeys:

**Tools:**

- `V` : Select Tool
- `M` : Move Tool (Hold `ALT` to Clone)
- `B` : Voxel Pen
- `L` : Line Tool
- `U` : Box Tool
- `E` : Eraser
- `P` : Paint Bucket
- `I` : Color Picker

**Actions & View:**

- `Ctrl + Z` : Undo
- `Ctrl + Shift + Y` : Redo
- `Ctrl + A` : Select All
- `Ctrl + S` : Save Project
- `Ctrl + E` : Export Menu
- `Delete` : Delete Selected Voxels
- `G` : Toggle Grid visibility
- `1` : Isometric View
- `2` : Top View
- `3` : Front View

**Drawing Aids:**

- `X` : Lock X-Axis
- `Y` : Lock Y-Axis
- `Z` : Lock Z-Axis
- `Right-Click (Hold)` : Orbit Camera

## 🤖 Setting Up Gemini AI Agent

To use the AI Agent feature:

1. Get a free API key from Google AI Studio.
2. Open the **Settings** menu (gear icon) in Voxel Studio Pro.
3. Paste your API key into the designated input field.
4. Open the AI Agent panel, type your prompt (e.g., "Build a red brick house"), and click Generate.

## 👨‍💻 Author

**Muhammad Riyansyah**

If you find this project helpful or just want to support my work, consider buying me a coffee!

[![ko-fi](https://ko-fi.com/img/githubbutton_sm.svg)](https://ko-fi.com/X8X31YLACE)

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.
