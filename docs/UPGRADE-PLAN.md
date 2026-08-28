# React 17+ Upgrade & Modernization Plan — `eis-ui-render`

| | |
|---|---|
| **Status** | In progress — React 17 hosted checkpoint green; Phase 0 types/CI baseline complete and packaging partially complete |
| **Date** | 2026-07-06 |
| **Re-verified** | 2026-07-21 — independent re-audit against the working tree, lockfile, build configs, a full test/lint/audit/pack run, and the npm registry; new findings indexed in §2.6 |
| **Checkpoint verified** | 2026-08-07 — `master` b0b64d3: 138 suites / 1920 tests; 94.21% statements / 89.25% branches / 92.70% functions / 94.81% lines; JS/CSS lint and library/demo builds green in hosted CI |
| **Current change verified** | 2026-08-10 — 138 suites / 1921 tests locally (the obsolete type-shim version-site case was removed and two `translate` boundary contracts were added); coverage thresholds, React 16/17/18 declaration matrix, JS/CSS lint and both builds green |
| **Audited version** | 0.34.2 (master checkpoint) |
| **Scope** | React 17/18 upgrade path, React 19 readiness, a principles-preserving modernization roadmap, the `semantic-ui-react` exit plan (§9.7-F1), the `moment` native-replacement analysis (§9.7-F2), the project-structure analysis (§9.9), the TypeScript migration (§9.6), and the consolidated verification checklist (Appendix C) |

---

## 1. Executive summary

The audit shows that **the path to React 18 is almost entirely unblocked**. The build toolchain is already modern (webpack 5, Jest 30, Babel 7.26, Node 24), and every runtime dependency already declares React 17/18 peer support. The lag is concentrated in four places:

1. **React itself** — the React 17 checkpoint has landed on `master`; React 18 is not yet admitted by the peer range.
2. **`@testing-library/react` 12.1.5** — peer-restricted to `react <18`; the only hard dependency blocker.
3. **Legacy component patterns** — 21 source files contain class components, with `UNSAFE_*` lifecycles in 13 files, including deliberate **runtime prototype patching** in `src/core/pages/main/rules.js` and `src/core/modules/form/utils.js`. These are *not* upgrade blockers (prefixed `UNSAFE_*` methods work in React 17, 18, and 19), but they block `StrictMode`, concurrent features, and long-term maintainability.
4. **The shipped artifact itself** — the public declarations now describe the actual single callable UMD/CommonJS component and are compiled against locked React 16/17/18 type environments in both interop-default and direct-CommonJS modes; hosted CI is green, and `prepack` rejects version drift before rebuilding the library. Packaging is now gated too: assets ship once, budgets and a packed-tarball consumer smoke run in CI, and the tarball is 295 files / 7.25 MB unpacked (from 579 / 11.6 MB) with source maps kept by decision. The published CSS still leaks unscoped `html`/`body`/`*` rules into host pages. §2.6 carries the evidence and remaining gates.

**Recommended target: React 18.3, reached in two checkpointed releases (17 → 18), followed by an incremental modernization program.** React 19 is a watch-item, not a target — it stays gated on the §9.7-F1 exit (see the §8 fast path).

Standing decisions:

1. **`semantic-ui-react` will be exited entirely** (§9.7-F1). The audited dependency surface is far smaller than the package's reputation suggests: exactly **3 wrapper components** (`Table`, `TooltipPop`, `Dropdown`) and **5 curated LESS modules** — the codebase has already been trending out of it (slider lib and react-dropzone removed recently, modal and pagination already in-house). Completing the exit also removes the main external React 19 blocker.
2. **`moment` stays** as a peer dependency — no dayjs migration. The requested native-replacement feasibility analysis (§9.7-F2) concludes it is possible and well-bounded (~400–600 lines behind an adapter seam), but it is parked behind an explicit decision gate; the only near-term action is funneling usage through a single internal adapter module.
3. **The published JavaScript API stays a single callable value.** `require('eis-ui-render')` returns the function directly (there is no runtime `.default` or `.UIRender` property); TypeScript models this with `export =`, which also supports a default import when module interop is enabled. Named interfaces and type aliases remain available through the merged namespace, but a named `UIRender` value export is not restored. Script-tag/global typing remains tied to the separate UMD-support gate in §10.

The **project-structure analysis** (§9.9) found: the documented `ui-*-pack` alias system is dead (zero imports in the codebase — CLAUDE.md was stale on this; fixed alongside this plan), the engine lives under an app-boilerplate-era `core/pages/main/` path, and 12 orphan components (9 direct, plus the `ErrorTable`/`Square`/pack-`TabList` cluster reachable only from other orphans) plus a dead `style/unused/` tree can simply be deleted. The workstream re-homes the engine to `core/engine/` ahead of the §9.3 decomposition, isolates the demo, and locks layer direction in with lint.

§9.6 defines a **full TypeScript migration** (infra step → utils/contract → components/modules riding other workstreams → engine last → guarded public-API switchover), which **retires the `prop-types` runtime dependency** as its exit criterion (E5 — React 19 ignores propTypes anyway, and the shapes currently ship in the production bundle). The plan also adds **Appendix C** — a consolidated checklist of every verification it depends on, so no check lives only in review discussions.

Because `react`/`react-dom` are webpack **externals** and npm **peer dependencies**, the library does not bundle React. The upgrade is therefore a *compatibility-range widening*, not a forced migration for consumers: host applications on React 16.14 keep working, hosts on 17/18 become officially supported.

---

## 2. Current state audit

### 2.1 Toolchain and release gates

| Area | Current | Verdict |
|---|---|---|
| Bundler | webpack 5 (declared `^5.99`; + dev-server 5, CLI 6) | ✅ current |
| Transpiler | Babel 7 (declared `^7.26`), `babel-loader` 10 | ✅ current |
| Tests | Jest 30 + `jest-environment-jsdom` 30 | ✅ current, React-18-ready |
| Node | engines `>=22`, `.nvmrc` = 24 | ✅ current |
| Lint | ESLint 8 + `eslint-config-react-app` 7 | ✅ `npm run lint:js` exits 0 errors / 0 warnings with `--max-warnings 0` and runs in CI; the 22 warnings were triaged in Phase 0.9 (one was a real defect, R18) and the 14 zero-reference devDependencies are gone |
| Styling | LESS 3.13 (pinned for the semantic-ui-less + `less-plugin-functions` toolchain), PostCSS 8, stylelint 16 | ✅ works; LESS pin is a separate watch-item (§9.8) |
| Types | Hand-written public API types in `src/library/types/`, emitted via `tsconfig.build.json` (declaration-only) | ✅ describes the direct callable UMD/CommonJS export; emitted declarations compile with `skipLibCheck: false` against locked `@types/react` 16/17/18 consumers using both interop-default and direct `import = require` (§2.6-1, Phase 0.6) |
| CI / publish gates | GitHub Actions workflow for pull requests and `master` pushes | ⚠️ hosted CI is green for JS/CSS lint, coverage and both builds; `prepack` checks version sync and rebuilds the library. Pack budgets, packed-consumer smoke, asset deduplication and the source-map decision remain — Phase 0.7 |

### 2.2 Dependency compatibility matrix

Peer ranges verified against `package-lock.json` (resolved versions), not npm metadata.

| Package | Resolved | Declared React peer | React 17 | React 18 | Notes |
|---|---|---|---|---|---|
| `semantic-ui-react` | 3.0.0-beta.2 | `^16.8 \|\| ^17 \|\| ^18` | ✅ | ✅ | Already on the 3.x line, which removed `findDOMNode`-era internals. Being on a beta is a strategic risk (§8, §11) but an upgrade *enabler* here. **Planned full exit: §9.7-F1.** |
| `react-final-form` | 6.5.9 | `^16.8 \|\| ^17 \|\| ^18` | ✅ | ✅ | React 19 peers arrive in the 7.x line (with `final-form` 5.x) — §9.7-F4. |
| `final-form` | 4.20.10 | — (React-free) | ✅ | ✅ | |
| `react-final-form-arrays` / `final-form-arrays` | 3.1.x | analogous | ✅ | ✅ | |
| `rc-picker` | 4.11.3 | `>=16.9` | ✅ | ✅ | Date engine via `generateConfig` — moment config in use; a custom native-`Date` config is the F2 option (§9.7-F2). |
| `react-router-dom` | 6.30.3 | `>=16.8` | ✅ | ✅ | Demo only. |
| `react-markdown` | 8.0.7 | `>=16` | ✅ | ✅ | Demo only. |
| `react-syntax-highlighter` | 16.1.1 | — | ✅ | ✅ | Demo only. |
| `react-refresh` + webpack plugin | 0.17 / 0.5.17 | — | ✅ | ✅ | Dev only. |
| **`@testing-library/react`** | **12.1.5** | **`<18.0.0`** | ✅ | ❌ | **The single hard blocker.** Requires upgrade to 16.x together with the React 18 bump (§6). |
| `@testing-library/jest-dom` | 6.9.1 | — | ✅ | ✅ | |
| `moment` | 2.29.4 (peer `^2.29.4` + external) | — | ✅ | ✅ | In maintenance mode upstream; **decision: keep**. The compatible peer range was widened for host resolution. Moment remains part of the public API (§2.6-12); optional native replacement is analyzed in §9.7-F2. |

### 2.3 React legacy pattern inventory

Original audit baseline: 257 JS/JSX files (+2 TS), 76 test files. The safety/React 17 workstream adds 62 contract-test files: 138 suites / 1920 tests at the hosted `master` checkpoint. The current type correction runs 138 / 1921: the obsolete type-shim version-site case was removed and two `translate` boundary contracts were added. 21 source files contain real class components (a wider lifecycle/component grep also matches 6 test files and 3 doc-comment-only hits); ~19 files use hooks (15 in `src/core`).

**`UNSAFE_*` lifecycle usage (works on React 17/18/19; hostile to StrictMode):**

| File | Detail |
|---|---|
| `src/core/pages/main/rules.js` (1244 lines) | `UNSAFE_componentWillReceiveProps` at :264; **dynamic prototype patching** of `UNSAFE_componentWillMount` / `WillUpdate` / `WillReceiveProps` at :593–595 and :1182–1220. This is the core form/lifecycle engine. |
| `src/core/modules/form/utils.js` (624 lines) | Same prototype-patching pattern at :397, :466, :598–615. |
| `src/core/components/Collapse.js` | `UNSAFE_componentWillMount` :67, `UNSAFE_componentWillReceiveProps` :71 |
| `src/core/components/ProgressSteps.js` :46, `Carousel.js` :50, `Tabs.js` :68, `InputNative.js` :35, `ProgressBar.js` :73, `Counter.js` :70, `Expand.js` :61 | Leaf presentational components; each `UNSAFE_componentWillReceiveProps` is a props→state derivation, mechanically convertible. |
| `src/core/pages/main/components/Tabs.js` :75, `TableView.js` :133 | Same pattern at page level. |
| `src/core/modules/form/views/AutoSave.js` :45 | Same pattern. |

**Other findings:**

- `ReactDOM.render` — **demo entry point only** (`src/main.jsx:9`). Nothing in the published library calls it.
- `createPortal` — `src/core/pages/main/components/Popup.js` (fully supported in 17/18/19).
- `defaultProps` on **function components** (removed in React 19): exactly **3 occurrences** — `src/core/components/TooltipPop.js:23`, `ImageSwatch.js:27`, `Image.js:27`.
- `.propTypes` assigned in 33 files; `prop-types` imported by 40 (fine in 17/18; validation removed entirely in React 19 — no crash; retirement: §9.6-E5).
- Legacy Babel decorators (`@babel/plugin-proposal-decorators`, `legacy: true`) used in 7 files — a single `@withTimer` decorator (`Carousel`, `Counter`, `Expand`, `ProgressBar`, `ProgressSteps`, both `Tabs`).
- Direct `moment` imports in **4 files only**: `src/core/utils/time.js:1`, `src/core/components/Text.js:6`, `InputDate.js:11`, `TextDateValue.js:2`.
- Global listeners: only `window.addEventListener('pointermove'/'pointerup')` in `src/core/components/Slider.js:134–135` (native drag handling — unaffected by React 17 event-delegation changes).

### 2.4 Verified non-issues (explicitly checked, absent)

| Pattern | Status |
|---|---|
| Enzyme | ❌ not used (RTL only) |
| Legacy context (`contextTypes` / `childContextTypes` / `getChildContext`) | ❌ none |
| String refs (`ref="..."`) | ❌ none |
| `findDOMNode` in `src/` | ❌ none |
| Event pooling reliance (`e.persist()`) | ✅ one deliberate call site (`Upload.js`) — see §2.6 note |
| `unstable_*` React APIs | ❌ none |
| `StrictMode` | not enabled anywhere (intentional for now, see §7) |

### 2.5 Architectural invariants (observed, and to be preserved)

1. **The meta/data JSON contract is the public API.** Everything else is implementation detail.
2. **Recursive renderer with pluggable registries** — `Render.Component` / `Render.Method` resolved via `src/core/pages/main/mapper.js`; `view` strings map to components, `render*` strings map to formatters.
3. **Layered internal packs** as directory layers: `core/components` (presentation, a.k.a. "ui-react-pack"), `core/modules` (form/behavior), `core/utils` (pure utilities). The historical `ui-*-pack` webpack aliases turned out to be vestigial — zero imports use them (§9.9-H0); the *layering itself* is real and preserved. **Verified: `semantic-ui-react` is imported *only* inside `src/core/components`** — the isolation layer is intact; it is what keeps the planned exit (§9.7-F1) bounded.
4. **UMD library with `react`, `react-dom`, `moment` externalized** (`webpack.library.config.mjs:27–31`); CSS compiled from LESS and scoped under `.ui-render` via postcss-prefixwrap.
5. **The demo app is the living documentation and QA stand** (`src/demo/examples/` as executable spec).

### 2.6 Independent re-audit findings (2026-07-21)

A second audit pass — against the working tree, the build configs, a full test/lint/audit/pack run, and the npm registry — added the verified facts below. Each is integrated into the phase or workstream in the last column; this table is the evidence index, not a task list.

