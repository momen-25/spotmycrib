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
var Mongo = Package.mongo.Mongo;
var _ = Package.underscore._;
var LocalCollection = Package.minimongo.LocalCollection;
var Minimongo = Package.minimongo.Minimongo;
var Random = Package.random.Random;
var EJSON = Package.ejson.EJSON;
var meteorInstall = Package.modules.meteorInstall;
var meteorBabelHelpers = Package.modules.meteorBabelHelpers;
var Promise = Package.promise.Promise;
var Symbol = Package['ecmascript-runtime-client'].Symbol;
var Map = Package['ecmascript-runtime-client'].Map;
var Set = Package['ecmascript-runtime-client'].Set;

/* Package-scope variables */
var Security;

var require = meteorInstall({"node_modules":{"meteor":{"ongoworks:security":{"lib":{"client":{"Security.js":function module(){

//////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                  //
// packages/ongoworks_security/lib/client/Security.js                                               //
//                                                                                                  //
//////////////////////////////////////////////////////////////////////////////////////////////////////
                                                                                                    //
// We only stub on the client to prevent errors if putting in common code
Security = {
  // the starting point of the chain
  permit: function () {
    function permit() {
      return new Security.Rule();
    }

    return permit;
  }(),
  can: function () {
    function can() {
      return new Security.Check();
    }

    return can;
  }(),
  defineMethod: function () {
    function securityDefineMethod(name) {
      // Check whether a rule with the given name already exists; can't overwrite
      if (Security.Rule.prototype[name]) {
        throw new Error('A security method with the name "' + name + '" has already been defined');
      }

      Security.Rule.prototype[name] = function () {
        return this;
      };
    }

    return securityDefineMethod;
  }()
};

Mongo.Collection.prototype.permit = function () {
  return Security.permit().collections(this);
};
//////////////////////////////////////////////////////////////////////////////////////////////////////

},"Security.Rule.js":function module(){

//////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                  //
// packages/ongoworks_security/lib/client/Security.Rule.js                                          //
//                                                                                                  //
//////////////////////////////////////////////////////////////////////////////////////////////////////
                                                                                                    //
// We only stub on the client to prevent errors if putting in common code
Security.Rule = /*#__PURE__*/function () {
  function _class(types) {}

  var _proto = _class.prototype;

  _proto.collections = function () {
    function collections(_collections) {
      return this;
    }

    return collections;
  }();

  _proto.allowInClientCode = function () {
    function allowInClientCode() {}

    return allowInClientCode;
  }();

  _proto.allow = function () {
    function allow() {
      return true;
    }

    return allow;
  }();

  return _class;
}();
//////////////////////////////////////////////////////////////////////////////////////////////////////

},"Security.Check.js":function module(){

//////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                  //
// packages/ongoworks_security/lib/client/Security.Check.js                                         //
//                                                                                                  //
//////////////////////////////////////////////////////////////////////////////////////////////////////
                                                                                                    //
// We only stub on the client to prevent errors if putting in common code
Security.Check = /*#__PURE__*/function () {
  function _class() {}

  var _proto = _class.prototype;

  _proto.for = function () {
    function _for() {
      return this;
    }

    return _for;
  }();

  _proto.insert = function () {
    function insert() {
      return this;
    }

    return insert;
  }();

  _proto.update = function () {
    function update() {
      return this;
    }

    return update;
  }();

  _proto.remove = function () {
    function remove() {
      return this;
    }

    return remove;
  }();

  _proto.read = function () {
    function read() {
      return this;
    }

    return read;
  }();

  _proto.download = function () {
    function download() {
      return this;
    }

    return download;
  }();

  _proto.check = function () {
    function check() {
      return true;
    }

    return check;
  }();

  _proto.throw = function () {
    function _throw() {}

    return _throw;
  }();

  return _class;
}();
//////////////////////////////////////////////////////////////////////////////////////////////////////

}},"builtInRules.js":function module(){

//////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                  //
// packages/ongoworks_security/lib/builtInRules.js                                                  //
//                                                                                                  //
//////////////////////////////////////////////////////////////////////////////////////////////////////
                                                                                                    //
/*
 * This file defines built-in restriction methods
 */

/*
 * No one
 */
Security.defineMethod("never", {
  fetch: [],
  transform: null,
  allow: function () {
    return false;
  }
});
/*
 * Logged In
 */

Security.defineMethod("ifLoggedIn", {
  fetch: [],
  transform: null,
  allow: function (type, arg, userId) {
    return !!userId;
  }
});
/*
 * Specific User ID
 */

Security.defineMethod("ifHasUserId", {
  fetch: [],
  transform: null,
  allow: function (type, arg, userId) {
    return userId === arg;
  }
});
/*
 * Specific Roles
 */

/*
 * alanning:roles support
 */

if (Package && Package["alanning:roles"]) {
  var Roles = Package["alanning:roles"].Roles;
  Security.defineMethod("ifHasRole", {
    fetch: [],
    transform: null,
    allow: function (type, arg, userId) {
      if (!arg) throw new Error('ifHasRole security rule method requires an argument');

      if (arg.role) {
        return Roles.userIsInRole(userId, arg.role, arg.group);
      } else {
        return Roles.userIsInRole(userId, arg);
      }
    }
  });
}
/*
 * nicolaslopezj:roles support
 * Note: doesn't support groups
 */


if (Package && Package["nicolaslopezj:roles"]) {
  var Roles = Package["nicolaslopezj:roles"].Roles;
  Security.defineMethod("ifHasRole", {
    fetch: [],
    transform: null,
    allow: function (type, arg, userId) {
      if (!arg) throw new Error('ifHasRole security rule method requires an argument');
      return Roles.userHasRole(userId, arg);
    }
  });
}
/*
 * Specific Properties
 */


Security.defineMethod("onlyProps", {
  fetch: [],
  transform: null,
  allow: function (type, arg, userId, doc, fieldNames) {
    if (!_.isArray(arg)) arg = [arg];
    fieldNames = fieldNames || _.keys(doc);
    return _.every(fieldNames, function (fieldName) {
      return _.contains(arg, fieldName);
    });
  }
});
Security.defineMethod("exceptProps", {
  fetch: [],
  transform: null,
  allow: function (type, arg, userId, doc, fieldNames) {
    if (!_.isArray(arg)) arg = [arg];
    fieldNames = fieldNames || _.keys(doc);
    return !_.any(fieldNames, function (fieldName) {
      return _.contains(arg, fieldName);
    });
  }
});
//////////////////////////////////////////////////////////////////////////////////////////////////////

}}}}}},{
  "extensions": [
    ".js",
    ".json"
  ]
});

require("/node_modules/meteor/ongoworks:security/lib/client/Security.js");
require("/node_modules/meteor/ongoworks:security/lib/client/Security.Rule.js");
require("/node_modules/meteor/ongoworks:security/lib/client/Security.Check.js");
require("/node_modules/meteor/ongoworks:security/lib/builtInRules.js");

/* Exports */
Package._define("ongoworks:security", {
  Security: Security
});

})();
