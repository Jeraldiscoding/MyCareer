# Final Business - Career Life Simulator

A pixel-art career and life simulation web game built with [Kaplay.js](https://kaplayjs.com/).

Explore the retro-styled overworld, visit different industry buildings (Finance, Tech, Healthcare, Engineering, Creative), play mini-games to earn wealth, and manage your vitality by taking carefully-planned rests!

## 🚀 How to Run Locally

You need a basic HTTP server to serve the module game files.

1. **Clone this repository / Download the files.**
2. Open your terminal and navigate to the project folder.
3. Start a local server:
   * **If you have Python installed**, run:
     ```bash
     python3 -m http.server 8000
     ```
   * **If you have Node.js / NPM installed**, you can use `npx`:
     ```bash
     npx serve
     ```
4. Open your web browser and navigate to `http://localhost:8000` (or `http://localhost:3000` if using NPM).

## ✨ Features
- **Overworld Exploration:** Navigate a procedurally decorated, retro-styled map to find different job sectors and helpful NPCs.
- **Interactive Mini-games:** Work in different interactive industries, each featuring unique set-pieces, artwork, and gameplay mechanics.
- **Resource Management:** Balance your Energy and Wealth. Working at a job consumes energy, and going home to rest costs money but fully replenishes your capacity to work.
- **Retro Aesthetics:** High-contrast CRT-style HUDs, stylized monospace typography, and responsive, dynamically scaling graphic components.

## 🛠 Tech Stack
- HTML5 Canvas & CSS3
- Vanilla JavaScript (ES6 Modules)
- Kaplay.js (Kaboom.js successor)
