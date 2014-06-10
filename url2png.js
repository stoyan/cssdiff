var system = require('system');
var exists = require('fs').exists;

var url = system.args[1];
var png = system.args[2];

var page = require('webpage').create();
page.settings.javascriptEnabled = false;
page.settings.loadImages = false;
// most pop resolution http://en.wikipedia.org/wiki/Display_resolution#Computer_monitors
page.viewportSize = { width: 1366, height: 768 };

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

    if (!exists(png)) {
      // try a part of the page
      // slimerJS fails on very long pages
      page.clipRect = { top: 0, left: 0, width: 1366, height: 27320 };
      page.render(png);
    }
  }
  phantom.exit();
});