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
var Template = Package['templating-runtime'].Template;
var Session = Package.session.Session;
var Blaze = Package.blaze.Blaze;
var UI = Package.blaze.UI;
var Handlebars = Package.blaze.Handlebars;
var ReactiveVar = Package['reactive-var'].ReactiveVar;
var HTML = Package.htmljs.HTML;
var Spacebars = Package.spacebars.Spacebars;

/* Package-scope variables */
var MeteorCamera, desiredHeight, desiredWidth;

(function(){

//////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                              //
// packages/perak_camera/template.photo.js                                                                      //
//                                                                                                              //
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                                                                                                                //

Template.__checkName("camera");
Template["camera"] = new Template("Template.camera", (function() {
  var view = this;
  return [ HTML.Raw('<div class="camera-overlay">\n    \n  </div>\n\n  '), HTML.DIV({
    class: function() {
      return [ "camera-popup ", Blaze.If(function() {
        return Spacebars.call(view.lookup("permissionDeniedError"));
      }, function() {
        return "camera-popup-wide";
      }) ];
    }
  }, "\n    ", Blaze.If(function() {
    return Spacebars.call(view.lookup("error"));
  }, function() {
    return [ "\n      ", Blaze.If(function() {
      return Spacebars.call(view.lookup("permissionDeniedError"));
    }, function() {
      return [ "\n        ", Spacebars.include(view.lookupTemplate("permissionDenied")), "\n      " ];
    }, function() {
      return [ "\n        ", Blaze.If(function() {
        return Spacebars.call(view.lookup("browserNotSupportedError"));
      }, function() {
        return [ "\n          ", Blaze._TemplateWith(function() {
          return {
            message: Spacebars.call("Sorry, this browser is currently not supported for camera functionality.")
          };
        }, function() {
          return Spacebars.include(view.lookupTemplate("genericError"));
        }), "\n        " ];
      }, function() {
        return [ "\n          ", Blaze._TemplateWith(function() {
          return {
            message: Spacebars.call("There was an error accessing the camera.")
          };
        }, function() {
          return Spacebars.include(view.lookupTemplate("genericError"));
        }), "\n        " ];
      }), "\n      " ];
    }), "\n    " ];
  }, function() {
    return [ "\n      ", Blaze.If(function() {
      return Spacebars.call(view.lookup("photo"));
    }, function() {
      return [ "\n        ", HTML.DIV({
        class: "center"
      }, "\n          ", HTML.IMG({
        src: function() {
          return Spacebars.mustache(view.lookup("photo"));
        },
        class: "photo-preview"
      }), HTML.Raw('\n          <div>\n            <button class="button use-photo">Use Photo</button>\n            <button class="button new-photo">Take New Photo</button>\n          </div>\n        ')), "\n      " ];
    }, function() {
      return [ "\n        ", Spacebars.include(view.lookupTemplate("viewfinder")), "\n      " ];
    }), "\n    " ];
  }), "\n  ") ];
}));

Template.__checkName("viewfinder");
Template["viewfinder"] = new Template("Template.viewfinder", (function() {
  var view = this;
  return [ HTML.DIV({
    class: "viewfinder"
  }, "\n    ", HTML.VIDEO({
    id: "video",
    class: function() {
      return Blaze.If(function() {
        return Spacebars.call(view.lookup("waitingForPermission"));
      }, function() {
        return "hidden";
      });
    }
  }, "\n      "), "\n    \n    ", HTML.DIV("\n      ", Blaze.If(function() {
    return Spacebars.call(view.lookup("waitingForPermission"));
  }, function() {
    return HTML.Raw("\n        <p>Waiting for camera permissions...</p>\n      ");
  }, function() {
    return HTML.Raw('\n        <button class="button shutter">Take Photo</button>\n      ');
  }), HTML.Raw('\n      <button class="button cancel">Cancel</button>\n    ')), "\n  "), HTML.Raw('\n\n  <canvas id="canvas" style="visibility: hidden"></canvas>') ];
}));

Template.__checkName("genericError");
Template["genericError"] = new Template("Template.genericError", (function() {
  var view = this;
  return HTML.DIV({
    class: "generic-error"
  }, "\n    ", HTML.P(Blaze.View("lookup:message", function() {
    return Spacebars.mustache(view.lookup("message"));
  })), HTML.Raw('\n    <button class="button cancel">Close Popup</button>\n  '));
}));

Template.__checkName("permissionDenied");
Template["permissionDenied"] = new Template("Template.permissionDenied", (function() {
  var view = this;
  return HTML.Raw('<div class="permission-denied-error">\n    <h2>Camera Permissions Denied</h2>\n\n    <p>\n      You have denied this app permission to use your camera.\n      If you would like to allow permissions, follow the directions for your\n      browser below.\n    </p>\n\n    <dl class="permissions-howto">\n      <dt>Google Chrome</dt>\n        <dd>Go to Settings > "Show advanced settings..." >\n          "Content settings..." > Media heading > "Manage exceptions...",\n          then find this website in the list and allow video capture.</dd>\n      <dt>Mozilla Firefox</dt>\n        <dd>Reload the page and try again.</dd>\n      <dt>Opera</dt>\n        <dd>Go to Preferences > Websites > Media heading >\n          "Manage exceptions...", then find this website in the list and\n          allow video capture.</dd>\n    </dl>\n\n    <button class="button cancel">Close Popup</button>\n  </div>');
}));

//////////////////////////////////////////////////////////////////////////////////////////////////////////////////

}).call(this);






