'use strict';

module.exports = PixelsBuilder;

function PixelsBuilder() {
  this.width = 0;
  this.height = 0;
  this.channels = 0;
  this.pixels = {};
}

PixelsBuilder.prototype = {
  constructor: PixelsBuilder,

  // channelValues - array of channel values
  addPixel: function(x, y, channelValues) {
    if (x+1 > this.width) this.width = x+1;
    if (y+1 > this.height) this.height = y+1;

    if (!this.channels) {
      this.channels = channelValues.length;
    } if (this.channels !== channelValues.length) {
      throw new Error('All pixels must have same number of channels');
    }

    this.pixels[hash(x, y)] = channelValues;

    return this;
  },

  build: function() {
    var builder = this;
    return {
      shape: [builder.width, builder.height, builder.channels],
      get: function(x, y, ch) {
        return builder.pixels[hash(x, y)][ch];
      }
    };
  }
};

function hash(x, y) {
  return [x, y].join(',');
}
