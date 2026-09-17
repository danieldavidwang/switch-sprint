# Switch Sprint

A fast-paced browser game that tests task switching through randomized arithmetic and visual matching challenges.

**Live demo:** https://danieldavidwang.github.io/switch-sprint/

## How it works

Each round displays the same arithmetic problem and two sets of arrows in both blocks, but only one block is active.

- **Top block active:** decide whether the arithmetic answer is odd.
- **Bottom block active:** decide whether the two arrow sets are identical.
- Answer using the on-screen buttons or the **Y / N** keys.
- Score as many correct answers as possible before the **2-minute timer** expires.

The game randomizes the arithmetic questions, arrow patterns, active task, and occasionally mirrors the layout to make switching between tasks less predictable.

## Features

- Randomized arithmetic and visual-comparison trials
- Dynamic task switching between two rule sets
- 2-minute timed game loop
- Score, accuracy, and best-streak tracking
- Keyboard and button controls
- Immediate visual feedback for correct and incorrect answers
- Responsive layout for smaller screens
- Top-10 leaderboard stored locally in the browser with `localStorage`
- Reduced-motion support for accessibility preferences

## Tech stack

- **HTML5** for the game structure and UI
- **CSS3** for responsive styling, animations, and task-state visuals
- **Vanilla JavaScript** for game logic, random trial generation, timing, scoring, input handling, and leaderboard persistence

## Run locally

No build step or dependencies are required.

1. Clone the repository:
   ```bash
   git clone https://github.com/danieldavidwang/switch-sprint.git
   ```
2. Open `index.html` in a browser.

## Project structure

```text
switch-sprint/
├── index.html   # Game interface and overlays
├── style.css    # Styling, responsive layout, and animations
└── script.js    # Game logic, scoring, timer, and leaderboard
```

## Gameplay goal

Switch Sprint is designed around quickly recognizing which rule currently applies, then making the correct decision under time pressure. The challenge comes from alternating between arithmetic parity checks and visual pattern comparison while maintaining speed and accuracy.
