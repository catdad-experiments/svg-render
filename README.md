# svg-render

> Render high-quality PNG images from an SVG

# CLI

The easiest way to convert your SVG to a PNG is on the command line:

```bash
npx svg-render < original.svg > output.png
```

You can also resive your SVG, since it is scalable after all:

```bash
npx svg-render --width 512 < original.svg > output.png
```

See `npx svg-render --help` for more info.

If you use this often, you might benefit from installing it on your path directly:

```bash
npm install --global svg-render

svg-render < input.svg > output.png
```

The generated images are unoptimized. You can optimize them with something like [`pngmin-cli`](https://github.com/catdad-experiments/pngmin-cli):

```bash
npx svg-render < input.svg | npm pngmin-cli > output.png
```

# API

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

  await promisify(fs.writeFile)(`./output.png`, outputBuffer);
})();
```
