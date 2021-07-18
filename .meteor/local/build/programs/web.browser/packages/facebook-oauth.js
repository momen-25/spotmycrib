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
var OAuth = Package.oauth.OAuth;
var Oauth = Package.oauth.Oauth;
var Random = Package.random.Random;
var ServiceConfiguration = Package['service-configuration'].ServiceConfiguration;
var meteorInstall = Package.modules.meteorInstall;
var Promise = Package.promise.Promise;

/* Package-scope variables */
var Facebook;

var require = meteorInstall({"node_modules":{"meteor":{"facebook-oauth":{"facebook_client.js":function module(){

//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                                  //
// packages/facebook-oauth/facebook_client.js                                                                       //
//                                                                                                                  //
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                                                                                                                    //
Facebook = {}; // Request Facebook credentials for the user
//
// @param options {optional}
// @param credentialRequestCompleteCallback {Function} Callback function to call on
//   completion. Takes one argument, credentialToken on success, or Error on
//   error.

Facebook.requestCredential = (options, credentialRequestCompleteCallback) => {
  // support both (options, callback) and (callback).
  if (!credentialRequestCompleteCallback && typeof options === 'function') {
    credentialRequestCompleteCallback = options;
    options = {};
  }

  const config = ServiceConfiguration.configurations.findOne({
    service: 'facebook'
  });

  if (!config) {
    credentialRequestCompleteCallback && credentialRequestCompleteCallback(new ServiceConfiguration.ConfigError());
    return;
  }

  const credentialToken = Random.secret();
  const mobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|Windows Phone/i.test(navigator.userAgent);
  const display = mobile ? 'touch' : 'popup';
  let scope = "email";
  if (options && options.requestPermissions) scope = options.requestPermissions.join(',');

  const loginStyle = OAuth._loginStyle('facebook', config, options);

  let loginUrl = "https://www.facebook.com/v8.0/dialog/oauth?client_id=".concat(config.appId) + "&redirect_uri=".concat(OAuth._redirectUri('facebook', config, options.params, options.absoluteUrlOptions)) + "&display=".concat(display, "&scope=").concat(scope) + "&state=".concat(OAuth._stateParam(loginStyle, credentialToken, options && options.redirectUrl)); // Handle authentication type (e.g. for force login you need auth_type: "reauthenticate")

  if (options && options.auth_type) {
    loginUrl += "&auth_type=".concat(encodeURIComponent(options.auth_type));
  }

  OAuth.launchLogin({
    loginService: "facebook",
    loginStyle,
    loginUrl,
    credentialRequestCompleteCallback,
    credentialToken
  });
};
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

}}}}},{
  "extensions": [
    ".js",
    ".json"
  ]
});

require("/node_modules/meteor/facebook-oauth/facebook_client.js");

/* Exports */
Package._define("facebook-oauth", {
  Facebook: Facebook
});

})();
