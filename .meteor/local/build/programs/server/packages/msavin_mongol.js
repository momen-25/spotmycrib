(function () {

/* Imports */
var Meteor = Package.meteor.Meteor;
var global = Package.meteor.global;
var meteorEnv = Package.meteor.meteorEnv;
var ECMAScript = Package.ecmascript.ECMAScript;
var MongoInternals = Package.mongo.MongoInternals;
var Mongo = Package.mongo.Mongo;
var Random = Package.random.Random;
var check = Package.check.check;
var Match = Package.check.Match;
var _ = Package.underscore._;
var meteorInstall = Package.modules.meteorInstall;
var Promise = Package.promise.Promise;

/* Package-scope variables */
var Utilities;

var require = meteorInstall({"node_modules":{"meteor":{"msavin:mongol":{"server":{"main.js":function module(require,exports,module){

///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                                   //
// packages/msavin_mongol/server/main.js                                                                             //
//                                                                                                                   //
///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                                                                                                                     //
module.link("./methods.js");
///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

},"methods.js":function module(require,exports,module){

///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                                   //
// packages/msavin_mongol/server/methods.js                                                                          //
//                                                                                                                   //
///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                                                                                                                     //
let utilities;
module.link("./utilities.js", {
  utilities(v) {
    utilities = v;
  }

}, 0);
let ToyKit;
module.link("meteor/meteortoys:toykit", {
  ToyKit(v) {
    ToyKit = v;
  }

}, 1);
let Random;
module.link("meteor/random", {
  Random(v) {
    Random = v;
  }

}, 2);

var _insertDoc = function (collectionName, documentData) {
  var newId,
      Collection = ToyKit.collection.get(collectionName);

  if (documentData._id && Collection.findOne(documentData._id)) {
    // console.log('Mongol: Duplicate _id found');
    return null;
  }

  if (!documentData._id) {
    documentData._id = Random.id();
  }

  if (!!Package['aldeed:simple-schema'] && !!Package['aldeed:collection2'] && typeof Collection.simpleSchema === "function" && Collection._c2) {
    return Collection.insert(documentData, {
      filter: false,
      autoConvert: false,
      removeEmptyStrings: false,
      validate: false
    });
  } else {
    return Collection.insert(documentData);
  }
};

Meteor.methods({
  Mongol_update: function (collectionName, documentData, originalDocumentData) {
    // console.log(arguments)
    check(collectionName, String);
    check(documentData, Object);
    check(originalDocumentData, Object);
    var Collection = ToyKit.collection.get(collectionName),
        documentID = documentData._id,
        originalID = originalDocumentData._id;
    var currentDbDoc = Collection.findOne({
      _id: documentID
    }, {
      transform: null
    }); // console.log(currentDbDoc)

    if (!currentDbDoc) {
      return _insertdoc(collectionName, documentData);
    }

    delete documentData._id;
    delete originalDocumentData._id;
    delete currentDbDoc._id;
    var updatedDocumentData = Utilities.diffDocumentData(currentDbDoc, documentData, originalDocumentData);
    delete updatedDocumentData._id; // console.log(updatedDocumentData)
    // Check for packages

    if (!!Package['aldeed:simple-schema'] && !!Package['aldeed:collection2'] && typeof Collection.simpleSchema === "function" && Collection._c2) {
      if (typeof Collection.rawCollection) {
        Collection.rawCollection().update({
          _id: documentID
        }, {
          $set: updatedDocumentData
        }, {
          filter: false,
          autoConvert: false,
          removeEmptyStrings: false,
          validate: false
        });
      } else {
        Collection.update({
          _id: documentID
        }, {
          $set: updatedDocumentData
        }, {
          filter: false,
          autoConvert: false,
          removeEmptyStrings: false,
          validate: false
        });
      }

      return;
    } // Run the magic


    Collection.update({
      _id: documentID
    }, {
      $set: updatedDocumentData
    });
  },
  Mongol_remove: function (collectionName, docId, skipTrashing) {
    // console.log(arguments)
    check(collectionName, String);
    check(docId, String);
    check(skipTrashing, Match.Any); // Get Original Document

    var Collection = ToyKit.collection.get(collectionName); // // Move document to Trash Can

    if (!skipTrashing) {
      var trash = Collection.findOne(docId, {
        transform: null
      });
      trash["Mongol_origin"] = String(collectionName);
      trash["Mongol_date"] = new Date();

      _insertDoc("MeteorToys.Mongol", trash);
    } // remove the document


    return Collection.remove({
      _id: docId
    });
  },
  Mongol_duplicate: function (collectionName, docId) {
    check(collectionName, String);
    check(docId, String); // console.log(docId)

    var Collection = ToyKit.collection.get(collectionName);
    var Document = Collection.findOne(docId, {
      transform: null
    });

    if (Document) {
      delete Document._id;
      return _insertDoc(collectionName, Document);
    }
  },
  Mongol_insert: function (collectionName, documentData) {
    check(collectionName, String);
    check(documentData, Object);
    return _insertDoc(collectionName, documentData);
  },
  Mongol_getCollections: function () {
    return ToyKit.collection.getList();
  },
  Mongol_resetCollection: function (name) {
    check(name, Match.Any);
    return Mongo.Collection.get(name).remove({});
  },
  Mongol_resetAll: function () {
    var collectionsList = ToyKit.collection.getList() || [];
    return collectionsList.map(function (name) {
      return {
        name: name,
        result: ToyKit.collection.get(name).remove({})
      };
    });
  }
});
///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

},"utilities.js":function module(require,exports,module){

///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                                   //
// packages/msavin_mongol/server/utilities.js                                                                        //
//                                                                                                                   //
///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                                                                                                                     //
module.export({
  Utilities: () => Utilities
});
module.runSetters(Utilities = {});

Utilities.diffDocumentData = function (dbDoc, newData, oldData) {
  var finalData = {};

  var dbDocFields = _.keys(dbDoc);

  var newDataFields = _.keys(newData);

  var oldDataFields = _.keys(oldData); // console.log("dbDocFields",dbDocFields); console.log("newDataFields",newDataFields); console.log("oldDataFields",oldDataFields);
  // First get the set of fields that we won't be saving because they were dynamically added on the client


  var dynamicallyAddedFields = _.difference(oldDataFields, dbDocFields); // Then get the fields that must retain their dbDoc field value, because they we'ren't published


  var unpublishedFields = _.difference(dbDocFields, oldDataFields); // console.log("unpublishedFields",unpublishedFields);
  // iterate over all fields, old and new, and ascertain the field value that must be added to the final data object


  var oldAndNewFields = _.union(dbDocFields, newDataFields);

  _.each(oldAndNewFields, function (field) {
    if (_.contains(dynamicallyAddedFields, field)) {
      // We don't want to add this field to the actual mongodb document
      // console.log("'" + field + "' appears to be a dynamically added field. This field was not updated.");
      return;
    }

    if (_.contains(unpublishedFields, field)) {
      // We don't want to overwrite the existing mondodb document value
      if (newData[field]) {// Give a message to user as to why that field wasn't updated
        // console.log("'" + field + "' is an unpublished field. This field's value was not overwritten.");
      } // Make sure the old value is retained


      finalData[field] = dbDoc[field];
      return;
    }

    if (!_.isUndefined(newData[field])) {
      finalData[field] = _.isObject(newData[field]) && !_.isArray(newData[field]) && !_.isDate(newData[field]) ? Mongol.diffDocumentData(dbDoc[field] || {}, newData[field], oldData[field] || {}) : newData[field];
    } // This will let unpublished fields into the database,
    // so the user may be confused by the lack of an update in the client
    // simply because the added field isn't published
    // The following solves that problem, but doesn't allow new fields to be added at all:
    // finalData[field] = oldData[field] && newData[field];
    // We actually need to know the set of fields published by the publication that the client side doc came from
    // but how do we get that?

  });

  return finalData;
}; // Test code for Mongol.diffDocumentData

/*Meteor.startup(function() {

  // Take a user document
  var sampleDbDoc = { "_id" : "exampleuser1", "createdAt" : 1375253926213, "defaultPrograms" : { "514d75dc97095578800" : "MYP", "515be068c708000000" : "PYP" }, "department_id" : [  "GMsv9YzaCuL6dFBYL" ], "emails" : [  {  "address" : "aaa@aaa.com",  "verified" : true } ], "myCourses" : [  "QqofEtQPgFb72",  "fvTxhAyfMxFbhzwK7",  "jcPtgwN6pTMQDEp" ], "organization_id" : [  "51f76bcbfb1e0d3100" ], "permContexts" : [     {     "department_id" : "GMsv9YzCuL6dFBYL", "perms" : [     "editRoles",     "editCourses",     "editUnits",     "editAssessments",     "editDepartments" ] } ], "roleContexts" : [     {     "organization_id" : "51f76bc23dfb1e0d3100",     "school_id" : "514d75d9562095578800",     "department_id" : "GMsv9YzaCuL6dFBYL",     "roles" : [     "iQD4BhnB8PFWwHCcg" ] },     {     "organization_id" : "2BjJbMyRLWa4iofQm" } ], "school_id" : [  "514d75dc97d95095578800" ], "services" : { "password" : { "bcrypt" : "$M4235dfre5.5ijyU3.ilpYZQFmtO" }, "resume" : { "loginTokens" : [     {     "when" : "2014-12-24T12:00:06.725Z",     "hashedToken" : "not/telling=" },     {     "when" : "2015-01-16T04:45:10.574Z",     "hashedToken" : "bigbadhashedtoken=" },     {     "when" : "2015-01-22T02:01:57.671Z",     "hashedToken" : "9HSC98hWA9OByHPA6LbBB8=" } ] } }, "superuser" : [  "51f76bb1e0d3100",  "2BjJbMyRiofQm",  "ZkeEcp72bAFQY" ], "transaction_id" : "shQ9fzcZYSgLLnptC" };

  // Simulate the oldData getting sent back from the client (the fields should be a subset of the db fields)
  var sampleOldData = _.extend(_.clone(sampleDbDoc),{dynamicallyAddedField:true, secondDynamicallyAddedField: "Dynamically added value"}); // Simulate two dynamically added fields
  delete sampleOldData.services; // Simulate an unpublished field

  // Simulate the newData getting sent back from the client
  // e.g. user adds a new field
  var sampleNewData = _.extend(_.clone(sampleOldData),{brandNewField: true});
  // brandNewField should be added
  delete sampleNewData.createdAt; // This should be gone
  sampleNewData.secondDynamicallyAddedField = "Dynamically added value overwritten by user"; // seconddynamicallyAddedField should be gone
  sampleNewData.transaction_id = "overwritten transaction id"; // This field should be changed

  // Run the test

  console.log(Mongol.diffDocumentData(sampleDbDoc, sampleNewData, sampleOldData));

});*/
///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

}}}}}},{
  "extensions": [
    ".js",
    ".json"
  ]
});

var exports = require("/node_modules/meteor/msavin:mongol/server/main.js");

/* Exports */
Package._define("msavin:mongol", exports);

})();

