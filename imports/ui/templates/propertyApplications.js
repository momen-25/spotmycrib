import "./pagination.html";
import "./propertyApplications.html";
import SimpleSchema from "simpl-schema";
// SimpleSchema.extendOptions(['autoform']);
// window.deactivateInProgress = '';


function setFilters(){
    var userFilters = Session.get('userFilters');
    try {
        if (userFilters.check) {
            for (var k = 0; k < userFilters.check.length; k++) {
                if (userFilters.check[k].val == 'all')continue;
                if (userFilters.check[k].val == 'clearall')continue;
                if (userFilters.check[k].enabled) {
                    $(".dropdown-menu input[value='" + userFilters.check[k].val + "']").prop('checked', true);
                }
                dropdownCheckbox();
            }
        }
        if (userFilters.s1) {
            var offerRangeVal = document.getElementById('offerRangeInput');
            offerRangeVal.noUiSlider.set(userFilters.s1.range);
        }
    }catch (e){}
    dropdownCheckbox();
}
function applyFilters(){
    // console.log('event applyFilters jquery')
    var slider = document.getElementById('offerRangeInput');
    var offerRangeVal = slider.noUiSlider.get();
    var userFilters = Session.get('userFilters');
    userFilters.s1.range = offerRangeVal;
    Session.set('userFilters',userFilters);
}
function applyFilterValues(){
    // console.log('event applyFiltersValues jquery')
    var slider = document.getElementById('offerRangeInput');
    var offerRangeVal = slider.noUiSlider.get();
    $('.filterS1l').html(numDifferentiation(offerRangeVal[0]))
    $('.filterS1h').html(numDifferentiation(offerRangeVal[1]))
    // var userFilters = Session.get('userFilters');
    // userFilters.s1.range = offerRangeVal;
    // Session.set('userFilters',userFilters);
    // $('.filterS2l').html(numDifferentiation(priceRange[0] ))
    // $('.filterS2h').html(numDifferentiation(priceRange[1] ))

}
function numDifferentiation(val) {
    if(isNaN(val))return 0;
    val = parseInt(val);
    if(val >= 1000000000) val = (val/1000000000).toFixed(0) + ' Billion';
    else if(val >= 1000000) val = (val/1000000).toFixed(0) + ' Million';
    else if(val >= 1000) val = val.toFixed(0) ;
    else val = val.toFixed(0);
    return val.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
}

