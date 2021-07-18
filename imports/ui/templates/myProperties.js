import "./pagination.html";
import "./imageView.html";
import "./myProperties.html";
import './shared.js';
import SimpleSchema from "simpl-schema";
// SimpleSchema.extendOptions(['autoform']);
advertiseFormSaving='';
fsClient = '';
saveAndAdvertise=false;

var globalFILTERS = {};
function getFiltersFromRoute(){
    var FILTERS = {};
    if( FlowRouter.current().queryParams.home_type ){
        var val = FlowRouter.current().queryParams.home_type;
        FILTERS['homeType'] = val;
    }
    if( FlowRouter.current().queryParams.facing ){
        var val = FlowRouter.current().queryParams.facing;
        FILTERS['facing'] = val;
    }

    if( FlowRouter.current().queryParams.floor_low || FlowRouter.current().queryParams.floor_high  ){
        var val_l = FlowRouter.current().queryParams.floor_low;
        var val_h = FlowRouter.current().queryParams.floor_high;

        if(isNaN(val_l) && isNaN(val_h)){//Both are not valid numbers

        }else if(!isNaN(val_l) && isNaN(val_h)){//Low is valid and no upper
            FILTERS['floor'] = [val_l,0];
        }else if(isNaN(val_l) && !isNaN(val_h)){//Upper is valid and no lower
            FILTERS['floor'] = [0, val_h];
        }else{//Both are valid
            FILTERS['floor'] = [val_l ,val_h ];
        }
    }

    if( FlowRouter.current().queryParams.price_low || FlowRouter.current().queryParams.price_high  ){
        var val_l = FlowRouter.current().queryParams.price_low;
        var val_h = FlowRouter.current().queryParams.price_high;

        if(isNaN(val_l) && isNaN(val_h)){//Both are not valid numbers

        }else if(!isNaN(val_l) && isNaN(val_h)){//Low is valid and no upper
            FILTERS['priceRange'] = [val_l,0];
        }else if(isNaN(val_l) && !isNaN(val_h)){//Upper is valid and no lower
            FILTERS['priceRange'] = [0, val_h];
        }else{//Both are valid
            FILTERS['priceRange'] = [val_l ,val_h ];
        }
    }
    //if(FILTERS.length==0){return false;}
    return FILTERS;//{"Home Type":["2 BHK"],"Floor":["2 to 15"],"Price Range":["67.45 to 97.45 "]}
}
function setFilters(FILTERS){
    Session.set('globalFILTERS', FILTERS);
    var defaultFilters = Session.get('projectData');defaultFilters = defaultFilters.filter;
    console.log("In setFilters")
    console.log(FILTERS);
    console.log(defaultFilters);
    FlowRouter.query.clear();

    var baseURL = FlowRouter.current().originalUrl.split('?')[0];
    var route = baseURL;
    // debugger;
    if(  FILTERS['homeType']  ){
        if(FILTERS['homeType'].length != defaultFilters.homeType.length)
            for(var i=0;i<FILTERS['homeType'].length;i++) {
                // if(defaultFilters.homeType.indexOf(  FILTERS['homeType'][i]  ) == -1)
                route = updateQueryStringParameter(route, 'home_type[]', FILTERS['homeType'][i])
            }
    }
    if(  FILTERS['facing']  ){
        if(FILTERS['facing'].length != defaultFilters.facing.length)
            for(var i=0;i<FILTERS['facing'].length;i++) {
                // if(defaultFilters.facing.indexOf(  FILTERS['facing'][i]  ) == -1)
                route = updateQueryStringParameter(route, 'facing[]', FILTERS['facing'][i])
            }
    }
    if(  FILTERS['floor'] ){
        var l1 = FILTERS['floor'][0];
        //if(l1 !=0 && l1 != defaultFilters.floor[0])
        route = updateQueryStringParameter(route, 'floor_low', l1);
        var l2 = FILTERS['floor'][1];
        //if(l2 != defaultFilters.floor[1])
        route = updateQueryStringParameter(route, 'floor_high', l2);

        //route = updateQueryStringParameter(route, 'floor_low', FILTERS['floor'][0]);
        //route = updateQueryStringParameter(route, 'floor_high', FILTERS['floor'][1]);
    }
    if( FILTERS['priceRange'] ){
        var l1 = FILTERS['priceRange'][0];

        //Don't uncomment below lines as they would cause another bug. It would be a flow bug, on page refresh, it shud know upper limit to compute, and its called during template create.
        //if(l1 !=0 && l1 != defaultFilters.priceRange[0])
        route = updateQueryStringParameter(route, 'price_low', l1);
        var l2 = FILTERS['priceRange'][1];
        //if(l2 != defaultFilters.priceRange[1])
        route = updateQueryStringParameter(route, 'price_high', l2);


        //route = updateQueryStringParameter(route, 'price_low', FILTERS['priceRange'][0]);
        //route = updateQueryStringParameter(route, 'price_high', FILTERS['priceRange'][1]);
    }

    if(FILTERS['floor']){
        $('.filterS1l').html(FILTERS['floor'][0]);
        $('.filterS1h').html(FILTERS['floor'][1]);
    }
    if(FILTERS['priceRange']){
        $('.filterS2l').html( numDifferentiation( FILTERS['priceRange'][0]) )
        $('.filterS2h').html( numDifferentiation( FILTERS['priceRange'][1]) )
    }
    console.log("New Route"+route);
    FlowRouter.go(route);
    updateUISlider(FILTERS)

}
function getDefaultFilters(){
    return {};
}
function getCurUsersBid(auctionId){
    var bid = Collections.Bids.find({auctionId:auctionId,userId:Meteor.userId()},{limit:1}).fetch()
    return bid[0];
}

function updateUISlider(FILTERS){
    //console.log('Updating slider values')
    var slider = document.getElementById('range-input');
    var slider1 = document.getElementById('range-input1');
    if(!slider)return;
    if(!slider.noUiSlider)return;
    slider.noUiSlider.set(FILTERS.floor);
    slider1.noUiSlider.set(FILTERS.priceRange);
    var defaultFilters = Session.get('projectData');defaultFilters = defaultFilters.filter;

    if(FILTERS.homeType)
        if(FILTERS.homeType.length && (FILTERS.homeType.length != defaultFilters.homeType.length) )
            $('.filterUnitType').val(FILTERS.homeType[0])
        else
            $('.filterUnitType').val('any')
    if(FILTERS.facing)
        if(FILTERS.facing.length && (FILTERS.facing.length != defaultFilters.facing.length))
            $('.filterUnitFacing').val(FILTERS.facing[0])
        else
            $('.filterUnitFacing').val('any')
}
function resetUISlider(FILTERS){
    // console.log('reset slider values')
    var slider = document.getElementById('range-input');
    var slider1 = document.getElementById('range-input1');
    slider.noUiSlider.set(FILTERS.floor);
    slider1.noUiSlider.set(FILTERS.priceRange);
    $('.filterUnitType, .filterUnitFacing').val('any')
}
function startUISlider(data){
    var slider = document.getElementById('range-input');
    var slider1 = document.getElementById('range-input1');
    //data = {
    //  "s1":{
    //    "start": [0, 25],
    //    "range": [0, 25]
    //  }, "s2":{
    //    "start": [64, 94],
    //    "range": [64, 94]
    //  }
    //}
    noUiSlider.create(slider, {

        start: data.s1.start,

        connect: true,

        step: 1,

        range: {

            'min': data.s1.range[0],

            'max': data.s1.range[1]

        },

        format: wNumb({

            decimals: 0

        })

    });

    noUiSlider.create(slider1, {

        start: data.s2.start,

        connect: true,

        step: 1000000,

        range: {

            'min': data.s2.range[0],

            'max': data.s2.range[1]

        },

        format: wNumb({

            decimals: 0

        })

    });
    slider.noUiSlider.on('update', function(){
        applyFilterValues();
    });
    slider1.noUiSlider.on('update', function(){
        applyFilterValues();
    });
    slider.noUiSlider.on('change', function(){
        applyFilters();
    });
    slider1.noUiSlider.on('change', function(){
        applyFilters();
    });
}
function getPaginationData(totalResultsCount,currentPageNo,urlBase, resultsPerPage){
    var pages = [], prevPage = {}, nextPage={};
    var pgMin = currentPageNo-4, pgMax = currentPageNo+ 5, maxPages = Math.ceil(totalResultsCount/resultsPerPage);
    if(pgMin<1)pgMin =1;
    if(pgMax<1)pgMax =1;
    if(maxPages<1)maxPages =1;
    if(pgMin>maxPages)currentPageNo =maxPages;
    var tmp={};
    var href = '';

    var cRoute = FlowRouter.current();
    // params: {pageno: undefined}
    // path: "/account/myproperies"
    // pathname: "/account/myproperies"
    // queryParams: {}
    // queryString: null
    // route: Route {options: {…}, name:

    for (var i=pgMin; i<=maxPages;i++){
        cRoute.params['pageno'] = i;
        href = FlowRouter.url(cRoute.route.name,cRoute.params,cRoute.queryParams)
        tmp = {
            "href": href,
            "text": i
        }
        if(i== currentPageNo) {
            tmp['href'] = 'javascript:void(0);';
            tmp['current'] = true;
        }
        pages.push(tmp)
    }
    var prevPageNo = currentPageNo- 1, nextPageNo=currentPageNo+ 1;
    if(prevPageNo<1){
        prevPage['href'] = 'javascript:void(0)';
        prevPage['text'] = 'Previous';
        prevPage['disabled'] = 'disabled';
    }else{
        cRoute.params['pageno'] = prevPageNo;
        prevPage['href'] = FlowRouter.url(cRoute.route.name,cRoute.params,cRoute.queryParams)
        prevPage['text'] = 'Previous';
    }
    if(nextPageNo>maxPages)nextPageNo =maxPages;
    if(nextPageNo == currentPageNo){
        nextPage['href'] = 'javascript:void(0)';
        nextPage['text'] = 'Next';
        nextPage['disabled'] = 'disabled';
    }else{
        cRoute.params['pageno'] = nextPageNo;
        prevPage['href'] = FlowRouter.url(cRoute.route.name,cRoute.params,cRoute.queryParams)
        nextPage['text'] = 'Next';
    }
    return {
        "prevPage":prevPage,
        "pages":pages,
        "nextPage": nextPage
    }
}


