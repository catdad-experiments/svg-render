const { createCanvas, loadImage } = require('canvas');
const cheerio = require('cheerio');

const resolveUseTags = ($, $svg) => {
  $svg.find('use').each((i, elem) => {
    const $elem = $(elem);
    const id = $elem.attr('href');
    const $shape = $(id).clone();
    $shape.removeAttr('id');

    const $g = $('<g></g>');
    const position = { x: 0, y: 0 };

    for (let key in $elem.get(0).attribs) {
      if (key === 'href') {
        continue;
      }

      const value = $elem.attr(key);

      if (key === 'x') {
        position.x = value;
        continue;
      }

      if (key === 'y') {
        position.y = value;
        continue;
      }

      $shape.attr(key, value);
    }

    $g.attr('transform', `translate(${position.x}, ${position.y})`);

    $shape.wrap($g);
    $elem.replaceWith($g);
  });
};

module.exports = async ({ buffer, width, height, expandUseTags = true } = {}) => {
  if (!Buffer.isBuffer(buffer)) {
    throw new Error('required "options.buffer" is missing');
  }

  const $ = cheerio.load(buffer.toString(), { xmlMode: true });
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

  if (expandUseTags) {
    resolveUseTags($, $svg);
  }

  const image = await loadImage(Buffer.from($.xml('svg')));
  const canvas = createCanvas(w, h);
  const ctx = canvas.getContext('2d');

  ctx.drawImage(image, 0, 0);

  return canvas.toBuffer('image/png');
};
