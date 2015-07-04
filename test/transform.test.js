'use strict';

var expect = require('chai').expect;
var transform = require('../lib/transform');
var PixelsBuilder = require('./util/pixelsBuilder');
var colors = require('ansi-256-colors');

var upperHalfBlockChar = String.fromCharCode(0x2580);
var whiteFgAnsiCode = colors.fg.getRgb(5, 5, 5);
var whiteBgAnsiCode = colors.bg.getRgb(5, 5, 5);
var resetAnsiCode = colors.reset;

// jshint expr:true
describe('transform.js', function() {
  describe('transform(pixels, options)', function() {
    it('should return empty array given no pixel', function() {
      var result = transform(
        new PixelsBuilder().build()
      );

      expect(result).to.be.empty;
    });

    it('should return an upper half block char given a single pixel', function() {
      var result = transform(
        new PixelsBuilder()
          .addPixel(0, 0, [0, 0, 0])
          .build()
      );

      expect(result).to.have.length(1);
      expect(result[0]).to.satisfy(strOccur(upperHalfBlockChar, 1));
    });

    it('should return 2 upper half block chars given 2 horizontally adjacent pixels', function() {
      var result = transform(
        new PixelsBuilder()
          .addPixel(0, 0, [0, 0, 0])
          .addPixel(1, 0, [0, 0, 0])
          .build()
      );

      expect(result).to.have.length(1);
      expect(result[0]).to.satisfy(strOccur(upperHalfBlockChar, 2));
    });

    it('should return 1 upper half block char given 2 vertically adjacent pixels', function() {
      var result = transform(
        new PixelsBuilder()
          .addPixel(0, 0, [0, 0, 0])
          .addPixel(0, 1, [0, 0, 0])
          .build()
      );

      expect(result).to.have.length(1);
      expect(result[0]).to.satisfy(strOccur(upperHalfBlockChar, 1));
    });

    it('should return 2 rows of single half block char given 3 vertically adjacent pixels', function() {
      var result = transform(
        new PixelsBuilder()
          .addPixel(0, 0, [0, 0, 0])
          .addPixel(0, 1, [0, 0, 0])
          .addPixel(0, 2, [0, 0, 0])
          .build()
      );

      expect(result).to.have.length(2);
      expect(result[0]).to.satisfy(strOccur(upperHalfBlockChar, 1));
      expect(result[1]).to.satisfy(strOccur(upperHalfBlockChar, 1));
    });

    it('should represent top pixel using foreground color of upper half block char', function() {
      var result = transform(
        new PixelsBuilder()
          .addPixel(0, 0, [255, 255, 255])
          .build()
      );

      var charsBeforeHalfBlock = result[0].split(upperHalfBlockChar)[0];
      expect(charsBeforeHalfBlock).to.contain(whiteFgAnsiCode);
    });

    it('should represent bottom pixel using background color of upper half block char', function() {
      var result = transform(
        new PixelsBuilder()
          .addPixel(0, 0, [0, 0, 0])
          .addPixel(0, 1, [255, 255, 255])
          .build()
      );

      var charsBeforeHalfBlock = result[0].split(upperHalfBlockChar)[0];
      expect(charsBeforeHalfBlock).to.contain(whiteBgAnsiCode);
    });

    it('should reset color at the end of line', function() {
      var result = transform(
        new PixelsBuilder()
          .addPixel(0, 0, [0, 0, 0])
          .build()
      );

      var charsAfterHalfBlock = result[0].split(upperHalfBlockChar)[1];
      expect(charsAfterHalfBlock).to.contain(resetAnsiCode);
    });

    describe('options.maxWidth', function() {
      it('should truncate line to specified max width', function() {
        var pixels = new PixelsBuilder()
            .addPixel(0, 0, [0, 0, 0])
            .addPixel(1, 0, [0, 0, 0])
            .addPixel(2, 0, [0, 0, 0])
            .build();

        var result = transform(pixels, { maxWidth: 2 });

        expect(result[0]).to.satisfy(strOccur(upperHalfBlockChar, 2));
      });
    });
  });
});

function strOccur(regexStr, expectedOccurrences) {
  return function(str) {
    var match = str.match(new RegExp(regexStr, 'g')) || [];
    return match.length === expectedOccurrences;
  };
}
