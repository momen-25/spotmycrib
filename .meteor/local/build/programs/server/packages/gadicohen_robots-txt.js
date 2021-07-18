(function () {

/* Imports */
var Meteor = Package.meteor.Meteor;
var global = Package.meteor.global;
var meteorEnv = Package.meteor.meteorEnv;
var WebApp = Package.webapp.WebApp;
var WebAppInternals = Package.webapp.WebAppInternals;
var main = Package.webapp.main;

/* Package-scope variables */
var robots;

(function(){

//////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                              //
// packages/gadicohen_robots-txt/packages/gadicohen_robots-txt.js                               //
//                                                                                              //
//////////////////////////////////////////////////////////////////////////////////////////////////
                                                                                                //
(function () {

////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                        //
// packages/gadicohen:robots-txt/robots.js                                                //
//                                                                                        //
////////////////////////////////////////////////////////////////////////////////////////////
                                                                                          //
var pubRoot, match, stack;                                                                // 1
var fs = Npm.require('fs'),                                                               // 2
  path = Npm.require('path');                                                             // 3
                                                                                          // 4
if (__meteor_bootstrap__.bundle) {                                                        // 5
	// TODO, remove in 2014                                                                  // 6
	pubRoot = __meteor_bootstrap__.bundle.root + 'public';                                   // 7
} else {                                                                                  // 8
	pubRoot = path.join(__meteor_bootstrap__.serverDir, '..', 'client', 'app');              // 9
//	WebApp.clientProgram.manifest = _.reject(WebApp.clientProgram.manifest, function(cp) { // 10
//		return cp.url == '/robots.txt';                                                       // 11
//	});                                                                                    // 12
//	RoutePolicy.declare('/robots.txt', 'network');                                         // 13
}                                                                                         // 14
                                                                                          // 15
// TODO, remove in 2014                                                                   // 16
stack = __meteor_bootstrap__.app                                                          // 17
	? __meteor_bootstrap__.app.stack                                                         // 18
    : WebApp.connectHandlers.stack;                                                       // 19
                                                                                          // 20
// splice necessary to jump ahead of original /robots.txt route                           // 21
stack.splice(0, 0, {                                                                      // 22
	route: '/robots.txt',                                                                    // 23
	handle: function(req, res, next) {                                                       // 24
		fs.readFile(pubRoot + '/robots.txt', function(err, data) {                              // 25
			robotsOut(res, err, data);                                                             // 26
		}.future());                                                                            // 27
	}                                                                                        // 28
});                                                                                       // 29
                                                                                          // 30
                                                                                          // 31
/*                                                                                        // 32
var app = typeof WebApp != 'undefined'                                                    // 33
    ? WebApp.connectHandlers : __meteor_bootstrap__.app;                                  // 34
app.use(function(req, res, next) {                                                        // 35
	Log(3);                                                                                  // 36
	console.log(req.url);                                                                    // 37
	return next();                                                                           // 38
});                                                                                       // 39
*/                                                                                        // 40
                                                                                          // 41
robots = {                                                                                // 42
	lines: []                                                                                // 43
};                                                                                        // 44
                                                                                          // 45
function robotsOut(res, err, data) {                                                      // 46
	res.writeHead(200, {'Content-Type': 'text/plain'});                                      // 47
                                                                                          // 48
	// Generally: if the file exists, serve it.                                              // 49
	if (!err)                                                                                // 50
		res.write(data + '\n');                                                                 // 51
                                                                                          // 52
	// Iterate through all our other added lines                                             // 53
	for (var i=0; i < robots.lines.length; i++)                                              // 54
		res.write(robots.lines[i] + '\n');                                                      // 55
                                                                                          // 56
	res.end();                                                                               // 57
}                                                                                         // 58
                                                                                          // 59
robots.addLine = function(line) {                                                         // 60
	this.lines.push(line);                                                                   // 61
};                                                                                        // 62
                                                                                          // 63
////////////////////////////////////////////////////////////////////////////////////////////

}).call(this);

//////////////////////////////////////////////////////////////////////////////////////////////////

}).call(this);


/* Exports */
Package._define("gadicohen:robots-txt", {
  robots: robots
});

})();
