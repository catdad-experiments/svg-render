/* eslint-env mocha */

const { expect } = require('chai');
const jimp = require('jimp');
const isPng = require('is-png');

const render = require('../');

describe('module', () => {
  const validateImage = async ({ width, height, png, hash }) => {
    expect(isPng(png)).to.equal(true, 'output was not a valid png image');

    const image = await jimp.read(png);

    const { width: actualWidth, height: actualHeight } = image.bitmap;

    expect(actualWidth).to.equal(width, 'unexpected width');
    expect(actualHeight).to.equal(height, 'unexpected height');

    expect(image.hash()).to.equal(hash);
  };

  it('converts an svg to the size of its viewbox', async () => {
    const input = '<svg viewBox="0 0 50 50"><circle cx="25" cy="25" r="25" fill="red"/><circle cx="40" cy="40" r="10" fill="black"/></svg>';
    const png = await render({ buffer: Buffer.from(input) });

    await validateImage({ png, width: 50, height: 50, hash: 'c6SgkEvi5KG' });
  });

  it('converts an svg to a defined width, scaling proportionally', async () => {
    const input = '<svg viewBox="0 0 50 50"><circle cx="25" cy="25" r="25" fill="blue"/><circle cx="10" cy="10" r="10" fill="black"/></svg>';
    const png = await render({ buffer: Buffer.from(input), width: 200 });

    await validateImage({ png, width: 200, height: 200, hash: '9gs4e1aMwU0' });
  });

  it('converts an svg to a defined height, scaling proportionally', async () => {
    const input = '<svg viewBox="0 0 50 50"><circle cx="25" cy="25" r="25" fill="pink"/><circle cx="10" cy="40" r="10" fill="black"/></svg>';
    const png = await render({ buffer: Buffer.from(input), height: 750 });

    await validateImage({ png, width: 750, height: 750, hash: 'c59grkvARFk' });
  });

  it('converts an svg to a defined width and height, centering the image if necessary', async () => {
    const input = '<svg viewBox="0 0 50 50"><circle cx="25" cy="25" r="25" fill="green"/><circle cx="40" cy="10" r="10" fill="pink"/></svg>';
    const png = await render({ buffer: Buffer.from(input), width: 400, height: 200 });

    await validateImage({ png, width: 400, height: 200, hash: 'c4cfKeE6dk0' });
  });
});
