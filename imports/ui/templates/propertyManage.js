import "./pagination.html";
import "./propertyManage.html";

var globalFILTERS = {};

function getPaginationData(totalResultsCount,currentPageNo,urlBase, resultsPerPage){
    var pages = [], prevPage = {}, nextPage={};
    var pgMin = currentPageNo-4, pgMax = currentPageNo+ 5, maxPages = Math.ceil(totalResultsCount/resultsPerPage)
    if(pgMin<1)pgMin =1;
    if(pgMax<1)pgMax =1;
    if(maxPages<1)maxPages =1;
    if(pgMin>maxPages)currentPageNo =maxPages;
    var tmp={};
    for (var i=pgMin; i<=maxPages;i++){
        var href = urlBase+i+"/";
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
    // if(pgMin==maxPages){//Above loop won't work if only 1 page result
    //     pages.push({
    //         "href": 'javascript:void(0);',
    //         "text": 1
    //     })
    // }
    var prevPageNo = currentPageNo- 1, nextPageNo=currentPageNo+ 1;
    if(prevPageNo<1){
        prevPage['href'] = 'javascript:void(0)';
        prevPage['text'] = 'Previous';
        prevPage['disabled'] = 'disabled';
    }else{
        prevPage['href'] = urlBase+prevPageNo+"/";
        prevPage['text'] = 'Previous';
    }
    if(nextPageNo>maxPages)nextPageNo =maxPages;
    if(nextPageNo == currentPageNo){
        nextPage['href'] = 'javascript:void(0)';
        nextPage['text'] = 'Next';
        nextPage['disabled'] = 'disabled';
    }else{
        nextPage['href'] = urlBase+nextPageNo+"/";
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



Template.propertyManage.onCreated(function(){
    Session.set('propertyData',false);
    Session.set('PropertyManage',false);
    this.pdExpanded = new ReactiveVar( true );
    this.enablingPMS = new ReactiveVar( false );

    var instance = this;
    instance.isSubsLoaded = new ReactiveVar(false);
    instance.autorun(function(){

        instance.subscribe('Auctions');
        instance.subscribe('Bids');
        instance.subscribe('allUserData');
        instance.subscribe('userData');
        var id = FlowRouter.getParam('id');
        instance.subscribe("Property",{viewName: 'property.view',id:id}) ;
        instance.subscribe("PropertyManage",{viewName: 'propertyManage.view',id:id}) ;
        instance.subscribe("ActivityHistory",{limit: 50,id:id})  ;

        if(instance.subscriptionsReady()){
            instance.isSubsLoaded.set(true)
        }
    })
})
Template.propertyManage.helpers({
    isSubsLoaded:function(){
        return Template.instance().subscriptionsReady();
    },
    userLoggedIn:function(){
        if(Meteor.user())return true;
        return false;
    },
    data: function(){
        var id = FlowRouter.current().params.id;
        if(!id)return [];
        // debugger;
        var ret = Collections.PropertyManage.find({propertyId:id});
        var docs = ret.fetch()
        if(docs.length)Session.set('PropertyManage',docs[0]);
        // if(ret.count()==0){
        //     clearMeta();
        //     DocHead.setTitle(' Property not found | SpotMyCrib Admin');
        //     DocHead.addMeta({name: "description", content: ""});
        // }
        // Session.set("propertyManageData",ret);
        return docs[0];
    },
    propertyData: function(){
        var PropertyManage = Session.get('PropertyManage');
        if(PropertyManage.propertyId) {
            var ret = Collections.Properties.find({_id:PropertyManage.propertyId}, {limit: 1})
            var docs = ret.fetch()
            var propertyData = docs[0];
            if(docs.length)Session.set('propertyData',propertyData);

            clearMeta();
            try{
                var title = propertyData.address.address + ', ' + propertyData.address.area;
                if (propertyData.address.county) title += ', ' + propertyData.address.county;
                title += ' Manage Property';

                DocHead.setTitle(titleCase(title) + ' | SpotMyCrib Admin');
                DocHead.addMeta({
                    name: "description",
                    content: "Manage property " + propertyData.type + ", view and manage lease, see activity history and much more."
                });
            }catch(err){
                DocHead.setTitle('Manage Property | SpotMyCrib Admin');
                DocHead.addMeta({name: "description", content: ""});
            }

            return docs[0];
        }
        else {
            clearMeta();
            DocHead.setTitle('Manage Property | SpotMyCrib Admin');
            DocHead.addMeta({name: "description", content: ""});
            return [];
        }
    },
    hasPropFound: function(){
        var id = FlowRouter.current().params.id;
        var ret = Collections.Properties.find(id, {
            limit: 1
        }).fetch();
        return ret.length;
    },
    pdExpanded: function(){
        return Template.instance().pdExpanded.get() ;
    },
    enablingPMS: function(){
        return Template.instance().enablingPMS.get() ;
    },
    // dataFull : function () {
    //
    //     var propertyData = Session.get('propertyData');
    //
    //     try {
    //         var selector = {
    //             auctionId: propertyData.auctionId,
    //             isArchived: false
    //         }
    //
    //         var totalResultsCount = Collections.Bids.find(selector).count();
    //
    //         clearMeta();
    //         try{
    //             var title = propertyData.address.address + ', ' + propertyData.address.area;
    //             if (propertyData.address.county) title += ', ' + propertyData.address.county;
    //             title += ' Manage Property';
    //
    //             DocHead.setTitle(titleCase(title) + ' | SpotMyCrib Admin');
    //             DocHead.addMeta({
    //                 name: "description",
    //                 content: "View applications for property " + propertyData.type + ", choose a winning tenant, see their social profiles and much more."
    //             });
    //         }catch(err){
    //             DocHead.setTitle('Manage Property | SpotMyCrib Admin');
    //             DocHead.addMeta({name: "description", content: ""});
    //         }
    //         return {
    //             totalResultsCount: totalResultsCount
    //         };
    //     }catch (err){}
    // },
    dataChosen : function () {

        var PropertyManage = Session.get('PropertyManage');
        if(PropertyManage.tenants.length) {
            var tenIds = [];
            for(var i=0;i<PropertyManage.tenants.length;i++){
                if(PropertyManage.tenants[i].id)
                    tenIds.push(PropertyManage.tenants[i].id)
            }
            var selector = {
                _id: {$in: tenIds},
                // isArchived: false,//this field isn't needed
                chosen:true
            }

            var totalChosenCount = Collections.Bids.find(selector).count();
            var retChosen = Collections.Bids.find(selector, {
                sort: {updatedAt: -1}
            });

            return {
                resultsChosen: retChosen,
                totalChosenCount: totalChosenCount
            };
        }
        else return [];
    },
    // dataNonChosen : function () {
    //
    //     var propertyData = Session.get('propertyData');
    //     if(!propertyData){
    //         console.log("Empty project data");
    //         return false;}
    //
    //     var selector = {
    //         auctionId: propertyData.auctionId,
    //         isArchived: false,
    //         chosen:false
    //     }
    //
    //     globlaAuctionId1 = propertyData.auctionId;
    //     globalAuctionData1 = propertyData.auction;
    //     /////PAGINATION
    //     var resultsPerPage = 100;
    //     var currentPageNo = FlowRouter.current().params.pageno;
    //     if(!currentPageNo){currentPageNo = 1}
    //     var skip = (currentPageNo -1) * resultsPerPage;
    //     var urlBase = 'account/propertyapplications/'+FlowRouter.current().params.id+'/';
    //
    //
    //
    //     var totalNonChosenCount = Collections.Bids.find(selector).count();
    //     var resultsNonChosen = Collections.Bids.find(selector, {
    //         transform: function (doc) {
    //
    //             if (doc.auctionId != globlaAuctionId1 || !globalAuctionData1._id) {
    //                 doc.auction = Collections.Auctions.findOne({
    //                     _id: doc.auctionId
    //                 });
    //             } else {
    //                 doc.auction = globalAuctionData1;
    //             }
    //
    //             return doc;
    //         },
    //         limit: resultsPerPage,
    //         sort: { updatedAt : -1 },
    //         skip: skip
    //     });
    //
    //     return {
    //         resultsNonChosen: resultsNonChosen,
    //         totalNonChosenCount: totalNonChosenCount,
    //         pagination: getPaginationData(totalNonChosenCount,currentPageNo,urlBase,resultsPerPage)
    //     };
    //
    // },
    showFilters: function(){
        return false;
    },
    // propertyData : function () {
    //     var ret = getpropertyData();
    //     if(!ret.auctionId){
    //         var prevRoute = Session.get('prevRoute');
    //         if(prevRoute){
    //             FlowRouter.go(prevRoute.name,prevRoute.args)
    //             Session.set('prevRoute',false);
    //         }else{
    //             FlowRouter.go("/account/myproperies/",{pageno:1});
    //         }
    //     }
    //
    //     Session.set('propertyData',ret);
    //
    //     return ret;
    // },
    filters:function(){
        var data = {}//{"Home Type":["2 BHK"],"Floor":["2 to 15"],"Price Range":["67.45 to 97.45 "]}
        var FILTERS = Session.get('globalFILTERS')
        var defaultFilters = Session.get('propertyData');defaultFilters = defaultFilters.filter;
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
    //     var propertyData = Session.get('propertyData');
    //     var timestamp = TimeSync.serverTime(null, 30000);
    //     if(!propertyData.auction.endDate || !timestamp)return;
    //
    //
    //     var dend = Date.parse(propertyData.auction.endDate);
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
        var propertyData = Session.get('propertyData');
        var dend = Date.parse(propertyData.auction.endDate);
        var timeDiff = dend - timestamp;
        if(timeDiff<0){
            return true;
        }
        return false;
    },
    numDifferentiation: function(data){
        return numDifferentiation(data);
    },
    assistanceAlreadyRequested: function(){
        //Just to make this reactive
        var user = Meteor.user();
        if(user)
            if(user.profile)
                if(user.profile.assistanceRequested){
                    return user.profile.assistanceRequested || Session.get('assistanceRequested');
                }

        return Session.get('assistanceRequested');

    },
})
Template.propertyManage.onRendered(function() {
})
Template.propertyManage.events({
    "click .clearFilters": function (event, template) {
        //FlowRouter.query.clear();

        console.log('in .clearFilters meteor event')
        var defaultFilters = Session.get('propertyData');defaultFilters = defaultFilters.filter;
        $('.filterUnitFacing, .filterUnitType').val('any');
        resetUISlider(defaultFilters);
        setFilters(defaultFilters);
        $.fancybox.close();
        applyClearFiltersEvent();
    },
    "click .showEditPropertyForm": function (event, template) {
        var prevRoute = {name: FlowRouter.current().route.name,args:{id:FlowRouter.current().params.id, pageno:FlowRouter.current().params.pageno},scrollTo:'body' }
        Session.set('prevRoute',prevRoute);
        var propertyData = Session.get('propertyData');
        FlowRouter.go('account/editproperty',{id:propertyData._id})

    },
    "click .backBtn": function(event, template){
        var prevRoute = Session.get('prevRoute');
        if(prevRoute){
            FlowRouter.go(prevRoute.name,prevRoute.args)
            Session.set('prevRoute',false);
        }else{
            // FlowRouter.go("/account/myproperies/",{pageno:1});
            history.back();//PPl can come to this page from many other pages.
        }
    },
    "click .pdExpandedBtn": function (event, template) {
        if(template.pdExpanded.get() )template.pdExpanded.set(false);
        else template.pdExpanded.set(true);
    },
    "click .enablePMS":function (event, template) {
        // console.log('enablePMS clicked');
        enablingPMS = template.enablingPMS;
        enablingPMS.set(true) ;
        Meteor.call('addManageProperty',FlowRouter.current().params.id,function(error, result){
            enablingPMS.set(false) ;
            if(error){
                var tmp =  Session.get("showErrorDlg");if(!tmp)tmp=[];
                tmp.push("Failed enabling this property. Please try again, try checking your internet connectivity. Contact us if needed.");
                Session.set("showErrorDlg",tmp)
                return;
            }
            if(result.status=='Success'){
                console.log("Success");
            }
        });
    }
})
Template.PM_bidList.onCreated(function(){
    this.choosingInProgress = new ReactiveVar( false );
    this.unChoosingInProgress = new ReactiveVar( false );
})
Template.PM_bidList.helpers({
    user:function(){
        // debugger;
        var ret = Meteor.users.find({
            _id: this.userId
        }).fetch();
        return ret[0];
    },
    canAfford: function(salary){//This works based on the bid (not rent)
        if( !this.yourBid){return false;}
        if(salary*0.4 >= this.yourBid ){
            return true;
        }
        return false;
    },
    choosingInProgress: function(){
        return Template.instance().choosingInProgress.get() ;
    },
    numDifferentiation: function(data){
        return numDifferentiation(data);
    },
    classBidList:function () {
        if(this.chosen)return 'active';

        var propertyData = Session.get('propertyData');
        try {
            var a = Collections.Auctions.find({_id:propertyData.auction._id}).fetch();
            propertyData.auction = a[0];
            if (propertyData.auction.chosenBids.length)return 'archive';
        }catch (e){}
        return 'border-top';
    }
})
Template.PM_bidList.events({
    "click .chooseTenant": function (event, template) {
        template.choosingInProgress.set(true);
        choosingInProgress = template.choosingInProgress

        var r = confirm("Are you sure? This will send a confirmation mail to the applicant.");
        if (!r){ template.choosingInProgress.set(false);return;}

        Meteor.call('chooseWinning', [this.auctionId, this._id], function(error, result){
            choosingInProgress.set(false) ;
            if(error){
                console.log(error);
                var tmp =  Session.get("showErrorDlg");if(!tmp)tmp=[];
                tmp.push(error.error);
                Session.set("showErrorDlg",tmp)
                return;
            }
            console.log("Success");


        });
    },
    "click .unChooseTenant": function (event, template) {
        template.unChoosingInProgress.set(true);
        unChoosingInProgress = template.unChoosingInProgress

        var r = confirm("Are you sure? This will send a pending mail to the applicant.");
        if (!r){ template.unChoosingInProgress.set(false);return;}

        Meteor.call('unChooseWinning', [this.auctionId, this._id], function(error, result){
            unChoosingInProgress.set(false) ;
            if(error){
                console.log(error);
                var tmp =  Session.get("showErrorDlg");if(!tmp)tmp=[];
                tmp.push(error.error);
                Session.set("showErrorDlg",tmp)
                return;
            }
            console.log("Success");
        });
    },
    "click .inviteForViewingBtn": function (event, template) {
        var propertyData = Session.get('propertyData');
        var ret = Meteor.users.find({
            _id: this.userId
        }).fetch();
        var inviteForViewing = Session.get('inviteForViewingData');
        var today = new Date();
        var tomorrow = new Date();
        tomorrow.setDate(today.getDate()+1);tomorrow.setMinutes(0);tomorrow.setSeconds(0);
        var h = tomorrow.getHours();
        if(h<9)h=9;else if(h>20)h=20;
        tomorrow.setHours(h);
        var inviteDate = tomorrow;
        try{if(inviteForViewing.inviteDate)inviteDate = inviteForViewing.inviteDate;}catch(e){}
        Session.set('inviteForViewingData',{user:ret[0],bid:this,inviteDate:inviteDate})
        $.fancybox({
            'padding': 0,
            'href': '#inviteForViewingDlg',
            afterShow:function () {
                var inviteForViewing = Session.get('inviteForViewingData');
                var d = inviteForViewing.inviteDate;var am = ' AM';
                var df = (d.getMonth()+1)+'/'+d.getDate()+'/'+d.getFullYear()+' '+d.getHours()+':'+d.getMinutes()
                if(d.getHours()>12)am = ' PM';
                df = df+am;
                $('#inviteDate').val(df)

            }
        });
    },
});
Template.PM_propertyList.onCreated(function(){
    this.expanded = new ReactiveVar( true );
    this.showAddAuctionForm = new ReactiveVar( false );

})
Template.PM_propertyList.helpers({
    expanded: function(){
        return Template.instance().expanded.get() ;
    },
    auction: function () {
        if(this._id) {
            var ret = Collections.Auctions.find({propertyId:this._id}, {limit: 1})
            var docs = ret.fetch()
            return docs[0];
        }
        else return [];
    },
    showAddAuctionForm: function () {
        // debugger;
        if(Session.get('hideAddAuctionForm') && Session.get('auctionId')==this.auctionId){
            Template.instance().showAddAuctionForm.set(false);
            Session.set('auctionId',"")
            Session.set('hideAddAuctionForm',false)
        }

        return Template.instance().showAddAuctionForm.get();
    },
    numDifferentiation: function(data){
        return numDifferentiation(data);
    },
    lettingprintviewData:function () {
        if(!this.auction)return {key:""}
        return {key:this.auction.lettingAuctionCode}
    },
    chosenTenantCount:function(){
        var PropertyManage = Session.get('PropertyManage');
        if(PropertyManage.tenants) {
            return PropertyManage.tenants.length;
        }
        else {
            return 0;
        }
    },
    PropertyManage:function(){
        return Session.get('PropertyManage');
    }
})
Template.PM_propertyList.events({
    "click .prev_activations": function (event, template) {
        scrollTo('#activity_history_area',0,300)
    },
    "click .viewTenants": function (event, template) {
        scrollTo('#viewTenantsArea',0,300)
    },
    "click .showEditPropertyForm": function (event, template) {
        var prevRoute = {name: FlowRouter.current().route.name,args:{pageno:FlowRouter.current().params.pageno} }
        Session.set('prevRoute',prevRoute);

        FlowRouter.go('account/editproperty',{id:this._id})

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
                    ga('send', 'event', 'managePropertyPage', 'copyShareEmail', 'copyShareEmail Btn Clicked');
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
                    ga('send', 'event', 'managePropertyPage', 'copyShareLink', 'copyShareLink Btn Clicked');
                })
                $('#propertyLinkDlg .cancelBtn').unbind().bind('click',function () {
                    $.fancybox.close()
                })
            },
        });

    },
});

