# GAME DESIGN DOCUMENT & TECHNICAL SPECIFICATION
**Project Title:** Career Quest
**Engine:** Kaboom.js v3 (Kaplay)
**Target Platform:** Web Browser (Desktop)
**Architecture Mode:** Modular ES6 JavaScript

## 1. TECHNICAL ARCHITECTURE & STRICT RULES
All AI Agents (Designer, Coder, QA) MUST adhere to these foundational rules. Violation of these rules will result in project failure.

### 1.1 UI & HUD Rendering (CRITICAL)
* **RULE:** DO NOT draw user interfaces on the Kaboom canvas.
* **FORBIDDEN:** `add([text(...)])`, `rect()`, or any canvas-based drawing for menus, dashboards, or pop-ups.
* **REQUIRED:** All UI MUST be built using standard HTML elements (`<div>`, `<span>`) and styled with modern CSS. 
* **UI Overlay:** The UI must sit in an absolutely positioned `#ui-layer` over the `<canvas>`.
* **State Updates:** Update the UI strictly via DOM manipulation in JavaScript (e.g., `document.getElementById('wealth').innerText = personalWealth;`).
* **UI STYLING RULES:** The dashboard must look like a modern commercial web app. Use Flexbox for layout. Import and use a modern Google Font. Use a glassmorphism effect for the dashboard container (e.g., background: rgba(20, 20, 30, 0.8); backdrop-filter: blur(8px);).Add soft drop shadows, rounded corners (border-radius: 12px), and padding.
The #ui-layer MUST be position: absolute; top: 0; left: 0; pointer-events: none; so it floats beautifully over the Kaboom game canvas.

### 1.2 Asset Pipeline & Transparency (CRITICAL)
* **RULE:** All graphical assets are external `.png` files. No programmatic geometric shapes for entities.
* **LOADING:** Use `loadSpriteAtlas()` exclusively to map sprite coordinates.
* **TRANSPARENCY BUG FIX:** The source `.png` files have a solid magenta background (`#FF00FF`). When loading any sprite or atlas, you MUST pass the configuration: `transColor: rgb(255, 0, 255)`. If you omit this, the game will render a "magenta void."

### 1.3 File Structure
The project must be strictly modular. Do not output one massive `main.js` file.
* `index.html`: Contains the canvas container and all hidden/visible UI DOM elements.
* `style.css`: Dark, modern, semi-transparent sleek UI styling.
* `src/asset-manager.js`: Contains all `loadSpriteAtlas` and sound loading logic.
* `src/globals.js`: Holds global state variables (`wealth`, `energy`).
* `src/overworld.js`: The main Hub map and movement logic.
* `src/industries/*.js`: Separate files for each of the 5 industry mini-games.

---

## 2. CORE GAMEPLAY MECHANICS & GLOBAL STATE

### 2.1 Player Stats
* **Wealth ($):** Starts at `$0`. Used to pay for living expenses. Increased by completing mini-games.
* **Energy:** Starts at `100/100`. Maximum is 100.
* **Depletion:** Entering ANY Industry mini-game costs strictly `30 Energy`.
* **Exhaustion State:** If Energy is `< 30`, the player CANNOT enter a building. An HTML Toast notification must appear saying: "Burnt Out! Go home to rest."

### 2.2 The Resting Mechanic ("Home")
* The Overworld map contains a specific "Home" zone or building.
* When the player overlaps the Home zone, prompt: "Press R to Rest ($500)".
* Pressing 'R' resets Energy to 100 but subtracts $500 from Wealth. 
* Update the HTML UI immediately after resting.

### 2.3 The Paycheck System
* Upon completing or failing an industry mini-game, the Kaboom game loop pauses.
* An HTML `<div id="paycheck-modal">` becomes visible (`display: flex`).
* It must calculate and display: Base Pay + Performance Bonus = Total Earned.
* The modal must have a "Continue" HTML button that hides the modal, updates global Wealth, and returns the player to the Overworld scene.

