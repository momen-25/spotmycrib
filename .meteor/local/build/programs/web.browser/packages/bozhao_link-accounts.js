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
var check = Package.check.check;
var Match = Package.check.Match;
var OAuth = Package.oauth.OAuth;
var Oauth = Package.oauth.Oauth;
var meteorInstall = Package.modules.meteorInstall;
var Promise = Package.promise.Promise;
var Accounts = Package['accounts-base'].Accounts;

var require = meteorInstall({"node_modules":{"meteor":{"bozhao:link-accounts":{"link_accounts_client.js":function module(require,exports,module){

///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                                   //
// packages/bozhao_link-accounts/link_accounts_client.js                                                             //
//                                                                                                                   //
///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                                                                                                                     //
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
let OAuth;
module.link("meteor/oauth", {
  OAuth(v) {
    OAuth = v;
  }

}, 2);
module.link("./core-services/facebook");
module.link("./core-services/github");
module.link("./core-services/google");
module.link("./core-services/meetup");
module.link("./core-services/meteor_developer");
module.link("./core-services/twitter");
module.link("./core-services/weibo");
module.link("./community-services/angellist");
module.link("./community-services/dropbox");
module.link("./community-services/discord");
module.link("./community-services/edmodo");
module.link("./community-services/instagram");
module.link("./community-services/linkedin");
module.link("./community-services/mailru");
module.link("./community-services/qq");
module.link("./community-services/ok");
module.link("./community-services/slack");
module.link("./community-services/spotify");
module.link("./community-services/soundcloud");
module.link("./community-services/twitch");
module.link("./community-services/venmo");
module.link("./community-services/vk");
module.link("./community-services/wechat");
module.link("./community-services/line");
module.link("./community-services/office365");

Accounts.oauth.tryLinkAfterPopupClosed = function (credentialToken, callback) {
  const credentialSecret = OAuth._retrieveCredentialSecret(credentialToken);

  Accounts.callLoginMethod({
    methodArguments: [{
      link: {
        credentialToken: credentialToken,
        credentialSecret: credentialSecret
      }
    }],
    userCallback: callback && function (err) {
      // Allow server to specify a specify subclass of errors. We should come
      // up with a more generic way to do this!
      if (err && err instanceof Meteor.Error && err.error === Accounts.LoginCancelledError.numericError) {
        callback(new Accounts.LoginCancelledError(err.details));
      } else {
        callback(err);
      }
    }
  });
};

Accounts.oauth.linkCredentialRequestCompleteHandler = function (callback) {
  return function (credentialTokenOrError) {
    if (credentialTokenOrError && credentialTokenOrError instanceof Error) {
      callback && callback(credentialTokenOrError);
    } else {
      Accounts.oauth.tryLinkAfterPopupClosed(credentialTokenOrError, callback);
    }
  };
};
///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

},"community-services":{"angellist.js":function module(require,exports,module){

///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                                   //
// packages/bozhao_link-accounts/community-services/angellist.js                                                     //
//                                                                                                                   //
///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                                                                                                                     //
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

Meteor.linkWithAngelList = function (options, callback) {
  if (!Meteor.userId()) {
    throw new Meteor.Error(402, 'Please login to an existing account before link.');
  }

  if (!Package['nicolaiwadstrom:meteor-angellist'] || !Package['nicolaiwadstrom:meteor-accounts-angellist']) {
    throw new Meteor.Error(403, 'Please include nicolaiwadstrom:meteor-angellist package');
  }

  if (!callback && typeof options === 'function') {
    callback = options;
    options = null;
  }

  const credentialRequestCompleteCallback = Accounts.oauth.linkCredentialRequestCompleteHandler(callback);
  Package['nicolaiwadstrom:meteor-accounts-angellist'].AngelList.requestCredential(options, credentialRequestCompleteCallback);
};
///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

},"discord.js":function module(require,exports,module){

///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                                   //
// packages/bozhao_link-accounts/community-services/discord.js                                                       //
//                                                                                                                   //
///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                                                                                                                     //
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

Meteor.linkWithDiscord = function (options, callback) {
  if (!Meteor.userId()) {
    throw new Meteor.Error(402, 'Please login to an existing account before link.');
  }

  if (!Package['lichthagel:accounts-discord']) {
    throw new Meteor.Error(403, 'Please include lichthagel:accounts-discord package');
  }

  if (!callback && typeof options === 'function') {
    callback = options;
    options = null;
  }

  const credentialRequestCompleteCallback = Accounts.oauth.linkCredentialRequestCompleteHandler(callback);
  Package['lichthagel:discord-oauth'].Discord.requestCredential(options, credentialRequestCompleteCallback);
};
///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

},"dropbox.js":function module(require,exports,module){

///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                                   //
// packages/bozhao_link-accounts/community-services/dropbox.js                                                       //
//                                                                                                                   //
///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                                                                                                                     //
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

Meteor.linkWithDropbox = function (options, callback) {
  if (!Meteor.userId()) {
    throw new Meteor.Error(402, 'Please login to an existing account before link.');
  }

  if (!Package['gcampax:dropbox-oauth']) {
    throw new Meteor.Error(403, 'Please include gcampax:dropbox-oauth package');
  }

  if (!callback && typeof options === 'function') {
    callback = options;
    options = null;
  }

  const credentialRequestCompleteCallback = Accounts.oauth.linkCredentialRequestCompleteHandler(callback);
  Package['gcampax:dropbox-oauth'].DropboxOAuth.requestCredential(options, credentialRequestCompleteCallback);
};
///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

},"edmodo.js":function module(require,exports,module){

///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                                   //
// packages/bozhao_link-accounts/community-services/edmodo.js                                                        //
//                                                                                                                   //
///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                                                                                                                     //
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

Meteor.linkWithEdmodo = function (options, callback) {
  if (!Meteor.userId()) {
    throw new Meteor.Error(402, 'Please login to an existing account before link.');
  }

  if (!Package['merlin:accounts-edmodo'] && !Package['merlin:edmodo']) {
    throw new Meteor.Error(403, 'Please include merlin:accounts-edmodo and merlin:edmodo package');
  }

  if (!callback && typeof options === 'function') {
    callback = options;
    options = null;
  }

  const credentialRequestCompleteCallback = Accounts.oauth.linkCredentialRequestCompleteHandler(callback);
  Package['merlin:accounts-edmodo'].Edmodo.requestCredential(options, credentialRequestCompleteCallback);
};
///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

},"instagram.js":function module(require,exports,module){

///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                                   //
// packages/bozhao_link-accounts/community-services/instagram.js                                                     //
//                                                                                                                   //
///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                                                                                                                     //
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

Meteor.linkWithInstagram = function (options, callback) {
  if (!Meteor.userId()) {
    throw new Meteor.Error(402, 'Please login to an existing account before link.');
  }

  if (!Package['bozhao:accounts-instagram']) {
    throw new Meteor.Error(403, 'Please include bozhao:accounts-instagram package');
  }

  if (!callback && typeof options === 'function') {
    callback = options;
    options = null;
  }

  const credentialRequestCompleteCallback = Accounts.oauth.linkCredentialRequestCompleteHandler(callback);
  Package['bozhao:accounts-instagram'].Instagram.requestCredential(options, credentialRequestCompleteCallback);
};
///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

},"line.js":function module(require,exports,module){

///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                                   //
// packages/bozhao_link-accounts/community-services/line.js                                                          //
//                                                                                                                   //
///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                                                                                                                     //
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

Meteor.linkWithLine = function (options, callback) {
  if (!Meteor.userId()) {
    throw new Meteor.Error(402, 'Please login to an existing account before link.');
  }

  if (!Package['storyteller:accounts-line']) {
    throw new Meteor.Error(403, 'Please include storyteller:accounts-line package.');
  }

  if (!callback && typeof options === 'function') {
    callback = options;
    options = null;
  }

  const credentialRequestCompleteCallback = Accounts.oauth.linkCredentialRequestCompleteHandler(callback);
  Package['storyteller:accounts-line'].Line.requestCredential(options, credentialRequestCompleteCallback);
};
///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

},"linkedin.js":function module(require,exports,module){

///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                                   //
// packages/bozhao_link-accounts/community-services/linkedin.js                                                      //
//                                                                                                                   //
///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                                                                                                                     //
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

Meteor.linkWithLinkedIn = function (options, callback) {
  if (!Meteor.userId()) {
    throw new Meteor.Error(402, 'Please login to an existing account before link.');
  }

  if (!Package['pauli:linkedin-oauth']) {
    throw new Meteor.Error(403, 'Please include pauli:linkedin-oauth package');
  } // Deprecation of jonperl:linkedin


  if (Package['jonperl:linkedin']) {
    console.warn('jonperl:linkedin has been deprecated in meteor linked accounts in favor of pauli:linkedin-oauth to keep up with linkedin api changes');
  }

  if (!Package['jonperl:linkedin'] && !Package['pauli:linkedin-oauth']) {
    throw new Meteor.Error(403, 'Please include pauli:linkedin-oauth package');
  } // End of deprecation messages


  if (!callback && typeof options === 'function') {
    callback = options;
    options = null;
  }

  const credentialRequestCompleteCallback = Accounts.oauth.linkCredentialRequestCompleteHandler(callback);

  if (Package['pauli:linkedin-oauth']) {
    Package['pauli:linkedin-oauth'].LinkedIn.requestCredential(options, credentialRequestCompleteCallback);
  } else if (Package['jonperl:linkedin']) {
    Package['jonperl:linkedin'].LinkedIn.requestCredential(options, credentialRequestCompleteCallback);
  }
};
///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

},"mailru.js":function module(require,exports,module){

///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                                   //
// packages/bozhao_link-accounts/community-services/mailru.js                                                        //
//                                                                                                                   //
///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                                                                                                                     //
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

Meteor.linkWithMailru = function (options, callback) {
  if (!Meteor.userId()) {
    throw new Meteor.Error(402, 'Please login to an existing account before link.');
  }

  if (!Package['mikepol:accounts-mailru']) {
    throw new Meteor.Error(403, 'Please include mikepol:accounts-mailru package');
  }

  if (!callback && typeof options === 'function') {
    callback = options;
    options = null;
  }

  const credentialRequestCompleteCallback = Accounts.oauth.linkCredentialRequestCompleteHandler(callback);
  Package['mikepol:accounts-mailru'].Mailru.requestCredential(options, credentialRequestCompleteCallback);
};
///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

},"office365.js":function module(require,exports,module){

///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                                   //
// packages/bozhao_link-accounts/community-services/office365.js                                                     //
//                                                                                                                   //
///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                                                                                                                     //
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

Meteor.linkWithOffice = function (options, callback) {
  if (!Meteor.userId()) {
    throw new Meteor.Error(402, 'Please login to an existing account before link.');
  }

  if (!Package['lindoelio:accounts-office365'] && !Package['ermlab:accounts-office365']) {
    throw new Meteor.Error(403, 'Please include either lindoelio:accounts-office365 package or ermlab:accounts-office365 package.');
  }

  if (!callback && typeof options === 'function') {
    callback = options;
    options = null;
  }

  const credentialRequestCompleteCallback = Accounts.oauth.linkCredentialRequestCompleteHandler(callback);

  if (Package['lindoelio:accounts-office365']) {
    Package['lindoelio:office365-oauth'].Office365.requestCredential(options, credentialRequestCompleteCallback);
  } else if (Package['ermlab:accounts-office365']) {
    Package['ermlab:office365-oauth'].Office365.requestCredential(options, credentialRequestCompleteCallback);
  }
};
///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

},"ok.js":function module(require,exports,module){

///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                                   //
// packages/bozhao_link-accounts/community-services/ok.js                                                            //
//                                                                                                                   //
///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                                                                                                                     //
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

Meteor.linkWithOk = function (options, callback) {
  if (!Meteor.userId()) {
    throw new Meteor.Error(402, 'Please login to an existing account before link.');
  }

  if (!Package['mikepol:accounts-ok']) {
    throw new Meteor.Error(403, 'Please include mikepol:accounts-ok package');
  }

  if (!callback && typeof options === 'function') {
    callback = options;
    options = null;
  }

  const credentialRequestCompleteCallback = Accounts.oauth.linkCredentialRequestCompleteHandler(callback);
  Package['mikepol:accounts-ok'].OK.requestCredential(options, credentialRequestCompleteCallback);
};
///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

},"qq.js":function module(require,exports,module){

///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                                   //
// packages/bozhao_link-accounts/community-services/qq.js                                                            //
//                                                                                                                   //
///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                                                                                                                     //
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

Meteor.linkWithQq = function (options, callback) {
  if (!Meteor.userId()) {
    throw new Meteor.Error(402, 'Please login to an existing account before link.');
  }

  if (!Package['leonzhang1109:accounts-qq']) {
    throw new Meteor.Error(403, 'Please include leonzhang1109:accounts-qq package');
  }

  if (!callback && typeof options === 'function') {
    callback = options;
    options = null;
  }

  const credentialRequestCompleteCallback = Accounts.oauth.linkCredentialRequestCompleteHandler(callback);
  Package['leonzhang1109:accounts-qq'].Qq.requestCredential(options, credentialRequestCompleteCallback);
};
///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

},"slack.js":function module(require,exports,module){

///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                                   //
// packages/bozhao_link-accounts/community-services/slack.js                                                         //
//                                                                                                                   //
///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                                                                                                                     //
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

Meteor.linkWithSlack = function (options, callback) {
  if (!Meteor.userId()) {
    throw new Meteor.Error(402, 'Please login to an existing account before link.');
  }

  if (!Package['acemtp:accounts-slack']) {
    throw new Meteor.Error(403, 'Please include acemtp:accounts-slack package');
  }

  if (!callback && typeof options === 'function') {
    callback = options;
    options = null;
  }

  const credentialRequestCompleteCallback = Accounts.oauth.linkCredentialRequestCompleteHandler(callback);
  Package['acemtp:accounts-slack'].Slack.requestCredential(options, credentialRequestCompleteCallback);
};
///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

},"soundcloud.js":function module(require,exports,module){

///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                                   //
// packages/bozhao_link-accounts/community-services/soundcloud.js                                                    //
//                                                                                                                   //
///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                                                                                                                     //
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

Meteor.linkWithSoundcloud = function (options, callback) {
  if (!Meteor.userId()) {
    throw new Meteor.Error(402, 'Please login to an existing account before link.');
  }

  if (!Package['garbolino:accounts-soundcloud']) {
    throw new Meteor.Error(403, 'Please include garbolino:accounts-soundcloud package');
  }

  if (!callback && typeof options === 'function') {
    callback = options;
    options = null;
  }

  const credentialRequestCompleteCallback = Accounts.oauth.linkCredentialRequestCompleteHandler(callback);
  Package['garbolino:accounts-soundcloud'].Soundcloud.requestCredential(options, credentialRequestCompleteCallback);
};
///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

},"spotify.js":function module(require,exports,module){

///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                                   //
// packages/bozhao_link-accounts/community-services/spotify.js                                                       //
//                                                                                                                   //
///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                                                                                                                     //
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

Meteor.linkWithSpotify = function (options, callback) {
  if (!Meteor.userId()) {
    throw new Meteor.Error(402, 'Please login to an existing account before link.');
  }

  if (!Package['xinranxiao:spotify'] || !Package['xinranxiao:accounts-spotify']) {
    throw new Meteor.Error(403, 'Please include xinranxiao:meteor-spotify package');
  }

  if (!callback && typeof options === 'function') {
    callback = options;
    options = null;
  }

  const credentialRequestCompleteCallback = Accounts.oauth.linkCredentialRequestCompleteHandler(callback);
  Package['xinranxiao:accounts-spotify'].Spotify.requestCredential(options, credentialRequestCompleteCallback);
};
///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

},"twitch.js":function module(require,exports,module){

///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                                   //
// packages/bozhao_link-accounts/community-services/twitch.js                                                        //
//                                                                                                                   //
///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                                                                                                                     //
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

Meteor.linkWithTwitch = function (options, callback) {
  if (!Meteor.userId()) {
    throw new Meteor.Error(402, 'Please login to an existing account before link.');
  }

  if (!Package['alexbeauchemin:accounts-twitch']) {
    throw new Meteor.Error(403, 'Please include lexbeauchemin:accounts-twitch packages');
  }

  if (!callback && typeof options === 'function') {
    callback = options;
    options = null;
  }

  const credentialRequestCompleteCallback = Accounts.oauth.linkCredentialRequestCompleteHandler(callback);
  Package['alexbeauchemin:accounts-twitch'].TwitchAccounts.requestCredential(options, credentialRequestCompleteCallback);
};
///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

},"venmo.js":function module(require,exports,module){

///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                                   //
// packages/bozhao_link-accounts/community-services/venmo.js                                                         //
//                                                                                                                   //
///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                                                                                                                     //
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

Meteor.linkWithVenmo = function (options, callback) {
  if (!Meteor.userId()) {
    throw new Meteor.Error(402, 'Please login to an existing account before link.');
  }

  if (!Package['pcooney10:accounts-venmo']) {
    throw new Meteor.Error(403, 'Please include pcooney10:accounts-venmo package');
  }

  if (!callback && typeof options === 'function') {
    callback = options;
    options = null;
  }

  const credentialRequestCompleteCallback = Accounts.oauth.linkCredentialRequestCompleteHandler(callback);
  Package['pcooney10:accounts-venmo'].Venmo.requestCredential(options, credentialRequestCompleteCallback);
};
///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

},"vk.js":function module(require,exports,module){

///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                                   //
// packages/bozhao_link-accounts/community-services/vk.js                                                            //
//                                                                                                                   //
///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                                                                                                                     //
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

Meteor.linkWithVk = function (options, callback) {
  if (!Meteor.userId()) {
    throw new Meteor.Error(402, 'Please login to an existing account before link.');
  }

  if (!Package['mrt:accounts-vk']) {
    throw new Meteor.Error(403, 'Please include mrt:accounts-vk package');
  }

  if (!callback && typeof options === 'function') {
    callback = options;
    options = null;
  }

  const credentialRequestCompleteCallback = Accounts.oauth.linkCredentialRequestCompleteHandler(callback);
  Package['mrt:accounts-vk'].VK.requestCredential(options, credentialRequestCompleteCallback);
};
///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

},"wechat.js":function module(require,exports,module){

///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                                   //
// packages/bozhao_link-accounts/community-services/wechat.js                                                        //
//                                                                                                                   //
///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                                                                                                                     //
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

Meteor.linkWithWechat = function (options, callback) {
  if (!Meteor.userId()) {
    throw new Meteor.Error(402, 'Please login to an existing account before link.');
  }

  if (!Package['leonzhang1109:accounts-wechat']) {
    throw new Meteor.Error(403, 'Please include leonzhang1109:accounts-wechat package');
  }

  if (!callback && typeof options === 'function') {
    callback = options;
    options = null;
  }

  const credentialRequestCompleteCallback = Accounts.oauth.linkCredentialRequestCompleteHandler(callback);
  Package['leonzhang1109:accounts-wechat'].Wechat.requestCredential(options, credentialRequestCompleteCallback);
};
///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

}},"core-services":{"facebook.js":function module(require,exports,module){

///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                                   //
// packages/bozhao_link-accounts/core-services/facebook.js                                                           //
//                                                                                                                   //
///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                                                                                                                     //
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

Meteor.linkWithFacebook = function (options, callback) {
  if (!Meteor.userId()) {
    throw new Meteor.Error(402, 'Please login to an existing account before link.');
  }

  let facebookPackage;

  if (Package.facebook) {
    facebookPackage = Package.facebook;
  } else if (Package['facebook-oauth']) {
    facebookPackage = Package['facebook-oauth'];
  }

  if (Meteor.isCordova) {
    if (!Package['btafel:accounts-facebook-cordova']) {
      throw new Meteor.Error(403, 'Please include btafel:accounts-facebook-cordova package or cordova-fb package');
    }
  } else {
    if (!facebookPackage) {
      throw new Meteor.Error(403, 'Please include accounts-facebook and facebook-oauth package or cordova-fb package');
    }
  }

  if (!callback && typeof options === 'function') {
    callback = options;
    options = null;
  }

  const credentialRequestCompleteCallback = Accounts.oauth.linkCredentialRequestCompleteHandler(callback);
  facebookPackage.Facebook.requestCredential(options, credentialRequestCompleteCallback);
};
///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

},"github.js":function module(require,exports,module){

///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                                   //
// packages/bozhao_link-accounts/core-services/github.js                                                             //
//                                                                                                                   //
///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                                                                                                                     //
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

Meteor.linkWithGithub = function (options, callback) {
  if (!Meteor.userId()) {
    throw new Meteor.Error(402, 'Please login to an existing account before link.');
  }

  if (!Package['accounts-github'] && !Package.github && !Package['github-oauth']) {
    throw new Meteor.Error(403, 'Please include accounts-github and github package');
  }

  const githubOAuthPackageName = Package.github ? 'github' : 'github-oauth';

  if (!callback && typeof options === 'function') {
    callback = options;
    options = null;
  }

  const credentialRequestCompleteCallback = Accounts.oauth.linkCredentialRequestCompleteHandler(callback);
  Package[githubOAuthPackageName].Github.requestCredential(options, credentialRequestCompleteCallback);
};
///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

},"google.js":function module(require,exports,module){

///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                                   //
// packages/bozhao_link-accounts/core-services/google.js                                                             //
//                                                                                                                   //
///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                                                                                                                     //
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

Meteor.linkWithGoogle = function (options, callback) {
  if (!Meteor.userId()) {
    throw new Meteor.Error(402, 'Please login to an existing account before link.');
  }

  if (!Package['accounts-google'] && !Package.google) {
    throw new Meteor.Error(403, 'Please include accounts-google and google package');
  }

  if (!callback && typeof options === 'function') {
    callback = options;
    options = null;
  }

  const credentialRequestCompleteCallback = Accounts.oauth.linkCredentialRequestCompleteHandler(callback);

  if (Meteor.isCordova) {
    window.plugins.googleplus.login({}, function (serviceData) {
      Meteor.call('cordovaGoogle', 'google', serviceData);
    }, function (err) {
      callback(err);
    });
  } else {
    Package['google-oauth'].Google.requestCredential(options, credentialRequestCompleteCallback);
  }
};
///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

},"meetup.js":function module(require,exports,module){

///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                                   //
// packages/bozhao_link-accounts/core-services/meetup.js                                                             //
//                                                                                                                   //
///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                                                                                                                     //
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

Meteor.linkWithMeetup = function (options, callback) {
  if (!Meteor.userId()) {
    throw new Meteor.Error(402, 'Please login to an existing account before link.');
  }

  if (!Package['accounts-meetup'] && !Package.meetup) {
    throw new Meteor.Error(403, 'Please include accounts-meetup and meetup package');
  }

  if (!callback && typeof options === 'function') {
    callback = options;
    options = null;
  }

  const credentialRequestCompleteCallback = Accounts.oauth.linkCredentialRequestCompleteHandler(callback);
  Package.meetup.Meetup.requestCredential(options, credentialRequestCompleteCallback);
};
///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

},"meteor_developer.js":function module(require,exports,module){

///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                                   //
// packages/bozhao_link-accounts/core-services/meteor_developer.js                                                   //
//                                                                                                                   //
///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                                                                                                                     //
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

Meteor.linkWithMeteorDeveloperAccount = function (options, callback) {
  if (!Meteor.userId()) {
    throw new Meteor.Error(402, 'Please login to an existing account before link.');
  }

  if (!Package['accounts-meteor-developer'] && !Package['meteor-developer-oauth']) {
    throw new Meteor.Error(403, 'Please include accounts-meteor-developer package');
  }

  if (!callback && typeof options === 'function') {
    callback = options;
    options = null;
  }

  const credentialRequestCompleteCallback = Accounts.oauth.linkCredentialRequestCompleteHandler(callback);
  Package['meteor-developer-oauth'].MeteorDeveloperAccounts.requestCredential(options, credentialRequestCompleteCallback);
};
///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

},"twitter.js":function module(require,exports,module){

///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                                   //
// packages/bozhao_link-accounts/core-services/twitter.js                                                            //
//                                                                                                                   //
///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                                                                                                                     //
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

Meteor.linkWithTwitter = function (options, callback) {
  if (!Meteor.userId()) {
    throw new Meteor.Error(402, 'Please login to an existing account before link.');
  }

  let twitterPackage;

  if (Package.twitter) {
    twitterPackage = Package.twitter;
  } else if (Package['twitter-oauth']) {
    twitterPackage = Package['twitter-oauth'];
  }

  if (!Package['accounts-twitter'] && !twitterPackage) {
    throw new Meteor.Error(403, 'Please include accounts-twitter and twitter package');
  }

  if (!callback && typeof options === 'function') {
    callback = options;
    options = null;
  }

  const credentialRequestCompleteCallback = Accounts.oauth.linkCredentialRequestCompleteHandler(callback);
  twitterPackage.Twitter.requestCredential(options, credentialRequestCompleteCallback);
};
///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

},"weibo.js":function module(require,exports,module){

///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                                   //
// packages/bozhao_link-accounts/core-services/weibo.js                                                              //
//                                                                                                                   //
///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                                                                                                                     //
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

Meteor.linkWithWeibo = function (options, callback) {
  if (!Meteor.userId()) {
    throw new Meteor.Error(402, 'Please login to an existing account before link.');
  }

  let weiboPackage;

  if (Package.weibo) {
    weiboPackage = Package.weibo;
  } else if (Package['weibo-oauth']) {
    weiboPackage = Package['weibo-oauth'];
  }

  if (!Package['accounts-weibo'] || !weiboPackage) {
    throw new Meteor.Error(403, 'Please include accounts-weibo and weibo package');
  }

  if (!callback && typeof options === 'function') {
    callback = options;
    options = null;
  }

  const credentialRequestCompleteCallback = Accounts.oauth.linkCredentialRequestCompleteHandler(callback);
  weiboPackage.Weibo.requestCredential(options, credentialRequestCompleteCallback);
};
///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

}}}}}},{
  "extensions": [
    ".js",
    ".json",
    ".mjs",
    ".css"
  ]
});

var exports = require("/node_modules/meteor/bozhao:link-accounts/link_accounts_client.js");

/* Exports */
Package._define("bozhao:link-accounts", exports);

})();
