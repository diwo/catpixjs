#!/usr/bin/env node
'use strict';

var getPixels = require('get-pixels');
var colors = require('ansi-256-colors');

// Handleable get-pixels dtype values
var dtypeMap = {
  int8: 8,
  int16: 16,
  int32: 32,
  uint8: 8,
  uint16: 16,
  uint32: 32,
  uint8_clamped: 8
};

// ansi-256-colors range of values per channel
var colorRange = 6;
var upperHalfBlockChar = String.fromCharCode(0x2580);
var filename = process.argv[2];

if (!filename) {
  console.error('Usage: catpix <FILE>');
  process.exit(1);
}

getPixels(filename, function(err, pixels) {
  if (err || !dtypeMap[pixels.dtype]) {
    console.error('Error: File format not supported');
    process.exit(1);
  }

  var width = Math.min(pixels.shape[0], 180);
  var height = pixels.shape[1];
  var channels = pixels.shape[2];

  var colorNormalizeFactor = colorRange / Math.pow(2, dtypeMap[pixels.dtype]);

  seq(height)
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
            var normalizedAlpha = components.pop() / (colorRange-1);
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
    })
    .forEach(function(line) {
      console.log(line);
    });
});

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