function startUISlider(data){
    var slider = document.getElementById('offerRangeInput');

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

    slider.noUiSlider.on('update', function(){
        applyFilterValues();
    });
    slider.noUiSlider.on('change', function(){
        applyFilters();
    });
    setTimeout(function () {setFilters();},400)
}
function startFilters(){
    try{
    var gDefaultFilters = Session.get('gDefaultFilters');

    var propertyData = Session.get('propertyData');
    if(propertyData.auctionId){
        var auction = Collections.Auctions.findOne(propertyData.auctionId)
        var min = auction.price*0.7
        var max = auction.price*1.5
        gDefaultFilters.s1 = {
            "start": [min, max],
            "range": [min, max]
        }
        startUISlider({
            "s1":gDefaultFilters.s1
        });
        $('.filterS1l').html(numDifferentiation(min))
        $('.filterS1h').html(numDifferentiation(max))
    }

    var userFilters = Session.get('userFilters');
    var fetchPrevFilters = true;

    var userFiltersAuctionId = Session.get('userFiltersAuctionId');
    if(!userFiltersAuctionId)fetchPrevFilters=false;
    if(userFiltersAuctionId != propertyData.auctionId)fetchPrevFilters=false;

    if(!userFilters)fetchPrevFilters=false;

    if(fetchPrevFilters) Session.set('userFilters',userFilters);
    else Session.set('userFilters',gDefaultFilters);

    Session.set('userFiltersAuctionId',propertyData.auctionId);

    dropdownCheckbox();
    setTimeout(function () {dropdownCheckbox();},100)
    setTimeout(function () {dropdownCheckbox();},1000)
    }catch(e){
        // console.log('Catch of startFilters')
        console.log(e)
    }
}
function getPaginationData2D(totalResultsCount,resultsPerPage,dimensionNumber){
    // Page numbers are 2 dimensional, making it store page numbers of 2 pagination elements on the page.
    //dimensionNumber tells you on which dimension is this method working on ; should start with 0, 1, 2 like an array numbers.
    var currentPageNo = FlowRouter.current().params.pageno;
    let originalPgSplit = null, validOriginalPgSplit = false;
    if(currentPageNo){
        originalPgSplit = currentPageNo.toString().split('-')
        if(originalPgSplit.length==2){
            if(!isNaN(originalPgSplit[dimensionNumber])){ currentPageNo = parseInt(originalPgSplit[dimensionNumber]); validOriginalPgSplit = true;}
        }
    }
    if(!validOriginalPgSplit){//invalid originalPgSplit; reset it
        originalPgSplit = [1,1]
    }
    if(!currentPageNo){currentPageNo = 1}
    var pages = [], prevPage = {}, nextPage={};
    var pgMin = currentPageNo-4, pgMax = currentPageNo+ 5, maxPages = Math.ceil(totalResultsCount/resultsPerPage);
    if(pgMin<1)pgMin =1;
    if(pgMax<1)pgMax =1;
    if(maxPages<1)maxPages =1;
    if(pgMin>maxPages)currentPageNo =maxPages;
    let tmp={};
    var href = '';

    var cRoute = FlowRouter.current();

    for (var i=pgMin; i<=maxPages;i++){
        cRoute.params['pageno'] = (dimensionNumber==0 ? i+'-'+originalPgSplit[1] : originalPgSplit[0]+'-'+i ) ;
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
        cRoute.params['pageno'] = (dimensionNumber==0 ? prevPageNo+'-'+originalPgSplit[1] : originalPgSplit[0]+'-'+prevPageNo ) ;
        prevPage['href'] = FlowRouter.url(cRoute.route.name,cRoute.params,cRoute.queryParams)
        prevPage['text'] = 'Previous';
    }
    if(nextPageNo>maxPages)nextPageNo =maxPages;
    if(nextPageNo == currentPageNo){
        nextPage['href'] = 'javascript:void(0)';
        nextPage['text'] = 'Next';
        nextPage['disabled'] = 'disabled';
    }else{
        cRoute.params['pageno'] = (dimensionNumber==0 ? nextPageNo+'-'+originalPgSplit[1] : originalPgSplit[0]+'-'+nextPageNo ) ;
        nextPage['href'] = FlowRouter.url(cRoute.route.name,cRoute.params,cRoute.queryParams)
        nextPage['text'] = 'Next';
    }
    return {
        "prevPage":prevPage,
        "pages":pages,
        "nextPage": nextPage
    }
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



Template.propertyApplications.onCreated(function(){
    this.deactivateInProgress = new ReactiveVar( false );
    Session.set('propertyData',false);

    var gDefaultFilters = {}
    gDefaultFilters.check = [
        {val:'empName',label:'Employer name'},
        {val:'salary',label:'Salary'},
        {val:'workRef',label:'Work Reference'},
        {val:'passport',label:'Passport'},
        {val:'pps',label:'PPS'},
        {val:'landlordRef',label:'Landlord Reference'},
        {val:'financialRef',label:'Financial Reference'},
        {val:'govtID',label:'Govt. ID'},
        {val:'resume',label:'Resume'}
    ];
    gDefaultFilters.s1 = {
        "start": [0, 1000],
        "range": [0, 1000]
    }
    Session.set('gDefaultFilters',gDefaultFilters);

    var instance = this;
    instance.isSubsLoaded = new ReactiveVar(false);
    instance.autorun(function(){

        var pageno = FlowRouter.getParam('pageno');
        var PAresperpage = 20
        var EEresperpage = 100

        instance.subscribe('Config');
        var id = FlowRouter.getParam('id');
        if(id){
            instance.subscribe("PropertyApplications",{viewName: 'PropertyApplications.view',pageno:pageno,PAresperpage:PAresperpage,EEresperpage:EEresperpage,id:id}) ;
            instance.subscribe("total-PropertyApplications",{viewName: 'PropertyApplications.view',pageno:pageno,PAresperpage:PAresperpage,EEresperpage:EEresperpage,id:id}) ;
            instance.subscribe("total-EmailEnquiries",{viewName: 'PropertyApplications.view',pageno:pageno,PAresperpage:PAresperpage,EEresperpage:EEresperpage,id:id}) ;
        }

        instance.subscribe('userData');

        if(instance.subscriptionsReady()){
            instance.isSubsLoaded.set(true)
        }
    })
    // var userFilters = Session.get('userFilters');
    // if(!userFilters)Session.set('gDefaultFilters',gDefaultFilters);

})
Template.propertyApplications.helpers({
    isSubsLoaded:function(){
        return Template.instance().subscriptionsReady();
    },
    userLoggedIn:function(){
        if(Meteor.user())return true;
        return false;
    },
    avgOffer : function () {
        var tmp = Collections.PA_AvgOffer.find().fetch();
        if(tmp.length) {
            var offer = tmp[0]['avgOffer'];
            if(offer<1)return 0;
            return parseInt(offer);
        }
        else return false;
    },
    dataFull : function () {

        var propertyData = Session.get('propertyData');

        try {
            var selector = {
                auctionId: propertyData.auctionId,
                isArchived: false
            }

            // var totalResultsCount = Collections.Bids.find(selector).count();
            var totalResultsCount = Counts.get("total-PropertyApplications");

            clearMeta();
            try{
                var title = '';
                if (totalResultsCount > 1) title = totalResultsCount + ' applications';
                else if (totalResultsCount > 1) title = totalResultsCount + ' applications';
                else title = 'Applications';
                title += ' for ' + propertyData.address.address + ', ' + propertyData.address.area;

                if (propertyData.address.county) title += ', ' + propertyData.address.county;


                DocHead.setTitle(titleCase(title) + ' | SpotMyCrib Admin');
                DocHead.addMeta({
                    name: "description",
                    content: "View applications for property " + propertyData.type + ", choose a winning tenant, see their social profiles and much more."
                });
            }catch(err){
                DocHead.setTitle(' Property not found | SpotMyCrib Admin');
                DocHead.addMeta({name: "description", content: ""});
            }
            return {
                totalResultsCount: totalResultsCount
            };
        }catch (err){}
    },
    dataChosen : function () {
        var propertyData = Session.get('propertyData');
        if(!propertyData){
            console.log("Empty project data");
            return false;}
        try {
            var selector = {
                auctionId: propertyData.auctionId,
                isArchived: false,
                chosen:true
            }

            globlaAuctionId1 = propertyData.auctionId;
            globalAuctionData1 = propertyData.auction

            var totalChosenCount = Collections.Bids.find(selector).count();/// don't use the blow code, it doesn't have pagination.
            // var totalChosenCount = Counts.get("total-PropertyApplications");
            var retChosen = Collections.Bids.find(selector, {
                transform: function (doc) {

                    doc.auction = Collections.Auctions.findOne({
                        _id: doc.auctionId
                    });
                    // if (doc.auctionId != globlaAuctionId1 || !globalAuctionData1._id) {
                    //     doc.auction = Collections.Auctions.findOne({
                    //         _id: doc.auctionId
                    //     });
                    // } else {
                    //     doc.auction = globalAuctionData1;
                    // }

                    // doc.user = Meteor.users.findOne({
                    //     _id: doc.userId
                    // });


                    return doc;
                },
                limit: 100,//Hardcoded logic for now, may be put a max limit of 100 chosen
                sort: {updatedAt: -1}
            });

            return {
                resultsChosen: retChosen,
                totalChosenCount: totalChosenCount
            };
        }catch (err){}
    },
    dataEmailEnquiries : function () {
        var propertyData = Session.get('propertyData');
        if(!propertyData){
            console.log("Empty project data");
            return false;}
        try {
            var selector = {
                propertyId: propertyData._id,
                isArchived: false
            }

            /////PAGINATION
            var resultsPerPage = 100
            var currentPageNo = FlowRouter.current().params.pageno;
            if(currentPageNo){
                let tmp = currentPageNo.toString().split('-')
                if(tmp.length==2){
                    if(!isNaN(tmp[1])) currentPageNo = parseInt(tmp[1])
                }
            }
            if(!currentPageNo){currentPageNo = 1}
            var skip = (currentPageNo -1) * resultsPerPage;

            // var totalEnquiryCount = Collections.EmailEnquiries.find(selector).count();
            var totalEnquiryCount = Counts.get("total-EmailEnquiries");
            var retChosen = Collections.EmailEnquiries.find(selector, {
                limit: resultsPerPage,
                sort: { updatedAt : -1 }
                // skip: skip//not needed as the server would do this.
            });

            let paginationNeeded=(totalEnquiryCount/resultsPerPage > 1.0? true : false);

            return {
                resultsEnquiries: retChosen,
                totalEnquiryCount: totalEnquiryCount,
                pagination: (paginationNeeded ? getPaginationData2D(totalEnquiryCount,resultsPerPage,1) : false ),
                paginationNeede: paginationNeeded
            };
        }catch (err){}
    },
    dataNonChosen : function () {

        var propertyData = Session.get('propertyData');
        var userFilters = Session.get('userFilters');
        if(!propertyData){
            console.log("Empty project data");
            return false;}

        var selector = {
            auctionId: propertyData.auctionId,
            isArchived: false,
            chosen:false
        }
        if(userFilters){
            if(userFilters.s1.range)selector.yourBid =  { $gt: parseInt(userFilters.s1.range[0]), $lt: parseInt(userFilters.s1.range[1]) }
        }

        globlaAuctionId1 = propertyData.auctionId;
        globalAuctionData1 = propertyData.auction;
        /////PAGINATION
        var resultsPerPage = 20;
        var currentPageNo = FlowRouter.current().params.pageno;
        if(currentPageNo){
            let tmp = currentPageNo.toString().split('-')
            if(tmp.length==2){
                if(!isNaN(tmp[0])) currentPageNo = parseInt(tmp[0])
            }
        }
        if(!currentPageNo){currentPageNo = 1}
        var skip = (currentPageNo -1) * resultsPerPage;
        var urlBase = 'account/propertyapplications/'+FlowRouter.current().params.id+'/';



        // var totalNonChosenCount = Collections.Bids.find(selector).count();
        var totalNonChosenCount = Counts.get("total-PropertyApplications");
        var resultsNonChosen = Collections.Bids.find(selector, {
            transform: function (doc) {

                doc.userStatic =  Meteor.users.findOne({_id: doc.userId});

                doc.auction = Collections.Auctions.findOne({
                    _id: doc.auctionId
                });
                // if (doc.auctionId != globlaAuctionId1 || !globalAuctionData1._id) {
                //     doc.auction = Collections.Auctions.findOne({
                //         _id: doc.auctionId
                //     });
                // } else {
                //     doc.auction = globalAuctionData1;
                // }

                return doc;
            },
            limit: resultsPerPage,
            sort: { updatedAt : -1 }
            // skip: skip//not needed as the server would do this.
        }).fetch();

        if(userFilters)
        if(userFilters.check){
            var isItNeeded=true;var countActiveFilters = 0;
            for(var k=0;k<userFilters.check.length;k++){
                if (userFilters.check[k].val == 'all' )continue;
                if (userFilters.check[k].val == 'clearall' )continue;
                if(userFilters.check[k].enabled)countActiveFilters++;
            }
            if(!countActiveFilters)isItNeeded=false;//if none sel do nothing.

            if(isItNeeded) {
                var newArr = [];
                var selSatisfiedCount = 0;
                for (var i = 0; i < resultsNonChosen.length; i++) {
                    selSatisfiedCount = 0
                    var ele = resultsNonChosen[i];
                    var ref = ele.userStatic.profile.references;
                    if (!ref)break;


                    for (var j = 0; j < userFilters.check.length; j++) {
                        if (!userFilters.check[j].enabled)continue;//if not enabled , then don' consider it
                        if (userFilters.check[j].val == 'all' )continue;
                        if (userFilters.check[j].val == 'clearall' )continue;
                        if (userFilters.check[j].val == 'empName' && ref.employerName) {
                            selSatisfiedCount++;
                            continue;
                        }
                        if (userFilters.check[j].val == 'salary' && ref.employerTakeHome) {
                            selSatisfiedCount++;
                            continue;
                        }
                        if (userFilters.check[j].val == 'workRef' && ref.hasWorkRef) {
                            selSatisfiedCount++;
                            continue;
                        }
                        if (userFilters.check[j].val == 'passport' && ref.hasPassport) {
                            selSatisfiedCount++;
                            continue;
                        }
                        if (userFilters.check[j].val == 'pps' && ref.hasPPS) {
                            selSatisfiedCount++;
                            continue;
                        }
                        if (userFilters.check[j].val == 'landlordRef' && ref.hasLandlordRef) {
                            selSatisfiedCount++;
                            continue;
                        }
                        if (userFilters.check[j].val == 'financialRef' && ref.hasFinancialRef) {
                            selSatisfiedCount++;
                            continue;
                        }
                        if (userFilters.check[j].val == 'govtID' && ref.hasGovtID) {
                            selSatisfiedCount++;
                            continue;
                        }
                        if (userFilters.check[j].val == 'resume' && ref.hasResume) {
                            selSatisfiedCount++;
                            continue;
                        }
                        // if(userFilters.check[j].val == 'empName' && !user.profile.references.employerName){skip=true;break;}
                        // if(userFilters.check[j].val == 'salary' && !user.profile.references.employerTakeHome){skip=true;break;}
                        // if(userFilters.check[j].val == 'workRef' && !user.profile.references.hasWorkRef){skip=true;break;}
                        // if(userFilters.check[j].val == 'passport' && !user.profile.references.hasPassport){skip=true;break;}
                        // if(userFilters.check[j].val == 'pps' && !user.profile.references.hasPPS){skip=true;break;}
                        // if(userFilters.check[j].val == 'landlordRef' && !user.profile.references.hasLandlordRef){skip=true;break;}
                        // if(userFilters.check[j].val == 'financialRef' && !user.profile.references.hasFinancialRef){skip=true;break;}
                        // if(userFilters.check[j].val == 'govtID' && !user.profile.references.hasGovtID){skip=true;break;}
                        // if(userFilters.check[j].val == 'resume' && !user.profile.references.hasResume){skip=true;break;}

                    }
                    if(selSatisfiedCount==countActiveFilters)newArr.push(ele);
                    // if (!skip)
                }
                resultsNonChosen = newArr;
            }
        }

        let paginationNeeded=(totalNonChosenCount/resultsPerPage > 1.0? true : false);

        return {
            resultsNonChosen: resultsNonChosen,
            totalNonChosenCount: totalNonChosenCount,
            pagination: (paginationNeeded ? getPaginationData2D(totalNonChosenCount,resultsPerPage,0) : false ),
            paginationNeeded: paginationNeeded
        };

    },
    showFilters: function(){
        // return true;
        var propertyData = Session.get('propertyData');
        try {
            var selector = {
                auctionId: propertyData.auctionId,
                isArchived: false
            }
            // var totalResultsCount = Collections.Bids.find(selector).count();
            var totalResultsCount = Counts.get("total-PropertyApplications");
            if(totalResultsCount>5)return true;
        }catch(e){}
        return false;
    },
    initFilters:function(){
        setTimeout(startFilters,500);
    },
    propertyData : function () {
        var ret = getpropertyData();

        //Now check if he has auctionId passed in query & prop has no auction ID. if yes, update your session
        try{if(FlowRouter.current().params.query.auctionId && !ret.auctionId)ret.auctionId = FlowRouter.current().params.query.auctionId}catch(e){}

        if(!ret.auctionId){
            var prevRoute = Session.get('prevRoute');
            if(prevRoute){
                FlowRouter.go(prevRoute.name,prevRoute.args)
                Session.set('prevRoute',false);
            }else{
                FlowRouter.go("/account/myproperies/",{pageno:1});
            }
        }

        Session.set('propertyData',ret);

        return ret;
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
    deactivateInProgress: function(){
        deactivateInProgress = Template.instance().deactivateInProgress;
        return Template.instance().deactivateInProgress.get() ;
    },
    userFilters:function(){
        return Session.get('userFilters');
    }
})

Template.propertyApplications.onRendered(function() {
    try{
        jQuery("html,body").animate({scrollTop: 0}, 250);
    }catch(e){
        document.body.scrollTop = document.documentElement.scrollTop = 0;
    }
})
Template.propertyApplications.events({
    "click .showEditPropertyForm": function (event, template) {
        var prevRoute = {name: FlowRouter.current().route.name,args:{id:FlowRouter.current().params.id, pageno:FlowRouter.current().params.pageno},scrollTo:'body' }
        Session.set('prevRoute',prevRoute);
        var propertyData = Session.get('propertyData');
        FlowRouter.go('account/editproperty',{id:propertyData._id})

    },
    "click .deactivatePropertyBtn": function (event, template) {
        event.preventDefault();
        var propertyData = Session.get('propertyData');
        if(!propertyData){
            console.log("Empty project data");
            return false;}
        var user = Meteor.user();
        if(!user){console.log("Invalid user");return;}
        if(propertyData.createdByAgent != user._id){console.log("Invalid user");return;}

        $.fancybox({
            'padding': 0,
            'href': '#conf-dactivate-pop',
            afterShow:function(template){
                attachEvents();
            },
            afterClose:function(template){
                console.log(template);
            }
        })
    },
    "click .backBtn": function(event, template){
        var prevRoute = Session.get('prevRoute');
        if(prevRoute){
            FlowRouter.go(prevRoute.name,prevRoute.args)
            Session.set('prevRoute',false);
        }else{
            FlowRouter.go("/account/myproperies/",{pageno:1});
        }
    },
    "click .showCopyDlg": function (event, template) {
        var propertyData = Session.get('propertyData');

        let user = Meteor.user();
        let sluggedName = slugifyEmailAddress(user.profile.name);
        if(!sluggedName)sluggedName = 'rent'
        let email = sluggedName+'-let-'+propertyData.auction.lettingAuctionCode.toLowerCase()+"@spotmycrib.ie";
        $('#agentPropertyEmailField').val(email);

        var url = FlowRouter.url('letting',{key:propertyData.auction.lettingAuctionCode})
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
                    ga('send', 'event', 'propertyApplicationsPage', 'copyShareEmail', 'copyShareEmail Btn Clicked');
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
                    ga('send', 'event', 'propertyApplicationsPage', 'copyShareLink', 'copyShareLink Btn Clicked');
                })
                $('#propertyLinkDlg .cancelBtn').unbind().bind('click',function () {
                    $.fancybox.close()
                })
            },
        });

    },
    "click .jns-dropdown-btn": function (event, template) {
        $('.jns-dropdown-area').toggle();
    },
})