Template.registerHelper("objectToPairs",function(object){
    return _.map(object, function(value, key) {
        return {
            key: key,
            value: value
        };
    });
});
Template.registerHelper("hostname",function(){
    return Meteor.absoluteUrl();
});
function numDifferentiation(val) {
    if(val >= 1000000000) val = (val/1000000000).toFixed(2) + ' Billion';
    else if(val >= 1000000) val = (val/1000000).toFixed(2) + ' Million';
    return val.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
}
function numFormat(x) {
    //var x=12345652457.557;
    //console.log(x)
    if(!x)return x;
    x=x.toString();
    var afterPoint = '';
    if(x.indexOf('.') > 0)
        afterPoint = x.substring(x.indexOf('.'),x.length);
    afterPoint = afterPoint.substr(0,3);
    x = Math.floor(x);
    x=x.toString();
    var lastThree = x.substring(x.length-3);
    var otherNumbers = x.substring(0,x.length-3);
    if(otherNumbers != '')
        lastThree = ',' + lastThree;
    var res = otherNumbers.replace(/\B(?=(\d{2})+(?!\d))/g, ",") + lastThree + afterPoint;
    return res;
}



Template.myProperties.events({
    "click .clearFilters": function (event, template) {
        //FlowRouter.query.clear();

        console.log('in .clearFilters meteor event')
        var defaultFilters = Session.get('projectData');defaultFilters = defaultFilters.filter;
        $('.filterUnitFacing, .filterUnitType').val('any');
        resetUISlider(defaultFilters);
        setFilters(defaultFilters);
        $.fancybox.close();
        applyClearFiltersEvent();
    },
    "click .addPropertyBtn": function (event, template) {
        var user = Accounts.user();
        if(!user.profile.mobile){
            var mobile = false, failed = false;
            while(1) {//This is an un limited loop of mobile number.
                if(failed) mobile = prompt("'"+mobile+"' is not a valid number. Please enter a valid mobile to proceed. ");
                else mobile = prompt("You don't have a mobile number attached to your profile. Please enter mobile to proceed. ");
                if( mobile == null || /^\d{10}$/.test(mobile) ) break;
                else{
                    failed = true;
                }
            }
            if(/^\d{10}$/.test(mobile)) {
                Meteor.call('updateMobile', mobile, function (error, result) {
                    if (error) {
                        console.log(error.error);
                        var tmp = Session.get("showErrorDlg");
                        var msg = 'Mobile number update failed. Please try again. Contact us if needed.';
                        tmp.push(msg);
                        Session.set("showErrorDlg", tmp)

                        return;
                    }
                });
            }
        }
        if(template.showAddProperty.get() )template.showAddProperty.set(false);
        else template.showAddProperty.set(true);
    },
    "change .new-filter select":function(event, template){
        console.log("Filters changed");
        applyFilters();
    }
})
Template.myProperties.onCreated(function(){
    this.showAddProperty = new ReactiveVar( false );
    this.totalResultsCount = new ReactiveVar( 0 );

    var globalFILTERS = getFiltersFromRoute();
    Session.set('globalFILTERS',globalFILTERS);
    // Session.set('enableDelayedFunctions',false);
    Blaze._allowJavascriptUrls();

    var instance = this;
    instance.isSubsLoaded = new ReactiveVar(false);
    instance.autorun(function(){
        // FlowRouter.watchPathChange()
        var pageno = FlowRouter.getParam('pageno');
        var resperpage = 20;
        var onlyActive = false;//Show only active properties
        try{
            resperpage = FlowRouter.getQueryParam('resperpage');
            onlyActive = FlowRouter.getQueryParam('onlyActive');
        }catch(e){}
        instance.subscribe('Config');
        instance.subscribe('total-MyProperties',{onlyActive:onlyActive});
        instance.subscribe("MyProperties",{viewName: 'MyProperties.view',pageno:pageno,resperpage:resperpage,onlyActive:onlyActive}) ;
        // instance.subscribe('Areas');
        instance.subscribe('userData');
        if(instance.subscriptionsReady()){
            instance.isSubsLoaded.set(true)
            totalResultsCount = Counts.get("total-MyProperties");
            if(!totalResultsCount)instance.showAddProperty.set(true);//if no properties, then show it
        }
    })
    // Session.set('assistanceRequested',false)
    // Meteor.call('getDateFromServer',[],function(error, success){
    //     Session.set('getDateFromServer',success)
    // })
    // Session.set('globalConfig', Collections.Config.findOne());
    // var ret = getProjectData();
    // Session.set('projectData',ret);
})
Template.myProperties.helpers({
    isSubsLoaded:function(){
        return Template.instance().subscriptionsReady();
    },
    userLoggedIn:function(){
        if(Meteor.user())return true;
        return false;
    },
    data : function () {
        if(!Template.instance().subscriptionsReady())return false;
        var user = Meteor.user();
        if(!user) return {
            results: [],
            totalResultsCount:0,
            pagination: getPaginationData(0,1,'',10)
        }
        var selector = {createdByAgent:user._id,isArchived:false};//let limit = 10;
        // debugger;

        var FILTERS = Session.get('globalFILTERS')
        var defaultFilters = getDefaultFilters();

        // var arr = [];
        // if(  FILTERS['homeType'] ){
        //     if(FILTERS['homeType'].length) {
        //         if(FILTERS['homeType'].length != defaultFilters.homeType.length)
        //             selector['homeType'] = FILTERS['homeType'][0]
        //         /*
        //          // var arr = [];
        //          for (var i = 0; i < FILTERS['homeType'].length; i++) {
        //          arr.push({"homeType": FILTERS['homeType'][i]})
        //          console.log("homeType"+ FILTERS['homeType'][i])
        //          }*/
        //         // selector['$or'] = arr;//BUG: this or will over write or of facing; or of homeType will collide with this and
        //         // while logic won't work
        //
        //     }
        // }
        // if(  FILTERS['facing'] ){
        //     if(FILTERS['facing'].length) {
        //         if(FILTERS['facing'].length != defaultFilters.facing.length)
        //             selector['facing'] = FILTERS['facing'][0]
        //         /*
        //          var arr = [];
        //          for (var i = 0; i < FILTERS['facing'].length; i++) {
        //          arr.push({"facing": FILTERS['facing'][i]})
        //          }
        //          // selector['$or'] = arr;//BUG: this or will over write or of homeType; or of homeType will collide with this and
        //          // while logic won't work
        //          */
        //     }
        // }
        // if(arr.length){
        //     selector['$or'] = arr;
        // }
        // if( FILTERS['floor'] ){
        //     var val_l = FILTERS['floor'][0];
        //     var val_h = FILTERS['floor'][1];
        //
        //     if(isNaN(val_l) && isNaN(val_h)){//Both are not valid numbers
        //
        //     }else if(!isNaN(val_l) && isNaN(val_h)){//Low is valid and no upper
        //         selector['floorLevel'] =  { $gte: parseInt(val_l) }
        //     }else if(isNaN(val_l) && !isNaN(val_h)){//Upper is valid and no lower
        //         selector['floorLevel'] =  { $lte: parseInt(val_h) }
        //     }else{//Both are valid
        //         selector['floorLevel'] =  { $gte: parseInt(val_l), $lte: parseInt(val_h) }
        //     }
        // }
        // if( FILTERS['priceRange'] ){
        //     var val_l = FILTERS['priceRange'][0];
        //     var val_h = FILTERS['priceRange'][1];
        //
        //     if(isNaN(val_l) && isNaN(val_h)){//Both are not valid numbers
        //
        //     }else if(!isNaN(val_l) && isNaN(val_h)){//Low is valid and no upper
        //         selector['priceBreakUp.totalAllInclusive'] =  { $gte: parseInt(val_l) }
        //     }else if(isNaN(val_l) && !isNaN(val_h)){//Upper is valid and no lower
        //         selector['priceBreakUp.totalAllInclusive'] =  { $lt: parseInt(val_h) }
        //     }else{//Both are valid
        //         selector['priceBreakUp.totalAllInclusive'] =  { $gte: parseInt(val_l), $lte: parseInt(val_h) }
        //     }
        // }

        /////PAGINATION
        var resultsPerPage = 20;
        var currentPageNo = FlowRouter.current().params.pageno;
        if(!currentPageNo){currentPageNo = 1}
        var skip = (currentPageNo -1) * resultsPerPage;
        var urlBase = 'account/myproperies/';


        var totalResultsCount = Counts.get("total-MyProperties");
        Template.instance().totalResultsCount.set(totalResultsCount)

        var ret = Collections.Properties.find(selector, {
            transform: function(doc) {
                doc.bedroomsCount=0
                // console.log('May be here');
                // console.log(doc)
                if(doc.bedrooms){
                    doc.bedroomsCount = doc.bedrooms.length;
                }
                if(doc.auctionId) {
                    doc.auction = Collections.Auctions.findOne({
                        _id: doc.auctionId
                    });
                }
                return doc;
            },
            // limit: resultsPerPage,
            sort: { updatedAt : -1 },
            // skip: skip
        });



        return {
            results: ret,
            totalResultsCount:totalResultsCount,
            pagination: getPaginationData(totalResultsCount,currentPageNo,urlBase,resultsPerPage)
        };
    },
    showDemoProp:function () {
        var currentPageNo = FlowRouter.current().params.pageno;
        if(!currentPageNo || currentPageNo==1){
            var count = Collections.Properties.find({createdByAgent:'demoproperty',isArchived:false},{limit: 1}).count();
            if(count>0)
            return true;
        }
        return false;
    },
    demoProperty:function () {
        return Collections.Properties.find({createdByAgent:'demoproperty',isArchived:false}, {
            transform: function(doc) {
                doc.bedroomsCount=0
                if(doc.bedrooms){
                    doc.bedroomsCount = doc.bedrooms.length;
                }
                if(doc.auctionId) {
                    doc.auction = Collections.Auctions.findOne({
                        _id: doc.auctionId
                    });
                }
                return doc;
            },
            limit: 1
        })
    },
    showAddProperty: function () {
        if(Session.get('hideAddPropertyForm') ){
            Template.instance().showAddProperty.set(false);
            Session.set('hideAddPropertyForm',false)
            scrollTo('.addPropertyBtn',50,500)
        }else{
            if(!fsClient) {
                import filestack from 'filestack-js';
                const apikey = 'AIPACLEs7ShGwwPh6fMTxz';
                fsClient = filestack.init(apikey, {
                    policy: 'eyJleHBpcnkiOjE4NjE5MjAwMDAsImNhbGwiOlsicGljayIsInJlYWQiLCJzdGF0Iiwid3JpdGUiLCJ3cml0ZVVybCIsInN0b3JlIiwiY29udmVydCIsInJlbW92ZSIsImV4aWYiXX0=',
                    signature: '465e8652c5cef95f44e5858e09d430abea855d98deaeb7425558f2c80d0f4f57'
                });
            }
        }

        return Template.instance().showAddProperty.get();
    },
    showFilters: function(){
        return false;
    },
    projectData : function () {
        // var ret = getProjectData();
        var ret = {};
        // Session.set('projectData',ret);
        return ret;
    },
    filters:function(){
        var data = {}//{"Home Type":["2 BHK"],"Floor":["2 to 15"],"Price Range":["67.45 to 97.45 "]}
        var FILTERS = Session.get('globalFILTERS')
        var defaultFilters = Session.get('projectData');defaultFilters = defaultFilters.filter;
        if( FILTERS['homeType']  ){
            if(FILTERS['homeType'].length) {
                if( !isArraysEqual( defaultFilters.homeType , FILTERS['homeType']) )
                    data['Home Type'] = FILTERS['homeType'];
            }
        }
        if( FILTERS['facing']  ){
            if(FILTERS['facing'].length) {
                if( !isArraysEqual( defaultFilters.facing , FILTERS['facing']) )
                    data['Facing'] = FILTERS['facing'];
            }
        }
        if(  FILTERS['floor'] ){
            var hasLowerLimit = false, hasUpperLimit = false;
            var l1 = parseInt(FILTERS['floor'][0]);
            if(l1 !=0 && l1 != defaultFilters.floor[0])hasLowerLimit = true;

            var l2 = parseInt(FILTERS['floor'][1]);
            if( l2 != defaultFilters.floor[1])hasUpperLimit = true;

            if(hasLowerLimit && !hasUpperLimit){//Only LowerLimit
                data['Floor'] = [ 'More than '+l1 ]
            }else if(!hasLowerLimit && hasUpperLimit){//Only UpperLimit
                data['Floor'] = [ 'Below '+l2 ]
            }else if(hasLowerLimit && hasUpperLimit){//Both are there
                data['Floor'] = [ 'Between '+l1+" and "+l2 ]
            }else{}//Both are not there. So don't show filter.

        }

        if(  FILTERS['priceRange'] ){
            var hasLowerLimit = false, hasUpperLimit = false;
            var l1 = parseInt(FILTERS['priceRange'][0]);
            if(l1 !=0 && l1 != defaultFilters.priceRange[0])hasLowerLimit = true;

            var l2 = parseInt(FILTERS['priceRange'][1]);
            if( l2 != defaultFilters.priceRange[1])hasUpperLimit = true;

            if(hasLowerLimit && !hasUpperLimit){//Only LowerLimit
                data['Price Range'] = [ 'More than '+numDifferentiation(l1) ]
            }else if(!hasLowerLimit && hasUpperLimit){//Only UpperLimit
                data['Price Range'] = [ 'Below '+numDifferentiation(l2) ]
            }else if(hasLowerLimit && hasUpperLimit){//Both are there
                data['Price Range'] = [ 'Between '+numDifferentiation(l1)+" to "+numDifferentiation(l2) ]
            }else{}//Both are not there. So don't show filter.

        }
        //if( FILTERS['priceRange'] ){
        //  data['Price Range'] =  [ numDifferentiation(FILTERS['priceRange'][0]) +" to "+ numDifferentiation(FILTERS['priceRange'][1]) ]
        //}
        applyClearFiltersEvent();

        return {
            data:data,
            count: Object.keys(data).length
        };
    },
    // time: function(){
    //
    //     var projectData = Session.get('projectData');
    //     var timestamp = TimeSync.serverTime(null, 30000);
    //     if(!projectData.auction.endDate || !timestamp)return;
    //
    //
    //     var dend = Date.parse(projectData.auction.endDate);
    //     var timeDiff = dend - timestamp ;
    //     if(timeDiff<0)return false;
    //
    //     var day = Math.floor(timeDiff / (1000 * 3600 * 24))
    //     var hour = Math.floor(timeDiff / (1000 * 3600 ))
    //     var min = Math.floor(timeDiff / (1000 * 60 ) )
    //     hour = hour - (day * 24);
    //     min = min - (day * 24* 60) - (hour * 60);
    //     return {"day":day,"hour":hour,"min":min}
    // },
    isAuctionClosed:function(){
        // var timestamp = TimeSync.serverTime(null, 30000);
        var timestamp = new Date();
        var projectData = Session.get('projectData');
        var dend = Date.parse(projectData.auction.endDate);
        var timeDiff = dend - timestamp;
        if(timeDiff<0){
            return true;
        }
        return false;
    },
    numDifferentiation: function(data){
        return numDifferentiation(data);
    },
    agentStats: function(){
        var user = Meteor.user();
        if(user) {
            if(!user.profile.activeAuctions)user.profile.activeAuctions=0
            if(!user.profile.totalAuctions)user.profile.totalAuctions=0
            if(!user.profile.totalBidsReceived)user.profile.totalBidsReceived=0
            if(!user.profile.bidsReceivedActiveAuctions)user.profile.bidsReceivedActiveAuctions=0
            if(!user.profile.bidProfitActive)user.profile.bidProfitActive=0
            if(!user.profile.totalBidProfit)user.profile.totalBidProfit=0
            return {
                activeAuctions:user.profile.activeAuctions,
                totalAuctions:user.profile.totalAuctions,
                totalBidsReceived:user.profile.totalBidsReceived,
                bidsReceivedActiveAuctions:user.profile.bidsReceivedActiveAuctions,
                bidProfit:user.profile.bidProfitActive,
                totalBidProfit:(user.profile.totalBidProfit*12)
            };
        }
        return {
            activeAuctions:0,
            totalAuctions:0,
            totalBidsReceived:0,
            bidsReceivedActiveAuctions:0,
            bidProfit:0,
            totalBidProfit:0
        };
    }

})
Template.propertyList.onCreated(function(){
    this.expanded = new ReactiveVar( false );
    this.showAddAuctionForm = new ReactiveVar( false );
    
    var instance = this;
    instance.isSubsLoaded = new ReactiveVar(false);
    instance.isSubsLoadedAttempted = new ReactiveVar(false);
    //Meteor.default_connection._subscriptions //To get the list of scbscriptions
    instance.autorun(function(){
        try{
            if(instance.data.auctionId && !instance.data.auction){
                instance.isSubsLoadedAttempted.set(true)
                instance.subscribe('Advertisement',instance.data.auctionId);
            }else if(instance.data.auction){
                instance.isSubsLoaded.set(true)
                instance.isSubsLoadedAttempted.set(true)
            }
            if(instance.subscriptionsReady()){
                instance.isSubsLoaded.set(true)
            }
        }catch(e){
            instance.isSubsLoaded.set(true)
        }
    })
})
Template.propertyList.helpers({
    isSubsLoaded:function(){
        return Template.instance().subscriptionsReady();
    },
    expanded: function(){
        return Template.instance().expanded.get() ;
    },
    showAddAuctionForm: function () {
        return Template.instance().showAddAuctionForm.get();
    },
    numDifferentiation: function(data){
        return numDifferentiation(data);
    },
    auction:function(){
        if(this.auction) return this.auction;
        if(this.auctionId){
            let ret = Collections.Auctions.find({_id: this.auctionId}).fetch();
            let attempt = Template.instance().isSubsLoadedAttempted.get()
            
            if(this.auctionId && !ret.length && !attempt){
                Template.instance().subscribe('Advertisement',this.auctionId);
                Template.instance().isSubsLoadedAttempted.set(true);
            }
    
            if(ret) return ret[0];
        }
        return false;
    },
    lettingprintviewData:function () {
        if(!this.auction)return ""
        return this.auction.lettingAuctionCode
        // if(!this.auction)return {key:""}
        // return {key:this.auction.lettingAuctionCode}
    },
    showEditPropertyForm:function(){
        return FlowRouter.url('account/editproperty',{id:this._id})
    }
})
Template.propertyList.events({
    "click .see_more_btn": function (event, template) {
        if(template.expanded.get() )template.expanded.set(false);
        else template.expanded.set(true);
    },
    "click .ActivateBtn": function (event, template) {
        if(!template.showAddAuctionForm.get() )template.showAddAuctionForm.set(true);
    },
    "click .showEditPropertyForm": function (event, template) {
        var prevRoute = {name: FlowRouter.current().route.name,args:{pageno:FlowRouter.current().params.pageno,scrollTo:0} }
        Session.set('prevRoute',prevRoute);

        // FlowRouter.go('account/editproperty',{id:this._id})

    },
    "click .managePropertyLink": function (event, template) {
        var prevRoute = {name: FlowRouter.current().route.name,args:{pageno:FlowRouter.current().params.pageno,scrollTo:0} }
        Session.set('prevRoute',prevRoute);

        FlowRouter.go('account/propertyManage',{id:this._id})
    },
    "click .hideAddAuctionForm": function (event, template) {
        if(template.showAddAuctionForm.get() )template.showAddAuctionForm.set(false);
        propId = this._id;
        scrollTo('#property_'+propId,0,700)

    },
    "click .viewApplications": function (event, template) {
        var prevRoute = {name: FlowRouter.current().route.name,args:{pageno:FlowRouter.current().params.pageno} }
        Session.set('prevRoute',prevRoute);

        FlowRouter.go("account/propertyApplications",{id:this._id});
    },
    "click .showCopyDlg": function (event, template) {
        let user = Meteor.user();
        let sluggedName = slugifyEmailAddress(user.profile.name);
        if(!sluggedName)sluggedName = 'rent'
        let email = sluggedName+'-let-'+this.auction.lettingAuctionCode.toLowerCase()+"@spotmycrib.ie";
        $('#agentPropertyEmailField').val(email);

        var url = FlowRouter.url('letting',{key:this.auction.lettingAuctionCode})
        $('#propertyLinkField').val(url);
        $.fancybox({
            'padding': 0,
            'href': '#propertyLinkDlg',
            afterShow:function(template){
                $('#agentPropertyEmailField').select();
                $('#propertyLinkDlg .copyEmailBtn').unbind().bind('click',function () {
                    $('#agentPropertyEmailField').select();

                    try {
                        var successful = document.execCommand('copy');
                        var msg = successful ? 'successful' : 'unsuccessful';
                        // console.log('Copying text command was ' + msg);
                        $.fancybox.close()
                    } catch (err) {
                        console.log('Oops, unable to copy');
                    }
                    ga('send', 'event', 'myPropertiesPage', 'copyShareEmail', 'copyShareEmail Btn Clicked');
                })
                $('#propertyLinkDlg .copyLinkBtn').unbind().bind('click',function () {
                    $('#propertyLinkField').select();

                    try {
                        var successful = document.execCommand('copy');
                        var msg = successful ? 'successful' : 'unsuccessful';
                        // console.log('Copying text command was ' + msg);
                        $.fancybox.close()
                    } catch (err) {
                        console.log('Oops, unable to copy');
                    }
                    ga('send', 'event', 'myPropertiesPage', 'copyShareLink', 'copyShareLink Btn Clicked');
                })
                $('#propertyLinkDlg .cancelBtn').unbind().bind('click',function () {
                    $.fancybox.close()
                })
            },
        });

    },
});
Template.addPropertyForm.onCreated(function(){
    if(!Session.get('addPropertyImages')) {// Lets do this. Anyways we have delete button.
        Session.set('addPropertyImages', []);
        S3.collection.remove({})

        var user = Meteor.user();
        try {
            if (user.profile.session.addproperty.gallery){
                Session.set('addPropertyImages', user.profile.session.addproperty.gallery);
            }
        }catch(e){}

    }
    this.numBedRoomCount = new ReactiveVar( 0 );
    this.addPropertyFormSaving = new ReactiveVar( false );
    this.countySelected = new ReactiveVar( false );
    saveAndAdvertise=false;

    var instance = this;
    instance.isSubsLoaded = new ReactiveVar(false);
    instance.autorun(function(){
        if(instance.countySelected.get()){
            instance.isSubsLoaded.set(false)
            instance.subscribe('Areas','','',instance.countySelected.get(),'','');
        }
        if(instance.subscriptionsReady()){
            instance.isSubsLoaded.set(true)
        }
    })
})
Template.addPropertyForm.helpers({
    isSA:function(){
        var user = Meteor.user();
        if(user.isSA)return true;
        return false;
    },
    countries:function(){
        return [{label: "Ireland", value: "Ireland", selected:"selected"}];//Both capital
    },
    counties:function(){
        let staticCounties = ["Carlow", "Cavan", "Clare", "Cork", "Donegal", "Dublin", "Galway", "Kerry", "Kildare", "Kilkenny", "Laois", "Leitrim", "Limerick", "Longford", "Louth", "Mayo", "Meath", "Monaghan", "Offaly", "Roscommon", "Sligo", "Tipperary", "Waterford", "Westmeath", "Wexford", "Wicklow"];
        let ret = []
        for(let i=0;i< staticCounties.length;i++){
            if(!staticCounties[i])continue;
            ret.push({label: titleCase(staticCounties[i]), value: staticCounties[i] })
        }
        return ret;
        // return [{label: "Dublin", value: "dublin"}];//Both capital
        // var distinctEntries = _.uniq(Collections.Areas.find({}, {
        //     sort: {County: 1}, fields: {County: true}
        // }).fetch().map(function(x) {
        //     return x.County;
        // }), true);
        // var ret = []
        // for(var i=0;i< distinctEntries.length;i++){
        //     if(!distinctEntries[i])continue;
        //     ret.push({label: titleCase(distinctEntries[i]), value: distinctEntries[i] })
        // }
        // return ret;
    },
    areas:function(){
        var countySelected = Template.instance().countySelected.get();
        if(!countySelected){
            var doc = Collections.Properties.findOne(); if(!doc)return [];
            Template.instance().countySelected.set(doc.address.county);
            countySelected = doc.address.county;
        }

        var distinctEntries = _.uniq(Collections.Areas.find({County:countySelected}, {
            sort: {Area: 1}, fields: {Area: true}
        }).fetch().map(function(x) {
            return x.Area;
        }), true);
        var ret = []
        for(var i=0;i< distinctEntries.length;i++){
            if(!distinctEntries[i])continue;
            ret.push({label: titleCase(distinctEntries[i]), value: distinctEntries[i] })
        }
        return ret;
    },
    propertyTypes:function(){
        var Config = Collections.Config.find().fetch();Config = Config[0];
        var ret = []
        for(var i=0;i< Config.propertyType.length;i++){
            ret.push({label: titleCase(Config.propertyType[i].name), value: Config.propertyType[i].value})
        }
        return ret;
    },
    numBedRoomCount:function () {
        var c = Template.instance().numBedRoomCount.get();
        if(c<100)return Template.instance().numBedRoomCount.get();
        else return 0;
    },
    addPropertyFormSaving:function () {
        return Template.instance().addPropertyFormSaving.get();
    },
    ensuiteLoop: function(count){
        var countArr = [];
        for (var i=0; i<count; i++){
            countArr.push({i:i+1});
        }
        return countArr;
    }
})
Template.addPropertyForm.events({
    "click .openFileUploader":function (event, template) {
        event.preventDefault();
        openPicker();
        // filename
        //     :
        //     "webcam-1/12/2018, 6:53:25 PM.png"
        // handle
        //     :
        //     "G8lStVqHTiGnwxof6d5y"
        // mimetype
        //     :
        //     "image/png"
        // originalFile
        //     :
        // {name: "webcam-1/12/2018, 6:53:25 PM.png", type: "image/png", size: 630585}
        // originalPath
        //     :
        //     "webcam-1/12/2018, 6:53:25 PM.png"
        // size
        //     :
        //     629612
        // source
        //     :
        //     "local_file_system"
        // status
        //     :
        //     "Stored"
        // uploadId
        //     :
        //     "ba2fe36e9fd182ec0cb88236d676cefad"
        // url
        //     :
        //     "https://cdn.filestackcontent.com
        return;
    },
    'change .selectPropertyImages': function(event, template) {
        var files = event.target.files;
        S3.upload({
            files:files,
            path:"propertyImagesLarge"
        },function(e,r){
            if(e)throw new Meteor.Error('Upload failed ', e);
            var addPropertyImages = Session.get('addPropertyImages');
            addPropertyImages.push(r);
            Session.set('addPropertyImages',addPropertyImages);
            console.log(r);
        });
        // for (var i = 0, ln = files.length; i < ln; i++) {
        //     propertyImagesCollection.insert(files[i], function (err, fileObj) {
        //         // Inserted new doc with ID fileObj._id, and kicked off the data upload using HTTP
        //         console.log(fileObj);
        //         var cursor = propertyImagesCollection.find(fileObj._id);
        //
        //         var liveQuery = cursor.observe({
        //             changed: function(newImage, oldImage) {
        //
        //                 console.log("Inside live query ");
        //                 console.log(newImage);
        //                 if (newImage.isUploaded()) {
        //                     liveQuery.stop();
        //
        //                     // Call your onUploaded callback here...
        //                 }
        //             }
        //         });
        //     });
        // }
    },
    'change .countySelected': function(event, template) {
        template.countySelected.set(event.target.value);
    },
    'change .url': function(event, template) {
        var url = event.target.value;
        if(!url)return false;//Empty url

        Meteor.call('importPost',url,function(error,doc){
            if(error){
                console.log(error)
                var tmp =  Session.get("showErrorDlg");if(!tmp)tmp=[];
                var msg = 'An error occurred.';
                if(error.reason)msg += ' '+error.reason+'.'
                else if(error.message)msg += ' '+error.message+'.'
                tmp.push(msg);
                Session.set("showErrorDlg",tmp)
                return;
            }

            $( "input[name='address.address']" ).val(doc.address.address);
            $( "input[name='price']" ).val(doc.rent);
            $( "select[name='address.county']" ).val(doc.address.county).trigger('change');
            setTimeout(function(){$( "select[name='address.area']" ).val(doc.address.area);},2000)
            setTimeout(function(){$( "select[name='address.area']" ).val(doc.address.area);},4000)
            $( "select[name='type']" ).val(doc.type.toLowerCase());
            $( "select[name='furnished']" ).val(doc.furnished.toString());
            $( "input[name='baths']" ).val(doc.baths);
            $( "input[name='numBedRoomCount']" ).val(doc.numBedRoomCount).trigger('change');
            $( "textarea[name='about']" ).val(doc.about).trigger('keyup');
            $( "input[name='contacts.0.name']" ).val(doc.contacts[0].name);
            var number = "";
            try{
                number = doc.contacts[0].phone
            }catch(e){}
            if(number){
                try{
                    number = atob(number)
                    number = number.replace(/\s+/g, '')
                }catch(e){}
                $( "input[name='contacts.0.phone']" ).val(number);
            }
            if(doc.amenities){
                for (var i = 0; i < doc.amenities.length; i++) {
                    $("input[value='"+doc.amenities[i]+"']").prop('checked', true);
                }
            }
            var tmp = {};
            if(doc.gallery) {
                var addPropertyImages = Session.get('addPropertyImages');if(!addPropertyImages)addPropertyImages=[]
                var galleryLen = doc.gallery.length,galleryStoredLen=0;
                // var galleryLen = 1,galleryStoredLen=0;
                for (var i = 0; i < doc.gallery.length; i++) {
                    // if(i>0)break;
                    fsClient.storeURL(doc.gallery[i],{filename: 'Image '+i+1}).then(function(response) {
                            console.log(JSON.stringify(response));
                        // {"url":"https://cdn.filestackcontent.com/QH10tMaGTrSgFweORrip","size":111949,"type":"image/jpeg","filename":"Image 01","handle":"QH10tMaGTrSgFweORrip"}
                            tmp = {
                                name: response.filename,
                                url: response.url,
                                handle: response.handle,
                                mimetype: response.mimetype,
                                // originalFile: doc.gallery[i],
                                // originalPath: doc.gallery[i],
                                size: response.size,
                                // source: response.source,
                                // status: response.status,
                                // uploadId: response.uploadId
                            }
                            console.log(tmp)
                            addPropertyImages.push(tmp);
                            galleryStoredLen++;
                            if(galleryStoredLen==galleryLen){//Now its fully imported
                                Session.set('addPropertyImages', addPropertyImages);
                                updateGalleriesInProfile(addPropertyImages, function (err, res) {//No need to show error. Because its just a backup.
                                    var addPropertyImages = Session.get('addPropertyImages');
                                    console.log("Current Count: " + addPropertyImages.length)
                                });
                            }
                        }
                    );
                }



            }

        })
    },
    'keyup .autoGrowTA': function(event, template) {
        var element = event.target;
        element.style.height = "5px";
        if(element.scrollHeight<310)element.style.height = (element.scrollHeight)+"px";
        else element.style.height = "310px";
    },
    'change #numBedRoomCount': function(event, template) {
        var numBedRoomCount = parseInt($(event.target).val());
        if(isNaN(numBedRoomCount))return;
        Template.instance().numBedRoomCount.set(numBedRoomCount);
        t1 = template;
        setTimeout(function () {
            t1.$('#addPropertyFormCF').validate();
        },500)
    },
    'submit form': function(event){
        event.preventDefault();
    },
    "click .addPropertyFormSaveAdvertiseBtn": function(event, template) {
        saveAndAdvertise=true;
        $('#addPropertyFormCF').submit();
    },
    "click .addPropertyFormCancelBtn": function(event, template) {
        Session.set('hideAddPropertyForm',true)
    },
    'change input[name=price]':function(event, template){
        if(event.target.value){
            var tmp = event.target.value.split('.');tmp=tmp[0]//No decimals
            tmp = tmp.trim().match(/\d+/g)
            if(!Array.isArray(tmp))event.target.value = '';
            event.target.value = tmp.join('');
        }
    },
});
Template.addPropertyForm.onRendered(function () {
    // this.$('#addPropertyFormCF').validate();
    addPropertyFormSaving = this.addPropertyFormSaving
    var validator = this.$('#addPropertyFormCF').validate({
        submitHandler: function(event){
            addPropertyFormSaving.set(true);
            console.log("You just submitted the 'addPropertyForm' form.");
            Meteor.call('addProperty',$('#addPropertyFormCF').serializeArray(),function (error, propertyId) {

                addPropertyFormSaving.set(false);
                if(error){
                    console.log(error)
                    //    validator.showErrors({
                    //         email: error.reason
                    //     });
                    var tmp =  Session.get("showErrorDlg");if(!tmp)tmp=[];
                    var msg = 'An error occurred.';
                    if(error.reason)msg += ' '+error.reason+'.'
                    else if(error.message)msg += ' '+error.message+'.'
                    tmp.push(msg);
                    Session.set("showErrorDlg",tmp)
                    return;
                }
                if(saveAndAdvertise){
                    Meteor.call('addAdvertisement',$('#addPropertyFormCF').serializeArray(),propertyId,function (error, auctionId) {

                        if(error){
                            console.log(error)
                            //    validator.showErrors({
                            //         email: error.reason
                            //     });
                            var tmp =  Session.get("showErrorDlg");if(!tmp)tmp=[];
                            var msg = 'An error occurred.';
                            if(error.reason)msg += ' '+error.reason+'.'
                            else if(error.message)msg += ' '+error.message+'.'
                            tmp.push(msg);
                            Session.set("showErrorDlg",tmp)
                            return;
                        }
                        console.log('addAdvertisement created successfully')
                        console.log(auctionId);
                        saveAndAdvertise=false;
                    })
                }

                var addPropertyImages = Session.get('addPropertyImages');
                updateGalleriesInServer(addPropertyImages, propertyId, function (err, res) {
                    Meteor.call('updateGalleriesInUserProfile', [], function(){console.log('Reset the profile backup');});//Reset the profile backup
                    if (err) {
                        console.log(err);
                    } else {
                        Session.set('addPropertyImages',[]);
                        S3.collection.remove({})
                    }
                })
                Session.set('hideAddPropertyForm',true)
            })
        }
    });
})


