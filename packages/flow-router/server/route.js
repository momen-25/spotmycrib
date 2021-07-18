import {Meteor} from "meteor/meteor";

const Url = require('url');
const Cheerio = require('cheerio');
const logger = console;
let CACHE_MODE = 'localfile';//s3, localfile
let basePath = '/Users/njanjanam/localcache/'
if(Meteor.isProduction)basePath = '/mnt/flatbid_cache/'
console.log('Base Path is: '+basePath)
///////////// CUSTOM JNS CODE
function slugify (text) {
    if(!text)return '';
    const a = 'àáäâèéëêìíïîòóöôùúüûñçßÿœæŕśńṕẃǵǹḿǘẍźḧ·/,:;'
    const b = 'aaaaeeeeiiiioooouuuuncsyoarsnpwgnmuxzh------'
    const p = new RegExp(a.split('').join('|'), 'g')

    return text.toString().toLowerCase()
        .replace(/\s+/g, '')           // Replace spaces with ""
        .replace(p, c =>
            b.charAt(a.indexOf(c)))     // Replace special chars
        .replace(/&/g, '-and-')         // Replace & with ''
        .replace(/[^\w\-]+/g, '')       // Remove all non-word chars
        .replace(/\-\-+/g, '-')         // Replace multiple - with single ''
        .replace(/^-+/, '')             // Trim - from start of text
        .replace(/-+$/, '')             // Trim - from end of text
}
if(CACHE_MODE == 's3'){ 
  var AWS = require('aws-sdk');
  var config = new AWS.Config({
      accessKeyId: Meteor.settings['galaxy.meteor.com'].env.accessKeyId, secretAccessKey: Meteor.settings['galaxy.meteor.com'].env.secretAccessKey, region: Meteor.settings['galaxy.meteor.com'].env.region
  });
  var s3 = new AWS.S3(config);
  var myBucket = 'flatbid-cache';
}
function emptyBucket(pathName,callback){
    var params = {
        Bucket: myBucket,
        Prefix: pathName
    };

    s3.listObjects(params, function(err, data) {
        if (err) return callback(err);

        if (data.Contents.length == 0) return callback();

        params = {Bucket: myBucket};
        params.Delete = {Objects:[]};

        data.Contents.forEach(function(content) {
            params.Delete.Objects.push({Key: content.Key});
        });
        var moreThan1k = false;
        if(params.Delete.Objects.length > 1000){
            params.Delete.Objects = params.Delete.Objects.slice(0,1000);
            moreThan1k = true
        }

        s3.deleteObjects(params, function(err, data) {
            if (err) return callback(err);
            if(moreThan1k)emptyBucket(pathName,callback);
            else callback();
        });
    });
}
Meteor.methods({
    createCache: function (html,cacheKey) {
        console.log('in createCache method');
        this.unblock();
        // if(Meteor.isDevelopment)return;

        var catchPath = '';
        if(cacheKey.indexOf('jns-b-')!=-1)catchPath += 'BrowsePages/'
        if(cacheKey.indexOf('jns-rent-')!=-1)catchPath += 'LDPages/'
        if(!catchPath)catchPath += 'All/'
        if(Meteor.isDevelopment)catchPath = 'dev/'+catchPath
        var filename = catchPath + cacheKey +'.html';

        ////////////////// AWS S3
        if(CACHE_MODE == 's3'){ 
          var params = {
              Bucket    : myBucket,
              Key           : filename,
              ContentLength : html.size,
              Body          : Date.now()+'{jns}'+html
          };

          s3.putObject(params, function(err, data) {
              console.log('Cache created for: '+filename + " Length: "+html.length)
              // console.log(data)
              // console.log(err)
          });
        }
        ////////////////// LOCAL FILE
        if(CACHE_MODE == 'localfile'){ 
          const fs = require('fs');
          var temPath = basePath+filename;
          console.log('Catch create in: '+temPath)
          fs.writeFileSync(temPath , Date.now()+'{jns}'+html, 'utf8');
          // var Minimize = require('minimize')
          //     , minimize = new Minimize();
          
          // minimize.parse(html, function (error, data) {
          //     console.log('Minimised');
          //     // console.log(data);
          //     fs.writeFileSync(temPath , data, 'utf8');
          // });
        }

        return;
        // fs.writeFileSync(temPath , data, 'utf8');
    },
    clearCache:function(key){
        // console.log('in clearCache method');
    },
    clearAllCache:function(key){
        console.log('in clearAllCache method');
        var paths = ['All/','BrowsePages/','LDPages/']
        var key;
        for(var i=0; i< paths.length ;i++){
            key = Meteor.isDevelopment ? 'dev/'+paths[i] : paths[i]
            emptyBucket(key,function(err){console.log(err)})
        }
    }
});
///////////// CUSTOM JNS CODE END