Template.bidList.onCreated(function(){
    this.choosingInProgress = new ReactiveVar( false );
    this.unChoosingInProgress = new ReactiveVar( false );
})
Template.bidList.helpers({
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
Template.bidList.events({
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
Template.emailEnquiryList.onCreated(function(){
    this.choosingInProgress = new ReactiveVar( false );
    this.unChoosingInProgress = new ReactiveVar( false );
})
Template.emailEnquiryList.helpers({
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
Template.emailEnquiryList.events({
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

inviteInProgress='';
Template.inviteForViewing.onCreated(function () {
    this.inviteInProgress = new ReactiveVar( false );
    inviteInProgress = this.inviteInProgress;
})
Template.inviteForViewing.helpers({
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
    },
})
Template.inviteForViewing.events({
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
Template.inviteForViewing.onRendered(function () {
    //Needs to be optimised, this is not the right place to put this code, might cause JS errors if Jquery isn' loaded yet.
    try{
        this.$('#inviteDate').datetimepicker();



        this.$('#moveindate').datetimepicker();
    }catch(err){
        console.log('dp failed');
    }
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
function getpropertyData(){
    var id = FlowRouter.current().params.id;
    var ret = Collections.Properties.find(id, {
        transform: function(data){

            data.auction = Collections.Auctions.findOne(data.auctionId);
            // data.applicationsReceivedCount = Collections.Bids.find({auctionId:data.auctionId}).count();
            data.applicationsReceivedCount = Counts.get("total-PropertyApplications");
            data.applicationsActiveCount = Counts.get("total-PropertyApplications");//Removing the diff between active and total received for now. date jan 9, 2019
            // data.applicationsActiveCount = Collections.Bids.find({auctionId:data.auctionId,isArchived:false}).count();
            data.chosenApplicationCount = Collections.Bids.find({auctionId:data.auctionId,isArchived:false,chosen:true}).count();

            return data;
        },
        limit: 1
    }).fetch();

    Meteor.subscribe('avgOffer', ret[0].auctionId);

    return ret[0];
}
function titleCase(str){
    if(!str)return;
    return str.charAt(0).toUpperCase() + str.toLowerCase().substring(1);
}
function dropdownCheckbox(){

    $( '.dropdown-menu .checkbox' ).unbind().on( 'click', function( event ) {

        var $target = $( event.currentTarget ),
            val = $target.find( 'input' ).attr( 'value' ),
            $inp = $target.find( 'input' ),
            idx;
        var userFilters = Session.get('userFilters');

        if(val == 'all'){
            setTimeout( function() { $( '.dropdown-menu input' ).not("[value='clearall']").prop( 'checked',true );dropdownCheckbox(); }, 10);
            if(userFilters){
                for(var i=0;i<userFilters.check.length;i++){
                    userFilters.check[i].enabled="enabled";
                }
                Session.set('userFilters',userFilters);
            }
            $( event.target ).blur();
            return false;
        }
        if(val == 'clearall'){
            setTimeout( function() { $( '.dropdown-menu input' ).prop( 'checked',false );dropdownCheckbox(); }, 10);
            if(userFilters){
                for(var i=0;i<userFilters.check.length;i++){
                    userFilters.check[i].enabled="";
                }
                Session.set('userFilters',userFilters);
            }
            $( event.target ).blur();
            return false;
        }
        if($($inp).prop( 'checked')){
            $($inp).prop( 'checked',false );
            if(userFilters.check){
                for(var i=0;i<userFilters.check.length;i++){
                    if(userFilters.check[i].val == val)userFilters.check[i].enabled="";
                }
            }
        }else{
            $($inp).prop( 'checked',true );
            if(userFilters.check){
                for(var i=0;i<userFilters.check.length;i++){
                    if(userFilters.check[i].val == val)userFilters.check[i].enabled="enabled";
                }
            }
        }



        // if ( ( idx = options.indexOf( val ) ) > -1 ) {
        //     options.splice( idx, 1 );
        //     setTimeout( function() { $inp.prop( 'checked', false ) }, 0);
        //     if(userFilters.check){
        //         for(var i=0;i<userFilters.check.length;i++){
        //             if(userFilters.check[i].val == val)userFilters.check[i].enabled="";
        //         }
        //     }
        // } else {
        //     options.push( val );
        //     setTimeout( function() { $inp.prop( 'checked', true ) }, 0);
        //     if(userFilters.check){
        //         for(var i=0;i<userFilters.check.length;i++){
        //             if(userFilters.check[i].val == val)userFilters.check[i].enabled="enabled";
        //         }
        //     }
        // }

        if(userFilters){
            Session.set('userFilters',userFilters);
        }
        $( event.target ).blur();
        dropdownCheckbox();
        // console.log( options );
        return false;
    });
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