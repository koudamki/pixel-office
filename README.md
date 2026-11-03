# PAI's Office

A small, illustrated pixel-office demo with a local-only interactive layer. Explore teammates, inspect their sample work, filter the roster, and try the task board. The office scene and activity are demo data; the task board does not connect to a real project tracker or deployment service.

## Run

Serve the repository root with any static HTTP server, then open the local URL in a browser. The office artwork and character sprites are loaded by `public/fx.js`; the enhanced dashboard is in `public/interactions.js`.

## Interactions

- Select a teammate in the scene or roster to view their role, current task, status, and tools.
- Search the roster, show/hide name labels, and use the task board to mark demo tasks complete.
- The command box accepts a teammate name followed by a local demo instruction.
- Keyboard users can explore all teammates and controls without needing to click the canvas.

No account, telemetry, or external project integration is provided by this demo.
