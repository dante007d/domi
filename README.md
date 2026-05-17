# Domino's Effect 🏁

A high-performance, real-time multiplayer coding puzzle and platformer game! Players write Blockly instructions, solve algorithmic riddles, and complete precise timing platform zones together on a dynamic live-updating lobby leaderboard.

---

## 🎮 Game Architecture & Tech Stack

```
                     ┌────────────────────────┐
                     │     Player Client      │
                     │  Blockly + Game Loop   │
                     └───────────┬────────────┘
                                 │ WebSockets
                                 ▼
                     ┌────────────────────────┐
                     │   Multiplayer Server   │
                     │  Node.js + Socket.IO   │
                     └────────────────────────┘
```

* **Frontend**: Vanilla HTML5, Canvas API, CSS Grid, and custom-styled viewport themes. Includes an integrated Blockly compiler, Caesar wheel visualizers, and a complete floating Level Developer Panel.
* **Backend**: Node.js, Express, Socket.IO. Optimised with a **High-Performance Broadcast Throttle Engine** to comfortably host up to 200+ concurrent players.

---

## 🗺️ Campaign Map (25 Levels)
* **Levels 1 to 5**: 3D Maze Phase (Blockly directions).
* **Levels 6 to 10**: Blockly Programming & Logic Loops.
* **Levels 11 to 15**: Zone 1 - Compile or Die Puzzle Terminals.
* **Levels 16 to 20**: Zone 2 - Ouroboros Loops (Fixed Anchor logic statements).
* **Levels 21 to 25**: Zone 3 - The Final Gauntlet (High-intensity timing platformer).

---

## 🚀 How to Run Locally

### 1. Start the Multiplayer Server (Backend)
```bash
cd server
npm install
node blockly_server.js
```
The server will boot on port **3002**.

### 2. Start the Game Client (Frontend)
```bash
cd blocks
npm install
npm start
```
The client will serve on port **3000**. Open [http://localhost:3000](http://localhost:3000) to play, or [http://localhost:3000/admin.html](http://localhost:3000/admin.html) to manage sessions!

---

## 🛠️ Developer Control Panel (Level Editor)
When playing platformer levels (21–25), you can press **`E`** to toggle the Developer Panel:
* **Physics Editing**: Adjust gravity, speed, jump height, friction, and time scales in real time (updates instantly as you type).
* **Entity Placement**: Draw custom platforms, spinning saws, lasers, spikes, orbs, and exit gates.
* **Auto-Persistence**: Press **`S`** to save or simply press **`E`** to exit; your custom design and physics properties will auto-save to storage and reload automatically on level re-entry!
