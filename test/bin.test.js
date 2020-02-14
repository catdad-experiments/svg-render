/* eslint-env mocha */

const { spawn } = require('child_process');

const { expect } = require('chai');
const eos = require('end-of-stream');
const root = require('rootrequire');
const isPng = require('is-png');
const jimp = require('jimp');

describe('cli', () => {
  const exec = async (args, options = {}, input = Buffer.from('')) => {
    return await Promise.resolve().then(async () => {
      const proc = spawn(process.execPath, ['bin'].concat(args), Object.assign({}, options, {
        stdio: ['pipe', 'pipe', 'pipe'],
        cwd: root,
        windowsHide: true
      }));

      const stdout = [];
      const stderr = [];

      proc.stdout.on('data', chunk => stdout.push(chunk));
      proc.stderr.on('data', chunk => stderr.push(chunk));

      proc.stdin.end(input);

      const [code] = await Promise.all([
        new Promise(resolve => proc.on('exit', code => resolve(code))),
        new Promise(resolve => eos(proc.stdout, () => resolve())),
        new Promise(resolve => eos(proc.stderr, () => resolve())),
      ]);

      return {
        err: { code },
        stdout: Buffer.concat(stdout),
        stderr: Buffer.concat(stderr)
      };
    });
  };

  const validateImage = async ({ width, height, png, hash }) => {
    expect(isPng(png)).to.equal(true, 'output was not a valid png image');

    const image = await jimp.read(png);

    const { width: actualWidth, height: actualHeight } = image.bitmap;

    expect(actualWidth).to.equal(width, 'unexpected width');
    expect(actualHeight).to.equal(height, 'unexpected height');

    expect(image.hash()).to.equal(hash);
  };

  const getImage = async (input, args = []) => {
    const { stdout, stderr, err } = await exec(args, {}, Buffer.from(input));

    expect(stdout).to.have.length.above(0);
    expect(stderr).to.have.property('length', 0);
    expect(err).to.have.property('code', 0);

    return stdout;
  };

  it('converts an svg to the size of its viewbox', async () => {
    const input = '<svg viewBox="0 0 50 50"><circle cx="25" cy="25" r="25" fill="red"/><circle cx="40" cy="40" r="10" fill="black"/></svg>';
    const png = await getImage(input);

    await validateImage({ png, width: 50, height: 50, hash: 'c6SgkEvi5KG' });
  });

  it('converts an svg to a defined width, scaling proportionally', async () => {
    const input = '<svg viewBox="0 0 50 50"><circle cx="25" cy="25" r="25" fill="blue"/><circle cx="10" cy="10" r="10" fill="black"/></svg>';
    const png = await getImage(input, ['--width', '200']);

    await validateImage({ png, width: 200, height: 200, hash: '9gs4e1aMwU0' });
  });

  it('converts an svg to a defined height, scaling proportionally', async () => {
    const input = '<svg viewBox="0 0 50 50"><circle cx="25" cy="25" r="25" fill="pink"/><circle cx="10" cy="40" r="10" fill="black"/></svg>';
    const png = await getImage(input, ['--height', '750']);

    await validateImage({ png, width: 750, height: 750, hash: 'c59grkvARFk' });
  });

  it('converts an svg to a defined width and height, centering the image if necessary', async () => {
    const input = '<svg viewBox="0 0 50 50"><circle cx="25" cy="25" r="25" fill="green"/><circle cx="40" cy="10" r="10" fill="pink"/></svg>';
    const png = await getImage(input, ['--width', '400', '--height', '200']);

    await validateImage({ png, width: 400, height: 200, hash: 'c4cfKeE6dk0' });
  });

  describe('cli option variants', () => {
    const input = '<svg viewBox="0 0 50 50"><circle cx="25" cy="25" r="25" fill="pink"/><circle cx="0" cy="25" r="10" fill="teal"/></svg>';
    const hash = '80w0y0a82G8';

    it('parses width as "--width 200"', async () => {
      const png = await getImage(input, ['--width', '200']);
      await validateImage({ png, width: 200, height: 200, hash });
    });

    it('parses width as "--width=200"', async () => {
      const png = await getImage(input, ['--width=200']);
      await validateImage({ png, width: 200, height: 200, hash });
    });

    it('parses width as "-w 200"', async () => {
      const png = await getImage(input, ['-w', '200']);
      await validateImage({ png, width: 200, height: 200, hash });
    });

    it('parses width as "-w200"', async () => {
      const png = await getImage(input, ['-w200']);
      await validateImage({ png, width: 200, height: 200, hash });
    });

    it('parses width as "--height 200"', async () => {
      const png = await getImage(input, ['--height', '200']);
      await validateImage({ png, width: 200, height: 200, hash });
    });

    it('parses width as "--height=200"', async () => {
      const png = await getImage(input, ['--height=200']);
      await validateImage({ png, width: 200, height: 200, hash });
    });

    it('parses width as "-h 200"', async () => {
      const png = await getImage(input, ['-h', '200']);
      await validateImage({ png, width: 200, height: 200, hash });
    });

    it('parses width as "-h200"', async () => {
      const png = await getImage(input, ['-h200']);
      await validateImage({ png, width: 200, height: 200, hash });
    });
  });

  describe('errors', () => {
    it('when given non-svg data', async () => {
      const { stdout, stderr, err } = await exec([], {}, Buffer.from('I am a string, yes I am only a string'));

      expect(stdout.toString()).to.equal('');
      expect(stderr.toString()).to.include('Error: input was not a valid SVG image');
      expect(err).to.have.property('code', 1);
    });
  });
});
