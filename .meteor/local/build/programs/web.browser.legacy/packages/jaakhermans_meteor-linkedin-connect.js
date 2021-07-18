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
var LinkedIn = Package['pauli:linkedin'].LinkedIn;
var Accounts = Package['accounts-base'].Accounts;

(function(){

///////////////////////////////////////////////////////////////////////
//                                                                   //
// packages/jaakhermans_meteor-linkedin-connect/packages/jaakhermans //
//                                                                   //
///////////////////////////////////////////////////////////////////////
                                                                     //
(function () {

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                                     //
// packages/jaakhermans:meteor-linkedin-connect/client.js                                                              //
//                                                                                                                     //
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                                                                                                                       //
Accounts.oauth.tryConnectLinkedInAfterPopupClosed = function(credentialToken, callback) {                              // 1
  var credentialSecret = OAuth._retrieveCredentialSecret(credentialToken) || null;                                     // 2
  Meteor.call('connectUserWithLinkedIn', credentialToken, credentialSecret, function() {                               // 3
    if (!!callback)                                                                                                    // 4
      callback(arguments);                                                                                             // 5
  });                                                                                                                  // 6
};                                                                                                                     // 7
                                                                                                                       // 8
Accounts.oauth.credentialRequestForConnectCompleteLinkedInHandler = function(callback) {                               // 9
  return function (credentialTokenOrError) {                                                                           // 10
    if (credentialTokenOrError && credentialTokenOrError instanceof Error) {                                           // 11
      callback && callback(credentialTokenOrError);                                                                    // 12
    } else {                                                                                                           // 13
      Accounts.oauth.tryConnectLinkedInAfterPopupClosed(credentialTokenOrError, callback);                             // 14
    }                                                                                                                  // 15
  };                                                                                                                   // 16
};                                                                                                                     // 17
                                                                                                                       // 18
Meteor.connectWithLinkedIn = function(options, callback) {                                                             // 19
  // support a callback without options                                                                                // 20
  if (! callback && typeof options === "function") {                                                                   // 21
    callback = options;                                                                                                // 22
    options = null;                                                                                                    // 23
  }                                                                                                                    // 24
                                                                                                                       // 25
  var credentialRequestCompleteCallback = Accounts.oauth.credentialRequestForConnectCompleteLinkedInHandler(callback); // 26
  LinkedIn.requestCredential(options, credentialRequestCompleteCallback);                                              // 27
};                                                                                                                     // 28
                                                                                                                       // 29
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

}).call(this);

///////////////////////////////////////////////////////////////////////

}).call(this);


/* Exports */
Package._define("jaakhermans:meteor-linkedin-connect");

})();
