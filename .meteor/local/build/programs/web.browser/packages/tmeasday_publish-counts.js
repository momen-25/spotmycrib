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

/* Package-scope variables */
var Counts;

(function(){

/////////////////////////////////////////////////////////////////////////////////////
//                                                                                 //
// packages/tmeasday_publish-counts/client/publish-counts.js                       //
//                                                                                 //
/////////////////////////////////////////////////////////////////////////////////////
                                                                                   //
Counts = new Mongo.Collection('counts');

Counts.get = function countsGet (name) {
  var count = this.findOne(name);
  return count && count.count || 0;
};

Counts.has = function countsHas (name) {
  return !!this.findOne(name);
};

if (Package.templating) {
  Package.templating.Template.registerHelper('getPublishedCount', function(name) {
    return Counts.get(name);
  });

  Package.templating.Template.registerHelper('hasPublishedCount', function(name) {
    return Counts.has(name);
  });
}

/////////////////////////////////////////////////////////////////////////////////////

}).call(this);


/* Exports */
Package._define("tmeasday:publish-counts", {
  Counts: Counts
});

})();
