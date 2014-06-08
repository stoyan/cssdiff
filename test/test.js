var cssdiff = require('../index.js');

// ok
cssdiff('zen.html', 'before.css', 'before.css', function(result, msg) {
  console.log(msg);
});

// fail
cssdiff('zen.html', 'before.css', 'after.css', function(result, msg) {
  console.log(msg);
});