Template.advertiseForm.onCreated(function(){
    this.advertiseFormSaving = new ReactiveVar( false );
})
Template.advertiseForm.helpers({
    advertiseFormSaving:function () {
        return Template.instance().advertiseFormSaving.get();
    }
})
Template.advertiseForm.events({
    'submit form': function(event){
        event.preventDefault();
    },
    'change input[name=price]':function(event, template){
        if(event.target.value){
            var tmp = event.target.value.split('.');tmp=tmp[0]//No decimals
            tmp = tmp.trim().match(/\d+/g)
            if(!Array.isArray(tmp))event.target.value = '';
            event.target.value = tmp.join('');
        }
    },
    "click .advertiseFormCancelBtn": function(event, template) {
        parentIns = template.view.parentView.parentView.parentView.templateInstance();
        parentIns.showAddAuctionForm.set(false);
    }
});

Template.advertiseForm.onRendered(function () {
    this.$('#readyFrom').datetimepicker();

    advertiseFormSaving = this.advertiseFormSaving
    parentIns = this.view.parentView.parentView.parentView.templateInstance();

    var validator = this.$('#advertiseFormCF').validate({
        submitHandler: function(event){
            advertiseFormSaving.set(true);
            // console.log("You just submitted the 'advertise' form.");
            Meteor.call('addAdvertisement',$('#advertiseFormCF').serializeArray(),function (error, result) {

                advertiseFormSaving.set(false);
                if(error){
                    console.log(error)
                    //    validator.showErrors({
                    //         email: error.reason
                    //     });
                    var tmp =  Session.get("showErrorDlg");if(!tmp)tmp=[];
                    var msg = 'An error occurred.';
                    if(error.reason)msg += ' '+error.reason+'.'
                    else if(error.message)msg += ' '+error.message+'.'
                    tmp.push(msg);
                    Session.set("showErrorDlg",tmp)
                    return;
                }
                // console.log('addAdvertisement completed successfully')
                console.log(result);
                auctionId = result;
                parentIns.showAddAuctionForm.set(false);
                scrollTo('.property_auction_'+auctionId,-100,700)
            })
        }
    });
})
Template.imageView.helpers({
    images: function () {
        // return S3.collection.find();
        return Session.get('addPropertyImages');
    }
});
Template.imgTag.events({
    "click .editImgBtn": function (event, template) {

        var addPropertyImages = Session.get('addPropertyImages');

        var newArr = [];
        if(!addPropertyImages)return;
        if(!addPropertyImages.length)return;

        index = getIndexByHandle(addPropertyImages, this.handle);

        newArr.push(addPropertyImages[index].url)//put it at first

        const pickOptions = {
            transformations:{
                crop:{      force:true,
                    aspectRatio:1.333},
                rotate:true},
            accept: 'image/*',
            imageMax:[800,600],
            "uploadInBackground": false//Disabled because, bg upload causes 2 uploads towards filestack limits
        };
        fsClient.cropFiles(newArr,pickOptions).then( (response) => {
            var addPropertyImages = Session.get('addPropertyImages');

            //if its conversion from old amazon to new filestack, then it will create a new file, so delete the old file seperatly and insert a new file seperatly.

            if(!response.filesUploaded.length){
                var tmp =  Session.get("showErrorDlg");if(!tmp)tmp=[];
                tmp.push("Edit failed: please try again, contact us if needed.");
                Session.set("showErrorDlg",tmp)
                return;
            }

            fsClient.remove(addPropertyImages[index].handle).then(function(result){
                if(!result.ok){
                    console.log(result);//Not required to show error to user as this is just edit. If the image appears, he will click delete again
                }
                console.log('In fs remove result');
                var addPropertyImages = Session.get('addPropertyImages');
                addPropertyImages.splice(index, 1);
                Session.set('addPropertyImages',addPropertyImages);

                updateGalleriesInProfile(addPropertyImages,function (err, res) {//No need to show error. Because its just a backup.
                    var addPropertyImages = Session.get('addPropertyImages');
                    console.log("Current Count: " + addPropertyImages.length)
                });
            });



            var tmp = {};
            for(var i =0;i<response.filesUploaded.length;i++){
                tmp = {
                    name: response.filesUploaded[i].filename,
                    url: response.filesUploaded[i].url,
                    handle: response.filesUploaded[i].handle,
                    mimetype: response.filesUploaded[i].mimetype,
                    originalFile: response.filesUploaded[i].originalFile,
                    originalPath: response.filesUploaded[i].originalPath,
                    size: response.filesUploaded[i].size,
                    source: response.filesUploaded[i].source,
                    status: response.filesUploaded[i].status,
                    uploadId: response.filesUploaded[i].uploadId
                }
                // addPropertyImages.push(tmp);
                addPropertyImages.splice(index+1, 0, tmp);//insert at the index place where its deleted.
            }

            //Logic to insert new file.
            Session.set('addPropertyImages',addPropertyImages);

            updateGalleriesInProfile(addPropertyImages, function (err, res) {//No need to show error. Because its just a backup.
                var addPropertyImages = Session.get('addPropertyImages');
                console.log("Current Count: " + addPropertyImages.length)
            });
        });


    },
    "click .deleteImgBtn": function (event, template) {

        var addPropertyImages = Session.get('addPropertyImages');
        index = getIndexByHandle(addPropertyImages, this.handle);

        fsClient.remove(this.handle).then(function(result){
            debugger;
            if(!result.ok){
                console.log(result);
                var tmp =  Session.get("showErrorDlg");if(!tmp)tmp=[];
                tmp.push("Deletion failed: please check your internet connection, contact us if needed.");
                Session.set("showErrorDlg",tmp)
                return;
            }

            var addPropertyImages = Session.get('addPropertyImages');
            addPropertyImages.splice(index, 1);
            Session.set('addPropertyImages',addPropertyImages);

            updateGalleriesInProfile(addPropertyImages, function (err, res) {//No need to show error. Because its just a backup.
                var addPropertyImages = Session.get('addPropertyImages');
                console.log("Current Count: " + addPropertyImages.length)
            });
        });



    },
    "click .deleteImgBtnOld": function (event, template) {
        console.log(this);
        var addPropertyImages = Session.get('addPropertyImages');
        index = getIndex(addPropertyImages, this._id);
        // debugger;
        S3.delete(this.relative_url,function(error, result){
            var addPropertyImages = Session.get('addPropertyImages');
            S3.collection.remove(addPropertyImages[index]._id);
            addPropertyImages.splice(index, 1);
            Session.set('addPropertyImages',addPropertyImages);
        })

    }
});



