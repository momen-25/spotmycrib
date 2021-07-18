(function () {

/* Imports */
var Meteor = Package.meteor.Meteor;
var global = Package.meteor.global;
var meteorEnv = Package.meteor.meteorEnv;
var ECMAScript = Package.ecmascript.ECMAScript;
var OAuth = Package.oauth.OAuth;
var Oauth = Package.oauth.Oauth;
var HTTP = Package.http.HTTP;
var HTTPInternals = Package.http.HTTPInternals;
var ServiceConfiguration = Package['service-configuration'].ServiceConfiguration;
var meteorInstall = Package.modules.meteorInstall;
var Promise = Package.promise.Promise;

/* Package-scope variables */
var Facebook;

var require = meteorInstall({"node_modules":{"meteor":{"facebook-oauth":{"facebook_server.js":function module(require,exports,module){

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                             //
// packages/facebook-oauth/facebook_server.js                                                                  //
//                                                                                                             //
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                                                                                                               //
let _objectSpread;

module.link("@babel/runtime/helpers/objectSpread2", {
  default(v) {
    _objectSpread = v;
  }

}, 0);
let crypto;
module.link("crypto", {
  default(v) {
    crypto = v;
  }

}, 0);
Facebook = {};

Facebook.handleAuthFromAccessToken = (accessToken, expiresAt) => {
  // include basic fields from facebook
  // https://developers.facebook.com/docs/facebook-login/permissions/
  const whitelisted = ['id', 'email', 'name', 'first_name', 'last_name', 'middle_name', 'name_format', 'picture', 'short_name'];
  const identity = getIdentity(accessToken, whitelisted);
  const fields = {};
  whitelisted.forEach(field => fields[field] = identity[field]);

  const serviceData = _objectSpread({
    accessToken,
    expiresAt
  }, fields);

  return {
    serviceData,
    options: {
      profile: {
        name: identity.name
      }
    }
  };
};

OAuth.registerService('facebook', 2, null, query => {
  const response = getTokenResponse(query);
  const {
    accessToken
  } = response;
  const {
    expiresIn
  } = response;
  return Facebook.handleAuthFromAccessToken(accessToken, +new Date() + 1000 * expiresIn);
});

function getAbsoluteUrlOptions(query) {
  var _Meteor$settings, _Meteor$settings$pack, _Meteor$settings$pack2;

  const overrideRootUrlFromStateRedirectUrl = (_Meteor$settings = Meteor.settings) === null || _Meteor$settings === void 0 ? void 0 : (_Meteor$settings$pack = _Meteor$settings.packages) === null || _Meteor$settings$pack === void 0 ? void 0 : (_Meteor$settings$pack2 = _Meteor$settings$pack['facebook-oauth']) === null || _Meteor$settings$pack2 === void 0 ? void 0 : _Meteor$settings$pack2.overrideRootUrlFromStateRedirectUrl;

  if (!overrideRootUrlFromStateRedirectUrl) {
    return undefined;
  }

  try {
    const state = OAuth._stateFromQuery(query) || {};
    const redirectUrl = new URL(state.redirectUrl);
    return {
      rootUrl: redirectUrl.origin
    };
  } catch (e) {
    console.error("Failed to complete OAuth handshake with Facebook because it was not able to obtain the redirect url from the state and you are using overrideRootUrlFromStateRedirectUrl.", e);
    return undefined;
  }
} // returns an object containing:
// - accessToken
// - expiresIn: lifetime of token in seconds


const getTokenResponse = query => {
  const config = ServiceConfiguration.configurations.findOne({
    service: 'facebook'
  });
  if (!config) throw new ServiceConfiguration.ConfigError();
  let responseContent;

  try {
    const absoluteUrlOptions = getAbsoluteUrlOptions(query);

    const redirectUri = OAuth._redirectUri('facebook', config, undefined, absoluteUrlOptions); // Request an access token


    responseContent = HTTP.get("https://graph.facebook.com/v8.0/oauth/access_token", {
      params: {
        client_id: config.appId,
        redirect_uri: redirectUri,
        client_secret: OAuth.openSecret(config.secret),
        code: query.code
      }
    }).data;
  } catch (err) {
    throw Object.assign(new Error("Failed to complete OAuth handshake with Facebook. ".concat(err.message)), {
      response: err.response
    });
  }

  const fbAccessToken = responseContent.access_token;
  const fbExpires = responseContent.expires_in;

  if (!fbAccessToken) {
    throw new Error("Failed to complete OAuth handshake with facebook " + "-- can't find access token in HTTP response. ".concat(responseContent));
  }

  return {
    accessToken: fbAccessToken,
    expiresIn: fbExpires
  };
};

const getIdentity = (accessToken, fields) => {
  const config = ServiceConfiguration.configurations.findOne({
    service: 'facebook'
  });
  if (!config) throw new ServiceConfiguration.ConfigError(); // Generate app secret proof that is a sha256 hash of the app access token, with the app secret as the key
  // https://developers.facebook.com/docs/graph-api/securing-requests#appsecret_proof

  const hmac = crypto.createHmac('sha256', OAuth.openSecret(config.secret));
  hmac.update(accessToken);

  try {
    return HTTP.get("https://graph.facebook.com/v8.0/me", {
      params: {
        access_token: accessToken,
        appsecret_proof: hmac.digest('hex'),
        fields: fields.join(",")
      }
    }).data;
  } catch (err) {
    throw Object.assign(new Error("Failed to fetch identity from Facebook. ".concat(err.message)), {
      response: err.response
    });
  }
};

Facebook.retrieveCredential = (credentialToken, credentialSecret) => OAuth.retrieveCredential(credentialToken, credentialSecret);
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////

}}}}},{
  "extensions": [
    ".js",
    ".json"
  ]
});

require("/node_modules/meteor/facebook-oauth/facebook_server.js");

/* Exports */
Package._define("facebook-oauth", {
  Facebook: Facebook
});

})();

