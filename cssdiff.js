var exec = require('child_process').exec;
var fs = require('fs');
var jsdom = require('jsdom');
var mensch = require('mensch');
var path = require('path');
var pngparse = require('pngparse');
var sprintf = require('sprintf').sprintf;
var uuid = require('uuid');

var read = fs.readFileSync;
var write = fs.writeFileSync;

var config;
var tools = [];

jsdom.defaultDocumentFeatures = {
  FetchExternalResources: false,
};

function same(b, a, id, cb) {
  var oks = 0;
  var pre = config.tmp + id;
  var cleanup = [];
  var phantom = '%s %s/url2png.js "%s" "%s"';

  tools.forEach(function(tool) {
    var before = pre + '-before-' + tool.name + '.png';
    var after =  pre + '-after-'  + tool.name + '.png';
    var giff =   pre + tool.name + '.gif';

    cleanup = cleanup.concat([before, after]);

    var before_cmd = sprintf(phantom,
      tool.path,
      __dirname,
      addProtocol(b),
      before);
    var after_cmd = sprintf(phantom,
      tool.path,
      __dirname,
      addProtocol(a),
      after);
    var giff_cmd = config.imagick && sprintf('%s -delay 50 -loop 0 %s %s %s',
      config.imagick,
      before,
      after,
      giff);

    exec(before_cmd, function() {
      exec(after_cmd, function() {
        sameImage(before, after, function(same) {
          if (same) {
            oks++;
            if (oks === tools.length) {
              cb(true, {cleanup: cleanup});
              return;
            }
          } else {
            giff_cmd && exec(giff_cmd);
            cb(false, {
              ss_before: before,
              ss_after: after,
              gif: giff
            });
            return;
          }
        });
      });
    });
  });
}

function addProtocol(file) {
  var proto = file.charAt(0) !== '/' ? 'file:///' : 'file://'
  return proto + file;
}

function sameImage(image_a, image_b, cb) {
  pngparse.parseFile(image_a, function(err, a) {
    if (err) {
      throw Error('Unable to read file ' + image_a);
    }
    pngparse.parseFile(image_b, function(err, b) {
      if (err) {
        throw Error('Unable to read file ' + image_b);
      }

      // easy stuffs first
      if (a.data.length !== b.data.length) {
        return cb(false);
      }

      // loop over pixels, but
      // skip 4th thingie (alpha) as these images should not be transparent
      for (var i = 0, len = a.data.length; i < len; i += 4) {
        if (a.data[i]     !== b.data[i] ||
            a.data[i + 1] !== b.data[i + 1] ||
            a.data[i + 2] !== b.data[i + 2]) {
          return cb(false);
        }
      }
      return cb(true);
    });
  });
}

function writeTestFile(name, html, css) {
  var d = jsdom.html(html);
  var stripem = 'style, iframe, object, embed, link, script';
  [].slice.call(d.querySelectorAll(stripem)).forEach(function(node) {
    if (node.parentNode) {
      node.parentNode.removeChild(node);
    }
  });

  // bring me the head of prince charming
  var h = d.querySelector('head');
  if (!h) {
    h = d.createElement('head');
    d.documentElement.appendChild(h);
  }

  var style = d.createElement('style');
  style.textContent = css;
  h.appendChild(style);

  write(name, d.documentElement.outerHTML);
}

function writeCSSDiff(b, a, path) {
  var before = mensch.parse(b, {comments: false});
  var after =  mensch.parse(a, {comments: false});
  write(path + "-before.css", mensch.stringify(before, {indentation: '  '}));
  write(path + "-after.css", mensch.stringify(after, {indentation: '  '}));
  
  return sprintf('"%s" "%s" "%s"',
    config.diff,
    path + "-before.css",
    path + "-after.css"
  );
}

module.exports = function(conf) {
  config = conf;
  config.tmp = config.tmp || process.env.TMPDIR;
  if (config.phantomjs) {
    tools.push({name: 'webkit', path: config.phantomjs});
  }
  if (config.slimerjs) {
    tools.push({name: 'moz', path: config.slimerjs});
  }

  if (!tools) {
    throw Error ('Need phantomjs or similar');
  }

  return function (html, css_b, css_a, cb) {
    var id = uuid();
    var before_html = sprintf('%s%s-before.html', conf.tmp, id);
    var after_html = sprintf('%s%s-after.html', conf.tmp, id);
    var html_content = read(html, 'utf8');
    var before_css = read(css_b, 'utf8');
    var after_css = read(css_a, 'utf8');

    writeTestFile(before_html, html_content, before_css);
    writeTestFile(after_html, html_content, after_css);

    same(before_html, after_html, id, function (same, debug) {
      if (!same) {
        var verbose = [
          'ERROR! The before/after results are different',
          sprintf('You provided %s and %s and %s', html, css_b, css_a),
          'See these files to start debugging:',
          ' * Generated HTML before: ' + before_html,
          ' * Generated HTML after: ' + after_html,
          ' * Screenshot before: ' + debug.ss_before,
          ' * Screenshot after: ' + debug.ss_after
        ];

        if (debug.gif) {
          verbose.push(' * Gif animation: ' + debug.gif);
        }

        if (config.diff) {
          var diffcmd = writeCSSDiff(before_css, after_css, conf.tmp + id);
          verbose.push(' * CSS diff: ' + diffcmd);
        }

        cb(false, verbose.join('\n'), diffcmd);

      } else {
        var cleanup = debug.cleanup.concat([before_html, after_html]);
        cleanup.forEach(function(filename) {
          fs.unlink(filename);
        });
        var verbose = sprintf('All good with %s and %s and %s', html, css_b, css_a);
        cb(true, verbose);
      }
    });
  };
};
