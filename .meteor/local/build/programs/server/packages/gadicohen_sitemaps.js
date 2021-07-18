(function () {

/* Imports */
var Meteor = Package.meteor.Meteor;
var global = Package.meteor.global;
var meteorEnv = Package.meteor.meteorEnv;
var WebApp = Package.webapp.WebApp;
var WebAppInternals = Package.webapp.WebAppInternals;
var main = Package.webapp.main;
var check = Package.check.check;
var Match = Package.check.Match;
var _ = Package.underscore._;
var robots = Package['gadicohen:robots-txt'].robots;

/* Package-scope variables */
var sitemaps, k;

(function(){

/////////////////////////////////////////////////////////////////////////////////////////
//                                                                                     //
// packages/gadicohen_sitemaps/sitemaps.js                                             //
//                                                                                     //
/////////////////////////////////////////////////////////////////////////////////////////
                                                                                       //
/*
 * http://en.wikipedia.org/wiki/Site_map
 * http://www.sitemaps.org/index.html
 */

sitemaps = {
  _list: {},
  _config: {
    rootUrl: undefined,
    gzip: false,
  },
  _configHooks: {}
};

function configSet(key, value) {
  if (sitemaps._configHooks[key])
    sitemaps._configHooks[key](key, value, sitemaps._config[key]);
  sitemaps._config[key] = value;
}

sitemaps.config = function(key, value) {
  if (!value && _.isObject(key)) {
    for (k in key)
      configSet(k, key[k]);
  } else {
    configSet(key, value);
  }
};

if (typeof Number.lpad === "undefined") {
  Number.prototype.lpad = function(length) {
    "use strict";
    var str = this.toString();
    while (str.length < length) {
      str = "0" + str;
    }
    return str;
  };
}

var urlStart = Meteor.absoluteUrl();

sitemaps._configHooks.rootUrl = function(key, value) {
  urlStart = value || Meteor.absoluteUrl();
};

var prepareUrl = sitemaps._prepareUrl = function(url) {
  if (url.match(/^https?:\/\//))
    return url;
  else {
    return urlStart + encodeURI(url.replace(/^\//, '')).replace(/&/g, '&amp;');
  }
};

// TODO: 1) gzip, 2) sitemap index + other types + sitemap for old content
var Fiber = Npm.require('fibers');
var zlib = Npm.require('zlib');
var stream = Npm.require('stream');

var resAsXML = function resAsXML(res, data) {
  res.writeHead(200, {
    'Content-Type': 'application/xml; charset=UTF-8',
  });

  res.end(data);
  return;
};

var resAsGZip = function resAsGZip(res, data) {
  // create read stream from text
  var s = new stream.Readable();
  s.push(data);
  s.push(null);

  res.writeHead(200, {
    'Content-Type': 'application/xml; charset=UTF-8',
    'Content-Encoding': 'gzip',
  });

  // pipe to zlib to compress data
  s.pipe(zlib.createGzip()).pipe(res);
};

WebApp.connectHandlers.use(function(req, res, next) {
  new Fiber(function() {
    "use strict";
    var out, pages, urls;

    urls = _.keys(sitemaps._list);
    if (!_.contains(urls, req.url))
      return next();

    pages = sitemaps._list[req.url];
    if (_.isFunction(pages))
      pages = pages(req);
    else if (!_.isArray(pages))
      throw new TypeError("sitemaps.add() expects an array or function");

    // The header is added later once we know which namespaces we need
    out = '';
    var namespaces = {};

    var w3cDateTimeTS, date;
    _.each(pages, function(page) {

      out += '  <url>\n'
        + '    <loc>' + prepareUrl(page.page) + '</loc>\n';

      if (page.lastmod) {
        date = new Date(page.lastmod);
        w3cDateTimeTS = date.getUTCFullYear() + '-'
          + (date.getUTCMonth()+1).lpad(2) + '-'
          + date.getUTCDate().lpad(2) + 'T'
          + date.getUTCHours().lpad(2) + ':'
          + date.getUTCMinutes().lpad(2) + ':'
          + date.getUTCSeconds().lpad(2) + '+00:00';
        out += '    <lastmod>' + w3cDateTimeTS + '</lastmod>\n';
      }

      if (page.changefreq)
        out += '    <changefreq>' + page.changefreq + '</changefreq>\n';

      if (page.priority)
        out += '    <priority>' + page.priority + '</priority>\n';

      if (page.xhtmlLinks) {
        namespaces.xhtml = true;
        if (!_.isArray(page.xhtmlLinks))
          page.xhtmlLinks = [page.xhtmlLinks];
        _.each(page.xhtmlLinks, function(link) {
          out += '    <xhtml:link \n';
          if (link.href)
            link.href = prepareUrl(link.href);
          for (var key in link)
            out += '      ' + key + '="' + link[key] + '"\n';
          out += '      />\n';
        });
      }

      _.each(['image', 'video'], function(tag) {
        var tagS = tag+'s';
        if (page[tagS]) {
          namespaces[tag] = true;
          if (!_.isArray(page[tagS]))
            page[tagS] = [page[tagS]];

          _.each(page[tagS], function(data) {
            out += '      <'+tag+':'+tag+'> \n';

            for (var key in data) {
              if (key == 'loc' || key.match(/_loc$/))
                data[key] = prepareUrl(data[key]);
              out += '        <'+tag+':'+key+'>' + data[key] + '</'+tag+':'+key+'>\n';
            }

            out += '      </'+tag+':'+tag+'> \n';
          });
        }
      });

      out  += '   </url>\n\n';
    });

    out += '</urlset>\n';

    // We do this last so we know which namesapces to add
    var header = '<?xml version="1.0" encoding="UTF-8"?>\n'
      + '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"';

    if (namespaces.xhtml)
      header += '\n  xmlns:xhtml="http://www.w3.org/1999/xhtml"';
    if (namespaces.image)
      header += '\n  xmlns:image="http://www.google.com/schemas/sitemap-image/1.1"';
    if (namespaces.video)
      header += '\n  xmlns:video="http://www.google.com/schemas/sitemap-video/1.1"';
    header += '>\n';

    out = header + out;

    // response as gzip
    if (sitemaps._config.gzip) {
      resAsGZip(res, out);
      return;
    }

    resAsXML(res, out);
    return;
  }).run();
});

sitemaps.add = function(url, func) {
  "use strict";
  check(url, String);
  if (url.charAt(0) !== '/')
    url = '/' + url;

  sitemaps._list[url] = func;
  robots.addLine('Sitemap: ' + prepareUrl(url));
};

/*
sitemaps.add('/sitemap.xml', function() {
  // 'page' is reqired
  // 'lastmod', 'changefreq', 'priority' are optional.
  return [
    { page: 'x', lastmod: new Date().getTime() },
    { page: 'y', lastmod: new Date().getTime(), changefreq: 'monthly' },
    { page: 'z', lastmod: new Date().getTime(), changefreq: 'monthly', priority: 0.8 }
  ];
});
*/

/////////////////////////////////////////////////////////////////////////////////////////

}).call(this);


/* Exports */
Package._define("gadicohen:sitemaps", {
  sitemaps: sitemaps
});

})();
