# svg-render

> Render high-quality PNG images from an SVG

[![travis][travis.svg]][travis.link]
[![npm-downloads][npm-downloads.svg]][npm.link]
[![npm-version][npm-version.svg]][npm.link]

[travis.svg]: https://travis-ci.com/catdad-experiments/svg-render.svg?branch=master
[travis.link]: https://travis-ci.com/catdad-experiments/svg-render
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
const { promisify } = require('util');
const fs = require('fs');
const render = require('svg-render');

(async () => {
  const inputBuffer = await promisify(fs.readFile)('/path/to/my/input.svg');
  const outputBuffer = await render({
    buffer: inputBuffer, // required
    width: 512,          // optional, defaults to original size of svg
    height: 512          // optional, defaults to original size of svg
  });

  await promisify(fs.writeFile)('./output.png', outputBuffer);
})();
```

Options:
* `buffer` _`<Buffer>`_: Required. The SVG being rendered.
* `width` _`<Number>`_: Optional. The desired width of the output PNG. Defaults to the width defined in the SVG (or proportionally scaled based on `height` when defined).
* `height` _`<Number>`_: Optional. The desired height of the output PNG. Defaults to the height defined in the SVG (or proportionally scaled based on `width` when defined).
* `expandUseTags` _`<Boolean>`_: Optional. Whether to replace instances of `use` tags in the SVG with the contents that those tags are linking to. This is generally necessary for rendering method being used to work correctly. Defaults to `true`.

_Note: both `width` and `height` are optional. If neither is provided, the PNG will be the original size of the SVG. If only one of the properties is provided, the other will automatically be scaled proportionally to the original SVG size._
