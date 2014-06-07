var system = require('system');
var url = system.args[1];
var png = system.args[2];

var page = require('webpage').create();
page.viewportSize = { width: 800, height: 600 };
page.open(url, function (status) {
  if (status !== 'success') {
    console.log('Unable to access the network!');
  } else {
    page.render(png);
  }
  phantom.exit();
});