inviteInProgress='';
Template.addTenantDlg.onCreated(function () {
    console.log('invite for viewing created');
    this.inviteInProgress = new ReactiveVar( false );
    inviteInProgress = this.inviteInProgress;
})
Template.addTenantDlg.helpers({
    data:function () {
        return Session.get('inviteForViewingData');
    },
    inviteInProgress:function () {
        inviteInProgress = Template.instance().inviteInProgress ;
        return Template.instance().inviteInProgress.get() ;
    },
    inviteDateFormated:function () {
        var inviteForViewing = Session.get('inviteForViewingData');
        var options = {
            weekday: "long", year: "numeric", month: "short",
            day: "numeric", hour: "2-digit", minute: "2-digit"
        };
        try{var d=inviteForViewing.inviteDate; return d.toLocaleTimeString("en-us", options); }catch(e){}
        return ;
    },
    propertyData:function () {
        return  Session.get('propertyData');
    }
})
Template.addTenantDlg.events({
    'change .inviteDate':function (event, template) {
        var d = new Date($('.inviteDate').val());
        var inviteForViewing = Session.get('inviteForViewingData');
        try{ inviteForViewing.inviteDate=d; Session.set('inviteForViewingData',inviteForViewing) }catch(e){}

    },
    'click .confirmInviteBtn':function () {

        var inviteDate = $('.inviteDate').val()
        var inviteMessage = $('.inviteMessage').val()
        console.log(inviteDate)
        var inviteForViewing = Session.get('inviteForViewingData');


        inviteInProgress.set(true) ;
        Meteor.call('sendInviteForViewingEmail',[inviteForViewing.bid._id,inviteDate],function(error, result){
            inviteInProgress.set(false) ;
            if(error){
                console.log(error);
                var tmp =  Session.get("showErrorDlg");if(!tmp)tmp=[];
                tmp.push("Failed applying. Please try again, try checking your internet connectivity. Contact us if needed.");
                Session.set("showErrorDlg",tmp)
                return;
            }
            if(result.status=='Success'){
                console.log("Success");
                closePopupEvent()
            }
        });

    },
    'click .closePopupBtn':function () {
        closePopupEvent()
    }
})
Template.addTenantDlg.onRendered(function () {
    console.log('inviteForViewing rendered')
    //Needs to be optimised, this is not the right place to put this code, might cause JS errors if Jquery isn' loaded yet.
    try{
        this.$('#inviteDate').datetimepicker();



        this.$('#moveindate').datetimepicker();
    }catch(err){
        console.log('dp failed');
    }
})
Template.activity_history.onCreated(function () {
    this.loadingMoreText = new ReactiveVar( true );
    var resultsPerPage = Session.get('resultsPerPage');
    if(!resultsPerPage)Session.set('resultsPerPage',50)
})
Template.activity_history.helpers({
    data : function () {
        var user = Meteor.user();
        if (!user) {
            Template.instance().loadingMoreText.set(false);
            return {
                results: [],
                totalResultsCount: 0
            }
        }

        var id = FlowRouter.current().params.id;
        if(!id) {
            Template.instance().loadingMoreText.set(false);

            return {
                results: [],
                totalResultsCount: 0
            }
        }
        var selector = {propertyId:id};//let limit = 10;
        // debugger;

        // var FILTERS = Session.get('prop_activation_filters')
        // var defaultFilters = getDefaultFilters();

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
        // var resultsPerPage = 20;
        // var currentPageNo = FlowRouter.current().params.pageno;
        // if(!currentPageNo){currentPageNo = 1}
        // var skip = (currentPageNo -1) * resultsPerPage;
        // var urlBase = 'account/myproperies/';


        var totalResultsCount = Collections.ActivityHistory.find(selector).count()

        var ret = Collections.ActivityHistory.find(selector, {
            limit: Session.get('resultsPerPage'),
            sort: { createdAt : -1 }
            // skip: skip
        });
        Template.instance().loadingMoreText.set(false);
        return {
            results: ret,
            totalResultsCount:totalResultsCount
        };
    },
    loadingMoreText: function(){
        return Template.instance().loadingMoreText.get() ;
    },
    decideTemplate:function (type) {

    }
})
Template.activity_history.events({
    'click .load_more':function (event, template) {
        Template.instance().loadingMoreText.set(true);
        var resultsPerPage = Session.get('resultsPerPage');
        resultsPerPage*=2;
        Session.set('resultsPerPage',resultsPerPage)
        var id = FlowRouter.current().params.id
        Meteor.subscribe("ActivityHistory",{limit: resultsPerPage,id:id})
    }
})
Template.activity_history.onRendered(function () {
    Template.instance().loadingMoreText.set(false);
})
function attachEvents() {
    $(".deactivateConfirmBtn").unbind().bind("click",function () {
        deactivateConfEvent();
    })
    $(".closePopupBtn").unbind().bind("click",function () {
        closePopupEvent();
    })
}
function deactivateConfEvent() {
    var data = Session.get("propertyData");
    var auctionId = data.auctionId;

    deactivateInProgress.set(true) ;
    Meteor.call('deactivateAuction',auctionId,function(error, result){
        deactivateInProgress.set(false) ;
        if(error){
            console.log(error);
            var tmp =  Session.get("showErrorDlg");if(!tmp)tmp=[];
            tmp.push("Failed deactivating. Please try again, try checking your internet connectivity. Contact us if needed.");
            Session.set("showErrorDlg",tmp)
            return;
        }
        console.log("Success");

        closePopupEvent();
        var prevRoute = Session.get('prevRoute');
        if(prevRoute){
            FlowRouter.go(prevRoute.name,prevRoute.args)
            Session.set('prevRoute',false);
        }else{
            FlowRouter.go("/account/myproperies/",{pageno:1});
        }

    });
}
function closePopupEvent() {
    console.log('closePopupEvent');
    if($)
        if($.fancybox)
            $.fancybox.close();
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