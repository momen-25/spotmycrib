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
var WebAppInternals = Package.webapp.WebAppInternals;
var main = Package.webapp.main;
var DDP = Package['ddp-client'].DDP;
var DDPServer = Package['ddp-server'].DDPServer;
var Autoupdate = Package.autoupdate.Autoupdate;

/* Package-scope variables */
var __coffeescriptShare, Knox, AWS;

(function(){

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                                 //
// packages/lepozepo_s3/server/startup.coffee.js                                                                   //
//                                                                                                                 //
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                                                                                                                   //
__coffeescriptShare = typeof __coffeescriptShare === 'object' ? __coffeescriptShare : {}; var share = __coffeescriptShare;
var processBrowser;           

Knox = Npm.require("knox");

processBrowser = process.browser;

process.browser = false;

AWS = Npm.require("aws-sdk");

process.browser = processBrowser;

this.S3 = {
  config: {},
  knox: {},
  aws: {},
  rules: {}
};

Meteor.startup(function() {
  if (!_.has(S3.config, "key")) {
    console.log("S3: AWS key is undefined");
  }
  if (!_.has(S3.config, "secret")) {
    console.log("S3: AWS secret is undefined");
  }
  if (!_.has(S3.config, "bucket")) {
    console.log("S3: AWS bucket is undefined");
  }
  if (!_.has(S3.config, "bucket") || !_.has(S3.config, "secret") || !_.has(S3.config, "key")) {
    return;
  }
  _.defaults(S3.config, {
    region: "us-east-1"
  });
  S3.knox = Knox.createClient(S3.config);
  return S3.aws = new AWS.S3({
    accessKeyId: S3.config.key,
    secretAccessKey: S3.config.secret,
    region: S3.config.region
  });
});

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

}).call(this);






(function(){

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                                 //
// packages/lepozepo_s3/server/sign_request.coffee.js                                                              //
//                                                                                                                 //
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                                                                                                                   //
__coffeescriptShare = typeof __coffeescriptShare === 'object' ? __coffeescriptShare : {}; var share = __coffeescriptShare;
var Crypto, HmacSHA256, calculate_signature, moment;

Meteor.methods({
  _s3_sign: function(ops) {
    var expiration, key, meta_credential, meta_date, meta_uuid, policy, post_url, signature;
    if (ops == null) {
      ops = {};
    }
    this.unblock();
    _.defaults(ops, {
      expiration: 1800000,
      path: "",
      bucket: S3.config.bucket,
      acl: "public-read",
      region: S3.config.region,
      server_side_encryption: false,
      content_disposition: "inline"
    });
    check(ops, {
      expiration: Number,
      path: String,
      bucket: String,
      acl: String,
      region: String,
      server_side_encryption: Boolean,
      file_type: String,
      file_name: String,
      file_size: Number,
      content_disposition: String
    });
    expiration = new Date(Date.now() + ops.expiration);
    expiration = expiration.toISOString();
    if (_.isEmpty(ops.path)) {
      key = "" + ops.file_name;
    } else {
      key = ops.path + "/" + ops.file_name;
    }
    meta_uuid = Random.id();
    meta_date = (moment().format('YYYYMMDD')) + "T000000Z";
    meta_credential = S3.config.key + "/" + (moment().format('YYYYMMDD')) + "/" + ops.region + "/s3/aws4_request";
    policy = {
      "expiration": expiration,
      "conditions": [
        ["content-length-range", 0, ops.file_size], {
          "key": key
        }, {
          "bucket": ops.bucket
        }, {
          "Content-Type": ops.file_type
        }, {
          "acl": ops.acl
        }, {
          "x-amz-algorithm": "AWS4-HMAC-SHA256"
        }, {
          "x-amz-credential": meta_credential
        }, {
          "x-amz-date": meta_date
        }, {
          "x-amz-meta-uuid": meta_uuid
        }
      ]
    };
    if (ops.content_disposition) {
      policy["conditions"].push({
        "Content-Disposition": ops.content_disposition
      });
    }
    if (ops.server_side_encryption) {
      policy["conditions"].push({
        "x-amz-server-side-encryption": "AES256"
      });
    }
    policy = new Buffer(JSON.stringify(policy), "utf-8").toString("base64");
    signature = calculate_signature(policy, ops.region);
    if (ops.region === "us-east-1" || ops.region === "us-standard") {
      post_url = "https://s3.amazonaws.com/" + ops.bucket;
    } else {
      post_url = "https://s3-" + ops.region + ".amazonaws.com/" + ops.bucket;
    }
    return {
      policy: policy,
      signature: signature,
      access_key: S3.config.key,
      post_url: post_url,
      url: (post_url + "/" + key).replace("https://", "http://"),
      secure_url: post_url + "/" + key,
      relative_url: "/" + key,
      bucket: ops.bucket,
      acl: ops.acl,
      key: key,
      file_type: ops.file_type,
      file_name: ops.file_name,
      meta_uuid: meta_uuid,
      meta_date: meta_date,
      meta_credential: meta_credential
    };
  }
});

Crypto = Npm.require("crypto-js");

moment = Npm.require("moment");

HmacSHA256 = Crypto.HmacSHA256;

calculate_signature = function(policy, region) {
  var kDate, kRegion, kService, signature_key;
  kDate = HmacSHA256(moment().format("YYYYMMDD"), "AWS4" + S3.config.secret);
  kRegion = HmacSHA256(region, kDate);
  kService = HmacSHA256("s3", kRegion);
  signature_key = HmacSHA256("aws4_request", kService);
  return HmacSHA256(policy, signature_key).toString(Crypto.enc.Hex);
};

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

}).call(this);






