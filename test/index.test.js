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

  it('converts an svg with a nested svg inside it', async () => {
    const input = `
    <svg viewBox="0 0 100 100" version="1.1" xmlns="http://www.w3.org/2000/svg" width="512" height="512">
      <svg viewBox="0 0 10 10" width="100" height="100" version="1.1" xmlns="http://www.w3.org/2000/svg"><circle cx="5" cy="5" r="5" fill="pink"/></svg>
    </svg>
    `;
    const png = await render({ buffer: Buffer.from(input), width: 512, height: 512 });

    require('fs').writeFileSync('out.png', png);

    await validateImage({ png, width: 512, height: 512, hash: '8000w0a02E0' });
  });

  it('resolves use tags in svg by default', async () => {
    const input = `
    <svg viewBox="0 0 50 50" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <circle id="circle" r="5" fill="black"/>
        <rect id="rect" width="10" height="10" fill="black" />
      </defs>
      <circle cx="25" cy="25" r="25" fill="red"/>
      <use x="15" y="15" href="#circle" fill="pink" />
      <use x="10" y="30" href="#rect" />
      <use x="30" y="30" href="#rect" />
    </svg>`;
    const png = await render({ buffer: Buffer.from(input) });

    await validateImage({ png, width: 50, height: 50, hash: 'c7343wq04L3' });
  });

  it('errors if the input is not an SVG image', async () => {
    let error;

    await render({ buffer: Buffer.from('I am but a regular string') }).catch(e => {
      error = e;
    });

    expect(error).to.be.instanceOf(Error);
    expect(error).to.have.property('message', '"options.buffer" is not a valid SVG image');
  });

  it('errors if no input is provided', async () => {
    let error;

    await render().catch(e => {
      error = e;
    });

    expect(error).to.be.instanceOf(Error);
    expect(error).to.have.property('message', 'required "options.buffer" is missing');
  });

  it('errors if input is provided incorrectly', async () => {
    let error;

    await render(Buffer.from('it does not matter')).catch(e => {
      error = e;
    });

    expect(error).to.be.instanceOf(Error);
    expect(error).to.have.property('message', 'required "options.buffer" is missing');
  });

  it('errors if input is provided as a string', async () => {
    const input = '<svg viewBox="0 0 50 50"><circle cx="25" cy="25" r="25" fill="green"/><circle cx="40" cy="10" r="10" fill="pink"/></svg>';
    let error;

    await render({ buffer: input }).catch(e => {
      error = e;
    });

    expect(error).to.be.instanceOf(Error);
    expect(error).to.have.property('message', 'required "options.buffer" is missing');
  });
});
