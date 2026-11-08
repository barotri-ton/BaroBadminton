# Technical Architecture

React + TypeScript + Vite frontend, React Three Fiber renderer, deterministic fixed-step game simulation isolated from rendering. Rapier integration is planned, not implemented. Zustand planned for application state.

## Boundaries
- Renderer reads interpolated immutable simulation snapshots.
- Simulation processes timestamped inputs at a fixed 1/120 s timestep.
- Rules engine exclusively owns scores and match lifecycle.
- Equipment catalogue stores manufacturer facts separately from estimated gameplay coefficients.
- Online authoritative room server is deferred until local gameplay passes QA.
- Vercel deployment of frontend does not imply online multiplayer functionality.

## Localization
All player-facing text uses centralized `vi-VN` translation data. UTF-8 and Vietnamese text layout tests are required.
