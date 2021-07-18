(function () {

/* Imports */
var Meteor = Package.meteor.Meteor;
var global = Package.meteor.global;
var meteorEnv = Package.meteor.meteorEnv;
var ECMAScript = Package.ecmascript.ECMAScript;
var check = Package.check.check;
var Match = Package.check.Match;
var OAuth = Package.oauth.OAuth;
var Oauth = Package.oauth.Oauth;
var Hook = Package['callback-hook'].Hook;
var meteorInstall = Package.modules.meteorInstall;
var Promise = Package.promise.Promise;
var Accounts = Package['accounts-base'].Accounts;

var require = meteorInstall({"node_modules":{"meteor":{"bozhao:link-accounts":{"link_accounts_server.js":function module(require,exports,module){

///////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                           //
// packages/bozhao_link-accounts/link_accounts_server.js                                                     //
//                                                                                                           //
///////////////////////////////////////////////////////////////////////////////////////////////////////////////
                                                                                                             //
let _objectSpread;

module.link("@babel/runtime/helpers/objectSpread2", {
  default(v) {
    _objectSpread = v;
  }

}, 0);
let Meteor;
module.link("meteor/meteor", {
  Meteor(v) {
    Meteor = v;
  }

}, 0);
let Accounts;
module.link("meteor/accounts-base", {
  Accounts(v) {
    Accounts = v;
  }

}, 1);
let Mongo;
module.link("meteor/mongo", {
  Mongo(v) {
    Mongo = v;
  }

}, 2);
let check, Match;
module.link("meteor/check", {
  check(v) {
    check = v;
  },

  Match(v) {
    Match = v;
  }

}, 3);
let OAuth;
module.link("meteor/oauth", {
  OAuth(v) {
    OAuth = v;
  }

}, 4);
let Hook;
module.link("meteor/callback-hook", {
  Hook(v) {
    Hook = v;
  }

}, 5);

/**
 * Hooks definition and registration
 */
Accounts._onLink = new Hook({
  bindEnvironment: false,
  debugPrintExceptions: 'onLink callback'
});

Accounts.onLink = func => Accounts._onLink.register(func);

Accounts._beforeLink = new Hook({
  bindEnvironment: false,
  debugPrintExceptions: 'beforeLink callback'
});

Accounts.beforeLink = func => Accounts._beforeLink.register(func);

Accounts._onUnlink = new Hook({
  bindEnvironment: false,
  debugPrintExceptions: 'onUnlink callback'
});

Accounts.onUnlink = func => Accounts._onUnlink.register(func);

Accounts.registerLoginHandler(function (options) {
  if (!options.link) return undefined;
  check(options.link, {
    credentialToken: String,
    // When an error occurs while retrieving the access token, we store
    // the error in the pending credentials table, with a secret of
    // null. The client can call the login method with a secret of null
    // to retrieve the error.
    credentialSecret: Match.OneOf(null, String)
  });
  const result = OAuth.retrieveCredential(options.link.credentialToken, options.link.credentialSecret);

  if (!result) {
    return {
      type: 'link',
      error: new Meteor.Error(Accounts.LoginCancelledError.numericError, 'No matching link attempt found')
    };
  }

  if (result instanceof Error || result instanceof Meteor.Error) throw result;else return Accounts.LinkUserFromExternalService(result.serviceName, result.serviceData, result.options);
});
Meteor.methods({
  cordovaGoogle: function (serviceName, serviceData) {
    Accounts.LinkUserFromExternalService(serviceName, serviceData, {}); // passing empty object cause in any case it is not used
  }
});

Accounts.LinkUserFromExternalService = function (serviceName, serviceData, options) {
  options = _objectSpread({}, options); // We probably throw an error instead of call update or create here.

  if (!Meteor.userId()) return new Meteor.Error('You must be logged in to use LinkUserFromExternalService');

  if (serviceName === 'password' || serviceName === 'resume') {
    throw new Meteor.Error("Can't use LinkUserFromExternalService with internal service: " + serviceName);
  }

  if (!(serviceData.id || serviceData.userId)) {
    throw new Meteor.Error("'id' missing from service data for: " + serviceName);
  }

  const user = Meteor.user();

  if (!user) {
    return new Meteor.Error('User not found for LinkUserFromExternalService');
  }

  const checkExistingSelector = {};

  if (serviceData.userId) {
    serviceData.id = serviceData.userId;
    delete serviceData.userId;
  }

  checkExistingSelector['services.' + serviceName + '.id'] = serviceData.id;
  const existingUsers = Meteor.users.find(checkExistingSelector).fetch();

  if (existingUsers.length) {
    existingUsers.forEach(function (existingUser) {
      if (existingUser._id !== Meteor.userId()) {
        throw new Meteor.Error("Provided ".concat(serviceName, " account is already in use by other user"));
      }
    });
  } // we do not allow link another account from existing service.
  // TODO maybe we can override this?


  if (user.services && user.services[serviceName] && user.services[serviceName].id !== serviceData.id) {
    return new Meteor.Error('User can link only one account to service: ' + serviceName);
  } else {
    const setAttrs = {}; // Before link hook

    Accounts._beforeLink.each(callback => {
      // eslint-disable-next-line node/no-callback-literal
      callback({
        type: serviceName,
        serviceData,
        user,
        serviceOptions: options
      });
      return true;
    });

    Object.keys(serviceData).forEach(key => {
      setAttrs['services.' + serviceName + '.' + key] = serviceData[key];
    });
    const updated = Meteor.users.update(user._id, {
      $set: setAttrs
    });

    if (updated !== 1) {
      throw new Meteor.Error("Failed to link user ".concat(Meteor.userId(), " with ").concat(serviceName, " account"));
    } // On link hook


    Accounts._onLink.each(callback => {
      // eslint-disable-next-line node/no-callback-literal
      callback({
        type: serviceName,
        serviceData,
        user: Meteor.user(),
        serviceOptions: options
      });
      return true;
    });

    return {
      type: serviceName,
      userId: user._id
    };
  }
};

Accounts.unlinkService = function (userId, serviceName, cb) {
  check(userId, Match.OneOf(String, Mongo.ObjectID));

  if (typeof serviceName !== 'string') {
    throw new Meteor.Error('Service name must be string');
  }

  const user = Meteor.users.findOne({
    _id: userId
  });

  if (serviceName === 'resume' || serviceName === 'password') {
    throw new Meteor.Error('Internal services cannot be unlinked: ' + serviceName);
  }

  if (user.services[serviceName]) {
    const newServices = _objectSpread({}, user.services);

    delete newServices[serviceName];
    Meteor.users.update({
      _id: user._id
    }, {
      $set: {
        services: newServices
      }
    }, function (result) {
      if (cb && typeof cb === 'function') {
        cb(result);
      }
    }); // On unlink hook

    Accounts._onUnlink.each(callback => {
      // eslint-disable-next-line node/no-callback-literal
      callback({
        type: serviceName,
        user: Meteor.user()
      });
      return true;
    });
  } else {
    throw new Meteor.Error(500, 'no service');
  }
};
///////////////////////////////////////////////////////////////////////////////////////////////////////////////

},"node_modules":{"@babel":{"runtime":{"helpers":{"objectSpread2.js":function module(require,exports,module){

///////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                           //
// node_modules/meteor/bozhao_link-accounts/node_modules/@babel/runtime/helpers/objectSpread2.js             //
//                                                                                                           //
///////////////////////////////////////////////////////////////////////////////////////////////////////////////
                                                                                                             //
module.useNode();
///////////////////////////////////////////////////////////////////////////////////////////////////////////////

}}}}}}}}},{
  "extensions": [
    ".js",
    ".json",
    ".mjs"
  ]
});

var exports = require("/node_modules/meteor/bozhao:link-accounts/link_accounts_server.js");

/* Exports */
Package._define("bozhao:link-accounts", exports);

})();

