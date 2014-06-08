var cssdiff = require('../index.js');

// ok
cssdiff('zen.html', 'before.css', 'before.css', function(result, msg) {
  console.log(msg);
});

// fail
var diffed = false;
cssdiff('zen.html', 'before.css', 'after.css', function(result, msg, diff) {
  if (!diffed) {
    diffed = true;
    console.log(msg);
    require('child_process').exec(diff);
  }
});

