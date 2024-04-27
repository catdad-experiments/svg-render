# svg-render

> Render high-quality PNG images from an SVG

[![CI][ci.svg]][ci.link]
[![npm-downloads][npm-downloads.svg]][npm.link]
[![npm-version][npm-version.svg]][npm.link]

[ci.svg]: https://github.com/catdad-experiments/svg-render/actions/workflows/ci.yml/badge.svg
[ci.link]: https://github.com/catdad-experiments/svg-render/actions/workflows/ci.yml
[npm-downloads.svg]: https://img.shields.io/npm/dm/svg-render.svg
[npm.link]: https://www.npmjs.com/package/svg-render
[npm-version.svg]: https://img.shields.io/npm/v/svg-render.svg

## CLI

The easiest way to convert your SVG to a PNG is on the command line:

```bash
npx svg-render < input.svg > output.png
```

You can also resive your SVG, since it is scalable after all:

```bash
npx svg-render --width 512 < input.svg > output.png
```

See `npx svg-render --help` for more info.

If you use this often, you might benefit from installing it on your path directly:

```bash
npm install --global svg-render

svg-render < input.svg > output.png
```

The generated images are unoptimized. You can optimize them with something like [`pngmin-cli`](https://github.com/catdad-experiments/pngmin-cli):

```bash
npx svg-render < input.svg | npx pngmin-cli > output.png
```

## API

You can require this module in your script as well:

```javascript
const { promises: fs } = require('fs');
const render = require('svg-render');

(async () => {
  const outputBuffer = await render({
    buffer: await fs.readFile('/path/to/my/input.svg'),
    width: 512
  });

  await fs.writeFile('./output.png', outputBuffer);
})();
```

Options:
* `buffer` _`<Buffer>`_: Required. The SVG being rendered.
* `width` _`<Number>`_: Optional. The desired width of the output PNG. Defaults to the width defined in the SVG (or proportionally scaled based on `height` when defined).
* `height` _`<Number>`_: Optional. The desired height of the output PNG. Defaults to the height defined in the SVG (or proportionally scaled based on `width` when defined).

_Note: both `width` and `height` are optional, but they work together. If neither is provided, the PNG will be the original size of the SVG. If only one of the properties is provided, the other will automatically be scaled proportionally to the original SVG size. If both are provided, the PNG will be stretched to that exact size, regardless of proportions._
