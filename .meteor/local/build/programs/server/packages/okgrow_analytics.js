(function () {

/* Imports */
var Meteor = Package.meteor.Meteor;
var global = Package.meteor.global;
var meteorEnv = Package.meteor.meteorEnv;
var ECMAScript = Package.ecmascript.ECMAScript;
var meteorInstall = Package.modules.meteorInstall;
var Promise = Package.promise.Promise;

/* Package-scope variables */
var analytics;

var require = meteorInstall({"node_modules":{"meteor":{"okgrow:analytics":{"server":{"main.js":function module(require,exports,module){

//////////////////////////////////////////////////////////////////////////////
//                                                                          //
// packages/okgrow_analytics/server/main.js                                 //
//                                                                          //
//////////////////////////////////////////////////////////////////////////////
                                                                            //
module.link("./browser-policy");
module.link("./publications");
//////////////////////////////////////////////////////////////////////////////

},"browser-policy.js":function module(){

//////////////////////////////////////////////////////////////////////////////
//                                                                          //
// packages/okgrow_analytics/server/browser-policy.js                       //
//                                                                          //
//////////////////////////////////////////////////////////////////////////////
                                                                            //
/* global Package */
if (Package['browser-policy-common']) {
  const content = Package['browser-policy-common'].BrowserPolicy.content;

  if (content) {
    content.allowOriginForAll('https://www.google.com/analytics/');
    content.allowOriginForAll('https://cdn.mxpnl.com');
  }
}
//////////////////////////////////////////////////////////////////////////////

},"publications.js":function module(require,exports,module){

//////////////////////////////////////////////////////////////////////////////
//                                                                          //
// packages/okgrow_analytics/server/publications.js                         //
//                                                                          //
//////////////////////////////////////////////////////////////////////////////
                                                                            //
let Meteor;
module.link("meteor/meteor", {
  Meteor(v) {
    Meteor = v;
  }

}, 0);
let Mongo;
module.link("meteor/mongo", {
  Mongo(v) {
    Mongo = v;
  }

}, 1);
// eslint-disable-line import/no-extraneous-dependencies, import/extensions
Meteor.publish(null, function analyticsUsersPublish() {
  if (this.userId) {
    const self = this;
    const query = Meteor.users.find({
      _id: this.userId
    }, {
      fields: {
        emails: 1,
        'services.google.email': 1,
        'services.github.email': 1,
        'services.facebook.email': 1
      }
    });

    Mongo.Collection._publishCursor(query, self, 'AnalyticsUsers');

    return self.ready();
  }

  this.ready();
});
//////////////////////////////////////////////////////////////////////////////

}}}}}},{
  "extensions": [
    ".js",
    ".json"
  ]
});

var exports = require("/node_modules/meteor/okgrow:analytics/server/main.js");

/* Exports */
Package._define("okgrow:analytics", exports, {
  analytics: analytics
});

})();

