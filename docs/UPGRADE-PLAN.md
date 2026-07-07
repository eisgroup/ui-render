# React 17+ Upgrade & Modernization Plan — `eis-ui-render`

| | |
|---|---|
| **Status** | Draft for review |
| **Date** | 2026-07-06 |
| **Audited version** | 0.34.2 (branch snapshot) |
| **Scope** | React 17/18 upgrade path, React 19 readiness, a principles-preserving modernization roadmap, the `semantic-ui-react` exit plan (§9.7-F1), the `moment` native-replacement analysis (§9.7-F2), the project-structure analysis (§9.9), the TypeScript migration (§9.6), and the consolidated verification checklist (Appendix C) |

---

## 1. Executive summary

The audit shows that **the path to React 18 is almost entirely unblocked**. The build toolchain is already modern (webpack 5, Jest 30, Babel 7.26, Node 24), and every runtime dependency already declares React 17/18 peer support. The lag is concentrated in exactly three places:

1. **React itself** — pinned to `^16.14.0` (peer + dev).
2. **`@testing-library/react` 12.1.5** — peer-restricted to `react <18`; the only hard dependency blocker.
3. **Legacy component patterns** — 22 class components, `UNSAFE_*` lifecycles in 13 files, including deliberate **runtime prototype patching** in `src/core/pages/main/rules.js` and `src/core/modules/form/utils.js`. These are *not* upgrade blockers (prefixed `UNSAFE_*` methods work in React 17, 18, and 19), but they block `StrictMode`, concurrent features, and long-term maintainability.

**Recommended target: React 18.3, reached in two checkpointed releases (17 → 18), followed by an incremental modernization program.** React 19 is a watch-item, not a target — it stays gated on the §9.7-F1 exit (see the §8 fast path).

Standing decisions:

1. **`semantic-ui-react` will be exited entirely** (§9.7-F1). The audited dependency surface is far smaller than the package's reputation suggests: exactly **3 wrapper components** (`Table`, `TooltipPop`, `Dropdown`) and **5 curated LESS modules** — the codebase has already been trending out of it (slider lib and react-dropzone removed recently, modal and pagination already in-house). Completing the exit also removes the main external React 19 blocker.
2. **`moment` stays** as a peer dependency — no dayjs migration. The requested native-replacement feasibility analysis (§9.7-F2) concludes it is possible and well-bounded (~400–600 lines behind an adapter seam), but it is parked behind an explicit decision gate; the only near-term action is funneling usage through a single internal adapter module.

The **project-structure analysis** (§9.9) found: the documented `ui-*-pack` alias system is dead (zero imports in the codebase — CLAUDE.md was stale on this; fixed alongside this plan), the engine lives under an app-boilerplate-era `core/pages/main/` path, and 9 orphan components plus a dead `style/unused/` tree can simply be deleted. The workstream re-homes the engine to `core/engine/` ahead of the §9.3 decomposition, isolates the demo, and locks layer direction in with lint.

§9.6 defines a **full TypeScript migration** (infra step → utils/contract → components/modules riding other workstreams → engine last → guarded public-API switchover), which **retires the `prop-types` runtime dependency** as its exit criterion (E5 — React 19 ignores propTypes anyway, and the shapes currently ship in the production bundle). The plan also adds **Appendix C** — a consolidated checklist of every verification it depends on, so no check lives only in review discussions.

Because `react`/`react-dom` are webpack **externals** and npm **peer dependencies**, the library does not bundle React. The upgrade is therefore a *compatibility-range widening*, not a forced migration for consumers: host applications on React 16.14 keep working, hosts on 17/18 become officially supported.

---

## 2. Current state audit

### 2.1 Toolchain (already modern — no work needed)

| Area | Current | Verdict |
|---|---|---|
| Bundler | webpack 5 (declared `^5.99`; + dev-server 5, CLI 6) | ✅ current |
| Transpiler | Babel 7 (declared `^7.26`), `babel-loader` 10 | ✅ current |
| Tests | Jest 30 + `jest-environment-jsdom` 30 | ✅ current, React-18-ready |
| Node | engines `>=22`, `.nvmrc` = 24 | ✅ current |
| Lint | ESLint 8 + `eslint-config-react-app` 7 | ✅ adequate (supports React 17/18 idioms) |
| Styling | LESS 3.13 (pinned for the semantic-ui-less + `less-plugin-functions` toolchain), PostCSS 8, stylelint 16 | ✅ works; LESS pin is a separate watch-item (§9.8) |
| Types | Hand-written public API types in `src/library/types/`, emitted via `tsconfig.build.json` (declaration-only) | ✅ works |

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
| `moment` | ~2.29.4 (peer + external) | — | ✅ | ✅ | In maintenance mode upstream; **decision: keep** (peer unchanged). Optional native replacement analyzed in §9.7-F2. |

### 2.3 React legacy pattern inventory

Codebase size: 257 JS/JSX files (+2 TS), 76 test files. 22 files contain real class components (a wider grep also matches 2 test files and 3 doc-comment-only hits); ~19 files use hooks (15 in `src/core`).

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
| Event pooling reliance (`e.persist()`) | ❌ none |
| `unstable_*` React APIs | ❌ none |
| `StrictMode` | not enabled anywhere (intentional for now, see §7) |

### 2.5 Architectural invariants (observed, and to be preserved)

1. **The meta/data JSON contract is the public API.** Everything else is implementation detail.
2. **Recursive renderer with pluggable registries** — `Render.Component` / `Render.Method` resolved via `src/core/pages/main/mapper.js`; `view` strings map to components, `render*` strings map to formatters.
3. **Layered internal packs** as directory layers: `core/components` (presentation, a.k.a. "ui-react-pack"), `core/modules` (form/behavior), `core/utils` (pure utilities). The historical `ui-*-pack` webpack aliases turned out to be vestigial — zero imports use them (§9.9-H0); the *layering itself* is real and preserved. **Verified: `semantic-ui-react` is imported *only* inside `src/core/components`** — the isolation layer is intact; it is what keeps the planned exit (§9.7-F1) bounded.
4. **UMD library with `react`, `react-dom`, `moment` externalized** (`webpack.library.config.mjs:27–31`); CSS compiled from LESS and scoped under `.ui-render` via postcss-prefixwrap.
5. **The demo app is the living documentation and QA stand** (`src/demo/examples/` as executable spec).

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
- Dev dependencies (`react`, `react-dom` in `devDependencies`) track the *highest* supported version — the library is developed and primarily tested against 18, with a compatibility smoke for 16/17 (§9.5).

