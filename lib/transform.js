'use strict';

var colors = require('ansi-256-colors');

var getPixelsBitsPerChannel = 8;
var displayColorRange = 6; // ansi-256-colors range of values per channel
var upperHalfBlockChar = String.fromCharCode(0x2580);

module.exports = transform;

// Transform pixel data to colored block characters
// pixels - pixels data in `get-pixels` format
// options (optional)
// options.maxWidth (optional) - max number of characters per line
// returns an array of printable lines
function transform(pixels, options) {
  var width = pixels.shape[0];
  var height = pixels.shape[1];
  var channels = pixels.shape[2];

  options = options || {};

  if (options.maxWidth) {
    width = Math.min(width, options.maxWidth);
  }

  var colorNormalizeFactor = displayColorRange / Math.pow(2, getPixelsBitsPerChannel);

  return seq(height)
    .map(function(y) {
      return seq(width)
        .map(function(x) {
          return seq(channels)
            .map(pixels.get.bind(pixels, x, y))
            .map(function(component) {
              return Math.floor(component * colorNormalizeFactor);
            });
        })
        .map(function(components) {
          if (components.length > 3) {
            var normalizedAlpha = components.pop() / (displayColorRange-1);
            return components
              .map(function(component) {
                return component * normalizedAlpha;
              });
          }
          return components;
        });
    })
    .reduce(group(2), [])
    .map(zip)
    .map(function(row) {
      return row
        .map(function(composite) {
          var ansiCodeTop = colors.fg.getRgb.apply(colors.fg, composite[0]);
          var ansiCodeBot = composite[1] ?
            colors.bg.getRgb.apply(colors.bg, composite[1]) :
            colors.bg.getRgb(0, 0, 0);
          return ansiCodeTop + ansiCodeBot + upperHalfBlockChar;
        })
        .join('')
        .concat(colors.reset);
    });
}

// Returns array of [0..n-1]
function seq(n) {
  return Array.apply(null, new Array(n))
    .map(function(x, i) { return i; });
}

// Group contiguous elements into arrays of given size
function group(size) {
  return function(prev, curr, i) {
    if (i % size === 0) {
      prev.push([curr]);
    } else {
      prev[prev.length-1].push(curr);
    }
    return prev;
  };
}

// Zippit e.g. zip([[1,2,3], [4,5,6]]) => [[1,4], [2,5], [3,6]]
function zip(arrays) {
  return arrays[0]
    .map(function(arr, i) {
      return arrays.map(function(arr) {
        return arr[i];
      });
    });
}
