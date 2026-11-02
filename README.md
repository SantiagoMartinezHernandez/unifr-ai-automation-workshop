# The Unfair Advantage: Practical AI Automation (UniFR Workshop Command Center)

Interactive, gamified, 7-module web application designed for the 4-hour workshop at the **University of Fribourg (UniFR)** (*Teach and Learn Together Days*).

## ✨ Key Architectural Features
- **Strict Single-View Switching (No Endless Scrolling):** Left collapsible sidebar swaps between the 7 modules (`#view-1` to `#view-7`) with hash routing for seamless GitHub Pages compatibility.
- **Projector / Lecture Mode Toggle:** One click in the top bar increases base typography by `+20%` and hides secondary UI hints for 16:9 classroom projection.
- **Centralized Configuration (`config.js`):** Update your GitHub URL, LinkedIn URL, Graduation Form URL, schedule blocks, and prompts in one file.
- **One-Click Copy Prompt & GAS Code Cards:** Includes syntax highlighting, `ALL CAPS` edit indicators, emerald glow state (`Copied! Ready to Paste ✓`), and micro-confetti feedback.
- **Interactive 5-Node Spreadsheet Bridge Pipeline:** Animated SVG/CSS pipeline diagram with live node inspector and packet simulation.

## 🛠️ How to Customize Links & Prompts
Open [`config.js`](./config.js) and edit the `window.WORKSHOP_CONFIG.links` object at the top of the file:
- `githubProfile` / `githubRepo`
- `linkedin` / `email`
- `graduationFormUrl` (Automatically powers both the **Trigger My Graduation Certificate** button and the live **QR Code** in Module 07!)

## 🚀 Deploying to GitHub Pages
1. Push this folder to a GitHub repository.
2. Go to **Settings → Pages**.
3. Under **Build and deployment**, select **Deploy from a branch** → `main` / `/ (root)`.
4. Your interactive workshop command center will be live within 60 seconds!