//# sourceURL=meteor://💻app/packages/okgrow_analytics.js
//# sourceMappingURL=data:application/json;charset=utf8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm1ldGVvcjovL/CfkrthcHAvcGFja2FnZXMvb2tncm93OmFuYWx5dGljcy9zZXJ2ZXIvbWFpbi5qcyIsIm1ldGVvcjovL/CfkrthcHAvcGFja2FnZXMvb2tncm93OmFuYWx5dGljcy9zZXJ2ZXIvYnJvd3Nlci1wb2xpY3kuanMiLCJtZXRlb3I6Ly/wn5K7YXBwL3BhY2thZ2VzL29rZ3JvdzphbmFseXRpY3Mvc2VydmVyL3B1YmxpY2F0aW9ucy5qcyJdLCJuYW1lcyI6WyJtb2R1bGUiLCJsaW5rIiwiUGFja2FnZSIsImNvbnRlbnQiLCJCcm93c2VyUG9saWN5IiwiYWxsb3dPcmlnaW5Gb3JBbGwiLCJNZXRlb3IiLCJ2IiwiTW9uZ28iLCJwdWJsaXNoIiwiYW5hbHl0aWNzVXNlcnNQdWJsaXNoIiwidXNlcklkIiwic2VsZiIsInF1ZXJ5IiwidXNlcnMiLCJmaW5kIiwiX2lkIiwiZmllbGRzIiwiZW1haWxzIiwiQ29sbGVjdGlvbiIsIl9wdWJsaXNoQ3Vyc29yIiwicmVhZHkiXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7OztBQUFBQSxNQUFNLENBQUNDLElBQVAsQ0FBWSxrQkFBWjtBQUFnQ0QsTUFBTSxDQUFDQyxJQUFQLENBQVksZ0JBQVosRTs7Ozs7Ozs7Ozs7QUNBaEM7QUFFQSxJQUFJQyxPQUFPLENBQUMsdUJBQUQsQ0FBWCxFQUFzQztBQUNwQyxRQUFNQyxPQUFPLEdBQUdELE9BQU8sQ0FBQyx1QkFBRCxDQUFQLENBQWlDRSxhQUFqQyxDQUErQ0QsT0FBL0Q7O0FBQ0EsTUFBSUEsT0FBSixFQUFhO0FBQ1hBLFdBQU8sQ0FBQ0UsaUJBQVIsQ0FBMEIsbUNBQTFCO0FBQ0FGLFdBQU8sQ0FBQ0UsaUJBQVIsQ0FBMEIsdUJBQTFCO0FBQ0Q7QUFDRixDOzs7Ozs7Ozs7OztBQ1JELElBQUlDLE1BQUo7QUFBV04sTUFBTSxDQUFDQyxJQUFQLENBQVksZUFBWixFQUE0QjtBQUFDSyxRQUFNLENBQUNDLENBQUQsRUFBRztBQUFDRCxVQUFNLEdBQUNDLENBQVA7QUFBUzs7QUFBcEIsQ0FBNUIsRUFBa0QsQ0FBbEQ7QUFBcUQsSUFBSUMsS0FBSjtBQUFVUixNQUFNLENBQUNDLElBQVAsQ0FBWSxjQUFaLEVBQTJCO0FBQUNPLE9BQUssQ0FBQ0QsQ0FBRCxFQUFHO0FBQUNDLFNBQUssR0FBQ0QsQ0FBTjtBQUFROztBQUFsQixDQUEzQixFQUErQyxDQUEvQztBQUNwQztBQUV0Q0QsTUFBTSxDQUFDRyxPQUFQLENBQWUsSUFBZixFQUFxQixTQUFTQyxxQkFBVCxHQUFpQztBQUNwRCxNQUFJLEtBQUtDLE1BQVQsRUFBaUI7QUFDZixVQUFNQyxJQUFJLEdBQUcsSUFBYjtBQUNBLFVBQU1DLEtBQUssR0FBR1AsTUFBTSxDQUFDUSxLQUFQLENBQ1hDLElBRFcsQ0FDTjtBQUNKQyxTQUFHLEVBQUUsS0FBS0w7QUFETixLQURNLEVBR1Q7QUFDRE0sWUFBTSxFQUFFO0FBQ05DLGNBQU0sRUFBRSxDQURGO0FBRU4saUNBQXlCLENBRm5CO0FBR04saUNBQXlCLENBSG5CO0FBSU4sbUNBQTJCO0FBSnJCO0FBRFAsS0FIUyxDQUFkOztBQVdBVixTQUFLLENBQUNXLFVBQU4sQ0FBaUJDLGNBQWpCLENBQWdDUCxLQUFoQyxFQUF1Q0QsSUFBdkMsRUFBNkMsZ0JBQTdDOztBQUNBLFdBQU9BLElBQUksQ0FBQ1MsS0FBTCxFQUFQO0FBQ0Q7O0FBRUQsT0FBS0EsS0FBTDtBQUNELENBbkJELEUiLCJmaWxlIjoiL3BhY2thZ2VzL29rZ3Jvd19hbmFseXRpY3MuanMiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgJy4vYnJvd3Nlci1wb2xpY3knO1xuaW1wb3J0ICcuL3B1YmxpY2F0aW9ucyc7XG4iLCIvKiBnbG9iYWwgUGFja2FnZSAqL1xuXG5pZiAoUGFja2FnZVsnYnJvd3Nlci1wb2xpY3ktY29tbW9uJ10pIHtcbiAgY29uc3QgY29udGVudCA9IFBhY2thZ2VbJ2Jyb3dzZXItcG9saWN5LWNvbW1vbiddLkJyb3dzZXJQb2xpY3kuY29udGVudDtcbiAgaWYgKGNvbnRlbnQpIHtcbiAgICBjb250ZW50LmFsbG93T3JpZ2luRm9yQWxsKCdodHRwczovL3d3dy5nb29nbGUuY29tL2FuYWx5dGljcy8nKTtcbiAgICBjb250ZW50LmFsbG93T3JpZ2luRm9yQWxsKCdodHRwczovL2Nkbi5teHBubC5jb20nKTtcbiAgfVxufVxuIiwiaW1wb3J0IHsgTWV0ZW9yIH0gZnJvbSAnbWV0ZW9yL21ldGVvcic7IC8vIGVzbGludC1kaXNhYmxlLWxpbmUgaW1wb3J0L25vLWV4dHJhbmVvdXMtZGVwZW5kZW5jaWVzLCBpbXBvcnQvZXh0ZW5zaW9uc1xuaW1wb3J0IHsgTW9uZ28gfSBmcm9tICdtZXRlb3IvbW9uZ28nOyAvLyBlc2xpbnQtZGlzYWJsZS1saW5lIGltcG9ydC9uby1leHRyYW5lb3VzLWRlcGVuZGVuY2llcywgaW1wb3J0L2V4dGVuc2lvbnNcblxuTWV0ZW9yLnB1Ymxpc2gobnVsbCwgZnVuY3Rpb24gYW5hbHl0aWNzVXNlcnNQdWJsaXNoKCkge1xuICBpZiAodGhpcy51c2VySWQpIHtcbiAgICBjb25zdCBzZWxmID0gdGhpcztcbiAgICBjb25zdCBxdWVyeSA9IE1ldGVvci51c2Vyc1xuICAgICAgLmZpbmQoe1xuICAgICAgICBfaWQ6IHRoaXMudXNlcklkLFxuICAgICAgfSwge1xuICAgICAgICBmaWVsZHM6IHtcbiAgICAgICAgICBlbWFpbHM6IDEsXG4gICAgICAgICAgJ3NlcnZpY2VzLmdvb2dsZS5lbWFpbCc6IDEsXG4gICAgICAgICAgJ3NlcnZpY2VzLmdpdGh1Yi5lbWFpbCc6IDEsXG4gICAgICAgICAgJ3NlcnZpY2VzLmZhY2Vib29rLmVtYWlsJzogMSxcbiAgICAgICAgfSxcbiAgICAgIH0pO1xuICAgIE1vbmdvLkNvbGxlY3Rpb24uX3B1Ymxpc2hDdXJzb3IocXVlcnksIHNlbGYsICdBbmFseXRpY3NVc2VycycpO1xuICAgIHJldHVybiBzZWxmLnJlYWR5KCk7XG4gIH1cblxuICB0aGlzLnJlYWR5KCk7XG59KTtcbiJdfQ==
