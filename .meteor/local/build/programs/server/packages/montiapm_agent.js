(function () {

/* Imports */
var Meteor = Package.meteor.Meteor;
var global = Package.meteor.global;
var meteorEnv = Package.meteor.meteorEnv;
var MeteorX = Package['montiapm:meteorx'].MeteorX;
var LocalCollection = Package.minimongo.LocalCollection;
var Minimongo = Package.minimongo.Minimongo;
var DDP = Package['ddp-client'].DDP;
var DDPServer = Package['ddp-server'].DDPServer;
var EJSON = Package.ejson.EJSON;
var DDPCommon = Package['ddp-common'].DDPCommon;
var _ = Package.underscore._;
var Random = Package.random.Random;
var WebApp = Package.webapp.WebApp;
var WebAppInternals = Package.webapp.WebAppInternals;
var main = Package.webapp.main;
var ECMAScript = Package.ecmascript.ECMAScript;
var Email = Package.email.Email;
var EmailInternals = Package.email.EmailInternals;
var HTTP = Package.http.HTTP;
var HTTPInternals = Package.http.HTTPInternals;
var meteorInstall = Package.modules.meteorInstall;
var MongoInternals = Package.mongo.MongoInternals;
var Mongo = Package.mongo.Mongo;
var Promise = Package.promise.Promise;

/* Package-scope variables */
var getClientArchVersion, Kadira, Monti, BaseErrorModel, Retry, HaveAsyncCallback, UniqueId, DefaultUniqueId, CreateUserStack, OptimizedApply, getClientVersions, countKeys, iterate, getProperty, Ntp, handleApiResponse, WaitTimeBuilder, OplogCheck, Tracer, TracerStore, kind, KadiraModel, MethodsModel, PubsubModel, SystemModel, ErrorModel, DocSzCache, DocSzCacheItem, wrapServer, wrapSession, wrapSubscription, wrapOplogObserveDriver, wrapPollingObserveDriver, wrapMultiplexer, wrapForCountingObservers, wrapStringifyDDP, hijackDBOps, TrackUncaughtExceptions, TrackUnhandledRejections, TrackMeteorDebug, setLabels, MAX_BODY_SIZE, MAX_STRINGIFIED_BODY_SIZE;

var require = meteorInstall({"node_modules":{"meteor":{"montiapm:agent":{"lib":{"common":{"utils.js":function module(){

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                                     //
// packages/montiapm_agent/lib/common/utils.js                                                                         //
//                                                                                                                     //
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                                                                                                                       //
getClientArchVersion = function (arch) {
  const autoupdate = __meteor_runtime_config__.autoupdate;

  if (autoupdate) {
    return autoupdate.versions[arch] ? autoupdate.versions[arch].version : 'none';
  } // Meteor 1.7 and older did not have an `autoupdate` object.


  switch (arch) {
    case 'cordova.web':
      return __meteor_runtime_config__.autoupdateVersionCordova;

    case 'web.browser':
    case 'web.browser.legacy':
      // Meteor 1.7 always used the web.browser.legacy version
      return __meteor_runtime_config__.autoupdateVersion;

    default:
      return 'none';
  }
};
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

},"unify.js":function module(require){

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                                     //
// packages/montiapm_agent/lib/common/unify.js                                                                         //
//                                                                                                                     //
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                                                                                                                       //
Kadira = {};
Kadira.options = {};
Monti = Kadira;

if (Meteor.wrapAsync) {
  Kadira._wrapAsync = Meteor.wrapAsync;
} else {
  Kadira._wrapAsync = Meteor._wrapAsync;
}

if (Meteor.isServer) {
  var EventEmitter = Npm.require('events').EventEmitter;

  var eventBus = new EventEmitter();
  eventBus.setMaxListeners(0);

  var buildArgs = function (args) {
    var eventName = args[0] + '-' + args[1];
    var args = args.slice(2);
    args.unshift(eventName);
    return args;
  };

  Kadira.EventBus = {};
  ['on', 'emit', 'removeListener', 'removeAllListeners'].forEach(function (m) {
    Kadira.EventBus[m] = function () {
      for (var _len = arguments.length, args = new Array(_len), _key = 0; _key < _len; _key++) {
        args[_key] = arguments[_key];
      }

      var args = buildArgs(args);
      return eventBus[m].apply(eventBus, args);
    };
  });
}
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

},"default_error_filters.js":function module(){

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                                     //
// packages/montiapm_agent/lib/common/default_error_filters.js                                                         //
//                                                                                                                     //
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                                                                                                                       //
var commonErrRegExps = [/connection timeout\. no (\w*) heartbeat received/i, /INVALID_STATE_ERR/i];
Kadira.errorFilters = {
  filterValidationErrors: function (type, message, err) {
    if (err && err instanceof Meteor.Error) {
      return false;
    } else {
      return true;
    }
  },
  filterCommonMeteorErrors: function (type, message) {
    for (var lc = 0; lc < commonErrRegExps.length; lc++) {
      var regExp = commonErrRegExps[lc];

      if (regExp.test(message)) {
        return false;
      }
    }

    return true;
  }
};
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

},"send.js":function module(){

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                                     //
// packages/montiapm_agent/lib/common/send.js                                                                          //
//                                                                                                                     //
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                                                                                                                       //
Kadira.send = function (payload, path, callback) {
  if (!Kadira.connected) {
    throw new Error("You need to connect with Kadira first, before sending messages!");
  }

  path = path.substr(0, 1) != '/' ? "/" + path : path;
  var endpoint = Kadira.options.endpoint + path;
  var retryCount = 0;
  var retry = new Retry({
    minCount: 1,
    minTimeout: 0,
    baseTimeout: 1000 * 5,
    maxTimeout: 1000 * 60
  });

  var sendFunction = Kadira._getSendFunction();

  tryToSend();

  function tryToSend(err) {
    if (retryCount < 5) {
      retry.retryLater(retryCount++, send);
    } else {
      console.warn('Error sending error traces to Monti APM server');
      if (callback) callback(err);
    }
  }

  function send() {
    sendFunction(endpoint, payload, function (err, res) {
      if (err && !res) {
        tryToSend(err);
      } else if (res.statusCode == 200) {
        if (callback) callback(null, res.data);
      } else {
        if (callback) callback(new Meteor.Error(res.statusCode, res.content));
      }
    });
  }
};

Kadira._getSendFunction = function () {
  return Meteor.isServer ? Kadira._serverSend : Kadira._clientSend;
};

Kadira._clientSend = function (endpoint, payload, callback) {
  httpRequest('POST', endpoint, {
    headers: {
      'Content-Type': 'application/json'
    },
    content: JSON.stringify(payload)
  }, callback);
};

Kadira._serverSend = function () {
  throw new Error('Kadira._serverSend is not supported. Use coreApi instead.');
};
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

}},"models":{"base_error.js":function module(){

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                                     //
// packages/montiapm_agent/lib/models/base_error.js                                                                    //
//                                                                                                                     //
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                                                                                                                       //
BaseErrorModel = function (options) {
  this._filters = [];
};

BaseErrorModel.prototype.addFilter = function (filter) {
  if (typeof filter === 'function') {
    this._filters.push(filter);
  } else {
    throw new Error("Error filter must be a function");
  }
};

BaseErrorModel.prototype.removeFilter = function (filter) {
  var index = this._filters.indexOf(filter);

  if (index >= 0) {
    this._filters.splice(index, 1);
  }
};

BaseErrorModel.prototype.applyFilters = function (type, message, error, subType) {
  for (var lc = 0; lc < this._filters.length; lc++) {
    var filter = this._filters[lc];

    try {
      var validated = filter(type, message, error, subType);
      if (!validated) return false;
    } catch (ex) {
      // we need to remove this filter
      // we may ended up in a error cycle
      this._filters.splice(lc, 1);

      throw new Error("an error thrown from a filter you've suplied", ex.message);
    }
  }

  return true;
};
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

},"0model.js":function module(){

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                                     //
// packages/montiapm_agent/lib/models/0model.js                                                                        //
//                                                                                                                     //
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                                                                                                                       //
KadiraModel = function () {};

KadiraModel.prototype._getDateId = function (timestamp) {
  var remainder = timestamp % (1000 * 60);
  var dateId = timestamp - remainder;
  return dateId;
};
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

},"methods.js":function module(require){

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                                     //
// packages/montiapm_agent/lib/models/methods.js                                                                       //
//                                                                                                                     //
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                                                                                                                       //
const {
  DDSketch
} = require('monti-apm-sketches-js');

var METHOD_METRICS_FIELDS = ['wait', 'db', 'http', 'email', 'async', 'compute', 'total'];

MethodsModel = function (metricsThreshold) {
  this.methodMetricsByMinute = Object.create(null);
  this.errorMap = Object.create(null);
  this._metricsThreshold = _.extend({
    "wait": 100,
    "db": 100,
    "http": 1000,
    "email": 100,
    "async": 100,
    "compute": 100,
    "total": 200
  }, metricsThreshold || Object.create(null)); //store max time elapsed methods for each method, event(metrics-field)

  this.maxEventTimesForMethods = Object.create(null);
  this.tracerStore = new TracerStore({
    interval: 1000 * 60,
    //process traces every minute
    maxTotalPoints: 30,
    //for 30 minutes
    archiveEvery: 5 //always trace for every 5 minutes,

  });
  this.tracerStore.start();
};

_.extend(MethodsModel.prototype, KadiraModel.prototype);

MethodsModel.prototype._getMetrics = function (timestamp, method) {
  var dateId = this._getDateId(timestamp);

  if (!this.methodMetricsByMinute[dateId]) {
    this.methodMetricsByMinute[dateId] = {
      methods: Object.create(null)
    };
  }

  var methods = this.methodMetricsByMinute[dateId].methods; //initialize method

  if (!methods[method]) {
    methods[method] = {
      count: 0,
      errors: 0,
      fetchedDocSize: 0,
      sentMsgSize: 0,
      histogram: new DDSketch({
        alpha: 0.02
      })
    };
    METHOD_METRICS_FIELDS.forEach(function (field) {
      methods[method][field] = 0;
    });
  }

  return this.methodMetricsByMinute[dateId].methods[method];
};

MethodsModel.prototype.setStartTime = function (timestamp) {
  this.metricsByMinute[dateId].startTime = timestamp;
};

MethodsModel.prototype.processMethod = function (methodTrace) {
  var dateId = this._getDateId(methodTrace.at); //append metrics to previous values


  this._appendMetrics(dateId, methodTrace);

  if (methodTrace.errored) {
    this.methodMetricsByMinute[dateId].methods[methodTrace.name].errors++;
  }

  this.tracerStore.addTrace(methodTrace);
};

MethodsModel.prototype._appendMetrics = function (id, methodTrace) {
  var methodMetrics = this._getMetrics(id, methodTrace.name); // startTime needs to be converted into serverTime before sending


  if (!this.methodMetricsByMinute[id].startTime) {
    this.methodMetricsByMinute[id].startTime = methodTrace.at;
  } //merge


  METHOD_METRICS_FIELDS.forEach(function (field) {
    var value = methodTrace.metrics[field];

    if (value > 0) {
      methodMetrics[field] += value;
    }
  });
  methodMetrics.count++;
  methodMetrics.histogram.add(methodTrace.metrics.total);
  this.methodMetricsByMinute[id].endTime = methodTrace.metrics.at;
};

MethodsModel.prototype.trackDocSize = function (method, size) {
  var timestamp = Ntp._now();

  var dateId = this._getDateId(timestamp);

  var methodMetrics = this._getMetrics(dateId, method);

  methodMetrics.fetchedDocSize += size;
};

MethodsModel.prototype.trackMsgSize = function (method, size) {
  var timestamp = Ntp._now();

  var dateId = this._getDateId(timestamp);

  var methodMetrics = this._getMetrics(dateId, method);

  methodMetrics.sentMsgSize += size;
};
/*
  There are two types of data

  1. methodMetrics - metrics about the methods (for every 10 secs)
  2. methodRequests - raw method request. normally max, min for every 1 min and errors always
*/


MethodsModel.prototype.buildPayload = function (buildDetailedInfo) {
  var payload = {
    methodMetrics: [],
    methodRequests: []
  }; //handling metrics

  var methodMetricsByMinute = this.methodMetricsByMinute;
  this.methodMetricsByMinute = Object.create(null); //create final paylod for methodMetrics

  for (var key in methodMetricsByMinute) {
    var methodMetrics = methodMetricsByMinute[key]; // converting startTime into the actual serverTime

    var startTime = methodMetrics.startTime;
    methodMetrics.startTime = Kadira.syncedDate.syncTime(startTime);

    for (var methodName in methodMetrics.methods) {
      METHOD_METRICS_FIELDS.forEach(function (field) {
        methodMetrics.methods[methodName][field] /= methodMetrics.methods[methodName].count;
      });
    }

    payload.methodMetrics.push(methodMetricsByMinute[key]);
  } //collect traces and send them with the payload


  payload.methodRequests = this.tracerStore.collectTraces();
  return payload;
};
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

},"pubsub.js":function module(require){

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                                     //
// packages/montiapm_agent/lib/models/pubsub.js                                                                        //
//                                                                                                                     //
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                                                                                                                       //
var logger = Npm.require('debug')('kadira:pubsub');

const {
  DDSketch
} = require('monti-apm-sketches-js');

PubsubModel = function () {
  this.metricsByMinute = Object.create(null);
  this.subscriptions = Object.create(null);
  this.tracerStore = new TracerStore({
    interval: 1000 * 60,
    //process traces every minute
    maxTotalPoints: 30,
    //for 30 minutes
    archiveEvery: 5 //always trace for every 5 minutes,

  });
  this.tracerStore.start();
};

PubsubModel.prototype._trackSub = function (session, msg) {
  logger('SUB:', session.id, msg.id, msg.name, msg.params);

  var publication = this._getPublicationName(msg.name);

  var subscriptionId = msg.id;

  var timestamp = Ntp._now();

  var metrics = this._getMetrics(timestamp, publication);

  metrics.subs++;
  this.subscriptions[msg.id] = {
    // We use localTime here, because when we used synedTime we might get
    // minus or more than we've expected
    //   (before serverTime diff changed overtime)
    startTime: timestamp,
    publication: publication,
    params: msg.params,
    id: msg.id
  }; //set session startedTime

  session._startTime = session._startTime || timestamp;
};

_.extend(PubsubModel.prototype, KadiraModel.prototype);

PubsubModel.prototype._trackUnsub = function (session, sub) {
  logger('UNSUB:', session.id, sub._subscriptionId);

  var publication = this._getPublicationName(sub._name);

  var subscriptionId = sub._subscriptionId;
  var subscriptionState = this.subscriptions[subscriptionId];
  var startTime = null; //sometime, we don't have these states

  if (subscriptionState) {
    startTime = subscriptionState.startTime;
  } else {
    //if this is null subscription, which is started automatically
    //hence, we don't have a state
    startTime = session._startTime;
  } //in case, we can't get the startTime


  if (startTime) {
    var timestamp = Ntp._now();

    var metrics = this._getMetrics(timestamp, publication); //track the count


    if (sub._name != null) {
      // we can't track subs for `null` publications.
      // so we should not track unsubs too
      metrics.unsubs++;
    } //use the current date to get the lifeTime of the subscription


    metrics.lifeTime += timestamp - startTime; //this is place we can clean the subscriptionState if exists

    delete this.subscriptions[subscriptionId];
  }
};

PubsubModel.prototype._trackReady = function (session, sub, trace) {
  logger('READY:', session.id, sub._subscriptionId); //use the current time to track the response time

  var publication = this._getPublicationName(sub._name);

  var subscriptionId = sub._subscriptionId;

  var timestamp = Ntp._now();

  var metrics = this._getMetrics(timestamp, publication);

  var subscriptionState = this.subscriptions[subscriptionId];

  if (subscriptionState && !subscriptionState.readyTracked) {
    var resTime = timestamp - subscriptionState.startTime;
    metrics.resTime += resTime;
    subscriptionState.readyTracked = true;
    metrics.histogram.add(resTime);
  }

  if (trace) {
    this.tracerStore.addTrace(trace);
  }
};

PubsubModel.prototype._trackError = function (session, sub, trace) {
  logger('ERROR:', session.id, sub._subscriptionId); //use the current time to track the response time

  var publication = this._getPublicationName(sub._name);

  var subscriptionId = sub._subscriptionId;

  var timestamp = Ntp._now();

  var metrics = this._getMetrics(timestamp, publication);

  metrics.errors++;

  if (trace) {
    this.tracerStore.addTrace(trace);
  }
};

PubsubModel.prototype._getMetrics = function (timestamp, publication) {
  var dateId = this._getDateId(timestamp);

  if (!this.metricsByMinute[dateId]) {
    this.metricsByMinute[dateId] = {
      // startTime needs to be convert to serverTime before sending to the server
      startTime: timestamp,
      pubs: Object.create(null)
    };
  }

  if (!this.metricsByMinute[dateId].pubs[publication]) {
    this.metricsByMinute[dateId].pubs[publication] = {
      subs: 0,
      unsubs: 0,
      resTime: 0,
      activeSubs: 0,
      activeDocs: 0,
      lifeTime: 0,
      totalObservers: 0,
      cachedObservers: 0,
      createdObservers: 0,
      deletedObservers: 0,
      errors: 0,
      observerLifetime: 0,
      polledDocuments: 0,
      oplogUpdatedDocuments: 0,
      oplogInsertedDocuments: 0,
      oplogDeletedDocuments: 0,
      initiallyAddedDocuments: 0,
      liveAddedDocuments: 0,
      liveChangedDocuments: 0,
      liveRemovedDocuments: 0,
      polledDocSize: 0,
      fetchedDocSize: 0,
      initiallyFetchedDocSize: 0,
      liveFetchedDocSize: 0,
      initiallySentMsgSize: 0,
      liveSentMsgSize: 0,
      histogram: new DDSketch({
        alpha: 0.02
      })
    };
  }

  return this.metricsByMinute[dateId].pubs[publication];
};

PubsubModel.prototype._getPublicationName = function (name) {
  return name || "null(autopublish)";
};

PubsubModel.prototype._getSubscriptionInfo = function () {
  var self = this;
  var activeSubs = Object.create(null);
  var activeDocs = Object.create(null);
  var totalDocsSent = Object.create(null);
  var totalDataSent = Object.create(null);
  var totalObservers = Object.create(null);
  var cachedObservers = Object.create(null);
  iterate(Meteor.server.sessions, session => {
    iterate(session._namedSubs, countSubData);
    iterate(session._universalSubs, countSubData);
  });
  var avgObserverReuse = Object.create(null);

  _.each(totalObservers, function (value, publication) {
    avgObserverReuse[publication] = cachedObservers[publication] / totalObservers[publication];
  });

  return {
    activeSubs: activeSubs,
    activeDocs: activeDocs,
    avgObserverReuse: avgObserverReuse
  };

  function countSubData(sub) {
    var publication = self._getPublicationName(sub._name);

    countSubscriptions(sub, publication);
    countDocuments(sub, publication);
    countObservers(sub, publication);
  }

  function countSubscriptions(sub, publication) {
    activeSubs[publication] = activeSubs[publication] || 0;
    activeSubs[publication]++;
  }

  function countDocuments(sub, publication) {
    activeDocs[publication] = activeDocs[publication] || 0;
    iterate(sub._documents, collection => {
      activeDocs[publication] += countKeys(collection);
    });
  }

  function countObservers(sub, publication) {
    totalObservers[publication] = totalObservers[publication] || 0;
    cachedObservers[publication] = cachedObservers[publication] || 0;
    totalObservers[publication] += sub._totalObservers;
    cachedObservers[publication] += sub._cachedObservers;
  }
};

PubsubModel.prototype.buildPayload = function (buildDetailInfo) {
  var metricsByMinute = this.metricsByMinute;
  this.metricsByMinute = Object.create(null);
  var payload = {
    pubMetrics: []
  };

  var subscriptionData = this._getSubscriptionInfo();

  var activeSubs = subscriptionData.activeSubs;
  var activeDocs = subscriptionData.activeDocs;
  var avgObserverReuse = subscriptionData.avgObserverReuse; //to the averaging

  for (var dateId in metricsByMinute) {
    var dateMetrics = metricsByMinute[dateId]; // We need to convert startTime into actual serverTime

    dateMetrics.startTime = Kadira.syncedDate.syncTime(dateMetrics.startTime);

    for (var publication in metricsByMinute[dateId].pubs) {
      var singlePubMetrics = metricsByMinute[dateId].pubs[publication]; // We only calculate resTime for new subscriptions

      singlePubMetrics.resTime /= singlePubMetrics.subs;
      singlePubMetrics.resTime = singlePubMetrics.resTime || 0; // We only track lifeTime in the unsubs

      singlePubMetrics.lifeTime /= singlePubMetrics.unsubs;
      singlePubMetrics.lifeTime = singlePubMetrics.lifeTime || 0; // Count the average for observer lifetime

      if (singlePubMetrics.deletedObservers > 0) {
        singlePubMetrics.observerLifetime /= singlePubMetrics.deletedObservers;
      } // If there are two ore more dateIds, we will be using the currentCount for all of them.
      // We can come up with a better solution later on.


      singlePubMetrics.activeSubs = activeSubs[publication] || 0;
      singlePubMetrics.activeDocs = activeDocs[publication] || 0;
      singlePubMetrics.avgObserverReuse = avgObserverReuse[publication] || 0;
    }

    payload.pubMetrics.push(metricsByMinute[dateId]);
  } //collect traces and send them with the payload


  payload.pubRequests = this.tracerStore.collectTraces();
  return payload;
};

PubsubModel.prototype.incrementHandleCount = function (trace, isCached) {
  var timestamp = Ntp._now();

  var publicationName = this._getPublicationName(trace.name);

  var publication = this._getMetrics(timestamp, publicationName);

  var session = getProperty(Meteor.server.sessions, trace.session);

  if (session) {
    var sub = getProperty(session._namedSubs, trace.id);

    if (sub) {
      sub._totalObservers = sub._totalObservers || 0;
      sub._cachedObservers = sub._cachedObservers || 0;
    }
  } // not sure, we need to do this? But I don't need to break the however


  sub = sub || {
    _totalObservers: 0,
    _cachedObservers: 0
  };
  publication.totalObservers++;
  sub._totalObservers++;

  if (isCached) {
    publication.cachedObservers++;
    sub._cachedObservers++;
  }
};

PubsubModel.prototype.trackCreatedObserver = function (info) {
  var timestamp = Ntp._now();

  var publicationName = this._getPublicationName(info.name);

  var publication = this._getMetrics(timestamp, publicationName);

  publication.createdObservers++;
};

PubsubModel.prototype.trackDeletedObserver = function (info) {
  var timestamp = Ntp._now();

  var publicationName = this._getPublicationName(info.name);

  var publication = this._getMetrics(timestamp, publicationName);

  publication.deletedObservers++;
  publication.observerLifetime += new Date().getTime() - info.startTime;
};

PubsubModel.prototype.trackDocumentChanges = function (info, op) {
  // It's possibel that info to be null
  // Specially when getting changes at the very begining.
  // This may be false, but nice to have a check
  if (!info) {
    return;
  }

  var timestamp = Ntp._now();

  var publicationName = this._getPublicationName(info.name);

  var publication = this._getMetrics(timestamp, publicationName);

  if (op.op === "d") {
    publication.oplogDeletedDocuments++;
  } else if (op.op === "i") {
    publication.oplogInsertedDocuments++;
  } else if (op.op === "u") {
    publication.oplogUpdatedDocuments++;
  }
};

PubsubModel.prototype.trackPolledDocuments = function (info, count) {
  var timestamp = Ntp._now();

  var publicationName = this._getPublicationName(info.name);

  var publication = this._getMetrics(timestamp, publicationName);

  publication.polledDocuments += count;
};

PubsubModel.prototype.trackLiveUpdates = function (info, type, count) {
  var timestamp = Ntp._now();

  var publicationName = this._getPublicationName(info.name);

  var publication = this._getMetrics(timestamp, publicationName);

  if (type === "_addPublished") {
    publication.liveAddedDocuments += count;
  } else if (type === "_removePublished") {
    publication.liveRemovedDocuments += count;
  } else if (type === "_changePublished") {
    publication.liveChangedDocuments += count;
  } else if (type === "_initialAdds") {
    publication.initiallyAddedDocuments += count;
  } else {
    throw new Error("Kadira: Unknown live update type");
  }
};

PubsubModel.prototype.trackDocSize = function (name, type, size) {
  var timestamp = Ntp._now();

  var publicationName = this._getPublicationName(name);

  var publication = this._getMetrics(timestamp, publicationName);

  if (type === "polledFetches") {
    publication.polledDocSize += size;
  } else if (type === "liveFetches") {
    publication.liveFetchedDocSize += size;
  } else if (type === "cursorFetches") {
    publication.fetchedDocSize += size;
  } else if (type === "initialFetches") {
    publication.initiallyFetchedDocSize += size;
  } else {
    throw new Error("Kadira: Unknown docs fetched type");
  }
};

PubsubModel.prototype.trackMsgSize = function (name, type, size) {
  var timestamp = Ntp._now();

  var publicationName = this._getPublicationName(name);

  var publication = this._getMetrics(timestamp, publicationName);

  if (type === "liveSent") {
    publication.liveSentMsgSize += size;
  } else if (type === "initialSent") {
    publication.initiallySentMsgSize += size;
  } else {
    throw new Error("Kadira: Unknown docs fetched type");
  }
};
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

},"system.js":function module(require,exports,module){

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                                     //
// packages/montiapm_agent/lib/models/system.js                                                                        //
//                                                                                                                     //
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                                                                                                                       //
let createHistogram;
module.link("../utils.js", {
  createHistogram(v) {
    createHistogram = v;
  }

}, 0);
let GCMetrics;
module.link("../hijack/gc.js", {
  default(v) {
    GCMetrics = v;
  }

}, 1);
let getFiberMetrics, resetFiberMetrics;
module.link("../hijack/async.js", {
  getFiberMetrics(v) {
    getFiberMetrics = v;
  },

  resetFiberMetrics(v) {
    resetFiberMetrics = v;
  }

}, 2);
let getMongoDriverStats, resetMongoDriverStats;
module.link("../hijack/mongo-driver-events.js", {
  getMongoDriverStats(v) {
    getMongoDriverStats = v;
  },

  resetMongoDriverStats(v) {
    resetMongoDriverStats = v;
  }

}, 3);

var EventLoopMonitor = Npm.require('evloop-monitor');

SystemModel = function () {
  this.startTime = Ntp._now();
  this.newSessions = 0;
  this.sessionTimeout = 1000 * 60 * 30; //30 min

  this.evloopHistogram = createHistogram();
  this.evloopMonitor = new EventLoopMonitor(200);
  this.evloopMonitor.start();
  this.evloopMonitor.on('lag', lag => {
    // store as microsecond
    this.evloopHistogram.add(lag * 1000);
  });
  this.gcMetrics = new GCMetrics();
  this.gcMetrics.start();
  this.cpuTime = process.hrtime();
  this.previousCpuUsage = process.cpuUsage();
  this.cpuHistory = [];
  this.currentCpuUsage = 0;
  setInterval(() => {
    this.cpuUsage();
  }, 2000);
};

_.extend(SystemModel.prototype, KadiraModel.prototype);

SystemModel.prototype.buildPayload = function () {
  var metrics = {};

  var now = Ntp._now();

  metrics.startTime = Kadira.syncedDate.syncTime(this.startTime);
  metrics.endTime = Kadira.syncedDate.syncTime(now);
  metrics.sessions = countKeys(Meteor.server.sessions);
  let memoryUsage = process.memoryUsage();
  metrics.memory = memoryUsage.rss / (1024 * 1024);
  metrics.memoryArrayBuffers = (memoryUsage.arrayBuffers || 0) / (1024 * 1024);
  metrics.memoryExternal = memoryUsage.external / (1024 * 1024);
  metrics.memoryHeapUsed = memoryUsage.heapUsed / (1024 * 1024);
  metrics.memoryHeapTotal = memoryUsage.heapTotal / (1024 * 1024);
  metrics.newSessions = this.newSessions;
  this.newSessions = 0;
  metrics.activeRequests = process._getActiveRequests().length;
  metrics.activeHandles = process._getActiveHandles().length; // track eventloop metrics

  metrics.pctEvloopBlock = this.evloopMonitor.status().pctBlock;
  metrics.evloopHistogram = this.evloopHistogram;
  this.evloopHistogram = createHistogram();
  metrics.gcMajorDuration = this.gcMetrics.metrics.gcMajor;
  metrics.gcMinorDuration = this.gcMetrics.metrics.gcMinor;
  metrics.gcIncrementalDuration = this.gcMetrics.metrics.gcIncremental;
  metrics.gcWeakCBDuration = this.gcMetrics.metrics.gcWeakCB;
  this.gcMetrics.reset();
  const driverMetrics = getMongoDriverStats();
  resetMongoDriverStats();
  metrics.mongoPoolSize = driverMetrics.poolSize;
  metrics.mongoPoolPrimaryCheckouts = driverMetrics.primaryCheckouts;
  metrics.mongoPoolOtherCheckouts = driverMetrics.otherCheckouts;
  metrics.mongoPoolCheckoutTime = driverMetrics.checkoutTime;
  metrics.mongoPoolMaxCheckoutTime = driverMetrics.maxCheckoutTime;
  metrics.mongoPoolPending = driverMetrics.pending;
  metrics.mongoPoolCheckedOutConnections = driverMetrics.checkedOut;
  metrics.mongoPoolCreatedConnections = driverMetrics.created;
  const fiberMetrics = getFiberMetrics();
  resetFiberMetrics();
  metrics.createdFibers = fiberMetrics.created;
  metrics.activeFibers = fiberMetrics.active;
  metrics.fiberPoolSize = fiberMetrics.poolSize;
  metrics.pcpu = 0;
  metrics.pcpuUser = 0;
  metrics.pcpuSystem = 0;

  if (this.cpuHistory.length > 0) {
    let lastCpuUsage = this.cpuHistory[this.cpuHistory.length - 1];
    metrics.pcpu = lastCpuUsage.usage * 100;
    metrics.pcpuUser = lastCpuUsage.user * 100;
    metrics.pcpuSystem = lastCpuUsage.sys * 100;
  }

  metrics.cpuHistory = this.cpuHistory.map(entry => {
    return {
      time: Kadira.syncedDate.syncTime(entry.time),
      usage: entry.usage,
      sys: entry.sys,
      user: entry.user
    };
  });
  this.cpuHistory = [];
  this.startTime = now;
  return {
    systemMetrics: [metrics]
  };
};

function hrtimeToMS(hrtime) {
  return hrtime[0] * 1000 + hrtime[1] / 1000000;
}

SystemModel.prototype.cpuUsage = function () {
  var elapTimeMS = hrtimeToMS(process.hrtime(this.cpuTime));
  var elapUsage = process.cpuUsage(this.previousCpuUsage);
  var elapUserMS = elapUsage.user / 1000;
  var elapSystMS = elapUsage.system / 1000;
  var totalUsageMS = elapUserMS + elapSystMS;
  var totalUsagePercent = totalUsageMS / elapTimeMS;
  this.cpuHistory.push({
    time: Ntp._now(),
    usage: totalUsagePercent,
    user: elapUserMS / elapTimeMS,
    sys: elapSystMS / elapUsage.system
  });
  this.currentCpuUsage = totalUsagePercent * 100;
  Kadira.docSzCache.setPcpu(this.currentCpuUsage);
  this.cpuTime = process.hrtime();
  this.previousCpuUsage = process.cpuUsage();
};

SystemModel.prototype.handleSessionActivity = function (msg, session) {
  if (msg.msg === 'connect' && !msg.session) {
    this.countNewSession(session);
  } else if (['sub', 'method'].indexOf(msg.msg) != -1) {
    if (!this.isSessionActive(session)) {
      this.countNewSession(session);
    }
  }

  session._activeAt = Date.now();
};

SystemModel.prototype.countNewSession = function (session) {
  if (!isLocalAddress(session.socket)) {
    this.newSessions++;
  }
};

SystemModel.prototype.isSessionActive = function (session) {
  var inactiveTime = Date.now() - session._activeAt;

  return inactiveTime < this.sessionTimeout;
}; // ------------------------------------------------------------------------- //
// http://regex101.com/r/iF3yR3/2


var isLocalHostRegex = /^(?:.*\.local|localhost)(?:\:\d+)?|127(?:\.\d{1,3}){3}|192\.168(?:\.\d{1,3}){2}|10(?:\.\d{1,3}){3}|172\.(?:1[6-9]|2\d|3[0-1])(?:\.\d{1,3}){2}$/; // http://regex101.com/r/hM5gD8/1

var isLocalAddressRegex = /^127(?:\.\d{1,3}){3}|192\.168(?:\.\d{1,3}){2}|10(?:\.\d{1,3}){3}|172\.(?:1[6-9]|2\d|3[0-1])(?:\.\d{1,3}){2}$/;

function isLocalAddress(socket) {
  var host = socket.headers['host'];
  if (host) return isLocalHostRegex.test(host);
  var address = socket.headers['x-forwarded-for'] || socket.remoteAddress;
  if (address) return isLocalAddressRegex.test(address);
}
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

},"errors.js":function module(){

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                                     //
// packages/montiapm_agent/lib/models/errors.js                                                                        //
//                                                                                                                     //
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                                                                                                                       //
ErrorModel = function (appId) {
  BaseErrorModel.call(this);
  var self = this;
  this.appId = appId;
  this.errors = {};
  this.startTime = Date.now();
  this.maxErrors = 10;
};

Object.assign(ErrorModel.prototype, KadiraModel.prototype);
Object.assign(ErrorModel.prototype, BaseErrorModel.prototype);

ErrorModel.prototype.buildPayload = function () {
  var metrics = _.values(this.errors);

  this.startTime = Ntp._now();
  metrics.forEach(function (metric) {
    metric.startTime = Kadira.syncedDate.syncTime(metric.startTime);
  });
  this.errors = {};
  return {
    errors: metrics
  };
};

ErrorModel.prototype.errorCount = function () {
  return _.values(this.errors).length;
};

ErrorModel.prototype.trackError = function (ex, trace) {
  var key = trace.type + ':' + ex.message;

  if (this.errors[key]) {
    this.errors[key].count++;
  } else if (this.errorCount() < this.maxErrors) {
    var errorDef = this._formatError(ex, trace);

    if (this.applyFilters(errorDef.type, errorDef.name, ex, errorDef.subType)) {
      this.errors[key] = this._formatError(ex, trace);
    }
  }
};

ErrorModel.prototype._formatError = function (ex, trace) {
  var time = Date.now();
  var stack = ex.stack; // to get Meteor's Error details

  if (ex.details) {
    stack = "Details: " + ex.details + "\r\n" + stack;
  } // Update trace's error event with the next stack


  var errorEvent = trace.events && trace.events[trace.events.length - 1];
  var errorObject = errorEvent && errorEvent[2] && errorEvent[2].error;

  if (errorObject) {
    errorObject.stack = stack;
  }

  return {
    appId: this.appId,
    name: ex.message,
    type: trace.type,
    startTime: time,
    subType: trace.subType || trace.name,
    trace: trace,
    stacks: [{
      stack: stack
    }],
    count: 1
  };
};
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

},"http.js":function module(require,exports,module){

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                                     //
// packages/montiapm_agent/lib/models/http.js                                                                          //
//                                                                                                                     //
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                                                                                                                       //
const {
  DDSketch
} = require('monti-apm-sketches-js');

const METHOD_METRICS_FIELDS = ['db', 'http', 'email', 'async', 'compute', 'total', 'fs'];

const HttpModel = function () {
  this.metricsByMinute = Object.create(null);
  this.tracerStore = new TracerStore({
    interval: 1000 * 10,
    maxTotalPoints: 30,
    archiveEvery: 10
  });
  this.tracerStore.start();
};

_.extend(HttpModel.prototype, KadiraModel.prototype);

HttpModel.prototype.processRequest = function (trace, req, res) {
  const dateId = this._getDateId(trace.at);

  this._appendMetrics(dateId, trace, res);

  this.tracerStore.addTrace(trace);
};

HttpModel.prototype._getMetrics = function (timestamp, routeId) {
  const dateId = this._getDateId(timestamp);

  if (!this.metricsByMinute[dateId]) {
    this.metricsByMinute[dateId] = {
      routes: Object.create(null)
    };
  }

  const routes = this.metricsByMinute[dateId].routes;

  if (!routes[routeId]) {
    routes[routeId] = {
      histogram: new DDSketch({
        alpha: 0.02
      }),
      count: 0,
      errors: 0,
      statusCodes: Object.create(null)
    };
    METHOD_METRICS_FIELDS.forEach(function (field) {
      routes[routeId][field] = 0;
    });
  }

  return this.metricsByMinute[dateId].routes[routeId];
};

HttpModel.prototype._appendMetrics = function (dateId, trace, res) {
  var requestMetrics = this._getMetrics(dateId, trace.name);

  if (!this.metricsByMinute[dateId].startTime) {
    this.metricsByMinute[dateId].startTime = trace.at;
  } // merge


  METHOD_METRICS_FIELDS.forEach(field => {
    var value = trace.metrics[field];

    if (value > 0) {
      requestMetrics[field] += value;
    }
  });
  const statusCode = res.statusCode;
  let statusMetric;

  if (statusCode < 200) {
    statusMetric = '1xx';
  } else if (statusCode < 300) {
    statusMetric = '2xx';
  } else if (statusCode < 400) {
    statusMetric = '3xx';
  } else if (statusCode < 500) {
    statusMetric = '4xx';
  } else if (statusCode < 600) {
    statusMetric = '5xx';
  }

  requestMetrics.statusCodes[statusMetric] = requestMetrics.statusCodes[statusMetric] || 0;
  requestMetrics.statusCodes[statusMetric] += 1;
  requestMetrics.count += 1;
  requestMetrics.histogram.add(trace.metrics.total);
  this.metricsByMinute[dateId].endTime = trace.metrics.at;
};

HttpModel.prototype.buildPayload = function () {
  var payload = {
    httpMetrics: [],
    httpRequests: []
  };
  var metricsByMinute = this.metricsByMinute;
  this.metricsByMinute = Object.create(null);

  for (var key in metricsByMinute) {
    var metrics = metricsByMinute[key]; // convert startTime into the actual serverTime

    var startTime = metrics.startTime;
    metrics.startTime = Kadira.syncedDate.syncTime(startTime);

    for (var requestName in metrics.routes) {
      METHOD_METRICS_FIELDS.forEach(function (field) {
        metrics.routes[requestName][field] /= metrics.routes[requestName].count;
      });
    }

    payload.httpMetrics.push(metricsByMinute[key]);
  }

  payload.httpRequests = this.tracerStore.collectTraces();
  return payload;
};

module.exportDefault(HttpModel);
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

}},"jobs.js":function module(){

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                                     //
// packages/montiapm_agent/lib/jobs.js                                                                                 //
//                                                                                                                     //
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                                                                                                                       //
var Jobs = Kadira.Jobs = {};

Jobs.getAsync = function (id, callback) {
  Kadira.coreApi.getJob(id).then(function (data) {
    callback(null, data);
  }).catch(function (err) {
    callback(err);
  });
};

Jobs.setAsync = function (id, changes, callback) {
  Kadira.coreApi.updateJob(id, changes).then(function (data) {
    callback(null, data);
  }).catch(function (err) {
    callback(err);
  });
};

Jobs.set = Kadira._wrapAsync(Jobs.setAsync);
Jobs.get = Kadira._wrapAsync(Jobs.getAsync);
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

},"retry.js":function module(){

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                                     //
// packages/montiapm_agent/lib/retry.js                                                                                //
//                                                                                                                     //
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                                                                                                                       //
// Retry logic with an exponential backoff.
//
// options:
//  baseTimeout: time for initial reconnect attempt (ms).
//  exponent: exponential factor to increase timeout each attempt.
//  maxTimeout: maximum time between retries (ms).
//  minCount: how many times to reconnect "instantly".
//  minTimeout: time to wait for the first `minCount` retries (ms).
//  fuzz: factor to randomize retry times by (to avoid retry storms).
//TODO: remove this class and use Meteor Retry in a later version of meteor.
Retry = class {
  constructor() {
    let {
      baseTimeout = 1000,
      // 1 second
      exponent = 2.2,
      // The default is high-ish to ensure a server can recover from a
      // failure caused by load.
      maxTimeout = 5 * 60000,
      // 5 minutes
      minTimeout = 10,
      minCount = 2,
      fuzz = 0.5 // +- 25%

    } = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};
    this.baseTimeout = baseTimeout;
    this.exponent = exponent;
    this.maxTimeout = maxTimeout;
    this.minTimeout = minTimeout;
    this.minCount = minCount;
    this.fuzz = fuzz;
    this.retryTimer = null;
  } // Reset a pending retry, if any.


  clear() {
    if (this.retryTimer) clearTimeout(this.retryTimer);
    this.retryTimer = null;
  } // Calculate how long to wait in milliseconds to retry, based on the
  // `count` of which retry this is.


  _timeout(count) {
    if (count < this.minCount) return this.minTimeout;
    let timeout = Math.min(this.maxTimeout, this.baseTimeout * Math.pow(this.exponent, count)); // fuzz the timeout randomly, to avoid reconnect storms when a
    // server goes down.

    timeout = timeout * (Random.fraction() * this.fuzz + (1 - this.fuzz / 2));
    return Math.ceil(timeout);
  } // Call `fn` after a delay, based on the `count` of which retry this is.


  retryLater(count, fn) {
    const timeout = this._timeout(count);

    if (this.retryTimer) clearTimeout(this.retryTimer);
    this.retryTimer = setTimeout(fn, timeout);
    return timeout;
  }

};
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

},"utils.js":function module(require,exports,module){

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                                     //
// packages/montiapm_agent/lib/utils.js                                                                                //
//                                                                                                                     //
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                                                                                                                       //
module.export({
  createHistogram: () => createHistogram
});

const {
  DDSketch
} = require('monti-apm-sketches-js');

HaveAsyncCallback = function (args) {
  var lastArg = args[args.length - 1];
  return typeof lastArg == 'function';
};

UniqueId = function (start) {
  this.id = 0;
};

UniqueId.prototype.get = function () {
  return "" + this.id++;
};

DefaultUniqueId = new UniqueId(); // creates a stack trace, removing frames in montiapm:agent's code

CreateUserStack = function (error) {
  const stack = (error || new Error()).stack.split('\n');
  let toRemove = 1; // Find how many frames need to be removed
  // to make the user's code the first frame

  for (; toRemove < stack.length; toRemove++) {
    if (stack[toRemove].indexOf('montiapm:agent') === -1) {
      break;
    }
  }

  return stack.slice(toRemove).join('\n');
}; // Optimized version of apply which tries to call as possible as it can
// Then fall back to apply
// This is because, v8 is very slow to invoke apply.


OptimizedApply = function OptimizedApply(context, fn, args) {
  var a = args;

  switch (a.length) {
    case 0:
      return fn.call(context);

    case 1:
      return fn.call(context, a[0]);

    case 2:
      return fn.call(context, a[0], a[1]);

    case 3:
      return fn.call(context, a[0], a[1], a[2]);

    case 4:
      return fn.call(context, a[0], a[1], a[2], a[3]);

    case 5:
      return fn.call(context, a[0], a[1], a[2], a[3], a[4]);

    default:
      return fn.apply(context, a);
  }
};

getClientVersions = function () {
  return {
    'web.cordova': getClientArchVersion('web.cordova'),
    'web.browser': getClientArchVersion('web.browser'),
    'web.browser.legacy': getClientArchVersion('web.browser.legacy')
  };
}; // Returns number of keys of an object, or size of a Map or Set


countKeys = function (obj) {
  if (obj instanceof Map || obj instanceof Set) {
    return obj.size;
  }

  return Object.keys(obj).length;
}; // Iterates objects and maps.
// Callback is called with a value and key


iterate = function (obj, callback) {
  if (obj instanceof Map) {
    return obj.forEach(callback);
  }

  for (var key in obj) {
    var value = obj[key];
    callback(value, key);
  }
}; // Returns a property from an object, or an entry from a map


getProperty = function (obj, key) {
  if (obj instanceof Map) {
    return obj.get(key);
  }

  return obj[key];
};

function createHistogram() {
  return new DDSketch({
    alpha: 0.02
  });
}
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

},"ntp.js":function module(require){

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                                     //
// packages/montiapm_agent/lib/ntp.js                                                                                  //
//                                                                                                                     //
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                                                                                                                       //
var logger = getLogger();

Ntp = function (endpoint) {
  this.path = '/simplentp/sync';
  this.setEndpoint(endpoint);
  this.diff = 0;
  this.synced = false;
  this.reSyncCount = 0;
  this.reSync = new Retry({
    baseTimeout: 1000 * 60,
    maxTimeout: 1000 * 60 * 10,
    minCount: 0
  });
};

Ntp._now = function () {
  var now = Date.now();

  if (typeof now == 'number') {
    return now;
  } else if (now instanceof Date) {
    // some extenal JS libraries override Date.now and returns a Date object
    // which directly affect us. So we need to prepare for that
    return now.getTime();
  } else {
    // trust me. I've seen now === undefined
    return new Date().getTime();
  }
};

Ntp.prototype.setEndpoint = function (endpoint) {
  this.endpoint = endpoint + this.path;
};

Ntp.prototype.getTime = function () {
  return Ntp._now() + Math.round(this.diff);
};

Ntp.prototype.syncTime = function (localTime) {
  return localTime + Math.ceil(this.diff);
};

Ntp.prototype.sync = function () {
  logger('init sync');
  var self = this;
  var retryCount = 0;
  var retry = new Retry({
    baseTimeout: 1000 * 20,
    maxTimeout: 1000 * 60,
    minCount: 1,
    minTimeout: 0
  });
  syncTime();

  function syncTime() {
    if (retryCount < 5) {
      logger('attempt time sync with server', retryCount); // if we send 0 to the retryLater, cacheDns will run immediately

      retry.retryLater(retryCount++, cacheDns);
    } else {
      logger('maximum retries reached');
      self.reSync.retryLater(self.reSyncCount++, function () {
        var args = [].slice.call(arguments);
        self.sync.apply(self, args);
      });
    }
  } // first attempt is to cache dns. So, calculation does not
  // include DNS resolution time


  function cacheDns() {
    self.getServerTime(function (err) {
      if (!err) {
        calculateTimeDiff();
      } else {
        syncTime();
      }
    });
  }

  function calculateTimeDiff() {
    var clientStartTime = new Date().getTime();
    self.getServerTime(function (err, serverTime) {
      if (!err && serverTime) {
        // (Date.now() + clientStartTime)/2 : Midpoint between req and res
        var networkTime = (new Date().getTime() - clientStartTime) / 2;
        var serverStartTime = serverTime - networkTime;
        self.diff = serverStartTime - clientStartTime;
        self.synced = true; // we need to send 1 into retryLater.

        self.reSync.retryLater(self.reSyncCount++, function () {
          var args = [].slice.call(arguments);
          self.sync.apply(self, args);
        });
        logger('successfully updated diff value', self.diff);
      } else {
        syncTime();
      }
    });
  }
};

Ntp.prototype.getServerTime = function (callback) {
  var self = this;

  if (Meteor.isServer) {
    Kadira.coreApi.get(self.path, {
      noRetries: true
    }).then(content => {
      var serverTime = parseInt(content);
      callback(null, serverTime);
    }).catch(err => {
      callback(err);
    });
  } else {
    httpRequest('GET', self.endpoint + "?noCache=".concat(new Date().getTime(), "-").concat(Math.random()), function (err, res) {
      if (err) {
        callback(err);
      } else {
        var serverTime = parseInt(res.content);
        callback(null, serverTime);
      }
    });
  }
};

function getLogger() {
  if (Meteor.isServer) {
    return Npm.require('debug')("kadira:ntp");
  } else {
    return function (message) {
      var canLogKadira = Meteor._localStorage.getItem('LOG_KADIRA') !== null && typeof console !== 'undefined';

      if (canLogKadira) {
        if (message) {
          message = "kadira:ntp " + message;
          arguments[0] = message;
        }

        console.log.apply(console, arguments);
      }
    };
  }
}
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

},"sourcemaps.js":function module(require){

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                                     //
// packages/montiapm_agent/lib/sourcemaps.js                                                                           //
//                                                                                                                     //
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                                                                                                                       //
var url = Npm.require('url');

var path = Npm.require('path');

var fs = Npm.require('fs');

var logger = Npm.require('debug')('kadira:apm:sourcemaps'); // Meteor 1.7 and older used clientPaths


var clientPaths = __meteor_bootstrap__.configJson.clientPaths;
var clientArchs = __meteor_bootstrap__.configJson.clientArchs;
var serverDir = __meteor_bootstrap__.serverDir;
var absClientPaths;

if (clientArchs) {
  absClientPaths = clientArchs.reduce((result, arch) => {
    result[arch] = path.resolve(path.dirname(serverDir), arch);
    return result;
  }, {});
} else {
  absClientPaths = Object.keys(clientPaths).reduce((result, key) => {
    result[key] = path.resolve(serverDir, path.dirname(clientPaths[key]));
    return result;
  }, {});
}

handleApiResponse = function () {
  let body = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};
  var unavailable = [];

  if (typeof body === 'string') {
    try {
      body = JSON.parse(body);
    } catch (e) {
      logger('failed parsing body', e, body);
      return;
    }
  }

  var neededSourcemaps = body.neededSourcemaps || [];
  logger('body', neededSourcemaps);
  var promises = neededSourcemaps.map(sourcemap => {
    if (!Kadira.options.uploadSourceMaps) {
      return unavailable.push(sourcemap);
    }

    return getSourcemapPath(sourcemap.arch, sourcemap.file.path).then(function (sourceMapPath) {
      if (sourceMapPath === null) {
        unavailable.push(sourcemap);
      } else {
        sendSourcemap(sourcemap, sourceMapPath);
      }
    });
  });
  Promise.all(promises).then(function () {
    if (unavailable.length > 0) {
      logger('sending unavailable sourcemaps', unavailable);
      Kadira.coreApi.sendData({
        unavailableSourcemaps: unavailable
      }).then(function (body) {
        handleApiResponse(body);
      }).catch(function (err) {
        console.log('Monti APM: unable to send data', err);
      });
    }
  });
};

function sendSourcemap(sourcemap, sourcemapPath) {
  logger('Sending sourcemap', sourcemap, sourcemapPath);
  var stream = fs.createReadStream(sourcemapPath);
  stream.on('error', err => {
    console.log('Monti APM: error while uploading sourcemap', err);
  });
  var arch = sourcemap.arch;
  var archVersion = sourcemap.archVersion;
  var file = encodeURIComponent(sourcemap.file.path);
  Kadira.coreApi.sendStream("/sourcemap?arch=".concat(arch, "&archVersion=").concat(archVersion, "&file=").concat(file), stream).catch(function (err) {
    console.log('Monti APM: error uploading sourcemap', err);
  });
}

function preparePath(urlPath) {
  urlPath = path.posix.normalize(urlPath);

  if (urlPath[0] === '/') {
    urlPath = urlPath.slice(1);
  }

  return urlPath;
}

function checkForDynamicImport(arch, urlPath) {
  const filePath = preparePath(urlPath);
  return new Promise(function (resolve) {
    const archPath = absClientPaths[arch];
    const dynamicPath = path.join(archPath, 'dynamic', filePath) + '.map';
    fs.stat(dynamicPath, function (err) {
      resolve(err ? null : dynamicPath);
    });
  });
}

function getSourcemapPath(arch, urlPath) {
  return new Promise((resolve, reject) => {
    var clientProgram = WebApp.clientPrograms[arch];

    if (!clientProgram || !clientProgram.manifest) {
      return resolve(null);
    }

    var fileInfo = clientProgram.manifest.find(file => {
      return file.url && file.url.startsWith(urlPath);
    });

    if (fileInfo && fileInfo.sourceMap) {
      return resolve(path.join(absClientPaths[arch], fileInfo.sourceMap));
    }

    checkForDynamicImport(arch, urlPath).then(resolve).catch(reject);
  });
}
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

},"wait_time_builder.js":function module(){

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                                     //
// packages/montiapm_agent/lib/wait_time_builder.js                                                                    //
//                                                                                                                     //
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                                                                                                                       //
var WAITON_MESSAGE_FIELDS = ['msg', 'id', 'method', 'name', 'waitTime']; // This is way how we can build waitTime and it's breakdown

WaitTimeBuilder = function () {
  this._waitListStore = {};
  this._currentProcessingMessages = {};
  this._messageCache = {};
};

WaitTimeBuilder.prototype.register = function (session, msgId) {
  var self = this;

  var mainKey = self._getMessageKey(session.id, msgId);

  var inQueue = session.inQueue || [];

  if (typeof inQueue.toArray === 'function') {
    // latest version of Meteor uses a double-ended-queue for the inQueue
    // info: https://www.npmjs.com/package/double-ended-queue
    inQueue = inQueue.toArray();
  }

  var waitList = inQueue.map(function (msg) {
    var key = self._getMessageKey(session.id, msg.id);

    return self._getCacheMessage(key, msg);
  });
  waitList = waitList || []; //add currently processing ddp message if exists

  var currentlyProcessingMessage = this._currentProcessingMessages[session.id];

  if (currentlyProcessingMessage) {
    var key = self._getMessageKey(session.id, currentlyProcessingMessage.id);

    waitList.unshift(this._getCacheMessage(key, currentlyProcessingMessage));
  }

  this._waitListStore[mainKey] = waitList;
};

WaitTimeBuilder.prototype.build = function (session, msgId) {
  var mainKey = this._getMessageKey(session.id, msgId);

  var waitList = this._waitListStore[mainKey] || [];
  delete this._waitListStore[mainKey];
  var filteredWaitList = waitList.map(this._cleanCacheMessage.bind(this));
  return filteredWaitList;
};

WaitTimeBuilder.prototype._getMessageKey = function (sessionId, msgId) {
  return sessionId + "::" + msgId;
};

WaitTimeBuilder.prototype._getCacheMessage = function (key, msg) {
  var self = this;
  var cachedMessage = self._messageCache[key];

  if (!cachedMessage) {
    self._messageCache[key] = cachedMessage = _.pick(msg, WAITON_MESSAGE_FIELDS);
    cachedMessage._key = key;
    cachedMessage._registered = 1;
  } else {
    cachedMessage._registered++;
  }

  return cachedMessage;
};

WaitTimeBuilder.prototype._cleanCacheMessage = function (msg) {
  msg._registered--;

  if (msg._registered == 0) {
    delete this._messageCache[msg._key];
  } // need to send a clean set of objects
  // otherwise register can go with this


  return _.pick(msg, WAITON_MESSAGE_FIELDS);
};

WaitTimeBuilder.prototype.trackWaitTime = function (session, msg, unblock) {
  var self = this;
  var started = Date.now();
  self._currentProcessingMessages[session.id] = msg;
  var unblocked = false;

  var wrappedUnblock = function () {
    if (!unblocked) {
      var waitTime = Date.now() - started;

      var key = self._getMessageKey(session.id, msg.id);

      var cachedMessage = self._messageCache[key];

      if (cachedMessage) {
        cachedMessage.waitTime = waitTime;
      }

      delete self._currentProcessingMessages[session.id];
      unblocked = true;
      unblock();
    }
  };

  return wrappedUnblock;
};
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

},"check_for_oplog.js":function module(){

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                                     //
// packages/montiapm_agent/lib/check_for_oplog.js                                                                      //
//                                                                                                                     //
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                                                                                                                       //
// expose for testing purpose
OplogCheck = {};

OplogCheck._070 = function (cursorDescription) {
  var options = cursorDescription.options;

  if (options.limit) {
    return {
      code: "070_LIMIT_NOT_SUPPORTED",
      reason: "Meteor 0.7.0 does not support limit with oplog.",
      solution: "Upgrade your app to Meteor version 0.7.2 or later."
    };
  }

  ;

  var exists$ = _.any(cursorDescription.selector, function (value, field) {
    if (field.substr(0, 1) === '$') return true;
  });

  if (exists$) {
    return {
      code: "070_$_NOT_SUPPORTED",
      reason: "Meteor 0.7.0 supports only equal checks with oplog.",
      solution: "Upgrade your app to Meteor version 0.7.2 or later."
    };
  }

  ;

  var onlyScalers = _.all(cursorDescription.selector, function (value, field) {
    return typeof value === "string" || typeof value === "number" || typeof value === "boolean" || value === null || value instanceof Meteor.Collection.ObjectID;
  });

  if (!onlyScalers) {
    return {
      code: "070_ONLY_SCALERS",
      reason: "Meteor 0.7.0 only supports scalers as comparators.",
      solution: "Upgrade your app to Meteor version 0.7.2 or later."
    };
  }

  return true;
};

OplogCheck._071 = function (cursorDescription) {
  var options = cursorDescription.options;
  var matcher = new Minimongo.Matcher(cursorDescription.selector);

  if (options.limit) {
    return {
      code: "071_LIMIT_NOT_SUPPORTED",
      reason: "Meteor 0.7.1 does not support limit with oplog.",
      solution: "Upgrade your app to Meteor version 0.7.2 or later."
    };
  }

  ;
  return true;
};

OplogCheck.env = function () {
  if (!process.env.MONGO_OPLOG_URL) {
    return {
      code: "NO_ENV",
      reason: "You haven't added oplog support for your the Meteor app.",
      solution: "Add oplog support for your Meteor app. see: http://goo.gl/Co1jJc"
    };
  } else {
    return true;
  }
};

OplogCheck.disableOplog = function (cursorDescription) {
  if (cursorDescription.options._disableOplog) {
    return {
      code: "DISABLE_OPLOG",
      reason: "You've disable oplog for this cursor explicitly with _disableOplog option."
    };
  } else {
    return true;
  }
}; // when creating Minimongo.Matcher object, if that's throws an exception
// meteor won't do the oplog support


OplogCheck.miniMongoMatcher = function (cursorDescription) {
  if (Minimongo.Matcher) {
    try {
      var matcher = new Minimongo.Matcher(cursorDescription.selector);
      return true;
    } catch (ex) {
      return {
        code: "MINIMONGO_MATCHER_ERROR",
        reason: "There's something wrong in your mongo query: " + ex.message,
        solution: "Check your selector and change it accordingly."
      };
    }
  } else {
    // If there is no Minimongo.Matcher, we don't need to check this
    return true;
  }
};

OplogCheck.miniMongoSorter = function (cursorDescription) {
  var matcher = new Minimongo.Matcher(cursorDescription.selector);

  if (Minimongo.Sorter && cursorDescription.options.sort) {
    try {
      var sorter = new Minimongo.Sorter(cursorDescription.options.sort, {
        matcher: matcher
      });
      return true;
    } catch (ex) {
      return {
        code: "MINIMONGO_SORTER_ERROR",
        reason: "Some of your sort specifiers are not supported: " + ex.message,
        solution: "Check your sort specifiers and chage them accordingly."
      };
    }
  } else {
    return true;
  }
};

OplogCheck.fields = function (cursorDescription) {
  var options = cursorDescription.options;

  if (options.fields) {
    try {
      LocalCollection._checkSupportedProjection(options.fields);

      return true;
    } catch (e) {
      if (e.name === "MinimongoError") {
        return {
          code: "NOT_SUPPORTED_FIELDS",
          reason: "Some of the field filters are not supported: " + e.message,
          solution: "Try removing those field filters."
        };
      } else {
        throw e;
      }
    }
  }

  return true;
};

OplogCheck.skip = function (cursorDescription) {
  if (cursorDescription.options.skip) {
    return {
      code: "SKIP_NOT_SUPPORTED",
      reason: "Skip does not support with oplog.",
      solution: "Try to avoid using skip. Use range queries instead: http://goo.gl/b522Av"
    };
  }

  return true;
};

OplogCheck.where = function (cursorDescription) {
  var matcher = new Minimongo.Matcher(cursorDescription.selector);

  if (matcher.hasWhere()) {
    return {
      code: "WHERE_NOT_SUPPORTED",
      reason: "Meteor does not support queries with $where.",
      solution: "Try to remove $where from your query. Use some alternative."
    };
  }

  ;
  return true;
};

OplogCheck.geo = function (cursorDescription) {
  var matcher = new Minimongo.Matcher(cursorDescription.selector);

  if (matcher.hasGeoQuery()) {
    return {
      code: "GEO_NOT_SUPPORTED",
      reason: "Meteor does not support queries with geo partial operators.",
      solution: "Try to remove geo partial operators from your query if possible."
    };
  }

  ;
  return true;
};

OplogCheck.limitButNoSort = function (cursorDescription) {
  var options = cursorDescription.options;

  if (options.limit && !options.sort) {
    return {
      code: "LIMIT_NO_SORT",
      reason: "Meteor oplog implementation does not support limit without a sort specifier.",
      solution: "Try adding a sort specifier."
    };
  }

  ;
  return true;
};

OplogCheck.olderVersion = function (cursorDescription, driver) {
  if (driver && !driver.constructor.cursorSupported) {
    return {
      code: "OLDER_VERSION",
      reason: "Your Meteor version does not have oplog support.",
      solution: "Upgrade your app to Meteor version 0.7.2 or later."
    };
  }

  return true;
};

OplogCheck.gitCheckout = function (cursorDescription, driver) {
  if (!Meteor.release) {
    return {
      code: "GIT_CHECKOUT",
      reason: "Seems like your Meteor version is based on a Git checkout and it doesn't have the oplog support.",
      solution: "Try to upgrade your Meteor version."
    };
  }

  return true;
};

var preRunningMatchers = [OplogCheck.env, OplogCheck.disableOplog, OplogCheck.miniMongoMatcher];
var globalMatchers = [OplogCheck.fields, OplogCheck.skip, OplogCheck.where, OplogCheck.geo, OplogCheck.limitButNoSort, OplogCheck.miniMongoSorter, OplogCheck.olderVersion, OplogCheck.gitCheckout];
var versionMatchers = [[/^0\.7\.1/, OplogCheck._071], [/^0\.7\.0/, OplogCheck._070]];

Kadira.checkWhyNoOplog = function (cursorDescription, observerDriver) {
  if (typeof Minimongo == 'undefined') {
    return {
      code: "CANNOT_DETECT",
      reason: "You are running an older Meteor version and Kadira can't check oplog state.",
      solution: "Try updating your Meteor app"
    };
  }

  var result = runMatchers(preRunningMatchers, cursorDescription, observerDriver);

  if (result !== true) {
    return result;
  }

  var meteorVersion = Meteor.release;

  for (var lc = 0; lc < versionMatchers.length; lc++) {
    var matcherInfo = versionMatchers[lc];

    if (matcherInfo[0].test(meteorVersion)) {
      var matched = matcherInfo[1](cursorDescription, observerDriver);

      if (matched !== true) {
        return matched;
      }
    }
  }

  result = runMatchers(globalMatchers, cursorDescription, observerDriver);

  if (result !== true) {
    return result;
  }

  return {
    code: "OPLOG_SUPPORTED",
    reason: "This query should support oplog. It's weird if it's not.",
    solution: "Please contact Kadira support and let's discuss."
  };
};

function runMatchers(matcherList, cursorDescription, observerDriver) {
  for (var lc = 0; lc < matcherList.length; lc++) {
    var matcher = matcherList[lc];
    var matched = matcher(cursorDescription, observerDriver);

    if (matched !== true) {
      return matched;
    }
  }

  return true;
}
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

},"tracer":{"tracer.js":function module(require){

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                                     //
// packages/montiapm_agent/lib/tracer/tracer.js                                                                        //
//                                                                                                                     //
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                                                                                                                       //
var eventLogger = Npm.require('debug')('kadira:tracer');

var REPETITIVE_EVENTS = {
  'db': true,
  'http': true,
  'email': true,
  'wait': true,
  'async': true,
  'custom': true,
  'fs': true
};
var TRACE_TYPES = ['sub', 'method', 'http'];
var MAX_TRACE_EVENTS = 1500;

Tracer = function Tracer() {
  this._filters = [];
  this._filterFields = ['password'];
  this.maxArrayItemsToFilter = 20;
}; //In the future, we might wan't to track inner fiber events too.
//Then we can't serialize the object with methods
//That's why we use this method of returning the data


Tracer.prototype.start = function (name, type) {
  let {
    sessionId,
    msgId,
    userId
  } = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : {};

  // for backward compatibility
  if (typeof name === 'object' && typeof type === 'object') {
    let session = name;
    let msg = type;
    sessionId = session.id;
    msgId = msg.id;
    userId = session.userId;

    if (msg.msg == 'method') {
      type = 'method';
      name = msg.method;
    } else if (msg.msg == 'sub') {
      type = 'sub';
      name = msg.name;
    } else {
      return null;
    }
  }

  if (TRACE_TYPES.indexOf(type) === -1) {
    console.warn("Monti APM: unknown trace type \"".concat(type, "\""));
    return null;
  }

  var traceInfo = {
    _id: "".concat(sessionId, "::").concat(msgId || DefaultUniqueId.get()),
    type,
    name,
    session: sessionId,
    id: msgId,
    events: [],
    userId
  };
  return traceInfo;
};

Tracer.prototype.event = function (traceInfo, type, data, metaData) {
  // do not allow to proceed, if already completed or errored
  var lastEvent = this.getLastEvent(traceInfo);

  if ( // trace completed but has not been processed
  lastEvent && ['complete', 'error'].indexOf(lastEvent.type) >= 0 || // trace completed and processed.
  traceInfo.isEventsProcessed) {
    return false;
  }

  var event = {
    type,
    at: Ntp._now(),
    endAt: null,
    nested: []
  }; // special handling for events that are not repetitive

  if (!REPETITIVE_EVENTS[type]) {
    event.endAt = event.at;
  }

  if (data) {
    var info = _.pick(traceInfo, 'type', 'name');

    event.data = this._applyFilters(type, data, info, "start");
  }

  if (metaData && metaData.name) {
    event.name = metaData.name;
  }

  if (Kadira.options.eventStackTrace) {
    event.stack = CreateUserStack();
  }

  eventLogger("%s %s", type, traceInfo._id);

  if (lastEvent && !lastEvent.endAt) {
    if (!lastEvent.nested) {
      console.error('Monti: invalid trace. Please share the trace below at');
      console.error('Monti: https://github.com/monti-apm/monti-apm-agent/issues/14');
      console.dir(traceInfo, {
        depth: 10
      });
    }

    var lastNested = lastEvent.nested[lastEvent.nested.length - 1]; // Only nest one level

    if (!lastNested || lastNested.endAt) {
      lastEvent.nested.push(event);
      return event;
    }

    return false;
  }

  traceInfo.events.push(event);
  return event;
};

Tracer.prototype.eventEnd = function (traceInfo, event, data) {
  if (event.endAt) {
    // Event already ended or is not a repititive event
    return false;
  }

  event.endAt = Ntp._now();

  if (data) {
    var info = _.pick(traceInfo, 'type', 'name');

    event.data = Object.assign(event.data || {}, this._applyFilters("".concat(event.type, "end"), data, info, 'end'));
  }

  eventLogger("%s %s", event.type + 'end', traceInfo._id);
  return true;
};

Tracer.prototype.getLastEvent = function (traceInfo) {
  return traceInfo.events[traceInfo.events.length - 1];
};

Tracer.prototype.endLastEvent = function (traceInfo) {
  var lastEvent = this.getLastEvent(traceInfo);

  if (!lastEvent.endAt) {
    this.eventEnd(traceInfo, lastEvent);
    lastEvent.forcedEnd = true;
    return true;
  }

  return false;
}; // Most of the time, all of the nested events are async
// which is not helpful. This returns true if
// there are nested events other than async.


Tracer.prototype._hasUsefulNested = function (event) {
  return !event.nested.every(event => {
    return event.type === 'async';
  });
};

Tracer.prototype.buildEvent = function (event) {
  let depth = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 0;
  let trace = arguments.length > 2 ? arguments[2] : undefined;
  var elapsedTimeForEvent = event.endAt - event.at;
  var builtEvent = [event.type];
  var nested = [];
  builtEvent.push(elapsedTimeForEvent);
  builtEvent.push(event.data || {});

  if (event.nested.length && this._hasUsefulNested(event)) {
    let prevEnd = event.at;

    for (let i = 0; i < event.nested.length; i++) {
      var nestedEvent = event.nested[i];

      if (!nestedEvent.endAt) {
        this.eventEnd(trace, nestedEvent);
        nestedEvent.forcedEnd = true;
      }

      var computeTime = nestedEvent.at - prevEnd;

      if (computeTime > 0) {
        nested.push(['compute', computeTime]);
      }

      nested.push(this.buildEvent(nestedEvent, depth + 1, trace));
      prevEnd = nestedEvent.endAt;
    }
  }

  if (nested.length || event.stack || event.forcedEnd || event.name) {
    builtEvent.push({
      stack: event.stack,
      nested: nested.length ? nested : undefined,
      forcedEnd: event.forcedEnd,
      name: event.name
    });
  }

  return builtEvent;
};

Tracer.prototype.buildTrace = function (traceInfo) {
  var firstEvent = traceInfo.events[0];
  var lastEvent = traceInfo.events[traceInfo.events.length - 1];
  var processedEvents = [];

  if (firstEvent.type !== 'start') {
    console.warn('Monti APM: trace has not started yet');
    return null;
  } else if (lastEvent.type !== 'complete' && lastEvent.type !== 'error') {
    //trace is not completed or errored yet
    console.warn('Monti APM: trace has not completed or errored yet');
    return null;
  } else {
    //build the metrics
    traceInfo.errored = lastEvent.type === 'error';
    traceInfo.at = firstEvent.at;
    var metrics = {
      total: lastEvent.at - firstEvent.at
    };
    var totalNonCompute = 0;
    firstEvent = ['start', 0];

    if (traceInfo.events[0].data) {
      firstEvent.push(traceInfo.events[0].data);
    }

    processedEvents.push(firstEvent);

    for (var lc = 1; lc < traceInfo.events.length - 1; lc += 1) {
      var prevEvent = traceInfo.events[lc - 1];
      var event = traceInfo.events[lc];

      if (!event.endAt) {
        console.error('Monti APM: no end event for type: ', event.type);
        return null;
      }

      var computeTime = event.at - prevEvent.endAt;

      if (computeTime > 0) {
        processedEvents.push(['compute', computeTime]);
      }

      var builtEvent = this.buildEvent(event, 0, traceInfo);
      processedEvents.push(builtEvent);
      metrics[event.type] = metrics[event.type] || 0;
      metrics[event.type] += builtEvent[1];
      totalNonCompute += builtEvent[1];
    }
  }

  computeTime = lastEvent.at - traceInfo.events[traceInfo.events.length - 2].endAt;
  if (computeTime > 0) processedEvents.push(['compute', computeTime]);
  var lastEventData = [lastEvent.type, 0];
  if (lastEvent.data) lastEventData.push(lastEvent.data);
  processedEvents.push(lastEventData);

  if (processedEvents.length > MAX_TRACE_EVENTS) {
    const removeCount = processedEvents.length - MAX_TRACE_EVENTS;
    processedEvents.splice(MAX_TRACE_EVENTS, removeCount);
  }

  metrics.compute = metrics.total - totalNonCompute;
  traceInfo.metrics = metrics;
  traceInfo.events = processedEvents;
  traceInfo.isEventsProcessed = true;
  return traceInfo;
};

Tracer.prototype.addFilter = function (filterFn) {
  this._filters.push(filterFn);
};

Tracer.prototype.redactField = function (field) {
  this._filterFields.push(field);
};

Tracer.prototype._applyFilters = function (eventType, data, info) {
  this._filters.forEach(function (filterFn) {
    data = filterFn(eventType, _.clone(data), info);
  });

  return data;
};

Tracer.prototype._applyObjectFilters = function (toFilter) {
  const filterObject = obj => {
    let cloned;

    this._filterFields.forEach(function (field) {
      if (field in obj) {
        cloned = cloned || Object.assign({}, obj);
        cloned[field] = 'Monti: redacted';
      }
    });

    return cloned;
  };

  if (Array.isArray(toFilter)) {
    let cloned; // There could be thousands or more items in the array, and this usually runs
    // before the data is validated. For performance reasons we limit how
    // many to check

    let length = Math.min(toFilter.length, this.maxArrayItemsToFilter);

    for (let i = 0; i < length; i++) {
      if (typeof toFilter[i] === 'object' && toFilter[i] !== null) {
        let result = filterObject(toFilter[i]);

        if (result) {
          cloned = cloned || [...toFilter];
          cloned[i] = result;
        }
      }
    }

    return cloned || toFilter;
  }

  return filterObject(toFilter) || toFilter;
};

Kadira.tracer = new Tracer(); // need to expose Tracer to provide default set of filters

Kadira.Tracer = Tracer;
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

},"default_filters.js":function module(){

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                                     //
// packages/montiapm_agent/lib/tracer/default_filters.js                                                               //
//                                                                                                                     //
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                                                                                                                       //
// strip sensitive data sent to Monti APM engine.
// possible to limit types by providing an array of types to strip
// possible types are: "start", "db", "http", "email"
Tracer.stripSensitive = function stripSensitive(typesToStrip, receiverType, name) {
  typesToStrip = typesToStrip || [];
  var strippedTypes = {};
  typesToStrip.forEach(function (type) {
    strippedTypes[type] = true;
  });
  return function (type, data, info) {
    if (typesToStrip.length > 0 && !strippedTypes[type]) return data;
    if (receiverType && receiverType != info.type) return data;
    if (name && name != info.name) return data;

    if (type == "start") {
      if (data.params) {
        data.params = "[stripped]";
      }

      if (data.headers) {
        data.headers = "[stripped]";
      }

      if (data.body) {
        data.body = "[stripped]";
      }
    } else if (type == "db") {
      data.selector = "[stripped]";
    } else if (type == "http") {
      data.url = "[stripped]";
    } else if (type == "email") {
      ["from", "to", "cc", "bcc", "replyTo"].forEach(function (item) {
        if (data[item]) {
          data[item] = "[stripped]";
        }
      });
    }

    return data;
  };
}; // Strip sensitive data sent to Monti APM engine.
// In contrast to stripSensitive, this one has an allow list of what to keep
// to guard against forgetting to strip new fields
// In the future this one might replace Tracer.stripSensitive
// options


Tracer.stripSensitiveThorough = function stripSensitive() {
  return function (type, data) {
    let fieldsToKeep = [];

    if (type == "start") {
      fieldsToKeep = ['userId'];
    } else if (type === 'waitend') {
      fieldsToKeep = ['waitOn'];
    } else if (type == "db") {
      fieldsToKeep = ['coll', 'func', 'cursor', 'limit', 'docsFetched', 'docSize', 'oplog', 'fields', 'wasMultiplexerReady', 'queueLength', 'elapsedPollingTime', 'noOfCachedDocs'];
    } else if (type == "http") {
      fieldsToKeep = ['method', 'statusCode'];
    } else if (type == "email") {
      fieldsToKeep = [];
    } else if (type === 'custom') {
      // This is supplied by the user so we assume they are only giving data that can be sent
      fieldsToKeep = Object.keys(data);
    } else if (type === 'error') {
      fieldsToKeep = ['error'];
    }

    Object.keys(data).forEach(key => {
      if (fieldsToKeep.indexOf(key) === -1) {
        data[key] = '[stripped]';
      }
    });
    return data;
  };
}; // strip selectors only from the given list of collection names


Tracer.stripSelectors = function stripSelectors(collectionList, receiverType, name) {
  collectionList = collectionList || [];
  var collMap = {};
  collectionList.forEach(function (collName) {
    collMap[collName] = true;
  });
  return function (type, data, info) {
    if (type != "db" || data && !collMap[data.coll]) {
      return data;
    }

    if (receiverType && receiverType != info.type) return data;
    if (name && name != info.name) return data;
    data.selector = "[stripped]";
    return data;
  };
};
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

},"tracer_store.js":function module(require){

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                                     //
// packages/montiapm_agent/lib/tracer/tracer_store.js                                                                  //
//                                                                                                                     //
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                                                                                                                       //
var logger = Npm.require('debug')('kadira:ts');

TracerStore = function TracerStore(options) {
  options = options || {};
  this.maxTotalPoints = options.maxTotalPoints || 30;
  this.interval = options.interval || 1000 * 60;
  this.archiveEvery = options.archiveEvery || this.maxTotalPoints / 6; //store max total on the past 30 minutes (or past 30 items)

  this.maxTotals = Object.create(null); //store the max trace of the current interval

  this.currentMaxTrace = Object.create(null); //archive for the traces

  this.traceArchive = [];
  this.processedCnt = Object.create(null); //group errors by messages between an interval

  this.errorMap = Object.create(null);
};

TracerStore.prototype.addTrace = function (trace) {
  var kind = [trace.type, trace.name].join('::');

  if (!this.currentMaxTrace[kind]) {
    this.currentMaxTrace[kind] = EJSON.clone(trace);
  } else if (this.currentMaxTrace[kind].metrics.total < trace.metrics.total) {
    this.currentMaxTrace[kind] = EJSON.clone(trace);
  } else if (trace.errored) {
    this._handleErrors(trace);
  }
};

TracerStore.prototype.collectTraces = function () {
  var traces = this.traceArchive;
  this.traceArchive = []; // convert at(timestamp) into the actual serverTime

  traces.forEach(function (trace) {
    trace.at = Kadira.syncedDate.syncTime(trace.at);
  });
  return traces;
};

TracerStore.prototype.start = function () {
  this._timeoutHandler = setInterval(this.processTraces.bind(this), this.interval);
};

TracerStore.prototype.stop = function () {
  if (this._timeoutHandler) {
    clearInterval(this._timeoutHandler);
  }
};

TracerStore.prototype._handleErrors = function (trace) {
  // sending error requests as it is
  var lastEvent = trace.events[trace.events.length - 1];

  if (lastEvent && lastEvent[2]) {
    var error = lastEvent[2].error; // grouping errors occured (reset after processTraces)

    var errorKey = [trace.type, trace.name, error.message].join("::");

    if (!this.errorMap[errorKey]) {
      var erroredTrace = EJSON.clone(trace);
      this.errorMap[errorKey] = erroredTrace;
      this.traceArchive.push(erroredTrace);
    }
  } else {
    logger('last events is not an error: ', JSON.stringify(trace.events));
  }
};

TracerStore.prototype.processTraces = function () {
  var self = this;
  let kinds = new Set();
  Object.keys(this.maxTotals).forEach(key => {
    kinds.add(key);
  });
  Object.keys(this.currentMaxTrace).forEach(key => {
    kinds.add(key);
  });

  for (kind of kinds) {
    self.processedCnt[kind] = self.processedCnt[kind] || 0;
    var currentMaxTrace = self.currentMaxTrace[kind];
    var currentMaxTotal = currentMaxTrace ? currentMaxTrace.metrics.total : 0;
    self.maxTotals[kind] = self.maxTotals[kind] || []; //add the current maxPoint

    self.maxTotals[kind].push(currentMaxTotal);
    var exceedingPoints = self.maxTotals[kind].length - self.maxTotalPoints;

    if (exceedingPoints > 0) {
      self.maxTotals[kind].splice(0, exceedingPoints);
    }

    var archiveDefault = self.processedCnt[kind] % self.archiveEvery == 0;
    self.processedCnt[kind]++;

    var canArchive = archiveDefault || self._isTraceOutlier(kind, currentMaxTrace);

    if (canArchive && currentMaxTrace) {
      self.traceArchive.push(currentMaxTrace);
    } //reset currentMaxTrace


    self.currentMaxTrace[kind] = null;
  }

  ; //reset the errorMap

  self.errorMap = Object.create(null);
};

TracerStore.prototype._isTraceOutlier = function (kind, trace) {
  if (trace) {
    var dataSet = this.maxTotals[kind];
    return this._isOutlier(dataSet, trace.metrics.total, 3);
  } else {
    return false;
  }
};
/*
  Data point must exists in the dataSet
*/


TracerStore.prototype._isOutlier = function (dataSet, dataPoint, maxMadZ) {
  var median = this._getMedian(dataSet);

  var mad = this._calculateMad(dataSet, median);

  var madZ = this._funcMedianDeviation(median)(dataPoint) / mad;
  return madZ > maxMadZ;
};

TracerStore.prototype._getMedian = function (dataSet) {
  var sortedDataSet = _.clone(dataSet).sort(function (a, b) {
    return a - b;
  });

  return this._pickQuartile(sortedDataSet, 2);
};

TracerStore.prototype._pickQuartile = function (dataSet, num) {
  var pos = (dataSet.length + 1) * num / 4;

  if (pos % 1 == 0) {
    return dataSet[pos - 1];
  } else {
    pos = pos - pos % 1;
    return (dataSet[pos - 1] + dataSet[pos]) / 2;
  }
};

TracerStore.prototype._calculateMad = function (dataSet, median) {
  var medianDeviations = _.map(dataSet, this._funcMedianDeviation(median));

  var mad = this._getMedian(medianDeviations);

  return mad;
};

TracerStore.prototype._funcMedianDeviation = function (median) {
  return function (x) {
    return Math.abs(median - x);
  };
};

TracerStore.prototype._getMean = function (dataPoints) {
  if (dataPoints.length > 0) {
    var total = 0;
    dataPoints.forEach(function (point) {
      total += point;
    });
    return total / dataPoints.length;
  } else {
    return 0;
  }
};
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

}},"docsize_cache.js":function module(require){

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                                     //
// packages/montiapm_agent/lib/docsize_cache.js                                                                        //
//                                                                                                                     //
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                                                                                                                       //
var LRU = Npm.require('lru-cache');

var crypto = Npm.require('crypto');

var jsonStringify = Npm.require('json-stringify-safe');

DocSzCache = function (maxItems, maxValues) {
  this.items = new LRU({
    max: maxItems
  });
  this.maxValues = maxValues;
  this.cpuUsage = 0;
}; // This is called from SystemModel.prototype.cpuUsage and saves cpu usage.


DocSzCache.prototype.setPcpu = function (pcpu) {
  this.cpuUsage = pcpu;
};

DocSzCache.prototype.getSize = function (coll, query, opts, data) {
  // If the dataset is null or empty we can't calculate the size
  // Do not process this data and return 0 as the document size.
  if (!(data && (data.length || typeof data.size === 'function' && data.size()))) {
    return 0;
  }

  var key = this.getKey(coll, query, opts);
  var item = this.items.get(key);

  if (!item) {
    item = new DocSzCacheItem(this.maxValues);
    this.items.set(key, item);
  }

  if (this.needsUpdate(item)) {
    var doc = {};

    if (typeof data.get === 'function') {
      // This is an IdMap
      data.forEach(function (element) {
        doc = element;
        return false; // return false to stop loop. We only need one doc.
      });
    } else {
      doc = data[0];
    }

    var size = Buffer.byteLength(jsonStringify(doc), 'utf8');
    item.addData(size);
  }

  return item.getValue();
};

DocSzCache.prototype.getKey = function (coll, query, opts) {
  return jsonStringify([coll, query, opts]);
}; // returns a score between 0 and 1 for a cache item
// this score is determined by:
//  * available cache item slots
//  * time since last updated
//  * cpu usage of the application


DocSzCache.prototype.getItemScore = function (item) {
  return [(item.maxValues - item.values.length) / item.maxValues, (Date.now() - item.updated) / 60000, (100 - this.cpuUsage) / 100].map(function (score) {
    return score > 1 ? 1 : score;
  }).reduce(function (total, score) {
    return (total || 0) + score;
  }) / 3;
};

DocSzCache.prototype.needsUpdate = function (item) {
  // handle newly made items
  if (!item.values.length) {
    return true;
  }

  var currentTime = Date.now();
  var timeSinceUpdate = currentTime - item.updated;

  if (timeSinceUpdate > 1000 * 60) {
    return true;
  }

  return this.getItemScore(item) > 0.5;
};

DocSzCacheItem = function (maxValues) {
  this.maxValues = maxValues;
  this.updated = 0;
  this.values = [];
};

DocSzCacheItem.prototype.addData = function (value) {
  this.values.push(value);
  this.updated = Date.now();

  if (this.values.length > this.maxValues) {
    this.values.shift();
  }
};

DocSzCacheItem.prototype.getValue = function () {
  function sortNumber(a, b) {
    return a - b;
  }

  var sorted = this.values.sort(sortNumber);
  var median = 0;

  if (sorted.length % 2 === 0) {
    var idx = sorted.length / 2;
    median = (sorted[idx] + sorted[idx - 1]) / 2;
  } else {
    var idx = Math.floor(sorted.length / 2);
    median = sorted[idx];
  }

  return median;
};
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

},"kadira.js":function module(require,exports,module){

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                                     //
// packages/montiapm_agent/lib/kadira.js                                                                               //
//                                                                                                                     //
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                                                                                                                       //
let HttpModel;
module.link("./models/http", {
  default(v) {
    HttpModel = v;
  }

}, 0);
let packageMap;
module.link("./.meteor-package-versions", {
  default(v) {
    packageMap = v;
  }

}, 1);

var hostname = Npm.require('os').hostname();

var logger = Npm.require('debug')('kadira:apm');

var Fibers = Npm.require('fibers');

var KadiraCore = Npm.require('monti-apm-core').Kadira;

Kadira.models = {};
Kadira.options = {};
Kadira.env = {
  currentSub: null,
  // keep current subscription inside ddp
  kadiraInfo: new Meteor.EnvironmentVariable()
};
Kadira.waitTimeBuilder = new WaitTimeBuilder();
Kadira.errors = [];
Kadira.errors.addFilter = Kadira.errors.push.bind(Kadira.errors);
Kadira.models.methods = new MethodsModel();
Kadira.models.pubsub = new PubsubModel();
Kadira.models.system = new SystemModel();
Kadira.models.http = new HttpModel();
Kadira.docSzCache = new DocSzCache(100000, 10);

Kadira.connect = function (appId, appSecret, options) {
  options = options || {};
  options.appId = appId;
  options.appSecret = appSecret;
  options.payloadTimeout = options.payloadTimeout || 1000 * 20;
  options.endpoint = options.endpoint || "https://engine.montiapm.com";
  options.clientEngineSyncDelay = options.clientEngineSyncDelay || 10000;
  options.thresholds = options.thresholds || {};
  options.isHostNameSet = !!options.hostname;
  options.hostname = options.hostname || hostname;
  options.proxy = options.proxy || null;
  options.recordIPAddress = options.recordIPAddress || 'full';
  options.eventStackTrace = options.eventStackTrace || false;

  if (options.documentSizeCacheSize) {
    Kadira.docSzCache = new DocSzCache(options.documentSizeCacheSize, 10);
  } // remove trailing slash from endpoint url (if any)


  if (_.last(options.endpoint) === '/') {
    options.endpoint = options.endpoint.substr(0, options.endpoint.length - 1);
  } // error tracking is enabled by default


  if (options.enableErrorTracking === undefined) {
    options.enableErrorTracking = true;
  } // uploading sourcemaps is enabled by default in production


  if (options.uploadSourceMaps === undefined && Meteor.isProduction) {
    options.uploadSourceMaps = true;
  }

  Kadira.options = options;
  Kadira.options.authHeaders = {
    'KADIRA-APP-ID': Kadira.options.appId,
    'KADIRA-APP-SECRET': Kadira.options.appSecret
  };

  if (appId && appSecret) {
    options.appId = options.appId.trim();
    options.appSecret = options.appSecret.trim();
    Kadira.coreApi = new KadiraCore({
      appId: options.appId,
      appSecret: options.appSecret,
      endpoint: options.endpoint,
      hostname: options.hostname,
      agentVersion: packageMap['montiapm:agent'] || '<unknown>'
    });

    Kadira.coreApi._checkAuth().then(function () {
      logger('connected to app: ', appId);
      console.log('Monti APM: Successfully connected');

      Kadira._sendAppStats();

      Kadira._schedulePayloadSend();
    }).catch(function (err) {
      if (err.message === "Unauthorized") {
        console.log('Monti APM: authentication failed - check your appId & appSecret');
      } else {
        console.log('Monti APM: unable to connect. ' + err.message);
      }
    });
  } else {
    throw new Error('Monti APM: required appId and appSecret');
  }

  Kadira.syncedDate = new Ntp(options.endpoint);
  Kadira.syncedDate.sync();
  Kadira.models.error = new ErrorModel(appId); // handle pre-added filters

  var addFilterFn = Kadira.models.error.addFilter.bind(Kadira.models.error);
  Kadira.errors.forEach(addFilterFn);
  Kadira.errors = Kadira.models.error; // setting runtime info, which will be sent to kadira

  __meteor_runtime_config__.kadira = {
    appId: appId,
    endpoint: options.endpoint,
    clientEngineSyncDelay: options.clientEngineSyncDelay,
    recordIPAddress: options.recordIPAddress
  };

  if (options.enableErrorTracking) {
    Kadira.enableErrorTracking();
  } else {
    Kadira.disableErrorTracking();
  } // start tracking errors


  Meteor.startup(function () {
    TrackUncaughtExceptions();
    TrackUnhandledRejections();
    TrackMeteorDebug();
  });
  Meteor.publish(null, function () {
    var options = __meteor_runtime_config__.kadira;
    this.added('kadira_settings', Random.id(), options);
    this.ready();
  }); // notify we've connected

  Kadira.connected = true;
}; //track how many times we've sent the data (once per minute)


Kadira._buildPayload = function () {
  var payload = {
    host: Kadira.options.hostname,
    clientVersions: getClientVersions()
  };

  var buildDetailedInfo = Kadira._isDetailedInfo();

  _.extend(payload, Kadira.models.methods.buildPayload(buildDetailedInfo));

  _.extend(payload, Kadira.models.pubsub.buildPayload(buildDetailedInfo));

  _.extend(payload, Kadira.models.system.buildPayload());

  _.extend(payload, Kadira.models.http.buildPayload());

  if (Kadira.options.enableErrorTracking) {
    _.extend(payload, Kadira.models.error.buildPayload());
  }

  return payload;
};

Kadira._countDataSent = 0;
Kadira._detailInfoSentInterval = Math.ceil(1000 * 60 / Kadira.options.payloadTimeout);

Kadira._isDetailedInfo = function () {
  return Kadira._countDataSent++ % Kadira._detailInfoSentInterval == 0;
};

Kadira._sendAppStats = function () {
  var appStats = {};
  appStats.release = Meteor.release;
  appStats.protocolVersion = '1.0.0';
  appStats.packageVersions = [];
  appStats.clientVersions = getClientVersions();

  _.each(Package, function (v, name) {
    appStats.packageVersions.push({
      name: name,
      version: packageMap[name] || null
    });
  });

  Kadira.coreApi.sendData({
    startTime: new Date(),
    appStats: appStats
  }).then(function (body) {
    handleApiResponse(body);
  }).catch(function (err) {
    console.error('Monti APM Error on sending appStats:', err.message);
  });
};

Kadira._schedulePayloadSend = function () {
  setTimeout(function () {
    Kadira._schedulePayloadSend();

    Kadira._sendPayload();
  }, Kadira.options.payloadTimeout);
};

Kadira._sendPayload = function () {
  new Fibers(function () {
    var payload = Kadira._buildPayload();

    Kadira.coreApi.sendData(payload).then(function (body) {
      handleApiResponse(body);
    }).catch(function (err) {
      console.log('Monti APM Error:', err.message);
    });
  }).run();
}; // this return the __kadiraInfo from the current Fiber by default
// if called with 2nd argument as true, it will get the kadira info from
// Meteor.EnvironmentVariable
//
// WARNNING: returned info object is the reference object.
//  Changing it might cause issues when building traces. So use with care


Kadira._getInfo = function (currentFiber, useEnvironmentVariable) {
  currentFiber = currentFiber || Fibers.current;

  if (currentFiber) {
    if (useEnvironmentVariable) {
      return Kadira.env.kadiraInfo.get();
    }

    return currentFiber.__kadiraInfo;
  }
}; // this does not clone the info object. So, use with care


Kadira._setInfo = function (info) {
  Fibers.current.__kadiraInfo = info;
};

Kadira.startContinuousProfiling = function () {
  MontiProfiler.startContinuous(function onProfile(_ref) {
    let {
      profile,
      startTime,
      endTime
    } = _ref;

    if (!Kadira.connected) {
      return;
    }

    Kadira.coreApi.sendData({
      profiles: [{
        profile,
        startTime,
        endTime
      }]
    }).catch(e => console.log('Monti: err sending cpu profile', e));
  });
};

Kadira.enableErrorTracking = function () {
  __meteor_runtime_config__.kadira.enableErrorTracking = true;
  Kadira.options.enableErrorTracking = true;
};

Kadira.disableErrorTracking = function () {
  __meteor_runtime_config__.kadira.enableErrorTracking = false;
  Kadira.options.enableErrorTracking = false;
};

Kadira.trackError = function (type, message, options) {
  if (Kadira.options.enableErrorTracking && type && message) {
    options = options || {};
    options.subType = options.subType || 'server';
    options.stacks = options.stacks || '';
    var error = {
      message: message,
      stack: options.stacks
    };
    var trace = {
      type: type,
      subType: options.subType,
      name: message,
      errored: true,
      at: Kadira.syncedDate.getTime(),
      events: [['start', 0, {}], ['error', 0, {
        error: error
      }]],
      metrics: {
        total: 0
      }
    };
    Kadira.models.error.trackError(error, trace);
  }
};

Kadira.ignoreErrorTracking = function (err) {
  err._skipKadira = true;
};

Kadira.startEvent = function (name) {
  let data = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};

  var kadiraInfo = Kadira._getInfo();

  if (kadiraInfo) {
    return Kadira.tracer.event(kadiraInfo.trace, 'custom', data, {
      name
    });
  }

  return false;
};

Kadira.endEvent = function (event, data) {
  var kadiraInfo = Kadira._getInfo(); // The event could be false if it could not be started.
  // Handle it here instead of requiring the app to.


  if (kadiraInfo && event) {
    Kadira.tracer.eventEnd(kadiraInfo.trace, event, data);
  }
};
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

},"hijack":{"wrap_server.js":function module(require){

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                                     //
// packages/montiapm_agent/lib/hijack/wrap_server.js                                                                   //
//                                                                                                                     //
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                                                                                                                       //
var Fiber = Npm.require('fibers');

wrapServer = function (serverProto) {
  var originalHandleConnect = serverProto._handleConnect;

  serverProto._handleConnect = function (socket, msg) {
    originalHandleConnect.call(this, socket, msg);
    var session = socket._meteorSession; // sometimes it is possible for _meteorSession to be undefined
    // one such reason would be if DDP versions are not matching
    // if then, we should not process it

    if (!session) {
      return;
    }

    Kadira.EventBus.emit('system', 'createSession', msg, socket._meteorSession);

    if (Kadira.connected) {
      Kadira.models.system.handleSessionActivity(msg, socket._meteorSession);
    }
  };
};
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

},"wrap_session.js":function module(require,exports,module){

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                                     //
// packages/montiapm_agent/lib/hijack/wrap_session.js                                                                  //
//                                                                                                                     //
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                                                                                                                       //
let MeteorDebugIgnore;
module.link("./error", {
  MeteorDebugIgnore(v) {
    MeteorDebugIgnore = v;
  }

}, 0);
const MAX_PARAMS_LENGTH = 4000;

wrapSession = function (sessionProto) {
  var originalProcessMessage = sessionProto.processMessage;

  sessionProto.processMessage = function (msg) {
    if (true) {
      var kadiraInfo = {
        session: this.id,
        userId: this.userId
      };

      if (msg.msg == 'method' || msg.msg == 'sub') {
        kadiraInfo.trace = Kadira.tracer.start(this, msg);
        Kadira.waitTimeBuilder.register(this, msg.id);

        let params = Kadira.tracer._applyObjectFilters(msg.params || []); // use JSON instead of EJSON to save the CPU


        let stringifiedParams = JSON.stringify(params); // The params could be several mb or larger.
        // Truncate if it is large

        if (stringifiedParams.length > MAX_PARAMS_LENGTH) {
          stringifiedParams = "Monti APM: params are too big. First ".concat(MAX_PARAMS_LENGTH, " characters: ").concat(stringifiedParams.slice(0, MAX_PARAMS_LENGTH));
        }

        var startData = {
          userId: this.userId,
          params: stringifiedParams
        };
        Kadira.tracer.event(kadiraInfo.trace, 'start', startData);
        var waitEventId = Kadira.tracer.event(kadiraInfo.trace, 'wait', {}, kadiraInfo);
        msg._waitEventId = waitEventId;
        msg.__kadiraInfo = kadiraInfo;

        if (msg.msg == 'sub') {
          // start tracking inside processMessage allows us to indicate
          // wait time as well
          Kadira.EventBus.emit('pubsub', 'subReceived', this, msg);

          Kadira.models.pubsub._trackSub(this, msg);
        }
      } // Update session last active time


      Kadira.EventBus.emit('system', 'ddpMessageReceived', this, msg);
      Kadira.models.system.handleSessionActivity(msg, this);
    }

    return originalProcessMessage.call(this, msg);
  }; // adding the method context to the current fiber


  var originalMethodHandler = sessionProto.protocol_handlers.method;

  sessionProto.protocol_handlers.method = function (msg, unblock) {
    var self = this; //add context

    var kadiraInfo = msg.__kadiraInfo;

    if (kadiraInfo) {
      Kadira._setInfo(kadiraInfo); // end wait event


      var waitList = Kadira.waitTimeBuilder.build(this, msg.id);
      Kadira.tracer.eventEnd(kadiraInfo.trace, msg._waitEventId, {
        waitOn: waitList
      });
      unblock = Kadira.waitTimeBuilder.trackWaitTime(this, msg, unblock);
      var response = Kadira.env.kadiraInfo.withValue(kadiraInfo, function () {
        return originalMethodHandler.call(self, msg, unblock);
      });
      unblock();
    } else {
      var response = originalMethodHandler.call(self, msg, unblock);
    }

    return response;
  }; //to capture the currently processing message


  var orginalSubHandler = sessionProto.protocol_handlers.sub;

  sessionProto.protocol_handlers.sub = function (msg, unblock) {
    var self = this; //add context

    var kadiraInfo = msg.__kadiraInfo;

    if (kadiraInfo) {
      Kadira._setInfo(kadiraInfo); // end wait event


      var waitList = Kadira.waitTimeBuilder.build(this, msg.id);
      Kadira.tracer.eventEnd(kadiraInfo.trace, msg._waitEventId, {
        waitOn: waitList
      });
      unblock = Kadira.waitTimeBuilder.trackWaitTime(this, msg, unblock);
      var response = Kadira.env.kadiraInfo.withValue(kadiraInfo, function () {
        return orginalSubHandler.call(self, msg, unblock);
      });
      unblock();
    } else {
      var response = orginalSubHandler.call(self, msg, unblock);
    }

    return response;
  }; //to capture the currently processing message


  var orginalUnSubHandler = sessionProto.protocol_handlers.unsub;

  sessionProto.protocol_handlers.unsub = function (msg, unblock) {
    unblock = Kadira.waitTimeBuilder.trackWaitTime(this, msg, unblock);
    var response = orginalUnSubHandler.call(this, msg, unblock);
    unblock();
    return response;
  }; //track method ending (to get the result of error)


  var originalSend = sessionProto.send;

  sessionProto.send = function (msg) {
    if (msg.msg == 'result') {
      var kadiraInfo = Kadira._getInfo();

      if (kadiraInfo) {
        if (msg.error) {
          var error = _.pick(msg.error, ['message', 'stack', 'details']); // pick the error from the wrapped method handler


          if (kadiraInfo && kadiraInfo.currentError) {
            // the error stack is wrapped so Meteor._debug can identify
            // this as a method error.
            error = _.pick(kadiraInfo.currentError, ['message', 'stack', 'details']); // see wrapMethodHanderForErrors() method def for more info

            if (error.stack && error.stack.stack) {
              error.stack = error.stack.stack;
            }
          }

          Kadira.tracer.endLastEvent(kadiraInfo.trace);
          Kadira.tracer.event(kadiraInfo.trace, 'error', {
            error: error
          });
        } else {
          Kadira.tracer.endLastEvent(kadiraInfo.trace);
          Kadira.tracer.event(kadiraInfo.trace, 'complete');
        } //processing the message


        var trace = Kadira.tracer.buildTrace(kadiraInfo.trace);
        Kadira.EventBus.emit('method', 'methodCompleted', trace, this);
        Kadira.models.methods.processMethod(trace); // error may or may not exist and error tracking can be disabled

        if (error && Kadira.options.enableErrorTracking) {
          Kadira.models.error.trackError(error, trace);
        } //clean and make sure, fiber is clean
        //not sure we need to do this, but a preventive measure


        Kadira._setInfo(null);
      }
    }

    return originalSend.call(this, msg);
  };
}; // wrap existing method handlers for capturing errors


_.each(Meteor.server.method_handlers, function (handler, name) {
  wrapMethodHanderForErrors(name, handler, Meteor.server.method_handlers);
}); // wrap future method handlers for capturing errors


var originalMeteorMethods = Meteor.methods;

Meteor.methods = function (methodMap) {
  _.each(methodMap, function (handler, name) {
    wrapMethodHanderForErrors(name, handler, methodMap);
  });

  originalMeteorMethods(methodMap);
};

function wrapMethodHanderForErrors(name, originalHandler, methodMap) {
  methodMap[name] = function () {
    try {
      return originalHandler.apply(this, arguments);
    } catch (ex) {
      if (ex && Kadira._getInfo()) {
        // sometimes error may be just an string or a primitive
        // in that case, we need to make it a psuedo error
        if (typeof ex !== 'object') {
          ex = {
            message: ex,
            stack: ex
          };
        } // Now we are marking this error to get tracked via methods
        // But, this also triggers a Meteor.debug call and
        // it only gets the stack
        // We also track Meteor.debug errors and want to stop
        // tracking this error. That's why we do this
        // See Meteor.debug error tracking code for more
        // If error tracking is disabled, we do not modify the stack since
        // it would be shown as an object in the logs


        if (Kadira.options.enableErrorTracking) {
          ex.stack = {
            stack: ex.stack,
            source: 'method',
            [MeteorDebugIgnore]: true
          };
          Kadira._getInfo().currentError = ex;
        }
      }

      throw ex;
    }
  };
}
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

},"wrap_subscription.js":function module(require,exports,module){

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                                     //
// packages/montiapm_agent/lib/hijack/wrap_subscription.js                                                             //
//                                                                                                                     //
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                                                                                                                       //
let MeteorDebugIgnore;
module.link("./error", {
  MeteorDebugIgnore(v) {
    MeteorDebugIgnore = v;
  }

}, 0);

wrapSubscription = function (subscriptionProto) {
  // If the ready event runs outside the Fiber, Kadira._getInfo() doesn't work.
  // we need some other way to store kadiraInfo so we can use it at ready hijack.
  var originalRunHandler = subscriptionProto._runHandler;

  subscriptionProto._runHandler = function () {
    var kadiraInfo = Kadira._getInfo();

    if (kadiraInfo) {
      this.__kadiraInfo = kadiraInfo;
    }

    ;
    originalRunHandler.call(this);
  };

  var originalReady = subscriptionProto.ready;

  subscriptionProto.ready = function () {
    // meteor has a field called `_ready` which tracks this
    // but we need to make it future proof
    if (!this._apmReadyTracked) {
      var kadiraInfo = Kadira._getInfo() || this.__kadiraInfo;

      delete this.__kadiraInfo; //sometime .ready can be called in the context of the method
      //then we have some problems, that's why we are checking this
      //eg:- Accounts.createUser
      // Also, when the subscription is created by fast render, _subscriptionId and
      // the trace.id are both undefined but we don't want to complete the HTTP trace here

      if (kadiraInfo && this._subscriptionId && this._subscriptionId == kadiraInfo.trace.id) {
        Kadira.tracer.endLastEvent(kadiraInfo.trace);
        Kadira.tracer.event(kadiraInfo.trace, 'complete');
        var trace = Kadira.tracer.buildTrace(kadiraInfo.trace);
      }

      Kadira.EventBus.emit('pubsub', 'subCompleted', trace, this._session, this);

      Kadira.models.pubsub._trackReady(this._session, this, trace);

      this._apmReadyTracked = true;
    } // we still pass the control to the original implementation
    // since multiple ready calls are handled by itself


    originalReady.call(this);
  };

  var originalError = subscriptionProto.error;

  subscriptionProto.error = function (err) {
    if (typeof err === 'string') {
      err = {
        message: err
      };
    }

    var kadiraInfo = Kadira._getInfo();

    if (kadiraInfo && this._subscriptionId && this._subscriptionId == kadiraInfo.trace.id) {
      Kadira.tracer.endLastEvent(kadiraInfo.trace);

      var errorForApm = _.pick(err, 'message', 'stack');

      Kadira.tracer.event(kadiraInfo.trace, 'error', {
        error: errorForApm
      });
      var trace = Kadira.tracer.buildTrace(kadiraInfo.trace);

      Kadira.models.pubsub._trackError(this._session, this, trace); // error tracking can be disabled and if there is a trace
      // trace should be available all the time, but it won't
      // if something wrong happened on the trace building


      if (Kadira.options.enableErrorTracking && trace) {
        Kadira.models.error.trackError(err, trace);
      }
    } // wrap error stack so Meteor._debug can identify and ignore it
    // it is not wrapped when error tracking is disabled since it
    // would be shown as an object in the logs


    if (Kadira.options.enableErrorTracking) {
      err.stack = {
        stack: err.stack,
        source: 'subscription',
        [MeteorDebugIgnore]: true
      };
    }

    originalError.call(this, err);
  };

  var originalDeactivate = subscriptionProto._deactivate;

  subscriptionProto._deactivate = function () {
    Kadira.EventBus.emit('pubsub', 'subDeactivated', this._session, this);

    Kadira.models.pubsub._trackUnsub(this._session, this);

    originalDeactivate.call(this);
  }; //adding the currenSub env variable


  ['added', 'changed', 'removed'].forEach(function (funcName) {
    var originalFunc = subscriptionProto[funcName];

    subscriptionProto[funcName] = function (collectionName, id, fields) {
      var self = this; // we need to run this code in a fiber and that's how we track
      // subscription info. May be we can figure out, some other way to do this
      // We use this currently to get the publication info when tracking message
      // sizes at wrap_ddp_stringify.js

      Kadira.env.currentSub = self;
      var res = originalFunc.call(self, collectionName, id, fields);
      Kadira.env.currentSub = null;
      return res;
    };
  });
};
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

},"wrap_observers.js":function module(){

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                                     //
// packages/montiapm_agent/lib/hijack/wrap_observers.js                                                                //
//                                                                                                                     //
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                                                                                                                       //
wrapOplogObserveDriver = function (proto) {
  // Track the polled documents. This is reflect to the RAM size and
  // for the CPU usage directly
  var originalPublishNewResults = proto._publishNewResults;

  proto._publishNewResults = function (newResults, newBuffer) {
    var coll = this._cursorDescription.collectionName;
    var query = this._cursorDescription.selector;
    var opts = this._cursorDescription.options;
    var docSize = Kadira.docSzCache.getSize(coll, query, opts, newResults);
    var docSize = Kadira.docSzCache.getSize(coll, query, opts, newBuffer);
    var count = newResults.size() + newBuffer.size();

    if (this._ownerInfo) {
      Kadira.models.pubsub.trackPolledDocuments(this._ownerInfo, count);
      Kadira.models.pubsub.trackDocSize(this._ownerInfo.name, "polledFetches", docSize * count);
    } else {
      this._polledDocuments = count;
      this._docSize = {
        polledFetches: docSize * count
      };
    }

    return originalPublishNewResults.call(this, newResults, newBuffer);
  };

  var originalHandleOplogEntryQuerying = proto._handleOplogEntryQuerying;

  proto._handleOplogEntryQuerying = function (op) {
    Kadira.models.pubsub.trackDocumentChanges(this._ownerInfo, op);
    return originalHandleOplogEntryQuerying.call(this, op);
  };

  var originalHandleOplogEntrySteadyOrFetching = proto._handleOplogEntrySteadyOrFetching;

  proto._handleOplogEntrySteadyOrFetching = function (op) {
    Kadira.models.pubsub.trackDocumentChanges(this._ownerInfo, op);
    return originalHandleOplogEntrySteadyOrFetching.call(this, op);
  }; // track live updates


  ['_addPublished', '_removePublished', '_changePublished'].forEach(function (fnName) {
    var originalFn = proto[fnName];

    proto[fnName] = function (a, b, c) {
      if (this._ownerInfo) {
        Kadira.models.pubsub.trackLiveUpdates(this._ownerInfo, fnName, 1);

        if (fnName === "_addPublished") {
          var coll = this._cursorDescription.collectionName;
          var query = this._cursorDescription.selector;
          var opts = this._cursorDescription.options;
          var docSize = Kadira.docSzCache.getSize(coll, query, opts, [b]);
          Kadira.models.pubsub.trackDocSize(this._ownerInfo.name, "liveFetches", docSize);
        }
      } else {
        // If there is no ownerInfo, that means this is the initial adds
        if (!this._liveUpdatesCounts) {
          this._liveUpdatesCounts = {
            _initialAdds: 0
          };
        }

        this._liveUpdatesCounts._initialAdds++;

        if (fnName === "_addPublished") {
          if (!this._docSize) {
            this._docSize = {
              initialFetches: 0
            };
          }

          if (!this._docSize.initialFetches) {
            this._docSize.initialFetches = 0;
          }

          var coll = this._cursorDescription.collectionName;
          var query = this._cursorDescription.selector;
          var opts = this._cursorDescription.options;
          var docSize = Kadira.docSzCache.getSize(coll, query, opts, [b]);
          this._docSize.initialFetches += docSize;
        }
      }

      return originalFn.call(this, a, b, c);
    };
  });
  var originalStop = proto.stop;

  proto.stop = function () {
    if (this._ownerInfo && this._ownerInfo.type === 'sub') {
      Kadira.EventBus.emit('pubsub', 'observerDeleted', this._ownerInfo);
      Kadira.models.pubsub.trackDeletedObserver(this._ownerInfo);
    }

    return originalStop.call(this);
  };
};

wrapPollingObserveDriver = function (proto) {
  var originalPollMongo = proto._pollMongo;

  proto._pollMongo = function () {
    var start = Date.now();
    originalPollMongo.call(this); // Current result is stored in the following variable.
    // So, we can use that
    // Sometimes, it's possible to get size as undefined.
    // May be something with different version. We don't need to worry about
    // this now

    var count = 0;
    var docSize = 0;

    if (this._results && this._results.size) {
      count = this._results.size() || 0;
      var coll = this._cursorDescription.collectionName;
      var query = this._cursorDescription.selector;
      var opts = this._cursorDescription.options;
      docSize = Kadira.docSzCache.getSize(coll, query, opts, this._results._map) * count;
    }

    if (this._ownerInfo) {
      Kadira.models.pubsub.trackPolledDocuments(this._ownerInfo, count);
      Kadira.models.pubsub.trackDocSize(this._ownerInfo.name, "polledFetches", docSize);
    } else {
      this._polledDocuments = count;
      this._polledDocSize = docSize;
    }
  };

  var originalStop = proto.stop;

  proto.stop = function () {
    if (this._ownerInfo && this._ownerInfo.type === 'sub') {
      Kadira.EventBus.emit('pubsub', 'observerDeleted', this._ownerInfo);
      Kadira.models.pubsub.trackDeletedObserver(this._ownerInfo);
    }

    return originalStop.call(this);
  };
};

wrapMultiplexer = function (proto) {
  var originalInitalAdd = proto.addHandleAndSendInitialAdds;

  proto.addHandleAndSendInitialAdds = function (handle) {
    if (!this._firstInitialAddTime) {
      this._firstInitialAddTime = Date.now();
    }

    handle._wasMultiplexerReady = this._ready();
    handle._queueLength = this._queue._taskHandles.length;

    if (!handle._wasMultiplexerReady) {
      handle._elapsedPollingTime = Date.now() - this._firstInitialAddTime;
    }

    return originalInitalAdd.call(this, handle);
  };
};

wrapForCountingObservers = function () {
  // to count observers
  var mongoConnectionProto = MeteorX.MongoConnection.prototype;
  var originalObserveChanges = mongoConnectionProto._observeChanges;

  mongoConnectionProto._observeChanges = function (cursorDescription, ordered, callbacks) {
    var ret = originalObserveChanges.call(this, cursorDescription, ordered, callbacks); // get the Kadira Info via the Meteor.EnvironmentalVariable

    var kadiraInfo = Kadira._getInfo(null, true);

    if (kadiraInfo && ret._multiplexer) {
      if (!ret._multiplexer.__kadiraTracked) {
        // new multiplexer
        ret._multiplexer.__kadiraTracked = true;
        Kadira.EventBus.emit('pubsub', 'newSubHandleCreated', kadiraInfo.trace);
        Kadira.models.pubsub.incrementHandleCount(kadiraInfo.trace, false);

        if (kadiraInfo.trace.type == 'sub') {
          var ownerInfo = {
            type: kadiraInfo.trace.type,
            name: kadiraInfo.trace.name,
            startTime: new Date().getTime()
          };
          var observerDriver = ret._multiplexer._observeDriver;
          observerDriver._ownerInfo = ownerInfo;
          Kadira.EventBus.emit('pubsub', 'observerCreated', ownerInfo);
          Kadira.models.pubsub.trackCreatedObserver(ownerInfo); // We need to send initially polled documents if there are

          if (observerDriver._polledDocuments) {
            Kadira.models.pubsub.trackPolledDocuments(ownerInfo, observerDriver._polledDocuments);
            observerDriver._polledDocuments = 0;
          } // We need to send initially polled documents if there are


          if (observerDriver._polledDocSize) {
            Kadira.models.pubsub.trackDocSize(ownerInfo.name, "polledFetches", observerDriver._polledDocSize);
            observerDriver._polledDocSize = 0;
          } // Process _liveUpdatesCounts


          _.each(observerDriver._liveUpdatesCounts, function (count, key) {
            Kadira.models.pubsub.trackLiveUpdates(ownerInfo, key, count);
          }); // Process docSize


          _.each(observerDriver._docSize, function (count, key) {
            Kadira.models.pubsub.trackDocSize(ownerInfo.name, key, count);
          });
        }
      } else {
        Kadira.EventBus.emit('pubsub', 'cachedSubHandleCreated', kadiraInfo.trace);
        Kadira.models.pubsub.incrementHandleCount(kadiraInfo.trace, true);
      }
    }

    return ret;
  };
};
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

},"wrap_ddp_stringify.js":function module(){

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                                     //
// packages/montiapm_agent/lib/hijack/wrap_ddp_stringify.js                                                            //
//                                                                                                                     //
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                                                                                                                       //
wrapStringifyDDP = function () {
  var originalStringifyDDP = DDPCommon.stringifyDDP;

  DDPCommon.stringifyDDP = function (msg) {
    var msgString = originalStringifyDDP(msg);
    var msgSize = Buffer.byteLength(msgString, 'utf8');

    var kadiraInfo = Kadira._getInfo(null, true);

    if (kadiraInfo && !Kadira.env.currentSub) {
      if (kadiraInfo.trace.type === 'method') {
        Kadira.models.methods.trackMsgSize(kadiraInfo.trace.name, msgSize);
      }

      return msgString;
    } // 'currentSub' is set when we wrap Subscription object and override
    // handlers for 'added', 'changed', 'removed' events. (see lib/hijack/wrap_subscription.js)


    if (Kadira.env.currentSub) {
      if (Kadira.env.currentSub.__kadiraInfo) {
        Kadira.models.pubsub.trackMsgSize(Kadira.env.currentSub._name, "initialSent", msgSize);
        return msgString;
      }

      Kadira.models.pubsub.trackMsgSize(Kadira.env.currentSub._name, "liveSent", msgSize);
      return msgString;
    }

    Kadira.models.methods.trackMsgSize("<not-a-method-or-a-pub>", msgSize);
    return msgString;
  };
};
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

},"instrument.js":function module(require,exports,module){

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                                     //
// packages/montiapm_agent/lib/hijack/instrument.js                                                                    //
//                                                                                                                     //
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                                                                                                                       //
let wrapWebApp;
module.link("./wrap_webapp", {
  wrapWebApp(v) {
    wrapWebApp = v;
  }

}, 0);
let wrapFastRender;
module.link("./fast_render", {
  wrapFastRender(v) {
    wrapFastRender = v;
  }

}, 1);
let wrapFs;
module.link("./fs", {
  wrapFs(v) {
    wrapFs = v;
  }

}, 2);
let wrapPicker;
module.link("./picker", {
  wrapPicker(v) {
    wrapPicker = v;
  }

}, 3);
let wrapRouters;
module.link("./wrap_routers", {
  wrapRouters(v) {
    wrapRouters = v;
  }

}, 4);

var logger = Npm.require('debug')('kadira:hijack:instrument');

var instrumented = false;

Kadira._startInstrumenting = function (callback) {
  if (instrumented) {
    callback();
    return;
  }

  instrumented = true;
  wrapStringifyDDP();
  wrapWebApp();
  wrapFastRender();
  wrapPicker();
  wrapFs();
  wrapRouters();
  MeteorX.onReady(function () {
    //instrumenting session
    wrapServer(MeteorX.Server.prototype);
    wrapSession(MeteorX.Session.prototype);
    wrapSubscription(MeteorX.Subscription.prototype);

    if (MeteorX.MongoOplogDriver) {
      wrapOplogObserveDriver(MeteorX.MongoOplogDriver.prototype);
    }

    if (MeteorX.MongoPollingDriver) {
      wrapPollingObserveDriver(MeteorX.MongoPollingDriver.prototype);
    }

    if (MeteorX.Multiplexer) {
      wrapMultiplexer(MeteorX.Multiplexer.prototype);
    }

    wrapForCountingObservers();
    hijackDBOps();
    setLabels();
    callback();
  });
}; // We need to instrument this rightaway and it's okay
// One reason for this is to call `setLables()` function
// Otherwise, CPU profile can't see all our custom labeling


Kadira._startInstrumenting(function () {
  console.log('Monti APM: completed instrumenting the app');
});
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

},"db.js":function module(){

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                                     //
// packages/montiapm_agent/lib/hijack/db.js                                                                            //
//                                                                                                                     //
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                                                                                                                       //
// This hijack is important to make sure, collections created before
// we hijack dbOps, even gets tracked.
//  Meteor does not simply expose MongoConnection object to the client
//  It picks methods which are necessory and make a binded object and
//  assigned to the Mongo.Collection
//  so, even we updated prototype, we can't track those collections
//  but, this will fix it.
var originalOpen = MongoInternals.RemoteCollectionDriver.prototype.open;

MongoInternals.RemoteCollectionDriver.prototype.open = function open(name) {
  var self = this;
  var ret = originalOpen.call(self, name);

  _.each(ret, function (fn, m) {
    // make sure, it's in the actual mongo connection object
    // meteorhacks:mongo-collection-utils package add some arbitary methods
    // which does not exist in the mongo connection
    if (self.mongo[m]) {
      ret[m] = function () {
        Array.prototype.unshift.call(arguments, name);
        return OptimizedApply(self.mongo, self.mongo[m], arguments);
      };
    }
  });

  return ret;
}; // TODO: this should be added to Meteorx


function getSyncronousCursor() {
  const MongoColl = typeof Mongo !== "undefined" ? Mongo.Collection : Meteor.Collection;
  const coll = new MongoColl("__dummy_coll_" + Random.id()); // we need to wait until the db is connected with meteor. findOne does that

  coll.findOne();
  const cursor = coll.find();
  cursor.fetch();
  return cursor._synchronousCursor.constructor;
}

hijackDBOps = function hijackDBOps() {
  var mongoConnectionProto = MeteorX.MongoConnection.prototype; //findOne is handled by find - so no need to track it
  //upsert is handles by update

  ['find', 'update', 'remove', 'insert', '_ensureIndex', '_dropIndex'].forEach(function (func) {
    var originalFunc = mongoConnectionProto[func];

    mongoConnectionProto[func] = function (collName, selector, mod, options) {
      var payload = {
        coll: collName,
        func: func
      };

      if (func == 'insert') {//add nothing more to the payload
      } else if (func == '_ensureIndex' || func == '_dropIndex') {
        //add index
        payload.index = JSON.stringify(selector);
      } else if (func == 'update' && options && options.upsert) {
        payload.func = 'upsert';
        payload.selector = JSON.stringify(selector);
      } else {
        //all the other functions have selectors
        payload.selector = JSON.stringify(selector);
      }

      var kadiraInfo = Kadira._getInfo();

      if (kadiraInfo) {
        var eventId = Kadira.tracer.event(kadiraInfo.trace, 'db', payload);
      } //this cause V8 to avoid any performance optimizations, but this is must to use
      //otherwise, if the error adds try catch block our logs get messy and didn't work
      //see: issue #6


      try {
        var ret = originalFunc.apply(this, arguments); //handling functions which can be triggered with an asyncCallback

        var endOptions = {};

        if (HaveAsyncCallback(arguments)) {
          endOptions.async = true;
        }

        if (func == 'update') {
          // upsert only returns an object when called `upsert` directly
          // otherwise it only act an update command
          if (options && options.upsert && typeof ret == 'object') {
            endOptions.updatedDocs = ret.numberAffected;
            endOptions.insertedId = ret.insertedId;
          } else {
            endOptions.updatedDocs = ret;
          }
        } else if (func == 'remove') {
          endOptions.removedDocs = ret;
        }

        if (eventId) {
          Kadira.tracer.eventEnd(kadiraInfo.trace, eventId, endOptions);
        }
      } catch (ex) {
        if (eventId) {
          Kadira.tracer.eventEnd(kadiraInfo.trace, eventId, {
            err: ex.message
          });
        }

        throw ex;
      }

      return ret;
    };
  });
  var cursorProto = MeteorX.MongoCursor.prototype;
  ['forEach', 'map', 'fetch', 'count', 'observeChanges', 'observe'].forEach(function (type) {
    var originalFunc = cursorProto[type];

    cursorProto[type] = function () {
      var cursorDescription = this._cursorDescription;
      var payload = Object.assign(Object.create(null), {
        coll: cursorDescription.collectionName,
        selector: JSON.stringify(cursorDescription.selector),
        func: type,
        cursor: true
      });

      if (cursorDescription.options) {
        var cursorOptions = _.pick(cursorDescription.options, ['fields', 'sort', 'limit']);

        for (var field in cursorOptions) {
          var value = cursorOptions[field];

          if (typeof value == 'object') {
            value = JSON.stringify(value);
          }

          payload[field] = value;
        }
      }

      var kadiraInfo = Kadira._getInfo();

      var previousTrackNextObject;

      if (kadiraInfo) {
        var eventId = Kadira.tracer.event(kadiraInfo.trace, 'db', payload);
        previousTrackNextObject = kadiraInfo.trackNextObject;

        if (type === 'forEach' || type === 'map') {
          kadiraInfo.trackNextObject = true;
        }
      }

      try {
        var ret = originalFunc.apply(this, arguments);
        var endData = {};

        if (type == 'observeChanges' || type == 'observe') {
          var observerDriver;
          endData.oplog = false; // get data written by the multiplexer

          endData.wasMultiplexerReady = ret._wasMultiplexerReady;
          endData.queueLength = ret._queueLength;
          endData.elapsedPollingTime = ret._elapsedPollingTime;

          if (ret._multiplexer) {
            // older meteor versions done not have an _multiplexer value
            observerDriver = ret._multiplexer._observeDriver;

            if (observerDriver) {
              observerDriver = ret._multiplexer._observeDriver;
              var observerDriverClass = observerDriver.constructor;
              var usesOplog = typeof observerDriverClass.cursorSupported == 'function';
              endData.oplog = usesOplog;
              var size = 0;

              ret._multiplexer._cache.docs.forEach(function () {
                size++;
              });

              endData.noOfCachedDocs = size; // if multiplexerWasNotReady, we need to get the time spend for the polling

              if (!ret._wasMultiplexerReady) {
                endData.initialPollingTime = observerDriver._lastPollTime;
              }
            }
          }

          if (!endData.oplog) {
            // let's try to find the reason
            var reasonInfo = Kadira.checkWhyNoOplog(cursorDescription, observerDriver);
            endData.noOplogCode = reasonInfo.code;
            endData.noOplogReason = reasonInfo.reason;
            endData.noOplogSolution = reasonInfo.solution;
          }
        } else if (type == 'fetch' || type == 'map') {
          //for other cursor operation
          endData.docsFetched = ret.length;

          if (type == 'fetch') {
            var coll = cursorDescription.collectionName;
            var query = cursorDescription.selector;
            var opts = cursorDescription.options;
            var docSize = Kadira.docSzCache.getSize(coll, query, opts, ret) * ret.length;
            endData.docSize = docSize;

            if (kadiraInfo) {
              if (kadiraInfo.trace.type === 'method') {
                Kadira.models.methods.trackDocSize(kadiraInfo.trace.name, docSize);
              } else if (kadiraInfo.trace.type === 'sub') {
                Kadira.models.pubsub.trackDocSize(kadiraInfo.trace.name, "cursorFetches", docSize);
              }

              kadiraInfo.trackNextObject = previousTrackNextObject;
            } else {
              // Fetch with no kadira info are tracked as from a null method
              Kadira.models.methods.trackDocSize("<not-a-method-or-a-pub>", docSize);
            } // TODO: Add doc size tracking to `map` as well.

          }
        }

        if (eventId) {
          Kadira.tracer.eventEnd(kadiraInfo.trace, eventId, endData);
        }

        return ret;
      } catch (ex) {
        if (eventId) {
          Kadira.tracer.eventEnd(kadiraInfo.trace, eventId, {
            err: ex.message
          });
        }

        throw ex;
      }
    };
  });
  const SyncronousCursor = getSyncronousCursor();
  var origNextObject = SyncronousCursor.prototype._nextObject;

  SyncronousCursor.prototype._nextObject = function () {
    var kadiraInfo = Kadira._getInfo();

    var shouldTrack = kadiraInfo && kadiraInfo.trackNextObject;

    if (shouldTrack) {
      var event = Kadira.tracer.event(kadiraInfo.trace, 'db', {
        func: '_nextObject',
        coll: this._cursorDescription.collectionName
      });
    }

    var result = origNextObject.call(this);

    if (shouldTrack) {
      Kadira.tracer.eventEnd(kadiraInfo.trace, event);
    }

    return result;
  };
};
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

},"http.js":function module(){

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                                     //
// packages/montiapm_agent/lib/hijack/http.js                                                                          //
//                                                                                                                     //
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                                                                                                                       //
var originalCall = HTTP.call;

HTTP.call = function (method, url) {
  var kadiraInfo = Kadira._getInfo();

  if (kadiraInfo) {
    var eventId = Kadira.tracer.event(kadiraInfo.trace, 'http', {
      method: method,
      url: url
    });
  }

  try {
    var response = originalCall.apply(this, arguments); //if the user supplied an asynCallback, we don't have a response object and it handled asynchronously
    //we need to track it down to prevent issues like: #3

    var endOptions = HaveAsyncCallback(arguments) ? {
      async: true
    } : {
      statusCode: response.statusCode
    };

    if (eventId) {
      Kadira.tracer.eventEnd(kadiraInfo.trace, eventId, endOptions);
    }

    return response;
  } catch (ex) {
    if (eventId) {
      Kadira.tracer.eventEnd(kadiraInfo.trace, eventId, {
        err: ex.message
      });
    }

    throw ex;
  }
};
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

},"email.js":function module(){

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                                     //
// packages/montiapm_agent/lib/hijack/email.js                                                                         //
//                                                                                                                     //
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                                                                                                                       //
var originalSend = Email.send;

Email.send = function (options) {
  var kadiraInfo = Kadira._getInfo();

  if (kadiraInfo) {
    var data = _.pick(options, 'from', 'to', 'cc', 'bcc', 'replyTo');

    var eventId = Kadira.tracer.event(kadiraInfo.trace, 'email', data);
  }

  try {
    var ret = originalSend.call(this, options);

    if (eventId) {
      Kadira.tracer.eventEnd(kadiraInfo.trace, eventId);
    }

    return ret;
  } catch (ex) {
    if (eventId) {
      Kadira.tracer.eventEnd(kadiraInfo.trace, eventId, {
        err: ex.message
      });
    }

    throw ex;
  }
};
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

},"async.js":function module(require,exports,module){

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                                     //
// packages/montiapm_agent/lib/hijack/async.js                                                                         //
//                                                                                                                     //
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                                                                                                                       //
module.export({
  getFiberMetrics: () => getFiberMetrics,
  resetFiberMetrics: () => resetFiberMetrics
});

var Fibers = Npm.require('fibers');

var EventSymbol = Symbol();
var StartTracked = Symbol();
var activeFibers = 0;
var originalYield = Fibers.yield;

Fibers.yield = function () {
  var kadiraInfo = Kadira._getInfo();

  if (kadiraInfo) {
    var eventId = Kadira.tracer.event(kadiraInfo.trace, 'async');

    if (eventId) {
      // The event unique to this fiber
      // Using a symbol since Meteor doesn't copy symbols to new fibers created
      // for promises. This is needed so the correct event is ended when a fiber runs after being yielded.
      Fibers.current[EventSymbol] = eventId;
    }
  }

  return originalYield();
};

var originalRun = Fibers.prototype.run;
var originalThrowInto = Fibers.prototype.throwInto;

function ensureFiberCounted(fiber) {
  // If fiber.started is true, and StartTracked is false
  // then the fiber was probably initially ran before we wrapped Fibers.run
  if (!fiber.started || !fiber[StartTracked]) {
    activeFibers += 1;
    fiber[StartTracked] = true;
  }
}

Fibers.prototype.run = function (val) {
  ensureFiberCounted(this);

  if (this[EventSymbol]) {
    var kadiraInfo = Kadira._getInfo(this);

    if (kadiraInfo) {
      Kadira.tracer.eventEnd(kadiraInfo.trace, this[EventSymbol]);
      this[EventSymbol] = null;
    }
  } else if (!this.__kadiraInfo && Fibers.current && Fibers.current.__kadiraInfo) {
    // Copy kadiraInfo when packages or user code creates a new fiber
    // Done by many apps and packages in connect middleware since older
    // versions of Meteor did not do it automatically
    this.__kadiraInfo = Fibers.current.__kadiraInfo;
  }

  let result;

  try {
    result = originalRun.call(this, val);
  } finally {
    if (!this.started) {
      activeFibers -= 1;
      this[StartTracked] = false;
    }
  }

  return result;
};

Fibers.prototype.throwInto = function (val) {
  ensureFiberCounted(this); // TODO: this should probably end the current async event since in some places
  // Meteor calls throwInto instead of run after a fiber is yielded. For example,
  // when a promise is awaited and rejects an error.

  let result;

  try {
    result = originalThrowInto.call(this, val);
  } finally {
    if (!this.started) {
      activeFibers -= 1;
      this[StartTracked] = false;
    }
  }

  return result;
};

let activeFiberTotal = 0;
let activeFiberCount = 0;
let previousTotalCreated = 0;
setInterval(() => {
  activeFiberTotal += activeFibers;
  activeFiberCount += 1;
}, 1000);

function getFiberMetrics() {
  return {
    created: Fibers.fibersCreated - previousTotalCreated,
    active: activeFiberTotal / activeFiberCount,
    poolSize: Fibers.poolSize
  };
}

function resetFiberMetrics() {
  activeFiberTotal = 0;
  activeFiberCount = 0;
  previousTotalCreated = Fibers.fibersCreated;
}
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

},"error.js":function module(require,exports,module){

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                                     //
// packages/montiapm_agent/lib/hijack/error.js                                                                         //
//                                                                                                                     //
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                                                                                                                       //
module.export({
  MeteorDebugIgnore: () => MeteorDebugIgnore
});
const MeteorDebugIgnore = Symbol();

TrackUncaughtExceptions = function () {
  process.on('uncaughtException', function (err) {
    // skip errors with `_skipKadira` flag
    if (err._skipKadira) {
      return;
    } // let the server crash normally if error tracking is disabled


    if (!Kadira.options.enableErrorTracking) {
      printErrorAndKill(err);
    } // looking for already tracked errors and throw them immediately
    // throw error immediately if kadira is not ready


    if (err._tracked || !Kadira.connected) {
      printErrorAndKill(err);
    }

    var trace = getTrace(err, 'server-crash', 'uncaughtException');
    Kadira.models.error.trackError(err, trace);

    Kadira._sendPayload(function () {
      clearTimeout(timer);
      throwError(err);
    });

    var timer = setTimeout(function () {
      throwError(err);
    }, 1000 * 10);

    function throwError(err) {
      // sometimes error came back from a fiber.
      // But we don't fibers to track that error for us
      // That's why we throw the error on the nextTick
      process.nextTick(function () {
        // we need to mark this error where we really need to throw
        err._tracked = true;
        printErrorAndKill(err);
      });
    }
  });

  function printErrorAndKill(err) {
    // since we are capturing error, we are also on the error message.
    // so developers think we are also reponsible for the error.
    // But we are not. This will fix that.
    console.error(err.stack);
    process.exit(7);
  }
};

TrackUnhandledRejections = function () {
  process.on('unhandledRejection', function (reason) {
    // skip errors with `_skipKadira` flag
    if (reason._skipKadira || !Kadira.options.enableErrorTracking) {
      return;
    }

    var trace = getTrace(reason, 'server-internal', 'unhandledRejection');
    Kadira.models.error.trackError(reason, trace); // TODO: we should respect the --unhandled-rejections option
    // message taken from 
    // https://github.com/nodejs/node/blob/f4797ff1ef7304659d747d181ec1e7afac408d50/lib/internal/process/promises.js#L243-L248

    const message = 'This error originated either by ' + 'throwing inside of an async function without a catch block, ' + 'or by rejecting a promise which was not handled with .catch().' + ' The promise rejected with the reason: '; // We could emit a warning instead like Node does internally
    // but it requires Node 8 or newer

    console.warn(message);
    console.error(reason && reason.stack ? reason.stack : reason);
  });
};

TrackMeteorDebug = function () {
  var originalMeteorDebug = Meteor._debug;

  Meteor._debug = function (message, stack) {
    // Sometimes Meteor calls Meteor._debug with no arguments
    // to log an empty line
    const isArgs = message !== undefined || stack !== undefined; // We've changed `stack` into an object at method and sub handlers so we can
    // detect the error here. These errors are already tracked so don't track them again.

    var alreadyTracked = false; // Some Meteor versions pass the error, and other versions pass the error stack
    // Restore so origionalMeteorDebug shows the stack as a string instead as an object

    if (stack && stack[MeteorDebugIgnore]) {
      alreadyTracked = true;
      arguments[1] = stack.stack;
    } else if (stack && stack.stack && stack.stack[MeteorDebugIgnore]) {
      alreadyTracked = true;
      arguments[1] = stack.stack.stack;
    } // only send to the server if connected to kadira


    if (Kadira.options.enableErrorTracking && isArgs && !alreadyTracked && Kadira.connected) {
      let errorMessage = message;

      if (typeof message == 'string' && stack instanceof Error) {
        const separator = message.endsWith(':') ? '' : ':';
        errorMessage = "".concat(message).concat(separator, " ").concat(stack.message);
      }

      let error = new Error(errorMessage);

      if (stack instanceof Error) {
        error.stack = stack.stack;
      } else if (stack) {
        error.stack = stack;
      } else {
        error.stack = CreateUserStack(error);
      }

      var trace = getTrace(error, 'server-internal', 'Meteor._debug');
      Kadira.models.error.trackError(error, trace);
    }

    return originalMeteorDebug.apply(this, arguments);
  };
};

function getTrace(err, type, subType) {
  return {
    type: type,
    subType: subType,
    name: err.message,
    errored: true,
    at: Kadira.syncedDate.getTime(),
    events: [['start', 0, {}], ['error', 0, {
      error: {
        message: err.message,
        stack: err.stack
      }
    }]],
    metrics: {
      total: 0
    }
  };
}
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

},"set_labels.js":function module(){

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                                     //
// packages/montiapm_agent/lib/hijack/set_labels.js                                                                    //
//                                                                                                                     //
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                                                                                                                       //
setLabels = function () {
  // name Session.prototype.send
  var originalSend = MeteorX.Session.prototype.send;

  MeteorX.Session.prototype.send = function kadira_Session_send(msg) {
    return originalSend.call(this, msg);
  }; // name Multiplexer initial adds
  // Multiplexer is undefined in rocket chat


  if (MeteorX.Multiplexer) {
    var originalSendAdds = MeteorX.Multiplexer.prototype._sendAdds;

    MeteorX.Multiplexer.prototype._sendAdds = function kadira_Multiplexer_sendAdds(handle) {
      return originalSendAdds.call(this, handle);
    };
  } // name MongoConnection insert


  var originalMongoInsert = MeteorX.MongoConnection.prototype._insert;

  MeteorX.MongoConnection.prototype._insert = function kadira_MongoConnection_insert(coll, doc, cb) {
    return originalMongoInsert.call(this, coll, doc, cb);
  }; // name MongoConnection update


  var originalMongoUpdate = MeteorX.MongoConnection.prototype._update;

  MeteorX.MongoConnection.prototype._update = function kadira_MongoConnection_update(coll, selector, mod, options, cb) {
    return originalMongoUpdate.call(this, coll, selector, mod, options, cb);
  }; // name MongoConnection remove


  var originalMongoRemove = MeteorX.MongoConnection.prototype._remove;

  MeteorX.MongoConnection.prototype._remove = function kadira_MongoConnection_remove(coll, selector, cb) {
    return originalMongoRemove.call(this, coll, selector, cb);
  }; // name Pubsub added


  var originalPubsubAdded = MeteorX.Session.prototype.sendAdded;

  MeteorX.Session.prototype.sendAdded = function kadira_Session_sendAdded(coll, id, fields) {
    return originalPubsubAdded.call(this, coll, id, fields);
  }; // name Pubsub changed


  var originalPubsubChanged = MeteorX.Session.prototype.sendChanged;

  MeteorX.Session.prototype.sendChanged = function kadira_Session_sendChanged(coll, id, fields) {
    return originalPubsubChanged.call(this, coll, id, fields);
  }; // name Pubsub removed


  var originalPubsubRemoved = MeteorX.Session.prototype.sendRemoved;

  MeteorX.Session.prototype.sendRemoved = function kadira_Session_sendRemoved(coll, id) {
    return originalPubsubRemoved.call(this, coll, id);
  }; // name MongoCursor forEach


  var originalCursorForEach = MeteorX.MongoCursor.prototype.forEach;

  MeteorX.MongoCursor.prototype.forEach = function kadira_Cursor_forEach() {
    return originalCursorForEach.apply(this, arguments);
  }; // name MongoCursor map


  var originalCursorMap = MeteorX.MongoCursor.prototype.map;

  MeteorX.MongoCursor.prototype.map = function kadira_Cursor_map() {
    return originalCursorMap.apply(this, arguments);
  }; // name MongoCursor fetch


  var originalCursorFetch = MeteorX.MongoCursor.prototype.fetch;

  MeteorX.MongoCursor.prototype.fetch = function kadira_Cursor_fetch() {
    return originalCursorFetch.apply(this, arguments);
  }; // name MongoCursor count


  var originalCursorCount = MeteorX.MongoCursor.prototype.count;

  MeteorX.MongoCursor.prototype.count = function kadira_Cursor_count() {
    return originalCursorCount.apply(this, arguments);
  }; // name MongoCursor observeChanges


  var originalCursorObserveChanges = MeteorX.MongoCursor.prototype.observeChanges;

  MeteorX.MongoCursor.prototype.observeChanges = function kadira_Cursor_observeChanges() {
    return originalCursorObserveChanges.apply(this, arguments);
  }; // name MongoCursor observe


  var originalCursorObserve = MeteorX.MongoCursor.prototype.observe;

  MeteorX.MongoCursor.prototype.observe = function kadira_Cursor_observe() {
    return originalCursorObserve.apply(this, arguments);
  }; // name CrossBar listen


  var originalCrossbarListen = DDPServer._Crossbar.prototype.listen;

  DDPServer._Crossbar.prototype.listen = function kadira_Crossbar_listen(trigger, callback) {
    return originalCrossbarListen.call(this, trigger, callback);
  }; // name CrossBar fire


  var originalCrossbarFire = DDPServer._Crossbar.prototype.fire;

  DDPServer._Crossbar.prototype.fire = function kadira_Crossbar_fire(notification) {
    return originalCrossbarFire.call(this, notification);
  };
};
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

},"fast_render.js":function module(require,exports,module){

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                                     //
// packages/montiapm_agent/lib/hijack/fast_render.js                                                                   //
//                                                                                                                     //
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                                                                                                                       //
module.export({
  wrapFastRender: () => wrapFastRender
});

function wrapFastRender() {
  Meteor.startup(() => {
    if (Package['staringatlights:fast-render']) {
      const FastRender = Package['staringatlights:fast-render'].FastRender; // Flow Router doesn't call FastRender.route until after all
      // Meteor.startup callbacks finish

      let origRoute = FastRender.route;

      FastRender.route = function (path, _callback) {
        let callback = function () {
          const info = Kadira._getInfo();

          if (info) {
            info.suggestedRouteName = path;
          }

          return _callback.apply(this, arguments);
        };

        return origRoute.call(FastRender, path, callback);
      };
    }
  });
}
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

},"fs.js":function module(require,exports,module){

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                                     //
// packages/montiapm_agent/lib/hijack/fs.js                                                                            //
//                                                                                                                     //
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                                                                                                                       //
module.export({
  handleErrorEvent: () => handleErrorEvent,
  wrapFs: () => wrapFs
});
let fs;
module.link("fs", {
  default(v) {
    fs = v;
  }

}, 0);

const Fibers = require('fibers');

function wrapCallback(args, createWrapper) {
  if (typeof args[args.length - 1] === 'function') {
    args[args.length - 1] = createWrapper(args[args.length - 1]);
  }
}

function handleErrorEvent(eventEmitter, trace, event) {
  function handler(error) {
    if (trace && event) {
      Kadira.tracer.eventEnd(trace, event, {
        error: error
      });
    } // Node throws the error if there are no listeners
    // We want it to behave as if we are not listening to it


    if (eventEmitter.listenerCount('error') === 1) {
      eventEmitter.removeListener('error', handler);
      eventEmitter.emit('error', error);
    }
  }

  eventEmitter.on('error', handler);
}

function wrapFs() {
  // Some npm packages will do fs calls in the
  // callback of another fs call.
  // This variable is set with the kadiraInfo while
  // a callback is run so we can track other fs calls
  let fsKadiraInfo = null;
  let originalStat = fs.stat;

  fs.stat = function () {
    const kadiraInfo = Kadira._getInfo() || fsKadiraInfo;

    if (kadiraInfo) {
      let event = Kadira.tracer.event(kadiraInfo.trace, 'fs', {
        func: 'stat',
        path: arguments[0],
        options: typeof arguments[1] === 'object' ? arguments[1] : undefined
      });
      wrapCallback(arguments, cb => {
        return function () {
          Kadira.tracer.eventEnd(kadiraInfo.trace, event);

          if (!Fibers.current) {
            fsKadiraInfo = kadiraInfo;
          }

          try {
            cb.apply(null, arguments);
          } finally {
            fsKadiraInfo = null;
          }
        };
      });
    }

    return originalStat.apply(fs, arguments);
  };

  let originalCreateReadStream = fs.createReadStream;

  fs.createReadStream = function () {
    const kadiraInfo = Kadira._getInfo() || fsKadiraInfo;
    let stream = originalCreateReadStream.apply(this, arguments);

    if (kadiraInfo) {
      const event = Kadira.tracer.event(kadiraInfo.trace, 'fs', {
        func: 'createReadStream',
        path: arguments[0],
        options: JSON.stringify(arguments[1])
      });
      stream.on('end', () => {
        Kadira.tracer.eventEnd(kadiraInfo.trace, event);
      });
      handleErrorEvent(stream, kadiraInfo.trace, event);
    }

    return stream;
  };
}
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

},"gc.js":function module(require,exports,module){

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                                     //
// packages/montiapm_agent/lib/hijack/gc.js                                                                            //
//                                                                                                                     //
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                                                                                                                       //
module.export({
  default: () => GCMetrics
});
let PerformanceObserver;
let constants;

try {
  // Only available in Node 8.5 and newer
  ({
    PerformanceObserver,
    constants
  } = require('perf_hooks'));
} catch (e) {}

class GCMetrics {
  constructor() {
    this._observer = null;
    this.started = false;
    this.metrics = {};
    this.reset();
  }

  start() {
    if (this.started) {
      return false;
    }

    if (!PerformanceObserver || !constants) {
      // The node version is too old to have PerformanceObserver
      return false;
    }

    this.started = true;
    this.observer = new PerformanceObserver(list => {
      list.getEntries().forEach(entry => {
        let metric = this._mapKindToMetric(entry.kind);

        this.metrics[metric] += entry.duration;
      });
    });
    this.observer.observe({
      entryTypes: ['gc'],
      buffered: false
    });
  }

  _mapKindToMetric(gcKind) {
    switch (gcKind) {
      case constants.NODE_PERFORMANCE_GC_MAJOR:
        return 'gcMajor';

      case constants.NODE_PERFORMANCE_GC_MINOR:
        return 'gcMinor';

      case constants.NODE_PERFORMANCE_GC_INCREMENTAL:
        return 'gcIncremental';

      case constants.NODE_PERFORMANCE_GC_WEAKCB:
        return 'gcWeakCB';

      default:
        console.log("Monti APM: Unrecognized GC Kind: ".concat(gcKind));
    }
  }

  reset() {
    this.metrics = {
      gcMajor: 0,
      gcMinor: 0,
      gcIncremental: 0,
      gcWeakCB: 0
    };
  }

}
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

},"mongo-driver-events.js":function module(require,exports,module){

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                                     //
// packages/montiapm_agent/lib/hijack/mongo-driver-events.js                                                           //
//                                                                                                                     //
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                                                                                                                       //
module.export({
  getMongoDriverStats: () => getMongoDriverStats,
  resetMongoDriverStats: () => resetMongoDriverStats
});
var client;
var serverStatus = Object.create(null);
var otherCheckouts = 0; // These metrics are only for the mongo pool for the primary Mongo server

var primaryCheckouts = 0;
var totalCheckoutTime = 0;
var maxCheckoutTime = 0;
var created = 0;
var measurementCount = 0;
var pendingTotal = 0;
var checkedOutTotal = 0;
setInterval(() => {
  let status = getServerStatus(getPrimary(), true);

  if (status) {
    pendingTotal += status.pending.length;
    checkedOutTotal += status.checkedOut.size;
    measurementCount += 1;
  }
}, 1000); // the pool defaults to 100, though usually the default isn't used

var DEFAULT_MAX_POOL_SIZE = 100;

function getPoolSize() {
  if (client && client.topology && client.topology.s && client.topology.s.options) {
    return client.topology.s.options.maxPoolSize || DEFAULT_MAX_POOL_SIZE;
  }

  return 0;
}

function getMongoDriverStats() {
  return {
    poolSize: getPoolSize(),
    primaryCheckouts,
    otherCheckouts,
    checkoutTime: totalCheckoutTime,
    maxCheckoutTime,
    pending: pendingTotal / measurementCount,
    checkedOut: checkedOutTotal / measurementCount,
    created
  };
}

;

function resetMongoDriverStats() {
  primaryCheckouts = 0;
  otherCheckouts = 0;
  totalCheckoutTime = 0;
  maxCheckoutTime = 0;
  pendingTotal = 0;
  checkedOutTotal = 0;
  measurementCount = 0;
  primaryCheckouts = 0;
  created = 0;
}

Meteor.startup(() => {
  let _client = MongoInternals.defaultRemoteCollectionDriver().mongo.client;

  if (!_client || !_client.s) {
    // Old version of agent
    return;
  }

  let options = _client.s.options;

  if (!options || !options.useUnifiedTopology) {
    // CMAP and topology monitoring requires useUnifiedTopology
    return;
  }

  client = _client; // Get the number of connections already created

  let primaryDescription = getServerDescription(getPrimary());

  if (primaryDescription && primaryDescription.s && primaryDescription.s.pool) {
    let pool = primaryDescription.s.pool;
    let totalConnections = pool.totalConnectionCount;
    let availableConnections = pool.availableConnectionCount; // totalConnectionCount counts available connections twice

    created += totalConnections - availableConnections;
  }

  client.on('connectionCreated', event => {
    let primary = getPrimary();

    if (primary === event.address) {
      created += 1;
    }
  });
  client.on('connectionClosed', event => {
    let status = getServerStatus(event.address, true);

    if (status) {
      status.checkedOut.delete(event.connectionId);
    }
  });
  client.on('connectionCheckOutStarted', event => {
    let status = getServerStatus(event.address);
    status.pending.push(event.time);
  });
  client.on('connectionCheckOutFailed', event => {
    let status = getServerStatus(event.address, true);

    if (status) {
      status.pending.shift();
    }
  });
  client.on('connectionCheckedOut', event => {
    let status = getServerStatus(event.address);
    let start = status.pending.shift();
    let primary = getPrimary();

    if (start && primary === event.address) {
      let checkoutDuration = event.time.getTime() - start.getTime();
      primaryCheckouts += 1;
      totalCheckoutTime += checkoutDuration;

      if (checkoutDuration > maxCheckoutTime) {
        maxCheckoutTime = checkoutDuration;
      }
    } else {
      otherCheckouts += 1;
    }

    status.checkedOut.add(event.connectionId);
  });
  client.on('connectionCheckedIn', event => {
    let status = getServerStatus(event.address, true);

    if (status) {
      status.checkedOut.delete(event.connectionId);
    }
  });
  client.on('serverClosed', function (event) {
    delete serverStatus[event.address];
  });
});

function getServerStatus(address, disableCreate) {
  if (typeof address !== 'string') {
    return null;
  }

  if (address in serverStatus) {
    return serverStatus[address];
  }

  if (disableCreate) {
    return null;
  }

  serverStatus[address] = {
    pending: [],
    checkedOut: new Set()
  };
  return serverStatus[address];
}

function getPrimary() {
  if (!client || !client.topology) {
    return null;
  }

  let server = client.topology.lastIsMaster();

  if (server.type === 'Standalone') {
    return server.address;
  }

  if (!server || !server.primary) {
    return null;
  }

  return server.primary;
}

function getServerDescription(address) {
  if (!client || !client.topology || !client.topology.s || !client.topology.s.servers) {
    return null;
  }

  let description = client.topology.s.servers.get(address);
  return description || null;
}
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

},"picker.js":function module(require,exports,module){

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                                     //
// packages/montiapm_agent/lib/hijack/picker.js                                                                        //
//                                                                                                                     //
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                                                                                                                       //
module.export({
  wrapPicker: () => wrapPicker
});
let Fiber;
module.link("fibers", {
  default(v) {
    Fiber = v;
  }

}, 0);

function wrapPicker() {
  Meteor.startup(() => {
    if (!Package['meteorhacks:picker']) {
      return;
    }

    const Picker = Package['meteorhacks:picker'].Picker; // Wrap Picker._processRoute to make sure it runs the
    // handler in a Fiber with __kadiraInfo set
    // Needed if any previous middleware called `next` outside of a fiber.

    const origProcessRoute = Picker.constructor.prototype._processRoute;

    Picker.constructor.prototype._processRoute = function (callback, params, req) {
      const args = arguments;

      if (!Fiber.current) {
        return new Fiber(() => {
          Kadira._setInfo(req.__kadiraInfo);

          return origProcessRoute.apply(this, args);
        }).run();
      }

      if (req.__kadiraInfo) {
        Kadira._setInfo(req.__kadiraInfo);
      }

      return origProcessRoute.apply(this, args);
    };
  });
}
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

},"wrap_routers.js":function module(require,exports,module){

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                                     //
// packages/montiapm_agent/lib/hijack/wrap_routers.js                                                                  //
//                                                                                                                     //
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                                                                                                                       //
module.export({
  wrapRouters: () => wrapRouters
});
let Fibers;
module.link("fibers", {
  default(v) {
    Fibers = v;
  }

}, 0);

function wrapRouters() {
  let connectRoutes = [];

  try {
    connectRoutes.push(require('connect-route'));
  } catch (e) {// We can ignore errors
  }

  try {
    if (Package['simple:json-routes']) {
      // Relative from .npm/node_modules/meteor/montiapm_agent/node_modules
      // Npm.require is less strict on what paths you use than require
      connectRoutes.push(Npm.require('../../simple_json-routes/node_modules/connect-route'));
    }
  } catch (e) {// we can ignore errors
  }

  connectRoutes.forEach(connectRoute => {
    if (typeof connectRoute !== 'function') {
      return;
    }

    connectRoute(router => {
      const oldAdd = router.constructor.prototype.add;

      router.constructor.prototype.add = function (method, route, handler) {
        // Unlike most routers, connect-route doesn't look at the arguments length
        oldAdd.call(this, method, route, function () {
          if (arguments[0] && arguments[0].__kadiraInfo) {
            arguments[0].__kadiraInfo.suggestedRouteName = route;
          }

          handler.apply(null, arguments);
        });
      };
    });
  });
}
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

},"wrap_webapp.js":function module(require,exports,module){

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                                     //
// packages/montiapm_agent/lib/hijack/wrap_webapp.js                                                                   //
//                                                                                                                     //
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                                                                                                                       //
module.export({
  checkHandlersInFiber: () => checkHandlersInFiber,
  wrapWebApp: () => wrapWebApp
});
let WebAppInternals, WebApp;
module.link("meteor/webapp", {
  WebAppInternals(v) {
    WebAppInternals = v;
  },

  WebApp(v) {
    WebApp = v;
  }

}, 0);
let Fibers;
module.link("fibers", {
  default(v) {
    Fibers = v;
  }

}, 1);
// Maximum content-length size
MAX_BODY_SIZE = 8000; // Maximum characters for stringified body

MAX_STRINGIFIED_BODY_SIZE = 4000;
const canWrapStaticHandler = !!WebAppInternals.staticFilesByArch; // This checks if running on a version of Meteor that
// wraps connect handlers in a fiber.
// This check is dependant on Meteor's implementation of `use`,
// which wraps every handler in a new fiber.
// This will need to be updated if Meteor starts reusing
// fibers when they exist.

function checkHandlersInFiber() {
  const handlersLength = WebApp.rawConnectHandlers.stack.length;
  let inFiber = false;
  let outsideFiber = Fibers.current;
  WebApp.rawConnectHandlers.use((_req, _res, next) => {
    inFiber = Fibers.current && Fibers.current !== outsideFiber; // in case we didn't successfully remove this handler
    // and it is a real request

    next();
  });

  if (WebApp.rawConnectHandlers.stack[handlersLength]) {
    let handler = WebApp.rawConnectHandlers.stack[handlersLength].handle; // remove the newly added handler
    // We remove it immediately so there is no opportunity for
    // other code to add handlers first if the current fiber is yielded
    // while running the handler

    while (WebApp.rawConnectHandlers.stack.length > handlersLength) {
      WebApp.rawConnectHandlers.stack.pop();
    }

    handler({}, {}, () => {});
  }

  return inFiber;
}

const InfoSymbol = Symbol();

function wrapWebApp() {
  return Promise.asyncApply(() => {
    if (!checkHandlersInFiber() || !canWrapStaticHandler) {
      return;
    }

    const parseUrl = require('parseurl');

    WebAppInternals.registerBoilerplateDataCallback('__montiApmRouteName', function (request) {
      // TODO: record in trace which arch is used
      if (request[InfoSymbol]) {
        request[InfoSymbol].isAppRoute = true;
      } // Let WebApp know we didn't make changes
      // so it can use a cache


      return false;
    }); // We want the request object returned by categorizeRequest to have
    // __kadiraInfo

    let origCategorizeRequest = WebApp.categorizeRequest;

    WebApp.categorizeRequest = function (req) {
      let result = origCategorizeRequest.apply(this, arguments);

      if (result && req.__kadiraInfo) {
        result[InfoSymbol] = req.__kadiraInfo;
      }

      return result;
    }; // Adding the handler directly to the stack
    // to force it to be the first one to run


    WebApp.rawConnectHandlers.stack.unshift({
      route: '',
      handle: (req, res, next) => {
        const name = parseUrl(req).pathname;
        const trace = Kadira.tracer.start("".concat(req.method, "-").concat(name), 'http');

        const headers = Kadira.tracer._applyObjectFilters(req.headers);

        Kadira.tracer.event(trace, 'start', {
          url: req.url,
          method: req.method,
          headers: JSON.stringify(headers)
        });
        req.__kadiraInfo = {
          trace
        };
        res.on('finish', () => {
          if (req.__kadiraInfo.asyncEvent) {
            Kadira.tracer.eventEnd(trace, req.__kadiraInfo.asyncEvent);
          }

          Kadira.tracer.endLastEvent(trace);

          if (req.__kadiraInfo.isStatic) {
            trace.name = "".concat(req.method, "-<static file>");
          } else if (req.__kadiraInfo.suggestedRouteName) {
            trace.name = "".concat(req.method, "-").concat(req.__kadiraInfo.suggestedRouteName);
          } else if (req.__kadiraInfo.isAppRoute) {
            trace.name = "".concat(req.method, "-<app>");
          }

          const isJson = req.headers['content-type'] === 'application/json';
          const hasSmallBody = req.headers['content-length'] > 0 && req.headers['content-length'] < MAX_BODY_SIZE; // Check after all middleware have run to see if any of them
          // set req.body
          // Technically bodies can be used with any method, but since many load balancers and
          // other software only support bodies for POST requests, we are
          // not recording the body for other methods.

          if (req.method === 'POST' && req.body && isJson && hasSmallBody) {
            try {
              let body = JSON.stringify(req.body); // Check the body size again in case it is much
              // larger than what was in the content-length header

              if (body.length < MAX_STRINGIFIED_BODY_SIZE) {
                trace.events[0].data.body = body;
              }
            } catch (e) {// It is okay if this fails
            }
          } // TODO: record status code


          Kadira.tracer.event(trace, 'complete');
          let built = Kadira.tracer.buildTrace(trace);
          Kadira.models.http.processRequest(built, req, res);
        });
        next();
      }
    });

    function wrapHandler(handler) {
      // connect identifies error handles by them accepting
      // four arguments
      let errorHandler = handler.length === 4;

      function wrapper(req, res, next) {
        let error;

        if (errorHandler) {
          error = req;
          req = res;
          res = next;
          next = arguments[3];
        }

        const kadiraInfo = req.__kadiraInfo;

        Kadira._setInfo(kadiraInfo);

        let nextCalled = false; // TODO: track errors passed to next or thrown

        function wrappedNext() {
          if (kadiraInfo && kadiraInfo.asyncEvent) {
            Kadira.tracer.eventEnd(req.__kadiraInfo.trace, req.__kadiraInfo.asyncEvent);
            req.__kadiraInfo.asyncEvent = null;
          }

          nextCalled = true;
          next(...arguments);
        }

        let potentialPromise;

        if (errorHandler) {
          potentialPromise = handler.call(this, error, req, res, wrappedNext);
        } else {
          potentialPromise = handler.call(this, req, res, wrappedNext);
        }

        if (potentialPromise && typeof potentialPromise.then === 'function') {
          potentialPromise.then(() => {
            // res.finished is depreciated in Node 13, but it is the only option
            // for Node 12.9 and older.
            if (kadiraInfo && !res.finished && !nextCalled) {
              const lastEvent = Kadira.tracer.getLastEvent(kadiraInfo.trace);

              if (lastEvent.endAt) {
                // req is not done, and next has not been called
                // create an async event that will end when either of those happens
                kadiraInfo.asyncEvent = Kadira.tracer.event(kadiraInfo.trace, 'async');
              }
            }
          });
        }

        return potentialPromise;
      }

      if (errorHandler) {
        return function (error, req, res, next) {
          return wrapper(error, req, res, next);
        };
      } else {
        return function (req, res, next) {
          return wrapper(req, res, next);
        };
      }
    }

    function wrapConnect(app, wrapStack) {
      let oldUse = app.use;

      if (wrapStack) {
        // We need to set kadiraInfo on the Fiber the handler will run in.
        // Meteor has already wrapped the handler to run it in a new Fiber
        // by using Promise.asyncApply so we are not able to directly set it
        // on that Fiber. 
        // Meteor's promise library copies properties from the current fiber to
        // the new fiber, so we can wrap it in another Fiber with kadiraInfo set
        // and Meteor will copy kadiraInfo to the new Fiber.
        // It will only create the additional Fiber if it isn't already running in a Fiber
        app.stack.forEach(entry => {
          let wrappedHandler = wrapHandler(entry.handle);

          if (entry.handle.length >= 4) {
            entry.handle = function (error, req, res, next) {
              return Promise.asyncApply(wrappedHandler, this, arguments, true);
            };
          } else {
            entry.handle = function (req, res, next) {
              return Promise.asyncApply(wrappedHandler, this, arguments, true);
            };
          }
        });
      }

      app.use = function () {
        for (var _len = arguments.length, args = new Array(_len), _key = 0; _key < _len; _key++) {
          args[_key] = arguments[_key];
        }

        args[args.length - 1] = wrapHandler(args[args.length - 1]);
        return oldUse.apply(app, args);
      };
    }

    wrapConnect(WebApp.rawConnectHandlers, false);
    wrapConnect(WebAppInternals.meteorInternalHandlers, false); // The oauth package and other core packages might have already added their middleware,
    // so we need to wrap the existing middleware

    wrapConnect(WebApp.connectHandlers, true);
    wrapConnect(WebApp.connectApp, false);
    let oldStaticFilesMiddleware = WebAppInternals.staticFilesMiddleware;
    const staticHandler = wrapHandler(oldStaticFilesMiddleware.bind(WebAppInternals, WebAppInternals.staticFilesByArch));

    WebAppInternals.staticFilesMiddleware = function (_staticFiles, req, res, next) {
      if (req.__kadiraInfo) {
        req.__kadiraInfo.isStatic = true;
      }

      return staticHandler(req, res, function () {
        // if the request is for a static file, the static handler will end the response
        // instead of calling next
        req.__kadiraInfo.isStatic = false;
        return next.apply(this, arguments);
      });
    };
  });
}
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

}},"environment_variables.js":function module(){

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                                     //
// packages/montiapm_agent/lib/environment_variables.js                                                                //
//                                                                                                                     //
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                                                                                                                       //
function normalizedPrefix(name) {
  return name.replace('KADIRA_', 'MONTI_');
}

Kadira._parseEnv = function (env) {
  var options = {};

  for (var name in env) {
    var value = env[name];
    var normalizedName = normalizedPrefix(name);
    var info = Kadira._parseEnv._options[normalizedName];

    if (info && value) {
      options[info.name] = info.parser(value);
    }
  }

  return options;
};

Kadira._parseEnv.parseInt = function (str) {
  var num = parseInt(str);
  if (num || num === 0) return num;
  throw new Error('Kadira: Match Error: "' + num + '" is not a number');
};

Kadira._parseEnv.parseBool = function (str) {
  str = str.toLowerCase();
  if (str === 'true') return true;
  if (str === 'false') return false;
  throw new Error('Kadira: Match Error: ' + str + ' is not a boolean');
};

Kadira._parseEnv.parseUrl = function (str) {
  return str;
};

Kadira._parseEnv.parseString = function (str) {
  return str;
};

Kadira._parseEnv._options = {
  // auth
  MONTI_APP_ID: {
    name: 'appId',
    parser: Kadira._parseEnv.parseString
  },
  MONTI_APP_SECRET: {
    name: 'appSecret',
    parser: Kadira._parseEnv.parseString
  },
  // delay to send the initial ping to the kadira engine after page loads
  MONTI_OPTIONS_CLIENT_ENGINE_SYNC_DELAY: {
    name: 'clientEngineSyncDelay',
    parser: Kadira._parseEnv.parseInt
  },
  // time between sending errors to the engine
  MONTI_OPTIONS_ERROR_DUMP_INTERVAL: {
    name: 'errorDumpInterval',
    parser: Kadira._parseEnv.parseInt
  },
  // no of errors allowed in a given interval
  MONTI_OPTIONS_MAX_ERRORS_PER_INTERVAL: {
    name: 'maxErrorsPerInterval',
    parser: Kadira._parseEnv.parseInt
  },
  // a zone.js specific option to collect the full stack trace(which is not much useful)
  MONTI_OPTIONS_COLLECT_ALL_STACKS: {
    name: 'collectAllStacks',
    parser: Kadira._parseEnv.parseBool
  },
  // enable error tracking (which is turned on by default)
  MONTI_OPTIONS_ENABLE_ERROR_TRACKING: {
    name: 'enableErrorTracking',
    parser: Kadira._parseEnv.parseBool
  },
  // kadira engine endpoint
  MONTI_OPTIONS_ENDPOINT: {
    name: 'endpoint',
    parser: Kadira._parseEnv.parseUrl
  },
  // define the hostname of the current running process
  MONTI_OPTIONS_HOSTNAME: {
    name: 'hostname',
    parser: Kadira._parseEnv.parseString
  },
  // interval between sending data to the kadira engine from the server
  MONTI_OPTIONS_PAYLOAD_TIMEOUT: {
    name: 'payloadTimeout',
    parser: Kadira._parseEnv.parseInt
  },
  // set HTTP/HTTPS proxy
  MONTI_OPTIONS_PROXY: {
    name: 'proxy',
    parser: Kadira._parseEnv.parseUrl
  },
  // number of items cached for tracking document size
  MONTI_OPTIONS_DOCUMENT_SIZE_CACHE_SIZE: {
    name: 'documentSizeCacheSize',
    parser: Kadira._parseEnv.parseInt
  },
  // enable uploading sourcemaps
  MONTI_UPLOAD_SOURCE_MAPS: {
    name: 'uploadSourceMaps',
    parser: Kadira._parseEnv.parseBool
  },
  MONTI_RECORD_IP_ADDRESS: {
    name: 'recordIPAddress',
    parser: Kadira._parseEnv.parseString
  },
  MONTI_EVENT_STACK_TRACE: {
    name: 'eventStackTrace',
    parser: Kadira._parseEnv.parseBool
  }
};
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

},"auto_connect.js":function module(){

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                                     //
// packages/montiapm_agent/lib/auto_connect.js                                                                         //
//                                                                                                                     //
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                                                                                                                       //
Kadira._connectWithEnv = function () {
  var options = Kadira._parseEnv(process.env);

  if (options.appId && options.appSecret) {
    Kadira.connect(options.appId, options.appSecret, options);

    Kadira.connect = function () {
      throw new Error('Kadira has been already connected using credentials from Environment Variables');
    };
  }
};

Kadira._connectWithSettings = function () {
  var montiSettings = Meteor.settings.monti || Meteor.settings.kadira;

  if (montiSettings && montiSettings.appId && montiSettings.appSecret) {
    Kadira.connect(montiSettings.appId, montiSettings.appSecret, montiSettings.options || {});

    Kadira.connect = function () {
      throw new Error('Kadira has been already connected using credentials from Meteor.settings');
    };
  }
}; // Try to connect automatically


Kadira._connectWithEnv();

Kadira._connectWithSettings();
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

},"conflicting_agents.js":function module(require,exports,module){

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                                     //
// packages/montiapm_agent/lib/conflicting_agents.js                                                                   //
//                                                                                                                     //
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                                                                                                                       //
let Meteor;
module.link("meteor/meteor", {
  Meteor(v) {
    Meteor = v;
  }

}, 0);
const conflictingPackages = ['mdg:meteor-apm-agent', 'lmachens:kadira', 'meteorhacks:kadira'];
Meteor.startup(() => {
  conflictingPackages.forEach(name => {
    if (name in Package) {
      console.log("Monti APM: your app is using the ".concat(name, " package. Using more than one APM agent in an app can cause unexpected problems."));
    }
  });
});
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

},".meteor-package-versions":function module(require,exports,module){

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                                     //
// packages/montiapm_agent/lib/.meteor-package-versions                                                                //
//                                                                                                                     //
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                                                                                                                       //
module.exports = {"accounts-base":"1.8.0","accounts-facebook":"1.3.2","accounts-google":"1.3.3","accounts-oauth":"1.2.0","accounts-password":"1.7.0","accounts-twitter":"1.4.2","allow-deny":"1.1.0","autoupdate":"1.7.0","babel-compiler":"7.6.2","babel-runtime":"1.5.0","base64":"1.0.12","binary-heap":"1.0.11","blaze":"2.5.0","blaze-html-templates":"1.2.1","blaze-tools":"1.1.2","boilerplate-generator":"1.7.1","bozhao:link-accounts":"2.4.0","caching-compiler":"1.2.2","caching-html-compiler":"1.2.1","callback-hook":"1.3.0","check":"1.3.1","coffeescript":"1.0.17","ctjp:meteor-intl-tel-input":"3.7.1_2","ddp":"1.4.0","ddp-client":"2.4.1","ddp-common":"1.4.0","ddp-rate-limiter":"1.0.9","ddp-server":"2.3.3","diff-sequence":"1.1.1","dynamic-import":"0.6.0","ecmascript":"0.15.1","ecmascript-runtime":"0.7.0","ecmascript-runtime-client":"0.11.1","ecmascript-runtime-server":"0.10.1","ejson":"1.1.1","email":"2.0.0","es5-shim":"4.8.0","facebook-oauth":"1.7.4","fetch":"0.1.1","gadicohen:robots-txt":"0.0.10","gadicohen:sitemaps":"0.0.26","geojson-utils":"1.0.10","goltfisch:hotjar":"0.1.2","google-oauth":"1.3.0","hammer:hammer":"2.0.4_2","hot-code-push":"1.0.4","html-tools":"1.1.2","htmljs":"1.1.1","http":"1.4.4","id-map":"1.1.1","inter-process-messaging":"0.1.1","jaakhermans:meteor-linkedin-connect":"0.0.1","jcbernack:reactive-aggregate":"1.0.0","jonblum:jquery-cropper":"2.3.0","jquery":"1.11.11","kadira:blaze-layout":"2.3.0","kadira:dochead":"1.5.0","kadira:flow-router":"2.12.1","lamhieu:meteorx":"2.1.1","lamhieu:unblock":"1.0.0","launch-screen":"1.2.1","lepozepo:s3":"5.2.8","less":"2.8.0","littledata:synced-cron":"1.5.1","livedata":"1.0.18","localstorage":"1.2.0","logging":"1.2.0","matb33:collection-hooks":"1.1.0","meteor":"1.9.3","meteor-base":"1.4.0","meteorhacks:picker":"1.0.3","meteortoys:toykit":"10.0.0","minifier-css":"1.5.4","minifier-js":"2.6.1","minimongo":"1.6.2","mobile-experience":"1.1.0","mobile-status-bar":"1.1.0","modern-browsers":"0.1.5","modules":"0.16.0","modules-runtime":"0.12.0","momentjs:moment":"2.29.1","mongo":"1.10.1","mongo-decimal":"0.1.2","mongo-dev-server":"1.1.0","mongo-id":"1.0.8","mongo-livedata":"1.0.12","montiapm:agent":"2.44.0","montiapm:meteorx":"2.2.0","msavin:mongol":"10.0.1","nitrolabs:cdn":"1.3.0","npm-bcrypt":"0.9.4","npm-mongo":"3.8.1","oauth":"1.3.2","oauth1":"1.3.0","oauth2":"1.3.0","observe-sequence":"1.0.19","okgrow:analytics":"3.0.5","ongoworks:security":"2.1.0","ordered-dict":"1.1.0","ostrio:flow-router-extra":"3.7.5","pauli:accounts-linkedin":"1.3.1","pauli:linkedin":"1.3.1","perak:camera":"1.0.1","promise":"0.11.2","random":"1.2.0","rate-limit":"1.0.9","rcy:nouislider":"7.0.7_2","react-fast-refresh":"0.1.1","react-meteor-data":"2.3.3","reactive-dict":"1.3.0","reactive-var":"1.0.11","reload":"1.3.1","retry":"1.1.0","routepolicy":"1.1.0","service-configuration":"1.0.11","session":"1.2.0","sha":"1.0.9","shell-server":"0.5.0","sinda:fancybox":"1.0.2","socket-stream-client":"0.3.3","spacebars":"1.2.0","spacebars-compiler":"1.3.0","srp":"1.1.0","standard-minifier-css":"1.7.3","standard-minifier-js":"2.6.1","templating":"1.4.1","templating-compiler":"1.4.1","templating-runtime":"1.5.0","templating-tools":"1.2.1","themeteorchef:jquery-validation":"1.14.0","tmeasday:publish-counts":"0.8.0","tracker":"1.2.0","tsega:bootstrap3-datetimepicker":"3.1.3_3","twbs:bootstrap":"3.3.6","twitter-oauth":"1.2.0","typescript":"4.1.2","ui":"1.0.13","underscore":"1.0.10","url":"1.3.2","webapp":"1.10.1","webapp-hashing":"1.1.0","zodern:meteor-package-versions":"0.2.1"}
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

}},"node_modules":{"monti-apm-sketches-js":{"package.json":function module(require,exports,module){

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                                     //
// node_modules/meteor/montiapm_agent/node_modules/monti-apm-sketches-js/package.json                                  //
//                                                                                                                     //
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                                                                                                                       //
module.exports = {
  "name": "monti-apm-sketches-js",
  "version": "0.0.3",
  "main": "index.js"
};

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

},"index.js":function module(require,exports,module){

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                                     //
// node_modules/meteor/montiapm_agent/node_modules/monti-apm-sketches-js/index.js                                      //
//                                                                                                                     //
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                                                                                                                       //
module.useNode();
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

}},"parseurl":{"package.json":function module(require,exports,module){

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                                     //
// node_modules/meteor/montiapm_agent/node_modules/parseurl/package.json                                               //
//                                                                                                                     //
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                                                                                                                       //
module.exports = {
  "name": "parseurl",
  "version": "1.3.3"
};

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

},"index.js":function module(require,exports,module){

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                                     //
// node_modules/meteor/montiapm_agent/node_modules/parseurl/index.js                                                   //
//                                                                                                                     //
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                                                                                                                       //
module.useNode();
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

}}}}}}},{
  "extensions": [
    ".js",
    ".json"
  ]
});

require("/node_modules/meteor/montiapm:agent/lib/common/utils.js");
require("/node_modules/meteor/montiapm:agent/lib/common/unify.js");
require("/node_modules/meteor/montiapm:agent/lib/models/base_error.js");
require("/node_modules/meteor/montiapm:agent/lib/jobs.js");
require("/node_modules/meteor/montiapm:agent/lib/retry.js");
require("/node_modules/meteor/montiapm:agent/lib/utils.js");
require("/node_modules/meteor/montiapm:agent/lib/ntp.js");
require("/node_modules/meteor/montiapm:agent/lib/sourcemaps.js");
require("/node_modules/meteor/montiapm:agent/lib/wait_time_builder.js");
require("/node_modules/meteor/montiapm:agent/lib/check_for_oplog.js");
require("/node_modules/meteor/montiapm:agent/lib/tracer/tracer.js");
require("/node_modules/meteor/montiapm:agent/lib/tracer/default_filters.js");
require("/node_modules/meteor/montiapm:agent/lib/tracer/tracer_store.js");
require("/node_modules/meteor/montiapm:agent/lib/models/0model.js");
require("/node_modules/meteor/montiapm:agent/lib/models/methods.js");
require("/node_modules/meteor/montiapm:agent/lib/models/pubsub.js");
require("/node_modules/meteor/montiapm:agent/lib/models/system.js");
require("/node_modules/meteor/montiapm:agent/lib/models/errors.js");
require("/node_modules/meteor/montiapm:agent/lib/docsize_cache.js");
require("/node_modules/meteor/montiapm:agent/lib/kadira.js");
require("/node_modules/meteor/montiapm:agent/lib/hijack/wrap_server.js");
require("/node_modules/meteor/montiapm:agent/lib/hijack/wrap_session.js");
require("/node_modules/meteor/montiapm:agent/lib/hijack/wrap_subscription.js");
require("/node_modules/meteor/montiapm:agent/lib/hijack/wrap_observers.js");
require("/node_modules/meteor/montiapm:agent/lib/hijack/wrap_ddp_stringify.js");
require("/node_modules/meteor/montiapm:agent/lib/hijack/instrument.js");
require("/node_modules/meteor/montiapm:agent/lib/hijack/db.js");
require("/node_modules/meteor/montiapm:agent/lib/hijack/http.js");
require("/node_modules/meteor/montiapm:agent/lib/hijack/email.js");
require("/node_modules/meteor/montiapm:agent/lib/hijack/async.js");
require("/node_modules/meteor/montiapm:agent/lib/hijack/error.js");
require("/node_modules/meteor/montiapm:agent/lib/hijack/set_labels.js");
require("/node_modules/meteor/montiapm:agent/lib/environment_variables.js");
require("/node_modules/meteor/montiapm:agent/lib/auto_connect.js");
require("/node_modules/meteor/montiapm:agent/lib/conflicting_agents.js");
require("/node_modules/meteor/montiapm:agent/lib/common/default_error_filters.js");
require("/node_modules/meteor/montiapm:agent/lib/common/send.js");

/* Exports */
Package._define("montiapm:agent", {
  Kadira: Kadira,
  Monti: Monti
});

})();

//# sourceURL=meteor://💻app/packages/montiapm_agent.js
//# sourceMappingURL=data:application/json;charset=utf8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm1ldGVvcjovL/CfkrthcHAvcGFja2FnZXMvbW9udGlhcG06YWdlbnQvbGliL2NvbW1vbi91dGlscy5qcyIsIm1ldGVvcjovL/CfkrthcHAvcGFja2FnZXMvbW9udGlhcG06YWdlbnQvbGliL2NvbW1vbi91bmlmeS5qcyIsIm1ldGVvcjovL/CfkrthcHAvcGFja2FnZXMvbW9udGlhcG06YWdlbnQvbGliL2NvbW1vbi9kZWZhdWx0X2Vycm9yX2ZpbHRlcnMuanMiLCJtZXRlb3I6Ly/wn5K7YXBwL3BhY2thZ2VzL21vbnRpYXBtOmFnZW50L2xpYi9jb21tb24vc2VuZC5qcyIsIm1ldGVvcjovL/CfkrthcHAvcGFja2FnZXMvbW9udGlhcG06YWdlbnQvbGliL21vZGVscy9iYXNlX2Vycm9yLmpzIiwibWV0ZW9yOi8v8J+Su2FwcC9wYWNrYWdlcy9tb250aWFwbTphZ2VudC9saWIvbW9kZWxzLzBtb2RlbC5qcyIsIm1ldGVvcjovL/CfkrthcHAvcGFja2FnZXMvbW9udGlhcG06YWdlbnQvbGliL21vZGVscy9tZXRob2RzLmpzIiwibWV0ZW9yOi8v8J+Su2FwcC9wYWNrYWdlcy9tb250aWFwbTphZ2VudC9saWIvbW9kZWxzL3B1YnN1Yi5qcyIsIm1ldGVvcjovL/CfkrthcHAvcGFja2FnZXMvbW9udGlhcG06YWdlbnQvbGliL21vZGVscy9zeXN0ZW0uanMiLCJtZXRlb3I6Ly/wn5K7YXBwL3BhY2thZ2VzL21vbnRpYXBtOmFnZW50L2xpYi9tb2RlbHMvZXJyb3JzLmpzIiwibWV0ZW9yOi8v8J+Su2FwcC9wYWNrYWdlcy9tb250aWFwbTphZ2VudC9saWIvbW9kZWxzL2h0dHAuanMiLCJtZXRlb3I6Ly/wn5K7YXBwL3BhY2thZ2VzL21vbnRpYXBtOmFnZW50L2xpYi9qb2JzLmpzIiwibWV0ZW9yOi8v8J+Su2FwcC9wYWNrYWdlcy9tb250aWFwbTphZ2VudC9saWIvcmV0cnkuanMiLCJtZXRlb3I6Ly/wn5K7YXBwL3BhY2thZ2VzL21vbnRpYXBtOmFnZW50L2xpYi91dGlscy5qcyIsIm1ldGVvcjovL/CfkrthcHAvcGFja2FnZXMvbW9udGlhcG06YWdlbnQvbGliL250cC5qcyIsIm1ldGVvcjovL/CfkrthcHAvcGFja2FnZXMvbW9udGlhcG06YWdlbnQvbGliL3NvdXJjZW1hcHMuanMiLCJtZXRlb3I6Ly/wn5K7YXBwL3BhY2thZ2VzL21vbnRpYXBtOmFnZW50L2xpYi93YWl0X3RpbWVfYnVpbGRlci5qcyIsIm1ldGVvcjovL/CfkrthcHAvcGFja2FnZXMvbW9udGlhcG06YWdlbnQvbGliL2NoZWNrX2Zvcl9vcGxvZy5qcyIsIm1ldGVvcjovL/CfkrthcHAvcGFja2FnZXMvbW9udGlhcG06YWdlbnQvbGliL3RyYWNlci90cmFjZXIuanMiLCJtZXRlb3I6Ly/wn5K7YXBwL3BhY2thZ2VzL21vbnRpYXBtOmFnZW50L2xpYi90cmFjZXIvZGVmYXVsdF9maWx0ZXJzLmpzIiwibWV0ZW9yOi8v8J+Su2FwcC9wYWNrYWdlcy9tb250aWFwbTphZ2VudC9saWIvdHJhY2VyL3RyYWNlcl9zdG9yZS5qcyIsIm1ldGVvcjovL/CfkrthcHAvcGFja2FnZXMvbW9udGlhcG06YWdlbnQvbGliL2RvY3NpemVfY2FjaGUuanMiLCJtZXRlb3I6Ly/wn5K7YXBwL3BhY2thZ2VzL21vbnRpYXBtOmFnZW50L2xpYi9rYWRpcmEuanMiLCJtZXRlb3I6Ly/wn5K7YXBwL3BhY2thZ2VzL21vbnRpYXBtOmFnZW50L2xpYi9oaWphY2svd3JhcF9zZXJ2ZXIuanMiLCJtZXRlb3I6Ly/wn5K7YXBwL3BhY2thZ2VzL21vbnRpYXBtOmFnZW50L2xpYi9oaWphY2svd3JhcF9zZXNzaW9uLmpzIiwibWV0ZW9yOi8v8J+Su2FwcC9wYWNrYWdlcy9tb250aWFwbTphZ2VudC9saWIvaGlqYWNrL3dyYXBfc3Vic2NyaXB0aW9uLmpzIiwibWV0ZW9yOi8v8J+Su2FwcC9wYWNrYWdlcy9tb250aWFwbTphZ2VudC9saWIvaGlqYWNrL3dyYXBfb2JzZXJ2ZXJzLmpzIiwibWV0ZW9yOi8v8J+Su2FwcC9wYWNrYWdlcy9tb250aWFwbTphZ2VudC9saWIvaGlqYWNrL3dyYXBfZGRwX3N0cmluZ2lmeS5qcyIsIm1ldGVvcjovL/CfkrthcHAvcGFja2FnZXMvbW9udGlhcG06YWdlbnQvbGliL2hpamFjay9pbnN0cnVtZW50LmpzIiwibWV0ZW9yOi8v8J+Su2FwcC9wYWNrYWdlcy9tb250aWFwbTphZ2VudC9saWIvaGlqYWNrL2RiLmpzIiwibWV0ZW9yOi8v8J+Su2FwcC9wYWNrYWdlcy9tb250aWFwbTphZ2VudC9saWIvaGlqYWNrL2h0dHAuanMiLCJtZXRlb3I6Ly/wn5K7YXBwL3BhY2thZ2VzL21vbnRpYXBtOmFnZW50L2xpYi9oaWphY2svZW1haWwuanMiLCJtZXRlb3I6Ly/wn5K7YXBwL3BhY2thZ2VzL21vbnRpYXBtOmFnZW50L2xpYi9oaWphY2svYXN5bmMuanMiLCJtZXRlb3I6Ly/wn5K7YXBwL3BhY2thZ2VzL21vbnRpYXBtOmFnZW50L2xpYi9oaWphY2svZXJyb3IuanMiLCJtZXRlb3I6Ly/wn5K7YXBwL3BhY2thZ2VzL21vbnRpYXBtOmFnZW50L2xpYi9oaWphY2svc2V0X2xhYmVscy5qcyIsIm1ldGVvcjovL/CfkrthcHAvcGFja2FnZXMvbW9udGlhcG06YWdlbnQvbGliL2hpamFjay9mYXN0X3JlbmRlci5qcyIsIm1ldGVvcjovL/CfkrthcHAvcGFja2FnZXMvbW9udGlhcG06YWdlbnQvbGliL2hpamFjay9mcy5qcyIsIm1ldGVvcjovL/CfkrthcHAvcGFja2FnZXMvbW9udGlhcG06YWdlbnQvbGliL2hpamFjay9nYy5qcyIsIm1ldGVvcjovL/CfkrthcHAvcGFja2FnZXMvbW9udGlhcG06YWdlbnQvbGliL2hpamFjay9tb25nby1kcml2ZXItZXZlbnRzLmpzIiwibWV0ZW9yOi8v8J+Su2FwcC9wYWNrYWdlcy9tb250aWFwbTphZ2VudC9saWIvaGlqYWNrL3BpY2tlci5qcyIsIm1ldGVvcjovL/CfkrthcHAvcGFja2FnZXMvbW9udGlhcG06YWdlbnQvbGliL2hpamFjay93cmFwX3JvdXRlcnMuanMiLCJtZXRlb3I6Ly/wn5K7YXBwL3BhY2thZ2VzL21vbnRpYXBtOmFnZW50L2xpYi9oaWphY2svd3JhcF93ZWJhcHAuanMiLCJtZXRlb3I6Ly/wn5K7YXBwL3BhY2thZ2VzL21vbnRpYXBtOmFnZW50L2xpYi9lbnZpcm9ubWVudF92YXJpYWJsZXMuanMiLCJtZXRlb3I6Ly/wn5K7YXBwL3BhY2thZ2VzL21vbnRpYXBtOmFnZW50L2xpYi9hdXRvX2Nvbm5lY3QuanMiLCJtZXRlb3I6Ly/wn5K7YXBwL3BhY2thZ2VzL21vbnRpYXBtOmFnZW50L2xpYi9jb25mbGljdGluZ19hZ2VudHMuanMiXSwibmFtZXMiOlsiZ2V0Q2xpZW50QXJjaFZlcnNpb24iLCJhcmNoIiwiYXV0b3VwZGF0ZSIsIl9fbWV0ZW9yX3J1bnRpbWVfY29uZmlnX18iLCJ2ZXJzaW9ucyIsInZlcnNpb24iLCJhdXRvdXBkYXRlVmVyc2lvbkNvcmRvdmEiLCJhdXRvdXBkYXRlVmVyc2lvbiIsIkthZGlyYSIsIm9wdGlvbnMiLCJNb250aSIsIk1ldGVvciIsIndyYXBBc3luYyIsIl93cmFwQXN5bmMiLCJpc1NlcnZlciIsIkV2ZW50RW1pdHRlciIsIk5wbSIsInJlcXVpcmUiLCJldmVudEJ1cyIsInNldE1heExpc3RlbmVycyIsImJ1aWxkQXJncyIsImFyZ3MiLCJldmVudE5hbWUiLCJzbGljZSIsInVuc2hpZnQiLCJFdmVudEJ1cyIsImZvckVhY2giLCJtIiwiYXBwbHkiLCJjb21tb25FcnJSZWdFeHBzIiwiZXJyb3JGaWx0ZXJzIiwiZmlsdGVyVmFsaWRhdGlvbkVycm9ycyIsInR5cGUiLCJtZXNzYWdlIiwiZXJyIiwiRXJyb3IiLCJmaWx0ZXJDb21tb25NZXRlb3JFcnJvcnMiLCJsYyIsImxlbmd0aCIsInJlZ0V4cCIsInRlc3QiLCJzZW5kIiwicGF5bG9hZCIsInBhdGgiLCJjYWxsYmFjayIsImNvbm5lY3RlZCIsInN1YnN0ciIsImVuZHBvaW50IiwicmV0cnlDb3VudCIsInJldHJ5IiwiUmV0cnkiLCJtaW5Db3VudCIsIm1pblRpbWVvdXQiLCJiYXNlVGltZW91dCIsIm1heFRpbWVvdXQiLCJzZW5kRnVuY3Rpb24iLCJfZ2V0U2VuZEZ1bmN0aW9uIiwidHJ5VG9TZW5kIiwicmV0cnlMYXRlciIsImNvbnNvbGUiLCJ3YXJuIiwicmVzIiwic3RhdHVzQ29kZSIsImRhdGEiLCJjb250ZW50IiwiX3NlcnZlclNlbmQiLCJfY2xpZW50U2VuZCIsImh0dHBSZXF1ZXN0IiwiaGVhZGVycyIsIkpTT04iLCJzdHJpbmdpZnkiLCJCYXNlRXJyb3JNb2RlbCIsIl9maWx0ZXJzIiwicHJvdG90eXBlIiwiYWRkRmlsdGVyIiwiZmlsdGVyIiwicHVzaCIsInJlbW92ZUZpbHRlciIsImluZGV4IiwiaW5kZXhPZiIsInNwbGljZSIsImFwcGx5RmlsdGVycyIsImVycm9yIiwic3ViVHlwZSIsInZhbGlkYXRlZCIsImV4IiwiS2FkaXJhTW9kZWwiLCJfZ2V0RGF0ZUlkIiwidGltZXN0YW1wIiwicmVtYWluZGVyIiwiZGF0ZUlkIiwiRERTa2V0Y2giLCJNRVRIT0RfTUVUUklDU19GSUVMRFMiLCJNZXRob2RzTW9kZWwiLCJtZXRyaWNzVGhyZXNob2xkIiwibWV0aG9kTWV0cmljc0J5TWludXRlIiwiT2JqZWN0IiwiY3JlYXRlIiwiZXJyb3JNYXAiLCJfbWV0cmljc1RocmVzaG9sZCIsIl8iLCJleHRlbmQiLCJtYXhFdmVudFRpbWVzRm9yTWV0aG9kcyIsInRyYWNlclN0b3JlIiwiVHJhY2VyU3RvcmUiLCJpbnRlcnZhbCIsIm1heFRvdGFsUG9pbnRzIiwiYXJjaGl2ZUV2ZXJ5Iiwic3RhcnQiLCJfZ2V0TWV0cmljcyIsIm1ldGhvZCIsIm1ldGhvZHMiLCJjb3VudCIsImVycm9ycyIsImZldGNoZWREb2NTaXplIiwic2VudE1zZ1NpemUiLCJoaXN0b2dyYW0iLCJhbHBoYSIsImZpZWxkIiwic2V0U3RhcnRUaW1lIiwibWV0cmljc0J5TWludXRlIiwic3RhcnRUaW1lIiwicHJvY2Vzc01ldGhvZCIsIm1ldGhvZFRyYWNlIiwiYXQiLCJfYXBwZW5kTWV0cmljcyIsImVycm9yZWQiLCJuYW1lIiwiYWRkVHJhY2UiLCJpZCIsIm1ldGhvZE1ldHJpY3MiLCJ2YWx1ZSIsIm1ldHJpY3MiLCJhZGQiLCJ0b3RhbCIsImVuZFRpbWUiLCJ0cmFja0RvY1NpemUiLCJzaXplIiwiTnRwIiwiX25vdyIsInRyYWNrTXNnU2l6ZSIsImJ1aWxkUGF5bG9hZCIsImJ1aWxkRGV0YWlsZWRJbmZvIiwibWV0aG9kUmVxdWVzdHMiLCJrZXkiLCJzeW5jZWREYXRlIiwic3luY1RpbWUiLCJtZXRob2ROYW1lIiwiY29sbGVjdFRyYWNlcyIsImxvZ2dlciIsIlB1YnN1Yk1vZGVsIiwic3Vic2NyaXB0aW9ucyIsIl90cmFja1N1YiIsInNlc3Npb24iLCJtc2ciLCJwYXJhbXMiLCJwdWJsaWNhdGlvbiIsIl9nZXRQdWJsaWNhdGlvbk5hbWUiLCJzdWJzY3JpcHRpb25JZCIsInN1YnMiLCJfc3RhcnRUaW1lIiwiX3RyYWNrVW5zdWIiLCJzdWIiLCJfc3Vic2NyaXB0aW9uSWQiLCJfbmFtZSIsInN1YnNjcmlwdGlvblN0YXRlIiwidW5zdWJzIiwibGlmZVRpbWUiLCJfdHJhY2tSZWFkeSIsInRyYWNlIiwicmVhZHlUcmFja2VkIiwicmVzVGltZSIsIl90cmFja0Vycm9yIiwicHVicyIsImFjdGl2ZVN1YnMiLCJhY3RpdmVEb2NzIiwidG90YWxPYnNlcnZlcnMiLCJjYWNoZWRPYnNlcnZlcnMiLCJjcmVhdGVkT2JzZXJ2ZXJzIiwiZGVsZXRlZE9ic2VydmVycyIsIm9ic2VydmVyTGlmZXRpbWUiLCJwb2xsZWREb2N1bWVudHMiLCJvcGxvZ1VwZGF0ZWREb2N1bWVudHMiLCJvcGxvZ0luc2VydGVkRG9jdW1lbnRzIiwib3Bsb2dEZWxldGVkRG9jdW1lbnRzIiwiaW5pdGlhbGx5QWRkZWREb2N1bWVudHMiLCJsaXZlQWRkZWREb2N1bWVudHMiLCJsaXZlQ2hhbmdlZERvY3VtZW50cyIsImxpdmVSZW1vdmVkRG9jdW1lbnRzIiwicG9sbGVkRG9jU2l6ZSIsImluaXRpYWxseUZldGNoZWREb2NTaXplIiwibGl2ZUZldGNoZWREb2NTaXplIiwiaW5pdGlhbGx5U2VudE1zZ1NpemUiLCJsaXZlU2VudE1zZ1NpemUiLCJfZ2V0U3Vic2NyaXB0aW9uSW5mbyIsInNlbGYiLCJ0b3RhbERvY3NTZW50IiwidG90YWxEYXRhU2VudCIsIml0ZXJhdGUiLCJzZXJ2ZXIiLCJzZXNzaW9ucyIsIl9uYW1lZFN1YnMiLCJjb3VudFN1YkRhdGEiLCJfdW5pdmVyc2FsU3VicyIsImF2Z09ic2VydmVyUmV1c2UiLCJlYWNoIiwiY291bnRTdWJzY3JpcHRpb25zIiwiY291bnREb2N1bWVudHMiLCJjb3VudE9ic2VydmVycyIsIl9kb2N1bWVudHMiLCJjb2xsZWN0aW9uIiwiY291bnRLZXlzIiwiX3RvdGFsT2JzZXJ2ZXJzIiwiX2NhY2hlZE9ic2VydmVycyIsImJ1aWxkRGV0YWlsSW5mbyIsInB1Yk1ldHJpY3MiLCJzdWJzY3JpcHRpb25EYXRhIiwiZGF0ZU1ldHJpY3MiLCJzaW5nbGVQdWJNZXRyaWNzIiwicHViUmVxdWVzdHMiLCJpbmNyZW1lbnRIYW5kbGVDb3VudCIsImlzQ2FjaGVkIiwicHVibGljYXRpb25OYW1lIiwiZ2V0UHJvcGVydHkiLCJ0cmFja0NyZWF0ZWRPYnNlcnZlciIsImluZm8iLCJ0cmFja0RlbGV0ZWRPYnNlcnZlciIsIkRhdGUiLCJnZXRUaW1lIiwidHJhY2tEb2N1bWVudENoYW5nZXMiLCJvcCIsInRyYWNrUG9sbGVkRG9jdW1lbnRzIiwidHJhY2tMaXZlVXBkYXRlcyIsImNyZWF0ZUhpc3RvZ3JhbSIsIm1vZHVsZSIsImxpbmsiLCJ2IiwiR0NNZXRyaWNzIiwiZGVmYXVsdCIsImdldEZpYmVyTWV0cmljcyIsInJlc2V0RmliZXJNZXRyaWNzIiwiZ2V0TW9uZ29Ecml2ZXJTdGF0cyIsInJlc2V0TW9uZ29Ecml2ZXJTdGF0cyIsIkV2ZW50TG9vcE1vbml0b3IiLCJTeXN0ZW1Nb2RlbCIsIm5ld1Nlc3Npb25zIiwic2Vzc2lvblRpbWVvdXQiLCJldmxvb3BIaXN0b2dyYW0iLCJldmxvb3BNb25pdG9yIiwib24iLCJsYWciLCJnY01ldHJpY3MiLCJjcHVUaW1lIiwicHJvY2VzcyIsImhydGltZSIsInByZXZpb3VzQ3B1VXNhZ2UiLCJjcHVVc2FnZSIsImNwdUhpc3RvcnkiLCJjdXJyZW50Q3B1VXNhZ2UiLCJzZXRJbnRlcnZhbCIsIm5vdyIsIm1lbW9yeVVzYWdlIiwibWVtb3J5IiwicnNzIiwibWVtb3J5QXJyYXlCdWZmZXJzIiwiYXJyYXlCdWZmZXJzIiwibWVtb3J5RXh0ZXJuYWwiLCJleHRlcm5hbCIsIm1lbW9yeUhlYXBVc2VkIiwiaGVhcFVzZWQiLCJtZW1vcnlIZWFwVG90YWwiLCJoZWFwVG90YWwiLCJhY3RpdmVSZXF1ZXN0cyIsIl9nZXRBY3RpdmVSZXF1ZXN0cyIsImFjdGl2ZUhhbmRsZXMiLCJfZ2V0QWN0aXZlSGFuZGxlcyIsInBjdEV2bG9vcEJsb2NrIiwic3RhdHVzIiwicGN0QmxvY2siLCJnY01ham9yRHVyYXRpb24iLCJnY01ham9yIiwiZ2NNaW5vckR1cmF0aW9uIiwiZ2NNaW5vciIsImdjSW5jcmVtZW50YWxEdXJhdGlvbiIsImdjSW5jcmVtZW50YWwiLCJnY1dlYWtDQkR1cmF0aW9uIiwiZ2NXZWFrQ0IiLCJyZXNldCIsImRyaXZlck1ldHJpY3MiLCJtb25nb1Bvb2xTaXplIiwicG9vbFNpemUiLCJtb25nb1Bvb2xQcmltYXJ5Q2hlY2tvdXRzIiwicHJpbWFyeUNoZWNrb3V0cyIsIm1vbmdvUG9vbE90aGVyQ2hlY2tvdXRzIiwib3RoZXJDaGVja291dHMiLCJtb25nb1Bvb2xDaGVja291dFRpbWUiLCJjaGVja291dFRpbWUiLCJtb25nb1Bvb2xNYXhDaGVja291dFRpbWUiLCJtYXhDaGVja291dFRpbWUiLCJtb25nb1Bvb2xQZW5kaW5nIiwicGVuZGluZyIsIm1vbmdvUG9vbENoZWNrZWRPdXRDb25uZWN0aW9ucyIsImNoZWNrZWRPdXQiLCJtb25nb1Bvb2xDcmVhdGVkQ29ubmVjdGlvbnMiLCJjcmVhdGVkIiwiZmliZXJNZXRyaWNzIiwiY3JlYXRlZEZpYmVycyIsImFjdGl2ZUZpYmVycyIsImFjdGl2ZSIsImZpYmVyUG9vbFNpemUiLCJwY3B1IiwicGNwdVVzZXIiLCJwY3B1U3lzdGVtIiwibGFzdENwdVVzYWdlIiwidXNhZ2UiLCJ1c2VyIiwic3lzIiwibWFwIiwiZW50cnkiLCJ0aW1lIiwic3lzdGVtTWV0cmljcyIsImhydGltZVRvTVMiLCJlbGFwVGltZU1TIiwiZWxhcFVzYWdlIiwiZWxhcFVzZXJNUyIsImVsYXBTeXN0TVMiLCJzeXN0ZW0iLCJ0b3RhbFVzYWdlTVMiLCJ0b3RhbFVzYWdlUGVyY2VudCIsImRvY1N6Q2FjaGUiLCJzZXRQY3B1IiwiaGFuZGxlU2Vzc2lvbkFjdGl2aXR5IiwiY291bnROZXdTZXNzaW9uIiwiaXNTZXNzaW9uQWN0aXZlIiwiX2FjdGl2ZUF0IiwiaXNMb2NhbEFkZHJlc3MiLCJzb2NrZXQiLCJpbmFjdGl2ZVRpbWUiLCJpc0xvY2FsSG9zdFJlZ2V4IiwiaXNMb2NhbEFkZHJlc3NSZWdleCIsImhvc3QiLCJhZGRyZXNzIiwicmVtb3RlQWRkcmVzcyIsIkVycm9yTW9kZWwiLCJhcHBJZCIsImNhbGwiLCJtYXhFcnJvcnMiLCJhc3NpZ24iLCJ2YWx1ZXMiLCJtZXRyaWMiLCJlcnJvckNvdW50IiwidHJhY2tFcnJvciIsImVycm9yRGVmIiwiX2Zvcm1hdEVycm9yIiwic3RhY2siLCJkZXRhaWxzIiwiZXJyb3JFdmVudCIsImV2ZW50cyIsImVycm9yT2JqZWN0Iiwic3RhY2tzIiwiSHR0cE1vZGVsIiwicHJvY2Vzc1JlcXVlc3QiLCJyZXEiLCJyb3V0ZUlkIiwicm91dGVzIiwic3RhdHVzQ29kZXMiLCJyZXF1ZXN0TWV0cmljcyIsInN0YXR1c01ldHJpYyIsImh0dHBNZXRyaWNzIiwiaHR0cFJlcXVlc3RzIiwicmVxdWVzdE5hbWUiLCJleHBvcnREZWZhdWx0IiwiSm9icyIsImdldEFzeW5jIiwiY29yZUFwaSIsImdldEpvYiIsInRoZW4iLCJjYXRjaCIsInNldEFzeW5jIiwiY2hhbmdlcyIsInVwZGF0ZUpvYiIsInNldCIsImdldCIsImNvbnN0cnVjdG9yIiwiZXhwb25lbnQiLCJmdXp6IiwicmV0cnlUaW1lciIsImNsZWFyIiwiY2xlYXJUaW1lb3V0IiwiX3RpbWVvdXQiLCJ0aW1lb3V0IiwiTWF0aCIsIm1pbiIsInBvdyIsIlJhbmRvbSIsImZyYWN0aW9uIiwiY2VpbCIsImZuIiwic2V0VGltZW91dCIsImV4cG9ydCIsIkhhdmVBc3luY0NhbGxiYWNrIiwibGFzdEFyZyIsIlVuaXF1ZUlkIiwiRGVmYXVsdFVuaXF1ZUlkIiwiQ3JlYXRlVXNlclN0YWNrIiwic3BsaXQiLCJ0b1JlbW92ZSIsImpvaW4iLCJPcHRpbWl6ZWRBcHBseSIsImNvbnRleHQiLCJhIiwiZ2V0Q2xpZW50VmVyc2lvbnMiLCJvYmoiLCJNYXAiLCJTZXQiLCJrZXlzIiwiZ2V0TG9nZ2VyIiwic2V0RW5kcG9pbnQiLCJkaWZmIiwic3luY2VkIiwicmVTeW5jQ291bnQiLCJyZVN5bmMiLCJyb3VuZCIsImxvY2FsVGltZSIsInN5bmMiLCJjYWNoZURucyIsImFyZ3VtZW50cyIsImdldFNlcnZlclRpbWUiLCJjYWxjdWxhdGVUaW1lRGlmZiIsImNsaWVudFN0YXJ0VGltZSIsInNlcnZlclRpbWUiLCJuZXR3b3JrVGltZSIsInNlcnZlclN0YXJ0VGltZSIsIm5vUmV0cmllcyIsInBhcnNlSW50IiwicmFuZG9tIiwiY2FuTG9nS2FkaXJhIiwiX2xvY2FsU3RvcmFnZSIsImdldEl0ZW0iLCJsb2ciLCJ1cmwiLCJmcyIsImNsaWVudFBhdGhzIiwiX19tZXRlb3JfYm9vdHN0cmFwX18iLCJjb25maWdKc29uIiwiY2xpZW50QXJjaHMiLCJzZXJ2ZXJEaXIiLCJhYnNDbGllbnRQYXRocyIsInJlZHVjZSIsInJlc3VsdCIsInJlc29sdmUiLCJkaXJuYW1lIiwiaGFuZGxlQXBpUmVzcG9uc2UiLCJib2R5IiwidW5hdmFpbGFibGUiLCJwYXJzZSIsImUiLCJuZWVkZWRTb3VyY2VtYXBzIiwicHJvbWlzZXMiLCJzb3VyY2VtYXAiLCJ1cGxvYWRTb3VyY2VNYXBzIiwiZ2V0U291cmNlbWFwUGF0aCIsImZpbGUiLCJzb3VyY2VNYXBQYXRoIiwic2VuZFNvdXJjZW1hcCIsIlByb21pc2UiLCJhbGwiLCJzZW5kRGF0YSIsInVuYXZhaWxhYmxlU291cmNlbWFwcyIsInNvdXJjZW1hcFBhdGgiLCJzdHJlYW0iLCJjcmVhdGVSZWFkU3RyZWFtIiwiYXJjaFZlcnNpb24iLCJlbmNvZGVVUklDb21wb25lbnQiLCJzZW5kU3RyZWFtIiwicHJlcGFyZVBhdGgiLCJ1cmxQYXRoIiwicG9zaXgiLCJub3JtYWxpemUiLCJjaGVja0ZvckR5bmFtaWNJbXBvcnQiLCJmaWxlUGF0aCIsImFyY2hQYXRoIiwiZHluYW1pY1BhdGgiLCJzdGF0IiwicmVqZWN0IiwiY2xpZW50UHJvZ3JhbSIsIldlYkFwcCIsImNsaWVudFByb2dyYW1zIiwibWFuaWZlc3QiLCJmaWxlSW5mbyIsImZpbmQiLCJzdGFydHNXaXRoIiwic291cmNlTWFwIiwiV0FJVE9OX01FU1NBR0VfRklFTERTIiwiV2FpdFRpbWVCdWlsZGVyIiwiX3dhaXRMaXN0U3RvcmUiLCJfY3VycmVudFByb2Nlc3NpbmdNZXNzYWdlcyIsIl9tZXNzYWdlQ2FjaGUiLCJyZWdpc3RlciIsIm1zZ0lkIiwibWFpbktleSIsIl9nZXRNZXNzYWdlS2V5IiwiaW5RdWV1ZSIsInRvQXJyYXkiLCJ3YWl0TGlzdCIsIl9nZXRDYWNoZU1lc3NhZ2UiLCJjdXJyZW50bHlQcm9jZXNzaW5nTWVzc2FnZSIsImJ1aWxkIiwiZmlsdGVyZWRXYWl0TGlzdCIsIl9jbGVhbkNhY2hlTWVzc2FnZSIsImJpbmQiLCJzZXNzaW9uSWQiLCJjYWNoZWRNZXNzYWdlIiwicGljayIsIl9rZXkiLCJfcmVnaXN0ZXJlZCIsInRyYWNrV2FpdFRpbWUiLCJ1bmJsb2NrIiwic3RhcnRlZCIsInVuYmxvY2tlZCIsIndyYXBwZWRVbmJsb2NrIiwid2FpdFRpbWUiLCJPcGxvZ0NoZWNrIiwiXzA3MCIsImN1cnNvckRlc2NyaXB0aW9uIiwibGltaXQiLCJjb2RlIiwicmVhc29uIiwic29sdXRpb24iLCJleGlzdHMkIiwiYW55Iiwic2VsZWN0b3IiLCJvbmx5U2NhbGVycyIsIkNvbGxlY3Rpb24iLCJPYmplY3RJRCIsIl8wNzEiLCJtYXRjaGVyIiwiTWluaW1vbmdvIiwiTWF0Y2hlciIsImVudiIsIk1PTkdPX09QTE9HX1VSTCIsImRpc2FibGVPcGxvZyIsIl9kaXNhYmxlT3Bsb2ciLCJtaW5pTW9uZ29NYXRjaGVyIiwibWluaU1vbmdvU29ydGVyIiwiU29ydGVyIiwic29ydCIsInNvcnRlciIsImZpZWxkcyIsIkxvY2FsQ29sbGVjdGlvbiIsIl9jaGVja1N1cHBvcnRlZFByb2plY3Rpb24iLCJza2lwIiwid2hlcmUiLCJoYXNXaGVyZSIsImdlbyIsImhhc0dlb1F1ZXJ5IiwibGltaXRCdXROb1NvcnQiLCJvbGRlclZlcnNpb24iLCJkcml2ZXIiLCJjdXJzb3JTdXBwb3J0ZWQiLCJnaXRDaGVja291dCIsInJlbGVhc2UiLCJwcmVSdW5uaW5nTWF0Y2hlcnMiLCJnbG9iYWxNYXRjaGVycyIsInZlcnNpb25NYXRjaGVycyIsImNoZWNrV2h5Tm9PcGxvZyIsIm9ic2VydmVyRHJpdmVyIiwicnVuTWF0Y2hlcnMiLCJtZXRlb3JWZXJzaW9uIiwibWF0Y2hlckluZm8iLCJtYXRjaGVkIiwibWF0Y2hlckxpc3QiLCJldmVudExvZ2dlciIsIlJFUEVUSVRJVkVfRVZFTlRTIiwiVFJBQ0VfVFlQRVMiLCJNQVhfVFJBQ0VfRVZFTlRTIiwiVHJhY2VyIiwiX2ZpbHRlckZpZWxkcyIsIm1heEFycmF5SXRlbXNUb0ZpbHRlciIsInVzZXJJZCIsInRyYWNlSW5mbyIsIl9pZCIsImV2ZW50IiwibWV0YURhdGEiLCJsYXN0RXZlbnQiLCJnZXRMYXN0RXZlbnQiLCJpc0V2ZW50c1Byb2Nlc3NlZCIsImVuZEF0IiwibmVzdGVkIiwiX2FwcGx5RmlsdGVycyIsImV2ZW50U3RhY2tUcmFjZSIsImRpciIsImRlcHRoIiwibGFzdE5lc3RlZCIsImV2ZW50RW5kIiwiZW5kTGFzdEV2ZW50IiwiZm9yY2VkRW5kIiwiX2hhc1VzZWZ1bE5lc3RlZCIsImV2ZXJ5IiwiYnVpbGRFdmVudCIsImVsYXBzZWRUaW1lRm9yRXZlbnQiLCJidWlsdEV2ZW50IiwicHJldkVuZCIsImkiLCJuZXN0ZWRFdmVudCIsImNvbXB1dGVUaW1lIiwidW5kZWZpbmVkIiwiYnVpbGRUcmFjZSIsImZpcnN0RXZlbnQiLCJwcm9jZXNzZWRFdmVudHMiLCJ0b3RhbE5vbkNvbXB1dGUiLCJwcmV2RXZlbnQiLCJsYXN0RXZlbnREYXRhIiwicmVtb3ZlQ291bnQiLCJjb21wdXRlIiwiZmlsdGVyRm4iLCJyZWRhY3RGaWVsZCIsImV2ZW50VHlwZSIsImNsb25lIiwiX2FwcGx5T2JqZWN0RmlsdGVycyIsInRvRmlsdGVyIiwiZmlsdGVyT2JqZWN0IiwiY2xvbmVkIiwiQXJyYXkiLCJpc0FycmF5IiwidHJhY2VyIiwic3RyaXBTZW5zaXRpdmUiLCJ0eXBlc1RvU3RyaXAiLCJyZWNlaXZlclR5cGUiLCJzdHJpcHBlZFR5cGVzIiwiaXRlbSIsInN0cmlwU2Vuc2l0aXZlVGhvcm91Z2giLCJmaWVsZHNUb0tlZXAiLCJzdHJpcFNlbGVjdG9ycyIsImNvbGxlY3Rpb25MaXN0IiwiY29sbE1hcCIsImNvbGxOYW1lIiwiY29sbCIsIm1heFRvdGFscyIsImN1cnJlbnRNYXhUcmFjZSIsInRyYWNlQXJjaGl2ZSIsInByb2Nlc3NlZENudCIsImtpbmQiLCJFSlNPTiIsIl9oYW5kbGVFcnJvcnMiLCJ0cmFjZXMiLCJfdGltZW91dEhhbmRsZXIiLCJwcm9jZXNzVHJhY2VzIiwic3RvcCIsImNsZWFySW50ZXJ2YWwiLCJlcnJvcktleSIsImVycm9yZWRUcmFjZSIsImtpbmRzIiwiY3VycmVudE1heFRvdGFsIiwiZXhjZWVkaW5nUG9pbnRzIiwiYXJjaGl2ZURlZmF1bHQiLCJjYW5BcmNoaXZlIiwiX2lzVHJhY2VPdXRsaWVyIiwiZGF0YVNldCIsIl9pc091dGxpZXIiLCJkYXRhUG9pbnQiLCJtYXhNYWRaIiwibWVkaWFuIiwiX2dldE1lZGlhbiIsIm1hZCIsIl9jYWxjdWxhdGVNYWQiLCJtYWRaIiwiX2Z1bmNNZWRpYW5EZXZpYXRpb24iLCJzb3J0ZWREYXRhU2V0IiwiYiIsIl9waWNrUXVhcnRpbGUiLCJudW0iLCJwb3MiLCJtZWRpYW5EZXZpYXRpb25zIiwieCIsImFicyIsIl9nZXRNZWFuIiwiZGF0YVBvaW50cyIsInBvaW50IiwiTFJVIiwiY3J5cHRvIiwianNvblN0cmluZ2lmeSIsIkRvY1N6Q2FjaGUiLCJtYXhJdGVtcyIsIm1heFZhbHVlcyIsIml0ZW1zIiwibWF4IiwiZ2V0U2l6ZSIsInF1ZXJ5Iiwib3B0cyIsImdldEtleSIsIkRvY1N6Q2FjaGVJdGVtIiwibmVlZHNVcGRhdGUiLCJkb2MiLCJlbGVtZW50IiwiQnVmZmVyIiwiYnl0ZUxlbmd0aCIsImFkZERhdGEiLCJnZXRWYWx1ZSIsImdldEl0ZW1TY29yZSIsInVwZGF0ZWQiLCJzY29yZSIsImN1cnJlbnRUaW1lIiwidGltZVNpbmNlVXBkYXRlIiwic2hpZnQiLCJzb3J0TnVtYmVyIiwic29ydGVkIiwiaWR4IiwiZmxvb3IiLCJwYWNrYWdlTWFwIiwiaG9zdG5hbWUiLCJGaWJlcnMiLCJLYWRpcmFDb3JlIiwibW9kZWxzIiwiY3VycmVudFN1YiIsImthZGlyYUluZm8iLCJFbnZpcm9ubWVudFZhcmlhYmxlIiwid2FpdFRpbWVCdWlsZGVyIiwicHVic3ViIiwiaHR0cCIsImNvbm5lY3QiLCJhcHBTZWNyZXQiLCJwYXlsb2FkVGltZW91dCIsImNsaWVudEVuZ2luZVN5bmNEZWxheSIsInRocmVzaG9sZHMiLCJpc0hvc3ROYW1lU2V0IiwicHJveHkiLCJyZWNvcmRJUEFkZHJlc3MiLCJkb2N1bWVudFNpemVDYWNoZVNpemUiLCJsYXN0IiwiZW5hYmxlRXJyb3JUcmFja2luZyIsImlzUHJvZHVjdGlvbiIsImF1dGhIZWFkZXJzIiwidHJpbSIsImFnZW50VmVyc2lvbiIsIl9jaGVja0F1dGgiLCJfc2VuZEFwcFN0YXRzIiwiX3NjaGVkdWxlUGF5bG9hZFNlbmQiLCJhZGRGaWx0ZXJGbiIsImthZGlyYSIsImRpc2FibGVFcnJvclRyYWNraW5nIiwic3RhcnR1cCIsIlRyYWNrVW5jYXVnaHRFeGNlcHRpb25zIiwiVHJhY2tVbmhhbmRsZWRSZWplY3Rpb25zIiwiVHJhY2tNZXRlb3JEZWJ1ZyIsInB1Ymxpc2giLCJhZGRlZCIsInJlYWR5IiwiX2J1aWxkUGF5bG9hZCIsImNsaWVudFZlcnNpb25zIiwiX2lzRGV0YWlsZWRJbmZvIiwiX2NvdW50RGF0YVNlbnQiLCJfZGV0YWlsSW5mb1NlbnRJbnRlcnZhbCIsImFwcFN0YXRzIiwicHJvdG9jb2xWZXJzaW9uIiwicGFja2FnZVZlcnNpb25zIiwiUGFja2FnZSIsIl9zZW5kUGF5bG9hZCIsInJ1biIsIl9nZXRJbmZvIiwiY3VycmVudEZpYmVyIiwidXNlRW52aXJvbm1lbnRWYXJpYWJsZSIsImN1cnJlbnQiLCJfX2thZGlyYUluZm8iLCJfc2V0SW5mbyIsInN0YXJ0Q29udGludW91c1Byb2ZpbGluZyIsIk1vbnRpUHJvZmlsZXIiLCJzdGFydENvbnRpbnVvdXMiLCJvblByb2ZpbGUiLCJwcm9maWxlIiwicHJvZmlsZXMiLCJpZ25vcmVFcnJvclRyYWNraW5nIiwiX3NraXBLYWRpcmEiLCJzdGFydEV2ZW50IiwiZW5kRXZlbnQiLCJGaWJlciIsIndyYXBTZXJ2ZXIiLCJzZXJ2ZXJQcm90byIsIm9yaWdpbmFsSGFuZGxlQ29ubmVjdCIsIl9oYW5kbGVDb25uZWN0IiwiX21ldGVvclNlc3Npb24iLCJlbWl0IiwiTWV0ZW9yRGVidWdJZ25vcmUiLCJNQVhfUEFSQU1TX0xFTkdUSCIsIndyYXBTZXNzaW9uIiwic2Vzc2lvblByb3RvIiwib3JpZ2luYWxQcm9jZXNzTWVzc2FnZSIsInByb2Nlc3NNZXNzYWdlIiwic3RyaW5naWZpZWRQYXJhbXMiLCJzdGFydERhdGEiLCJ3YWl0RXZlbnRJZCIsIl93YWl0RXZlbnRJZCIsIm9yaWdpbmFsTWV0aG9kSGFuZGxlciIsInByb3RvY29sX2hhbmRsZXJzIiwid2FpdE9uIiwicmVzcG9uc2UiLCJ3aXRoVmFsdWUiLCJvcmdpbmFsU3ViSGFuZGxlciIsIm9yZ2luYWxVblN1YkhhbmRsZXIiLCJ1bnN1YiIsIm9yaWdpbmFsU2VuZCIsImN1cnJlbnRFcnJvciIsIm1ldGhvZF9oYW5kbGVycyIsImhhbmRsZXIiLCJ3cmFwTWV0aG9kSGFuZGVyRm9yRXJyb3JzIiwib3JpZ2luYWxNZXRlb3JNZXRob2RzIiwibWV0aG9kTWFwIiwib3JpZ2luYWxIYW5kbGVyIiwic291cmNlIiwid3JhcFN1YnNjcmlwdGlvbiIsInN1YnNjcmlwdGlvblByb3RvIiwib3JpZ2luYWxSdW5IYW5kbGVyIiwiX3J1bkhhbmRsZXIiLCJvcmlnaW5hbFJlYWR5IiwiX2FwbVJlYWR5VHJhY2tlZCIsIl9zZXNzaW9uIiwib3JpZ2luYWxFcnJvciIsImVycm9yRm9yQXBtIiwib3JpZ2luYWxEZWFjdGl2YXRlIiwiX2RlYWN0aXZhdGUiLCJmdW5jTmFtZSIsIm9yaWdpbmFsRnVuYyIsImNvbGxlY3Rpb25OYW1lIiwid3JhcE9wbG9nT2JzZXJ2ZURyaXZlciIsInByb3RvIiwib3JpZ2luYWxQdWJsaXNoTmV3UmVzdWx0cyIsIl9wdWJsaXNoTmV3UmVzdWx0cyIsIm5ld1Jlc3VsdHMiLCJuZXdCdWZmZXIiLCJfY3Vyc29yRGVzY3JpcHRpb24iLCJkb2NTaXplIiwiX293bmVySW5mbyIsIl9wb2xsZWREb2N1bWVudHMiLCJfZG9jU2l6ZSIsInBvbGxlZEZldGNoZXMiLCJvcmlnaW5hbEhhbmRsZU9wbG9nRW50cnlRdWVyeWluZyIsIl9oYW5kbGVPcGxvZ0VudHJ5UXVlcnlpbmciLCJvcmlnaW5hbEhhbmRsZU9wbG9nRW50cnlTdGVhZHlPckZldGNoaW5nIiwiX2hhbmRsZU9wbG9nRW50cnlTdGVhZHlPckZldGNoaW5nIiwiZm5OYW1lIiwib3JpZ2luYWxGbiIsImMiLCJfbGl2ZVVwZGF0ZXNDb3VudHMiLCJfaW5pdGlhbEFkZHMiLCJpbml0aWFsRmV0Y2hlcyIsIm9yaWdpbmFsU3RvcCIsIndyYXBQb2xsaW5nT2JzZXJ2ZURyaXZlciIsIm9yaWdpbmFsUG9sbE1vbmdvIiwiX3BvbGxNb25nbyIsIl9yZXN1bHRzIiwiX21hcCIsIl9wb2xsZWREb2NTaXplIiwid3JhcE11bHRpcGxleGVyIiwib3JpZ2luYWxJbml0YWxBZGQiLCJhZGRIYW5kbGVBbmRTZW5kSW5pdGlhbEFkZHMiLCJoYW5kbGUiLCJfZmlyc3RJbml0aWFsQWRkVGltZSIsIl93YXNNdWx0aXBsZXhlclJlYWR5IiwiX3JlYWR5IiwiX3F1ZXVlTGVuZ3RoIiwiX3F1ZXVlIiwiX3Rhc2tIYW5kbGVzIiwiX2VsYXBzZWRQb2xsaW5nVGltZSIsIndyYXBGb3JDb3VudGluZ09ic2VydmVycyIsIm1vbmdvQ29ubmVjdGlvblByb3RvIiwiTWV0ZW9yWCIsIk1vbmdvQ29ubmVjdGlvbiIsIm9yaWdpbmFsT2JzZXJ2ZUNoYW5nZXMiLCJfb2JzZXJ2ZUNoYW5nZXMiLCJvcmRlcmVkIiwiY2FsbGJhY2tzIiwicmV0IiwiX211bHRpcGxleGVyIiwiX19rYWRpcmFUcmFja2VkIiwib3duZXJJbmZvIiwiX29ic2VydmVEcml2ZXIiLCJ3cmFwU3RyaW5naWZ5RERQIiwib3JpZ2luYWxTdHJpbmdpZnlERFAiLCJERFBDb21tb24iLCJzdHJpbmdpZnlERFAiLCJtc2dTdHJpbmciLCJtc2dTaXplIiwid3JhcFdlYkFwcCIsIndyYXBGYXN0UmVuZGVyIiwid3JhcEZzIiwid3JhcFBpY2tlciIsIndyYXBSb3V0ZXJzIiwiaW5zdHJ1bWVudGVkIiwiX3N0YXJ0SW5zdHJ1bWVudGluZyIsIm9uUmVhZHkiLCJTZXJ2ZXIiLCJTZXNzaW9uIiwiU3Vic2NyaXB0aW9uIiwiTW9uZ29PcGxvZ0RyaXZlciIsIk1vbmdvUG9sbGluZ0RyaXZlciIsIk11bHRpcGxleGVyIiwiaGlqYWNrREJPcHMiLCJzZXRMYWJlbHMiLCJvcmlnaW5hbE9wZW4iLCJNb25nb0ludGVybmFscyIsIlJlbW90ZUNvbGxlY3Rpb25Ecml2ZXIiLCJvcGVuIiwibW9uZ28iLCJnZXRTeW5jcm9ub3VzQ3Vyc29yIiwiTW9uZ29Db2xsIiwiTW9uZ28iLCJmaW5kT25lIiwiY3Vyc29yIiwiZmV0Y2giLCJfc3luY2hyb25vdXNDdXJzb3IiLCJmdW5jIiwibW9kIiwidXBzZXJ0IiwiZXZlbnRJZCIsImVuZE9wdGlvbnMiLCJhc3luYyIsInVwZGF0ZWREb2NzIiwibnVtYmVyQWZmZWN0ZWQiLCJpbnNlcnRlZElkIiwicmVtb3ZlZERvY3MiLCJjdXJzb3JQcm90byIsIk1vbmdvQ3Vyc29yIiwiY3Vyc29yT3B0aW9ucyIsInByZXZpb3VzVHJhY2tOZXh0T2JqZWN0IiwidHJhY2tOZXh0T2JqZWN0IiwiZW5kRGF0YSIsIm9wbG9nIiwid2FzTXVsdGlwbGV4ZXJSZWFkeSIsInF1ZXVlTGVuZ3RoIiwiZWxhcHNlZFBvbGxpbmdUaW1lIiwib2JzZXJ2ZXJEcml2ZXJDbGFzcyIsInVzZXNPcGxvZyIsIl9jYWNoZSIsImRvY3MiLCJub09mQ2FjaGVkRG9jcyIsImluaXRpYWxQb2xsaW5nVGltZSIsIl9sYXN0UG9sbFRpbWUiLCJyZWFzb25JbmZvIiwibm9PcGxvZ0NvZGUiLCJub09wbG9nUmVhc29uIiwibm9PcGxvZ1NvbHV0aW9uIiwiZG9jc0ZldGNoZWQiLCJTeW5jcm9ub3VzQ3Vyc29yIiwib3JpZ05leHRPYmplY3QiLCJfbmV4dE9iamVjdCIsInNob3VsZFRyYWNrIiwib3JpZ2luYWxDYWxsIiwiSFRUUCIsIkVtYWlsIiwiRXZlbnRTeW1ib2wiLCJTeW1ib2wiLCJTdGFydFRyYWNrZWQiLCJvcmlnaW5hbFlpZWxkIiwieWllbGQiLCJvcmlnaW5hbFJ1biIsIm9yaWdpbmFsVGhyb3dJbnRvIiwidGhyb3dJbnRvIiwiZW5zdXJlRmliZXJDb3VudGVkIiwiZmliZXIiLCJ2YWwiLCJhY3RpdmVGaWJlclRvdGFsIiwiYWN0aXZlRmliZXJDb3VudCIsInByZXZpb3VzVG90YWxDcmVhdGVkIiwiZmliZXJzQ3JlYXRlZCIsInByaW50RXJyb3JBbmRLaWxsIiwiX3RyYWNrZWQiLCJnZXRUcmFjZSIsInRpbWVyIiwidGhyb3dFcnJvciIsIm5leHRUaWNrIiwiZXhpdCIsIm9yaWdpbmFsTWV0ZW9yRGVidWciLCJfZGVidWciLCJpc0FyZ3MiLCJhbHJlYWR5VHJhY2tlZCIsImVycm9yTWVzc2FnZSIsInNlcGFyYXRvciIsImVuZHNXaXRoIiwia2FkaXJhX1Nlc3Npb25fc2VuZCIsIm9yaWdpbmFsU2VuZEFkZHMiLCJfc2VuZEFkZHMiLCJrYWRpcmFfTXVsdGlwbGV4ZXJfc2VuZEFkZHMiLCJvcmlnaW5hbE1vbmdvSW5zZXJ0IiwiX2luc2VydCIsImthZGlyYV9Nb25nb0Nvbm5lY3Rpb25faW5zZXJ0IiwiY2IiLCJvcmlnaW5hbE1vbmdvVXBkYXRlIiwiX3VwZGF0ZSIsImthZGlyYV9Nb25nb0Nvbm5lY3Rpb25fdXBkYXRlIiwib3JpZ2luYWxNb25nb1JlbW92ZSIsIl9yZW1vdmUiLCJrYWRpcmFfTW9uZ29Db25uZWN0aW9uX3JlbW92ZSIsIm9yaWdpbmFsUHVic3ViQWRkZWQiLCJzZW5kQWRkZWQiLCJrYWRpcmFfU2Vzc2lvbl9zZW5kQWRkZWQiLCJvcmlnaW5hbFB1YnN1YkNoYW5nZWQiLCJzZW5kQ2hhbmdlZCIsImthZGlyYV9TZXNzaW9uX3NlbmRDaGFuZ2VkIiwib3JpZ2luYWxQdWJzdWJSZW1vdmVkIiwic2VuZFJlbW92ZWQiLCJrYWRpcmFfU2Vzc2lvbl9zZW5kUmVtb3ZlZCIsIm9yaWdpbmFsQ3Vyc29yRm9yRWFjaCIsImthZGlyYV9DdXJzb3JfZm9yRWFjaCIsIm9yaWdpbmFsQ3Vyc29yTWFwIiwia2FkaXJhX0N1cnNvcl9tYXAiLCJvcmlnaW5hbEN1cnNvckZldGNoIiwia2FkaXJhX0N1cnNvcl9mZXRjaCIsIm9yaWdpbmFsQ3Vyc29yQ291bnQiLCJrYWRpcmFfQ3Vyc29yX2NvdW50Iiwib3JpZ2luYWxDdXJzb3JPYnNlcnZlQ2hhbmdlcyIsIm9ic2VydmVDaGFuZ2VzIiwia2FkaXJhX0N1cnNvcl9vYnNlcnZlQ2hhbmdlcyIsIm9yaWdpbmFsQ3Vyc29yT2JzZXJ2ZSIsIm9ic2VydmUiLCJrYWRpcmFfQ3Vyc29yX29ic2VydmUiLCJvcmlnaW5hbENyb3NzYmFyTGlzdGVuIiwiRERQU2VydmVyIiwiX0Nyb3NzYmFyIiwibGlzdGVuIiwia2FkaXJhX0Nyb3NzYmFyX2xpc3RlbiIsInRyaWdnZXIiLCJvcmlnaW5hbENyb3NzYmFyRmlyZSIsImZpcmUiLCJrYWRpcmFfQ3Jvc3NiYXJfZmlyZSIsIm5vdGlmaWNhdGlvbiIsIkZhc3RSZW5kZXIiLCJvcmlnUm91dGUiLCJyb3V0ZSIsIl9jYWxsYmFjayIsInN1Z2dlc3RlZFJvdXRlTmFtZSIsImhhbmRsZUVycm9yRXZlbnQiLCJ3cmFwQ2FsbGJhY2siLCJjcmVhdGVXcmFwcGVyIiwiZXZlbnRFbWl0dGVyIiwibGlzdGVuZXJDb3VudCIsInJlbW92ZUxpc3RlbmVyIiwiZnNLYWRpcmFJbmZvIiwib3JpZ2luYWxTdGF0Iiwib3JpZ2luYWxDcmVhdGVSZWFkU3RyZWFtIiwiUGVyZm9ybWFuY2VPYnNlcnZlciIsImNvbnN0YW50cyIsIl9vYnNlcnZlciIsIm9ic2VydmVyIiwibGlzdCIsImdldEVudHJpZXMiLCJfbWFwS2luZFRvTWV0cmljIiwiZHVyYXRpb24iLCJlbnRyeVR5cGVzIiwiYnVmZmVyZWQiLCJnY0tpbmQiLCJOT0RFX1BFUkZPUk1BTkNFX0dDX01BSk9SIiwiTk9ERV9QRVJGT1JNQU5DRV9HQ19NSU5PUiIsIk5PREVfUEVSRk9STUFOQ0VfR0NfSU5DUkVNRU5UQUwiLCJOT0RFX1BFUkZPUk1BTkNFX0dDX1dFQUtDQiIsImNsaWVudCIsInNlcnZlclN0YXR1cyIsInRvdGFsQ2hlY2tvdXRUaW1lIiwibWVhc3VyZW1lbnRDb3VudCIsInBlbmRpbmdUb3RhbCIsImNoZWNrZWRPdXRUb3RhbCIsImdldFNlcnZlclN0YXR1cyIsImdldFByaW1hcnkiLCJERUZBVUxUX01BWF9QT09MX1NJWkUiLCJnZXRQb29sU2l6ZSIsInRvcG9sb2d5IiwicyIsIm1heFBvb2xTaXplIiwiX2NsaWVudCIsImRlZmF1bHRSZW1vdGVDb2xsZWN0aW9uRHJpdmVyIiwidXNlVW5pZmllZFRvcG9sb2d5IiwicHJpbWFyeURlc2NyaXB0aW9uIiwiZ2V0U2VydmVyRGVzY3JpcHRpb24iLCJwb29sIiwidG90YWxDb25uZWN0aW9ucyIsInRvdGFsQ29ubmVjdGlvbkNvdW50IiwiYXZhaWxhYmxlQ29ubmVjdGlvbnMiLCJhdmFpbGFibGVDb25uZWN0aW9uQ291bnQiLCJwcmltYXJ5IiwiZGVsZXRlIiwiY29ubmVjdGlvbklkIiwiY2hlY2tvdXREdXJhdGlvbiIsImRpc2FibGVDcmVhdGUiLCJsYXN0SXNNYXN0ZXIiLCJzZXJ2ZXJzIiwiZGVzY3JpcHRpb24iLCJQaWNrZXIiLCJvcmlnUHJvY2Vzc1JvdXRlIiwiX3Byb2Nlc3NSb3V0ZSIsImNvbm5lY3RSb3V0ZXMiLCJjb25uZWN0Um91dGUiLCJyb3V0ZXIiLCJvbGRBZGQiLCJjaGVja0hhbmRsZXJzSW5GaWJlciIsIldlYkFwcEludGVybmFscyIsIk1BWF9CT0RZX1NJWkUiLCJNQVhfU1RSSU5HSUZJRURfQk9EWV9TSVpFIiwiY2FuV3JhcFN0YXRpY0hhbmRsZXIiLCJzdGF0aWNGaWxlc0J5QXJjaCIsImhhbmRsZXJzTGVuZ3RoIiwicmF3Q29ubmVjdEhhbmRsZXJzIiwiaW5GaWJlciIsIm91dHNpZGVGaWJlciIsInVzZSIsIl9yZXEiLCJfcmVzIiwibmV4dCIsInBvcCIsIkluZm9TeW1ib2wiLCJwYXJzZVVybCIsInJlZ2lzdGVyQm9pbGVycGxhdGVEYXRhQ2FsbGJhY2siLCJyZXF1ZXN0IiwiaXNBcHBSb3V0ZSIsIm9yaWdDYXRlZ29yaXplUmVxdWVzdCIsImNhdGVnb3JpemVSZXF1ZXN0IiwicGF0aG5hbWUiLCJhc3luY0V2ZW50IiwiaXNTdGF0aWMiLCJpc0pzb24iLCJoYXNTbWFsbEJvZHkiLCJidWlsdCIsIndyYXBIYW5kbGVyIiwiZXJyb3JIYW5kbGVyIiwid3JhcHBlciIsIm5leHRDYWxsZWQiLCJ3cmFwcGVkTmV4dCIsInBvdGVudGlhbFByb21pc2UiLCJmaW5pc2hlZCIsIndyYXBDb25uZWN0IiwiYXBwIiwid3JhcFN0YWNrIiwib2xkVXNlIiwid3JhcHBlZEhhbmRsZXIiLCJhc3luY0FwcGx5IiwibWV0ZW9ySW50ZXJuYWxIYW5kbGVycyIsImNvbm5lY3RIYW5kbGVycyIsImNvbm5lY3RBcHAiLCJvbGRTdGF0aWNGaWxlc01pZGRsZXdhcmUiLCJzdGF0aWNGaWxlc01pZGRsZXdhcmUiLCJzdGF0aWNIYW5kbGVyIiwiX3N0YXRpY0ZpbGVzIiwibm9ybWFsaXplZFByZWZpeCIsInJlcGxhY2UiLCJfcGFyc2VFbnYiLCJub3JtYWxpemVkTmFtZSIsIl9vcHRpb25zIiwicGFyc2VyIiwic3RyIiwicGFyc2VCb29sIiwidG9Mb3dlckNhc2UiLCJwYXJzZVN0cmluZyIsIk1PTlRJX0FQUF9JRCIsIk1PTlRJX0FQUF9TRUNSRVQiLCJNT05USV9PUFRJT05TX0NMSUVOVF9FTkdJTkVfU1lOQ19ERUxBWSIsIk1PTlRJX09QVElPTlNfRVJST1JfRFVNUF9JTlRFUlZBTCIsIk1PTlRJX09QVElPTlNfTUFYX0VSUk9SU19QRVJfSU5URVJWQUwiLCJNT05USV9PUFRJT05TX0NPTExFQ1RfQUxMX1NUQUNLUyIsIk1PTlRJX09QVElPTlNfRU5BQkxFX0VSUk9SX1RSQUNLSU5HIiwiTU9OVElfT1BUSU9OU19FTkRQT0lOVCIsIk1PTlRJX09QVElPTlNfSE9TVE5BTUUiLCJNT05USV9PUFRJT05TX1BBWUxPQURfVElNRU9VVCIsIk1PTlRJX09QVElPTlNfUFJPWFkiLCJNT05USV9PUFRJT05TX0RPQ1VNRU5UX1NJWkVfQ0FDSEVfU0laRSIsIk1PTlRJX1VQTE9BRF9TT1VSQ0VfTUFQUyIsIk1PTlRJX1JFQ09SRF9JUF9BRERSRVNTIiwiTU9OVElfRVZFTlRfU1RBQ0tfVFJBQ0UiLCJfY29ubmVjdFdpdGhFbnYiLCJfY29ubmVjdFdpdGhTZXR0aW5ncyIsIm1vbnRpU2V0dGluZ3MiLCJzZXR0aW5ncyIsIm1vbnRpIiwiY29uZmxpY3RpbmdQYWNrYWdlcyJdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7O0FBQUFBLG9CQUFvQixHQUFHLFVBQVVDLElBQVYsRUFBZ0I7QUFDckMsUUFBTUMsVUFBVSxHQUFHQyx5QkFBeUIsQ0FBQ0QsVUFBN0M7O0FBRUEsTUFB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LENBQzFCLHNCQUQwQixFQUUxQixpQkFGMEIsRUFHMUIsb0JBSDBCLENBQTVCO0FBTUF2b0MsTUFBTSxDQUFDMHRCLE9BQVAsQ0FBZSxNQUFNO0FBQ25CNmEscUJBQW1CLENBQUN4bkMsT0FBcEIsQ0FBNkJxRyxJQUFELElBQVU7QUFDcEMsUUFBSUEsSUFBSSxJQUFJcW5CLE9BQVosRUFBcUI7QUFDbkJ6ckIsYUFBTyxDQUFDNFgsR0FBUiw0Q0FBZ0R4VCxJQUFoRDtBQUNEO0FBQ0YsR0FKRDtBQUtELENBTkQsRSIsImZpbGUiOiIvcGFja2FnZXMvbW9udGlhcG1fYWdlbnQuanMiLCJzb3VyY2VzQ29udGVudCI6WyJnZXRDbGllbnRBcmNoVmVyc2lvbiA9IGZ1bmN0aW9uIChhcmNoKSB7XG4gIGNvbnN0IGF1dG91cGRhdGUgPSBfX21ldGVvcl9ydW50aW1lX2NvbmZpZ19fLmF1dG91cGRhdGVcblxuICBpZiAoYXV0b3VwZGF0ZSkge1xuICAgIHJldHVybiBhdXRvdXBkYXRlLnZlcnNpb25zW2FyY2hdID8gYXV0b3VwZGF0ZS52ZXJzaW9uc1thcmNoXS52ZXJzaW9uIDogJ25vbmUnO1xuICB9XG5cbiAgLy8gTWV0ZW9yIDEuNyBhbmQgb2xkZXIgZGlkIG5vdCBoYXZlIGFuIGBhdXRvdXBkYXRlYCBvYmplY3QuXG4gIHN3aXRjaCAoYXJjaCkge1xuICAgIGNhc2UgJ2NvcmRvdmEud2ViJzpcbiAgICAgIHJldHVybiBfX21ldGVvcl9ydW50aW1lX2NvbmZpZ19fLmF1dG91cGRhdGVWZXJzaW9uQ29yZG92YTtcbiAgICBjYXNlICd3ZWIuYnJvd3Nlcic6XG4gICAgY2FzZSAnd2ViLmJyb3dzZXIubGVnYWN5JzpcbiAgICAgIC8vIE1ldGVvciAxLjcgYWx3YXlzIHVzZWQgdGhlIHdlYi5icm93c2VyLmxlZ2FjeSB2ZXJzaW9uXG4gICAgICByZXR1cm4gX19tZXRlb3JfcnVudGltZV9jb25maWdfXy5hdXRvdXBkYXRlVmVyc2lvbjtcblxuICAgIGRlZmF1bHQ6XG4gICAgICByZXR1cm4gJ25vbmUnO1xuICB9XG59XG4iLCJLYWRpcmEgPSB7fTtcbkthZGlyYS5vcHRpb25zID0ge307XG5cbk1vbnRpID0gS2FkaXJhO1xuXG5pZihNZXRlb3Iud3JhcEFzeW5jKSB7XG4gIEthZGlyYS5fd3JhcEFzeW5jID0gTWV0ZW9yLndyYXBBc3luYztcbn0gZWxzZSB7XG4gIEthZGlyYS5fd3JhcEFzeW5jID0gTWV0ZW9yLl93cmFwQXN5bmM7XG59XG5cbmlmKE1ldGVvci5pc1NlcnZlcikge1xuICB2YXIgRXZlbnRFbWl0dGVyID0gTnBtLnJlcXVpcmUoJ2V2ZW50cycpLkV2ZW50RW1pdHRlcjtcbiAgdmFyIGV2ZW50QnVzID0gbmV3IEV2ZW50RW1pdHRlcigpO1xuICBldmVudEJ1cy5zZXRNYXhMaXN0ZW5lcnMoMCk7XG5cbiAgdmFyIGJ1aWxkQXJncyA9IGZ1bmN0aW9uKGFyZ3MpIHtcbiAgICB2YXIgZXZlbnROYW1lID0gYXJnc1swXSArICctJyArIGFyZ3NbMV07XG4gICAgdmFyIGFyZ3MgPSBhcmdzLnNsaWNlKDIpO1xuICAgIGFyZ3MudW5zaGlmdChldmVudE5hbWUpO1xuICAgIHJldHVybiBhcmdzO1xuICB9O1xuICBcbiAgS2FkaXJhLkV2ZW50QnVzID0ge307XG4gIFsnb24nLCAnZW1pdCcsICdyZW1vdmVMaXN0ZW5lcicsICdyZW1vdmVBbGxMaXN0ZW5lcnMnXS5mb3JFYWNoKGZ1bmN0aW9uKG0pIHtcbiAgICBLYWRpcmEuRXZlbnRCdXNbbV0gPSBmdW5jdGlvbiguLi5hcmdzKSB7XG4gICAgICB2YXIgYXJncyA9IGJ1aWxkQXJncyhhcmdzKTtcbiAgICAgIHJldHVybiBldmVudEJ1c1ttXS5hcHBseShldmVudEJ1cywgYXJncyk7XG4gICAgfTtcbiAgfSk7XG59IiwidmFyIGNvbW1vbkVyclJlZ0V4cHMgPSBbXG4gIC9jb25uZWN0aW9uIHRpbWVvdXRcXC4gbm8gKFxcdyopIGhlYXJ0YmVhdCByZWNlaXZlZC9pLFxuICAvSU5WQUxJRF9TVEFURV9FUlIvaSxcbl07XG5cbkthZGlyYS5lcnJvckZpbHRlcnMgPSB7XG4gIGZpbHRlclZhbGlkYXRpb25FcnJvcnM6IGZ1bmN0aW9uKHR5cGUsIG1lc3NhZ2UsIGVycikge1xuICAgIGlmKGVyciAmJiBlcnIgaW5zdGFuY2VvZiBNZXRlb3IuRXJyb3IpIHtcbiAgICAgIHJldHVybiBmYWxzZTtcbiAgICB9IGVsc2Uge1xuICAgICAgcmV0dXJuIHRydWU7XG4gICAgfVxuICB9LFxuXG4gIGZpbHRlckNvbW1vbk1ldGVvckVycm9yczogZnVuY3Rpb24odHlwZSwgbWVzc2FnZSkge1xuICAgIGZvcih2YXIgbGM9MDsgbGM8Y29tbW9uRXJyUmVnRXhwcy5sZW5ndGg7IGxjKyspIHtcbiAgICAgIHZhciByZWdFeHAgPSBjb21tb25FcnJSZWdFeHBzW2xjXTtcbiAgICAgIGlmKHJlZ0V4cC50ZXN0KG1lc3NhZ2UpKSB7XG4gICAgICAgIHJldHVybiBmYWxzZTtcbiAgICAgIH1cbiAgICB9XG4gICAgcmV0dXJuIHRydWU7XG4gIH1cbn07IiwiS2FkaXJhLnNlbmQgPSBmdW5jdGlvbiAocGF5bG9hZCwgcGF0aCwgY2FsbGJhY2spIHtcbiAgaWYoIUthZGlyYS5jb25uZWN0ZWQpICB7XG4gICAgdGhyb3cgbmV3IEVycm9yKFwiWW91IG5lZWQgdG8gY29ubmVjdCB3aXRoIEthZGlyYSBmaXJzdCwgYmVmb3JlIHNlbmRpbmcgbWVzc2FnZXMhXCIpO1xuICB9XG5cbiAgcGF0aCA9IChwYXRoLnN1YnN0cigwLCAxKSAhPSAnLycpPyBcIi9cIiArIHBhdGggOiBwYXRoO1xuICB2YXIgZW5kcG9pbnQgPSBLYWRpcmEub3B0aW9ucy5lbmRwb2ludCArIHBhdGg7XG4gIHZhciByZXRyeUNvdW50ID0gMDtcbiAgdmFyIHJldHJ5ID0gbmV3IFJldHJ5KHtcbiAgICBtaW5Db3VudDogMSxcbiAgICBtaW5UaW1lb3V0OiAwLFxuICAgIGJhc2VUaW1lb3V0OiAxMDAwKjUsXG4gICAgbWF4VGltZW91dDogMTAwMCo2MCxcbiAgfSk7XG5cbiAgdmFyIHNlbmRGdW5jdGlvbiA9IEthZGlyYS5fZ2V0U2VuZEZ1bmN0aW9uKCk7XG4gIHRyeVRvU2VuZCgpO1xuXG4gIGZ1bmN0aW9uIHRyeVRvU2VuZChlcnIpIHtcbiAgICBpZihyZXRyeUNvdW50IDwgNSkge1xuICAgICAgcmV0cnkucmV0cnlMYXRlcihyZXRyeUNvdW50KyssIHNlbmQpO1xuICAgIH0gZWxzZSB7XG4gICAgICBjb25zb2xlLndhcm4oJ0Vycm9yIHNlbmRpbmcgZXJyb3IgdHJhY2VzIHRvIE1vbnRpIEFQTSBzZXJ2ZXInKTtcbiAgICAgIGlmKGNhbGxiYWNrKSBjYWxsYmFjayhlcnIpO1xuICAgIH1cbiAgfVxuXG4gIGZ1bmN0aW9uIHNlbmQoKSB7XG4gICAgc2VuZEZ1bmN0aW9uKGVuZHBvaW50LCBwYXlsb2FkLCBmdW5jdGlvbihlcnIsIHJlcykge1xuICAgICAgaWYoZXJyICYmICFyZXMpIHtcbiAgICAgICAgdHJ5VG9TZW5kKGVycik7XG4gICAgICB9IGVsc2UgaWYocmVzLnN0YXR1c0NvZGUgPT0gMjAwKSB7XG4gICAgICAgIGlmKGNhbGxiYWNrKSBjYWxsYmFjayhudWxsLCByZXMuZGF0YSk7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICBpZihjYWxsYmFjaykgY2FsbGJhY2sobmV3IE1ldGVvci5FcnJvcihyZXMuc3RhdHVzQ29kZSwgcmVzLmNvbnRlbnQpKTtcbiAgICAgIH1cbiAgICB9KTtcbiAgfVxufTtcblxuS2FkaXJhLl9nZXRTZW5kRnVuY3Rpb24gPSBmdW5jdGlvbigpIHtcbiAgcmV0dXJuIChNZXRlb3IuaXNTZXJ2ZXIpPyBLYWRpcmEuX3NlcnZlclNlbmQgOiBLYWRpcmEuX2NsaWVudFNlbmQ7XG59O1xuXG5LYWRpcmEuX2NsaWVudFNlbmQgPSBmdW5jdGlvbiAoZW5kcG9pbnQsIHBheWxvYWQsIGNhbGxiYWNrKSB7XG4gIGh0dHBSZXF1ZXN0KCdQT1NUJywgZW5kcG9pbnQsIHtcbiAgICBoZWFkZXJzOiB7XG4gICAgICAnQ29udGVudC1UeXBlJzogJ2FwcGxpY2F0aW9uL2pzb24nXG4gICAgfSxcbiAgICBjb250ZW50OiBKU09OLnN0cmluZ2lmeShwYXlsb2FkKVxuICB9LCBjYWxsYmFjayk7XG59XG5cbkthZGlyYS5fc2VydmVyU2VuZCA9IGZ1bmN0aW9uICgpIHtcbiAgdGhyb3cgbmV3IEVycm9yKCdLYWRpcmEuX3NlcnZlclNlbmQgaXMgbm90IHN1cHBvcnRlZC4gVXNlIGNvcmVBcGkgaW5zdGVhZC4nKTtcbn1cbiIsIkJhc2VFcnJvck1vZGVsID0gZnVuY3Rpb24ob3B0aW9ucykge1xuICB0aGlzLl9maWx0ZXJzID0gW107XG59O1xuXG5CYXNlRXJyb3JNb2RlbC5wcm90b3R5cGUuYWRkRmlsdGVyID0gZnVuY3Rpb24oZmlsdGVyKSB7XG4gIGlmKHR5cGVvZiBmaWx0ZXIgPT09ICdmdW5jdGlvbicpIHtcbiAgICB0aGlzLl9maWx0ZXJzLnB1c2goZmlsdGVyKTtcbiAgfSBlbHNlIHtcbiAgICB0aHJvdyBuZXcgRXJyb3IoXCJFcnJvciBmaWx0ZXIgbXVzdCBiZSBhIGZ1bmN0aW9uXCIpO1xuICB9XG59O1xuXG5CYXNlRXJyb3JNb2RlbC5wcm90b3R5cGUucmVtb3ZlRmlsdGVyID0gZnVuY3Rpb24oZmlsdGVyKSB7XG4gIHZhciBpbmRleCA9IHRoaXMuX2ZpbHRlcnMuaW5kZXhPZihmaWx0ZXIpO1xuICBpZihpbmRleCA+PSAwKSB7XG4gICAgdGhpcy5fZmlsdGVycy5zcGxpY2UoaW5kZXgsIDEpO1xuICB9XG59O1xuXG5CYXNlRXJyb3JNb2RlbC5wcm90b3R5cGUuYXBwbHlGaWx0ZXJzID0gZnVuY3Rpb24odHlwZSwgbWVzc2FnZSwgZXJyb3IsIHN1YlR5cGUpIHtcbiAgZm9yKHZhciBsYz0wOyBsYzx0aGlzLl9maWx0ZXJzLmxlbmd0aDsgbGMrKykge1xuICAgIHZhciBmaWx0ZXIgPSB0aGlzLl9maWx0ZXJzW2xjXTtcbiAgICB0cnkge1xuICAgICAgdmFyIHZhbGlkYXRlZCA9IGZpbHRlcih0eXBlLCBtZXNzYWdlLCBlcnJvciwgc3ViVHlwZSk7XG4gICAgICBpZighdmFsaWRhdGVkKSByZXR1cm4gZmFsc2U7XG4gICAgfSBjYXRjaCAoZXgpIHtcbiAgICAgIC8vIHdlIG5lZWQgdG8gcmVtb3ZlIHRoaXMgZmlsdGVyXG4gICAgICAvLyB3ZSBtYXkgZW5kZWQgdXAgaW4gYSBlcnJvciBjeWNsZVxuICAgICAgdGhpcy5fZmlsdGVycy5zcGxpY2UobGMsIDEpO1xuICAgICAgdGhyb3cgbmV3IEVycm9yKFwiYW4gZXJyb3IgdGhyb3duIGZyb20gYSBmaWx0ZXIgeW91J3ZlIHN1cGxpZWRcIiwgZXgubWVzc2FnZSk7XG4gICAgfVxuICB9XG5cbiAgcmV0dXJuIHRydWU7XG59OyIsIkthZGlyYU1vZGVsID0gZnVuY3Rpb24oKSB7XG5cbn07XG5cbkthZGlyYU1vZGVsLnByb3RvdHlwZS5fZ2V0RGF0ZUlkID0gZnVuY3Rpb24odGltZXN0YW1wKSB7XG4gIHZhciByZW1haW5kZXIgPSB0aW1lc3RhbXAgJSAoMTAwMCAqIDYwKTtcbiAgdmFyIGRhdGVJZCA9IHRpbWVzdGFtcCAtIHJlbWFpbmRlcjtcbiAgcmV0dXJuIGRhdGVJZDtcbn07IiwiY29uc3QgeyBERFNrZXRjaCB9ID0gcmVxdWlyZSgnbW9udGktYXBtLXNrZXRjaGVzLWpzJyk7XG5cbnZhciBNRVRIT0RfTUVUUklDU19GSUVMRFMgPSBbJ3dhaXQnLCAnZGInLCAnaHR0cCcsICdlbWFpbCcsICdhc3luYycsICdjb21wdXRlJywgJ3RvdGFsJ107XG5cbk1ldGhvZHNNb2RlbCA9IGZ1bmN0aW9uIChtZXRyaWNzVGhyZXNob2xkKSB7XG4gIHRoaXMubWV0aG9kTWV0cmljc0J5TWludXRlID0gT2JqZWN0LmNyZWF0ZShudWxsKTtcbiAgdGhpcy5lcnJvck1hcCA9IE9iamVjdC5jcmVhdGUobnVsbCk7XG5cbiAgdGhpcy5fbWV0cmljc1RocmVzaG9sZCA9IF8uZXh0ZW5kKHtcbiAgICBcIndhaXRcIjogMTAwLFxuICAgIFwiZGJcIjogMTAwLFxuICAgIFwiaHR0cFwiOiAxMDAwLFxuICAgIFwiZW1haWxcIjogMTAwLFxuICAgIFwiYXN5bmNcIjogMTAwLFxuICAgIFwiY29tcHV0ZVwiOiAxMDAsXG4gICAgXCJ0b3RhbFwiOiAyMDBcbiAgfSwgbWV0cmljc1RocmVzaG9sZCB8fCBPYmplY3QuY3JlYXRlKG51bGwpKTtcblxuICAvL3N0b3JlIG1heCB0aW1lIGVsYXBzZWQgbWV0aG9kcyBmb3IgZWFjaCBtZXRob2QsIGV2ZW50KG1ldHJpY3MtZmllbGQpXG4gIHRoaXMubWF4RXZlbnRUaW1lc0Zvck1ldGhvZHMgPSBPYmplY3QuY3JlYXRlKG51bGwpO1xuXG4gIHRoaXMudHJhY2VyU3RvcmUgPSBuZXcgVHJhY2VyU3RvcmUoe1xuICAgIGludGVydmFsOiAxMDAwICogNjAsIC8vcHJvY2VzcyB0cmFjZXMgZXZlcnkgbWludXRlXG4gICAgbWF4VG90YWxQb2ludHM6IDMwLCAvL2ZvciAzMCBtaW51dGVzXG4gICAgYXJjaGl2ZUV2ZXJ5OiA1IC8vYWx3YXlzIHRyYWNlIGZvciBldmVyeSA1IG1pbnV0ZXMsXG4gIH0pO1xuXG4gIHRoaXMudHJhY2VyU3RvcmUuc3RhcnQoKTtcbn07XG5cbl8uZXh0ZW5kKE1ldGhvZHNNb2RlbC5wcm90b3R5cGUsIEthZGlyYU1vZGVsLnByb3RvdHlwZSk7XG5cbk1ldGhvZHNNb2RlbC5wcm90b3R5cGUuX2dldE1ldHJpY3MgPSBmdW5jdGlvbih0aW1lc3RhbXAsIG1ldGhvZCkge1xuICB2YXIgZGF0ZUlkID0gdGhpcy5fZ2V0RGF0ZUlkKHRpbWVzdGFtcCk7XG5cbiAgaWYoIXRoaXMubWV0aG9kTWV0cmljc0J5TWludXRlW2RhdGVJZF0pIHtcbiAgICB0aGlzLm1ldGhvZE1ldHJpY3NCeU1pbnV0ZVtkYXRlSWRdID0ge1xuICAgICAgbWV0aG9kczogT2JqZWN0LmNyZWF0ZShudWxsKSxcbiAgICB9O1xuICB9XG5cbiAgdmFyIG1ldGhvZHMgPSB0aGlzLm1ldGhvZE1ldHJpY3NCeU1pbnV0ZVtkYXRlSWRdLm1ldGhvZHM7XG5cbiAgLy9pbml0aWFsaXplIG1ldGhvZFxuICBpZighbWV0aG9kc1ttZXRob2RdKSB7XG4gICAgbWV0aG9kc1ttZXRob2RdID0ge1xuICAgICAgY291bnQ6IDAsXG4gICAgICBlcnJvcnM6IDAsXG4gICAgICBmZXRjaGVkRG9jU2l6ZTogMCxcbiAgICAgIHNlbnRNc2dTaXplOiAwLFxuICAgICAgaGlzdG9ncmFtOiBuZXcgRERTa2V0Y2goe1xuICAgICAgICBhbHBoYTogMC4wMlxuICAgICAgfSlcbiAgICB9O1xuXG4gICAgTUVUSE9EX01FVFJJQ1NfRklFTERTLmZvckVhY2goZnVuY3Rpb24oZmllbGQpIHtcbiAgICAgIG1ldGhvZHNbbWV0aG9kXVtmaWVsZF0gPSAwO1xuICAgIH0pO1xuICB9XG5cbiAgcmV0dXJuIHRoaXMubWV0aG9kTWV0cmljc0J5TWludXRlW2RhdGVJZF0ubWV0aG9kc1ttZXRob2RdO1xufTtcblxuTWV0aG9kc01vZGVsLnByb3RvdHlwZS5zZXRTdGFydFRpbWUgPSBmdW5jdGlvbih0aW1lc3RhbXApIHtcbiAgdGhpcy5tZXRyaWNzQnlNaW51dGVbZGF0ZUlkXS5zdGFydFRpbWUgPSB0aW1lc3RhbXA7XG59XG5cbk1ldGhvZHNNb2RlbC5wcm90b3R5cGUucHJvY2Vzc01ldGhvZCA9IGZ1bmN0aW9uKG1ldGhvZFRyYWNlKSB7XG4gIHZhciBkYXRlSWQgPSB0aGlzLl9nZXREYXRlSWQobWV0aG9kVHJhY2UuYXQpO1xuXG4gIC8vYXBwZW5kIG1ldHJpY3MgdG8gcHJldmlvdXMgdmFsdWVzXG4gIHRoaXMuX2FwcGVuZE1ldHJpY3MoZGF0ZUlkLCBtZXRob2RUcmFjZSk7XG4gIGlmKG1ldGhvZFRyYWNlLmVycm9yZWQpIHtcbiAgICB0aGlzLm1ldGhvZE1ldHJpY3NCeU1pbnV0ZVtkYXRlSWRdLm1ldGhvZHNbbWV0aG9kVHJhY2UubmFtZV0uZXJyb3JzICsrXG4gIH1cblxuICB0aGlzLnRyYWNlclN0b3JlLmFkZFRyYWNlKG1ldGhvZFRyYWNlKTtcbn07XG5cbk1ldGhvZHNNb2RlbC5wcm90b3R5cGUuX2FwcGVuZE1ldHJpY3MgPSBmdW5jdGlvbihpZCwgbWV0aG9kVHJhY2UpIHtcbiAgdmFyIG1ldGhvZE1ldHJpY3MgPSB0aGlzLl9nZXRNZXRyaWNzKGlkLCBtZXRob2RUcmFjZS5uYW1lKVxuXG4gIC8vIHN0YXJ0VGltZSBuZWVkcyB0byBiZSBjb252ZXJ0ZWQgaW50byBzZXJ2ZXJUaW1lIGJlZm9yZSBzZW5kaW5nXG4gIGlmKCF0aGlzLm1ldGhvZE1ldHJpY3NCeU1pbnV0ZVtpZF0uc3RhcnRUaW1lKXtcbiAgICB0aGlzLm1ldGhvZE1ldHJpY3NCeU1pbnV0ZVtpZF0uc3RhcnRUaW1lID0gbWV0aG9kVHJhY2UuYXQ7XG4gIH1cblxuICAvL21lcmdlXG4gIE1FVEhPRF9NRVRSSUNTX0ZJRUxEUy5mb3JFYWNoKGZ1bmN0aW9uKGZpZWxkKSB7XG4gICAgdmFyIHZhbHVlID0gbWV0aG9kVHJhY2UubWV0cmljc1tmaWVsZF07XG4gICAgaWYodmFsdWUgPiAwKSB7XG4gICAgICBtZXRob2RNZXRyaWNzW2ZpZWxkXSArPSB2YWx1ZTtcbiAgICB9XG4gIH0pO1xuXG4gIG1ldGhvZE1ldHJpY3MuY291bnQrKztcbiAgbWV0aG9kTWV0cmljcy5oaXN0b2dyYW0uYWRkKG1ldGhvZFRyYWNlLm1ldHJpY3MudG90YWwpO1xuICB0aGlzLm1ldGhvZE1ldHJpY3NCeU1pbnV0ZVtpZF0uZW5kVGltZSA9IG1ldGhvZFRyYWNlLm1ldHJpY3MuYXQ7XG59O1xuXG5NZXRob2RzTW9kZWwucHJvdG90eXBlLnRyYWNrRG9jU2l6ZSA9IGZ1bmN0aW9uKG1ldGhvZCwgc2l6ZSkge1xuICB2YXIgdGltZXN0YW1wID0gTnRwLl9ub3coKTtcbiAgdmFyIGRhdGVJZCA9IHRoaXMuX2dldERhdGVJZCh0aW1lc3RhbXApO1xuXG4gIHZhciBtZXRob2RNZXRyaWNzID0gdGhpcy5fZ2V0TWV0cmljcyhkYXRlSWQsIG1ldGhvZCk7XG4gIG1ldGhvZE1ldHJpY3MuZmV0Y2hlZERvY1NpemUgKz0gc2l6ZTtcbn1cblxuTWV0aG9kc01vZGVsLnByb3RvdHlwZS50cmFja01zZ1NpemUgPSBmdW5jdGlvbihtZXRob2QsIHNpemUpIHtcbiAgdmFyIHRpbWVzdGFtcCA9IE50cC5fbm93KCk7XG4gIHZhciBkYXRlSWQgPSB0aGlzLl9nZXREYXRlSWQodGltZXN0YW1wKTtcblxuICB2YXIgbWV0aG9kTWV0cmljcyA9IHRoaXMuX2dldE1ldHJpY3MoZGF0ZUlkLCBtZXRob2QpO1xuICBtZXRob2RNZXRyaWNzLnNlbnRNc2dTaXplICs9IHNpemU7XG59XG5cbi8qXG4gIFRoZXJlIGFyZSB0d28gdHlwZXMgb2YgZGF0YVxuXG4gIDEuIG1ldGhvZE1ldHJpY3MgLSBtZXRyaWNzIGFib3V0IHRoZSBtZXRob2RzIChmb3IgZXZlcnkgMTAgc2VjcylcbiAgMi4gbWV0aG9kUmVxdWVzdHMgLSByYXcgbWV0aG9kIHJlcXVlc3QuIG5vcm1hbGx5IG1heCwgbWluIGZvciBldmVyeSAxIG1pbiBhbmQgZXJyb3JzIGFsd2F5c1xuKi9cbk1ldGhvZHNNb2RlbC5wcm90b3R5cGUuYnVpbGRQYXlsb2FkID0gZnVuY3Rpb24oYnVpbGREZXRhaWxlZEluZm8pIHtcbiAgdmFyIHBheWxvYWQgPSB7XG4gICAgbWV0aG9kTWV0cmljczogW10sXG4gICAgbWV0aG9kUmVxdWVzdHM6IFtdXG4gIH07XG5cbiAgLy9oYW5kbGluZyBtZXRyaWNzXG4gIHZhciBtZXRob2RNZXRyaWNzQnlNaW51dGUgPSB0aGlzLm1ldGhvZE1ldHJpY3NCeU1pbnV0ZTtcbiAgdGhpcy5tZXRob2RNZXRyaWNzQnlNaW51dGUgPSBPYmplY3QuY3JlYXRlKG51bGwpO1xuXG4gIC8vY3JlYXRlIGZpbmFsIHBheWxvZCBmb3IgbWV0aG9kTWV0cmljc1xuICBmb3IodmFyIGtleSBpbiBtZXRob2RNZXRyaWNzQnlNaW51dGUpIHtcbiAgICB2YXIgbWV0aG9kTWV0cmljcyA9IG1ldGhvZE1ldHJpY3NCeU1pbnV0ZVtrZXldO1xuICAgIC8vIGNvbnZlcnRpbmcgc3RhcnRUaW1lIGludG8gdGhlIGFjdHVhbCBzZXJ2ZXJUaW1lXG4gICAgdmFyIHN0YXJ0VGltZSA9IG1ldGhvZE1ldHJpY3Muc3RhcnRUaW1lO1xuICAgIG1ldGhvZE1ldHJpY3Muc3RhcnRUaW1lID0gS2FkaXJhLnN5bmNlZERhdGUuc3luY1RpbWUoc3RhcnRUaW1lKTtcblxuICAgIGZvcih2YXIgbWV0aG9kTmFtZSBpbiBtZXRob2RNZXRyaWNzLm1ldGhvZHMpIHtcbiAgICAgIE1FVEhPRF9NRVRSSUNTX0ZJRUxEUy5mb3JFYWNoKGZ1bmN0aW9uKGZpZWxkKSB7XG4gICAgICAgIG1ldGhvZE1ldHJpY3MubWV0aG9kc1ttZXRob2ROYW1lXVtmaWVsZF0gLz1cbiAgICAgICAgICBtZXRob2RNZXRyaWNzLm1ldGhvZHNbbWV0aG9kTmFtZV0uY291bnQ7XG4gICAgICB9KTtcbiAgICB9XG5cbiAgICBwYXlsb2FkLm1ldGhvZE1ldHJpY3MucHVzaChtZXRob2RNZXRyaWNzQnlNaW51dGVba2V5XSk7XG4gIH1cblxuICAvL2NvbGxlY3QgdHJhY2VzIGFuZCBzZW5kIHRoZW0gd2l0aCB0aGUgcGF5bG9hZFxuICBwYXlsb2FkLm1ldGhvZFJlcXVlc3RzID0gdGhpcy50cmFjZXJTdG9yZS5jb2xsZWN0VHJhY2VzKCk7XG5cbiAgcmV0dXJuIHBheWxvYWQ7XG59O1xuIiwidmFyIGxvZ2dlciA9IE5wbS5yZXF1aXJlKCdkZWJ1ZycpKCdrYWRpcmE6cHVic3ViJyk7XG5jb25zdCB7IEREU2tldGNoIH0gPSByZXF1aXJlKCdtb250aS1hcG0tc2tldGNoZXMtanMnKTtcblxuUHVic3ViTW9kZWwgPSBmdW5jdGlvbigpIHtcbiAgdGhpcy5tZXRyaWNzQnlNaW51dGUgPSBPYmplY3QuY3JlYXRlKG51bGwpO1xuICB0aGlzLnN1YnNjcmlwdGlvbnMgPSBPYmplY3QuY3JlYXRlKG51bGwpO1xuXG4gIHRoaXMudHJhY2VyU3RvcmUgPSBuZXcgVHJhY2VyU3RvcmUoe1xuICAgIGludGVydmFsOiAxMDAwICogNjAsIC8vcHJvY2VzcyB0cmFjZXMgZXZlcnkgbWludXRlXG4gICAgbWF4VG90YWxQb2ludHM6IDMwLCAvL2ZvciAzMCBtaW51dGVzXG4gICAgYXJjaGl2ZUV2ZXJ5OiA1IC8vYWx3YXlzIHRyYWNlIGZvciBldmVyeSA1IG1pbnV0ZXMsXG4gIH0pO1xuXG4gIHRoaXMudHJhY2VyU3RvcmUuc3RhcnQoKTtcbn1cblxuUHVic3ViTW9kZWwucHJvdG90eXBlLl90cmFja1N1YiA9IGZ1bmN0aW9uKHNlc3Npb24sIG1zZykge1xuICBsb2dnZXIoJ1NVQjonLCBzZXNzaW9uLmlkLCBtc2cuaWQsIG1zZy5uYW1lLCBtc2cucGFyYW1zKTtcbiAgdmFyIHB1YmxpY2F0aW9uID0gdGhpcy5fZ2V0UHVibGljYXRpb25OYW1lKG1zZy5uYW1lKTtcbiAgdmFyIHN1YnNjcmlwdGlvbklkID0gbXNnLmlkO1xuICB2YXIgdGltZXN0YW1wID0gTnRwLl9ub3coKTtcbiAgdmFyIG1ldHJpY3MgPSB0aGlzLl9nZXRNZXRyaWNzKHRpbWVzdGFtcCwgcHVibGljYXRpb24pO1xuXG4gIG1ldHJpY3Muc3VicysrO1xuICB0aGlzLnN1YnNjcmlwdGlvbnNbbXNnLmlkXSA9IHtcbiAgICAvLyBXZSB1c2UgbG9jYWxUaW1lIGhlcmUsIGJlY2F1c2Ugd2hlbiB3ZSB1c2VkIHN5bmVkVGltZSB3ZSBtaWdodCBnZXRcbiAgICAvLyBtaW51cyBvciBtb3JlIHRoYW4gd2UndmUgZXhwZWN0ZWRcbiAgICAvLyAgIChiZWZvcmUgc2VydmVyVGltZSBkaWZmIGNoYW5nZWQgb3ZlcnRpbWUpXG4gICAgc3RhcnRUaW1lOiB0aW1lc3RhbXAsXG4gICAgcHVibGljYXRpb246IHB1YmxpY2F0aW9uLFxuICAgIHBhcmFtczogbXNnLnBhcmFtcyxcbiAgICBpZDogbXNnLmlkXG4gIH07XG5cbiAgLy9zZXQgc2Vzc2lvbiBzdGFydGVkVGltZVxuICBzZXNzaW9uLl9zdGFydFRpbWUgPSBzZXNzaW9uLl9zdGFydFRpbWUgfHwgdGltZXN0YW1wO1xufTtcblxuXy5leHRlbmQoUHVic3ViTW9kZWwucHJvdG90eXBlLCBLYWRpcmFNb2RlbC5wcm90b3R5cGUpO1xuXG5QdWJzdWJNb2RlbC5wcm90b3R5cGUuX3RyYWNrVW5zdWIgPSBmdW5jdGlvbihzZXNzaW9uLCBzdWIpIHtcbiAgbG9nZ2VyKCdVTlNVQjonLCBzZXNzaW9uLmlkLCBzdWIuX3N1YnNjcmlwdGlvbklkKTtcbiAgdmFyIHB1YmxpY2F0aW9uID0gdGhpcy5fZ2V0UHVibGljYXRpb25OYW1lKHN1Yi5fbmFtZSk7XG4gIHZhciBzdWJzY3JpcHRpb25JZCA9IHN1Yi5fc3Vic2NyaXB0aW9uSWQ7XG4gIHZhciBzdWJzY3JpcHRpb25TdGF0ZSA9IHRoaXMuc3Vic2NyaXB0aW9uc1tzdWJzY3JpcHRpb25JZF07XG5cbiAgdmFyIHN0YXJ0VGltZSA9IG51bGw7XG4gIC8vc29tZXRpbWUsIHdlIGRvbid0IGhhdmUgdGhlc2Ugc3RhdGVzXG4gIGlmKHN1YnNjcmlwdGlvblN0YXRlKSB7XG4gICAgc3RhcnRUaW1lID0gc3Vic2NyaXB0aW9uU3RhdGUuc3RhcnRUaW1lO1xuICB9IGVsc2Uge1xuICAgIC8vaWYgdGhpcyBpcyBudWxsIHN1YnNjcmlwdGlvbiwgd2hpY2ggaXMgc3RhcnRlZCBhdXRvbWF0aWNhbGx5XG4gICAgLy9oZW5jZSwgd2UgZG9uJ3QgaGF2ZSBhIHN0YXRlXG4gICAgc3RhcnRUaW1lID0gc2Vzc2lvbi5fc3RhcnRUaW1lO1xuICB9XG5cbiAgLy9pbiBjYXNlLCB3ZSBjYW4ndCBnZXQgdGhlIHN0YXJ0VGltZVxuICBpZihzdGFydFRpbWUpIHtcbiAgICB2YXIgdGltZXN0YW1wID0gTnRwLl9ub3coKTtcbiAgICB2YXIgbWV0cmljcyA9IHRoaXMuX2dldE1ldHJpY3ModGltZXN0YW1wLCBwdWJsaWNhdGlvbik7XG4gICAgLy90cmFjayB0aGUgY291bnRcbiAgICBpZihzdWIuX25hbWUgIT0gbnVsbCkge1xuICAgICAgLy8gd2UgY2FuJ3QgdHJhY2sgc3VicyBmb3IgYG51bGxgIHB1YmxpY2F0aW9ucy5cbiAgICAgIC8vIHNvIHdlIHNob3VsZCBub3QgdHJhY2sgdW5zdWJzIHRvb1xuICAgICAgbWV0cmljcy51bnN1YnMrKztcbiAgICB9XG4gICAgLy91c2UgdGhlIGN1cnJlbnQgZGF0ZSB0byBnZXQgdGhlIGxpZmVUaW1lIG9mIHRoZSBzdWJzY3JpcHRpb25cbiAgICBtZXRyaWNzLmxpZmVUaW1lICs9IHRpbWVzdGFtcCAtIHN0YXJ0VGltZTtcbiAgICAvL3RoaXMgaXMgcGxhY2Ugd2UgY2FuIGNsZWFuIHRoZSBzdWJzY3JpcHRpb25TdGF0ZSBpZiBleGlzdHNcbiAgICBkZWxldGUgdGhpcy5zdWJzY3JpcHRpb25zW3N1YnNjcmlwdGlvbklkXTtcbiAgfVxufTtcblxuUHVic3ViTW9kZWwucHJvdG90eXBlLl90cmFja1JlYWR5ID0gZnVuY3Rpb24oc2Vzc2lvbiwgc3ViLCB0cmFjZSkge1xuICBsb2dnZXIoJ1JFQURZOicsIHNlc3Npb24uaWQsIHN1Yi5fc3Vic2NyaXB0aW9uSWQpO1xuICAvL3VzZSB0aGUgY3VycmVudCB0aW1lIHRvIHRyYWNrIHRoZSByZXNwb25zZSB0aW1lXG4gIHZhciBwdWJsaWNhdGlvbiA9IHRoaXMuX2dldFB1YmxpY2F0aW9uTmFtZShzdWIuX25hbWUpO1xuICB2YXIgc3Vic2NyaXB0aW9uSWQgPSBzdWIuX3N1YnNjcmlwdGlvbklkO1xuICB2YXIgdGltZXN0YW1wID0gTnRwLl9ub3coKTtcbiAgdmFyIG1ldHJpY3MgPSB0aGlzLl9nZXRNZXRyaWNzKHRpbWVzdGFtcCwgcHVibGljYXRpb24pO1xuXG4gIHZhciBzdWJzY3JpcHRpb25TdGF0ZSA9IHRoaXMuc3Vic2NyaXB0aW9uc1tzdWJzY3JpcHRpb25JZF07XG4gIGlmKHN1YnNjcmlwdGlvblN0YXRlICYmICFzdWJzY3JpcHRpb25TdGF0ZS5yZWFkeVRyYWNrZWQpIHtcbiAgICB2YXIgcmVzVGltZSA9IHRpbWVzdGFtcCAtIHN1YnNjcmlwdGlvblN0YXRlLnN0YXJ0VGltZVxuICAgIG1ldHJpY3MucmVzVGltZSArPSByZXNUaW1lO1xuICAgIHN1YnNjcmlwdGlvblN0YXRlLnJlYWR5VHJhY2tlZCA9IHRydWU7XG4gICAgbWV0cmljcy5oaXN0b2dyYW0uYWRkKHJlc1RpbWUpO1xuICB9XG5cbiAgaWYodHJhY2UpIHtcbiAgICB0aGlzLnRyYWNlclN0b3JlLmFkZFRyYWNlKHRyYWNlKTtcbiAgfVxufTtcblxuUHVic3ViTW9kZWwucHJvdG90eXBlLl90cmFja0Vycm9yID0gZnVuY3Rpb24oc2Vzc2lvbiwgc3ViLCB0cmFjZSkge1xuICBsb2dnZXIoJ0VSUk9SOicsIHNlc3Npb24uaWQsIHN1Yi5fc3Vic2NyaXB0aW9uSWQpO1xuICAvL3VzZSB0aGUgY3VycmVudCB0aW1lIHRvIHRyYWNrIHRoZSByZXNwb25zZSB0aW1lXG4gIHZhciBwdWJsaWNhdGlvbiA9IHRoaXMuX2dldFB1YmxpY2F0aW9uTmFtZShzdWIuX25hbWUpO1xuICB2YXIgc3Vic2NyaXB0aW9uSWQgPSBzdWIuX3N1YnNjcmlwdGlvbklkO1xuICB2YXIgdGltZXN0YW1wID0gTnRwLl9ub3coKTtcbiAgdmFyIG1ldHJpY3MgPSB0aGlzLl9nZXRNZXRyaWNzKHRpbWVzdGFtcCwgcHVibGljYXRpb24pO1xuXG4gIG1ldHJpY3MuZXJyb3JzKys7XG5cbiAgaWYodHJhY2UpIHtcbiAgICB0aGlzLnRyYWNlclN0b3JlLmFkZFRyYWNlKHRyYWNlKTtcbiAgfVxufTtcblxuUHVic3ViTW9kZWwucHJvdG90eXBlLl9nZXRNZXRyaWNzID0gZnVuY3Rpb24odGltZXN0YW1wLCBwdWJsaWNhdGlvbikge1xuICB2YXIgZGF0ZUlkID0gdGhpcy5fZ2V0RGF0ZUlkKHRpbWVzdGFtcCk7XG5cbiAgaWYoIXRoaXMubWV0cmljc0J5TWludXRlW2RhdGVJZF0pIHtcbiAgICB0aGlzLm1ldHJpY3NCeU1pbnV0ZVtkYXRlSWRdID0ge1xuICAgICAgLy8gc3RhcnRUaW1lIG5lZWRzIHRvIGJlIGNvbnZlcnQgdG8gc2VydmVyVGltZSBiZWZvcmUgc2VuZGluZyB0byB0aGUgc2VydmVyXG4gICAgICBzdGFydFRpbWU6IHRpbWVzdGFtcCxcbiAgICAgIHB1YnM6IE9iamVjdC5jcmVhdGUobnVsbClcbiAgICB9O1xuICB9XG5cbiAgaWYoIXRoaXMubWV0cmljc0J5TWludXRlW2RhdGVJZF0ucHVic1twdWJsaWNhdGlvbl0pIHtcbiAgICB0aGlzLm1ldHJpY3NCeU1pbnV0ZVtkYXRlSWRdLnB1YnNbcHVibGljYXRpb25dID0ge1xuICAgICAgc3ViczogMCxcbiAgICAgIHVuc3ViczogMCxcbiAgICAgIHJlc1RpbWU6IDAsXG4gICAgICBhY3RpdmVTdWJzOiAwLFxuICAgICAgYWN0aXZlRG9jczogMCxcbiAgICAgIGxpZmVUaW1lOiAwLFxuICAgICAgdG90YWxPYnNlcnZlcnM6IDAsXG4gICAgICBjYWNoZWRPYnNlcnZlcnM6IDAsXG4gICAgICBjcmVhdGVkT2JzZXJ2ZXJzOiAwLFxuICAgICAgZGVsZXRlZE9ic2VydmVyczogMCxcbiAgICAgIGVycm9yczogMCxcbiAgICAgIG9ic2VydmVyTGlmZXRpbWU6IDAsXG4gICAgICBwb2xsZWREb2N1bWVudHM6IDAsXG4gICAgICBvcGxvZ1VwZGF0ZWREb2N1bWVudHM6IDAsXG4gICAgICBvcGxvZ0luc2VydGVkRG9jdW1lbnRzOiAwLFxuICAgICAgb3Bsb2dEZWxldGVkRG9jdW1lbnRzOiAwLFxuICAgICAgaW5pdGlhbGx5QWRkZWREb2N1bWVudHM6IDAsXG4gICAgICBsaXZlQWRkZWREb2N1bWVudHM6IDAsXG4gICAgICBsaXZlQ2hhbmdlZERvY3VtZW50czogMCxcbiAgICAgIGxpdmVSZW1vdmVkRG9jdW1lbnRzOiAwLFxuICAgICAgcG9sbGVkRG9jU2l6ZTogMCxcbiAgICAgIGZldGNoZWREb2NTaXplOiAwLFxuICAgICAgaW5pdGlhbGx5RmV0Y2hlZERvY1NpemU6IDAsXG4gICAgICBsaXZlRmV0Y2hlZERvY1NpemU6IDAsXG4gICAgICBpbml0aWFsbHlTZW50TXNnU2l6ZTogMCxcbiAgICAgIGxpdmVTZW50TXNnU2l6ZTogMCxcbiAgICAgIGhpc3RvZ3JhbTogbmV3IEREU2tldGNoKHtcbiAgICAgICAgYWxwaGE6IDAuMDJcbiAgICAgIH0pXG4gICAgfTtcbiAgfVxuXG4gIHJldHVybiB0aGlzLm1ldHJpY3NCeU1pbnV0ZVtkYXRlSWRdLnB1YnNbcHVibGljYXRpb25dO1xufTtcblxuUHVic3ViTW9kZWwucHJvdG90eXBlLl9nZXRQdWJsaWNhdGlvbk5hbWUgPSBmdW5jdGlvbihuYW1lKSB7XG4gIHJldHVybiBuYW1lIHx8IFwibnVsbChhdXRvcHVibGlzaClcIjtcbn07XG5cblB1YnN1Yk1vZGVsLnByb3RvdHlwZS5fZ2V0U3Vic2NyaXB0aW9uSW5mbyA9IGZ1bmN0aW9uKCkge1xuICB2YXIgc2VsZiA9IHRoaXM7XG4gIHZhciBhY3RpdmVTdWJzID0gT2JqZWN0LmNyZWF0ZShudWxsKTtcbiAgdmFyIGFjdGl2ZURvY3MgPSBPYmplY3QuY3JlYXRlKG51bGwpO1xuICB2YXIgdG90YWxEb2NzU2VudCA9IE9iamVjdC5jcmVhdGUobnVsbCk7XG4gIHZhciB0b3RhbERhdGFTZW50ID0gT2JqZWN0LmNyZWF0ZShudWxsKTtcbiAgdmFyIHRvdGFsT2JzZXJ2ZXJzID0gT2JqZWN0LmNyZWF0ZShudWxsKTtcbiAgdmFyIGNhY2hlZE9ic2VydmVycyA9IE9iamVjdC5jcmVhdGUobnVsbCk7XG5cbiAgaXRlcmF0ZShNZXRlb3Iuc2VydmVyLnNlc3Npb25zLCBzZXNzaW9uID0+IHtcbiAgICBpdGVyYXRlKHNlc3Npb24uX25hbWVkU3VicywgY291bnRTdWJEYXRhKTtcbiAgICBpdGVyYXRlKHNlc3Npb24uX3VuaXZlcnNhbFN1YnMsIGNvdW50U3ViRGF0YSk7XG4gIH0pO1xuXG4gIHZhciBhdmdPYnNlcnZlclJldXNlID0gT2JqZWN0LmNyZWF0ZShudWxsKTtcbiAgXy5lYWNoKHRvdGFsT2JzZXJ2ZXJzLCBmdW5jdGlvbih2YWx1ZSwgcHVibGljYXRpb24pIHtcbiAgICBhdmdPYnNlcnZlclJldXNlW3B1YmxpY2F0aW9uXSA9IGNhY2hlZE9ic2VydmVyc1twdWJsaWNhdGlvbl0gLyB0b3RhbE9ic2VydmVyc1twdWJsaWNhdGlvbl07XG4gIH0pO1xuXG4gIHJldHVybiB7XG4gICAgYWN0aXZlU3ViczogYWN0aXZlU3VicyxcbiAgICBhY3RpdmVEb2NzOiBhY3RpdmVEb2NzLFxuICAgIGF2Z09ic2VydmVyUmV1c2U6IGF2Z09ic2VydmVyUmV1c2VcbiAgfTtcblxuICBmdW5jdGlvbiBjb3VudFN1YkRhdGEgKHN1Yikge1xuICAgIHZhciBwdWJsaWNhdGlvbiA9IHNlbGYuX2dldFB1YmxpY2F0aW9uTmFtZShzdWIuX25hbWUpO1xuICAgIGNvdW50U3Vic2NyaXB0aW9ucyhzdWIsIHB1YmxpY2F0aW9uKTtcbiAgICBjb3VudERvY3VtZW50cyhzdWIsIHB1YmxpY2F0aW9uKTtcbiAgICBjb3VudE9ic2VydmVycyhzdWIsIHB1YmxpY2F0aW9uKTtcbiAgfVxuXG4gIGZ1bmN0aW9uIGNvdW50U3Vic2NyaXB0aW9ucyAoc3ViLCBwdWJsaWNhdGlvbikge1xuICAgIGFjdGl2ZVN1YnNbcHVibGljYXRpb25dID0gYWN0aXZlU3Vic1twdWJsaWNhdGlvbl0gfHwgMDtcbiAgICBhY3RpdmVTdWJzW3B1YmxpY2F0aW9uXSsrO1xuICB9XG5cbiAgZnVuY3Rpb24gY291bnREb2N1bWVudHMgKHN1YiwgcHVibGljYXRpb24pIHtcbiAgICBhY3RpdmVEb2NzW3B1YmxpY2F0aW9uXSA9IGFjdGl2ZURvY3NbcHVibGljYXRpb25dIHx8IDA7XG4gICAgaXRlcmF0ZShzdWIuX2RvY3VtZW50cywgY29sbGVjdGlvbiA9PiB7XG4gICAgICBhY3RpdmVEb2NzW3B1YmxpY2F0aW9uXSArPSBjb3VudEtleXMoY29sbGVjdGlvbik7XG4gICAgfSk7XG4gIH1cblxuICBmdW5jdGlvbiBjb3VudE9ic2VydmVycyhzdWIsIHB1YmxpY2F0aW9uKSB7XG4gICAgdG90YWxPYnNlcnZlcnNbcHVibGljYXRpb25dID0gdG90YWxPYnNlcnZlcnNbcHVibGljYXRpb25dIHx8IDA7XG4gICAgY2FjaGVkT2JzZXJ2ZXJzW3B1YmxpY2F0aW9uXSA9IGNhY2hlZE9ic2VydmVyc1twdWJsaWNhdGlvbl0gfHwgMDtcblxuICAgIHRvdGFsT2JzZXJ2ZXJzW3B1YmxpY2F0aW9uXSArPSBzdWIuX3RvdGFsT2JzZXJ2ZXJzO1xuICAgIGNhY2hlZE9ic2VydmVyc1twdWJsaWNhdGlvbl0gKz0gc3ViLl9jYWNoZWRPYnNlcnZlcnM7XG4gIH1cbn1cblxuUHVic3ViTW9kZWwucHJvdG90eXBlLmJ1aWxkUGF5bG9hZCA9IGZ1bmN0aW9uKGJ1aWxkRGV0YWlsSW5mbykge1xuICB2YXIgbWV0cmljc0J5TWludXRlID0gdGhpcy5tZXRyaWNzQnlNaW51dGU7XG4gIHRoaXMubWV0cmljc0J5TWludXRlID0gT2JqZWN0LmNyZWF0ZShudWxsKTtcblxuICB2YXIgcGF5bG9hZCA9IHtcbiAgICBwdWJNZXRyaWNzOiBbXVxuICB9O1xuXG4gIHZhciBzdWJzY3JpcHRpb25EYXRhID0gdGhpcy5fZ2V0U3Vic2NyaXB0aW9uSW5mbygpO1xuICB2YXIgYWN0aXZlU3VicyA9IHN1YnNjcmlwdGlvbkRhdGEuYWN0aXZlU3VicztcbiAgdmFyIGFjdGl2ZURvY3MgPSBzdWJzY3JpcHRpb25EYXRhLmFjdGl2ZURvY3M7XG4gIHZhciBhdmdPYnNlcnZlclJldXNlID0gc3Vic2NyaXB0aW9uRGF0YS5hdmdPYnNlcnZlclJldXNlO1xuXG4gIC8vdG8gdGhlIGF2ZXJhZ2luZ1xuICBmb3IodmFyIGRhdGVJZCBpbiBtZXRyaWNzQnlNaW51dGUpIHtcbiAgICB2YXIgZGF0ZU1ldHJpY3MgPSBtZXRyaWNzQnlNaW51dGVbZGF0ZUlkXTtcbiAgICAvLyBXZSBuZWVkIHRvIGNvbnZlcnQgc3RhcnRUaW1lIGludG8gYWN0dWFsIHNlcnZlclRpbWVcbiAgICBkYXRlTWV0cmljcy5zdGFydFRpbWUgPSBLYWRpcmEuc3luY2VkRGF0ZS5zeW5jVGltZShkYXRlTWV0cmljcy5zdGFydFRpbWUpO1xuXG4gICAgZm9yKHZhciBwdWJsaWNhdGlvbiBpbiBtZXRyaWNzQnlNaW51dGVbZGF0ZUlkXS5wdWJzKSB7XG4gICAgICB2YXIgc2luZ2xlUHViTWV0cmljcyA9IG1ldHJpY3NCeU1pbnV0ZVtkYXRlSWRdLnB1YnNbcHVibGljYXRpb25dO1xuICAgICAgLy8gV2Ugb25seSBjYWxjdWxhdGUgcmVzVGltZSBmb3IgbmV3IHN1YnNjcmlwdGlvbnNcbiAgICAgIHNpbmdsZVB1Yk1ldHJpY3MucmVzVGltZSAvPSBzaW5nbGVQdWJNZXRyaWNzLnN1YnM7XG4gICAgICBzaW5nbGVQdWJNZXRyaWNzLnJlc1RpbWUgPSBzaW5nbGVQdWJNZXRyaWNzLnJlc1RpbWUgfHwgMDtcbiAgICAgIC8vIFdlIG9ubHkgdHJhY2sgbGlmZVRpbWUgaW4gdGhlIHVuc3Vic1xuICAgICAgc2luZ2xlUHViTWV0cmljcy5saWZlVGltZSAvPSBzaW5nbGVQdWJNZXRyaWNzLnVuc3VicztcbiAgICAgIHNpbmdsZVB1Yk1ldHJpY3MubGlmZVRpbWUgPSBzaW5nbGVQdWJNZXRyaWNzLmxpZmVUaW1lIHx8IDA7XG5cbiAgICAgIC8vIENvdW50IHRoZSBhdmVyYWdlIGZvciBvYnNlcnZlciBsaWZldGltZVxuICAgICAgaWYoc2luZ2xlUHViTWV0cmljcy5kZWxldGVkT2JzZXJ2ZXJzID4gMCkge1xuICAgICAgICBzaW5nbGVQdWJNZXRyaWNzLm9ic2VydmVyTGlmZXRpbWUgLz0gc2luZ2xlUHViTWV0cmljcy5kZWxldGVkT2JzZXJ2ZXJzO1xuICAgICAgfVxuXG4gICAgICAvLyBJZiB0aGVyZSBhcmUgdHdvIG9yZSBtb3JlIGRhdGVJZHMsIHdlIHdpbGwgYmUgdXNpbmcgdGhlIGN1cnJlbnRDb3VudCBmb3IgYWxsIG9mIHRoZW0uXG4gICAgICAvLyBXZSBjYW4gY29tZSB1cCB3aXRoIGEgYmV0dGVyIHNvbHV0aW9uIGxhdGVyIG9uLlxuICAgICAgc2luZ2xlUHViTWV0cmljcy5hY3RpdmVTdWJzID0gYWN0aXZlU3Vic1twdWJsaWNhdGlvbl0gfHwgMDtcbiAgICAgIHNpbmdsZVB1Yk1ldHJpY3MuYWN0aXZlRG9jcyA9IGFjdGl2ZURvY3NbcHVibGljYXRpb25dIHx8IDA7XG4gICAgICBzaW5nbGVQdWJNZXRyaWNzLmF2Z09ic2VydmVyUmV1c2UgPSBhdmdPYnNlcnZlclJldXNlW3B1YmxpY2F0aW9uXSB8fCAwO1xuICAgIH1cblxuICAgIHBheWxvYWQucHViTWV0cmljcy5wdXNoKG1ldHJpY3NCeU1pbnV0ZVtkYXRlSWRdKTtcbiAgfVxuXG4gIC8vY29sbGVjdCB0cmFjZXMgYW5kIHNlbmQgdGhlbSB3aXRoIHRoZSBwYXlsb2FkXG4gIHBheWxvYWQucHViUmVxdWVzdHMgPSB0aGlzLnRyYWNlclN0b3JlLmNvbGxlY3RUcmFjZXMoKTtcblxuICByZXR1cm4gcGF5bG9hZDtcbn07XG5cblB1YnN1Yk1vZGVsLnByb3RvdHlwZS5pbmNyZW1lbnRIYW5kbGVDb3VudCA9IGZ1bmN0aW9uKHRyYWNlLCBpc0NhY2hlZCkge1xuICB2YXIgdGltZXN0YW1wID0gTnRwLl9ub3coKTtcbiAgdmFyIHB1YmxpY2F0aW9uTmFtZSA9IHRoaXMuX2dldFB1YmxpY2F0aW9uTmFtZSh0cmFjZS5uYW1lKTtcbiAgdmFyIHB1YmxpY2F0aW9uID0gdGhpcy5fZ2V0TWV0cmljcyh0aW1lc3RhbXAsIHB1YmxpY2F0aW9uTmFtZSk7XG5cbiAgdmFyIHNlc3Npb24gPSBnZXRQcm9wZXJ0eShNZXRlb3Iuc2VydmVyLnNlc3Npb25zLCB0cmFjZS5zZXNzaW9uKTtcbiAgaWYoc2Vzc2lvbikge1xuICAgIHZhciBzdWIgPSBnZXRQcm9wZXJ0eShzZXNzaW9uLl9uYW1lZFN1YnMsIHRyYWNlLmlkKTtcbiAgICBpZihzdWIpIHtcbiAgICAgIHN1Yi5fdG90YWxPYnNlcnZlcnMgPSBzdWIuX3RvdGFsT2JzZXJ2ZXJzIHx8IDA7XG4gICAgICBzdWIuX2NhY2hlZE9ic2VydmVycyA9IHN1Yi5fY2FjaGVkT2JzZXJ2ZXJzIHx8IDA7XG4gICAgfVxuICB9XG4gIC8vIG5vdCBzdXJlLCB3ZSBuZWVkIHRvIGRvIHRoaXM/IEJ1dCBJIGRvbid0IG5lZWQgdG8gYnJlYWsgdGhlIGhvd2V2ZXJcbiAgc3ViID0gc3ViIHx8IHtfdG90YWxPYnNlcnZlcnM6MCAsIF9jYWNoZWRPYnNlcnZlcnM6IDB9O1xuXG4gIHB1YmxpY2F0aW9uLnRvdGFsT2JzZXJ2ZXJzKys7XG4gIHN1Yi5fdG90YWxPYnNlcnZlcnMrKztcbiAgaWYoaXNDYWNoZWQpIHtcbiAgICBwdWJsaWNhdGlvbi5jYWNoZWRPYnNlcnZlcnMrKztcbiAgICBzdWIuX2NhY2hlZE9ic2VydmVycysrO1xuICB9XG59XG5cblB1YnN1Yk1vZGVsLnByb3RvdHlwZS50cmFja0NyZWF0ZWRPYnNlcnZlciA9IGZ1bmN0aW9uKGluZm8pIHtcbiAgdmFyIHRpbWVzdGFtcCA9IE50cC5fbm93KCk7XG4gIHZhciBwdWJsaWNhdGlvbk5hbWUgPSB0aGlzLl9nZXRQdWJsaWNhdGlvbk5hbWUoaW5mby5uYW1lKTtcbiAgdmFyIHB1YmxpY2F0aW9uID0gdGhpcy5fZ2V0TWV0cmljcyh0aW1lc3RhbXAsIHB1YmxpY2F0aW9uTmFtZSk7XG4gIHB1YmxpY2F0aW9uLmNyZWF0ZWRPYnNlcnZlcnMrKztcbn1cblxuUHVic3ViTW9kZWwucHJvdG90eXBlLnRyYWNrRGVsZXRlZE9ic2VydmVyID0gZnVuY3Rpb24oaW5mbykge1xuICB2YXIgdGltZXN0YW1wID0gTnRwLl9ub3coKTtcbiAgdmFyIHB1YmxpY2F0aW9uTmFtZSA9IHRoaXMuX2dldFB1YmxpY2F0aW9uTmFtZShpbmZvLm5hbWUpO1xuICB2YXIgcHVibGljYXRpb24gPSB0aGlzLl9nZXRNZXRyaWNzKHRpbWVzdGFtcCwgcHVibGljYXRpb25OYW1lKTtcbiAgcHVibGljYXRpb24uZGVsZXRlZE9ic2VydmVycysrO1xuICBwdWJsaWNhdGlvbi5vYnNlcnZlckxpZmV0aW1lICs9IChuZXcgRGF0ZSgpKS5nZXRUaW1lKCkgLSBpbmZvLnN0YXJ0VGltZTtcbn1cblxuUHVic3ViTW9kZWwucHJvdG90eXBlLnRyYWNrRG9jdW1lbnRDaGFuZ2VzID0gZnVuY3Rpb24oaW5mbywgb3ApIHtcbiAgLy8gSXQncyBwb3NzaWJlbCB0aGF0IGluZm8gdG8gYmUgbnVsbFxuICAvLyBTcGVjaWFsbHkgd2hlbiBnZXR0aW5nIGNoYW5nZXMgYXQgdGhlIHZlcnkgYmVnaW5pbmcuXG4gIC8vIFRoaXMgbWF5IGJlIGZhbHNlLCBidXQgbmljZSB0byBoYXZlIGEgY2hlY2tcbiAgaWYoIWluZm8pIHtcbiAgICByZXR1cm5cbiAgfVxuXG4gIHZhciB0aW1lc3RhbXAgPSBOdHAuX25vdygpO1xuICB2YXIgcHVibGljYXRpb25OYW1lID0gdGhpcy5fZ2V0UHVibGljYXRpb25OYW1lKGluZm8ubmFtZSk7XG4gIHZhciBwdWJsaWNhdGlvbiA9IHRoaXMuX2dldE1ldHJpY3ModGltZXN0YW1wLCBwdWJsaWNhdGlvbk5hbWUpO1xuICBpZihvcC5vcCA9PT0gXCJkXCIpIHtcbiAgICBwdWJsaWNhdGlvbi5vcGxvZ0RlbGV0ZWREb2N1bWVudHMrKztcbiAgfSBlbHNlIGlmKG9wLm9wID09PSBcImlcIikge1xuICAgIHB1YmxpY2F0aW9uLm9wbG9nSW5zZXJ0ZWREb2N1bWVudHMrKztcbiAgfSBlbHNlIGlmKG9wLm9wID09PSBcInVcIikge1xuICAgIHB1YmxpY2F0aW9uLm9wbG9nVXBkYXRlZERvY3VtZW50cysrO1xuICB9XG59XG5cblB1YnN1Yk1vZGVsLnByb3RvdHlwZS50cmFja1BvbGxlZERvY3VtZW50cyA9IGZ1bmN0aW9uKGluZm8sIGNvdW50KSB7XG4gIHZhciB0aW1lc3RhbXAgPSBOdHAuX25vdygpO1xuICB2YXIgcHVibGljYXRpb25OYW1lID0gdGhpcy5fZ2V0UHVibGljYXRpb25OYW1lKGluZm8ubmFtZSk7XG4gIHZhciBwdWJsaWNhdGlvbiA9IHRoaXMuX2dldE1ldHJpY3ModGltZXN0YW1wLCBwdWJsaWNhdGlvbk5hbWUpO1xuICBwdWJsaWNhdGlvbi5wb2xsZWREb2N1bWVudHMgKz0gY291bnQ7XG59XG5cblB1YnN1Yk1vZGVsLnByb3RvdHlwZS50cmFja0xpdmVVcGRhdGVzID0gZnVuY3Rpb24oaW5mbywgdHlwZSwgY291bnQpIHtcbiAgdmFyIHRpbWVzdGFtcCA9IE50cC5fbm93KCk7XG4gIHZhciBwdWJsaWNhdGlvbk5hbWUgPSB0aGlzLl9nZXRQdWJsaWNhdGlvbk5hbWUoaW5mby5uYW1lKTtcbiAgdmFyIHB1YmxpY2F0aW9uID0gdGhpcy5fZ2V0TWV0cmljcyh0aW1lc3RhbXAsIHB1YmxpY2F0aW9uTmFtZSk7XG5cbiAgaWYodHlwZSA9PT0gXCJfYWRkUHVibGlzaGVkXCIpIHtcbiAgICBwdWJsaWNhdGlvbi5saXZlQWRkZWREb2N1bWVudHMgKz0gY291bnQ7XG4gIH0gZWxzZSBpZih0eXBlID09PSBcIl9yZW1vdmVQdWJsaXNoZWRcIikge1xuICAgIHB1YmxpY2F0aW9uLmxpdmVSZW1vdmVkRG9jdW1lbnRzICs9IGNvdW50O1xuICB9IGVsc2UgaWYodHlwZSA9PT0gXCJfY2hhbmdlUHVibGlzaGVkXCIpIHtcbiAgICBwdWJsaWNhdGlvbi5saXZlQ2hhbmdlZERvY3VtZW50cyArPSBjb3VudDtcbiAgfSBlbHNlIGlmKHR5cGUgPT09IFwiX2luaXRpYWxBZGRzXCIpIHtcbiAgICBwdWJsaWNhdGlvbi5pbml0aWFsbHlBZGRlZERvY3VtZW50cyArPSBjb3VudDtcbiAgfSBlbHNlIHtcbiAgICB0aHJvdyBuZXcgRXJyb3IoXCJLYWRpcmE6IFVua25vd24gbGl2ZSB1cGRhdGUgdHlwZVwiKTtcbiAgfVxufVxuXG5QdWJzdWJNb2RlbC5wcm90b3R5cGUudHJhY2tEb2NTaXplID0gZnVuY3Rpb24obmFtZSwgdHlwZSwgc2l6ZSkge1xuICB2YXIgdGltZXN0YW1wID0gTnRwLl9ub3coKTtcbiAgdmFyIHB1YmxpY2F0aW9uTmFtZSA9IHRoaXMuX2dldFB1YmxpY2F0aW9uTmFtZShuYW1lKTtcbiAgdmFyIHB1YmxpY2F0aW9uID0gdGhpcy5fZ2V0TWV0cmljcyh0aW1lc3RhbXAsIHB1YmxpY2F0aW9uTmFtZSk7XG5cbiAgaWYodHlwZSA9PT0gXCJwb2xsZWRGZXRjaGVzXCIpIHtcbiAgICBwdWJsaWNhdGlvbi5wb2xsZWREb2NTaXplICs9IHNpemU7XG4gIH0gZWxzZSBpZih0eXBlID09PSBcImxpdmVGZXRjaGVzXCIpIHtcbiAgICBwdWJsaWNhdGlvbi5saXZlRmV0Y2hlZERvY1NpemUgKz0gc2l6ZTtcbiAgfSBlbHNlIGlmKHR5cGUgPT09IFwiY3Vyc29yRmV0Y2hlc1wiKSB7XG4gICAgcHVibGljYXRpb24uZmV0Y2hlZERvY1NpemUgKz0gc2l6ZTtcbiAgfSBlbHNlIGlmKHR5cGUgPT09IFwiaW5pdGlhbEZldGNoZXNcIikge1xuICAgIHB1YmxpY2F0aW9uLmluaXRpYWxseUZldGNoZWREb2NTaXplICs9IHNpemU7XG4gIH0gZWxzZSB7XG4gICAgdGhyb3cgbmV3IEVycm9yKFwiS2FkaXJhOiBVbmtub3duIGRvY3MgZmV0Y2hlZCB0eXBlXCIpO1xuICB9XG59XG5cblB1YnN1Yk1vZGVsLnByb3RvdHlwZS50cmFja01zZ1NpemUgPSBmdW5jdGlvbihuYW1lLCB0eXBlLCBzaXplKSB7XG4gIHZhciB0aW1lc3RhbXAgPSBOdHAuX25vdygpO1xuICB2YXIgcHVibGljYXRpb25OYW1lID0gdGhpcy5fZ2V0UHVibGljYXRpb25OYW1lKG5hbWUpO1xuICB2YXIgcHVibGljYXRpb24gPSB0aGlzLl9nZXRNZXRyaWNzKHRpbWVzdGFtcCwgcHVibGljYXRpb25OYW1lKTtcblxuICBpZih0eXBlID09PSBcImxpdmVTZW50XCIpIHtcbiAgICBwdWJsaWNhdGlvbi5saXZlU2VudE1zZ1NpemUgKz0gc2l6ZTtcbiAgfSBlbHNlIGlmKHR5cGUgPT09IFwiaW5pdGlhbFNlbnRcIikge1xuICAgIHB1YmxpY2F0aW9uLmluaXRpYWxseVNlbnRNc2dTaXplICs9IHNpemU7XG4gIH0gZWxzZSB7XG4gICAgdGhyb3cgbmV3IEVycm9yKFwiS2FkaXJhOiBVbmtub3duIGRvY3MgZmV0Y2hlZCB0eXBlXCIpO1xuICB9XG59XG4iLCJ2YXIgRXZlbnRMb29wTW9uaXRvciA9IE5wbS5yZXF1aXJlKCdldmxvb3AtbW9uaXRvcicpO1xuaW1wb3J0IHsgY3JlYXRlSGlzdG9ncmFtIH0gZnJvbSAnLi4vdXRpbHMuanMnO1xuaW1wb3J0IEdDTWV0cmljcyBmcm9tICcuLi9oaWphY2svZ2MuanMnO1xuaW1wb3J0IHsgZ2V0RmliZXJNZXRyaWNzLCByZXNldEZpYmVyTWV0cmljcyB9IGZyb20gJy4uL2hpamFjay9hc3luYy5qcyc7XG5pbXBvcnQgeyBnZXRNb25nb0RyaXZlclN0YXRzLCByZXNldE1vbmdvRHJpdmVyU3RhdHMgfSBmcm9tICcuLi9oaWphY2svbW9uZ28tZHJpdmVyLWV2ZW50cy5qcyc7XG5cblN5c3RlbU1vZGVsID0gZnVuY3Rpb24gKCkge1xuICB0aGlzLnN0YXJ0VGltZSA9IE50cC5fbm93KCk7XG4gIHRoaXMubmV3U2Vzc2lvbnMgPSAwO1xuICB0aGlzLnNlc3Npb25UaW1lb3V0ID0gMTAwMCAqIDYwICogMzA7IC8vMzAgbWluXG5cbiAgdGhpcy5ldmxvb3BIaXN0b2dyYW0gPSBjcmVhdGVIaXN0b2dyYW0oKTtcbiAgdGhpcy5ldmxvb3BNb25pdG9yID0gbmV3IEV2ZW50TG9vcE1vbml0b3IoMjAwKTtcbiAgdGhpcy5ldmxvb3BNb25pdG9yLnN0YXJ0KCk7XG4gIHRoaXMuZXZsb29wTW9uaXRvci5vbignbGFnJywgbGFnID0+IHtcbiAgICAvLyBzdG9yZSBhcyBtaWNyb3NlY29uZFxuICAgIHRoaXMuZXZsb29wSGlzdG9ncmFtLmFkZChsYWcgKiAxMDAwKTtcbiAgfSk7XG5cbiAgdGhpcy5nY01ldHJpY3MgPSBuZXcgR0NNZXRyaWNzKCk7XG4gIHRoaXMuZ2NNZXRyaWNzLnN0YXJ0KCk7XG5cblxuICB0aGlzLmNwdVRpbWUgPSBwcm9jZXNzLmhydGltZSgpO1xuICB0aGlzLnByZXZpb3VzQ3B1VXNhZ2UgPSBwcm9jZXNzLmNwdVVzYWdlKCk7XG4gIHRoaXMuY3B1SGlzdG9yeSA9IFtdO1xuICB0aGlzLmN1cnJlbnRDcHVVc2FnZSA9IDA7XG5cbiAgc2V0SW50ZXJ2YWwoKCkgPT4ge1xuICAgIHRoaXMuY3B1VXNhZ2UoKTtcbiAgfSwgMjAwMCk7XG59XG5cbl8uZXh0ZW5kKFN5c3RlbU1vZGVsLnByb3RvdHlwZSwgS2FkaXJhTW9kZWwucHJvdG90eXBlKTtcblxuU3lzdGVtTW9kZWwucHJvdG90eXBlLmJ1aWxkUGF5bG9hZCA9IGZ1bmN0aW9uKCkge1xuICB2YXIgbWV0cmljcyA9IHt9O1xuICB2YXIgbm93ID0gTnRwLl9ub3coKTtcbiAgbWV0cmljcy5zdGFydFRpbWUgPSBLYWRpcmEuc3luY2VkRGF0ZS5zeW5jVGltZSh0aGlzLnN0YXJ0VGltZSk7XG4gIG1ldHJpY3MuZW5kVGltZSA9IEthZGlyYS5zeW5jZWREYXRlLnN5bmNUaW1lKG5vdyk7XG4gIG1ldHJpY3Muc2Vzc2lvbnMgPSBjb3VudEtleXMoTWV0ZW9yLnNlcnZlci5zZXNzaW9ucyk7XG5cbiAgbGV0IG1lbW9yeVVzYWdlID0gcHJvY2Vzcy5tZW1vcnlVc2FnZSgpO1xuICBtZXRyaWNzLm1lbW9yeSA9IG1lbW9yeVVzYWdlLnJzcyAvICgxMDI0KjEwMjQpO1xuICBtZXRyaWNzLm1lbW9yeUFycmF5QnVmZmVycyA9IChtZW1vcnlVc2FnZS5hcnJheUJ1ZmZlcnMgfHwgMCkgLyAoMTAyNCoxMDI0KTtcbiAgbWV0cmljcy5tZW1vcnlFeHRlcm5hbCA9IG1lbW9yeVVzYWdlLmV4dGVybmFsIC8gKDEwMjQqMTAyNCk7XG4gIG1ldHJpY3MubWVtb3J5SGVhcFVzZWQgPSBtZW1vcnlVc2FnZS5oZWFwVXNlZCAvICgxMDI0KjEwMjQpO1xuICBtZXRyaWNzLm1lbW9yeUhlYXBUb3RhbCA9IG1lbW9yeVVzYWdlLmhlYXBUb3RhbCAvICgxMDI0KjEwMjQpO1xuXG4gIG1ldHJpY3MubmV3U2Vzc2lvbnMgPSB0aGlzLm5ld1Nlc3Npb25zO1xuICB0aGlzLm5ld1Nlc3Npb25zID0gMDtcblxuICBtZXRyaWNzLmFjdGl2ZVJlcXVlc3RzID0gcHJvY2Vzcy5fZ2V0QWN0aXZlUmVxdWVzdHMoKS5sZW5ndGg7XG4gIG1ldHJpY3MuYWN0aXZlSGFuZGxlcyA9IHByb2Nlc3MuX2dldEFjdGl2ZUhhbmRsZXMoKS5sZW5ndGg7XG5cbiAgLy8gdHJhY2sgZXZlbnRsb29wIG1ldHJpY3NcbiAgbWV0cmljcy5wY3RFdmxvb3BCbG9jayA9IHRoaXMuZXZsb29wTW9uaXRvci5zdGF0dXMoKS5wY3RCbG9jaztcbiAgbWV0cmljcy5ldmxvb3BIaXN0b2dyYW0gPSB0aGlzLmV2bG9vcEhpc3RvZ3JhbTtcbiAgdGhpcy5ldmxvb3BIaXN0b2dyYW0gPSBjcmVhdGVIaXN0b2dyYW0oKTtcblxuICBtZXRyaWNzLmdjTWFqb3JEdXJhdGlvbiA9IHRoaXMuZ2NNZXRyaWNzLm1ldHJpY3MuZ2NNYWpvcjtcbiAgbWV0cmljcy5nY01pbm9yRHVyYXRpb24gPSB0aGlzLmdjTWV0cmljcy5tZXRyaWNzLmdjTWlub3I7XG4gIG1ldHJpY3MuZ2NJbmNyZW1lbnRhbER1cmF0aW9uID0gdGhpcy5nY01ldHJpY3MubWV0cmljcy5nY0luY3JlbWVudGFsO1xuICBtZXRyaWNzLmdjV2Vha0NCRHVyYXRpb24gPSB0aGlzLmdjTWV0cmljcy5tZXRyaWNzLmdjV2Vha0NCO1xuICB0aGlzLmdjTWV0cmljcy5yZXNldCgpO1xuXG4gIGNvbnN0IGRyaXZlck1ldHJpY3MgPSBnZXRNb25nb0RyaXZlclN0YXRzKCk7XG4gIHJlc2V0TW9uZ29Ecml2ZXJTdGF0cygpO1xuXG4gIG1ldHJpY3MubW9uZ29Qb29sU2l6ZSA9IGRyaXZlck1ldHJpY3MucG9vbFNpemU7XG4gIG1ldHJpY3MubW9uZ29Qb29sUHJpbWFyeUNoZWNrb3V0cyA9IGRyaXZlck1ldHJpY3MucHJpbWFyeUNoZWNrb3V0cztcbiAgbWV0cmljcy5tb25nb1Bvb2xPdGhlckNoZWNrb3V0cyA9IGRyaXZlck1ldHJpY3Mub3RoZXJDaGVja291dHM7XG4gIG1ldHJpY3MubW9uZ29Qb29sQ2hlY2tvdXRUaW1lID0gZHJpdmVyTWV0cmljcy5jaGVja291dFRpbWU7XG4gIG1ldHJpY3MubW9uZ29Qb29sTWF4Q2hlY2tvdXRUaW1lID0gZHJpdmVyTWV0cmljcy5tYXhDaGVja291dFRpbWU7XG4gIG1ldHJpY3MubW9uZ29Qb29sUGVuZGluZyA9IGRyaXZlck1ldHJpY3MucGVuZGluZztcbiAgbWV0cmljcy5tb25nb1Bvb2xDaGVja2VkT3V0Q29ubmVjdGlvbnMgPSBkcml2ZXJNZXRyaWNzLmNoZWNrZWRPdXQ7XG4gIG1ldHJpY3MubW9uZ29Qb29sQ3JlYXRlZENvbm5lY3Rpb25zID0gZHJpdmVyTWV0cmljcy5jcmVhdGVkO1xuXG4gIGNvbnN0IGZpYmVyTWV0cmljcyA9IGdldEZpYmVyTWV0cmljcygpO1xuICByZXNldEZpYmVyTWV0cmljcygpO1xuICBtZXRyaWNzLmNyZWF0ZWRGaWJlcnMgPSBmaWJlck1ldHJpY3MuY3JlYXRlZDtcbiAgbWV0cmljcy5hY3RpdmVGaWJlcnMgPSBmaWJlck1ldHJpY3MuYWN0aXZlO1xuICBtZXRyaWNzLmZpYmVyUG9vbFNpemUgPSBmaWJlck1ldHJpY3MucG9vbFNpemU7XG5cbiAgbWV0cmljcy5wY3B1ID0gMDtcbiAgbWV0cmljcy5wY3B1VXNlciA9IDA7XG4gIG1ldHJpY3MucGNwdVN5c3RlbSA9IDA7XG5cbiAgaWYgKHRoaXMuY3B1SGlzdG9yeS5sZW5ndGggPiAwKSB7XG4gICAgbGV0IGxhc3RDcHVVc2FnZSA9IHRoaXMuY3B1SGlzdG9yeVt0aGlzLmNwdUhpc3RvcnkubGVuZ3RoIC0gMV07XG4gICAgbWV0cmljcy5wY3B1ID0gbGFzdENwdVVzYWdlLnVzYWdlICogMTAwO1xuICAgIG1ldHJpY3MucGNwdVVzZXIgPSBsYXN0Q3B1VXNhZ2UudXNlciAqIDEwMDtcbiAgICBtZXRyaWNzLnBjcHVTeXN0ZW0gPSBsYXN0Q3B1VXNhZ2Uuc3lzICogMTAwO1xuICB9XG5cbiAgbWV0cmljcy5jcHVIaXN0b3J5ID0gdGhpcy5jcHVIaXN0b3J5Lm1hcChlbnRyeSA9PiB7XG4gICAgcmV0dXJuIHtcbiAgICAgIHRpbWU6IEthZGlyYS5zeW5jZWREYXRlLnN5bmNUaW1lKGVudHJ5LnRpbWUpLFxuICAgICAgdXNhZ2U6IGVudHJ5LnVzYWdlLFxuICAgICAgc3lzOiBlbnRyeS5zeXMsXG4gICAgICB1c2VyOiBlbnRyeS51c2VyXG4gICAgfTtcbiAgfSk7XG5cbiAgdGhpcy5jcHVIaXN0b3J5ID0gW107XG4gIHRoaXMuc3RhcnRUaW1lID0gbm93O1xuICByZXR1cm4ge3N5c3RlbU1ldHJpY3M6IFttZXRyaWNzXX07XG59O1xuXG5mdW5jdGlvbiBocnRpbWVUb01TKGhydGltZSkge1xuICByZXR1cm4gaHJ0aW1lWzBdICogMTAwMCArIGhydGltZVsxXSAvIDEwMDAwMDA7XG59XG5cblN5c3RlbU1vZGVsLnByb3RvdHlwZS5jcHVVc2FnZSA9IGZ1bmN0aW9uKCkge1xuICB2YXIgZWxhcFRpbWVNUyA9IGhydGltZVRvTVMocHJvY2Vzcy5ocnRpbWUodGhpcy5jcHVUaW1lKSk7XG4gIHZhciBlbGFwVXNhZ2UgPSBwcm9jZXNzLmNwdVVzYWdlKHRoaXMucHJldmlvdXNDcHVVc2FnZSk7XG4gIHZhciBlbGFwVXNlck1TID0gZWxhcFVzYWdlLnVzZXIgLyAxMDAwO1xuICB2YXIgZWxhcFN5c3RNUyA9IGVsYXBVc2FnZS5zeXN0ZW0gLyAxMDAwO1xuICB2YXIgdG90YWxVc2FnZU1TID0gZWxhcFVzZXJNUyArIGVsYXBTeXN0TVM7XG4gIHZhciB0b3RhbFVzYWdlUGVyY2VudCA9IHRvdGFsVXNhZ2VNUyAvIGVsYXBUaW1lTVM7XG5cbiAgdGhpcy5jcHVIaXN0b3J5LnB1c2goe1xuICAgIHRpbWU6IE50cC5fbm93KCksXG4gICAgdXNhZ2U6IHRvdGFsVXNhZ2VQZXJjZW50LFxuICAgIHVzZXI6IGVsYXBVc2VyTVMgLyBlbGFwVGltZU1TLFxuICAgIHN5czogZWxhcFN5c3RNUyAvIGVsYXBVc2FnZS5zeXN0ZW1cbiAgfSk7XG5cbiAgdGhpcy5jdXJyZW50Q3B1VXNhZ2UgPSB0b3RhbFVzYWdlUGVyY2VudCAqIDEwMDtcbiAgS2FkaXJhLmRvY1N6Q2FjaGUuc2V0UGNwdSh0aGlzLmN1cnJlbnRDcHVVc2FnZSk7XG5cbiAgdGhpcy5jcHVUaW1lID0gcHJvY2Vzcy5ocnRpbWUoKTtcbiAgdGhpcy5wcmV2aW91c0NwdVVzYWdlID0gcHJvY2Vzcy5jcHVVc2FnZSgpO1xufVxuXG5TeXN0ZW1Nb2RlbC5wcm90b3R5cGUuaGFuZGxlU2Vzc2lvbkFjdGl2aXR5ID0gZnVuY3Rpb24obXNnLCBzZXNzaW9uKSB7XG4gIGlmKG1zZy5tc2cgPT09ICdjb25uZWN0JyAmJiAhbXNnLnNlc3Npb24pIHtcbiAgICB0aGlzLmNvdW50TmV3U2Vzc2lvbihzZXNzaW9uKTtcbiAgfSBlbHNlIGlmKFsnc3ViJywgJ21ldGhvZCddLmluZGV4T2YobXNnLm1zZykgIT0gLTEpIHtcbiAgICBpZighdGhpcy5pc1Nlc3Npb25BY3RpdmUoc2Vzc2lvbikpIHtcbiAgICAgIHRoaXMuY291bnROZXdTZXNzaW9uKHNlc3Npb24pO1xuICAgIH1cbiAgfVxuICBzZXNzaW9uLl9hY3RpdmVBdCA9IERhdGUubm93KCk7XG59XG5cblN5c3RlbU1vZGVsLnByb3RvdHlwZS5jb3VudE5ld1Nlc3Npb24gPSBmdW5jdGlvbihzZXNzaW9uKSB7XG4gIGlmKCFpc0xvY2FsQWRkcmVzcyhzZXNzaW9uLnNvY2tldCkpIHtcbiAgICB0aGlzLm5ld1Nlc3Npb25zKys7XG4gIH1cbn1cblxuU3lzdGVtTW9kZWwucHJvdG90eXBlLmlzU2Vzc2lvbkFjdGl2ZSA9IGZ1bmN0aW9uKHNlc3Npb24pIHtcbiAgdmFyIGluYWN0aXZlVGltZSA9IERhdGUubm93KCkgLSBzZXNzaW9uLl9hY3RpdmVBdDtcbiAgcmV0dXJuIGluYWN0aXZlVGltZSA8IHRoaXMuc2Vzc2lvblRpbWVvdXQ7XG59XG5cbi8vIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0gLy9cblxuLy8gaHR0cDovL3JlZ2V4MTAxLmNvbS9yL2lGM3lSMy8yXG52YXIgaXNMb2NhbEhvc3RSZWdleCA9IC9eKD86LipcXC5sb2NhbHxsb2NhbGhvc3QpKD86XFw6XFxkKyk/fDEyNyg/OlxcLlxcZHsxLDN9KXszfXwxOTJcXC4xNjgoPzpcXC5cXGR7MSwzfSl7Mn18MTAoPzpcXC5cXGR7MSwzfSl7M318MTcyXFwuKD86MVs2LTldfDJcXGR8M1swLTFdKSg/OlxcLlxcZHsxLDN9KXsyfSQvO1xuXG4vLyBodHRwOi8vcmVnZXgxMDEuY29tL3IvaE01Z0Q4LzFcbnZhciBpc0xvY2FsQWRkcmVzc1JlZ2V4ID0gL14xMjcoPzpcXC5cXGR7MSwzfSl7M318MTkyXFwuMTY4KD86XFwuXFxkezEsM30pezJ9fDEwKD86XFwuXFxkezEsM30pezN9fDE3MlxcLig/OjFbNi05XXwyXFxkfDNbMC0xXSkoPzpcXC5cXGR7MSwzfSl7Mn0kLztcblxuZnVuY3Rpb24gaXNMb2NhbEFkZHJlc3MgKHNvY2tldCkge1xuICB2YXIgaG9zdCA9IHNvY2tldC5oZWFkZXJzWydob3N0J107XG4gIGlmKGhvc3QpIHJldHVybiBpc0xvY2FsSG9zdFJlZ2V4LnRlc3QoaG9zdCk7XG4gIHZhciBhZGRyZXNzID0gc29ja2V0LmhlYWRlcnNbJ3gtZm9yd2FyZGVkLWZvciddIHx8IHNvY2tldC5yZW1vdGVBZGRyZXNzO1xuICBpZihhZGRyZXNzKSByZXR1cm4gaXNMb2NhbEFkZHJlc3NSZWdleC50ZXN0KGFkZHJlc3MpO1xufVxuIiwiRXJyb3JNb2RlbCA9IGZ1bmN0aW9uIChhcHBJZCkge1xuICBCYXNlRXJyb3JNb2RlbC5jYWxsKHRoaXMpO1xuICB2YXIgc2VsZiA9IHRoaXM7XG4gIHRoaXMuYXBwSWQgPSBhcHBJZDtcbiAgdGhpcy5lcnJvcnMgPSB7fTtcbiAgdGhpcy5zdGFydFRpbWUgPSBEYXRlLm5vdygpO1xuICB0aGlzLm1heEVycm9ycyA9IDEwO1xufVxuXG5PYmplY3QuYXNzaWduKEVycm9yTW9kZWwucHJvdG90eXBlLCBLYWRpcmFNb2RlbC5wcm90b3R5cGUpO1xuT2JqZWN0LmFzc2lnbihFcnJvck1vZGVsLnByb3RvdHlwZSwgQmFzZUVycm9yTW9kZWwucHJvdG90eXBlKTtcblxuRXJyb3JNb2RlbC5wcm90b3R5cGUuYnVpbGRQYXlsb2FkID0gZnVuY3Rpb24oKSB7XG4gIHZhciBtZXRyaWNzID0gXy52YWx1ZXModGhpcy5lcnJvcnMpO1xuICB0aGlzLnN0YXJ0VGltZSA9IE50cC5fbm93KCk7XG5cbiAgbWV0cmljcy5mb3JFYWNoKGZ1bmN0aW9uIChtZXRyaWMpIHtcbiAgICBtZXRyaWMuc3RhcnRUaW1lID0gS2FkaXJhLnN5bmNlZERhdGUuc3luY1RpbWUobWV0cmljLnN0YXJ0VGltZSlcbiAgfSk7XG5cbiAgdGhpcy5lcnJvcnMgPSB7fTtcbiAgcmV0dXJuIHtlcnJvcnM6IG1ldHJpY3N9O1xufTtcblxuRXJyb3JNb2RlbC5wcm90b3R5cGUuZXJyb3JDb3VudCA9IGZ1bmN0aW9uICgpIHtcbiAgcmV0dXJuIF8udmFsdWVzKHRoaXMuZXJyb3JzKS5sZW5ndGg7XG59O1xuXG5FcnJvck1vZGVsLnByb3RvdHlwZS50cmFja0Vycm9yID0gZnVuY3Rpb24oZXgsIHRyYWNlKSB7XG4gIHZhciBrZXkgPSB0cmFjZS50eXBlICsgJzonICsgZXgubWVzc2FnZTtcbiAgaWYodGhpcy5lcnJvcnNba2V5XSkge1xuICAgIHRoaXMuZXJyb3JzW2tleV0uY291bnQrKztcbiAgfSBlbHNlIGlmICh0aGlzLmVycm9yQ291bnQoKSA8IHRoaXMubWF4RXJyb3JzKSB7XG4gICAgdmFyIGVycm9yRGVmID0gdGhpcy5fZm9ybWF0RXJyb3IoZXgsIHRyYWNlKTtcbiAgICBpZih0aGlzLmFwcGx5RmlsdGVycyhlcnJvckRlZi50eXBlLCBlcnJvckRlZi5uYW1lLCBleCwgZXJyb3JEZWYuc3ViVHlwZSkpIHtcbiAgICAgIHRoaXMuZXJyb3JzW2tleV0gPSB0aGlzLl9mb3JtYXRFcnJvcihleCwgdHJhY2UpO1xuICAgIH1cbiAgfVxufTtcblxuRXJyb3JNb2RlbC5wcm90b3R5cGUuX2Zvcm1hdEVycm9yID0gZnVuY3Rpb24oZXgsIHRyYWNlKSB7XG4gIHZhciB0aW1lID0gRGF0ZS5ub3coKTtcbiAgdmFyIHN0YWNrID0gZXguc3RhY2s7XG5cbiAgLy8gdG8gZ2V0IE1ldGVvcidzIEVycm9yIGRldGFpbHNcbiAgaWYoZXguZGV0YWlscykge1xuICAgIHN0YWNrID0gXCJEZXRhaWxzOiBcIiArIGV4LmRldGFpbHMgKyBcIlxcclxcblwiICsgc3RhY2s7XG4gIH1cblxuICAvLyBVcGRhdGUgdHJhY2UncyBlcnJvciBldmVudCB3aXRoIHRoZSBuZXh0IHN0YWNrXG4gIHZhciBlcnJvckV2ZW50ID0gdHJhY2UuZXZlbnRzICYmIHRyYWNlLmV2ZW50c1t0cmFjZS5ldmVudHMubGVuZ3RoIC0xXTtcbiAgdmFyIGVycm9yT2JqZWN0ID0gZXJyb3JFdmVudCAmJiBlcnJvckV2ZW50WzJdICYmIGVycm9yRXZlbnRbMl0uZXJyb3I7XG5cbiAgaWYoZXJyb3JPYmplY3QpIHtcbiAgICBlcnJvck9iamVjdC5zdGFjayA9IHN0YWNrO1xuICB9XG5cbiAgcmV0dXJuIHtcbiAgICBhcHBJZDogdGhpcy5hcHBJZCxcbiAgICBuYW1lOiBleC5tZXNzYWdlLFxuICAgIHR5cGU6IHRyYWNlLnR5cGUsXG4gICAgc3RhcnRUaW1lOiB0aW1lLFxuICAgIHN1YlR5cGU6IHRyYWNlLnN1YlR5cGUgfHwgdHJhY2UubmFtZSxcbiAgICB0cmFjZTogdHJhY2UsXG4gICAgc3RhY2tzOiBbe3N0YWNrOiBzdGFja31dLFxuICAgIGNvdW50OiAxXG4gIH1cbn07XG4iLCJjb25zdCB7IEREU2tldGNoIH0gPSByZXF1aXJlKCdtb250aS1hcG0tc2tldGNoZXMtanMnKTtcblxuY29uc3QgTUVUSE9EX01FVFJJQ1NfRklFTERTID0gWydkYicsICdodHRwJywgJ2VtYWlsJywgJ2FzeW5jJywgJ2NvbXB1dGUnLCAndG90YWwnLCAnZnMnXTtcblxuXG5jb25zdCBIdHRwTW9kZWwgPSBmdW5jdGlvbiAoKSB7XG4gIHRoaXMubWV0cmljc0J5TWludXRlID0gT2JqZWN0LmNyZWF0ZShudWxsKTtcbiAgdGhpcy50cmFjZXJTdG9yZSA9IG5ldyBUcmFjZXJTdG9yZSh7XG4gICAgaW50ZXJ2YWw6IDEwMDAgKiAxMCxcbiAgICBtYXhUb3RhbFBvaW50czogMzAsXG4gICAgYXJjaGl2ZUV2ZXJ5OiAxMFxuICB9KTtcblxuICB0aGlzLnRyYWNlclN0b3JlLnN0YXJ0KCk7XG59XG5cbl8uZXh0ZW5kKEh0dHBNb2RlbC5wcm90b3R5cGUsIEthZGlyYU1vZGVsLnByb3RvdHlwZSk7XG5cbkh0dHBNb2RlbC5wcm90b3R5cGUucHJvY2Vzc1JlcXVlc3QgPSBmdW5jdGlvbiAodHJhY2UsIHJlcSwgcmVzKSB7XG4gIGNvbnN0IGRhdGVJZCA9IHRoaXMuX2dldERhdGVJZCh0cmFjZS5hdCk7XG4gIHRoaXMuX2FwcGVuZE1ldHJpY3MoZGF0ZUlkLCB0cmFjZSwgcmVzKTtcbiAgdGhpcy50cmFjZXJTdG9yZS5hZGRUcmFjZSh0cmFjZSk7XG59XG5cbkh0dHBNb2RlbC5wcm90b3R5cGUuX2dldE1ldHJpY3MgPSBmdW5jdGlvbiAodGltZXN0YW1wLCByb3V0ZUlkKSB7XG4gIGNvbnN0IGRhdGVJZCA9IHRoaXMuX2dldERhdGVJZCh0aW1lc3RhbXApO1xuXG4gIGlmICghdGhpcy5tZXRyaWNzQnlNaW51dGVbZGF0ZUlkXSkge1xuICAgIHRoaXMubWV0cmljc0J5TWludXRlW2RhdGVJZF0gPSB7XG4gICAgICByb3V0ZXM6IE9iamVjdC5jcmVhdGUobnVsbClcbiAgICB9O1xuICB9XG5cbiAgY29uc3Qgcm91dGVzID0gdGhpcy5tZXRyaWNzQnlNaW51dGVbZGF0ZUlkXS5yb3V0ZXM7XG5cbiAgaWYgKCFyb3V0ZXNbcm91dGVJZF0pIHtcbiAgICByb3V0ZXNbcm91dGVJZF0gPSB7XG4gICAgICBoaXN0b2dyYW06IG5ldyBERFNrZXRjaCh7XG4gICAgICAgIGFscGhhOiAwLjAyLFxuICAgICAgfSksXG4gICAgICBjb3VudDogMCxcbiAgICAgIGVycm9yczogMCxcbiAgICAgIHN0YXR1c0NvZGVzOiBPYmplY3QuY3JlYXRlKG51bGwpXG4gICAgfTtcblxuICAgIE1FVEhPRF9NRVRSSUNTX0ZJRUxEUy5mb3JFYWNoKGZ1bmN0aW9uIChmaWVsZCkge1xuICAgICAgcm91dGVzW3JvdXRlSWRdW2ZpZWxkXSA9IDA7XG4gICAgfSk7XG4gIH1cblxuICByZXR1cm4gdGhpcy5tZXRyaWNzQnlNaW51dGVbZGF0ZUlkXS5yb3V0ZXNbcm91dGVJZF07XG59XG5cbkh0dHBNb2RlbC5wcm90b3R5cGUuX2FwcGVuZE1ldHJpY3MgPSBmdW5jdGlvbiAoZGF0ZUlkLCB0cmFjZSwgcmVzKSB7XG4gIHZhciByZXF1ZXN0TWV0cmljcyA9IHRoaXMuX2dldE1ldHJpY3MoZGF0ZUlkLCB0cmFjZS5uYW1lKTtcblxuICBpZiAoIXRoaXMubWV0cmljc0J5TWludXRlW2RhdGVJZF0uc3RhcnRUaW1lKSB7XG4gICAgdGhpcy5tZXRyaWNzQnlNaW51dGVbZGF0ZUlkXS5zdGFydFRpbWUgPSB0cmFjZS5hdDtcbiAgfVxuXG4gIC8vIG1lcmdlXG4gIE1FVEhPRF9NRVRSSUNTX0ZJRUxEUy5mb3JFYWNoKGZpZWxkID0+IHtcbiAgICB2YXIgdmFsdWUgPSB0cmFjZS5tZXRyaWNzW2ZpZWxkXTtcbiAgICBpZiAodmFsdWUgPiAwKSB7XG4gICAgICByZXF1ZXN0TWV0cmljc1tmaWVsZF0gKz0gdmFsdWU7XG4gICAgfVxuICB9KTtcblxuICBjb25zdCBzdGF0dXNDb2RlID0gcmVzLnN0YXR1c0NvZGU7XG4gIGxldCBzdGF0dXNNZXRyaWM7XG5cbiAgaWYgKHN0YXR1c0NvZGUgPCAyMDApIHtcbiAgICBzdGF0dXNNZXRyaWMgPSAnMXh4JztcbiAgfSBlbHNlIGlmIChzdGF0dXNDb2RlIDwgMzAwKSB7XG4gICAgc3RhdHVzTWV0cmljID0gJzJ4eCc7XG4gIH0gZWxzZSBpZiAoc3RhdHVzQ29kZSA8IDQwMCkge1xuICAgIHN0YXR1c01ldHJpYyA9ICczeHgnO1xuICB9IGVsc2UgaWYgKHN0YXR1c0NvZGUgPCA1MDApIHtcbiAgICBzdGF0dXNNZXRyaWMgPSAnNHh4JztcbiAgfSBlbHNlIGlmIChzdGF0dXNDb2RlIDwgNjAwKSB7XG4gICAgc3RhdHVzTWV0cmljID0gJzV4eCc7XG4gIH1cblxuICByZXF1ZXN0TWV0cmljcy5zdGF0dXNDb2Rlc1tzdGF0dXNNZXRyaWNdID0gcmVxdWVzdE1ldHJpY3Muc3RhdHVzQ29kZXNbc3RhdHVzTWV0cmljXSB8fCAwO1xuICByZXF1ZXN0TWV0cmljcy5zdGF0dXNDb2Rlc1tzdGF0dXNNZXRyaWNdICs9IDE7XG5cbiAgcmVxdWVzdE1ldHJpY3MuY291bnQgKz0gMTtcbiAgcmVxdWVzdE1ldHJpY3MuaGlzdG9ncmFtLmFkZCh0cmFjZS5tZXRyaWNzLnRvdGFsKTtcbiAgdGhpcy5tZXRyaWNzQnlNaW51dGVbZGF0ZUlkXS5lbmRUaW1lID0gdHJhY2UubWV0cmljcy5hdDtcbn1cblxuSHR0cE1vZGVsLnByb3RvdHlwZS5idWlsZFBheWxvYWQgPSBmdW5jdGlvbigpIHtcbiAgdmFyIHBheWxvYWQgPSB7XG4gICAgaHR0cE1ldHJpY3M6IFtdLFxuICAgIGh0dHBSZXF1ZXN0czogW11cbiAgfTtcblxuICB2YXIgbWV0cmljc0J5TWludXRlID0gdGhpcy5tZXRyaWNzQnlNaW51dGU7XG4gIHRoaXMubWV0cmljc0J5TWludXRlID0gT2JqZWN0LmNyZWF0ZShudWxsKTtcblxuICBmb3IodmFyIGtleSBpbiBtZXRyaWNzQnlNaW51dGUpIHtcbiAgICB2YXIgbWV0cmljcyA9IG1ldHJpY3NCeU1pbnV0ZVtrZXldO1xuICAgIC8vIGNvbnZlcnQgc3RhcnRUaW1lIGludG8gdGhlIGFjdHVhbCBzZXJ2ZXJUaW1lXG4gICAgdmFyIHN0YXJ0VGltZSA9IG1ldHJpY3Muc3RhcnRUaW1lO1xuICAgIG1ldHJpY3Muc3RhcnRUaW1lID0gS2FkaXJhLnN5bmNlZERhdGUuc3luY1RpbWUoc3RhcnRUaW1lKTtcblxuICAgIGZvcih2YXIgcmVxdWVzdE5hbWUgaW4gbWV0cmljcy5yb3V0ZXMpIHtcbiAgICAgIE1FVEhPRF9NRVRSSUNTX0ZJRUxEUy5mb3JFYWNoKGZ1bmN0aW9uIChmaWVsZCkge1xuICAgICAgICBtZXRyaWNzLnJvdXRlc1tyZXF1ZXN0TmFtZV1bZmllbGRdIC89IG1ldHJpY3Mucm91dGVzW3JlcXVlc3ROYW1lXS5jb3VudDtcbiAgICAgIH0pO1xuICAgIH1cblxuICAgIHBheWxvYWQuaHR0cE1ldHJpY3MucHVzaChtZXRyaWNzQnlNaW51dGVba2V5XSk7XG4gIH1cblxuICBwYXlsb2FkLmh0dHBSZXF1ZXN0cyA9IHRoaXMudHJhY2VyU3RvcmUuY29sbGVjdFRyYWNlcygpO1xuXG4gIHJldHVybiBwYXlsb2FkO1xufVxuXG5leHBvcnQgZGVmYXVsdCBIdHRwTW9kZWw7XG4iLCJ2YXIgSm9icyA9IEthZGlyYS5Kb2JzID0ge307XG5cbkpvYnMuZ2V0QXN5bmMgPSBmdW5jdGlvbihpZCwgY2FsbGJhY2spIHtcbiAgS2FkaXJhLmNvcmVBcGkuZ2V0Sm9iKGlkKVxuICAgIC50aGVuKGZ1bmN0aW9uKGRhdGEpIHtcbiAgICAgIGNhbGxiYWNrKG51bGwsIGRhdGEpO1xuICAgIH0pXG4gICAgLmNhdGNoKGZ1bmN0aW9uKGVycikge1xuICAgICAgY2FsbGJhY2soZXJyKVxuICAgIH0pO1xufTtcblxuXG5Kb2JzLnNldEFzeW5jID0gZnVuY3Rpb24oaWQsIGNoYW5nZXMsIGNhbGxiYWNrKSB7XG4gIEthZGlyYS5jb3JlQXBpLnVwZGF0ZUpvYihpZCwgY2hhbmdlcylcbiAgICAudGhlbihmdW5jdGlvbihkYXRhKSB7XG4gICAgICBjYWxsYmFjayhudWxsLCBkYXRhKTtcbiAgICB9KVxuICAgIC5jYXRjaChmdW5jdGlvbihlcnIpIHtcbiAgICAgIGNhbGxiYWNrKGVycilcbiAgICB9KTtcbn07XG5cbkpvYnMuc2V0ID0gS2FkaXJhLl93cmFwQXN5bmMoSm9icy5zZXRBc3luYyk7XG5Kb2JzLmdldCA9IEthZGlyYS5fd3JhcEFzeW5jKEpvYnMuZ2V0QXN5bmMpO1xuIiwiLy8gUmV0cnkgbG9naWMgd2l0aCBhbiBleHBvbmVudGlhbCBiYWNrb2ZmLlxuLy9cbi8vIG9wdGlvbnM6XG4vLyAgYmFzZVRpbWVvdXQ6IHRpbWUgZm9yIGluaXRpYWwgcmVjb25uZWN0IGF0dGVtcHQgKG1zKS5cbi8vICBleHBvbmVudDogZXhwb25lbnRpYWwgZmFjdG9yIHRvIGluY3JlYXNlIHRpbWVvdXQgZWFjaCBhdHRlbXB0LlxuLy8gIG1heFRpbWVvdXQ6IG1heGltdW0gdGltZSBiZXR3ZWVuIHJldHJpZXMgKG1zKS5cbi8vICBtaW5Db3VudDogaG93IG1hbnkgdGltZXMgdG8gcmVjb25uZWN0IFwiaW5zdGFudGx5XCIuXG4vLyAgbWluVGltZW91dDogdGltZSB0byB3YWl0IGZvciB0aGUgZmlyc3QgYG1pbkNvdW50YCByZXRyaWVzIChtcykuXG4vLyAgZnV6ejogZmFjdG9yIHRvIHJhbmRvbWl6ZSByZXRyeSB0aW1lcyBieSAodG8gYXZvaWQgcmV0cnkgc3Rvcm1zKS5cblxuLy9UT0RPOiByZW1vdmUgdGhpcyBjbGFzcyBhbmQgdXNlIE1ldGVvciBSZXRyeSBpbiBhIGxhdGVyIHZlcnNpb24gb2YgbWV0ZW9yLlxuXG5SZXRyeSA9IGNsYXNzIHtcbiAgY29uc3RydWN0b3IgKHtcbiAgICBiYXNlVGltZW91dCA9IDEwMDAsIC8vIDEgc2Vjb25kXG4gICAgZXhwb25lbnQgPSAyLjIsXG4gICAgLy8gVGhlIGRlZmF1bHQgaXMgaGlnaC1pc2ggdG8gZW5zdXJlIGEgc2VydmVyIGNhbiByZWNvdmVyIGZyb20gYVxuICAgIC8vIGZhaWx1cmUgY2F1c2VkIGJ5IGxvYWQuXG4gICAgbWF4VGltZW91dCA9IDUgKiA2MDAwMCwgLy8gNSBtaW51dGVzXG4gICAgbWluVGltZW91dCA9IDEwLFxuICAgIG1pbkNvdW50ID0gMixcbiAgICBmdXp6ID0gMC41LCAvLyArLSAyNSVcbiAgfSA9IHt9KSB7XG4gICAgdGhpcy5iYXNlVGltZW91dCA9IGJhc2VUaW1lb3V0O1xuICAgIHRoaXMuZXhwb25lbnQgPSBleHBvbmVudDtcbiAgICB0aGlzLm1heFRpbWVvdXQgPSBtYXhUaW1lb3V0O1xuICAgIHRoaXMubWluVGltZW91dCA9IG1pblRpbWVvdXQ7XG4gICAgdGhpcy5taW5Db3VudCA9IG1pbkNvdW50O1xuICAgIHRoaXMuZnV6eiA9IGZ1eno7XG4gICAgdGhpcy5yZXRyeVRpbWVyID0gbnVsbDtcbiAgfVxuXG4gIC8vIFJlc2V0IGEgcGVuZGluZyByZXRyeSwgaWYgYW55LlxuICBjbGVhcigpIHtcbiAgICBpZih0aGlzLnJldHJ5VGltZXIpXG4gICAgICBjbGVhclRpbWVvdXQodGhpcy5yZXRyeVRpbWVyKTtcbiAgICB0aGlzLnJldHJ5VGltZXIgPSBudWxsO1xuICB9XG5cbiAgLy8gQ2FsY3VsYXRlIGhvdyBsb25nIHRvIHdhaXQgaW4gbWlsbGlzZWNvbmRzIHRvIHJldHJ5LCBiYXNlZCBvbiB0aGVcbiAgLy8gYGNvdW50YCBvZiB3aGljaCByZXRyeSB0aGlzIGlzLlxuICBfdGltZW91dChjb3VudCkge1xuICAgIGlmKGNvdW50IDwgdGhpcy5taW5Db3VudClcbiAgICAgIHJldHVybiB0aGlzLm1pblRpbWVvdXQ7XG5cbiAgICBsZXQgdGltZW91dCA9IE1hdGgubWluKFxuICAgICAgdGhpcy5tYXhUaW1lb3V0LFxuICAgICAgdGhpcy5iYXNlVGltZW91dCAqIE1hdGgucG93KHRoaXMuZXhwb25lbnQsIGNvdW50KSk7XG4gICAgLy8gZnV6eiB0aGUgdGltZW91dCByYW5kb21seSwgdG8gYXZvaWQgcmVjb25uZWN0IHN0b3JtcyB3aGVuIGFcbiAgICAvLyBzZXJ2ZXIgZ29lcyBkb3duLlxuICAgIHRpbWVvdXQgPSB0aW1lb3V0ICogKChSYW5kb20uZnJhY3Rpb24oKSAqIHRoaXMuZnV6eikgK1xuICAgICAgICAgICAgICAgICAgICAgICAgICgxIC0gdGhpcy5mdXp6LzIpKTtcbiAgICByZXR1cm4gTWF0aC5jZWlsKHRpbWVvdXQpO1xuICB9XG5cbiAgLy8gQ2FsbCBgZm5gIGFmdGVyIGEgZGVsYXksIGJhc2VkIG9uIHRoZSBgY291bnRgIG9mIHdoaWNoIHJldHJ5IHRoaXMgaXMuXG4gIHJldHJ5TGF0ZXIoY291bnQsIGZuKSB7XG4gICAgY29uc3QgdGltZW91dCA9IHRoaXMuX3RpbWVvdXQoY291bnQpO1xuICAgIGlmKHRoaXMucmV0cnlUaW1lcilcbiAgICAgIGNsZWFyVGltZW91dCh0aGlzLnJldHJ5VGltZXIpO1xuXG4gICAgdGhpcy5yZXRyeVRpbWVyID0gc2V0VGltZW91dChmbiwgdGltZW91dCk7XG4gICAgcmV0dXJuIHRpbWVvdXQ7XG4gIH1cblxufVxuXG4iLCJjb25zdCB7IEREU2tldGNoIH0gPSByZXF1aXJlKCdtb250aS1hcG0tc2tldGNoZXMtanMnKTtcblxuSGF2ZUFzeW5jQ2FsbGJhY2sgPSBmdW5jdGlvbihhcmdzKSB7XG4gIHZhciBsYXN0QXJnID0gYXJnc1thcmdzLmxlbmd0aCAtMV07XG4gIHJldHVybiAodHlwZW9mIGxhc3RBcmcpID09ICdmdW5jdGlvbic7XG59O1xuXG5VbmlxdWVJZCA9IGZ1bmN0aW9uKHN0YXJ0KSB7XG4gIHRoaXMuaWQgPSAwO1xufVxuXG5VbmlxdWVJZC5wcm90b3R5cGUuZ2V0ID0gZnVuY3Rpb24oKSB7XG4gIHJldHVybiBcIlwiICsgdGhpcy5pZCsrO1xufTtcblxuRGVmYXVsdFVuaXF1ZUlkID0gbmV3IFVuaXF1ZUlkKCk7XG5cbi8vIGNyZWF0ZXMgYSBzdGFjayB0cmFjZSwgcmVtb3ZpbmcgZnJhbWVzIGluIG1vbnRpYXBtOmFnZW50J3MgY29kZVxuQ3JlYXRlVXNlclN0YWNrID0gZnVuY3Rpb24gKGVycm9yKSB7XG4gIGNvbnN0IHN0YWNrID0gKGVycm9yIHx8IG5ldyBFcnJvcigpKS5zdGFjay5zcGxpdCgnXFxuJyk7XG4gIGxldCB0b1JlbW92ZSA9IDE7XG5cbiAgLy8gRmluZCBob3cgbWFueSBmcmFtZXMgbmVlZCB0byBiZSByZW1vdmVkXG4gIC8vIHRvIG1ha2UgdGhlIHVzZXIncyBjb2RlIHRoZSBmaXJzdCBmcmFtZVxuICBmb3IgKDsgdG9SZW1vdmUgPCBzdGFjay5sZW5ndGg7IHRvUmVtb3ZlKyspIHtcbiAgICBpZiAoc3RhY2tbdG9SZW1vdmVdLmluZGV4T2YoJ21vbnRpYXBtOmFnZW50JykgPT09IC0xKSB7XG4gICAgICBicmVhaztcbiAgICB9XG4gIH1cblxuICByZXR1cm4gc3RhY2suc2xpY2UodG9SZW1vdmUpLmpvaW4oJ1xcbicpO1xufVxuXG4vLyBPcHRpbWl6ZWQgdmVyc2lvbiBvZiBhcHBseSB3aGljaCB0cmllcyB0byBjYWxsIGFzIHBvc3NpYmxlIGFzIGl0IGNhblxuLy8gVGhlbiBmYWxsIGJhY2sgdG8gYXBwbHlcbi8vIFRoaXMgaXMgYmVjYXVzZSwgdjggaXMgdmVyeSBzbG93IHRvIGludm9rZSBhcHBseS5cbk9wdGltaXplZEFwcGx5ID0gZnVuY3Rpb24gT3B0aW1pemVkQXBwbHkoY29udGV4dCwgZm4sIGFyZ3MpIHtcbiAgdmFyIGEgPSBhcmdzO1xuICBzd2l0Y2goYS5sZW5ndGgpIHtcbiAgICBjYXNlIDA6XG4gICAgICByZXR1cm4gZm4uY2FsbChjb250ZXh0KTtcbiAgICBjYXNlIDE6XG4gICAgICByZXR1cm4gZm4uY2FsbChjb250ZXh0LCBhWzBdKTtcbiAgICBjYXNlIDI6XG4gICAgICByZXR1cm4gZm4uY2FsbChjb250ZXh0LCBhWzBdLCBhWzFdKTtcbiAgICBjYXNlIDM6XG4gICAgICByZXR1cm4gZm4uY2FsbChjb250ZXh0LCBhWzBdLCBhWzFdLCBhWzJdKTtcbiAgICBjYXNlIDQ6XG4gICAgICByZXR1cm4gZm4uY2FsbChjb250ZXh0LCBhWzBdLCBhWzFdLCBhWzJdLCBhWzNdKTtcbiAgICBjYXNlIDU6XG4gICAgICByZXR1cm4gZm4uY2FsbChjb250ZXh0LCBhWzBdLCBhWzFdLCBhWzJdLCBhWzNdLCBhWzRdKTtcbiAgICBkZWZhdWx0OlxuICAgICAgcmV0dXJuIGZuLmFwcGx5KGNvbnRleHQsIGEpO1xuICB9XG59XG5cbmdldENsaWVudFZlcnNpb25zID0gZnVuY3Rpb24gKCkge1xuICByZXR1cm4ge1xuICAgICd3ZWIuY29yZG92YSc6IGdldENsaWVudEFyY2hWZXJzaW9uKCd3ZWIuY29yZG92YScpLFxuICAgICd3ZWIuYnJvd3Nlcic6IGdldENsaWVudEFyY2hWZXJzaW9uKCd3ZWIuYnJvd3NlcicpLFxuICAgICd3ZWIuYnJvd3Nlci5sZWdhY3knOiBnZXRDbGllbnRBcmNoVmVyc2lvbignd2ViLmJyb3dzZXIubGVnYWN5JylcbiAgfVxufVxuXG4vLyBSZXR1cm5zIG51bWJlciBvZiBrZXlzIG9mIGFuIG9iamVjdCwgb3Igc2l6ZSBvZiBhIE1hcCBvciBTZXRcbmNvdW50S2V5cyA9IGZ1bmN0aW9uIChvYmopIHtcbiAgaWYgKG9iaiBpbnN0YW5jZW9mIE1hcCB8fCBvYmogaW5zdGFuY2VvZiBTZXQpIHtcbiAgICByZXR1cm4gb2JqLnNpemU7XG4gIH1cblxuICByZXR1cm4gT2JqZWN0LmtleXMob2JqKS5sZW5ndGg7XG59XG5cbi8vIEl0ZXJhdGVzIG9iamVjdHMgYW5kIG1hcHMuXG4vLyBDYWxsYmFjayBpcyBjYWxsZWQgd2l0aCBhIHZhbHVlIGFuZCBrZXlcbml0ZXJhdGUgPSBmdW5jdGlvbiAob2JqLCBjYWxsYmFjaykge1xuICBpZiAob2JqIGluc3RhbmNlb2YgTWFwKSB7XG4gICAgcmV0dXJuIG9iai5mb3JFYWNoKGNhbGxiYWNrKTtcbiAgfVxuXG4gIGZvciAodmFyIGtleSBpbiBvYmopIHtcbiAgICB2YXIgdmFsdWUgPSBvYmpba2V5XTtcbiAgICBjYWxsYmFjayh2YWx1ZSwga2V5KTtcbiAgfVxufVxuXG4vLyBSZXR1cm5zIGEgcHJvcGVydHkgZnJvbSBhbiBvYmplY3QsIG9yIGFuIGVudHJ5IGZyb20gYSBtYXBcbmdldFByb3BlcnR5ID0gZnVuY3Rpb24gKG9iaiwga2V5KSB7XG4gIGlmIChvYmogaW5zdGFuY2VvZiBNYXApIHtcbiAgICByZXR1cm4gb2JqLmdldChrZXkpO1xuICB9XG5cbiAgcmV0dXJuIG9ialtrZXldO1xufVxuXG5leHBvcnQgZnVuY3Rpb24gY3JlYXRlSGlzdG9ncmFtICgpIHtcbiAgcmV0dXJuIG5ldyBERFNrZXRjaCh7XG4gICAgYWxwaGE6IDAuMDJcbiAgfSk7XG59XG4iLCJ2YXIgbG9nZ2VyID0gZ2V0TG9nZ2VyKCk7XG5cbk50cCA9IGZ1bmN0aW9uIChlbmRwb2ludCkge1xuICB0aGlzLnBhdGggPSAnL3NpbXBsZW50cC9zeW5jJztcbiAgdGhpcy5zZXRFbmRwb2ludChlbmRwb2ludCk7XG4gIHRoaXMuZGlmZiA9IDA7XG4gIHRoaXMuc3luY2VkID0gZmFsc2U7XG4gIHRoaXMucmVTeW5jQ291bnQgPSAwO1xuICB0aGlzLnJlU3luYyA9IG5ldyBSZXRyeSh7XG4gICAgYmFzZVRpbWVvdXQ6IDEwMDAqNjAsXG4gICAgbWF4VGltZW91dDogMTAwMCo2MCoxMCxcbiAgICBtaW5Db3VudDogMFxuICB9KTtcbn1cblxuTnRwLl9ub3cgPSBmdW5jdGlvbigpIHtcbiAgdmFyIG5vdyA9IERhdGUubm93KCk7XG4gIGlmKHR5cGVvZiBub3cgPT0gJ251bWJlcicpIHtcbiAgICByZXR1cm4gbm93O1xuICB9IGVsc2UgaWYobm93IGluc3RhbmNlb2YgRGF0ZSkge1xuICAgIC8vIHNvbWUgZXh0ZW5hbCBKUyBsaWJyYXJpZXMgb3ZlcnJpZGUgRGF0ZS5ub3cgYW5kIHJldHVybnMgYSBEYXRlIG9iamVjdFxuICAgIC8vIHdoaWNoIGRpcmVjdGx5IGFmZmVjdCB1cy4gU28gd2UgbmVlZCB0byBwcmVwYXJlIGZvciB0aGF0XG4gICAgcmV0dXJuIG5vdy5nZXRUaW1lKCk7XG4gIH0gZWxzZSB7XG4gICAgLy8gdHJ1c3QgbWUuIEkndmUgc2VlbiBub3cgPT09IHVuZGVmaW5lZFxuICAgIHJldHVybiAobmV3IERhdGUoKSkuZ2V0VGltZSgpO1xuICB9XG59O1xuXG5OdHAucHJvdG90eXBlLnNldEVuZHBvaW50ID0gZnVuY3Rpb24oZW5kcG9pbnQpIHtcbiAgdGhpcy5lbmRwb2ludCA9IGVuZHBvaW50ICsgdGhpcy5wYXRoO1xufTtcblxuTnRwLnByb3RvdHlwZS5nZXRUaW1lID0gZnVuY3Rpb24oKSB7XG4gIHJldHVybiBOdHAuX25vdygpICsgTWF0aC5yb3VuZCh0aGlzLmRpZmYpO1xufTtcblxuTnRwLnByb3RvdHlwZS5zeW5jVGltZSA9IGZ1bmN0aW9uKGxvY2FsVGltZSkge1xuICByZXR1cm4gbG9jYWxUaW1lICsgTWF0aC5jZWlsKHRoaXMuZGlmZik7XG59O1xuXG5OdHAucHJvdG90eXBlLnN5bmMgPSBmdW5jdGlvbigpIHtcbiAgbG9nZ2VyKCdpbml0IHN5bmMnKTtcbiAgdmFyIHNlbGYgPSB0aGlzO1xuICB2YXIgcmV0cnlDb3VudCA9IDA7XG4gIHZhciByZXRyeSA9IG5ldyBSZXRyeSh7XG4gICAgYmFzZVRpbWVvdXQ6IDEwMDAqMjAsXG4gICAgbWF4VGltZW91dDogMTAwMCo2MCxcbiAgICBtaW5Db3VudDogMSxcbiAgICBtaW5UaW1lb3V0OiAwXG4gIH0pO1xuICBzeW5jVGltZSgpO1xuXG4gIGZ1bmN0aW9uIHN5bmNUaW1lICgpIHtcbiAgICBpZihyZXRyeUNvdW50PDUpIHtcbiAgICAgIGxvZ2dlcignYXR0ZW1wdCB0aW1lIHN5bmMgd2l0aCBzZXJ2ZXInLCByZXRyeUNvdW50KTtcbiAgICAgIC8vIGlmIHdlIHNlbmQgMCB0byB0aGUgcmV0cnlMYXRlciwgY2FjaGVEbnMgd2lsbCBydW4gaW1tZWRpYXRlbHlcbiAgICAgIHJldHJ5LnJldHJ5TGF0ZXIocmV0cnlDb3VudCsrLCBjYWNoZURucyk7XG4gICAgfSBlbHNlIHtcbiAgICAgIGxvZ2dlcignbWF4aW11bSByZXRyaWVzIHJlYWNoZWQnKTtcbiAgICAgIHNlbGYucmVTeW5jLnJldHJ5TGF0ZXIoc2VsZi5yZVN5bmNDb3VudCsrLCBmdW5jdGlvbiAoKSB7XG4gICAgICAgIHZhciBhcmdzID0gW10uc2xpY2UuY2FsbChhcmd1bWVudHMpO1xuICAgICAgICBzZWxmLnN5bmMuYXBwbHkoc2VsZiwgYXJncyk7XG4gICAgICB9KTtcbiAgICB9XG4gIH1cblxuICAvLyBmaXJzdCBhdHRlbXB0IGlzIHRvIGNhY2hlIGRucy4gU28sIGNhbGN1bGF0aW9uIGRvZXMgbm90XG4gIC8vIGluY2x1ZGUgRE5TIHJlc29sdXRpb24gdGltZVxuICBmdW5jdGlvbiBjYWNoZURucyAoKSB7XG4gICAgc2VsZi5nZXRTZXJ2ZXJUaW1lKGZ1bmN0aW9uKGVycikge1xuICAgICAgaWYoIWVycikge1xuICAgICAgICBjYWxjdWxhdGVUaW1lRGlmZigpO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgc3luY1RpbWUoKTtcbiAgICAgIH1cbiAgICB9KTtcbiAgfVxuXG4gIGZ1bmN0aW9uIGNhbGN1bGF0ZVRpbWVEaWZmICgpIHtcbiAgICB2YXIgY2xpZW50U3RhcnRUaW1lID0gKG5ldyBEYXRlKCkpLmdldFRpbWUoKTtcbiAgICBzZWxmLmdldFNlcnZlclRpbWUoZnVuY3Rpb24oZXJyLCBzZXJ2ZXJUaW1lKSB7XG4gICAgICBpZighZXJyICYmIHNlcnZlclRpbWUpIHtcbiAgICAgICAgLy8gKERhdGUubm93KCkgKyBjbGllbnRTdGFydFRpbWUpLzIgOiBNaWRwb2ludCBiZXR3ZWVuIHJlcSBhbmQgcmVzXG4gICAgICAgIHZhciBuZXR3b3JrVGltZSA9ICgobmV3IERhdGUoKSkuZ2V0VGltZSgpIC0gY2xpZW50U3RhcnRUaW1lKS8yXG4gICAgICAgIHZhciBzZXJ2ZXJTdGFydFRpbWUgPSBzZXJ2ZXJUaW1lIC0gbmV0d29ya1RpbWU7XG4gICAgICAgIHNlbGYuZGlmZiA9IHNlcnZlclN0YXJ0VGltZSAtIGNsaWVudFN0YXJ0VGltZTtcbiAgICAgICAgc2VsZi5zeW5jZWQgPSB0cnVlO1xuICAgICAgICAvLyB3ZSBuZWVkIHRvIHNlbmQgMSBpbnRvIHJldHJ5TGF0ZXIuXG4gICAgICAgIHNlbGYucmVTeW5jLnJldHJ5TGF0ZXIoc2VsZi5yZVN5bmNDb3VudCsrLCBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgdmFyIGFyZ3MgPSBbXS5zbGljZS5jYWxsKGFyZ3VtZW50cyk7XG4gICAgICAgICAgc2VsZi5zeW5jLmFwcGx5KHNlbGYsIGFyZ3MpO1xuICAgICAgICB9KTtcbiAgICAgICAgbG9nZ2VyKCdzdWNjZXNzZnVsbHkgdXBkYXRlZCBkaWZmIHZhbHVlJywgc2VsZi5kaWZmKTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIHN5bmNUaW1lKCk7XG4gICAgICB9XG4gICAgfSk7XG4gIH1cbn1cblxuTnRwLnByb3RvdHlwZS5nZXRTZXJ2ZXJUaW1lID0gZnVuY3Rpb24oY2FsbGJhY2spIHtcbiAgdmFyIHNlbGYgPSB0aGlzO1xuXG4gIGlmKE1ldGVvci5pc1NlcnZlcikge1xuICAgIEthZGlyYS5jb3JlQXBpLmdldChzZWxmLnBhdGgsIHsgbm9SZXRyaWVzOiB0cnVlIH0pLnRoZW4oY29udGVudCA9PiB7XG4gICAgICB2YXIgc2VydmVyVGltZSA9IHBhcnNlSW50KGNvbnRlbnQpO1xuICAgICAgY2FsbGJhY2sobnVsbCwgc2VydmVyVGltZSk7XG4gICAgfSlcbiAgICAuY2F0Y2goZXJyID0+IHtcbiAgICAgIGNhbGxiYWNrKGVycik7XG4gICAgfSk7XG4gIH0gZWxzZSB7XG4gICAgaHR0cFJlcXVlc3QoJ0dFVCcsIHNlbGYuZW5kcG9pbnQgKyBgP25vQ2FjaGU9JHtuZXcgRGF0ZSgpLmdldFRpbWUoKX0tJHtNYXRoLnJhbmRvbSgpfWAsIGZ1bmN0aW9uKGVyciwgcmVzKSB7XG4gICAgICBpZiAoZXJyKSB7XG4gICAgICAgIGNhbGxiYWNrKGVycik7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICB2YXIgc2VydmVyVGltZSA9IHBhcnNlSW50KHJlcy5jb250ZW50KTtcbiAgICAgICAgY2FsbGJhY2sobnVsbCwgc2VydmVyVGltZSk7XG4gICAgICB9XG4gICAgfSk7XG4gIH1cbn07XG5cbmZ1bmN0aW9uIGdldExvZ2dlcigpIHtcbiAgaWYoTWV0ZW9yLmlzU2VydmVyKSB7XG4gICAgcmV0dXJuIE5wbS5yZXF1aXJlKCdkZWJ1ZycpKFwia2FkaXJhOm50cFwiKTtcbiAgfSBlbHNlIHtcbiAgICByZXR1cm4gZnVuY3Rpb24obWVzc2FnZSkge1xuICAgICAgdmFyIGNhbkxvZ0thZGlyYSA9XG4gICAgICAgIE1ldGVvci5fbG9jYWxTdG9yYWdlLmdldEl0ZW0oJ0xPR19LQURJUkEnKSAhPT0gbnVsbFxuICAgICAgICAmJiB0eXBlb2YgY29uc29sZSAhPT0gJ3VuZGVmaW5lZCc7XG5cbiAgICAgIGlmKGNhbkxvZ0thZGlyYSkge1xuICAgICAgICBpZihtZXNzYWdlKSB7XG4gICAgICAgICAgbWVzc2FnZSA9IFwia2FkaXJhOm50cCBcIiArIG1lc3NhZ2U7XG4gICAgICAgICAgYXJndW1lbnRzWzBdID0gbWVzc2FnZTtcbiAgICAgICAgfVxuICAgICAgICBjb25zb2xlLmxvZy5hcHBseShjb25zb2xlLCBhcmd1bWVudHMpO1xuICAgICAgfVxuICAgIH1cbiAgfVxufVxuIiwidmFyIHVybCA9IE5wbS5yZXF1aXJlKCd1cmwnKTtcbnZhciBwYXRoID0gTnBtLnJlcXVpcmUoJ3BhdGgnKTtcbnZhciBmcyA9IE5wbS5yZXF1aXJlKCdmcycpO1xudmFyIGxvZ2dlciA9IE5wbS5yZXF1aXJlKCdkZWJ1ZycpKCdrYWRpcmE6YXBtOnNvdXJjZW1hcHMnKTtcblxuLy8gTWV0ZW9yIDEuNyBhbmQgb2xkZXIgdXNlZCBjbGllbnRQYXRoc1xudmFyIGNsaWVudFBhdGhzID0gX19tZXRlb3JfYm9vdHN0cmFwX18uY29uZmlnSnNvbi5jbGllbnRQYXRocztcbnZhciBjbGllbnRBcmNocyA9ICBfX21ldGVvcl9ib290c3RyYXBfXy5jb25maWdKc29uLmNsaWVudEFyY2hzO1xudmFyIHNlcnZlckRpciA9IF9fbWV0ZW9yX2Jvb3RzdHJhcF9fLnNlcnZlckRpcjtcbnZhciBhYnNDbGllbnRQYXRoc1xuXG5pZiAoY2xpZW50QXJjaHMpIHtcbiAgYWJzQ2xpZW50UGF0aHMgPSBjbGllbnRBcmNocy5yZWR1Y2UoKHJlc3VsdCwgYXJjaCkgPT4ge1xuICAgIHJlc3VsdFthcmNoXSA9IHBhdGgucmVzb2x2ZShwYXRoLmRpcm5hbWUoc2VydmVyRGlyKSwgYXJjaClcblxuICAgIHJldHVybiByZXN1bHRcbiAgfSwge30pXG59IGVsc2Uge1xuICBhYnNDbGllbnRQYXRocyA9IE9iamVjdC5rZXlzKGNsaWVudFBhdGhzKS5yZWR1Y2UoKHJlc3VsdCwga2V5KSA9PiB7XG4gICAgcmVzdWx0W2tleV0gPSBwYXRoLnJlc29sdmUoc2VydmVyRGlyLCBwYXRoLmRpcm5hbWUoY2xpZW50UGF0aHNba2V5XSkpO1xuXG4gICAgcmV0dXJuIHJlc3VsdDtcbiAgfSwge30pO1xufVxuXG5oYW5kbGVBcGlSZXNwb25zZSA9IGZ1bmN0aW9uIChib2R5ID0ge30pIHtcbiAgdmFyIHVuYXZhaWxhYmxlID0gW107XG5cbiAgaWYgKHR5cGVvZiBib2R5ID09PSAnc3RyaW5nJykge1xuICAgIHRyeSB7XG4gICAgICBib2R5ID0gSlNPTi5wYXJzZShib2R5KTtcbiAgICB9IGNhdGNoIChlKSB7XG4gICAgICBsb2dnZXIoJ2ZhaWxlZCBwYXJzaW5nIGJvZHknLCBlLCBib2R5KVxuICAgICAgcmV0dXJuO1xuICAgIH1cbiAgfVxuXG4gIHZhciBuZWVkZWRTb3VyY2VtYXBzID0gYm9keS5uZWVkZWRTb3VyY2VtYXBzIHx8IFtdXG4gIGxvZ2dlcignYm9keScsIG5lZWRlZFNvdXJjZW1hcHMpXG5cbiAgdmFyIHByb21pc2VzID0gbmVlZGVkU291cmNlbWFwcy5tYXAoKHNvdXJjZW1hcCkgPT4ge1xuICAgIGlmICghS2FkaXJhLm9wdGlvbnMudXBsb2FkU291cmNlTWFwcykge1xuICAgICAgcmV0dXJuIHVuYXZhaWxhYmxlLnB1c2goc291cmNlbWFwKVxuICAgIH1cblxuICAgIHJldHVybiBnZXRTb3VyY2VtYXBQYXRoKHNvdXJjZW1hcC5hcmNoLCBzb3VyY2VtYXAuZmlsZS5wYXRoKVxuICAgICAgLnRoZW4oZnVuY3Rpb24gKHNvdXJjZU1hcFBhdGgpIHtcbiAgICAgICAgaWYgKHNvdXJjZU1hcFBhdGggPT09IG51bGwpIHtcbiAgICAgICAgICB1bmF2YWlsYWJsZS5wdXNoKHNvdXJjZW1hcClcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICBzZW5kU291cmNlbWFwKHNvdXJjZW1hcCwgc291cmNlTWFwUGF0aClcbiAgICAgICAgfVxuICAgICAgfSlcbiAgfSlcblxuICBQcm9taXNlLmFsbChwcm9taXNlcykudGhlbihmdW5jdGlvbiAoKSB7XG4gICAgaWYgKHVuYXZhaWxhYmxlLmxlbmd0aCA+IDApIHtcbiAgICAgIGxvZ2dlcignc2VuZGluZyB1bmF2YWlsYWJsZSBzb3VyY2VtYXBzJywgdW5hdmFpbGFibGUpXG4gICAgICBLYWRpcmEuY29yZUFwaS5zZW5kRGF0YSh7XG4gICAgICAgIHVuYXZhaWxhYmxlU291cmNlbWFwczogdW5hdmFpbGFibGVcbiAgICAgIH0pXG4gICAgICAudGhlbihmdW5jdGlvbiAoYm9keSkge1xuICAgICAgICBoYW5kbGVBcGlSZXNwb25zZShib2R5KTtcbiAgICAgIH0pXG4gICAgICAuY2F0Y2goZnVuY3Rpb24gKGVycikge1xuICAgICAgICBjb25zb2xlLmxvZygnTW9udGkgQVBNOiB1bmFibGUgdG8gc2VuZCBkYXRhJywgZXJyKTtcbiAgICAgIH0pO1xuICAgIH1cbiAgfSlcblxufVxuXG5mdW5jdGlvbiBzZW5kU291cmNlbWFwKHNvdXJjZW1hcCwgc291cmNlbWFwUGF0aCkge1xuICBsb2dnZXIoJ1NlbmRpbmcgc291cmNlbWFwJywgc291cmNlbWFwLCBzb3VyY2VtYXBQYXRoKVxuXG4gIHZhciBzdHJlYW0gPSBmcy5jcmVhdGVSZWFkU3RyZWFtKHNvdXJjZW1hcFBhdGgpO1xuXG4gIHN0cmVhbS5vbignZXJyb3InLCAoZXJyKSA9PiB7XG4gICAgY29uc29sZS5sb2coJ01vbnRpIEFQTTogZXJyb3Igd2hpbGUgdXBsb2FkaW5nIHNvdXJjZW1hcCcsIGVycilcbiAgfSk7XG5cbiAgdmFyIGFyY2ggPSBzb3VyY2VtYXAuYXJjaDtcbiAgdmFyIGFyY2hWZXJzaW9uID0gc291cmNlbWFwLmFyY2hWZXJzaW9uO1xuICB2YXIgZmlsZSA9IGVuY29kZVVSSUNvbXBvbmVudChzb3VyY2VtYXAuZmlsZS5wYXRoKTtcbiAgXG4gIEthZGlyYS5jb3JlQXBpLnNlbmRTdHJlYW0oYC9zb3VyY2VtYXA/YXJjaD0ke2FyY2h9JmFyY2hWZXJzaW9uPSR7YXJjaFZlcnNpb259JmZpbGU9JHtmaWxlfWAsIHN0cmVhbSlcbiAgICAuY2F0Y2goZnVuY3Rpb24gKGVycikge1xuICAgICAgY29uc29sZS5sb2coJ01vbnRpIEFQTTogZXJyb3IgdXBsb2FkaW5nIHNvdXJjZW1hcCcsIGVycik7XG4gICAgfSk7XG59XG5cbmZ1bmN0aW9uIHByZXBhcmVQYXRoICh1cmxQYXRoKSB7XG4gIHVybFBhdGggPSBwYXRoLnBvc2l4Lm5vcm1hbGl6ZSh1cmxQYXRoKTtcblxuICBpZiAodXJsUGF0aFswXSA9PT0gJy8nKSB7XG4gICAgdXJsUGF0aCA9IHVybFBhdGguc2xpY2UoMSk7XG4gIH1cblxuICByZXR1cm4gdXJsUGF0aDtcbn1cblxuZnVuY3Rpb24gY2hlY2tGb3JEeW5hbWljSW1wb3J0IChhcmNoLCB1cmxQYXRoKSB7XG4gIGNvbnN0IGZpbGVQYXRoID0gcHJlcGFyZVBhdGgodXJsUGF0aCk7XG5cbiAgcmV0dXJuIG5ldyBQcm9taXNlKGZ1bmN0aW9uIChyZXNvbHZlKSB7XG4gICAgY29uc3QgYXJjaFBhdGggPSBhYnNDbGllbnRQYXRoc1thcmNoXVxuICAgIGNvbnN0IGR5bmFtaWNQYXRoID0gcGF0aC5qb2luKGFyY2hQYXRoLCAnZHluYW1pYycsIGZpbGVQYXRoKSArICcubWFwJ1xuXG4gICAgZnMuc3RhdChkeW5hbWljUGF0aCwgZnVuY3Rpb24gKGVycikge1xuICAgICAgcmVzb2x2ZShlcnIgPyBudWxsIDogZHluYW1pY1BhdGgpO1xuICAgIH0pO1xuICB9KTtcbn1cblxuZnVuY3Rpb24gZ2V0U291cmNlbWFwUGF0aChhcmNoLCB1cmxQYXRoKSB7XG4gIHJldHVybiBuZXcgUHJvbWlzZSgocmVzb2x2ZSwgcmVqZWN0KSA9PiB7XG4gICAgdmFyIGNsaWVudFByb2dyYW0gPSBXZWJBcHAuY2xpZW50UHJvZ3JhbXNbYXJjaF07XG4gIFxuICAgIGlmICghY2xpZW50UHJvZ3JhbSB8fCAhY2xpZW50UHJvZ3JhbS5tYW5pZmVzdCkge1xuICAgICAgcmV0dXJuIHJlc29sdmUobnVsbCk7XG4gICAgfVxuXG4gICAgdmFyIGZpbGVJbmZvID0gY2xpZW50UHJvZ3JhbS5tYW5pZmVzdC5maW5kKChmaWxlKSA9PiB7XG4gICAgICByZXR1cm4gZmlsZS51cmwgJiYgZmlsZS51cmwuc3RhcnRzV2l0aCh1cmxQYXRoKTtcbiAgICB9KTtcblxuICAgIGlmIChmaWxlSW5mbyAmJiBmaWxlSW5mby5zb3VyY2VNYXApIHtcbiAgICAgIHJldHVybiByZXNvbHZlKHBhdGguam9pbihcbiAgICAgICAgYWJzQ2xpZW50UGF0aHNbYXJjaF0sXG4gICAgICAgIGZpbGVJbmZvLnNvdXJjZU1hcFxuICAgICAgKSk7XG4gICAgfVxuXG4gICAgY2hlY2tGb3JEeW5hbWljSW1wb3J0KGFyY2gsIHVybFBhdGgpLnRoZW4ocmVzb2x2ZSkuY2F0Y2gocmVqZWN0KVxuICB9KTtcbn1cbiIsInZhciBXQUlUT05fTUVTU0FHRV9GSUVMRFMgPSBbJ21zZycsICdpZCcsICdtZXRob2QnLCAnbmFtZScsICd3YWl0VGltZSddO1xuXG4vLyBUaGlzIGlzIHdheSBob3cgd2UgY2FuIGJ1aWxkIHdhaXRUaW1lIGFuZCBpdCdzIGJyZWFrZG93blxuV2FpdFRpbWVCdWlsZGVyID0gZnVuY3Rpb24oKSB7XG4gIHRoaXMuX3dhaXRMaXN0U3RvcmUgPSB7fTtcbiAgdGhpcy5fY3VycmVudFByb2Nlc3NpbmdNZXNzYWdlcyA9IHt9O1xuICB0aGlzLl9tZXNzYWdlQ2FjaGUgPSB7fTtcbn07XG5cbldhaXRUaW1lQnVpbGRlci5wcm90b3R5cGUucmVnaXN0ZXIgPSBmdW5jdGlvbihzZXNzaW9uLCBtc2dJZCkge1xuICB2YXIgc2VsZiA9IHRoaXM7XG4gIHZhciBtYWluS2V5ID0gc2VsZi5fZ2V0TWVzc2FnZUtleShzZXNzaW9uLmlkLCBtc2dJZCk7XG5cbiAgdmFyIGluUXVldWUgPSBzZXNzaW9uLmluUXVldWUgfHwgW107XG4gIGlmKHR5cGVvZiBpblF1ZXVlLnRvQXJyYXkgPT09ICdmdW5jdGlvbicpIHtcbiAgICAvLyBsYXRlc3QgdmVyc2lvbiBvZiBNZXRlb3IgdXNlcyBhIGRvdWJsZS1lbmRlZC1xdWV1ZSBmb3IgdGhlIGluUXVldWVcbiAgICAvLyBpbmZvOiBodHRwczovL3d3dy5ucG1qcy5jb20vcGFja2FnZS9kb3VibGUtZW5kZWQtcXVldWVcbiAgICBpblF1ZXVlID0gaW5RdWV1ZS50b0FycmF5KCk7XG4gIH1cblxuICB2YXIgd2FpdExpc3QgPSBpblF1ZXVlLm1hcChmdW5jdGlvbihtc2cpIHtcbiAgICB2YXIga2V5ID0gc2VsZi5fZ2V0TWVzc2FnZUtleShzZXNzaW9uLmlkLCBtc2cuaWQpO1xuICAgIHJldHVybiBzZWxmLl9nZXRDYWNoZU1lc3NhZ2Uoa2V5LCBtc2cpO1xuICB9KTtcblxuICB3YWl0TGlzdCA9IHdhaXRMaXN0IHx8IFtdO1xuXG4gIC8vYWRkIGN1cnJlbnRseSBwcm9jZXNzaW5nIGRkcCBtZXNzYWdlIGlmIGV4aXN0c1xuICB2YXIgY3VycmVudGx5UHJvY2Vzc2luZ01lc3NhZ2UgPSB0aGlzLl9jdXJyZW50UHJvY2Vzc2luZ01lc3NhZ2VzW3Nlc3Npb24uaWRdO1xuICBpZihjdXJyZW50bHlQcm9jZXNzaW5nTWVzc2FnZSkge1xuICAgIHZhciBrZXkgPSBzZWxmLl9nZXRNZXNzYWdlS2V5KHNlc3Npb24uaWQsIGN1cnJlbnRseVByb2Nlc3NpbmdNZXNzYWdlLmlkKTtcbiAgICB3YWl0TGlzdC51bnNoaWZ0KHRoaXMuX2dldENhY2hlTWVzc2FnZShrZXksIGN1cnJlbnRseVByb2Nlc3NpbmdNZXNzYWdlKSk7XG4gIH1cblxuICB0aGlzLl93YWl0TGlzdFN0b3JlW21haW5LZXldID0gd2FpdExpc3Q7XG59O1xuXG5XYWl0VGltZUJ1aWxkZXIucHJvdG90eXBlLmJ1aWxkID0gZnVuY3Rpb24oc2Vzc2lvbiwgbXNnSWQpIHtcbiAgdmFyIG1haW5LZXkgPSB0aGlzLl9nZXRNZXNzYWdlS2V5KHNlc3Npb24uaWQsIG1zZ0lkKTtcbiAgdmFyIHdhaXRMaXN0ID0gdGhpcy5fd2FpdExpc3RTdG9yZVttYWluS2V5XSB8fCBbXTtcbiAgZGVsZXRlIHRoaXMuX3dhaXRMaXN0U3RvcmVbbWFpbktleV07XG5cbiAgdmFyIGZpbHRlcmVkV2FpdExpc3QgPSAgd2FpdExpc3QubWFwKHRoaXMuX2NsZWFuQ2FjaGVNZXNzYWdlLmJpbmQodGhpcykpO1xuICByZXR1cm4gZmlsdGVyZWRXYWl0TGlzdDtcbn07XG5cbldhaXRUaW1lQnVpbGRlci5wcm90b3R5cGUuX2dldE1lc3NhZ2VLZXkgPSBmdW5jdGlvbihzZXNzaW9uSWQsIG1zZ0lkKSB7XG4gIHJldHVybiBzZXNzaW9uSWQgKyBcIjo6XCIgKyBtc2dJZDtcbn07XG5cbldhaXRUaW1lQnVpbGRlci5wcm90b3R5cGUuX2dldENhY2hlTWVzc2FnZSA9IGZ1bmN0aW9uKGtleSwgbXNnKSB7XG4gIHZhciBzZWxmID0gdGhpcztcbiAgdmFyIGNhY2hlZE1lc3NhZ2UgPSBzZWxmLl9tZXNzYWdlQ2FjaGVba2V5XTtcbiAgaWYoIWNhY2hlZE1lc3NhZ2UpIHtcbiAgICBzZWxmLl9tZXNzYWdlQ2FjaGVba2V5XSA9IGNhY2hlZE1lc3NhZ2UgPSBfLnBpY2sobXNnLCBXQUlUT05fTUVTU0FHRV9GSUVMRFMpO1xuICAgIGNhY2hlZE1lc3NhZ2UuX2tleSA9IGtleTtcbiAgICBjYWNoZWRNZXNzYWdlLl9yZWdpc3RlcmVkID0gMTtcbiAgfSBlbHNlIHtcbiAgICBjYWNoZWRNZXNzYWdlLl9yZWdpc3RlcmVkKys7XG4gIH1cblxuICByZXR1cm4gY2FjaGVkTWVzc2FnZTtcbn07XG5cbldhaXRUaW1lQnVpbGRlci5wcm90b3R5cGUuX2NsZWFuQ2FjaGVNZXNzYWdlID0gZnVuY3Rpb24obXNnKSB7XG4gIG1zZy5fcmVnaXN0ZXJlZC0tO1xuICBpZihtc2cuX3JlZ2lzdGVyZWQgPT0gMCkge1xuICAgIGRlbGV0ZSB0aGlzLl9tZXNzYWdlQ2FjaGVbbXNnLl9rZXldO1xuICB9XG5cbiAgLy8gbmVlZCB0byBzZW5kIGEgY2xlYW4gc2V0IG9mIG9iamVjdHNcbiAgLy8gb3RoZXJ3aXNlIHJlZ2lzdGVyIGNhbiBnbyB3aXRoIHRoaXNcbiAgcmV0dXJuIF8ucGljayhtc2csIFdBSVRPTl9NRVNTQUdFX0ZJRUxEUyk7XG59O1xuXG5XYWl0VGltZUJ1aWxkZXIucHJvdG90eXBlLnRyYWNrV2FpdFRpbWUgPSBmdW5jdGlvbihzZXNzaW9uLCBtc2csIHVuYmxvY2spIHtcbiAgdmFyIHNlbGYgPSB0aGlzO1xuICB2YXIgc3RhcnRlZCA9IERhdGUubm93KCk7XG4gIHNlbGYuX2N1cnJlbnRQcm9jZXNzaW5nTWVzc2FnZXNbc2Vzc2lvbi5pZF0gPSBtc2c7XG5cbiAgdmFyIHVuYmxvY2tlZCA9IGZhbHNlO1xuICB2YXIgd3JhcHBlZFVuYmxvY2sgPSBmdW5jdGlvbigpIHtcbiAgICBpZighdW5ibG9ja2VkKSB7XG4gICAgICB2YXIgd2FpdFRpbWUgPSBEYXRlLm5vdygpIC0gc3RhcnRlZDtcbiAgICAgIHZhciBrZXkgPSBzZWxmLl9nZXRNZXNzYWdlS2V5KHNlc3Npb24uaWQsIG1zZy5pZCk7XG4gICAgICB2YXIgY2FjaGVkTWVzc2FnZSA9IHNlbGYuX21lc3NhZ2VDYWNoZVtrZXldO1xuICAgICAgaWYoY2FjaGVkTWVzc2FnZSkge1xuICAgICAgICBjYWNoZWRNZXNzYWdlLndhaXRUaW1lID0gd2FpdFRpbWU7XG4gICAgICB9XG4gICAgICBkZWxldGUgc2VsZi5fY3VycmVudFByb2Nlc3NpbmdNZXNzYWdlc1tzZXNzaW9uLmlkXTtcbiAgICAgIHVuYmxvY2tlZCA9IHRydWU7XG4gICAgICB1bmJsb2NrKCk7XG4gICAgfVxuICB9O1xuXG4gIHJldHVybiB3cmFwcGVkVW5ibG9jaztcbn07IiwiLy8gZXhwb3NlIGZvciB0ZXN0aW5nIHB1cnBvc2Vcbk9wbG9nQ2hlY2sgPSB7fTtcblxuT3Bsb2dDaGVjay5fMDcwID0gZnVuY3Rpb24oY3Vyc29yRGVzY3JpcHRpb24pIHtcbiAgdmFyIG9wdGlvbnMgPSBjdXJzb3JEZXNjcmlwdGlvbi5vcHRpb25zO1xuICBpZiAob3B0aW9ucy5saW1pdCkge1xuICAgIHJldHVybiB7XG4gICAgICBjb2RlOiBcIjA3MF9MSU1JVF9OT1RfU1VQUE9SVEVEXCIsXG4gICAgICByZWFzb246IFwiTWV0ZW9yIDAuNy4wIGRvZXMgbm90IHN1cHBvcnQgbGltaXQgd2l0aCBvcGxvZy5cIixcbiAgICAgIHNvbHV0aW9uOiBcIlVwZ3JhZGUgeW91ciBhcHAgdG8gTWV0ZW9yIHZlcnNpb24gMC43LjIgb3IgbGF0ZXIuXCJcbiAgICB9XG4gIH07XG5cbiAgdmFyIGV4aXN0cyQgPSBfLmFueShjdXJzb3JEZXNjcmlwdGlvbi5zZWxlY3RvciwgZnVuY3Rpb24gKHZhbHVlLCBmaWVsZCkge1xuICAgIGlmIChmaWVsZC5zdWJzdHIoMCwgMSkgPT09ICckJylcbiAgICAgIHJldHVybiB0cnVlO1xuICB9KTtcblxuICBpZihleGlzdHMkKSB7XG4gICAgcmV0dXJuIHtcbiAgICAgIGNvZGU6IFwiMDcwXyRfTk9UX1NVUFBPUlRFRFwiLFxuICAgICAgcmVhc29uOiBcIk1ldGVvciAwLjcuMCBzdXBwb3J0cyBvbmx5IGVxdWFsIGNoZWNrcyB3aXRoIG9wbG9nLlwiLFxuICAgICAgc29sdXRpb246IFwiVXBncmFkZSB5b3VyIGFwcCB0byBNZXRlb3IgdmVyc2lvbiAwLjcuMiBvciBsYXRlci5cIlxuICAgIH1cbiAgfTtcblxuICB2YXIgb25seVNjYWxlcnMgPSBfLmFsbChjdXJzb3JEZXNjcmlwdGlvbi5zZWxlY3RvciwgZnVuY3Rpb24gKHZhbHVlLCBmaWVsZCkge1xuICAgIHJldHVybiB0eXBlb2YgdmFsdWUgPT09IFwic3RyaW5nXCIgfHxcbiAgICAgIHR5cGVvZiB2YWx1ZSA9PT0gXCJudW1iZXJcIiB8fFxuICAgICAgdHlwZW9mIHZhbHVlID09PSBcImJvb2xlYW5cIiB8fFxuICAgICAgdmFsdWUgPT09IG51bGwgfHxcbiAgICAgIHZhbHVlIGluc3RhbmNlb2YgTWV0ZW9yLkNvbGxlY3Rpb24uT2JqZWN0SUQ7XG4gIH0pO1xuXG4gIGlmKCFvbmx5U2NhbGVycykge1xuICAgIHJldHVybiB7XG4gICAgICBjb2RlOiBcIjA3MF9PTkxZX1NDQUxFUlNcIixcbiAgICAgIHJlYXNvbjogXCJNZXRlb3IgMC43LjAgb25seSBzdXBwb3J0cyBzY2FsZXJzIGFzIGNvbXBhcmF0b3JzLlwiLFxuICAgICAgc29sdXRpb246IFwiVXBncmFkZSB5b3VyIGFwcCB0byBNZXRlb3IgdmVyc2lvbiAwLjcuMiBvciBsYXRlci5cIlxuICAgIH1cbiAgfVxuXG4gIHJldHVybiB0cnVlO1xufTtcblxuT3Bsb2dDaGVjay5fMDcxID0gZnVuY3Rpb24oY3Vyc29yRGVzY3JpcHRpb24pIHtcbiAgdmFyIG9wdGlvbnMgPSBjdXJzb3JEZXNjcmlwdGlvbi5vcHRpb25zO1xuICB2YXIgbWF0Y2hlciA9IG5ldyBNaW5pbW9uZ28uTWF0Y2hlcihjdXJzb3JEZXNjcmlwdGlvbi5zZWxlY3Rvcik7XG4gIGlmIChvcHRpb25zLmxpbWl0KSB7XG4gICAgcmV0dXJuIHtcbiAgICAgIGNvZGU6IFwiMDcxX0xJTUlUX05PVF9TVVBQT1JURURcIixcbiAgICAgIHJlYXNvbjogXCJNZXRlb3IgMC43LjEgZG9lcyBub3Qgc3VwcG9ydCBsaW1pdCB3aXRoIG9wbG9nLlwiLFxuICAgICAgc29sdXRpb246IFwiVXBncmFkZSB5b3VyIGFwcCB0byBNZXRlb3IgdmVyc2lvbiAwLjcuMiBvciBsYXRlci5cIlxuICAgIH1cbiAgfTtcblxuICByZXR1cm4gdHJ1ZTtcbn07XG5cblxuT3Bsb2dDaGVjay5lbnYgPSBmdW5jdGlvbigpIHtcbiAgaWYoIXByb2Nlc3MuZW52Lk1PTkdPX09QTE9HX1VSTCkge1xuICAgIHJldHVybiB7XG4gICAgICBjb2RlOiBcIk5PX0VOVlwiLFxuICAgICAgcmVhc29uOiBcIllvdSBoYXZlbid0IGFkZGVkIG9wbG9nIHN1cHBvcnQgZm9yIHlvdXIgdGhlIE1ldGVvciBhcHAuXCIsXG4gICAgICBzb2x1dGlvbjogXCJBZGQgb3Bsb2cgc3VwcG9ydCBmb3IgeW91ciBNZXRlb3IgYXBwLiBzZWU6IGh0dHA6Ly9nb28uZ2wvQ28xakpjXCJcbiAgICB9XG4gIH0gZWxzZSB7XG4gICAgcmV0dXJuIHRydWU7XG4gIH1cbn07XG5cbk9wbG9nQ2hlY2suZGlzYWJsZU9wbG9nID0gZnVuY3Rpb24oY3Vyc29yRGVzY3JpcHRpb24pIHtcbiAgaWYoY3Vyc29yRGVzY3JpcHRpb24ub3B0aW9ucy5fZGlzYWJsZU9wbG9nKSB7XG4gICAgcmV0dXJuIHtcbiAgICAgIGNvZGU6IFwiRElTQUJMRV9PUExPR1wiLFxuICAgICAgcmVhc29uOiBcIllvdSd2ZSBkaXNhYmxlIG9wbG9nIGZvciB0aGlzIGN1cnNvciBleHBsaWNpdGx5IHdpdGggX2Rpc2FibGVPcGxvZyBvcHRpb24uXCJcbiAgICB9O1xuICB9IGVsc2Uge1xuICAgIHJldHVybiB0cnVlO1xuICB9XG59O1xuXG4vLyB3aGVuIGNyZWF0aW5nIE1pbmltb25nby5NYXRjaGVyIG9iamVjdCwgaWYgdGhhdCdzIHRocm93cyBhbiBleGNlcHRpb25cbi8vIG1ldGVvciB3b24ndCBkbyB0aGUgb3Bsb2cgc3VwcG9ydFxuT3Bsb2dDaGVjay5taW5pTW9uZ29NYXRjaGVyID0gZnVuY3Rpb24oY3Vyc29yRGVzY3JpcHRpb24pIHtcbiAgaWYoTWluaW1vbmdvLk1hdGNoZXIpIHtcbiAgICB0cnkge1xuICAgICAgdmFyIG1hdGNoZXIgPSBuZXcgTWluaW1vbmdvLk1hdGNoZXIoY3Vyc29yRGVzY3JpcHRpb24uc2VsZWN0b3IpO1xuICAgICAgcmV0dXJuIHRydWU7XG4gICAgfSBjYXRjaChleCkge1xuICAgICAgcmV0dXJuIHtcbiAgICAgICAgY29kZTogXCJNSU5JTU9OR09fTUFUQ0hFUl9FUlJPUlwiLFxuICAgICAgICByZWFzb246IFwiVGhlcmUncyBzb21ldGhpbmcgd3JvbmcgaW4geW91ciBtb25nbyBxdWVyeTogXCIgKyAgZXgubWVzc2FnZSxcbiAgICAgICAgc29sdXRpb246IFwiQ2hlY2sgeW91ciBzZWxlY3RvciBhbmQgY2hhbmdlIGl0IGFjY29yZGluZ2x5LlwiXG4gICAgICB9O1xuICAgIH1cbiAgfSBlbHNlIHtcbiAgICAvLyBJZiB0aGVyZSBpcyBubyBNaW5pbW9uZ28uTWF0Y2hlciwgd2UgZG9uJ3QgbmVlZCB0byBjaGVjayB0aGlzXG4gICAgcmV0dXJuIHRydWU7XG4gIH1cbn07XG5cbk9wbG9nQ2hlY2subWluaU1vbmdvU29ydGVyID0gZnVuY3Rpb24oY3Vyc29yRGVzY3JpcHRpb24pIHtcbiAgdmFyIG1hdGNoZXIgPSBuZXcgTWluaW1vbmdvLk1hdGNoZXIoY3Vyc29yRGVzY3JpcHRpb24uc2VsZWN0b3IpO1xuICBpZihNaW5pbW9uZ28uU29ydGVyICYmIGN1cnNvckRlc2NyaXB0aW9uLm9wdGlvbnMuc29ydCkge1xuICAgIHRyeSB7XG4gICAgICB2YXIgc29ydGVyID0gbmV3IE1pbmltb25nby5Tb3J0ZXIoXG4gICAgICAgIGN1cnNvckRlc2NyaXB0aW9uLm9wdGlvbnMuc29ydCxcbiAgICAgICAgeyBtYXRjaGVyOiBtYXRjaGVyIH1cbiAgICAgICk7XG4gICAgICByZXR1cm4gdHJ1ZTtcbiAgICB9IGNhdGNoKGV4KSB7XG4gICAgICByZXR1cm4ge1xuICAgICAgICBjb2RlOiBcIk1JTklNT05HT19TT1JURVJfRVJST1JcIixcbiAgICAgICAgcmVhc29uOiBcIlNvbWUgb2YgeW91ciBzb3J0IHNwZWNpZmllcnMgYXJlIG5vdCBzdXBwb3J0ZWQ6IFwiICsgZXgubWVzc2FnZSxcbiAgICAgICAgc29sdXRpb246IFwiQ2hlY2sgeW91ciBzb3J0IHNwZWNpZmllcnMgYW5kIGNoYWdlIHRoZW0gYWNjb3JkaW5nbHkuXCJcbiAgICAgIH1cbiAgICB9XG4gIH0gZWxzZSB7XG4gICAgcmV0dXJuIHRydWU7XG4gIH1cbn07XG5cbk9wbG9nQ2hlY2suZmllbGRzID0gZnVuY3Rpb24oY3Vyc29yRGVzY3JpcHRpb24pIHtcbiAgdmFyIG9wdGlvbnMgPSBjdXJzb3JEZXNjcmlwdGlvbi5vcHRpb25zO1xuICBpZihvcHRpb25zLmZpZWxkcykge1xuICAgIHRyeSB7XG4gICAgICBMb2NhbENvbGxlY3Rpb24uX2NoZWNrU3VwcG9ydGVkUHJvamVjdGlvbihvcHRpb25zLmZpZWxkcyk7XG4gICAgICByZXR1cm4gdHJ1ZTtcbiAgICB9IGNhdGNoIChlKSB7XG4gICAgICBpZiAoZS5uYW1lID09PSBcIk1pbmltb25nb0Vycm9yXCIpIHtcbiAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICBjb2RlOiBcIk5PVF9TVVBQT1JURURfRklFTERTXCIsXG4gICAgICAgICAgcmVhc29uOiBcIlNvbWUgb2YgdGhlIGZpZWxkIGZpbHRlcnMgYXJlIG5vdCBzdXBwb3J0ZWQ6IFwiICsgZS5tZXNzYWdlLFxuICAgICAgICAgIHNvbHV0aW9uOiBcIlRyeSByZW1vdmluZyB0aG9zZSBmaWVsZCBmaWx0ZXJzLlwiXG4gICAgICAgIH07XG4gICAgICB9IGVsc2Uge1xuICAgICAgICB0aHJvdyBlO1xuICAgICAgfVxuICAgIH1cbiAgfVxuICByZXR1cm4gdHJ1ZTtcbn07XG5cbk9wbG9nQ2hlY2suc2tpcCA9IGZ1bmN0aW9uKGN1cnNvckRlc2NyaXB0aW9uKSB7XG4gIGlmKGN1cnNvckRlc2NyaXB0aW9uLm9wdGlvbnMuc2tpcCkge1xuICAgIHJldHVybiB7XG4gICAgICBjb2RlOiBcIlNLSVBfTk9UX1NVUFBPUlRFRFwiLFxuICAgICAgcmVhc29uOiBcIlNraXAgZG9lcyBub3Qgc3VwcG9ydCB3aXRoIG9wbG9nLlwiLFxuICAgICAgc29sdXRpb246IFwiVHJ5IHRvIGF2b2lkIHVzaW5nIHNraXAuIFVzZSByYW5nZSBxdWVyaWVzIGluc3RlYWQ6IGh0dHA6Ly9nb28uZ2wvYjUyMkF2XCJcbiAgICB9O1xuICB9XG5cbiAgcmV0dXJuIHRydWU7XG59O1xuXG5PcGxvZ0NoZWNrLndoZXJlID0gZnVuY3Rpb24oY3Vyc29yRGVzY3JpcHRpb24pIHtcbiAgdmFyIG1hdGNoZXIgPSBuZXcgTWluaW1vbmdvLk1hdGNoZXIoY3Vyc29yRGVzY3JpcHRpb24uc2VsZWN0b3IpO1xuICBpZihtYXRjaGVyLmhhc1doZXJlKCkpIHtcbiAgICByZXR1cm4ge1xuICAgICAgY29kZTogXCJXSEVSRV9OT1RfU1VQUE9SVEVEXCIsXG4gICAgICByZWFzb246IFwiTWV0ZW9yIGRvZXMgbm90IHN1cHBvcnQgcXVlcmllcyB3aXRoICR3aGVyZS5cIixcbiAgICAgIHNvbHV0aW9uOiBcIlRyeSB0byByZW1vdmUgJHdoZXJlIGZyb20geW91ciBxdWVyeS4gVXNlIHNvbWUgYWx0ZXJuYXRpdmUuXCJcbiAgICB9XG4gIH07XG5cbiAgcmV0dXJuIHRydWU7XG59O1xuXG5PcGxvZ0NoZWNrLmdlbyA9IGZ1bmN0aW9uKGN1cnNvckRlc2NyaXB0aW9uKSB7XG4gIHZhciBtYXRjaGVyID0gbmV3IE1pbmltb25nby5NYXRjaGVyKGN1cnNvckRlc2NyaXB0aW9uLnNlbGVjdG9yKTtcblxuICBpZihtYXRjaGVyLmhhc0dlb1F1ZXJ5KCkpIHtcbiAgICByZXR1cm4ge1xuICAgICAgY29kZTogXCJHRU9fTk9UX1NVUFBPUlRFRFwiLFxuICAgICAgcmVhc29uOiBcIk1ldGVvciBkb2VzIG5vdCBzdXBwb3J0IHF1ZXJpZXMgd2l0aCBnZW8gcGFydGlhbCBvcGVyYXRvcnMuXCIsXG4gICAgICBzb2x1dGlvbjogXCJUcnkgdG8gcmVtb3ZlIGdlbyBwYXJ0aWFsIG9wZXJhdG9ycyBmcm9tIHlvdXIgcXVlcnkgaWYgcG9zc2libGUuXCJcbiAgICB9XG4gIH07XG5cbiAgcmV0dXJuIHRydWU7XG59O1xuXG5PcGxvZ0NoZWNrLmxpbWl0QnV0Tm9Tb3J0ID0gZnVuY3Rpb24oY3Vyc29yRGVzY3JpcHRpb24pIHtcbiAgdmFyIG9wdGlvbnMgPSBjdXJzb3JEZXNjcmlwdGlvbi5vcHRpb25zO1xuXG4gIGlmKChvcHRpb25zLmxpbWl0ICYmICFvcHRpb25zLnNvcnQpKSB7XG4gICAgcmV0dXJuIHtcbiAgICAgIGNvZGU6IFwiTElNSVRfTk9fU09SVFwiLFxuICAgICAgcmVhc29uOiBcIk1ldGVvciBvcGxvZyBpbXBsZW1lbnRhdGlvbiBkb2VzIG5vdCBzdXBwb3J0IGxpbWl0IHdpdGhvdXQgYSBzb3J0IHNwZWNpZmllci5cIixcbiAgICAgIHNvbHV0aW9uOiBcIlRyeSBhZGRpbmcgYSBzb3J0IHNwZWNpZmllci5cIlxuICAgIH1cbiAgfTtcblxuICByZXR1cm4gdHJ1ZTtcbn07XG5cbk9wbG9nQ2hlY2sub2xkZXJWZXJzaW9uID0gZnVuY3Rpb24oY3Vyc29yRGVzY3JpcHRpb24sIGRyaXZlcikge1xuICBpZihkcml2ZXIgJiYgIWRyaXZlci5jb25zdHJ1Y3Rvci5jdXJzb3JTdXBwb3J0ZWQpIHtcbiAgICByZXR1cm4ge1xuICAgICAgY29kZTogXCJPTERFUl9WRVJTSU9OXCIsXG4gICAgICByZWFzb246IFwiWW91ciBNZXRlb3IgdmVyc2lvbiBkb2VzIG5vdCBoYXZlIG9wbG9nIHN1cHBvcnQuXCIsXG4gICAgICBzb2x1dGlvbjogXCJVcGdyYWRlIHlvdXIgYXBwIHRvIE1ldGVvciB2ZXJzaW9uIDAuNy4yIG9yIGxhdGVyLlwiXG4gICAgfTtcbiAgfVxuICByZXR1cm4gdHJ1ZTtcbn07XG5cbk9wbG9nQ2hlY2suZ2l0Q2hlY2tvdXQgPSBmdW5jdGlvbihjdXJzb3JEZXNjcmlwdGlvbiwgZHJpdmVyKSB7XG4gIGlmKCFNZXRlb3IucmVsZWFzZSkge1xuICAgIHJldHVybiB7XG4gICAgICBjb2RlOiBcIkdJVF9DSEVDS09VVFwiLFxuICAgICAgcmVhc29uOiBcIlNlZW1zIGxpa2UgeW91ciBNZXRlb3IgdmVyc2lvbiBpcyBiYXNlZCBvbiBhIEdpdCBjaGVja291dCBhbmQgaXQgZG9lc24ndCBoYXZlIHRoZSBvcGxvZyBzdXBwb3J0LlwiLFxuICAgICAgc29sdXRpb246IFwiVHJ5IHRvIHVwZ3JhZGUgeW91ciBNZXRlb3IgdmVyc2lvbi5cIlxuICAgIH07XG4gIH1cbiAgcmV0dXJuIHRydWU7XG59O1xuXG52YXIgcHJlUnVubmluZ01hdGNoZXJzID0gW1xuICBPcGxvZ0NoZWNrLmVudixcbiAgT3Bsb2dDaGVjay5kaXNhYmxlT3Bsb2csXG4gIE9wbG9nQ2hlY2subWluaU1vbmdvTWF0Y2hlclxuXTtcblxudmFyIGdsb2JhbE1hdGNoZXJzID0gW1xuICBPcGxvZ0NoZWNrLmZpZWxkcyxcbiAgT3Bsb2dDaGVjay5za2lwLFxuICBPcGxvZ0NoZWNrLndoZXJlLFxuICBPcGxvZ0NoZWNrLmdlbyxcbiAgT3Bsb2dDaGVjay5saW1pdEJ1dE5vU29ydCxcbiAgT3Bsb2dDaGVjay5taW5pTW9uZ29Tb3J0ZXIsXG4gIE9wbG9nQ2hlY2sub2xkZXJWZXJzaW9uLFxuICBPcGxvZ0NoZWNrLmdpdENoZWNrb3V0XG5dO1xuXG52YXIgdmVyc2lvbk1hdGNoZXJzID0gW1xuICBbL14wXFwuN1xcLjEvLCBPcGxvZ0NoZWNrLl8wNzFdLFxuICBbL14wXFwuN1xcLjAvLCBPcGxvZ0NoZWNrLl8wNzBdLFxuXTtcblxuS2FkaXJhLmNoZWNrV2h5Tm9PcGxvZyA9IGZ1bmN0aW9uKGN1cnNvckRlc2NyaXB0aW9uLCBvYnNlcnZlckRyaXZlcikge1xuICBpZih0eXBlb2YgTWluaW1vbmdvID09ICd1bmRlZmluZWQnKSB7XG4gICAgcmV0dXJuIHtcbiAgICAgIGNvZGU6IFwiQ0FOTk9UX0RFVEVDVFwiLFxuICAgICAgcmVhc29uOiBcIllvdSBhcmUgcnVubmluZyBhbiBvbGRlciBNZXRlb3IgdmVyc2lvbiBhbmQgS2FkaXJhIGNhbid0IGNoZWNrIG9wbG9nIHN0YXRlLlwiLFxuICAgICAgc29sdXRpb246IFwiVHJ5IHVwZGF0aW5nIHlvdXIgTWV0ZW9yIGFwcFwiXG4gICAgfVxuICB9XG5cbiAgdmFyIHJlc3VsdCA9IHJ1bk1hdGNoZXJzKHByZVJ1bm5pbmdNYXRjaGVycywgY3Vyc29yRGVzY3JpcHRpb24sIG9ic2VydmVyRHJpdmVyKTtcbiAgaWYocmVzdWx0ICE9PSB0cnVlKSB7XG4gICAgcmV0dXJuIHJlc3VsdDtcbiAgfVxuXG4gIHZhciBtZXRlb3JWZXJzaW9uID0gTWV0ZW9yLnJlbGVhc2U7XG4gIGZvcih2YXIgbGM9MDsgbGM8dmVyc2lvbk1hdGNoZXJzLmxlbmd0aDsgbGMrKykge1xuICAgIHZhciBtYXRjaGVySW5mbyA9IHZlcnNpb25NYXRjaGVyc1tsY107XG4gICAgaWYobWF0Y2hlckluZm9bMF0udGVzdChtZXRlb3JWZXJzaW9uKSkge1xuICAgICAgdmFyIG1hdGNoZWQgPSBtYXRjaGVySW5mb1sxXShjdXJzb3JEZXNjcmlwdGlvbiwgb2JzZXJ2ZXJEcml2ZXIpO1xuICAgICAgaWYobWF0Y2hlZCAhPT0gdHJ1ZSkge1xuICAgICAgICByZXR1cm4gbWF0Y2hlZDtcbiAgICAgIH1cbiAgICB9XG4gIH1cblxuICByZXN1bHQgPSBydW5NYXRjaGVycyhnbG9iYWxNYXRjaGVycywgY3Vyc29yRGVzY3JpcHRpb24sIG9ic2VydmVyRHJpdmVyKTtcbiAgaWYocmVzdWx0ICE9PSB0cnVlKSB7XG4gICAgcmV0dXJuIHJlc3VsdDtcbiAgfVxuXG4gIHJldHVybiB7XG4gICAgY29kZTogXCJPUExPR19TVVBQT1JURURcIixcbiAgICByZWFzb246IFwiVGhpcyBxdWVyeSBzaG91bGQgc3VwcG9ydCBvcGxvZy4gSXQncyB3ZWlyZCBpZiBpdCdzIG5vdC5cIixcbiAgICBzb2x1dGlvbjogXCJQbGVhc2UgY29udGFjdCBLYWRpcmEgc3VwcG9ydCBhbmQgbGV0J3MgZGlzY3Vzcy5cIlxuICB9O1xufTtcblxuZnVuY3Rpb24gcnVuTWF0Y2hlcnMobWF0Y2hlckxpc3QsIGN1cnNvckRlc2NyaXB0aW9uLCBvYnNlcnZlckRyaXZlcikge1xuICBmb3IodmFyIGxjPTA7IGxjPG1hdGNoZXJMaXN0Lmxlbmd0aDsgbGMrKykge1xuICAgIHZhciBtYXRjaGVyID0gbWF0Y2hlckxpc3RbbGNdO1xuICAgIHZhciBtYXRjaGVkID0gbWF0Y2hlcihjdXJzb3JEZXNjcmlwdGlvbiwgb2JzZXJ2ZXJEcml2ZXIpO1xuICAgIGlmKG1hdGNoZWQgIT09IHRydWUpIHtcbiAgICAgIHJldHVybiBtYXRjaGVkO1xuICAgIH1cbiAgfVxuICByZXR1cm4gdHJ1ZTtcbn1cbiIsInZhciBldmVudExvZ2dlciA9IE5wbS5yZXF1aXJlKCdkZWJ1ZycpKCdrYWRpcmE6dHJhY2VyJyk7XG52YXIgUkVQRVRJVElWRV9FVkVOVFMgPSB7J2RiJzogdHJ1ZSwgJ2h0dHAnOiB0cnVlLCAnZW1haWwnOiB0cnVlLCAnd2FpdCc6IHRydWUsICdhc3luYyc6IHRydWUsICdjdXN0b20nOiB0cnVlLCAnZnMnOiB0cnVlfTtcbnZhciBUUkFDRV9UWVBFUyA9IFsnc3ViJywgJ21ldGhvZCcsICdodHRwJ107XG52YXIgTUFYX1RSQUNFX0VWRU5UUyA9IDE1MDA7XG5cblRyYWNlciA9IGZ1bmN0aW9uIFRyYWNlcigpIHtcbiAgdGhpcy5fZmlsdGVycyA9IFtdO1xuICB0aGlzLl9maWx0ZXJGaWVsZHMgPSBbJ3Bhc3N3b3JkJ107XG4gIHRoaXMubWF4QXJyYXlJdGVtc1RvRmlsdGVyID0gMjA7XG59O1xuXG4vL0luIHRoZSBmdXR1cmUsIHdlIG1pZ2h0IHdhbid0IHRvIHRyYWNrIGlubmVyIGZpYmVyIGV2ZW50cyB0b28uXG4vL1RoZW4gd2UgY2FuJ3Qgc2VyaWFsaXplIHRoZSBvYmplY3Qgd2l0aCBtZXRob2RzXG4vL1RoYXQncyB3aHkgd2UgdXNlIHRoaXMgbWV0aG9kIG9mIHJldHVybmluZyB0aGUgZGF0YVxuVHJhY2VyLnByb3RvdHlwZS5zdGFydCA9IGZ1bmN0aW9uIChuYW1lLCB0eXBlLCB7XG4gIHNlc3Npb25JZCxcbiAgbXNnSWQsXG4gIHVzZXJJZFxufSA9IHt9KSB7XG5cbiAgLy8gZm9yIGJhY2t3YXJkIGNvbXBhdGliaWxpdHlcbiAgaWYgKHR5cGVvZiBuYW1lID09PSAnb2JqZWN0JyAmJiB0eXBlb2YgdHlwZSA9PT0gJ29iamVjdCcpIHtcbiAgICBsZXQgc2Vzc2lvbiA9IG5hbWU7XG4gICAgbGV0IG1zZyA9IHR5cGU7XG4gICAgc2Vzc2lvbklkID0gc2Vzc2lvbi5pZDtcbiAgICBtc2dJZCA9IG1zZy5pZDtcbiAgICB1c2VySWQgPSBzZXNzaW9uLnVzZXJJZDtcblxuICAgIGlmKG1zZy5tc2cgPT0gJ21ldGhvZCcpIHtcbiAgICAgIHR5cGUgPSAnbWV0aG9kJztcbiAgICAgIG5hbWUgPSBtc2cubWV0aG9kO1xuICAgIH0gZWxzZSBpZihtc2cubXNnID09ICdzdWInKSB7XG4gICAgICB0eXBlID0gJ3N1Yic7XG4gICAgICBuYW1lID0gbXNnLm5hbWU7XG4gICAgfSBlbHNlIHtcbiAgICAgIHJldHVybiBudWxsO1xuICAgIH1cbiAgfVxuXG4gIGlmIChUUkFDRV9UWVBFUy5pbmRleE9mKHR5cGUpID09PSAtMSkge1xuICAgIGNvbnNvbGUud2FybihgTW9udGkgQVBNOiB1bmtub3duIHRyYWNlIHR5cGUgXCIke3R5cGV9XCJgKTtcbiAgICByZXR1cm4gbnVsbDtcbiAgfVxuXG5cbiAgdmFyIHRyYWNlSW5mbyA9IHtcbiAgICBfaWQ6IGAke3Nlc3Npb25JZH06OiR7bXNnSWQgfHwgRGVmYXVsdFVuaXF1ZUlkLmdldCgpfWAsXG4gICAgdHlwZSxcbiAgICBuYW1lLFxuICAgIHNlc3Npb246IHNlc3Npb25JZCxcbiAgICBpZDogbXNnSWQsXG4gICAgZXZlbnRzOiBbXSxcbiAgICB1c2VySWQsXG4gIH07XG5cbiAgcmV0dXJuIHRyYWNlSW5mbztcbn07XG5cblRyYWNlci5wcm90b3R5cGUuZXZlbnQgPSBmdW5jdGlvbiAodHJhY2VJbmZvLCB0eXBlLCBkYXRhLCBtZXRhRGF0YSkge1xuICAvLyBkbyBub3QgYWxsb3cgdG8gcHJvY2VlZCwgaWYgYWxyZWFkeSBjb21wbGV0ZWQgb3IgZXJyb3JlZFxuICB2YXIgbGFzdEV2ZW50ID0gdGhpcy5nZXRMYXN0RXZlbnQodHJhY2VJbmZvKTtcblxuICBpZihcbiAgICAvLyB0cmFjZSBjb21wbGV0ZWQgYnV0IGhhcyBub3QgYmVlbiBwcm9jZXNzZWRcbiAgICBsYXN0RXZlbnQgJiZcbiAgICBbJ2NvbXBsZXRlJywgJ2Vycm9yJ10uaW5kZXhPZihsYXN0RXZlbnQudHlwZSkgPj0gMCB8fFxuICAgIC8vIHRyYWNlIGNvbXBsZXRlZCBhbmQgcHJvY2Vzc2VkLlxuICAgIHRyYWNlSW5mby5pc0V2ZW50c1Byb2Nlc3NlZFxuICAgICkge1xuICAgIHJldHVybiBmYWxzZTtcbiAgfVxuXG4gIHZhciBldmVudCA9IHtcbiAgICB0eXBlLFxuICAgIGF0OiBOdHAuX25vdygpLFxuICAgIGVuZEF0OiBudWxsLFxuICAgIG5lc3RlZDogW10sXG4gIH07XG5cbiAgLy8gc3BlY2lhbCBoYW5kbGluZyBmb3IgZXZlbnRzIHRoYXQgYXJlIG5vdCByZXBldGl0aXZlXG4gIGlmICghUkVQRVRJVElWRV9FVkVOVFNbdHlwZV0pIHtcbiAgICBldmVudC5lbmRBdCA9IGV2ZW50LmF0O1xuICB9XG5cbiAgaWYoZGF0YSkge1xuICAgIHZhciBpbmZvID0gXy5waWNrKHRyYWNlSW5mbywgJ3R5cGUnLCAnbmFtZScpXG4gICAgZXZlbnQuZGF0YSA9IHRoaXMuX2FwcGx5RmlsdGVycyh0eXBlLCBkYXRhLCBpbmZvLCBcInN0YXJ0XCIpO1xuICB9XG5cbiAgaWYgKG1ldGFEYXRhICYmIG1ldGFEYXRhLm5hbWUpIHtcbiAgICBldmVudC5uYW1lID0gbWV0YURhdGEubmFtZVxuICB9XG5cbiAgaWYgKEthZGlyYS5vcHRpb25zLmV2ZW50U3RhY2tUcmFjZSkge1xuICAgIGV2ZW50LnN0YWNrID0gQ3JlYXRlVXNlclN0YWNrKClcbiAgfVxuICBcbiAgZXZlbnRMb2dnZXIoXCIlcyAlc1wiLCB0eXBlLCB0cmFjZUluZm8uX2lkKTtcblxuICBpZiAobGFzdEV2ZW50ICYmICFsYXN0RXZlbnQuZW5kQXQpIHtcbiAgICBpZiAoIWxhc3RFdmVudC5uZXN0ZWQpIHtcbiAgICAgIGNvbnNvbGUuZXJyb3IoJ01vbnRpOiBpbnZhbGlkIHRyYWNlLiBQbGVhc2Ugc2hhcmUgdGhlIHRyYWNlIGJlbG93IGF0Jyk7XG4gICAgICBjb25zb2xlLmVycm9yKCdNb250aTogaHR0cHM6Ly9naXRodWIuY29tL21vbnRpLWFwbS9tb250aS1hcG0tYWdlbnQvaXNzdWVzLzE0Jyk7XG4gICAgICBjb25zb2xlLmRpcih0cmFjZUluZm8sIHsgZGVwdGg6IDEwIH0pO1xuICAgIH1cbiAgICB2YXIgbGFzdE5lc3RlZCA9IGxhc3RFdmVudC5uZXN0ZWRbbGFzdEV2ZW50Lm5lc3RlZC5sZW5ndGggLSAxXTtcblxuICAgIC8vIE9ubHkgbmVzdCBvbmUgbGV2ZWxcbiAgICBpZiAoIWxhc3ROZXN0ZWQgfHwgbGFzdE5lc3RlZC5lbmRBdCkge1xuICAgICAgbGFzdEV2ZW50Lm5lc3RlZC5wdXNoKGV2ZW50KTtcbiAgICAgIHJldHVybiBldmVudDtcbiAgICB9XG5cbiAgICByZXR1cm4gZmFsc2U7XG4gIH1cbiAgXG4gIHRyYWNlSW5mby5ldmVudHMucHVzaChldmVudCk7XG5cbiAgcmV0dXJuIGV2ZW50O1xufTtcblxuVHJhY2VyLnByb3RvdHlwZS5ldmVudEVuZCA9IGZ1bmN0aW9uKHRyYWNlSW5mbywgZXZlbnQsIGRhdGEpIHtcbiAgaWYgKGV2ZW50LmVuZEF0KSB7XG4gICAgLy8gRXZlbnQgYWxyZWFkeSBlbmRlZCBvciBpcyBub3QgYSByZXBpdGl0aXZlIGV2ZW50XG4gICAgcmV0dXJuIGZhbHNlO1xuICB9XG5cbiAgZXZlbnQuZW5kQXQgPSBOdHAuX25vdygpO1xuXG4gIGlmKGRhdGEpIHtcbiAgICB2YXIgaW5mbyA9IF8ucGljayh0cmFjZUluZm8sICd0eXBlJywgJ25hbWUnKVxuICAgIGV2ZW50LmRhdGEgPSBPYmplY3QuYXNzaWduKFxuICAgICAgZXZlbnQuZGF0YSB8fCB7fSxcbiAgICAgIHRoaXMuX2FwcGx5RmlsdGVycyhgJHtldmVudC50eXBlfWVuZGAsIGRhdGEsIGluZm8sICdlbmQnKVxuICAgICk7XG4gIH1cbiAgZXZlbnRMb2dnZXIoXCIlcyAlc1wiLCBldmVudC50eXBlICsgJ2VuZCcsIHRyYWNlSW5mby5faWQpO1xuXG4gIHJldHVybiB0cnVlO1xufTtcblxuVHJhY2VyLnByb3RvdHlwZS5nZXRMYXN0RXZlbnQgPSBmdW5jdGlvbih0cmFjZUluZm8pIHtcbiAgcmV0dXJuIHRyYWNlSW5mby5ldmVudHNbdHJhY2VJbmZvLmV2ZW50cy5sZW5ndGggLTFdXG59O1xuXG5UcmFjZXIucHJvdG90eXBlLmVuZExhc3RFdmVudCA9IGZ1bmN0aW9uKHRyYWNlSW5mbykge1xuICB2YXIgbGFzdEV2ZW50ID0gdGhpcy5nZXRMYXN0RXZlbnQodHJhY2VJbmZvKTtcblxuICBpZiAoIWxhc3RFdmVudC5lbmRBdCkge1xuICAgIHRoaXMuZXZlbnRFbmQodHJhY2VJbmZvLCBsYXN0RXZlbnQpO1xuICAgIGxhc3RFdmVudC5mb3JjZWRFbmQgPSB0cnVlO1xuICAgIHJldHVybiB0cnVlO1xuICB9XG4gIHJldHVybiBmYWxzZTtcbn07XG5cbi8vIE1vc3Qgb2YgdGhlIHRpbWUsIGFsbCBvZiB0aGUgbmVzdGVkIGV2ZW50cyBhcmUgYXN5bmNcbi8vIHdoaWNoIGlzIG5vdCBoZWxwZnVsLiBUaGlzIHJldHVybnMgdHJ1ZSBpZlxuLy8gdGhlcmUgYXJlIG5lc3RlZCBldmVudHMgb3RoZXIgdGhhbiBhc3luYy5cblRyYWNlci5wcm90b3R5cGUuX2hhc1VzZWZ1bE5lc3RlZCA9IGZ1bmN0aW9uIChldmVudCkge1xuICByZXR1cm4gIWV2ZW50Lm5lc3RlZC5ldmVyeShldmVudCA9PiB7XG4gICAgcmV0dXJuIGV2ZW50LnR5cGUgPT09ICdhc3luYyc7XG4gIH0pO1xufVxuXG5UcmFjZXIucHJvdG90eXBlLmJ1aWxkRXZlbnQgPSBmdW5jdGlvbihldmVudCwgZGVwdGggPSAwLCB0cmFjZSkge1xuICB2YXIgZWxhcHNlZFRpbWVGb3JFdmVudCA9IGV2ZW50LmVuZEF0IC0gZXZlbnQuYXQ7XG4gIHZhciBidWlsdEV2ZW50ID0gW2V2ZW50LnR5cGVdO1xuICB2YXIgbmVzdGVkID0gW107XG5cbiAgYnVpbHRFdmVudC5wdXNoKGVsYXBzZWRUaW1lRm9yRXZlbnQpO1xuICBidWlsdEV2ZW50LnB1c2goZXZlbnQuZGF0YSB8fCB7fSk7XG4gIFxuICBpZiAoZXZlbnQubmVzdGVkLmxlbmd0aCAmJiB0aGlzLl9oYXNVc2VmdWxOZXN0ZWQoZXZlbnQpKSB7XG4gICAgbGV0IHByZXZFbmQgPSBldmVudC5hdDtcbiAgICBmb3IobGV0IGkgPSAwOyBpIDwgZXZlbnQubmVzdGVkLmxlbmd0aDsgaSsrKSB7XG4gICAgICB2YXIgbmVzdGVkRXZlbnQgPSBldmVudC5uZXN0ZWRbaV07XG4gICAgICBpZiAoIW5lc3RlZEV2ZW50LmVuZEF0KSB7XG4gICAgICAgIHRoaXMuZXZlbnRFbmQodHJhY2UsIG5lc3RlZEV2ZW50KTtcbiAgICAgICAgbmVzdGVkRXZlbnQuZm9yY2VkRW5kID0gdHJ1ZTtcbiAgICAgIH1cblxuICAgICAgdmFyIGNvbXB1dGVUaW1lID0gbmVzdGVkRXZlbnQuYXQgLSBwcmV2RW5kO1xuICAgICAgaWYgKGNvbXB1dGVUaW1lID4gMCkge1xuICAgICAgICBuZXN0ZWQucHVzaChbJ2NvbXB1dGUnLCBjb21wdXRlVGltZV0pO1xuICAgICAgfVxuXG4gICAgICBuZXN0ZWQucHVzaCh0aGlzLmJ1aWxkRXZlbnQobmVzdGVkRXZlbnQsIGRlcHRoICsgMSwgdHJhY2UpKTtcbiAgICAgIHByZXZFbmQgPSBuZXN0ZWRFdmVudC5lbmRBdDtcbiAgICB9XG4gIH1cblxuXG4gIGlmIChcbiAgICBuZXN0ZWQubGVuZ3RoIHx8XG4gICAgZXZlbnQuc3RhY2sgfHxcbiAgICBldmVudC5mb3JjZWRFbmQgfHxcbiAgICBldmVudC5uYW1lXG4gICkge1xuICAgIGJ1aWx0RXZlbnQucHVzaCh7XG4gICAgICBzdGFjazogZXZlbnQuc3RhY2ssXG4gICAgICBuZXN0ZWQ6IG5lc3RlZC5sZW5ndGggPyBuZXN0ZWQgOiB1bmRlZmluZWQsXG4gICAgICBmb3JjZWRFbmQ6IGV2ZW50LmZvcmNlZEVuZCxcbiAgICAgIG5hbWU6IGV2ZW50Lm5hbWVcbiAgICB9KTtcbiAgfVxuXG4gIHJldHVybiBidWlsdEV2ZW50O1xufVxuXG5UcmFjZXIucHJvdG90eXBlLmJ1aWxkVHJhY2UgPSBmdW5jdGlvbiAodHJhY2VJbmZvKSB7XG4gIHZhciBmaXJzdEV2ZW50ID0gdHJhY2VJbmZvLmV2ZW50c1swXTtcbiAgdmFyIGxhc3RFdmVudCA9IHRyYWNlSW5mby5ldmVudHNbdHJhY2VJbmZvLmV2ZW50cy5sZW5ndGggLSAxXTtcbiAgdmFyIHByb2Nlc3NlZEV2ZW50cyA9IFtdO1xuXG4gIGlmIChmaXJzdEV2ZW50LnR5cGUgIT09ICdzdGFydCcpIHtcbiAgICBjb25zb2xlLndhcm4oJ01vbnRpIEFQTTogdHJhY2UgaGFzIG5vdCBzdGFydGVkIHlldCcpO1xuICAgIHJldHVybiBudWxsO1xuICB9IGVsc2UgaWYgKGxhc3RFdmVudC50eXBlICE9PSAnY29tcGxldGUnICYmIGxhc3RFdmVudC50eXBlICE9PSAnZXJyb3InKSB7XG4gICAgLy90cmFjZSBpcyBub3QgY29tcGxldGVkIG9yIGVycm9yZWQgeWV0XG4gICAgY29uc29sZS53YXJuKCdNb250aSBBUE06IHRyYWNlIGhhcyBub3QgY29tcGxldGVkIG9yIGVycm9yZWQgeWV0Jyk7XG4gICAgcmV0dXJuIG51bGw7XG4gIH0gZWxzZSB7XG4gICAgLy9idWlsZCB0aGUgbWV0cmljc1xuICAgIHRyYWNlSW5mby5lcnJvcmVkID0gbGFzdEV2ZW50LnR5cGUgPT09ICdlcnJvcic7XG4gICAgdHJhY2VJbmZvLmF0ID0gZmlyc3RFdmVudC5hdDtcblxuICAgIHZhciBtZXRyaWNzID0ge1xuICAgICAgdG90YWw6IGxhc3RFdmVudC5hdCAtIGZpcnN0RXZlbnQuYXQsXG4gICAgfTtcblxuICAgIHZhciB0b3RhbE5vbkNvbXB1dGUgPSAwO1xuXG4gICAgZmlyc3RFdmVudCA9IFsnc3RhcnQnLCAwXTtcbiAgICBpZiAodHJhY2VJbmZvLmV2ZW50c1swXS5kYXRhKSB7XG4gICAgICBmaXJzdEV2ZW50LnB1c2godHJhY2VJbmZvLmV2ZW50c1swXS5kYXRhKTtcbiAgICB9XG4gICAgcHJvY2Vzc2VkRXZlbnRzLnB1c2goZmlyc3RFdmVudCk7XG5cbiAgICBmb3IgKHZhciBsYyA9IDE7IGxjIDwgdHJhY2VJbmZvLmV2ZW50cy5sZW5ndGggLSAxOyBsYyArPSAxKSB7XG4gICAgICB2YXIgcHJldkV2ZW50ID0gdHJhY2VJbmZvLmV2ZW50c1tsYyAtIDFdO1xuICAgICAgdmFyIGV2ZW50ID0gdHJhY2VJbmZvLmV2ZW50c1tsY107XG5cbiAgICAgIGlmICghZXZlbnQuZW5kQXQpIHtcbiAgICAgICAgY29uc29sZS5lcnJvcignTW9udGkgQVBNOiBubyBlbmQgZXZlbnQgZm9yIHR5cGU6ICcsIGV2ZW50LnR5cGUpO1xuICAgICAgICByZXR1cm4gbnVsbDtcbiAgICAgIH1cblxuICAgICAgdmFyIGNvbXB1dGVUaW1lID0gZXZlbnQuYXQgLSBwcmV2RXZlbnQuZW5kQXQ7XG4gICAgICBpZiAoY29tcHV0ZVRpbWUgPiAwKSB7XG4gICAgICAgIHByb2Nlc3NlZEV2ZW50cy5wdXNoKFsnY29tcHV0ZScsIGNvbXB1dGVUaW1lXSk7XG4gICAgICB9XG4gICAgICB2YXIgYnVpbHRFdmVudCA9IHRoaXMuYnVpbGRFdmVudChldmVudCwgMCwgdHJhY2VJbmZvKTtcbiAgICAgIHByb2Nlc3NlZEV2ZW50cy5wdXNoKGJ1aWx0RXZlbnQpO1xuXG4gICAgICBtZXRyaWNzW2V2ZW50LnR5cGVdID0gbWV0cmljc1tldmVudC50eXBlXSB8fCAwO1xuICAgICAgbWV0cmljc1tldmVudC50eXBlXSArPSBidWlsdEV2ZW50WzFdO1xuICAgICAgdG90YWxOb25Db21wdXRlICs9IGJ1aWx0RXZlbnRbMV07XG4gICAgfVxuICB9XG5cbiAgY29tcHV0ZVRpbWUgPSBsYXN0RXZlbnQuYXQgLSB0cmFjZUluZm8uZXZlbnRzW3RyYWNlSW5mby5ldmVudHMubGVuZ3RoIC0gMl0uZW5kQXQ7XG4gIGlmKGNvbXB1dGVUaW1lID4gMCkgcHJvY2Vzc2VkRXZlbnRzLnB1c2goWydjb21wdXRlJywgY29tcHV0ZVRpbWVdKTtcblxuICB2YXIgbGFzdEV2ZW50RGF0YSA9IFtsYXN0RXZlbnQudHlwZSwgMF07XG4gIGlmKGxhc3RFdmVudC5kYXRhKSBsYXN0RXZlbnREYXRhLnB1c2gobGFzdEV2ZW50LmRhdGEpO1xuICBwcm9jZXNzZWRFdmVudHMucHVzaChsYXN0RXZlbnREYXRhKTtcblxuICBpZiAocHJvY2Vzc2VkRXZlbnRzLmxlbmd0aCA+IE1BWF9UUkFDRV9FVkVOVFMpIHtcbiAgICBjb25zdCByZW1vdmVDb3VudCA9IHByb2Nlc3NlZEV2ZW50cy5sZW5ndGggLSBNQVhfVFJBQ0VfRVZFTlRTXG4gICAgcHJvY2Vzc2VkRXZlbnRzLnNwbGljZShNQVhfVFJBQ0VfRVZFTlRTLCByZW1vdmVDb3VudCk7XG4gIH1cblxuICBtZXRyaWNzLmNvbXB1dGUgPSBtZXRyaWNzLnRvdGFsIC0gdG90YWxOb25Db21wdXRlO1xuICB0cmFjZUluZm8ubWV0cmljcyA9IG1ldHJpY3M7XG4gIHRyYWNlSW5mby5ldmVudHMgPSBwcm9jZXNzZWRFdmVudHM7XG4gIHRyYWNlSW5mby5pc0V2ZW50c1Byb2Nlc3NlZCA9IHRydWU7XG4gIHJldHVybiB0cmFjZUluZm87XG59O1xuXG5UcmFjZXIucHJvdG90eXBlLmFkZEZpbHRlciA9IGZ1bmN0aW9uKGZpbHRlckZuKSB7XG4gIHRoaXMuX2ZpbHRlcnMucHVzaChmaWx0ZXJGbik7XG59O1xuXG5UcmFjZXIucHJvdG90eXBlLnJlZGFjdEZpZWxkID0gZnVuY3Rpb24gKGZpZWxkKSB7XG4gIHRoaXMuX2ZpbHRlckZpZWxkcy5wdXNoKGZpZWxkKTtcbn07XG5cblRyYWNlci5wcm90b3R5cGUuX2FwcGx5RmlsdGVycyA9IGZ1bmN0aW9uKGV2ZW50VHlwZSwgZGF0YSwgaW5mbykge1xuICB0aGlzLl9maWx0ZXJzLmZvckVhY2goZnVuY3Rpb24oZmlsdGVyRm4pIHtcbiAgICBkYXRhID0gZmlsdGVyRm4oZXZlbnRUeXBlLCBfLmNsb25lKGRhdGEpLCBpbmZvKTtcbiAgfSk7XG5cbiAgcmV0dXJuIGRhdGE7XG59O1xuXG5UcmFjZXIucHJvdG90eXBlLl9hcHBseU9iamVjdEZpbHRlcnMgPSBmdW5jdGlvbiAodG9GaWx0ZXIpIHtcbiAgY29uc3QgZmlsdGVyT2JqZWN0ID0gKG9iaikgPT4ge1xuICAgIGxldCBjbG9uZWQ7XG4gICAgdGhpcy5fZmlsdGVyRmllbGRzLmZvckVhY2goZnVuY3Rpb24gKGZpZWxkKSB7XG4gICAgICBpZiAoZmllbGQgaW4gb2JqKSB7XG4gICAgICAgIGNsb25lZCA9IGNsb25lZCB8fCBPYmplY3QuYXNzaWduKHt9LCBvYmopO1xuICAgICAgICBjbG9uZWRbZmllbGRdID0gJ01vbnRpOiByZWRhY3RlZCc7XG4gICAgICB9XG4gICAgfSk7XG5cbiAgICByZXR1cm4gY2xvbmVkO1xuICB9XG5cbiAgaWYgKEFycmF5LmlzQXJyYXkodG9GaWx0ZXIpKSB7XG4gICAgbGV0IGNsb25lZDtcbiAgICAvLyBUaGVyZSBjb3VsZCBiZSB0aG91c2FuZHMgb3IgbW9yZSBpdGVtcyBpbiB0aGUgYXJyYXksIGFuZCB0aGlzIHVzdWFsbHkgcnVuc1xuICAgIC8vIGJlZm9yZSB0aGUgZGF0YSBpcyB2YWxpZGF0ZWQuIEZvciBwZXJmb3JtYW5jZSByZWFzb25zIHdlIGxpbWl0IGhvd1xuICAgIC8vIG1hbnkgdG8gY2hlY2tcbiAgICBsZXQgbGVuZ3RoID0gTWF0aC5taW4odG9GaWx0ZXIubGVuZ3RoLCB0aGlzLm1heEFycmF5SXRlbXNUb0ZpbHRlcik7XG4gICAgZm9yIChsZXQgaSA9IDA7IGkgPCBsZW5ndGg7IGkrKykge1xuICAgICAgaWYgKHR5cGVvZiB0b0ZpbHRlcltpXSA9PT0gJ29iamVjdCcgJiYgdG9GaWx0ZXJbaV0gIT09IG51bGwpIHtcbiAgICAgICAgbGV0IHJlc3VsdCA9IGZpbHRlck9iamVjdCh0b0ZpbHRlcltpXSk7XG4gICAgICAgIGlmIChyZXN1bHQpIHtcbiAgICAgICAgICBjbG9uZWQgPSBjbG9uZWQgfHwgWy4uLnRvRmlsdGVyXTtcbiAgICAgICAgICBjbG9uZWRbaV0gPSByZXN1bHQ7XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9XG5cbiAgICByZXR1cm4gY2xvbmVkIHx8IHRvRmlsdGVyO1xuICB9XG5cbiAgcmV0dXJuIGZpbHRlck9iamVjdCh0b0ZpbHRlcikgfHwgdG9GaWx0ZXI7XG59XG5cbkthZGlyYS50cmFjZXIgPSBuZXcgVHJhY2VyKCk7XG4vLyBuZWVkIHRvIGV4cG9zZSBUcmFjZXIgdG8gcHJvdmlkZSBkZWZhdWx0IHNldCBvZiBmaWx0ZXJzXG5LYWRpcmEuVHJhY2VyID0gVHJhY2VyO1xuIiwiLy8gc3RyaXAgc2Vuc2l0aXZlIGRhdGEgc2VudCB0byBNb250aSBBUE0gZW5naW5lLlxuLy8gcG9zc2libGUgdG8gbGltaXQgdHlwZXMgYnkgcHJvdmlkaW5nIGFuIGFycmF5IG9mIHR5cGVzIHRvIHN0cmlwXG4vLyBwb3NzaWJsZSB0eXBlcyBhcmU6IFwic3RhcnRcIiwgXCJkYlwiLCBcImh0dHBcIiwgXCJlbWFpbFwiXG5UcmFjZXIuc3RyaXBTZW5zaXRpdmUgPSBmdW5jdGlvbiBzdHJpcFNlbnNpdGl2ZSh0eXBlc1RvU3RyaXAsIHJlY2VpdmVyVHlwZSwgbmFtZSkge1xuICB0eXBlc1RvU3RyaXAgPSAgdHlwZXNUb1N0cmlwIHx8IFtdO1xuXG4gIHZhciBzdHJpcHBlZFR5cGVzID0ge307XG4gIHR5cGVzVG9TdHJpcC5mb3JFYWNoKGZ1bmN0aW9uKHR5cGUpIHtcbiAgICBzdHJpcHBlZFR5cGVzW3R5cGVdID0gdHJ1ZTtcbiAgfSk7XG5cbiAgcmV0dXJuIGZ1bmN0aW9uICh0eXBlLCBkYXRhLCBpbmZvKSB7XG4gICAgaWYodHlwZXNUb1N0cmlwLmxlbmd0aCA+IDAgJiYgIXN0cmlwcGVkVHlwZXNbdHlwZV0pXG4gICAgICByZXR1cm4gZGF0YTtcblxuICAgIGlmKHJlY2VpdmVyVHlwZSAmJiByZWNlaXZlclR5cGUgIT0gaW5mby50eXBlKVxuICAgICAgcmV0dXJuIGRhdGE7XG5cbiAgICBpZihuYW1lICYmIG5hbWUgIT0gaW5mby5uYW1lKVxuICAgICAgcmV0dXJuIGRhdGE7XG5cbiAgICBpZih0eXBlID09IFwic3RhcnRcIikge1xuICAgICAgaWYgKGRhdGEucGFyYW1zKSB7XG4gICAgICAgIGRhdGEucGFyYW1zID0gXCJbc3RyaXBwZWRdXCI7XG4gICAgICB9XG4gICAgICBpZiAoZGF0YS5oZWFkZXJzKSB7XG4gICAgICAgIGRhdGEuaGVhZGVycyA9IFwiW3N0cmlwcGVkXVwiO1xuICAgICAgfVxuICAgICAgaWYgKGRhdGEuYm9keSkge1xuICAgICAgICBkYXRhLmJvZHkgPSBcIltzdHJpcHBlZF1cIjtcbiAgICAgIH1cbiAgICB9IGVsc2UgaWYodHlwZSA9PSBcImRiXCIpIHtcbiAgICAgIGRhdGEuc2VsZWN0b3IgPSBcIltzdHJpcHBlZF1cIjtcbiAgICB9IGVsc2UgaWYodHlwZSA9PSBcImh0dHBcIikge1xuICAgICAgZGF0YS51cmwgPSBcIltzdHJpcHBlZF1cIjtcbiAgICB9IGVsc2UgaWYodHlwZSA9PSBcImVtYWlsXCIpIHtcbiAgICAgIFtcImZyb21cIiwgXCJ0b1wiLCBcImNjXCIsIFwiYmNjXCIsIFwicmVwbHlUb1wiXS5mb3JFYWNoKGZ1bmN0aW9uKGl0ZW0pIHtcbiAgICAgICAgaWYoZGF0YVtpdGVtXSkge1xuICAgICAgICAgIGRhdGFbaXRlbV0gPSBcIltzdHJpcHBlZF1cIjtcbiAgICAgICAgfVxuICAgICAgfSk7XG4gICAgfVxuXG4gICAgcmV0dXJuIGRhdGE7XG4gIH07XG59O1xuXG4vLyBTdHJpcCBzZW5zaXRpdmUgZGF0YSBzZW50IHRvIE1vbnRpIEFQTSBlbmdpbmUuXG4vLyBJbiBjb250cmFzdCB0byBzdHJpcFNlbnNpdGl2ZSwgdGhpcyBvbmUgaGFzIGFuIGFsbG93IGxpc3Qgb2Ygd2hhdCB0byBrZWVwXG4vLyB0byBndWFyZCBhZ2FpbnN0IGZvcmdldHRpbmcgdG8gc3RyaXAgbmV3IGZpZWxkc1xuLy8gSW4gdGhlIGZ1dHVyZSB0aGlzIG9uZSBtaWdodCByZXBsYWNlIFRyYWNlci5zdHJpcFNlbnNpdGl2ZVxuLy8gb3B0aW9uc1xuVHJhY2VyLnN0cmlwU2Vuc2l0aXZlVGhvcm91Z2ggPSBmdW5jdGlvbiBzdHJpcFNlbnNpdGl2ZSgpIHtcbiAgcmV0dXJuIGZ1bmN0aW9uICh0eXBlLCBkYXRhKSB7XG4gICAgbGV0IGZpZWxkc1RvS2VlcCA9IFtdO1xuXG4gICAgaWYgKHR5cGUgPT0gXCJzdGFydFwiKSB7XG4gICAgICBmaWVsZHNUb0tlZXAgPSBbJ3VzZXJJZCddO1xuICAgIH0gZWxzZSBpZiAodHlwZSA9PT0gJ3dhaXRlbmQnKSB7XG4gICAgICBmaWVsZHNUb0tlZXAgPSBbICd3YWl0T24nIF07XG4gICAgfSBlbHNlIGlmICh0eXBlID09IFwiZGJcIikge1xuICAgICAgZmllbGRzVG9LZWVwID0gW1xuICAgICAgICAnY29sbCcsICdmdW5jJywgJ2N1cnNvcicsICdsaW1pdCcsICdkb2NzRmV0Y2hlZCcsICdkb2NTaXplJywgJ29wbG9nJyxcbiAgICAgICAgJ2ZpZWxkcycsICd3YXNNdWx0aXBsZXhlclJlYWR5JywgJ3F1ZXVlTGVuZ3RoJywgJ2VsYXBzZWRQb2xsaW5nVGltZScsXG4gICAgICAgICdub09mQ2FjaGVkRG9jcydcbiAgICAgIF07XG4gICAgfSBlbHNlIGlmICh0eXBlID09IFwiaHR0cFwiKSB7XG4gICAgICBmaWVsZHNUb0tlZXAgPSBbJ21ldGhvZCcsICdzdGF0dXNDb2RlJ107XG4gICAgfSBlbHNlIGlmICh0eXBlID09IFwiZW1haWxcIikge1xuICAgICAgZmllbGRzVG9LZWVwID0gW107XG4gICAgfSBlbHNlIGlmICh0eXBlID09PSAnY3VzdG9tJykge1xuICAgICAgLy8gVGhpcyBpcyBzdXBwbGllZCBieSB0aGUgdXNlciBzbyB3ZSBhc3N1bWUgdGhleSBhcmUgb25seSBnaXZpbmcgZGF0YSB0aGF0IGNhbiBiZSBzZW50XG4gICAgICBmaWVsZHNUb0tlZXAgPSBPYmplY3Qua2V5cyhkYXRhKTtcbiAgICB9IGVsc2UgaWYgKHR5cGUgPT09ICdlcnJvcicpIHtcbiAgICAgIGZpZWxkc1RvS2VlcCA9IFsnZXJyb3InXTtcbiAgICB9XG5cbiAgICBPYmplY3Qua2V5cyhkYXRhKS5mb3JFYWNoKGtleSA9PiB7XG4gICAgICBpZiAoZmllbGRzVG9LZWVwLmluZGV4T2Yoa2V5KSA9PT0gLTEpIHtcbiAgICAgICAgZGF0YVtrZXldID0gJ1tzdHJpcHBlZF0nO1xuICAgICAgfVxuICAgIH0pO1xuXG4gICAgcmV0dXJuIGRhdGE7XG4gIH07XG59O1xuXG4vLyBzdHJpcCBzZWxlY3RvcnMgb25seSBmcm9tIHRoZSBnaXZlbiBsaXN0IG9mIGNvbGxlY3Rpb24gbmFtZXNcblRyYWNlci5zdHJpcFNlbGVjdG9ycyA9IGZ1bmN0aW9uIHN0cmlwU2VsZWN0b3JzKGNvbGxlY3Rpb25MaXN0LCByZWNlaXZlclR5cGUsIG5hbWUpIHtcbiAgY29sbGVjdGlvbkxpc3QgPSBjb2xsZWN0aW9uTGlzdCB8fCBbXTtcblxuICB2YXIgY29sbE1hcCA9IHt9O1xuICBjb2xsZWN0aW9uTGlzdC5mb3JFYWNoKGZ1bmN0aW9uKGNvbGxOYW1lKSB7XG4gICAgY29sbE1hcFtjb2xsTmFtZV0gPSB0cnVlO1xuICB9KTtcblxuICByZXR1cm4gZnVuY3Rpb24odHlwZSwgZGF0YSwgaW5mbykge1xuICAgIGlmKHR5cGUgIT0gXCJkYlwiIHx8IChkYXRhICYmICFjb2xsTWFwW2RhdGEuY29sbF0pKSB7XG4gICAgICByZXR1cm4gZGF0YVxuICAgIH1cblxuICAgIGlmKHJlY2VpdmVyVHlwZSAmJiByZWNlaXZlclR5cGUgIT0gaW5mby50eXBlKVxuICAgICAgcmV0dXJuIGRhdGE7XG5cbiAgICBpZihuYW1lICYmIG5hbWUgIT0gaW5mby5uYW1lKVxuICAgICAgcmV0dXJuIGRhdGE7XG5cbiAgICBkYXRhLnNlbGVjdG9yID0gXCJbc3RyaXBwZWRdXCI7XG4gICAgcmV0dXJuIGRhdGE7XG4gIH07XG59XG4iLCJ2YXIgbG9nZ2VyID0gTnBtLnJlcXVpcmUoJ2RlYnVnJykoJ2thZGlyYTp0cycpO1xuXG5UcmFjZXJTdG9yZSA9IGZ1bmN0aW9uIFRyYWNlclN0b3JlKG9wdGlvbnMpIHtcbiAgb3B0aW9ucyA9IG9wdGlvbnMgfHwge307XG5cbiAgdGhpcy5tYXhUb3RhbFBvaW50cyA9IG9wdGlvbnMubWF4VG90YWxQb2ludHMgfHwgMzA7XG4gIHRoaXMuaW50ZXJ2YWwgPSBvcHRpb25zLmludGVydmFsIHx8IDEwMDAgKiA2MDtcbiAgdGhpcy5hcmNoaXZlRXZlcnkgPSBvcHRpb25zLmFyY2hpdmVFdmVyeSB8fCB0aGlzLm1heFRvdGFsUG9pbnRzIC8gNjtcblxuICAvL3N0b3JlIG1heCB0b3RhbCBvbiB0aGUgcGFzdCAzMCBtaW51dGVzIChvciBwYXN0IDMwIGl0ZW1zKVxuICB0aGlzLm1heFRvdGFscyA9IE9iamVjdC5jcmVhdGUobnVsbCk7XG4gIC8vc3RvcmUgdGhlIG1heCB0cmFjZSBvZiB0aGUgY3VycmVudCBpbnRlcnZhbFxuICB0aGlzLmN1cnJlbnRNYXhUcmFjZSA9IE9iamVjdC5jcmVhdGUobnVsbCk7XG4gIC8vYXJjaGl2ZSBmb3IgdGhlIHRyYWNlc1xuICB0aGlzLnRyYWNlQXJjaGl2ZSA9IFtdO1xuXG4gIHRoaXMucHJvY2Vzc2VkQ250ID0gT2JqZWN0LmNyZWF0ZShudWxsKTtcblxuICAvL2dyb3VwIGVycm9ycyBieSBtZXNzYWdlcyBiZXR3ZWVuIGFuIGludGVydmFsXG4gIHRoaXMuZXJyb3JNYXAgPSBPYmplY3QuY3JlYXRlKG51bGwpO1xufTtcblxuVHJhY2VyU3RvcmUucHJvdG90eXBlLmFkZFRyYWNlID0gZnVuY3Rpb24odHJhY2UpIHtcbiAgdmFyIGtpbmQgPSBbdHJhY2UudHlwZSwgdHJhY2UubmFtZV0uam9pbignOjonKTtcbiAgaWYoIXRoaXMuY3VycmVudE1heFRyYWNlW2tpbmRdKSB7XG4gICAgdGhpcy5jdXJyZW50TWF4VHJhY2Vba2luZF0gPSBFSlNPTi5jbG9uZSh0cmFjZSk7XG4gIH0gZWxzZSBpZih0aGlzLmN1cnJlbnRNYXhUcmFjZVtraW5kXS5tZXRyaWNzLnRvdGFsIDwgdHJhY2UubWV0cmljcy50b3RhbCkge1xuICAgIHRoaXMuY3VycmVudE1heFRyYWNlW2tpbmRdID0gRUpTT04uY2xvbmUodHJhY2UpO1xuICB9IGVsc2UgaWYodHJhY2UuZXJyb3JlZCkge1xuICAgIHRoaXMuX2hhbmRsZUVycm9ycyh0cmFjZSk7XG4gIH1cbn07XG5cblRyYWNlclN0b3JlLnByb3RvdHlwZS5jb2xsZWN0VHJhY2VzID0gZnVuY3Rpb24oKSB7XG4gIHZhciB0cmFjZXMgPSB0aGlzLnRyYWNlQXJjaGl2ZTtcbiAgdGhpcy50cmFjZUFyY2hpdmUgPSBbXTtcblxuICAvLyBjb252ZXJ0IGF0KHRpbWVzdGFtcCkgaW50byB0aGUgYWN0dWFsIHNlcnZlclRpbWVcbiAgdHJhY2VzLmZvckVhY2goZnVuY3Rpb24odHJhY2UpIHtcbiAgICB0cmFjZS5hdCA9IEthZGlyYS5zeW5jZWREYXRlLnN5bmNUaW1lKHRyYWNlLmF0KTtcbiAgfSk7XG4gIHJldHVybiB0cmFjZXM7XG59O1xuXG5UcmFjZXJTdG9yZS5wcm90b3R5cGUuc3RhcnQgPSBmdW5jdGlvbigpIHtcbiAgdGhpcy5fdGltZW91dEhhbmRsZXIgPSBzZXRJbnRlcnZhbCh0aGlzLnByb2Nlc3NUcmFjZXMuYmluZCh0aGlzKSwgdGhpcy5pbnRlcnZhbCk7XG59O1xuXG5UcmFjZXJTdG9yZS5wcm90b3R5cGUuc3RvcCA9IGZ1bmN0aW9uKCkge1xuICBpZih0aGlzLl90aW1lb3V0SGFuZGxlcikge1xuICAgIGNsZWFySW50ZXJ2YWwodGhpcy5fdGltZW91dEhhbmRsZXIpO1xuICB9XG59O1xuXG5UcmFjZXJTdG9yZS5wcm90b3R5cGUuX2hhbmRsZUVycm9ycyA9IGZ1bmN0aW9uKHRyYWNlKSB7XG4gIC8vIHNlbmRpbmcgZXJyb3IgcmVxdWVzdHMgYXMgaXQgaXNcbiAgdmFyIGxhc3RFdmVudCA9IHRyYWNlLmV2ZW50c1t0cmFjZS5ldmVudHMubGVuZ3RoIC0xXTtcbiAgaWYobGFzdEV2ZW50ICYmIGxhc3RFdmVudFsyXSkge1xuICAgIHZhciBlcnJvciA9IGxhc3RFdmVudFsyXS5lcnJvcjtcblxuICAgIC8vIGdyb3VwaW5nIGVycm9ycyBvY2N1cmVkIChyZXNldCBhZnRlciBwcm9jZXNzVHJhY2VzKVxuICAgIHZhciBlcnJvcktleSA9IFt0cmFjZS50eXBlLCB0cmFjZS5uYW1lLCBlcnJvci5tZXNzYWdlXS5qb2luKFwiOjpcIik7XG4gICAgaWYoIXRoaXMuZXJyb3JNYXBbZXJyb3JLZXldKSB7XG4gICAgICB2YXIgZXJyb3JlZFRyYWNlID0gRUpTT04uY2xvbmUodHJhY2UpO1xuICAgICAgdGhpcy5lcnJvck1hcFtlcnJvcktleV0gPSBlcnJvcmVkVHJhY2U7XG5cbiAgICAgIHRoaXMudHJhY2VBcmNoaXZlLnB1c2goZXJyb3JlZFRyYWNlKTtcbiAgICB9XG4gIH0gZWxzZSB7XG4gICAgbG9nZ2VyKCdsYXN0IGV2ZW50cyBpcyBub3QgYW4gZXJyb3I6ICcsIEpTT04uc3RyaW5naWZ5KHRyYWNlLmV2ZW50cykpO1xuICB9XG59O1xuXG5UcmFjZXJTdG9yZS5wcm90b3R5cGUucHJvY2Vzc1RyYWNlcyA9IGZ1bmN0aW9uKCkge1xuICB2YXIgc2VsZiA9IHRoaXM7XG4gIFxuICBsZXQga2luZHMgPSBuZXcgU2V0KCk7XG4gIE9iamVjdC5rZXlzKHRoaXMubWF4VG90YWxzKS5mb3JFYWNoKGtleSA9PiB7XG4gICAga2luZHMuYWRkKGtleSk7XG4gIH0pO1xuICBPYmplY3Qua2V5cyh0aGlzLmN1cnJlbnRNYXhUcmFjZSkuZm9yRWFjaChrZXkgPT4ge1xuICAgIGtpbmRzLmFkZChrZXkpO1xuICB9KTtcblxuICBmb3IgKGtpbmQgb2Yga2luZHMpIHtcbiAgICBzZWxmLnByb2Nlc3NlZENudFtraW5kXSA9IHNlbGYucHJvY2Vzc2VkQ250W2tpbmRdIHx8IDA7XG4gICAgdmFyIGN1cnJlbnRNYXhUcmFjZSA9IHNlbGYuY3VycmVudE1heFRyYWNlW2tpbmRdO1xuICAgIHZhciBjdXJyZW50TWF4VG90YWwgPSBjdXJyZW50TWF4VHJhY2U/IGN1cnJlbnRNYXhUcmFjZS5tZXRyaWNzLnRvdGFsIDogMDtcblxuICAgIHNlbGYubWF4VG90YWxzW2tpbmRdID0gc2VsZi5tYXhUb3RhbHNba2luZF0gfHwgW107XG4gICAgLy9hZGQgdGhlIGN1cnJlbnQgbWF4UG9pbnRcbiAgICBzZWxmLm1heFRvdGFsc1traW5kXS5wdXNoKGN1cnJlbnRNYXhUb3RhbCk7XG4gICAgdmFyIGV4Y2VlZGluZ1BvaW50cyA9IHNlbGYubWF4VG90YWxzW2tpbmRdLmxlbmd0aCAtIHNlbGYubWF4VG90YWxQb2ludHM7XG4gICAgaWYoZXhjZWVkaW5nUG9pbnRzID4gMCkge1xuICAgICAgc2VsZi5tYXhUb3RhbHNba2luZF0uc3BsaWNlKDAsIGV4Y2VlZGluZ1BvaW50cyk7XG4gICAgfVxuXG4gICAgdmFyIGFyY2hpdmVEZWZhdWx0ID0gKHNlbGYucHJvY2Vzc2VkQ250W2tpbmRdICUgc2VsZi5hcmNoaXZlRXZlcnkpID09IDA7XG4gICAgc2VsZi5wcm9jZXNzZWRDbnRba2luZF0rKztcblxuICAgIHZhciBjYW5BcmNoaXZlID0gYXJjaGl2ZURlZmF1bHRcbiAgICAgIHx8IHNlbGYuX2lzVHJhY2VPdXRsaWVyKGtpbmQsIGN1cnJlbnRNYXhUcmFjZSk7XG5cbiAgICBpZihjYW5BcmNoaXZlICYmIGN1cnJlbnRNYXhUcmFjZSkge1xuICAgICAgc2VsZi50cmFjZUFyY2hpdmUucHVzaChjdXJyZW50TWF4VHJhY2UpO1xuICAgIH1cblxuICAgIC8vcmVzZXQgY3VycmVudE1heFRyYWNlXG4gICAgc2VsZi5jdXJyZW50TWF4VHJhY2Vba2luZF0gPSBudWxsO1xuICB9O1xuXG4gIC8vcmVzZXQgdGhlIGVycm9yTWFwXG4gIHNlbGYuZXJyb3JNYXAgPSBPYmplY3QuY3JlYXRlKG51bGwpO1xufTtcblxuVHJhY2VyU3RvcmUucHJvdG90eXBlLl9pc1RyYWNlT3V0bGllciA9IGZ1bmN0aW9uKGtpbmQsIHRyYWNlKSB7XG4gIGlmKHRyYWNlKSB7XG4gICAgdmFyIGRhdGFTZXQgPSB0aGlzLm1heFRvdGFsc1traW5kXTtcbiAgICByZXR1cm4gdGhpcy5faXNPdXRsaWVyKGRhdGFTZXQsIHRyYWNlLm1ldHJpY3MudG90YWwsIDMpO1xuICB9IGVsc2Uge1xuICAgIHJldHVybiBmYWxzZTtcbiAgfVxufTtcblxuLypcbiAgRGF0YSBwb2ludCBtdXN0IGV4aXN0cyBpbiB0aGUgZGF0YVNldFxuKi9cblRyYWNlclN0b3JlLnByb3RvdHlwZS5faXNPdXRsaWVyID0gZnVuY3Rpb24oZGF0YVNldCwgZGF0YVBvaW50LCBtYXhNYWRaKSB7XG4gIHZhciBtZWRpYW4gPSB0aGlzLl9nZXRNZWRpYW4oZGF0YVNldCk7XG4gIHZhciBtYWQgPSB0aGlzLl9jYWxjdWxhdGVNYWQoZGF0YVNldCwgbWVkaWFuKTtcbiAgdmFyIG1hZFogPSB0aGlzLl9mdW5jTWVkaWFuRGV2aWF0aW9uKG1lZGlhbikoZGF0YVBvaW50KSAvIG1hZDtcblxuICByZXR1cm4gbWFkWiA+IG1heE1hZFo7XG59O1xuXG5UcmFjZXJTdG9yZS5wcm90b3R5cGUuX2dldE1lZGlhbiA9IGZ1bmN0aW9uKGRhdGFTZXQpIHtcbiAgdmFyIHNvcnRlZERhdGFTZXQgPSBfLmNsb25lKGRhdGFTZXQpLnNvcnQoZnVuY3Rpb24oYSwgYikge1xuICAgIHJldHVybiBhLWI7XG4gIH0pO1xuICByZXR1cm4gdGhpcy5fcGlja1F1YXJ0aWxlKHNvcnRlZERhdGFTZXQsIDIpO1xufTtcblxuVHJhY2VyU3RvcmUucHJvdG90eXBlLl9waWNrUXVhcnRpbGUgPSBmdW5jdGlvbihkYXRhU2V0LCBudW0pIHtcbiAgdmFyIHBvcyA9ICgoZGF0YVNldC5sZW5ndGggKyAxKSAqIG51bSkgLyA0O1xuICBpZihwb3MgJSAxID09IDApIHtcbiAgICByZXR1cm4gZGF0YVNldFtwb3MgLTFdO1xuICB9IGVsc2Uge1xuICAgIHBvcyA9IHBvcyAtIChwb3MgJSAxKTtcbiAgICByZXR1cm4gKGRhdGFTZXRbcG9zIC0xXSArIGRhdGFTZXRbcG9zXSkvMlxuICB9XG59O1xuXG5UcmFjZXJTdG9yZS5wcm90b3R5cGUuX2NhbGN1bGF0ZU1hZCA9IGZ1bmN0aW9uKGRhdGFTZXQsIG1lZGlhbikge1xuICB2YXIgbWVkaWFuRGV2aWF0aW9ucyA9IF8ubWFwKGRhdGFTZXQsIHRoaXMuX2Z1bmNNZWRpYW5EZXZpYXRpb24obWVkaWFuKSk7XG4gIHZhciBtYWQgPSB0aGlzLl9nZXRNZWRpYW4obWVkaWFuRGV2aWF0aW9ucyk7XG5cbiAgcmV0dXJuIG1hZDtcbn07XG5cblRyYWNlclN0b3JlLnByb3RvdHlwZS5fZnVuY01lZGlhbkRldmlhdGlvbiA9IGZ1bmN0aW9uKG1lZGlhbikge1xuICByZXR1cm4gZnVuY3Rpb24oeCkge1xuICAgIHJldHVybiBNYXRoLmFicyhtZWRpYW4gLSB4KTtcbiAgfTtcbn07XG5cblRyYWNlclN0b3JlLnByb3RvdHlwZS5fZ2V0TWVhbiA9IGZ1bmN0aW9uKGRhdGFQb2ludHMpIHtcbiAgaWYoZGF0YVBvaW50cy5sZW5ndGggPiAwKSB7XG4gICAgdmFyIHRvdGFsID0gMDtcbiAgICBkYXRhUG9pbnRzLmZvckVhY2goZnVuY3Rpb24ocG9pbnQpIHtcbiAgICAgIHRvdGFsICs9IHBvaW50O1xuICAgIH0pO1xuICAgIHJldHVybiB0b3RhbC9kYXRhUG9pbnRzLmxlbmd0aDtcbiAgfSBlbHNlIHtcbiAgICByZXR1cm4gMDtcbiAgfVxufTtcbiIsInZhciBMUlUgPSBOcG0ucmVxdWlyZSgnbHJ1LWNhY2hlJyk7XG52YXIgY3J5cHRvID0gTnBtLnJlcXVpcmUoJ2NyeXB0bycpO1xudmFyIGpzb25TdHJpbmdpZnkgPSBOcG0ucmVxdWlyZSgnanNvbi1zdHJpbmdpZnktc2FmZScpO1xuXG5Eb2NTekNhY2hlID0gZnVuY3Rpb24gKG1heEl0ZW1zLCBtYXhWYWx1ZXMpIHtcbiAgdGhpcy5pdGVtcyA9IG5ldyBMUlUoe21heDogbWF4SXRlbXN9KTtcbiAgdGhpcy5tYXhWYWx1ZXMgPSBtYXhWYWx1ZXM7XG4gIHRoaXMuY3B1VXNhZ2UgPSAwO1xufVxuXG4vLyBUaGlzIGlzIGNhbGxlZCBmcm9tIFN5c3RlbU1vZGVsLnByb3RvdHlwZS5jcHVVc2FnZSBhbmQgc2F2ZXMgY3B1IHVzYWdlLlxuRG9jU3pDYWNoZS5wcm90b3R5cGUuc2V0UGNwdSA9IGZ1bmN0aW9uIChwY3B1KSB7XG4gIHRoaXMuY3B1VXNhZ2UgPSBwY3B1O1xufTtcblxuRG9jU3pDYWNoZS5wcm90b3R5cGUuZ2V0U2l6ZSA9IGZ1bmN0aW9uIChjb2xsLCBxdWVyeSwgb3B0cywgZGF0YSkge1xuICAvLyBJZiB0aGUgZGF0YXNldCBpcyBudWxsIG9yIGVtcHR5IHdlIGNhbid0IGNhbGN1bGF0ZSB0aGUgc2l6ZVxuICAvLyBEbyBub3QgcHJvY2VzcyB0aGlzIGRhdGEgYW5kIHJldHVybiAwIGFzIHRoZSBkb2N1bWVudCBzaXplLlxuICBpZiAoIShkYXRhICYmIChkYXRhLmxlbmd0aCB8fCAodHlwZW9mIGRhdGEuc2l6ZSA9PT0gJ2Z1bmN0aW9uJyAmJiBkYXRhLnNpemUoKSkpKSkge1xuICAgIHJldHVybiAwO1xuICB9XG5cbiAgdmFyIGtleSA9IHRoaXMuZ2V0S2V5KGNvbGwsIHF1ZXJ5LCBvcHRzKTtcbiAgdmFyIGl0ZW0gPSB0aGlzLml0ZW1zLmdldChrZXkpO1xuXG4gIGlmICghaXRlbSkge1xuICAgIGl0ZW0gPSBuZXcgRG9jU3pDYWNoZUl0ZW0odGhpcy5tYXhWYWx1ZXMpO1xuICAgIHRoaXMuaXRlbXMuc2V0KGtleSwgaXRlbSk7XG4gIH1cblxuICBpZiAodGhpcy5uZWVkc1VwZGF0ZShpdGVtKSkge1xuICAgIHZhciBkb2MgPSB7fTtcbiAgICBpZih0eXBlb2YgZGF0YS5nZXQgPT09ICdmdW5jdGlvbicpe1xuICAgICAgLy8gVGhpcyBpcyBhbiBJZE1hcFxuICAgICAgZGF0YS5mb3JFYWNoKGZ1bmN0aW9uKGVsZW1lbnQpe1xuICAgICAgICBkb2MgPSBlbGVtZW50O1xuICAgICAgICByZXR1cm4gZmFsc2U7IC8vIHJldHVybiBmYWxzZSB0byBzdG9wIGxvb3AuIFdlIG9ubHkgbmVlZCBvbmUgZG9jLlxuICAgICAgfSlcbiAgICB9IGVsc2Uge1xuICAgICAgZG9jID0gZGF0YVswXTtcbiAgICB9XG4gICAgdmFyIHNpemUgPSBCdWZmZXIuYnl0ZUxlbmd0aChqc29uU3RyaW5naWZ5KGRvYyksICd1dGY4Jyk7XG4gICAgaXRlbS5hZGREYXRhKHNpemUpO1xuICB9XG5cbiAgcmV0dXJuIGl0ZW0uZ2V0VmFsdWUoKTtcbn07XG5cbkRvY1N6Q2FjaGUucHJvdG90eXBlLmdldEtleSA9IGZ1bmN0aW9uIChjb2xsLCBxdWVyeSwgb3B0cykge1xuICByZXR1cm4ganNvblN0cmluZ2lmeShbY29sbCwgcXVlcnksIG9wdHNdKTtcbn07XG5cbi8vIHJldHVybnMgYSBzY29yZSBiZXR3ZWVuIDAgYW5kIDEgZm9yIGEgY2FjaGUgaXRlbVxuLy8gdGhpcyBzY29yZSBpcyBkZXRlcm1pbmVkIGJ5OlxuLy8gICogYXZhaWxhYmxlIGNhY2hlIGl0ZW0gc2xvdHNcbi8vICAqIHRpbWUgc2luY2UgbGFzdCB1cGRhdGVkXG4vLyAgKiBjcHUgdXNhZ2Ugb2YgdGhlIGFwcGxpY2F0aW9uXG5Eb2NTekNhY2hlLnByb3RvdHlwZS5nZXRJdGVtU2NvcmUgPSBmdW5jdGlvbiAoaXRlbSkge1xuICByZXR1cm4gW1xuICAgIChpdGVtLm1heFZhbHVlcyAtIGl0ZW0udmFsdWVzLmxlbmd0aCkvaXRlbS5tYXhWYWx1ZXMsXG4gICAgKERhdGUubm93KCkgLSBpdGVtLnVwZGF0ZWQpIC8gNjAwMDAsXG4gICAgKDEwMCAtIHRoaXMuY3B1VXNhZ2UpIC8gMTAwLFxuICBdLm1hcChmdW5jdGlvbiAoc2NvcmUpIHtcbiAgICByZXR1cm4gc2NvcmUgPiAxID8gMSA6IHNjb3JlO1xuICB9KS5yZWR1Y2UoZnVuY3Rpb24gKHRvdGFsLCBzY29yZSkge1xuICAgIHJldHVybiAodG90YWwgfHwgMCkgKyBzY29yZTtcbiAgfSkgLyAzO1xufTtcblxuRG9jU3pDYWNoZS5wcm90b3R5cGUubmVlZHNVcGRhdGUgPSBmdW5jdGlvbiAoaXRlbSkge1xuICAvLyBoYW5kbGUgbmV3bHkgbWFkZSBpdGVtc1xuICBpZiAoIWl0ZW0udmFsdWVzLmxlbmd0aCkge1xuICAgIHJldHVybiB0cnVlO1xuICB9XG5cbiAgdmFyIGN1cnJlbnRUaW1lID0gRGF0ZS5ub3coKTtcbiAgdmFyIHRpbWVTaW5jZVVwZGF0ZSA9IGN1cnJlbnRUaW1lIC0gaXRlbS51cGRhdGVkO1xuICBpZiAodGltZVNpbmNlVXBkYXRlID4gMTAwMCo2MCkge1xuICAgIHJldHVybiB0cnVlO1xuICB9XG5cbiAgcmV0dXJuIHRoaXMuZ2V0SXRlbVNjb3JlKGl0ZW0pID4gMC41O1xufTtcblxuXG5Eb2NTekNhY2hlSXRlbSA9IGZ1bmN0aW9uIChtYXhWYWx1ZXMpIHtcbiAgdGhpcy5tYXhWYWx1ZXMgPSBtYXhWYWx1ZXM7XG4gIHRoaXMudXBkYXRlZCA9IDA7XG4gIHRoaXMudmFsdWVzID0gW107XG59XG5cbkRvY1N6Q2FjaGVJdGVtLnByb3RvdHlwZS5hZGREYXRhID0gZnVuY3Rpb24gKHZhbHVlKSB7XG4gIHRoaXMudmFsdWVzLnB1c2godmFsdWUpO1xuICB0aGlzLnVwZGF0ZWQgPSBEYXRlLm5vdygpO1xuXG4gIGlmICh0aGlzLnZhbHVlcy5sZW5ndGggPiB0aGlzLm1heFZhbHVlcykge1xuICAgIHRoaXMudmFsdWVzLnNoaWZ0KCk7XG4gIH1cbn07XG5cbkRvY1N6Q2FjaGVJdGVtLnByb3RvdHlwZS5nZXRWYWx1ZSA9IGZ1bmN0aW9uICgpIHtcbiAgZnVuY3Rpb24gc29ydE51bWJlcihhLCBiKSB7XG4gICAgcmV0dXJuIGEgLSBiO1xuICB9XG4gIHZhciBzb3J0ZWQgPSB0aGlzLnZhbHVlcy5zb3J0KHNvcnROdW1iZXIpO1xuICB2YXIgbWVkaWFuID0gMDtcblxuICBpZiAoc29ydGVkLmxlbmd0aCAlIDIgPT09IDApIHtcbiAgICB2YXIgaWR4ID0gc29ydGVkLmxlbmd0aCAvIDI7XG4gICAgbWVkaWFuID0gKHNvcnRlZFtpZHhdICsgc29ydGVkW2lkeC0xXSkgLyAyO1xuICB9IGVsc2Uge1xuICAgIHZhciBpZHggPSBNYXRoLmZsb29yKHNvcnRlZC5sZW5ndGggLyAyKTtcbiAgICBtZWRpYW4gPSBzb3J0ZWRbaWR4XTtcbiAgfVxuXG4gIHJldHVybiBtZWRpYW47XG59O1xuIiwiaW1wb3J0IEh0dHBNb2RlbCBmcm9tIFwiLi9tb2RlbHMvaHR0cFwiO1xuaW1wb3J0IHBhY2thZ2VNYXAgZnJvbSAnLi8ubWV0ZW9yLXBhY2thZ2UtdmVyc2lvbnMnO1xuXG52YXIgaG9zdG5hbWUgPSBOcG0ucmVxdWlyZSgnb3MnKS5ob3N0bmFtZSgpO1xudmFyIGxvZ2dlciA9IE5wbS5yZXF1aXJlKCdkZWJ1ZycpKCdrYWRpcmE6YXBtJyk7XG52YXIgRmliZXJzID0gTnBtLnJlcXVpcmUoJ2ZpYmVycycpO1xuXG52YXIgS2FkaXJhQ29yZSA9IE5wbS5yZXF1aXJlKCdtb250aS1hcG0tY29yZScpLkthZGlyYTtcblxuS2FkaXJhLm1vZGVscyA9IHt9O1xuS2FkaXJhLm9wdGlvbnMgPSB7fTtcbkthZGlyYS5lbnYgPSB7XG4gIGN1cnJlbnRTdWI6IG51bGwsIC8vIGtlZXAgY3VycmVudCBzdWJzY3JpcHRpb24gaW5zaWRlIGRkcFxuICBrYWRpcmFJbmZvOiBuZXcgTWV0ZW9yLkVudmlyb25tZW50VmFyaWFibGUoKSxcbn07XG5LYWRpcmEud2FpdFRpbWVCdWlsZGVyID0gbmV3IFdhaXRUaW1lQnVpbGRlcigpO1xuS2FkaXJhLmVycm9ycyA9IFtdO1xuS2FkaXJhLmVycm9ycy5hZGRGaWx0ZXIgPSBLYWRpcmEuZXJyb3JzLnB1c2guYmluZChLYWRpcmEuZXJyb3JzKTtcblxuS2FkaXJhLm1vZGVscy5tZXRob2RzID0gbmV3IE1ldGhvZHNNb2RlbCgpO1xuS2FkaXJhLm1vZGVscy5wdWJzdWIgPSBuZXcgUHVic3ViTW9kZWwoKTtcbkthZGlyYS5tb2RlbHMuc3lzdGVtID0gbmV3IFN5c3RlbU1vZGVsKCk7XG5LYWRpcmEubW9kZWxzLmh0dHAgPSBuZXcgSHR0cE1vZGVsKCk7XG5LYWRpcmEuZG9jU3pDYWNoZSA9IG5ldyBEb2NTekNhY2hlKDEwMDAwMCwgMTApO1xuXG5cbkthZGlyYS5jb25uZWN0ID0gZnVuY3Rpb24oYXBwSWQsIGFwcFNlY3JldCwgb3B0aW9ucykge1xuICBvcHRpb25zID0gb3B0aW9ucyB8fCB7fTtcbiAgb3B0aW9ucy5hcHBJZCA9IGFwcElkO1xuICBvcHRpb25zLmFwcFNlY3JldCA9IGFwcFNlY3JldDtcbiAgb3B0aW9ucy5wYXlsb2FkVGltZW91dCA9IG9wdGlvbnMucGF5bG9hZFRpbWVvdXQgfHwgMTAwMCAqIDIwO1xuICBvcHRpb25zLmVuZHBvaW50ID0gb3B0aW9ucy5lbmRwb2ludCB8fCBcImh0dHBzOi8vZW5naW5lLm1vbnRpYXBtLmNvbVwiO1xuICBvcHRpb25zLmNsaWVudEVuZ2luZVN5bmNEZWxheSA9IG9wdGlvbnMuY2xpZW50RW5naW5lU3luY0RlbGF5IHx8IDEwMDAwO1xuICBvcHRpb25zLnRocmVzaG9sZHMgPSBvcHRpb25zLnRocmVzaG9sZHMgfHwge307XG4gIG9wdGlvbnMuaXNIb3N0TmFtZVNldCA9ICEhb3B0aW9ucy5ob3N0bmFtZTtcbiAgb3B0aW9ucy5ob3N0bmFtZSA9IG9wdGlvbnMuaG9zdG5hbWUgfHwgaG9zdG5hbWU7XG4gIG9wdGlvbnMucHJveHkgPSBvcHRpb25zLnByb3h5IHx8IG51bGw7XG4gIG9wdGlvbnMucmVjb3JkSVBBZGRyZXNzID0gb3B0aW9ucy5yZWNvcmRJUEFkZHJlc3MgfHwgJ2Z1bGwnO1xuICBvcHRpb25zLmV2ZW50U3RhY2tUcmFjZSA9IG9wdGlvbnMuZXZlbnRTdGFja1RyYWNlIHx8IGZhbHNlO1xuXG4gIGlmKG9wdGlvbnMuZG9jdW1lbnRTaXplQ2FjaGVTaXplKSB7XG4gICAgS2FkaXJhLmRvY1N6Q2FjaGUgPSBuZXcgRG9jU3pDYWNoZShvcHRpb25zLmRvY3VtZW50U2l6ZUNhY2hlU2l6ZSwgMTApO1xuICB9XG5cbiAgLy8gcmVtb3ZlIHRyYWlsaW5nIHNsYXNoIGZyb20gZW5kcG9pbnQgdXJsIChpZiBhbnkpXG4gIGlmKF8ubGFzdChvcHRpb25zLmVuZHBvaW50KSA9PT0gJy8nKSB7XG4gICAgb3B0aW9ucy5lbmRwb2ludCA9IG9wdGlvbnMuZW5kcG9pbnQuc3Vic3RyKDAsIG9wdGlvbnMuZW5kcG9pbnQubGVuZ3RoIC0gMSk7XG4gIH1cblxuICAvLyBlcnJvciB0cmFja2luZyBpcyBlbmFibGVkIGJ5IGRlZmF1bHRcbiAgaWYob3B0aW9ucy5lbmFibGVFcnJvclRyYWNraW5nID09PSB1bmRlZmluZWQpIHtcbiAgICBvcHRpb25zLmVuYWJsZUVycm9yVHJhY2tpbmcgPSB0cnVlO1xuICB9XG5cbiAgLy8gdXBsb2FkaW5nIHNvdXJjZW1hcHMgaXMgZW5hYmxlZCBieSBkZWZhdWx0IGluIHByb2R1Y3Rpb25cbiAgaWYgKG9wdGlvbnMudXBsb2FkU291cmNlTWFwcyA9PT0gdW5kZWZpbmVkICYmIE1ldGVvci5pc1Byb2R1Y3Rpb24pIHtcbiAgICBvcHRpb25zLnVwbG9hZFNvdXJjZU1hcHMgPSB0cnVlO1xuICB9XG5cbiAgS2FkaXJhLm9wdGlvbnMgPSBvcHRpb25zO1xuICBLYWRpcmEub3B0aW9ucy5hdXRoSGVhZGVycyA9IHtcbiAgICAnS0FESVJBLUFQUC1JRCc6IEthZGlyYS5vcHRpb25zLmFwcElkLFxuICAgICdLQURJUkEtQVBQLVNFQ1JFVCc6IEthZGlyYS5vcHRpb25zLmFwcFNlY3JldFxuICB9O1xuXG4gIGlmIChhcHBJZCAmJiBhcHBTZWNyZXQpIHtcbiAgICBvcHRpb25zLmFwcElkID0gb3B0aW9ucy5hcHBJZC50cmltKCk7XG4gICAgb3B0aW9ucy5hcHBTZWNyZXQgPSBvcHRpb25zLmFwcFNlY3JldC50cmltKCk7XG5cbiAgICBLYWRpcmEuY29yZUFwaSA9IG5ldyBLYWRpcmFDb3JlKHtcbiAgICAgIGFwcElkOiBvcHRpb25zLmFwcElkLFxuICAgICAgYXBwU2VjcmV0OiBvcHRpb25zLmFwcFNlY3JldCxcbiAgICAgIGVuZHBvaW50OiBvcHRpb25zLmVuZHBvaW50LFxuICAgICAgaG9zdG5hbWU6IG9wdGlvbnMuaG9zdG5hbWUsXG4gICAgICBhZ2VudFZlcnNpb246IHBhY2thZ2VNYXBbJ21vbnRpYXBtOmFnZW50J10gfHwgJzx1bmtub3duPidcbiAgICB9KTtcblxuICAgIEthZGlyYS5jb3JlQXBpLl9jaGVja0F1dGgoKVxuICAgICAgLnRoZW4oZnVuY3Rpb24gKCkge1xuICAgICAgICBsb2dnZXIoJ2Nvbm5lY3RlZCB0byBhcHA6ICcsIGFwcElkKTtcbiAgICAgICAgY29uc29sZS5sb2coJ01vbnRpIEFQTTogU3VjY2Vzc2Z1bGx5IGNvbm5lY3RlZCcpO1xuICAgICAgICBLYWRpcmEuX3NlbmRBcHBTdGF0cygpO1xuICAgICAgICBLYWRpcmEuX3NjaGVkdWxlUGF5bG9hZFNlbmQoKTtcbiAgICAgIH0pXG4gICAgICAuY2F0Y2goZnVuY3Rpb24gKGVycikge1xuICAgICAgICBpZiAoZXJyLm1lc3NhZ2UgPT09IFwiVW5hdXRob3JpemVkXCIpIHtcbiAgICAgICAgICBjb25zb2xlLmxvZygnTW9udGkgQVBNOiBhdXRoZW50aWNhdGlvbiBmYWlsZWQgLSBjaGVjayB5b3VyIGFwcElkICYgYXBwU2VjcmV0JylcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICBjb25zb2xlLmxvZygnTW9udGkgQVBNOiB1bmFibGUgdG8gY29ubmVjdC4gJyArIGVyci5tZXNzYWdlKTtcbiAgICAgICAgfVxuICAgICAgfSk7XG4gIH0gZWxzZSB7XG4gICAgdGhyb3cgbmV3IEVycm9yKCdNb250aSBBUE06IHJlcXVpcmVkIGFwcElkIGFuZCBhcHBTZWNyZXQnKTtcbiAgfVxuXG4gIEthZGlyYS5zeW5jZWREYXRlID0gbmV3IE50cChvcHRpb25zLmVuZHBvaW50KTtcbiAgS2FkaXJhLnN5bmNlZERhdGUuc3luYygpO1xuICBLYWRpcmEubW9kZWxzLmVycm9yID0gbmV3IEVycm9yTW9kZWwoYXBwSWQpO1xuXG4gIC8vIGhhbmRsZSBwcmUtYWRkZWQgZmlsdGVyc1xuICB2YXIgYWRkRmlsdGVyRm4gPSBLYWRpcmEubW9kZWxzLmVycm9yLmFkZEZpbHRlci5iaW5kKEthZGlyYS5tb2RlbHMuZXJyb3IpO1xuICBLYWRpcmEuZXJyb3JzLmZvckVhY2goYWRkRmlsdGVyRm4pO1xuICBLYWRpcmEuZXJyb3JzID0gS2FkaXJhLm1vZGVscy5lcnJvcjtcblxuICAvLyBzZXR0aW5nIHJ1bnRpbWUgaW5mbywgd2hpY2ggd2lsbCBiZSBzZW50IHRvIGthZGlyYVxuICBfX21ldGVvcl9ydW50aW1lX2NvbmZpZ19fLmthZGlyYSA9IHtcbiAgICBhcHBJZDogYXBwSWQsXG4gICAgZW5kcG9pbnQ6IG9wdGlvbnMuZW5kcG9pbnQsXG4gICAgY2xpZW50RW5naW5lU3luY0RlbGF5OiBvcHRpb25zLmNsaWVudEVuZ2luZVN5bmNEZWxheSxcbiAgICByZWNvcmRJUEFkZHJlc3M6IG9wdGlvbnMucmVjb3JkSVBBZGRyZXNzLFxuICB9O1xuXG4gIGlmKG9wdGlvbnMuZW5hYmxlRXJyb3JUcmFja2luZykge1xuICAgIEthZGlyYS5lbmFibGVFcnJvclRyYWNraW5nKCk7XG4gIH0gZWxzZSB7XG4gICAgS2FkaXJhLmRpc2FibGVFcnJvclRyYWNraW5nKCk7XG4gIH1cblxuICAvLyBzdGFydCB0cmFja2luZyBlcnJvcnNcbiAgTWV0ZW9yLnN0YXJ0dXAoZnVuY3Rpb24gKCkge1xuICAgIFRyYWNrVW5jYXVnaHRFeGNlcHRpb25zKCk7XG4gICAgVHJhY2tVbmhhbmRsZWRSZWplY3Rpb25zKCk7XG4gICAgVHJhY2tNZXRlb3JEZWJ1ZygpO1xuICB9KVxuXG4gIE1ldGVvci5wdWJsaXNoKG51bGwsIGZ1bmN0aW9uICgpIHtcbiAgICB2YXIgb3B0aW9ucyA9IF9fbWV0ZW9yX3J1bnRpbWVfY29uZmlnX18ua2FkaXJhO1xuICAgIHRoaXMuYWRkZWQoJ2thZGlyYV9zZXR0aW5ncycsIFJhbmRvbS5pZCgpLCBvcHRpb25zKTtcbiAgICB0aGlzLnJlYWR5KCk7XG4gIH0pO1xuXG4gIC8vIG5vdGlmeSB3ZSd2ZSBjb25uZWN0ZWRcbiAgS2FkaXJhLmNvbm5lY3RlZCA9IHRydWU7XG59O1xuXG4vL3RyYWNrIGhvdyBtYW55IHRpbWVzIHdlJ3ZlIHNlbnQgdGhlIGRhdGEgKG9uY2UgcGVyIG1pbnV0ZSlcbkthZGlyYS5fYnVpbGRQYXlsb2FkID0gZnVuY3Rpb24gKCkge1xuICB2YXIgcGF5bG9hZCA9IHtob3N0OiBLYWRpcmEub3B0aW9ucy5ob3N0bmFtZSwgY2xpZW50VmVyc2lvbnM6IGdldENsaWVudFZlcnNpb25zKCl9O1xuICB2YXIgYnVpbGREZXRhaWxlZEluZm8gPSBLYWRpcmEuX2lzRGV0YWlsZWRJbmZvKCk7XG4gIF8uZXh0ZW5kKHBheWxvYWQsIEthZGlyYS5tb2RlbHMubWV0aG9kcy5idWlsZFBheWxvYWQoYnVpbGREZXRhaWxlZEluZm8pKTtcbiAgXy5leHRlbmQocGF5bG9hZCwgS2FkaXJhLm1vZGVscy5wdWJzdWIuYnVpbGRQYXlsb2FkKGJ1aWxkRGV0YWlsZWRJbmZvKSk7XG4gIF8uZXh0ZW5kKHBheWxvYWQsIEthZGlyYS5tb2RlbHMuc3lzdGVtLmJ1aWxkUGF5bG9hZCgpKTtcbiAgXy5leHRlbmQocGF5bG9hZCwgS2FkaXJhLm1vZGVscy5odHRwLmJ1aWxkUGF5bG9hZCgpKTtcblxuICBpZihLYWRpcmEub3B0aW9ucy5lbmFibGVFcnJvclRyYWNraW5nKSB7XG4gICAgXy5leHRlbmQocGF5bG9hZCwgS2FkaXJhLm1vZGVscy5lcnJvci5idWlsZFBheWxvYWQoKSk7XG4gIH1cblxuICByZXR1cm4gcGF5bG9hZDtcbn1cblxuS2FkaXJhLl9jb3VudERhdGFTZW50ID0gMDtcbkthZGlyYS5fZGV0YWlsSW5mb1NlbnRJbnRlcnZhbCA9IE1hdGguY2VpbCgoMTAwMCo2MCkgLyBLYWRpcmEub3B0aW9ucy5wYXlsb2FkVGltZW91dCk7XG5LYWRpcmEuX2lzRGV0YWlsZWRJbmZvID0gZnVuY3Rpb24gKCkge1xuICByZXR1cm4gKEthZGlyYS5fY291bnREYXRhU2VudCsrICUgS2FkaXJhLl9kZXRhaWxJbmZvU2VudEludGVydmFsKSA9PSAwO1xufVxuXG5LYWRpcmEuX3NlbmRBcHBTdGF0cyA9IGZ1bmN0aW9uICgpIHtcbiAgdmFyIGFwcFN0YXRzID0ge307XG4gIGFwcFN0YXRzLnJlbGVhc2UgPSBNZXRlb3IucmVsZWFzZTtcbiAgYXBwU3RhdHMucHJvdG9jb2xWZXJzaW9uID0gJzEuMC4wJztcbiAgYXBwU3RhdHMucGFja2FnZVZlcnNpb25zID0gW107XG4gIGFwcFN0YXRzLmNsaWVudFZlcnNpb25zID0gZ2V0Q2xpZW50VmVyc2lvbnMoKTtcblxuICBfLmVhY2goUGFja2FnZSwgZnVuY3Rpb24gKHYsIG5hbWUpIHtcbiAgICBhcHBTdGF0cy5wYWNrYWdlVmVyc2lvbnMucHVzaCh7XG4gICAgICBuYW1lOiBuYW1lLFxuICAgICAgdmVyc2lvbjogcGFja2FnZU1hcFtuYW1lXSB8fCBudWxsXG4gICAgfSk7XG4gIH0pO1xuXG4gIEthZGlyYS5jb3JlQXBpLnNlbmREYXRhKHtcbiAgICBzdGFydFRpbWU6IG5ldyBEYXRlKCksXG4gICAgYXBwU3RhdHM6IGFwcFN0YXRzXG4gIH0pLnRoZW4oZnVuY3Rpb24oYm9keSkge1xuICAgIGhhbmRsZUFwaVJlc3BvbnNlKGJvZHkpO1xuICB9KS5jYXRjaChmdW5jdGlvbihlcnIpIHtcbiAgICBjb25zb2xlLmVycm9yKCdNb250aSBBUE0gRXJyb3Igb24gc2VuZGluZyBhcHBTdGF0czonLCBlcnIubWVzc2FnZSk7XG4gIH0pO1xufVxuXG5LYWRpcmEuX3NjaGVkdWxlUGF5bG9hZFNlbmQgPSBmdW5jdGlvbiAoKSB7XG4gIHNldFRpbWVvdXQoZnVuY3Rpb24gKCkge1xuICAgIEthZGlyYS5fc2NoZWR1bGVQYXlsb2FkU2VuZCgpO1xuICAgIEthZGlyYS5fc2VuZFBheWxvYWQoKTtcbiAgfSwgS2FkaXJhLm9wdGlvbnMucGF5bG9hZFRpbWVvdXQpO1xufVxuXG5LYWRpcmEuX3NlbmRQYXlsb2FkID0gZnVuY3Rpb24gKCkge1xuICBuZXcgRmliZXJzKGZ1bmN0aW9uKCkge1xuICAgIHZhciBwYXlsb2FkID0gS2FkaXJhLl9idWlsZFBheWxvYWQoKTtcbiAgICBLYWRpcmEuY29yZUFwaS5zZW5kRGF0YShwYXlsb2FkKVxuICAgIC50aGVuKGZ1bmN0aW9uIChib2R5KSB7XG4gICAgICBoYW5kbGVBcGlSZXNwb25zZShib2R5KTtcbiAgICB9KVxuICAgIC5jYXRjaChmdW5jdGlvbihlcnIpIHtcbiAgICAgIGNvbnNvbGUubG9nKCdNb250aSBBUE0gRXJyb3I6JywgZXJyLm1lc3NhZ2UpO1xuICAgIH0pO1xuICB9KS5ydW4oKTtcbn1cblxuLy8gdGhpcyByZXR1cm4gdGhlIF9fa2FkaXJhSW5mbyBmcm9tIHRoZSBjdXJyZW50IEZpYmVyIGJ5IGRlZmF1bHRcbi8vIGlmIGNhbGxlZCB3aXRoIDJuZCBhcmd1bWVudCBhcyB0cnVlLCBpdCB3aWxsIGdldCB0aGUga2FkaXJhIGluZm8gZnJvbVxuLy8gTWV0ZW9yLkVudmlyb25tZW50VmFyaWFibGVcbi8vXG4vLyBXQVJOTklORzogcmV0dXJuZWQgaW5mbyBvYmplY3QgaXMgdGhlIHJlZmVyZW5jZSBvYmplY3QuXG4vLyAgQ2hhbmdpbmcgaXQgbWlnaHQgY2F1c2UgaXNzdWVzIHdoZW4gYnVpbGRpbmcgdHJhY2VzLiBTbyB1c2Ugd2l0aCBjYXJlXG5LYWRpcmEuX2dldEluZm8gPSBmdW5jdGlvbihjdXJyZW50RmliZXIsIHVzZUVudmlyb25tZW50VmFyaWFibGUpIHtcbiAgY3VycmVudEZpYmVyID0gY3VycmVudEZpYmVyIHx8IEZpYmVycy5jdXJyZW50O1xuICBpZihjdXJyZW50RmliZXIpIHtcbiAgICBpZih1c2VFbnZpcm9ubWVudFZhcmlhYmxlKSB7XG4gICAgICByZXR1cm4gS2FkaXJhLmVudi5rYWRpcmFJbmZvLmdldCgpO1xuICAgIH1cbiAgICByZXR1cm4gY3VycmVudEZpYmVyLl9fa2FkaXJhSW5mbztcbiAgfVxufTtcblxuLy8gdGhpcyBkb2VzIG5vdCBjbG9uZSB0aGUgaW5mbyBvYmplY3QuIFNvLCB1c2Ugd2l0aCBjYXJlXG5LYWRpcmEuX3NldEluZm8gPSBmdW5jdGlvbihpbmZvKSB7XG4gIEZpYmVycy5jdXJyZW50Ll9fa2FkaXJhSW5mbyA9IGluZm87XG59O1xuXG5LYWRpcmEuc3RhcnRDb250aW51b3VzUHJvZmlsaW5nID0gZnVuY3Rpb24gKCkge1xuICBNb250aVByb2ZpbGVyLnN0YXJ0Q29udGludW91cyhmdW5jdGlvbiBvblByb2ZpbGUoeyBwcm9maWxlLCBzdGFydFRpbWUsIGVuZFRpbWUgfSkge1xuICAgIGlmICghS2FkaXJhLmNvbm5lY3RlZCkge1xuICAgICAgcmV0dXJuO1xuICAgIH1cblxuICAgIEthZGlyYS5jb3JlQXBpLnNlbmREYXRhKHsgcHJvZmlsZXM6IFt7cHJvZmlsZSwgc3RhcnRUaW1lLCBlbmRUaW1lIH1dfSlcbiAgICAgIC5jYXRjaChlID0+IGNvbnNvbGUubG9nKCdNb250aTogZXJyIHNlbmRpbmcgY3B1IHByb2ZpbGUnLCBlKSk7XG4gIH0pO1xufVxuXG5LYWRpcmEuZW5hYmxlRXJyb3JUcmFja2luZyA9IGZ1bmN0aW9uICgpIHtcbiAgX19tZXRlb3JfcnVudGltZV9jb25maWdfXy5rYWRpcmEuZW5hYmxlRXJyb3JUcmFja2luZyA9IHRydWU7XG4gIEthZGlyYS5vcHRpb25zLmVuYWJsZUVycm9yVHJhY2tpbmcgPSB0cnVlO1xufTtcblxuS2FkaXJhLmRpc2FibGVFcnJvclRyYWNraW5nID0gZnVuY3Rpb24gKCkge1xuICBfX21ldGVvcl9ydW50aW1lX2NvbmZpZ19fLmthZGlyYS5lbmFibGVFcnJvclRyYWNraW5nID0gZmFsc2U7XG4gIEthZGlyYS5vcHRpb25zLmVuYWJsZUVycm9yVHJhY2tpbmcgPSBmYWxzZTtcbn07XG5cbkthZGlyYS50cmFja0Vycm9yID0gZnVuY3Rpb24gKHR5cGUsIG1lc3NhZ2UsIG9wdGlvbnMpIHtcbiAgaWYoS2FkaXJhLm9wdGlvbnMuZW5hYmxlRXJyb3JUcmFja2luZyAmJiB0eXBlICYmIG1lc3NhZ2UpIHtcbiAgICBvcHRpb25zID0gb3B0aW9ucyB8fCB7fTtcbiAgICBvcHRpb25zLnN1YlR5cGUgPSBvcHRpb25zLnN1YlR5cGUgfHwgJ3NlcnZlcic7XG4gICAgb3B0aW9ucy5zdGFja3MgPSBvcHRpb25zLnN0YWNrcyB8fCAnJztcbiAgICB2YXIgZXJyb3IgPSB7bWVzc2FnZTogbWVzc2FnZSwgc3RhY2s6IG9wdGlvbnMuc3RhY2tzfTtcbiAgICB2YXIgdHJhY2UgPSB7XG4gICAgICB0eXBlOiB0eXBlLFxuICAgICAgc3ViVHlwZTogb3B0aW9ucy5zdWJUeXBlLFxuICAgICAgbmFtZTogbWVzc2FnZSxcbiAgICAgIGVycm9yZWQ6IHRydWUsXG4gICAgICBhdDogS2FkaXJhLnN5bmNlZERhdGUuZ2V0VGltZSgpLFxuICAgICAgZXZlbnRzOiBbWydzdGFydCcsIDAsIHt9XSwgWydlcnJvcicsIDAsIHtlcnJvcjogZXJyb3J9XV0sXG4gICAgICBtZXRyaWNzOiB7dG90YWw6IDB9XG4gICAgfTtcbiAgICBLYWRpcmEubW9kZWxzLmVycm9yLnRyYWNrRXJyb3IoZXJyb3IsIHRyYWNlKTtcbiAgfVxufVxuXG5LYWRpcmEuaWdub3JlRXJyb3JUcmFja2luZyA9IGZ1bmN0aW9uIChlcnIpIHtcbiAgZXJyLl9za2lwS2FkaXJhID0gdHJ1ZTtcbn1cblxuS2FkaXJhLnN0YXJ0RXZlbnQgPSBmdW5jdGlvbiAobmFtZSwgZGF0YSA9IHt9KSB7XG4gIHZhciBrYWRpcmFJbmZvID0gS2FkaXJhLl9nZXRJbmZvKCk7XG4gIGlmKGthZGlyYUluZm8pIHtcbiAgICByZXR1cm4gS2FkaXJhLnRyYWNlci5ldmVudChrYWRpcmFJbmZvLnRyYWNlLCAnY3VzdG9tJywgZGF0YSwgeyBuYW1lIH0pO1xuICB9XG5cbiAgcmV0dXJuIGZhbHNlXG59XG5cbkthZGlyYS5lbmRFdmVudCA9IGZ1bmN0aW9uIChldmVudCwgZGF0YSkge1xuICB2YXIga2FkaXJhSW5mbyA9IEthZGlyYS5fZ2V0SW5mbygpO1xuXG4gIC8vIFRoZSBldmVudCBjb3VsZCBiZSBmYWxzZSBpZiBpdCBjb3VsZCBub3QgYmUgc3RhcnRlZC5cbiAgLy8gSGFuZGxlIGl0IGhlcmUgaW5zdGVhZCBvZiByZXF1aXJpbmcgdGhlIGFwcCB0by5cbiAgaWYgKGthZGlyYUluZm8gJiYgZXZlbnQpIHtcbiAgICBLYWRpcmEudHJhY2VyLmV2ZW50RW5kKGthZGlyYUluZm8udHJhY2UsIGV2ZW50LCBkYXRhKTtcbiAgfVxufVxuIiwidmFyIEZpYmVyID0gTnBtLnJlcXVpcmUoJ2ZpYmVycycpO1xuXG53cmFwU2VydmVyID0gZnVuY3Rpb24oc2VydmVyUHJvdG8pIHtcbiAgdmFyIG9yaWdpbmFsSGFuZGxlQ29ubmVjdCA9IHNlcnZlclByb3RvLl9oYW5kbGVDb25uZWN0XG4gIHNlcnZlclByb3RvLl9oYW5kbGVDb25uZWN0ID0gZnVuY3Rpb24oc29ja2V0LCBtc2cpIHtcbiAgICBvcmlnaW5hbEhhbmRsZUNvbm5lY3QuY2FsbCh0aGlzLCBzb2NrZXQsIG1zZyk7XG4gICAgdmFyIHNlc3Npb24gPSBzb2NrZXQuX21ldGVvclNlc3Npb247XG4gICAgLy8gc29tZXRpbWVzIGl0IGlzIHBvc3NpYmxlIGZvciBfbWV0ZW9yU2Vzc2lvbiB0byBiZSB1bmRlZmluZWRcbiAgICAvLyBvbmUgc3VjaCByZWFzb24gd291bGQgYmUgaWYgRERQIHZlcnNpb25zIGFyZSBub3QgbWF0Y2hpbmdcbiAgICAvLyBpZiB0aGVuLCB3ZSBzaG91bGQgbm90IHByb2Nlc3MgaXRcbiAgICBpZighc2Vzc2lvbikge1xuICAgICAgcmV0dXJuO1xuICAgIH1cblxuICAgIEthZGlyYS5FdmVudEJ1cy5lbWl0KCdzeXN0ZW0nLCAnY3JlYXRlU2Vzc2lvbicsIG1zZywgc29ja2V0Ll9tZXRlb3JTZXNzaW9uKTtcblxuICAgIGlmKEthZGlyYS5jb25uZWN0ZWQpIHtcbiAgICAgIEthZGlyYS5tb2RlbHMuc3lzdGVtLmhhbmRsZVNlc3Npb25BY3Rpdml0eShtc2csIHNvY2tldC5fbWV0ZW9yU2Vzc2lvbik7XG4gICAgfVxuICB9O1xufTtcbiIsImltcG9ydCB7IE1ldGVvckRlYnVnSWdub3JlIH0gZnJvbSBcIi4vZXJyb3JcIjtcblxuY29uc3QgTUFYX1BBUkFNU19MRU5HVEggPSA0MDAwXG5cbndyYXBTZXNzaW9uID0gZnVuY3Rpb24oc2Vzc2lvblByb3RvKSB7XG4gIHZhciBvcmlnaW5hbFByb2Nlc3NNZXNzYWdlID0gc2Vzc2lvblByb3RvLnByb2Nlc3NNZXNzYWdlO1xuICBzZXNzaW9uUHJvdG8ucHJvY2Vzc01lc3NhZ2UgPSBmdW5jdGlvbihtc2cpIHtcbiAgICBpZih0cnVlKSB7XG4gICAgICB2YXIga2FkaXJhSW5mbyA9IHtcbiAgICAgICAgc2Vzc2lvbjogdGhpcy5pZCxcbiAgICAgICAgdXNlcklkOiB0aGlzLnVzZXJJZFxuICAgICAgfTtcblxuICAgICAgaWYobXNnLm1zZyA9PSAnbWV0aG9kJyB8fCBtc2cubXNnID09ICdzdWInKSB7XG4gICAgICAgIGthZGlyYUluZm8udHJhY2UgPSBLYWRpcmEudHJhY2VyLnN0YXJ0KHRoaXMsIG1zZyk7XG4gICAgICAgIEthZGlyYS53YWl0VGltZUJ1aWxkZXIucmVnaXN0ZXIodGhpcywgbXNnLmlkKTtcblxuICAgICAgICBsZXQgcGFyYW1zID0gS2FkaXJhLnRyYWNlci5fYXBwbHlPYmplY3RGaWx0ZXJzKG1zZy5wYXJhbXMgfHwgW10pO1xuICAgICAgICAvLyB1c2UgSlNPTiBpbnN0ZWFkIG9mIEVKU09OIHRvIHNhdmUgdGhlIENQVVxuICAgICAgICBsZXQgc3RyaW5naWZpZWRQYXJhbXMgPSBKU09OLnN0cmluZ2lmeShwYXJhbXMpO1xuXG4gICAgICAgIC8vIFRoZSBwYXJhbXMgY291bGQgYmUgc2V2ZXJhbCBtYiBvciBsYXJnZXIuXG4gICAgICAgIC8vIFRydW5jYXRlIGlmIGl0IGlzIGxhcmdlXG4gICAgICAgIGlmIChzdHJpbmdpZmllZFBhcmFtcy5sZW5ndGggPiBNQVhfUEFSQU1TX0xFTkdUSCkge1xuICAgICAgICAgIHN0cmluZ2lmaWVkUGFyYW1zID0gYE1vbnRpIEFQTTogcGFyYW1zIGFyZSB0b28gYmlnLiBGaXJzdCAke01BWF9QQVJBTVNfTEVOR1RIfSBjaGFyYWN0ZXJzOiAke3N0cmluZ2lmaWVkUGFyYW1zLnNsaWNlKDAsIE1BWF9QQVJBTVNfTEVOR1RIKX1gO1xuICAgICAgICB9XG5cbiAgICAgICAgdmFyIHN0YXJ0RGF0YSA9IHsgdXNlcklkOiB0aGlzLnVzZXJJZCwgcGFyYW1zOiBzdHJpbmdpZmllZFBhcmFtcyB9O1xuICAgICAgICBLYWRpcmEudHJhY2VyLmV2ZW50KGthZGlyYUluZm8udHJhY2UsICdzdGFydCcsIHN0YXJ0RGF0YSk7XG4gICAgICAgIHZhciB3YWl0RXZlbnRJZCA9IEthZGlyYS50cmFjZXIuZXZlbnQoa2FkaXJhSW5mby50cmFjZSwgJ3dhaXQnLCB7fSwga2FkaXJhSW5mbyk7XG4gICAgICAgIG1zZy5fd2FpdEV2ZW50SWQgPSB3YWl0RXZlbnRJZDtcbiAgICAgICAgbXNnLl9fa2FkaXJhSW5mbyA9IGthZGlyYUluZm87XG5cbiAgICAgICAgaWYobXNnLm1zZyA9PSAnc3ViJykge1xuICAgICAgICAgIC8vIHN0YXJ0IHRyYWNraW5nIGluc2lkZSBwcm9jZXNzTWVzc2FnZSBhbGxvd3MgdXMgdG8gaW5kaWNhdGVcbiAgICAgICAgICAvLyB3YWl0IHRpbWUgYXMgd2VsbFxuICAgICAgICAgIEthZGlyYS5FdmVudEJ1cy5lbWl0KCdwdWJzdWInLCAnc3ViUmVjZWl2ZWQnLCB0aGlzLCBtc2cpO1xuICAgICAgICAgIEthZGlyYS5tb2RlbHMucHVic3ViLl90cmFja1N1Yih0aGlzLCBtc2cpO1xuICAgICAgICB9XG4gICAgICB9XG5cbiAgICAgIC8vIFVwZGF0ZSBzZXNzaW9uIGxhc3QgYWN0aXZlIHRpbWVcbiAgICAgIEthZGlyYS5FdmVudEJ1cy5lbWl0KCdzeXN0ZW0nLCAnZGRwTWVzc2FnZVJlY2VpdmVkJywgdGhpcywgbXNnKTtcbiAgICAgIEthZGlyYS5tb2RlbHMuc3lzdGVtLmhhbmRsZVNlc3Npb25BY3Rpdml0eShtc2csIHRoaXMpO1xuICAgIH1cblxuICAgIHJldHVybiBvcmlnaW5hbFByb2Nlc3NNZXNzYWdlLmNhbGwodGhpcywgbXNnKTtcbiAgfTtcblxuICAvLyBhZGRpbmcgdGhlIG1ldGhvZCBjb250ZXh0IHRvIHRoZSBjdXJyZW50IGZpYmVyXG4gIHZhciBvcmlnaW5hbE1ldGhvZEhhbmRsZXIgPSBzZXNzaW9uUHJvdG8ucHJvdG9jb2xfaGFuZGxlcnMubWV0aG9kO1xuICBzZXNzaW9uUHJvdG8ucHJvdG9jb2xfaGFuZGxlcnMubWV0aG9kID0gZnVuY3Rpb24obXNnLCB1bmJsb2NrKSB7XG4gICAgdmFyIHNlbGYgPSB0aGlzO1xuICAgIC8vYWRkIGNvbnRleHRcbiAgICB2YXIga2FkaXJhSW5mbyA9IG1zZy5fX2thZGlyYUluZm87XG4gICAgaWYoa2FkaXJhSW5mbykge1xuICAgICAgS2FkaXJhLl9zZXRJbmZvKGthZGlyYUluZm8pO1xuXG4gICAgICAvLyBlbmQgd2FpdCBldmVudFxuICAgICAgdmFyIHdhaXRMaXN0ID0gS2FkaXJhLndhaXRUaW1lQnVpbGRlci5idWlsZCh0aGlzLCBtc2cuaWQpO1xuICAgICAgS2FkaXJhLnRyYWNlci5ldmVudEVuZChrYWRpcmFJbmZvLnRyYWNlLCBtc2cuX3dhaXRFdmVudElkLCB7d2FpdE9uOiB3YWl0TGlzdH0pO1xuXG4gICAgICB1bmJsb2NrID0gS2FkaXJhLndhaXRUaW1lQnVpbGRlci50cmFja1dhaXRUaW1lKHRoaXMsIG1zZywgdW5ibG9jayk7XG4gICAgICB2YXIgcmVzcG9uc2UgPSBLYWRpcmEuZW52LmthZGlyYUluZm8ud2l0aFZhbHVlKGthZGlyYUluZm8sIGZ1bmN0aW9uICgpIHtcbiAgICAgICAgcmV0dXJuIG9yaWdpbmFsTWV0aG9kSGFuZGxlci5jYWxsKHNlbGYsIG1zZywgdW5ibG9jayk7XG4gICAgICB9KTtcbiAgICAgIHVuYmxvY2soKTtcbiAgICB9IGVsc2Uge1xuICAgICAgdmFyIHJlc3BvbnNlID0gb3JpZ2luYWxNZXRob2RIYW5kbGVyLmNhbGwoc2VsZiwgbXNnLCB1bmJsb2NrKTtcbiAgICB9XG5cbiAgICByZXR1cm4gcmVzcG9uc2U7XG4gIH07XG5cbiAgLy90byBjYXB0dXJlIHRoZSBjdXJyZW50bHkgcHJvY2Vzc2luZyBtZXNzYWdlXG4gIHZhciBvcmdpbmFsU3ViSGFuZGxlciA9IHNlc3Npb25Qcm90by5wcm90b2NvbF9oYW5kbGVycy5zdWI7XG4gIHNlc3Npb25Qcm90by5wcm90b2NvbF9oYW5kbGVycy5zdWIgPSBmdW5jdGlvbihtc2csIHVuYmxvY2spIHtcbiAgICB2YXIgc2VsZiA9IHRoaXM7XG4gICAgLy9hZGQgY29udGV4dFxuICAgIHZhciBrYWRpcmFJbmZvID0gbXNnLl9fa2FkaXJhSW5mbztcbiAgICBpZihrYWRpcmFJbmZvKSB7XG4gICAgICBLYWRpcmEuX3NldEluZm8oa2FkaXJhSW5mbyk7XG5cbiAgICAgIC8vIGVuZCB3YWl0IGV2ZW50XG4gICAgICB2YXIgd2FpdExpc3QgPSBLYWRpcmEud2FpdFRpbWVCdWlsZGVyLmJ1aWxkKHRoaXMsIG1zZy5pZCk7XG4gICAgICBLYWRpcmEudHJhY2VyLmV2ZW50RW5kKGthZGlyYUluZm8udHJhY2UsIG1zZy5fd2FpdEV2ZW50SWQsIHt3YWl0T246IHdhaXRMaXN0fSk7XG5cbiAgICAgIHVuYmxvY2sgPSBLYWRpcmEud2FpdFRpbWVCdWlsZGVyLnRyYWNrV2FpdFRpbWUodGhpcywgbXNnLCB1bmJsb2NrKTtcbiAgICAgIHZhciByZXNwb25zZSA9IEthZGlyYS5lbnYua2FkaXJhSW5mby53aXRoVmFsdWUoa2FkaXJhSW5mbywgZnVuY3Rpb24gKCkge1xuICAgICAgICByZXR1cm4gb3JnaW5hbFN1YkhhbmRsZXIuY2FsbChzZWxmLCBtc2csIHVuYmxvY2spO1xuICAgICAgfSk7XG4gICAgICB1bmJsb2NrKCk7XG4gICAgfSBlbHNlIHtcbiAgICAgIHZhciByZXNwb25zZSA9IG9yZ2luYWxTdWJIYW5kbGVyLmNhbGwoc2VsZiwgbXNnLCB1bmJsb2NrKTtcbiAgICB9XG5cbiAgICByZXR1cm4gcmVzcG9uc2U7XG4gIH07XG5cbiAgLy90byBjYXB0dXJlIHRoZSBjdXJyZW50bHkgcHJvY2Vzc2luZyBtZXNzYWdlXG4gIHZhciBvcmdpbmFsVW5TdWJIYW5kbGVyID0gc2Vzc2lvblByb3RvLnByb3RvY29sX2hhbmRsZXJzLnVuc3ViO1xuICBzZXNzaW9uUHJvdG8ucHJvdG9jb2xfaGFuZGxlcnMudW5zdWIgPSBmdW5jdGlvbihtc2csIHVuYmxvY2spIHtcbiAgICB1bmJsb2NrID0gS2FkaXJhLndhaXRUaW1lQnVpbGRlci50cmFja1dhaXRUaW1lKHRoaXMsIG1zZywgdW5ibG9jayk7XG4gICAgdmFyIHJlc3BvbnNlID0gb3JnaW5hbFVuU3ViSGFuZGxlci5jYWxsKHRoaXMsIG1zZywgdW5ibG9jayk7XG4gICAgdW5ibG9jaygpO1xuICAgIHJldHVybiByZXNwb25zZTtcbiAgfTtcblxuICAvL3RyYWNrIG1ldGhvZCBlbmRpbmcgKHRvIGdldCB0aGUgcmVzdWx0IG9mIGVycm9yKVxuICB2YXIgb3JpZ2luYWxTZW5kID0gc2Vzc2lvblByb3RvLnNlbmQ7XG4gIHNlc3Npb25Qcm90by5zZW5kID0gZnVuY3Rpb24obXNnKSB7XG4gICAgaWYobXNnLm1zZyA9PSAncmVzdWx0Jykge1xuICAgICAgdmFyIGthZGlyYUluZm8gPSBLYWRpcmEuX2dldEluZm8oKTtcbiAgICAgIGlmKGthZGlyYUluZm8pIHtcbiAgICAgICAgaWYobXNnLmVycm9yKSB7XG4gICAgICAgICAgdmFyIGVycm9yID0gXy5waWNrKG1zZy5lcnJvciwgWydtZXNzYWdlJywgJ3N0YWNrJywgJ2RldGFpbHMnXSk7XG5cbiAgICAgICAgICAvLyBwaWNrIHRoZSBlcnJvciBmcm9tIHRoZSB3cmFwcGVkIG1ldGhvZCBoYW5kbGVyXG4gICAgICAgICAgaWYoa2FkaXJhSW5mbyAmJiBrYWRpcmFJbmZvLmN1cnJlbnRFcnJvcikge1xuICAgICAgICAgICAgLy8gdGhlIGVycm9yIHN0YWNrIGlzIHdyYXBwZWQgc28gTWV0ZW9yLl9kZWJ1ZyBjYW4gaWRlbnRpZnlcbiAgICAgICAgICAgIC8vIHRoaXMgYXMgYSBtZXRob2QgZXJyb3IuXG4gICAgICAgICAgICBlcnJvciA9IF8ucGljayhrYWRpcmFJbmZvLmN1cnJlbnRFcnJvciwgWydtZXNzYWdlJywgJ3N0YWNrJywgJ2RldGFpbHMnXSk7XG4gICAgICAgICAgICAvLyBzZWUgd3JhcE1ldGhvZEhhbmRlckZvckVycm9ycygpIG1ldGhvZCBkZWYgZm9yIG1vcmUgaW5mb1xuICAgICAgICAgICAgaWYoZXJyb3Iuc3RhY2sgJiYgZXJyb3Iuc3RhY2suc3RhY2spIHtcbiAgICAgICAgICAgICAgZXJyb3Iuc3RhY2sgPSBlcnJvci5zdGFjay5zdGFjaztcbiAgICAgICAgICAgIH1cbiAgICAgICAgICB9XG5cbiAgICAgICAgICBLYWRpcmEudHJhY2VyLmVuZExhc3RFdmVudChrYWRpcmFJbmZvLnRyYWNlKTtcbiAgICAgICAgICBLYWRpcmEudHJhY2VyLmV2ZW50KGthZGlyYUluZm8udHJhY2UsICdlcnJvcicsIHtlcnJvcjogZXJyb3J9KTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICBLYWRpcmEudHJhY2VyLmVuZExhc3RFdmVudChrYWRpcmFJbmZvLnRyYWNlKTtcbiAgICAgICAgICBLYWRpcmEudHJhY2VyLmV2ZW50KGthZGlyYUluZm8udHJhY2UsICdjb21wbGV0ZScpO1xuICAgICAgICB9XG5cbiAgICAgICAgLy9wcm9jZXNzaW5nIHRoZSBtZXNzYWdlXG4gICAgICAgIHZhciB0cmFjZSA9IEthZGlyYS50cmFjZXIuYnVpbGRUcmFjZShrYWRpcmFJbmZvLnRyYWNlKTtcbiAgICAgICAgS2FkaXJhLkV2ZW50QnVzLmVtaXQoJ21ldGhvZCcsICdtZXRob2RDb21wbGV0ZWQnLCB0cmFjZSwgdGhpcyk7XG4gICAgICAgIEthZGlyYS5tb2RlbHMubWV0aG9kcy5wcm9jZXNzTWV0aG9kKHRyYWNlKTtcblxuICAgICAgICAvLyBlcnJvciBtYXkgb3IgbWF5IG5vdCBleGlzdCBhbmQgZXJyb3IgdHJhY2tpbmcgY2FuIGJlIGRpc2FibGVkXG4gICAgICAgIGlmKGVycm9yICYmIEthZGlyYS5vcHRpb25zLmVuYWJsZUVycm9yVHJhY2tpbmcpIHtcbiAgICAgICAgICBLYWRpcmEubW9kZWxzLmVycm9yLnRyYWNrRXJyb3IoZXJyb3IsIHRyYWNlKTtcbiAgICAgICAgfVxuXG4gICAgICAgIC8vY2xlYW4gYW5kIG1ha2Ugc3VyZSwgZmliZXIgaXMgY2xlYW5cbiAgICAgICAgLy9ub3Qgc3VyZSB3ZSBuZWVkIHRvIGRvIHRoaXMsIGJ1dCBhIHByZXZlbnRpdmUgbWVhc3VyZVxuICAgICAgICBLYWRpcmEuX3NldEluZm8obnVsbCk7XG4gICAgICB9XG4gICAgfVxuXG4gICAgcmV0dXJuIG9yaWdpbmFsU2VuZC5jYWxsKHRoaXMsIG1zZyk7XG4gIH07XG59O1xuXG4vLyB3cmFwIGV4aXN0aW5nIG1ldGhvZCBoYW5kbGVycyBmb3IgY2FwdHVyaW5nIGVycm9yc1xuXy5lYWNoKE1ldGVvci5zZXJ2ZXIubWV0aG9kX2hhbmRsZXJzLCBmdW5jdGlvbihoYW5kbGVyLCBuYW1lKSB7XG4gIHdyYXBNZXRob2RIYW5kZXJGb3JFcnJvcnMobmFtZSwgaGFuZGxlciwgTWV0ZW9yLnNlcnZlci5tZXRob2RfaGFuZGxlcnMpO1xufSk7XG5cbi8vIHdyYXAgZnV0dXJlIG1ldGhvZCBoYW5kbGVycyBmb3IgY2FwdHVyaW5nIGVycm9yc1xudmFyIG9yaWdpbmFsTWV0ZW9yTWV0aG9kcyA9IE1ldGVvci5tZXRob2RzO1xuTWV0ZW9yLm1ldGhvZHMgPSBmdW5jdGlvbihtZXRob2RNYXApIHtcbiAgXy5lYWNoKG1ldGhvZE1hcCwgZnVuY3Rpb24oaGFuZGxlciwgbmFtZSkge1xuICAgIHdyYXBNZXRob2RIYW5kZXJGb3JFcnJvcnMobmFtZSwgaGFuZGxlciwgbWV0aG9kTWFwKTtcbiAgfSk7XG4gIG9yaWdpbmFsTWV0ZW9yTWV0aG9kcyhtZXRob2RNYXApO1xufTtcblxuXG5mdW5jdGlvbiB3cmFwTWV0aG9kSGFuZGVyRm9yRXJyb3JzKG5hbWUsIG9yaWdpbmFsSGFuZGxlciwgbWV0aG9kTWFwKSB7XG4gIG1ldGhvZE1hcFtuYW1lXSA9IGZ1bmN0aW9uKCkge1xuICAgIHRyeXtcbiAgICAgIHJldHVybiBvcmlnaW5hbEhhbmRsZXIuYXBwbHkodGhpcywgYXJndW1lbnRzKTtcbiAgICB9IGNhdGNoKGV4KSB7XG4gICAgICBpZihleCAmJiBLYWRpcmEuX2dldEluZm8oKSkge1xuICAgICAgICAvLyBzb21ldGltZXMgZXJyb3IgbWF5IGJlIGp1c3QgYW4gc3RyaW5nIG9yIGEgcHJpbWl0aXZlXG4gICAgICAgIC8vIGluIHRoYXQgY2FzZSwgd2UgbmVlZCB0byBtYWtlIGl0IGEgcHN1ZWRvIGVycm9yXG4gICAgICAgIGlmKHR5cGVvZiBleCAhPT0gJ29iamVjdCcpIHtcbiAgICAgICAgICBleCA9IHttZXNzYWdlOiBleCwgc3RhY2s6IGV4fTtcbiAgICAgICAgfVxuICAgICAgICAvLyBOb3cgd2UgYXJlIG1hcmtpbmcgdGhpcyBlcnJvciB0byBnZXQgdHJhY2tlZCB2aWEgbWV0aG9kc1xuICAgICAgICAvLyBCdXQsIHRoaXMgYWxzbyB0cmlnZ2VycyBhIE1ldGVvci5kZWJ1ZyBjYWxsIGFuZFxuICAgICAgICAvLyBpdCBvbmx5IGdldHMgdGhlIHN0YWNrXG4gICAgICAgIC8vIFdlIGFsc28gdHJhY2sgTWV0ZW9yLmRlYnVnIGVycm9ycyBhbmQgd2FudCB0byBzdG9wXG4gICAgICAgIC8vIHRyYWNraW5nIHRoaXMgZXJyb3IuIFRoYXQncyB3aHkgd2UgZG8gdGhpc1xuICAgICAgICAvLyBTZWUgTWV0ZW9yLmRlYnVnIGVycm9yIHRyYWNraW5nIGNvZGUgZm9yIG1vcmVcbiAgICAgICAgLy8gSWYgZXJyb3IgdHJhY2tpbmcgaXMgZGlzYWJsZWQsIHdlIGRvIG5vdCBtb2RpZnkgdGhlIHN0YWNrIHNpbmNlXG4gICAgICAgIC8vIGl0IHdvdWxkIGJlIHNob3duIGFzIGFuIG9iamVjdCBpbiB0aGUgbG9nc1xuICAgICAgICBpZiAoS2FkaXJhLm9wdGlvbnMuZW5hYmxlRXJyb3JUcmFja2luZykge1xuICAgICAgICAgIGV4LnN0YWNrID0ge3N0YWNrOiBleC5zdGFjaywgc291cmNlOiAnbWV0aG9kJywgW01ldGVvckRlYnVnSWdub3JlXTogdHJ1ZX07XG4gICAgICAgICAgS2FkaXJhLl9nZXRJbmZvKCkuY3VycmVudEVycm9yID0gZXg7XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICAgIHRocm93IGV4O1xuICAgIH1cbiAgfVxufVxuIiwiaW1wb3J0IHsgTWV0ZW9yRGVidWdJZ25vcmUgfSBmcm9tIFwiLi9lcnJvclwiO1xuXG53cmFwU3Vic2NyaXB0aW9uID0gZnVuY3Rpb24oc3Vic2NyaXB0aW9uUHJvdG8pIHtcbiAgLy8gSWYgdGhlIHJlYWR5IGV2ZW50IHJ1bnMgb3V0c2lkZSB0aGUgRmliZXIsIEthZGlyYS5fZ2V0SW5mbygpIGRvZXNuJ3Qgd29yay5cbiAgLy8gd2UgbmVlZCBzb21lIG90aGVyIHdheSB0byBzdG9yZSBrYWRpcmFJbmZvIHNvIHdlIGNhbiB1c2UgaXQgYXQgcmVhZHkgaGlqYWNrLlxuICB2YXIgb3JpZ2luYWxSdW5IYW5kbGVyID0gc3Vic2NyaXB0aW9uUHJvdG8uX3J1bkhhbmRsZXI7XG4gIHN1YnNjcmlwdGlvblByb3RvLl9ydW5IYW5kbGVyID0gZnVuY3Rpb24oKSB7XG4gICAgdmFyIGthZGlyYUluZm8gPSBLYWRpcmEuX2dldEluZm8oKTtcbiAgICBpZiAoa2FkaXJhSW5mbykge1xuICAgICAgdGhpcy5fX2thZGlyYUluZm8gPSBrYWRpcmFJbmZvO1xuICAgIH07XG4gICAgb3JpZ2luYWxSdW5IYW5kbGVyLmNhbGwodGhpcyk7XG4gIH1cblxuICB2YXIgb3JpZ2luYWxSZWFkeSA9IHN1YnNjcmlwdGlvblByb3RvLnJlYWR5O1xuICBzdWJzY3JpcHRpb25Qcm90by5yZWFkeSA9IGZ1bmN0aW9uKCkge1xuICAgIC8vIG1ldGVvciBoYXMgYSBmaWVsZCBjYWxsZWQgYF9yZWFkeWAgd2hpY2ggdHJhY2tzIHRoaXNcbiAgICAvLyBidXQgd2UgbmVlZCB0byBtYWtlIGl0IGZ1dHVyZSBwcm9vZlxuICAgIGlmKCF0aGlzLl9hcG1SZWFkeVRyYWNrZWQpIHtcbiAgICAgIHZhciBrYWRpcmFJbmZvID0gS2FkaXJhLl9nZXRJbmZvKCkgfHwgdGhpcy5fX2thZGlyYUluZm87XG4gICAgICBkZWxldGUgdGhpcy5fX2thZGlyYUluZm87XG4gICAgICAvL3NvbWV0aW1lIC5yZWFkeSBjYW4gYmUgY2FsbGVkIGluIHRoZSBjb250ZXh0IG9mIHRoZSBtZXRob2RcbiAgICAgIC8vdGhlbiB3ZSBoYXZlIHNvbWUgcHJvYmxlbXMsIHRoYXQncyB3aHkgd2UgYXJlIGNoZWNraW5nIHRoaXNcbiAgICAgIC8vZWc6LSBBY2NvdW50cy5jcmVhdGVVc2VyXG4gICAgICAvLyBBbHNvLCB3aGVuIHRoZSBzdWJzY3JpcHRpb24gaXMgY3JlYXRlZCBieSBmYXN0IHJlbmRlciwgX3N1YnNjcmlwdGlvbklkIGFuZFxuICAgICAgLy8gdGhlIHRyYWNlLmlkIGFyZSBib3RoIHVuZGVmaW5lZCBidXQgd2UgZG9uJ3Qgd2FudCB0byBjb21wbGV0ZSB0aGUgSFRUUCB0cmFjZSBoZXJlXG4gICAgICBpZihrYWRpcmFJbmZvICYmIHRoaXMuX3N1YnNjcmlwdGlvbklkICYmIHRoaXMuX3N1YnNjcmlwdGlvbklkID09IGthZGlyYUluZm8udHJhY2UuaWQpIHtcbiAgICAgICAgS2FkaXJhLnRyYWNlci5lbmRMYXN0RXZlbnQoa2FkaXJhSW5mby50cmFjZSk7XG4gICAgICAgIEthZGlyYS50cmFjZXIuZXZlbnQoa2FkaXJhSW5mby50cmFjZSwgJ2NvbXBsZXRlJyk7XG4gICAgICAgIHZhciB0cmFjZSA9IEthZGlyYS50cmFjZXIuYnVpbGRUcmFjZShrYWRpcmFJbmZvLnRyYWNlKTtcbiAgICAgIH1cblxuICAgICAgS2FkaXJhLkV2ZW50QnVzLmVtaXQoJ3B1YnN1YicsICdzdWJDb21wbGV0ZWQnLCB0cmFjZSwgdGhpcy5fc2Vzc2lvbiwgdGhpcyk7XG4gICAgICBLYWRpcmEubW9kZWxzLnB1YnN1Yi5fdHJhY2tSZWFkeSh0aGlzLl9zZXNzaW9uLCB0aGlzLCB0cmFjZSk7XG4gICAgICB0aGlzLl9hcG1SZWFkeVRyYWNrZWQgPSB0cnVlO1xuICAgIH1cblxuICAgIC8vIHdlIHN0aWxsIHBhc3MgdGhlIGNvbnRyb2wgdG8gdGhlIG9yaWdpbmFsIGltcGxlbWVudGF0aW9uXG4gICAgLy8gc2luY2UgbXVsdGlwbGUgcmVhZHkgY2FsbHMgYXJlIGhhbmRsZWQgYnkgaXRzZWxmXG4gICAgb3JpZ2luYWxSZWFkeS5jYWxsKHRoaXMpO1xuICB9O1xuXG4gIHZhciBvcmlnaW5hbEVycm9yID0gc3Vic2NyaXB0aW9uUHJvdG8uZXJyb3I7XG4gIHN1YnNjcmlwdGlvblByb3RvLmVycm9yID0gZnVuY3Rpb24oZXJyKSB7XG4gICAgaWYgKHR5cGVvZiBlcnIgPT09ICdzdHJpbmcnKSB7XG4gICAgICBlcnIgPSB7IG1lc3NhZ2U6IGVyciB9O1xuICAgIH1cblxuICAgIHZhciBrYWRpcmFJbmZvID0gS2FkaXJhLl9nZXRJbmZvKCk7XG5cbiAgICBpZiAoa2FkaXJhSW5mbyAmJiB0aGlzLl9zdWJzY3JpcHRpb25JZCAmJiB0aGlzLl9zdWJzY3JpcHRpb25JZCA9PSBrYWRpcmFJbmZvLnRyYWNlLmlkKSB7XG4gICAgICBLYWRpcmEudHJhY2VyLmVuZExhc3RFdmVudChrYWRpcmFJbmZvLnRyYWNlKTtcblxuICAgICAgdmFyIGVycm9yRm9yQXBtID0gXy5waWNrKGVyciwgJ21lc3NhZ2UnLCAnc3RhY2snKTtcbiAgICAgIEthZGlyYS50cmFjZXIuZXZlbnQoa2FkaXJhSW5mby50cmFjZSwgJ2Vycm9yJywge2Vycm9yOiBlcnJvckZvckFwbX0pO1xuICAgICAgdmFyIHRyYWNlID0gS2FkaXJhLnRyYWNlci5idWlsZFRyYWNlKGthZGlyYUluZm8udHJhY2UpO1xuXG4gICAgICBLYWRpcmEubW9kZWxzLnB1YnN1Yi5fdHJhY2tFcnJvcih0aGlzLl9zZXNzaW9uLCB0aGlzLCB0cmFjZSk7XG5cbiAgICAgIC8vIGVycm9yIHRyYWNraW5nIGNhbiBiZSBkaXNhYmxlZCBhbmQgaWYgdGhlcmUgaXMgYSB0cmFjZVxuICAgICAgLy8gdHJhY2Ugc2hvdWxkIGJlIGF2YWlsYWJsZSBhbGwgdGhlIHRpbWUsIGJ1dCBpdCB3b24ndFxuICAgICAgLy8gaWYgc29tZXRoaW5nIHdyb25nIGhhcHBlbmVkIG9uIHRoZSB0cmFjZSBidWlsZGluZ1xuICAgICAgaWYoS2FkaXJhLm9wdGlvbnMuZW5hYmxlRXJyb3JUcmFja2luZyAmJiB0cmFjZSkge1xuICAgICAgICBLYWRpcmEubW9kZWxzLmVycm9yLnRyYWNrRXJyb3IoZXJyLCB0cmFjZSk7XG4gICAgICB9XG4gICAgfVxuXG4gICAgLy8gd3JhcCBlcnJvciBzdGFjayBzbyBNZXRlb3IuX2RlYnVnIGNhbiBpZGVudGlmeSBhbmQgaWdub3JlIGl0XG4gICAgLy8gaXQgaXMgbm90IHdyYXBwZWQgd2hlbiBlcnJvciB0cmFja2luZyBpcyBkaXNhYmxlZCBzaW5jZSBpdFxuICAgIC8vIHdvdWxkIGJlIHNob3duIGFzIGFuIG9iamVjdCBpbiB0aGUgbG9nc1xuICAgIGlmIChLYWRpcmEub3B0aW9ucy5lbmFibGVFcnJvclRyYWNraW5nKSB7XG4gICAgICBlcnIuc3RhY2sgPSB7c3RhY2s6IGVyci5zdGFjaywgc291cmNlOiAnc3Vic2NyaXB0aW9uJywgW01ldGVvckRlYnVnSWdub3JlXTogdHJ1ZX07XG4gICAgfVxuICAgIG9yaWdpbmFsRXJyb3IuY2FsbCh0aGlzLCBlcnIpO1xuICB9O1xuXG4gIHZhciBvcmlnaW5hbERlYWN0aXZhdGUgPSBzdWJzY3JpcHRpb25Qcm90by5fZGVhY3RpdmF0ZTtcbiAgc3Vic2NyaXB0aW9uUHJvdG8uX2RlYWN0aXZhdGUgPSBmdW5jdGlvbigpIHtcbiAgICBLYWRpcmEuRXZlbnRCdXMuZW1pdCgncHVic3ViJywgJ3N1YkRlYWN0aXZhdGVkJywgdGhpcy5fc2Vzc2lvbiwgdGhpcyk7XG4gICAgS2FkaXJhLm1vZGVscy5wdWJzdWIuX3RyYWNrVW5zdWIodGhpcy5fc2Vzc2lvbiwgdGhpcyk7XG4gICAgb3JpZ2luYWxEZWFjdGl2YXRlLmNhbGwodGhpcyk7XG4gIH07XG5cbiAgLy9hZGRpbmcgdGhlIGN1cnJlblN1YiBlbnYgdmFyaWFibGVcbiAgWydhZGRlZCcsICdjaGFuZ2VkJywgJ3JlbW92ZWQnXS5mb3JFYWNoKGZ1bmN0aW9uKGZ1bmNOYW1lKSB7XG4gICAgdmFyIG9yaWdpbmFsRnVuYyA9IHN1YnNjcmlwdGlvblByb3RvW2Z1bmNOYW1lXTtcbiAgICBzdWJzY3JpcHRpb25Qcm90b1tmdW5jTmFtZV0gPSBmdW5jdGlvbihjb2xsZWN0aW9uTmFtZSwgaWQsIGZpZWxkcykge1xuICAgICAgdmFyIHNlbGYgPSB0aGlzO1xuXG4gICAgICAvLyB3ZSBuZWVkIHRvIHJ1biB0aGlzIGNvZGUgaW4gYSBmaWJlciBhbmQgdGhhdCdzIGhvdyB3ZSB0cmFja1xuICAgICAgLy8gc3Vic2NyaXB0aW9uIGluZm8uIE1heSBiZSB3ZSBjYW4gZmlndXJlIG91dCwgc29tZSBvdGhlciB3YXkgdG8gZG8gdGhpc1xuICAgICAgLy8gV2UgdXNlIHRoaXMgY3VycmVudGx5IHRvIGdldCB0aGUgcHVibGljYXRpb24gaW5mbyB3aGVuIHRyYWNraW5nIG1lc3NhZ2VcbiAgICAgIC8vIHNpemVzIGF0IHdyYXBfZGRwX3N0cmluZ2lmeS5qc1xuICAgICAgS2FkaXJhLmVudi5jdXJyZW50U3ViID0gc2VsZjtcbiAgICAgIHZhciByZXMgPSBvcmlnaW5hbEZ1bmMuY2FsbChzZWxmLCBjb2xsZWN0aW9uTmFtZSwgaWQsIGZpZWxkcyk7XG4gICAgICBLYWRpcmEuZW52LmN1cnJlbnRTdWIgPSBudWxsO1xuXG4gICAgICByZXR1cm4gcmVzO1xuICAgIH07XG4gIH0pO1xufTtcbiIsIndyYXBPcGxvZ09ic2VydmVEcml2ZXIgPSBmdW5jdGlvbihwcm90bykge1xuICAvLyBUcmFjayB0aGUgcG9sbGVkIGRvY3VtZW50cy4gVGhpcyBpcyByZWZsZWN0IHRvIHRoZSBSQU0gc2l6ZSBhbmRcbiAgLy8gZm9yIHRoZSBDUFUgdXNhZ2UgZGlyZWN0bHlcbiAgdmFyIG9yaWdpbmFsUHVibGlzaE5ld1Jlc3VsdHMgPSBwcm90by5fcHVibGlzaE5ld1Jlc3VsdHM7XG4gIHByb3RvLl9wdWJsaXNoTmV3UmVzdWx0cyA9IGZ1bmN0aW9uKG5ld1Jlc3VsdHMsIG5ld0J1ZmZlcikge1xuICAgIHZhciBjb2xsID0gdGhpcy5fY3Vyc29yRGVzY3JpcHRpb24uY29sbGVjdGlvbk5hbWU7XG4gICAgdmFyIHF1ZXJ5ID0gdGhpcy5fY3Vyc29yRGVzY3JpcHRpb24uc2VsZWN0b3I7XG4gICAgdmFyIG9wdHMgPSB0aGlzLl9jdXJzb3JEZXNjcmlwdGlvbi5vcHRpb25zO1xuICAgIHZhciBkb2NTaXplID0gS2FkaXJhLmRvY1N6Q2FjaGUuZ2V0U2l6ZShjb2xsLCBxdWVyeSwgb3B0cywgbmV3UmVzdWx0cyk7XG4gICAgdmFyIGRvY1NpemUgPSBLYWRpcmEuZG9jU3pDYWNoZS5nZXRTaXplKGNvbGwsIHF1ZXJ5LCBvcHRzLCBuZXdCdWZmZXIpO1xuICAgIHZhciBjb3VudCA9IG5ld1Jlc3VsdHMuc2l6ZSgpICsgbmV3QnVmZmVyLnNpemUoKTtcbiAgICBpZih0aGlzLl9vd25lckluZm8pIHtcbiAgICAgIEthZGlyYS5tb2RlbHMucHVic3ViLnRyYWNrUG9sbGVkRG9jdW1lbnRzKHRoaXMuX293bmVySW5mbywgY291bnQpO1xuICAgICAgS2FkaXJhLm1vZGVscy5wdWJzdWIudHJhY2tEb2NTaXplKHRoaXMuX293bmVySW5mby5uYW1lLCBcInBvbGxlZEZldGNoZXNcIiwgZG9jU2l6ZSpjb3VudCk7XG4gICAgfSBlbHNlIHtcbiAgICAgIHRoaXMuX3BvbGxlZERvY3VtZW50cyA9IGNvdW50O1xuICAgICAgdGhpcy5fZG9jU2l6ZSA9IHtcbiAgICAgICAgcG9sbGVkRmV0Y2hlczogZG9jU2l6ZSpjb3VudFxuICAgICAgfVxuICAgIH1cbiAgICByZXR1cm4gb3JpZ2luYWxQdWJsaXNoTmV3UmVzdWx0cy5jYWxsKHRoaXMsIG5ld1Jlc3VsdHMsIG5ld0J1ZmZlcik7XG4gIH07XG5cbiAgdmFyIG9yaWdpbmFsSGFuZGxlT3Bsb2dFbnRyeVF1ZXJ5aW5nID0gcHJvdG8uX2hhbmRsZU9wbG9nRW50cnlRdWVyeWluZztcbiAgcHJvdG8uX2hhbmRsZU9wbG9nRW50cnlRdWVyeWluZyA9IGZ1bmN0aW9uKG9wKSB7XG4gICAgS2FkaXJhLm1vZGVscy5wdWJzdWIudHJhY2tEb2N1bWVudENoYW5nZXModGhpcy5fb3duZXJJbmZvLCBvcCk7XG4gICAgcmV0dXJuIG9yaWdpbmFsSGFuZGxlT3Bsb2dFbnRyeVF1ZXJ5aW5nLmNhbGwodGhpcywgb3ApO1xuICB9O1xuXG4gIHZhciBvcmlnaW5hbEhhbmRsZU9wbG9nRW50cnlTdGVhZHlPckZldGNoaW5nID0gcHJvdG8uX2hhbmRsZU9wbG9nRW50cnlTdGVhZHlPckZldGNoaW5nO1xuICBwcm90by5faGFuZGxlT3Bsb2dFbnRyeVN0ZWFkeU9yRmV0Y2hpbmcgPSBmdW5jdGlvbihvcCkge1xuICAgIEthZGlyYS5tb2RlbHMucHVic3ViLnRyYWNrRG9jdW1lbnRDaGFuZ2VzKHRoaXMuX293bmVySW5mbywgb3ApO1xuICAgIHJldHVybiBvcmlnaW5hbEhhbmRsZU9wbG9nRW50cnlTdGVhZHlPckZldGNoaW5nLmNhbGwodGhpcywgb3ApO1xuICB9O1xuXG4gIC8vIHRyYWNrIGxpdmUgdXBkYXRlc1xuICBbJ19hZGRQdWJsaXNoZWQnLCAnX3JlbW92ZVB1Ymxpc2hlZCcsICdfY2hhbmdlUHVibGlzaGVkJ10uZm9yRWFjaChmdW5jdGlvbihmbk5hbWUpIHtcbiAgICB2YXIgb3JpZ2luYWxGbiA9IHByb3RvW2ZuTmFtZV07XG4gICAgcHJvdG9bZm5OYW1lXSA9IGZ1bmN0aW9uKGEsIGIsIGMpIHtcbiAgICAgIGlmKHRoaXMuX293bmVySW5mbykge1xuICAgICAgICBLYWRpcmEubW9kZWxzLnB1YnN1Yi50cmFja0xpdmVVcGRhdGVzKHRoaXMuX293bmVySW5mbywgZm5OYW1lLCAxKTtcblxuICAgICAgICBpZihmbk5hbWUgPT09IFwiX2FkZFB1Ymxpc2hlZFwiKSB7XG4gICAgICAgICAgdmFyIGNvbGwgPSB0aGlzLl9jdXJzb3JEZXNjcmlwdGlvbi5jb2xsZWN0aW9uTmFtZTtcbiAgICAgICAgICB2YXIgcXVlcnkgPSB0aGlzLl9jdXJzb3JEZXNjcmlwdGlvbi5zZWxlY3RvcjtcbiAgICAgICAgICB2YXIgb3B0cyA9IHRoaXMuX2N1cnNvckRlc2NyaXB0aW9uLm9wdGlvbnM7XG4gICAgICAgICAgdmFyIGRvY1NpemUgPSBLYWRpcmEuZG9jU3pDYWNoZS5nZXRTaXplKGNvbGwsIHF1ZXJ5LCBvcHRzLCBbYl0pO1xuXG4gICAgICAgICAgS2FkaXJhLm1vZGVscy5wdWJzdWIudHJhY2tEb2NTaXplKHRoaXMuX293bmVySW5mby5uYW1lLCBcImxpdmVGZXRjaGVzXCIsIGRvY1NpemUpO1xuICAgICAgICB9XG4gICAgICB9IGVsc2Uge1xuICAgICAgICAvLyBJZiB0aGVyZSBpcyBubyBvd25lckluZm8sIHRoYXQgbWVhbnMgdGhpcyBpcyB0aGUgaW5pdGlhbCBhZGRzXG4gICAgICAgIGlmKCF0aGlzLl9saXZlVXBkYXRlc0NvdW50cykge1xuICAgICAgICAgIHRoaXMuX2xpdmVVcGRhdGVzQ291bnRzID0ge1xuICAgICAgICAgICAgX2luaXRpYWxBZGRzOiAwXG4gICAgICAgICAgfTtcbiAgICAgICAgfVxuXG4gICAgICAgIHRoaXMuX2xpdmVVcGRhdGVzQ291bnRzLl9pbml0aWFsQWRkcysrO1xuXG4gICAgICAgIGlmKGZuTmFtZSA9PT0gXCJfYWRkUHVibGlzaGVkXCIpIHtcbiAgICAgICAgICBpZighdGhpcy5fZG9jU2l6ZSkge1xuICAgICAgICAgICAgdGhpcy5fZG9jU2l6ZSA9IHtcbiAgICAgICAgICAgICAgaW5pdGlhbEZldGNoZXM6IDBcbiAgICAgICAgICAgIH07XG4gICAgICAgICAgfVxuXG4gICAgICAgICAgaWYoIXRoaXMuX2RvY1NpemUuaW5pdGlhbEZldGNoZXMpIHtcbiAgICAgICAgICAgIHRoaXMuX2RvY1NpemUuaW5pdGlhbEZldGNoZXMgPSAwO1xuICAgICAgICAgIH1cblxuICAgICAgICAgIHZhciBjb2xsID0gdGhpcy5fY3Vyc29yRGVzY3JpcHRpb24uY29sbGVjdGlvbk5hbWU7XG4gICAgICAgICAgdmFyIHF1ZXJ5ID0gdGhpcy5fY3Vyc29yRGVzY3JpcHRpb24uc2VsZWN0b3I7XG4gICAgICAgICAgdmFyIG9wdHMgPSB0aGlzLl9jdXJzb3JEZXNjcmlwdGlvbi5vcHRpb25zO1xuICAgICAgICAgIHZhciBkb2NTaXplID0gS2FkaXJhLmRvY1N6Q2FjaGUuZ2V0U2l6ZShjb2xsLCBxdWVyeSwgb3B0cywgW2JdKTtcblxuICAgICAgICAgIHRoaXMuX2RvY1NpemUuaW5pdGlhbEZldGNoZXMgKz0gZG9jU2l6ZTtcbiAgICAgICAgfVxuICAgICAgfVxuXG4gICAgICByZXR1cm4gb3JpZ2luYWxGbi5jYWxsKHRoaXMsIGEsIGIsIGMpO1xuICAgIH07XG4gIH0pO1xuXG4gIHZhciBvcmlnaW5hbFN0b3AgPSBwcm90by5zdG9wO1xuICBwcm90by5zdG9wID0gZnVuY3Rpb24oKSB7XG4gICAgaWYodGhpcy5fb3duZXJJbmZvICYmIHRoaXMuX293bmVySW5mby50eXBlID09PSAnc3ViJykge1xuICAgICAgS2FkaXJhLkV2ZW50QnVzLmVtaXQoJ3B1YnN1YicsICdvYnNlcnZlckRlbGV0ZWQnLCB0aGlzLl9vd25lckluZm8pO1xuICAgICAgS2FkaXJhLm1vZGVscy5wdWJzdWIudHJhY2tEZWxldGVkT2JzZXJ2ZXIodGhpcy5fb3duZXJJbmZvKTtcbiAgICB9XG5cbiAgICByZXR1cm4gb3JpZ2luYWxTdG9wLmNhbGwodGhpcyk7XG4gIH07XG59O1xuXG53cmFwUG9sbGluZ09ic2VydmVEcml2ZXIgPSBmdW5jdGlvbihwcm90bykge1xuICB2YXIgb3JpZ2luYWxQb2xsTW9uZ28gPSBwcm90by5fcG9sbE1vbmdvO1xuICBwcm90by5fcG9sbE1vbmdvID0gZnVuY3Rpb24oKSB7XG4gICAgdmFyIHN0YXJ0ID0gRGF0ZS5ub3coKTtcbiAgICBvcmlnaW5hbFBvbGxNb25nby5jYWxsKHRoaXMpO1xuXG4gICAgLy8gQ3VycmVudCByZXN1bHQgaXMgc3RvcmVkIGluIHRoZSBmb2xsb3dpbmcgdmFyaWFibGUuXG4gICAgLy8gU28sIHdlIGNhbiB1c2UgdGhhdFxuICAgIC8vIFNvbWV0aW1lcywgaXQncyBwb3NzaWJsZSB0byBnZXQgc2l6ZSBhcyB1bmRlZmluZWQuXG4gICAgLy8gTWF5IGJlIHNvbWV0aGluZyB3aXRoIGRpZmZlcmVudCB2ZXJzaW9uLiBXZSBkb24ndCBuZWVkIHRvIHdvcnJ5IGFib3V0XG4gICAgLy8gdGhpcyBub3dcbiAgICB2YXIgY291bnQgPSAwO1xuICAgIHZhciBkb2NTaXplID0gMDtcblxuICAgIGlmKHRoaXMuX3Jlc3VsdHMgJiYgdGhpcy5fcmVzdWx0cy5zaXplKSB7XG4gICAgICBjb3VudCA9IHRoaXMuX3Jlc3VsdHMuc2l6ZSgpIHx8IDA7XG5cbiAgICAgIHZhciBjb2xsID0gdGhpcy5fY3Vyc29yRGVzY3JpcHRpb24uY29sbGVjdGlvbk5hbWU7XG4gICAgICB2YXIgcXVlcnkgPSB0aGlzLl9jdXJzb3JEZXNjcmlwdGlvbi5zZWxlY3RvcjtcbiAgICAgIHZhciBvcHRzID0gdGhpcy5fY3Vyc29yRGVzY3JpcHRpb24ub3B0aW9ucztcblxuICAgICAgZG9jU2l6ZSA9IEthZGlyYS5kb2NTekNhY2hlLmdldFNpemUoY29sbCwgcXVlcnksIG9wdHMsIHRoaXMuX3Jlc3VsdHMuX21hcCkqY291bnQ7XG4gICAgfVxuXG4gICAgaWYodGhpcy5fb3duZXJJbmZvKSB7XG4gICAgICBLYWRpcmEubW9kZWxzLnB1YnN1Yi50cmFja1BvbGxlZERvY3VtZW50cyh0aGlzLl9vd25lckluZm8sIGNvdW50KTtcbiAgICAgIEthZGlyYS5tb2RlbHMucHVic3ViLnRyYWNrRG9jU2l6ZSh0aGlzLl9vd25lckluZm8ubmFtZSwgXCJwb2xsZWRGZXRjaGVzXCIsIGRvY1NpemUpO1xuICAgIH0gZWxzZSB7XG4gICAgICB0aGlzLl9wb2xsZWREb2N1bWVudHMgPSBjb3VudDtcbiAgICAgIHRoaXMuX3BvbGxlZERvY1NpemUgPSBkb2NTaXplO1xuICAgIH1cbiAgfTtcblxuICB2YXIgb3JpZ2luYWxTdG9wID0gcHJvdG8uc3RvcDtcbiAgcHJvdG8uc3RvcCA9IGZ1bmN0aW9uKCkge1xuICAgIGlmKHRoaXMuX293bmVySW5mbyAmJiB0aGlzLl9vd25lckluZm8udHlwZSA9PT0gJ3N1YicpIHtcbiAgICAgIEthZGlyYS5FdmVudEJ1cy5lbWl0KCdwdWJzdWInLCAnb2JzZXJ2ZXJEZWxldGVkJywgdGhpcy5fb3duZXJJbmZvKTtcbiAgICAgIEthZGlyYS5tb2RlbHMucHVic3ViLnRyYWNrRGVsZXRlZE9ic2VydmVyKHRoaXMuX293bmVySW5mbyk7XG4gICAgfVxuXG4gICAgcmV0dXJuIG9yaWdpbmFsU3RvcC5jYWxsKHRoaXMpO1xuICB9O1xufTtcblxud3JhcE11bHRpcGxleGVyID0gZnVuY3Rpb24ocHJvdG8pIHtcbiAgdmFyIG9yaWdpbmFsSW5pdGFsQWRkID0gcHJvdG8uYWRkSGFuZGxlQW5kU2VuZEluaXRpYWxBZGRzO1xuICAgcHJvdG8uYWRkSGFuZGxlQW5kU2VuZEluaXRpYWxBZGRzID0gZnVuY3Rpb24oaGFuZGxlKSB7XG4gICAgaWYoIXRoaXMuX2ZpcnN0SW5pdGlhbEFkZFRpbWUpIHtcbiAgICAgIHRoaXMuX2ZpcnN0SW5pdGlhbEFkZFRpbWUgPSBEYXRlLm5vdygpO1xuICAgIH1cblxuICAgIGhhbmRsZS5fd2FzTXVsdGlwbGV4ZXJSZWFkeSA9IHRoaXMuX3JlYWR5KCk7XG4gICAgaGFuZGxlLl9xdWV1ZUxlbmd0aCA9IHRoaXMuX3F1ZXVlLl90YXNrSGFuZGxlcy5sZW5ndGg7XG5cbiAgICBpZighaGFuZGxlLl93YXNNdWx0aXBsZXhlclJlYWR5KSB7XG4gICAgICBoYW5kbGUuX2VsYXBzZWRQb2xsaW5nVGltZSA9IERhdGUubm93KCkgLSB0aGlzLl9maXJzdEluaXRpYWxBZGRUaW1lO1xuICAgIH1cbiAgICByZXR1cm4gb3JpZ2luYWxJbml0YWxBZGQuY2FsbCh0aGlzLCBoYW5kbGUpO1xuICB9O1xufTtcblxud3JhcEZvckNvdW50aW5nT2JzZXJ2ZXJzID0gZnVuY3Rpb24oKSB7XG4gIC8vIHRvIGNvdW50IG9ic2VydmVyc1xuICB2YXIgbW9uZ29Db25uZWN0aW9uUHJvdG8gPSBNZXRlb3JYLk1vbmdvQ29ubmVjdGlvbi5wcm90b3R5cGU7XG4gIHZhciBvcmlnaW5hbE9ic2VydmVDaGFuZ2VzID0gbW9uZ29Db25uZWN0aW9uUHJvdG8uX29ic2VydmVDaGFuZ2VzO1xuICBtb25nb0Nvbm5lY3Rpb25Qcm90by5fb2JzZXJ2ZUNoYW5nZXMgPSBmdW5jdGlvbihjdXJzb3JEZXNjcmlwdGlvbiwgb3JkZXJlZCwgY2FsbGJhY2tzKSB7XG4gICAgdmFyIHJldCA9IG9yaWdpbmFsT2JzZXJ2ZUNoYW5nZXMuY2FsbCh0aGlzLCBjdXJzb3JEZXNjcmlwdGlvbiwgb3JkZXJlZCwgY2FsbGJhY2tzKTtcbiAgICAvLyBnZXQgdGhlIEthZGlyYSBJbmZvIHZpYSB0aGUgTWV0ZW9yLkVudmlyb25tZW50YWxWYXJpYWJsZVxuICAgIHZhciBrYWRpcmFJbmZvID0gS2FkaXJhLl9nZXRJbmZvKG51bGwsIHRydWUpO1xuXG4gICAgaWYoa2FkaXJhSW5mbyAmJiByZXQuX211bHRpcGxleGVyKSB7XG4gICAgICBpZighcmV0Ll9tdWx0aXBsZXhlci5fX2thZGlyYVRyYWNrZWQpIHtcbiAgICAgICAgLy8gbmV3IG11bHRpcGxleGVyXG4gICAgICAgIHJldC5fbXVsdGlwbGV4ZXIuX19rYWRpcmFUcmFja2VkID0gdHJ1ZTtcbiAgICAgICAgS2FkaXJhLkV2ZW50QnVzLmVtaXQoJ3B1YnN1YicsICduZXdTdWJIYW5kbGVDcmVhdGVkJywga2FkaXJhSW5mby50cmFjZSk7XG4gICAgICAgIEthZGlyYS5tb2RlbHMucHVic3ViLmluY3JlbWVudEhhbmRsZUNvdW50KGthZGlyYUluZm8udHJhY2UsIGZhbHNlKTtcbiAgICAgICAgaWYoa2FkaXJhSW5mby50cmFjZS50eXBlID09ICdzdWInKSB7XG4gICAgICAgICAgdmFyIG93bmVySW5mbyA9IHtcbiAgICAgICAgICAgIHR5cGU6IGthZGlyYUluZm8udHJhY2UudHlwZSxcbiAgICAgICAgICAgIG5hbWU6IGthZGlyYUluZm8udHJhY2UubmFtZSxcbiAgICAgICAgICAgIHN0YXJ0VGltZTogKG5ldyBEYXRlKCkpLmdldFRpbWUoKVxuICAgICAgICAgIH07XG5cbiAgICAgICAgICB2YXIgb2JzZXJ2ZXJEcml2ZXIgPSByZXQuX211bHRpcGxleGVyLl9vYnNlcnZlRHJpdmVyO1xuICAgICAgICAgIG9ic2VydmVyRHJpdmVyLl9vd25lckluZm8gPSBvd25lckluZm87XG4gICAgICAgICAgS2FkaXJhLkV2ZW50QnVzLmVtaXQoJ3B1YnN1YicsICdvYnNlcnZlckNyZWF0ZWQnLCBvd25lckluZm8pO1xuICAgICAgICAgIEthZGlyYS5tb2RlbHMucHVic3ViLnRyYWNrQ3JlYXRlZE9ic2VydmVyKG93bmVySW5mbyk7XG5cbiAgICAgICAgICAvLyBXZSBuZWVkIHRvIHNlbmQgaW5pdGlhbGx5IHBvbGxlZCBkb2N1bWVudHMgaWYgdGhlcmUgYXJlXG4gICAgICAgICAgaWYob2JzZXJ2ZXJEcml2ZXIuX3BvbGxlZERvY3VtZW50cykge1xuICAgICAgICAgICAgS2FkaXJhLm1vZGVscy5wdWJzdWIudHJhY2tQb2xsZWREb2N1bWVudHMob3duZXJJbmZvLCBvYnNlcnZlckRyaXZlci5fcG9sbGVkRG9jdW1lbnRzKTtcbiAgICAgICAgICAgIG9ic2VydmVyRHJpdmVyLl9wb2xsZWREb2N1bWVudHMgPSAwO1xuICAgICAgICAgIH1cblxuICAgICAgICAgIC8vIFdlIG5lZWQgdG8gc2VuZCBpbml0aWFsbHkgcG9sbGVkIGRvY3VtZW50cyBpZiB0aGVyZSBhcmVcbiAgICAgICAgICBpZihvYnNlcnZlckRyaXZlci5fcG9sbGVkRG9jU2l6ZSkge1xuICAgICAgICAgICAgS2FkaXJhLm1vZGVscy5wdWJzdWIudHJhY2tEb2NTaXplKG93bmVySW5mby5uYW1lLCBcInBvbGxlZEZldGNoZXNcIiwgb2JzZXJ2ZXJEcml2ZXIuX3BvbGxlZERvY1NpemUpO1xuICAgICAgICAgICAgb2JzZXJ2ZXJEcml2ZXIuX3BvbGxlZERvY1NpemUgPSAwO1xuICAgICAgICAgIH1cblxuICAgICAgICAgIC8vIFByb2Nlc3MgX2xpdmVVcGRhdGVzQ291bnRzXG4gICAgICAgICAgXy5lYWNoKG9ic2VydmVyRHJpdmVyLl9saXZlVXBkYXRlc0NvdW50cywgZnVuY3Rpb24oY291bnQsIGtleSkge1xuICAgICAgICAgICAgS2FkaXJhLm1vZGVscy5wdWJzdWIudHJhY2tMaXZlVXBkYXRlcyhvd25lckluZm8sIGtleSwgY291bnQpO1xuICAgICAgICAgIH0pO1xuXG4gICAgICAgICAgLy8gUHJvY2VzcyBkb2NTaXplXG4gICAgICAgICAgXy5lYWNoKG9ic2VydmVyRHJpdmVyLl9kb2NTaXplLCBmdW5jdGlvbihjb3VudCwga2V5KSB7XG4gICAgICAgICAgICBLYWRpcmEubW9kZWxzLnB1YnN1Yi50cmFja0RvY1NpemUob3duZXJJbmZvLm5hbWUsIGtleSwgY291bnQpO1xuICAgICAgICAgIH0pO1xuICAgICAgICB9XG4gICAgICB9IGVsc2Uge1xuICAgICAgICBLYWRpcmEuRXZlbnRCdXMuZW1pdCgncHVic3ViJywgJ2NhY2hlZFN1YkhhbmRsZUNyZWF0ZWQnLCBrYWRpcmFJbmZvLnRyYWNlKTtcbiAgICAgICAgS2FkaXJhLm1vZGVscy5wdWJzdWIuaW5jcmVtZW50SGFuZGxlQ291bnQoa2FkaXJhSW5mby50cmFjZSwgdHJ1ZSk7XG4gICAgICB9XG4gICAgfVxuXG4gICAgcmV0dXJuIHJldDtcbiAgfVxufTsiLCJ3cmFwU3RyaW5naWZ5RERQID0gZnVuY3Rpb24oKSB7XG4gIHZhciBvcmlnaW5hbFN0cmluZ2lmeUREUCA9IEREUENvbW1vbi5zdHJpbmdpZnlERFA7XG5cbiAgRERQQ29tbW9uLnN0cmluZ2lmeUREUCA9IGZ1bmN0aW9uKG1zZykge1xuICAgIHZhciBtc2dTdHJpbmcgPSBvcmlnaW5hbFN0cmluZ2lmeUREUChtc2cpO1xuICAgIHZhciBtc2dTaXplID0gQnVmZmVyLmJ5dGVMZW5ndGgobXNnU3RyaW5nLCAndXRmOCcpO1xuXG4gICAgdmFyIGthZGlyYUluZm8gPSBLYWRpcmEuX2dldEluZm8obnVsbCwgdHJ1ZSk7XG5cbiAgICBpZihrYWRpcmFJbmZvICYmICFLYWRpcmEuZW52LmN1cnJlbnRTdWIpIHtcbiAgICAgIGlmKGthZGlyYUluZm8udHJhY2UudHlwZSA9PT0gJ21ldGhvZCcpIHtcbiAgICAgICAgS2FkaXJhLm1vZGVscy5tZXRob2RzLnRyYWNrTXNnU2l6ZShrYWRpcmFJbmZvLnRyYWNlLm5hbWUsIG1zZ1NpemUpO1xuICAgICAgfVxuXG4gICAgICByZXR1cm4gbXNnU3RyaW5nO1xuICAgIH1cblxuICAgIC8vICdjdXJyZW50U3ViJyBpcyBzZXQgd2hlbiB3ZSB3cmFwIFN1YnNjcmlwdGlvbiBvYmplY3QgYW5kIG92ZXJyaWRlXG4gICAgLy8gaGFuZGxlcnMgZm9yICdhZGRlZCcsICdjaGFuZ2VkJywgJ3JlbW92ZWQnIGV2ZW50cy4gKHNlZSBsaWIvaGlqYWNrL3dyYXBfc3Vic2NyaXB0aW9uLmpzKVxuICAgIGlmKEthZGlyYS5lbnYuY3VycmVudFN1Yikge1xuICAgICAgaWYoS2FkaXJhLmVudi5jdXJyZW50U3ViLl9fa2FkaXJhSW5mbyl7XG4gICAgICAgIEthZGlyYS5tb2RlbHMucHVic3ViLnRyYWNrTXNnU2l6ZShLYWRpcmEuZW52LmN1cnJlbnRTdWIuX25hbWUsIFwiaW5pdGlhbFNlbnRcIiwgbXNnU2l6ZSk7XG4gICAgICAgIHJldHVybiBtc2dTdHJpbmc7XG4gICAgICB9XG4gICAgICBLYWRpcmEubW9kZWxzLnB1YnN1Yi50cmFja01zZ1NpemUoS2FkaXJhLmVudi5jdXJyZW50U3ViLl9uYW1lLCBcImxpdmVTZW50XCIsIG1zZ1NpemUpO1xuICAgICAgcmV0dXJuIG1zZ1N0cmluZztcbiAgICB9XG5cbiAgICBLYWRpcmEubW9kZWxzLm1ldGhvZHMudHJhY2tNc2dTaXplKFwiPG5vdC1hLW1ldGhvZC1vci1hLXB1Yj5cIiwgbXNnU2l6ZSk7XG4gICAgcmV0dXJuIG1zZ1N0cmluZztcbiAgfVxufVxuIiwiaW1wb3J0IHsgd3JhcFdlYkFwcCB9IGZyb20gXCIuL3dyYXBfd2ViYXBwXCI7XG5pbXBvcnQgeyB3cmFwRmFzdFJlbmRlciB9IGZyb20gXCIuL2Zhc3RfcmVuZGVyXCI7XG5pbXBvcnQgeyB3cmFwRnMgfSBmcm9tIFwiLi9mc1wiO1xuaW1wb3J0IHsgd3JhcFBpY2tlciB9IGZyb20gXCIuL3BpY2tlclwiO1xuaW1wb3J0IHsgd3JhcFJvdXRlcnMgfSBmcm9tICcuL3dyYXBfcm91dGVycyc7XG5cbnZhciBsb2dnZXIgPSBOcG0ucmVxdWlyZSgnZGVidWcnKSgna2FkaXJhOmhpamFjazppbnN0cnVtZW50Jyk7XG5cbnZhciBpbnN0cnVtZW50ZWQgPSBmYWxzZTtcbkthZGlyYS5fc3RhcnRJbnN0cnVtZW50aW5nID0gZnVuY3Rpb24oY2FsbGJhY2spIHtcbiAgaWYoaW5zdHJ1bWVudGVkKSB7XG4gICAgY2FsbGJhY2soKTtcbiAgICByZXR1cm47XG4gIH1cblxuICBpbnN0cnVtZW50ZWQgPSB0cnVlO1xuICB3cmFwU3RyaW5naWZ5RERQKCk7XG4gIHdyYXBXZWJBcHAoKTtcbiAgd3JhcEZhc3RSZW5kZXIoKTtcbiAgd3JhcFBpY2tlcigpO1xuICB3cmFwRnMoKTtcbiAgd3JhcFJvdXRlcnMoKTtcblxuICBNZXRlb3JYLm9uUmVhZHkoZnVuY3Rpb24oKSB7XG4gICAgLy9pbnN0cnVtZW50aW5nIHNlc3Npb25cbiAgICB3cmFwU2VydmVyKE1ldGVvclguU2VydmVyLnByb3RvdHlwZSk7XG4gICAgd3JhcFNlc3Npb24oTWV0ZW9yWC5TZXNzaW9uLnByb3RvdHlwZSk7XG4gICAgd3JhcFN1YnNjcmlwdGlvbihNZXRlb3JYLlN1YnNjcmlwdGlvbi5wcm90b3R5cGUpO1xuXG4gICAgaWYoTWV0ZW9yWC5Nb25nb09wbG9nRHJpdmVyKSB7XG4gICAgICB3cmFwT3Bsb2dPYnNlcnZlRHJpdmVyKE1ldGVvclguTW9uZ29PcGxvZ0RyaXZlci5wcm90b3R5cGUpO1xuICAgIH1cblxuICAgIGlmKE1ldGVvclguTW9uZ29Qb2xsaW5nRHJpdmVyKSB7XG4gICAgICB3cmFwUG9sbGluZ09ic2VydmVEcml2ZXIoTWV0ZW9yWC5Nb25nb1BvbGxpbmdEcml2ZXIucHJvdG90eXBlKTtcbiAgICB9XG5cbiAgICBpZihNZXRlb3JYLk11bHRpcGxleGVyKSB7XG4gICAgICB3cmFwTXVsdGlwbGV4ZXIoTWV0ZW9yWC5NdWx0aXBsZXhlci5wcm90b3R5cGUpO1xuICAgIH1cblxuICAgIHdyYXBGb3JDb3VudGluZ09ic2VydmVycygpO1xuICAgIGhpamFja0RCT3BzKCk7XG5cbiAgICBzZXRMYWJlbHMoKTtcbiAgICBjYWxsYmFjaygpO1xuICB9KTtcbn07XG5cbi8vIFdlIG5lZWQgdG8gaW5zdHJ1bWVudCB0aGlzIHJpZ2h0YXdheSBhbmQgaXQncyBva2F5XG4vLyBPbmUgcmVhc29uIGZvciB0aGlzIGlzIHRvIGNhbGwgYHNldExhYmxlcygpYCBmdW5jdGlvblxuLy8gT3RoZXJ3aXNlLCBDUFUgcHJvZmlsZSBjYW4ndCBzZWUgYWxsIG91ciBjdXN0b20gbGFiZWxpbmdcbkthZGlyYS5fc3RhcnRJbnN0cnVtZW50aW5nKGZ1bmN0aW9uKCkge1xuICBjb25zb2xlLmxvZygnTW9udGkgQVBNOiBjb21wbGV0ZWQgaW5zdHJ1bWVudGluZyB0aGUgYXBwJylcbn0pO1xuIiwiLy8gVGhpcyBoaWphY2sgaXMgaW1wb3J0YW50IHRvIG1ha2Ugc3VyZSwgY29sbGVjdGlvbnMgY3JlYXRlZCBiZWZvcmVcbi8vIHdlIGhpamFjayBkYk9wcywgZXZlbiBnZXRzIHRyYWNrZWQuXG4vLyAgTWV0ZW9yIGRvZXMgbm90IHNpbXBseSBleHBvc2UgTW9uZ29Db25uZWN0aW9uIG9iamVjdCB0byB0aGUgY2xpZW50XG4vLyAgSXQgcGlja3MgbWV0aG9kcyB3aGljaCBhcmUgbmVjZXNzb3J5IGFuZCBtYWtlIGEgYmluZGVkIG9iamVjdCBhbmRcbi8vICBhc3NpZ25lZCB0byB0aGUgTW9uZ28uQ29sbGVjdGlvblxuLy8gIHNvLCBldmVuIHdlIHVwZGF0ZWQgcHJvdG90eXBlLCB3ZSBjYW4ndCB0cmFjayB0aG9zZSBjb2xsZWN0aW9uc1xuLy8gIGJ1dCwgdGhpcyB3aWxsIGZpeCBpdC5cbnZhciBvcmlnaW5hbE9wZW4gPSBNb25nb0ludGVybmFscy5SZW1vdGVDb2xsZWN0aW9uRHJpdmVyLnByb3RvdHlwZS5vcGVuO1xuTW9uZ29JbnRlcm5hbHMuUmVtb3RlQ29sbGVjdGlvbkRyaXZlci5wcm90b3R5cGUub3BlbiA9IGZ1bmN0aW9uIG9wZW4obmFtZSkge1xuICB2YXIgc2VsZiA9IHRoaXM7XG4gIHZhciByZXQgPSBvcmlnaW5hbE9wZW4uY2FsbChzZWxmLCBuYW1lKTtcblxuICBfLmVhY2gocmV0LCBmdW5jdGlvbihmbiwgbSkge1xuICAgIC8vIG1ha2Ugc3VyZSwgaXQncyBpbiB0aGUgYWN0dWFsIG1vbmdvIGNvbm5lY3Rpb24gb2JqZWN0XG4gICAgLy8gbWV0ZW9yaGFja3M6bW9uZ28tY29sbGVjdGlvbi11dGlscyBwYWNrYWdlIGFkZCBzb21lIGFyYml0YXJ5IG1ldGhvZHNcbiAgICAvLyB3aGljaCBkb2VzIG5vdCBleGlzdCBpbiB0aGUgbW9uZ28gY29ubmVjdGlvblxuICAgIGlmKHNlbGYubW9uZ29bbV0pIHtcbiAgICAgIHJldFttXSA9IGZ1bmN0aW9uKCkge1xuICAgICAgICBBcnJheS5wcm90b3R5cGUudW5zaGlmdC5jYWxsKGFyZ3VtZW50cywgbmFtZSk7XG4gICAgICAgIHJldHVybiBPcHRpbWl6ZWRBcHBseShzZWxmLm1vbmdvLCBzZWxmLm1vbmdvW21dLCBhcmd1bWVudHMpO1xuICAgICAgfTtcbiAgICB9XG4gIH0pO1xuXG4gIHJldHVybiByZXQ7XG59O1xuXG4vLyBUT0RPOiB0aGlzIHNob3VsZCBiZSBhZGRlZCB0byBNZXRlb3J4XG5mdW5jdGlvbiBnZXRTeW5jcm9ub3VzQ3Vyc29yKCkge1xuICBjb25zdCBNb25nb0NvbGwgPSB0eXBlb2YgTW9uZ28gIT09IFwidW5kZWZpbmVkXCIgPyBNb25nby5Db2xsZWN0aW9uIDogTWV0ZW9yLkNvbGxlY3Rpb247XG4gIGNvbnN0IGNvbGwgPSBuZXcgTW9uZ29Db2xsKFwiX19kdW1teV9jb2xsX1wiICsgUmFuZG9tLmlkKCkpO1xuICAvLyB3ZSBuZWVkIHRvIHdhaXQgdW50aWwgdGhlIGRiIGlzIGNvbm5lY3RlZCB3aXRoIG1ldGVvci4gZmluZE9uZSBkb2VzIHRoYXRcbiAgY29sbC5maW5kT25lKCk7XG4gIFxuICBjb25zdCBjdXJzb3IgPSBjb2xsLmZpbmQoKTtcbiAgY3Vyc29yLmZldGNoKCk7XG4gIHJldHVybiBjdXJzb3IuX3N5bmNocm9ub3VzQ3Vyc29yLmNvbnN0cnVjdG9yXG59XG5cbmhpamFja0RCT3BzID0gZnVuY3Rpb24gaGlqYWNrREJPcHMoKSB7XG4gIHZhciBtb25nb0Nvbm5lY3Rpb25Qcm90byA9IE1ldGVvclguTW9uZ29Db25uZWN0aW9uLnByb3RvdHlwZTtcbiAgLy9maW5kT25lIGlzIGhhbmRsZWQgYnkgZmluZCAtIHNvIG5vIG5lZWQgdG8gdHJhY2sgaXRcbiAgLy91cHNlcnQgaXMgaGFuZGxlcyBieSB1cGRhdGVcbiAgWydmaW5kJywgJ3VwZGF0ZScsICdyZW1vdmUnLCAnaW5zZXJ0JywgJ19lbnN1cmVJbmRleCcsICdfZHJvcEluZGV4J10uZm9yRWFjaChmdW5jdGlvbihmdW5jKSB7XG4gICAgdmFyIG9yaWdpbmFsRnVuYyA9IG1vbmdvQ29ubmVjdGlvblByb3RvW2Z1bmNdO1xuICAgIG1vbmdvQ29ubmVjdGlvblByb3RvW2Z1bmNdID0gZnVuY3Rpb24oY29sbE5hbWUsIHNlbGVjdG9yLCBtb2QsIG9wdGlvbnMpIHtcbiAgICAgIHZhciBwYXlsb2FkID0ge1xuICAgICAgICBjb2xsOiBjb2xsTmFtZSxcbiAgICAgICAgZnVuYzogZnVuYyxcbiAgICAgIH07XG5cbiAgICAgIGlmKGZ1bmMgPT0gJ2luc2VydCcpIHtcbiAgICAgICAgLy9hZGQgbm90aGluZyBtb3JlIHRvIHRoZSBwYXlsb2FkXG4gICAgICB9IGVsc2UgaWYoZnVuYyA9PSAnX2Vuc3VyZUluZGV4JyB8fCBmdW5jID09ICdfZHJvcEluZGV4Jykge1xuICAgICAgICAvL2FkZCBpbmRleFxuICAgICAgICBwYXlsb2FkLmluZGV4ID0gSlNPTi5zdHJpbmdpZnkoc2VsZWN0b3IpO1xuICAgICAgfSBlbHNlIGlmKGZ1bmMgPT0gJ3VwZGF0ZScgJiYgb3B0aW9ucyAmJiBvcHRpb25zLnVwc2VydCkge1xuICAgICAgICBwYXlsb2FkLmZ1bmMgPSAndXBzZXJ0JztcbiAgICAgICAgcGF5bG9hZC5zZWxlY3RvciA9IEpTT04uc3RyaW5naWZ5KHNlbGVjdG9yKTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIC8vYWxsIHRoZSBvdGhlciBmdW5jdGlvbnMgaGF2ZSBzZWxlY3RvcnNcbiAgICAgICAgcGF5bG9hZC5zZWxlY3RvciA9IEpTT04uc3RyaW5naWZ5KHNlbGVjdG9yKTtcbiAgICAgIH1cblxuICAgICAgdmFyIGthZGlyYUluZm8gPSBLYWRpcmEuX2dldEluZm8oKTtcbiAgICAgIGlmKGthZGlyYUluZm8pIHtcbiAgICAgICAgdmFyIGV2ZW50SWQgPSBLYWRpcmEudHJhY2VyLmV2ZW50KGthZGlyYUluZm8udHJhY2UsICdkYicsIHBheWxvYWQpO1xuICAgICAgfVxuXG4gICAgICAvL3RoaXMgY2F1c2UgVjggdG8gYXZvaWQgYW55IHBlcmZvcm1hbmNlIG9wdGltaXphdGlvbnMsIGJ1dCB0aGlzIGlzIG11c3QgdG8gdXNlXG4gICAgICAvL290aGVyd2lzZSwgaWYgdGhlIGVycm9yIGFkZHMgdHJ5IGNhdGNoIGJsb2NrIG91ciBsb2dzIGdldCBtZXNzeSBhbmQgZGlkbid0IHdvcmtcbiAgICAgIC8vc2VlOiBpc3N1ZSAjNlxuICAgICAgdHJ5e1xuICAgICAgICB2YXIgcmV0ID0gb3JpZ2luYWxGdW5jLmFwcGx5KHRoaXMsIGFyZ3VtZW50cyk7XG4gICAgICAgIC8vaGFuZGxpbmcgZnVuY3Rpb25zIHdoaWNoIGNhbiBiZSB0cmlnZ2VyZWQgd2l0aCBhbiBhc3luY0NhbGxiYWNrXG4gICAgICAgIHZhciBlbmRPcHRpb25zID0ge307XG5cbiAgICAgICAgaWYoSGF2ZUFzeW5jQ2FsbGJhY2soYXJndW1lbnRzKSkge1xuICAgICAgICAgIGVuZE9wdGlvbnMuYXN5bmMgPSB0cnVlO1xuICAgICAgICB9XG5cbiAgICAgICAgaWYoZnVuYyA9PSAndXBkYXRlJykge1xuICAgICAgICAgIC8vIHVwc2VydCBvbmx5IHJldHVybnMgYW4gb2JqZWN0IHdoZW4gY2FsbGVkIGB1cHNlcnRgIGRpcmVjdGx5XG4gICAgICAgICAgLy8gb3RoZXJ3aXNlIGl0IG9ubHkgYWN0IGFuIHVwZGF0ZSBjb21tYW5kXG4gICAgICAgICAgaWYob3B0aW9ucyAmJiBvcHRpb25zLnVwc2VydCAmJiB0eXBlb2YgcmV0ID09ICdvYmplY3QnKSB7XG4gICAgICAgICAgICBlbmRPcHRpb25zLnVwZGF0ZWREb2NzID0gcmV0Lm51bWJlckFmZmVjdGVkO1xuICAgICAgICAgICAgZW5kT3B0aW9ucy5pbnNlcnRlZElkID0gcmV0Lmluc2VydGVkSWQ7XG4gICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIGVuZE9wdGlvbnMudXBkYXRlZERvY3MgPSByZXQ7XG4gICAgICAgICAgfVxuICAgICAgICB9IGVsc2UgaWYoZnVuYyA9PSAncmVtb3ZlJykge1xuICAgICAgICAgIGVuZE9wdGlvbnMucmVtb3ZlZERvY3MgPSByZXQ7XG4gICAgICAgIH1cblxuICAgICAgICBpZihldmVudElkKSB7XG4gICAgICAgICAgS2FkaXJhLnRyYWNlci5ldmVudEVuZChrYWRpcmFJbmZvLnRyYWNlLCBldmVudElkLCBlbmRPcHRpb25zKTtcbiAgICAgICAgfVxuICAgICAgfSBjYXRjaChleCkge1xuICAgICAgICBpZihldmVudElkKSB7XG4gICAgICAgICAgS2FkaXJhLnRyYWNlci5ldmVudEVuZChrYWRpcmFJbmZvLnRyYWNlLCBldmVudElkLCB7ZXJyOiBleC5tZXNzYWdlfSk7XG4gICAgICAgIH1cbiAgICAgICAgdGhyb3cgZXg7XG4gICAgICB9XG5cbiAgICAgIHJldHVybiByZXQ7XG4gICAgfTtcbiAgfSk7XG5cbiAgdmFyIGN1cnNvclByb3RvID0gTWV0ZW9yWC5Nb25nb0N1cnNvci5wcm90b3R5cGU7XG4gIFsnZm9yRWFjaCcsICdtYXAnLCAnZmV0Y2gnLCAnY291bnQnLCAnb2JzZXJ2ZUNoYW5nZXMnLCAnb2JzZXJ2ZSddLmZvckVhY2goZnVuY3Rpb24odHlwZSkge1xuICAgIHZhciBvcmlnaW5hbEZ1bmMgPSBjdXJzb3JQcm90b1t0eXBlXTtcbiAgICBjdXJzb3JQcm90b1t0eXBlXSA9IGZ1bmN0aW9uKCkge1xuICAgICAgdmFyIGN1cnNvckRlc2NyaXB0aW9uID0gdGhpcy5fY3Vyc29yRGVzY3JpcHRpb247XG4gICAgICB2YXIgcGF5bG9hZCA9IE9iamVjdC5hc3NpZ24oT2JqZWN0LmNyZWF0ZShudWxsKSwge1xuICAgICAgICBjb2xsOiBjdXJzb3JEZXNjcmlwdGlvbi5jb2xsZWN0aW9uTmFtZSxcbiAgICAgICAgc2VsZWN0b3I6IEpTT04uc3RyaW5naWZ5KGN1cnNvckRlc2NyaXB0aW9uLnNlbGVjdG9yKSxcbiAgICAgICAgZnVuYzogdHlwZSxcbiAgICAgICAgY3Vyc29yOiB0cnVlXG4gICAgICB9KTtcblxuICAgICAgaWYoY3Vyc29yRGVzY3JpcHRpb24ub3B0aW9ucykge1xuICAgICAgICB2YXIgY3Vyc29yT3B0aW9ucyA9IF8ucGljayhjdXJzb3JEZXNjcmlwdGlvbi5vcHRpb25zLCBbJ2ZpZWxkcycsICdzb3J0JywgJ2xpbWl0J10pO1xuICAgICAgICBmb3IodmFyIGZpZWxkIGluIGN1cnNvck9wdGlvbnMpIHtcbiAgICAgICAgICB2YXIgdmFsdWUgPSBjdXJzb3JPcHRpb25zW2ZpZWxkXVxuICAgICAgICAgIGlmKHR5cGVvZiB2YWx1ZSA9PSAnb2JqZWN0Jykge1xuICAgICAgICAgICAgdmFsdWUgPSBKU09OLnN0cmluZ2lmeSh2YWx1ZSk7XG4gICAgICAgICAgfVxuICAgICAgICAgIHBheWxvYWRbZmllbGRdID0gdmFsdWU7XG4gICAgICAgIH1cbiAgICAgIH1cblxuICAgICAgdmFyIGthZGlyYUluZm8gPSBLYWRpcmEuX2dldEluZm8oKTtcbiAgICAgIHZhciBwcmV2aW91c1RyYWNrTmV4dE9iamVjdDtcbiAgICAgIGlmKGthZGlyYUluZm8pIHtcbiAgICAgICAgdmFyIGV2ZW50SWQgPSBLYWRpcmEudHJhY2VyLmV2ZW50KGthZGlyYUluZm8udHJhY2UsICdkYicsIHBheWxvYWQpO1xuXG4gICAgICAgIHByZXZpb3VzVHJhY2tOZXh0T2JqZWN0ID0ga2FkaXJhSW5mby50cmFja05leHRPYmplY3RcbiAgICAgICAgaWYgKHR5cGUgPT09ICdmb3JFYWNoJyB8fCB0eXBlID09PSAnbWFwJykge1xuICAgICAgICAgIGthZGlyYUluZm8udHJhY2tOZXh0T2JqZWN0ID0gdHJ1ZTtcbiAgICAgICAgfVxuICAgICAgfVxuXG4gICAgICB0cnl7XG4gICAgICAgIHZhciByZXQgPSBvcmlnaW5hbEZ1bmMuYXBwbHkodGhpcywgYXJndW1lbnRzKTtcblxuICAgICAgICB2YXIgZW5kRGF0YSA9IHt9O1xuICAgICAgICBpZih0eXBlID09ICdvYnNlcnZlQ2hhbmdlcycgfHwgdHlwZSA9PSAnb2JzZXJ2ZScpIHtcbiAgICAgICAgICB2YXIgb2JzZXJ2ZXJEcml2ZXI7XG4gICAgICAgICAgZW5kRGF0YS5vcGxvZyA9IGZhbHNlO1xuICAgICAgICAgIC8vIGdldCBkYXRhIHdyaXR0ZW4gYnkgdGhlIG11bHRpcGxleGVyXG4gICAgICAgICAgZW5kRGF0YS53YXNNdWx0aXBsZXhlclJlYWR5ID0gcmV0Ll93YXNNdWx0aXBsZXhlclJlYWR5O1xuICAgICAgICAgIGVuZERhdGEucXVldWVMZW5ndGggPSByZXQuX3F1ZXVlTGVuZ3RoO1xuICAgICAgICAgIGVuZERhdGEuZWxhcHNlZFBvbGxpbmdUaW1lID0gcmV0Ll9lbGFwc2VkUG9sbGluZ1RpbWU7XG5cbiAgICAgICAgICBpZihyZXQuX211bHRpcGxleGVyKSB7XG4gICAgICAgICAgICAvLyBvbGRlciBtZXRlb3IgdmVyc2lvbnMgZG9uZSBub3QgaGF2ZSBhbiBfbXVsdGlwbGV4ZXIgdmFsdWVcbiAgICAgICAgICAgIG9ic2VydmVyRHJpdmVyID0gcmV0Ll9tdWx0aXBsZXhlci5fb2JzZXJ2ZURyaXZlcjtcbiAgICAgICAgICAgIGlmKG9ic2VydmVyRHJpdmVyKSB7XG4gICAgICAgICAgICAgIG9ic2VydmVyRHJpdmVyID0gcmV0Ll9tdWx0aXBsZXhlci5fb2JzZXJ2ZURyaXZlcjtcbiAgICAgICAgICAgICAgdmFyIG9ic2VydmVyRHJpdmVyQ2xhc3MgPSBvYnNlcnZlckRyaXZlci5jb25zdHJ1Y3RvcjtcbiAgICAgICAgICAgICAgdmFyIHVzZXNPcGxvZyA9IHR5cGVvZiBvYnNlcnZlckRyaXZlckNsYXNzLmN1cnNvclN1cHBvcnRlZCA9PSAnZnVuY3Rpb24nO1xuICAgICAgICAgICAgICBlbmREYXRhLm9wbG9nID0gdXNlc09wbG9nO1xuICAgICAgICAgICAgICB2YXIgc2l6ZSA9IDA7XG4gICAgICAgICAgICAgIHJldC5fbXVsdGlwbGV4ZXIuX2NhY2hlLmRvY3MuZm9yRWFjaChmdW5jdGlvbigpIHtzaXplKyt9KTtcbiAgICAgICAgICAgICAgZW5kRGF0YS5ub09mQ2FjaGVkRG9jcyA9IHNpemU7XG5cbiAgICAgICAgICAgICAgLy8gaWYgbXVsdGlwbGV4ZXJXYXNOb3RSZWFkeSwgd2UgbmVlZCB0byBnZXQgdGhlIHRpbWUgc3BlbmQgZm9yIHRoZSBwb2xsaW5nXG4gICAgICAgICAgICAgIGlmKCFyZXQuX3dhc011bHRpcGxleGVyUmVhZHkpIHtcbiAgICAgICAgICAgICAgICBlbmREYXRhLmluaXRpYWxQb2xsaW5nVGltZSA9IG9ic2VydmVyRHJpdmVyLl9sYXN0UG9sbFRpbWU7XG4gICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgICB9XG5cbiAgICAgICAgICBpZighZW5kRGF0YS5vcGxvZykge1xuICAgICAgICAgICAgLy8gbGV0J3MgdHJ5IHRvIGZpbmQgdGhlIHJlYXNvblxuICAgICAgICAgICAgdmFyIHJlYXNvbkluZm8gPSBLYWRpcmEuY2hlY2tXaHlOb09wbG9nKGN1cnNvckRlc2NyaXB0aW9uLCBvYnNlcnZlckRyaXZlcik7XG4gICAgICAgICAgICBlbmREYXRhLm5vT3Bsb2dDb2RlID0gcmVhc29uSW5mby5jb2RlO1xuICAgICAgICAgICAgZW5kRGF0YS5ub09wbG9nUmVhc29uID0gcmVhc29uSW5mby5yZWFzb247XG4gICAgICAgICAgICBlbmREYXRhLm5vT3Bsb2dTb2x1dGlvbiA9IHJlYXNvbkluZm8uc29sdXRpb247XG4gICAgICAgICAgfVxuICAgICAgICB9IGVsc2UgaWYodHlwZSA9PSAnZmV0Y2gnIHx8IHR5cGUgPT0gJ21hcCcpe1xuICAgICAgICAgIC8vZm9yIG90aGVyIGN1cnNvciBvcGVyYXRpb25cblxuICAgICAgICAgIGVuZERhdGEuZG9jc0ZldGNoZWQgPSByZXQubGVuZ3RoO1xuXG4gICAgICAgICAgaWYodHlwZSA9PSAnZmV0Y2gnKSB7XG4gICAgICAgICAgICB2YXIgY29sbCA9IGN1cnNvckRlc2NyaXB0aW9uLmNvbGxlY3Rpb25OYW1lO1xuICAgICAgICAgICAgdmFyIHF1ZXJ5ID0gY3Vyc29yRGVzY3JpcHRpb24uc2VsZWN0b3I7XG4gICAgICAgICAgICB2YXIgb3B0cyA9IGN1cnNvckRlc2NyaXB0aW9uLm9wdGlvbnM7XG4gICAgICAgICAgICB2YXIgZG9jU2l6ZSA9IEthZGlyYS5kb2NTekNhY2hlLmdldFNpemUoY29sbCwgcXVlcnksIG9wdHMsIHJldCkgKiByZXQubGVuZ3RoO1xuICAgICAgICAgICAgZW5kRGF0YS5kb2NTaXplID0gZG9jU2l6ZTtcblxuICAgICAgICAgICAgaWYoa2FkaXJhSW5mbykge1xuICAgICAgICAgICAgICBpZihrYWRpcmFJbmZvLnRyYWNlLnR5cGUgPT09ICdtZXRob2QnKSB7XG4gICAgICAgICAgICAgICAgS2FkaXJhLm1vZGVscy5tZXRob2RzLnRyYWNrRG9jU2l6ZShrYWRpcmFJbmZvLnRyYWNlLm5hbWUsIGRvY1NpemUpO1xuICAgICAgICAgICAgICB9IGVsc2UgaWYoa2FkaXJhSW5mby50cmFjZS50eXBlID09PSAnc3ViJykge1xuICAgICAgICAgICAgICAgIEthZGlyYS5tb2RlbHMucHVic3ViLnRyYWNrRG9jU2l6ZShrYWRpcmFJbmZvLnRyYWNlLm5hbWUsIFwiY3Vyc29yRmV0Y2hlc1wiLCBkb2NTaXplKTtcbiAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAgIGthZGlyYUluZm8udHJhY2tOZXh0T2JqZWN0ID0gcHJldmlvdXNUcmFja05leHRPYmplY3RcbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgIC8vIEZldGNoIHdpdGggbm8ga2FkaXJhIGluZm8gYXJlIHRyYWNrZWQgYXMgZnJvbSBhIG51bGwgbWV0aG9kXG4gICAgICAgICAgICAgIEthZGlyYS5tb2RlbHMubWV0aG9kcy50cmFja0RvY1NpemUoXCI8bm90LWEtbWV0aG9kLW9yLWEtcHViPlwiLCBkb2NTaXplKTtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgLy8gVE9ETzogQWRkIGRvYyBzaXplIHRyYWNraW5nIHRvIGBtYXBgIGFzIHdlbGwuXG4gICAgICAgICAgfVxuICAgICAgICB9XG5cbiAgICAgICAgaWYoZXZlbnRJZCkge1xuICAgICAgICAgIEthZGlyYS50cmFjZXIuZXZlbnRFbmQoa2FkaXJhSW5mby50cmFjZSwgZXZlbnRJZCwgZW5kRGF0YSk7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIHJldDtcbiAgICAgIH0gY2F0Y2goZXgpIHtcbiAgICAgICAgaWYoZXZlbnRJZCkge1xuICAgICAgICAgIEthZGlyYS50cmFjZXIuZXZlbnRFbmQoa2FkaXJhSW5mby50cmFjZSwgZXZlbnRJZCwge2VycjogZXgubWVzc2FnZX0pO1xuICAgICAgICB9XG4gICAgICAgIHRocm93IGV4O1xuICAgICAgfVxuICAgIH07XG4gIH0pO1xuXG4gIGNvbnN0IFN5bmNyb25vdXNDdXJzb3IgPSBnZXRTeW5jcm9ub3VzQ3Vyc29yKCk7XG4gIHZhciBvcmlnTmV4dE9iamVjdCA9IFN5bmNyb25vdXNDdXJzb3IucHJvdG90eXBlLl9uZXh0T2JqZWN0XG4gIFN5bmNyb25vdXNDdXJzb3IucHJvdG90eXBlLl9uZXh0T2JqZWN0ID0gZnVuY3Rpb24gKCkge1xuICAgIHZhciBrYWRpcmFJbmZvID0gS2FkaXJhLl9nZXRJbmZvKCk7XG4gICAgdmFyIHNob3VsZFRyYWNrID0ga2FkaXJhSW5mbyAmJiBrYWRpcmFJbmZvLnRyYWNrTmV4dE9iamVjdDtcbiAgICBpZihzaG91bGRUcmFjayApIHtcbiAgICAgIHZhciBldmVudCA9IEthZGlyYS50cmFjZXIuZXZlbnQoa2FkaXJhSW5mby50cmFjZSwgJ2RiJywge1xuICAgICAgICBmdW5jOiAnX25leHRPYmplY3QnLFxuICAgICAgICBjb2xsOiB0aGlzLl9jdXJzb3JEZXNjcmlwdGlvbi5jb2xsZWN0aW9uTmFtZVxuICAgICAgfSk7XG4gICAgfVxuXG4gICAgdmFyIHJlc3VsdCA9IG9yaWdOZXh0T2JqZWN0LmNhbGwodGhpcyk7XG5cbiAgICBpZiAoc2hvdWxkVHJhY2spIHtcbiAgICAgIEthZGlyYS50cmFjZXIuZXZlbnRFbmQoa2FkaXJhSW5mby50cmFjZSwgZXZlbnQpO1xuICAgIH1cbiAgICByZXR1cm4gcmVzdWx0O1xuICB9XG59O1xuIiwidmFyIG9yaWdpbmFsQ2FsbCA9IEhUVFAuY2FsbDtcblxuSFRUUC5jYWxsID0gZnVuY3Rpb24obWV0aG9kLCB1cmwpIHtcbiAgdmFyIGthZGlyYUluZm8gPSBLYWRpcmEuX2dldEluZm8oKTtcbiAgaWYoa2FkaXJhSW5mbykge1xuICAgIHZhciBldmVudElkID0gS2FkaXJhLnRyYWNlci5ldmVudChrYWRpcmFJbmZvLnRyYWNlLCAnaHR0cCcsIHttZXRob2Q6IG1ldGhvZCwgdXJsOiB1cmx9KTtcbiAgfVxuXG4gIHRyeSB7XG4gICAgdmFyIHJlc3BvbnNlID0gb3JpZ2luYWxDYWxsLmFwcGx5KHRoaXMsIGFyZ3VtZW50cyk7XG5cbiAgICAvL2lmIHRoZSB1c2VyIHN1cHBsaWVkIGFuIGFzeW5DYWxsYmFjaywgd2UgZG9uJ3QgaGF2ZSBhIHJlc3BvbnNlIG9iamVjdCBhbmQgaXQgaGFuZGxlZCBhc3luY2hyb25vdXNseVxuICAgIC8vd2UgbmVlZCB0byB0cmFjayBpdCBkb3duIHRvIHByZXZlbnQgaXNzdWVzIGxpa2U6ICMzXG4gICAgdmFyIGVuZE9wdGlvbnMgPSBIYXZlQXN5bmNDYWxsYmFjayhhcmd1bWVudHMpPyB7YXN5bmM6IHRydWV9OiB7c3RhdHVzQ29kZTogcmVzcG9uc2Uuc3RhdHVzQ29kZX07XG4gICAgaWYoZXZlbnRJZCkge1xuICAgICAgS2FkaXJhLnRyYWNlci5ldmVudEVuZChrYWRpcmFJbmZvLnRyYWNlLCBldmVudElkLCBlbmRPcHRpb25zKTtcbiAgICB9XG4gICAgcmV0dXJuIHJlc3BvbnNlO1xuICB9IGNhdGNoKGV4KSB7XG4gICAgaWYoZXZlbnRJZCkge1xuICAgICAgS2FkaXJhLnRyYWNlci5ldmVudEVuZChrYWRpcmFJbmZvLnRyYWNlLCBldmVudElkLCB7ZXJyOiBleC5tZXNzYWdlfSk7XG4gICAgfVxuICAgIHRocm93IGV4O1xuICB9XG59OyIsInZhciBvcmlnaW5hbFNlbmQgPSBFbWFpbC5zZW5kO1xuXG5FbWFpbC5zZW5kID0gZnVuY3Rpb24ob3B0aW9ucykge1xuICB2YXIga2FkaXJhSW5mbyA9IEthZGlyYS5fZ2V0SW5mbygpO1xuICBpZihrYWRpcmFJbmZvKSB7XG4gICAgdmFyIGRhdGEgPSBfLnBpY2sob3B0aW9ucywgJ2Zyb20nLCAndG8nLCAnY2MnLCAnYmNjJywgJ3JlcGx5VG8nKTtcbiAgICB2YXIgZXZlbnRJZCA9IEthZGlyYS50cmFjZXIuZXZlbnQoa2FkaXJhSW5mby50cmFjZSwgJ2VtYWlsJywgZGF0YSk7XG4gIH1cbiAgdHJ5IHtcbiAgICB2YXIgcmV0ID0gb3JpZ2luYWxTZW5kLmNhbGwodGhpcywgb3B0aW9ucyk7XG4gICAgaWYoZXZlbnRJZCkge1xuICAgICAgS2FkaXJhLnRyYWNlci5ldmVudEVuZChrYWRpcmFJbmZvLnRyYWNlLCBldmVudElkKTtcbiAgICB9XG4gICAgcmV0dXJuIHJldDtcbiAgfSBjYXRjaChleCkge1xuICAgIGlmKGV2ZW50SWQpIHtcbiAgICAgIEthZGlyYS50cmFjZXIuZXZlbnRFbmQoa2FkaXJhSW5mby50cmFjZSwgZXZlbnRJZCwge2VycjogZXgubWVzc2FnZX0pO1xuICAgIH1cbiAgICB0aHJvdyBleDtcbiAgfVxufTsiLCJ2YXIgRmliZXJzID0gTnBtLnJlcXVpcmUoJ2ZpYmVycycpO1xudmFyIEV2ZW50U3ltYm9sID0gU3ltYm9sKCk7XG52YXIgU3RhcnRUcmFja2VkID0gU3ltYm9sKCk7XG5cbnZhciBhY3RpdmVGaWJlcnMgPSAwO1xuXG52YXIgb3JpZ2luYWxZaWVsZCA9IEZpYmVycy55aWVsZDtcbkZpYmVycy55aWVsZCA9IGZ1bmN0aW9uKCkge1xuICB2YXIga2FkaXJhSW5mbyA9IEthZGlyYS5fZ2V0SW5mbygpO1xuICBpZihrYWRpcmFJbmZvKSB7XG4gICAgdmFyIGV2ZW50SWQgPSBLYWRpcmEudHJhY2VyLmV2ZW50KGthZGlyYUluZm8udHJhY2UsICdhc3luYycpO1xuICAgIGlmKGV2ZW50SWQpIHtcbiAgICAgIC8vIFRoZSBldmVudCB1bmlxdWUgdG8gdGhpcyBmaWJlclxuICAgICAgLy8gVXNpbmcgYSBzeW1ib2wgc2luY2UgTWV0ZW9yIGRvZXNuJ3QgY29weSBzeW1ib2xzIHRvIG5ldyBmaWJlcnMgY3JlYXRlZFxuICAgICAgLy8gZm9yIHByb21pc2VzLiBUaGlzIGlzIG5lZWRlZCBzbyB0aGUgY29ycmVjdCBldmVudCBpcyBlbmRlZCB3aGVuIGEgZmliZXIgcnVucyBhZnRlciBiZWluZyB5aWVsZGVkLlxuICAgICAgRmliZXJzLmN1cnJlbnRbRXZlbnRTeW1ib2xdID0gZXZlbnRJZDtcbiAgICB9XG4gIH1cblxuICByZXR1cm4gb3JpZ2luYWxZaWVsZCgpO1xufTtcblxudmFyIG9yaWdpbmFsUnVuID0gRmliZXJzLnByb3RvdHlwZS5ydW47XG52YXIgb3JpZ2luYWxUaHJvd0ludG8gPSBGaWJlcnMucHJvdG90eXBlLnRocm93SW50bztcblxuZnVuY3Rpb24gZW5zdXJlRmliZXJDb3VudGVkKGZpYmVyKSB7XG4gIC8vIElmIGZpYmVyLnN0YXJ0ZWQgaXMgdHJ1ZSwgYW5kIFN0YXJ0VHJhY2tlZCBpcyBmYWxzZVxuICAvLyB0aGVuIHRoZSBmaWJlciB3YXMgcHJvYmFibHkgaW5pdGlhbGx5IHJhbiBiZWZvcmUgd2Ugd3JhcHBlZCBGaWJlcnMucnVuXG4gIGlmICghZmliZXIuc3RhcnRlZCB8fCAhZmliZXJbU3RhcnRUcmFja2VkXSkge1xuICAgIGFjdGl2ZUZpYmVycyArPSAxO1xuICAgIGZpYmVyW1N0YXJ0VHJhY2tlZF0gPSB0cnVlO1xuICB9XG59XG5cbkZpYmVycy5wcm90b3R5cGUucnVuID0gZnVuY3Rpb24odmFsKSB7XG4gIGVuc3VyZUZpYmVyQ291bnRlZCh0aGlzKTtcblxuICBpZih0aGlzW0V2ZW50U3ltYm9sXSkge1xuICAgIHZhciBrYWRpcmFJbmZvID0gS2FkaXJhLl9nZXRJbmZvKHRoaXMpO1xuICAgIGlmKGthZGlyYUluZm8pIHtcbiAgICAgIEthZGlyYS50cmFjZXIuZXZlbnRFbmQoa2FkaXJhSW5mby50cmFjZSwgdGhpc1tFdmVudFN5bWJvbF0pO1xuICAgICAgdGhpc1tFdmVudFN5bWJvbF0gPSBudWxsO1xuICAgIH1cbiAgfSBlbHNlIGlmICghdGhpcy5fX2thZGlyYUluZm8gJiYgRmliZXJzLmN1cnJlbnQgJiYgRmliZXJzLmN1cnJlbnQuX19rYWRpcmFJbmZvKSB7XG4gICAgLy8gQ29weSBrYWRpcmFJbmZvIHdoZW4gcGFja2FnZXMgb3IgdXNlciBjb2RlIGNyZWF0ZXMgYSBuZXcgZmliZXJcbiAgICAvLyBEb25lIGJ5IG1hbnkgYXBwcyBhbmQgcGFja2FnZXMgaW4gY29ubmVjdCBtaWRkbGV3YXJlIHNpbmNlIG9sZGVyXG4gICAgLy8gdmVyc2lvbnMgb2YgTWV0ZW9yIGRpZCBub3QgZG8gaXQgYXV0b21hdGljYWxseVxuICAgIHRoaXMuX19rYWRpcmFJbmZvID0gRmliZXJzLmN1cnJlbnQuX19rYWRpcmFJbmZvO1xuICB9XG5cbiAgbGV0IHJlc3VsdDtcbiAgdHJ5IHtcbiAgICByZXN1bHQgPSBvcmlnaW5hbFJ1bi5jYWxsKHRoaXMsIHZhbCk7XG4gIH0gZmluYWxseSB7XG4gICAgaWYgKCF0aGlzLnN0YXJ0ZWQpIHtcbiAgICAgIGFjdGl2ZUZpYmVycyAtPSAxO1xuICAgICAgdGhpc1tTdGFydFRyYWNrZWRdID0gZmFsc2U7XG4gICAgfVxuICB9XG5cbiAgcmV0dXJuIHJlc3VsdDtcbn07XG5cbkZpYmVycy5wcm90b3R5cGUudGhyb3dJbnRvID0gZnVuY3Rpb24gKHZhbCkge1xuICBlbnN1cmVGaWJlckNvdW50ZWQodGhpcyk7XG5cbiAgLy8gVE9ETzogdGhpcyBzaG91bGQgcHJvYmFibHkgZW5kIHRoZSBjdXJyZW50IGFzeW5jIGV2ZW50IHNpbmNlIGluIHNvbWUgcGxhY2VzXG4gIC8vIE1ldGVvciBjYWxscyB0aHJvd0ludG8gaW5zdGVhZCBvZiBydW4gYWZ0ZXIgYSBmaWJlciBpcyB5aWVsZGVkLiBGb3IgZXhhbXBsZSxcbiAgLy8gd2hlbiBhIHByb21pc2UgaXMgYXdhaXRlZCBhbmQgcmVqZWN0cyBhbiBlcnJvci5cblxuICBsZXQgcmVzdWx0O1xuICB0cnkge1xuICAgIHJlc3VsdCA9IG9yaWdpbmFsVGhyb3dJbnRvLmNhbGwodGhpcywgdmFsKTtcbiAgfSBmaW5hbGx5IHtcbiAgICBpZiAoIXRoaXMuc3RhcnRlZCkge1xuICAgICAgYWN0aXZlRmliZXJzIC09IDE7XG4gICAgICB0aGlzW1N0YXJ0VHJhY2tlZF0gPSBmYWxzZTtcbiAgICB9XG4gIH1cblxuICByZXR1cm4gcmVzdWx0O1xufTtcblxubGV0IGFjdGl2ZUZpYmVyVG90YWwgPSAwO1xubGV0IGFjdGl2ZUZpYmVyQ291bnQgPSAwO1xubGV0IHByZXZpb3VzVG90YWxDcmVhdGVkID0gMDtcblxuc2V0SW50ZXJ2YWwoKCkgPT4ge1xuICBhY3RpdmVGaWJlclRvdGFsICs9IGFjdGl2ZUZpYmVycztcbiAgYWN0aXZlRmliZXJDb3VudCArPSAxO1xufSwgMTAwMCk7XG5cbmV4cG9ydCBmdW5jdGlvbiBnZXRGaWJlck1ldHJpY3MoKSB7XG4gIHJldHVybiB7XG4gICAgY3JlYXRlZDogRmliZXJzLmZpYmVyc0NyZWF0ZWQgLSBwcmV2aW91c1RvdGFsQ3JlYXRlZCxcbiAgICBhY3RpdmU6IGFjdGl2ZUZpYmVyVG90YWwgLyBhY3RpdmVGaWJlckNvdW50LFxuICAgIHBvb2xTaXplOiBGaWJlcnMucG9vbFNpemVcbiAgfVxufVxuXG5leHBvcnQgZnVuY3Rpb24gcmVzZXRGaWJlck1ldHJpY3MoKSB7XG4gIGFjdGl2ZUZpYmVyVG90YWwgPSAwO1xuICBhY3RpdmVGaWJlckNvdW50ID0gMDtcbiAgcHJldmlvdXNUb3RhbENyZWF0ZWQgPSBGaWJlcnMuZmliZXJzQ3JlYXRlZDtcbn1cbiIsImV4cG9ydCBjb25zdCBNZXRlb3JEZWJ1Z0lnbm9yZSA9IFN5bWJvbCgpXG5cblRyYWNrVW5jYXVnaHRFeGNlcHRpb25zID0gZnVuY3Rpb24gKCkge1xuICBwcm9jZXNzLm9uKCd1bmNhdWdodEV4Y2VwdGlvbicsIGZ1bmN0aW9uIChlcnIpIHtcbiAgICAvLyBza2lwIGVycm9ycyB3aXRoIGBfc2tpcEthZGlyYWAgZmxhZ1xuICAgIGlmKGVyci5fc2tpcEthZGlyYSkge1xuICAgICAgcmV0dXJuO1xuICAgIH1cblxuICAgIC8vIGxldCB0aGUgc2VydmVyIGNyYXNoIG5vcm1hbGx5IGlmIGVycm9yIHRyYWNraW5nIGlzIGRpc2FibGVkXG4gICAgaWYoIUthZGlyYS5vcHRpb25zLmVuYWJsZUVycm9yVHJhY2tpbmcpIHtcbiAgICAgIHByaW50RXJyb3JBbmRLaWxsKGVycik7XG4gICAgfVxuXG4gICAgLy8gbG9va2luZyBmb3IgYWxyZWFkeSB0cmFja2VkIGVycm9ycyBhbmQgdGhyb3cgdGhlbSBpbW1lZGlhdGVseVxuICAgIC8vIHRocm93IGVycm9yIGltbWVkaWF0ZWx5IGlmIGthZGlyYSBpcyBub3QgcmVhZHlcbiAgICBpZihlcnIuX3RyYWNrZWQgfHwgIUthZGlyYS5jb25uZWN0ZWQpIHtcbiAgICAgIHByaW50RXJyb3JBbmRLaWxsKGVycik7XG4gICAgfVxuXG4gICAgdmFyIHRyYWNlID0gZ2V0VHJhY2UoZXJyLCAnc2VydmVyLWNyYXNoJywgJ3VuY2F1Z2h0RXhjZXB0aW9uJyk7XG4gICAgS2FkaXJhLm1vZGVscy5lcnJvci50cmFja0Vycm9yKGVyciwgdHJhY2UpO1xuICAgIEthZGlyYS5fc2VuZFBheWxvYWQoZnVuY3Rpb24gKCkge1xuICAgICAgY2xlYXJUaW1lb3V0KHRpbWVyKTtcbiAgICAgIHRocm93RXJyb3IoZXJyKTtcbiAgICB9KTtcblxuICAgIHZhciB0aW1lciA9IHNldFRpbWVvdXQoZnVuY3Rpb24gKCkge1xuICAgICAgdGhyb3dFcnJvcihlcnIpO1xuICAgIH0sIDEwMDAqMTApO1xuXG4gICAgZnVuY3Rpb24gdGhyb3dFcnJvcihlcnIpIHtcbiAgICAgIC8vIHNvbWV0aW1lcyBlcnJvciBjYW1lIGJhY2sgZnJvbSBhIGZpYmVyLlxuICAgICAgLy8gQnV0IHdlIGRvbid0IGZpYmVycyB0byB0cmFjayB0aGF0IGVycm9yIGZvciB1c1xuICAgICAgLy8gVGhhdCdzIHdoeSB3ZSB0aHJvdyB0aGUgZXJyb3Igb24gdGhlIG5leHRUaWNrXG4gICAgICBwcm9jZXNzLm5leHRUaWNrKGZ1bmN0aW9uKCkge1xuICAgICAgICAvLyB3ZSBuZWVkIHRvIG1hcmsgdGhpcyBlcnJvciB3aGVyZSB3ZSByZWFsbHkgbmVlZCB0byB0aHJvd1xuICAgICAgICBlcnIuX3RyYWNrZWQgPSB0cnVlO1xuICAgICAgICBwcmludEVycm9yQW5kS2lsbChlcnIpO1xuICAgICAgfSk7XG4gICAgfVxuICB9KTtcblxuICBmdW5jdGlvbiBwcmludEVycm9yQW5kS2lsbChlcnIpIHtcbiAgICAvLyBzaW5jZSB3ZSBhcmUgY2FwdHVyaW5nIGVycm9yLCB3ZSBhcmUgYWxzbyBvbiB0aGUgZXJyb3IgbWVzc2FnZS5cbiAgICAvLyBzbyBkZXZlbG9wZXJzIHRoaW5rIHdlIGFyZSBhbHNvIHJlcG9uc2libGUgZm9yIHRoZSBlcnJvci5cbiAgICAvLyBCdXQgd2UgYXJlIG5vdC4gVGhpcyB3aWxsIGZpeCB0aGF0LlxuICAgIGNvbnNvbGUuZXJyb3IoZXJyLnN0YWNrKTtcbiAgICBwcm9jZXNzLmV4aXQoNyk7XG4gIH1cbn1cblxuVHJhY2tVbmhhbmRsZWRSZWplY3Rpb25zID0gZnVuY3Rpb24gKCkge1xuICBwcm9jZXNzLm9uKCd1bmhhbmRsZWRSZWplY3Rpb24nLCBmdW5jdGlvbiAocmVhc29uKSB7XG4gICAgLy8gc2tpcCBlcnJvcnMgd2l0aCBgX3NraXBLYWRpcmFgIGZsYWdcbiAgICBpZihcbiAgICAgIHJlYXNvbi5fc2tpcEthZGlyYSB8fFxuICAgICAgIUthZGlyYS5vcHRpb25zLmVuYWJsZUVycm9yVHJhY2tpbmdcbiAgICApIHtcbiAgICAgIHJldHVybjtcbiAgICB9XG5cbiAgICB2YXIgdHJhY2UgPSBnZXRUcmFjZShyZWFzb24sICdzZXJ2ZXItaW50ZXJuYWwnLCAndW5oYW5kbGVkUmVqZWN0aW9uJyk7XG4gICAgS2FkaXJhLm1vZGVscy5lcnJvci50cmFja0Vycm9yKHJlYXNvbiwgdHJhY2UpO1xuXG4gICAgLy8gVE9ETzogd2Ugc2hvdWxkIHJlc3BlY3QgdGhlIC0tdW5oYW5kbGVkLXJlamVjdGlvbnMgb3B0aW9uXG4gICAgLy8gbWVzc2FnZSB0YWtlbiBmcm9tIFxuICAgIC8vIGh0dHBzOi8vZ2l0aHViLmNvbS9ub2RlanMvbm9kZS9ibG9iL2Y0Nzk3ZmYxZWY3MzA0NjU5ZDc0N2QxODFlYzFlN2FmYWM0MDhkNTAvbGliL2ludGVybmFsL3Byb2Nlc3MvcHJvbWlzZXMuanMjTDI0My1MMjQ4XG4gICAgY29uc3QgbWVzc2FnZSA9XG4gICAgICAnVGhpcyBlcnJvciBvcmlnaW5hdGVkIGVpdGhlciBieSAnICtcbiAgICAgICd0aHJvd2luZyBpbnNpZGUgb2YgYW4gYXN5bmMgZnVuY3Rpb24gd2l0aG91dCBhIGNhdGNoIGJsb2NrLCAnICtcbiAgICAgICdvciBieSByZWplY3RpbmcgYSBwcm9taXNlIHdoaWNoIHdhcyBub3QgaGFuZGxlZCB3aXRoIC5jYXRjaCgpLicgK1xuICAgICAgJyBUaGUgcHJvbWlzZSByZWplY3RlZCB3aXRoIHRoZSByZWFzb246ICc7XG5cbiAgICAvLyBXZSBjb3VsZCBlbWl0IGEgd2FybmluZyBpbnN0ZWFkIGxpa2UgTm9kZSBkb2VzIGludGVybmFsbHlcbiAgICAvLyBidXQgaXQgcmVxdWlyZXMgTm9kZSA4IG9yIG5ld2VyXG4gICAgY29uc29sZS53YXJuKG1lc3NhZ2UpO1xuICAgIGNvbnNvbGUuZXJyb3IocmVhc29uICYmIHJlYXNvbi5zdGFjayA/IHJlYXNvbi5zdGFjayA6IHJlYXNvbilcbiAgfSk7XG59XG5cblRyYWNrTWV0ZW9yRGVidWcgPSBmdW5jdGlvbiAoKSB7XG4gIHZhciBvcmlnaW5hbE1ldGVvckRlYnVnID0gTWV0ZW9yLl9kZWJ1ZztcbiAgTWV0ZW9yLl9kZWJ1ZyA9IGZ1bmN0aW9uIChtZXNzYWdlLCBzdGFjaykge1xuICAgIC8vIFNvbWV0aW1lcyBNZXRlb3IgY2FsbHMgTWV0ZW9yLl9kZWJ1ZyB3aXRoIG5vIGFyZ3VtZW50c1xuICAgIC8vIHRvIGxvZyBhbiBlbXB0eSBsaW5lXG4gICAgY29uc3QgaXNBcmdzID0gbWVzc2FnZSAhPT0gdW5kZWZpbmVkIHx8IHN0YWNrICE9PSB1bmRlZmluZWQ7XG5cbiAgICAvLyBXZSd2ZSBjaGFuZ2VkIGBzdGFja2AgaW50byBhbiBvYmplY3QgYXQgbWV0aG9kIGFuZCBzdWIgaGFuZGxlcnMgc28gd2UgY2FuXG4gICAgLy8gZGV0ZWN0IHRoZSBlcnJvciBoZXJlLiBUaGVzZSBlcnJvcnMgYXJlIGFscmVhZHkgdHJhY2tlZCBzbyBkb24ndCB0cmFjayB0aGVtIGFnYWluLlxuICAgIHZhciBhbHJlYWR5VHJhY2tlZCA9IGZhbHNlO1xuXG4gICAgLy8gU29tZSBNZXRlb3IgdmVyc2lvbnMgcGFzcyB0aGUgZXJyb3IsIGFuZCBvdGhlciB2ZXJzaW9ucyBwYXNzIHRoZSBlcnJvciBzdGFja1xuICAgIC8vIFJlc3RvcmUgc28gb3JpZ2lvbmFsTWV0ZW9yRGVidWcgc2hvd3MgdGhlIHN0YWNrIGFzIGEgc3RyaW5nIGluc3RlYWQgYXMgYW4gb2JqZWN0XG4gICAgaWYgKHN0YWNrICYmIHN0YWNrW01ldGVvckRlYnVnSWdub3JlXSkge1xuICAgICAgYWxyZWFkeVRyYWNrZWQgPSB0cnVlO1xuICAgICAgYXJndW1lbnRzWzFdID0gc3RhY2suc3RhY2s7XG4gICAgfSBlbHNlIGlmIChzdGFjayAmJiBzdGFjay5zdGFjayAmJiBzdGFjay5zdGFja1tNZXRlb3JEZWJ1Z0lnbm9yZV0pIHtcbiAgICAgIGFscmVhZHlUcmFja2VkID0gdHJ1ZTtcbiAgICAgIGFyZ3VtZW50c1sxXSA9IHN0YWNrLnN0YWNrLnN0YWNrO1xuICAgIH1cblxuICAgIC8vIG9ubHkgc2VuZCB0byB0aGUgc2VydmVyIGlmIGNvbm5lY3RlZCB0byBrYWRpcmFcbiAgICBpZiAoXG4gICAgICBLYWRpcmEub3B0aW9ucy5lbmFibGVFcnJvclRyYWNraW5nICYmXG4gICAgICBpc0FyZ3MgJiZcbiAgICAgICFhbHJlYWR5VHJhY2tlZCAmJlxuICAgICAgS2FkaXJhLmNvbm5lY3RlZFxuICAgICkge1xuICAgICAgbGV0IGVycm9yTWVzc2FnZSA9IG1lc3NhZ2U7XG5cbiAgICAgIGlmICh0eXBlb2YgbWVzc2FnZSA9PSAnc3RyaW5nJyAmJiBzdGFjayBpbnN0YW5jZW9mIEVycm9yKSB7XG4gICAgICAgIGNvbnN0IHNlcGFyYXRvciA9IG1lc3NhZ2UuZW5kc1dpdGgoJzonKSA/ICcnIDogJzonXG4gICAgICAgIGVycm9yTWVzc2FnZSA9IGAke21lc3NhZ2V9JHtzZXBhcmF0b3J9ICR7c3RhY2subWVzc2FnZX1gXG4gICAgICB9XG5cbiAgICAgIGxldCBlcnJvciA9IG5ldyBFcnJvcihlcnJvck1lc3NhZ2UpO1xuICAgICAgaWYgKHN0YWNrIGluc3RhbmNlb2YgRXJyb3IpIHtcbiAgICAgICAgZXJyb3Iuc3RhY2sgPSBzdGFjay5zdGFjaztcbiAgICAgIH0gZWxzZSBpZiAoc3RhY2spIHtcbiAgICAgICAgZXJyb3Iuc3RhY2sgPSBzdGFjaztcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIGVycm9yLnN0YWNrID0gQ3JlYXRlVXNlclN0YWNrKGVycm9yKTtcbiAgICAgIH1cbiAgICAgIHZhciB0cmFjZSA9IGdldFRyYWNlKGVycm9yLCAnc2VydmVyLWludGVybmFsJywgJ01ldGVvci5fZGVidWcnKTtcbiAgICAgIEthZGlyYS5tb2RlbHMuZXJyb3IudHJhY2tFcnJvcihlcnJvciwgdHJhY2UpO1xuICAgIH1cblxuICAgIHJldHVybiBvcmlnaW5hbE1ldGVvckRlYnVnLmFwcGx5KHRoaXMsIGFyZ3VtZW50cyk7XG4gIH1cbn1cblxuZnVuY3Rpb24gZ2V0VHJhY2UoZXJyLCB0eXBlLCBzdWJUeXBlKSB7XG4gIHJldHVybiB7XG4gICAgdHlwZTogdHlwZSxcbiAgICBzdWJUeXBlOiBzdWJUeXBlLFxuICAgIG5hbWU6IGVyci5tZXNzYWdlLFxuICAgIGVycm9yZWQ6IHRydWUsXG4gICAgYXQ6IEthZGlyYS5zeW5jZWREYXRlLmdldFRpbWUoKSxcbiAgICBldmVudHM6IFtcbiAgICAgIFsnc3RhcnQnLCAwLCB7fV0sXG4gICAgICBbJ2Vycm9yJywgMCwge2Vycm9yOiB7bWVzc2FnZTogZXJyLm1lc3NhZ2UsIHN0YWNrOiBlcnIuc3RhY2t9fV1cbiAgICBdLFxuICAgIG1ldHJpY3M6IHtcbiAgICAgIHRvdGFsOiAwXG4gICAgfVxuICB9O1xufVxuIiwic2V0TGFiZWxzID0gZnVuY3Rpb24gKCkge1xuICAvLyBuYW1lIFNlc3Npb24ucHJvdG90eXBlLnNlbmRcbiAgdmFyIG9yaWdpbmFsU2VuZCA9IE1ldGVvclguU2Vzc2lvbi5wcm90b3R5cGUuc2VuZDtcbiAgTWV0ZW9yWC5TZXNzaW9uLnByb3RvdHlwZS5zZW5kID0gZnVuY3Rpb24ga2FkaXJhX1Nlc3Npb25fc2VuZCAobXNnKSB7XG4gICAgcmV0dXJuIG9yaWdpbmFsU2VuZC5jYWxsKHRoaXMsIG1zZyk7XG4gIH1cblxuICAvLyBuYW1lIE11bHRpcGxleGVyIGluaXRpYWwgYWRkc1xuICAvLyBNdWx0aXBsZXhlciBpcyB1bmRlZmluZWQgaW4gcm9ja2V0IGNoYXRcbiAgaWYgKE1ldGVvclguTXVsdGlwbGV4ZXIpIHtcbiAgICB2YXIgb3JpZ2luYWxTZW5kQWRkcyA9IE1ldGVvclguTXVsdGlwbGV4ZXIucHJvdG90eXBlLl9zZW5kQWRkcztcbiAgICBNZXRlb3JYLk11bHRpcGxleGVyLnByb3RvdHlwZS5fc2VuZEFkZHMgPSBmdW5jdGlvbiBrYWRpcmFfTXVsdGlwbGV4ZXJfc2VuZEFkZHMgKGhhbmRsZSkge1xuICAgICAgcmV0dXJuIG9yaWdpbmFsU2VuZEFkZHMuY2FsbCh0aGlzLCBoYW5kbGUpO1xuICAgIH1cbiAgfVxuXG4gIC8vIG5hbWUgTW9uZ29Db25uZWN0aW9uIGluc2VydFxuICB2YXIgb3JpZ2luYWxNb25nb0luc2VydCA9IE1ldGVvclguTW9uZ29Db25uZWN0aW9uLnByb3RvdHlwZS5faW5zZXJ0O1xuICBNZXRlb3JYLk1vbmdvQ29ubmVjdGlvbi5wcm90b3R5cGUuX2luc2VydCA9IGZ1bmN0aW9uIGthZGlyYV9Nb25nb0Nvbm5lY3Rpb25faW5zZXJ0IChjb2xsLCBkb2MsIGNiKSB7XG4gICAgcmV0dXJuIG9yaWdpbmFsTW9uZ29JbnNlcnQuY2FsbCh0aGlzLCBjb2xsLCBkb2MsIGNiKTtcbiAgfVxuXG4gIC8vIG5hbWUgTW9uZ29Db25uZWN0aW9uIHVwZGF0ZVxuICB2YXIgb3JpZ2luYWxNb25nb1VwZGF0ZSA9IE1ldGVvclguTW9uZ29Db25uZWN0aW9uLnByb3RvdHlwZS5fdXBkYXRlO1xuICBNZXRlb3JYLk1vbmdvQ29ubmVjdGlvbi5wcm90b3R5cGUuX3VwZGF0ZSA9IGZ1bmN0aW9uIGthZGlyYV9Nb25nb0Nvbm5lY3Rpb25fdXBkYXRlIChjb2xsLCBzZWxlY3RvciwgbW9kLCBvcHRpb25zLCBjYikge1xuICAgIHJldHVybiBvcmlnaW5hbE1vbmdvVXBkYXRlLmNhbGwodGhpcywgY29sbCwgc2VsZWN0b3IsIG1vZCwgb3B0aW9ucywgY2IpO1xuICB9XG5cbiAgLy8gbmFtZSBNb25nb0Nvbm5lY3Rpb24gcmVtb3ZlXG4gIHZhciBvcmlnaW5hbE1vbmdvUmVtb3ZlID0gTWV0ZW9yWC5Nb25nb0Nvbm5lY3Rpb24ucHJvdG90eXBlLl9yZW1vdmU7XG4gIE1ldGVvclguTW9uZ29Db25uZWN0aW9uLnByb3RvdHlwZS5fcmVtb3ZlID0gZnVuY3Rpb24ga2FkaXJhX01vbmdvQ29ubmVjdGlvbl9yZW1vdmUgKGNvbGwsIHNlbGVjdG9yLCBjYikge1xuICAgIHJldHVybiBvcmlnaW5hbE1vbmdvUmVtb3ZlLmNhbGwodGhpcywgY29sbCwgc2VsZWN0b3IsIGNiKTtcbiAgfVxuXG4gIC8vIG5hbWUgUHVic3ViIGFkZGVkXG4gIHZhciBvcmlnaW5hbFB1YnN1YkFkZGVkID0gTWV0ZW9yWC5TZXNzaW9uLnByb3RvdHlwZS5zZW5kQWRkZWQ7XG4gIE1ldGVvclguU2Vzc2lvbi5wcm90b3R5cGUuc2VuZEFkZGVkID0gZnVuY3Rpb24ga2FkaXJhX1Nlc3Npb25fc2VuZEFkZGVkIChjb2xsLCBpZCwgZmllbGRzKSB7XG4gICAgcmV0dXJuIG9yaWdpbmFsUHVic3ViQWRkZWQuY2FsbCh0aGlzLCBjb2xsLCBpZCwgZmllbGRzKTtcbiAgfVxuXG4gIC8vIG5hbWUgUHVic3ViIGNoYW5nZWRcbiAgdmFyIG9yaWdpbmFsUHVic3ViQ2hhbmdlZCA9IE1ldGVvclguU2Vzc2lvbi5wcm90b3R5cGUuc2VuZENoYW5nZWQ7XG4gIE1ldGVvclguU2Vzc2lvbi5wcm90b3R5cGUuc2VuZENoYW5nZWQgPSBmdW5jdGlvbiBrYWRpcmFfU2Vzc2lvbl9zZW5kQ2hhbmdlZCAoY29sbCwgaWQsIGZpZWxkcykge1xuICAgIHJldHVybiBvcmlnaW5hbFB1YnN1YkNoYW5nZWQuY2FsbCh0aGlzLCBjb2xsLCBpZCwgZmllbGRzKTtcbiAgfVxuXG4gIC8vIG5hbWUgUHVic3ViIHJlbW92ZWRcbiAgdmFyIG9yaWdpbmFsUHVic3ViUmVtb3ZlZCA9IE1ldGVvclguU2Vzc2lvbi5wcm90b3R5cGUuc2VuZFJlbW92ZWQ7XG4gIE1ldGVvclguU2Vzc2lvbi5wcm90b3R5cGUuc2VuZFJlbW92ZWQgPSBmdW5jdGlvbiBrYWRpcmFfU2Vzc2lvbl9zZW5kUmVtb3ZlZCAoY29sbCwgaWQpIHtcbiAgICByZXR1cm4gb3JpZ2luYWxQdWJzdWJSZW1vdmVkLmNhbGwodGhpcywgY29sbCwgaWQpO1xuICB9XG5cbiAgLy8gbmFtZSBNb25nb0N1cnNvciBmb3JFYWNoXG4gIHZhciBvcmlnaW5hbEN1cnNvckZvckVhY2ggPSBNZXRlb3JYLk1vbmdvQ3Vyc29yLnByb3RvdHlwZS5mb3JFYWNoO1xuICBNZXRlb3JYLk1vbmdvQ3Vyc29yLnByb3RvdHlwZS5mb3JFYWNoID0gZnVuY3Rpb24ga2FkaXJhX0N1cnNvcl9mb3JFYWNoICgpIHtcbiAgICByZXR1cm4gb3JpZ2luYWxDdXJzb3JGb3JFYWNoLmFwcGx5KHRoaXMsIGFyZ3VtZW50cyk7XG4gIH1cblxuICAvLyBuYW1lIE1vbmdvQ3Vyc29yIG1hcFxuICB2YXIgb3JpZ2luYWxDdXJzb3JNYXAgPSBNZXRlb3JYLk1vbmdvQ3Vyc29yLnByb3RvdHlwZS5tYXA7XG4gIE1ldGVvclguTW9uZ29DdXJzb3IucHJvdG90eXBlLm1hcCA9IGZ1bmN0aW9uIGthZGlyYV9DdXJzb3JfbWFwICgpIHtcbiAgICByZXR1cm4gb3JpZ2luYWxDdXJzb3JNYXAuYXBwbHkodGhpcywgYXJndW1lbnRzKTtcbiAgfVxuXG4gIC8vIG5hbWUgTW9uZ29DdXJzb3IgZmV0Y2hcbiAgdmFyIG9yaWdpbmFsQ3Vyc29yRmV0Y2ggPSBNZXRlb3JYLk1vbmdvQ3Vyc29yLnByb3RvdHlwZS5mZXRjaDtcbiAgTWV0ZW9yWC5Nb25nb0N1cnNvci5wcm90b3R5cGUuZmV0Y2ggPSBmdW5jdGlvbiBrYWRpcmFfQ3Vyc29yX2ZldGNoICgpIHtcbiAgICByZXR1cm4gb3JpZ2luYWxDdXJzb3JGZXRjaC5hcHBseSh0aGlzLCBhcmd1bWVudHMpO1xuICB9XG5cbiAgLy8gbmFtZSBNb25nb0N1cnNvciBjb3VudFxuICB2YXIgb3JpZ2luYWxDdXJzb3JDb3VudCA9IE1ldGVvclguTW9uZ29DdXJzb3IucHJvdG90eXBlLmNvdW50O1xuICBNZXRlb3JYLk1vbmdvQ3Vyc29yLnByb3RvdHlwZS5jb3VudCA9IGZ1bmN0aW9uIGthZGlyYV9DdXJzb3JfY291bnQgKCkge1xuICAgIHJldHVybiBvcmlnaW5hbEN1cnNvckNvdW50LmFwcGx5KHRoaXMsIGFyZ3VtZW50cyk7XG4gIH1cblxuICAvLyBuYW1lIE1vbmdvQ3Vyc29yIG9ic2VydmVDaGFuZ2VzXG4gIHZhciBvcmlnaW5hbEN1cnNvck9ic2VydmVDaGFuZ2VzID0gTWV0ZW9yWC5Nb25nb0N1cnNvci5wcm90b3R5cGUub2JzZXJ2ZUNoYW5nZXM7XG4gIE1ldGVvclguTW9uZ29DdXJzb3IucHJvdG90eXBlLm9ic2VydmVDaGFuZ2VzID0gZnVuY3Rpb24ga2FkaXJhX0N1cnNvcl9vYnNlcnZlQ2hhbmdlcyAoKSB7XG4gICAgcmV0dXJuIG9yaWdpbmFsQ3Vyc29yT2JzZXJ2ZUNoYW5nZXMuYXBwbHkodGhpcywgYXJndW1lbnRzKTtcbiAgfVxuXG4gIC8vIG5hbWUgTW9uZ29DdXJzb3Igb2JzZXJ2ZVxuICB2YXIgb3JpZ2luYWxDdXJzb3JPYnNlcnZlID0gTWV0ZW9yWC5Nb25nb0N1cnNvci5wcm90b3R5cGUub2JzZXJ2ZTtcbiAgTWV0ZW9yWC5Nb25nb0N1cnNvci5wcm90b3R5cGUub2JzZXJ2ZSA9IGZ1bmN0aW9uIGthZGlyYV9DdXJzb3Jfb2JzZXJ2ZSAoKSB7XG4gICAgcmV0dXJuIG9yaWdpbmFsQ3Vyc29yT2JzZXJ2ZS5hcHBseSh0aGlzLCBhcmd1bWVudHMpO1xuICB9XG5cbiAgLy8gbmFtZSBDcm9zc0JhciBsaXN0ZW5cbiAgdmFyIG9yaWdpbmFsQ3Jvc3NiYXJMaXN0ZW4gPSBERFBTZXJ2ZXIuX0Nyb3NzYmFyLnByb3RvdHlwZS5saXN0ZW47XG4gIEREUFNlcnZlci5fQ3Jvc3NiYXIucHJvdG90eXBlLmxpc3RlbiA9IGZ1bmN0aW9uIGthZGlyYV9Dcm9zc2Jhcl9saXN0ZW4gKHRyaWdnZXIsIGNhbGxiYWNrKSB7XG4gICAgcmV0dXJuIG9yaWdpbmFsQ3Jvc3NiYXJMaXN0ZW4uY2FsbCh0aGlzLCB0cmlnZ2VyLCBjYWxsYmFjayk7XG4gIH1cblxuICAvLyBuYW1lIENyb3NzQmFyIGZpcmVcbiAgdmFyIG9yaWdpbmFsQ3Jvc3NiYXJGaXJlID0gRERQU2VydmVyLl9Dcm9zc2Jhci5wcm90b3R5cGUuZmlyZTtcbiAgRERQU2VydmVyLl9Dcm9zc2Jhci5wcm90b3R5cGUuZmlyZSA9IGZ1bmN0aW9uIGthZGlyYV9Dcm9zc2Jhcl9maXJlIChub3RpZmljYXRpb24pIHtcbiAgICByZXR1cm4gb3JpZ2luYWxDcm9zc2JhckZpcmUuY2FsbCh0aGlzLCBub3RpZmljYXRpb24pO1xuICB9XG59XG4iLCJleHBvcnQgZnVuY3Rpb24gd3JhcEZhc3RSZW5kZXIgKCkge1xuICBNZXRlb3Iuc3RhcnR1cCgoKSA9PiB7XG4gICAgaWYgKFBhY2thZ2VbJ3N0YXJpbmdhdGxpZ2h0czpmYXN0LXJlbmRlciddKSB7XG4gICAgICBjb25zdCBGYXN0UmVuZGVyID0gUGFja2FnZVsnc3RhcmluZ2F0bGlnaHRzOmZhc3QtcmVuZGVyJ10uRmFzdFJlbmRlcjtcblxuICAgICAgLy8gRmxvdyBSb3V0ZXIgZG9lc24ndCBjYWxsIEZhc3RSZW5kZXIucm91dGUgdW50aWwgYWZ0ZXIgYWxsXG4gICAgICAvLyBNZXRlb3Iuc3RhcnR1cCBjYWxsYmFja3MgZmluaXNoXG4gICAgICBsZXQgb3JpZ1JvdXRlID0gRmFzdFJlbmRlci5yb3V0ZVxuICAgICAgRmFzdFJlbmRlci5yb3V0ZSA9IGZ1bmN0aW9uIChwYXRoLCBfY2FsbGJhY2spIHtcbiAgICAgICAgbGV0IGNhbGxiYWNrID0gZnVuY3Rpb24gKCkge1xuICAgICAgICAgIGNvbnN0IGluZm8gPSBLYWRpcmEuX2dldEluZm8oKVxuICAgICAgICAgIGlmIChpbmZvKSB7XG4gICAgICAgICAgICBpbmZvLnN1Z2dlc3RlZFJvdXRlTmFtZSA9IHBhdGhcbiAgICAgICAgICB9XG5cbiAgICAgICAgICByZXR1cm4gX2NhbGxiYWNrLmFwcGx5KHRoaXMsIGFyZ3VtZW50cylcbiAgICAgICAgfVxuXG4gICAgICAgIHJldHVybiBvcmlnUm91dGUuY2FsbChGYXN0UmVuZGVyLCBwYXRoLCBjYWxsYmFjaylcbiAgICAgIH1cbiAgICB9XG4gIH0pO1xufVxuIiwiaW1wb3J0IGZzIGZyb20gJ2ZzJztcbmNvbnN0IEZpYmVycyA9IHJlcXVpcmUoJ2ZpYmVycycpO1xuXG5mdW5jdGlvbiB3cmFwQ2FsbGJhY2soYXJncywgY3JlYXRlV3JhcHBlcikge1xuICBpZiAodHlwZW9mIGFyZ3NbYXJncy5sZW5ndGggLSAxXSA9PT0gJ2Z1bmN0aW9uJykge1xuICAgIGFyZ3NbYXJncy5sZW5ndGggLSAxXSA9IGNyZWF0ZVdyYXBwZXIoYXJnc1thcmdzLmxlbmd0aCAtIDFdKVxuICB9XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBoYW5kbGVFcnJvckV2ZW50KGV2ZW50RW1pdHRlciwgdHJhY2UsIGV2ZW50KSB7XG4gIGZ1bmN0aW9uIGhhbmRsZXIgKGVycm9yKSB7XG4gICAgaWYgKHRyYWNlICYmIGV2ZW50KSB7XG4gICAgICBLYWRpcmEudHJhY2VyLmV2ZW50RW5kKHRyYWNlLCBldmVudCwge1xuICAgICAgICBlcnJvcjogZXJyb3JcbiAgICAgIH0pO1xuICAgIH1cblxuICAgIC8vIE5vZGUgdGhyb3dzIHRoZSBlcnJvciBpZiB0aGVyZSBhcmUgbm8gbGlzdGVuZXJzXG4gICAgLy8gV2Ugd2FudCBpdCB0byBiZWhhdmUgYXMgaWYgd2UgYXJlIG5vdCBsaXN0ZW5pbmcgdG8gaXRcbiAgICBpZiAoZXZlbnRFbWl0dGVyLmxpc3RlbmVyQ291bnQoJ2Vycm9yJykgPT09IDEpIHtcbiAgICAgIGV2ZW50RW1pdHRlci5yZW1vdmVMaXN0ZW5lcignZXJyb3InLCBoYW5kbGVyKTtcbiAgICAgIGV2ZW50RW1pdHRlci5lbWl0KCdlcnJvcicsIGVycm9yKTtcbiAgICB9XG4gIH1cblxuICBldmVudEVtaXR0ZXIub24oJ2Vycm9yJywgaGFuZGxlcik7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiB3cmFwRnMoKSB7XG4gIC8vIFNvbWUgbnBtIHBhY2thZ2VzIHdpbGwgZG8gZnMgY2FsbHMgaW4gdGhlXG4gIC8vIGNhbGxiYWNrIG9mIGFub3RoZXIgZnMgY2FsbC5cbiAgLy8gVGhpcyB2YXJpYWJsZSBpcyBzZXQgd2l0aCB0aGUga2FkaXJhSW5mbyB3aGlsZVxuICAvLyBhIGNhbGxiYWNrIGlzIHJ1biBzbyB3ZSBjYW4gdHJhY2sgb3RoZXIgZnMgY2FsbHNcbiAgbGV0IGZzS2FkaXJhSW5mbyA9IG51bGw7XG4gIFxuICBsZXQgb3JpZ2luYWxTdGF0ID0gZnMuc3RhdDtcbiAgZnMuc3RhdCA9IGZ1bmN0aW9uICgpIHtcbiAgICBjb25zdCBrYWRpcmFJbmZvID0gS2FkaXJhLl9nZXRJbmZvKCkgfHwgZnNLYWRpcmFJbmZvO1xuXG4gICAgaWYgKGthZGlyYUluZm8pIHtcbiAgICAgIGxldCBldmVudCA9IEthZGlyYS50cmFjZXIuZXZlbnQoa2FkaXJhSW5mby50cmFjZSwgJ2ZzJywge1xuICAgICAgICBmdW5jOiAnc3RhdCcsXG4gICAgICAgIHBhdGg6IGFyZ3VtZW50c1swXSxcbiAgICAgICAgb3B0aW9uczogdHlwZW9mIGFyZ3VtZW50c1sxXSA9PT0gJ29iamVjdCcgPyBhcmd1bWVudHNbMV0gOiB1bmRlZmluZWRcbiAgICAgIH0pO1xuXG4gICAgICB3cmFwQ2FsbGJhY2soYXJndW1lbnRzLCAoY2IpID0+IHtcbiAgICAgICAgcmV0dXJuIGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICBLYWRpcmEudHJhY2VyLmV2ZW50RW5kKGthZGlyYUluZm8udHJhY2UsIGV2ZW50KTtcblxuICAgICAgICAgIGlmICghRmliZXJzLmN1cnJlbnQpIHtcbiAgICAgICAgICAgIGZzS2FkaXJhSW5mbyA9IGthZGlyYUluZm87XG4gICAgICAgICAgfVxuXG4gICAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgIGNiLmFwcGx5KG51bGwsIGFyZ3VtZW50cylcbiAgICAgICAgICB9IGZpbmFsbHkge1xuICAgICAgICAgICAgZnNLYWRpcmFJbmZvID0gbnVsbDtcbiAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgIH0pO1xuICAgIH1cblxuICAgIHJldHVybiBvcmlnaW5hbFN0YXQuYXBwbHkoZnMsIGFyZ3VtZW50cyk7XG4gIH07XG5cbiAgbGV0IG9yaWdpbmFsQ3JlYXRlUmVhZFN0cmVhbSA9IGZzLmNyZWF0ZVJlYWRTdHJlYW07XG4gIGZzLmNyZWF0ZVJlYWRTdHJlYW0gPSBmdW5jdGlvbiAoKSB7XG4gICAgY29uc3Qga2FkaXJhSW5mbyA9IEthZGlyYS5fZ2V0SW5mbygpIHx8IGZzS2FkaXJhSW5mbztcbiAgICBsZXQgc3RyZWFtID0gb3JpZ2luYWxDcmVhdGVSZWFkU3RyZWFtLmFwcGx5KHRoaXMsIGFyZ3VtZW50cyk7XG5cbiAgICBpZiAoa2FkaXJhSW5mbykge1xuICAgICAgY29uc3QgZXZlbnQgPSBLYWRpcmEudHJhY2VyLmV2ZW50KGthZGlyYUluZm8udHJhY2UsICdmcycsIHtcbiAgICAgICAgZnVuYzogJ2NyZWF0ZVJlYWRTdHJlYW0nLFxuICAgICAgICBwYXRoOiBhcmd1bWVudHNbMF0sXG4gICAgICAgIG9wdGlvbnM6IEpTT04uc3RyaW5naWZ5KGFyZ3VtZW50c1sxXSlcbiAgICAgIH0pO1xuXG4gICAgICBzdHJlYW0ub24oJ2VuZCcsICgpID0+IHtcbiAgICAgICAgS2FkaXJhLnRyYWNlci5ldmVudEVuZChrYWRpcmFJbmZvLnRyYWNlLCBldmVudCk7XG4gICAgICB9KTtcblxuICAgICAgaGFuZGxlRXJyb3JFdmVudChzdHJlYW0sIGthZGlyYUluZm8udHJhY2UsIGV2ZW50KTtcbiAgICB9XG5cbiAgICByZXR1cm4gc3RyZWFtO1xuICB9O1xufVxuIiwibGV0IFBlcmZvcm1hbmNlT2JzZXJ2ZXI7XG5sZXQgY29uc3RhbnRzO1xuXG50cnkge1xuICAvLyBPbmx5IGF2YWlsYWJsZSBpbiBOb2RlIDguNSBhbmQgbmV3ZXJcbiAgKHtcbiAgICBQZXJmb3JtYW5jZU9ic2VydmVyLFxuICAgIGNvbnN0YW50c1xuICB9ID0gcmVxdWlyZSgncGVyZl9ob29rcycpKTtcbn0gY2F0Y2ggKGUpIHt9XG5cbmV4cG9ydCBkZWZhdWx0IGNsYXNzIEdDTWV0cmljcyB7XG4gIGNvbnN0cnVjdG9yKCkge1xuICAgIHRoaXMuX29ic2VydmVyID0gbnVsbDtcbiAgICB0aGlzLnN0YXJ0ZWQgPSBmYWxzZTtcbiAgICB0aGlzLm1ldHJpY3MgPSB7fTtcblxuICAgIHRoaXMucmVzZXQoKTtcbiAgfVxuXG4gIHN0YXJ0KCkge1xuICAgIGlmICh0aGlzLnN0YXJ0ZWQpIHtcbiAgICAgIHJldHVybiBmYWxzZTtcbiAgICB9XG5cbiAgICBpZiAoIVBlcmZvcm1hbmNlT2JzZXJ2ZXIgfHwgIWNvbnN0YW50cykge1xuICAgICAgLy8gVGhlIG5vZGUgdmVyc2lvbiBpcyB0b28gb2xkIHRvIGhhdmUgUGVyZm9ybWFuY2VPYnNlcnZlclxuICAgICAgcmV0dXJuIGZhbHNlO1xuICAgIH1cblxuICAgIHRoaXMuc3RhcnRlZCA9IHRydWU7XG5cbiAgICB0aGlzLm9ic2VydmVyID0gbmV3IFBlcmZvcm1hbmNlT2JzZXJ2ZXIobGlzdCA9PiB7XG4gICAgICBsaXN0LmdldEVudHJpZXMoKS5mb3JFYWNoKGVudHJ5ID0+IHtcbiAgICAgICAgbGV0IG1ldHJpYyA9IHRoaXMuX21hcEtpbmRUb01ldHJpYyhlbnRyeS5raW5kKTtcbiAgICAgICAgdGhpcy5tZXRyaWNzW21ldHJpY10gKz0gZW50cnkuZHVyYXRpb247XG4gICAgICB9KTtcbiAgICB9KTtcbiAgICB0aGlzLm9ic2VydmVyLm9ic2VydmUoeyBlbnRyeVR5cGVzOiBbJ2djJ10sIGJ1ZmZlcmVkOiBmYWxzZSB9KTtcbiAgfVxuXG4gIF9tYXBLaW5kVG9NZXRyaWMoZ2NLaW5kKSB7XG4gICAgc3dpdGNoKGdjS2luZCkge1xuICAgICAgY2FzZSBjb25zdGFudHMuTk9ERV9QRVJGT1JNQU5DRV9HQ19NQUpPUjpcbiAgICAgICAgcmV0dXJuICdnY01ham9yJztcbiAgICAgIGNhc2UgY29uc3RhbnRzLk5PREVfUEVSRk9STUFOQ0VfR0NfTUlOT1I6XG4gICAgICAgIHJldHVybiAnZ2NNaW5vcic7XG4gICAgICBjYXNlIGNvbnN0YW50cy5OT0RFX1BFUkZPUk1BTkNFX0dDX0lOQ1JFTUVOVEFMOlxuICAgICAgICByZXR1cm4gJ2djSW5jcmVtZW50YWwnO1xuICAgICAgY2FzZSBjb25zdGFudHMuTk9ERV9QRVJGT1JNQU5DRV9HQ19XRUFLQ0I6XG4gICAgICAgIHJldHVybiAnZ2NXZWFrQ0InO1xuICAgICAgZGVmYXVsdDpcbiAgICAgICAgY29uc29sZS5sb2coYE1vbnRpIEFQTTogVW5yZWNvZ25pemVkIEdDIEtpbmQ6ICR7Z2NLaW5kfWApO1xuICAgIH1cbiAgfVxuXG4gIHJlc2V0KCkge1xuICAgIHRoaXMubWV0cmljcyA9IHtcbiAgICAgIGdjTWFqb3I6IDAsXG4gICAgICBnY01pbm9yOiAwLFxuICAgICAgZ2NJbmNyZW1lbnRhbDogMCxcbiAgICAgIGdjV2Vha0NCOiAwXG4gICAgfTtcbiAgfVxufVxuIiwidmFyIGNsaWVudDtcbnZhciBzZXJ2ZXJTdGF0dXMgPSBPYmplY3QuY3JlYXRlKG51bGwpO1xuXG52YXIgb3RoZXJDaGVja291dHMgPSAwO1xuXG4vLyBUaGVzZSBtZXRyaWNzIGFyZSBvbmx5IGZvciB0aGUgbW9uZ28gcG9vbCBmb3IgdGhlIHByaW1hcnkgTW9uZ28gc2VydmVyXG52YXIgcHJpbWFyeUNoZWNrb3V0cyA9IDA7XG52YXIgdG90YWxDaGVja291dFRpbWUgPSAwO1xudmFyIG1heENoZWNrb3V0VGltZSA9IDA7XG52YXIgY3JlYXRlZCA9IDA7XG52YXIgbWVhc3VyZW1lbnRDb3VudCA9IDA7XG52YXIgcGVuZGluZ1RvdGFsID0gMDtcbnZhciBjaGVja2VkT3V0VG90YWwgPSAwO1xuXG5zZXRJbnRlcnZhbCgoKSA9PiB7XG4gIGxldCBzdGF0dXMgPSBnZXRTZXJ2ZXJTdGF0dXMoZ2V0UHJpbWFyeSgpLCB0cnVlKTtcblxuICBpZiAoc3RhdHVzKSB7XG4gICAgcGVuZGluZ1RvdGFsICs9IHN0YXR1cy5wZW5kaW5nLmxlbmd0aDtcbiAgICBjaGVja2VkT3V0VG90YWwgKz0gc3RhdHVzLmNoZWNrZWRPdXQuc2l6ZTtcbiAgICBtZWFzdXJlbWVudENvdW50ICs9IDE7XG4gIH1cbn0sIDEwMDApO1xuXG4vLyB0aGUgcG9vbCBkZWZhdWx0cyB0byAxMDAsIHRob3VnaCB1c3VhbGx5IHRoZSBkZWZhdWx0IGlzbid0IHVzZWRcbnZhciBERUZBVUxUX01BWF9QT09MX1NJWkUgPSAxMDA7XG5cbmZ1bmN0aW9uIGdldFBvb2xTaXplICgpIHtcbiAgaWYgKGNsaWVudCAmJiBjbGllbnQudG9wb2xvZ3kgJiYgY2xpZW50LnRvcG9sb2d5LnMgJiYgY2xpZW50LnRvcG9sb2d5LnMub3B0aW9ucykge1xuICAgIHJldHVybiBjbGllbnQudG9wb2xvZ3kucy5vcHRpb25zLm1heFBvb2xTaXplIHx8IERFRkFVTFRfTUFYX1BPT0xfU0laRTtcbiAgfVxuXG4gIHJldHVybiAwO1xufVxuXG5leHBvcnQgZnVuY3Rpb24gZ2V0TW9uZ29Ecml2ZXJTdGF0cyAoKSB7XG4gIHJldHVybiB7XG4gICAgcG9vbFNpemU6IGdldFBvb2xTaXplKCksXG4gICAgcHJpbWFyeUNoZWNrb3V0cyxcbiAgICBvdGhlckNoZWNrb3V0cyxcbiAgICBjaGVja291dFRpbWU6IHRvdGFsQ2hlY2tvdXRUaW1lLFxuICAgIG1heENoZWNrb3V0VGltZSxcbiAgICBwZW5kaW5nOiBwZW5kaW5nVG90YWwgLyBtZWFzdXJlbWVudENvdW50LFxuICAgIGNoZWNrZWRPdXQ6IGNoZWNrZWRPdXRUb3RhbCAvIG1lYXN1cmVtZW50Q291bnQsXG4gICAgY3JlYXRlZFxuICB9O1xufTtcblxuZXhwb3J0IGZ1bmN0aW9uIHJlc2V0TW9uZ29Ecml2ZXJTdGF0cygpIHtcbiAgcHJpbWFyeUNoZWNrb3V0cyA9IDA7XG4gIG90aGVyQ2hlY2tvdXRzID0gMDtcbiAgdG90YWxDaGVja291dFRpbWUgPSAwO1xuICBtYXhDaGVja291dFRpbWUgPSAwO1xuICBwZW5kaW5nVG90YWwgPSAwO1xuICBjaGVja2VkT3V0VG90YWwgPSAwO1xuICBtZWFzdXJlbWVudENvdW50ID0gMDtcbiAgcHJpbWFyeUNoZWNrb3V0cyA9IDA7XG4gIGNyZWF0ZWQgPSAwO1xufVxuXG5NZXRlb3Iuc3RhcnR1cCgoKSA9PiB7XG4gIGxldCBfY2xpZW50ID0gTW9uZ29JbnRlcm5hbHMuZGVmYXVsdFJlbW90ZUNvbGxlY3Rpb25Ecml2ZXIoKS5tb25nby5jbGllbnQ7XG5cbiAgaWYgKCFfY2xpZW50IHx8ICFfY2xpZW50LnMpIHtcbiAgICAvLyBPbGQgdmVyc2lvbiBvZiBhZ2VudFxuICAgIHJldHVybjtcbiAgfVxuXG4gIGxldCBvcHRpb25zID0gX2NsaWVudC5zLm9wdGlvbnM7XG4gIGlmICghb3B0aW9ucyB8fCAhb3B0aW9ucy51c2VVbmlmaWVkVG9wb2xvZ3kpIHtcbiAgICAvLyBDTUFQIGFuZCB0b3BvbG9neSBtb25pdG9yaW5nIHJlcXVpcmVzIHVzZVVuaWZpZWRUb3BvbG9neVxuICAgIHJldHVybjtcbiAgfVxuXG4gIGNsaWVudCA9IF9jbGllbnQ7XG5cbiAgLy8gR2V0IHRoZSBudW1iZXIgb2YgY29ubmVjdGlvbnMgYWxyZWFkeSBjcmVhdGVkXG4gIGxldCBwcmltYXJ5RGVzY3JpcHRpb24gPSBnZXRTZXJ2ZXJEZXNjcmlwdGlvbihnZXRQcmltYXJ5KCkpO1xuICBpZiAocHJpbWFyeURlc2NyaXB0aW9uICYmIHByaW1hcnlEZXNjcmlwdGlvbi5zICYmIHByaW1hcnlEZXNjcmlwdGlvbi5zLnBvb2wpIHtcbiAgICBsZXQgcG9vbCA9IHByaW1hcnlEZXNjcmlwdGlvbi5zLnBvb2w7XG4gICAgbGV0IHRvdGFsQ29ubmVjdGlvbnMgPSBwb29sLnRvdGFsQ29ubmVjdGlvbkNvdW50O1xuICAgIGxldCBhdmFpbGFibGVDb25uZWN0aW9ucyA9IHBvb2wuYXZhaWxhYmxlQ29ubmVjdGlvbkNvdW50O1xuXG4gICAgLy8gdG90YWxDb25uZWN0aW9uQ291bnQgY291bnRzIGF2YWlsYWJsZSBjb25uZWN0aW9ucyB0d2ljZVxuICAgIGNyZWF0ZWQgKz0gdG90YWxDb25uZWN0aW9ucyAtIGF2YWlsYWJsZUNvbm5lY3Rpb25zO1xuICB9XG5cbiAgY2xpZW50Lm9uKCdjb25uZWN0aW9uQ3JlYXRlZCcsIGV2ZW50ID0+IHtcbiAgICBsZXQgcHJpbWFyeSA9IGdldFByaW1hcnkoKTtcbiAgICBpZiAocHJpbWFyeSA9PT0gZXZlbnQuYWRkcmVzcykge1xuICAgICAgY3JlYXRlZCArPSAxO1xuICAgIH1cbiAgfSk7XG5cbiAgY2xpZW50Lm9uKCdjb25uZWN0aW9uQ2xvc2VkJywgZXZlbnQgPT4ge1xuICAgIGxldCBzdGF0dXMgPSBnZXRTZXJ2ZXJTdGF0dXMoZXZlbnQuYWRkcmVzcywgdHJ1ZSk7XG4gICAgaWYgKHN0YXR1cykge1xuICAgICAgc3RhdHVzLmNoZWNrZWRPdXQuZGVsZXRlKGV2ZW50LmNvbm5lY3Rpb25JZCk7XG4gICAgfVxuICB9KTtcblxuICBjbGllbnQub24oJ2Nvbm5lY3Rpb25DaGVja091dFN0YXJ0ZWQnLCBldmVudCA9PiB7XG4gICAgbGV0IHN0YXR1cyA9IGdldFNlcnZlclN0YXR1cyhldmVudC5hZGRyZXNzKTtcbiAgICBzdGF0dXMucGVuZGluZy5wdXNoKGV2ZW50LnRpbWUpO1xuICB9KTtcblxuICBjbGllbnQub24oJ2Nvbm5lY3Rpb25DaGVja091dEZhaWxlZCcsIGV2ZW50ID0+IHtcbiAgICBsZXQgc3RhdHVzID0gZ2V0U2VydmVyU3RhdHVzKGV2ZW50LmFkZHJlc3MsIHRydWUpO1xuICAgIGlmIChzdGF0dXMpIHtcbiAgICAgIHN0YXR1cy5wZW5kaW5nLnNoaWZ0KCk7XG4gICAgfVxuICB9KTtcblxuICBjbGllbnQub24oJ2Nvbm5lY3Rpb25DaGVja2VkT3V0JywgZXZlbnQgPT4ge1xuICAgIGxldCBzdGF0dXMgPSBnZXRTZXJ2ZXJTdGF0dXMoZXZlbnQuYWRkcmVzcyk7XG4gICAgbGV0IHN0YXJ0ID0gc3RhdHVzLnBlbmRpbmcuc2hpZnQoKTtcbiAgICBsZXQgcHJpbWFyeSA9IGdldFByaW1hcnkoKTtcblxuICAgIGlmIChzdGFydCAmJiBwcmltYXJ5ID09PSBldmVudC5hZGRyZXNzKSB7XG4gICAgICBsZXQgY2hlY2tvdXREdXJhdGlvbiA9IGV2ZW50LnRpbWUuZ2V0VGltZSgpIC0gc3RhcnQuZ2V0VGltZSgpO1xuXG4gICAgICBwcmltYXJ5Q2hlY2tvdXRzICs9IDE7XG4gICAgICB0b3RhbENoZWNrb3V0VGltZSArPSBjaGVja291dER1cmF0aW9uO1xuICAgICAgaWYgKGNoZWNrb3V0RHVyYXRpb24gPiBtYXhDaGVja291dFRpbWUpIHtcbiAgICAgICAgbWF4Q2hlY2tvdXRUaW1lID0gY2hlY2tvdXREdXJhdGlvbjtcbiAgICAgIH1cbiAgICB9IGVsc2Uge1xuICAgICAgb3RoZXJDaGVja291dHMgKz0gMTtcbiAgICB9XG5cbiAgICBzdGF0dXMuY2hlY2tlZE91dC5hZGQoZXZlbnQuY29ubmVjdGlvbklkKTtcbiAgfSk7XG5cbiAgY2xpZW50Lm9uKCdjb25uZWN0aW9uQ2hlY2tlZEluJywgZXZlbnQgPT4ge1xuICAgIGxldCBzdGF0dXMgPSBnZXRTZXJ2ZXJTdGF0dXMoZXZlbnQuYWRkcmVzcywgdHJ1ZSk7XG4gICAgaWYgKHN0YXR1cykge1xuICAgICAgc3RhdHVzLmNoZWNrZWRPdXQuZGVsZXRlKGV2ZW50LmNvbm5lY3Rpb25JZCk7XG4gICAgfVxuICB9KTtcblxuICBjbGllbnQub24oJ3NlcnZlckNsb3NlZCcsIGZ1bmN0aW9uIChldmVudCkge1xuICAgIGRlbGV0ZSBzZXJ2ZXJTdGF0dXNbZXZlbnQuYWRkcmVzc107XG4gIH0pO1xufSk7XG5cbmZ1bmN0aW9uIGdldFNlcnZlclN0YXR1cyhhZGRyZXNzLCBkaXNhYmxlQ3JlYXRlKSB7XG4gIGlmICh0eXBlb2YgYWRkcmVzcyAhPT0gJ3N0cmluZycpIHtcbiAgICByZXR1cm4gbnVsbDtcbiAgfVxuXG4gIGlmIChhZGRyZXNzIGluIHNlcnZlclN0YXR1cykge1xuICAgIHJldHVybiBzZXJ2ZXJTdGF0dXNbYWRkcmVzc107XG4gIH1cblxuICBpZiAoZGlzYWJsZUNyZWF0ZSkge1xuICAgIHJldHVybiBudWxsO1xuICB9XG5cbiAgc2VydmVyU3RhdHVzW2FkZHJlc3NdID0ge1xuICAgIHBlbmRpbmc6IFtdLFxuICAgIGNoZWNrZWRPdXQ6IG5ldyBTZXQoKSxcbiAgfVxuXG4gIHJldHVybiBzZXJ2ZXJTdGF0dXNbYWRkcmVzc107XG59XG5cbmZ1bmN0aW9uIGdldFByaW1hcnkoKSB7XG4gIGlmICghY2xpZW50IHx8ICFjbGllbnQudG9wb2xvZ3kpIHtcbiAgICByZXR1cm4gbnVsbDtcbiAgfVxuXG4gIGxldCBzZXJ2ZXIgPSBjbGllbnQudG9wb2xvZ3kubGFzdElzTWFzdGVyKCk7XG5cbiAgaWYgKHNlcnZlci50eXBlID09PSAnU3RhbmRhbG9uZScpIHtcbiAgICByZXR1cm4gc2VydmVyLmFkZHJlc3M7XG4gIH1cblxuICBpZiAoIXNlcnZlciB8fCAhc2VydmVyLnByaW1hcnkpIHtcbiAgICByZXR1cm4gbnVsbDtcbiAgfVxuXG4gIHJldHVybiBzZXJ2ZXIucHJpbWFyeTtcbn1cblxuZnVuY3Rpb24gZ2V0U2VydmVyRGVzY3JpcHRpb24oYWRkcmVzcykge1xuICBpZiAoIWNsaWVudCB8fCAhY2xpZW50LnRvcG9sb2d5IHx8ICFjbGllbnQudG9wb2xvZ3kucyB8fCAhY2xpZW50LnRvcG9sb2d5LnMuc2VydmVycykge1xuICAgIHJldHVybiBudWxsO1xuICB9XG4gIGxldCBkZXNjcmlwdGlvbiA9IGNsaWVudC50b3BvbG9neS5zLnNlcnZlcnMuZ2V0KGFkZHJlc3MpO1xuXG4gIHJldHVybiBkZXNjcmlwdGlvbiB8fCBudWxsO1xufVxuIiwiaW1wb3J0IEZpYmVyIGZyb20gXCJmaWJlcnNcIjtcblxuZXhwb3J0IGZ1bmN0aW9uIHdyYXBQaWNrZXIgKCkge1xuICBNZXRlb3Iuc3RhcnR1cCgoKSA9PiB7XG4gICAgaWYgKCFQYWNrYWdlWydtZXRlb3JoYWNrczpwaWNrZXInXSkge1xuICAgICAgcmV0dXJuO1xuICAgIH1cblxuICAgIGNvbnN0IFBpY2tlciA9IFBhY2thZ2VbJ21ldGVvcmhhY2tzOnBpY2tlciddLlBpY2tlcjtcblxuICAgIC8vIFdyYXAgUGlja2VyLl9wcm9jZXNzUm91dGUgdG8gbWFrZSBzdXJlIGl0IHJ1bnMgdGhlXG4gICAgLy8gaGFuZGxlciBpbiBhIEZpYmVyIHdpdGggX19rYWRpcmFJbmZvIHNldFxuICAgIC8vIE5lZWRlZCBpZiBhbnkgcHJldmlvdXMgbWlkZGxld2FyZSBjYWxsZWQgYG5leHRgIG91dHNpZGUgb2YgYSBmaWJlci5cbiAgICBjb25zdCBvcmlnUHJvY2Vzc1JvdXRlID0gUGlja2VyLmNvbnN0cnVjdG9yLnByb3RvdHlwZS5fcHJvY2Vzc1JvdXRlO1xuICAgIFBpY2tlci5jb25zdHJ1Y3Rvci5wcm90b3R5cGUuX3Byb2Nlc3NSb3V0ZSA9IGZ1bmN0aW9uIChjYWxsYmFjaywgcGFyYW1zLCByZXEpIHtcbiAgICAgIGNvbnN0IGFyZ3MgPSBhcmd1bWVudHM7XG5cbiAgICAgIGlmICghRmliZXIuY3VycmVudCkge1xuICAgICAgICByZXR1cm4gbmV3IEZpYmVyKCgpID0+IHtcbiAgICAgICAgICBLYWRpcmEuX3NldEluZm8ocmVxLl9fa2FkaXJhSW5mbylcbiAgICAgICAgICByZXR1cm4gb3JpZ1Byb2Nlc3NSb3V0ZS5hcHBseSh0aGlzLCBhcmdzKTtcbiAgICAgICAgfSkucnVuKCk7XG4gICAgICB9XG4gICAgICBcbiAgICAgIGlmIChyZXEuX19rYWRpcmFJbmZvKSB7XG4gICAgICAgIEthZGlyYS5fc2V0SW5mbyhyZXEuX19rYWRpcmFJbmZvKTtcbiAgICAgIH1cblxuICAgICAgcmV0dXJuIG9yaWdQcm9jZXNzUm91dGUuYXBwbHkodGhpcywgYXJncyk7XG4gICAgfTtcbiAgfSk7XG59XG4iLCJpbXBvcnQgRmliZXJzIGZyb20gJ2ZpYmVycyc7XG5cbmV4cG9ydCBmdW5jdGlvbiB3cmFwUm91dGVycyAoKSB7XG4gIGxldCBjb25uZWN0Um91dGVzID0gW11cbiAgdHJ5IHtcbiAgICBjb25uZWN0Um91dGVzLnB1c2gocmVxdWlyZSgnY29ubmVjdC1yb3V0ZScpKTtcbiAgfSBjYXRjaCAoZSkge1xuICAgIC8vIFdlIGNhbiBpZ25vcmUgZXJyb3JzXG4gIH1cblxuICB0cnkge1xuICAgIGlmIChQYWNrYWdlWydzaW1wbGU6anNvbi1yb3V0ZXMnXSkge1xuICAgICAgLy8gUmVsYXRpdmUgZnJvbSAubnBtL25vZGVfbW9kdWxlcy9tZXRlb3IvbW9udGlhcG1fYWdlbnQvbm9kZV9tb2R1bGVzXG4gICAgICAvLyBOcG0ucmVxdWlyZSBpcyBsZXNzIHN0cmljdCBvbiB3aGF0IHBhdGhzIHlvdSB1c2UgdGhhbiByZXF1aXJlXG4gICAgICBjb25uZWN0Um91dGVzLnB1c2goTnBtLnJlcXVpcmUoJy4uLy4uL3NpbXBsZV9qc29uLXJvdXRlcy9ub2RlX21vZHVsZXMvY29ubmVjdC1yb3V0ZScpKTtcbiAgICB9XG4gIH0gY2F0Y2ggKGUpIHtcbiAgICAgLy8gd2UgY2FuIGlnbm9yZSBlcnJvcnNcbiAgfVxuXG4gIGNvbm5lY3RSb3V0ZXMuZm9yRWFjaChjb25uZWN0Um91dGUgPT4ge1xuICAgIGlmICh0eXBlb2YgY29ubmVjdFJvdXRlICE9PSAnZnVuY3Rpb24nKSB7XG4gICAgICByZXR1cm47XG4gICAgfVxuICBcbiAgICBjb25uZWN0Um91dGUoKHJvdXRlcikgPT4ge1xuICAgICAgY29uc3Qgb2xkQWRkID0gcm91dGVyLmNvbnN0cnVjdG9yLnByb3RvdHlwZS5hZGQ7XG4gICAgICByb3V0ZXIuY29uc3RydWN0b3IucHJvdG90eXBlLmFkZCA9IGZ1bmN0aW9uIChtZXRob2QsIHJvdXRlLCBoYW5kbGVyKSB7XG4gICAgICAgIC8vIFVubGlrZSBtb3N0IHJvdXRlcnMsIGNvbm5lY3Qtcm91dGUgZG9lc24ndCBsb29rIGF0IHRoZSBhcmd1bWVudHMgbGVuZ3RoXG4gICAgICAgIG9sZEFkZC5jYWxsKHRoaXMsIG1ldGhvZCwgcm91dGUsIGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICBpZiAoYXJndW1lbnRzWzBdICYmIGFyZ3VtZW50c1swXS5fX2thZGlyYUluZm8pIHtcbiAgICAgICAgICAgIGFyZ3VtZW50c1swXS5fX2thZGlyYUluZm8uc3VnZ2VzdGVkUm91dGVOYW1lID0gcm91dGU7XG4gICAgICAgICAgfVxuXG4gICAgICAgICAgaGFuZGxlci5hcHBseShudWxsLCBhcmd1bWVudHMpXG4gICAgICAgIH0pO1xuICAgICAgfVxuICAgIH0pO1xuICB9KVxufVxuIiwiaW1wb3J0IHsgV2ViQXBwSW50ZXJuYWxzLCBXZWJBcHAgfSBmcm9tICdtZXRlb3Ivd2ViYXBwJztcbmltcG9ydCBGaWJlcnMgZnJvbSAnZmliZXJzJztcblxuLy8gTWF4aW11bSBjb250ZW50LWxlbmd0aCBzaXplXG5NQVhfQk9EWV9TSVpFID0gODAwMFxuLy8gTWF4aW11bSBjaGFyYWN0ZXJzIGZvciBzdHJpbmdpZmllZCBib2R5XG5NQVhfU1RSSU5HSUZJRURfQk9EWV9TSVpFID0gNDAwMFxuXG5jb25zdCBjYW5XcmFwU3RhdGljSGFuZGxlciA9ICEhV2ViQXBwSW50ZXJuYWxzLnN0YXRpY0ZpbGVzQnlBcmNoXG5cbi8vIFRoaXMgY2hlY2tzIGlmIHJ1bm5pbmcgb24gYSB2ZXJzaW9uIG9mIE1ldGVvciB0aGF0XG4vLyB3cmFwcyBjb25uZWN0IGhhbmRsZXJzIGluIGEgZmliZXIuXG4vLyBUaGlzIGNoZWNrIGlzIGRlcGVuZGFudCBvbiBNZXRlb3IncyBpbXBsZW1lbnRhdGlvbiBvZiBgdXNlYCxcbi8vIHdoaWNoIHdyYXBzIGV2ZXJ5IGhhbmRsZXIgaW4gYSBuZXcgZmliZXIuXG4vLyBUaGlzIHdpbGwgbmVlZCB0byBiZSB1cGRhdGVkIGlmIE1ldGVvciBzdGFydHMgcmV1c2luZ1xuLy8gZmliZXJzIHdoZW4gdGhleSBleGlzdC5cbmV4cG9ydCBmdW5jdGlvbiBjaGVja0hhbmRsZXJzSW5GaWJlciAoKSB7XG4gIGNvbnN0IGhhbmRsZXJzTGVuZ3RoID0gV2ViQXBwLnJhd0Nvbm5lY3RIYW5kbGVycy5zdGFjay5sZW5ndGg7XG4gIGxldCBpbkZpYmVyID0gZmFsc2U7XG4gIGxldCBvdXRzaWRlRmliZXIgPSBGaWJlcnMuY3VycmVudDtcblxuICBXZWJBcHAucmF3Q29ubmVjdEhhbmRsZXJzLnVzZSgoX3JlcSwgX3JlcywgbmV4dCkgPT4ge1xuICAgIGluRmliZXIgPSBGaWJlcnMuY3VycmVudCAmJiBGaWJlcnMuY3VycmVudCAhPT0gb3V0c2lkZUZpYmVyO1xuICAgIFxuICAgIC8vIGluIGNhc2Ugd2UgZGlkbid0IHN1Y2Nlc3NmdWxseSByZW1vdmUgdGhpcyBoYW5kbGVyXG4gICAgLy8gYW5kIGl0IGlzIGEgcmVhbCByZXF1ZXN0XG4gICAgbmV4dCgpO1xuICB9KTtcblxuICBpZiAoV2ViQXBwLnJhd0Nvbm5lY3RIYW5kbGVycy5zdGFja1toYW5kbGVyc0xlbmd0aF0pIHtcbiAgICBsZXQgaGFuZGxlciA9IFdlYkFwcC5yYXdDb25uZWN0SGFuZGxlcnMuc3RhY2tbaGFuZGxlcnNMZW5ndGhdLmhhbmRsZTtcblxuICAgIC8vIHJlbW92ZSB0aGUgbmV3bHkgYWRkZWQgaGFuZGxlclxuICAgIC8vIFdlIHJlbW92ZSBpdCBpbW1lZGlhdGVseSBzbyB0aGVyZSBpcyBubyBvcHBvcnR1bml0eSBmb3JcbiAgICAvLyBvdGhlciBjb2RlIHRvIGFkZCBoYW5kbGVycyBmaXJzdCBpZiB0aGUgY3VycmVudCBmaWJlciBpcyB5aWVsZGVkXG4gICAgLy8gd2hpbGUgcnVubmluZyB0aGUgaGFuZGxlclxuICAgIHdoaWxlIChXZWJBcHAucmF3Q29ubmVjdEhhbmRsZXJzLnN0YWNrLmxlbmd0aCA+IGhhbmRsZXJzTGVuZ3RoKSB7XG4gICAgICBXZWJBcHAucmF3Q29ubmVjdEhhbmRsZXJzLnN0YWNrLnBvcCgpO1xuICAgIH1cblxuICAgIGhhbmRsZXIoe30sIHt9LCAoKSA9PiB7fSlcbiAgfVxuXG4gIHJldHVybiBpbkZpYmVyO1xufVxuXG5jb25zdCBJbmZvU3ltYm9sID0gU3ltYm9sKClcblxuZXhwb3J0IGFzeW5jIGZ1bmN0aW9uIHdyYXBXZWJBcHAoKSB7XG4gIGlmICghY2hlY2tIYW5kbGVyc0luRmliZXIoKSB8fCAhY2FuV3JhcFN0YXRpY0hhbmRsZXIpIHtcbiAgICByZXR1cm47XG4gIH1cblxuICBjb25zdCBwYXJzZVVybCA9IHJlcXVpcmUoJ3BhcnNldXJsJyk7XG5cbiAgV2ViQXBwSW50ZXJuYWxzLnJlZ2lzdGVyQm9pbGVycGxhdGVEYXRhQ2FsbGJhY2soJ19fbW9udGlBcG1Sb3V0ZU5hbWUnLCBmdW5jdGlvbiAocmVxdWVzdCkge1xuICAgIC8vIFRPRE86IHJlY29yZCBpbiB0cmFjZSB3aGljaCBhcmNoIGlzIHVzZWRcblxuICAgIGlmIChyZXF1ZXN0W0luZm9TeW1ib2xdKSB7XG4gICAgICByZXF1ZXN0W0luZm9TeW1ib2xdLmlzQXBwUm91dGUgPSB0cnVlXG4gICAgfVxuXG4gICAgLy8gTGV0IFdlYkFwcCBrbm93IHdlIGRpZG4ndCBtYWtlIGNoYW5nZXNcbiAgICAvLyBzbyBpdCBjYW4gdXNlIGEgY2FjaGVcbiAgICByZXR1cm4gZmFsc2VcbiAgfSlcblxuICAvLyBXZSB3YW50IHRoZSByZXF1ZXN0IG9iamVjdCByZXR1cm5lZCBieSBjYXRlZ29yaXplUmVxdWVzdCB0byBoYXZlXG4gIC8vIF9fa2FkaXJhSW5mb1xuICBsZXQgb3JpZ0NhdGVnb3JpemVSZXF1ZXN0ID0gV2ViQXBwLmNhdGVnb3JpemVSZXF1ZXN0O1xuICBXZWJBcHAuY2F0ZWdvcml6ZVJlcXVlc3QgPSBmdW5jdGlvbiAocmVxKSB7XG4gICAgbGV0IHJlc3VsdCA9IG9yaWdDYXRlZ29yaXplUmVxdWVzdC5hcHBseSh0aGlzLCBhcmd1bWVudHMpO1xuXG4gICAgaWYgKHJlc3VsdCAmJiByZXEuX19rYWRpcmFJbmZvKSB7XG4gICAgICByZXN1bHRbSW5mb1N5bWJvbF0gPSByZXEuX19rYWRpcmFJbmZvO1xuICAgIH1cblxuICAgIHJldHVybiByZXN1bHQ7XG4gIH1cblxuICAvLyBBZGRpbmcgdGhlIGhhbmRsZXIgZGlyZWN0bHkgdG8gdGhlIHN0YWNrXG4gIC8vIHRvIGZvcmNlIGl0IHRvIGJlIHRoZSBmaXJzdCBvbmUgdG8gcnVuXG4gIFdlYkFwcC5yYXdDb25uZWN0SGFuZGxlcnMuc3RhY2sudW5zaGlmdCh7XG4gICAgcm91dGU6ICcnLFxuICAgIGhhbmRsZTogKHJlcSwgcmVzLCBuZXh0KSA9PiB7XG4gICAgY29uc3QgbmFtZSA9IHBhcnNlVXJsKHJlcSkucGF0aG5hbWU7XG4gICAgY29uc3QgdHJhY2UgPSBLYWRpcmEudHJhY2VyLnN0YXJ0KGAke3JlcS5tZXRob2R9LSR7bmFtZX1gLCAnaHR0cCcpO1xuXG4gICAgY29uc3QgaGVhZGVycyA9IEthZGlyYS50cmFjZXIuX2FwcGx5T2JqZWN0RmlsdGVycyhyZXEuaGVhZGVycyk7XG4gICAgS2FkaXJhLnRyYWNlci5ldmVudCh0cmFjZSwgJ3N0YXJ0Jywge1xuICAgICAgdXJsOiByZXEudXJsLFxuICAgICAgbWV0aG9kOiByZXEubWV0aG9kLFxuICAgICAgaGVhZGVyczogSlNPTi5zdHJpbmdpZnkoaGVhZGVycyksXG4gICAgfSk7XG4gICAgcmVxLl9fa2FkaXJhSW5mbyA9IHsgdHJhY2UgfTtcblxuICAgIHJlcy5vbignZmluaXNoJywgKCkgPT4ge1xuICAgICAgaWYgKHJlcS5fX2thZGlyYUluZm8uYXN5bmNFdmVudCkge1xuICAgICAgICBLYWRpcmEudHJhY2VyLmV2ZW50RW5kKHRyYWNlLCByZXEuX19rYWRpcmFJbmZvLmFzeW5jRXZlbnQpO1xuICAgICAgfVxuXG4gICAgICBLYWRpcmEudHJhY2VyLmVuZExhc3RFdmVudCh0cmFjZSk7XG5cbiAgICAgIGlmIChyZXEuX19rYWRpcmFJbmZvLmlzU3RhdGljKSB7XG4gICAgICAgIHRyYWNlLm5hbWUgPSBgJHtyZXEubWV0aG9kfS08c3RhdGljIGZpbGU+YFxuICAgICAgfSBlbHNlIGlmIChyZXEuX19rYWRpcmFJbmZvLnN1Z2dlc3RlZFJvdXRlTmFtZSkge1xuICAgICAgICB0cmFjZS5uYW1lID0gYCR7cmVxLm1ldGhvZH0tJHtyZXEuX19rYWRpcmFJbmZvLnN1Z2dlc3RlZFJvdXRlTmFtZX1gXG4gICAgICB9IGVsc2UgaWYgKHJlcS5fX2thZGlyYUluZm8uaXNBcHBSb3V0ZSkge1xuICAgICAgICB0cmFjZS5uYW1lID0gYCR7cmVxLm1ldGhvZH0tPGFwcD5gXG4gICAgICB9XG5cbiAgICAgIGNvbnN0IGlzSnNvbiA9IHJlcS5oZWFkZXJzWydjb250ZW50LXR5cGUnXSA9PT0gJ2FwcGxpY2F0aW9uL2pzb24nO1xuICAgICAgY29uc3QgaGFzU21hbGxCb2R5ID0gcmVxLmhlYWRlcnNbJ2NvbnRlbnQtbGVuZ3RoJ10gPiAwICYmIHJlcS5oZWFkZXJzWydjb250ZW50LWxlbmd0aCddIDwgTUFYX0JPRFlfU0laRVxuXG4gICAgICAvLyBDaGVjayBhZnRlciBhbGwgbWlkZGxld2FyZSBoYXZlIHJ1biB0byBzZWUgaWYgYW55IG9mIHRoZW1cbiAgICAgIC8vIHNldCByZXEuYm9keVxuICAgICAgLy8gVGVjaG5pY2FsbHkgYm9kaWVzIGNhbiBiZSB1c2VkIHdpdGggYW55IG1ldGhvZCwgYnV0IHNpbmNlIG1hbnkgbG9hZCBiYWxhbmNlcnMgYW5kXG4gICAgICAvLyBvdGhlciBzb2Z0d2FyZSBvbmx5IHN1cHBvcnQgYm9kaWVzIGZvciBQT1NUIHJlcXVlc3RzLCB3ZSBhcmVcbiAgICAgIC8vIG5vdCByZWNvcmRpbmcgdGhlIGJvZHkgZm9yIG90aGVyIG1ldGhvZHMuXG4gICAgICBpZiAocmVxLm1ldGhvZCA9PT0gJ1BPU1QnICYmIHJlcS5ib2R5ICYmIGlzSnNvbiAmJiBoYXNTbWFsbEJvZHkpIHtcbiAgICAgICAgdHJ5IHtcbiAgICAgICAgICBsZXQgYm9keSA9IEpTT04uc3RyaW5naWZ5KHJlcS5ib2R5KTtcblxuICAgICAgICAgIC8vIENoZWNrIHRoZSBib2R5IHNpemUgYWdhaW4gaW4gY2FzZSBpdCBpcyBtdWNoXG4gICAgICAgICAgLy8gbGFyZ2VyIHRoYW4gd2hhdCB3YXMgaW4gdGhlIGNvbnRlbnQtbGVuZ3RoIGhlYWRlclxuICAgICAgICAgIGlmIChib2R5Lmxlbmd0aCA8IE1BWF9TVFJJTkdJRklFRF9CT0RZX1NJWkUpIHtcbiAgICAgICAgICAgIHRyYWNlLmV2ZW50c1swXS5kYXRhLmJvZHkgPSBib2R5O1xuICAgICAgICAgIH1cbiAgICAgICAgfSBjYXRjaCAoZSkge1xuICAgICAgICAgIC8vIEl0IGlzIG9rYXkgaWYgdGhpcyBmYWlsc1xuICAgICAgICB9XG4gICAgICB9XG5cbiAgICAgIC8vIFRPRE86IHJlY29yZCBzdGF0dXMgY29kZVxuICAgICAgS2FkaXJhLnRyYWNlci5ldmVudCh0cmFjZSwgJ2NvbXBsZXRlJyk7XG4gICAgICBsZXQgYnVpbHQgPSBLYWRpcmEudHJhY2VyLmJ1aWxkVHJhY2UodHJhY2UpO1xuICAgICAgS2FkaXJhLm1vZGVscy5odHRwLnByb2Nlc3NSZXF1ZXN0KGJ1aWx0LCByZXEsIHJlcyk7XG4gICAgfSk7XG5cbiAgICBuZXh0KCk7XG4gIH1cbn0pO1xuXG5cbiAgZnVuY3Rpb24gd3JhcEhhbmRsZXIoaGFuZGxlcikge1xuICAgIC8vIGNvbm5lY3QgaWRlbnRpZmllcyBlcnJvciBoYW5kbGVzIGJ5IHRoZW0gYWNjZXB0aW5nXG4gICAgLy8gZm91ciBhcmd1bWVudHNcbiAgICBsZXQgZXJyb3JIYW5kbGVyID0gaGFuZGxlci5sZW5ndGggPT09IDQ7XG5cbiAgICBmdW5jdGlvbiB3cmFwcGVyKHJlcSwgcmVzLCBuZXh0KSB7XG4gICAgICBsZXQgZXJyb3I7XG4gICAgICBpZiAoZXJyb3JIYW5kbGVyKSB7XG4gICAgICAgIGVycm9yID0gcmVxO1xuICAgICAgICByZXEgPSByZXM7XG4gICAgICAgIHJlcyA9IG5leHQ7XG4gICAgICAgIG5leHQgPSBhcmd1bWVudHNbM11cbiAgICAgIH1cblxuICAgICAgY29uc3Qga2FkaXJhSW5mbyA9IHJlcS5fX2thZGlyYUluZm87XG4gICAgICBLYWRpcmEuX3NldEluZm8oa2FkaXJhSW5mbyk7XG5cbiAgICAgIGxldCBuZXh0Q2FsbGVkID0gZmFsc2U7XG4gICAgICAvLyBUT0RPOiB0cmFjayBlcnJvcnMgcGFzc2VkIHRvIG5leHQgb3IgdGhyb3duXG4gICAgICBmdW5jdGlvbiB3cmFwcGVkTmV4dCguLi5hcmdzKSB7XG4gICAgICAgIGlmIChrYWRpcmFJbmZvICYmIGthZGlyYUluZm8uYXN5bmNFdmVudCkge1xuICAgICAgICAgIEthZGlyYS50cmFjZXIuZXZlbnRFbmQocmVxLl9fa2FkaXJhSW5mby50cmFjZSwgcmVxLl9fa2FkaXJhSW5mby5hc3luY0V2ZW50KTtcbiAgICAgICAgICByZXEuX19rYWRpcmFJbmZvLmFzeW5jRXZlbnQgPSBudWxsO1xuICAgICAgICB9XG5cbiAgICAgICAgbmV4dENhbGxlZCA9IHRydWU7XG4gICAgICAgIG5leHQoLi4uYXJncylcbiAgICAgIH1cblxuICAgICAgbGV0IHBvdGVudGlhbFByb21pc2VcblxuICAgICAgaWYgKGVycm9ySGFuZGxlcikge1xuICAgICAgICBwb3RlbnRpYWxQcm9taXNlID0gaGFuZGxlci5jYWxsKHRoaXMsIGVycm9yLCByZXEsIHJlcywgd3JhcHBlZE5leHQpO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgcG90ZW50aWFsUHJvbWlzZSA9IGhhbmRsZXIuY2FsbCh0aGlzLCByZXEsIHJlcywgd3JhcHBlZE5leHQpO1xuICAgICAgfVxuXG4gICAgICBpZiAocG90ZW50aWFsUHJvbWlzZSAmJiB0eXBlb2YgcG90ZW50aWFsUHJvbWlzZS50aGVuID09PSAnZnVuY3Rpb24nKSB7XG4gICAgICAgIHBvdGVudGlhbFByb21pc2UudGhlbigoKSA9PiB7XG4gICAgICAgICAgLy8gcmVzLmZpbmlzaGVkIGlzIGRlcHJlY2lhdGVkIGluIE5vZGUgMTMsIGJ1dCBpdCBpcyB0aGUgb25seSBvcHRpb25cbiAgICAgICAgICAvLyBmb3IgTm9kZSAxMi45IGFuZCBvbGRlci5cbiAgICAgICAgICBpZiAoa2FkaXJhSW5mbyAmJiAhcmVzLmZpbmlzaGVkICYmICFuZXh0Q2FsbGVkKSB7XG4gICAgICAgICAgICBjb25zdCBsYXN0RXZlbnQgPSBLYWRpcmEudHJhY2VyLmdldExhc3RFdmVudChrYWRpcmFJbmZvLnRyYWNlKVxuICAgICAgICAgICAgaWYgKGxhc3RFdmVudC5lbmRBdCkge1xuICAgICAgICAgICAgICAvLyByZXEgaXMgbm90IGRvbmUsIGFuZCBuZXh0IGhhcyBub3QgYmVlbiBjYWxsZWRcbiAgICAgICAgICAgICAgLy8gY3JlYXRlIGFuIGFzeW5jIGV2ZW50IHRoYXQgd2lsbCBlbmQgd2hlbiBlaXRoZXIgb2YgdGhvc2UgaGFwcGVuc1xuICAgICAgICAgICAgICBrYWRpcmFJbmZvLmFzeW5jRXZlbnQgPSBLYWRpcmEudHJhY2VyLmV2ZW50KGthZGlyYUluZm8udHJhY2UsICdhc3luYycpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgIH1cbiAgICAgICAgfSk7XG4gICAgICB9XG5cbiAgICAgIHJldHVybiBwb3RlbnRpYWxQcm9taXNlO1xuICAgIH1cblxuICAgIGlmIChlcnJvckhhbmRsZXIpIHtcbiAgICAgIHJldHVybiBmdW5jdGlvbiAoZXJyb3IsIHJlcSwgcmVzLCBuZXh0KSB7XG4gICAgICAgIHJldHVybiB3cmFwcGVyKGVycm9yLCByZXEsIHJlcywgbmV4dCk7XG4gICAgICB9XG4gICAgfSBlbHNlIHtcbiAgICAgIHJldHVybiBmdW5jdGlvbiAocmVxLCByZXMsIG5leHQpIHtcbiAgICAgICAgcmV0dXJuIHdyYXBwZXIocmVxLCByZXMsIG5leHQpO1xuICAgICAgfVxuICAgIH1cbiAgfVxuXG4gIGZ1bmN0aW9uIHdyYXBDb25uZWN0KGFwcCwgd3JhcFN0YWNrKSB7XG4gICAgbGV0IG9sZFVzZSA9IGFwcC51c2U7XG4gICAgaWYgKHdyYXBTdGFjaykge1xuICAgICAgLy8gV2UgbmVlZCB0byBzZXQga2FkaXJhSW5mbyBvbiB0aGUgRmliZXIgdGhlIGhhbmRsZXIgd2lsbCBydW4gaW4uXG4gICAgICAvLyBNZXRlb3IgaGFzIGFscmVhZHkgd3JhcHBlZCB0aGUgaGFuZGxlciB0byBydW4gaXQgaW4gYSBuZXcgRmliZXJcbiAgICAgIC8vIGJ5IHVzaW5nIFByb21pc2UuYXN5bmNBcHBseSBzbyB3ZSBhcmUgbm90IGFibGUgdG8gZGlyZWN0bHkgc2V0IGl0XG4gICAgICAvLyBvbiB0aGF0IEZpYmVyLiBcbiAgICAgIC8vIE1ldGVvcidzIHByb21pc2UgbGlicmFyeSBjb3BpZXMgcHJvcGVydGllcyBmcm9tIHRoZSBjdXJyZW50IGZpYmVyIHRvXG4gICAgICAvLyB0aGUgbmV3IGZpYmVyLCBzbyB3ZSBjYW4gd3JhcCBpdCBpbiBhbm90aGVyIEZpYmVyIHdpdGgga2FkaXJhSW5mbyBzZXRcbiAgICAgIC8vIGFuZCBNZXRlb3Igd2lsbCBjb3B5IGthZGlyYUluZm8gdG8gdGhlIG5ldyBGaWJlci5cbiAgICAgIC8vIEl0IHdpbGwgb25seSBjcmVhdGUgdGhlIGFkZGl0aW9uYWwgRmliZXIgaWYgaXQgaXNuJ3QgYWxyZWFkeSBydW5uaW5nIGluIGEgRmliZXJcbiAgICAgIGFwcC5zdGFjay5mb3JFYWNoKGVudHJ5ID0+IHtcbiAgICAgICAgbGV0IHdyYXBwZWRIYW5kbGVyID0gd3JhcEhhbmRsZXIoZW50cnkuaGFuZGxlKVxuICAgICAgICBpZiAoZW50cnkuaGFuZGxlLmxlbmd0aCA+PSA0KSB7XG4gICAgICAgICAgZW50cnkuaGFuZGxlID0gZnVuY3Rpb24gKGVycm9yLCByZXEsIHJlcywgbmV4dCkge1xuICAgICAgICAgICAgcmV0dXJuIFByb21pc2UuYXN5bmNBcHBseShcbiAgICAgICAgICAgICAgd3JhcHBlZEhhbmRsZXIsXG4gICAgICAgICAgICAgIHRoaXMsXG4gICAgICAgICAgICAgIGFyZ3VtZW50cyxcbiAgICAgICAgICAgICAgdHJ1ZVxuICAgICAgICAgICAgKTtcbiAgICAgICAgICB9O1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIGVudHJ5LmhhbmRsZSA9IGZ1bmN0aW9uIChyZXEsIHJlcywgbmV4dCkge1xuICAgICAgICAgICAgcmV0dXJuIFByb21pc2UuYXN5bmNBcHBseShcbiAgICAgICAgICAgICAgd3JhcHBlZEhhbmRsZXIsXG4gICAgICAgICAgICAgIHRoaXMsXG4gICAgICAgICAgICAgIGFyZ3VtZW50cyxcbiAgICAgICAgICAgICAgdHJ1ZVxuICAgICAgICAgICAgKVxuICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgfSk7XG4gICAgfVxuICAgIGFwcC51c2UgPSBmdW5jdGlvbiAoLi4uYXJncykge1xuICAgICAgYXJnc1thcmdzLmxlbmd0aCAtIDFdID0gd3JhcEhhbmRsZXIoYXJnc1thcmdzLmxlbmd0aCAtIDFdKVxuICAgICAgcmV0dXJuIG9sZFVzZS5hcHBseShhcHAsIGFyZ3MpO1xuICAgIH1cbiAgfVxuXG4gIHdyYXBDb25uZWN0KFdlYkFwcC5yYXdDb25uZWN0SGFuZGxlcnMsIGZhbHNlKTtcbiAgd3JhcENvbm5lY3QoV2ViQXBwSW50ZXJuYWxzLm1ldGVvckludGVybmFsSGFuZGxlcnMsIGZhbHNlKTtcblxuICAvLyBUaGUgb2F1dGggcGFja2FnZSBhbmQgb3RoZXIgY29yZSBwYWNrYWdlcyBtaWdodCBoYXZlIGFscmVhZHkgYWRkZWQgdGhlaXIgbWlkZGxld2FyZSxcbiAgLy8gc28gd2UgbmVlZCB0byB3cmFwIHRoZSBleGlzdGluZyBtaWRkbGV3YXJlXG4gIHdyYXBDb25uZWN0KFdlYkFwcC5jb25uZWN0SGFuZGxlcnMsIHRydWUpO1xuXG4gIHdyYXBDb25uZWN0KFdlYkFwcC5jb25uZWN0QXBwLCBmYWxzZSk7XG5cbiAgbGV0IG9sZFN0YXRpY0ZpbGVzTWlkZGxld2FyZSA9IFdlYkFwcEludGVybmFscy5zdGF0aWNGaWxlc01pZGRsZXdhcmU7XG4gIGNvbnN0IHN0YXRpY0hhbmRsZXIgPSB3cmFwSGFuZGxlcihvbGRTdGF0aWNGaWxlc01pZGRsZXdhcmUuYmluZChXZWJBcHBJbnRlcm5hbHMsIFdlYkFwcEludGVybmFscy5zdGF0aWNGaWxlc0J5QXJjaCkpO1xuICBXZWJBcHBJbnRlcm5hbHMuc3RhdGljRmlsZXNNaWRkbGV3YXJlID0gZnVuY3Rpb24gKF9zdGF0aWNGaWxlcywgcmVxLCByZXMsIG5leHQpIHtcbiAgICBpZiAocmVxLl9fa2FkaXJhSW5mbykge1xuICAgICAgcmVxLl9fa2FkaXJhSW5mby5pc1N0YXRpYyA9IHRydWU7XG4gICAgfVxuXG4gICAgcmV0dXJuIHN0YXRpY0hhbmRsZXIocmVxLCByZXMsIGZ1bmN0aW9uICgpIHtcbiAgICAgIC8vIGlmIHRoZSByZXF1ZXN0IGlzIGZvciBhIHN0YXRpYyBmaWxlLCB0aGUgc3RhdGljIGhhbmRsZXIgd2lsbCBlbmQgdGhlIHJlc3BvbnNlXG4gICAgICAvLyBpbnN0ZWFkIG9mIGNhbGxpbmcgbmV4dFxuICAgICAgcmVxLl9fa2FkaXJhSW5mby5pc1N0YXRpYyA9IGZhbHNlO1xuICAgICAgcmV0dXJuIG5leHQuYXBwbHkodGhpcywgYXJndW1lbnRzKTtcbiAgICB9KTtcbiAgfTtcbn1cbiIsImZ1bmN0aW9uIG5vcm1hbGl6ZWRQcmVmaXggKG5hbWUpIHtcbiAgcmV0dXJuIG5hbWUucmVwbGFjZSgnS0FESVJBXycsICdNT05USV8nKTtcbn1cblxuS2FkaXJhLl9wYXJzZUVudiA9IGZ1bmN0aW9uIChlbnYpIHtcbiAgdmFyIG9wdGlvbnMgPSB7fTtcbiAgZm9yKHZhciBuYW1lIGluIGVudikge1xuICAgIHZhciB2YWx1ZSA9IGVudltuYW1lXTtcbiAgICB2YXIgbm9ybWFsaXplZE5hbWUgPSBub3JtYWxpemVkUHJlZml4KG5hbWUpO1xuICAgIHZhciBpbmZvID0gS2FkaXJhLl9wYXJzZUVudi5fb3B0aW9uc1tub3JtYWxpemVkTmFtZV07XG5cbiAgICBpZihpbmZvICYmIHZhbHVlKSB7XG4gICAgICBvcHRpb25zW2luZm8ubmFtZV0gPSBpbmZvLnBhcnNlcih2YWx1ZSk7XG4gICAgfVxuICB9XG5cbiAgcmV0dXJuIG9wdGlvbnM7XG59O1xuXG5cbkthZGlyYS5fcGFyc2VFbnYucGFyc2VJbnQgPSBmdW5jdGlvbiAoc3RyKSB7XG4gIHZhciBudW0gPSBwYXJzZUludChzdHIpO1xuICBpZihudW0gfHwgbnVtID09PSAwKSByZXR1cm4gbnVtO1xuICB0aHJvdyBuZXcgRXJyb3IoJ0thZGlyYTogTWF0Y2ggRXJyb3I6IFwiJytudW0rJ1wiIGlzIG5vdCBhIG51bWJlcicpO1xufTtcblxuXG5LYWRpcmEuX3BhcnNlRW52LnBhcnNlQm9vbCA9IGZ1bmN0aW9uIChzdHIpIHtcbiAgc3RyID0gc3RyLnRvTG93ZXJDYXNlKCk7XG4gIGlmKHN0ciA9PT0gJ3RydWUnKSByZXR1cm4gdHJ1ZTtcbiAgaWYoc3RyID09PSAnZmFsc2UnKSByZXR1cm4gZmFsc2U7XG4gIHRocm93IG5ldyBFcnJvcignS2FkaXJhOiBNYXRjaCBFcnJvcjogJytzdHIrJyBpcyBub3QgYSBib29sZWFuJyk7XG59O1xuXG5cbkthZGlyYS5fcGFyc2VFbnYucGFyc2VVcmwgPSBmdW5jdGlvbiAoc3RyKSB7XG4gIHJldHVybiBzdHI7XG59O1xuXG5cbkthZGlyYS5fcGFyc2VFbnYucGFyc2VTdHJpbmcgPSBmdW5jdGlvbiAoc3RyKSB7XG4gIHJldHVybiBzdHI7XG59O1xuXG5cbkthZGlyYS5fcGFyc2VFbnYuX29wdGlvbnMgPSB7XG4gIC8vIGF1dGhcbiAgTU9OVElfQVBQX0lEOiB7XG4gICAgbmFtZTogJ2FwcElkJyxcbiAgICBwYXJzZXI6IEthZGlyYS5fcGFyc2VFbnYucGFyc2VTdHJpbmdcbiAgfSxcbiAgTU9OVElfQVBQX1NFQ1JFVDoge1xuICAgIG5hbWU6ICdhcHBTZWNyZXQnLFxuICAgIHBhcnNlcjogS2FkaXJhLl9wYXJzZUVudi5wYXJzZVN0cmluZ1xuICB9LFxuICAvLyBkZWxheSB0byBzZW5kIHRoZSBpbml0aWFsIHBpbmcgdG8gdGhlIGthZGlyYSBlbmdpbmUgYWZ0ZXIgcGFnZSBsb2Fkc1xuICBNT05USV9PUFRJT05TX0NMSUVOVF9FTkdJTkVfU1lOQ19ERUxBWToge1xuICAgIG5hbWU6ICdjbGllbnRFbmdpbmVTeW5jRGVsYXknLFxuICAgIHBhcnNlcjogS2FkaXJhLl9wYXJzZUVudi5wYXJzZUludCxcbiAgfSxcbiAgLy8gdGltZSBiZXR3ZWVuIHNlbmRpbmcgZXJyb3JzIHRvIHRoZSBlbmdpbmVcbiAgTU9OVElfT1BUSU9OU19FUlJPUl9EVU1QX0lOVEVSVkFMOiB7XG4gICAgbmFtZTogJ2Vycm9yRHVtcEludGVydmFsJyxcbiAgICBwYXJzZXI6IEthZGlyYS5fcGFyc2VFbnYucGFyc2VJbnQsXG4gIH0sXG4gIC8vIG5vIG9mIGVycm9ycyBhbGxvd2VkIGluIGEgZ2l2ZW4gaW50ZXJ2YWxcbiAgTU9OVElfT1BUSU9OU19NQVhfRVJST1JTX1BFUl9JTlRFUlZBTDoge1xuICAgIG5hbWU6ICdtYXhFcnJvcnNQZXJJbnRlcnZhbCcsXG4gICAgcGFyc2VyOiBLYWRpcmEuX3BhcnNlRW52LnBhcnNlSW50LFxuICB9LFxuICAvLyBhIHpvbmUuanMgc3BlY2lmaWMgb3B0aW9uIHRvIGNvbGxlY3QgdGhlIGZ1bGwgc3RhY2sgdHJhY2Uod2hpY2ggaXMgbm90IG11Y2ggdXNlZnVsKVxuICBNT05USV9PUFRJT05TX0NPTExFQ1RfQUxMX1NUQUNLUzoge1xuICAgIG5hbWU6ICdjb2xsZWN0QWxsU3RhY2tzJyxcbiAgICBwYXJzZXI6IEthZGlyYS5fcGFyc2VFbnYucGFyc2VCb29sLFxuICB9LFxuICAvLyBlbmFibGUgZXJyb3IgdHJhY2tpbmcgKHdoaWNoIGlzIHR1cm5lZCBvbiBieSBkZWZhdWx0KVxuICBNT05USV9PUFRJT05TX0VOQUJMRV9FUlJPUl9UUkFDS0lORzoge1xuICAgIG5hbWU6ICdlbmFibGVFcnJvclRyYWNraW5nJyxcbiAgICBwYXJzZXI6IEthZGlyYS5fcGFyc2VFbnYucGFyc2VCb29sLFxuICB9LFxuICAvLyBrYWRpcmEgZW5naW5lIGVuZHBvaW50XG4gIE1PTlRJX09QVElPTlNfRU5EUE9JTlQ6IHtcbiAgICBuYW1lOiAnZW5kcG9pbnQnLFxuICAgIHBhcnNlcjogS2FkaXJhLl9wYXJzZUVudi5wYXJzZVVybCxcbiAgfSxcbiAgLy8gZGVmaW5lIHRoZSBob3N0bmFtZSBvZiB0aGUgY3VycmVudCBydW5uaW5nIHByb2Nlc3NcbiAgTU9OVElfT1BUSU9OU19IT1NUTkFNRToge1xuICAgIG5hbWU6ICdob3N0bmFtZScsXG4gICAgcGFyc2VyOiBLYWRpcmEuX3BhcnNlRW52LnBhcnNlU3RyaW5nLFxuICB9LFxuICAvLyBpbnRlcnZhbCBiZXR3ZWVuIHNlbmRpbmcgZGF0YSB0byB0aGUga2FkaXJhIGVuZ2luZSBmcm9tIHRoZSBzZXJ2ZXJcbiAgTU9OVElfT1BUSU9OU19QQVlMT0FEX1RJTUVPVVQ6IHtcbiAgICBuYW1lOiAncGF5bG9hZFRpbWVvdXQnLFxuICAgIHBhcnNlcjogS2FkaXJhLl9wYXJzZUVudi5wYXJzZUludCxcbiAgfSxcbiAgLy8gc2V0IEhUVFAvSFRUUFMgcHJveHlcbiAgTU9OVElfT1BUSU9OU19QUk9YWToge1xuICAgIG5hbWU6ICdwcm94eScsXG4gICAgcGFyc2VyOiBLYWRpcmEuX3BhcnNlRW52LnBhcnNlVXJsLFxuICB9LFxuICAvLyBudW1iZXIgb2YgaXRlbXMgY2FjaGVkIGZvciB0cmFja2luZyBkb2N1bWVudCBzaXplXG4gIE1PTlRJX09QVElPTlNfRE9DVU1FTlRfU0laRV9DQUNIRV9TSVpFOiB7XG4gICAgbmFtZTogJ2RvY3VtZW50U2l6ZUNhY2hlU2l6ZScsXG4gICAgcGFyc2VyOiBLYWRpcmEuX3BhcnNlRW52LnBhcnNlSW50LFxuICB9LFxuICAvLyBlbmFibGUgdXBsb2FkaW5nIHNvdXJjZW1hcHNcbiAgTU9OVElfVVBMT0FEX1NPVVJDRV9NQVBTOiB7XG4gICAgbmFtZTogJ3VwbG9hZFNvdXJjZU1hcHMnLFxuICAgIHBhcnNlcjogS2FkaXJhLl9wYXJzZUVudi5wYXJzZUJvb2xcbiAgfSxcbiAgTU9OVElfUkVDT1JEX0lQX0FERFJFU1M6IHtcbiAgICBuYW1lOiAncmVjb3JkSVBBZGRyZXNzJyxcbiAgICBwYXJzZXI6IEthZGlyYS5fcGFyc2VFbnYucGFyc2VTdHJpbmcsXG4gIH0sXG4gIE1PTlRJX0VWRU5UX1NUQUNLX1RSQUNFOiB7XG4gICAgbmFtZTogJ2V2ZW50U3RhY2tUcmFjZScsXG4gICAgcGFyc2VyOiBLYWRpcmEuX3BhcnNlRW52LnBhcnNlQm9vbCxcbiAgfVxufTtcbiIsIkthZGlyYS5fY29ubmVjdFdpdGhFbnYgPSBmdW5jdGlvbigpIHtcbiAgdmFyIG9wdGlvbnMgPSBLYWRpcmEuX3BhcnNlRW52KHByb2Nlc3MuZW52KTtcbiAgaWYob3B0aW9ucy5hcHBJZCAmJiBvcHRpb25zLmFwcFNlY3JldCkge1xuXG4gICAgS2FkaXJhLmNvbm5lY3QoXG4gICAgICBvcHRpb25zLmFwcElkLFxuICAgICAgb3B0aW9ucy5hcHBTZWNyZXQsXG4gICAgICBvcHRpb25zXG4gICAgKTtcblxuICAgIEthZGlyYS5jb25uZWN0ID0gZnVuY3Rpb24oKSB7XG4gICAgICB0aHJvdyBuZXcgRXJyb3IoJ0thZGlyYSBoYXMgYmVlbiBhbHJlYWR5IGNvbm5lY3RlZCB1c2luZyBjcmVkZW50aWFscyBmcm9tIEVudmlyb25tZW50IFZhcmlhYmxlcycpO1xuICAgIH07XG4gIH1cbn07XG5cblxuS2FkaXJhLl9jb25uZWN0V2l0aFNldHRpbmdzID0gZnVuY3Rpb24gKCkge1xuICB2YXIgbW9udGlTZXR0aW5ncyA9IE1ldGVvci5zZXR0aW5ncy5tb250aSB8fCBNZXRlb3Iuc2V0dGluZ3Mua2FkaXJhXG5cbiAgaWYoXG4gICAgbW9udGlTZXR0aW5ncyAmJlxuICAgIG1vbnRpU2V0dGluZ3MuYXBwSWQgJiZcbiAgICBtb250aVNldHRpbmdzLmFwcFNlY3JldFxuICApIHtcbiAgICBLYWRpcmEuY29ubmVjdChcbiAgICAgIG1vbnRpU2V0dGluZ3MuYXBwSWQsXG4gICAgICBtb250aVNldHRpbmdzLmFwcFNlY3JldCxcbiAgICAgIG1vbnRpU2V0dGluZ3Mub3B0aW9ucyB8fCB7fVxuICAgICk7XG5cbiAgICBLYWRpcmEuY29ubmVjdCA9IGZ1bmN0aW9uKCkge1xuICAgICAgdGhyb3cgbmV3IEVycm9yKCdLYWRpcmEgaGFzIGJlZW4gYWxyZWFkeSBjb25uZWN0ZWQgdXNpbmcgY3JlZGVudGlhbHMgZnJvbSBNZXRlb3Iuc2V0dGluZ3MnKTtcbiAgICB9O1xuICB9XG59O1xuXG5cbi8vIFRyeSB0byBjb25uZWN0IGF1dG9tYXRpY2FsbHlcbkthZGlyYS5fY29ubmVjdFdpdGhFbnYoKTtcbkthZGlyYS5fY29ubmVjdFdpdGhTZXR0aW5ncygpO1xuIiwiaW1wb3J0IHsgTWV0ZW9yIH0gZnJvbSAnbWV0ZW9yL21ldGVvcic7XG5cbmNvbnN0IGNvbmZsaWN0aW5nUGFja2FnZXMgPSBbXG4gICdtZGc6bWV0ZW9yLWFwbS1hZ2VudCcsXG4gICdsbWFjaGVuczprYWRpcmEnLFxuICAnbWV0ZW9yaGFja3M6a2FkaXJhJyxcbl07XG5cbk1ldGVvci5zdGFydHVwKCgpID0+IHtcbiAgY29uZmxpY3RpbmdQYWNrYWdlcy5mb3JFYWNoKChuYW1lKSA9PiB7XG4gICAgaWYgKG5hbWUgaW4gUGFja2FnZSkge1xuICAgICAgY29uc29sZS5sb2coYE1vbnRpIEFQTTogeW91ciBhcHAgaXMgdXNpbmcgdGhlICR7bmFtZX0gcGFja2FnZS4gVXNpbmcgbW9yZSB0aGFuIG9uZSBBUE0gYWdlbnQgaW4gYW4gYXBwIGNhbiBjYXVzZSB1bmV4cGVjdGVkIHByb2JsZW1zLmApO1xuICAgIH1cbiAgfSk7XG59KTtcbiJdfQ==
