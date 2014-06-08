var system = require('system');
var url = system.args[1];
var png = system.args[2];

var page = require('webpage').create();
page.viewportSize = { width: 800, height: 600 };

// don't download external resources so to minimize noise
// e.g. random images, ads
page.onResourceRequested = function(requestData, request) {
  if (requestData.url !== url) {
    // request.abort() is the right thing to do
    // but slimerjs aborts the whole page
    request.changeUrl('about:blank');
  }
};

page.open(url, function (status) {
  if (status !== 'success') {
    console.log('Unable to access the network!');
  } else {
    page.render(png);
  }
  phantom.exit();
});