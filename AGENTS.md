# NeuroNova

A self-contained brain-training app built with Expo (SDK 51) + React Native + TypeScript. No backend — all state is mock data held in a React Context (`src/store/GameStore.tsx`).

## Cursor Cloud specific instructions

- This is a single Expo app. In the cloud VM (no simulator/emulator), run and test it as a **web** app: `npx expo start --web --port 8081`, then open `http://localhost:8081`. Standard scripts live in `package.json` (`start`, `web`, `typecheck`).
- There is no separate lint config; `npm run typecheck` (`tsc --noEmit`) is the lint/static-check step.
- Dependency gotcha (already handled via an npm `overrides` in `package.json`): `@expo/vector-icons` declares an open `expo-font` peer (`"*"`), which npm otherwise resolves to `expo-font@56`. That version's web build imports `registerWebModule`/`NativeModule` from `expo-modules-core`, which SDK 51's `expo-modules-core@1.12.26` does not export, so the **web app crashes at runtime**. The override pins `expo-font` to `12.0.10` (the version `expo@51` ships). Keep this override unless the Expo SDK is upgraded.
- When testing in a browser, if a previous Chrome tab crashed, do a hard refresh (Ctrl+Shift+R) on `localhost:8081`; stale tabs can show "Aw, Snap!" before the app loads.
- Metro bundles on first request, so the first page load after starting the server takes a few seconds.
