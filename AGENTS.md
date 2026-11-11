# Repository notes

- This is a static browser game: open `index.html` directly or run `npx serve .` and visit `http://localhost:3000`. There is no package manifest, build step, or automated test suite; use `node --check game.js` for a focused syntax check and verify gameplay in a browser.
- `index.html` owns the fixed 800×600 canvas and loads `game.js` as a plain script. All gameplay, rendering, input, and the `requestAnimationFrame` loop live in `game.js`; keep canvas dimensions in sync with its `W`/`H` constants if changing them.
- Input distinguishes held keys (`keys`) from one-shot keydown events (`pressed` consumes `justPressed`); Space fires once per press and restarts after game over. Game states are `playing`, `dead`, and `gameover`; changes to respawn or restart should account for each branch in `update()`.
- README mentions power-ups and a shooting star, but neither exists in `game.js`; treat the implementation as authoritative when extending gameplay or documentation.