//# sourceURL=meteor://💻app/packages/facebook-oauth.js
//# sourceMappingURL=data:application/json;charset=utf8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm1ldGVvcjovL/CfkrthcHAvcGFja2FnZXMvZmFjZWJvb2stb2F1dGgvZmFjZWJvb2tfc2VydmVyLmpzIl0sIm5hbWVzIjpbIl9vYmplY3RTcHJlYWQiLCJtb2R1bGUiLCJsaW5rIiwiZGVmYXVsdCIsInYiLCJjcnlwdG8iLCJGYWNlYm9vayIsImhhbmRsZUF1dGhGcm9tQWNjZXNzVG9rZW4iLCJhY2Nlc3NUb2tlbiIsImV4cGlyZXNBdCIsIndoaXRlbGlzdGVkIiwiaWRlbnRpdHkiLCJnZXRJZGVudGl0eSIsImZpZWxkcyIsImZvckVhY2giLCJmaWVsZCIsInNlcnZpY2VEYXRhIiwib3B0aW9ucyIsInByb2ZpbGUiLCJuYW1lIiwiT0F1dGgiLCJyZWdpc3RlclNlcnZpY2UiLCJxdWVyeSIsInJlc3BvbnNlIiwiZ2V0VG9rZW5SZXNwb25zZSIsImV4cGlyZXNJbiIsIkRhdGUiLCJnZXRBYnNvbHV0ZVVybE9wdGlvbnMiLCJvdmVycmlkZVJvb3RVcmxGcm9tU3RhdGVSZWRpcmVjdFVybCIsIk1ldGVvciIsInNldHRpbmdzIiwicGFja2FnZXMiLCJ1bmRlZmluZWQiLCJzdGF0ZSIsIl9zdGF0ZUZyb21RdWVyeSIsInJlZGlyZWN0VXJsIiwiVVJMIiwicm9vdFVybCIsIm9yaWdpbiIsImUiLCJjb25zb2xlIiwiZXJyb3IiLCJjb25maWciLCJTZXJ2aWNlQ29uZmlndXJhdGlvbiIsImNvbmZpZ3VyYXRpb25zIiwiZmluZE9uZSIsInNlcnZpY2UiLCJDb25maWdFcnJvciIsInJlc3BvbnNlQ29udGVudCIsImFic29sdXRlVXJsT3B0aW9ucyIsInJlZGlyZWN0VXJpIiwiX3JlZGlyZWN0VXJpIiwiSFRUUCIsImdldCIsInBhcmFtcyIsImNsaWVudF9pZCIsImFwcElkIiwicmVkaXJlY3RfdXJpIiwiY2xpZW50X3NlY3JldCIsIm9wZW5TZWNyZXQiLCJzZWNyZXQiLCJjb2RlIiwiZGF0YSIsImVyciIsIk9iamVjdCIsImFzc2lnbiIsIkVycm9yIiwibWVzc2FnZSIsImZiQWNjZXNzVG9rZW4iLCJhY2Nlc3NfdG9rZW4iLCJmYkV4cGlyZXMiLCJleHBpcmVzX2luIiwiaG1hYyIsImNyZWF0ZUhtYWMiLCJ1cGRhdGUiLCJhcHBzZWNyZXRfcHJvb2YiLCJkaWdlc3QiLCJqb2luIiwicmV0cmlldmVDcmVkZW50aWFsIiwiY3JlZGVudGlhbFRva2VuIiwiY3JlZGVudGlhbFNlY3JldCJdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7QUFBQSxJQUFJQSxhQUFKOztBQUFrQkMsTUFBTSxDQUFDQyxJQUFQLENBQVksc0NBQVosRUFBbUQ7QUFBQ0MsU0FBTyxDQUFDQyxDQUFELEVBQUc7QUFBQ0osaUJBQWEsR0FBQ0ksQ0FBZDtBQUFnQjs7QUFBNUIsQ0FBbkQsRUFBaUYsQ0FBakY7QUFBbEIsSUFBSUMsTUFBSjtBQUFXSixNQUFNLENBQUNDLElBQVAsQ0FBWSxRQUFaLEVBQXFCO0FBQUNDLFNBQU8sQ0FBQ0MsQ0FBRCxFQUFHO0FBQUNDLFVBQU0sR0FBQ0QsQ0FBUDtBQUFTOztBQUFyQixDQUFyQixFQUE0QyxDQUE1QztBQUFYRSxRQUFRLEdBQUcsRUFBWDs7QUFHQUEsUUFBUSxDQUFDQyx5QkFBVCxHQUFxQyxDQUFDQyxXQUFELEVBQWNDLFNBQWQsS0FBNEI7QUFDL0Q7QUFDQTtBQUNBLFFBQU1DLFdBQVcsR0FBRyxDQUFDLElBQUQsRUFBTyxPQUFQLEVBQWdCLE1BQWhCLEVBQXdCLFlBQXhCLEVBQXNDLFdBQXRDLEVBQ2xCLGFBRGtCLEVBQ0gsYUFERyxFQUNZLFNBRFosRUFDdUIsWUFEdkIsQ0FBcEI7QUFHQSxRQUFNQyxRQUFRLEdBQUdDLFdBQVcsQ0FBQ0osV0FBRCxFQUFjRSxXQUFkLENBQTVCO0FBRUEsUUFBTUcsTUFBTSxHQUFHLEVBQWY7QUFDQUgsYUFBVyxDQUFDSSxPQUFaLENBQW9CQyxLQUFLLElBQUlGLE1BQU0sQ0FBQ0UsS0FBRCxDQUFOLEdBQWdCSixRQUFRLENBQUNJLEtBQUQsQ0FBckQ7O0FBQ0EsUUFBTUMsV0FBVztBQUNmUixl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QUFDeEM7QUFBaEIsS0FGSSxDQUFOO0FBSUQ7QUFDRixDQXhCRDs7QUEwQkFqQixRQUFRLENBQUN3RSxrQkFBVCxHQUE4QixDQUFDQyxlQUFELEVBQWtCQyxnQkFBbEIsS0FDNUI1RCxLQUFLLENBQUMwRCxrQkFBTixDQUF5QkMsZUFBekIsRUFBMENDLGdCQUExQyxDQURGLEMiLCJmaWxlIjoiL3BhY2thZ2VzL2ZhY2Vib29rLW9hdXRoLmpzIiwic291cmNlc0NvbnRlbnQiOlsiRmFjZWJvb2sgPSB7fTtcbmltcG9ydCBjcnlwdG8gZnJvbSAnY3J5cHRvJztcblxuRmFjZWJvb2suaGFuZGxlQXV0aEZyb21BY2Nlc3NUb2tlbiA9IChhY2Nlc3NUb2tlbiwgZXhwaXJlc0F0KSA9PiB7XG4gIC8vIGluY2x1ZGUgYmFzaWMgZmllbGRzIGZyb20gZmFjZWJvb2tcbiAgLy8gaHR0cHM6Ly9kZXZlbG9wZXJzLmZhY2Vib29rLmNvbS9kb2NzL2ZhY2Vib29rLWxvZ2luL3Blcm1pc3Npb25zL1xuICBjb25zdCB3aGl0ZWxpc3RlZCA9IFsnaWQnLCAnZW1haWwnLCAnbmFtZScsICdmaXJzdF9uYW1lJywgJ2xhc3RfbmFtZScsXG4gICAgJ21pZGRsZV9uYW1lJywgJ25hbWVfZm9ybWF0JywgJ3BpY3R1cmUnLCAnc2hvcnRfbmFtZSddO1xuXG4gIGNvbnN0IGlkZW50aXR5ID0gZ2V0SWRlbnRpdHkoYWNjZXNzVG9rZW4sIHdoaXRlbGlzdGVkKTtcblxuICBjb25zdCBmaWVsZHMgPSB7fTtcbiAgd2hpdGVsaXN0ZWQuZm9yRWFjaChmaWVsZCA9PiBmaWVsZHNbZmllbGRdID0gaWRlbnRpdHlbZmllbGRdKTtcbiAgY29uc3Qgc2VydmljZURhdGEgPSB7XG4gICAgYWNjZXNzVG9rZW4sXG4gICAgZXhwaXJlc0F0LFxuICAgIC4uLmZpZWxkcyxcbiAgfTtcblxuICByZXR1cm4ge1xuICAgIHNlcnZpY2VEYXRhLFxuICAgIG9wdGlvbnM6IHtwcm9maWxlOiB7bmFtZTogaWRlbnRpdHkubmFtZX19XG4gIH07XG59O1xuXG5PQXV0aC5yZWdpc3RlclNlcnZpY2UoJ2ZhY2Vib29rJywgMiwgbnVsbCwgcXVlcnkgPT4ge1xuICBjb25zdCByZXNwb25zZSA9IGdldFRva2VuUmVzcG9uc2UocXVlcnkpO1xuICBjb25zdCB7IGFjY2Vzc1Rva2VuIH0gPSByZXNwb25zZTtcbiAgY29uc3QgeyBleHBpcmVzSW4gfSA9IHJlc3BvbnNlO1xuXG4gIHJldHVybiBGYWNlYm9vay5oYW5kbGVBdXRoRnJvbUFjY2Vzc1Rva2VuKGFjY2Vzc1Rva2VuLCAoK25ldyBEYXRlKSArICgxMDAwICogZXhwaXJlc0luKSk7XG59KTtcblxuZnVuY3Rpb24gZ2V0QWJzb2x1dGVVcmxPcHRpb25zKHF1ZXJ5KSB7XG4gIGNvbnN0IG92ZXJyaWRlUm9vdFVybEZyb21TdGF0ZVJlZGlyZWN0VXJsID0gTWV0ZW9yLnNldHRpbmdzPy5wYWNrYWdlcz8uWydmYWNlYm9vay1vYXV0aCddPy5vdmVycmlkZVJvb3RVcmxGcm9tU3RhdGVSZWRpcmVjdFVybDtcbiAgaWYgKCFvdmVycmlkZVJvb3RVcmxGcm9tU3RhdGVSZWRpcmVjdFVybCkge1xuICAgIHJldHVybiB1bmRlZmluZWQ7XG4gIH1cbiAgdHJ5IHtcbiAgICBjb25zdCBzdGF0ZSA9IE9BdXRoLl9zdGF0ZUZyb21RdWVyeShxdWVyeSkgfHwge307XG4gICAgY29uc3QgcmVkaXJlY3RVcmwgPSBuZXcgVVJMKHN0YXRlLnJlZGlyZWN0VXJsKTtcbiAgICByZXR1cm4ge1xuICAgICAgcm9vdFVybDogcmVkaXJlY3RVcmwub3JpZ2luLFxuICAgIH1cbiAgfSBjYXRjaCAoZSkge1xuICAgIGNvbnNvbGUuZXJyb3IoXG4gICAgICBgRmFpbGVkIHRvIGNvbXBsZXRlIE9BdXRoIGhhbmRzaGFrZSB3aXRoIEZhY2Vib29rIGJlY2F1c2UgaXQgd2FzIG5vdCBhYmxlIHRvIG9idGFpbiB0aGUgcmVkaXJlY3QgdXJsIGZyb20gdGhlIHN0YXRlIGFuZCB5b3UgYXJlIHVzaW5nIG92ZXJyaWRlUm9vdFVybEZyb21TdGF0ZVJlZGlyZWN0VXJsLmAsIGVcbiAgICApO1xuICAgIHJldHVybiB1bmRlZmluZWQ7XG4gIH1cbn1cblxuLy8gcmV0dXJucyBhbiBvYmplY3QgY29udGFpbmluZzpcbi8vIC0gYWNjZXNzVG9rZW5cbi8vIC0gZXhwaXJlc0luOiBsaWZldGltZSBvZiB0b2tlbiBpbiBzZWNvbmRzXG5jb25zdCBnZXRUb2tlblJlc3BvbnNlID0gcXVlcnkgPT4ge1xuICBjb25zdCBjb25maWcgPSBTZXJ2aWNlQ29uZmlndXJhdGlvbi5jb25maWd1cmF0aW9ucy5maW5kT25lKHtzZXJ2aWNlOiAnZmFjZWJvb2snfSk7XG4gIGlmICghY29uZmlnKVxuICAgIHRocm93IG5ldyBTZXJ2aWNlQ29uZmlndXJhdGlvbi5Db25maWdFcnJvcigpO1xuXG4gIGxldCByZXNwb25zZUNvbnRlbnQ7XG4gIHRyeSB7XG5cbiAgICBjb25zdCBhYnNvbHV0ZVVybE9wdGlvbnMgPSBnZXRBYnNvbHV0ZVVybE9wdGlvbnMocXVlcnkpO1xuICAgIGNvbnN0IHJlZGlyZWN0VXJpID0gT0F1dGguX3JlZGlyZWN0VXJpKCdmYWNlYm9vaycsIGNvbmZpZywgdW5kZWZpbmVkLCBhYnNvbHV0ZVVybE9wdGlvbnMpO1xuICAgIC8vIFJlcXVlc3QgYW4gYWNjZXNzIHRva2VuXG4gICAgcmVzcG9uc2VDb250ZW50ID0gSFRUUC5nZXQoXG4gICAgICBcImh0dHBzOi8vZ3JhcGguZmFjZWJvb2suY29tL3Y4LjAvb2F1dGgvYWNjZXNzX3Rva2VuXCIsIHtcbiAgICAgICAgcGFyYW1zOiB7XG4gICAgICAgICAgY2xpZW50X2lkOiBjb25maWcuYXBwSWQsXG4gICAgICAgICAgcmVkaXJlY3RfdXJpOiByZWRpcmVjdFVyaSxcbiAgICAgICAgICBjbGllbnRfc2VjcmV0OiBPQXV0aC5vcGVuU2VjcmV0KGNvbmZpZy5zZWNyZXQpLFxuICAgICAgICAgIGNvZGU6IHF1ZXJ5LmNvZGVcbiAgICAgICAgfVxuICAgICAgfSkuZGF0YTtcbiAgfSBjYXRjaCAoZXJyKSB7XG4gICAgdGhyb3cgT2JqZWN0LmFzc2lnbihcbiAgICAgIG5ldyBFcnJvcihgRmFpbGVkIHRvIGNvbXBsZXRlIE9BdXRoIGhhbmRzaGFrZSB3aXRoIEZhY2Vib29rLiAke2Vyci5tZXNzYWdlfWApLFxuICAgICAgeyByZXNwb25zZTogZXJyLnJlc3BvbnNlIH0sXG4gICAgKTtcbiAgfVxuXG4gIGNvbnN0IGZiQWNjZXNzVG9rZW4gPSByZXNwb25zZUNvbnRlbnQuYWNjZXNzX3Rva2VuO1xuICBjb25zdCBmYkV4cGlyZXMgPSByZXNwb25zZUNvbnRlbnQuZXhwaXJlc19pbjtcblxuICBpZiAoIWZiQWNjZXNzVG9rZW4pIHtcbiAgICB0aHJvdyBuZXcgRXJyb3IoXCJGYWlsZWQgdG8gY29tcGxldGUgT0F1dGggaGFuZHNoYWtlIHdpdGggZmFjZWJvb2sgXCIgK1xuICAgICAgICAgICAgICAgICAgICBgLS0gY2FuJ3QgZmluZCBhY2Nlc3MgdG9rZW4gaW4gSFRUUCByZXNwb25zZS4gJHtyZXNwb25zZUNvbnRlbnR9YCk7XG4gIH1cbiAgcmV0dXJuIHtcbiAgICBhY2Nlc3NUb2tlbjogZmJBY2Nlc3NUb2tlbixcbiAgICBleHBpcmVzSW46IGZiRXhwaXJlc1xuICB9O1xufTtcblxuY29uc3QgZ2V0SWRlbnRpdHkgPSAoYWNjZXNzVG9rZW4sIGZpZWxkcykgPT4ge1xuICBjb25zdCBjb25maWcgPSBTZXJ2aWNlQ29uZmlndXJhdGlvbi5jb25maWd1cmF0aW9ucy5maW5kT25lKHtzZXJ2aWNlOiAnZmFjZWJvb2snfSk7XG4gIGlmICghY29uZmlnKVxuICAgIHRocm93IG5ldyBTZXJ2aWNlQ29uZmlndXJhdGlvbi5Db25maWdFcnJvcigpO1xuXG4gIC8vIEdlbmVyYXRlIGFwcCBzZWNyZXQgcHJvb2YgdGhhdCBpcyBhIHNoYTI1NiBoYXNoIG9mIHRoZSBhcHAgYWNjZXNzIHRva2VuLCB3aXRoIHRoZSBhcHAgc2VjcmV0IGFzIHRoZSBrZXlcbiAgLy8gaHR0cHM6Ly9kZXZlbG9wZXJzLmZhY2Vib29rLmNvbS9kb2NzL2dyYXBoLWFwaS9zZWN1cmluZy1yZXF1ZXN0cyNhcHBzZWNyZXRfcHJvb2ZcbiAgY29uc3QgaG1hYyA9IGNyeXB0by5jcmVhdGVIbWFjKCdzaGEyNTYnLCBPQXV0aC5vcGVuU2VjcmV0KGNvbmZpZy5zZWNyZXQpKTtcbiAgaG1hYy51cGRhdGUoYWNjZXNzVG9rZW4pO1xuXG4gIHRyeSB7XG4gICAgcmV0dXJuIEhUVFAuZ2V0KFwiaHR0cHM6Ly9ncmFwaC5mYWNlYm9vay5jb20vdjguMC9tZVwiLCB7XG4gICAgICBwYXJhbXM6IHtcbiAgICAgICAgYWNjZXNzX3Rva2VuOiBhY2Nlc3NUb2tlbixcbiAgICAgICAgYXBwc2VjcmV0X3Byb29mOiBobWFjLmRpZ2VzdCgnaGV4JyksXG4gICAgICAgIGZpZWxkczogZmllbGRzLmpvaW4oXCIsXCIpXG4gICAgICB9XG4gICAgfSkuZGF0YTtcbiAgfSBjYXRjaCAoZXJyKSB7XG4gICAgdGhyb3cgT2JqZWN0LmFzc2lnbihcbiAgICAgIG5ldyBFcnJvcihgRmFpbGVkIHRvIGZldGNoIGlkZW50aXR5IGZyb20gRmFjZWJvb2suICR7ZXJyLm1lc3NhZ2V9YCksXG4gICAgICB7IHJlc3BvbnNlOiBlcnIucmVzcG9uc2UgfSxcbiAgICApO1xuICB9XG59O1xuXG5GYWNlYm9vay5yZXRyaWV2ZUNyZWRlbnRpYWwgPSAoY3JlZGVudGlhbFRva2VuLCBjcmVkZW50aWFsU2VjcmV0KSA9PlxuICBPQXV0aC5yZXRyaWV2ZUNyZWRlbnRpYWwoY3JlZGVudGlhbFRva2VuLCBjcmVkZW50aWFsU2VjcmV0KTtcblxuIl19
