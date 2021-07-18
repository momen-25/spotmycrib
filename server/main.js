import {Meteor} from "meteor/meteor";
import {FlowRouter} from "meteor/ostrio:flow-router-extra"
import "../imports/api/publications.js";
// import "../imports/api/properties.js";

if(Meteor.isProduction) FlowRouter.setDeferScriptLoading(true);
var timeInMillis = 1000 * 300; // 300 secs

String.prototype.replaceAll = function(search, replacement) {
    var target = this;
    return target.replace(new RegExp(search, 'g'), replacement);
};
_hijackWrite = function(res) {
    var originalWrite = res.write;
    res.write = function(chunk, encoding) {
        //prevent hijacking other http requests
        if(!res.iInjected &&
            encoding === undefined && /^<!DOCTYPE html>/.test(chunk)) {
            chunk = chunk.toString();
            // console.log('chunk html '+chunk.substring(0,10))
            chunk = chunk.replace(/<html>/, '<!-- HTML 5 -->\n<html lang="en">');
            if(Meteor.isProduction) chunk = chunk.replaceAll('<script type="text/javascript" src', '<script type="text/javascript" async src');

            res.iInjected = true;
        }

        originalWrite.call(res, chunk, encoding);
    };
}
WebApp.connectHandlers.use(function(req, res, next) {
    var path = req._parsedUrl.path;
    // console.log(req._parsedUrl);
    // console.log(req.headers.host);
    // console.log(res);
    ///////Below logic to check if the URL ends with / and remove ending slash unless its a homepage
    var pathname = req._parsedUrl.pathname

    _hijackWrite(res);

    if ( pathname[pathname.length-1]  == '/') {//url ends with tailing /
        if(pathname!="/"){//Its not a home page
            pathname = pathname.substring(0, pathname.length - 1);
            var search = req._parsedUrl.search;
            if(!search)search=""
            var protocol = 'https://'
            if(Meteor.isDevelopment)protocol = 'http://'

            res.writeHead(301, {Location: protocol+req.headers.host+pathname+search});
            res.end();
            return;
        }
    }
    // if (req.headers.host == 'localhost:3000') {
    if (req.headers.host == 'www.spotmycrib.com') {
        // temporary redirect - https://en.wikipedia.org/wiki/List_of_HTTP_status_codes
        res.writeHead(301, {Location: 'https://www.spotmycrib.ie'+path});
        res.end();
    }
    else next.apply();
});

// if(Meteor.isProduction)
// WebAppInternals.setBundledJsCssUrlRewriteHook((url) => {
//     console.log("CDN: "+url)
//     return `http://d30nklzkhaqiiz.cloudfront.net${url}&_g_app_v_=${process.env.GALAXY_APP_VERSION_ID}`;
// });

// if (Meteor.isProduction) {
    CDN.config({
        headers: {
            "/": { "cache-control": "public, max-age: 2592000" }//30 days in seconds
        }
    });
// }

function titleCase(str){
    if(!str)return;
    return str.charAt(0).toUpperCase() + str.toLowerCase().substring(1);
}

// Security.permit(['insert', 'update']).collections([Collections.Properties, Collections.Auctions]).ruleChainMethods();
// Collections.Properties.permit(['insert', 'update']).ifLoggedIn();
// Collections.Auctions.permit(['insert', 'update']).ifLoggedIn();//, 'remove'
Collections.Properties.allow({
    insert: function (userId, doc) {
      var user = Meteor.user();
      if(user.profile.role='agent'){
          return true;
      }
      return false;
    },
    update: function (userId, doc, fields, modifier) {
        var user = Meteor.user();
        if( userId === doc.createdByAgent) {
            return true;
        }
        return false;
    }
});
Collections.Auctions.allow({
    insert: function (userId, doc, fields, modifier) {
        var user = Meteor.user();
        if(user.profile.role='agent'){
            return true;
        }
        return false;
    },
    update: function (userId, doc, fields, modifier){
        if( userId === doc.createdByAgent) {
            return true;
        }
        return false;
    }
});
Collections.PropertyManage.deny({
    insert() { return true; },
    update() { return false; },
    remove() { return true; },
});
Collections.ActivityHistory.deny({
    insert() { return true; },
    update() { return true; },
    remove() { return true; },
});

Meteor.startup(() => {
  // code to run on server at startup
    if(!process.env.MAIL_URL)process.env.MAIL_URL = Meteor.settings["galaxy.meteor.com"]['env']['MAIL_URL'];
});



S3.config = {
    key: 'AKIA5S4UA6UV3RUSZ7XK',
    secret: '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',
    bucket: 'spotmycrib',
    region: 'eu-west-1' // Only needed if not "us-east-1" or "us-standard"
};

