# Error Log

## Resolved Issues

- **Kaboom module resolution failed (`Failed to resolve module specifier "kaboom"`).**
  - **Fix:** Removed bare `kaboom` imports from browser modules and relied on the global Kaboom initialization in `index.html`.

- **Missing `WEALTH_INCREMENT` export.**
  - **Fix:** Added `WEALTH_INCREMENT` to the exports in `src/globals.js`.

- **Missing `tileWidth`/`tileHeight` in `addLevel`.**
  - **Fix:** Added proper tile sizing and corrected config structure.

- **`solid()` undefined in Kaboom v3000.**
  - **Fix:** Replaced `solid()` with `body()`/`body({ isStatic: true })` for collision bodies.

- **Sprite atlas loading before scene creation (`Cannot read properties of null (reading 'data')`).**
  - **Fix:** Gated overworld initialization on `assetsReady` from `src/asset-manager.js`.

- **Asset path 404s.**
  - **Fix:** Updated atlas paths to use existing assets under `assets/`.

## Notes

If new runtime errors appear, append them here with the fix steps for future reference.