function getIndex(myArray, fileId){
    for (var i=0; i < myArray.length; i++) {
        if (myArray[i]._id === fileId) {
            return i;
        }
    }
}





Template.myProperties.onRendered(function() {
    try{
        jQuery("html,body").animate({scrollTop: 0}, 250);
    }catch(e){
        document.body.scrollTop = document.documentElement.scrollTop = 0;
    }

    var prevRoute = Session.get('prevRoute');
    if(prevRoute){
        try{
        if(prevRoute)
        if(prevRoute.instructions)
        if(prevRoute.instructions.openPostNewProp){
            Template.instance().showAddProperty.set(true);
            setTimeout(function () {
                jQuery("html,body").animate({scrollTop: 0}, 250);
            },500)
        }}catch(e){console.log(e);}
    }

})
function updateQueryStringParameter(uri, key, value) {
    var re = new RegExp("([?&])" + key + "=.*?(&|$)", "i");
    var separator = uri.indexOf('?') !== -1 ? "&" : "?";
    if (uri.match(re)) {
        return uri.replace(re, '$1' + key + "=" + value + '$2');
    }
    else {
        return uri + separator + key + "=" + value;
    }
}
clearFiltersEvent = function(){
    $('.clearFilterBtn').unbind().click(function(){
        var val = $(this).closest('span').attr('val');
        var key = $(this).closest('h5').attr('key');
        var FILTERS = Session.get('globalFILTERS');
        var filterDefaults = Session.get('projectData');
        filterDefaults = filterDefaults.filter;

        // console.log(FILTERS);
        if(key == "Home Type"){
            var array = FILTERS["homeType"]
            var index = array.indexOf(val);
            if (index > -1) {
                array.splice(index, 1);
                FILTERS["homeType"]=array;
            }
        }
        else if(key == "Facing"){
            var array = FILTERS["facing"]
            var index = array.indexOf(val);
            if (index > -1) {
                array.splice(index, 1);
                FILTERS["facing"]=array;
            }
        }else if(key == "Price Range"){
            //if(FILTERS["priceRange"][0]==val ){
            //  FILTERS["priceRange"][0] = filterDefaults.priceRange[0]
            //}else{
            //  FILTERS["priceRange"][1] = filterDefaults.priceRange[1]
            //}
            FILTERS["priceRange"][0] = filterDefaults.priceRange[0]
            FILTERS["priceRange"][1] = filterDefaults.priceRange[1]


        }else if(key == "Floor"){
            if(FILTERS["floor"][0]==val ){
                FILTERS["floor"][0] = filterDefaults.floor[0]
            }else{
                FILTERS["floor"][1] = filterDefaults.floor[1]
            }
        }

        //Session.set('globalFILTERS', FILTERS);
        setFilters(FILTERS);
    })
}
applyClearFiltersEvent = function(){
    setTimeout(clearFiltersEvent, 1000);
    setTimeout(clearFiltersEvent, 3000);

}
function applyFilters(){
    console.log('event applyFilters jquery')
    var floorLevelDOM = document.getElementById('range-input');
    var priceRangeDOM = document.getElementById('range-input1');
    var tmp = $('.filterUnitType').val();
    if(tmp == 'any')tmp = [];
    else tmp = [tmp]
    globalFILTERS.homeType = tmp;
    var tmp = $('.filterUnitFacing').val();
    if(tmp == 'any')tmp = [];
    else tmp = [tmp]
    globalFILTERS.facing = tmp;
    globalFILTERS.floor = floorLevelDOM.noUiSlider.get();
    globalFILTERS.priceRange = priceRangeDOM.noUiSlider.get();
    // console.log(globalFILTERS);
    setFilters(globalFILTERS);
    $.fancybox.close();
    applyClearFiltersEvent();
}
function applyFilterValues(){
    // console.log('event applyFiltersValues jquery')
    var floorLevelDOM = document.getElementById('range-input');
    var priceRangeDOM = document.getElementById('range-input1');
    var floor = floorLevelDOM.noUiSlider.get();
    var priceRange = priceRangeDOM.noUiSlider.get();
    $('.filterS1l').html(floor[0])
    $('.filterS1h').html(floor[1])
    $('.filterS2l').html(numDifferentiation(priceRange[0] ))
    $('.filterS2h').html(numDifferentiation(priceRange[1] ))

}
function delayedCall(functionName){
    setTimeout(functionName,3000);
}
function isArraysEqual(array1,array2){
    var is_same = (array1.length == array2.length) && array1.every(function(element, index) {
            return element === array2[index];
        });
    return is_same;
}
callDelayedFunctions = function(){
    setTimeout(delayedFunctions, 2000);
}
function delayedFunctions(){
    Session.set('enableDelayedFunctions',true)
    $('.fullyConfirmBlgOKBtn').unbind().click(function(){
        console.log('fullyConfirmBlgOKBtn called');
        Session.set('showConfirmFancyBox',false)
        FlowRouter.query.clear();
        $.fancybox.close();
        $('.fancybox-overlay').hide();


        setTimeout(function(){
            var unitid = Session.get('adjustAutoExpandToUnitID');
            if(unitid){
                scrollTo('.has-error',0,500)
                setTimeout(function(){$('html,body').animate({scrollTop: $('#unit_'+unitid).offset().top }, 1000)}, 1000)
                Session.set('adjustAutoExpandToUnitID','')
            }
        },2000)



    })
}
function mybidsJqueryEvents(){
    $('.payNowBtn').unbind().click(function(){
        console.log("jquery event payNowBtn")

        var redirectURL = FlowRouter.current().originalUrl;
        if(redirectURL.indexOf('http:') == -1) {
            var redirectURL = Meteor.absoluteUrl() + FlowRouter.current().originalUrl.substring(1);
        }
        var bidId = $(this).attr('bidid');
        Meteor.call("getUnitConfirmationPaymentURL",[redirectURL,bidId], function(error, result){
            if(error){
                return;
            }
            window.location.href = result;
        })
    })
    $('.withdrawConfirmBtn').unbind().click(function(){
        console.log("jquery event withdrawBtn")
        var bidId = $(this).attr('bidid');
        Meteor.call("withdrawBid",[bidId], function(error, result){
            if(error){
                return;
            }
            $.fancybox.close();
        })
    })
    $('.cancelBtn').unbind().click(function(){
        console.log('event cancelBtn jquery')
        $.fancybox.close();
    })
}