//# sourceURL=meteor://💻app/packages/msavin_mongol.js
//# sourceMappingURL=data:application/json;charset=utf8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm1ldGVvcjovL/CfkrthcHAvcGFja2FnZXMvbXNhdmluOm1vbmdvbC9zZXJ2ZXIvbWFpbi5qcyIsIm1ldGVvcjovL/CfkrthcHAvcGFja2FnZXMvbXNhdmluOm1vbmdvbC9zZXJ2ZXIvbWV0aG9kcy5qcyIsIm1ldGVvcjovL/CfkrthcHAvcGFja2FnZXMvbXNhdmluOm1vbmdvbC9zZXJ2ZXIvdXRpbGl0aWVzLmpzIl0sIm5hbWVzIjpbIm1vZHVsZSIsImxpbmsiLCJ1dGlsaXRpZXMiLCJ2IiwiVG95S2l0IiwiUmFuZG9tIiwiX2luc2VydERvYyIsImNvbGxlY3Rpb25OYW1lIiwiZG9jdW1lbnREYXRhIiwibmV3SWQiLCJDb2xsZWN0aW9uIiwiY29sbGVjdGlvbiIsImdldCIsIl9pZCIsImZpbmRPbmUiLCJpZCIsIlBhY2thZ2UiLCJzaW1wbGVTY2hlbWEiLCJfYzIiLCJpbnNlcnQiLCJmaWx0ZXIiLCJhdXRvQ29udmVydCIsInJlbW92ZUVtcHR5U3RyaW5ncyIsInZhbGlkYXRlIiwiTWV0ZW9yIiwibWV0aG9kcyIsIk1vbmdvbF91cGRhdGUiLCJvcmlnaW5hbERvY3VtZW50RGF0YSIsImNoZWNrIiwiU3RyaW5nIiwiT2JqZWN0IiwiZG9jdW1lbnRJRCIsIm9yaWdpbmFsSUQiLCJjdXJyZW50RGJEb2MiLCJ0cmFuc2Zvcm0iLCJfaW5zZXJ0ZG9jIiwidXBkYXRlZERvY3VtZW50RGF0YSIsIlV0aWxpdGllcyIsImRpZmZEb2N1bWVudERhdGEiLCJyYXdDb2xsZWN0aW9uIiwidXBkYXRlIiwiJHNldCIsIk1vbmdvbF9yZW1vdmUiLCJkb2NJZCIsInNraXBUcmFzaGluZyIsIk1hdGNoIiwiQW55IiwidHJhc2giLCJEYXRlIiwicmVtb3ZlIiwiTW9uZ29sX2R1cGxpY2F0ZSIsIkRvY3VtZW50IiwiTW9uZ29sX2luc2VydCIsIk1vbmdvbF9nZXRDb2xsZWN0aW9ucyIsImdldExpc3QiLCJNb25nb2xfcmVzZXRDb2xsZWN0aW9uIiwibmFtZSIsIk1vbmdvIiwiTW9uZ29sX3Jlc2V0QWxsIiwiY29sbGVjdGlvbnNMaXN0IiwibWFwIiwicmVzdWx0IiwiZXhwb3J0IiwiZGJEb2MiLCJuZXdEYXRhIiwib2xkRGF0YSIsImZpbmFsRGF0YSIsImRiRG9jRmllbGRzIiwiXyIsImtleXMiLCJuZXdEYXRhRmllbGRzIiwib2xkRGF0YUZpZWxkcyIsImR5bmFtaWNhbGx5QWRkZWRGaWVsZHMiLCJkaWZmZXJlbmNlIiwidW5wdWJsaXNoZWRGaWVsZHMiLCJvbGRBbmROZXdGaWVsZHMiLCJ1bmlvbiIsImVhY2giLCJmaWVsZCIsImNvbnRhaW5zIiwiaXNVbmRlZmluZWQiLCJpc09iamVjdCIsImlzQXJyYXkiLCJpc0RhdGUiLCJNb25nb2wiXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7OztBQUFBQSxNQUFNLENBQUNDLElBQVAsQ0FBWSxjQUFaLEU7Ozs7Ozs7Ozs7O0FDQUEsSUFBSUMsU0FBSjtBQUFjRixNQUFNLENBQUNDLElBQVAsQ0FBWSxnQkFBWixFQUE2QjtBQUFDQyxXQUFTLENBQUNDLENBQUQsRUFBRztBQUFDRCxhQUFTLEdBQUNDLENBQVY7QUFBWTs7QUFBMUIsQ0FBN0IsRUFBeUQsQ0FBekQ7QUFBNEQsSUFBSUMsTUFBSjtBQUFXSixNQUFNLENBQUNDLElBQVAsQ0FBWSwwQkFBWixFQUF1QztBQUFDRyxRQUFNLENBQUNELENBQUQsRUFBRztBQUFDQyxVQUFNLEdBQUNELENBQVA7QUFBUzs7QUFBcEIsQ0FBdkMsRUFBNkQsQ0FBN0Q7QUFBZ0UsSUFBSUUsTUFBSjtBQUFXTCxNQUFNLENBQUNDLElBQVAsQ0FBWSxlQUFaLEVBQTRCO0FBQUNJLFFBQU0sQ0FBQ0YsQ0FBRCxFQUFHO0FBQUNFLFVBQU0sR0FBQ0YsQ0FBUDtBQUFTOztBQUFwQixDQUE1QixFQUFrRCxDQUFsRDs7QUFHaEssSUFBSUcsVUFBVSxHQUFHLFVBQVVDLGNBQVYsRUFBMEJDLFlBQTFCLEVBQXdDO0FBQ3hELE1BQUlDLEtBQUo7QUFBQSxNQUFXQyxVQUFVLEdBQUdOLE1BQU0sQ0FBQ08sVUFBUCxDQUFrQkMsR0FBbEIsQ0FBc0JMLGNBQXRCLENBQXhCOztBQUVBLE1BQUlDLFlBQVksQ0FBQ0ssR0FBYixJQUFvQkgsVUFBVSxDQUFDSSxPQUFYLENBQW1CTixZQUFZLENBQUNLLEdBQWhDLENBQXhCLEVBQThEO0FBQzdEO0FBQ0EsV0FBTyxJQUFQO0FBQ0E7O0FBRUQsTUFBSSxDQUFDTCxZQUFZLENBQUNLLEdBQWxCLEVBQXVCO0FBQ3RCTCxnQkFBWSxDQUFDSyxHQUFiLEdBQW1CUixNQUFNLENBQUNVLEVBQVAsRUFBbkI7QUFDQTs7QUFFRCxNQUFJLENBQUMsQ0FBQ0MsT0FBTyxDQUFDLHNCQUFELENBQVQsSUFBcUMsQ0FBQyxDQUFDQSxPQUFPLENBQUMsb0JBQUQsQ0FBOUMsSUFBd0UsT0FBT04sVUFBVSxDQUFDTyxZQUFsQixLQUFtQyxVQUEzRyxJQUF5SFAsVUFBVSxDQUFDUSxHQUF4SSxFQUE2STtBQUM1SSxXQUFPUixVQUFVLENBQUNTLE1BQVgsQ0FBa0JYLFlBQWxCLEVBQWdDO0FBQ3RDWSxZQUFNLEVBQUUsS0FEOEI7QUFFdENDLGlCQUFXLEVBQUUsS0FGeUI7QUFHdENDLHdCQUFrQixFQUFFLEtBSGtCO0FBSXRDQyxjQUFRLEVBQUU7QUFKNEIsS0FBaEMsQ0FBUDtBQU1BLEdBUEQsTUFPTztBQUNOLFdBQU9iLFVBQVUsQ0FBQ1MsTUFBWCxDQUFrQlgsWUFBbEIsQ0FBUDtBQUNBO0FBQ0QsQ0F0QkQ7O0FBeUJBZ0IsTUFBTSxDQUFDQyxPQUFQLENBQWU7QUFDZEMsZUFBYSxFQUFFLFVBQVVuQixjQUFWLEVBQTBCQyxZQUExQixFQUF3Q21CLG9CQUF4QyxFQUE4RDtBQUM1RTtBQUNBQyxTQUFLLENBQUNyQixjQUFELEVBQWlCc0IsTUFBakIsQ0FBTDtBQUNBRCxTQUFLLENBQUNwQixZQUFELEVBQWVzQixNQUFmLENBQUw7QUFDQUYsU0FBSyxDQUFDRCxvQkFBRCxFQUF1QkcsTUFBdkIsQ0FBTDtBQUVBLFFBQUlwQixVQUFVLEdBQUdOLE1BQU0sQ0FBQ08sVUFBUCxDQUFrQkMsR0FBbEIsQ0FBc0JMLGNBQXRCLENBQWpCO0FBQUEsUUFDQ3dCLFVBQVUsR0FBR3ZCLFlBQVksQ0FBQ0ssR0FEM0I7QUFBQSxRQUVDbUIsVUFBVSxHQUFHTCxvQkFBb0IsQ0FBQ2QsR0FGbkM7QUFJQSxRQUFJb0IsWUFBWSxHQUFHdkIsVUFBVSxDQUFDSSxPQUFYLENBQW1CO0FBQ3JDRCxTQUFHLEVBQUVrQjtBQURnQyxLQUFuQixFQUVoQjtBQUNGRyxlQUFTLEVBQUU7QUFEVCxLQUZnQixDQUFuQixDQVY0RSxDQWU1RTs7QUFDQSxRQUFJLENBQUNELFlBQUwsRUFBbUI7QUFDbEIsYUFBT0UsVUFBVSxDQUFFNUIsY0FBRixFQUFrQkMsWUFBbEIsQ0FBakI7QUFDQTs7QUFFRCxXQUFPQSxZQUFZLENBQUNLLEdBQXBCO0FBQ0EsV0FBT2Msb0JBQW9CLENBQUNkLEdBQTVCO0FBQ0EsV0FBT29CLFlBQVksQ0FBQ3BCLEdBQXBCO0FBRUEsUUFBSXVCLG1CQUFtQixHQUFHQyxTQUFTLENBQUNDLGdCQUFWLENBQTJCTCxZQUEzQixFQUF5Q3pCLFlBQXpDLEVBQXVEbUIsb0JBQXZELENBQTFCO0FBQ0EsV0FBT1MsbUJBQW1CLENBQUN2QixHQUEzQixDQXpCNEUsQ0EwQjVFO0FBQ0E7O0FBRUEsUUFBSSxDQUFDLENBQUNHLE9BQU8sQ0FBQyxzQkFBRCxDQUFULElBQXFDLENBQUMsQ0FBQ0EsT0FBTyxDQUFDLG9CQUFELENBQTlDLElBQXdFLE9BQU9OLFVBQVUsQ0FBQ08sWUFBbEIsS0FBbUMsVUFBM0csSUFBeUhQLFVBQVUsQ0FBQ1EsR0FBeEksRUFBNkk7QUFDNUksVUFBSSxPQUFPUixVQUFVLENBQUM2QixhQUF0QixFQUFxQztBQUNwQzdCLGtCQUFVLENBQUM2QixhQUFYLEdBQTJCQyxNQUEzQixDQUFrQztBQUNqQzNCLGFBQUcsRUFBRWtCO0FBRDRCLFNBQWxDLEVBRUc7QUFDRlUsY0FBSSxFQUFFTDtBQURKLFNBRkgsRUFJRztBQUNGaEIsZ0JBQU0sRUFBRSxLQUROO0FBRUZDLHFCQUFXLEVBQUUsS0FGWDtBQUdGQyw0QkFBa0IsRUFBRSxLQUhsQjtBQUlGQyxrQkFBUSxFQUFFO0FBSlIsU0FKSDtBQVVBLE9BWEQsTUFXTztBQUNOYixrQkFBVSxDQUFDOEIsTUFBWCxDQUFrQjtBQUNqQjNCLGFBQUcsRUFBRWtCO0FBRFksU0FBbEIsRUFFRztBQUNGVSxjQUFJLEVBQUVMO0FBREosU0FGSCxFQUlHO0FBQ0ZoQixnQkFBTSxFQUFFLEtBRE47QUFFRkMscUJBQVcsRUFBRSxLQUZYO0FBR0ZDLDRCQUFrQixFQUFFLEtBSGxCO0FBSUZDLGtCQUFRLEVBQUU7QUFKUixTQUpIO0FBVUE7O0FBRUQ7QUFDQSxLQXZEMkUsQ0F5RDVFOzs7QUFDQWIsY0FBVSxDQUFDOEIsTUFBWCxDQUFrQjtBQUNqQjNCLFNBQUcsRUFBRWtCO0FBRFksS0FBbEIsRUFFRztBQUNGVSxVQUFJLEVBQUVMO0FBREosS0FGSDtBQUtBLEdBaEVhO0FBaUVkTSxlQUFhLEVBQUUsVUFBVW5DLGNBQVYsRUFBMEJvQyxLQUExQixFQUFpQ0MsWUFBakMsRUFBK0M7QUFDN0Q7QUFDQWhCLFNBQUssQ0FBQ3JCLGNBQUQsRUFBaUJzQixNQUFqQixDQUFMO0FBQ0FELFNBQUssQ0FBQ2UsS0FBRCxFQUFRZCxNQUFSLENBQUw7QUFDQUQsU0FBSyxDQUFDZ0IsWUFBRCxFQUFlQyxLQUFLLENBQUNDLEdBQXJCLENBQUwsQ0FKNkQsQ0FNN0Q7O0FBQ0EsUUFBSXBDLFVBQVUsR0FBR04sTUFBTSxDQUFDTyxVQUFQLENBQWtCQyxHQUFsQixDQUFzQkwsY0FBdEIsQ0FBakIsQ0FQNkQsQ0FTN0Q7O0FBQ0EsUUFBSSxDQUFDcUMsWUFBTCxFQUFtQjtBQUNsQixVQUFJRyxLQUFLLEdBQUlyQyxVQUFVLENBQUNJLE9BQVgsQ0FBbUI2QixLQUFuQixFQUEwQjtBQUFDVCxpQkFBUyxFQUFFO0FBQVosT0FBMUIsQ0FBYjtBQUNBYSxXQUFLLENBQUMsZUFBRCxDQUFMLEdBQXlCbEIsTUFBTSxDQUFDdEIsY0FBRCxDQUEvQjtBQUNBd0MsV0FBSyxDQUFDLGFBQUQsQ0FBTCxHQUF1QixJQUFJQyxJQUFKLEVBQXZCOztBQUNBMUMsZ0JBQVUsQ0FBQyxtQkFBRCxFQUFzQnlDLEtBQXRCLENBQVY7QUFDQSxLQWY0RCxDQWlCN0Q7OztBQUNBLFdBQU9yQyxVQUFVLENBQUN1QyxNQUFYLENBQWtCO0FBQUNwQyxTQUFHLEVBQUU4QjtBQUFOLEtBQWxCLENBQVA7QUFDQSxHQXBGYTtBQXFGZE8sa0JBQWdCLEVBQUUsVUFBVTNDLGNBQVYsRUFBMEJvQyxLQUExQixFQUFpQztBQUNsRGYsU0FBSyxDQUFDckIsY0FBRCxFQUFpQnNCLE1BQWpCLENBQUw7QUFDQUQsU0FBSyxDQUFDZSxLQUFELEVBQVFkLE1BQVIsQ0FBTCxDQUZrRCxDQUdsRDs7QUFFQSxRQUFJbkIsVUFBVSxHQUFHTixNQUFNLENBQUNPLFVBQVAsQ0FBa0JDLEdBQWxCLENBQXNCTCxjQUF0QixDQUFqQjtBQUNBLFFBQUk0QyxRQUFRLEdBQUd6QyxVQUFVLENBQUNJLE9BQVgsQ0FBbUI2QixLQUFuQixFQUEwQjtBQUFDVCxlQUFTLEVBQUU7QUFBWixLQUExQixDQUFmOztBQUVBLFFBQUlpQixRQUFKLEVBQWM7QUFDYixhQUFPQSxRQUFRLENBQUN0QyxHQUFoQjtBQUNBLGFBQU9QLFVBQVUsQ0FBQ0MsY0FBRCxFQUFpQjRDLFFBQWpCLENBQWpCO0FBQ0E7QUFDRCxHQWpHYTtBQWtHZEMsZUFBYSxFQUFFLFVBQVM3QyxjQUFULEVBQXlCQyxZQUF6QixFQUF1QztBQUNyRG9CLFNBQUssQ0FBQ3JCLGNBQUQsRUFBaUJzQixNQUFqQixDQUFMO0FBQ0FELFNBQUssQ0FBQ3BCLFlBQUQsRUFBZXNCLE1BQWYsQ0FBTDtBQUVBLFdBQU94QixVQUFVLENBQUNDLGNBQUQsRUFBaUJDLFlBQWpCLENBQWpCO0FBQ0EsR0F2R2E7QUF3R2Q2Qyx1QkFBcUIsRUFBRSxZQUFZO0FBQ2xDLFdBQU9qRCxNQUFNLENBQUNPLFVBQVAsQ0FBa0IyQyxPQUFsQixFQUFQO0FBQ0EsR0ExR2E7QUEyR2RDLHdCQUFzQixFQUFFLFVBQVNDLElBQVQsRUFBZTtBQUN0QzVCLFNBQUssQ0FBQzRCLElBQUQsRUFBT1gsS0FBSyxDQUFDQyxHQUFiLENBQUw7QUFFQSxXQUFPVyxLQUFLLENBQUMvQyxVQUFOLENBQWlCRSxHQUFqQixDQUFxQjRDLElBQXJCLEVBQTJCUCxNQUEzQixDQUFrQyxFQUFsQyxDQUFQO0FBQ0EsR0EvR2E7QUFnSGRTLGlCQUFlLEVBQUUsWUFBWTtBQUM1QixRQUFJQyxlQUFlLEdBQUd2RCxNQUFNLENBQUNPLFVBQVAsQ0FBa0IyQyxPQUFsQixNQUErQixFQUFyRDtBQUVBLFdBQU9LLGVBQWUsQ0FBQ0MsR0FBaEIsQ0FBb0IsVUFBU0osSUFBVCxFQUFlO0FBQ3pDLGFBQU87QUFDTkEsWUFBSSxFQUFFQSxJQURBO0FBRU5LLGNBQU0sRUFBRXpELE1BQU0sQ0FBQ08sVUFBUCxDQUFrQkMsR0FBbEIsQ0FBc0I0QyxJQUF0QixFQUE0QlAsTUFBNUIsQ0FBbUMsRUFBbkM7QUFGRixPQUFQO0FBSUEsS0FMTSxDQUFQO0FBTUE7QUF6SGEsQ0FBZixFOzs7Ozs7Ozs7OztBQzVCQWpELE1BQU0sQ0FBQzhELE1BQVAsQ0FBYztBQUFDekIsV0FBUyxFQUFDLE1BQUlBO0FBQWYsQ0FBZDtBQUFBLGtCQUFBQSxTQUFTLEdBQUcsRUFBWjs7QUFFQUEsU0FBUyxDQUFDQyxnQkFBVixHQUE2QixVQUFVeUIsS0FBVixFQUFpQkMsT0FBakIsRUFBMEJDLE9BQTFCLEVBQW1DO0FBRTlELE1BQUlDLFNBQVMsR0FBRyxFQUFoQjs7QUFFQSxNQUFJQyxXQUFXLEdBQUdDLENBQUMsQ0FBQ0MsSUFBRixDQUFPTixLQUFQLENBQWxCOztBQUNBLE1BQUlPLGFBQWEsR0FBR0YsQ0FBQyxDQUFDQyxJQUFGLENBQU9MLE9BQVAsQ0FBcEI7O0FBQ0EsTUFBSU8sYUFBYSxHQUFHSCxDQUFDLENBQUNDLElBQUYsQ0FBT0osT0FBUCxDQUFwQixDQU44RCxDQU16QjtBQUVyQzs7O0FBRUEsTUFBSU8sc0JBQXNCLEdBQUdKLENBQUMsQ0FBQ0ssVUFBRixDQUFhRixhQUFiLEVBQTRCSixXQUE1QixDQUE3QixDQVY4RCxDQVk5RDs7O0FBRUEsTUFBSU8saUJBQWlCLEdBQUdOLENBQUMsQ0FBQ0ssVUFBRixDQUFhTixXQUFiLEVBQTBCSSxhQUExQixDQUF4QixDQWQ4RCxDQWNJO0FBRWxFOzs7QUFFQSxNQUFJSSxlQUFlLEdBQUdQLENBQUMsQ0FBQ1EsS0FBRixDQUFRVCxXQUFSLEVBQXFCRyxhQUFyQixDQUF0Qjs7QUFFQUYsR0FBQyxDQUFDUyxJQUFGLENBQU9GLGVBQVAsRUFBd0IsVUFBU0csS0FBVCxFQUFnQjtBQUV0QyxRQUFJVixDQUFDLENBQUNXLFFBQUYsQ0FBV1Asc0JBQVgsRUFBbUNNLEtBQW5DLENBQUosRUFBK0M7QUFFN0M7QUFDQTtBQUNBO0FBRUQ7O0FBRUQsUUFBSVYsQ0FBQyxDQUFDVyxRQUFGLENBQVdMLGlCQUFYLEVBQThCSSxLQUE5QixDQUFKLEVBQTBDO0FBRXhDO0FBQ0EsVUFBSWQsT0FBTyxDQUFDYyxLQUFELENBQVgsRUFBb0IsQ0FDbEI7QUFDQTtBQUNELE9BTnVDLENBT3hDOzs7QUFDQVosZUFBUyxDQUFDWSxLQUFELENBQVQsR0FBbUJmLEtBQUssQ0FBQ2UsS0FBRCxDQUF4QjtBQUNBO0FBRUQ7O0FBRUQsUUFBSSxDQUFDVixDQUFDLENBQUNZLFdBQUYsQ0FBY2hCLE9BQU8sQ0FBQ2MsS0FBRCxDQUFyQixDQUFMLEVBQW9DO0FBRWxDWixlQUFTLENBQUNZLEtBQUQsQ0FBVCxHQUFvQlYsQ0FBQyxDQUFDYSxRQUFGLENBQVdqQixPQUFPLENBQUNjLEtBQUQsQ0FBbEIsS0FBOEIsQ0FBQ1YsQ0FBQyxDQUFDYyxPQUFGLENBQVVsQixPQUFPLENBQUNjLEtBQUQsQ0FBakIsQ0FBL0IsSUFBNEQsQ0FBQ1YsQ0FBQyxDQUFDZSxNQUFGLENBQVNuQixPQUFPLENBQUNjLEtBQUQsQ0FBaEIsQ0FBOUQsR0FBMEZNLE1BQU0sQ0FBQzlDLGdCQUFQLENBQXdCeUIsS0FBSyxDQUFDZSxLQUFELENBQUwsSUFBZ0IsRUFBeEMsRUFBNENkLE9BQU8sQ0FBQ2MsS0FBRCxDQUFuRCxFQUE0RGIsT0FBTyxDQUFDYSxLQUFELENBQVAsSUFBa0IsRUFBOUUsQ0FBMUYsR0FBOEtkLE9BQU8sQ0FBQ2MsS0FBRCxDQUF4TTtBQUVELEtBM0JxQyxDQTZCdEM7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUQsR0FyQ0Q7O0FBdUNBLFNBQU9aLFNBQVA7QUFFRCxDQTdERCxDLENBK0RBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLEsiLCJmaWxlIjoiL3BhY2thZ2VzL21zYXZpbl9tb25nb2wuanMiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgXCIuL21ldGhvZHMuanNcIiIsImltcG9ydCB7IHV0aWxpdGllcyB9IGZyb20gXCIuL3V0aWxpdGllcy5qc1wiXG5pbXBvcnQgeyBUb3lLaXQgfSBmcm9tIFwibWV0ZW9yL21ldGVvcnRveXM6dG95a2l0XCI7XG5pbXBvcnQgeyBSYW5kb20gfSBmcm9tIFwibWV0ZW9yL3JhbmRvbVwiXG52YXIgX2luc2VydERvYyA9IGZ1bmN0aW9uIChjb2xsZWN0aW9uTmFtZSwgZG9jdW1lbnREYXRhKSB7XG5cdHZhciBuZXdJZCwgQ29sbGVjdGlvbiA9IFRveUtpdC5jb2xsZWN0aW9uLmdldChjb2xsZWN0aW9uTmFtZSk7XG5cblx0aWYgKGRvY3VtZW50RGF0YS5faWQgJiYgQ29sbGVjdGlvbi5maW5kT25lKGRvY3VtZW50RGF0YS5faWQpKSB7XG5cdFx0Ly8gY29uc29sZS5sb2coJ01vbmdvbDogRHVwbGljYXRlIF9pZCBmb3VuZCcpO1xuXHRcdHJldHVybiBudWxsO1xuXHR9XG5cblx0aWYgKCFkb2N1bWVudERhdGEuX2lkKSB7XG5cdFx0ZG9jdW1lbnREYXRhLl9pZCA9IFJhbmRvbS5pZCgpXG5cdH1cblxuXHRpZiAoISFQYWNrYWdlWydhbGRlZWQ6c2ltcGxlLXNjaGVtYSddICYmICEhUGFja2FnZVsnYWxkZWVkOmNvbGxlY3Rpb24yJ10gJiYgdHlwZW9mIENvbGxlY3Rpb24uc2ltcGxlU2NoZW1hID09PSBcImZ1bmN0aW9uXCIgJiYgQ29sbGVjdGlvbi5fYzIpIHtcblx0XHRyZXR1cm4gQ29sbGVjdGlvbi5pbnNlcnQoZG9jdW1lbnREYXRhLCB7XG5cdFx0XHRmaWx0ZXI6IGZhbHNlLFxuXHRcdFx0YXV0b0NvbnZlcnQ6IGZhbHNlLFxuXHRcdFx0cmVtb3ZlRW1wdHlTdHJpbmdzOiBmYWxzZSxcblx0XHRcdHZhbGlkYXRlOiBmYWxzZVxuXHRcdH0pO1xuXHR9IGVsc2Uge1xuXHRcdHJldHVybiBDb2xsZWN0aW9uLmluc2VydChkb2N1bWVudERhdGEpO1xuXHR9XG59XG5cblxuTWV0ZW9yLm1ldGhvZHMoe1xuXHRNb25nb2xfdXBkYXRlOiBmdW5jdGlvbiAoY29sbGVjdGlvbk5hbWUsIGRvY3VtZW50RGF0YSwgb3JpZ2luYWxEb2N1bWVudERhdGEpIHtcblx0XHQvLyBjb25zb2xlLmxvZyhhcmd1bWVudHMpXG5cdFx0Y2hlY2soY29sbGVjdGlvbk5hbWUsIFN0cmluZyk7XG5cdFx0Y2hlY2soZG9jdW1lbnREYXRhLCBPYmplY3QpO1xuXHRcdGNoZWNrKG9yaWdpbmFsRG9jdW1lbnREYXRhLCBPYmplY3QpO1xuXG5cdFx0dmFyIENvbGxlY3Rpb24gPSBUb3lLaXQuY29sbGVjdGlvbi5nZXQoY29sbGVjdGlvbk5hbWUpLFxuXHRcdFx0ZG9jdW1lbnRJRCA9IGRvY3VtZW50RGF0YS5faWQsXG5cdFx0XHRvcmlnaW5hbElEID0gb3JpZ2luYWxEb2N1bWVudERhdGEuX2lkO1xuXG5cdFx0dmFyIGN1cnJlbnREYkRvYyA9IENvbGxlY3Rpb24uZmluZE9uZSh7XG5cdFx0XHRfaWQ6IGRvY3VtZW50SURcblx0XHR9LCB7XG5cdFx0XHR0cmFuc2Zvcm06IG51bGxcblx0XHR9KTtcblx0XHQvLyBjb25zb2xlLmxvZyhjdXJyZW50RGJEb2MpXG5cdFx0aWYgKCFjdXJyZW50RGJEb2MpIHtcblx0XHRcdHJldHVybiBfaW5zZXJ0ZG9jIChjb2xsZWN0aW9uTmFtZSwgZG9jdW1lbnREYXRhKVxuXHRcdH1cblxuXHRcdGRlbGV0ZSBkb2N1bWVudERhdGEuX2lkO1xuXHRcdGRlbGV0ZSBvcmlnaW5hbERvY3VtZW50RGF0YS5faWQ7XG5cdFx0ZGVsZXRlIGN1cnJlbnREYkRvYy5faWQ7XG5cblx0XHR2YXIgdXBkYXRlZERvY3VtZW50RGF0YSA9IFV0aWxpdGllcy5kaWZmRG9jdW1lbnREYXRhKGN1cnJlbnREYkRvYywgZG9jdW1lbnREYXRhLCBvcmlnaW5hbERvY3VtZW50RGF0YSk7XG5cdFx0ZGVsZXRlIHVwZGF0ZWREb2N1bWVudERhdGEuX2lkO1xuXHRcdC8vIGNvbnNvbGUubG9nKHVwZGF0ZWREb2N1bWVudERhdGEpXG5cdFx0Ly8gQ2hlY2sgZm9yIHBhY2thZ2VzXG5cblx0XHRpZiAoISFQYWNrYWdlWydhbGRlZWQ6c2ltcGxlLXNjaGVtYSddICYmICEhUGFja2FnZVsnYWxkZWVkOmNvbGxlY3Rpb24yJ10gJiYgdHlwZW9mIENvbGxlY3Rpb24uc2ltcGxlU2NoZW1hID09PSBcImZ1bmN0aW9uXCIgJiYgQ29sbGVjdGlvbi5fYzIpIHtcblx0XHRcdGlmICh0eXBlb2YgQ29sbGVjdGlvbi5yYXdDb2xsZWN0aW9uKSB7XG5cdFx0XHRcdENvbGxlY3Rpb24ucmF3Q29sbGVjdGlvbigpLnVwZGF0ZSh7XG5cdFx0XHRcdFx0X2lkOiBkb2N1bWVudElEXG5cdFx0XHRcdH0sIHtcblx0XHRcdFx0XHQkc2V0OiB1cGRhdGVkRG9jdW1lbnREYXRhXG5cdFx0XHRcdH0sIHtcblx0XHRcdFx0XHRmaWx0ZXI6IGZhbHNlLFxuXHRcdFx0XHRcdGF1dG9Db252ZXJ0OiBmYWxzZSxcblx0XHRcdFx0XHRyZW1vdmVFbXB0eVN0cmluZ3M6IGZhbHNlLFxuXHRcdFx0XHRcdHZhbGlkYXRlOiBmYWxzZVxuXHRcdFx0XHR9KTtcblx0XHRcdH0gZWxzZSB7XG5cdFx0XHRcdENvbGxlY3Rpb24udXBkYXRlKHtcblx0XHRcdFx0XHRfaWQ6IGRvY3VtZW50SURcblx0XHRcdFx0fSwge1xuXHRcdFx0XHRcdCRzZXQ6IHVwZGF0ZWREb2N1bWVudERhdGFcblx0XHRcdFx0fSwge1xuXHRcdFx0XHRcdGZpbHRlcjogZmFsc2UsXG5cdFx0XHRcdFx0YXV0b0NvbnZlcnQ6IGZhbHNlLFxuXHRcdFx0XHRcdHJlbW92ZUVtcHR5U3RyaW5nczogZmFsc2UsXG5cdFx0XHRcdFx0dmFsaWRhdGU6IGZhbHNlXG5cdFx0XHRcdH0pO1xuXHRcdFx0fVxuXHRcdFx0XG5cdFx0XHRyZXR1cm47XG5cdFx0fVxuXG5cdFx0Ly8gUnVuIHRoZSBtYWdpY1xuXHRcdENvbGxlY3Rpb24udXBkYXRlKHtcblx0XHRcdF9pZDogZG9jdW1lbnRJRFxuXHRcdH0sIHtcblx0XHRcdCRzZXQ6IHVwZGF0ZWREb2N1bWVudERhdGFcblx0XHR9KTtcblx0fSxcblx0TW9uZ29sX3JlbW92ZTogZnVuY3Rpb24gKGNvbGxlY3Rpb25OYW1lLCBkb2NJZCwgc2tpcFRyYXNoaW5nKSB7XG5cdFx0Ly8gY29uc29sZS5sb2coYXJndW1lbnRzKVxuXHRcdGNoZWNrKGNvbGxlY3Rpb25OYW1lLCBTdHJpbmcpXG5cdFx0Y2hlY2soZG9jSWQsIFN0cmluZylcblx0XHRjaGVjayhza2lwVHJhc2hpbmcsIE1hdGNoLkFueSlcblxuXHRcdC8vIEdldCBPcmlnaW5hbCBEb2N1bWVudFxuXHRcdHZhciBDb2xsZWN0aW9uID0gVG95S2l0LmNvbGxlY3Rpb24uZ2V0KGNvbGxlY3Rpb25OYW1lKVxuXHRcdFxuXHRcdC8vIC8vIE1vdmUgZG9jdW1lbnQgdG8gVHJhc2ggQ2FuXG5cdFx0aWYgKCFza2lwVHJhc2hpbmcpIHtcblx0XHRcdHZhciB0cmFzaCAgPSBDb2xsZWN0aW9uLmZpbmRPbmUoZG9jSWQsIHt0cmFuc2Zvcm06IG51bGx9KVxuXHRcdFx0dHJhc2hbXCJNb25nb2xfb3JpZ2luXCJdID0gU3RyaW5nKGNvbGxlY3Rpb25OYW1lKVxuXHRcdFx0dHJhc2hbXCJNb25nb2xfZGF0ZVwiXSA9IG5ldyBEYXRlKClcblx0XHRcdF9pbnNlcnREb2MoXCJNZXRlb3JUb3lzLk1vbmdvbFwiLCB0cmFzaClcblx0XHR9XG5cblx0XHQvLyByZW1vdmUgdGhlIGRvY3VtZW50XG5cdFx0cmV0dXJuIENvbGxlY3Rpb24ucmVtb3ZlKHtfaWQ6IGRvY0lkfSlcblx0fSxcblx0TW9uZ29sX2R1cGxpY2F0ZTogZnVuY3Rpb24gKGNvbGxlY3Rpb25OYW1lLCBkb2NJZCkge1xuXHRcdGNoZWNrKGNvbGxlY3Rpb25OYW1lLCBTdHJpbmcpO1xuXHRcdGNoZWNrKGRvY0lkLCBTdHJpbmcpO1xuXHRcdC8vIGNvbnNvbGUubG9nKGRvY0lkKVxuXG5cdFx0dmFyIENvbGxlY3Rpb24gPSBUb3lLaXQuY29sbGVjdGlvbi5nZXQoY29sbGVjdGlvbk5hbWUpO1xuXHRcdHZhciBEb2N1bWVudCA9IENvbGxlY3Rpb24uZmluZE9uZShkb2NJZCwge3RyYW5zZm9ybTogbnVsbH0pO1xuXG5cdFx0aWYgKERvY3VtZW50KSB7XG5cdFx0XHRkZWxldGUgRG9jdW1lbnQuX2lkO1xuXHRcdFx0cmV0dXJuIF9pbnNlcnREb2MoY29sbGVjdGlvbk5hbWUsIERvY3VtZW50KTtcblx0XHR9XG5cdH0sXG5cdE1vbmdvbF9pbnNlcnQ6IGZ1bmN0aW9uKGNvbGxlY3Rpb25OYW1lLCBkb2N1bWVudERhdGEpIHtcblx0XHRjaGVjayhjb2xsZWN0aW9uTmFtZSwgU3RyaW5nKTtcblx0XHRjaGVjayhkb2N1bWVudERhdGEsIE9iamVjdCk7XG5cblx0XHRyZXR1cm4gX2luc2VydERvYyhjb2xsZWN0aW9uTmFtZSwgZG9jdW1lbnREYXRhKTtcblx0fSxcblx0TW9uZ29sX2dldENvbGxlY3Rpb25zOiBmdW5jdGlvbiAoKSB7XG5cdFx0cmV0dXJuIFRveUtpdC5jb2xsZWN0aW9uLmdldExpc3QoKTtcblx0fSxcblx0TW9uZ29sX3Jlc2V0Q29sbGVjdGlvbjogZnVuY3Rpb24obmFtZSkge1xuXHRcdGNoZWNrKG5hbWUsIE1hdGNoLkFueSk7XG5cblx0XHRyZXR1cm4gTW9uZ28uQ29sbGVjdGlvbi5nZXQobmFtZSkucmVtb3ZlKHt9KTtcblx0fSxcblx0TW9uZ29sX3Jlc2V0QWxsOiBmdW5jdGlvbiAoKSB7XG5cdFx0dmFyIGNvbGxlY3Rpb25zTGlzdCA9IFRveUtpdC5jb2xsZWN0aW9uLmdldExpc3QoKSB8fCBbXTtcblxuXHRcdHJldHVybiBjb2xsZWN0aW9uc0xpc3QubWFwKGZ1bmN0aW9uKG5hbWUpIHtcblx0XHRcdHJldHVybiB7XG5cdFx0XHRcdG5hbWU6IG5hbWUsXG5cdFx0XHRcdHJlc3VsdDogVG95S2l0LmNvbGxlY3Rpb24uZ2V0KG5hbWUpLnJlbW92ZSh7fSlcblx0XHRcdH1cblx0XHR9KTtcblx0fVxufSk7IiwiVXRpbGl0aWVzID0ge31cblxuVXRpbGl0aWVzLmRpZmZEb2N1bWVudERhdGEgPSBmdW5jdGlvbiAoZGJEb2MsIG5ld0RhdGEsIG9sZERhdGEpIHtcblxuICB2YXIgZmluYWxEYXRhID0ge307XG5cbiAgdmFyIGRiRG9jRmllbGRzID0gXy5rZXlzKGRiRG9jKTtcbiAgdmFyIG5ld0RhdGFGaWVsZHMgPSBfLmtleXMobmV3RGF0YSk7XG4gIHZhciBvbGREYXRhRmllbGRzID0gXy5rZXlzKG9sZERhdGEpOyAvLyBjb25zb2xlLmxvZyhcImRiRG9jRmllbGRzXCIsZGJEb2NGaWVsZHMpOyBjb25zb2xlLmxvZyhcIm5ld0RhdGFGaWVsZHNcIixuZXdEYXRhRmllbGRzKTsgY29uc29sZS5sb2coXCJvbGREYXRhRmllbGRzXCIsb2xkRGF0YUZpZWxkcyk7XG5cbiAgLy8gRmlyc3QgZ2V0IHRoZSBzZXQgb2YgZmllbGRzIHRoYXQgd2Ugd29uJ3QgYmUgc2F2aW5nIGJlY2F1c2UgdGhleSB3ZXJlIGR5bmFtaWNhbGx5IGFkZGVkIG9uIHRoZSBjbGllbnRcblxuICB2YXIgZHluYW1pY2FsbHlBZGRlZEZpZWxkcyA9IF8uZGlmZmVyZW5jZShvbGREYXRhRmllbGRzLCBkYkRvY0ZpZWxkcyk7XG5cbiAgLy8gVGhlbiBnZXQgdGhlIGZpZWxkcyB0aGF0IG11c3QgcmV0YWluIHRoZWlyIGRiRG9jIGZpZWxkIHZhbHVlLCBiZWNhdXNlIHRoZXkgd2UncmVuJ3QgcHVibGlzaGVkXG5cbiAgdmFyIHVucHVibGlzaGVkRmllbGRzID0gXy5kaWZmZXJlbmNlKGRiRG9jRmllbGRzLCBvbGREYXRhRmllbGRzKTsgLy8gY29uc29sZS5sb2coXCJ1bnB1Ymxpc2hlZEZpZWxkc1wiLHVucHVibGlzaGVkRmllbGRzKTtcblxuICAvLyBpdGVyYXRlIG92ZXIgYWxsIGZpZWxkcywgb2xkIGFuZCBuZXcsIGFuZCBhc2NlcnRhaW4gdGhlIGZpZWxkIHZhbHVlIHRoYXQgbXVzdCBiZSBhZGRlZCB0byB0aGUgZmluYWwgZGF0YSBvYmplY3RcblxuICB2YXIgb2xkQW5kTmV3RmllbGRzID0gXy51bmlvbihkYkRvY0ZpZWxkcywgbmV3RGF0YUZpZWxkcyk7XG5cbiAgXy5lYWNoKG9sZEFuZE5ld0ZpZWxkcywgZnVuY3Rpb24oZmllbGQpIHtcblxuICAgIGlmIChfLmNvbnRhaW5zKGR5bmFtaWNhbGx5QWRkZWRGaWVsZHMsIGZpZWxkKSkge1xuICBcbiAgICAgIC8vIFdlIGRvbid0IHdhbnQgdG8gYWRkIHRoaXMgZmllbGQgdG8gdGhlIGFjdHVhbCBtb25nb2RiIGRvY3VtZW50XG4gICAgICAvLyBjb25zb2xlLmxvZyhcIidcIiArIGZpZWxkICsgXCInIGFwcGVhcnMgdG8gYmUgYSBkeW5hbWljYWxseSBhZGRlZCBmaWVsZC4gVGhpcyBmaWVsZCB3YXMgbm90IHVwZGF0ZWQuXCIpO1xuICAgICAgcmV0dXJuO1xuXG4gICAgfVxuXG4gICAgaWYgKF8uY29udGFpbnModW5wdWJsaXNoZWRGaWVsZHMsIGZpZWxkKSkge1xuXG4gICAgICAvLyBXZSBkb24ndCB3YW50IHRvIG92ZXJ3cml0ZSB0aGUgZXhpc3RpbmcgbW9uZG9kYiBkb2N1bWVudCB2YWx1ZVxuICAgICAgaWYgKG5ld0RhdGFbZmllbGRdKSB7XG4gICAgICAgIC8vIEdpdmUgYSBtZXNzYWdlIHRvIHVzZXIgYXMgdG8gd2h5IHRoYXQgZmllbGQgd2Fzbid0IHVwZGF0ZWRcbiAgICAgICAgLy8gY29uc29sZS5sb2coXCInXCIgKyBmaWVsZCArIFwiJyBpcyBhbiB1bnB1Ymxpc2hlZCBmaWVsZC4gVGhpcyBmaWVsZCdzIHZhbHVlIHdhcyBub3Qgb3ZlcndyaXR0ZW4uXCIpO1xuICAgICAgfVxuICAgICAgLy8gTWFrZSBzdXJlIHRoZSBvbGQgdmFsdWUgaXMgcmV0YWluZWRcbiAgICAgIGZpbmFsRGF0YVtmaWVsZF0gPSBkYkRvY1tmaWVsZF07XG4gICAgICByZXR1cm47XG5cbiAgICB9XG5cbiAgICBpZiAoIV8uaXNVbmRlZmluZWQobmV3RGF0YVtmaWVsZF0pKSB7XG4gICAgICAgIFxuICAgICAgZmluYWxEYXRhW2ZpZWxkXSA9IChfLmlzT2JqZWN0KG5ld0RhdGFbZmllbGRdKSAmJiAhXy5pc0FycmF5KG5ld0RhdGFbZmllbGRdKSAmJiAhXy5pc0RhdGUobmV3RGF0YVtmaWVsZF0pKSA/IE1vbmdvbC5kaWZmRG9jdW1lbnREYXRhKGRiRG9jW2ZpZWxkXSB8fCB7fSwgbmV3RGF0YVtmaWVsZF0sIG9sZERhdGFbZmllbGRdIHx8IHt9KSA6IG5ld0RhdGFbZmllbGRdO1xuICAgICAgXG4gICAgfVxuXG4gICAgLy8gVGhpcyB3aWxsIGxldCB1bnB1Ymxpc2hlZCBmaWVsZHMgaW50byB0aGUgZGF0YWJhc2UsXG4gICAgLy8gc28gdGhlIHVzZXIgbWF5IGJlIGNvbmZ1c2VkIGJ5IHRoZSBsYWNrIG9mIGFuIHVwZGF0ZSBpbiB0aGUgY2xpZW50XG4gICAgLy8gc2ltcGx5IGJlY2F1c2UgdGhlIGFkZGVkIGZpZWxkIGlzbid0IHB1Ymxpc2hlZFxuICAgIC8vIFRoZSBmb2xsb3dpbmcgc29sdmVzIHRoYXQgcHJvYmxlbSwgYnV0IGRvZXNuJ3QgYWxsb3cgbmV3IGZpZWxkcyB0byBiZSBhZGRlZCBhdCBhbGw6XG4gICAgLy8gZmluYWxEYXRhW2ZpZWxkXSA9IG9sZERhdGFbZmllbGRdICYmIG5ld0RhdGFbZmllbGRdO1xuICAgIC8vIFdlIGFjdHVhbGx5IG5lZWQgdG8ga25vdyB0aGUgc2V0IG9mIGZpZWxkcyBwdWJsaXNoZWQgYnkgdGhlIHB1YmxpY2F0aW9uIHRoYXQgdGhlIGNsaWVudCBzaWRlIGRvYyBjYW1lIGZyb21cbiAgICAvLyBidXQgaG93IGRvIHdlIGdldCB0aGF0P1xuXG4gIH0pO1xuXG4gIHJldHVybiBmaW5hbERhdGE7XG5cbn07XG5cbi8vIFRlc3QgY29kZSBmb3IgTW9uZ29sLmRpZmZEb2N1bWVudERhdGFcblxuLypNZXRlb3Iuc3RhcnR1cChmdW5jdGlvbigpIHtcblxuICAvLyBUYWtlIGEgdXNlciBkb2N1bWVudFxuICB2YXIgc2FtcGxlRGJEb2MgPSB7IFwiX2lkXCIgOiBcImV4YW1wbGV1c2VyMVwiLCBcImNyZWF0ZWRBdFwiIDogMTM3NTI1MzkyNjIxMywgXCJkZWZhdWx0UHJvZ3JhbXNcIiA6IHsgXCI1MTRkNzVkYzk3MDk1NTc4ODAwXCIgOiBcIk1ZUFwiLCBcIjUxNWJlMDY4YzcwODAwMDAwMFwiIDogXCJQWVBcIiB9LCBcImRlcGFydG1lbnRfaWRcIiA6IFsgIFwiR01zdjlZemFDdUw2ZEZCWUxcIiBdLCBcImVtYWlsc1wiIDogWyAgeyAgXCJhZGRyZXNzXCIgOiBcImFhYUBhYWEuY29tXCIsICBcInZlcmlmaWVkXCIgOiB0cnVlIH0gXSwgXCJteUNvdXJzZXNcIiA6IFsgIFwiUXFvZkV0UVBnRmI3MlwiLCAgXCJmdlR4aEF5Zk14RmJoendLN1wiLCAgXCJqY1B0Z3dONnBUTVFERXBcIiBdLCBcIm9yZ2FuaXphdGlvbl9pZFwiIDogWyAgXCI1MWY3NmJjYmZiMWUwZDMxMDBcIiBdLCBcInBlcm1Db250ZXh0c1wiIDogWyAgICAgeyAgICAgXCJkZXBhcnRtZW50X2lkXCIgOiBcIkdNc3Y5WXpDdUw2ZEZCWUxcIiwgXCJwZXJtc1wiIDogWyAgICAgXCJlZGl0Um9sZXNcIiwgICAgIFwiZWRpdENvdXJzZXNcIiwgICAgIFwiZWRpdFVuaXRzXCIsICAgICBcImVkaXRBc3Nlc3NtZW50c1wiLCAgICAgXCJlZGl0RGVwYXJ0bWVudHNcIiBdIH0gXSwgXCJyb2xlQ29udGV4dHNcIiA6IFsgICAgIHsgICAgIFwib3JnYW5pemF0aW9uX2lkXCIgOiBcIjUxZjc2YmMyM2RmYjFlMGQzMTAwXCIsICAgICBcInNjaG9vbF9pZFwiIDogXCI1MTRkNzVkOTU2MjA5NTU3ODgwMFwiLCAgICAgXCJkZXBhcnRtZW50X2lkXCIgOiBcIkdNc3Y5WXphQ3VMNmRGQllMXCIsICAgICBcInJvbGVzXCIgOiBbICAgICBcImlRRDRCaG5COFBGV3dIQ2NnXCIgXSB9LCAgICAgeyAgICAgXCJvcmdhbml6YXRpb25faWRcIiA6IFwiMkJqSmJNeVJMV2E0aW9mUW1cIiB9IF0sIFwic2Nob29sX2lkXCIgOiBbICBcIjUxNGQ3NWRjOTdkOTUwOTU1Nzg4MDBcIiBdLCBcInNlcnZpY2VzXCIgOiB7IFwicGFzc3dvcmRcIiA6IHsgXCJiY3J5cHRcIiA6IFwiJE00MjM1ZGZyZTUuNWlqeVUzLmlscFlaUUZtdE9cIiB9LCBcInJlc3VtZVwiIDogeyBcImxvZ2luVG9rZW5zXCIgOiBbICAgICB7ICAgICBcIndoZW5cIiA6IFwiMjAxNC0xMi0yNFQxMjowMDowNi43MjVaXCIsICAgICBcImhhc2hlZFRva2VuXCIgOiBcIm5vdC90ZWxsaW5nPVwiIH0sICAgICB7ICAgICBcIndoZW5cIiA6IFwiMjAxNS0wMS0xNlQwNDo0NToxMC41NzRaXCIsICAgICBcImhhc2hlZFRva2VuXCIgOiBcImJpZ2JhZGhhc2hlZHRva2VuPVwiIH0sICAgICB7ICAgICBcIndoZW5cIiA6IFwiMjAxNS0wMS0yMlQwMjowMTo1Ny42NzFaXCIsICAgICBcImhhc2hlZFRva2VuXCIgOiBcIjlIU0M5OGhXQTlPQnlIUEE2TGJCQjg9XCIgfSBdIH0gfSwgXCJzdXBlcnVzZXJcIiA6IFsgIFwiNTFmNzZiYjFlMGQzMTAwXCIsICBcIjJCakpiTXlSaW9mUW1cIiwgIFwiWmtlRWNwNzJiQUZRWVwiIF0sIFwidHJhbnNhY3Rpb25faWRcIiA6IFwic2hROWZ6Y1pZU2dMTG5wdENcIiB9O1xuXG4gIC8vIFNpbXVsYXRlIHRoZSBvbGREYXRhIGdldHRpbmcgc2VudCBiYWNrIGZyb20gdGhlIGNsaWVudCAodGhlIGZpZWxkcyBzaG91bGQgYmUgYSBzdWJzZXQgb2YgdGhlIGRiIGZpZWxkcylcbiAgdmFyIHNhbXBsZU9sZERhdGEgPSBfLmV4dGVuZChfLmNsb25lKHNhbXBsZURiRG9jKSx7ZHluYW1pY2FsbHlBZGRlZEZpZWxkOnRydWUsIHNlY29uZER5bmFtaWNhbGx5QWRkZWRGaWVsZDogXCJEeW5hbWljYWxseSBhZGRlZCB2YWx1ZVwifSk7IC8vIFNpbXVsYXRlIHR3byBkeW5hbWljYWxseSBhZGRlZCBmaWVsZHNcbiAgZGVsZXRlIHNhbXBsZU9sZERhdGEuc2VydmljZXM7IC8vIFNpbXVsYXRlIGFuIHVucHVibGlzaGVkIGZpZWxkXG5cbiAgLy8gU2ltdWxhdGUgdGhlIG5ld0RhdGEgZ2V0dGluZyBzZW50IGJhY2sgZnJvbSB0aGUgY2xpZW50XG4gIC8vIGUuZy4gdXNlciBhZGRzIGEgbmV3IGZpZWxkXG4gIHZhciBzYW1wbGVOZXdEYXRhID0gXy5leHRlbmQoXy5jbG9uZShzYW1wbGVPbGREYXRhKSx7YnJhbmROZXdGaWVsZDogdHJ1ZX0pO1xuICAvLyBicmFuZE5ld0ZpZWxkIHNob3VsZCBiZSBhZGRlZFxuICBkZWxldGUgc2FtcGxlTmV3RGF0YS5jcmVhdGVkQXQ7IC8vIFRoaXMgc2hvdWxkIGJlIGdvbmVcbiAgc2FtcGxlTmV3RGF0YS5zZWNvbmREeW5hbWljYWxseUFkZGVkRmllbGQgPSBcIkR5bmFtaWNhbGx5IGFkZGVkIHZhbHVlIG92ZXJ3cml0dGVuIGJ5IHVzZXJcIjsgLy8gc2Vjb25kZHluYW1pY2FsbHlBZGRlZEZpZWxkIHNob3VsZCBiZSBnb25lXG4gIHNhbXBsZU5ld0RhdGEudHJhbnNhY3Rpb25faWQgPSBcIm92ZXJ3cml0dGVuIHRyYW5zYWN0aW9uIGlkXCI7IC8vIFRoaXMgZmllbGQgc2hvdWxkIGJlIGNoYW5nZWRcblxuICAvLyBSdW4gdGhlIHRlc3RcblxuICBjb25zb2xlLmxvZyhNb25nb2wuZGlmZkRvY3VtZW50RGF0YShzYW1wbGVEYkRvYywgc2FtcGxlTmV3RGF0YSwgc2FtcGxlT2xkRGF0YSkpO1xuXG59KTsqL1xuXG5leHBvcnQgeyBVdGlsaXRpZXMgfSJdfQ==
