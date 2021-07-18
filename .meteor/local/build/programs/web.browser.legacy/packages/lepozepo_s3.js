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
var ServiceConfiguration = Package['service-configuration'].ServiceConfiguration;
var check = Package.check.check;
var Match = Package.check.Match;
var Random = Package.random.Random;
var WebApp = Package.webapp.WebApp;
var DDP = Package['ddp-client'].DDP;
var Autoupdate = Package.autoupdate.Autoupdate;
var Reload = Package.reload.Reload;

/* Package-scope variables */
var __coffeescriptShare;

(function(){

///////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                               //
// packages/lepozepo_s3/client/functions.coffee.js                                                               //
//                                                                                                               //
///////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                                                                                                                 //
__coffeescriptShare = typeof __coffeescriptShare === 'object' ? __coffeescriptShare : {}; var share = __coffeescriptShare;
var uploadFile;

this.S3 = {
  collection: new Meteor.Collection(null),
  upload: function(ops, callback) {
    if (ops == null) {
      ops = {};
    }
    _.defaults(ops, {
      expiration: 1800000,
      path: "",
      acl: "public-read",
      uploader: "default",
      unique_name: true,
      connection: Meteor,
      server_side_encryption: false,
      content_disposition: "inline"
    });
    if (ops.file) {
      return uploadFile(ops.file, ops, callback);
    } else {
      return _.each(ops.files, function(file) {
        return uploadFile(file, ops, callback);
      });
    }
  },
  "delete": function(path, callback, connection) {
    var conn;
    conn = connection ? connection : Meteor;
    return conn.call("_s3_delete", path, callback);
  },
  b64toBlob: function(b64Data, contentType, sliceSize) {
    var blob, byteArray, byteArrays, byteCharacters, byteNumbers, data, i, j, k, offset, ref, ref1, ref2, slice;
    data = b64Data.split("base64,");
    if (!contentType) {
      contentType = data[0].replace("data:", "").replace(";", "");
    }
    contentType = contentType;
    sliceSize = sliceSize || 512;
    byteCharacters = atob(data[1]);
    byteArrays = [];
    for (offset = j = 0, ref = byteCharacters.length, ref1 = sliceSize; ref1 > 0 ? j < ref : j > ref; offset = j += ref1) {
      slice = byteCharacters.slice(offset, offset + sliceSize);
      byteNumbers = new Array(slice.length);
      for (i = k = 0, ref2 = slice.length; 0 <= ref2 ? k < ref2 : k > ref2; i = 0 <= ref2 ? ++k : --k) {
        byteNumbers[i] = slice.charCodeAt(i);
      }
      byteArray = new Uint8Array(byteNumbers);
      byteArrays.push(byteArray);
    }
    blob = new Blob(byteArrays, {
      type: contentType
    });
    return blob;
  }
};

uploadFile = function(file, ops, callback) {
  var extension, file_name, id, initial_file_data, ref;
  if (ops.encoding === "base64") {
    if (_.isString(file)) {
      file = S3.b64toBlob(file);
    }
  }
  if (ops.unique_name || ops.encoding === "base64") {
    extension = _.last((ref = file.name) != null ? ref.split(".") : void 0);
    if (!extension) {
      extension = file.type.split("/")[1];
    }
    file_name = (Random.id()) + "." + extension;
  } else {
    if (_.isFunction(file.upload_name)) {
      file_name = file.upload_name(file);
    } else if (!_.isEmpty(file.upload_name)) {
      file_name = file.upload_name;
    } else {
      file_name = file.name;
    }
  }
  initial_file_data = {
    file: {
      name: file_name,
      type: file.type,
      size: file.size,
      original_name: file.name
    },
    loaded: 0,
    total: file.size,
    percent_uploaded: 0,
    uploader: ops.uploader,
    status: "signing"
  };
  id = S3.collection.insert(initial_file_data);
  return ops.connection.call("_s3_sign", {
    path: ops.path,
    file_name: initial_file_data.file.name,
    file_type: file.type,
    file_size: file.size,
    acl: ops.acl,
    bucket: ops.bucket,
    region: ops.region,
    expiration: ops.expiration,
    server_side_encryption: ops.server_side_encryption,
    content_disposition: ops.content_disposition
  }, function(error, result) {
    var form_data, xhr;
    if (result) {
      S3.collection.update(id, {
        $set: {
          status: "uploading"
        }
      });
      form_data = new FormData();
      form_data.append("key", result.key);
      form_data.append("acl", result.acl);
      form_data.append("Content-Type", result.file_type);
      if (ops.content_disposition) {
        form_data.append("Content-Disposition", ops.content_disposition);
      }
      form_data.append("X-Amz-Date", result.meta_date);
      if (ops.server_side_encryption) {
        form_data.append("x-amz-server-side-encryption", "AES256");
      }
      form_data.append("x-amz-meta-uuid", result.meta_uuid);
      form_data.append("X-Amz-Algorithm", "AWS4-HMAC-SHA256");
      form_data.append("X-Amz-Credential", result.meta_credential);
      form_data.append("X-Amz-Signature", result.signature);
      form_data.append("Policy", result.policy);
      form_data.append("file", file);
      xhr = new XMLHttpRequest();
      xhr.upload.addEventListener("progress", function(event) {
        return S3.collection.update(id, {
          $set: {
            status: "uploading",
            loaded: event.loaded,
            total: event.total,
            percent_uploaded: Math.floor((event.loaded / event.total) * 100)
          }
        });
      }, false);
      xhr.addEventListener("load", function() {
        if (xhr.status < 400) {
          S3.collection.update(id, {
            $set: {
              status: "complete",
              percent_uploaded: 100,
              url: result.url,
              secure_url: result.secure_url,
              relative_url: result.relative_url
            }
          });
          return callback && callback(null, S3.collection.findOne(id));
        } else {
          return callback && callback(true, null);
        }
      });
      xhr.addEventListener("error", function() {
        return callback && callback(true, null);
      });
      xhr.addEventListener("abort", function() {
        return console.log("aborted by user");
      });
      xhr.open("POST", result.post_url, true);
      return xhr.send(form_data);
    } else {
      return callback && callback(error, null);
    }
  });
};

///////////////////////////////////////////////////////////////////////////////////////////////////////////////////

}).call(this);


/* Exports */
Package._define("lepozepo:s3");

})();
