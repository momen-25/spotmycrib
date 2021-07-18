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

///////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                       //
// packages/jaakhermans_meteor-linkedin-connect/packages/jaakhermans_meteor-linkedin-connect.js          //
//                                                                                                       //
///////////////////////////////////////////////////////////////////////////////////////////////////////////
                                                                                                         //
(function () {

////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                //
// packages/jaakhermans:meteor-linkedin-connect/server.js                                         //
//                                                                                                //
////////////////////////////////////////////////////////////////////////////////////////////////////
                                                                                                  //
// OVERRIDE CORE METHOD for custom linkedin user selection on email                               // 1
// this can be removed when the pull-request is merged                                            // 2
// https://github.com/meteor/meteor/pull/2318                                                     // 3
                                                                                                  // 4
///                                                                                               // 5
/// OAuth Encryption Support                                                                      // 6
///                                                                                               // 7
                                                                                                  // 8
var OAuthEncryption = Package["oauth-encryption"] && Package["oauth-encryption"].OAuthEncryption; // 9
                                                                                                  // 10
                                                                                                  // 11
var usingOAuthEncryption = function () {                                                          // 12
  return OAuthEncryption && OAuthEncryption.keyIsLoaded();                                        // 13
};                                                                                                // 14
                                                                                                  // 15
                                                                                                  // 16
// OAuth service data is temporarily stored in the pending credentials                            // 17
// collection during the oauth authentication process.  Sensitive data                            // 18
// such as access tokens are encrypted without the user id because                                // 19
// we don't know the user id yet.  We re-encrypt these fields with the                            // 20
// user id included when storing the service data permanently in                                  // 21
// the users collection.                                                                          // 22
//                                                                                                // 23
var pinEncryptedFieldsToUser = function (serviceData, userId) {                                   // 24
  _.each(_.keys(serviceData), function (key) {                                                    // 25
    var value = serviceData[key];                                                                 // 26
    if (OAuthEncryption && OAuthEncryption.isSealed(value))                                       // 27
      value = OAuthEncryption.seal(OAuthEncryption.open(value), userId);                          // 28
    serviceData[key] = value;                                                                     // 29
  });                                                                                             // 30
};                                                                                                // 31
                                                                                                  // 32
///                                                                                               // 33
/// MANAGING USER OBJECTS                                                                         // 34
///                                                                                               // 35
                                                                                                  // 36
// Updates or creates a user after we authenticate with a 3rd party.                              // 37
//                                                                                                // 38
// @param serviceName {String} Service name (eg, linkedin).                                       // 39
// @param serviceData {Object} Data to store in the user's record                                 // 40
//        under services[serviceName]. Must include an "id" field                                 // 41
//        which is a unique identifier for the user in the service.                               // 42
// @param options {Object, optional} Other options to pass to insertUserDoc                       // 43
//        (eg, profile)                                                                           // 44
// @returns {Object} Object with token and id keys, like the result                               // 45
//        of the "login" method.                                                                  // 46
//                                                                                                // 47
Accounts.updateOrCreateUserFromExternalService = function(                                        // 48
  serviceName, serviceData, options) {                                                            // 49
  options = _.clone(options || {});                                                               // 50
  if (serviceName === "password" || serviceName === "resume")                                     // 51
    throw new Error(                                                                              // 52
      "Can't use updateOrCreateUserFromExternalService with internal service "                    // 53
        + serviceName);                                                                           // 54
  if (!_.has(serviceData, 'id'))                                                                  // 55
    throw new Error(                                                                              // 56
      "Service data for service " + serviceName + " must include id");                            // 57
                                                                                                  // 58
  var selector = Accounts.externalServiceSelector(serviceName, serviceData, options);             // 59
                                                                                                  // 60
  if (! selector)                                                                                 // 61
    return false;                                                                                 // 62
                                                                                                  // 63
  var user = Meteor.users.findOne(selector);                                                      // 64
                                                                                                  // 65
  if (user) {                                                                                     // 66
    pinEncryptedFieldsToUser(serviceData, user._id);                                              // 67
                                                                                                  // 68
    // We *don't* process options (eg, profile) for update, but we do replace                     // 69
    // the serviceData (eg, so that we keep an unexpired access token and                         // 70
    // don't cache old email addresses in serviceData.email).                                     // 71
    // XXX provide an onUpdateUser hook which would let apps update                               // 72
    //     the profile too                                                                        // 73
    var setAttrs = {};                                                                            // 74
    _.each(serviceData, function(value, key) {                                                    // 75
      setAttrs["services." + serviceName + "." + key] = value;                                    // 76
    });                                                                                           // 77
                                                                                                  // 78
    // XXX Maybe we should re-use the selector above and notice if the update                     // 79
    //     touches nothing?                                                                       // 80
    Meteor.users.update(user._id, {$set: setAttrs});                                              // 81
    return {                                                                                      // 82
      type: serviceName,                                                                          // 83
      userId: user._id                                                                            // 84
    };                                                                                            // 85
  } else {                                                                                        // 86
    // Create a new user with the service data. Pass other options through to                     // 87
    // insertUserDoc.                                                                             // 88
    user = {services: {}};                                                                        // 89
    user.services[serviceName] = serviceData;                                                     // 90
    return {                                                                                      // 91
      type: serviceName,                                                                          // 92
      userId: Accounts.insertUserDoc(options, user)                                               // 93
    };                                                                                            // 94
  }                                                                                               // 95
};                                                                                                // 96
                                                                                                  // 97
Accounts.externalServiceSelector = function(                                                      // 98
  serviceName, serviceData, options){                                                             // 99
  var selector = false;                                                                           // 100
                                                                                                  // 101
  //check if specific selector is available for service                                           // 102
  //eg externalServiceSelectorLinkedin                                                            // 103
  var selectorMethod = "externalServiceSelector";                                                 // 104
    selectorMethod += serviceName.charAt(0).toUpperCase() + serviceName.slice(1);                 // 105
                                                                                                  // 106
  if (!! Accounts[selectorMethod]){                                                               // 107
    selector = Accounts[selectorMethod](serviceName, serviceData, options);                       // 108
  }                                                                                               // 109
                                                                                                  // 110
  // Look for a user with the appropriate service user id.                                        // 111
  if(! selector && !! serviceData.id) {                                                           // 112
    selector = {};                                                                                // 113
    selector["services." + serviceName + ".id"] = serviceData.id;                                 // 114
  }                                                                                               // 115
                                                                                                  // 116
  return selector;                                                                                // 117
};                                                                                                // 118
                                                                                                  // 119
Accounts.externalServiceSelectorLinkedIn = function(                                              // 120
  serviceName, serviceData, options){                                                             // 121
    return Accounts.retrieveExternalServiceSelector(serviceName, serviceData, options);           // 122
};                                                                                                // 123
                                                                                                  // 124
Accounts.retrieveExternalServiceSelector = function (serviceName, serviceData, options) {         // 125
  var serviceIdKey = "services." + serviceName + ".id";                                           // 126
  var selector = {};                                                                              // 127
  selector["$or"] = [{},{}];                                                                      // 128
  selector["$or"][0][serviceIdKey] = serviceData.id;                                              // 129
  //also check on email                                                                           // 130
  selector["$or"][1]["emails.address"] = serviceData.email;                                       // 131
  if (! serviceData.email)                                                                        // 132
    selector = false;                                                                             // 133
  return selector;                                                                                // 134
}                                                                                                 // 135
                                                                                                  // 136
Meteor.methods({                                                                                  // 137
  connectUserWithLinkedIn: function (token, secret) {                                             // 138
    //errors                                                                                      // 139
    if (! this.userId)                                                                            // 140
      throw new Meteor.Error(403, "user must be loggedin");                                       // 141
                                                                                                  // 142
    var user = Meteor.user();                                                                     // 143
    if (user.services && user.services.linkedin)                                                  // 144
      throw new Meteor.Error(403, "user can not have a linkedin connected account");              // 145
                                                                                                  // 146
    if (Meteor.isServer) {                                                                        // 147
      var data = LinkedIn.retrieveCredential(token, secret);                                      // 148
                                                                                                  // 149
      if (! data)                                                                                 // 150
        throw new Meteor.Error(403, "not able to retreive linkedin data");                        // 151
                                                                                                  // 152
      //check if no accounts exists for this linkedin user                                        // 153
      var existing = Meteor.users.find({'services.linkedin.id': data.serviceData.id}).count();    // 154
      if (existing)                                                                               // 155
        throw new Meteor.Error(403, "user found with same linkedin account");                     // 156
                                                                                                  // 157
      Meteor.users.update(this.userId, {$set: {'services.linkedin': data.serviceData}});          // 158
    }                                                                                             // 159
  }                                                                                               // 160
});                                                                                               // 161
                                                                                                  // 162
////////////////////////////////////////////////////////////////////////////////////////////////////

}).call(this);

///////////////////////////////////////////////////////////////////////////////////////////////////////////

}).call(this);


/* Exports */
Package._define("jaakhermans:meteor-linkedin-connect");

})();
