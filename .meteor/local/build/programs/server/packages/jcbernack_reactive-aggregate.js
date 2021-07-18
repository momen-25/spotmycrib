(function () {

/* Imports */
var Meteor = Package.meteor.Meteor;
var global = Package.meteor.global;
var meteorEnv = Package.meteor.meteorEnv;
var ECMAScript = Package.ecmascript.ECMAScript;
var _ = Package.underscore._;
var MongoInternals = Package.mongo.MongoInternals;
var Mongo = Package.mongo.Mongo;
var meteorInstall = Package.modules.meteorInstall;
var Promise = Package.promise.Promise;

var require = meteorInstall({"node_modules":{"meteor":{"jcbernack:reactive-aggregate":{"mongo-collection-aggregate.js":function module(require,exports,module){

//////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                              //
// packages/jcbernack_reactive-aggregate/mongo-collection-aggregate.js                          //
//                                                                                              //
//////////////////////////////////////////////////////////////////////////////////////////////////
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

Mongo.Collection.prototype.aggregate = function (pipeline, options) {
  const collection = this.rawCollection();
  return Meteor.wrapAsync(collection.aggregate.bind(collection))(pipeline, options);
};
//////////////////////////////////////////////////////////////////////////////////////////////////

},"aggregate.js":function module(require,exports,module){

//////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                              //
// packages/jcbernack_reactive-aggregate/aggregate.js                                           //
//                                                                                              //
//////////////////////////////////////////////////////////////////////////////////////////////////
                                                                                                //
let _objectSpread;

module.link("@babel/runtime/helpers/objectSpread2", {
  default(v) {
    _objectSpread = v;
  }

}, 0);
module.export({
  ReactiveAggregate: () => ReactiveAggregate
});
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

const defaultOptions = (_ref) => {
  let {
    collection,
    options
  } = _ref;
  return _objectSpread({
    observeSelector: {},
    observeOptions: {},
    delay: 250,
    lookupCollections: {},
    clientCollection: collection._name
  }, options);
};

const ReactiveAggregate = function (subscription, collection) {
  let pipeline = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : [];
  let options = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : {};
  // fill out default options
  const {
    observeSelector,
    observeOptions,
    delay,
    lookupCollections,
    clientCollection
  } = defaultOptions({
    collection,
    options
  }); // run, or re-run, the aggregation pipeline

  const throttledUpdate = _.throttle(Meteor.bindEnvironment(() => {
    // add and update documents on the client
    collection.aggregate(safePipeline).forEach(doc => {
      if (!subscription._ids[doc._id]) {
        subscription.added(clientCollection, doc._id, doc);
      } else {
        subscription.changed(clientCollection, doc._id, doc);
      }

      subscription._ids[doc._id] = subscription._iteration;
    }); // remove documents not in the result anymore

    _.each(subscription._ids, (iteration, key) => {
      if (iteration != subscription._iteration) {
        delete subscription._ids[key];
        subscription.removed(clientCollection, key);
      }
    });

    subscription._iteration++;
  }), delay);

  const update = () => !initializing ? throttledUpdate() : null; // don't update the subscription until __after__ the initial hydrating of our collection


  let initializing = true; // mutate the subscription to ensure it updates as we version it

  subscription._ids = {};
  subscription._iteration = 1; // create a list of collections to watch and make sure
  // we create a sanitized "strings-only" version of our pipeline

  const observerHandles = [createObserver(collection, {
    observeSelector,
    observeOptions
  })]; // look for $lookup collections passed in as Mongo.Collection instances
  // and create observers for them
  // if any $lookup.from stages are passed in as strings they will be omitted
  // from this process. the aggregation will still work, but those collections
  // will not force an update to this query if changed.

  const safePipeline = pipeline.map(stage => {
    if (stage.$lookup && stage.$lookup.from instanceof Mongo.Collection) {
      const collection = stage.$lookup.from;
      observerHandles.push(createObserver(collection, lookupCollections[collection._name]));
      return _objectSpread(_objectSpread({}, stage), {}, {
        $lookup: _objectSpread(_objectSpread({}, stage.$lookup), {}, {
          from: collection._name
        })
      });
    }

    return stage;
  }); // observeChanges() will immediately fire an "added" event for each document in the query
  // these are skipped using the initializing flag

  initializing = false; // send an initial result set to the client

  update(); // mark the subscription as ready

  subscription.ready(); // stop observing the cursor when the client unsubscribes

  subscription.onStop(() => observerHandles.map(handle => handle.stop()));
  /**
  * Create observer
  * @param {Mongo.Collection|*} collection
  * @returns {any|*|Meteor.LiveQueryHandle} Handle
  */

  function createObserver(collection) {
    let queryOptions = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};
    const {
      observeSelector,
      observeOptions
    } = queryOptions;
    const selector = observeSelector || {};
    const options = observeOptions || {};
    const query = collection.find(selector, options);
    return query.observeChanges({
      added: update,
      changed: update,
      removed: update,
      error: err => {
        throw err;
      }
    });
  }
};
//////////////////////////////////////////////////////////////////////////////////////////////////

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

//# sourceURL=meteor://💻app/packages/jcbernack_reactive-aggregate.js
//# sourceMappingURL=data:application/json;charset=utf8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm1ldGVvcjovL/CfkrthcHAvcGFja2FnZXMvamNiZXJuYWNrOnJlYWN0aXZlLWFnZ3JlZ2F0ZS9tb25nby1jb2xsZWN0aW9uLWFnZ3JlZ2F0ZS5qcyIsIm1ldGVvcjovL/CfkrthcHAvcGFja2FnZXMvamNiZXJuYWNrOnJlYWN0aXZlLWFnZ3JlZ2F0ZS9hZ2dyZWdhdGUuanMiXSwibmFtZXMiOlsiTWV0ZW9yIiwibW9kdWxlIiwibGluayIsInYiLCJNb25nbyIsIkNvbGxlY3Rpb24iLCJwcm90b3R5cGUiLCJhZ2dyZWdhdGUiLCJwaXBlbGluZSIsIm9wdGlvbnMiLCJjb2xsZWN0aW9uIiwicmF3Q29sbGVjdGlvbiIsIndyYXBBc3luYyIsImJpbmQiLCJfb2JqZWN0U3ByZWFkIiwiZGVmYXVsdCIsImV4cG9ydCIsIlJlYWN0aXZlQWdncmVnYXRlIiwiZGVmYXVsdE9wdGlvbnMiLCJvYnNlcnZlU2VsZWN0b3IiLCJvYnNlcnZlT3B0aW9ucyIsImRlbGF5IiwibG9va3VwQ29sbGVjdGlvbnMiLCJjbGllbnRDb2xsZWN0aW9uIiwiX25hbWUiLCJzdWJzY3JpcHRpb24iLCJ0aHJvdHRsZWRVcGRhdGUiLCJfIiwidGhyb3R0bGUiLCJiaW5kRW52aXJvbm1lbnQiLCJzYWZlUGlwZWxpbmUiLCJmb3JFYWNoIiwiZG9jIiwiX2lkcyIsIl9pZCIsImFkZGVkIiwiY2hhbmdlZCIsIl9pdGVyYXRpb24iLCJlYWNoIiwiaXRlcmF0aW9uIiwia2V5IiwicmVtb3ZlZCIsInVwZGF0ZSIsImluaXRpYWxpemluZyIsIm9ic2VydmVySGFuZGxlcyIsImNyZWF0ZU9ic2VydmVyIiwibWFwIiwic3RhZ2UiLCIkbG9va3VwIiwiZnJvbSIsInB1c2giLCJyZWFkeSIsIm9uU3RvcCIsImhhbmRsZSIsInN0b3AiLCJxdWVyeU9wdGlvbnMiLCJzZWxlY3RvciIsInF1ZXJ5IiwiZmluZCIsIm9ic2VydmVDaGFuZ2VzIiwiZXJyb3IiLCJlcnIiXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7Ozs7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TUFEbUI7QUFFMUJOLGFBQU8sRUFBRU0sTUFGaUI7QUFHMUJELGFBQU8sRUFBRUMsTUFIaUI7QUFJMUJrQixXQUFLLEVBQUdDLEdBQUQsSUFBUztBQUNkLGNBQU1BLEdBQU47QUFDRDtBQU55QixLQUFyQixDQUFQO0FBUUQ7QUFDRixDQXpGTSxDIiwiZmlsZSI6Ii9wYWNrYWdlcy9qY2Jlcm5hY2tfcmVhY3RpdmUtYWdncmVnYXRlLmpzIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHsgTWV0ZW9yIH0gZnJvbSAnbWV0ZW9yL21ldGVvcic7XG5pbXBvcnQgeyBNb25nbyB9IGZyb20gJ21ldGVvci9tb25nbyc7XG5cbk1vbmdvLkNvbGxlY3Rpb24ucHJvdG90eXBlLmFnZ3JlZ2F0ZSA9IGZ1bmN0aW9uKHBpcGVsaW5lLCBvcHRpb25zKSB7XG4gIGNvbnN0IGNvbGxlY3Rpb24gPSB0aGlzLnJhd0NvbGxlY3Rpb24oKTtcbiAgcmV0dXJuIE1ldGVvci53cmFwQXN5bmMoY29sbGVjdGlvbi5hZ2dyZWdhdGUuYmluZChjb2xsZWN0aW9uKSkocGlwZWxpbmUsIG9wdGlvbnMpO1xufVxuIiwiaW1wb3J0IHsgTWV0ZW9yIH0gZnJvbSAnbWV0ZW9yL21ldGVvcic7XG5pbXBvcnQgeyBNb25nbyB9IGZyb20gJ21ldGVvci9tb25nbyc7XG5cbmNvbnN0IGRlZmF1bHRPcHRpb25zID0gKHtcbiAgY29sbGVjdGlvbiwgb3B0aW9uc1xufSkgPT4gKHtcbiAgb2JzZXJ2ZVNlbGVjdG9yOiB7fSxcbiAgb2JzZXJ2ZU9wdGlvbnM6IHt9LFxuICBkZWxheTogMjUwLFxuICBsb29rdXBDb2xsZWN0aW9uczoge30sXG4gIGNsaWVudENvbGxlY3Rpb246IGNvbGxlY3Rpb24uX25hbWUsXG4gIC4uLm9wdGlvbnNcbn0pO1xuXG5leHBvcnQgY29uc3QgUmVhY3RpdmVBZ2dyZWdhdGUgPSBmdW5jdGlvbiAoc3Vic2NyaXB0aW9uLCBjb2xsZWN0aW9uLCBwaXBlbGluZSA9IFtdLCBvcHRpb25zID0ge30pIHtcbiAgLy8gZmlsbCBvdXQgZGVmYXVsdCBvcHRpb25zXG4gIGNvbnN0IHtcbiAgICBvYnNlcnZlU2VsZWN0b3IsIG9ic2VydmVPcHRpb25zLCBkZWxheSwgbG9va3VwQ29sbGVjdGlvbnMsIGNsaWVudENvbGxlY3Rpb25cbiAgfSA9IGRlZmF1bHRPcHRpb25zKHtcbiAgICBjb2xsZWN0aW9uLFxuICAgIG9wdGlvbnNcbiAgfSk7XG5cbiAgLy8gcnVuLCBvciByZS1ydW4sIHRoZSBhZ2dyZWdhdGlvbiBwaXBlbGluZVxuICBjb25zdCB0aHJvdHRsZWRVcGRhdGUgPSBfLnRocm90dGxlKE1ldGVvci5iaW5kRW52aXJvbm1lbnQoKCkgPT4ge1xuICAgIC8vIGFkZCBhbmQgdXBkYXRlIGRvY3VtZW50cyBvbiB0aGUgY2xpZW50XG4gICAgY29sbGVjdGlvbi5hZ2dyZWdhdGUoc2FmZVBpcGVsaW5lKS5mb3JFYWNoKChkb2MpID0+IHtcbiAgICAgIGlmICghc3Vic2NyaXB0aW9uLl9pZHNbZG9jLl9pZF0pIHtcbiAgICAgICAgc3Vic2NyaXB0aW9uLmFkZGVkKGNsaWVudENvbGxlY3Rpb24sIGRvYy5faWQsIGRvYyk7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICBzdWJzY3JpcHRpb24uY2hhbmdlZChjbGllbnRDb2xsZWN0aW9uLCBkb2MuX2lkLCBkb2MpO1xuICAgICAgfVxuICAgICAgc3Vic2NyaXB0aW9uLl9pZHNbZG9jLl9pZF0gPSBzdWJzY3JpcHRpb24uX2l0ZXJhdGlvbjtcbiAgICB9KTtcbiAgICAvLyByZW1vdmUgZG9jdW1lbnRzIG5vdCBpbiB0aGUgcmVzdWx0IGFueW1vcmVcbiAgICBfLmVhY2goc3Vic2NyaXB0aW9uLl9pZHMsIChpdGVyYXRpb24sIGtleSkgPT4ge1xuICAgICAgaWYgKGl0ZXJhdGlvbiAhPSBzdWJzY3JpcHRpb24uX2l0ZXJhdGlvbikge1xuICAgICAgICBkZWxldGUgc3Vic2NyaXB0aW9uLl9pZHNba2V5XTtcbiAgICAgICAgc3Vic2NyaXB0aW9uLnJlbW92ZWQoY2xpZW50Q29sbGVjdGlvbiwga2V5KTtcbiAgICAgIH1cbiAgICB9KTtcbiAgICBzdWJzY3JpcHRpb24uX2l0ZXJhdGlvbisrO1xuICB9KSwgZGVsYXkpO1xuICBjb25zdCB1cGRhdGUgPSAoKSA9PiAhaW5pdGlhbGl6aW5nID8gdGhyb3R0bGVkVXBkYXRlKCkgOiBudWxsO1xuXG4gIC8vIGRvbid0IHVwZGF0ZSB0aGUgc3Vic2NyaXB0aW9uIHVudGlsIF9fYWZ0ZXJfXyB0aGUgaW5pdGlhbCBoeWRyYXRpbmcgb2Ygb3VyIGNvbGxlY3Rpb25cbiAgbGV0IGluaXRpYWxpemluZyA9IHRydWU7XG4gIC8vIG11dGF0ZSB0aGUgc3Vic2NyaXB0aW9uIHRvIGVuc3VyZSBpdCB1cGRhdGVzIGFzIHdlIHZlcnNpb24gaXRcbiAgc3Vic2NyaXB0aW9uLl9pZHMgPSB7fTtcbiAgc3Vic2NyaXB0aW9uLl9pdGVyYXRpb24gPSAxO1xuXG4gIC8vIGNyZWF0ZSBhIGxpc3Qgb2YgY29sbGVjdGlvbnMgdG8gd2F0Y2ggYW5kIG1ha2Ugc3VyZVxuICAvLyB3ZSBjcmVhdGUgYSBzYW5pdGl6ZWQgXCJzdHJpbmdzLW9ubHlcIiB2ZXJzaW9uIG9mIG91ciBwaXBlbGluZVxuICBjb25zdCBvYnNlcnZlckhhbmRsZXMgPSBbY3JlYXRlT2JzZXJ2ZXIoY29sbGVjdGlvbiwgeyBvYnNlcnZlU2VsZWN0b3IsIG9ic2VydmVPcHRpb25zIH0pXTtcbiAgLy8gbG9vayBmb3IgJGxvb2t1cCBjb2xsZWN0aW9ucyBwYXNzZWQgaW4gYXMgTW9uZ28uQ29sbGVjdGlvbiBpbnN0YW5jZXNcbiAgLy8gYW5kIGNyZWF0ZSBvYnNlcnZlcnMgZm9yIHRoZW1cbiAgLy8gaWYgYW55ICRsb29rdXAuZnJvbSBzdGFnZXMgYXJlIHBhc3NlZCBpbiBhcyBzdHJpbmdzIHRoZXkgd2lsbCBiZSBvbWl0dGVkXG4gIC8vIGZyb20gdGhpcyBwcm9jZXNzLiB0aGUgYWdncmVnYXRpb24gd2lsbCBzdGlsbCB3b3JrLCBidXQgdGhvc2UgY29sbGVjdGlvbnNcbiAgLy8gd2lsbCBub3QgZm9yY2UgYW4gdXBkYXRlIHRvIHRoaXMgcXVlcnkgaWYgY2hhbmdlZC5cbiAgY29uc3Qgc2FmZVBpcGVsaW5lID0gcGlwZWxpbmUubWFwKChzdGFnZSkgPT4ge1xuICAgIGlmIChzdGFnZS4kbG9va3VwICYmIHN0YWdlLiRsb29rdXAuZnJvbSBpbnN0YW5jZW9mIE1vbmdvLkNvbGxlY3Rpb24pIHtcbiAgICAgIGNvbnN0IGNvbGxlY3Rpb24gPSBzdGFnZS4kbG9va3VwLmZyb207XG4gICAgICBvYnNlcnZlckhhbmRsZXMucHVzaChjcmVhdGVPYnNlcnZlcihjb2xsZWN0aW9uLCBsb29rdXBDb2xsZWN0aW9uc1tjb2xsZWN0aW9uLl9uYW1lXSkpO1xuICAgICAgcmV0dXJuIHtcbiAgICAgICAgLi4uc3RhZ2UsXG4gICAgICAgICRsb29rdXA6IHtcbiAgICAgICAgICAuLi5zdGFnZS4kbG9va3VwLFxuICAgICAgICAgIGZyb206IGNvbGxlY3Rpb24uX25hbWVcbiAgICAgICAgfVxuICAgICAgfTtcbiAgICB9XG4gICAgcmV0dXJuIHN0YWdlO1xuICB9KTtcblxuICAvLyBvYnNlcnZlQ2hhbmdlcygpIHdpbGwgaW1tZWRpYXRlbHkgZmlyZSBhbiBcImFkZGVkXCIgZXZlbnQgZm9yIGVhY2ggZG9jdW1lbnQgaW4gdGhlIHF1ZXJ5XG4gIC8vIHRoZXNlIGFyZSBza2lwcGVkIHVzaW5nIHRoZSBpbml0aWFsaXppbmcgZmxhZ1xuICBpbml0aWFsaXppbmcgPSBmYWxzZTtcbiAgLy8gc2VuZCBhbiBpbml0aWFsIHJlc3VsdCBzZXQgdG8gdGhlIGNsaWVudFxuICB1cGRhdGUoKTtcbiAgLy8gbWFyayB0aGUgc3Vic2NyaXB0aW9uIGFzIHJlYWR5XG4gIHN1YnNjcmlwdGlvbi5yZWFkeSgpO1xuICAvLyBzdG9wIG9ic2VydmluZyB0aGUgY3Vyc29yIHdoZW4gdGhlIGNsaWVudCB1bnN1YnNjcmliZXNcbiAgc3Vic2NyaXB0aW9uLm9uU3RvcCgoKSA9PiBvYnNlcnZlckhhbmRsZXMubWFwKChoYW5kbGUpID0+IGhhbmRsZS5zdG9wKCkpKTtcblxuICAvKipcblx0ICogQ3JlYXRlIG9ic2VydmVyXG5cdCAqIEBwYXJhbSB7TW9uZ28uQ29sbGVjdGlvbnwqfSBjb2xsZWN0aW9uXG5cdCAqIEByZXR1cm5zIHthbnl8KnxNZXRlb3IuTGl2ZVF1ZXJ5SGFuZGxlfSBIYW5kbGVcblx0ICovXG4gIGZ1bmN0aW9uIGNyZWF0ZU9ic2VydmVyKGNvbGxlY3Rpb24sIHF1ZXJ5T3B0aW9ucyA9IHt9KSB7XG4gICAgY29uc3QgeyBvYnNlcnZlU2VsZWN0b3IsIG9ic2VydmVPcHRpb25zIH0gPSBxdWVyeU9wdGlvbnM7XG4gICAgY29uc3Qgc2VsZWN0b3IgPSBvYnNlcnZlU2VsZWN0b3IgfHwge307XG4gICAgY29uc3Qgb3B0aW9ucyA9IG9ic2VydmVPcHRpb25zIHx8IHt9O1xuICAgIGNvbnN0IHF1ZXJ5ID0gY29sbGVjdGlvbi5maW5kKHNlbGVjdG9yLCBvcHRpb25zKTtcbiAgICByZXR1cm4gcXVlcnkub2JzZXJ2ZUNoYW5nZXMoe1xuICAgICAgYWRkZWQ6IHVwZGF0ZSxcbiAgICAgIGNoYW5nZWQ6IHVwZGF0ZSxcbiAgICAgIHJlbW92ZWQ6IHVwZGF0ZSxcbiAgICAgIGVycm9yOiAoZXJyKSA9PiB7XG4gICAgICAgIHRocm93IGVycjtcbiAgICAgIH1cbiAgICB9KTtcbiAgfVxufTtcbiJdfQ==
