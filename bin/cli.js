#!/usr/bin/env node

var cssdiff = require("../index.js");

var args = process.argv;

if (args.length < 5) {
  console.log("Need paths to 1 HTML file and 2 CSS files");
  process.exit(1);
}

cssdiff(args[2], args[3], args[4], function(result, verbose) {
  console.log(verbose);
  process.exit(+!result); // true means all is fine means successful exit 0
})
