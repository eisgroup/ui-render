<!--
  GENERATED FILE — DO NOT EDIT. Run `npm run docs:phrases` to regenerate.
  The ids, English texts and places come from BUILT_IN_PHRASES in src/core/utils/phrases.ts.
  Generator: scripts/generate-phrase-reference.js.
-->

# Built-in phrases

The texts UI Render writes itself, as opposed to the labels a `meta.json` gives it. Your `translate`
prop is asked for each as `ui-render:<ID>`: register a `ui-render` namespace in your i18n, with the
ids below as its keys. The README's section "Translating the built-in texts (consumer)" shows an
example.

Where your `translate` answers with the key itself (`ui-render:TOTAL`), with the key without its
namespace (`TOTAL`), or with an empty string, UI Render shows the English text below. Without a
`ui-render` namespace, every one of them shows in English.

A `{name}` in a text is a placeholder that UI Render fills after your translation comes back:
keep it in single braces where your translation needs the value.

**This page is generated.** Run `npm run docs:phrases` after changing `BUILT_IN_PHRASES` in
`src/core/utils/phrases.ts`. The package's types list the same ids as `UIRender.UIRenderPhraseId`.

## Phrases (3)

| Id | English text | Where it shows |
| --- | --- | --- |
| `NO` | No | A value of `false`, shown as text |
| `TOTAL` | Total | A pie chart's centre, under the total of its values |
| `YES` | Yes | A value of `true`, shown as text |
