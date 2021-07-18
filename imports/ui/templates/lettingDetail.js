/**
 * Created by srikanth681 on 02/02/16.
 */
import {Template} from "meteor/templating";
import "./lettingDetail.html";
isPageLockedMaster = '';

Template.lettingDetail.onCreated(function() {
    this.isApplicationInProgress = new ReactiveVar( false );
    this.isPageLocked = new ReactiveVar( true );
    isPageLockedMaster = this.isPageLocked;
})
Template.lettingDetail.helpers({
    myBid: function(){
        // debugger;
        var user = Meteor.user();
        if(!user)return false;
        var ret = Collections.Bids.find({auctionId:this.data._id,userId:user._id, isArchived:false}, {
            // transform: function(data){
            //
            //     var globalConfig = Collections.Config.findOne();
            //     data.PD = Collections.Properties.findOne(data.propertyId);
            //     data.applicationsReceivedCount = Collections.Bids.find({auctionId:data._id}).count();
            //
            //     data.PD.bedroomsCount = data.PD.bedrooms.length;
            //     data.PD.ensuiteCount = 0;
            //     data.PD.doubleBedCount = 0;
            //     for (var i = 0; i < data.PD.bedrooms.length; i++) {
            //         if (data.PD.bedrooms[i]["ensuite"] ) {
            //             data.PD.ensuiteCount++;
            //         }
            //         if (data.PD.bedrooms[i]["type"] == 'double' ) {
            //             data.PD.doubleBedCount++;
            //         }
            //     }
            //     data.primaryContact = data.contacts[0];
            //
            //     tmp = [];
            //     for ( var i=0; i< data.PD.amenities.length;i++){
            //         var src = globalConfig.amenitiesLogos[data.PD.amenities[i]];
            //         if(!src)src = globalConfig.amenitiesLogos["default"]
            //         tmp.push({name:data.PD.amenities[i], src: src })
            //     }
            //     data.PD.amenitiesWithImgs = tmp;
            //
            //
            //     return data;
            // },
            limit: 1
        }).fetch();
        ret = ret[0];

        Session.set('myBid',ret);
        return ret;
    },
    otherBids:function () {
        var myBid = Session.get('myBid');
        var user = Meteor.user();

        var maxLen = 5;
        var forTotCount = Collections.Bids.find({auctionId:this.data._id, isArchived:false}, {
            limit: maxLen,
            sort: { yourBid : -1 }
        })
        // debugger;
        if(!forTotCount.count()){//No results, return
            return {
                needed: false,
                arr: []
            }
        }
        if(!myBid || !user)return {
            needed: true,
            arr: forTotCount.fetch()
        }
        var weNeedOnSides = Math.floor( maxLen/2 )
        var needAbove = weNeedOnSides;
        var back = Collections.Bids.find({auctionId:this.data._id, userId:{$ne: user._id}, yourBid:{$lt:myBid.yourBid} ,isArchived:false}, {
            limit: maxLen - 1,
            sort: { yourBid : -1 }
        })
        var backCount = back.count();

        if(backCount<weNeedOnSides){ // if count isn't enough, then change back itself.
            back = Collections.Bids.find({auctionId:this.data._id, userId:{$ne: user._id}, yourBid:{$lte:myBid.yourBid} ,isArchived:false}, {
                limit: maxLen - 1,
                sort: { yourBid : -1 }
            })
        }
        backCount = back.count();
        if(backCount<weNeedOnSides){//if its still less, then update we needAbove value
            needAbove += weNeedOnSides-backCount;
        }

        var above = Collections.Bids.find({auctionId:this.data._id, userId:{$ne: user._id}, yourBid:{$gt:myBid.yourBid} ,isArchived:false}, {
            limit: maxLen - 1,
            sort: { yourBid : -1 }
        })
        var aboveCount = above.count();

        if(aboveCount<needAbove){ // if count isn't enough, then change back itself.
            above = Collections.Bids.find({auctionId:this.data._id, userId:{$ne: user._id}, yourBid:{$gte:myBid.yourBid} ,isArchived:false}, {
                limit: maxLen - 1,
                sort: { yourBid : -1 }
            })
        }
        aboveCount = above.count();

        var retAbove = above.fetch();
        var retBack = back.fetch();
        retAbove.push(myBid)

        return {
            needed: true,
            arr: retAbove.concat(retBack)
        };
    },
    isCurUserBid:function () {
        var user = Meteor.user();
        if(!user)return false;
        if(this.userId == user._id)return true;
        return false;
    },
    hasAllReqReferences: function(){
        var user = Meteor.user();
        if(!user)return false;
        if(user.profile.references.hasResume && user.profile.references.hasLandlordRef && user.profile.references.hasGovtID && user.profile.references.hasWorkRef )return true;
        return false;
    },
    refListArr: function(){
        var refList = [];
        var user = Meteor.user();
        if(!user)return refList;
        if(user.profile.references.hasResume) refList.push("Resume");
        if(user.profile.references.hasLandlordRef) refList.push("Landlord reference");
        if(user.profile.references.employerName) refList.push("Employer name");
        if(user.profile.references.employerTakeHome) refList.push("Employer take home salary");
        if(user.profile.references.hasWorkRef)  refList.push("Work reference");
        if(user.profile.references.hasGovtID)  refList.push("Government ID");
        if(user.profile.references.hasPassport)  refList.push("Passport");
        if(user.profile.references.hasPPS)  refList.push("PPS");
        if(user.profile.references.hasFinancialRef)  refList.push("Financial reference");
        return refList;
    },
    priceRange: function(){
        var min = this.data.price*0.7, max = this.data.price*1.5;// also used in propertyApplications.onRendered
        return {min:min, max:max}
    },
    isApplicationInProgress: function(){
        isApplicationInProgress = Template.instance().isApplicationInProgress;
        return Template.instance().isApplicationInProgress.get() ;
    },
    isPageLocked: function(){
        isPageLockedMaster = Template.instance().isPageLocked;
        return Template.instance().isPageLocked.get() ;
    },
    currentURL:function () {
        return Router.current().originalUrl;
    },
    alreadyLeased:function () {
        // var tmp =  Session.get("showErrorDlg");if(!tmp)tmp=[];
        if(!this.data){
            // tmp.push("Property Not Found. Please check the key and try again.");
            // Session.set("showErrorDlg",tmp)
            // Router.go("home");
            // Session.set('prevRoute',false);
            return false;
        }
        // var prevRoute = Session.get('prevRoute');
        if(this.data.isArchived){
            // var prevRoute = Session.get('prevRoute');
            // var tmp =  Session.get("showErrorDlg");if(!tmp)tmp=[];
            if(prevRoute){
                // tmp.push("Property already leased. Your landlord will contact you if you are the selected tenant. ");
                // Session.set("showErrorDlg",tmp)
                // Router.go(prevRoute.name,prevRoute.args)
                // Session.set('prevRoute',false);
            }else{
                // tmp.push("Property Not Found. Please check the key and try again.");
                // Session.set("showErrorDlg",tmp)
                // Router.go("home");
                // Session.set('prevRoute',false);

            }
            return true;
        }
        return false;
    },
    isAgent:function(){
        switch(this.data.createdByAgent){
            case '':
                return {
                    "logourl":Meteor.absoluteUrl()+'images/property-rental-agents/Bell-Property-Consultants.jpeg',
                    "name": 'Bell Property Consultants Ltd',
                    "address1":"Harolds Cross, Dublin",
                    "style":"height:100px;"
                }
        }

        return false;
    }
})
Template.lettingDetail.events({
    "click .applyNowBtn": function(event, template){
        // Prevent default browser form submit
        event.preventDefault();
        console.log("Apply now btn clicked")

        if(!isLoggedOn()){
            showLoginDialog();
            return;
        }
        var user = Meteor.user();
        // if(user._id == this._createdByAgent ){
        //     console.log("Owner cannot apply for the house.");
        //     return;
        // }
        //Do mobile verification
        if(Session.get('myBid')){
            var tmp =  Session.get("showErrorDlg");if(!tmp)tmp=[];
            tmp.push("Error: You have an existing application, please refresh the page.");
            Session.set("showErrorDlg",tmp)
            console.log("Already has a bid");
            return;
        }

        $.fancybox({
            'padding': 0,
            'href': '#confirm-apply-pop',
            afterShow:function(template){
                attachEvents();

                setTimeout(function () {
                    $('#bidPrice').focus().select()
                },500)
            },
            afterClose:function(template){
                console.log(template);
            }
        })


    },
    "click .withdrawBidBtn": function(event, template){
        var auctionId = this._id;
        Meteor.call('withdrawBid',auctionId,function(error, result){
            if(error){
                console.log(error.reason);
                return;
            }
            if(result.status=='Success'){
                console.log("Success");
            }
        });
    },
    "click .confirmApplyBtn": function(event, template){
        console.log('confirmApplyBtn');
        ga('send', 'event', 'PDPage', 'confirmApplyBtn', 'CAP: Confirm Apply Btn Clicked');
        confApplyEvent();
    },
    "click .redirectToProfilePage": function(event, template){
        redirectToProfilePageEvent();
    },
    "click .cap_closePopupBtn": function(event, template){
        console.log('cap_closePopupBtn');
        ga('send', 'event', 'PDPage', 'CAPClosePopupBtn', 'CAP: Cancle Apply Btn Clicked');
        closePopupEvent();
    },
    "click .backBtn": function(event, template){

        var prevRoute = Session.get('prevRoute');
        if(prevRoute){
            Router.go(prevRoute.name,prevRoute.args)
            Session.set('prevRoute',false);
        }else{
            Router.go("/account/myproperies/",{pageno:1});
        }
    },
    "click .noPropBackBtn": function(event, template){

        var prevRoute = Session.get('prevRoute');
        if(prevRoute){
            Router.go(prevRoute.name,prevRoute.args)
            Session.set('prevRoute',false);
        }else{
            Router.go("home");
        }
    },
    "click .pd_cap_btn": function(event, template){
        console.log('pd_cap_btn');
        ga('send', 'event', 'PDPage', 'CAPUploadRefBtnClicked', 'CAP: Upload Reference Btn Clicked');
        redirectToProfilePageEvent();
    },
    "click .pd_cap_a": function(event, template){
        console.log('pd_cap_a');
        ga('send', 'event', 'PDPage', 'CAPUploadRefAClicked', 'CAP: Upload Reference Anchor Link Clicked');
        redirectToProfilePageEvent();
    },
    "click .headerApplyNowBtn": function(event, template){
        console.log('headerApplyNowBtn');
        ga('send', 'event', 'PDPage', 'HeaderApplyNowBtnClicked', 'Header: Apply now Btn Clicked');
    },
    "click .mainUploadRefBtn": function(event, template){
        console.log('mainUploadRefBtn');
        ga('send', 'event', 'PDPage', 'UploadRefBtnClicked', 'Main: Upload Reference Btn Clicked');
        redirectToProfilePageEvent();
    },
    "click .mainUpdateRefBtn": function(event, template){
        console.log('mainUpdateRefBtn');
        ga('send', 'event', 'PDPage', 'UpdateRefBtnClicked', 'Main: Update Reference Btn Clicked');
        redirectToProfilePageEvent();
    },
    "click .mainApplyNowBtn": function(event, template){
        console.log('mainApplyNowBtn');
        ga('send', 'event', 'PDPage', 'ApplyNowBtnClicked', 'Main: Apply now Btn Clicked');
    },
})
Template.imagesSlider.helpers({
    images: function(){
        var data = Session.get("propertyData");
        var list = []
        // debugger;
        if(!data.PD.gallery)return [];
        for(var i=0;i<data.PD.gallery.length;i++){
            list.push(data.PD.gallery[i].url)
        }
        return list;
        // return [
        //     "images/gallery/model-appartment/1.jpg",
        //     "images/gallery/model-appartment/2.jpg",
        //     "images/gallery/model-appartment/3.jpg",
        //     "images/gallery/model-appartment/4.jpg",
        // ]
    },
    isActive: function (index) {
        return (index==0) ? 'active': '';
        // return (this == images[0]) ? 'active': '';
    }
})
Template.imagesSlider.events({
    'swipeleft #lettingDetailCarousel': function(e, t) {
        $(this).carousel('prev');
    },
    'swiperight #lettingDetailCarousel': function(e, t) {
        $(this).carousel('next');
    }
});
Template.imagesSlider.onRendered(function(){
    $(document).ready(function() {
        // $('#lettingDetailCarousel').first().addClass('active');//not needed as bug of isActive helper not working is fixed.

        $('#imagessection .item img').width('100%')
        var w = $('#imagessection .item img').first().width()
        var h = w/1.33;
        if(h>250)$('#imagessection .item img').height(w/1.33)
        setTimeout(function () {
            $('#imagessection .item img').width('100%')
            var w = $('#imagessection .item img').first().width()
            var h = w/1.33;
            if(h>250)$('#imagessection .item img').height()
        },3000)

        // $('#lettingDetailCarousel').carousel();
        // $("#lettingDetailCarousel").swiperight(function() {
        //     $(this).carousel('prev');
        // });
        // $("#lettingDetailCarousel").swipeleft(function() {
        //     $(this).carousel('next');
        // });
    });
})

