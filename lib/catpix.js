'use strict';

var getPixels = require('get-pixels');
var transform = require('./transform');

module.exports = catpix;

function catpix(filename, options, cb) {
  // catpix(filename, cb)
  if (arguments.length < 3) {
    cb = arguments[1];
    options = {};
  }

  getPixels(filename, function(err, pixels) {
    if (err) {
      cb(new Error('Error: Unable to parse file \'' + filename + '\''));
      return;
    }
    cb(null, transform(pixels, options).join('\n'));
  });
}
