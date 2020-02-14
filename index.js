const { createCanvas, loadImage } = require('canvas');
const cheerio = require('cheerio');

module.exports = async ({ buffer, width, height } = {}) => {
  if (!Buffer.isBuffer(buffer)) {
    throw new Error('required "options.buffer" is missing');
  }

  const $ = cheerio.load(buffer.toString());
  const $svg = $('svg');

  if ($svg.length < 1) {
    throw new Error('"options.buffer" is not a valid SVG image');
  }

  const { naturalWidth, naturalHeight } = await loadImage(Buffer.from($.xml('svg')));

  let w, h;

  if (width && !height) {
    // scale both based on width
    w = width;
    h = width * naturalHeight / naturalWidth;
  } else if (height && !width) {
    // scale both based on width
    h = height;
    w = height * naturalWidth / naturalHeight;
  } else {
    // we either have both or neither
    w = width || naturalWidth;
    h = height || naturalHeight;
  }

  $svg.attr('width', `${w}`);
  $svg.attr('height', `${h}`);

  const image = await loadImage(Buffer.from($.xml('svg')));

  const canvas = createCanvas(w, h);
  const ctx = canvas.getContext('2d');

  ctx.drawImage(image, 0, 0);

  return canvas.toBuffer('image/png');
};
