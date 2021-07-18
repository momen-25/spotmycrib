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
var Promise = Package.promise.Promise;

/* Package-scope variables */
var Security, arg, fieldNames;

var require = meteorInstall({"node_modules":{"meteor":{"ongoworks:security":{"lib":{"client":{"Security.js":function module(){

////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                //
// packages/ongoworks_security/lib/client/Security.js                                             //
//                                                                                                //
////////////////////////////////////////////////////////////////////////////////////////////////////
                                                                                                  //
// We only stub on the client to prevent errors if putting in common code
Security = {
  // the starting point of the chain
  permit: function permit() {
    return new Security.Rule();
  },
  can: function can() {
    return new Security.Check();
  },
  defineMethod: function securityDefineMethod(name) {
    // Check whether a rule with the given name already exists; can't overwrite
    if (Security.Rule.prototype[name]) {
      throw new Error('A security method with the name "' + name + '" has already been defined');
    }

    Security.Rule.prototype[name] = function () {
      return this;
    };
  }
};

Mongo.Collection.prototype.permit = function () {
  return Security.permit().collections(this);
};
////////////////////////////////////////////////////////////////////////////////////////////////////

},"Security.Rule.js":function module(){

////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                //
// packages/ongoworks_security/lib/client/Security.Rule.js                                        //
//                                                                                                //
////////////////////////////////////////////////////////////////////////////////////////////////////
                                                                                                  //
// We only stub on the client to prevent errors if putting in common code
Security.Rule = class {
  constructor(types) {}

  collections(collections) {
    return this;
  }

  allowInClientCode() {}

  allow() {
    return true;
  }

};
////////////////////////////////////////////////////////////////////////////////////////////////////

},"Security.Check.js":function module(){

////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                //
// packages/ongoworks_security/lib/client/Security.Check.js                                       //
//                                                                                                //
////////////////////////////////////////////////////////////////////////////////////////////////////
                                                                                                  //
// We only stub on the client to prevent errors if putting in common code
Security.Check = class {
  constructor() {}

  for() {
    return this;
  }

  insert() {
    return this;
  }

  update() {
    return this;
  }

  remove() {
    return this;
  }

  read() {
    return this;
  }

  download() {
    return this;
  }

  check() {
    return true;
  }

  throw() {}

};
////////////////////////////////////////////////////////////////////////////////////////////////////

}},"builtInRules.js":function module(){

////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                //
// packages/ongoworks_security/lib/builtInRules.js                                                //
//                                                                                                //
////////////////////////////////////////////////////////////////////////////////////////////////////
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

  allow() {
    return false;
  }

});
/*
 * Logged In
 */

Security.defineMethod("ifLoggedIn", {
  fetch: [],
  transform: null,

  allow(type, arg, userId) {
    return !!userId;
  }

});
/*
 * Specific User ID
 */

Security.defineMethod("ifHasUserId", {
  fetch: [],
  transform: null,

  allow(type, arg, userId) {
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

    allow(type, arg, userId) {
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

    allow(type, arg, userId) {
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

  allow(type, arg, userId, doc, fieldNames) {
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

  allow(type, arg, userId, doc, fieldNames) {
    if (!_.isArray(arg)) arg = [arg];
    fieldNames = fieldNames || _.keys(doc);
    return !_.any(fieldNames, function (fieldName) {
      return _.contains(arg, fieldName);
    });
  }

});
////////////////////////////////////////////////////////////////////////////////////////////////////

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
