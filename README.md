# Catpix.js

Transform images into text to be displayed in the terminal using Javascript.

Inspired by [radek.io/2015/06/29/catpix/](http://radek.io/2015/06/29/catpix/)

## Usage
### CLI
    $ npm install -g catpixjs
    $ catpix lenna.png

### Require
    var catpix = require('catpixjs');
    catpix('lenna.png', function(err, data) {
        console.log(data);
    }

## API
#### catpix(path, [options], callback)
* **path** path to the image file
* **options** *(optional)* object
    * **options.maxWidth** maximum number of printable characters to use for each line
* **callback** *function(err, data)*
    * **err** an Error object in case of errors
    * **data** string representation of the image
