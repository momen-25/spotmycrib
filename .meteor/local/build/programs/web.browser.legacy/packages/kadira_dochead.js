//////////////////////////////////////////////////////////////////////////
//                                                                      //
// This is a generated file. You can view the original                  //
// source in your browser if your browser supports source maps.         //
// Source maps are supported by all recent versions of Chrome, Safari,  //
// and Firefox, and by Internet Explorer 11.                            //
//                                                                      //
//////////////////////////////////////////////////////////////////////////


(function () {

/* Imports */
var Meteor = Package.meteor.Meteor;
var global = Package.meteor.global;
var meteorEnv = Package.meteor.meteorEnv;
var Tracker = Package.tracker.Tracker;
var Deps = Package.tracker.Deps;
var meteorInstall = Package.modules.meteorInstall;
var meteorBabelHelpers = Package.modules.meteorBabelHelpers;
var Promise = Package.promise.Promise;
var Symbol = Package['ecmascript-runtime-client'].Symbol;
var Map = Package['ecmascript-runtime-client'].Map;
var Set = Package['ecmascript-runtime-client'].Set;

/* Package-scope variables */
var npmLoadScript, DocHead;

var require = meteorInstall({"node_modules":{"meteor":{"kadira:dochead":{"main.js":function module(require){

///////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                           //
// packages/kadira_dochead/main.js                                                                           //
//                                                                                                           //
///////////////////////////////////////////////////////////////////////////////////////////////////////////////
                                                                                                             //
npmLoadScript = require('load-script');
///////////////////////////////////////////////////////////////////////////////////////////////////////////////

},"lib":{"both.js":function module(require,exports,module){

///////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                           //
// packages/kadira_dochead/lib/both.js                                                                       //
//                                                                                                           //
///////////////////////////////////////////////////////////////////////////////////////////////////////////////
                                                                                                             //
var _createForOfIteratorHelperLoose;

module.link("@babel/runtime/helpers/createForOfIteratorHelperLoose", {
  default: function (v) {
    _createForOfIteratorHelperLoose = v;
  }
}, 0);
var FlowRouter = null;

if (Package['jns:flow-router-ssr']) {
  FlowRouter = Package['jns:flow-router-ssr'].FlowRouter;
}

if (Meteor.isClient) {
  var titleDependency = new Tracker.Dependency();
}

DocHead = {
  currentTitle: null,
  setTitle: function (title) {
    if (Meteor.isClient) {
      titleDependency.changed();
      document.title = title;
    } else {
      this.currentTitle = title;
      var titleHtml = "<title>" + title + "</title>";

      this._addToHead(titleHtml);
    }
  },
  addMeta: function (info) {
    this._addTag(info, 'meta');
  },
  addLink: function (info) {
    this._addTag(info, 'link');
  },
  getTitle: function () {
    if (Meteor.isClient) {
      titleDependency.depend();
      return document.title;
    }

    return this.currentTitle;
  },
  addLdJsonScript: function (jsonObj) {
    var strObj = JSON.stringify(jsonObj);

    this._addLdJsonScript(strObj);
  },
  loadScript: function (url, options, callback) {
    if (Meteor.isClient) {
      npmLoadScript(url, options, callback);
    }
  },
  _addTag: function (info, tag) {
    var meta = this._buildTag(info, tag);

    if (Meteor.isClient) {
      document.getElementsByTagName('head')[0].insertAdjacentHTML('beforeend', meta);
    } else {
      this._addToHead(meta);
    }
  },
  _addToHead: function (html) {
    // only work there is jns:flow-router-ssr
    if (!FlowRouter) {
      return;
    }

    var ssrContext = FlowRouter.ssrContext.get();

    if (ssrContext) {
      ssrContext.addToHead(html);
    }
  },
  _buildTag: function (metaInfo, type) {
    var props = "";

    for (var key in meteorBabelHelpers.sanitizeForInObject(metaInfo)) {
      props += key + "=\"" + metaInfo[key] + "\" ";
    }

    props += 'dochead="1"';
    var meta = "<" + type + " " + props + "/>";
    return meta;
  },
  _addLdJsonScript: function (stringifiedObject) {
    var scriptTag = "<script type=\"application/ld+json\" dochead=\"1\">" + stringifiedObject + "</script>";

    if (Meteor.isClient) {
      document.getElementsByTagName('head')[0].insertAdjacentHTML('beforeend', scriptTag);
    } else {
      this._addToHead(scriptTag);
    }
  },
  removeDocHeadAddedTags: function () {
    if (Meteor.isClient) {
      var elements = document.querySelectorAll('[dochead="1"]'); // We use for-of here to loop only over iterable objects

      for (var _iterator = _createForOfIteratorHelperLoose(elements), _step; !(_step = _iterator()).done;) {
        var element = _step.value;
        element.parentNode.removeChild(element);
      }
    }
  }
};
///////////////////////////////////////////////////////////////////////////////////////////////////////////////

},"flow_router.js":function module(){

///////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                           //
// packages/kadira_dochead/lib/flow_router.js                                                                //
//                                                                                                           //
///////////////////////////////////////////////////////////////////////////////////////////////////////////////
                                                                                                             //
if (Package['jns:flow-router-ssr']) {
  var FlowRouter = Package['jns:flow-router-ssr'].FlowRouter; // remove added tags when changing routes

  FlowRouter.triggers.enter(function () {
    Meteor.startup(DocHead.removeDocHeadAddedTags);
  });
}
///////////////////////////////////////////////////////////////////////////////////////////////////////////////

}},"node_modules":{"load-script":{"package.json":function module(require,exports,module){

///////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                           //
// node_modules/meteor/kadira_dochead/node_modules/load-script/package.json                                  //
//                                                                                                           //
///////////////////////////////////////////////////////////////////////////////////////////////////////////////
                                                                                                             //
module.exports = {
  "name": "load-script",
  "version": "1.0.0"
};

///////////////////////////////////////////////////////////////////////////////////////////////////////////////

},"index.js":function module(require,exports,module){

///////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                           //
// node_modules/meteor/kadira_dochead/node_modules/load-script/index.js                                      //
//                                                                                                           //
///////////////////////////////////////////////////////////////////////////////////////////////////////////////
                                                                                                             //

module.exports = function load (src, opts, cb) {
  var head = document.head || document.getElementsByTagName('head')[0]
  var script = document.createElement('script')

  if (typeof opts === 'function') {
    cb = opts
    opts = {}
  }

  opts = opts || {}
  cb = cb || function() {}

  script.type = opts.type || 'text/javascript'
  script.charset = opts.charset || 'utf8';
  script.async = 'async' in opts ? !!opts.async : true
  script.src = src

  if (opts.attrs) {
    setAttributes(script, opts.attrs)
  }

  if (opts.text) {
    script.text = '' + opts.text
  }

  var onend = 'onload' in script ? stdOnEnd : ieOnEnd
  onend(script, cb)

  // some good legacy browsers (firefox) fail the 'in' detection above
  // so as a fallback we always set onload
  // old IE will ignore this and new IE will set onload
  if (!script.onload) {
    stdOnEnd(script, cb);
  }

  head.appendChild(script)
}

function setAttributes(script, attrs) {
  for (var attr in attrs) {
    script.setAttribute(attr, attrs[attr]);
  }
}

function stdOnEnd (script, cb) {
  script.onload = function () {
    this.onerror = this.onload = null
    cb(null, script)
  }
  script.onerror = function () {
    // this.onload = null here is necessary
    // because even IE9 works not like others
    this.onerror = this.onload = null
    cb(new Error('Failed to load ' + this.src), script)
  }
}

function ieOnEnd (script, cb) {
  script.onreadystatechange = function () {
    if (this.readyState != 'complete' && this.readyState != 'loaded') return
    this.onreadystatechange = null
    cb(null, script) // there is no way to catch loading errors in IE8
  }
}

///////////////////////////////////////////////////////////////////////////////////////////////////////////////

}}}}}}},{
  "extensions": [
    ".js",
    ".json"
  ]
});

require("/node_modules/meteor/kadira:dochead/main.js");
require("/node_modules/meteor/kadira:dochead/lib/both.js");
require("/node_modules/meteor/kadira:dochead/lib/flow_router.js");

/* Exports */
Package._define("kadira:dochead", {
  DocHead: DocHead
});

})();