---

## 3. THE OVERWORLD (HUB) SCENE

* **Map Generation:** Use `addLevel()` with a mapped array matrix to draw the environment.
* **Camera:** The camera must follow the player continuously (`camPos(player.pos)`) and be zoomed in (`camScale(2.5)` or `3`).
* **Interactions:** Each Industry Building is an object with a solid body and a unique collision tag (e.g., `"finance_bldg"`).
* **Triggers:** When the player collides with a building, display an HTML tooltip: "Press SPACE to enter [Industry Name]". Pressing SPACE triggers `k.go('finance_lobby')`.

---

## 4. THE 5 INDUSTRIES & MINI-GAMES (PROFESSIONAL TASKS)

Each industry features realistic, methodical brain-teasers representing actual working world scenarios. There are no frantic arcade features—just calculated decision-making.

### 4.0 UI & OVERWORLD REVAMP RULES (PIXEL ART NATURE)

**Objective**: Transition the game interface and the overworld hub into an engaging, nostalgic, and thematic 8-bit/16-bit pixel art nature world.

1. **Retro Aesthetic UI:** Change the main font to 'Pixelify Sans' (or a similar pixelated font) to establish a retro feel. Drop the glassmorphism (`backdrop-filter`) and use solid dark/retro panels with chunky hard borders (`border: 4px solid #fff; border-radius: 0`) and sharp pixelated drop-shadows instead of soft ones (`box-shadow: 4px 4px 0px #000`).
2. **Main World (Dashboard) UI Redesign:** Keep the dashboard floaty, but apply the pixel art styling (solid colors, hard borders, prominent pixel shadows) and use the green "nature" palette for the game engine canvas rather than the dark modern look. 
3. **The Canvas (Nature Map):** The Kaplay background must be a lush nature green (`[82, 134, 49]`). Paths (`P`) should look like dirt roads (`window.color(164, 132, 94)` with grass/dark outlines `window.color(72, 124, 39)`).
4. **Player & Buildings**: Switch primitives from `circle()` to `rect()` to closely mimic blocky/pixelated graphics on the overworld. Keep the layout a cohesive Town Square, but the art style must reflect the older nature/RPG look.

### 4.1 Finance
*   **Job 1: Accountant (Ledger Auditing):** You are presented with a series of financial equations representing ledger entries (e.g., `Revenue 50 - Cost 20 = Net 30`). One entry has a mathematical error. Use arrow keys to select the incorrect entry to audit it.
*   **Job 2: Investment Analyst (Portfolio Matching):** A client presents strict investment requirements (e.g., "Low Risk, Tech Sector"). You must evaluate three different portfolios and select the one that fits perfectly. 

### 4.2 Technology
*   **Job 1: Software Engineer (Logic Gates):** You are debugging code logic. An operation is broken. Given inputs (e.g., `Input A: True`, `Input B: False`) and an expected output (`Expected: True`), choose the correct logical operator (`AND` or `OR`) to fix the code block.
*   **Job 2: Data Analyst (Data Scrubbing):** A static database grid is shown with various corrupted data nodes (represented by properties like color or value). You are prompted to "Quarantine compromised servers" by clicking the correct server dots based on the prompt before submitting the query.

### 4.3 Healthcare
*   **Job 1: Diagnostician (Symptom Matching):** A patient chart appears with 2-3 symptoms. You must reference a medical manual to select the correct diagnosis from a multiple-choice list.
*   **Job 2: Lab Technician (Chemical Synthesis):** You need to synthesize a specific medicine color. Adjust the RGB (Red, Green, Blue) chemical drops incrementally until the resulting mixture matches the target prescription.

