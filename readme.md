CSS diffing tool

## Why

For convenient testing of CSS code transforms

## What

The tool accepts an HTML file and two CSS files: the original before your code transformation
and the result of the transformation.

Then it uses [PhantomJS](http://phantomjs.org/) and [SlimerJS](http://slimerjs.org/) to load the HTML file twice:
once inlining the "before" CSS and once with the "after" CSS. The CSS is inlined in a `<style>` tag.

The HTML is stripped of tags such as `iframe` and `script` that can potentially skew the visual comparison
by injecting dynamic content.

The results of rendering the two HTML files are saved to two PNGs which are then compared pixel by pixel.

If they are different, a GIF animation is also created to help debug.

## Installation

    $ npm install cssdiff

It's up to you to install [PhantomJS](http://phantomjs.org/) and/or [SlimerJS](http://slimerjs.org/).
If you want just one of these, remove the other in the `config.json` file.

Also up to you to install [ImageMagick](http://imagemagick.org) (to create the animated GIF)

There is a `config.json` where you can fiddle with (or delete) the paths to the three tools, if necessary.

## Usage

### In code:

```js
var cssdiff = require('../index.js');
cssdiff('index.html', 'before.css', 'after.css', function(result, msg) {
  console.log(result); // `true` if all is fine
  console.log(msg); // verbose message to help debug
});
```

### Command line:

    $ cssdiff index.html before.css after.css

#### Example success output

    All good with test/zen.html and test/before.css and test/before.css

#### Example failure output

    ERROR! The before/after results are different
    You provided test/zen.html and test/before.css and test/after.css
    See these files to start debugging:
     * Generated HTML before: /path/to/tmp/ec2af394-984d-4bac-b9fb-92b4461fda1b-before.html
     * Generated HTML after: /path/to/tmp/ec2af394-984d-4bac-b9fb-92b4461fda1b-after.html
     * Screenshot before: /path/to/tmp/ec2af394-984d-4bac-b9fb-92b4461fda1b-before-webkit.png
     * Screenshot after: /path/to/tmp/ec2af394-984d-4bac-b9fb-92b4461fda1b-after-webkit.png
     * Gif animation: /path/to/tmp/ec2af394-984d-4bac-b9fb-92b4461fda1bwebkit.gif

## More

Background:

 * http://www.phpied.com/css-diff/
 * http://www.phpied.com/css-diffs-2/