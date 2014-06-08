#!/usr/bin/env node

var cssdiff = require("../index.js");

var args = process.argv;

if (args.length < 5) {
  console.log("Need paths to 1 HTML file and 2 CSS files");
  console.log("Optionally say `diff` at the end to start your diff app");
  console.log("e.g.");
  console.log("cssdiff test/zen.html test/before.css test/after.css diff");
  process.exit(1);
}

cssdiff(args[2], args[3], args[4], function(result, verbose, diff) {
  console.log(verbose);
  if (diff && args[5] === 'diff') {
    require('child_process').exec(diff, function (error, stdout) {
      console.log(stdout);
    });
  }
  process.exit(+!result); // true means all is fine means successful exit 0
})