### 4.4 Engineering
*   **Job 1: Civil Engineer (Load Balancing):** You must distribute physical weight properly. A bridge has a maximum load capacity. You must assign numerical weights to different pillars so that the formula perfectly balances without exceeding tolerance.
*   **Job 2: Systems Engineer (Circuit Flow):** An electrical grid contains rotated wire nodes. Click/interact to rotate the nodes and create an unbroken path from the generator to the output terminal.

### 4.5 Creative
*   **Job 1: Graphic Designer (Color Theory):** Match a client's branding request by mixing visual elements or tweaking hue/saturation sliders to recreate a target reference logo.
*   **Job 2: Copywriter (Proofreading):** A client draft is presented. Find and select the grammatical error or tone-inconsistency in the paragraph to finalize the marketing copy.

---

## 6. UI/UX POLISH, JUICE & PERFORMANCE (ENGAGEMENT DRIVERS)

To ensure the game is captivating, has incredible "Game Feel," and completely eliminates "laggy" or "trippy" behaviors, all future implementations must adhere to these UI/UX laws:

### 6.1 Performance & Anti-Jitter (Fixing the "Trippy" Camera)
*   **Camera Smoothing (Lerping):** NEVER snap the camera directly to the player position instantly every frame. This creates micro-stutters and trippy rendering on high refresh rate monitors. Always use interpolation (lerp).
    *   *Implementation:* `window.camPos(window.camPos().lerp(player.pos, window.dt() * 4));`
*   **Resize Handling:** Do not manually manipulate `<canvas>` dimensions via global `window.addEventListener("resize")`. Kaplay handles viewport resizing natively. Manual DOM dimension overwrites constantly reset the WebGL context, causing massive lag and aspect shifts.
*   **Z-Indexing & Pointer Events:** The Kaboom canvas should sit cleanly at `z-index: 0`. The DOM `#ui-layer` must be `z-index: 10` with `pointer-events: none`. Interactive elements (modals, buttons) must specifically re-enable `pointer-events: auto`.

### 6.2 "Game Feel" & Juice (Max Engagement)
*   **Modal Pop-Ins:** Modals must not just statically "appear" (`display: block`). They require CSS structural animations (e.g., `@keyframes popIn`) using cubic-bezier timing so they bounce and snap into view satisfyingly.
*   **Hover States & Tactility:** Buttons must mimic physical retro arcade hardware. When clicked (`:active`), they must press down (`transform: translate(2px, 2px)`) and lose their drop shadow. 
*   **Feedback Particles:** High-impact actions (earning a big paycheck, finishing a job, resting) should eventually be accompanied by visual celebrations (CSS confetti, Kaplay particle bursts, or screen shakes).

### 6.3 State Transitions
*   **No Hard Cuts:** Moving from the overworld to a minigame should trigger a quick CSS fade-to-black overlay or Kaplay rectangle wipe to ease the player's eyes and maintain immersion.

### 6.5 Minigame UI & Standardized Wrappers (The DOM HUD)
*   **Rule:** Stop drawing hard-to-read, unstyled static text (Instructions, Scores, Titles) directly on the Kaplay canvas inside minigames.
*   **Implementation:** Use a dedicated `#minigame-hud` HTML DOM overlay to display the current Job Title, Instructions, and Score. This provides beautiful pixel-art borders, legible typography, and CSS drop-shadows that the canvas text cannot natively match.
*   **Visual Polish:** The Kaplay backgrounds behind the minigames should utilize deep retro colors (e.g. `[15, 20, 30]` or dark green tints) to make the DOM UI and minigame sprites pop visually. 
*   **Lifecycle:** The `#minigame-hud` must dynamically fade in when a minigame starts and completely hide when returning to the `overworld`.

---

## 7. QA DEPLOYMENT CHECKLIST
Before saving code to the disk, the QA Agent MUST verify:
1. Is `transColor: rgb(255, 0, 255)` present in the asset loader?
2. Are `wealth` and `energy` updated via DOM methods correctly?
3. Does `addLevel()` have a properly formatted `tiles` dictionary mapping characters to component arrays?