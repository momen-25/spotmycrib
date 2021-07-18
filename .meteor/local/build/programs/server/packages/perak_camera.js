(function () {

/* Imports */
var Meteor = Package.meteor.Meteor;
var global = Package.meteor.global;
var meteorEnv = Package.meteor.meteorEnv;
var Blaze = Package.blaze.Blaze;
var UI = Package.blaze.UI;
var Handlebars = Package.blaze.Handlebars;
var ReactiveVar = Package['reactive-var'].ReactiveVar;
var HTML = Package.htmljs.HTML;

/* Package-scope variables */
var MeteorCamera;

(function(){

///////////////////////////////////////////////////////////////////////
//                                                                   //
// packages/perak_camera/photo.js                                    //
//                                                                   //
///////////////////////////////////////////////////////////////////////
                                                                     //
MeteorCamera = {};
///////////////////////////////////////////////////////////////////////

}).call(this);


/* Exports */
Package._define("perak:camera", {
  MeteorCamera: MeteorCamera
});

})();