function getPriceBreakUp(unit,ratePerSqFt){

    var pricing = unit.priceBreakUp
    var electricityMultiplier = pricing.statutoryGovtCharges.electricityMultiplier;
    var constructionRateForVAT = pricing.statutoryGovtCharges.constructionRateForVAT;
    if(!electricityMultiplier)electricityMultiplier = 140;
    if(!constructionRateForVAT)constructionRateForVAT = 2100;
    if(!pricing.landCost)pricing.landCost = 2091;

    unit.superBuiltUpArea = parseFloat(unit.superBuiltUpArea)
    ratePerSqFt = parseFloat(ratePerSqFt)
    pricing.landCost = parseFloat(pricing.landCost)
    electricityMultiplier = parseFloat(electricityMultiplier)
    constructionRateForVAT = parseFloat(constructionRateForVAT)
    pricing.basicUnitCost.floorRaiseCharge = parseFloat(pricing.basicUnitCost.floorRaiseCharge)
    pricing.basicUnitCost.plcCharge = parseFloat(pricing.basicUnitCost.plcCharge)
    pricing.basicUnitCost.floorRaiseCharge = parseFloat(pricing.basicUnitCost.floorRaiseCharge);
    pricing.basicUnitCost.plcCharge = parseFloat(pricing.basicUnitCost.plcCharge);
    pricing.basicUnitCost.totalBasicRatepsft = parseFloat(pricing.basicUnitCost.totalBasicRatepsft)
    pricing.basicUnitCost.total = parseFloat(pricing.basicUnitCost.total)
    pricing.agreementValue.infrastructureValue = parseFloat(pricing.agreementValue.infrastructureValue)
    pricing.agreementValue.clubHouseCharges = parseFloat(pricing.agreementValue.clubHouseCharges)
    pricing.agreementValue.total = parseFloat(pricing.agreementValue.total)
    pricing.otherCharges.advanceMaintainence = parseFloat(pricing.otherCharges.advanceMaintainence)
    pricing.otherCharges.generatorBackup = parseFloat(pricing.otherCharges.generatorBackup)
    pricing.otherCharges.builderCharges = parseFloat(pricing.otherCharges.builderCharges)
    pricing.otherCharges.total = parseFloat(pricing.otherCharges.total)
    pricing.statutoryGovtCharges.serviceTax = parseFloat(pricing.statutoryGovtCharges.serviceTax)
    pricing.statutoryGovtCharges.vat = parseFloat(pricing.statutoryGovtCharges.vat)
    pricing.statutoryGovtCharges.labourCess = parseFloat(pricing.statutoryGovtCharges.labourCess)
    pricing.statutoryGovtCharges.electricityCharges = parseFloat(pricing.statutoryGovtCharges.electricityCharges)
    pricing.statutoryGovtCharges.stampDuty = parseFloat(pricing.statutoryGovtCharges.stampDuty)
    pricing.statutoryGovtCharges.stampPaperCharges = parseFloat(pricing.statutoryGovtCharges.stampPaperCharges);
    pricing.statutoryGovtCharges.legalCharges = parseFloat(pricing.statutoryGovtCharges.legalCharges);
    pricing.statutoryGovtCharges.otherStatutoryCharges = parseFloat(pricing.statutoryGovtCharges.otherStatutoryCharges);
    pricing.statutoryGovtCharges.total = parseFloat(pricing.statutoryGovtCharges.total);
    pricing.totalAllInclusive = parseFloat(pricing.totalAllInclusive);

    pricing.basicUnitCost.totalBasicRatepsft = ratePerSqFt + pricing.basicUnitCost.floorRaiseCharge + pricing.basicUnitCost.plcCharge;
    pricing.basicUnitCost.total = unit.superBuiltUpArea * pricing.basicUnitCost.totalBasicRatepsft


    pricing.agreementValue.total = pricing.basicUnitCost.total + pricing.agreementValue.infrastructureValue + pricing.agreementValue.clubHouseCharges

    //pricing.statutoryGovtCharges.electricityCharges = unit.superBuiltUpArea * electricityMultiplier;

    //pricing.statutoryGovtCharges.vat = ( (constructionRateForVAT+pricing.basicUnitCost.floorRaiseCharge +
    //  pricing.basicUnitCost.plcCharge)     +    (pricing.agreementValue.infrastructureValue + pricing.statutoryGovtCharges.electricityCharges + pricing.agreementValue.clubHouseCharges)/unit.superBuiltUpArea)*unit.superBuiltUpArea * 0.145 ;
    //debugger;
    // pricing.statutoryGovtCharges.labourCess = (pricing.basicUnitCost.total - (unit.superBuiltUpArea * pricing.landCost))*0.01
    // var D30 = unit.floorLevel
    // var E30 = D30<=5 ? 0 : D30>5 && D30<=15 ? (D30-5)*0.005 : 0.05
    // //pricing.statutoryGovtCharges.stampDuty =  ((ratePerSqFt*2130)+(ratePerSqFt*2130*(E30+0.0525)+250000))*0.0665
    // //pricing.statutoryGovtCharges.stampPaperCharges =  pricing.agreementValue.total*0.001+300
    // pricing.statutoryGovtCharges.total = pricing.statutoryGovtCharges.vat +
    //   pricing.statutoryGovtCharges.labourCess +
    //   pricing.statutoryGovtCharges.electricityCharges +
    //   pricing.statutoryGovtCharges.stampDuty +
    //   pricing.statutoryGovtCharges.stampPaperCharges +
    //   pricing.statutoryGovtCharges.legalCharges +
    //   pricing.statutoryGovtCharges.otherStatutoryCharges

    pricing.totalAllInclusive = pricing.agreementValue.total +
        pricing.otherCharges.total +
        pricing.statutoryGovtCharges.total
    return pricing;
}
function ordinal_suffix_of(i) {
    var j = i % 10,
        k = i % 100;
    if (j == 1 && k != 11) {
        return i + "st";
    }
    if (j == 2 && k != 12) {
        return i + "nd";
    }
    if (j == 3 && k != 13) {
        return i + "rd";
    }
    return i + "th";
}
function openPicker() {
    fsClient.pick({
        fromSources:["local_file_system","webcam","facebook","url","googledrive","dropbox","flickr","instagram","gmail","picasa","onedrive","clouddrive"],
        maxFiles:10,
        transformations:{
            crop:{      force:false,
                aspectRatio:1.333},
            rotate:true},
        imageMax:[800,600],
        accept:["image/*"],
        "uploadInBackground": false//Disabled because, bg upload causes 2 uploads towards filestack limits
    }).then(function(response) {
        // declare this function to handle response
        var addPropertyImages = Session.get('addPropertyImages');
        var tmp = {};
        if(response.filesUploaded)
            for(var i =0;i<response.filesUploaded.length;i++){
                tmp = {
                    name: response.filesUploaded[i].filename,
                    url: response.filesUploaded[i].url,
                    handle: response.filesUploaded[i].handle,
                    mimetype: response.filesUploaded[i].mimetype,
                    originalFile: response.filesUploaded[i].originalFile,
                    originalPath: response.filesUploaded[i].originalPath,
                    size: response.filesUploaded[i].size,
                    source: response.filesUploaded[i].source,
                    status: response.filesUploaded[i].status,
                    uploadId: response.filesUploaded[i].uploadId
                }
                addPropertyImages.push(tmp);
            }
        Session.set('addPropertyImages',addPropertyImages);

        updateGalleriesInProfile(addPropertyImages, function (err, res) {//No need to show error. Because its just a backup.
            var addPropertyImages = Session.get('addPropertyImages');
            console.log("Current Count: "+addPropertyImages.length )
        });
        console.log(response);
    });
}
function getIndexByHandle(myArray, fileId){
    for (var i=0; i < myArray.length; i++) {
        if (myArray[i].handle === fileId) {
            return i;
        }
    }
}
function titleCase(str){
    if(!str)return;
    return str.charAt(0).toUpperCase() + str.toLowerCase().substring(1);
}
function slugifyEmailAddress (text) {
    if(!text)return '';
    const a = 'àáäâèéëêìíïîòóöôùúüûñçßÿœæŕśńṕẃǵǹḿǘẍźḧ/_,:;'
    const b = 'aaaaeeeeiiiioooouuuuncsyoarsnpwgnmuxzh------'
    const p = new RegExp(a.split('').join('|'), 'g')

    return text.toString().toLowerCase()
        .replace(/\s+/g, '.')           // Replace spaces with "."
        .replace(p, c =>
            b.charAt(a.indexOf(c)))     // Replace special chars
        .replace(/&/g, '-and-')         // Replace & with ''
        // .replace(/[^\w\-]+/g, '')       // Remove all non-word chars
        .replace(/\-\-+/g, '-')         // Replace multiple - with single ''
        .replace(/^-+/, '')             // Trim - from start of text
        .replace(/-+$/, '')             // Trim - from end of text
}