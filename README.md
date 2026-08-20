# KeyForge — Typing Speed & Accuracy Tester

A Monkeytype-inspired typing test built for programmers. Practice on real code snippets with syntax highlighting, or plain text — track your WPM, accuracy, streaks, and progress over time. Runs entirely in the browser as a single HTML file, no build step, no server, no dependencies.

## Features

- **Code mode** — type real snippets in JavaScript, Python, C++, or Java with syntax highlighting
- **Indentation-aware typing** — press `Tab` to insert correct indentation in one keystroke
- **Bracket/quote auto-skip** — mirrors how real editors auto-close brackets and quotes
- **Text mode** — plain-language sentences for non-code practice
- **Custom mode** — paste your own code or text to practice on
- **Zen mode** — no timer, no pressure, just typing
- **Challenge mode** — hit specific WPM/accuracy targets to unlock badges
- **Live stats** — real-time WPM and accuracy while you type
- **Results screen** — WPM-over-time graph, per-key error heatmap, achievement badges
- **Streaks & personal bests** — tracked locally across sessions
- **4 themes** — Amber Dark, Terminal Green, Dusk Violet, Paper Light, and Electric Navy (a glowing DAW-inspired look)
- **Mechanical keyboard sound** — synthesized click feedback (toggle on/off)

All data (history, streaks, best scores, achievements) is stored in the browser's `localStorage` — nothing leaves your machine.

## Files

```
index.html   → markup
style.css    → all styling and themes
script.js    → app logic
README.md    → this file
```

## Getting started

No installation needed. Just open `index.html` in any modern browser:

```bash
open index.html      # macOS
start index.html      # Windows
xdg-open index.html   # Linux
```

Or, to serve it locally:

```bash
python3 -m http.server 8000
# then visit http://localhost:8000/
```

## Controls

| Action | Key |
|---|---|
| Start typing | Just start typing in the text box |
| New test | `Tab` + `Enter` |
| Delete last character | `Backspace` |
| Indent | `Tab` |

## Tech

Plain HTML, CSS, and vanilla JavaScript, split into separate files. No frameworks, no build tools, no external JS dependencies. Fonts are loaded from Google Fonts via CDN.

## License

MIT — feel free to fork, modify, and use this however you like.
