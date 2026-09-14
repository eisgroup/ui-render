# Third-party notices

`eis-ui-render` is licensed under Apache-2.0 (see `LICENSE`). It also distributes CSS derived from
the third-party works below, in `static/all.css` and in the sources under `src/style/`.

This file exists because §9.7-F1 step 4 copies compiled `semantic-ui-less` CSS into this repository
rather than importing it from `node_modules`. While the CSS was imported, each module carried its
own `/*!` banner into the build and the banners survived minification. Once the CSS is vendored,
nothing keeps those banners current automatically, so the notices are recorded here — and here
rather than in `static/all.css`, which is a build artifact and is gitignored.

The licence texts below are transcribed verbatim from the upstream repositories, fetched rather
than recalled.

---

## Semantic UI (`semantic-ui-less` 2.5.0) — MIT

Derived CSS: the compiled output of `definitions/globals/reset` and `definitions/modules/dropdown`.

**On the copyright holder, stated plainly because the upstream record is incomplete.** The
`semantic-ui-less` package ships no licence file at all; its `package.json` declares
`"license": "MIT"` and `"author": "Jack Lukic <jack@semantic-ui.com>"`. The licence text below is
taken from the Semantic-Org/Semantic-UI repository, which is the source these LESS definitions are
published from — and that file **contains no `Copyright (c)` line of its own**, only the permission
text. It is reproduced here exactly as upstream publishes it, with the author recorded from the
package manifest rather than invented.

```
# The MIT License

Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the 'Software'), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED 'AS IS', WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
```

Author, per `node_modules/semantic-ui-less/package.json`: Jack Lukic <jack@semantic-ui.com>.
Source: https://github.com/Semantic-Org/Semantic-UI-LESS — licence text from
https://github.com/Semantic-Org/Semantic-UI/blob/master/LICENSE

---

## normalize.css v7.0.0 — MIT

Derived CSS: `definitions/globals/reset` in `semantic-ui-less` is largely normalize.css, and its
own one-line banner (`normalize.css v7.0.0 | MIT License | github.com/necolas/normalize.css`)
travels into our compiled output.

```
# The MIT License (MIT)

Copyright © Nicolas Gallagher and Jonathan Neal

Permission is hereby granted, free of charge, to any person obtaining a copy of
this software and associated documentation files (the "Software"), to deal in
the Software without restriction, including without limitation the rights to
use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies
of the Software, and to permit persons to whom the Software is furnished to do
so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
```

Source: https://github.com/necolas/normalize.css
