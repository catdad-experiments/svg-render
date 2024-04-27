const { expect } = require('chai');
const jimp = require('jimp');
const isPng = require('is-png');

const validateImage = async ({ width, height, png, hash }) => {
  expect(isPng(png)).to.equal(true, 'output was not a valid png image');

  // require('fs').writeFileSync(`./${Date.now()}.png`, png);

  const image = await jimp.read(png);

  const { width: actualWidth, height: actualHeight } = image.bitmap;

  expect(actualWidth).to.equal(width, 'unexpected width');
  expect(actualHeight).to.equal(height, 'unexpected height');

  if (Array.isArray(hash)) {
    expect(hash).to.include(image.hash());
  } else {
    expect(image.hash()).to.equal(hash);
  }
};

module.exports = { validateImage };
