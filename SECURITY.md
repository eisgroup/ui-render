# Security policy

## Reporting a vulnerability

Report it privately, through GitHub's private vulnerability reporting: the repository's **Security** tab, then
**Report a vulnerability**. Please do not open a public issue or pull request for it.

Say what an attacker controls (a meta, a data value, the page around the widget), what they can do with it, and
which version you found it in. A meta or a page that shows it helps most.

## What is in scope

The renderer does what a meta tells it to, and a meta is trusted configuration: the README's
[Security model](README.md#security-model-consumer) says what a meta can do. A meta that renders raw HTML or calls
`fetch` uses what a meta may use, and is not a vulnerability in itself.

In scope:

- what a **data** value, or a user's input, can do when the meta does not bind it to an attribute;
- the published package: its bundle, and the third-party code bundled into it, which `dist/sbom.cdx.json` lists;
- the stylesheet reaching outside `.ui-render`;
- this repository's build, release and CI.

The bundled packages are audited every week (`npm run audit:bundled`, `.github/workflows/audit-bundled.yml`).
