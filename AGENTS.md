# Repository Guidelines

## Project Structure & Module Organization
- `sliderberg.php` – Plugin bootstrap, hooks, asset registration.
- `src/` – TypeScript/React for the block editor: `blocks/`, `components/`, `hooks/`, `utils/`, `frontend/`, `view.ts`. Entry points are in `webpack.config.js` (`index`, `editor`, `view`).
- `includes/` – PHP renderers, security utilities, and templates (`includes/templates/`).
- `build/` – Compiled assets: `index.js/css`, `editor.js`, `view.js`, `style-index.css`.
- `assets/` – Static images/CSS used in admin screens. `languages/` – translations. `vendor/` – Freemius SDK (do not edit manually).

## Build, Test, and Development Commands
- `npm run start` – Watch/dev build via `@wordpress/scripts`.
- `npm run build` – Production build to `build/`.
- `npm run export` – Build and create a distributable plugin zip.
- `npm run lint` – ESLint (WordPress config). `npm run lint:fix` – auto-fix.
- Local run: activate the plugin in WordPress, then edit a post and add “Sliderberg” blocks.

## Coding Style & Naming Conventions
- TypeScript: strict mode; prefer explicit types; avoid `any`.
- Formatting: 2-space indentation, single quotes, trailing commas per ESLint.
- Naming: files/dirs `kebab-case`; React components `PascalCase`; functions `camelCase`.
- Prefix CSS classes with `sliderberg-`; prefix PHP functions with `sliderberg_`.
- Internationalization: use `__()`, `_x()` with text domain `sliderberg`.
- Security: escape and sanitize (`esc_attr`, `esc_html`, `wp_kses_post`).

## Testing Guidelines
- No automated tests yet. Manual QA checklist:
  - Build, activate plugin, add “Sliderberg” blocks in the editor.
  - Verify navigation, transitions, and responsive behavior in editor and frontend.
  - Confirm assets enqueue only when `has_block('sliderberg/sliderberg')` is true.
  - Use browser console and `WP_DEBUG` for diagnostics.

## Commit & Pull Request Guidelines
- Use Conventional Commits: `feat:`, `fix:`, `perf:`, `chore:`, `refactor:`.
- PRs: concise description, linked issues, before/after screenshots or a short GIF, and test steps.
- Update `readme.txt` and any changed strings. Do not commit `node_modules/`; commit `build/` for releases.

## Security & Configuration Tips
- Reuse helpers in `includes/security.php` (e.g., `sliderberg_validate_color`, `sliderberg_check_rate_limit`, `sliderberg_validate_ajax_origin`).
- Always verify nonces and capabilities for AJAX; never trust user input.
- Do not modify `vendor/` directly; coordinate SDK updates separately.