(function(){

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                                 //
// packages/lepozepo_s3/server/delete_object.coffee.js                                                             //
//                                                                                                                 //
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                                                                                                                   //
__coffeescriptShare = typeof __coffeescriptShare === 'object' ? __coffeescriptShare : {}; var share = __coffeescriptShare;
var Future;

Future = Npm.require('fibers/future');

Meteor.methods({
  _s3_delete: function(path) {
    var auth_function, delete_context, future, ref;
    this.unblock();
    check(path, String);
    future = new Future();
    if ((ref = S3.rules) != null ? ref["delete"] : void 0) {
      delete_context = _.extend(this, {
        s3_delete_path: path
      });
      auth_function = _.bind(S3.rules["delete"], delete_context);
      if (!auth_function()) {
        throw new Meteor.Error("Unauthorized", "Delete not allowed");
      }
    }
    S3.knox.deleteFile(path, function(e, r) {
      if (e) {
        return future["return"](e);
      } else {
        return future["return"](true);
      }
    });
    return future.wait();
  }
});

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

}).call(this);


/* Exports */
Package._define("lepozepo:s3", {
  Knox: Knox,
  AWS: AWS
});

})();

//# sourceURL=meteor://💻app/packages/lepozepo_s3.js
//# sourceMappingURL=data:application/json;charset=utf8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm1ldGVvcjovL/CfkrthcHAvcGFja2FnZXMvbGVwb3plcG9fczMvc2VydmVyL3N0YXJ0dXAuY29mZmVlIiwibWV0ZW9yOi8v8J+Su2FwcC9wYWNrYWdlcy9sZXBvemVwb19zMy9zZXJ2ZXIvc2lnbl9yZXF1ZXN0LmNvZmZlZSIsIm1ldGVvcjovL/CfkrthcHAvcGFja2FnZXMvbGVwb3plcG9fczMvc2VydmVyL2RlbGV0ZV9vYmplY3QuY29mZmVlIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7O0FBQ0E7O0FBQUEsT0FBTyxHQUFHLENBQUMsT0FBSixDQUFZLE1BQVosQ0FBUDs7QUFBQSxjQUVBLEdBQWlCLE9BQU8sQ0FBQyxPQUZ6Qjs7QUFBQSxPQUdPLENBQUMsT0FBUixHQUFrQixLQUhsQjs7QUFBQSxHQUlBLEdBQU0sR0FBRyxDQUFDLE9BQUosQ0FBWSxTQUFaLENBSk47O0FBQUEsT0FLTyxDQUFDLE9BQVIsR0FBa0IsY0FMbEI7O0FBQUEsSUFRQyxHQUFELEdBQ0M7QUFBQSxVQUFPLEVBQVA7QUFBQSxFQUNBLE1BQUssRUFETDtBQUFBLEVBRUEsS0FBSSxFQUZKO0FBQUEsRUFHQSxPQUFNLEVBSE47Q0FURDs7QUFBQSxNQWNNLENBQUMsT0FBUCxDQUFlO0FBQ2QsTUFBRyxFQUFLLENBQUMsR0FBRixDQUFNLEVBQUUsQ0FBQyxNQUFULEVBQWdCLEtBQWhCLENBQVA7QUFDQyxXQUFPLENBQUMsR0FBUixDQUFZLDBCQUFaLEVBREQ7R0FBQTtBQUdBLE1BQUcsRUFBSyxDQUFDLEdBQUYsQ0FBTSxFQUFFLENBQUMsTUFBVCxFQUFnQixRQUFoQixDQUFQO0FBQ0MsV0FBTyxDQUFDLEdBQVIsQ0FBWSw2QkFBWixFQUREO0dBSEE7QUFNQSxNQUFHLEVBQUssQ0FBQyxHQUFGLENBQU0sRUFBRSxDQUFDLE1BQVQsRUFBZ0IsUUFBaEIsQ0FBUDtBQUNDLFdBQU8sQ0FBQyxHQUFSLENBQVksNkJBQVosRUFERDtHQU5B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O0FBQUEsTUFFTSxDQUFDLE9BQVAsQ0FDQztBQUFBLGNBQVksU0FBQyxJQUFEO0FBQ1g7QUFBQSxRQUFDLFFBQUQ7QUFBQSxJQUNBLE1BQU0sSUFBTixFQUFXLE1BQVgsQ0FEQTtBQUFBLElBR0EsU0FBYSxZQUhiO0FBS0Esc0NBQVcsQ0FBRSxRQUFGLFVBQVg7QUFDQyx1QkFBaUIsQ0FBQyxDQUFDLE1BQUYsQ0FBUyxJQUFULEVBQ2hCO0FBQUEsd0JBQWUsSUFBZjtPQURnQixDQUFqQjtBQUFBLE1BR0EsZ0JBQWdCLENBQUMsQ0FBQyxJQUFGLENBQU8sRUFBRSxDQUFDLEtBQUssQ0FBQyxRQUFELENBQWYsRUFBdUIsY0FBdkIsQ0FIaEI7QUFJQSxVQUFHLGNBQUksRUFBUDtBQUNDLGNBQVUsVUFBTSxDQUFDLEtBQVAsQ0FBYSxjQUFiLEVBQTZCLG9CQUE3QixDQUFWLENBREQ7T0FMRDtLQUxBO0FBQUEsSUFhQSxFQUFFLENBQUMsSUFBSSxDQUFDLFVBQVIsQ0FBbUIsSUFBbkIsRUFBeUIsU0FBQyxDQUFELEVBQUcsQ0FBSDtBQUN4QixVQUFHLENBQUg7ZUFDQyxNQUFNLENBQUMsUUFBRCxDQUFOLENBQWMsQ0FBZCxFQUREO09BQUE7ZUFHQyxNQUFNLENBQUMsUUFBRCxDQUFOLENBQWMsSUFBZCxFQUhEO09BRHdCO0lBQUEsQ0FBekIsQ0FiQTtXQW1CQSxNQUFNLENBQUMsSUFBUCxHQXBCVztFQUFBLENBQVo7Q0FERCxDQUZBIiwiZmlsZSI6Ii9wYWNrYWdlcy9sZXBvemVwb19zMy5qcyIsInNvdXJjZXNDb250ZW50IjpbIiNHZXQgS25veCBhbmQgQVdTIGxpYnJhcmllc1xuS25veCA9IE5wbS5yZXF1aXJlIFwia25veFwiXG5cbnByb2Nlc3NCcm93c2VyID0gcHJvY2Vzcy5icm93c2VyXG5wcm9jZXNzLmJyb3dzZXIgPSBmYWxzZVxuQVdTID0gTnBtLnJlcXVpcmUgXCJhd3Mtc2RrXCJcbnByb2Nlc3MuYnJvd3NlciA9IHByb2Nlc3NCcm93c2VyXG5cbiNTZXJ2ZXIgc2lkZSBjb25maWd1cmF0aW9uIHZhcmlhYmxlc1xuQFMzID1cblx0Y29uZmlnOnt9XG5cdGtub3g6e31cblx0YXdzOnt9XG5cdHJ1bGVzOnt9XG5cbk1ldGVvci5zdGFydHVwIC0+XG5cdGlmIG5vdCBfLmhhcyBTMy5jb25maWcsXCJrZXlcIlxuXHRcdGNvbnNvbGUubG9nIFwiUzM6IEFXUyBrZXkgaXMgdW5kZWZpbmVkXCJcblxuXHRpZiBub3QgXy5oYXMgUzMuY29uZmlnLFwic2VjcmV0XCJcblx0XHRjb25zb2xlLmxvZyBcIlMzOiBBV1Mgc2VjcmV0IGlzIHVuZGVmaW5lZFwiXG5cblx0aWYgbm90IF8uaGFzIFMzLmNvbmZpZyxcImJ1Y2tldFwiXG5cdFx0Y29uc29sZS5sb2cgXCJTMzogQVdTIGJ1Y2tldCBpcyB1bmRlZmluZWRcIlxuXG5cdGlmIG5vdCBfLmhhcyhTMy5jb25maWcsXCJidWNrZXRcIikgb3Igbm90IF8uaGFzKFMzLmNvbmZpZyxcInNlY3JldFwiKSBvciBub3QgXy5oYXMoUzMuY29uZmlnLFwia2V5XCIpXG5cdFx0cmV0dXJuXG5cblx0Xy5kZWZhdWx0cyBTMy5jb25maWcsXG5cdFx0cmVnaW9uOlwidXMtZWFzdC0xXCIgIyB1cy1zdGFuZGFyZFxuXG5cdFMzLmtub3ggPSBLbm94LmNyZWF0ZUNsaWVudCBTMy5jb25maWdcblx0UzMuYXdzID0gbmV3IEFXUy5TM1xuXHRcdGFjY2Vzc0tleUlkOlMzLmNvbmZpZy5rZXlcblx0XHRzZWNyZXRBY2Nlc3NLZXk6UzMuY29uZmlnLnNlY3JldFxuXHRcdHJlZ2lvbjpTMy5jb25maWcucmVnaW9uXG5cbiIsIk1ldGVvci5tZXRob2RzXG5cdF9zM19zaWduOiAob3BzPXt9KSAtPlxuXHRcdEB1bmJsb2NrKClcblx0XHQjIG9wcy5leHBpcmF0aW9uOiB0aGUgc2lnbmF0dXJlIGV4cGlyZXMgYWZ0ZXIgeCBtaWxsaXNlY29uZHMgfCBkZWZhdWx0cyB0byAzMCBtaW51dGVzXG5cdFx0IyBvcHMucGF0aFxuXHRcdCMgb3BzLmZpbGVfdHlwZVxuXHRcdCMgb3BzLmZpbGVfbmFtZVxuXHRcdCMgb3BzLmZpbGVfc2l6ZVxuXHRcdCMgb3BzLmFjbFxuXHRcdCMgb3BzLmJ1Y2tldFxuXHRcdCMgb3BzLnNlcnZlcl9zaWRlX2VuY3J5cHRpb25cblx0XHQjIG9wcy5jb250ZW50X2Rpc3Bvc2l0aW9uXG5cblx0XHRfLmRlZmF1bHRzIG9wcyxcblx0XHRcdGV4cGlyYXRpb246MTgwMDAwMFxuXHRcdFx0cGF0aDpcIlwiXG5cdFx0XHRidWNrZXQ6UzMuY29uZmlnLmJ1Y2tldFxuXHRcdFx0YWNsOlwicHVibGljLXJlYWRcIlxuXHRcdFx0cmVnaW9uOlMzLmNvbmZpZy5yZWdpb25cblx0XHRcdHNlcnZlcl9zaWRlX2VuY3J5cHRpb246ZmFsc2Vcblx0XHRcdGNvbnRlbnRfZGlzcG9zaXRpb246XCJpbmxpbmVcIlxuXG5cdFx0Y2hlY2sgb3BzLFxuXHRcdFx0ZXhwaXJhdGlvbjpOdW1iZXJcblx0XHRcdHBhdGg6U3RyaW5nXG5cdFx0XHRidWNrZXQ6U3RyaW5nXG5cdFx0XHRhY2w6U3RyaW5nXG5cdFx0XHRyZWdpb246U3RyaW5nXG5cdFx0XHRzZXJ2ZXJfc2lkZV9lbmNyeXB0aW9uOkJvb2xlYW5cblx0XHRcdGZpbGVfdHlwZTpTdHJpbmdcblx0XHRcdGZpbGVfbmFtZTpTdHJpbmdcblx0XHRcdGZpbGVfc2l6ZTpOdW1iZXJcblx0XHRcdGNvbnRlbnRfZGlzcG9zaXRpb246U3RyaW5nXG5cblx0XHRleHBpcmF0aW9uID0gbmV3IERhdGUgRGF0ZS5ub3coKSArIG9wcy5leHBpcmF0aW9uXG5cdFx0ZXhwaXJhdGlvbiA9IGV4cGlyYXRpb24udG9JU09TdHJpbmcoKVxuXG5cdFx0aWYgXy5pc0VtcHR5IG9wcy5wYXRoXG5cdFx0XHRrZXkgPSBcIiN7b3BzLmZpbGVfbmFtZX1cIlxuXHRcdGVsc2Vcblx0XHRcdGtleSA9IFwiI3tvcHMucGF0aH0vI3tvcHMuZmlsZV9uYW1lfVwiXG5cblx0XHRtZXRhX3V1aWQgPSBSYW5kb20uaWQoKVxuXHRcdG1ldGFfZGF0ZSA9IFwiI3ttb21lbnQoKS5mb3JtYXQoJ1lZWVlNTUREJyl9VDAwMDAwMFpcIlxuXHRcdG1ldGFfY3JlZGVudGlhbCA9IFwiI3tTMy5jb25maWcua2V5fS8je21vbWVudCgpLmZvcm1hdCgnWVlZWU1NREQnKX0vI3tvcHMucmVnaW9ufS9zMy9hd3M0X3JlcXVlc3RcIlxuXHRcdHBvbGljeSA9XG5cdFx0XHRcImV4cGlyYXRpb25cIjpleHBpcmF0aW9uXG5cdFx0XHRcImNvbmRpdGlvbnNcIjpbXG5cdFx0XHRcdFtcImNvbnRlbnQtbGVuZ3RoLXJhbmdlXCIsMCxvcHMuZmlsZV9zaXplXVxuXHRcdFx0XHR7XCJrZXlcIjprZXl9XG5cdFx0XHRcdHtcImJ1Y2tldFwiOm9wcy5idWNrZXR9XG5cdFx0XHRcdHtcIkNvbnRlbnQtVHlwZVwiOm9wcy5maWxlX3R5cGV9XG5cdFx0XHRcdHtcImFjbFwiOm9wcy5hY2x9XG5cdFx0XHRcdHtcIngtYW16LWFsZ29yaXRobVwiOiBcIkFXUzQtSE1BQy1TSEEyNTZcIn1cblx0XHRcdFx0e1wieC1hbXotY3JlZGVudGlhbFwiOiBtZXRhX2NyZWRlbnRpYWx9XG5cdFx0XHRcdHtcIngtYW16LWRhdGVcIjogbWV0YV9kYXRlIH1cblx0XHRcdFx0e1wieC1hbXotbWV0YS11dWlkXCI6IG1ldGFfdXVpZH1cblx0XHRcdF1cblx0XHRpZiBvcHMuY29udGVudF9kaXNwb3NpdGlvblxuXHRcdFx0cG9saWN5W1wiY29uZGl0aW9uc1wiXS5wdXNoKHtcIkNvbnRlbnQtRGlzcG9zaXRpb25cIjogb3BzLmNvbnRlbnRfZGlzcG9zaXRpb259KVxuXHRcdGlmIG9wcy5zZXJ2ZXJfc2lkZV9lbmNyeXB0aW9uXG5cdFx0XHRwb2xpY3lbXCJjb25kaXRpb25zXCJdLnB1c2goe1wieC1hbXotc2VydmVyLXNpZGUtZW5jcnlwdGlvblwiOiBcIkFFUzI1NlwifSlcblxuXHRcdCMgRW5jb2RlIHRoZSBwb2xpY3lcblx0XHRwb2xpY3kgPSBuZXcgQnVmZmVyKEpTT04uc3RyaW5naWZ5KHBvbGljeSksIFwidXRmLThcIikudG9TdHJpbmcoXCJiYXNlNjRcIilcblxuXHRcdCMgU2lnbiB0aGUgcG9saWN5XG5cdFx0c2lnbmF0dXJlID0gY2FsY3VsYXRlX3NpZ25hdHVyZSBwb2xpY3ksIG9wcy5yZWdpb25cblxuXHRcdCMgSWRlbnRpZnkgcG9zdF91cmxcblx0XHRpZiBvcHMucmVnaW9uIGlzIFwidXMtZWFzdC0xXCIgb3Igb3BzLnJlZ2lvbiBpcyBcInVzLXN0YW5kYXJkXCJcblx0XHRcdHBvc3RfdXJsID0gXCJodHRwczovL3MzLmFtYXpvbmF3cy5jb20vI3tvcHMuYnVja2V0fVwiXG5cdFx0ZWxzZVxuXHRcdFx0cG9zdF91cmwgPSBcImh0dHBzOi8vczMtI3tvcHMucmVnaW9ufS5hbWF6b25hd3MuY29tLyN7b3BzLmJ1Y2tldH1cIlxuXG5cdFx0IyBSZXR1cm4gcmVzdWx0c1xuXHRcdHBvbGljeTpwb2xpY3lcblx0XHRzaWduYXR1cmU6c2lnbmF0dXJlXG5cdFx0YWNjZXNzX2tleTpTMy5jb25maWcua2V5XG5cdFx0cG9zdF91cmw6cG9zdF91cmxcblx0XHR1cmw6XCIje3Bvc3RfdXJsfS8je2tleX1cIi5yZXBsYWNlKFwiaHR0cHM6Ly9cIixcImh0dHA6Ly9cIilcblx0XHRzZWN1cmVfdXJsOlwiI3twb3N0X3VybH0vI3trZXl9XCJcblx0XHRyZWxhdGl2ZV91cmw6XCIvI3trZXl9XCJcblx0XHRidWNrZXQ6b3BzLmJ1Y2tldFxuXHRcdGFjbDpvcHMuYWNsXG5cdFx0a2V5OmtleVxuXHRcdGZpbGVfdHlwZTpvcHMuZmlsZV90eXBlXG5cdFx0ZmlsZV9uYW1lOm9wcy5maWxlX25hbWVcblx0XHRtZXRhX3V1aWQ6bWV0YV91dWlkXG5cdFx0bWV0YV9kYXRlOm1ldGFfZGF0ZVxuXHRcdG1ldGFfY3JlZGVudGlhbDptZXRhX2NyZWRlbnRpYWxcblxuXG4jIGNyeXB0byA9IE5wbS5yZXF1aXJlKFwiY3J5cHRvXCIpXG5DcnlwdG8gPSBOcG0ucmVxdWlyZSBcImNyeXB0by1qc1wiXG5tb21lbnQgPSBOcG0ucmVxdWlyZSBcIm1vbWVudFwiXG57SG1hY1NIQTI1Nn0gPSBDcnlwdG9cblxuY2FsY3VsYXRlX3NpZ25hdHVyZSA9IChwb2xpY3ksIHJlZ2lvbikgLT5cblx0a0RhdGUgPSBIbWFjU0hBMjU2KG1vbWVudCgpLmZvcm1hdChcIllZWVlNTUREXCIpLCBcIkFXUzRcIiArIFMzLmNvbmZpZy5zZWNyZXQpO1xuXHRrUmVnaW9uID0gSG1hY1NIQTI1NihyZWdpb24sIGtEYXRlKTtcblx0a1NlcnZpY2UgPSBIbWFjU0hBMjU2KFwiczNcIiwga1JlZ2lvbik7XG5cdHNpZ25hdHVyZV9rZXkgPSBIbWFjU0hBMjU2KFwiYXdzNF9yZXF1ZXN0XCIsIGtTZXJ2aWNlKTtcblxuXHRIbWFjU0hBMjU2IHBvbGljeSwgc2lnbmF0dXJlX2tleVxuXHRcdC50b1N0cmluZyBDcnlwdG8uZW5jLkhleFxuXG5cbiIsIkZ1dHVyZSA9IE5wbS5yZXF1aXJlICdmaWJlcnMvZnV0dXJlJ1xuXG5NZXRlb3IubWV0aG9kc1xuXHRfczNfZGVsZXRlOiAocGF0aCkgLT5cblx0XHRAdW5ibG9jaygpXG5cdFx0Y2hlY2sgcGF0aCxTdHJpbmdcblxuXHRcdGZ1dHVyZSA9IG5ldyBGdXR1cmUoKVxuXG5cdFx0aWYgUzMucnVsZXM/LmRlbGV0ZVxuXHRcdFx0ZGVsZXRlX2NvbnRleHQgPSBfLmV4dGVuZCB0aGlzLFxuXHRcdFx0XHRzM19kZWxldGVfcGF0aDpwYXRoXG5cblx0XHRcdGF1dGhfZnVuY3Rpb24gPSBfLmJpbmQgUzMucnVsZXMuZGVsZXRlLGRlbGV0ZV9jb250ZXh0XG5cdFx0XHRpZiBub3QgYXV0aF9mdW5jdGlvbigpXG5cdFx0XHRcdHRocm93IG5ldyBNZXRlb3IuRXJyb3IgXCJVbmF1dGhvcml6ZWRcIiwgXCJEZWxldGUgbm90IGFsbG93ZWRcIlxuXG5cdFx0UzMua25veC5kZWxldGVGaWxlIHBhdGgsIChlLHIpIC0+XG5cdFx0XHRpZiBlXG5cdFx0XHRcdGZ1dHVyZS5yZXR1cm4gZVxuXHRcdFx0ZWxzZVxuXHRcdFx0XHRmdXR1cmUucmV0dXJuIHRydWVcblxuXHRcdGZ1dHVyZS53YWl0KClcbiJdfQ==