### 3.3 Consumer impact

- **UMD / externals consumers**: React comes from the host — no bundle change at all. The upgrade only widens what hosts are allowed to provide.
- **npm consumers**: `npm install` peer resolution starts accepting React 17/18 hosts. No breaking change for React 16.14 hosts.
- **Docs debt**: install instructions currently hardcode `react@^16.14.0` — `src/demo/markdowns/docs.md:16,37,41` and `README.md` (plus a prose peer-deps note at `changelog.md:50`). Each phase must update them.

---

## 4. Phase 0 — Safety net (prerequisite, do not skip)

**Goal:** make regressions *visible* before changing React's behavior underneath the form engine.

| # | Action | Detail |
|---|---|---|
| 0.1 | Record the green baseline | `npm test` (all 76 suites), `npm run build-lib`, `npm run build`; capture suite counts and bundle sizes for later comparison. |
| 0.2 | Close test gaps around `rules.js` critical flows | Priority order: initial data processing / normalization (`utils.js` error mapping), `showIf` evaluation, validation + error propagation into fields, actions (`submit` payload assembly, `addData` / `removeData`, upload/download), re-render on `data` prop change. These are exactly the paths sensitive to React 18 batching. |
| 0.3 | Example smoke harness | A Jest suite that mounts **every** meta/data pair from `src/demo/examples/` and asserts render without throwing. This doubles as the seed for contract tests (§9.5). |
| 0.4 | CI on every PR | lint (`eslint` + `lint:css`) + `npm test` + `npm run build-lib`. Any CI provider; keep steps identical to local scripts. |
| 0.5 | Babel targets env-split | `babel.config.js` applies `targets: { node: 'current' }` to the published builds today — dist syntax is dictated by the build machine's Node. Split now (test → `node: current`; build → browserslist) so the Phase 1/2 checkpoint releases ship correct syntax and the 0.1 size baselines stay valid (§9.8; closes R6). |

**Exit criteria:** CI green on the current React 16 baseline; `rules.js` critical flows covered; example smoke harness in place; Babel build targets honor browserslist.

**Estimated effort:** ~1 week.

---

## 5. Phase 1 — React 17 (small, checkpointed)

**Goal:** ship a release officially supporting React 17. Expected code delta: near zero.

### Steps

1. `npm i -D react@17.0.2 react-dom@17.0.2` (dev deps only).
2. Peers → `"react": "^16.14.0 || ^17.0.0"` (same for `react-dom`); widen `moment` to `^2.29.4` (§3.2).
3. Full test run + example smoke + manual demo QA.
4. Update install docs; changelog entry; ship as a checkpoint release.

`@testing-library/react` 12 stays (its `react <18` peer admits 17). `ReactDOM.render` in the demo stays (fully supported in 17).

### React 17 behavioral changes, mapped to this codebase

| Change in React 17 | Exposure here |
|---|---|
| Event delegation moves from `document` to the root container | **Low, and net-positive.** No `src/` code attaches React-event-dependent `document` listeners (only native `window` pointer listeners in `Slider.js`, unaffected). For a widget embedded into host pages, root-scoped delegation actually *reduces* interference with host-app handlers. Still: manually QA click-outside behavior of `Popup` (portal-based), `Dropdown`, date picker overlays. |
| No event pooling (`e.persist()` becomes no-op) | None — `persist()` never used. |
| `useEffect` cleanup runs asynchronously | Low — only 13 files use hooks; QA unmount-heavy flows (Tabs switching, table pagination). |
| Consistent `undefined`-return errors from components | None expected; the example smoke harness will catch any. |
| New JSX transform available | Deferred to modernization (§9.8) — not required for the upgrade. |

### Manual QA checklist (demo, all examples)

- [ ] Popup/Tooltip open + click-outside close
- [ ] Dropdown open/select/close, multi-select
- [ ] Date/time pickers (rc-picker overlay behavior)
- [ ] Tabs (both implementations), Collapse, Expand, Carousel autoplay
- [ ] Table: sorting, pagination, inline edit rows (`LocalDraftTableRow`)
- [ ] Form flows: validation errors, submit, addData/removeData, upload
- [ ] No new console warnings/errors on any example

**Exit criteria:** CI green, QA checklist clean, `dist/` builds and passes a yalc smoke in a consuming app (if one is available), release published.

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

**Exit criteria:** CI green on React 18; RTL 16 migration complete with zero `act` warnings; QA checklist clean; batching pass done; docs updated; release published.

**Estimated effort:** 1–2 weeks (dominated by RTL migration + regression QA).

---

## 7. StrictMode policy

`<StrictMode>` is **not** part of the upgrade. Today it would drown the console in `UNSAFE_*` deprecation warnings (the prototype-patched lifecycle engine guarantees them) and double-invoke render/effects in dev, which the class engine was never audited for.

Sequencing: StrictMode becomes the *acceptance criterion* of workstream §9.3 (engine decomposition). The definition of "StrictMode-clean" here: demo runs under `<StrictMode>` with zero lifecycle warnings and no behavioral differences. That state is also the bulk of the concurrent-rendering readiness work (the 19 flip itself does not require it — §8).

---

## 8. React 19 horizon — readiness checklist (watch, don't chase)