(function(){

//////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                              //
// packages/perak_camera/photo.js                                                                               //
//                                                                                                              //
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                                                                                                                //
MeteorCamera = {};
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////

}).call(this);






(function(){

//////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                              //
// packages/perak_camera/photo-browser.js                                                                       //
//                                                                                                              //
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                                                                                                                //
var stream;
var closeAndCallback;

var photo = new ReactiveVar(null);
var error = new ReactiveVar(null);
var waitingForPermission = new ReactiveVar(null);

var canvasWidth = 0;
var canvasHeight = 0;

var quality = 80;

Template.viewfinder.rendered = function() {
  var template = this;

  waitingForPermission.set(true);

  var video = template.find("video");

  // stream webcam video to the <video> element
  var success = function(newStream) {
    stream = newStream;

    if (navigator.mozGetUserMedia) {
      video.mozSrcObject = stream;
    } else {
      var vendorURL = window.URL || window.webkitURL;
      //video.src = vendorURL.createObjectURL(stream);
      video.src = stream;
    }
    video.play();

    waitingForPermission.set(false);
  };

  // user declined or there was some other error
  var failure = function(err) {
    error.set(err);
  };

  // tons of different browser prefixes
  navigator.getUserMedia = (
    navigator.getUserMedia ||
    navigator.webkitGetUserMedia ||
    navigator.mozGetUserMedia ||
    navigator.msGetUserMedia
  );

  if (! navigator.getUserMedia) {
    // no browser support, sorry
    failure("BROWSER_NOT_SUPPORTED");
    return;
  }

  // initiate request for webcam
  navigator.getUserMedia({
      video: true,
      audio: false
  }, success, failure);

  // resize viewfinder to a reasonable size, not necessarily photo size
  var viewfinderWidth = 320;
  var viewfinderHeight = 240;
  var resized = false;
  video.addEventListener('canplay', function() {
    if (! resized) {
      viewfinderHeight = video.videoHeight / (video.videoWidth / viewfinderWidth);
      video.setAttribute('width', viewfinderWidth);
      video.setAttribute('height', viewfinderHeight);
      resized = true;
    }
  }, false);
};

// is the current error a permission denied error?
var permissionDeniedError = function () {
  return error.get() && (
    error.get().name === "PermissionDeniedError" || // Chrome and Opera
    error.get() === "PERMISSION_DENIED" // Firefox
  );
};

// is the current error a browser not supported error?
var browserNotSupportedError = function () {
  return error.get() && error.get() === "BROWSER_NOT_SUPPORTED";
};

var stopStream = function(st) {
  if(!st) {
    return;
  }

  if(st.stop) {
    st.stop();
    return;
  }

  if(st.getTracks) {
    var tracks = st.getTracks();
    for(var i = 0; i < tracks.length; i++) {
      var track = tracks[i];
      if(track && track.stop) {
        track.stop();
      }
    }
  }
};

Template.camera.helpers({
  photo: function () {
    return photo.get();
  },
  error: function () {
    return error.get();
  },
  permissionDeniedError: permissionDeniedError,
  browserNotSupportedError: browserNotSupportedError
});

Template.camera.events({
  "click .use-photo": function () {
    closeAndCallback(null, photo.get());
  },
  "click .new-photo": function () {
    photo.set(null);
  },
  "click .cancel": function () {
    if (permissionDeniedError()) {
      closeAndCallback(new Meteor.Error("permissionDenied", "Camera permissions were denied."));
    } else if (browserNotSupportedError()) {
      closeAndCallback(new Meteor.Error("browserNotSupported", "This browser isn't supported."));
    } else if (error.get()) {
      closeAndCallback(new Meteor.Error("unknownError", "There was an error while accessing the camera."));
    } else {
      closeAndCallback(new Meteor.Error("cancel", "Photo taking was cancelled."));
    }
    
    if (stream) {
      stopStream(stream);
    }
  }
});

Template.viewfinder.events({
  'click .shutter': function (event, template) {
    var video = template.find("video");
    var canvas = template.find("canvas");

    canvas.width = canvasWidth;
    canvas.height = canvasHeight;
    canvas.getContext('2d').drawImage(video, 0, 0, canvasWidth, canvasHeight);
    var data = canvas.toDataURL('image/jpeg', quality);
    photo.set(data);
    stopStream(stream);
  }
});

Template.viewfinder.helpers({
  "waitingForPermission": function () {
    return waitingForPermission.get();
  }
});

/**
 * @summary Get a picture from the device's default camera.
 * @param  {Object}   options  Options
 * @param {Number} options.height The minimum height of the image
 * @param {Number} options.width The minimum width of the image
 * @param {Number} options.quality [description]
 * @param  {Function} callback A callback that is called with two arguments:
 * 1. error, an object that contains error.message and possibly other properties
 * depending on platform
 * 2. data, a Data URI string with the image encoded in JPEG format, ready to
 * use as the `src` attribute on an `<img />` tag.
 */
MeteorCamera.getPicture = function (options, callback) {
  // if options are not passed
  if (! callback) {
    callback = options;
    options = {};
  }

  desiredHeight = options.height || 640;
  desiredWidth = options.width || 480;

  // Canvas#toDataURL takes the quality as a 0-1 value, not a percentage
  quality = (options.quality || 49) / 100;

  if (desiredHeight * 4 / 3 > desiredWidth) {
    canvasWidth = desiredHeight * 4 / 3;
    canvasHeight = desiredHeight;
  } else {
    canvasHeight = desiredWidth * 3 / 4;
    canvasWidth = desiredWidth;
  }

  canvasWidth = Math.round(canvasWidth);
  canvasHeight = Math.round(canvasHeight);

  var view;
  
  closeAndCallback = function () {
    var originalArgs = arguments;
    UI.remove(view);
    photo.set(null);
    callback.apply(null, originalArgs);
  };
  
  view = UI.renderWithData(Template.camera);
  UI.insert(view, document.body);
};

//////////////////////////////////////////////////////////////////////////////////////////////////////////////////

}).call(this);


/* Exports */
Package._define("perak:camera", {
  MeteorCamera: MeteorCamera
});

})();