//# sourceURL=meteor://💻app/packages/bozhao_link-accounts.js
//# sourceMappingURL=data:application/json;charset=utf8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm1ldGVvcjovL/CfkrthcHAvcGFja2FnZXMvYm96aGFvOmxpbmstYWNjb3VudHMvbGlua19hY2NvdW50c19zZXJ2ZXIuanMiXSwibmFtZXMiOlsiX29iamVjdFNwcmVhZCIsIm1vZHVsZSIsImxpbmsiLCJkZWZhdWx0IiwidiIsIk1ldGVvciIsIkFjY291bnRzIiwiTW9uZ28iLCJjaGVjayIsIk1hdGNoIiwiT0F1dGgiLCJIb29rIiwiX29uTGluayIsImJpbmRFbnZpcm9ubWVudCIsImRlYnVnUHJpbnRFeGNlcHRpb25zIiwib25MaW5rIiwiZnVuYyIsInJlZ2lzdGVyIiwiX2JlZm9yZUxpbmsiLCJiZWZvcmVMaW5rIiwiX29uVW5saW5rIiwib25VbmxpbmsiLCJyZWdpc3RlckxvZ2luSGFuZGxlciIsIm9wdGlvbnMiLCJ1bmRlZmluZWQiLCJjcmVkZW50aWFsVG9rZW4iLCJTdHJpbmciLCJjcmVkZW50aWFsU2VjcmV0IiwiT25lT2YiLCJyZXN1bHQiLCJyZXRyaWV2ZUNyZWRlbnRpYWwiLCJ0eXBlIiwiZXJyb3IiLCJFcnJvciIsIkxvZ2luQ2FuY2VsbGVkRXJyb3IiLCJudW1lcmljRXJyb3IiLCJMaW5rVXNlckZyb21FeHRlcm5hbFNlcnZpY2UiLCJzZXJ2aWNlTmFtZSIsInNlcnZpY2VEYXRhIiwibWV0aG9kcyIsImNvcmRvdmFHb29nbGUiLCJ1c2VySWQiLCJpZCIsInVzZXIiLCJjaGVja0V4aXN0aW5nU2VsZWN0b3IiLCJleGlzdGluZ1VzZXJzIiwidXNlcnMiLCJmaW5kIiwiZmV0Y2giLCJsZW5ndGgiLCJmb3JFYWNoIiwiZXhpc3RpbmdVc2VyIiwiX2lkIiwic2VydmljZXMiLCJzZXRBdHRycyIsImVhY2giLCJjYWxsYmFjayIsInNlcnZpY2VPcHRpb25zIiwiT2JqZWN0Iiwia2V5cyIsImtleSIsInVwZGF0ZWQiLCJ1cGRhdGUiLCIkc2V0IiwidW5saW5rU2VydmljZSIsImNiIiwiT2JqZWN0SUQiLCJmaW5kT25lIiwibmV3U2VydmljZXMiXSwi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Y2hCLFdBQWQsQ0FBSixFQUFnQztBQUM5QixVQUFNK0IsV0FBVyxxQkFBUXpCLElBQUksQ0FBQ1UsUUFBYixDQUFqQjs7QUFDQSxXQUFPZSxXQUFXLENBQUMvQixXQUFELENBQWxCO0FBQ0FoQyxVQUFNLENBQUN5QyxLQUFQLENBQWFnQixNQUFiLENBQW9CO0FBQUVWLFNBQUcsRUFBRVQsSUFBSSxDQUFDUztBQUFaLEtBQXBCLEVBQXVDO0FBQUVXLFVBQUksRUFBRTtBQUFFVixnQkFBUSxFQUFFZTtBQUFaO0FBQVIsS0FBdkMsRUFBNEUsVUFBVXZDLE1BQVYsRUFBa0I7QUFDNUYsVUFBSW9DLEVBQUUsSUFBSSxPQUFPQSxFQUFQLEtBQWMsVUFBeEIsRUFBb0M7QUFDbENBLFVBQUUsQ0FBQ3BDLE1BQUQsQ0FBRjtBQUNEO0FBQ0YsS0FKRCxFQUg4QixDQVE5Qjs7QUFDQXZCLFlBQVEsQ0FBQ2MsU0FBVCxDQUFtQm1DLElBQW5CLENBQXdCQyxRQUFRLElBQUk7QUFDbEM7QUFDQUEsY0FBUSxDQUFDO0FBQUV6QixZQUFJLEVBQUVNLFdBQVI7QUFBcUJNLFlBQUksRUFBRXRDLE1BQU0sQ0FBQ3NDLElBQVA7QUFBM0IsT0FBRCxDQUFSO0FBQ0EsYUFBTyxJQUFQO0FBQ0QsS0FKRDtBQUtELEdBZEQsTUFjTztBQUNMLFVBQU0sSUFBSXRDLE1BQU0sQ0FBQzRCLEtBQVgsQ0FBaUIsR0FBakIsRUFBc0IsWUFBdEIsQ0FBTjtBQUNEO0FBQ0YsQ0EzQkQsQyIsImZpbGUiOiIvcGFja2FnZXMvYm96aGFvX2xpbmstYWNjb3VudHMuanMiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgeyBNZXRlb3IgfSBmcm9tICdtZXRlb3IvbWV0ZW9yJ1xuaW1wb3J0IHsgQWNjb3VudHMgfSBmcm9tICdtZXRlb3IvYWNjb3VudHMtYmFzZSdcbmltcG9ydCB7IE1vbmdvIH0gZnJvbSAnbWV0ZW9yL21vbmdvJ1xuaW1wb3J0IHsgY2hlY2ssIE1hdGNoIH0gZnJvbSAnbWV0ZW9yL2NoZWNrJ1xuaW1wb3J0IHsgT0F1dGggfSBmcm9tICdtZXRlb3Ivb2F1dGgnXG5pbXBvcnQgeyBIb29rIH0gZnJvbSAnbWV0ZW9yL2NhbGxiYWNrLWhvb2snXG5cbi8qKlxuICogSG9va3MgZGVmaW5pdGlvbiBhbmQgcmVnaXN0cmF0aW9uXG4gKi9cbkFjY291bnRzLl9vbkxpbmsgPSBuZXcgSG9vayh7XG4gIGJpbmRFbnZpcm9ubWVudDogZmFsc2UsXG4gIGRlYnVnUHJpbnRFeGNlcHRpb25zOiAnb25MaW5rIGNhbGxiYWNrJ1xufSlcbkFjY291bnRzLm9uTGluayA9IChmdW5jKSA9PiBBY2NvdW50cy5fb25MaW5rLnJlZ2lzdGVyKGZ1bmMpXG5cbkFjY291bnRzLl9iZWZvcmVMaW5rID0gbmV3IEhvb2soe1xuICBiaW5kRW52aXJvbm1lbnQ6IGZhbHNlLFxuICBkZWJ1Z1ByaW50RXhjZXB0aW9uczogJ2JlZm9yZUxpbmsgY2FsbGJhY2snXG59KVxuQWNjb3VudHMuYmVmb3JlTGluayA9IChmdW5jKSA9PiBBY2NvdW50cy5fYmVmb3JlTGluay5yZWdpc3RlcihmdW5jKVxuXG5BY2NvdW50cy5fb25VbmxpbmsgPSBuZXcgSG9vayh7XG4gIGJpbmRFbnZpcm9ubWVudDogZmFsc2UsXG4gIGRlYnVnUHJpbnRFeGNlcHRpb25zOiAnb25VbmxpbmsgY2FsbGJhY2snXG59KVxuQWNjb3VudHMub25VbmxpbmsgPSAoZnVuYykgPT4gQWNjb3VudHMuX29uVW5saW5rLnJlZ2lzdGVyKGZ1bmMpXG5cbkFjY291bnRzLnJlZ2lzdGVyTG9naW5IYW5kbGVyKGZ1bmN0aW9uIChvcHRpb25zKSB7XG4gIGlmICghb3B0aW9ucy5saW5rKSByZXR1cm4gdW5kZWZpbmVkXG5cbiAgY2hlY2sob3B0aW9ucy5saW5rLCB7XG4gICAgY3JlZGVudGlhbFRva2VuOiBTdHJpbmcsXG4gICAgLy8gV2hlbiBhbiBlcnJvciBvY2N1cnMgd2hpbGUgcmV0cmlldmluZyB0aGUgYWNjZXNzIHRva2VuLCB3ZSBzdG9yZVxuICAgIC8vIHRoZSBlcnJvciBpbiB0aGUgcGVuZGluZyBjcmVkZW50aWFscyB0YWJsZSwgd2l0aCBhIHNlY3JldCBvZlxuICAgIC8vIG51bGwuIFRoZSBjbGllbnQgY2FuIGNhbGwgdGhlIGxvZ2luIG1ldGhvZCB3aXRoIGEgc2VjcmV0IG9mIG51bGxcbiAgICAvLyB0byByZXRyaWV2ZSB0aGUgZXJyb3IuXG4gICAgY3JlZGVudGlhbFNlY3JldDogTWF0Y2guT25lT2YobnVsbCwgU3RyaW5nKVxuICB9KVxuXG4gIGNvbnN0IHJlc3VsdCA9IE9BdXRoLnJldHJpZXZlQ3JlZGVudGlhbChvcHRpb25zLmxpbmsuY3JlZGVudGlhbFRva2VuLCBvcHRpb25zLmxpbmsuY3JlZGVudGlhbFNlY3JldClcbiAgaWYgKCFyZXN1bHQpIHtcbiAgICByZXR1cm4ge1xuICAgICAgdHlwZTogJ2xpbmsnLFxuICAgICAgZXJyb3I6IG5ldyBNZXRlb3IuRXJyb3IoQWNjb3VudHMuTG9naW5DYW5jZWxsZWRFcnJvci5udW1lcmljRXJyb3IsICdObyBtYXRjaGluZyBsaW5rIGF0dGVtcHQgZm91bmQnKVxuICAgIH1cbiAgfVxuXG4gIGlmIChyZXN1bHQgaW5zdGFuY2VvZiBFcnJvciB8fCByZXN1bHQgaW5zdGFuY2VvZiBNZXRlb3IuRXJyb3IpIHRocm93IHJlc3VsdFxuICBlbHNlIHJldHVybiBBY2NvdW50cy5MaW5rVXNlckZyb21FeHRlcm5hbFNlcnZpY2UocmVzdWx0LnNlcnZpY2VOYW1lLCByZXN1bHQuc2VydmljZURhdGEsIHJlc3VsdC5vcHRpb25zKVxufSlcblxuTWV0ZW9yLm1ldGhvZHMoe1xuICBjb3Jkb3ZhR29vZ2xlOiBmdW5jdGlvbiAoc2VydmljZU5hbWUsIHNlcnZpY2VEYXRhKSB7XG4gICAgQWNjb3VudHMuTGlua1VzZXJGcm9tRXh0ZXJuYWxTZXJ2aWNlKHNlcnZpY2VOYW1lLCBzZXJ2aWNlRGF0YSwge30pIC8vIHBhc3NpbmcgZW1wdHkgb2JqZWN0IGNhdXNlIGluIGFueSBjYXNlIGl0IGlzIG5vdCB1c2VkXG4gIH1cbn0pXG5cbkFjY291bnRzLkxpbmtVc2VyRnJvbUV4dGVybmFsU2VydmljZSA9IGZ1bmN0aW9uIChzZXJ2aWNlTmFtZSwgc2VydmljZURhdGEsIG9wdGlvbnMpIHtcbiAgb3B0aW9ucyA9IHsgLi4ub3B0aW9ucyB9XG5cbiAgLy8gV2UgcHJvYmFibHkgdGhyb3cgYW4gZXJyb3IgaW5zdGVhZCBvZiBjYWxsIHVwZGF0ZSBvciBjcmVhdGUgaGVyZS5cbiAgaWYgKCFNZXRlb3IudXNlcklkKCkpIHJldHVybiBuZXcgTWV0ZW9yLkVycm9yKCdZb3UgbXVzdCBiZSBsb2dnZWQgaW4gdG8gdXNlIExpbmtVc2VyRnJvbUV4dGVybmFsU2VydmljZScpXG5cbiAgaWYgKHNlcnZpY2VOYW1lID09PSAncGFzc3dvcmQnIHx8IHNlcnZpY2VOYW1lID09PSAncmVzdW1lJykgeyB0aHJvdyBuZXcgTWV0ZW9yLkVycm9yKFwiQ2FuJ3QgdXNlIExpbmtVc2VyRnJvbUV4dGVybmFsU2VydmljZSB3aXRoIGludGVybmFsIHNlcnZpY2U6IFwiICsgc2VydmljZU5hbWUpIH1cbiAgaWYgKCEoc2VydmljZURhdGEuaWQgfHwgc2VydmljZURhdGEudXNlcklkKSkgeyB0aHJvdyBuZXcgTWV0ZW9yLkVycm9yKFwiJ2lkJyBtaXNzaW5nIGZyb20gc2VydmljZSBkYXRhIGZvcjogXCIgKyBzZXJ2aWNlTmFtZSkgfVxuXG4gIGNvbnN0IHVzZXIgPSBNZXRlb3IudXNlcigpXG5cbiAgaWYgKCF1c2VyKSB7XG4gICAgcmV0dXJuIG5ldyBNZXRlb3IuRXJyb3IoJ1VzZXIgbm90IGZvdW5kIGZvciBMaW5rVXNlckZyb21FeHRlcm5hbFNlcnZpY2UnKVxuICB9XG4gIGNvbnN0IGNoZWNrRXhpc3RpbmdTZWxlY3RvciA9IHt9XG4gIGlmIChzZXJ2aWNlRGF0YS51c2VySWQpIHtcbiAgICBzZXJ2aWNlRGF0YS5pZCA9IHNlcnZpY2VEYXRhLnVzZXJJZFxuICAgIGRlbGV0ZSBzZXJ2aWNlRGF0YS51c2VySWRcbiAgfVxuICBjaGVja0V4aXN0aW5nU2VsZWN0b3JbJ3NlcnZpY2VzLicgKyBzZXJ2aWNlTmFtZSArICcuaWQnXSA9IHNlcnZpY2VEYXRhLmlkXG5cbiAgY29uc3QgZXhpc3RpbmdVc2VycyA9IE1ldGVvci51c2Vycy5maW5kKGNoZWNrRXhpc3RpbmdTZWxlY3RvcikuZmV0Y2goKVxuICBpZiAoZXhpc3RpbmdVc2Vycy5sZW5ndGgpIHtcbiAgICBleGlzdGluZ1VzZXJzLmZvckVhY2goZnVuY3Rpb24gKGV4aXN0aW5nVXNlcikge1xuICAgICAgaWYgKGV4aXN0aW5nVXNlci5faWQgIT09IE1ldGVvci51c2VySWQoKSkgeyB0aHJvdyBuZXcgTWV0ZW9yLkVycm9yKGBQcm92aWRlZCAke3NlcnZpY2VOYW1lfSBhY2NvdW50IGlzIGFscmVhZHkgaW4gdXNlIGJ5IG90aGVyIHVzZXJgKSB9XG4gICAgfSlcbiAgfVxuXG4gIC8vIHdlIGRvIG5vdCBhbGxvdyBsaW5rIGFub3RoZXIgYWNjb3VudCBmcm9tIGV4aXN0aW5nIHNlcnZpY2UuXG4gIC8vIFRPRE8gbWF5YmUgd2UgY2FuIG92ZXJyaWRlIHRoaXM/XG4gIGlmICh1c2VyLnNlcnZpY2VzICYmIHVzZXIuc2VydmljZXNbc2VydmljZU5hbWVdICYmIHVzZXIuc2VydmljZXNbc2VydmljZU5hbWVdLmlkICE9PSBzZXJ2aWNlRGF0YS5pZCkge1xuICAgIHJldHVybiBuZXcgTWV0ZW9yLkVycm9yKCdVc2VyIGNhbiBsaW5rIG9ubHkgb25lIGFjY291bnQgdG8gc2VydmljZTogJyArIHNlcnZpY2VOYW1lKVxuICB9IGVsc2Uge1xuICAgIGNvbnN0IHNldEF0dHJzID0ge31cblxuICAgIC8vIEJlZm9yZSBsaW5rIGhvb2tcbiAgICBBY2NvdW50cy5fYmVmb3JlTGluay5lYWNoKGNhbGxiYWNrID0+IHtcbiAgICAgIC8vIGVzbGludC1kaXNhYmxlLW5leHQtbGluZSBub2RlL25vLWNhbGxiYWNrLWxpdGVyYWxcbiAgICAgIGNhbGxiYWNrKHsgdHlwZTogc2VydmljZU5hbWUsIHNlcnZpY2VEYXRhLCB1c2VyLCBzZXJ2aWNlT3B0aW9uczogb3B0aW9ucyB9KVxuICAgICAgcmV0dXJuIHRydWVcbiAgICB9KVxuXG4gICAgT2JqZWN0LmtleXMoc2VydmljZURhdGEpLmZvckVhY2goa2V5ID0+IHtcbiAgICAgIHNldEF0dHJzWydzZXJ2aWNlcy4nICsgc2VydmljZU5hbWUgKyAnLicgKyBrZXldID0gc2VydmljZURhdGFba2V5XVxuICAgIH0pXG5cbiAgICBjb25zdCB1cGRhdGVkID0gTWV0ZW9yLnVzZXJzLnVwZGF0ZSh1c2VyLl9pZCwgeyAkc2V0OiBzZXRBdHRycyB9KVxuICAgIGlmICh1cGRhdGVkICE9PSAxKSB7IHRocm93IG5ldyBNZXRlb3IuRXJyb3IoYEZhaWxlZCB0byBsaW5rIHVzZXIgJHtNZXRlb3IudXNlcklkKCl9IHdpdGggJHtzZXJ2aWNlTmFtZX0gYWNjb3VudGApIH1cblxuICAgIC8vIE9uIGxpbmsgaG9va1xuICAgIEFjY291bnRzLl9vbkxpbmsuZWFjaChjYWxsYmFjayA9PiB7XG4gICAgICAvLyBlc2xpbnQtZGlzYWJsZS1uZXh0LWxpbmUgbm9kZS9uby1jYWxsYmFjay1saXRlcmFsXG4gICAgICBjYWxsYmFjayh7IHR5cGU6IHNlcnZpY2VOYW1lLCBzZXJ2aWNlRGF0YSwgdXNlcjogTWV0ZW9yLnVzZXIoKSwgc2VydmljZU9wdGlvbnM6IG9wdGlvbnMgfSlcbiAgICAgIHJldHVybiB0cnVlXG4gICAgfSlcblxuICAgIHJldHVybiB7XG4gICAgICB0eXBlOiBzZXJ2aWNlTmFtZSxcbiAgICAgIHVzZXJJZDogdXNlci5faWRcbiAgICB9XG4gIH1cbn1cblxuQWNjb3VudHMudW5saW5rU2VydmljZSA9IGZ1bmN0aW9uICh1c2VySWQsIHNlcnZpY2VOYW1lLCBjYikge1xuICBjaGVjayh1c2VySWQsIE1hdGNoLk9uZU9mKFN0cmluZywgTW9uZ28uT2JqZWN0SUQpKVxuICBpZiAodHlwZW9mIHNlcnZpY2VOYW1lICE9PSAnc3RyaW5nJykge1xuICAgIHRocm93IG5ldyBNZXRlb3IuRXJyb3IoJ1NlcnZpY2UgbmFtZSBtdXN0IGJlIHN0cmluZycpXG4gIH1cbiAgY29uc3QgdXNlciA9IE1ldGVvci51c2Vycy5maW5kT25lKHsgX2lkOiB1c2VySWQgfSlcbiAgaWYgKHNlcnZpY2VOYW1lID09PSAncmVzdW1lJyB8fCBzZXJ2aWNlTmFtZSA9PT0gJ3Bhc3N3b3JkJykge1xuICAgIHRocm93IG5ldyBNZXRlb3IuRXJyb3IoJ0ludGVybmFsIHNlcnZpY2VzIGNhbm5vdCBiZSB1bmxpbmtlZDogJyArIHNlcnZpY2VOYW1lKVxuICB9XG5cbiAgaWYgKHVzZXIuc2VydmljZXNbc2VydmljZU5hbWVdKSB7XG4gICAgY29uc3QgbmV3U2VydmljZXMgPSB7IC4uLnVzZXIuc2VydmljZXMgfVxuICAgIGRlbGV0ZSBuZXdTZXJ2aWNlc1tzZXJ2aWNlTmFtZV1cbiAgICBNZXRlb3IudXNlcnMudXBkYXRlKHsgX2lkOiB1c2VyLl9pZCB9LCB7ICRzZXQ6IHsgc2VydmljZXM6IG5ld1NlcnZpY2VzIH0gfSwgZnVuY3Rpb24gKHJlc3VsdCkge1xuICAgICAgaWYgKGNiICYmIHR5cGVvZiBjYiA9PT0gJ2Z1bmN0aW9uJykge1xuICAgICAgICBjYihyZXN1bHQpXG4gICAgICB9XG4gICAgfSlcbiAgICAvLyBPbiB1bmxpbmsgaG9va1xuICAgIEFjY291bnRzLl9vblVubGluay5lYWNoKGNhbGxiYWNrID0+IHtcbiAgICAgIC8vIGVzbGludC1kaXNhYmxlLW5leHQtbGluZSBub2RlL25vLWNhbGxiYWNrLWxpdGVyYWxcbiAgICAgIGNhbGxiYWNrKHsgdHlwZTogc2VydmljZU5hbWUsIHVzZXI6IE1ldGVvci51c2VyKCkgfSlcbiAgICAgIHJldHVybiB0cnVlXG4gICAgfSlcbiAgfSBlbHNlIHtcbiAgICB0aHJvdyBuZXcgTWV0ZW9yLkVycm9yKDUwMCwgJ25vIHNlcnZpY2UnKVxuICB9XG59XG4iXX0=
