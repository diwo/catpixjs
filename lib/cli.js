#!/usr/bin/env node
'use strict';

var catpix = require('./catpix');

var filename = process.argv[2];
if (!filename) {
  console.error('Usage: catpix <FILE>');
  process.exit(1);
}

var options = {
  maxWidth: process.stdout.columns
};

catpix(filename, options, function(err, data) {
  if (err) {
    console.error(err.message);
    process.exit(1);
  }

  console.log(data);
});