Route = class extends SharedRoute {
  constructor(router, pathDef, options, group) {
    super(router, pathDef, options, group);

    this._cache = {};
  }

  _init() {
    const cookieParser = require('cookie-parser');
    Picker.middleware(cookieParser());
    // process null subscriptions with FR support
    Picker.middleware(FastRender.handleOnAllRoutes);

    const route = FlowRouter.basePath + this.pathDef;
    Picker.route(route, this._handleRoute.bind(this));
  }

  _handleRoute(params, req, res, next) {
    if (!this._isHtmlPage(req.url)) {
      return next();
    }

    // This userId will be useful in the at the later on when
    // it's time to cache the page.
    // Normally, we can't access `Meteor.userId()` outside of a method
    // But here, we could do it because we call `FastRender.handleOnAllRoutes`.
    // It creates a FastRender context and assign it for the current fiber.
    try{
      req.__userId = Meteor.userId();
    }catch(e){
      req.__userId = this.userId;
    }
    const cachedPage = this._getCachedPage(req.url, req.__userId);
    if (cachedPage) {
      return this._processFromCache(cachedPage, req, res, next);
    }

    // Here we need to processFromSsr,
    // but also we need to process with FastRender as well.
    // That's why we bind processFromSsr and pass args as below.
    // It does not get any arguments from FastRender.
    // FastRender just trigger the following handler and do it's job
    const processFromSsr = this._processFromSsr.bind(this, params, req, res);
    FastRender.handleRoute(processFromSsr, params, req, res, next);
  }

  _processFromCache(pageInfo, req, res, next) {
    req.dynamicHead = req.dynamicHead || '';
    req.dynamicBody = req.dynamicBody || '';

    req.dynamicHead += pageInfo.head;
    req.dynamicBody += pageInfo.html;

    // InjectData.pushData(res, 'fast-render-data', pageInfo.frData);
    //   console.log('frData length: '+pageInfo.frData.length)
    next();
      // console.log('_processFromCache end')
  }

  _processFromSsr(params, req, res) {
    // console.log('_processFromSsr')
    const self = this;
    const ssrContext = new SsrContext();
    const routeContext = self._buildContext(req, params);

    self._router.ssrContext.withValue(ssrContext, () => {
      self._router.routeContext.withValue(routeContext, () => {
        try {
          // get the data for null subscriptions and add them to the
          // ssrContext
          const frData = '';//InjectData.getData(res, 'fast-render-data');
          if (frData) {
            ssrContext.addData(frData.collectionData);
          }

          if (self.options.action) {
            self.options.action(routeContext.params, routeContext.queryParams);
          }
        } catch (ex) {
          logger.error(`Error when doing SSR. path:${req.url}: ${ex.message}`);
          logger.error(ex.stack);
        }
      });

      self._injectHtml(req, res, ssrContext);
        console.log('_processFromSsr complete')
    });
  }

  _injectHtml(req, res, ssrContext) {
    const html = ssrContext.getHtml();
    const head = ssrContext.getHead();

    req.dynamicHead = req.dynamicHead || '';
    req.dynamicBody = req.dynamicBody || '';

    req.dynamicHead += head;
    req.dynamicBody += html;


    // cache the page if mentioned a timeout
    if (this._router.pageCacheTimeout) {
      const pageInfo = {
        // frData: InjectData.getData(res, 'fast-render-data'),
        head: head,
        html: html
      };
      this._cachePage(req.url, req.__userId, pageInfo, this._router.pageCacheTimeout);
    }

  }

  _moveScriptsToBottom(html) {
    const $ = Cheerio.load(html, {
      decodeEntities: false
    });
    const heads = $('head script');
    $('body').append(heads);

    // Remove empty lines caused by removing scripts
    $('head').html($('head').html().replace(/(^[ \t]*\n)/gm, ''));

    return $.html();
  }

  _buildContext(req, _params) {
    const queryParams = _params.query;
    // We need to remove `.query` since it's not part of our params API
    // But we only need to remove it in our copy.
    // We should not trigger any side effects
    const params = _.clone(_params);
    delete params.query;

    const context = {
      route: this,
      path: req.url,
      params,
      queryParams,
      // We might change this later on. That's why it's starting with _
      _serverRequest: req
    };

    return context;
  }

  _isHtmlPage(url) {
    const pathname = Url.parse(url).pathname;
    const ext = pathname.split('.').slice(1).join('.');

    // if there is no extention, yes that's a html page
    if (!ext) {
      return true;
    }

    // if this is htm or html, yes that's a html page
    if (/^htm/.test(ext)) {
      return true;
    }

    // if not we assume this is not as a html page
    // this doesn't do any harm. But no SSR
    return false;
  }

  _getCachedPage(url, userId) {

    const cacheInfo = {url, userId};

    //////Below is the logic for this extension's default in-build caching system. Enabling it to reduce the number of calls to AWS S3 for most commenly crawled pages by SearchEngines
    var cacheKey = this._getCacheKey(cacheInfo);
    // console.log('local Cache - cacheKey: '+cacheKey)

    const info = this._cache[cacheKey];
    // if (info) {
    //   console.log('Fetching from the memory Cache: '+cacheKey)
    //   return info.data;
    // }
    ///End of inbuild code



      /////////////JNS CUSTOM CODE START - This will run if the above code didn't find the cache.

      // var start = new Date().getTime();
      cacheKey = this._getCacheKeyJNS({url, userId});
      var catchPath = '';
      if(cacheKey.indexOf('jns-b-')!=-1)catchPath += 'BrowsePages/'
      if(cacheKey.indexOf('jns-rent-')!=-1)catchPath += 'LDPages/'
      if(!catchPath)catchPath += 'All/'
      if(Meteor.isDevelopment)catchPath = 'dev/'+catchPath
      let tmp = false;
      if(CACHE_MODE == 's3'){ 
        var url = 'https://s3-eu-west-1.amazonaws.com/flatbid-cache/'+ catchPath + cacheKey + '.html';
        try {
          result = Meteor.http.get(url);
          if(result.statusCode==200){
            tmp = result.content.split('{jns}')
          }
        }catch(e){
            console.log('s3 Cache fetch failed: '+cacheKey);
        }
      }else if(CACHE_MODE == 'localfile'){ 
        const fs = require('fs');
        
        var temPath = basePath+catchPath + cacheKey +'.html';
        try {
          tmp = fs.readFileSync(temPath ,'utf8');
          tmp = tmp.split('{jns}');
          //fs.readFileSync('/mnt/flatbid_cache/BrowsePages/guest-jns-b-apartment-for-rent-in-rathbane-limerick-irelandluxurysort1.html' ,'utf8');
        }catch(e){
            console.log('localfile Cache fetch failed: '+temPath);
        }
      }
      try {
          // if(Meteor.isDevelopment)throw new Meteor.Error('bad', 'stuff happened');
          
          if(tmp){
              var ftime = parseInt(tmp[0])
              var minHTML = tmp[1]
              var tnow = Date.now();
              var diff = tnow - ftime;

              var cacheExpiryTimeinMS = 172800000; //48 * 60 * 60 *1000 //48 hours Default
              if(cacheKey.indexOf('home')!=-1)cacheExpiryTimeinMS = 1800000//60 * 60 *1000 //60 min for home page
              if(cacheKey.indexOf('jns-b-')!=-1)cacheExpiryTimeinMS = 1800000//30 * 60 *1000 //30 min for browse pages
              if(cacheKey.indexOf('jns-rent-')!=-1)cacheExpiryTimeinMS = 2280000 // 38 * 60 *1000 //1.5 days for rent pages
              if(cacheKey.indexOf('jns-letting-')!=-1)cacheExpiryTimeinMS = 2880000 //48 * 60 *1000 //2 days for letting pages
              // cacheExpiryTimeinMS = 1 *1000 //1 sec

              console.log('tnow: '+tnow+' ftime: '+ftime+' diff: '+diff+' tmp[0]: '+tmp[0]+' cacheExpiryTimeinMS:'+cacheExpiryTimeinMS);

              if(diff < cacheExpiryTimeinMS) {//Cachce has not expired yet.
                  console.log('Successfully fetching from cache: '+cacheKey);
                  // this.response.writeHead(200, {'Content-Type': 'text/html'});
                  // this.response.end(minHTML);

                  return {head:tmp[1],html:tmp[2]};
              }else{
                  console.log('Cache expired: '+ diff +' key: '+cacheKey);
                  // Meteor.call('clearCache',cacheKey);
              }
          }else{
              console.log('No cache: '+cacheKey);
          }
      }catch(e){
          console.log('Cache not found: '+cacheKey);
      }
      /////////////JNS CUSTOM CODE END

  }

  _cachePage(url, userId, data, timeout) {

      var cacheKey = this._getCacheKeyJNS({url, userId});
      Meteor.call('createCache',`${data.head}{jns}${data.html}`,cacheKey);


    ///Below is the logic for this extension's default in-build caching system. Enabling it to reduce the number of calls to AWS S3 for most commenly crawled pages by SearchEngines
    const cacheInfo = {url, userId};
    cacheKey = this._getCacheKey(cacheInfo);
    const existingInfo = this._cache[cacheKey];
    if (existingInfo) {
      // Sometimes, it's possible get this called multiple times
      // due to race conditions. So, in that case, simply discard
      // caching this page.
      return;
    }

    const info = {
      data: data,
      timeoutHandle: setTimeout(() => {
        delete this._cache[cacheKey];
      }, timeout)
    };

    console.log('Local Cache created for: '+cacheKey)
    this._cache[cacheKey] = info;
  }

  _getCacheKeyJNS({userId = '', url}) {
    var slugged = slugify(url);
    return   (userId ? userId : 'guest' )+'-jns-'+ (slugged ? slugged : 'home' )
  }
  _getCacheKey({userId = '', url}) {
    return `${userId}::${url}`;
  }
};