| Item | Status | Notes |
|---|---|---|
| String refs (removed in 19) | ✅ none | |
| Legacy context (removed in 19) | ✅ none | |
| `findDOMNode` (removed in 19) | ✅ none in `src/` | Moot for SUIR once §9.7-F1 steps 1–3 land. |
| `ReactDOM.render` (removed in 19) | 🔶 fixed by Phase 2 | Demo entry only. |
| `defaultProps` on function components (ignored in 19) | 🔶 3 occurrences | `TooltipPop.js:23`, `ImageSwatch.js:27`, `Image.js:27` → convert to default parameters (done in Phase 2 — §6 step 1). `ImageSwatch` is an orphan slated for deletion (§9.9-H1). |
| `propTypes` (validation removed entirely in 19) | 🔶 40 importing files | No crash — silently ignored. Fully resolved by §9.6-E5: propTypes are deleted per TS conversion and the `prop-types` dependency is removed at the end. |
| `UNSAFE_*` lifecycles | ✅ still supported in 19 | But StrictMode-hostile; §9.3 is the prerequisite for StrictMode/concurrent adoption on 19, not for the 19 flip itself. |
| **`semantic-ui-react` React 19 support** | ❌ **external blocker** | npm `latest` is still 2.1.5 (~3 years stale); the 3.x line lives as betas; React 19 compatibility is an open upstream issue ([Semantic-Org/Semantic-UI-React#4510](https://github.com/Semantic-Org/Semantic-UI-React/issues/4510)). **Resolved by the planned exit (§9.7-F1)** — once `Table`, `TooltipPop`, and `Dropdown` are re-implemented in-house, this blocker disappears regardless of upstream. |
| **Form-stack peers stop at `^18`** (installed: `react-final-form` 6.5.9, `final-form` 4.20.10, `*-arrays`) | 🔶 **resolved upstream, bump planned** | The 19-ready line exists: `react-final-form` 7.0.1 + `final-form` 5.0.1 + `final-form-arrays` 4.0.1 + `react-final-form-arrays` 5.0.0 declare `react … \|\| ^19` (see [react-final-form#1043](https://github.com/final-form/react-final-form/issues/1043)). Coordinated 4-package major bump — plan in §9.7-F4; best executed while still on React 18. |
| **React 19 ships no UMD builds** of `react`/`react-dom` | 🔶 verify host consumption mode | Irrelevant for bundler-based hosts (npm CJS/ESM builds remain). Only script-tag/global consumption would be affected — and our UMD externals map to lowercase `react` globals, which never matched React's `window.React` UMD global, so that mode almost certainly was never used. Confirm with host teams; the ESM target (§9.7-F3) is the forward answer. |
| New JSX transform (19 warns on the classic transform; required going forward) | 🔶 planned | Automatic runtime lands in Phase 4 (§9.8); the 16.14 peer floor makes it safe across the whole range. |
| `react-dom/test-utils` (removed in 19) | ✅ verified none | No direct imports in src or tests; RTL ≥16 abstracts `act`. |
| `element.ref` access (ref-as-prop change in 19) | ✅ verified clean | No `element.ref`/`child.ref` reads; the single `cloneElement` site (`Text.js`) passes plain props only. |
| Render-error handling changed in 19 (errors not re-thrown; `onUncaughtError`/`onCaughtError` root options) | 🔶 note | Affects host-side error reporting expectations; synergizes with the per-node error boundaries planned in §9.4. |
| `@types/react@19` for `gen-ts` | 🔶 at flip time | Pin explicitly alongside the dev-dep bump. |

**Position:** the engine decomposition (§9.3) is **not** a React 19 gate — `UNSAFE_*` lifecycles run unchanged on 19; that workstream is about StrictMode/concurrency readiness.

**Fast path to 19.** The earliest viable point is **right after Phase 5a** (SUIR JS exit), without waiting for Phase 6:

1. Phase 5a complete (removes the only hard blocker);
2. form-stack major bump done (§9.7-F4 — can run in parallel any time after Phase 3);
3. `defaultProps` sites fixed (Phase 2) and automatic JSX runtime enabled (Phase 4);
4. bump `@testing-library/react` to ≥16.1 (the first RTL with `react ^19` peers), add `react@19` to the dev/CI matrix, run the full regression (contract suite + example QA), then widen peers **additively**: `^16.14.0 || ^17.0.0 || ^18.0.0 || ^19.0.0` — the floor stays, hosts on older React are unaffected.

Do not promise 19 support to consumers before those gates are green.

---

## 9. Modernization roadmap (preserving the principles)

### 9.1 Ground rules

Every workstream below is a series of small, independently shippable, reversible steps. The five invariants from §2.5 are the constitution; anything violating them needs an explicit decision, not a drive-by change. First action of this section: **write the invariants down in README/CLAUDE.md as explicit architecture principles.**

### 9.2 Workstream A — Class → hooks migration (leaf-first)

**Motivation:** 22 class components, most carrying `UNSAFE_componentWillReceiveProps` that is a simple props→state derivation. Hooks versions are smaller, StrictMode-safe, and testable.

**Rules of engagement:**
- One component per PR. Refactor only components with existing tests (write them first otherwise).
- Public props contract of each component must not change (the meta contract depends on it).
- No behavior changes bundled with the migration.
- After a component's hooks migration lands, convert it to `.tsx` in the follow-up PR (§9.6-E2); trivial leaf components may combine both in one PR.

**Suggested order (dependency- and risk-sorted):**

1. Leaf presentational, mechanical conversions: `Expand`, `Counter`, `ProgressBar`, `ProgressSteps`, `InputNative`, `Tabs` (components pack; gate `Tabs` on the H6 duplicate audit first). `Carousel` and `Collapse` turned out to be orphans (§9.9-H1) — **delete instead of migrating**; `Square` is already a function component.
2. Function-component `defaultProps` → default parameters: **done in Phase 2** (`TooltipPop`, `Image` — §6 step 1; React 18.3 warns on them); the third site, `ImageSwatch`, is an orphan resolved by deletion (§9.9-H1).
3. Page-level: `pages/main/components/Tabs`, `TableView`, `LocalDraftTableRow`.
4. Module-level: `AutoSave`, `ToggleField`, `asInputDateField`, `Upload` views.
5. **Not in this workstream:** `rules.js`, `form/utils.js`, `mapper.js`, `Render.js` → §9.3.

**Acceptance per component:** tests green, demo example using the component pixel-equivalent, no new console warnings.

### 9.3 Workstream B — Decompose the lifecycle engine (`rules.js` / `form/utils.js`)

**Motivation:** the prototype-patching of `UNSAFE_*` methods (`rules.js:593–595, 1182–1220`; `form/utils.js:397, 466, 598–615`) is the single biggest source of: StrictMode incompatibility, React 19 uncertainty, onboarding cost, and the high perceived risk of any change near the engine. 1868 lines across two files carry most of the library's behavior.

**Strategy — characterize, extract, replace (in that order):**

1. **Characterize:** contract tests from §9.5 must cover every documented meta capability before any surgery.
2. **Extract pure logic:** data processing, error mapping, `showIf` evaluation, payload assembly → pure functions in `ui-utils-pack` with direct unit tests (much of `utils.js` already leans this way).
3. **De-globalize instance state:** the engine writes instance-bound state into module globals — `Active.translate` (`rules.js:245`), the module-level `errorHandlerFunction` (`rules.js:241–243`), and ~12 action handlers bound to `this` on the shared `FIELD.FUNC` registry (`rules.js:616–1081`, resolved at render time through `transforms.js`). Today two `UIRender` instances on one host page silently hijack each other's actions/translate, and StrictMode's double-invocation exercises exactly these writes — a decomposition that skipped this step would still fail the workstream's own acceptance gate. Inventory all module-global mutable state (`Active.*`, `FIELD.FUNC`, `errorHandlerFunction`, translation registries) and move it to per-instance context; add a two-instances-on-one-page case to the contract suite (R14).
4. **Replace mutation with composition:** convert prototype patching into explicit HOC/wrapper composition (`withUIRenderLifecycle(Component)`) — same behavior, but visible in the component tree and StrictMode-analyzable.
5. **Hooks form (final state):** lifecycle logic as hooks (`useUIRenderData`, `useFormIntegration`), classes retired.
6. **Acceptance for the whole workstream:** demo runs clean under `<StrictMode>` (§7).

All decomposition outputs are authored in TypeScript from the start (`engine/*.ts`, §9.6-E3) — the old monoliths are never converted in place.

**Do not start** until Phase 2 has shipped and §9.5 contract tests exist. This is the deep end.

### 9.4 Workstream C — The meta/data contract as a first-class artifact

**Motivation:** the contract *is* the product; today it exists as convention + examples.

- **JSON Schema** for `meta.json` (draft 2020-12), published with the package (`meta.schema.json`): IDE autocomplete/validation for meta authors — the cheapest DX win available.
- **Dev-mode runtime validation** (behind a flag): on invalid meta, report the JSON path of the offending node instead of a downstream render crash.
- **Contract versioning:** an optional `metaVersion` field, so future evolutions can be additive and negotiable rather than breaking.
- **Error boundaries per render node:** an invalid/broken node renders an inline diagnostic (with meta path) instead of white-screening the whole widget.
- **Generated view-type reference:** the `view` → component registry in `mapper.js` is machine-readable — generate the supported-views documentation page from it, so docs cannot drift.

### 9.5 Workstream D — Testing as the enabler

- **Contract tests in two layers** (built immediately after Phase 2, extending the Phase 0 smoke harness): (1) **full-DOM snapshots** of every `src/demo/examples/` meta+data pair — these gate the *pure refactors* (§9.2/§9.3), where the DOM must stay byte-identical; (2) **markup-independent behavioral assertions** — roles/labels/visible text, form value + submit-payload round-trips, open/close/keyboard behavior — expressing the actual meta contract. The behavioral layer is what gates F1, where the DOM *intentionally* changes and snapshots must be regenerated deliberately rather than rubber-stamped.
- **CI compatibility matrix:** primary suite runs on React 18. Add a lightweight matrix job for React 16.14 / 17 — a minimal mount harness (plain `react-dom` `render`/`createRoot`, *no RTL*) that mounts the example set. Install mechanics matter: RTL 16's `react ^18 || ^19` peer makes a naive `npm install react@16` fail with `ERESOLVE` on npm ≥7 — run the matrix leg with `overrides`/`--legacy-peer-deps`, or house the harness in an isolated mini-package with its own `package.json`. This makes the wide peer range an enforced guarantee instead of a hope.
- Optional later: visual regression on the demo (Playwright) — valuable once §9.2 begins touching presentational components.

### 9.6 Workstream E — TypeScript migration

**Decision: full migration of the library source to TypeScript.** Motivation: the meta/data contract and pack APIs are exactly the implicit knowledge TS makes explicit; `propTypes` are inert for function components on React 19; and the current hand-written `.d.ts` drifts silently from reality.

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
- **Golden-file check:** commit the current `dist/index.d.ts` as a snapshot before the switch; after it, the diff must contain only intended changes — consumer-facing types must not silently narrow or widen.
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
| Golden `dist/index.d.ts` diff shows only intended changes | E4 |
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
  The wrapper's own logic (sanitization, dedup, additions handling, cascading reset, `onChange` signature) is **kept as-is** — only the `<DropDown …/>` element at the bottom is replaced. Gate: the behavioral layer of the §9.5 suite + full example QA (full-DOM snapshots are expected to change here — regenerate deliberately); the cascading-Select flows driven from `rules.js`/`mapper.js` are the regression hotspot.

- **Step 4 — CSS exit (M, ~1 week).** Re-home the 5 semantic-ui-less modules as in-house LESS under `src/style` (starting from the *compiled output* of the current build guarantees pixel parity; prefixwrap scoping under `.ui-render` already applies). Delete `semantic-ui-less`, the `theme.config` webpack aliases (`webpack.demo.config.mjs:89`, `webpack.library.config.mjs:69`), `_semantic.less`, and the dead `.variables`/`.overrides` files. Bonus: the LESS `javascriptEnabled` requirement comes from the semantic toolchain — removing it clears the path for §9.8's LESS pipeline modernization.

- **Step 5 — cleanup + release.** Drop `semantic-ui-react` from `dependencies` (−30 KB+ in consumer bundles per the source's own estimates: 27 KB Dropdown + 4 KB Table + Popup). Changelog + supported-prop documentation. Minor release if Step 0 found no unsupported passthrough props in the wild; otherwise major with migration notes.

##### F1.3 Sequencing & effort

Run after Phase 2 (React 18) and Phase 3 (contract tests — they are the safety net). Steps 1–2 can proceed in parallel with Workstream A; Step 3 deserves dedicated focus. Total: **~4–7 weeks** spread across independently shippable releases. Completing F1 removes the React 19 external blocker (§8).

#### F2 — `moment`: keep it; native-replacement feasibility analysis

**Decision: `moment` stays a peer dependency (`~2.29.4`), unchanged. No dayjs migration.** It is externalized (webpack externals), so it costs the library bundle nothing and hosts already provide it. Below is the requested analysis of replacing it with a *native, zero-dependency* implementation — feasible, but parked behind a decision gate.

##### F2.1 Audited usage surface (small and bounded)

| Call site | moment API used | Native equivalent needed |
|---|---|---|
| `Text.js:43` | `moment(str).format(dateFormat)` — gated by `ISO_8601_COMPLETE_DATE` regex | ISO→parts local parsing + token **formatter** |
| `TextDateValue.js:8` | `moment(value).format(config.dateFormat \|\| 'DD/MM/YYYY')` | same |
| `InputDate.js:58–65` | `moment(value)` parse; `moment(str, dateFormat).format('YYYY-MM-DD')` normalize-on-change | token **parser** (parse-by-format) |
| `InputDate.js:10,88,94` | rc-picker with `generateConfig` from `rc-picker/lib/generate/moment`; input `format={[dateFormat, 'YYYY-MM-DD']}` | custom `GenerateConfig<Date>` |
| `time.js` (`formatTime`, `toHours`) | `moment(t).format(f)` | **no production callers** (referenced only by `time.test.js`); `formatDuration` there is already moment-free |

**Contract constraints (favorable):** moment objects never cross the public API — values in and out are ISO strings, and the published types contain no moment. What *is* contract: `dateFormat` (ConfigContext default `'MM-DD-YYYY'`; meta/props may supply e.g. `'DD/MM/YYYY'`) uses **moment token syntax**. Any replacement must keep accepting those token strings — the syntax survives even if the library goes.

##### F2.2 What a native implementation requires

1. **Token formatter** (~100–150 lines): documented subset `YYYY/YY, MMMM/MMM/MM/M, DD/D, dddd/ddd, HH/H/hh/h, mm/m, ss/s, A/a` + literal/escape handling; month/weekday names from `Intl.DateTimeFormat`.
2. **Token parser** (~100–150 lines): the platform has **no parse-by-format facility** (`Intl` only formats) — strict parsing of the same subset must be hand-written.
3. **The classic pitfall to engineer around:** `new Date('2024-05-10')` parses as **UTC** midnight, `moment('2024-05-10')` as **local** midnight → a naive swap produces off-by-one-day dates in negative-UTC-offset timezones. All date-only strings must be parsed from parts into local time.
4. **rc-picker date engine — two options:** (a) **use the shipped `rc-picker/lib/generate/dateFns`** — a `GenerateConfig<Date>` operating on **native `Date`**, with `date-fns` as an optional peer (lock-verified); a few tree-shaken KB, and calendar-grid correctness (week starts, month boundaries) stays upstream's problem — recommended. (b) A fully hand-written `GenerateConfig<Date>` (~200 lines: unit get/set/add, `getWeekDay`, week-start via `Intl.Locale` `weekInfo` with fallback, locale format/parse delegating to (1)/(2)) — only if zero-new-dependency is absolute. Either way, the picker config swaps independently of the formatter/parser work.
5. **Golden parity suite:** adapter output compared against moment across the token subset, DST transitions, leap/month-end dates, and both `InputDate` value flows — a hard gate before any default flip.
6. **`Temporal` API — rejected for now:** not Baseline across browsers as of mid-2026, and the polyfill outweighs the problem. Revisit when Baseline.

##### F2.3 Verdict and recommended posture

Feasible and well-bounded (**~400–600 lines + tests; ~1–2 weeks + regression — less with option (a) for the picker**) precisely because usage is already narrow and moment never leaks through the API. But since moment is externalized, the library itself gains nothing — the benefit accrues only to host applications that want moment out of *their* bundles.

- **Now (non-breaking, cheap):** funnel the three component call-sites through a single internal `dateAdapter` module (an extension of `ui-utils-pack/time.js`), and document the supported `dateFormat` token subset. Also: `formatTime`/`toHours` have no production callers — delete or fold into the adapter.
- **Later (at a future breaking-change window, or on host demand):** implement the native adapter behind the seam; flip the internal default only when the parity suite is green; demote `moment` to `peerDependenciesMeta.optional` so hosts *may* drop it — hosts that keep it see zero change.
- **Triggers to revisit:** hosts asking to shed moment; rc-picker deprecating its moment config; `Temporal` reaching Baseline.

#### F3 — Distribution: ESM alongside UMD

Goal: an ESM target (`dist/index.mjs`, plus a `"sideEffects"` audit) so modern hosts get tree-shaking, with UMD staying the default. **Two caveats make this NOT a drop-in:**

- Hosts consume the stylesheet by deep path (`dist/static/all.css` / the root `static/` mirror) — the library entry deliberately does not inject CSS (`src/library/types/index.ts:4–6`, disabled "by team request"). Adding an `"exports"` map seals every unlisted subpath, so it **must** include `"./static/*"` (and any other host-used deep paths), or host builds hard-fail. Audit actual host import specifiers first; treat the map as a breaking change unless the audit proves every used path is covered.
- Emitting real ESM from webpack requires `experiments.outputModule` + `externalsType: 'module'` — otherwise the `.mjs` ships internal `require('react')` calls.

Spec both points before Phase 7 picks this up.

#### F4 — Form stack: coordinated major bump for React 19

The form stack splits into a React-free core and React bindings:

- **`final-form` / `final-form-arrays` (core)** — no React peer at all; unaffected by React versions per se, but the new bindings require the new core.
- **`react-final-form` / `react-final-form-arrays` (bindings)** — installed 6.5.9 / 3.1.4 declare peers only up to `^18`. **The 19-ready line already exists upstream:** `react-final-form` **7.0.1** + `final-form` **5.0.1** + `final-form-arrays` **4.0.1** + `react-final-form-arrays` **5.0.0**, all with `react ^16.8 || ^17 || ^18 || ^19` (tracked in [react-final-form#1043](https://github.com/final-form/react-final-form/issues/1043)).

**Plan:**
1. Audit the `final-form` 4→5 and `react-final-form` 6→7 changelogs for breaking changes against our usage (`rules.js` / `form/utils.js` subscriptions, arrays, mutators).
2. Bump all **four packages in one PR** (they peer-depend on each other's new majors — no partial upgrade possible).
3. Execute **while still on React 18**, any time after Phase 3 — isolating form-stack regression from the React 19 flip keeps both bisectable. Gate: form-flow tests (Phase 0) + contract suite (Phase 3).
4. These are bundled `dependencies`, not peers — the bump is invisible to hosts except through behavior, hence the test gate is the whole story.

### 9.8 Workstream G — Build configuration hygiene

- **Babel targets (verify intent — possible silent bug):** `babel.config.js` sets `targets: { node: 'current' }` unconditionally, and it applies to *library and demo builds*, not just Jest. Published `dist/` therefore contains syntax as modern as the build machine's Node, while `package.json` declares a `browserslist` that is never consulted. If any consumer targets browsers older than that syntax level, this ships broken code silently. Fix: env-split config — `test` → `node: current`; `build` → browserslist — **scheduled as Phase 0 step 0.5** so checkpoint releases and size baselines are not invalidated later. (If all hosts are evergreen-only, document that decision instead.)
- **Automatic JSX runtime:** peer floor 16.14 makes `@babel/preset-react` `runtime: 'automatic'` safe across the whole support range. Removes boilerplate `React` imports; `eslint-config-react-app` already understands it. Do as one mechanical PR after Phase 2.
- **Legacy decorators:** leave as-is; they retire naturally as §9.2/§9.3 convert their host modules. Churn for its own sake is against the ground rules (§9.1).
- **LESS 3.13 pin**: the pin is anchored to the semantic-ui-less toolchain (inline-JS evaluation via `javascriptEnabled` + `theme.config` machinery) and to `less-plugin-functions`. Two findings: (a) after the SUIR CSS exit (§9.7-F1 step 4) the semantic-side constraints disappear; (b) **no custom `.function-…` definitions were found under `src/style`** — `less-plugin-functions` may be vestigial; verify and, if unused, drop it from all four pipelines (three webpack configs + `scripts/build-css.js`). Together these likely unpin LESS entirely. Re-evaluate right after F1 step 4.

### 9.9 Workstream H — Project structure & housekeeping

**Context.** The repo layout still carries its app-boilerplate heritage (the library was extracted from an application template), and parts of the documented structure no longer match reality. None of this blocks the upgrade; all of it taxes navigation, onboarding, and the §9.3 decomposition. Everything here is invisible to consumers — only `dist/` is published — so it is pure internal freedom.

#### H0 — Audited findings

| # | Finding |
|---|---|
| 1 | **The `ui-*-pack` alias system is dead** — **0 imports** use `ui-react-pack`/`ui-modules-pack`/`ui-utils-pack`; no webpack config defines those aliases (only `theme.config` and `process` are aliased); `tsconfig-paths-webpack-plugin` (devDep) is referenced by no config. CLAUDE.md's alias claim was stale (fixed alongside this plan). Actual convention: relative imports + a small `components` barrel used by the engine for `{ cn, type }`. |
| 2 | **The engine lives under `core/pages/main/`** — an app-era address for the library's heart (`rules.js`, `mapper.js`, `Data.js`, `dataKindPush.js`, engine-local `utils.js` and `components/`), while the recursive renderer sits separately in `core/ui-render/`. Dev fixtures (`tester/test_meta.js`, `test_data.js`) and images (`static/images`) also live inside it. |
| 3 | **9 orphan components** in the pack: `Avatar`, `Badge`, `Carousel`, `Collapse`, `ErrorContent`, `FloatNumber`, `ImageSwatch`, `MenuButton`, `Tags` — no imports anywhere, no JSX usage, not registered in `mapper.js` (so no meta can render them). |
| 4 | **Dead style trees:** `src/style/unused/` (10 files incl. `_policy`/`_classic` pairs) imported by nothing; `override/` carries `.variables`/`.overrides` for semantic modules that are commented out (§9.7-F1 step 4 finishes that job); icomoon build artifacts (`fonts/icons/demo.html` + demo files, ~1.2k lines) checked in. |
| 5 | **Demo entry files sit at `src/` root** (`index.js` → `main.jsx` → `App.jsx`) next to an otherwise self-contained `src/demo/`, blurring the library/demo boundary. |
| 6 | **One layering violation:** `components/Text.js:4` imports `../modules/variables` (`ISO_8601_COMPLETE_DATE`) — presentation reaching *up* into modules for a constant. Otherwise directions are clean: core never imports demo; utils imports nothing upward. |
| 7 | **Duplicate basenames blur navigation:** two `Tabs.js` and two `TabList.js` (components pack vs engine `components/`); three `utils.js` files (engine, form module, `components/charts/`) plus the utility directories `components/utils/` and `core/utils`; generic `constants.js`/`translations.js`/`styles.js` scattered. Naming collision: `pages/main/components/Popup.js` is actually a **modal**, while `TooltipPop` wraps SUIR *Popup*. |
| 8 | **Build config sprawl:** three near-identical webpack configs (library/watch/demo duplicate externals and loader chains) plus a fourth CSS pipeline in `scripts/build-css.js`. |
| 9 | **Side-effect magic:** both entries import `./core/common/variables` purely for side effects, and `core/common/` (styles.js, variables, utils) is an unexplained fourth utility location. |

#### H1 — Delete dead weight (cheap, do first)

- The **9 orphan components**. Gate: grep consumer metas for these names as `view` values first — they are not registered in `mapper.js`, so no meta can render them, but verify before deleting. Bonus effects: `Carousel`/`Collapse` drop two `UNSAFE_` migrations from Workstream A; `ImageSwatch` removes one of the three `defaultProps` sites (§8).
- `src/style/unused/` (10 files); `override/_policy.less` / `_classic.less` (verify unreferenced); icomoon demo artifacts under `fonts/icons/`.
- `formatTime`/`toHours` in `time.js` (no production callers, §9.7-F2).
- `tsconfig-paths-webpack-plugin` devDependency (referenced by no config).

#### H2 — Make the docs match reality

- **CLAUDE.md**: **done alongside this plan** — the alias section rewritten (the old "webpack path aliases" table described machinery that exists nowhere), the tech-stack line fixed (`recharts`/`dayjs` removed), CSS output paths corrected, gotchas added.
- Kept as an ongoing discipline: document actual conventions (relative imports, the `components` barrel usage, where the engine lives) and re-check the docs whenever structure moves (H3/H4) land.

#### H3 — Isolate the demo

Move `src/index.js`, `src/main.jsx`, `src/App.jsx` → `src/demo/`; update the `webpack.demo.config.mjs` entry. Result: `src/` top level reads `core/ | demo/ | library/ | style/` and the library/demo boundary becomes self-documenting.

#### H4 — Re-home the engine (must precede Phase 6)

`core/pages/main/` + `core/ui-render/` → **`core/engine/`** (Render, transforms, rules, mapper, Data, dataKindPush + engine-local components). Move `tester/` fixtures to `__fixtures__`/demo and `static/images` out of core. Land as **pure `git mv` commits** — no logic edits — so review is trivial and history follows renames; imports are relative, so an IDE move/codemod fixes paths mechanically. Doing this *before* §9.3 gives the decomposition a sane address space (`engine/lifecycle.js`, `engine/dataMapping.js`, …) instead of scattering new files under `pages/main/`.

#### H5 — Enforce layer direction

Fix the one violation (move `ISO_8601_COMPLETE_DATE` into `core/utils`). Then lock the rules in ESLint (`no-restricted-imports` per directory, same mechanism as the SUIR guard): `utils → nothing`, `components → utils`, `modules → components|utils`, `engine → anything in core`, `demo → library surface only`. The layering is ~clean today — cheap to lock in now, expensive to restore later.

#### H6 — Naming sanity (opportunistic, ride other PRs)

- `pages/main/components/Popup.js` → `Modal.js` (it *is* a modal; frees the name collision with tooltip-Popup).
- `TooltipPop` → `Tooltip` during its F1 step 2 rewrite.
- Engine `utils.js` dissolves into named modules during §9.3 (`dataMapping.js`, `errorMapping.js`, …).
- Reconcile the `Tabs`/`TabList` pairs after confirming which is canonical (mapper uses the engine ones; audit the pack ones for orphan status).

#### H7 — Build config consolidation

Extract a shared `webpack.common.mjs` (loader chains, resolve, externals) consumed by the library/watch/demo configs — the watch config is already a near-copy of the library one and *will* drift. Fold `scripts/build-css.js` into the same source of truth, or explicitly document it as the canonical standalone CSS build.

#### Target layout

```
src/
  library/        # public entry, types, (future) meta.schema.json (§9.4)
  core/
    engine/       # ← pages/main + ui-render merged (Render, transforms, rules→decomposed, mapper)
    components/   # presentational pack (post-H1 cleanup)
    modules/      # form, upload, variables
    utils/        # pure utils (+ dateAdapter from F2); absorbs core/common
    contexts/  providers/  services/
  demo/           # all demo code incl. entries (H3)
  style/          # minus unused/ and icomoon artifacts
```

**Sequencing:** H1/H2 — immediately, in any quiet moment (Phase 4 window). H3/H4 — right after Phase 2 ships, as dedicated pure-move commits in a lull between feature branches (see R11). H5 rides the 4-S window (it is one ESLint-config PR); H6–H7 — opportunistic. **H4 must precede Phase 6.**

---

## 10. Consolidated roadmap

| Phase | Content | Effort | Gate to next |
|---|---|---|---|
| **0** | Safety net: CI, `rules.js` flow tests, example smoke harness, **Babel targets env-split (0.5)** | ~1 week | CI green baseline |
| **1** | React 17: dev bump, peer widen (react + moment `^2.29.4`), QA; checkpoint release | 1–2 days | QA checklist clean |
| **2** | React 18: `createRoot` (demo), RTL 12→16, `defaultProps` fixes, batching regression pass, peer widen, docs; checkpoint release | 1–2 weeks | CI green on 18, zero act-warnings |
| **3** | Contract tests on all examples; JSON Schema + dev validation; error boundaries; React 16/17 CI smoke | 1–2 weeks | Contract suite in CI |
| **4** | Hooks migration of leaf components; automatic JSX runtime; **SUIR passthrough-prop audit + lint guard (F1 step 0)**; **housekeeping H1–H2 (dead code + docs truth)** | ongoing, per-component PRs | — |
| **4-S** | **Structure (§9.9): demo isolation (H3); engine re-home `pages/main`+`ui-render` → `core/engine` (H4, pure `git mv` commits); layer-direction lint (H5)** | ~2–4 days, in a quiet window | **H4 before Phase 6** |
| **TS** | **TypeScript migration track (§9.6): E0 infra after Phase 2 → utils+contract (E1) → components/modules (E2, rides 4/5a) → engine (E3, rides 6) → public-API switchover (E4) → `prop-types` dependency removed (E5); **go/no-go on the E2/E3 tail after E1** | continuous, per-PR | `tsc --noEmit` green throughout; E4 gated by the `dist/index.d.ts` golden diff |
| **5a** | **SUIR exit, JS side (F1 steps 1–3): `Table` → `TooltipPop` → `Dropdown`**, shipped step by step | ~3–5 weeks | contract suite + example QA per step |
| **5b** | **SUIR exit, CSS side (F1 steps 4–5): own the 5 LESS modules; drop `semantic-ui-less` + `theme.config`; LESS pipeline re-eval (§9.8)** | ~1–2 weeks | visual parity |
| **6** | Engine decomposition (`rules.js` / `form/utils.js`): extract → compose → hooks; **StrictMode-clean demo** as acceptance | largest single item; only after 3 | StrictMode clean |
| **7** | Decision gate: ESM build; `moment` native adapter go/no-go (F2); form-stack major bump if not done earlier (F4); **React 19 go/no-go — earliest right after 5a (§8 fast path)** | decision + scoped work | — |

Phases 3 and 4 can partially overlap. Tracks **5a/5b** (SUIR exit) and **6** (engine) are independent — both require Phase 3, and their relative order is a resourcing choice; 5a steps 1–2 may even run alongside Phase 4. Phase 7 is a decision gate, not a fixed date.

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
| R14 | Module-global engine state (`FIELD.FUNC`, `Active.translate`, `errorHandlerFunction`) — two `UIRender` instances on one page interfere **today**, and StrictMode double-invocation trips on the same writes | High (current behavior) | Medium–High | §9.3 step 3 (de-globalization); two-instance case added to the contract suite; until then, document the single-instance assumption for hosts |

---

## Appendix A — Inventory quick reference

- **Class components (22 source files; a wider grep also matches 2 test files and 3 doc-comment-only hits):** components pack (`Collapse`, `Tabs`, `Carousel`, `Counter`, `Expand`, `ProgressBar`, `ProgressSteps`, `InputNative`), pages (`rules.js`, `Data.js`, `mapper.js`, `components/Tabs.js`, `TableView.js`, `LocalDraftTableRow.js`), modules (`form/utils.js`, `form/views/AutoSave.js`, `form/inputs/ToggleField.js`, `form/asInputDateField.js`, `upload/views/Upload.js`), core (`ui-render/Render.js`), library types, demo (`Examples.jsx`).
- **Key module sizes:** `rules.js` 1244 · `mapper.js` 700 · `form/utils.js` 624 · `transforms.js` 423 · `Render.js` 133.
- **Docs hardcoding React version:** `src/demo/markdowns/docs.md:16,37,41` · `README.md` (plus a prose peer-deps note at `changelog.md:50`).
- **SUIR JS surface (3 of 54 pack files):** `Table.js` (subcomponent users: `mapper.js:170`, `TableView.js`, `LocalDraftTableRow.js`, `ErrorTable.js`) · `TooltipPop.js` (`Render.Tooltip`, `mapper.js:44,483`) · `Dropdown.js` (`mapper.js:540–544`).
- **semantic-ui-less modules actually imported** (`src/style/override/_semantic.less`): `globals/reset`, `elements/label` (chips), `collections/menu` (own Pagination), `modules/dropdown`, `modules/popup`; `transition` already replaced by an in-house `transition.less`.
- **moment call sites:** `Text.js:43` · `TextDateValue.js:8` · `InputDate.js:58–65` (+ rc-picker moment `generateConfig` at :10/:88) · `time.js` `formatTime`/`toHours` (test-only, no production callers).
- **Structure facts (§9.9):** `ui-*-pack` alias imports: **0** across `src` · `tsconfig-paths-webpack-plugin`: referenced by no config · orphan components: `Avatar`, `Badge`, `Carousel`, `Collapse`, `ErrorContent`, `FloatNumber`, `ImageSwatch`, `MenuButton`, `Tags` · layering violation: `components/Text.js:4` → `../modules/variables` · demo entries at `src/` root: `index.js`, `main.jsx`, `App.jsx`.

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

# Regression contour
npm test && npm run build-lib && npm run build
```

## Appendix C — Consolidated verification checklist

Every check this plan depends on, in one place. ✅ = already verified during the audits behind this plan (evidence in §2 / Appendix A); ☐ = open, bound to a phase. An item is not "done" until its box is checked in a PR or CI.

### Already verified (audit facts — re-verify only if the code moves first)

- ✅ No legacy React APIs in `src`: string refs, legacy context, `findDOMNode`, `e.persist()`, `unstable_*`, `react-dom/test-utils`, `element.ref` reads
- ✅ All runtime deps declare React 17/18 peers (lock-verified); `@testing-library/react` 12 is the only `<18` blocker
- ✅ SUIR surface: imports confined to `src/core/components`; exactly 3 wrappers; 5 semantic LESS modules active
- ✅ moment surface: 3 components + rc-picker `generateConfig`; `formatTime`/`toHours` have no production callers
- ✅ Structure: `ui-*-pack` alias imports = 0; `tsconfig-paths-webpack-plugin` referenced by no config; 9 orphan components (no imports / JSX / mapper registration); one layer violation (`Text.js:4`)
- ✅ 19-ready form stack exists upstream (`react-final-form` 7.0.1 / `final-form` 5.0.1 / `final-form-arrays` 4.0.1 / `react-final-form-arrays` 5.0.0 — npm-registry-verified)
- ✅ Single `cloneElement` site passes plain props only (ref-as-prop safe)
- ✅ `prop-types` usage is purely declarative: 40 importing files, zero `checkPropTypes()` calls; ~90 call sites via the `type` proxy (`components/types.js`, plus its ~60 definition lines) — safe to retire per §9.6-E5

### Phase 0 — before any dependency bump

- ☐ Green baseline recorded: `npm test`, `npm run build-lib`, `npm run build`, all demo examples render with a clean console
- ☐ `rules.js` critical-flow tests exist: initial data processing, `showIf`, validation/error mapping, `submit` payload, `addData`/`removeData`, upload/download
- ☐ Example smoke harness mounts every `src/demo/examples/` meta+data pair
- ☐ CI runs lint + `lint:css` + test + `build-lib` on every PR
- ☐ Babel targets env-split landed (test → `node: current`; build → browserslist) — closes R6

### Phase 1 — React 17

- ☐ Manual QA checklist (§5) clean on 17 — popups, dropdowns, pickers, tabs, tables, forms, upload
- ☐ react-refresh dev loop works on 17
- ☐ yalc smoke into a consuming app (if one is available)

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
- ☐ **Step 4:** pixel parity of extracted CSS vs current compiled output; `javascriptEnabled` no longer required by any build
- ☐ **Step 5:** Appendix B "SUIR exit progress" greps return nothing

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

- ☐ Module-global mutable state inventoried and moved per-instance (`Active.*`, `FIELD.FUNC`, `errorHandlerFunction`, translation registries) — R14
- ☐ Two simultaneous `UIRender` instances on one page covered by the contract suite
- ☐ Demo runs clean under `<StrictMode>` (zero lifecycle warnings, no behavioral diffs)

### React 19 flip (§8 fast path — after 5a)

- ☐ **Host consumption mode confirmed with host teams (bundler vs script-tag)** — the only item requiring a human answer; it decides how much F3 (ESM) matters
- ☐ `defaultProps` fixed (Phase 2) and automatic JSX runtime enabled (Phase 4)
- ☐ `@testing-library/react` ≥16.1 in place (the first RTL with `react ^19` peers); `react@19` in the dev/CI matrix; full regression green; peers widened additively (`^16.14 || ^17 || ^18 || ^19`)
- ☐ `@types/react@19` pinned for `gen-ts`
- ☐ rc-picker / react-refresh / eslint-plugin-react-hooks behave on 19 in the matrix

### Ongoing invariants (commands in Appendix B)

- ☐ SUIR isolation grep: nothing outside the components pack (until exit), then nothing at all
- ☐ Alias grep stays zero
- ☐ After the F2 seam: only the `dateAdapter` module imports `moment`
- ☐ React 16/17 compatibility mount-smoke stays in the CI matrix while the peer floor includes them

