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
var Template = Package['templating-runtime'].Template;
var Random = Package.random.Random;
var ServiceConfiguration = Package['service-configuration'].ServiceConfiguration;
var Blaze = Package.blaze.Blaze;
var UI = Package.blaze.UI;
var Handlebars = Package.blaze.Handlebars;
var Spacebars = Package.spacebars.Spacebars;
var HTML = Package.htmljs.HTML;

/* Package-scope variables */
var LinkedIn;

(function(){

///////////////////////////////////////////////////////////////////////////////////////
//                                                                                   //
// packages/pauli_linkedin/template.linkedin_configure.js                            //
//                                                                                   //
///////////////////////////////////////////////////////////////////////////////////////
                                                                                     //

Template.__checkName("configureLoginServiceDialogForLinkedin");
Template["configureLoginServiceDialogForLinkedin"] = new Template("Template.configureLoginServiceDialogForLinkedin", (function() {
  var view = this;
  return HTML.Raw('<p>\n    First, you\'ll need to register your app on Linkedin. Follow these steps:\n  </p>\n  <ol>\n    <li>\n      Visit <a href="https://www.linkedin.com/secure/developer?newapp=" target="_blank">https://www.linkedin.com/secure/developer?newapp=</a>\n    </li>\n  </ol>');
}));

///////////////////////////////////////////////////////////////////////////////////////

}).call(this);






(function(){

///////////////////////////////////////////////////////////////////////////////////////
//                                                                                   //
// packages/pauli_linkedin/linkedin_configure.js                                     //
//                                                                                   //
///////////////////////////////////////////////////////////////////////////////////////
                                                                                     //
Template.configureLoginServiceDialogForLinkedin.siteUrl = function () {
  return Meteor.absoluteUrl();
};

Template.configureLoginServiceDialogForLinkedin.fields = function () {
  return [
    {property: 'clientId', label: 'API Key'},
    {property: 'secret', label: 'Secret Key'}
  ];
};

///////////////////////////////////////////////////////////////////////////////////////

}).call(this);






(function(){

///////////////////////////////////////////////////////////////////////////////////////
//                                                                                   //
// packages/pauli_linkedin/linkedin_common.js                                        //
//                                                                                   //
///////////////////////////////////////////////////////////////////////////////////////
                                                                                     //
if (typeof LinkedIn === 'undefined') {
  LinkedIn = {};
}

///////////////////////////////////////////////////////////////////////////////////////

}).call(this);






(function(){

///////////////////////////////////////////////////////////////////////////////////////
//                                                                                   //
// packages/pauli_linkedin/linkedin_client.js                                        //
//                                                                                   //
///////////////////////////////////////////////////////////////////////////////////////
                                                                                     //
// Request LinkedIn credentials for the user
// @param options {optional}
// @param credentialRequestCompleteCallback {Function} Callback function to call on
//   completion. Takes one argument, credentialToken on success, or Error on
//   error.
LinkedIn.requestCredential = function (options, credentialRequestCompleteCallback) {
  // support both (options, callback) and (callback).
  if (!credentialRequestCompleteCallback && typeof options === 'function') {
    credentialRequestCompleteCallback = options;
    options = {};
  }

  var config = ServiceConfiguration.configurations.findOne({service: 'linkedin'});
  if (!config) {
    credentialRequestCompleteCallback && credentialRequestCompleteCallback(new ServiceConfiguration.ConfigError("Service not configured"));
    return;
  }

  var credentialToken = Random.secret();
  var loginStyle = OAuth._loginStyle('linkedin', config, options);

  var scope = [];
  if (options && options.requestPermissions) {
      scope = options.requestPermissions.join('+');
  }

  var loginStyle = OAuth._loginStyle('linkedin', config, options);

  var loginUrl =
        'https://www.linkedin.com/uas/oauth2/authorization' +
        '?response_type=code' + '&client_id=' + config.clientId +
        '&redirect_uri=' + OAuth._redirectUri('linkedin', config) +
        '&scope=' + scope +
        '&state=' + OAuth._stateParam(loginStyle, credentialToken);

  OAuth.launchLogin({
    loginService: "linkedin",
    loginStyle: loginStyle,
    loginUrl: loginUrl,
    credentialRequestCompleteCallback: credentialRequestCompleteCallback,
    credentialToken: credentialToken
  });
};

///////////////////////////////////////////////////////////////////////////////////////

}).call(this);


/* Exports */
Package._define("pauli:linkedin", {
  LinkedIn: LinkedIn
});

})();