function attachEvents() {
    $(".confirmApplyBtn").unbind().bind("click",function () {
        ga('send', 'event', 'PDPage', 'confirmApplyBtn', 'CAP: Confirm Apply Btn Clicked');
        confApplyEvent();
    })
    $(".redirectToProfilePage").unbind().bind("click",function () {
        redirectToProfilePageEvent();
    })
    $(".pd_cap_btn").unbind().bind("click",function () {
        console.log('pd_cap_btn');
        ga('send', 'event', 'PDPage', 'CAPUploadRefBtnClicked', 'CAP: Upload Reference Btn Clicked');
        redirectToProfilePageEvent();
    })
    $(".pd_cap_a").unbind().bind("click",function () {
        console.log('pd_cap_a');
        ga('send', 'event', 'PDPage', 'CAPUploadRefAClicked', 'CAP: Upload Reference Anchor Link Clicked');
        redirectToProfilePageEvent();
    })
    $(".cap_closePopupBtn").unbind().bind("click",function () {
        console.log('cap_closePopupBtn');
        ga('send', 'event', 'PDPage', 'CAPClosePopupBtn', 'CAP: Cancle Apply Btn Clicked');
        closePopupEvent();
    })
}
function confApplyEvent() {
    var data = Session.get("propertyData");
    var auctionId = data._id;
    var price = $('#bidPrice').val();
    price = parseInt(price);
    if(isNaN(price)){alert("Please enter a valid offer price.");return;}
    var bidMessage = $('#bidMessage').val();
    bidMessage = bidMessage.substring(0,500);
    var min = data.price*0.7, max = data.price*1.5;
    if(!auctionId){console.log("invalid data");return;}
    if(price <  min || price > max ){
        alert("Offer price should be between "+min+" and "+max+". Please adjust your offer price again.");return;
    }
    // debugger;
    isApplicationInProgress.set(true) ;
    Meteor.call('placeBid',[auctionId, price, bidMessage],function(error, result){
        isApplicationInProgress.set(false) ;
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

    var user = Accounts.user();
    if(!user.profile.mobile){
        var mobile = false;
        while(mobile==false) {//This is an un limited loop of mobile number.
            mobile = prompt("You don't have a mobile number attached to your profile. Please enter mobile to proceed. ");
            if( mobile != null && ! /^\d{10}$/.test(mobile))mobile = false;
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


}
function showConfDialog(){
    $.fancybox({
        'padding': 0,
        'href': '#fully-confirm',
        afterShow:function(template){
            attachEvents();

        },
        afterClose:function(template){
            console.log(template);
        }
    })
}
function redirectToProfilePageEvent() {
    var prevRoute = {name: Router.current().route.getName(),args:{key:Router.current().params.key} }
    Session.set('prevRoute',prevRoute);
    Router.go("account/profile")
    closePopupEvent();
}
function closePopupEvent() {
    if($)
        if($.fancybox)
            $.fancybox.close();
}

Template.lettingDetail.onRendered(function() {
    try{
        jQuery("html,body").animate({scrollTop: 0}, 50);
    }catch(e){
        document.body.scrollTop = document.documentElement.scrollTop = 0;
    }
    //Needs to be optimised, this is not the right place to put this code, might cause JS errors if Jquery isn' loaded yet.
    // try{
    //     this.$('#moveindate').datepicker();
    // }catch(err){
    //     console.log('dp failed');
    // }
    if(this.data) if(this.data.data) Meteor.call('updateViews',this.data.data._id);

    setTimeout(function () {
        try{
            isPageLockedMaster.set(false) ;//This causes error when bid exists as ispagelock helper wont startin the first place
        }catch (e){}

        //There are multiple dependents needed, like property details shows the property, but even bids helper function needs to load for this funcionality to work. Sometimes, pages shows up as property details from routes gets loaded, and the app by button shows up to users, but bid info starts loading after showing UI, we need give it some time as well as it decides if this button is needed or not.
    },3000)

    $(document).ready(function(){
        $('.scroll-menu-div').hide();
    });
    $(window).on("scroll", function() {
        var scrollPercent = 100 * $(window).scrollTop() / ($(document).height() - $(window).height());
        if(scrollPercent > 10){
            $('.scroll-menu-div').fadeIn();
            $(".scroll-menu-div").addClass('fixed-header');
        }
        else{
            $('.scroll-menu-div').hide();
            $(".scroll-menu-div").removeClass("fixed-header");

        }
    });

    $('.scroll1').click(function (e) {
        e.preventDefault();
        $('html,body').animate({scrollTop: $(this.hash).offset().top - 85}, 1000)

        $('.scroll1').removeClass('active');
        $(this).addClass('active');

    });


})

// var head = document.children[0].children[0];
// var script = document.createElement("script");
// script.type = "text/javascript";
// // script.src = "https://maps.googleapis.com/maps/api/js?v=3.exp&signed_in=true&libraries=places&key=AIzaSyCdSM6unCCtP3laNIvD04QHyNcyfCHNzqM";
// $(head).append("<script type='text/javascript' src='https://maps.googleapis.com/maps/api/js?v=3.exp&signed_in=true&libraries=places&key=AIzaSyCdSM6unCCtP3laNIvD04QHyNcyfCHNzqM'></script>");

function convertToSlug(Text) {
    return Text
        .toLowerCase()
        .replace(/[^\w ]+/g,'')
        .replace(/ +/g,'-')
        ;
}

function numDifferentiation(val) {
    if(val >= 1000000000) val = (val/1000000000).toFixed(2) + ' Billion';
    else if(val >= 1000000) val = (val/1000000).toFixed(2) + ' Million';
    return val.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
}

function getProjectData(){

    var id = Router.current().params._id;
    var Projects = Collections.Properties;
    globalConfig = Collections.Config.findOne();
    return Projects.findOne({
        "_id" : id
    },{
        transform: function(doc) {
            doc.auction = Collections.Auctions.findOne({
                _id: doc.auctionId
            });
            doc.homeCount = Collections.Units.find({
                projectId: doc._idzz
            }).count();

            var tmp = [];


            for ( var i=0; i< doc.projectDetails.amenities.length;i++){
                tmp.push({name:doc.projectDetails.amenities[i].name, src: globalConfig.amenitiesLogos[doc.projectDetails.amenities[i].name] })
            }
            doc.amenities = tmp;

            tmp = [];
            for ( var i=0; i< doc.projectDetails.loans.length;i++){
                tmp.push({name:doc.projectDetails.loans[i].name, src: globalConfig.bankLogos[doc.projectDetails.loans[i].name] })
            }
            doc.loans = tmp;

            return doc;
        }
    });
}




initGoogleMaps = (function(){
    var markerwithlabelTagLoaded = false;
    return function(){

        if (typeof google === 'object' && typeof google.maps === 'object') {
            console.log("google is found")

            inherits(MarkerLabel_, google.maps.OverlayView);
            inherits(MarkerWithLabel, google.maps.Marker); //Moved inside mapscode function above

            if(!markerwithlabelTagLoaded) {
                var script = document.createElement("script");
                script.type = "text/javascript";
                // script.src = "http://google-maps-utility-library-v3.googlecode.com/svn/tags/markerwithlabel/1.1.9/src/markerwithlabel.js";
                document.body.appendChild(script);
                markerwithlabelTagLoaded = true;
            }
            if (typeof MarkerWithLabel !== "undefined") {
                mapsCode();
                console.log("Maps is loaded")
            }else{
                console.log("MarkerWithLabel not found")
                setTimeout(initGoogleMaps, 1000);
            }


        }else{
            console.log("Maps not found")
            setTimeout(initGoogleMaps, 1000);
        }
    }
})();
function mapsCode() {

    var palceTypes = new Array('restaurant', 'shopping_mall', 'school', 'hospital', 'gym', 'park', 'bus_station', 'train_station', 'subway_station','airport');
    var palceNames = new Array('Restaurant', 'Shopping Mall', 'Schools', 'Health Care', 'Wellness', 'Parks', 'Bus Station', 'Railway Station', 'Metro Station','Airport');
    var selPlcTyps = new Array();

    var projectData = Session.get('projectData');
    var lt = projectData.projectDetails.address.geoCodeLat; // "13.067122";
    var lng = projectData.projectDetails.address.geoCodeLong; //"77.656877";
    // var lt = "13.067122";
    // var lng ="77.656877";
    // console.log('Lat: '+lt+' Long: '+lng)
    var map = "";
    var marker1 = "";
    var place_type = "";
    var mapOptions = "";
    var golbalclick = "";
    var plc = "";
    var icon="";

    var directions = new google.maps.DirectionsRenderer({suppressMarkers: true});
    var directionsService = new google.maps.DirectionsService();
    var directionsDisplay = new google.maps.DirectionsRenderer();
    var isTransit = false;
    function mapinitialize() {
        // var styles = [
        //     {
        //         stylers: [
        //             {saturation: -100},
        //             {hue: '#EEEBEB'},
        //             {lightness: -4},
        //         ]
        //     },
        //     {
        //         featureType: "poi.business",
        //         elementType: "geometry",
        //         stylers: [
        //             {lightness: 0},
        //             {visibility: "simplified"}
        //         ]
        //     },
        //     {
        //         featureType: "poi.attraction",
        //         elementType: "labels",
        //         stylers: [
        //             {visibility: "on"}
        //         ]
        //     },
        //     {
        //         featureType: "water",
        //         stylers: [
        //             {visibility: "on"},
        //             {color: "#EEEBEB"}
        //         ]
        //     }
        // ];

        // Create a new StyledMapType object, passing it the array of styles,
        // as well as the name to be displayed on the map type control.
        // var styledMap = new google.maps.StyledMapType(styles, {name: "Styled Map"});

        var myLatlng = new google.maps.LatLng(projectData.projectDetails.address.geoCodeLat,projectData.projectDetails.address.geoCodeLong);
        var mapOptions = {
            zoom: 12,
            center: myLatlng,
            scrollwheel: false,
            // mapTypeControlOptions: {
            //     mapTypeIds: [google.maps.MapTypeId.ROADMAP, 'map_style']
            // },
        }
        // console.log(_map_dynamic);
        marker_icon = "images/map/map-icon-new.png";
        var mark_tit = projectData.projectDetails.name;
        map = new google.maps.Map(document.getElementById("map-canvas"), mapOptions);
        new google.maps.Marker({
            icon:icon,
            position: myLatlng,
            setMap: map,
            title: mark_tit
        });
        // var marker = new google.maps.Marker({
        //       position: myLatlng,
        //       map: map,
        //       title:mark_tit
        // });

        // map.mapTypes.set('map_style', styledMap);
        // map.setMapTypeId('map_style');
    }

    // function _map_dynamic(){
    //   initialize();
    // }

    function initialize() {
        mapinitialize();
        place_type="";
        plc="";
        setMarkers(map);

        // var infowindow = new google.maps.InfoWindow({
        //   content: 'ibidmyhome'
        // });
        // infowindow.open(map,marker1);

        // google.maps.event.addListener(marker1, 'click', function() {
        //   infowindow.open(map,marker1);
        // });

    }

    function setMarkers(map) {

        var image1 = {
            url: 'images/map-target-marker.png',
            // This marker is 20 pixels wide by 32 pixels tall.
            size: new google.maps.Size(65, 65),
            // The origin for this image is 0,0.
            origin: new google.maps.Point(0, 0),
            // The anchor for this image is the base of the flagpole at 0,32.
            anchor: new google.maps.Point(40, 90)
        };


        var shape = {
            coords: [1, 1, 1, 20, 18, 20, 18, 1],
            type: 'poly'
        };

        marker1 = new MarkerWithLabel({
            position: new google.maps.LatLng(lt, lng),
            map: map,
            draggable: false,
            raiSEOnDrag: false,
            labelContent: "<span style='font-size:12px;color:#820101;font-weight:600'>"+projectData.projectDetails.name+"</span>",
            labelAnchor: new google.maps.Point(30, 30),
            labelClass: "map-label", // the CSS class for the label
            labelInBackground: false,
            zIndex: 4,
            icon: image1,
            // shape: shape,
        });
    }


    var infoPlcwindow = new google.maps.InfoWindow();
    var plc_marker = new Array();

    $('.squaredOne').click(function () {
        selPlcTyps=new Array();
        // placeBucket(place_type = $(this).attr('data-type'));
        place_type = $(this).attr('data-type');
        selPlcTyps.push(place_type);
        // console.log(selPlcTyps);
        getPlacesAround();
    });


    $('.transitmap').click(function () {
        initialize();
        if(isTransit){initialize();isTransit = false;}

        isTransit = true;

      /* close all info windows */
        infoPlcwindow.close();
      /* reset all routes */

      /*empty the selected types array */
        selPlcTyps = new Array();

        $('input[name="check"]:checked').each(function(){
            $(this).prop('checked',false);
            $(this).next().removeClass('active');
        });

        $('#from').val('');
        $(".inner").removeClass("left2");
        $(".slide1").removeClass("box-style");
        $(".navigation-hold-right").removeClass('new-pos');
        var place = $(this).data("type");

        plc = place.split(',');

        for (var i = 0; i < plc.length; i++) {
            selPlcTyps = new Array();
            place_type = plc[i];

            selPlcTyps.push(place_type);
            getPlacesAround();
        }



        // if (selPlcTyps.length) {
        //      //getPlacesAround();
        // } else {
        //     setAllMap();
        // }


    });


// function placeBucket(val) {

// }

    function getPlacesAround() {

        setAllMap(null);
        // console.log(selPlcTyps);

        var tatoone = new google.maps.LatLng(lt, lng);

        var request = {location: tatoone, radius: 7000, types: selPlcTyps};

        var service = new google.maps.places.PlacesService(map);

        service.nearbySearch(request, plc_calbck);
    }

  /* Function call back for the web service */
    var marker_icon = '';

    function plc_calbck(results, status) {
        // console.log(selPlcTyps);
        if (status == google.maps.places.PlacesServiceStatus.OK) {
            plc_marker = new Array();
            for (var i = 0; i < results.length; i++) {
                createMarker(results[i]);
            }
        }
    }

//                 /* Function to build markers */
    function createMarker(place) {
        // console.log(place);

        golbalclick = place.types[0];

        var _typArr = place.types;
        var _tempTyp = '', _dataTypeIndex ='';


        $(_typArr).each(function (p,ple){
            _tempTyp = $.inArray(ple, selPlcTyps);
            _dataTypeIndex = (!_dataTypeIndex && _tempTyp != -1)?_tempTyp:_dataTypeIndex;


        });

        var _icon = _typArr[0];

        if(_typArr[1]=="airport"){
            _icon=place.types[1];
        }

        // marker_icon = "images/map/"+_icon+".png";
        marker_icon = "images/map/map-icon-new.png";


        var infoIcon = "";
        // console.log(marker_icon);
        plc_marker.push(new google.maps.Marker({
            map: map,
            position: place.geometry.location,
            icon: marker_icon
        }));

        var icon = place.geometry.location;

        google.maps.event.addListener(plc_marker[(plc_marker.length) - 1], 'click', function (e) {

            var lt2 = e.latLng.lat();
            var lng2 = e.latLng.lng();
            var distancelatlong = getDistanceFromLatLonInKm(lt, lng, lt2, lng2);
            calculateRouteicons(lt2, lng2);
            // console.log(golbalclick);
            // infoPlcwindow.setContent('<div class="my-gm"><img src="' + infoIcon + '"><h4>' + place.name + '</h4><p>' + place.vicinity + '</p></div>');
            infoPlcwindow.setContent('<div class="my-gm"><h4>' + place.name + '</h4><p>' + place.vicinity + '</p><p>Distance:' + Math.round(distancelatlong) + 'KM</p></div>');
            infoPlcwindow.open(map, this);
        });

        var bounds = new google.maps.LatLngBounds();
        for (i = 0; i < plc_marker.length; i++) {
            bounds.extend(plc_marker[i].getPosition());
        }
        bounds.extend(marker1.getPosition());
        map.fitBounds(bounds);

    }

  /* Function to destroy the markers */
    function setAllMap() {
        for (var i = 0; i < plc_marker.length; i++) {
            plc_marker[i].setVisible(false);
        }
    }

    function makeMarker(position, title) {
        // new google.maps.Marker({
        //   icon:icon,
        //   position: position,
        //   setMap: map,
        //   title: title
        // });
    }

    function mapvalidate(from) {
        $('.maperror').html('');
        var txt=from;
        var from = $('#'+from).val();
        // console.log(from);

        if (from == "") {
            $('#'+txt).prop('placeholder','Please enter the place');
            $('#'+txt).focus();
            return false;
        } else {
            $('#'+txt).prop('placeholder','*From');
            $('.squaredOne label').removeClass('active');
            calculateRoute(from);
        }
        return false;
    }

    function calculateRoute(from) {
        initialize();
        isTransit = true;
        var to = 'lt, lng';
        var directionsRequest = {
            origin: from,
            destination: to,
            travelMode: google.maps.DirectionsTravelMode.DRIVING,
            unitSystem: google.maps.UnitSystem.METRIC
        };

        directionsService.route(directionsRequest, function (response, status) {
            if (status == google.maps.DirectionsStatus.OK) {
                directionsDisplay.setDirections(response);
                new google.maps.DirectionsRenderer({
                    map: map,
                    directions: response
                });
                var leg = response.routes[ 0 ].legs[ 0 ];
                // makeMarker(leg.start_location, projectData.projectDetails.name);
                // makeMarker(leg.end_location, from);
            }
            else
                $(".maperror").html("Unable to retrieve your route<br />");
        });
    }


// Calculating distance between two places
    function getDistanceFromLatLonInKm(lat1, lon1, lat2, lon2) {
        var R = 6371; // Radius of the earth in km
        var dLat = deg2rad(lat2 - lat1);  // deg2rad below
        var dLon = deg2rad(lon2 - lon1);
        var a =
                Math.sin(dLat / 2) * Math.sin(dLat / 2) +
                Math.cos(deg2rad(lat1)) * Math.cos(deg2rad(lat2)) *
                Math.sin(dLon / 2) * Math.sin(dLon / 2)
            ;
        var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
        var d = R * c; // Distance in km
        return d;
    }

    function deg2rad(deg) {
        return deg * (Math.PI / 180)
    }

//Deriving route between source and destination for icon places
    function calculateRouteicons(lt2, lng2) {
        directionsDisplay.setOptions( { suppressMarkers: true } );

        // directionsDisplay.setMap(null);
        // console.log(directionsDisplay);

        var to = 'lt, lng';

        var from = lt2 + ',' + lng2;
        var directionsRequest = {
            origin: from,
            destination: to,
            travelMode: google.maps.DirectionsTravelMode.DRIVING,
            unitSystem: google.maps.UnitSystem.METRIC
        };
        directionsDisplay.setMap(null);
        directionsService.route(directionsRequest, function (response, status) {

            if (status == google.maps.DirectionsStatus.OK) {

                directionsDisplay.setMap(map);
                directionsDisplay.setDirections(response);

                var loc = projectData.projectDetails.name;
                var leg = response.routes[ 0 ].legs[ 0 ];
                // makeMarker(leg.start_location, 'loc');
                // makeMarker(leg.end_location, from);
            }
        });
    }
    google.maps.event.addDomListener(window, 'load', mapinitialize);


// $(from).keypress(function (e) {
//     if (e.keyCode === 13) {
//         mapvalidate('from');
//     }
// });
    var from_pop = $('#from_pop');
    $(from_pop).keypress(function (e) {
        if (e.keyCode === 13) {
            mapvalidate('from_pop');
        }
    });

    $('.reset-btn').click(function(){
        //  $('#from').val('');
        $('#from_pop').val('');
        // $('#from').prop('placeholder','*From');
        $('#from_pop').prop('placeholder','*From');
        initialize();
        $('.maperror').hide();
    });
    initialize();

    //floating footer overlapping
    // $(window).on("scroll", function() {
    //   if($(window).width() >= 768){
    //   if ($(this).scrollTop() > 543) {
    //     $(".header").fadeOut();
    //     $('.scroll-menu-div').fadeIn();
    //     $(".scroll-menu-div").addClass('fixed-header');
    //   }
    //   else {
    //     $(".header").fadeIn();
    //     $('.scroll-menu-div').hide();

    //     $(".scroll-menu-div").removeClass("fixed-header");
    //     // $(".header").removeClass("fixed-header");
    //   }
    // }
    //   var scrollPercent = 100 * $(window).scrollTop() / ($(document).height() - $(window).height());
    //   if($(window).width() <= 767){
    //   if ($(this).scrollTop() > 543) {

    //     if(scrollPercent > 90){
    //     // $('.scroll-menu-div').hide();
    //     $('.scroll-menu-div').hide();

    //     $(".scroll-menu-div").removeClass("fixed-header");
    //      }
    //      else{
    //      // $('.scroll-menu-div').show();
    //      $('.scroll-menu-div').fadeIn();
    //     $(".scroll-menu-div").addClass('fixed-header');
    //      }

    //     $(".header").fadeOut();



    //   }
    //   else {
    //     $(".header").fadeIn();
    //     $('.scroll-menu-div').hide();

    //     $(".scroll-menu-div").removeClass("fixed-header");
    //     // $(".header").removeClass("fixed-header");
    //   }
    //   }
    // });

}
function showLoginDialog(){
    Session.set('showForgotForm',false)
    Session.set('showSignupForm',false)
    Session.set('showLoginSignupFancyBoxDialog',true)
    Session.set('showLoginDialog',true)
}





// new CODE
/**
 * @name MarkerWithLabel for V3
 * @version 1.1.10 [April 8, 2014]
 * @author Gary Little (inspired by code from Marc Ridey of Google).
 * @copyright Copyright 2012 Gary Little [gary at luxcentral.com]
 * @fileoverview MarkerWithLabel extends the Google Maps JavaScript API V3
 *  <code>google.maps.Marker</code> class.
 *  <p>
 *  MarkerWithLabel allows you to define markers with associated labels. As you would expect,
 *  if the marker is draggable, so too will be the label. In addition, a marker with a label
 *  responds to all mouse events in the same manner as a regular marker. It also fires mouse
 *  events and "property changed" events just as a regular marker would. Version 1.1 adds
 *  support for the raiseOnDrag feature introduced in API V3.3.
 *  <p>
 *  If you drag a marker by its label, you can cancel the drag and return the marker to its
 *  original position by pressing the <code>Esc</code> key. This doesn't work if you drag the marker
 *  itself because this feature is not (yet) supported in the <code>google.maps.Marker</code> class.
 */

/*!
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *       http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

/*jslint browser:true */
/*global document,google */

/**
 * @param {Function} childCtor Child class.
 * @param {Function} parentCtor Parent class.
 * @private
 */
function inherits(childCtor, parentCtor) {
  /* @constructor */
    function tempCtor() {}
    tempCtor.prototype = parentCtor.prototype;
    childCtor.superClass_ = parentCtor.prototype;
    childCtor.prototype = new tempCtor();
  /* @override */
    childCtor.prototype.constructor = childCtor;
}





/**
 * Returns the DIV for the cross used when dragging a marker when the
 * raiseOnDrag parameter set to true. One cross is shared with all markers.
 * @param {string} crossURL The URL of the cross image =.
 * @private
 */
MarkerLabel_.getSharedCross = function (crossURL) {
    var div;
    if (typeof MarkerLabel_.getSharedCross.crossDiv === "undefined") {
        div = document.createElement("img");
        div.style.cssText = "position: absolute; z-index: 1000002; display: none;";
        // Hopefully Google never changes the standard "X" attributes:
        div.style.marginLeft = "-8px";
        div.style.marginTop = "-9px";
        div.src = crossURL;
        MarkerLabel_.getSharedCross.crossDiv = div;
    }
    return MarkerLabel_.getSharedCross.crossDiv;
};

/**
 * Adds the DIV representing the label to the DOM. This method is called
 * automatically when the marker's <code>setMap</code> method is called.
 * @private
 */
MarkerLabel_.prototype.onAdd = function () {
    var me = this;
    var cMouseIsDown = false;
    var cDraggingLabel = false;
    var cSavedZIndex;
    var cLatOffset, cLngOffset;
    var cIgnoreClick;
    var cRaiseEnabled;
    var cStartPosition;
    var cStartCenter;
    // Constants:
    var cRaiseOffset = 20;
    var cDraggingCursor = "url(" + this.handCursorURL_ + ")";

    // Stops all processing of an event.
    //
    var cAbortEvent = function (e) {
        if (e.preventDefault) {
            e.preventDefault();
        }
        e.cancelBubble = true;
        if (e.stopPropagation) {
            e.stopPropagation();
        }
    };

    var cStopBounce = function () {
        me.marker_.setAnimation(null);
    };

    this.getPanes().overlayImage.appendChild(this.labelDiv_);
    this.getPanes().overlayMouseTarget.appendChild(this.eventDiv_);
    // One cross is shared with all markers, so only add it once:
    if (typeof MarkerLabel_.getSharedCross.processed === "undefined") {
        this.getPanes().overlayImage.appendChild(this.crossDiv_);
        MarkerLabel_.getSharedCross.processed = true;
    }

    this.listeners_ = [
        google.maps.event.addDomListener(this.eventDiv_, "mouseover", function (e) {
            if (me.marker_.getDraggable() || me.marker_.getClickable()) {
                this.style.cursor = "pointer";
                google.maps.event.trigger(me.marker_, "mouseover", e);
            }
        }),
        google.maps.event.addDomListener(this.eventDiv_, "mouseout", function (e) {
            if ((me.marker_.getDraggable() || me.marker_.getClickable()) && !cDraggingLabel) {
                this.style.cursor = me.marker_.getCursor();
                google.maps.event.trigger(me.marker_, "mouseout", e);
            }
        }),
        google.maps.event.addDomListener(this.eventDiv_, "mousedown", function (e) {
            cDraggingLabel = false;
            if (me.marker_.getDraggable()) {
                cMouseIsDown = true;
                this.style.cursor = cDraggingCursor;
            }
            if (me.marker_.getDraggable() || me.marker_.getClickable()) {
                google.maps.event.trigger(me.marker_, "mousedown", e);
                cAbortEvent(e); // Prevent map pan when starting a drag on a label
            }
        }),
        google.maps.event.addDomListener(document, "mouseup", function (mEvent) {
            var position;
            if (cMouseIsDown) {
                cMouseIsDown = false;
                me.eventDiv_.style.cursor = "pointer";
                google.maps.event.trigger(me.marker_, "mouseup", mEvent);
            }
            if (cDraggingLabel) {
                if (cRaiseEnabled) { // Lower the marker & label
                    position = me.getProjection().fromLatLngToDivPixel(me.marker_.getPosition());
                    position.y += cRaiseOffset;
                    me.marker_.setPosition(me.getProjection().fromDivPixelToLatLng(position));
                    // This is not the same bouncing style as when the marker portion is dragged,
                    // but it will have to do:
                    try { // Will fail if running Google Maps API earlier than V3.3
                        me.marker_.setAnimation(google.maps.Animation.BOUNCE);
                        setTimeout(cStopBounce, 1406);
                    } catch (e) {}
                }
                me.crossDiv_.style.display = "none";
                me.marker_.setZIndex(cSavedZIndex);
                cIgnoreClick = true; // Set flag to ignore the click event reported after a label drag
                cDraggingLabel = false;
                mEvent.latLng = me.marker_.getPosition();
                google.maps.event.trigger(me.marker_, "dragend", mEvent);
            }
        }),
        google.maps.event.addListener(me.marker_.getMap(), "mousemove", function (mEvent) {
            var position;
            if (cMouseIsDown) {
                if (cDraggingLabel) {
                    // Change the reported location from the mouse position to the marker position:
                    mEvent.latLng = new google.maps.LatLng(mEvent.latLng.lat() - cLatOffset, mEvent.latLng.lng() - cLngOffset);
                    position = me.getProjection().fromLatLngToDivPixel(mEvent.latLng);
                    if (cRaiseEnabled) {
                        me.crossDiv_.style.left = position.x + "px";
                        me.crossDiv_.style.top = position.y + "px";
                        me.crossDiv_.style.display = "";
                        position.y -= cRaiseOffset;
                    }
                    me.marker_.setPosition(me.getProjection().fromDivPixelToLatLng(position));
                    if (cRaiseEnabled) { // Don't raise the veil; this hack needed to make MSIE act properly
                        me.eventDiv_.style.top = (position.y + cRaiseOffset) + "px";
                    }
                    google.maps.event.trigger(me.marker_, "drag", mEvent);
                } else {
                    // Calculate offsets from the click point to the marker position:
                    cLatOffset = mEvent.latLng.lat() - me.marker_.getPosition().lat();
                    cLngOffset = mEvent.latLng.lng() - me.marker_.getPosition().lng();
                    cSavedZIndex = me.marker_.getZIndex();
                    cStartPosition = me.marker_.getPosition();
                    cStartCenter = me.marker_.getMap().getCenter();
                    cRaiseEnabled = me.marker_.get("raiseOnDrag");
                    cDraggingLabel = true;
                    me.marker_.setZIndex(1000000); // Moves the marker & label to the foreground during a drag
                    mEvent.latLng = me.marker_.getPosition();
                    google.maps.event.trigger(me.marker_, "dragstart", mEvent);
                }
            }
        }),
        google.maps.event.addDomListener(document, "keydown", function (e) {
            if (cDraggingLabel) {
                if (e.keyCode === 27) { // Esc key
                    cRaiseEnabled = false;
                    me.marker_.setPosition(cStartPosition);
                    me.marker_.getMap().setCenter(cStartCenter);
                    google.maps.event.trigger(document, "mouseup", e);
                }
            }
        }),
        google.maps.event.addDomListener(this.eventDiv_, "click", function (e) {
            if (me.marker_.getDraggable() || me.marker_.getClickable()) {
                if (cIgnoreClick) { // Ignore the click reported when a label drag ends
                    cIgnoreClick = false;
                } else {
                    google.maps.event.trigger(me.marker_, "click", e);
                    cAbortEvent(e); // Prevent click from being passed on to map
                }
            }
        }),
        google.maps.event.addDomListener(this.eventDiv_, "dblclick", function (e) {
            if (me.marker_.getDraggable() || me.marker_.getClickable()) {
                google.maps.event.trigger(me.marker_, "dblclick", e);
                cAbortEvent(e); // Prevent map zoom when double-clicking on a label
            }
        }),
        google.maps.event.addListener(this.marker_, "dragstart", function (mEvent) {
            if (!cDraggingLabel) {
                cRaiseEnabled = this.get("raiseOnDrag");
            }
        }),
        google.maps.event.addListener(this.marker_, "drag", function (mEvent) {
            if (!cDraggingLabel) {
                if (cRaiseEnabled) {
                    me.setPosition(cRaiseOffset);
                    // During a drag, the marker's z-index is temporarily set to 1000000 to
                    // ensure it appears above all other markers. Also set the label's z-index
                    // to 1000000 (plus or minus 1 depending on whether the label is supposed
                    // to be above or below the marker).
                    me.labelDiv_.style.zIndex = 1000000 + (this.get("labelInBackground") ? -1 : +1);
                }
            }
        }),
        google.maps.event.addListener(this.marker_, "dragend", function (mEvent) {
            if (!cDraggingLabel) {
                if (cRaiseEnabled) {
                    me.setPosition(0); // Also restores z-index of label
                }
            }
        }),
        google.maps.event.addListener(this.marker_, "position_changed", function () {
            me.setPosition();
        }),
        google.maps.event.addListener(this.marker_, "zindex_changed", function () {
            me.setZIndex();
        }),
        google.maps.event.addListener(this.marker_, "visible_changed", function () {
            me.setVisible();
        }),
        google.maps.event.addListener(this.marker_, "labelvisible_changed", function () {
            me.setVisible();
        }),
        google.maps.event.addListener(this.marker_, "title_changed", function () {
            me.setTitle();
        }),
        google.maps.event.addListener(this.marker_, "labelcontent_changed", function () {
            me.setContent();
        }),
        google.maps.event.addListener(this.marker_, "labelanchor_changed", function () {
            me.setAnchor();
        }),
        google.maps.event.addListener(this.marker_, "labelclass_changed", function () {
            me.setStyles();
        }),
        google.maps.event.addListener(this.marker_, "labelstyle_changed", function () {
            me.setStyles();
        })
    ];
};

/**
 * Removes the DIV for the label from the DOM. It also removes all event handlers.
 * This method is called automatically when the marker's <code>setMap(null)</code>
 * method is called.
 * @private
 */
MarkerLabel_.prototype.onRemove = function () {
    var i;
    this.labelDiv_.parentNode.removeChild(this.labelDiv_);
    this.eventDiv_.parentNode.removeChild(this.eventDiv_);

    // Remove event listeners:
    for (i = 0; i < this.listeners_.length; i++) {
        google.maps.event.removeListener(this.listeners_[i]);
    }
};

/**
 * Draws the label on the map.
 * @private
 */
MarkerLabel_.prototype.draw = function () {
    this.setContent();
    this.setTitle();
    this.setStyles();
};

/**
 * Sets the content of the label.
 * The content can be plain text or an HTML DOM node.
 * @private
 */
MarkerLabel_.prototype.setContent = function () {
    var content = this.marker_.get("labelContent");
    if (typeof content.nodeType === "undefined") {
        this.labelDiv_.innerHTML = content;
        this.eventDiv_.innerHTML = this.labelDiv_.innerHTML;
    } else {
        this.labelDiv_.innerHTML = ""; // Remove current content
        this.labelDiv_.appendChild(content);
        content = content.cloneNode(true);
        this.eventDiv_.innerHTML = ""; // Remove current content
        this.eventDiv_.appendChild(content);
    }
};

/**
 * Sets the content of the tool tip for the label. It is
 * always set to be the same as for the marker itself.
 * @private
 */
MarkerLabel_.prototype.setTitle = function () {
    this.eventDiv_.title = this.marker_.getTitle() || "";
};

/**
 * Sets the style of the label by setting the style sheet and applying
 * other specific styles requested.
 * @private
 */
MarkerLabel_.prototype.setStyles = function () {
    var i, labelStyle;

    // Apply style values from the style sheet defined in the labelClass parameter:
    this.labelDiv_.className = this.marker_.get("labelClass");
    this.eventDiv_.className = this.labelDiv_.className;

    // Clear existing inline style values:
    this.labelDiv_.style.cssText = "";
    this.eventDiv_.style.cssText = "";
    // Apply style values defined in the labelStyle parameter:
    labelStyle = this.marker_.get("labelStyle");
    for (i in labelStyle) {
        if (labelStyle.hasOwnProperty(i)) {
            this.labelDiv_.style[i] = labelStyle[i];
            this.eventDiv_.style[i] = labelStyle[i];
        }
    }
    this.setMandatoryStyles();
};

/**
 * Sets the mandatory styles to the DIV representing the label as well as to the
 * associated event DIV. This includes setting the DIV position, z-index, and visibility.
 * @private
 */
MarkerLabel_.prototype.setMandatoryStyles = function () {
    this.labelDiv_.style.position = "absolute";
    this.labelDiv_.style.overflow = "hidden";
    // Make sure the opacity setting causes the desired effect on MSIE:
    if (typeof this.labelDiv_.style.opacity !== "undefined" && this.labelDiv_.style.opacity !== "") {
        this.labelDiv_.style.MsFilter = "\"progid:DXImageTransform.Microsoft.Alpha(opacity=" + (this.labelDiv_.style.opacity * 100) + ")\"";
        this.labelDiv_.style.filter = "alpha(opacity=" + (this.labelDiv_.style.opacity * 100) + ")";
    }

    this.eventDiv_.style.position = this.labelDiv_.style.position;
    this.eventDiv_.style.overflow = this.labelDiv_.style.overflow;
    this.eventDiv_.style.opacity = 0.01; // Don't use 0; DIV won't be clickable on MSIE
    this.eventDiv_.style.MsFilter = "\"progid:DXImageTransform.Microsoft.Alpha(opacity=1)\"";
    this.eventDiv_.style.filter = "alpha(opacity=1)"; // For MSIE

    this.setAnchor();
    this.setPosition(); // This also updates z-index, if necessary.
    this.setVisible();
};

/**
 * Sets the anchor point of the label.
 * @private
 */
MarkerLabel_.prototype.setAnchor = function () {
    var anchor = this.marker_.get("labelAnchor");
    this.labelDiv_.style.marginLeft = -anchor.x + "px";
    this.labelDiv_.style.marginTop = -anchor.y + "px";
    this.eventDiv_.style.marginLeft = -anchor.x + "px";
    this.eventDiv_.style.marginTop = -anchor.y + "px";
};

/**
 * Sets the position of the label. The z-index is also updated, if necessary.
 * @private
 */
MarkerLabel_.prototype.setPosition = function (yOffset) {
    var position = this.getProjection().fromLatLngToDivPixel(this.marker_.getPosition());
    if (typeof yOffset === "undefined") {
        yOffset = 0;
    }
    this.labelDiv_.style.left = Math.round(position.x) + "px";
    this.labelDiv_.style.top = Math.round(position.y - yOffset) + "px";
    this.eventDiv_.style.left = this.labelDiv_.style.left;
    this.eventDiv_.style.top = this.labelDiv_.style.top;

    this.setZIndex();
};

/**
 * Sets the z-index of the label. If the marker's z-index property has not been defined, the z-index
 * of the label is set to the vertical coordinate of the label. This is in keeping with the default
 * stacking order for Google Maps: markers to the south are in front of markers to the north.
 * @private
 */
MarkerLabel_.prototype.setZIndex = function () {
    var zAdjust = (this.marker_.get("labelInBackground") ? -1 : +1);
    if (typeof this.marker_.getZIndex() === "undefined") {
        this.labelDiv_.style.zIndex = parseInt(this.labelDiv_.style.top, 10) + zAdjust;
        this.eventDiv_.style.zIndex = this.labelDiv_.style.zIndex;
    } else {
        this.labelDiv_.style.zIndex = this.marker_.getZIndex() + zAdjust;
        this.eventDiv_.style.zIndex = this.labelDiv_.style.zIndex;
    }
};

/**
 * Sets the visibility of the label. The label is visible only if the marker itself is
 * visible (i.e., its visible property is true) and the labelVisible property is true.
 * @private
 */
MarkerLabel_.prototype.setVisible = function () {
    if (this.marker_.get("labelVisible")) {
        this.labelDiv_.style.display = this.marker_.getVisible() ? "block" : "none";
    } else {
        this.labelDiv_.style.display = "none";
    }
    this.eventDiv_.style.display = this.labelDiv_.style.display;
};





/**
 * Overrides the standard Marker setMap function.
 * @param {Map} theMap The map to which the marker is to be added.
 * @private
 */
MarkerWithLabel.prototype.setMap = function (theMap) {

    // Call the inherited function...
    google.maps.Marker.prototype.setMap.apply(this, arguments);

    // ... then deal with the label:
    this.label.setMap(theMap);
};


/**
 * This constructor creates a label and associates it with a marker.
 * It is for the private use of the MarkerWithLabel class.
 * @constructor
 * @param {Marker} marker The marker with which the label is to be associated.
 * @param {string} crossURL The URL of the cross image =.
 * @param {string} handCursor The URL of the hand cursor.
 * @private
 */
function MarkerLabel_(marker, crossURL, handCursorURL) {
    this.marker_ = marker;
    this.handCursorURL_ = marker.handCursorURL;

    this.labelDiv_ = document.createElement("div");
    this.labelDiv_.style.cssText = "position: absolute; overflow: hidden;";

    // Set up the DIV for handling mouse events in the label. This DIV forms a transparent veil
    // in the "overlayMouseTarget" pane, a veil that covers just the label. This is done so that
    // events can be captured even if the label is in the shadow of a google.maps.InfoWindow.
    // Code is included here to ensure the veil is always exactly the same size as the label.
    this.eventDiv_ = document.createElement("div");
    this.eventDiv_.style.cssText = this.labelDiv_.style.cssText;

    // This is needed for proper behavior on MSIE:
    this.eventDiv_.setAttribute("onselectstart", "return false;");
    this.eventDiv_.setAttribute("ondragstart", "return false;");

    // Get the DIV for the "X" to be displayed when the marker is raised.
    this.crossDiv_ = MarkerLabel_.getSharedCross(crossURL);
}

/**
 * @name MarkerWithLabelOptions
 * @class This class represents the optional parameter passed to the {@link MarkerWithLabel} constructor.
 *  The properties available are the same as for <code>google.maps.Marker</code> with the addition
 *  of the properties listed below. To change any of these additional properties after the labeled
 *  marker has been created, call <code>google.maps.Marker.set(propertyName, propertyValue)</code>.
 *  <p>
 *  When any of these properties changes, a property changed event is fired. The names of these
 *  events are derived from the name of the property and are of the form <code>propertyname_changed</code>.
 *  For example, if the content of the label changes, a <code>labelcontent_changed</code> event
 *  is fired.
 *  <p>
 * @property {string|Node} [labelContent] The content of the label (plain text or an HTML DOM node).
 * @property {Point} [labelAnchor] By default, a label is drawn with its anchor point at (0,0) so
 *  that its top left corner is positioned at the anchor point of the associated marker. Use this
 *  property to change the anchor point of the label. For example, to center a 50px-wide label
 *  beneath a marker, specify a <code>labelAnchor</code> of <code>google.maps.Point(25, 0)</code>.
 *  (Note: x-values increase to the right and y-values increase to the top.)
 * @property {string} [labelClass] The name of the CSS class defining the styles for the label.
 *  Note that style values for <code>position</code>, <code>overflow</code>, <code>top</code>,
 *  <code>left</code>, <code>zIndex</code>, <code>display</code>, <code>marginLeft</code>, and
 *  <code>marginTop</code> are ignored; these styles are for internal use only.
 * @property {Object} [labelStyle] An object literal whose properties define specific CSS
 *  style values to be applied to the label. Style values defined here override those that may
 *  be defined in the <code>labelClass</code> style sheet. If this property is changed after the
 *  label has been created, all previously set styles (except those defined in the style sheet)
 *  are removed from the label before the new style values are applied.
 *  Note that style values for <code>position</code>, <code>overflow</code>, <code>top</code>,
 *  <code>left</code>, <code>zIndex</code>, <code>display</code>, <code>marginLeft</code>, and
 *  <code>marginTop</code> are ignored; these styles are for internal use only.
 * @property {boolean} [labelInBackground] A flag indicating whether a label that overlaps its
 *  associated marker should appear in the background (i.e., in a plane below the marker).
 *  The default is <code>false</code>, which causes the label to appear in the foreground.
 * @property {boolean} [labelVisible] A flag indicating whether the label is to be visible.
 *  The default is <code>true</code>. Note that even if <code>labelVisible</code> is
 *  <code>true</code>, the label will <i>not</i> be visible unless the associated marker is also
 *  visible (i.e., unless the marker's <code>visible</code> property is <code>true</code>).
 * @property {boolean} [raiseOnDrag] A flag indicating whether the label and marker are to be
 *  raised when the marker is dragged. The default is <code>true</code>. If a draggable marker is
 *  being created and a version of Google Maps API earlier than V3.3 is being used, this property
 *  must be set to <code>false</code>.
 * @property {boolean} [optimized] A flag indicating whether rendering is to be optimized for the
 *  marker. <b>Important: The optimized rendering technique is not supported by MarkerWithLabel,
 *  so the value of this parameter is always forced to <code>false</code>.
 * @property {string} [crossImage="http://maps.gstatic.com/intl/en_us/mapfiles/drag_cross_67_16.png"]
 *  The URL of the cross image to be displayed while dragging a marker.
 * @property {string} [handCursor="http://maps.gstatic.com/intl/en_us/mapfiles/closedhand_8_8.cur"]
 *  The URL of the cursor to be displayed while dragging a marker.
 */
/**
 * Creates a MarkerWithLabel with the options specified in {@link MarkerWithLabelOptions}.
 * @constructor
 * @param {MarkerWithLabelOptions} [opt_options] The optional parameters.
 */
function MarkerWithLabel(opt_options) {
    opt_options = opt_options || {};
    opt_options.labelContent = opt_options.labelContent || "";
    opt_options.labelAnchor = opt_options.labelAnchor || new google.maps.Point(0, 0);
    opt_options.labelClass = opt_options.labelClass || "markerLabels";
    opt_options.labelStyle = opt_options.labelStyle || {};
    opt_options.labelInBackground = opt_options.labelInBackground || false;
    if (typeof opt_options.labelVisible === "undefined") {
        opt_options.labelVisible = true;
    }
    if (typeof opt_options.raiseOnDrag === "undefined") {
        opt_options.raiseOnDrag = true;
    }
    if (typeof opt_options.clickable === "undefined") {
        opt_options.clickable = true;
    }
    if (typeof opt_options.draggable === "undefined") {
        opt_options.draggable = false;
    }
    if (typeof opt_options.optimized === "undefined") {
        opt_options.optimized = false;
    }
    opt_options.crossImage = opt_options.crossImage || "http" + (document.location.protocol === "https:" ? "s" : "") + "://maps.gstatic.com/intl/en_us/mapfiles/drag_cross_67_16.png";
    opt_options.handCursor = opt_options.handCursor || "http" + (document.location.protocol === "https:" ? "s" : "") + "://maps.gstatic.com/intl/en_us/mapfiles/closedhand_8_8.cur";
    opt_options.optimized = false; // Optimized rendering is not supported

    this.label = new MarkerLabel_(this, opt_options.crossImage, opt_options.handCursor); // Bind the label to the marker

    // Call the parent constructor. It calls Marker.setValues to initialize, so all
    // the new parameters are conveniently saved and can be accessed with get/set.
    // Marker.set triggers a property changed event (called "propertyname_changed")
    // that the marker label listens for in order to react to state changes.
    google.maps.Marker.apply(this, arguments);
}