| # | Finding (file:line references verified) | Owned by |
|---|---|---|
| 1 | **Published types describe a different component.** `src/library/types/UIRender.tsx` is a legacy DOM-proxy class that renders an empty `<div>` and requires a global `window._mountUIRender` — while the shipped `dist/index.js` exports the real component (`src/library/main.js`: `AppProvider → AppWrapper → engine`). Required/optional is inverted vs runtime (types require `onSubmit`/`translate`; runtime requires `data`/`meta` — `rules.js:219–220`); the d.ts promises a named `UIRender` export while the UMD exposes the source default as a direct callable value, without runtime `.default` or `.UIRender` properties (`webpack.library.config.mjs` `library.export: 'default'`). | Phase 0.6, §9.6-E4 |
| 2 | **The public `dateFormat` prop is dead end-to-end.** `rules.js:328/344` passes it into `<Render>`, but `Render.js:45` destructures and discards it; nothing feeds it into `ConfigContext` (`AppProvider` receives no props; the context declares `updateConfig` while the provider exposes `setConfig`); `TextDateValue.js` ignores its own `dateFormat` parameter. Components always see the context default `'MM-DD-YYYY'`. | §9.4 |
| 3 | **A per-node error boundary already exists** — `RenderClass` has `componentDidCatch` + a `Render.onError` hook (`Render.js:65–67,131`) — but the production override at `mapper.js:680` destructures `{err, errInfo}` while the boundary emits `{error, errorInfo}`, so reports carry `undefined`. | §9.4 (extend + fix, not create) |
| 4 | **Engine ↔ form-modules import cycle:** `form/utils.js:13–14` imports `errorsProcessing`, `clearErrorsMap`, `formsStorage` from `pages/main/*`, while `rules.js:3` imports `storedTouched`, `withForm` from `modules/form` — in addition to the known `Text.js:4` violation. | §9.3 step 2, §9.9-H5 |
| 5 | **Module-global mutable state is wider than first catalogued:** besides `FIELD.FUNC`/`Active.translate`/`errorHandlerFunction` — `formsStorage` (`rules.js:199`, module-level `Map`), `errorsMap` (`rules.js:204`), `formInitialValues` + `storedTouched` (`form/utils.js:23–24`); and every instance renders a fixed-id `<div id="render-popup-root">` (`AppWrapper.js:17`) that the modal portal resolves via global `getElementById` (`Popup.js:88`) — first instance in the DOM wins. (`FIELD.METHODS`, named in an earlier review draft, does not exist.) | §9.3 step 3, R14 |
| 6 | **Form-runtime hazards (StrictMode/longevity-relevant):** `form.subscribe()` runs on **every render** with the unsubscribe discarded (`form/utils.js:382`); `setState` during render in the Dropdown field branch (`form/utils.js:199–208`); a debounced handler lives on the **prototype**, sharing one timer across instances (`form/utils.js:571`); state is mutated in place via the documented-as-mutating `set()` before `setState` (`rules.js:1108/1150/1211/1215`); `AutoSave`'s debounce is never cancelled on unmount; `autoSubmit` creates a fresh `debounce(instance.submit)` on every render pass (`mapper.js:588`). (Checked and clean: `Slider` and `@withTimer` DO clean up — only an unmount-mid-drag edge remains.) | §9.3 step 4, §7 |
| 7 | **Published CSS leaks global styles.** `postcss.config.js` deliberately exempts `html`, `body`, `*` from prefixwrap, so the bundled semantic reset restyles the host page. **Figures corrected 2026-08-27:** the earlier "2× `html{`, 2× `body`, 1× `*{`" came from an anchored line-start grep, which cannot work — the published CSS is minified (38 lines, ~407 KB). A selector-level parse of `static/all.css` finds **13 unscoped occurrences across 11 rules** (`body` 6, `html` 5, `*` 2) and zero `.ui-render html`. The path was also stale: since §0.7 the real file is root `static/all.css` and `dist/static/all.css` is a 130-byte `@import` re-export. The standalone `scripts/build-css.js` uses **different** prefixwrap options, and the LESS-stage Jest test (`css.compilation.test.js` — not `css-contract.test.js`, which does not exist) runs **before** PostCSS. Now gated: `src/style/__tests__/css.pipeline.parity.test.js` pins the final CSS. | §9.9-H8, §9.5, F1 step 4 |
| 8 | **Packaging is unreproducible and oversized.** *Resolved in Phase 0.7,* except the build divergence below. Was: 579 files / **11.6 MB unpacked**, every asset duplicated between `dist/static/*` and root `static/*` (two 407 KB copies of `all.css`), no `prepack`/`prepublishOnly`, no budgets. Now 295 files / **7.25 MB unpacked** (2.53 MB packed) with assets shipped once, `prepack` guarding version drift, and both budgets and a packed-tarball smoke in CI. Source maps ship deliberately (3.0 MB — owners' call, §10). `static/semantic.css` stays a 0-byte stub for compatibility. Still open: the library and watch builds disagree — watch emits `static/ui-render.css` (not the `all.css`/`font.css`/`semantic.css` set) and its `output.clean: true` wipes `dist/index.d.ts`. | §9.9-H7 |
| 9 | **A clean checkout does not build.** `Examples.jsx:24–25` imports `src/demo/examples/input-integer_{meta,data}.json`, which exist only as untracked files in the current working tree (8 more untracked example JSONs are unreferenced). | Phase 0.8 |
| 10 | **Babel scope correction:** the demo webpack config carries its **own inline presets** (`webpack.demo.config.mjs:37`, no explicit targets → browserslist applies there), so the root `targets: {node:'current'}` problem hits the **library and watch** builds (Jest is already env-split). Fixing the root config alone leaves the demo's duplicated preset setup in place. | Phase 0.5, §9.8 |
| 11 | **Hybrid dependency model:** everything except `react`/`react-dom`/`moment` is **both** bundled into the UMD **and** declared in `dependencies` — npm hosts install full copies of `semantic-ui-react`, the form stack, `rc-picker` etc. that the bundle never uses, and SUIR's own `react ≤^18` peer caps the host's React until the *dependency entry* (not just the bundled code) is removed. | §9.7-F1 step 3½, §9.7-F3 gate, §8 |
| 12 | **moment IS on the public API.** `README:12,18` and `docs.md:24–25` document that the library "accepts `moment` instances on its API" (with cross-copy `instanceof` caveats), and rc-picker callbacks leak moment objects outward — `onSelect` ← `onCalendarChange` (`InputDate.js:96`) plus passthrough `disabledDate`/`cellRender`/… via `{...props}` (`InputDate.js:89`). The earlier "moment never crosses the public API" claim was wrong; corrected in §9.7-F2. | §9.7-F2 |
| 13 | **Quality baselines measured (2026-07-21):** tests 76 suites / 1215 tests green in 8.3 s (zero snapshots); `lint:css` clean; `npx eslint src` fails (11 errors / 28 warnings; no lint script exists); `npm audit --omit=dev` **0** vulnerabilities; full `npm audit` **20** (2 critical, 7 high — dev tooling); **13 devDependencies with zero references** in code/configs: `tsconfig-paths-webpack-plugin`, `backoff`, `history`, `html-loader`, `minimist`, `path-browserify`, `postcss-scss`, `raw-loader`, `remark-loader`, `rimraf`, `sass`, `sass-loader`, `webpack-node-externals` (verify `dot-prop-immutable` too). | Phase 0.9, §9.9-H1 |
| 14 | **Orphan set is 12, not 9:** the 9 direct orphans re-confirmed, plus `ErrorTable` (imported only by orphan `ErrorContent`), `Square` (only by orphan `Carousel`), and the pack `TabList` (mapper uses the engine copy, `mapper.js:33`). ~~Engine `tester/` fixtures are referenced by nothing.~~ — the `tester/` pair has since been deleted (§9.9-H1). | §9.9-H1, §9.2 |
| 15 | **Hardcoded version strings** `data-version="0.34.2"` in `AppWrapper.js:10` and `types/UIRender.tsx:76` — drift on every release; should come from `package.json` at build time. | §9.9-H6 |
| 16 | **One application's field names were compiled into the engine.** *Resolved.* When a popup could not resolve its `relativePath`, `rules.js` probed the consumer's data for two literal paths belonging to a single host app and adopted whichever matched. It never matched in 1928 tests — but for data that *did* carry one of those keys it bound the popup to a table the opener had nothing to do with (the two candidates were tried in order, so a row from the second table got the first), re-creating by data shape the rebinding that commit `89bac56` removed. Deleted; an unresolved scope now warns instead of guessing, and meta states the scope either by declaring the `Popup` inside the row or via `{relativePath}` in the `popupOpen` args. Three comment/JSDoc examples naming the same fields were neutralised. | §9.3 |
| 17 | **The date field is selected by `type`, and its view constant is dead.** `renders.js:38-40` overrides whatever the view switch chose whenever `type === 'date'`, so a date picker is reachable from meta as `{view: 'Input', type: 'date'}` — any `view` the mapper does not claim works, which is why grepping example metas for `"view": "Date"` finds nothing. Meanwhile `FIELD.TYPE.DATE` (`modules/form/constants.js:16`) has **zero readers** — `view: 'Date'` renders the "field does not exist" placeholder. Note `FIELD.RENDER.DATE` (`variables/fields.js:47`) is a different, live thing: a read-only date formatter. Either give the view constant a branch or delete it; the two-`'Date'` split is a docs-truth trap. The rendered picker is an rc-picker text input plus a JS overlay with no native `type="date"` attribute — the reason the §5 overlay QA item exists. | §9.9-H1, §9.9-H2 |

**Checkpoint updates (2026-08-07):**

- Finding 1: resolved — the declaration now models the direct callable UMD/CommonJS function (`export =`), with `data`/`meta` required and the remaining runtime props optional; emitted declarations compile against locked React 16/17/18 type environments in both interop and non-interop consumer modes, and the smoke verifies the actual `require()` shape.
- Findings 2 and 3: resolved (2026-08-27, §9.4) — the configuration props reach `ConfigContext` and the context API name matches the provider; the render-error report carries the failing node's meta path, the sink reads the fields the boundary emits, and a documented `onError` prop is on the public API.
- Finding 6: partially resolved — the Final Form wrapper now keeps one subscription per active form and unsubscribes on replacement or unmount; the remaining runtime hazards stay open.
- Finding 8: partially resolved — `prepack` rejects version drift and rebuilds the library, and the hosted CI checkout is green; pack budgets, packed-consumer smoke, duplicated assets and the source-map decision stay open.
- Finding 9: resolved by including both imported `input-integer_{meta,data}.json` fixtures in tracked source; the registry contract covers all 38 registered examples.
- Finding 10: partially resolved — the root Babel test/build target split landed; folding the demo's duplicated inline presets into the shared config remains open.
- Finding 13: resolved — `lint:js` exits 0 errors / 0 warnings behind `--max-warnings 0` in CI, all 22 warnings were triaged individually (one real defect, R18), and all 14 zero-reference devDependencies are removed. Audit baselines re-measured 2026-08-10: prod 0, full 26; assigning the dev-tooling burn-down owner stays an H9 governance item.
- Finding 15: resolved — `npm version` synchronizes the runtime/demo literals, while `prepack` rejects drift before rebuilding; the removed legacy type shim is no longer a version site.
- Current hosted checkpoint: 138 suites / 1920 tests; coverage is 94.21% statements / 89.25% branches / 92.70% functions / 94.81% lines; JS/CSS lint and both builds are green (Actions run 31175926661).

---

## 3. Upgrade strategy

### 3.1 Why React 18 via a React 17 checkpoint

- **React 17** is a "no new features" compatibility release. For this codebase it is nearly free (§5), and shipping it as a separate release isolates the event-system changes from the React 18 changes. If a consumer reports a regression, the bisection space is halved.
- **React 18** brings the actual behavioral changes (`createRoot`, automatic batching) and forces the RTL migration. It is the real milestone.
- **React 19** is deliberately out of scope for the upgrade itself (§8): the gate is the §9.7-F1 exit — once it lands, the §8 fast path applies. The `UNSAFE_`/prototype-patching engine is *not* a 19 gate; §9.3 gates StrictMode/concurrency, not the flip.

### 3.2 Peer dependency policy (the core decision)

Widen, never replace:

```jsonc
// package.json (target state after Phase 2)
"peerDependencies": {
  "moment": "^2.29.4",
  "react": "^16.14.0 || ^17.0.0 || ^18.0.0",
  "react-dom": "^16.14.0 || ^17.0.0 || ^18.0.0"
}
```

- The `16.14` floor is kept intentionally: it costs nothing (the code uses only cross-compatible APIs) and lets host applications migrate on their own schedule.
- `16.14` is also exactly the version where `react/jsx-runtime` was backported, which later allows enabling the automatic JSX transform (§9.8) without dropping React 16 support.
- `moment` widens from `~2.29.4` to `^2.29.4`: moment 2.30.1 is the final upstream release and what fresh host installs resolve to — the tilde range makes npm ≥7 host installs fail with `ERESOLVE` against this library.
- Dev dependencies (`react`, `react-dom` in `devDependencies`) track the highest supported checkpoint: React 17 now, then React 18 in Phase 2, with compatibility smoke coverage for retained lower peer versions (§9.5).

### 3.3 Consumer impact

- **UMD / externals consumers**: React comes from the host — no bundle change at all. The upgrade only widens what hosts are allowed to provide.
- **npm consumers**: Phase 1 peer resolution accepts React 17 hosts; the Phase 2 target adds React 18. No breaking change for React 16.14 hosts.
- **Install docs**: Phase 1 now recommends React 17 while documenting continued React 16.14 support; Phase 2 must update the recommended install commands again for React 18.
- **Hybrid dependency model (§2.6-11):** npm hosts currently install `dependencies` (SUIR, the form stack, rc-picker, …) that are *also* bundled into the UMD — dead weight in host `node_modules` and an extra peer-resolution surface. Resolving this (trim `dependencies`, externalize more, or peerize) is an owners' decision — see the gates in §10.
- **`engines.node >= 22` ships to consumers** in the published manifest — on `engine-strict` hosts this fails installs even though Node is only a *build* requirement for this browser library. Decision gate in §10.

---

## 4. Phase 0 — Reproducibility, API & security baseline (remaining gates required before React 18)

**Goal:** keep regressions *visible* and make releases *reproducible*. React 17 landed with the automated baseline; the unresolved Babel, packaging, lint/security and release gates must close before React 18 changes behavior underneath the form engine.

| # | Action | Detail |
|---|---|---|
| 0.1 | Record the green baseline | The original 76-suite baseline is recorded; the current hosted checkpoint runs 138 suites plus both builds, with counts and coverage retained for later comparison. |
| 0.2 | Close test gaps around `rules.js` critical flows | Priority order: initial data processing / normalization (`utils.js` error mapping), `showIf` evaluation, validation + error propagation into fields, actions (`submit` payload assembly, `addData` / `removeData`, upload/download), re-render on `data` prop change. These are exactly the paths sensitive to React 18 batching. |
| 0.3 | Example smoke harness | A Jest suite that mounts **every** meta/data pair from `src/demo/examples/` and asserts render without throwing. This doubles as the seed for contract tests (§9.5). |
| 0.4 | CI on every PR | JS/CSS lint, coverage, `build-lib` and the demo build run with the same scripts used locally. The hosted `master` run is green. |
| 0.5 | Babel targets env-split | **Completed.** The root config splits test (`node: current`) from build (browserslist) targets, and the demo no longer carries its own copy: `webpack.demo.config.mjs` keeps only `react-refresh/babel` in development and takes presets plus legacy decorators from `babel.config.js`, the same config the library build and jest use. Measured with `loadPartialConfig`, the inline entry was not merely duplicated — a loader-level preset **replaces** the shared entry for the same identifier, so the demo was silently discarding the config's own preset-env options. Proof the consolidation is inert: the emitted demo bundles are byte-for-byte identical before and after, and they retain arrow functions, optional chaining, `const`/`let` and `class`, which only survive because browserslist targets (chrome 103 … safari 18.5) are in effect — with no targets, preset-env would down-level everything to ES5. Closes R6 and §2.6-10. |
| 0.6 | Public API & types baseline | **Completed.** The legacy `window._mountUIRender` class shim was replaced by declarations for the actual direct callable UMD/CommonJS function (§2.6-1): `data`/`meta` are required, runtime-supported props are optional, `translate` keeps its string-to-string localization contract while non-string renderer values bypass it unchanged, and no nonexistent instance/ref API, `.default` property or named value export is promised. The CI workflow compiles emitted `dist/*.d.ts` with `skipLibCheck: false` in isolated consumers against locked `@types/react` 16, 17 and 18 (+19 at the flip), using both interop-default and direct-CommonJS imports; it also verifies the built runtime export. The matrix is green locally in this change. **This corrected contract is the golden baseline for §9.6-E4.** Closes the types half of R15. |
| 0.7 | Packaging gate | **Completed.** `npm version` synchronizes runtime/demo version literals; `prepack` rejects version drift and runs `build-lib` including `gen-ts`. Assets now ship **once**: the root `static/` payload holds the real stylesheets, fonts and images (it is what hosts copy to their web root, since `FILE.PATH_IMAGES` resolves to `<homepage>/static/images/`), and `dist/static/*.css` are `@import` re-exports so bundler imports of the dist path keep resolving. `test:pack:budget` enforces file count, unpacked/packed size, per-file caps, required paths, the re-export stubs and a duplicate-asset guard against the published manifest; `test:pack:consumer` packs, extracts and server-renders the tarball in a throwaway consumer holding only react/react-dom/moment, resolving every stylesheet `@import` chain and `url()` target. Both run in CI. Measured: **295 files / 7.25 MB unpacked / 2.53 MB packed**, down from 579 / 11.6 MB. Source maps ship by decision (§10). Closes the remaining packaging half of R15. |
| 0.8 | Repo completeness | Everything imported by tracked code must be tracked. The two `input-integer` fixtures imported by `Examples.jsx:24–25` are included in the current checkpoint; the fresh hosted checkout now makes future tracked-file drift fail fast. |
| 0.9 | Lint & security baseline | **Completed.** `lint:js` now exits **0 errors / 0 warnings** and carries `--max-warnings 0`, so a new warning fails CI. All 22 warnings were triaged individually, not blanket-silenced: **18 were genuine cleanups** (dead destructures and imports, a misplaced `eslint-disable` that silenced nothing, explicit `return undefined` in two sentinel getters, a useless escape and rename, `default-case` answered with the anchored `// no default` hatch that `eslint-config-react-app` actually looks for, and `alt` restated after the spread so the a11y rule stays live on that line); **4 are documented suppressions** where the rule is wrong or the fix is riskier than the warning (two `exhaustive-deps` guard reads that would clobber user input if listed, the deliberate loose comparison in `hasObjKeys`, and the `no-loop-func` renderer closure). Three warnings turned out to be **real defects** — see §11 R18. Audit baselines re-measured on 2026-08-10: `npm audit --omit=dev` **0**, full audit **26** (2 critical, 12 high — all dev tooling; was 20 on 2026-07-21, and the burn-down owner is still an H9 governance item). All **14** zero-reference devDependencies removed (the 13 plus the unverified `dot-prop-immutable`), dropping the installed dev tree from 1443 to 1429 packages. |

**Implementation status (2026-08-10):**

- Completed: **all of Phase 0 (0.1–0.9)** — automated baseline and critical-flow contracts (0.1–0.4); Babel targets consolidated into one shared config (0.5); truthful callable-export public types plus the locked React 16/17/18 interop/CommonJS consumer matrix (0.6); asset deduplication, pack budgets and the packed-tarball consumer smoke, with source maps kept by decision (0.7); repo completeness for the imported input-integer fixtures (0.8); a zero-warning lint gate, re-measured audit baselines and the 14-package devDependency sweep (0.9).
- Open decisions carried forward (owners' calls, not blockers): `engines.node >= 22` in the published manifest; whether the four demo screenshots in `static/images` (~1.1 MB of the 7.25 MB) belong in the tarball, since only unpublished demo markdowns reference them but consumer meta could name any file in that folder; and the burn-down owner for the 26 dev-tooling audit findings. All three sit in the §10 gate table.
- Deferred by design, with the evidence now recorded: the `no-loop-func` renderer closure in `transforms.js` shares one `_data` binding across every renderer it builds (§9.3), and the library and watch builds still disagree (§9.9-H7).

**Exit criteria:** CI green on the React 17 baseline **from a clean checkout**; `rules.js` critical flows covered; example smoke harness in place; Babel build targets honor browserslist; published types describe the real component and compile against `@types/react` 16/17/18; `prepack` + pack budgets enforced; `lint` script green; audit baselines recorded. **All met** — Phase 0 is closed; the outstanding items are the owners' decisions listed above, not engineering work.

**Estimated effort:** ~1.5–2 weeks (widened from ~1 week by the §2.6 findings).

---

## 5. Phase 1 — React 17 (small, checkpointed)

**Goal:** officially support React 17. Expected code delta: near zero. *Decided (§10, 2026-08-18): **no separate 17 release** — it is an internal checkpoint folded into the React 18 release. Phase 1 therefore exits without publishing; the version bump and tag happen at React 18.*

### Steps

1. `npm i -D react@17.0.2 react-dom@17.0.2` (dev deps only).
2. Peers → `"react": "^16.14.0 || ^17.0.0"` (same for `react-dom`); widen `moment` to `^2.29.4` (§3.2).
3. Full test run + example smoke + manual demo QA.
4. Update install docs; changelog entry; ship as a checkpoint release.

`@testing-library/react` 12 stays (its `react <18` peer admits 17). `ReactDOM.render` in the demo stays (fully supported in 17).

**Automated checkpoint (2026-08-07):** React/React DOM 17.0.2, additive React 16.14/17 peer ranges and Moment `^2.29.4` are on `master`. Hosted CI is green: 138 suites / 1920 tests; coverage is 94.21% statements / 89.25% branches / 92.70% functions / 94.81% lines; JS/CSS lint and both builds pass. The manual QA checklist below is now worked through in a real browser, including the overlay-ordering items; react-refresh, the yalc smoke and the release decision remain open.

### React 17 behavioral changes, mapped to this codebase

| Change in React 17 | Exposure here |
|---|---|
| Event delegation moves from `document` to the root container | **Low, and net-positive.** No `src/` code attaches React-event-dependent `document` listeners (only native `window` pointer listeners in `Slider.js`, unaffected). For a widget embedded into host pages, root-scoped delegation actually *reduces* interference with host-app handlers. One caveat: the "no document listeners" statement is **first-party only** — the bundled deps attach their own native document listeners (SUIR via `@semantic-ui-react/event-stack`, rc-picker via `rc-util`), and React 17 changes the *ordering* between root-delegated synthetic events and those native listeners — exactly what click-outside logic is sensitive to. Manually QA click-outside behavior of `Popup` (portal-based), `Dropdown`, and date-picker overlays. |
| No event pooling (`e.persist()` becomes no-op) | None for 17+. **Found and fixed (2026-08-20), surfaced by the new gating React 16 leg:** `Upload.js` forwards a drag event (from `Dropzone.js:108-109`) to the host's `onFocus`/`onBlur` from inside a `setState` callback, i.e. after the commit — so on the 16.14 floor the host received an event whose `type`/`target` read `null`, while 17+ was fine. Fixed by a guarded `persistEvent()` at the forward site: it opts the event out of React 16's pool, is a no-op on 17/18, and the `typeof` guard covers 19, where `persist` no longer exists. `Upload.interactions.test.js` now asserts the forwarded event's `type` rather than only the call count, which is what had hidden this; verified red on 16 with the fix disabled (React's own pooling warning fires at the assertion) and green with it. Two sibling sites, `Input.js:126-133` and `Pagination.js:29-32`, forward events synchronously and so were never affected. |
| `useEffect` cleanup runs asynchronously | Low — ~19 files use hooks; QA unmount-heavy flows (Tabs switching, table pagination). |
| Consistent `undefined`-return errors from components | None expected; the example smoke harness will catch any. |
| New JSX transform available | Deferred to modernization (§9.8) — not required for the upgrade. |

### Manual QA checklist (demo, all examples)

Run in a real browser (Chrome) against `npm start` on the React 17 baseline — not jsdom, which does not
reproduce the ordering this phase is actually about: React 17 delegates synthetic events at the root
container while the bundled dependencies keep their own native `document` listeners (SUIR via
`@semantic-ui-react/event-stack`, rc-picker via `rc-util`), and click-outside logic depends on that order.

- [x] **Popup open + click-outside close** — portal-based modal with dimmer opens from `popupContent`,
      closes on a dimmer click, dimmer removed. *Tooltip hover-open not exercised — small remaining gap.*
- [x] **Dropdown open/select/close, click-outside close** — selecting changes the value; a click outside
      closes the menu **without** committing a selection. *Multi-select has no demo example (`multiple: true`
      appears only in the upload variants), so it stays covered by the jsdom contracts only.*
- [x] **Date/time picker (rc-picker overlay)** — the picker lives in the `tableForm` example
      (`src/demo/examples/data_component.js`). Overlay opens on focus, a day click writes the formatted
      value, and a click outside closes the overlay. Selected by `type: 'date'`, **not** by a `view` string
      (§2.6-17); the rendered DOM is an rc-picker text input plus a JS overlay with no native `type="date"`
      attribute, which is precisely why this item mattered for React 17.
- [x] **Tabs, Collapse, Expand** — tab switch swaps panel content; example rows expand and collapse.
      *Carousel autoplay is moot: `Carousel` is not registered in `mapper.js` and is one of the §2.6-14
      orphans slated for deletion under §9.9-H1, so no meta can render it.*
- [x] **Table: sorting, pagination, inline edit rows** — sorting cycles asc → unsorted → desc on a header
      whose table declares `sorts` (`TableView.js` gives a header `onClick` only then; the `adminCosts`
      table inside the `all` example's Admin Expenses section is the one that does), verified by both the
      indicator class and the row order. Pagination page 3 shows rows 11–15 of 23. Draft-row inline edit
      commits through `LocalDraftTableRow`.
- [x] **Form flows: validation errors, submit, addData/removeData** — a touched empty required field shows
      `Required`; submit exercises both branches (blocked with validation errors, and successful with values
      delivered to the handler); a filled draft row commits and the draft clears; deleting a row removes the
      right one, reindexes the rest and leaves sibling groups untouched. *Upload renders and is interactive,
      but its `autoSubmit: true` posts to `REACT_APP_API_URL`, so a real file round-trip needs a backend or
      a consuming app — the jsdom contracts cover upload validation and the ref contract.*
- [x] **No new console warnings/errors** — zero across the whole sweep, after fixing three leaks this QA
      pass surfaced: `currencyCode`/`onDataChanged` reaching the DOM through SUIR's Dropdown, and
      react-markdown's `inline` prop reaching `<code>` in two demo components.

**Not closable from the demo, needs an owner:** the yalc smoke in a consuming application, a react-refresh
check, and the §10 decision on whether React 17 ships as its own release.

**Exit criteria — met (2026-08-20).** CI green; QA checklist worked through in a real browser (above); `dist/` builds. ~~release published~~ struck by the §10 decision: 17 ships as part of the React 18 release, so nothing is published at the end of this phase. ~~yalc smoke in a consuming app~~ satisfied by equivalent and stronger evidence, no separate host required: `test:pack:consumer` installs the packed artifact into an isolated consumer that has only the three peers available and server-renders it, and the demo on localhost exercises the same `dist/` through the real engine. The original criterion already said "if one is available"; recording what was actually run instead of leaving a box unticked. **Phase 1 is closed.**

**Estimated effort:** 1–2 days + QA.

---

## 6. Phase 2 — React 18 (the main milestone)

**Goal:** develop and test against React 18.3 while keeping the `16.14 || 17 || 18` support range.

### Steps

1. **Bump runtime dev deps:** `npm i -D react@18.3.1 react-dom@18.3.1`. React 18.3 immediately warns on function-component `defaultProps` — convert the two live sites (`TooltipPop`, `Image`) to default parameters in the same PR (minutes of work; keeps this phase's "no new warnings" exit gate honest; the third site, `ImageSwatch`, is deleted via §9.9-H1).
2. **Migrate the demo entry** `src/main.jsx` to the new root API (mandatory — with legacy `ReactDOM.render`, React 18 runs in 17-compat mode and the demo would stop being representative of what hosts on 18 actually get):

   ```jsx
   // before
   import { render } from 'react-dom'
   render(<AppProvider>…</AppProvider>, document.getElementById('ui-render'))

   // after
   import { createRoot } from 'react-dom/client'
   createRoot(document.getElementById('ui-render')).render(<AppProvider>…</AppProvider>)
   ```

3. **Upgrade the testing stack:** `npm i -D @testing-library/react@^16 @testing-library/dom@^10`.
   - RTL ≥13 renders through `createRoot` and requires React ≥18 — this is why it must land in the same PR as the React bump.
   - RTL 16 makes `@testing-library/dom` an explicit peer — install it explicitly.
   - `renderHook` is built into RTL ≥13.1 (no separate `react-hooks` package needed).
   - Expected mechanical work: newly surfaced `act(...)` warnings (async state updates are stricter under `createRoot`), tightening `waitFor`/`findBy*` usage in async tests. Migrate suite-by-suite; the 0.2 tests protect semantics while test plumbing changes.
4. **Type generation hygiene:** `tsconfig.build.json` compiles `src/library/types/index.ts` with `skipLibCheck` — add explicit `@types/react@^18` / `@types/react-dom@^18` dev deps so `npm run gen-ts` resolves against pinned, matching types rather than transitive ones.
5. **Widen peers:** `"react": "^16.14.0 || ^17.0.0 || ^18.0.0"` (same for `react-dom`).
6. **Automatic-batching regression pass (the real risk).** In React 18 under `createRoot`, `setState` calls in promises, `setTimeout`, and native handlers are batched (previously each caused its own render). The exposure is concentrated in `rules.js` (async data processing, action handlers, the patched lifecycle chain) and `form/utils.js`. Watch for: logic that *reads back* state between what used to be two renders, intermediate-render-dependent behavior in form value propagation, and `AutoSave.js` timing. The Phase 0 tests plus the full manual QA checklist from §5 are the gate. (Escape hatch if a genuine ordering dependency is found: `flushSync` — use only as a documented last resort.)
7. **`semantic-ui-react` 3.0.0-beta.2 validation on 18:** peer-declared, but it is a beta — smoke every `view` type registered in `mapper.js` (the §5 checklist covers the risky interactive ones).
8. **Docs:** update `docs.md` / `README` install matrix, changelog. Ship as its own checkpoint release.

### Explicitly deferred (do NOT do in this phase)

- `StrictMode` (§7).
- Any use of concurrent features (`startTransition`, `Suspense` for data) — the engine must be StrictMode-clean first.
- Class→hooks refactoring — never mix an upgrade with a refactor in one release.

**Implementation status (2026-08-20):** steps 1-8 done except the release.

- **Steps 1, 3-5 landed together** (they cannot be split — RTL ≥13 requires React ≥18): React and React DOM 18.3.1, RTL 16 with an explicit `@testing-library/dom` 10 peer, `@types/react`/`@types/react-dom` 18, peers widened to `^16.14.0 || ^17.0.0 || ^18.0.0`. The type-consumer matrix was repointed — `@types/react` is 18 now, so the 16 and 17 slots come from locked aliases — and all six interop/CommonJS combinations still pass.
- **The RTL 12→16 migration cost two test files, not the 1-2 weeks budgeted here.** Both failures shared the predicted cause: under `createRoot` a state update outside `act()` is no longer flushed before the assertion. `ProgressBar` drove its own `setTimeout` via `jest.runAllTimers()`; `Slider` dispatched a raw `MouseEvent` to reach `onPointerDown`. No product code was involved. **140 suites / 1946 tests, zero `act` warnings.**
- **Step 1's `defaultProps` prediction was right, and scanning jest output would have missed it:** the suites mock `console.error`, so the warnings were swallowed and the output looked clean. A probe with a recording spy showed React 18.3 warns for both `TooltipPop` and `Image`; both moved to default parameters (`Image` now forwards `decoding`/`loading` explicitly). `ImageSwatch` keeps its `defaultProps` — it is an orphan nothing renders, so it cannot warn; deletion is §9.9-H1's job. One test asserted `TooltipPop.defaultProps.delay`, i.e. the mechanism rather than the behaviour, and was rewritten against what Semantic actually receives.
- **Step 2 done:** `src/main.jsx` mounts via `createRoot`, so the demo renders with automatic batching rather than 17-compat mode.
- **Step 6, the batching pass, found no regression.** The unit suite now runs under `createRoot` (batching in effect) and is green. In the browser, on the demo: the form flow — date picker overlay, validation clearing, both submit branches, `addData` committing a row while the draft clears, `removeData` taking the right row — all behave as they did on 17; and the cascading Select, the most batching-sensitive path in the library because its reset calls `onChange` from inside an effect, correctly reset Product from `Alpha` to `Delta` when Category changed, with the dependent table following. No console errors. `flushSync` was not needed anywhere.
- **Step 7:** the risky interactive views (Dropdown, Popup, rc-picker, Tabs, Table sorting/pagination/inline edit) were exercised on 18 through the §5 checklist. The two console warnings the demo does emit are React Router v6 future-flag notices — demo-only, unrelated to React 18.
- **Step 8:** README, `docs.md` and the changelog carry the `16.14 || 17 || 18` matrix.
- **Not done:** the release. Per §10 this is where React 17 ships too, folded in.

**Exit criteria:** CI green on React 18 ✅; RTL 16 migration complete with zero `act` warnings ✅; QA checklist clean ✅; batching pass done ✅; docs updated ✅; release published ☐.

**Estimated effort:** 1–2 weeks (dominated by RTL migration + regression QA).

---

## 7. StrictMode policy

`<StrictMode>` is **not** part of the upgrade. Today it would drown the console in `UNSAFE_*` deprecation warnings (the prototype-patched lifecycle engine guarantees them) and double-invoke render/effects in dev, which the class engine was never audited for.

**Measured on React 18.3 (2026-08-20)** — so §9.3 is scoped by counting, not estimating. Method: a recording `console.error`/`console.warn` spy (the suites mock those, so scanning jest output shows nothing), plus the demo temporarily wrapped in `<StrictMode>` with all 38 examples expanded.

*Console volume is small and misleading.* React aggregates per lifecycle kind and dedupes per component, so the demo produced **one** warning (`Expand, Tabs`) and a form-heavy meta produced **three** (one per lifecycle: `UNSAFE_componentWillReceiveProps` naming `Expand, InputNative, TableView, Tabs, UIRender, WithForm`; `UNSAFE_componentWillMount` and `UNSAFE_componentWillUpdate` naming `UIRender`). The count to plan against is the components, not the messages.

*The work item is 29 `UNSAFE_*` call sites across 14 files*, one of which (`Carousel`) is an orphan that cannot warn and is deleted under §9.9-H1:

| Sites | File | Note |
|---|---|---|
| 12 | `pages/main/rules.js` | the engine, including the prototype-patching machinery — §9.3 step 5 is exactly this |
| 4 | `modules/form/utils.js` | `WithForm` plus patched lifecycles |
| 2 | `components/Collapse.js` | |
| 1 each | `pages/main/components/{Tabs,TableView}.js`, `modules/form/views/AutoSave.js`, `components/utils/interactions.js`, `components/{Tabs,ProgressSteps,ProgressBar,InputNative,Expand,Counter}.js` | leaf props→state derivations, mechanically convertible (§2.3) |
| 1 | `components/Carousel.js` | orphan — not registered in `mapper.js`, deleted under H1 |

Six of those components were observed warning in practice (`Expand`, `Tabs`, `InputNative`, `TableView`, `UIRender`, `WithForm`); the rest are live code that simply needs the right prop change to surface. Outside StrictMode, React 18.3 emits **zero** warnings for any of them — the renamed `UNSAFE_*` forms are fully supported, which is why the upgrade did not need this work.

Sequencing: StrictMode becomes the *acceptance criterion* of workstream §9.3 (engine decomposition). The definition of "StrictMode-clean" here: demo runs under `<StrictMode>` with zero lifecycle warnings, **no duplicated form subscriptions, no setState-during-render, all timers/listeners cleaned on unmount, and two instances on one page fully isolated** (the §2.6-5/6 hazards) — and no behavioral differences. That state is also the bulk of the concurrent-rendering readiness work (the 19 flip itself does not require it — §8).

---

## 8. React 19 horizon — readiness checklist (watch, don't chase)

| Item | Status | Notes |
|---|---|---|
| String refs (removed in 19) | ✅ none | |
| Legacy context (removed in 19) | ✅ none | Zero `contextTypes` declarations. **Observed side effect of the removal (2026-08-20):** React 18 invoked every function component as `Component(props, secondArg)`, where `secondArg` was the frozen `emptyContextObject` (`{}`) returned by `getMaskedContext`; 19 passes literal `void 0`. Impact was **test-only** — four assertion sites across three test files pinned that second argument with a trailing `expect.anything()` (the other two of the five suites failing on 19 were the warning-text ones in the row below). All are now version-agnostic: assert `mock.calls[0][0]`, never the positional pair, because `toHaveBeenCalledWith(props)` fails on **arity** against a real `(props, undefined)` call. No `src/` code reads a second parameter, and the `key={typeof index !== 'object' ? index : undefined}` guard at `src/core/ui-render/Render.js:47` exists precisely to keep that legacy `{}` out of the `key` slot when React (rather than a mapper) calls `Render`. |
| `findDOMNode` (removed in 19) | ✅ none in `src/` | Moot for SUIR once §9.7-F1 steps 1–3 land. |
| `ReactDOM.render` (removed in 19) | 🔶 fixed by Phase 2 | Demo entry only. |
| `defaultProps` on function components (ignored in 19) | 🔶 3 occurrences | `TooltipPop.js:23`, `ImageSwatch.js:27`, `Image.js:27` → convert to default parameters (done in Phase 2 — §6 step 1). `ImageSwatch` is an orphan slated for deletion (§9.9-H1). |
| `propTypes` (validation removed entirely in 19) | 🔶 40 importing files | No crash — silently ignored. Fully resolved by §9.6-E5: propTypes are deleted per TS conversion and the `prop-types` dependency is removed at the end. **Observed on 19:** the two `is marked as required` warnings that 18 emits for `formProps` and `instance` (attached by `withFormSetup`, `src/core/modules/form/utils.js:483–484`) simply vanish. They report a **real unmet prop contract** that 19 silences — the disappearance is loss of a diagnostic, not a fix, so E5 must not read it as the contract being met. |
| Dev warning text changed in 19 (no component stack, no `Warning:` prefix) | 🔶 **new finding** | React 18's dev `printWarning` appended `getStackAddendum()` as an extra `%s` argument and prefixed `"Warning: "`; 19 emits the bare message. Consequence: any assertion — or console-probe allowlist — that matches a **component name or file path inside warning text** changes meaning across versions and is unreliable as a gate; match the message body only. This is the same recording-spy technique that caught the `defaultProps` warnings in Phase 2 (§6 step 1 notes), so it applies to the audit method, not just to committed tests. |
| `UNSAFE_*` lifecycles | ✅ still supported in 19 | But StrictMode-hostile; §9.3 is the prerequisite for StrictMode/concurrent adoption on 19, not for the 19 flip itself. |
| **`semantic-ui-react` React 19 support** | ❌ **external blocker** | npm `latest` is still 2.1.5 (~3 years stale); the 3.x line lives as betas; React 19 compatibility is an open upstream issue ([Semantic-Org/Semantic-UI-React#4510](https://github.com/Semantic-Org/Semantic-UI-React/issues/4510)). **Resolved by the planned exit (§9.7-F1)** — once `Table`, `TooltipPop`, and `Dropdown` are re-implemented in-house **and the dependency entry is removed (step 3½)**, this blocker disappears regardless of upstream; the entry matters because SUIR's own peers cap host React while it remains (§2.6-11). |
| **Form-stack peers stop at `^18`** (installed: `react-final-form` 6.5.9, `final-form` 4.20.10, `*-arrays`) | 🔶 **resolved upstream, bump planned** | The 19-ready line exists: `react-final-form` 7.0.1 + `final-form` 5.0.1 + `final-form-arrays` 4.0.1 + `react-final-form-arrays` 5.0.0 declare `react … \|\| ^19` (see [react-final-form#1043](https://github.com/final-form/react-final-form/issues/1043)). Coordinated 4-package major bump — plan in §9.7-F4; best executed while still on React 18. |
| **React 19 ships no UMD builds** of `react`/`react-dom` | 🔶 verify host consumption mode | Irrelevant for bundler-based hosts (npm CJS/ESM builds remain). Only script-tag/global consumption would be affected — and our UMD externals map to lowercase `react` globals, which never matched React's `window.React` UMD global, so that mode almost certainly was never used. Confirm with host teams; the ESM target (§9.7-F3) is the forward answer. |
| New JSX transform (19 warns on the classic transform; required going forward) | 🔶 planned | Automatic runtime lands in Phase 4 (§9.8); the 16.14 peer floor makes it safe across the whole range — **verified 2026-08-27**: `react/jsx-runtime` exists in both 16.14.0 (the release that added it) and 17.0.2, and both legs' `^react/(.*)$` mapping routes it to the pinned copy. |
| `react-dom/test-utils` (removed in 19) | ✅ verified none | No direct imports in src or tests; RTL ≥16 abstracts `act`. |
| `element.ref` access (ref-as-prop change in 19) | ✅ verified clean | No `element.ref`/`child.ref` reads; the single `cloneElement` site (`Text.js`) passes plain props only. |
| Render-error handling changed in 19 (errors not re-thrown; `onUncaughtError`/`onCaughtError` root options) | 🔶 note | Affects host-side error reporting expectations; synergizes with the §9.4 work on the *existing* per-node boundary (whose `onError` reporting is currently broken — §2.6-3). |
| `@types/react@19` for `gen-ts` | 🔶 at flip time | Pin explicitly alongside the dev-dep bump. |
| **CI coverage of the declared peer range** | 🔶 **suite gating on 16/17/18, artifact gating on 16/17, advisory on 19** | `npm ci` installs exactly one React, so for most of Phase 0–2 the range was asserted only by the d.ts consumer matrix (Phase 0.6 — types, not behavior). Four legs now cover it. **Gating:** `test:pack:peers` (`scripts/test-packed-react-matrix.js`) re-runs the packed-tarball smoke against React **16.14** and **17** installed into throwaway directories — it verifies module resolution, the render path and CSS wiring of the *published artifact*, which is what a peer range is a claim about, but not interactive behavior. **Advisory:** `react-19-advisory` (`continue-on-error: true`) installs `react@19`/`react-dom@19` over the lock with `--legacy-peer-deps` (SUIR *and* `react-final-form` 6.5.9 both peer-cap at `^18`) and runs `npx jest`. As of 2026-08-27 that leg is **green at 143 suites / 2015 tests**, re-measured on 19.2.8 — treat any future red as real drift, not as expected noise. **Gating on the floor (added 2026-08-25):** `test:react16` (`jest.react16.config.js`, CI job `react-16-floor`) runs the *full* suite on React 16.14 and is **green at 143 suites / 2015 tests — the same totals as the React 18 leg** (in CI it reads `3 skipped, 2012 passed, 2015 total`: `static/` is git-ignored, so the published-artifact block of the CSS parity suite skips on a clean checkout). Mechanics: React 16.14 comes from an install-only fixture package (`scripts/fixtures/react16-floor`, linked as the `react-16-floor` devDependency) that npm nests rather than hoists, so plain `npm ci` installs it and **no `--legacy-peer-deps` is needed**; `moduleNameMapper` points `react`/`react-dom`/`scheduler` at it, `scripts/fixtures/react-legacy/react-dom-client.js` stubs the entry point React 16 does not have but RTL requires eagerly, and `scripts/fixtures/react-legacy/harness.js` forces `legacyRoot: true`. RTL 16.3.2's `react ^18 || ^19` peer range is a declaration, not a functional block. **Correction to an earlier note here:** aliased devDependencies (the `react-types-16` trick) *cannot* carry a runtime React — `react-dom@16.14.0` peer-requires `react`, and npm resolves that against the hoisted `node_modules/react` that React 18 owns, so the install aborts with `ERESOLVE` and no `overrides` entry can rescue it. **Guarding against a false green:** the config asserts the fixture's pinned versions in the parent process and the setup file asserts `React.version`/`ReactDOM.version`/`scheduler` inside every worker, so a mapping that silently fell back to the repository's React 18 fails every suite instead of passing. All four failure modes were exercised (mapping removed, mapping half-applied, fixture uninstalled, `legacyRoot` patch dropped) and each fails loudly. The previously recorded **1944/1946 on 16.14** measurement is superseded: the two failures were React 16 SyntheticEvent pooling in the *assertions* of `Input.behavior.test.js` and `Pagination.behavior.test.js` — both now read the event inside the callback instead of retaining it, which is version-agnostic and needed no product change. So the §9.5 RTL-free mount harness stays an option here, not a prerequisite. **Gating on 17 (added 2026-08-27):** `test:react17` (`jest.react17.config.js`, CI job `react-17`) runs the *full* suite on React 17.0.2, **green at 143 suites / 2015 tests — the same totals as the 18 and 16.14 legs, no exclusions**; every end of the declared range now runs the whole suite. Second fixture (`scripts/fixtures/react17-floor`, devDependency `react-17-floor`), shared harness rather than a copy: `scripts/fixtures/react-legacy/{floors,jest-config,harness,react-dom-client}.js`, with a three-line jest config and a one-line setup entry per leg, so each pinned version string exists in exactly one place. Three **verified** differences from 16, none of them assumed: react-dom 17.0.2 peer-requires `react` at the **exact** version (16.14 asks for `^16.14.0`), which makes the `file:` fixture even more necessary; its scheduler line is **0.20**, not 0.19, which is why each leg resolves `scheduler` from its own `react-dom` rather than from the repository root; and 17 likewise ships no `react-dom/client` (no `client.js` and no `exports` field in either fixture install), so the same stub applies unchanged. Assumption retired: `react/jsx-runtime` is present in **both** 16.14.0 and 17.0.2 — 16.14.0 is the release that added the new JSX transform — so the Phase 4 flip is not a 17-and-up affordance. One guard beyond the four: `assertHarnessNotShadowed()` fails the run if the harness ever ends up under a fixture's `node_modules`, which would leave every version check unable to see a dead mapping. All failure modes were re-exercised on 17 — mapping removed → 140 suites fail with **0 tests run**; either of `react`/`react-dom` alone falling back to 18 → fails naming the mismatched package; fixture version drifted or uninstalled → parent-process error before jest starts; `legacyRoot` patch dropped → the stub throws. Cost: one more ~40 s job, parallel with the others. **Remaining gap:** nothing in the declared range is suite-uncovered any more; 19 stays advisory, and all three legs are jsdom, so browser-level behavior is still only the §9.5 visual/a11y item. |

**Position:** the engine decomposition (§9.3) is **not** a React 19 gate — `UNSAFE_*` lifecycles run unchanged on 19; that workstream is about StrictMode/concurrency readiness.

**Fast path to 19.** The earliest viable point is **right after Phase 5a** (SUIR JS exit), without waiting for Phase 6:

1. Phase 5a complete **including the removal of `semantic-ui-react` from `dependencies`** (F1 step 3½ — the npm peer chain, not just the bundled code, is what caps hosts at React ≤18, §2.6-11);
2. form-stack major bump done (§9.7-F4 — can run in parallel any time after Phase 3). **Gates 1 and 2 are coupled, not independent:** `react-final-form` 6.5.9 declares `react ^16.8.0 || ^17.0.0 || ^18.0.0` itself, a **second host cap alongside SUIR's** — declaring `^19` while it is installed publishes a peer set npm cannot satisfy. The rff 7 bump is therefore a hard prerequisite of the flip, at the behavioral cost measured in §9.7-F4;
3. `defaultProps` sites fixed (Phase 2) and automatic JSX runtime enabled (Phase 4);
4. bump `@testing-library/react` to ≥16.1 (the first RTL with `react ^19` peers), add `react@19` to the dev/CI matrix, run the full regression (contract suite + example QA), then widen peers **additively**: `^16.14.0 || ^17.0.0 || ^18.0.0 || ^19.0.0` — the floor stays, hosts on older React are unaffected.

Do not promise 19 support to consumers before those gates are green.

---

## 9. Modernization roadmap (preserving the principles)

### 9.1 Ground rules

Every workstream below is a series of small, independently shippable, reversible steps. The five invariants from §2.5 are the constitution; anything violating them needs an explicit decision, not a drive-by change. First action of this section: **write the invariants down in README/CLAUDE.md as explicit architecture principles.**

### 9.2 Workstream A — Class → hooks migration (leaf-first)

**Motivation:** 21 class components, most carrying `UNSAFE_componentWillReceiveProps` that is a simple props→state derivation. Hooks versions are smaller, StrictMode-safe, and testable.

**Rules of engagement:**
- One component per PR. Refactor only components with existing tests (write them first otherwise).
- Public props contract of each component must not change (the meta contract depends on it).
- No behavior changes bundled with the migration.
- After a component's hooks migration lands, convert it to `.tsx` in the follow-up PR (§9.6-E2); trivial leaf components may combine both in one PR.

**Suggested order (dependency- and risk-sorted):**

1. Leaf presentational, mechanical conversions: `Expand`, `Counter`, `ProgressBar`, `ProgressSteps`, `InputNative`, `Tabs` (components pack; gate `Tabs` on the H6 duplicate audit first). `Carousel` and `Collapse` turned out to be orphans (§9.9-H1) — **delete instead of migrating**; `Square` is already a function component, and the pack `TabList` joined the orphan list (mapper uses the engine copy — §2.6-14).
2. Function-component `defaultProps` → default parameters: **done in Phase 2** (`TooltipPop`, `Image` — §6 step 1; React 18.3 warns on them); the third site, `ImageSwatch`, is an orphan resolved by deletion (§9.9-H1).
3. Page-level: `pages/main/components/Tabs`, `TableView`, `LocalDraftTableRow`.
4. Module-level: `AutoSave`, `ToggleField`, `asInputDateField`, `Upload` views.
5. **Not in this workstream:** `rules.js`, `form/utils.js`, `mapper.js`, `Render.js` → §9.3.

**Acceptance per component:** tests green, demo example using the component pixel-equivalent, no new console warnings.

### 9.3 Workstream B — Decompose the lifecycle engine (`rules.js` / `form/utils.js`)

**Motivation:** the prototype-patching of `UNSAFE_*` methods (`rules.js:593–595, 1182–1220`; `form/utils.js:397, 466, 598–615`) is the single biggest source of: StrictMode incompatibility, React 19 uncertainty, onboarding cost, and the high perceived risk of any change near the engine. 1868 lines across two files carry most of the library's behavior.

**Strategy — characterize, extract, replace (in that order):**

1. **Characterize:** contract tests from §9.5 must cover every documented meta capability before any surgery.
2. **Extract pure logic and break the import cycle:** data processing, error mapping, `showIf` evaluation, payload assembly → pure functions in `ui-utils-pack` with direct unit tests (much of `utils.js` already leans this way). This is also where the engine↔form-modules cycle dissolves — `errorsProcessing`, `formsStorage`, `clearErrorsMap`, `storedTouched` (§2.6-4) move into a neutral module imported by both sides.
3. **De-globalize instance state:** the engine writes instance-bound state into module globals — `Active.translate` (`rules.js:245`), the module-level `errorHandlerFunction` (`rules.js:241–243`), and ~12 action handlers bound to `this` on the shared `FIELD.FUNC` registry (`rules.js:616–1081`, resolved at render time through `transforms.js`). Today two `UIRender` instances on one host page silently hijack each other's actions/translate, and StrictMode's double-invocation exercises exactly these writes — a decomposition that skipped this step would still fail the workstream's own acceptance gate. Inventory all module-global mutable state — `Active.*`, `FIELD.FUNC`, `errorHandlerFunction`, translation registries, plus `formsStorage`, `errorsMap`, `formInitialValues`, `storedTouched` (§2.6-5) — and move it to per-instance context; make the modal portal root per-instance too (today every instance renders the same fixed `id="render-popup-root"` and the portal grabs the first one in the DOM). Add a two-instances-on-one-page case to the contract suite (R14).
4. **Fix the catalogued runtime hazards (§2.6-6):** deduplicate the per-render `form.subscribe()` and keep/call its unsubscribe; move the setState-in-render Dropdown branch into an effect/derivation; make the debounced `handleChangeInput` per-instance instead of prototype-shared; stop mutating state via `set(this.state, …)` (clone or immutable update); cancel `AutoSave`'s debounce on unmount; stop re-creating the `autoSubmit` debounce every render. Each is a small, testable fix — most can ship before the full decomposition.
5. **Replace mutation with composition:** convert prototype patching into explicit HOC/wrapper composition (`withUIRenderLifecycle(Component)`) — same behavior, but visible in the component tree and StrictMode-analyzable.
6. **Hooks form (final state):** lifecycle logic as hooks (`useUIRenderData`, `useFormIntegration`), classes retired.
7. **Acceptance for the whole workstream:** demo runs clean under `<StrictMode>` per the §7 definition (subscriptions, cleanup, no setState-in-render, two-instance isolation).

All decomposition outputs are authored in TypeScript from the start (`engine/*.ts`, §9.6-E3) — the old monoliths are never converted in place.

**Catalogued while removing the popup path guess (§2.6-16), left for this workstream rather than patched piecemeal:**

- **The popup scope resolution chain has four dead branches.** `rules.js` tries four numbered sources before falling back; measured over the full suite, branches 1–3 never fire and branch 4 fires without ever matching. Branches 1–3 read `this.props.relativePath` on the `UIRender` instance, which nothing in the tree sets and which is not in `UIRender.propTypes`. Branch 4 scans `Object.keys(form.getState().values)` for a bracketed `name[n]`, but final-form nests bracketed names into real arrays, so a top-level values key can never contain `[` — the intent was `form.getRegisteredFields()`. Only two sources actually resolve a scope: an authored `{relativePath}` in the action args, and the path captured when a `Popup` inside a row registers its template. Deleting the dead branches is a behaviour change (branch 4's `relativeData` assignment feeds the id-interpolation vars) and needs its own diff and tests.
- **A popup item bound by `name` renders its whole row object.** Because popup content is rendered with `relativeData: false`, an item such as `{view: 'Text', name: 'orderNo'}` inside a popup receives the row object as its child and throws `Objects are not valid as a React child`. Consequently the `config.md` claim that popup fields receive the current row's data automatically holds for inputs only.

**Do not start** until Phase 2 has shipped and §9.5 contract tests exist. This is the deep end.

### 9.4 Workstream C — The meta/data contract as a first-class artifact

**Motivation:** the contract *is* the product; today it exists as convention + examples.

- **JSON Schema — shipped 2026-08-27** (`meta.schema.json`, draft 2020-12, at the repo root, in `package.json#files` and the pack budget's REQUIRED list): IDE autocomplete and validation for meta authors. Derived from measurement — the live `FIELD` vocabularies after the engine finishes registering them, every attribute shape across the 38 tracked examples, and ~35 probes for where the engine actually breaks — so it is **permissive by construction**: view/render/action names are `anyOf: [enum, string]` so editors suggest without rejecting, unlisted properties are allowed, and `null` is accepted wherever the renderer deletes it. It constrains only verified crashes. Kept honest by `examples.meta-contract.test.js`, which evaluates all 38 examples through an evaluator that throws on any keyword the schema uses but the suite does not check, compares the suggested vocabularies against the live `FIELD` groups, and — added after review found the schema had drifted *stricter* than the engine on eight shapes — pins the biconditional "the schema rejects a shape exactly when the validator calls it an error". A schema stricter than the engine reddens an author's editor on working meta, which is worse than a loose one.
- **Dev-mode runtime validation — shipped 2026-08-27** (`src/core/ui-render/validateMeta.js`, exposed as the `validateMeta` prop): reports `[ui-render] meta error at "items[3].items[0].name": …` instead of a downstream crash. Hand-rolled, **no runtime dependency** — a JSON-Schema library would be weight in every host bundle, and this codebase consistently goes the other way (`lodash-lite`, custom SVG charts). Off by default and walks nothing until asked; reports on `console.warn`, not the `error` channel the suites allowlist; never throws. Two severities: `error` means the engine throws (each one paired in tests with a render proving it does), `warning` means it renders but silently degrades. Handler names are deliberately unchecked — they resolve against built-ins *plus* the host `methods` prop *plus* instance methods, so a warning could not distinguish a typo from a valid host method. The path notation is shared with the error boundary through `ui-render/metaPath.js`, so both halves of §9.4 name a node the same way.
- **Contract versioning — shipped 2026-08-27:** optional root-level `metaVersion` (`"MAJOR"` or `"MAJOR.MINOR"`, current `1`), absence meaning "current". No negotiation machinery beyond the field and its documented meaning — anything more would be speculative. Made genuinely inert: as a raw passthrough it reached the DOM as `metaversion="1"` with an unknown-prop warning, so `metaToProps` now strips it and `$schema` alongside it (which is what makes an inline editor pointer usable). Both are asserted byte-identical against the same document without them, and the host's own meta object is proven untouched.
- **Error boundaries per render node — shipped 2026-08-27** (`Render.js`, `metaPath.js`, `mapper.js`; contracts in `ui-render/__tests__/Render.error-reporting.test.js`, `pages/main/__tests__/mapper.error-sink.test.js`, `pages/main/__tests__/UIRender.error-hook.test.js`): the boundary was extended, not replaced. The signature mismatch is fixed (`mapper.js` read `{err, errInfo}` off a report emitted as `{error, errorInfo}`, so it printed `undefined undefined` — and to `console.log`, which is why nobody noticed); the sink now formats on the error channel. Every report carries `path`, the JSON path of the failing node, and so does the diagnostic rendered in its place: `[ui-render] render error at "items[1]" (view "Table", name "orders"): TypeError: …`. The path notation is shared with the dev-mode validator through `ui-render/metaPath.js` (the validator's private `joinPath` moved there), so both halves of §9.4 point at a node the same way. A documented `onError` prop on the public API receives the report — `{error, errorInfo, path, props, message}` — alongside the library's own sink, reached through the `instance` every node already carries rather than a module global two renderers would share; a host reporter that throws is caught. **How the path is threaded, and its limit:** position travels down a React context, not props — every prop a node carries is spread onto the resolved component and can reach the DOM (that is how `currencyCode` used to leak, fixed 2026-08-27), and the DOM baseline confirms the diagnostic adds nothing there. The path covers the `items` backbone and table cells; a node a component builds without a position (a tab's content, an icon definition) reports the closest enclosing node, and a value-definition renderer supplies a row index, so under one of those the last segment names a row rather than an `items` slot. It is exact for a failure inside the component a node resolved to, and names the parent for a failure the engine hits while preparing a node — because that is where React's boundary is, not because of the threading.
- **One DOM boundary for engine-internal props — shipped 2026-08-28** (`src/core/components/domProps.js`; applied in `Text`, `View`, `Row`, `Label`, `Button`, `InputNative`, `Dropzone`, `ScrollView`, `Dropdown`, `pages/main/components/TableView`, and — added after review — `Slider`, `Icon`, `Image`, `Tooltip`, `InputNumber`, `Checkbox`, `InputDate`; `_comment` also dropped at source in `ui-render/transforms.js`; contracts in `components/__tests__/domProps.test.js`, the extended `ui-render/__tests__/validateMeta.contract.test.js` block, `components/__tests__/Dropdown.behavior.test.js`, `pages/main/components/__tests__/TableView.test.js`, and the counted-zero `FIXED_PROP_LEAKS` tripwire in `demo/examples/__tests__/examples.dom-contract.test.js`). **This closes the leak family at every boundary reachable from meta — but the corpus was not a sufficient audit of that, and the first version of this claim was wrong.** Review found seven more leaking boundaries (`Slider`, `Checkbox`, `InputNumber`, `InputDate`, `Icon`, `Image`, `Tooltip`), none of which appeared in the 38-example baseline for the simple reason that no example passes an engine prop to a slider or an icon. They were found instead by enumerating every spread onto a DOM tag and probing each directly — that is the audit method to repeat, not re-reading the snapshots. What remains uncovered spreads onto a DOM tag but is unreachable from meta (`mapper.js` resolves no view to it), and is mostly the §9.9-H1 orphan set; each becomes a boundary the day it is wired up. `currencyCode` (331 occurrences, fixed 2026-08-27) was the fourth prop patched one at a time — after `expanded`, `translate` and `onDataChanged`, each with its own `foo: _` destructure in its own component — and the DOM baseline then measured the next seven: `data` 40 (as `data="[object Object]"`), `_data` 40, `symbol` 23, `view` 15, `index` 8, `label` 6, `_comment` 2, plus 108 of 165 `name`. **The four causes were independent**, which the baseline's own prose got wrong: the `Render.Method` options bag at `transforms.js:191` (`{...props, ...definition, symbol, data, _data}` — the node's props PLUS the meta node) accounts for `data`/`_data`/`symbol` and 40 `name`; meta keys no view consumes reaching `View`/`Row`/`Text`/`ScrollView`/`Label` account for `index`/`label`/`_comment` and 24 more `name`; `LocalDraftTableRow` building input props from a **raw, untransformed** nested meta node accounts for all 15 `view`; and `TableView`/`Dropdown`/`Dropzone` genuinely needing `name` while spreading it onto a non-form element accounts for the last 44. So narrowing the bag at `transforms.js` — the obvious fix — could reach at most 143 of 242 instances and none of the four the header called out; the boundary reaches all of them. **The design is two lists, and the split is the load-bearing part:** `ENGINE_PROPS` is stripped at every boundary, while `FIELD_ONLY_PROPS` (`name`, `label`) is stripped only on generic containers and KEPT on the form-control family, because `name` is the react-final-form registration path (`modules/form/utils.js` asField, `InputNative`/`Select` onChange, `TableView`'s FieldArray) and a single global denylist would unbind every form field while still rendering. Proof it is attribute-removal-only: with those eight attributes stripped from both sides and whitespace collapsed, the old and new 38-snapshot baselines are equal strings, and the element multiset, the full `class` list, the full `id` list and all 705 visible text nodes (6567 characters, 21 currency symbols, 31 percent marks) are identical; the surviving 57 `name` attributes all sit on an `<input>`. Not covered by the boundary and left alone: `onDataChanged` and a function-valued `translate` still reach a spread somewhere and React still warns on both — those are camelCase, so the registry suite's allowlist already sees them, which is a different defect class from the silent lowercase one this closes.
- **Public config channel — repaired 2026-08-27** (`providers/ConfigOverride.jsx`, `rules.js`, `library/main.js`, `contexts/ConfigContext.js`, `components/TextDateValue.js`; contracts in `pages/main/__tests__/UIRender.config-channel.test.js` and `library/__tests__/library.public-api-and-wrapper.test.js`). All four broken links in §2.6-2 were re-verified before the fix and all four were real. `dateFormat`, `currency` and `language` are now published to the whole subtree by one small provider component that MERGES over the inherited configuration, so passing one key does not reset the others. It is applied in **two** places for one reason: the engine publishes for the components it renders — which is what makes the props work for a host that mounts `pages/main/rules` directly, as the demo and both harnesses do — and the library entry point lifts the same values ABOVE `AppWrapper`, which is outside the engine and turns `currency`/`language` into the shell's CSS classes. The dead `dateFormat` pass-through into `<Render>` is gone; `Render.js` still drops the prop (a pinned contract) because configuration travels by context, not on every node's props. `initialConfigState` now declares `setConfig`, the name the provider actually exposes, and `TextDateValue` honours the `dateFormat` prop it declares, with an explicit format winning over the configured one. **Consumer-visible:** dates start honouring the prop, and the DOM baseline was unaffected only because the harness passes the same value the default already had.
- **Generated view-type reference — shipped 2026-08-27** (`scripts/generate-view-reference.js` + `scripts/view-reference-curation.js` → `docs/SUPPORTED-VIEWS.md`, guarded by `scripts/__tests__/view-reference.contract.test.js`): the first option, derive-from-constants, was taken; converting the resolver `switch` into a registry table stays §9.3 work. The generator splits the page in two halves and enforces the seam. **Derived** (never curated): the vocabulary itself, read out of the three modules that assign to `FIELD` — `variables/fields.js`, `form/constants.js`, `pages/main/rules.js` — with a check that no fourth module has started assigning; and the resolution status, read from the references `mapper.js` and `components/renders.js` make to each constant. **Curated** (only in the curation module): one-line descriptions, the component each view resolves to, and notes. The mapping is total both ways, so a new constant, a deleted constant, a new `case`, a deleted `case`, a renamed target component or an entry the parser cannot read each fail the check with an actionable message; wired as `npm run docs:views` / `docs:views:check`, in `prepack` beside `sync-version --check`, as a `verify` step, and in the suite (so all four legs cover it). The contract test also compares the statically parsed constants against the real, fully assembled `FIELD` object, so the parsing cannot lie about the vocabulary. **Findings the page now records:** 46 `view` constants, of which **9 have no resolver case at all** and render the "field does not exist!" placeholder — `Date`, `Dates`, `Fields`, `FieldsWithLevel`, `Group`, `Link`, `Place`, `UploadGrid`, `UploadGrids` (this note previously recorded only `FIELD.TYPE.DATE`; `Date` is also live as a `FIELD.RENDER` value, which is why the string looks used); `view: "Tab"`, which several example metas carry, is not a constant at all and is inert because `Tabs` consumes its items as `{tab, content}` pairs. **Known limit:** the prose is not machine-checked against behaviour — changing *what* `Column` renders passes as long as the `case` stays. Only the registry-table conversion closes that.

### 9.5 Workstream D — Testing as the enabler

- **Contract tests in two layers** (built immediately after Phase 2, extending the Phase 0 smoke harness): (1) **full-DOM snapshots** of every `src/demo/examples/` meta+data pair — these gate the *pure refactors* (§9.2/§9.3), where the DOM must stay byte-identical; (2) **markup-independent behavioral assertions** — roles/labels/visible text, form value + submit-payload round-trips, open/close/keyboard behavior — expressing the actual meta contract. The behavioral layer is what gates F1, where the DOM *intentionally* changes and snapshots must be regenerated deliberately rather than rubber-stamped. **Layer (1) shipped 2026-08-27** (`src/demo/examples/__tests__/examples.dom-contract.test.js`, 38 snapshots): renders every example twice to separate a real change from nondeterminism, sorts attributes so one baseline serves React 16.14/17/18/19, refuses to self-write under `CI=true`, and carries a ledger of the defects the baseline encodes so they are recorded rather than blessed. **Ledger corrected 2026-08-28:** the engine-internal prop leaks it described in prose are fixed (§9.4, the DOM boundary) and are now counted-at-**zero** tripwires (`FIXED_PROP_LEAKS`) plus a `name`-only-on-a-form-control invariant, so a relapse fails a test rather than needing a reader to notice it in a diff; the `data="[object Object]"` entry is deleted, and the two remaining counted entries (`id="undefined"` 12, `undefined-last` 20) are unrelated defects awaiting their own fixes. Two claims made while the leaks were live were wrong and are recorded in the file: they were **not** all facets of one root cause (there were four, §9.4), and `index=` was stated as 34 when there were 8 — the likely origin being that the ledger splits on a raw marker, so an unprefixed `'index='` also matches every `tabindex=`. Markers there are space-prefixed now. **Layer (2) shipped 2026-08-27** — 4 suites, 104 tests, over one shared harness (`src/demo/testing/mountExample.js`): the manifest-wide floor in `src/demo/examples/__tests__/examples.behavior-contract.test.js` and the three per-view contracts that gate F1 — `pages/main/__tests__/UIRender.listbox-behavior` (Step 3), `UIRender.overlay-behavior` (Step 2, plus the modal-popup round trip) and `UIRender.table-behavior` (Step 1). Every handle is a role, an ARIA state, an accessible name, visible text or a form value; no CSS class, no `querySelector`, no element shape — so the assertions survive the F1 rewrites, and the pinned values are LITERALS in the test files rather than a `.snap`, so `-u` cannot bless a change to them. **The gap this closed was bigger than it looked:** the existing `Dropdown.behavior`/`Dropdown.more`/`Dropdown`/`TooltipPop` suites all open with `jest.mock('semantic-ui-react')` and assert the PROPS OBJECT handed to SUIR — the very seam F1 removes — so before this layer nothing anywhere opened a dropdown or a tooltip, and the wrapper could have been replaced with something that opened nothing while all 63 Dropdown tests stayed green. `Table` was covered only through class-name `querySelector`s and mapper prop assertions. What layer (2) now pins: option lists read through `role=option` with `aria-selected`, cascading parent -> child reset, keyboard open/move/commit/Escape, `readonly` refusing to open, hover-delay tooltip open/close, `popupOpen` -> visible content -> dismiss through the real `AppProvider`, header/cell text and pagination by accessible name, a per-example census of every accessible role in the corpus, and the `name`->submit-payload round trip for every bound control. **Findings recorded as counted tripwires rather than fixed:** 82 of the corpus's 117 interactive controls compute an EMPTY accessible name; `expandList`, `tabs`, `tabsButtoned`, `upload` and `uploadVariants` expose no interactive role at all (so tabs and upload have no keyboard contract layer (2) can express — they belong to the mandatory Playwright suite below); the open tooltip carries neither `role="tooltip"` nor `aria-describedby` and does not open on focus; SUIR's dropdown announces its selected value with `role="alert" aria-live` (every `alert` in the census is one dropdown, and all of them should go to zero at Step 3); and arrow-key navigation commits as it moves (`selectOnNavigation`), so Escape closes the list without restoring the previous value. Sorting and row expansion are NOT covered here: no manifest example enables either, so there is nothing to drive from meta — giving them a markup-independent gate needs an example first.
- **CI compatibility matrix:** primary suite runs on React 18. Add a lightweight matrix job for React 16.14 / 17 — a minimal mount harness (plain `react-dom` `render`/`createRoot`, *no RTL*) that mounts the example set. **Superseded for 16 and 17 (2026-08-25 / 2026-08-27):** the `react-16-floor` and `react-17` CI jobs run the *whole* RTL suite on 16.14 and 17.0.2, both green at 143 suites / 2015 tests, so a separate RTL-free mount harness is no longer the only route — see §8, "CI coverage of the declared peer range". The install-mechanics warning recorded here was also only half right: the blocker is not RTL's peer range (a declaration RTL's legacy-root path ignores) but `react-dom@16`'s own `peer react`, which npm resolves against the hoisted `node_modules/react`. The "isolated mini-package with its own `package.json`" option is the one that works, and is what shipped at both ends (`scripts/fixtures/react16-floor` and `scripts/fixtures/react17-floor`, linked as `file:` devDependencies, over one shared harness in `scripts/fixtures/react-legacy/`); `overrides` does not help and `--legacy-peer-deps` proved unnecessary. With 17 wired the wide peer range is an enforced guarantee rather than a hope; what is left of this bullet is browser-level coverage (the visual/a11y item below), not version coverage.
- **Canonical example manifest — shipped 2026-08-27** (`src/demo/examples/manifest.js` + `manifest.contract.test.js`): one manifest (id → meta + data + flags) consumed by both the demo and the harness, so "every example" means the same thing everywhere, and 0.8's tracked-files rule has the single enforcement point it asked for — the contract fails if the manifest imports anything not git-tracked, if a tracked file is left unclassified, or if the unregistered list goes stale. Two corrections to the original description: the aggregator was never `_meta.js` (that file is one 749-line meta backing the single `all` example) but an inline `examples` array in `Examples.jsx`, now removed; and that array named three ids whose files do not exist. Enforcement is top-level-only by design, so a tracked example in a *subdirectory* would need the contract widened.
- **Suite guards:** fail tests on unexpected `console.error`/`console.warn`; coverage thresholds for the engine files (ratcheted, not aspirational); a public-entry test that `require()`s the packed tarball (0.7) rather than `src/`.
- **CSS pipeline parity (§2.6-7) — shipped 2026-08-27** (`src/style/__tests__/css.pipeline.parity.test.js`, 14 tests): compiles the final CSS through the *webpack* PostCSS config and pins (a) the exact set of unscoped `html`/`body`/`*` rules that escape, as an inventory of what a host page receives merely by loading the stylesheet, and (b) that `scripts/build-css.js` scopes identically. The H8 decision is **not** pre-empted — the leak is pinned as current behaviour, not fixed, so the test fails if it changes either way. The LESS-stage test it complements is `css.compilation.test.js`.
- **Visual/a11y regression is mandatory for F1** (not optional): Playwright over the demo with keyboard-navigation, focus, portal/click-outside and screen-reader-attribute assertions gates every F1 step; it stays optional for pure refactors, where DOM snapshots already gate.

### 9.6 Workstream E — TypeScript migration

**Decision: full migration of the library source to TypeScript.** Motivation: the meta/data contract and pack APIs are exactly the implicit knowledge TS makes explicit; `propTypes` are inert for function components on React 19; and the previous hand-written `.d.ts` had drifted silently from reality. Phase 0.6 corrected that baseline, but a hand-maintained contract remains a future drift risk until the E4 switchover.

**Audited starting point:** 2 TS files (hand-written public types in `src/library/types/`, compiled declaration-only via `tsconfig.build.json`) vs 257 JS/JSX files. Webpack rules (all three configs) and the nodemon watcher already accept `.ts/.tsx`, and `typescript` 5.x + a TS-aware ESLint config are installed — **but `babel.config.js` has no `@babel/preset-typescript`**, so a `.ts` file imported into the bundle today would not compile, and there is no root `tsconfig.json`. Migration is file-by-file rename with strict checking of converted files only — no big-bang.

#### E0 — Infrastructure (small, zero behavior change; land after Phase 2)

1. Add `@babel/preset-typescript` to `babel.config.js` — webpack (lib/demo/watch) and Jest all consume this one config, so a single change covers all four pipelines.
2. Add root `tsconfig.json`: `strict: true`, `noEmit: true`, `allowJs: true` + `checkJs: false` (unconverted JS resolves but is not checked; every converted file must be strict-clean), **`isolatedModules: true`** (required — Babel strips types file-by-file; bans `const enum` and cross-file type tricks), `experimentalDecorators: true` (matches the legacy-decorator files until §9.2/§9.3 retire them), `jsx: react` (flips to `react-jsx` together with the Phase-4 automatic-runtime switch).
3. CI gate: `npx tsc --noEmit` green from day one.
4. **Probe check before any real conversion:** one trivial `.ts` module imported by the library entry + one `.test.ts` — verify all four pipelines pass (lib build, demo build, watch build, Jest).

#### E1 — Utils and contract first (highest leverage)

- `src/core/utils` (~36 files, pure, React-free) — mechanical conversion, immediately types everything downstream.
- **Contract types for meta/data**, authored together with the JSON Schema (§9.4). Pick one source of truth (types→schema or schema→types) and add a round-trip check so they cannot diverge.

#### E2 — Components and modules (rides other workstreams)

- Each component converts to `.tsx` in the PR **following** its hooks migration (§9.2) — one moving part per PR; trivial leaf components may combine both.
- The F1 replacements (`Table`, `Tooltip`, `Dropdown`) are **born as TS**.
- Delete `propTypes` per converted component.
- `src/core/modules` converts after the shapes it consumes (components/utils) stabilize.

#### E3 — Engine last

`rules.js` / `form/utils.js` are typed **as they are decomposed** (§9.3) — decomposition outputs are born as `engine/*.ts`. Typing the prototype-patching machinery as-is is wasted effort; don't.

#### E4 — Public API switchover (the risky step)

- Switch `gen-ts` from the hand-written `src/library/types/index.ts` to emitting declarations from the real, now-typed entry chain.
- **Golden-file check:** the golden baseline is the **Phase 0.6 corrected contract** — never the legacy shim d.ts that shipped before it (§2.6-1). After the switch, the diff against that baseline must contain only intended changes — consumer-facing types must not silently narrow or widen.
- Delete the hand-written types folder once the diff is accepted.

#### E5 — Retire the `prop-types` runtime dependency (runs alongside E2/E3, completes after E3)

**Audited usage:** 40 files import `prop-types`; **all usage is declarative** (`.propTypes =` statics — zero manual `checkPropTypes()` calls anywhere), and ~90 call sites (plus the proxy's own ~60 definition lines) go through the semantic proxy `src/core/components/types.js` (`type.Id`, `type.Px`, `type.Milliseconds`, …), which the engine also consumes (`rules.js:219`, `Data.js:30`). Two extra reasons beyond TS redundancy: React 19 removes propTypes validation entirely (on 19 the package is pure dead weight), and no strip-plugin is configured today — the shapes **ship in the production bundle**.

1. **Per-file (rides E2/E3):** delete the `.propTypes` block and the `prop-types`/`type` imports as each file converts — the TS types take over the validation role.
2. **The semantic vocabulary survives as types:** recreate `types.js` as TS aliases with the same names (`type Id = string`, `type Px = number`, `type Milliseconds = number`, …) so the self-documenting style is preserved; the engine's `type.*` usages map onto these during E3.
3. **Final PR:** when `rg "prop-types" src` returns nothing — remove `prop-types` from `dependencies`, record the bundle-size delta (a small drop is expected).
4. *Optional interim, independent of TS:* `babel-plugin-transform-react-remove-prop-types` in production builds strips the shapes from `dist` immediately — worth adding only if the E2/E3 tail runs long.

#### Governance — go/no-go after E1

E0/E1 plus the contract types are committed scope. Before green-lighting the long E2/E3 tail (~250 files riding two large workstreams), hold an explicit go/no-go on measured E1 conversion velocity. Until E4 lands, hedge the hand-written `dist/index.d.ts` cheaply with type-level tests (`tsd`/`expectTypeOf`) asserting the public types against the example metas.

#### Definition of done

`src/core` + `src/library` fully `.ts/.tsx` under `strict`; `allowJs` turned off; d.ts generated from source; `propTypes` gone and the **`prop-types` package removed from `dependencies`** (E5). The demo may stay JSX (it is not published) and converts opportunistically.

#### E-checks

| Check | When |
|---|---|
| Probe `.ts` + `.test.ts` pass all four pipelines (lib/demo/watch builds + Jest) | E0, before any real conversion |
| `tsc --noEmit` in CI, green, coverage grows with every conversion | continuous |
| `isolatedModules` discipline (`export type` in barrels, no `const enum`) | continuous |
| Decorator semantics unchanged for the legacy-decorator files (Babel `legacy` ↔ TS `experimentalDecorators`) | E0/E2 |
| Bundle size neutral after each conversion batch (compare `dist/index.js` in CI) | continuous |
| Golden `dist/index.d.ts` diff shows only intended changes (baseline = the Phase 0.6 contract) | E4 |
| Consumer d.ts compile matrix vs `@types/react` 16/17/18 (+19 at the flip) stays green | Phase 0.6 → continuous |
| No `checkPropTypes()` calls exist (✅ verified — usage is purely declarative, safe to delete) | audit fact |
| `rg "prop-types" src` empty → dependency removed; bundle-size delta recorded | E5 |

**Effort:** E0 — days; E1 — 1–2 weeks; E2/E3 — ride their host workstreams; E4 — days plus careful review. A continuous background track made of small PRs.

### 9.7 Workstream F — Strategic dependencies

#### F1 — `semantic-ui-react` exit plan

**Decision: full exit.** SUIR is a bundled `dependency` (not externalized), pinned to a beta of a project whose last stable release (2.1.5) is ~3 years old (§8), and is the main external React 19 blocker. The audit shows the exit is a bounded project, not a rewrite.

##### F1.1 Audited dependency surface (much smaller than assumed)

**JS side — exactly 3 of 54 files in `ui-react-pack` import SUIR:**

| Wrapper | SUIR component | Consumers | Behavior surface to reproduce | Size |
|---|---|---|---|---|
| `Table.js` (24 lines) | `Table` + `Header/HeaderCell/Row/Cell/Body/Footer` re-exports | `mapper.js` (incl. `Table.Cell` at :170), `TableView.js`, `LocalDraftTableRow.js`, `ErrorTable.js` | **Markup/className sugar only** over native `<table>` elements. Semantic's own table CSS is *not even loaded* (commented out in `_semantic.less`) — all table styling is already in-house LESS. | **S** |
| `TooltipPop.js` (26 lines) | `Popup` | `mapper.js` (`Render.Tooltip` at :44, tooltip renderer at :483) | Hover/focus tooltip: `trigger`/`content`, 500 ms enter delay, `inverted`, position passthrough. | **S–M** (needs a positioning primitive) |
| `Dropdown.js` (272 lines) | `Dropdown` | `mapper.js` Select/Dropdown views (:540–544), incl. cascading-select logic | The real work: `selection`, `search` (+`deburr`), `multiple` (chips), `allowAdditions` (+label/position), `lazyLoad`, `upward`, `disabled`, `noResultsMessage`, custom icon node, keyboard navigation. Note: the wrapper already **owns the external API** — `onChange(value, name, event)`, option sanitization, case-insensitive dedup, cascading reset all live in wrapper code and are keepers. | **L** |

**CSS side — `semantic-ui-less` (devDependency, build-time only).** `src/style/override/_semantic.less` imports just **5 modules**: `globals/reset`, `elements/label` (multi-select chips), `collections/menu` (own `Pagination` component), `modules/dropdown`, `modules/popup`. Semantic's `transition` module is already replaced by an in-house compact `transition.less`. The `theme.config` + `.variables`/`.overrides` machinery largely serves modules that are already commented out.

**Already in-house (no SUIR):** modal (`pages/main/components/Popup.js` — portal + backdrop), `Pagination`, `MenuButton`, and everything else in the pack. Recent history (slider lib and react-dropzone removals) shows the de-dependency trend is established practice.

##### F1.2 Strategy — strangler behind the pack

The wrappers' external APIs are the contract; `mapper.js` and meta authors never touch SUIR directly *except via passthrough props*. So: replace wrapper internals one at a time, keep the emitted classNames initially (existing LESS keeps styling the new markup), then take ownership of the CSS.

- **Step 0 — contract audit + guard (prerequisite, cheap).**
  Audit example metas *and consumer metas* for SUIR-passthrough props that reach the three wrappers (`search`, `multiple`, `allowAdditions`, `upward`, `compact`, `clearable`, tooltip `position`, table `celled`/`textAlign`, …). The discovered set becomes the **parity checklist** and the published supported-prop list. Simultaneously add the erosion guard:

  ```jsonc
  // eslint override for all of src except src/core/components
  "no-restricted-imports": ["error", { "paths": [{
    "name": "semantic-ui-react",
    "message": "semantic-ui-react may only be imported inside src/core/components (ui-react-pack)."
  }] }]
  ```

- **Step 1 — `Table` (S, ~2–3 days).** Native `<table>/<thead>/<tbody>/<tr>/<th>/<td>` implementation preserving the subcomponent API (`Table.Header`, `Table.Cell`, …) and the props found in Step 0 (className passthrough, `textAlign`, `colSpan`, …). Since semantic table CSS was never loaded, visual parity is near-guaranteed. Removes the 4 KB SUIR table code path.

- **Step 2 — `TooltipPop` (S–M, ~3–5 days).** In-house tooltip: portal + positioning + hover/focus triggers with delay + `aria-describedby`. Positioning primitive options:
  - **(a) `@floating-ui/dom` — recommended.** Few-KB, framework-agnostic, handles flip/shift/arrow; becomes the shared primitive for Step 3's option list as well.
  - (b) Zero-dep minimal positioning (top/bottom/left/right, no collision handling) — only if "no new dependencies" is a hard rule.
  - (c) CSS anchor positioning — rejected for now (not Baseline across browsers).
  Keep emitting `ui popup`-compatible classNames until Step 4 so the current CSS continues to apply.

- **Step 3 — `Dropdown` (L, ~2–4 weeks incl. regression).** Two viable paths:
  - **(a) Headless engine + own markup — recommended:** `downshift` (`useSelect`/`useCombobox`/`useMultipleSelection`) provides WAI-ARIA combobox behavior and keyboard navigation; we render semantic-compatible markup (`ui selection dropdown`, `ui label` chips) for CSS continuity. Mature, small, unstyled — consistent with the "own components, scoped CSS" principle.
  - (b) Fully hand-rolled — full control, but the combobox keyboard/a11y matrix is precisely where hand-rolled implementations leak; choose only if zero-dependency is mandatory.
  The wrapper's own logic (sanitization, dedup, additions handling, cascading reset, `onChange` signature) is **kept as-is** — only the `<DropDown …/>` element at the bottom is replaced. One extra contract discovered by the re-audit: the form adapter special-cases `InputComponent.displayName === 'Dropdown'` (`form/utils.js:193,199`) — the replacement must keep `displayName = 'Dropdown'`, or that adapter branch is refactored in the same PR. Gate: the behavioral layer of the §9.5 suite + the mandatory visual/keyboard/a11y suite + full example QA (full-DOM snapshots are expected to change here — regenerate deliberately); the cascading-Select flows driven from `rules.js`/`mapper.js` are the regression hotspot.

- **Step 3½ — exit the dependency (closes 5a).** With steps 1–3 landed the bundle no longer references SUIR — remove `semantic-ui-react` from `dependencies` in the same release. This, not the code swap, is what unblocks React 19 for npm hosts: while the entry remains, SUIR's own `react ^16.8 || ^17 || ^18` peers cap the host's React (§2.6-11). `semantic-ui-less` is a devDependency and stays until Step 4.

- **Step 4 — CSS exit (M, ~1 week).** Re-home the 5 semantic-ui-less modules as in-house LESS under `src/style` (starting from the *compiled output* of the current build guarantees pixel parity; prefixwrap scoping under `.ui-render` already applies). Delete `semantic-ui-less`, the `theme.config` webpack aliases (`webpack.demo.config.mjs:89`, `webpack.library.config.mjs:69`), `_semantic.less`, and the dead `.variables`/`.overrides` files. Bonus: the LESS `javascriptEnabled` requirement comes from the semantic toolchain — removing it clears the path for §9.8's LESS pipeline modernization. Two obligations ride this step: copying compiled semantic-ui-less CSS requires carrying its **MIT license notice** (attribution header / THIRD-PARTY-NOTICES entry), and the §9.9-H8 decision on the unscoped `html`/`body`/`*` reset (§2.6-7) is implemented in the owned CSS here.

- **Step 5 — cleanup + release.** The `semantic-ui-react` dependency is already gone (Step 3½); this step drops `semantic-ui-less`, finishes changelog + supported-prop documentation, and records the bundle delta (−30 KB+ per the source's own estimates: 27 KB Dropdown + 4 KB Table + Popup). Minor release if Step 0 found no unsupported passthrough props in the wild; otherwise major with migration notes.

##### F1.3 Sequencing & effort

Run after Phase 2 (React 18) and Phase 3 (contract tests — they are the safety net). Steps 1–2 can proceed in parallel with Workstream A; Step 3 deserves dedicated focus. Every step is gated by the §9.5 behavioral layer **plus the mandatory visual/keyboard/a11y suite**. Total: **~4–7 weeks** spread across independently shippable releases. Completing 5a — including Step 3½ — removes the React 19 external blocker (§8).

#### F2 — `moment`: keep it; native-replacement feasibility analysis

**Decision: `moment` stays a peer dependency — no dayjs migration.** The only peer change is the Phase 1 widening `~2.29.4` → `^2.29.4` (§3.2). It is externalized (webpack externals), so it costs the library bundle nothing and hosts already provide it. Below is the requested analysis of replacing it with a *native, zero-dependency* implementation — feasible, but parked behind a decision gate.

##### F2.1 Audited usage surface (small and bounded)

| Call site | moment API used | Native equivalent needed |
|---|---|---|
| `Text.js:43` | `moment(str).format(dateFormat)` — gated by `ISO_8601_COMPLETE_DATE` regex | ISO→parts local parsing + token **formatter** |
| `TextDateValue.js:8` | `moment(value).format(config.dateFormat \|\| 'DD/MM/YYYY')` | same |
| `InputDate.js:58–65` | `moment(value)` parse; `moment(str, dateFormat).format('YYYY-MM-DD')` normalize-on-change | token **parser** (parse-by-format) |
| `InputDate.js:10,88,94` | rc-picker with `generateConfig` from `rc-picker/lib/generate/moment`; input `format={[dateFormat, 'YYYY-MM-DD']}` | custom `GenerateConfig<Date>` |
| `time.js` (`formatTime`, `toHours`) | `moment(t).format(f)` | **no production callers** (referenced only by `time.test.js`); `formatDuration` there is already moment-free |

**Contract constraints (corrected by the re-audit — less favorable than first assessed, §2.6-12):** moment **does** cross the public API. The project's own docs promise it (`README:12,18` — the API "accepts `moment` instances", with cross-copy `instanceof` caveats; `docs.md:24–25`); `InputDate` feeds any `props.value` into `moment(value)` (instances included); and rc-picker callbacks emit moment objects outward — `onSelect` (wired to `onCalendarChange`, `InputDate.js:96`) and every passthrough such as `disabledDate`/`cellRender` (`{...props}` at `InputDate.js:89`). Also contract: `dateFormat` **tokens** are moment syntax (note the `dateFormat` *prop* is currently dead — §2.6-2 — only the context default applies until §9.4 fixes the wiring). Consequence: a native adapter changes observable callback types and is a **breaking change** for hosts that use those callbacks or pass instances — not the drop-in swap the first draft assumed.

##### F2.2 What a native implementation requires

1. **Token formatter** (~100–150 lines): documented subset `YYYY/YY, MMMM/MMM/MM/M, DD/D, dddd/ddd, HH/H/hh/h, mm/m, ss/s, A/a` + literal/escape handling; month/weekday names from `Intl.DateTimeFormat`.
2. **Token parser** (~100–150 lines): the platform has **no parse-by-format facility** (`Intl` only formats) — strict parsing of the same subset must be hand-written.
3. **The classic pitfall to engineer around:** `new Date('2024-05-10')` parses as **UTC** midnight, `moment('2024-05-10')` as **local** midnight → a naive swap produces off-by-one-day dates in negative-UTC-offset timezones. All date-only strings must be parsed from parts into local time.
4. **rc-picker date engine — two options:** (a) **use the shipped `rc-picker/lib/generate/dateFns`** — a `GenerateConfig<Date>` operating on **native `Date`**, with `date-fns` as an optional peer (lock-verified); a few tree-shaken KB, and calendar-grid correctness (week starts, month boundaries) stays upstream's problem — recommended. (b) A fully hand-written `GenerateConfig<Date>` (~200 lines: unit get/set/add, `getWeekDay`, week-start via `Intl.Locale` `weekInfo` with fallback, locale format/parse delegating to (1)/(2)) — only if zero-new-dependency is absolute. Either way, the picker config swaps independently of the formatter/parser work.
5. **Consumer surface audit (mandatory, new):** inventory host usage of moment-typed callbacks (`onSelect`, passthrough `disabledDate`/`cellRender`/…), moment-instance `value` inputs, formats, locales and timezone expectations across consumer metas and integration code; update `README`/`docs.md`, which currently document the moment-instance contract. Output = the compatibility spec the adapter must meet, and the semver call (expected: **major**, or a compatibility shim that keeps emitting moment-like objects).
6. **Golden parity suite:** adapter output compared against moment across the token subset, DST transitions, leap/month-end dates, and both `InputDate` value flows — a hard gate before any default flip.
7. **`date-fns` policy (if picker option (a) is taken):** decide how `date-fns` enters — bundled dependency vs optional peer vs externalized — and measure the tree-shaken bundle delta; this interacts with the hybrid-model gate (§2.6-11, §10).
8. **`Temporal` API — rejected for now:** not Baseline across browsers as of mid-2026, and the polyfill outweighs the problem. Revisit when Baseline.

##### F2.3 Verdict and recommended posture

Feasible and well-bounded (**~400–600 lines + tests; ~1–2 weeks + regression — less with option (a) for the picker**) because *internal* usage is narrow — but per §2.6-12 the **external** surface does leak moment, so the flip is expected to be **semver-major** (or shipped behind a compatibility shim). And since moment is externalized, the library itself gains nothing — the benefit accrues only to host applications that want moment out of *their* bundles.

- **Now (non-breaking, cheap):** funnel the three component call-sites through a single internal `dateAdapter` module (an extension of `ui-utils-pack/time.js`), and document the supported `dateFormat` token subset. Also: `formatTime`/`toHours` have no production callers — delete or fold into the adapter.
- **Later (at a future breaking-change window, or on host demand):** implement the native adapter behind the seam; flip the internal default only when the parity suite is green; demote `moment` to `peerDependenciesMeta.optional` so hosts *may* drop it — hosts that keep it see zero change.
- **Triggers to revisit:** hosts asking to shed moment; rc-picker deprecating its moment config; `Temporal` reaching Baseline.

#### F3 — Distribution: ESM alongside UMD

Goal: an ESM target (`dist/index.mjs`) with UMD staying the default. Temper the expectation: the package exports a single component today, so tree-shaking wins are modest until the export surface grows — the stronger motivations are React-19-era hosts (no React UMD builds) and shedding the double-install weight of the hybrid model. The script-tag question is settled — §10 declares it unsupported — so this decision no longer has to preserve one. **Caveats that make this NOT a drop-in:**

- Hosts consume the stylesheet by deep path (`static/all.css`, or `dist/static/all.css` which `@import`s it) — the library entry deliberately does not inject CSS (`src/library/types/index.ts:4–6`, disabled "by team request"). Adding an `"exports"` map seals every unlisted subpath, so it **must** include `"./static/*"` (and any other host-used deep paths), or host builds hard-fail. Audit actual host import specifiers first; treat the map as a breaking change unless the audit proves every used path is covered.
- Emitting real ESM from webpack requires `experiments.outputModule` + `externalsType: 'module'` — otherwise the `.mjs` ships internal `require('react')` calls.
- `"sideEffects"` must be a **list**, never `false`: the entry imports CSS and side-effectful modules (`core/common/variables` mutates the `FILE` registry at import time; `mapper.js` populates `Render.*`) — `false` would let bundlers drop them.
- **Hybrid-model decision first (§2.6-11):** today every runtime dep is both bundled and npm-installed. Before adding a second output format, owners decide: trim `dependencies` to match the bundle, externalize more packages, or peerize — §10.

Deliverable before Phase 7 picks this up: a **consumer matrix** (UMD script-tag — pending its own §10 gate, CJS `require`, ESM `import`, webpack/Vite hosts, CSS deep imports, font/image assets) with a smoke test per row.

#### F4 — Form stack: coordinated major bump for React 19

The form stack splits into a React-free core and React bindings:

- **`final-form` / `final-form-arrays` (core)** — no React peer at all; unaffected by React versions per se, but the new bindings require the new core.
- **`react-final-form` / `react-final-form-arrays` (bindings)** — installed 6.5.9 / 3.1.4 declare peers only up to `^18`. **The 19-ready line already exists upstream:** `react-final-form` **7.0.1** + `final-form` **5.0.1** + `final-form-arrays` **4.0.1** + `react-final-form-arrays` **5.0.0**, all with `react ^16.8 || ^17 || ^18 || ^19` (tracked in [react-final-form#1043](https://github.com/final-form/react-final-form/issues/1043)).

**Plan:**
1. Audit the `final-form` 4→5 and `react-final-form` 6→7 changelogs for breaking changes against our usage (`rules.js` / `form/utils.js` subscriptions, arrays, mutators).
2. Bump all **four packages in one PR** (they peer-depend on each other's new majors — no partial upgrade possible).
3. Execute **while still on React 18**, any time after Phase 3 — isolating form-stack regression from the React 19 flip keeps both bisectable. Gate: form-flow tests (Phase 0) + contract suite (Phase 3).
4. These are bundled `dependencies`, not peers, so no host peer negotiation is involved — but the bump is **not** behaviorally transparent, and the correction below is why the test gate alone is not the whole story.

**Measured cost of the 6→7 bump (2026-08-20, matrix probe).** `react-final-form` 7 registers fields in a `useEffect` instead of during render; 6.5.9 explicitly swallowed the first post-mount notification. On 7.0.1 the engine therefore commits an **extra mount-time render pass**, and a host-supplied `translate` fires **twice per string** — two existing `translate` boundary contracts fail on it. Isolated by matrix: React 19 + rff 6.5.9 is clean, React 18 + rff 7.0.1 reproduces it, so this is the form stack and not React. Two consequences: hosts whose `translate` is side-effecting or unmemoized see doubled work (a visible change, not an internal one), and the bump needs a render-count / `translate`-call-count regression test as part of its gate — not just green form-flow tests.

### 9.8 Workstream G — Build configuration hygiene

- **Babel targets (verified — real, library-side):** `babel.config.js` sets `targets: { node: 'current' }`, which governs the **library and watch** builds; the demo config carries its own inline presets (browserslist applies there) and Jest is env-split (§2.6-10). Published `dist/` therefore contains syntax as modern as the build machine's Node while `package.json`'s `browserslist` is never consulted for it. Fix: env-split the root config (test → `node: current`; build → browserslist) **and** collapse the demo's duplicated inline presets into it — **scheduled as Phase 0 step 0.5**. (If all hosts are evergreen-only, document that decision instead.)
- **Automatic JSX runtime:** peer floor 16.14 makes `@babel/preset-react` `runtime: 'automatic'` safe across the whole support range. **Prerequisite:** add `react/jsx-runtime` (and `react/jsx-dev-runtime`) to the library/watch `externals` first — the current exact-match externals (`react`, `react-dom`) would NOT catch the new subpath imports, and webpack would silently bundle React's JSX runtime from devDependencies into the UMD. These subpath externals have no meaningful script-tag global — one more input to the §10 UMD script-tag gate. Do as one mechanical PR after Phase 2.
- **Legacy decorators:** leave as-is; they retire naturally as §9.2/§9.3 convert their host modules. Churn for its own sake is against the ground rules (§9.1).
- **LESS 3.13 pin**: the pin is anchored to the semantic-ui-less toolchain (inline-JS evaluation via `javascriptEnabled` + `theme.config` machinery) and to `less-plugin-functions`. Two findings: (a) after the SUIR CSS exit (§9.7-F1 step 4) the semantic-side constraints disappear; (b) **no custom `.function-…` definitions were found under `src/style`** — `less-plugin-functions` may be vestigial; verify and, if unused, drop it from all four pipelines (three webpack configs + `scripts/build-css.js`). Together these likely unpin LESS entirely. Re-evaluate right after F1 step 4.

### 9.9 Workstream H — Project structure & housekeeping

**Context.** The repo layout still carries its app-boilerplate heritage (the library was extracted from an application template), and parts of the documented structure no longer match reality. None of this blocks the upgrade; all of it taxes navigation, onboarding, and the §9.3 decomposition. Everything here is invisible to consumers — only the built artifacts ship (`dist/` plus the root `static/` asset payload, per the `files` field) — so source-tree moves are pure internal freedom.

#### H0 — Audited findings

| # | Finding |
|---|---|
| 1 | **The `ui-*-pack` alias system is dead** — **0 imports** use `ui-react-pack`/`ui-modules-pack`/`ui-utils-pack`; no webpack config defines those aliases (only `theme.config` and `process` are aliased); `tsconfig-paths-webpack-plugin` (devDep) is referenced by no config. CLAUDE.md's alias claim was stale (fixed alongside this plan). Actual convention: relative imports + a small `components` barrel used by the engine for `{ cn, type }`. |
| 2 | **The engine lives under `core/pages/main/`** — an app-era address for the library's heart (`rules.js`, `mapper.js`, `Data.js`, `dataKindPush.js`, engine-local `utils.js` and `components/`), while the recursive renderer sits separately in `core/ui-render/`. Images (`static/images`) also live inside it; the `tester/` dev fixtures that used to were deleted under H1. |
| 3 | **12 orphan components**: 9 direct — `Avatar`, `Badge`, `Carousel`, `Collapse`, `ErrorContent`, `FloatNumber`, `ImageSwatch`, `MenuButton`, `Tags` (no imports, no JSX usage, not registered in `mapper.js`) — plus a cluster reachable only from orphans: `ErrorTable` (imported solely by `ErrorContent`), `Square` (solely by `Carousel`), and the pack `TabList` (mapper uses the engine copy, `mapper.js:33`). |
| 4 | **Dead style trees:** `src/style/unused/` (10 files incl. `_policy`/`_classic` pairs) imported by nothing; `override/` carries `.variables`/`.overrides` for semantic modules that are commented out (§9.7-F1 step 4 finishes that job); icomoon build artifacts (`fonts/icons/demo.html` + demo files, ~1.2k lines) checked in. |
| 5 | **Demo entry files sit at `src/` root** (`index.js` → `main.jsx` → `App.jsx`) next to an otherwise self-contained `src/demo/`, blurring the library/demo boundary. |
| 6 | **Layering violations:** a genuine engine↔form-modules **import cycle** (`form/utils.js:13–14` ⇄ `rules.js:3`, §2.6-4), plus `components/Text.js:4` importing `../modules/variables` (`ISO_8601_COMPLETE_DATE`). Otherwise directions are clean: core never imports demo; utils imports nothing upward. |
| 7 | **Duplicate basenames blur navigation:** two `Tabs.js` and two `TabList.js` (components pack vs engine `components/`); three `utils.js` files (engine, form module, `components/charts/`) plus the utility directories `components/utils/` and `core/utils`; generic `constants.js`/`translations.js`/`styles.js` scattered. Naming collision: `pages/main/components/Popup.js` is actually a **modal**, while `TooltipPop` wraps SUIR *Popup*. |
| 8 | **Build config sprawl:** three near-identical webpack configs (library/watch/demo duplicate externals and loader chains) plus a fourth CSS pipeline in `scripts/build-css.js`. |
| 9 | **Side-effect magic:** both entries import `./core/common/variables` purely for side effects; `core/common/` (styles.js, variables, utils) is an unexplained fourth utility location that itself imports from `components` and **mutates the `FILE` registry at import time** — not absorbable into pure utils without untangling first. |

#### H1 — Delete dead weight (cheap, do first)

- The **12 orphan components** (9 direct + the `ErrorTable`/`Square`/pack-`TabList` cluster, §2.6-14). Gate: grep consumer metas for these names as `view` values first — they are not registered in `mapper.js`, so no meta can render them, but verify before deleting. Bonus effects: `Carousel`/`Collapse` drop two `UNSAFE_` migrations from Workstream A; `ImageSwatch` removes one of the three `defaultProps` sites (§8); the pack `TabList` resolves an H6 duplicate.
- `src/style/unused/` (10 files); `override/_policy.less` / `_classic.less` (verify unreferenced); icomoon demo artifacts under `fonts/icons/`.
- ~~the unreferenced engine `tester/` fixtures~~ — **deleted.** They were worse than merely dead: `test_data.js` and `test_meta.js` re-exported from `../examples/…`, and no `examples/` directory exists under `src/core/pages/main/` (the fixtures live in `src/demo/examples/`), so either file would have failed module resolution the moment anything imported it. Nothing did. `eslint-config-react-app` could not see it because `import/no-unresolved` is off. Removing them also took two permanently-0% files out of the coverage report; global coverage after deletion is 94.29% statements / 89.38% branches / 92.71% functions / 94.9% lines.
- `formatTime`/`toHours` in `time.js` (no production callers, §9.7-F2).
- `FIELD.TYPE.DATE` (`modules/form/constants.js:16`) — defined, never read, and `view: 'Date'` therefore renders a placeholder instead of the date field the name implies (§2.6-17). Deleting it is the honest move unless the view spelling is meant to be supported, in which case it needs a branch in `renders.js` rather than a constant.
- ~~The **13 zero-reference devDependencies**~~ — **done in Phase 0.9:** all 13 plus `dot-prop-immutable` removed, verified by pruning `node_modules` to the lockfile with `npm ci` and re-running every pipeline including `build-css` and the watch build.

#### H2 — Make the docs match reality

- **CLAUDE.md**: **done alongside this plan** — the alias section rewritten (the old "webpack path aliases" table described machinery that exists nowhere), the tech-stack line fixed (`recharts`/`dayjs` removed), CSS output paths corrected, gotchas added.
- Kept as an ongoing discipline: document actual conventions (relative imports, the `components` barrel usage, where the engine lives) and re-check the docs whenever structure moves (H3/H4) land.

#### H3 — Isolate the demo

Move `src/index.js`, `src/main.jsx`, `src/App.jsx` → `src/demo/`; update the `webpack.demo.config.mjs` entry. Result: `src/` top level reads `core/ | demo/ | library/ | style/` and the library/demo boundary becomes self-documenting.

#### H4 — Re-home the engine (must precede Phase 6)

`core/pages/main/` + `core/ui-render/` → **`core/engine/`** (Render, transforms, rules, mapper, Data, dataKindPush + engine-local components). Move `static/images` out of core. Land as **pure `git mv` commits** — no logic edits — so review is trivial and history follows renames; imports are relative, so an IDE move/codemod fixes paths mechanically. Doing this *before* §9.3 gives the decomposition a sane address space (`engine/lifecycle.js`, `engine/dataMapping.js`, …) instead of scattering new files under `pages/main/`.

#### H5 — Enforce layer direction

Fix the direct violation (move `ISO_8601_COMPLETE_DATE` into `core/utils`); the engine↔form-modules cycle is dissolved by §9.3 step 2. Then lock the rules in ESLint (`no-restricted-imports` per directory, same mechanism as the SUIR guard): `utils → nothing`, `components → utils`, `modules → components|utils`, `engine → anything in core`, and the one demo rule enforceable today: **core never imports demo**. ("Demo → library surface only" is aspirational — the demo currently imports core directly across nearly all pages; adopt it only after §9.4 grows the public surface.) Cheap to lock in now, expensive to restore later.

#### H6 — Naming sanity (opportunistic, ride other PRs)

- `pages/main/components/Popup.js` → `Modal.js` (it *is* a modal; frees the name collision with tooltip-Popup).
- `TooltipPop` → `Tooltip` during its F1 step 2 rewrite.
- Engine `utils.js` dissolves into named modules during §9.3 (`dataMapping.js`, `errorMapping.js`, …).
- `Tabs`/`TabList` pairs: the re-audit confirmed mapper uses the engine copies and the pack `TabList` is an orphan (delete via H1); audit the pack `Tabs` the same way before its §9.2 migration.
- **Completed version guard:** `npm version` synchronizes the runtime wrapper and demo-shell literals from `package.json`; `prepack` rejects drift before rebuilding. The removed type shim is no longer a version site (§2.6-15).

#### H7 — Build config consolidation

Extract a shared, **parameterized** `webpack.common.mjs` (loader chains, resolve; externals only for the library/watch targets — the demo must NOT inherit them) consumed by all three configs. The watch config has already drifted: it emits `static/ui-render.css` instead of the library's `all.css`/`font.css`/`semantic.css` set, and its `output.clean: true` wipes `dist/index.d.ts` on every run (§2.6-8) — unify the artifact sets as part of the extraction. Fold `scripts/build-css.js` into the same source of truth, or explicitly document it as the canonical standalone CSS build.

#### H8 — CSS pipeline integrity (from §2.6-7)

- **Decision gate (owners):** is the unscoped `html`/`body`/`*` reset *intended* to restyle host pages? Today `postcss.config.js` exempts exactly those selectors from prefixwrap, and the published `all.css` carries a global reset. Options: (a) scope everything under `.ui-render` — safest for an embedded widget, needs in-widget visual QA; (b) keep the global reset deliberately and document it loudly for hosts. Criterion: whether any host currently relies on the leak.
- Whatever the decision: **unify prefixwrap options** across the webpack `postcss.config.js` and `scripts/build-css.js` (they differ today), and add the §9.5 final-CSS gate so the *built artifact* — not the LESS — is what gets asserted.
- Fold the Jest `css-contract` check into the same pipeline so it stops testing pre-PostCSS output.

#### H9 — Dependency & release governance

- **Automated updates:** Renovate or Dependabot on a weekly cadence; the dev-tooling audit debt (26 findings incl. 2 critical as of 2026-08-10, up from 20 on 2026-07-21 — §2.6-13) gets an explicit burn-down owner. `npm audit fix` resolves part of it without breaking changes; the remainder needs `--force` majors, which is why it is governance work rather than a Phase 0 fix.
- **Reproducibility:** pin `packageManager` (corepack) and document the npm version; lockfile stays committed; CI installs with `npm ci` only.
- **Decision gate (owners):** published `engines.node >= 22` — keep (accepting `engine-strict` host failures), relax, or move to docs as a build-only requirement. Criterion: whether any consumer installs with `engine-strict`.
- **Licensing:** MIT attribution for vendored semantic CSS (F1 step 4); optionally generate a THIRD-PARTY notices file / lightweight SBOM at `prepack`.

#### Target layout

```
src/
  library/        # public entry, types, (future) meta.schema.json (§9.4)
  core/
    engine/       # ← pages/main + ui-render merged (Render, transforms, rules→decomposed, mapper)
    components/   # presentational pack (post-H1 cleanup)
    modules/      # form, upload, variables
    utils/        # pure utils (+ dateAdapter from F2); absorbs core/common AFTER untangling (H0-9)
    contexts/  providers/  services/
  demo/           # all demo code incl. entries (H3)
  style/          # minus unused/ and icomoon artifacts
```

**Sequencing:** H1/H2 — immediately, in any quiet moment (Phase 4 window). H3/H4 — right after Phase 2 ships, as dedicated pure-move commits in a lull between feature branches (see R11). H5 rides the 4-S window (it is one ESLint-config PR); H6–H7 — opportunistic. **H4 must precede Phase 6.**

---

## 10. Consolidated roadmap

| Phase | Content | Effort | Gate to next |
|---|---|---|---|
| **0** | ✅ **Done.** Reproducibility/API/security baseline: CI from a **clean checkout**, `rules.js` flow tests, example smoke harness, Babel targets env-split + demo consolidation (0.5), public-types fix + consumer type matrix (0.6), `prepack` + pack budgets + tarball smoke (0.7), tracked-examples fix (0.8), zero-warning lint gate + audit baselines + 14-package devDep sweep (0.9) | ~1.5–2 weeks | CI green from a clean checkout |
| **1** | React 17: dev bump, peer widen (react + moment `^2.29.4`), QA; checkpoint release | 1–2 days | QA checklist clean |
| **2** | React 18: `createRoot` (demo), RTL 12→16, `defaultProps` fixes, batching regression pass, peer widen, docs; checkpoint release | 1–2 weeks | CI green on 18, zero act-warnings |
| **3** | Contract tests on all examples; JSON Schema + dev validation; error boundaries; React 16/17 CI smoke | 1–2 weeks | Contract suite in CI |
| **4** | Hooks migration of leaf components; automatic JSX runtime; **SUIR passthrough-prop audit + lint guard (F1 step 0)**; **housekeeping H1–H2 (dead code + docs truth)** | ongoing, per-component PRs | — |
| **4-S** | **Structure (§9.9): demo isolation (H3); engine re-home `pages/main`+`ui-render` → `core/engine` (H4, pure `git mv` commits); layer-direction lint (H5)** | ~2–4 days, in a quiet window | **H4 before Phase 6** |
| **TS** | **TypeScript migration track (§9.6): E0 infra after Phase 2 → utils+contract (E1) → components/modules (E2, rides 4/5a) → engine (E3, rides 6) → public-API switchover (E4) → `prop-types` dependency removed (E5); **go/no-go on the E2/E3 tail after E1** | continuous, per-PR | `tsc --noEmit` green throughout; E4 gated by the `dist/index.d.ts` golden diff |
| **5a** | **SUIR exit, JS side (F1 steps 1–3½): `Table` → `TooltipPop` → `Dropdown`, then `semantic-ui-react` removed from `dependencies`**, shipped step by step | ~3–5 weeks | behavioral + visual/a11y suites per step |
| **5b** | **SUIR exit, CSS side (F1 steps 4–5): own the 5 LESS modules; drop `semantic-ui-less` + `theme.config`; LESS pipeline re-eval (§9.8)** | ~1–2 weeks | visual parity |
| **6** | Engine decomposition (`rules.js` / `form/utils.js`): extract → compose → hooks; **StrictMode-clean demo** as acceptance | largest single item; only after 3 | StrictMode clean |
| **7** | Decision gate: ESM build; `moment` native adapter go/no-go (F2); form-stack major bump if not done earlier (F4); **React 19 go/no-go — earliest right after 5a (§8 fast path)** | decision + scoped work | — |

Phases 3 and 4 can partially overlap. Tracks **5a/5b** (SUIR exit) and **6** (engine) are independent — both require Phase 3, and their relative order is a resourcing choice; 5a steps 1–2 may even run alongside Phase 4. Phase 7 is a decision gate, not a fixed date.

### Open decision gates (owners' calls — the plan does not pre-decide these)

| Gate | Options | Decide by | Criterion |
|---|---|---|---|
| ~~React 17: own public release vs internal checkpoint~~ | **Decided (2026-08-18): folded into the React 18 release.** No checkpoint publish for 17, so the Phase 0/1 work — including the consumer-visible fixes and the asset relayout — reaches consumers only with React 18. Consequence to hold in view: `master` accumulates unreleased fixes until then, and a production issue on the 0.34 line is patched from `release/v0.34`, not from `master`. | — | — |
| ~~UMD script-tag support~~ | **Decided (2026-08-20): unsupported.** The product intent is embedding the renderer as a component inside a React application, so there is no `<script>` consumer to serve. This documents reality rather than dropping a capability: `webpack.library.config.mjs:40-44` maps `react` to the external `'react'`, so the UMD `root` branch looks up `window.react` while the actual global is `window.React` — a script tag could never have resolved it. Nothing changes in the build now; `library.type` stays `umd` and keeps serving bundlers and CommonJS. What this unblocks: the automatic JSX runtime no longer has to solve `jsx-runtime` subpath globals (§9.8, Phase 4), and the F3 ESM decision no longer has to preserve a pre-19 React-UMD story. | — | — |
| Bundled vs external runtime deps — the hybrid model (§2.6-11) | (a) trim `dependencies` to match the bundle (hosts stop double-installing); (b) externalize more (peer list grows); (c) status quo, documented | with the F3 spec | host installation model + bundle-size goals |
| ~~`engines.node >= 22` in the published manifest~~ | **Decided (2026-08-18): relaxed to `>= 18`.** The floor now describes consuming the prebuilt bundle rather than building the repo: its most modern syntax is optional chaining, and the packed artifact was verified to server-render on Node 22 and 24. Development still uses the `.nvmrc` version, which is what CI installs; the README states both. | — | — |
| ~~Source maps in the tarball~~ | **Decided (2026-08-10): ship.** Host debuggability outweighs the 3.0 MB; the pack budget caps their growth instead. | — | — |
| Demo screenshots in `static/images` (~1.1 MB) | **Deferred (2026-08-18): decide with the host audit, not before.** Dropping them is safe as far as this repository can see — only unpublished demo markdowns reference them and the built `all.css` does not — but a consumer meta can name any file in that folder through `view: 'Image'`, and that is exactly what the audit establishes. Bundled with the UMD and dependency-model calls so one audit answers all three. | with the F3 host-consumption audit | whether any host meta references non-flag images |
| Dev-tooling audit burn-down (26 findings, 2 critical, prod 0) | name an owner and a cadence / accept and re-baseline each release / take the `npm audit fix --force` majors now | H9 | whether any finding is reachable from the published artifact (today none are — prod audit is 0) |
| Global `html`/`body`/`*` CSS reset (§2.6-7) | scope everything under `.ui-render` / keep the global reset deliberately + document | H8, before F1 step 4 | whether any host relies on the leak |
| `moment` optional-peer demotion | only at the F2 flip, gated on the F2.2-5 consumer audit (the Phase 1 `^2.29.4` widening is already decided) | F2 gate | consumer callback audit |

---

## 11. Risk register

| # | Risk | Likelihood | Impact | Mitigation |
|---|---|---|---|---|
| R1 | React 18 automatic batching changes form-flow behavior in `rules.js` (async `setState` sites) | Medium | High | Phase 0 tests *before* the bump; full example QA; `flushSync` as documented last resort |
| R2 | `semantic-ui-react` upstream becomes fully unmaintained before the exit completes (stuck on an unpatchable beta) | Medium | Medium | Planned full exit (§9.7-F1) caps the exposure; isolation + eslint guard until then; a 3-component surface keeps even an emergency exit bounded |
| R3 | RTL 12→16 migration effort balloons (act warnings, async tests) | Medium | Medium | Migrate suite-by-suite; timebox; Phase 0 semantic tests protect behavior while plumbing changes |
| R4 | Engine decomposition (§9.3) regresses undocumented meta behaviors | Medium | High | Contract snapshot suite (§9.5) is a hard prerequisite; extract-then-replace sequencing; per-step releases |
| R5 | Hosts stuck on React 16 get broken by an inadvertent 17+-only API | Low | Medium | Keep 16.14 floor; React 16/17 CI mount smoke (§9.5) |
| R6 | `dist/` ships syntax too modern for consumer browser targets (Babel `node: current` for builds) | Low–Medium | Medium | Fixed in Phase 0 step 0.5 (env split); verify the actual host browser matrix |
| R7 | Native date adapter (if ever pursued) diverges from moment semantics — parse leniency, local-vs-UTC off-by-one | Medium (only if pursued) | Medium | moment stays by default (F2 decision); golden parity suite vs moment gates any flip; date-only strings parsed from parts in local time; moment demoted to *optional* peer only at a major |
| R8 | LESS 3 pin blocks future style tooling | Low | Low–Med | Largely dissolves after F1 step 4 (§9.8); verify `less-plugin-functions` is truly unused and drop it |
| R9 | `Dropdown` replacement misses feature/a11y parity (search+deburr, multi-select chips, additions, keyboard matrix, cascading resets) | Medium | High | F1 step 0 audit becomes the parity checklist; headless engine (downshift) supplies the a11y core; wrapper-owned logic (sanitization, dedup, cascading) is kept untouched; contract suite + example QA gate the swap |
| R10 | Consumer metas rely on undocumented SUIR passthrough props | Medium | Medium | Step-0 audit across example *and consumer* metas; publish the supported-prop list; anything dropped ⇒ major release with migration notes |
| R11 | Structure moves (H3/H4) collide with in-flight feature branches | Medium | Low–Med | Land as pure-move commits (no logic changes) in a quiet window; announce to the team; git follows renames, so history and blame survive |
| R12 | Form-stack major bump (`final-form` 4→5, `react-final-form` 6→7) changes form-state behavior in the engine | Medium | High (the engine is the product's core) | Changelog audit first; all four packages in one isolated PR on React 18; form-flow + contract suites gate; rollback = revert one PR |
| R13 | TS migration drifts the public API types (E4 switchover) or breaks a build pipeline (Babel strips types file-by-file) | Medium | Medium | Golden `dist/index.d.ts` diff gate; `isolatedModules` + CI `tsc --noEmit` from E0; probe files verify all four pipelines before any real conversion |
| R14 | Module-global engine state (`FIELD.FUNC`, `Active.translate`, `errorHandlerFunction`, `formsStorage`, `errorsMap`, `storedTouched`, fixed-id popup root) — two `UIRender` instances on one page interfere **today**, and StrictMode double-invocation trips on the same writes | High (current behavior) | Medium–High | §9.3 step 3 (de-globalization incl. per-instance portal root); two-instance case added to the contract suite; until then, document the single-instance assumption for hosts |
| R15 | Public declarations or package contents regress after the corrected baseline; the tarball remains oversized and unbudgeted | Low (was Medium) | High | **Closed.** Corrected golden d.ts, locked React 16/17/18 consumer matrix, fresh hosted checkout, the `prepack` version/build guard, asset deduplication, pack budgets with a duplicate-asset guard and the packed-tarball server-render smoke have all landed and run in CI |
| R16 | Published CSS restyles host pages (unscoped `html`/`body`/`*` reset in `all.css`) | High (current behavior) | Medium–High | H8 decision + unified prefixwrap; §9.5 final-CSS gate; implemented in F1 step 4 |
| R17 | Form-runtime leaks (per-render subscriptions, prototype-shared debounce, state mutation, uncancelled timers) degrade long-lived host sessions and multi-instance pages | Medium–High | Medium | §9.3 step 4 fixes (shippable before the full decomposition), gated by Phase 0 tests; R14 two-instance coverage |
| R18 | Tolerated lint warnings hide real defects in paths no test exercises | Medium | Medium–High | The 0.9 triage confirmed it repeatedly. **Fixed, each with a test:** the `no-use-before-define` pair in `rules.js` was a temporal-dead-zone `ReferenceError` that silently swallowed any interpolated-template popup whose local data was the row array — 1920 green tests never reached it; the `no-useless-escape` line in `demo/services/axios.js` indexed a possibly-null `String.match`, so an unmatched server message threw a TypeError inside the rejection handler and replaced the real API error; and `jsx-a11y/alt-text` on `Image.js` was not merely a false positive — the justification for suppressing it ("`alt` is always set") rested on `fileNameWithoutExt(name)`, which has no guard, so `view: IMAGE` meta carrying `src` without `name` crashed the whole render. A `no-unused-vars` import additionally exposed a JsonView test whose name promised a click it never performed (renamed; real toggle coverage lives in `JsonView.behavior.test.js`). **Fixed in the follow-up pass, each with a test that fails beforehand:** `hasObjKeys(…, 'shallow')` OR-ed its loose comparison onto the object branch, so a reference comparison vetoed every object match the first clause had already accepted and no shallow object match could ever succeed — restructured so only non-object-like values compare loosely (its JSDoc also claimed the wrong default mode); `Dropdown`'s sanitize switch treated a `null` option value as an object (`typeof null === 'object'`) and rewrote it to the string `"null"`, which the cascading-reset effect could then never match; and `View` took a `ref` parameter its `React.memo` export can never deliver. **Method note:** two of the three fixed defects were found only because the warning was re-read adversarially after the obvious cleanup — a suppression comment that sounds convincing is not evidence. `lint:js --max-warnings 0` now stops the next one from being tolerated |

---

## Appendix A — Inventory quick reference

- **Class components (21 source files; a wider lifecycle/component grep also matches 6 test files and 3 doc-comment-only hits):** components pack (`Collapse`, `Tabs`, `Carousel`, `Counter`, `Expand`, `ProgressBar`, `ProgressSteps`, `InputNative`), pages (`rules.js`, `Data.js`, `mapper.js`, `components/Tabs.js`, `TableView.js`, `LocalDraftTableRow.js`), modules (`form/utils.js`, `form/views/AutoSave.js`, `form/inputs/ToggleField.js`, `form/asInputDateField.js`, `upload/views/Upload.js`), core (`ui-render/Render.js`), demo (`Examples.jsx`).
- **Key module sizes:** `rules.js` 1244 · `mapper.js` 700 · `form/utils.js` 624 · `transforms.js` 423 · `Render.js` 133.
- **Docs hardcoding React version:** `src/demo/markdowns/docs.md:16,37,41` · `README.md` (plus a prose peer-deps note at `changelog.md:50`).
- **SUIR JS surface (3 of 54 pack files):** `Table.js` (subcomponent users: `mapper.js:170`, `TableView.js`, `LocalDraftTableRow.js`, `ErrorTable.js`) · `TooltipPop.js` (`Render.Tooltip`, `mapper.js:44,483`) · `Dropdown.js` (`mapper.js:540–544`).
- **semantic-ui-less modules actually imported** (`src/style/override/_semantic.less`): `globals/reset`, `elements/label` (chips), `collections/menu` (own Pagination), `modules/dropdown`, `modules/popup`; `transition` already replaced by an in-house `transition.less`.
- **moment call sites:** `Text.js:43` · `TextDateValue.js:8` · `InputDate.js:58–65` (+ rc-picker moment `generateConfig` at :10/:88) · `time.js` `formatTime`/`toHours` (test-only, no production callers).
- **Structure facts (§9.9):** `ui-*-pack` alias imports: **0** across `src` · `tsconfig-paths-webpack-plugin`: referenced by no config · orphan components ×12: `Avatar`, `Badge`, `Carousel`, `Collapse`, `ErrorContent`, `FloatNumber`, `ImageSwatch`, `MenuButton`, `Tags` + cluster `ErrorTable`/`Square`/pack-`TabList` · layering: engine⇄form-modules cycle (`form/utils.js:13–14` ⇄ `rules.js:3`) + `components/Text.js:4` → `../modules/variables` · demo entries at `src/` root: `index.js`, `main.jsx`, `App.jsx`.
- **Public-surface facts (§2.6):** runtime entry `library/index.js → main.js` (`AppProvider → AppWrapper → engine`) · `require(dist)` returns one callable function with no `.default`/`.UIRender`; declarations use `export =`, retain named types through a merged namespace, and pass locked React 16/17/18 checks in interop and direct-CommonJS modes · `dateFormat` prop is still dead (`Render.js:45`) · fixed-id portal root (`AppWrapper.js:17`) · `prepack` checks version sync and rebuilds; the measured tarball is 295 files / 7.25 MB unpacked / 2.53 MB packed, assets shipped once in the root `static/` payload with `dist/static/*.css` as `@import` re-exports, source maps kept by decision, and CI enforcing both the budgets and a packed-tarball server-render smoke.

## Appendix B — Verification commands

```bash
# Legacy lifecycle inventory
rg -n "UNSAFE_|componentWill(Mount|ReceiveProps|Update)" src

# React-19-sensitive patterns
rg -n "\.defaultProps\s*=" src
rg -n "ReactDOM.render|findDOMNode|contextTypes|getChildContext" src

# SUIR isolation invariant (must return nothing)
rg -l "from 'semantic-ui-react'" src | grep -v "^src/core/components" 

# moment usage funnel check (§9.7-F2 — target: only the dateAdapter module remains)
rg -n "from 'moment'" src

# SUIR exit progress (§9.7-F1 — target: both return nothing)
rg -n "from 'semantic-ui-react'" src
grep -v '^\s*//' src/style/override/_semantic.less | grep '@import' || true

# Structure: orphan component scan (§9.9-H1 — count of importing files per component; 0 = orphan)
for f in src/core/components/*.js; do n=$(basename "$f" .js); \
  c=$(rg -l "/${n}'" src --glob '!*.test.*' | grep -v "components/${n}.js" | wc -l); echo "$c $n"; done | sort -n

# Structure: alias usage must stay zero (or be formally reintroduced with jest/webpack parity)
rg "from 'ui-(react|modules|utils)-pack" src

# TypeScript migration gate (§9.6 — coverage grows with every converted file)
npx tsc --noEmit

# prop-types retirement progress (§9.6-E5 — target: both return nothing)
rg -l "from 'prop-types'" src
rg -n '"prop-types"' package.json

# Peer sanity of resolved deps
node -e "const l=require('./package-lock.json');for(const k of ['node_modules/semantic-ui-react','node_modules/react-final-form','node_modules/rc-picker','node_modules/@testing-library/react'])console.log(k,JSON.stringify(l.packages[k].peerDependencies))"

# Local CI contour
npm run lint:js
npm run lint:css
npm run test:coverage
npm run test:react16        # gating leg: whole suite on the 16.14 peer floor
npm run test:react17        # gating leg: whole suite on 17.0.2
npm run build-lib
npm run test:types:consumer
npm run build

# Packaging gates (§0.7 — budgets, duplication, packed-tarball smoke; both need a built dist/)
npm run test:pack           # build-lib + both gates
npm run test:pack:budget    # file count, sizes, required paths, re-export stubs, duplicate assets
npm run test:pack:consumer  # pack, extract, resolve every CSS @import/url(), server-render in isolation
npm pack --dry-run          # raw manifest, when a budget failure needs eyeballing

# Security baselines (§2.6-13)
npm audit --omit=dev   # must stay at 0
npm audit              # dev-tooling debt burn-down

# Final-CSS scoping gate (§9.9-H8 — expect 0 unscoped globals after the fix)
# Reads the root payload: dist/static/all.css is only an @import re-export since §0.7.
node -e "const c=require('fs').readFileSync('static/all.css','utf8');console.log((c.match(/(^|\})(html|body|\*)[,{ ]/g)||[]).length)"
```

## Appendix C — Consolidated verification checklist

Every check this plan depends on, in one place. ✅ = already verified during the audits behind this plan (evidence in §2 / Appendix A); ☐ = open, bound to a phase. An item is not "done" until its box is checked in a PR or CI.

### Already verified (audit facts — re-verify only if the code moves first)

- ✅ No legacy React APIs in `src`: string refs, legacy context, `findDOMNode`, `e.persist()`, `unstable_*`, `react-dom/test-utils`, `element.ref` reads
- ✅ All runtime deps declare React 17/18 peers (lock-verified); `@testing-library/react` 12 is the only `<18` blocker
- ✅ SUIR surface: imports confined to `src/core/components`; exactly 3 wrappers; 5 semantic LESS modules active
- ✅ moment surface: 3 components + rc-picker `generateConfig`; `formatTime`/`toHours` have no production callers
- ✅ Structure: `ui-*-pack` alias imports = 0; `tsconfig-paths-webpack-plugin` referenced by no config; 12 orphan components incl. the `ErrorTable`/`Square`/pack-`TabList` cluster; layering = engine⇄form-modules cycle + `Text.js:4`
- ✅ Re-audit (2026-07-21): tests 76 suites / 1215 green in 8.3 s; `lint:css` clean; eslint fails (11 errors / 28 warnings); prod `npm audit` 0, full audit 20; tarball 579 files / 11.6 MB with duplicated assets + maps; published types ≠ runtime; `dateFormat` prop dead; built CSS ships unscoped `html`/`body`/`*`; moment crosses the public API (README-documented + picker callbacks)
- ✅ 19-ready form stack exists upstream (`react-final-form` 7.0.1 / `final-form` 5.0.1 / `final-form-arrays` 4.0.1 / `react-final-form-arrays` 5.0.0 — npm-registry-verified)
- ✅ Single `cloneElement` site passes plain props only (ref-as-prop safe)
- ✅ `prop-types` usage is purely declarative: 40 importing files, zero `checkPropTypes()` calls; ~90 call sites via the `type` proxy (`components/types.js`, plus its ~60 definition lines) — safe to retire per §9.6-E5

### Phase 0 — remaining gates to complete before React 18

- ✅ Green hosted automated baseline recorded: 138 suites / 1920 tests; global coverage 94.21% statements / 89.25% branches / 92.70% functions / 94.81% lines; JS/CSS lint, library build and demo build
- ✅ `rules.js` critical-flow tests exist: initial data processing, `showIf`, validation/error mapping, `submit` payload, `addData`/`removeData`, upload/download
- ✅ Example smoke harness mounts all 38 registered `src/demo/examples/` meta+data pairs and rejects renderer failures or unexpected console errors
- ✅ CI runs JS/CSS lint, coverage, `build-lib` and demo build; hosted `master` run is green
- ✅ 0.5: root test/build split plus demo consolidation — every pipeline now reads presets and decorators from `babel.config.js`, the demo keeps only `react-refresh/babel` in development, and the emitted demo bundles are byte-identical to the pre-consolidation build
- ✅ 0.6: published types describe the direct callable UMD/CommonJS function; the runtime `require()` shape and emitted consumer d.ts matrix are green vs locked `@types/react` 16/17/18 in interop and non-interop modes; no `.default`/named value export is promised
- ✅ 0.7: `npm version` synchronization, `prepack` drift check + rebuild and fresh hosted checkout are green; assets ship once (root `static/` payload, `dist/static/*.css` re-exports); `test:pack:budget` and `test:pack:consumer` run in CI; 295 files / 7.25 MB unpacked / 2.53 MB packed; source maps ship by decision. The `engines.node >= 22` and demo-screenshot calls stay open in §10
- ✅ 0.8: both `input-integer_{meta,data}.json` fixtures imported by `Examples.jsx` are tracked
- ✅ 0.9: `lint:js` exits 0 errors / 0 warnings behind `--max-warnings 0`; all 22 warnings triaged (18 fixed, 4 suppressed with stated reasons, 3 real defects fixed with regression tests — R18); audit baselines re-measured (prod 0, full 26); all 14 zero-reference devDependencies removed. Assigning the audit burn-down owner remains H9 governance

### Phase 3 — contract tests and the peer matrix (partial)

- ✅ Full-DOM snapshot baseline over all 38 registered examples; one baseline verified green on React 16.14.0, 17.0.2, 18.3.1 and 19.2.8; refuses to self-write under `CI=true`; ledger records the defects the baseline encodes
- ✅ Canonical example manifest consumed by both demo and tests, enforcing git-tracked-only imports (§0.8's single enforcement point)
- ✅ Final-CSS parity gate over the webpack PostCSS config; R16/H8 leak pinned as current behaviour, not fixed
- ✅ Whole suite gating on React 16.14 (`react-16-floor`) and 17.0.2 (`react-17`); advisory on 19; packed artifact smoked on 16.14/17
- ✅ Markup-independent behavioral contract layer (layer 2) — the layer that gates F1, where the DOM changes intentionally: 4 suites / 104 tests over one shared harness, pinned as literals rather than snapshots so `-u` cannot bless a change; roles, ARIA state, accessible names, visible text and form values only. Tabs and upload expose no interactive role at all, so their keyboard contract stays with the Playwright suite below, and no manifest example enables table sorting or row expansion, so neither has a markup-independent gate yet
- ✅ JSON Schema for meta + dev-mode validation, the error-boundary/`onError` repair (§9.4, §2.6-3) and the config-channel repair (§2.6-2)
- ☐ Visual/a11y regression suite (mandatory for F1); ~~note the 57 dangling `aria-describedby` references the DOM baseline records will trip it~~ — fixed 2026-08-27: the attribute is now conditional on the message element existing, and the DOM contract asserts that every reference resolves

### Phase 1 — React 17

- ✅ Dev runtime updated to React/React DOM 17.0.2; additive React 16.14/17 peer ranges and Moment `^2.29.4` recorded in the lockfile
- ✅ Automated checkpoint green in hosted CI: 138 suites / 1920 tests; global coverage 94.21% statements / 89.25% branches / 92.70% functions / 94.81% lines; JavaScript/CSS lint, library build and demo build
- ✅ Install docs and unreleased changelog updated for React 17
- ✅ Manual QA checklist (§5) worked through in a real browser on 17 — popup, dropdown and rc-picker click-outside, tabs/expand, table sorting/pagination/inline edit, validation/submit/add/remove, and a console clean of warnings after three leaks were fixed. Remaining: Tooltip hover, Dropdown multi-select and a real upload round-trip have no demo path; yalc smoke and the release decision need an owner
- ☐ react-refresh dev loop works on 17
- ☐ yalc smoke into a consuming app (if one is available)
- ☐ Click-outside/overlay QA re-run with attention to bundled-dep document listeners (event-stack / rc-util ordering vs root delegation, §5)
- ☐ Decision gate recorded: React 17 as its own public release vs internal checkpoint (§10)

### Phase 2 — React 18

- ☐ RTL 16 migration complete, **zero `act()` warnings**
- ☐ `defaultProps` on `TooltipPop`/`Image` converted to default parameters (React 18.3 warns otherwise)
- ☐ Automatic-batching regression pass over `rules.js`/`form/utils.js` async flows and `AutoSave`
- ☐ SUIR 3.0.0-beta.2 smoke on 18 across **every** `view` registered in `mapper.js`
- ☐ `@types/react@18`/`@types/react-dom@18` pinned; `gen-ts` output unchanged
- ☐ Install docs (`docs.md:16,37,41`), `README`, changelog react-version strings updated

### F1 — SUIR exit

- ☐ **Step 0:** passthrough-prop audit across example **and consumer** metas (`search`, `multiple`, `allowAdditions`, `upward`, `compact`, `clearable`, tooltip `position`, table props) → published parity checklist
- ☐ **Step 0:** `no-restricted-imports` guard on `semantic-ui-react` active outside the components pack
- ☐ **Steps 1–3:** per component — behavioral contract layer + example QA green (full-DOM snapshots regenerated deliberately); emitted classNames keep existing LESS working
- ☐ **Step 3:** Dropdown keyboard/a11y matrix verified (WAI-ARIA combobox pattern), incl. cascading-Select flows from `rules.js`
- ☐ **Step 3:** replacement keeps `displayName = 'Dropdown'`, or the form-adapter branch (`form/utils.js:193,199`) is refactored in the same PR
- ☐ **Step 3½:** `semantic-ui-react` absent from `dependencies` (this is the 5a exit and the React 19 unblock)
- ☐ Visual/keyboard/a11y suite green per step (mandatory, §9.5)
- ☐ **Step 4:** pixel parity of extracted CSS vs current compiled output; `javascriptEnabled` no longer required by any build; MIT attribution for vendored semantic CSS in place; H8 scoping decision implemented
- ☐ **Step 5:** Appendix B "SUIR exit progress" greps return nothing

### F2 — moment adapter (only if the gate opens)

- ☐ Consumer surface audit done (moment-typed callbacks, instance `value` inputs, formats/locales/timezones); semver call recorded (§9.7-F2.2-5)
- ☐ `README`/`docs.md` moment-contract statements updated in the same release

### H1/H6 — deletions & duplicate reconciliation (gate before each `rm`)

- ☐ Orphan component names grepped across consumer metas as `view` values
- ☐ `override/_policy.less` / `_classic.less` confirmed unreferenced
- ☐ `less-plugin-functions`: removed in a branch → all four pipelines still build (three webpack configs + `scripts/build-css.js`) → devDep dropped (§9.8)
- ☐ Pack `Tabs`/`TabList` audited for orphan status before reconciling the duplicates (H6)

### F4 — form-stack major bump

- ☐ `final-form` 4→5 and `react-final-form` 6→7 changelog audit against `rules.js`/`form/utils.js` usage (subscriptions, arrays, mutators)
- ☐ All four packages bumped in **one PR**, on React 18, form-flow + contract suites green

### TS migration (§9.6)

- ☐ E0 probe: one `.ts` module + one `.test.ts` pass all four pipelines (lib/demo/watch builds + Jest)
- ☐ `tsc --noEmit` gate in CI from E0 onward
- ☐ E4: golden `dist/index.d.ts` diff reviewed — only intended changes
- ☐ E5: semantic `type` proxy recreated as TS aliases (same vocabulary) before the engine converts
- ☐ E5: `rg "prop-types" src` returns nothing → `prop-types` removed from `dependencies`, bundle-size delta recorded
- ☐ Go/no-go on the E2/E3 tail held after E1 (measured conversion velocity); hand-written d.ts hedged with type-level tests until E4

### Phase 6 — engine decomposition (§9.3)

- ☐ Module-global mutable state inventoried and moved per-instance (`Active.*`, `FIELD.FUNC`, `errorHandlerFunction`, `formsStorage`, `errorsMap`, `formInitialValues`, `storedTouched`, translation registries) — R14; portal root made per-instance
- ☐ Runtime hazards fixed (§9.3 step 4): subscribe-per-render + kept unsubscribe, setState-in-render, prototype-shared debounce, `set(this.state)` mutation, AutoSave/autoSubmit timer hygiene
- ☐ Engine⇄form-modules import cycle dissolved (§9.3 step 2)
- ☐ Two simultaneous `UIRender` instances on one page covered by the contract suite
- ☐ Demo runs clean under `<StrictMode>` per the §7 definition (lifecycle warnings, subscriptions, cleanup, two-instance isolation)

### React 19 flip (§8 fast path — after 5a)

- ☐ **Host consumption mode confirmed with host teams (bundler vs script-tag)** — the only item requiring a human answer; it decides how much F3 (ESM) matters and settles the §10 script-tag gate
- ☐ `semantic-ui-react` absent from `dependencies` (F1 step 3½ / Phase 5a)
- ☐ `defaultProps` fixed (Phase 2) and automatic JSX runtime enabled (Phase 4)
- ☐ `@testing-library/react` ≥16.1 in place (the first RTL with `react ^19` peers); `react@19` in the dev/CI matrix; full regression green; peers widened additively (`^16.14 || ^17 || ^18 || ^19`)
- ☐ `@types/react@19` pinned for `gen-ts`
- ☐ rc-picker / react-refresh / eslint-plugin-react-hooks behave on 19 in the matrix

### Ongoing invariants (commands in Appendix B)

- ☐ SUIR isolation grep: nothing outside the components pack (until exit), then nothing at all
- ☐ Alias grep stays zero
- ☐ After the F2 seam: only the `dateAdapter` module imports `moment`
- ☐ React 16/17 compatibility stays in the CI matrix while the peer floor includes them — the full suite
  on 16 (`react-16-floor` / `npm run test:react16`) and on 17 (`react-17` / `npm run test:react17`), plus
  the packed-artifact smoke on 16 + 17 (`test:pack:peers`), are all in place
