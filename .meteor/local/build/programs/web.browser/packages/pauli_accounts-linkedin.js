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
var Accounts = Package['accounts-base'].Accounts;
var LinkedIn = Package['pauli:linkedin'].LinkedIn;

(function(){

//////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                      //
// packages/pauli_accounts-linkedin/linkedin_common.js                                                  //
//                                                                                                      //
//////////////////////////////////////////////////////////////////////////////////////////////////////////
                                                                                                        //
// v0.6.5
Accounts.oauth.registerService('linkedin');

if (!Accounts.linkedin) {
  Accounts.linkedin = {};
}

//////////////////////////////////////////////////////////////////////////////////////////////////////////

}).call(this);






(function(){

//////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                      //
// packages/pauli_accounts-linkedin/linkedin_client.js                                                  //
//                                                                                                      //
//////////////////////////////////////////////////////////////////////////////////////////////////////////
                                                                                                        //
// Meteor.loginWithLinkedin = function (options, callback) {
//   var credentialRequestCompleteCallback = Accounts.oauth.credentialRequestCompleteHandler(callback);
//   LinkedIn.requestCredential(options, credentialRequestCompleteCallback);
// };

  Meteor.loginWithLinkedIn = function(options, callback) {
    // support a callback without options
    if (! callback && typeof options === "function") {
      callback = options;
      options = null;
    }
    var credentialRequestCompleteCallback = Accounts.oauth.credentialRequestCompleteHandler(callback);
    LinkedIn.requestCredential(options, credentialRequestCompleteCallback);
  };

  // Make it work with 0.9.3
  Meteor.loginWithLinkedin = Meteor.loginWithLinkedIn;

//////////////////////////////////////////////////////////////////////////////////////////////////////////

}).call(this);


/* Exports */
Package._define("pauli:accounts-linkedin");

})();
