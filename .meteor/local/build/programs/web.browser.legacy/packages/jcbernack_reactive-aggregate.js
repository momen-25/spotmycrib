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
var _ = Package.underscore._;
var Mongo = Package.mongo.Mongo;
var meteorInstall = Package.modules.meteorInstall;
var meteorBabelHelpers = Package.modules.meteorBabelHelpers;
var Promise = Package.promise.Promise;
var Symbol = Package['ecmascript-runtime-client'].Symbol;
var Map = Package['ecmascript-runtime-client'].Map;
var Set = Package['ecmascript-runtime-client'].Set;

var require = meteorInstall({"node_modules":{"meteor":{"jcbernack:reactive-aggregate":{"mongo-collection-aggregate.js":function module(require,exports,module){

/////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                     //
// packages/jcbernack_reactive-aggregate/mongo-collection-aggregate.js                                 //
//                                                                                                     //
/////////////////////////////////////////////////////////////////////////////////////////////////////////
                                                                                                       //
var Meteor;
module.link("meteor/meteor", {
  Meteor: function (v) {
    Meteor = v;
  }
}, 0);
var Mongo;
module.link("meteor/mongo", {
  Mongo: function (v) {
    Mongo = v;
  }
}, 1);

Mongo.Collection.prototype.aggregate = function (pipeline, options) {
  var collection = this.rawCollection();
  return Meteor.wrapAsync(collection.aggregate.bind(collection))(pipeline, options);
};
/////////////////////////////////////////////////////////////////////////////////////////////////////////

},"aggregate.js":function module(require,exports,module){

/////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                     //
// packages/jcbernack_reactive-aggregate/aggregate.js                                                  //
//                                                                                                     //
/////////////////////////////////////////////////////////////////////////////////////////////////////////
                                                                                                       //
var _objectSpread;

module.link("@babel/runtime/helpers/objectSpread2", {
  default: function (v) {
    _objectSpread = v;
  }
}, 0);
module.export({
  ReactiveAggregate: function () {
    return ReactiveAggregate;
  }
});
var Meteor;
module.link("meteor/meteor", {
  Meteor: function (v) {
    Meteor = v;
  }
}, 0);
var Mongo;
module.link("meteor/mongo", {
  Mongo: function (v) {
    Mongo = v;
  }
}, 1);

var defaultOptions = function (_ref) {
  var collection = _ref.collection,
      options = _ref.options;
  return _objectSpread({
    observeSelector: {},
    observeOptions: {},
    delay: 250,
    lookupCollections: {},
    clientCollection: collection._name
  }, options);
};

var ReactiveAggregate = function (subscription, collection) {
  var pipeline = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : [];
  var options = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : {};

  // fill out default options
  var _defaultOptions = defaultOptions({
    collection: collection,
    options: options
  }),
      observeSelector = _defaultOptions.observeSelector,
      observeOptions = _defaultOptions.observeOptions,
      delay = _defaultOptions.delay,
      lookupCollections = _defaultOptions.lookupCollections,
      clientCollection = _defaultOptions.clientCollection; // run, or re-run, the aggregation pipeline


  var throttledUpdate = _.throttle(Meteor.bindEnvironment(function () {
    // add and update documents on the client
    collection.aggregate(safePipeline).forEach(function (doc) {
      if (!subscription._ids[doc._id]) {
        subscription.added(clientCollection, doc._id, doc);
      } else {
        subscription.changed(clientCollection, doc._id, doc);
      }

      subscription._ids[doc._id] = subscription._iteration;
    }); // remove documents not in the result anymore

    _.each(subscription._ids, function (iteration, key) {
      if (iteration != subscription._iteration) {
        delete subscription._ids[key];
        subscription.removed(clientCollection, key);
      }
    });

    subscription._iteration++;
  }), delay);

  var update = function () {
    return !initializing ? throttledUpdate() : null;
  }; // don't update the subscription until __after__ the initial hydrating of our collection


  var initializing = true; // mutate the subscription to ensure it updates as we version it

  subscription._ids = {};
  subscription._iteration = 1; // create a list of collections to watch and make sure
  // we create a sanitized "strings-only" version of our pipeline

  var observerHandles = [createObserver(collection, {
    observeSelector: observeSelector,
    observeOptions: observeOptions
  })]; // look for $lookup collections passed in as Mongo.Collection instances
  // and create observers for them
  // if any $lookup.from stages are passed in as strings they will be omitted
  // from this process. the aggregation will still work, but those collections
  // will not force an update to this query if changed.

  var safePipeline = pipeline.map(function (stage) {
    if (stage.$lookup && stage.$lookup.from instanceof Mongo.Collection) {
      var _collection = stage.$lookup.from;
      observerHandles.push(createObserver(_collection, lookupCollections[_collection._name]));
      return _objectSpread(_objectSpread({}, stage), {}, {
        $lookup: _objectSpread(_objectSpread({}, stage.$lookup), {}, {
          from: _collection._name
        })
      });
    }

    return stage;
  }); // observeChanges() will immediately fire an "added" event for each document in the query
  // these are skipped using the initializing flag

  initializing = false; // send an initial result set to the client

  update(); // mark the subscription as ready

  subscription.ready(); // stop observing the cursor when the client unsubscribes

  subscription.onStop(function () {
    return observerHandles.map(function (handle) {
      return handle.stop();
    });
  });
  /**
  * Create observer
  * @param {Mongo.Collection|*} collection
  * @returns {any|*|Meteor.LiveQueryHandle} Handle
  */

  function createObserver(collection) {
    var queryOptions = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};
    var observeSelector = queryOptions.observeSelector,
        observeOptions = queryOptions.observeOptions;
    var selector = observeSelector || {};
    var options = observeOptions || {};
    var query = collection.find(selector, options);
    return query.observeChanges({
      added: update,
      changed: update,
      removed: update,
      error: function (err) {
        throw err;
      }
    });
  }
};
/////////////////////////////////////////////////////////////////////////////////////////////////////////

}}}}},{
  "extensions": [
    ".js",
    ".json"
  ]
});

require("/node_modules/meteor/jcbernack:reactive-aggregate/mongo-collection-aggregate.js");
var exports = require("/node_modules/meteor/jcbernack:reactive-aggregate/aggregate.js");

/* Exports */
Package._define("jcbernack:reactive-aggregate", exports);

})();
