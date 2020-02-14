#!/usr/bin/env node

const { width, height } = require('getopts')(process.argv.slice(2), {
  alias: {
    help: 'h',
    width: 'w',
    height: 'h',
  }
});

const render = require('./');

const readStdin = () => new Promise(resolve => {
  const result = [];

  process.stdin.on('readable', () => {
    let chunk;

    while ((chunk = process.stdin.read())) {
      result.push(chunk);
    }
  });

  process.stdin.on('end', () => {
    resolve(Buffer.concat(result));
  });
});

(async () => {
  const input = await readStdin();
  const output = await render({ buffer: input, width, height });

  process.stdout.write(output);
})().catch(e => {
  const error = e.message.includes('options.buffer') ? new Error('input was not a valid SVG image') : e;

  // eslint-disable-next-line no-console
  console.error(error);
  process.exitCode = 1;
});
