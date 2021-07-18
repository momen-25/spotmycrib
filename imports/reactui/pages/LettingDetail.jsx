/**
 * Created by njanjanam on 08/08/2018.
 */
import { Meteor } from 'meteor/meteor';
import React, { Component } from 'react';
import ReactDOM from 'react-dom';
import { withTracker } from 'meteor/react-meteor-data';
import MainLayoutFooter from '../layout/MainLayoutFooter.jsx'
import MainLayoutHeader from '../layout/MainLayoutHeader.jsx'
import {Collections} from "../../api/collections";
import { isArray } from 'util';
updateViewsCalled=false;
propertyKeyOfThisPage = ''
if(Meteor.isClient)Session.set('subscriptionsReady',false);
if(Meteor.isClient)Session.set('subscriptionsReady2',false);

function titleCase(str) {
    if(!str)return;
    return str.charAt(0).toUpperCase() + str.toLowerCase().substring(1);
}
function dateFormat(text){
    var date = new Date(text)
    if(date.toString() == "Invalid Date")return 'N/A';
    return  date.toDateString();
}
function addCommaToEach(arr){
    if(!arr)return '';
    return  arr.join(', ');
}
function nlToBr(str) {
    if (!str) return '';
    return str.replace(/(?:\r\n|\r|\n)/g, '<br />');
}
function validateMobileNumber(mobile){
    let tmp = mobile.split('+');
    if(tmp.length>1)
        mobile = tmp[1];
    if(mobile.length<6) return false;
    return /^\d+$/.test(mobile)
}
function attachEvents() {
    $(".confirmApplyBtn").unbind().bind("click",function () {
        ga('send', 'event', 'PDPage', 'confirmApplyBtn', 'CAP: Confirm Apply Btn Clicked');
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
function showConfDialog(){
    $.fancybox({
        'padding': 0,
        'href': '#fully-confirm',
        afterShow:function(){
            attachEvents();

        },
        afterClose:function(template){}
    })
}
function redirectToProfilePageEvent() {
    var prevRoute = {name: FlowRouter.current().route.name,args:{key:FlowRouter.current().params.key} }
    Session.set('prevRoute',prevRoute);
    FlowRouter.go("account/profile")
    closePopupEvent();
}
function closePopupEvent() {
    if($)
        if($.fancybox)
            $.fancybox.close();
}
function generateSlug(curURL){
    var propertyType = curURL.propertyType;
    var county = curURL.county
    var area = curURL.area
    var maxRent = curURL.maxRent
    var country = curURL.country;
    var bedCount = curURL.bedCount;
    var luxurySort = curURL.luxurySort;
    var cheapSort = curURL.cheapSort;
    // const territory = target.territory.value;

    var slug='';
    var query={};

    if(propertyType)propertyType = propertyType.replace(/\s+/g, '_')
    if(county)county = county.replace(/\s+/g, '_')
    if(area)area = area.replace(/\s+/g, '_')
    if(country)country = country.replace(/\s+/g, '_')

    if(propertyType)slug=propertyType+"-for-"
    slug+="rent"
    // if(areaSelected||countySelected||country)
    slug+="-in-"

    if(!county)area = '';

    if(area)slug+=area
    if(area && county)slug+="-"
    if(county)slug+=county

    if(bedCount)query.bedCount = bedCount;
    if(luxurySort)query.luxurySort = 1;
    if(cheapSort)query.cheapSort = 1;

    if(country)slug+="-"+country
    else slug+="-ireland"

    var range = [{cur:"eur",min:400,max:10000}]
    var selectedCur = range[0];
    if(maxRent && maxRent!=selectedCur.max)query.maxRent = maxRent;

    // apartment-for-rent-in-dundrum-dublin-ireland
    // apartment-for-rent-in-donnybroke-london-uk
    // rent/apartment/dundrum/dublin
    // rent/apartment/donnybroke/london/england/uk/
    return [
        slugify(slug),
        query
    ]
}
function generateSlugURL(curURL){
    var ret = generateSlug(curURL)
    return FlowRouter.url('b',{slug:ret[0]},ret[1]);
}
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
function showLoginDialog(){
    Session.set('showForgotForm',false)
    Session.set('showSignupForm',false)
    Session.set('showLoginSignupFancyBoxDialog',true)
    Session.set('showLoginDialog',true)
}
function fixImageSize() {
    var avgW=0;
    $('#relatedsection .thumbnail img').each(function(){

        if(!avgW)avgW = $(this).width();
        else {
            avgW += $(this).width();
            avgW =  avgW / 2;
        }
    })
    if(!avgW)avgW = 250;
    $('#relatedsection .thumbnail img').width('100%');
    $('#relatedsection .thumbnail img').height(avgW*0.7);
}
function chunkify(a, n, balanced) {

    if (n < 2)
        return [a];

    if(!Array.isArray(a))return [];

    var len = a.length,
        out = [],
        i = 0,
        size;

    if (len % n === 0) {
        size = Math.floor(len / n);
        while (i < len) {
            out.push(a.slice(i, i += size));
        }
    }

    else if (balanced) {
        while (i < len) {
            size = Math.ceil((len - i) / n--);
            out.push(a.slice(i, i += size));
        }
    }

    else {

        n--;
        size = Math.floor(len / n);
        if (len % size === 0)
            size--;
        while (i < size * n) {
            out.push(a.slice(i, i += size));
        }
        out.push(a.slice(size * n));

    }

    return out;
}
function autoExpandDelayed() {
    setTimeout(autoExpand,500)
}
function autoExpand() {
    let field = $('#bidMessage')[0]
    if(!field)return;
    // Reset field height
    field.style.height = 'inherit';

    // Get the computed styles for the element
    var computed = window.getComputedStyle(field);

    // Calculate the height
    var height = parseInt(computed.getPropertyValue('border-top-width'), 10)
        + parseInt(computed.getPropertyValue('padding-top'), 10)
        + field.scrollHeight
        + parseInt(computed.getPropertyValue('padding-bottom'), 10)
        + parseInt(computed.getPropertyValue('border-bottom-width'), 10);

    field.style.height = (height-20) + 'px';//adding -40 due to the result of test case that its causing too much space extra in a normal way, may be due to font size, line height etc.

};
isApplySuccessfulOpen = false;
function showApplySuccessfulDialog(){
    // console.log("Apply showApplySuccessfulDialog")

    $.fancybox({
        'padding': 0,
        'href': '#apply-successful-popup',
        afterShow:function(){isApplySuccessfulOpen=true;},
        afterClose:function(){isApplySuccessfulOpen=false;}
    })
}

class LettingDetail extends Component {

    constructor(props) {
        super(props)
        var current = FlowRouter.current();
        this.currentURL = FlowRouter.url(FlowRouter.current().route.name, FlowRouter.current().params)
        var searchCrumbs = {c1:[],c2:[],c3:[]}
        var fCrumbs = {c1:[],c2:[],c3:[]}
        var areaCrumbs = {c1:[],c2:[],c3:[]}
        var countyCrumbs = {c1:[],c2:[],c3:[]}
        if(props.data){
            if(props.data.searchCrumbs){
                var chunks = chunkify(props.data.searchCrumbs,3,true)
                searchCrumbs = {c1:chunks[0],c2:chunks[1],c3:chunks[2]}
            }
            if(props.data.fCrumbs){
                var chunks = chunkify(props.data.fCrumbs,3,true)
                fCrumbs = {c1:chunks[0],c2:chunks[1],c3:chunks[2]}
            }
            if(props.data.areaCrumbs){
                var chunks = chunkify(props.data.areaCrumbs,3,true)
                areaCrumbs = {c1:chunks[0],c2:chunks[1],c3:chunks[2]}
            }
            if(props.data.countyCrumbs){
                var chunks = chunkify(props.data.countyCrumbs,3,true)
                countyCrumbs = {c1:chunks[0],c2:chunks[1],c3:chunks[2]}
            }
        }
        this.state = {
            isApplicationInProgress:false,
            'searchCrumbs':searchCrumbs,fCrumbs:fCrumbs,areaCrumbs:areaCrumbs,countyCrumbs:countyCrumbs,
            personalMessage:""
        }
        this.searchCrumbsLoaded = false;

        this.applyNowBtnHandler = this.applyNowBtnHandler.bind(this)
        this.redirectToProfilePageHandler = this.redirectToProfilePageHandler.bind(this)
        this.confirmApplyBtnHandler = this.confirmApplyBtnHandler.bind(this)
        this.cap_closePopupBtnHandler = this.cap_closePopupBtnHandler.bind(this)
        this.cap_viewSimilarLettingsBtnHandler = this.cap_viewSimilarLettingsBtnHandler.bind(this)
        this.backBtnHandler = this.backBtnHandler.bind(this)
        this.noPropBackBtnHandler = this.noPropBackBtnHandler.bind(this)
        this.pd_cap_btnHandler = this.pd_cap_btnHandler.bind(this)
        this.pd_cap_aHandler = this.pd_cap_aHandler.bind(this)
        this.headerApplyNowBtnHandler = this.headerApplyNowBtnHandler.bind(this)
        this.mainUploadRefBtnHandler = this.mainUploadRefBtnHandler.bind(this)
        this.mainUpdateRefBtnHandler = this.mainUpdateRefBtnHandler.bind(this)
        this.mainApplyNowBtnHandler = this.mainApplyNowBtnHandler.bind(this)
        this.createAlertBtnHandler = this.createAlertBtnHandler.bind(this)
        updateViewsCalled=false;

        this.propsListHTML = '';
        this.isServerSSRReq = '';
        this.handlePersonalMessageChange = this.handlePersonalMessageChange.bind(this);
    }
    backBtnHandler(){
        var prevRoute = Session.get('prevRoute');
        if(prevRoute){
            FlowRouter.go(prevRoute.name,prevRoute.args)
            Session.set('prevRoute',false);
        }else{
            FlowRouter.go("/account/myproperies/",{pageno:1});
        }
    }
    noPropBackBtnHandler(){
        var prevRoute = Session.get('prevRoute');
        if(prevRoute){
            FlowRouter.go(prevRoute.name,prevRoute.args)
            Session.set('prevRoute',false);
        }else{
            FlowRouter.go("home");
        }
    }
    cap_closePopupBtnHandler(){
        console.log('cap_closePopupBtn');
        ga('send', 'event', 'PDPage', 'CAPClosePopupBtn', 'CAP: Cancle Apply Btn Clicked');
        closePopupEvent();
    }
    cap_viewSimilarLettingsBtnHandler(){
        console.log('cap_viewSimilarLettingsBtnHandler');
        ga('send', 'event', 'PDPage', 'CAPViewSimilarLettingsBtn', 'CAP: View Simiar Lettings Btn Clicked');//CAP: Confirm Apply Popup
        closePopupEvent();
        var element = document.getElementById("relatedsection");
        element.scrollIntoView();
    }
    redirectToProfilePageHandler(){
        redirectToProfilePageEvent();
    }
    handlePersonalMessageChange(event) {
        this.setState({personalMessage: event.target.value});
        autoExpandDelayed();
    }
    confirmApplyBtnHandler(){
        console.log('confirmApplyBtn');
        ga('send', 'event', 'PDPage', 'confirmApplyBtn', 'CAP: Confirm Apply Btn Clicked');

        var auctionId = this.props.data._id;
        var price = $('#bidPrice').val();
        price = parseInt(price);
        if(isNaN(price)){alert("Please enter a valid offer price.");return;}
        // var bidMessage = $('#bidMessage').val();
        var bidMessage = this.state.personalMessage;
        bidMessage = bidMessage.substring(0,500);
        var min = this.props.data.price*0.7, max = this.props.data.price*1.5;
        if(!auctionId){console.log("invalid data");return;}
        if(price <  min || price > max ){
            alert("Offer price should be between "+min+" and "+max+". Please adjust your offer price again.");return;
        }
        // debugger;
        this.setState({isApplicationInProgress:true})

        this.placeBidCallback = function(error, result){
            this.setState({isApplicationInProgress:false})
            if(error){
                console.log(error);
                var tmp =  Session.get("showErrorDlg");if(!tmp)tmp=[];
                tmp.push("Failed applying. Please try again, try checking your internet connectivity. Contact us if needed.");
                Session.set("showErrorDlg",tmp)
                return;
            }
            if(result.status=='Success'){
                console.log("Success");
                closePopupEvent()//Dont close it, instead show the successful part of that dialog
                setTimeout(showApplySuccessfulDialog,500)
                setTimeout(function(){
                    if(!isApplySuccessfulOpen)
                        showApplySuccessfulDialog();
                },1500)
                setTimeout(function(){
                    if(!isApplySuccessfulOpen)
                        showApplySuccessfulDialog();
                },3000)
            }
        }
        this.placeBidCallback = this.placeBidCallback.bind(this);
        Meteor.call('placeBid',[auctionId, price, bidMessage],this.placeBidCallback);

        var user = Accounts.user();
        if(user)
        if(user.profile)
        if(!user.profile.mobile){
            let mobile = false, isValid = false;
            mobile = prompt("You don't have a mobile number attached to your profile. Please enter mobile to proceed. ");
            let tmp = mobile.split('+');
            if(tmp.length>1)
                mobile = tmp[1];
            if( validateMobileNumber(mobile) )isValid=true;

            while(! isValid) {//This is an un limited loop of mobile number.
                mobile = prompt("Error! invalid format. Please enter mobile number in format +353 893456789.");
                if( validateMobileNumber(mobile) )isValid=true;
            }
            // if(/^\d{10}$/.test(mobile)) {
            if( isValid ) {
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
    applyNowBtnHandler(event){
        // Prevent default browser form submit
        if(event)event.preventDefault();
        console.log("Apply now btn clicked")

        if(!this.props.user){
            Session.set('loginFromApplyNowBtn',true)
            showLoginDialog();
            return;
        }
        // if(user._id == this._createdByAgent ){
        //     console.log("Owner cannot apply for the house.");
        //     return;
        // }
        //Do mobile verification
        if(this.props.user.profile)
        if(this.props.user.profile.personalMessage && !this.state.personalMessage){//Do this only if the current sessions personal message is empty
            this.setState({personalMessage: this.props.user.profile.personalMessage})
        }

        if(this.props.myBid){
            var tmp =  Session.get("showErrorDlg");if(!tmp)tmp=[];
            tmp.push("Error: You have an existing application, please refresh the page.");
            Session.set("showErrorDlg",tmp)
            console.log("Already has a bid");
            return;
        }
        this.afterCFun = function(){
            attachEvents();

            setTimeout(function () {
                $('#bidPrice').focus().select()
                autoExpandDelayed()
            },500)
        }
        this.afterCFun = this.afterCFun.bind(this);

        $.fancybox({
            'padding': 0,
            'href': '#confirm-apply-pop',
            afterShow:this.afterCFun,
            afterClose:function(){}
        })
    }
    headerApplyNowBtnHandler(){
        console.log('headerApplyNowBtn');
        ga('send', 'event', 'PDPage', 'HeaderApplyNowBtnClicked', 'Header: Apply now Btn Clicked');
        this.applyNowBtnHandler();
    }
    mainApplyNowBtnHandler(event){
        console.log('mainApplyNowBtn');
        ga('send', 'event', 'PDPage', 'ApplyNowBtnClicked', 'Main: Apply now Btn Clicked');
        this.applyNowBtnHandler(event);
    }
    pd_cap_btnHandler(event){
        if(event)event.preventDefault();
        console.log('pd_cap_btn');
        ga('send', 'event', 'PDPage', 'CAPUploadRefBtnClicked', 'CAP: Upload Reference Btn Clicked');
        redirectToProfilePageEvent();
    }
    pd_cap_aHandler(event){
        if(event)event.preventDefault();
        console.log('pd_cap_a');
        ga('send', 'event', 'PDPage', 'CAPUploadRefAClicked', 'CAP: Upload Reference Anchor Link Clicked');
        redirectToProfilePageEvent();
    }
    mainUploadRefBtnHandler(){
        console.log('mainUploadRefBtn');
        ga('send', 'event', 'PDPage', 'UploadRefBtnClicked', 'Main: Upload Reference Btn Clicked');
        redirectToProfilePageEvent();
    }
    mainUpdateRefBtnHandler(){
        console.log('mainUpdateRefBtn');
        ga('send', 'event', 'PDPage', 'UpdateRefBtnClicked', 'Main: Update Reference Btn Clicked');
        redirectToProfilePageEvent();
    }
    createAlertBtnHandler(){
        console.log('createAlertBtnHandler');
        ga('send', 'event', 'PDPage', 'createAlertBtnClicked', 'Main: Create Alert Btn Clicked');
        Session.set('showCreateAlertPopup',true)
    }
    componentDidMount(){
        $(document).ready(function(){
            $('.scroll-menu-div').hide();
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
            setTimeout(function(){
                try {
                    jQuery("html,body").animate({scrollTop: 0}, 250);
                } catch (e) {
                    document.body.scrollTop = document.documentElement.scrollTop = 0;
                }
                $('.scroll-menu-div').hide();
                $(".scroll-menu-div").removeClass("fixed-header");

            },500)
        });
        setTimeout(fixImageSize,1000)
        setTimeout(fixImageSize,3000)
        setTimeout(fixImageSize,5000)
        // setTimeout(function(){addthis.init();addthis.layers.refresh();},5000)
        $(window).resize(fixImageSize);
        $(window).resize(autoExpandDelayed);
    }
    componentDidUpdate() {
        setTimeout(fixImageSize,1000)
        setTimeout(fixImageSize,3000)
        setTimeout(fixImageSize,5000)
        if(this.props.data && !updateViewsCalled){
            updateViewsCalled=true;
            Meteor.call('updateViews',this.props.data._id);
        }
        if(propertyKeyOfThisPage && this.props.data.lettingAuctionCode){
            if(this.props.data.lettingAuctionCode!=propertyKeyOfThisPage){//lettingAuctionCode changed, means page is changed
                //Constructor elements needs to be called again
                updateViewsCalled=true;
                Meteor.call('updateViews',this.props.data._id);
                this.setState({isApplicationInProgress:false,personalMessage:""})
                this.searchCrumbsLoaded = false;
                Session.set('subscriptionsReady2',false);
                propertyKeyOfThisPage = this.props.data.lettingAuctionCode;
                setTimeout(function(){
                    try {
                        jQuery("html,body").animate({scrollTop: 0}, 250);
                    } catch (e) {
                        document.body.scrollTop = document.documentElement.scrollTop = 0;
                    }
                },500)
            }
        }
    }
    componentWillReceiveProps(props){
        var searchCrumbs = {c1:[],c2:[],c3:[]}
        var fCrumbs = {c1:[],c2:[],c3:[]}
        var areaCrumbs = {c1:[],c2:[],c3:[]}
        var countyCrumbs = {c1:[],c2:[],c3:[]}
        if(props.data.searchCrumbs != this.state.searchCrumbs){
            var chunks = chunkify(props.data.searchCrumbs,3,true)
            searchCrumbs = {c1:chunks[0],c2:chunks[1],c3:chunks[2]}
            // console.log('in the setState for searchCrumbs')
            this.setState({'searchCrumbs':searchCrumbs})
        }
        if(props.data.fCrumbs != this.state.fCrumbs){
            var chunks = chunkify(props.data.fCrumbs,3,true)
            fCrumbs = {c1:chunks[0],c2:chunks[1],c3:chunks[2]}
            // console.log('in the setState for fCrumbs')
            this.setState({fCrumbs:fCrumbs})
        }
        if(props.data.areaCrumbs != this.state.areaCrumbs){
            var chunks = chunkify(props.data.areaCrumbs,3,true)
            areaCrumbs = {c1:chunks[0],c2:chunks[1],c3:chunks[2]}
            // console.log('in the setState for areaCrumbs')
            this.setState({areaCrumbs:areaCrumbs})
        }
        if(props.data.countyCrumbs != this.state.countyCrumbs){
            var chunks = chunkify(props.data.countyCrumbs,3,true)
            countyCrumbs = {c1:chunks[0],c2:chunks[1],c3:chunks[2]}
            // console.log('in the setState for countyCrumbs')
            this.setState({countyCrumbs:countyCrumbs})
        }

    }
    // currentURL:function () {
    //     return Router.current().originalUrl;
    // },
    isCurUserBid() {
        //todo: test this
        debugger;

        if(!this.props.user)return false;
        if(this.userId == user._id)return true;
        return false;
    }

    renderMain(){
        return (
            <div>
                <section className="scroll-menu-div" style={{zIndex:'1000'}}>
                    <div className="container">
                        <div className="scroll-menu">
                            <div className="left-menu">
                                <ul>
                                    <li><a href={this.currentURL+"#imagessection"} className="active scroll1">PHOTOS</a></li>
                                    <li><a href={this.currentURL+"#detailssection"} className="scroll1">DETAILS</a></li>
                                    <li><a href={this.currentURL+"#amenitiessection"} className="scroll1">AMENITIES</a></li>
                                </ul>
                            </div>
                            <div className="right-menu">
                                <ul>
                                    <li className="left-line">
                                        <p>Applications received</p>
                                        <p className="pad-btm-0 text-center">{this.props.data.applicationsReceivedCount}</p>
                                    </li>
                                    <li className="left-line">
                                        <p>Owner's Current Rent</p>
                                        <p className="pad-btm-0 text-center">€ {this.props.data.price +" ("+this.props.data.rentType+")"}</p>
                                    </li>
                                    <li>
                                        {
                                        this.props.alreadyLeased ?
                                        (
                                            <a href={this.currentURL+'#relatedsection'} className="green-btn  btns" type="button">View similar lettings</a>
                                        ) :
                                            this.props.myBid ? (
                                            <button className="green-btn  btns viewMyApplication" type="button">Already applied</button>
                                        ): (
                                            <buttons onClick={this.headerApplyNowBtnHandler} className="blue-btn btns headerApplyNowBtn applyNowBtn">Apply for this {this.props.PD.type}</buttons>
                                        )}
                                    </li>
                                </ul>
                            </div>
                        </div>
                    </div>
                </section>
                <section className="banner">
                    <div className="container">
                        <div className="row">
                            <div id="imagessection" className="col-md-7 padding0">
                                <figure>
                                    <div className="banner-holder">
                                        <ImagesSlider images={this.props.sliderImages}/>
                                    </div>
                                    { this.props.isAgent ? (
                                        <figcaption>
                                            <h2>{this.props.isAgent.name}</h2>
                                            <h5 style={{padding: 0}}>{this.props.isAgent.address1}</h5>
                                        </figcaption>
                                    ) : ""
                                    }
                                </figure>
                            </div>
                            <div className="col-md-5 purva-bg">
                                <div className="purva">
                                    { this.props.isAgent ? (
                                        <img src={this.props.isAgent.logourl} alt={this.props.isAgent.name} style={this.props.isAgent.style}/>
                                    ) : ""
                                    }
                                    <h1>{titleCase(this.props.PD.address.address)}{this.props.PD.address.area ?  (<span>, {titleCase(this.props.PD.address.area)}</span>) : ''}{this.props.PD.address.county ?  (<span>, {titleCase(this.props.PD.address.county)}</span>) : ''}</h1>
                                    <p style={{marginBottom: '10px'}}>{titleCase(this.props.PD.type)} to rent in {titleCase(this.props.PD.address.area)}{this.props.PD.address.county ?  (<span>, {titleCase(this.props.PD.address.county)}</span>) : ''}. Its {this.props.PD.furnished ? "a furnished" : "an Unfurnished" } {titleCase(this.props.PD.type)} with {this.props.PD.bedroomsCount} beds, {this.props.PD.baths} baths, {this.props.PD.ensuiteCount ? this.props.PD.ensuiteCount : "no" } Ensuite and {this.props.PD.doubleBedCount ? this.props.PD.doubleBedCount : "has no" } Double bed property/accommodation, your next my home. { this.props.isAgent ? (<span>Its posted by {this.props.isAgent.name}.</span>) : "" } Click apply below to send your interest to the landlord and he would contact you soon. </p>
                                    <ul>
                                        <li>
                                            <p><span style={{color: '#b3b3b3'}}>Views</span> :  {this.props.data.views}</p>
                                        </li>
                                        <li>
                                            <a href={FlowRouter.url('howitworks')}><p style={{color: '#39b54a', fontFamily: '"montserratregular"', padding: 0}}>How it works?</p></a>
                                        </li>
                                        <li>
                                            <a href={FlowRouter.url('contactus')}><p style={{color: '#39b54a', fontFamily: '"montserratregular"', padding: 0}}>Need help?</p></a>
                                        </li>
                                    </ul>
                                    <p>&nbsp;</p>
                                    <div className="purva-developer">
                                        <h5><span style={{color: '#b3b3b3'}}>Owner's Current Rent :</span>€ {this.props.data.price +" ("+this.props.data.rentType+")"}</h5>
                                    </div>
                                    {this.props.alreadyLeased ? (
                                        <p style={{fontFamily: '"montserratregular"'}}>This property is already leased. Please use one of the options below.</p>
                                    ) :""}
                                    <div className="purva-btns">
                                        <ul>
                                            <li>
                                                { this.props.alreadyLeased ?
                                                    (
                                                    <span>
<a href={this.currentURL+'#relatedsection'} className="green-btn  btns" type="button">View similar lettings</a>
<a href={this.currentURL+'#searchsection'} className="transparent-btn btns mar-left-10" type="button">Search More</a>
                                                            
                                                    </span>
                                                    )
                                                :
                                                    this.props.myBid ? (
                                                    <span>
<button className="green-btn  btns viewMyApplication" type="button">Already applied</button>
{this.hasAllReqReferences ? (
    <button className="transparent-btn btns mainUpdateRefBtn mar-left-10" onClick={this.mainUpdateRefBtnHandler} type="button" title="View your references">Update references</button>
):(
    <button className="transparent-btn btns mainUploadRefBtn mar-left-10" onClick={this.mainUploadRefBtnHandler} type="button" title="You dont have all your references updated in your profile. Missing files are  {addCommaToEach(this.props.refListArr)}">Upload references</button>
)}
                                                    </span>
                                                    ) :(
                                                    <span>
<buttons onClick={this.mainApplyNowBtnHandler} className="blue-btn btns mainApplyNowBtn applyNowBtn">Apply for this {this.props.PD.type}</buttons>
                                                        <span className="hidden-xs">&nbsp;</span>
                                                        <span className="visible-xs" style={{height: 1}}><br/></span>
{this.hasAllReqReferences ? (
    <button className="transparent-btn btns mainUpdateRefBtn" onClick={this.mainUpdateRefBtnHandler} type="button" title="View your references">Update references</button>
):(
    <button className="transparent-btn btns mainUploadRefBtn" onClick={this.mainUploadRefBtnHandler} type="button" title={"You dont have all your references updated in your profile. Missing files are  "+addCommaToEach(this.props.refListArr)}>Upload references</button>
)}
                                                    </span>
                                                    )
                                                }
                                                <span className="hidden-xs">&nbsp;</span>
                                                <span className="visible-xs" style={{height: 1}}><br/></span>
                                                <button className="green-btn btns" onClick={this.createAlertBtnHandler} type="button" title={"Be the first to hear about the latest lettings in your area. Signup for our email alerts."}>
                                                    <span className="glyphicon glyphicon-bell"></span> Create Alert</button>
                                            </li>
                                        </ul>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>
                <section className="main-sec">
                    <div className="container">
                        <div className="row">
                            <div id="detailssection" className="border mar-btm-20 background-white">
                                <div className="head-border-bottom head-border-bottomTitleArea">
                                    <h2>Details</h2>
                                </div>
                                <div className="developer proj-dtls ">
                                    <div className="clearfix">
                                        <div className="col-md-9">
                                            <div>
                                                <ul className="list-inline">
                                                    <li className>
                                                        <h3>Rent type</h3>
                                                        <h4 className="pad-btm-0">{titleCase(this.props.data.rentType)}</h4>
                                                    </li>
                                                    <li className="left-line">
                                                        <h3>Available from</h3>
                                                        <h4 className="pad-btm-0">{dateFormat(this.props.data.readyFrom)}</h4>
                                                    </li>
                                                    <li className="left-line">
                                                        <h3>Available until</h3>
                                                        <h4 className="pad-btm-0">{this.props.data.lease}</h4>
                                                    </li>
                                                </ul>
                                                <div className="project-detail">
                                                    <ul className="bdr-btm">
                                                        <li>
                                                            <span className="color-grey">Location</span>
                                                            <h5 className="heading-reg"> {titleCase(this.props.PD.address.address)}, {titleCase(this.props.PD.address.area)}, {titleCase(this.props.PD.address.county)}</h5>
                                                        </li>
                                                        <li className="pad-left-35">
                                                            <span className="color-grey">BER</span>
                                                            <h5 className="heading-reg"> {addCommaToEach(this.props.PD.BER)}</h5>
                                                        </li>
                                                    </ul>
                                                </div>
                                            </div>
                                            <div className="mar-top-20 ">
                                                <h5 className="heading-reg">Description</h5>
                                                <p className="color-grey pad-btm-10" dangerouslySetInnerHTML={{__html:nlToBr( this.props.PD.about) }}></p>
                                                {/*<a href="javascript:;" class="text-underline" >Read More</a>*/}
                                            </div>
                                        </div>
                                        <div className="col-md-3">
                                            <h5 className="heading-reg">Bedrooms : {this.props.PD.bedroomsCount}</h5>
                                            <div className="handed-proj-bg clearfix">
                                                <div className="col-md-6">
                                                    <div>
                                                        <h3>{this.props.PD.doubleBedCount}</h3>
                                                        <h4 className="pad-btm-0">Double</h4>
                                                    </div>
                                                </div>
                                                <div className="col-md-6" style={{padding: 0}}>
                                                    <div className="left-line">
                                                        <h3>{this.props.PD.ensuiteCount}</h3>
                                                        <h4 className="pad-btm-0">Ensuite</h4>
                                                    </div>
                                                </div>
                                            </div>
                                            <h5 className="heading-reg mar-top-30">Contact</h5>
                                            <div className="handed-proj-bg clearfix">
                                                {/*
                        <div class="col-md-12 color-grey"  style="font-size:13px">Apply for this property to view contact details</div>
                        */}
    {this.props.alreadyLeased ? (
        <p style={{fontFamily: '"montserratregular"'}} className={"text-center"}>This property is already leased.<br/>
            <a href={this.currentURL+'#relatedsection'} title={"Browse through more available lettings for rent in "+titleCase(this.props.PD.address.area)+", "+titleCase(this.props.PD.address.county)}>View similar lettings</a><br/>
            <a href={this.currentURL+'#searchsection'} title={"Search more available properties for rent in "+titleCase(this.props.PD.address.area)+", "+titleCase(this.props.PD.address.county)}>Search More</a>
        </p>
    ) :
        this.props.data.primaryContact.phone ?
            this.props.PD.contacts.map(function(contact,i){
                return (
                <div key={i} className="col-md-12">
                    <div>
                        <h3>{titleCase(contact.name)} : <a href={"tel:"+contact.phone}>{contact.phone}</a></h3>
                    </div>
                </div>
                )
            })
        : (
            <div className="col-md-12">Apply for this property to email owner</div>
        )
    }
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <div id="amenitiessection" className="mar-btm-30 amenities">
                                <div className="head-border-bottom head-border-bottomTitleArea">
                                    <h2>Amenities</h2>
                                </div>
                                <div className="amenitiy-block">
                                    <ul>
                                        { this.props.PD.amenitiesWithImgs.map(function(aminity,i){
                                            return (
                                                <li key={i}>
                                                    <p><span><img src={aminity.src} /></span>{titleCase(aminity.name)}</p>
                                                </li>
                                            )
                                            })
                                        }
                                    </ul>
                                </div>
                            </div>
                            {this.props.data.relatedProps ?(
                                <div id="relatedsection" className="mar-btm-30 amenities subscribeTillPopop">
                                    <div className="head-border-bottom head-border-bottomTitleArea">
                                        <h2>Similar {titleCase(this.props.PD.type)} to rent
                                            in {titleCase(this.props.PD.address.area)}{this.props.PD.address.county ?  (<span>, {titleCase(this.props.PD.address.county)}</span>) : ''}</h2></div>
                                                <div className="amenitiy-block" style={{float:'left',display:'block'}}>
                                                <p style={{margin: '0 20px'}}>Below are few more {titleCase(this.props.PD.type)} to rent in {this.props.PD.address.area ?  (<span>{titleCase(this.props.PD.address.area)}</span>) : ''}{this.props.PD.address.county ?  (<span>, {titleCase(this.props.PD.address.county)}</span>) : ''}. They are also located near {titleCase(this.props.PD.address.address)}{this.props.PD.address.area ?  (<span>, {titleCase(this.props.PD.address.area)}</span>) : ''}{this.props.PD.address.county ?  (<span>, {titleCase(this.props.PD.address.county)}</span>) : ''}</p>
                                                <ul className={"thumbnails thumbRelated"}>
                {this.props.data.relatedProps.map(function (property,i) {
                    return (
                    <li className="span4" key={i} style={{float:'left'}}>
                        <a href={ FlowRouter.url('rent',{slug:property.slug,key:property.auction.lettingAuctionCode}) }>
                            <div className="thumbnail">
                                {property.firstImg ? property.firstImg.url ? property.firstImg.url.indexOf('amazonaws') ? (
                                <img src={"https://process.filestackapi.com/AIPACLEs7ShGwwPh6fMTxz/resize=width:250/"+property.firstImg.url}
                                     alt={titleCase(property.address.address)+property.address.area ?  ", "+titleCase(property.address.area) : '' + property.address.county ?  ", "+titleCase(property.address.county) : ''}/>
                                    ): (
                                <img src={"https://process.filestackapi.com/resize=width:250/"+property.firstImg.url}
                                     alt={titleCase(property.address.address)+property.address.area ?  ", "+titleCase(property.address.area) : '' + property.address.county ?  ", "+titleCase(property.address.county) : ''}/>
                                    ) : (
                                    <img src={cdnPath("/images/no-photo.png")} style={{width: 250, height: 188}}/>
                                ):""}
                                <h3>{titleCase(property.address.address)}{property.address.area ?  (<as>, {titleCase(property.address.area)}</as>) : ''}{property.address.county ?  (<as>, {titleCase(property.address.county)}</as>) : ''} for rent</h3>
                        </div></a>
                    </li>
                    )
                })}
                                                    </ul>
                                                </div>
                                                <div className="amenitiy-block" style={{paddingTop:0}}>
                                                    <div id="searchsection" className={'bottomcrumbs row'}>
                                                        <h2>Search more properties to rent</h2>
                                                        <p>Chooes a link below to browse through more relavent properties to rent.</p>
                                                        <br/>
                                                        <div className="col-md-12 col-sm-12 col-xs-12 pad0">
                                                            <div className="col-md-5 col-sm-5 col-xs-12">
                                                                {this.state.searchCrumbs.c1 ?
                                                                    this.state.searchCrumbs.c1.map(function(crumb,i){
                                                                        return (
                                                                            <a key={i} style={{display:"block"}} href={crumb.url}>{crumb.name}</a>
                                                                        )
                                                                    })
                                                                : ""}
                                                            </div>
                                                            <div className="col-md-4 col-sm-4 col-xs-12">
                                                                {this.state.searchCrumbs.c2 ?
                                                                    this.state.searchCrumbs.c2.map(function(crumb,i){
                                                                        return (
                                                                            <a key={i} style={{display:"block"}} href={crumb.url}>{crumb.name}</a>
                                                                        )
                                                                    })
                                                                    : ""}
                                                            </div>
                                                            <div className="col-md-3 col-sm-3 col-xs-12">
                                                                {this.state.searchCrumbs.c3 ?
                                                                    this.state.searchCrumbs.c3.map(function(crumb,i){
                                                                        return (
                                                                            <a key={i} style={{display:"block"}} href={crumb.url}>{crumb.name}</a>
                                                                        )
                                                                    })
                                                                    : ""}
                                                            </div>
                                                        </div>

                                                    </div>
                                                    {/*{ true ? (*/}
                                                    <div className={'bottomcrumbs row'}>
                                                        <h2>Property types to rent</h2>
                                                        <div className="col-md-12 col-sm-12 col-xs-12 pad0">
                                                            <div className="col-md-3 col-sm-3 col-xs-12">
                                                                {this.state.fCrumbs.c1 ?
                                                                    this.state.fCrumbs.c1.map(function (crumb, i) {
                                                                        return (
                                                                            <a key={i} style={{display: "block"}}
                                                                               href={crumb.url}>{crumb.name}</a>
                                                                        )
                                                                    })
                                                                    : ""}
                                                            </div>
                                                            <div className="col-md-4 col-sm-4 col-xs-12">
                                                                {this.state.fCrumbs.c2 ?
                                                                    this.state.fCrumbs.c2.map(function (crumb, i) {
                                                                        return (
                                                                            <a key={i} style={{display: "block"}}
                                                                               href={crumb.url}>{crumb.name}</a>
                                                                        )
                                                                    })
                                                                    : ""}
                                                            </div>
                                                            <div className="col-md-5 col-sm-5 col-xs-12">
                                                                {this.state.fCrumbs.c3 ?
                                                                    this.state.fCrumbs.c3.map(function (crumb, i) {
                                                                        return (
                                                                            <a key={i} style={{display: "block"}}
                                                                               href={crumb.url}>{crumb.name}</a>
                                                                        )
                                                                    })
                                                                    : ""}
                                                            </div>
                                                        </div>
                                                    </div>
                                                    <div className={'bottomcrumbs row'}>
                                                        <h2>{this.props.PD.address.county} neighbourhoods</h2>
                                                        <div className="col-md-12 col-sm-12 col-xs-12 pad0">
                                                            <div className="col-md-4 col-sm-4 col-xs-12">
                                                                {this.state.areaCrumbs.c1 ?
                                                                    this.state.areaCrumbs.c1.map(function (crumb, i) {
                                                                        return (
                                                                            <a key={i} style={{display: "block"}}
                                                                               href={crumb.url}>{crumb.name}</a>
                                                                        )
                                                                    })
                                                                    : ""}
                                                            </div>
                                                            <div className="col-md-4 col-sm-4 col-xs-12">
                                                                {this.state.areaCrumbs.c2 ?
                                                                    this.state.areaCrumbs.c2.map(function (crumb, i) {
                                                                        return (
                                                                            <a key={i} style={{display: "block"}}
                                                                               href={crumb.url}>{crumb.name}</a>
                                                                        )
                                                                    })
                                                                    : ""}
                                                            </div>
                                                            <div className="col-md-4 col-sm-4 col-xs-12">
                                                                {this.state.areaCrumbs.c3 ?
                                                                    this.state.areaCrumbs.c3.map(function (crumb, i) {
                                                                        return (
                                                                            <a key={i} style={{display: "block"}}
                                                                               href={crumb.url}>{crumb.name}</a>
                                                                        )
                                                                    })
                                                                    : ""}
                                                            </div>
                                                        </div>
                                                    </div>
                                                    <div className={'bottomcrumbs row'}>
                                                        <h2>Other counties to rent</h2>
                                                        <div className="col-md-12 col-sm-12 col-xs-12 pad0">
                                                            <div className="col-md-4 col-sm-4 col-xs-12">
                                                                {this.state.countyCrumbs.c1 ?
                                                                    this.state.countyCrumbs.c1.map(function (crumb, i) {
                                                                        return (
                                                                            <a key={i} style={{display: "block"}}
                                                                               href={crumb.url}>{crumb.name}</a>
                                                                        )
                                                                    })
                                                                    : ""}
                                                            </div>
                                                            <div className="col-md-4 col-sm-4 col-xs-12">
                                                                {this.state.countyCrumbs.c2 ?
                                                                    this.state.countyCrumbs.c2.map(function (crumb, i) {
                                                                        return (
                                                                            <a key={i} style={{display: "block"}}
                                                                               href={crumb.url}>{crumb.name}</a>
                                                                        )
                                                                    })
                                                                    : ""}
                                                            </div>
                                                            <div className="col-md-4 col-sm-4 col-xs-12">
                                                                {this.state.countyCrumbs.c3 ?
                                                                    this.state.countyCrumbs.c3.map(function (crumb, i) {
                                                                        return (
                                                                            <a key={i} style={{display: "block"}}
                                                                               href={crumb.url}>{crumb.name}</a>
                                                                        )
                                                                    })
                                                                    : ""}
                                                            </div>
                                                        </div>

                                                    </div>
                                                     {/*) : ""}*/}
                                                </div>

                                 </div>
                            ): ""}

                        </div>
                    </div>
                </section>
                <div id="apply-successful-popup" style={{display: 'none'}} className={"verification-div1 isApplicationSuccessful"}>
                    <div className="refund-div">
                        <h2 className="green-text">Application Successful</h2>
                    </div>
                    <div className="profile-text">
                        <h3>Good Job!</h3>
                        <p style={{padding: 0}}>Landlord is notified of your application and would contact you via email if successful.</p>

                        { false ? "" :
                            this.hasAllReqReferences ? "" : (

                                <div className="">
                                    <hr/>
                                    <h3>Improve your chances of securing this letting</h3>
                                    <p className="color-text" style={{textAlign:"center",margin:"10px 0"}}>Upload your references in your profile to have an higher chance over other applicants. Missing files are&nbsp;
                                        {addCommaToEach(this.props.refListArr)}
                                        &nbsp;<a href={FlowRouter.url("account/profile")} onClick={this.pd_cap_aHandler} className="pd_cap_a ">Upload them now?</a>
                                    </p>
                                    <p><a href={FlowRouter.url("account/profile")} style={{margin:'0 auto',width:"200px"}} className="blue-btn btns" onClick={this.pd_cap_btnHandler}  type="button">Upload references </a></p>
                                </div>

                            )
                        }
                        <hr/>
                        <p style={{padding: 0}}><a href={this.currentURL+"#relatedsection"} onClick={this.cap_viewSimilarLettingsBtnHandler} className="transparent-btn btns" style={{margin:'0 auto',width:"200px"}}>View Similar lettings</a></p>
                    </div>
                </div>
                <div id="confirm-apply-pop" style={{display: 'none'}} className={"verification-div1 "}>
                    <div className="refund-div">
                        <h2>Confirm Apply</h2>
                    </div>
                    <div className="profile-text">
                        <h3>Landlords asking rent is {this.props.data.price +" ("+this.props.data.rentType+")"}</h3>
                        <form className="signin-form">
                            <div className="form-border" style={{padding: '20px 0'}}>
                                <div className="styled-input underline" style={{borderBottom: '1px solid #2169a8'}}>
                                    <input className="bidPrice" type="number" placeholder={this.props.data.price} defaultValue={this.props.data.price} name="number" id="bidPrice" required min={this.props.priceRange.min} max={this.props.priceRange.max} />
                                </div>
                                <div className="styled-input underline">
                                    <textarea className="form-control bidMessage" id="bidMessage" rows={1} placeholder="You may enter a personal message to landlord if you wish." maxLength={500} value={this.state.personalMessage} onChange={this.handlePersonalMessageChange} style={{textAlign:"center"}}/>
                                </div>
                                {/*<div class="input-group date">*/}
                                {/*<span class="input-group-addon"><i class="glyphicon glyphicon-calendar"></i></span>*/}
                                {/*<input class="set-due-date form-control moveindate" type="text" id="moveindate"/>*/}
                                {/*</div>*/}
                            </div>
                        </form>
                        <p className="color-text" style={{marginTop: '20px', textAlign:"center"}}>We will submit all the references available in your profile. </p>
                        { false ? "" :
                        this.hasAllReqReferences ? "" : (

                        <div className="radio-bg register">
                            <h3 style={{lineHeight: '22px', marginBottom: '10px'}}>Oops! You dont have all your references updated in your profile. </h3>
                            <p className="color-text" style={{textAlign:"center"}}>Missing files are&nbsp;
                                {addCommaToEach(this.props.refListArr)}
                                &nbsp;<a href={FlowRouter.url("account/profile")} onClick={this.pd_cap_aHandler} className="pd_cap_a ">Upload them now?</a>
                            </p>
                            <p><a href={FlowRouter.url("account/profile")} style={{margin:'0 auto',width:"200px"}} className="transparent-btn btns pd_cap_btn" onClick={this.pd_cap_btnHandler}  type="button">Upload references </a></p>
                            <p>Your chances of getting the house will be more if you apply with all the references. To proceed anyways click Submit below.</p>
                        </div>

                        )
                        }
                        <ul>
                            {this.state.isApplicationInProgress ? (
                                <li><button className="transparent-btn  btns" type="button">Applying... </button></li>
                            ) : (
                                <li><button onClick={this.confirmApplyBtnHandler} className="blue-btn  btns confirmApplyBtn" type="button">Submit </button></li>
                            )}
                            <li><button onClick={this.cap_closePopupBtnHandler} style={{marginLeft: '10px'}} className="transparent-btn btns cap_closePopupBtn" disabled={this.state.isApplicationInProgress} type="button">Cancel</button></li>
                        </ul>
                    </div>
                </div>
            </div>
        )
    }

    renderFullMain(){

        if(Meteor.isClient){
            setTimeout(function(){
                $('#lettingDetailCarousel').carousel();
                $('#lettingDetailCarousel .carousel-control.right').unbind('click').bind('click',function(){$('#lettingDetailCarousel').carousel('next')})
                $('#lettingDetailCarousel .carousel-control.left').unbind('click').bind('click',function(){$('#lettingDetailCarousel').carousel('prev')})
            },1000)
        }

        return (
            <div className="property-details-page" id={'props_list'}>
                {
                    Meteor.isServer ? (
                        <div id={"isservercheckdiv"}></div>
                    ):""
                }
                    <section className="banner">
                        <div className="container">
                            <div className="row">
                                <nav aria-label="breadcrumb">
                                    <ol className="breadcrumb">
                                        <li className="breadcrumb-item"><a href={FlowRouter.url('home')}>Home</a></li>
                                        {this.props.data ?
                                            this.props.data.bcrumbs.map(function (crumb, i) {
                                                return (
                                                    <li key={i} className="breadcrumb-item"><a
                                                        href={crumb.url}>{crumb.name}</a></li>
                                                )
                                            })
                                            :""}
                                        <li className="breadcrumb-item active" aria-current="page">This property</li>
                                    </ol>
                                </nav>
                            </div>
                        </div>
                    </section>
                {
                    this.props.isSubsLoaded ?
                        this.props.data ? this.renderMain() :
                            (
                                <section className="mar-top-20">
                                    <div className="container text-center mar-top-20 pad-btm-30">
                                        <div className="filter-holder">
                                            <div className="mar-top-30">
                                                {this.props.alreadyLeased ? (
                                                    <span>
                                                    <strong>Property already leased. Your landlord would contact you if you are chosen as a tenant.</strong><br /><br />
                                                    <button onClick={this.backBtnHandler} className="blue-btn btns backBtn" type="button">Try again</button>
                                                </span>
                                                ) : (
                                                    <span>
                                                    <strong>This property is not found. Please check your key and try again.</strong><br /><br />
                                                    <button onClick={this.noPropBackBtnHandler} className="blue-btn btns noPropBackBtn" type="button">Try again</button>
                                                </span>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                </section>
                            )
                        :
                        (
                            <section className="mar-top-20 mar-btm-20 no-print">
                                <div className="container text-center mar-top-20 pad-btm-30">
                                    <div className="filter-holder">
                                        <div className="mar-top-30">
                                            <div className={'h2-div'}>Loading...</div>
                                        </div>
                                    </div>
                                </div>
                            </section>
                        )
                }
            </div>
        )
    }

    render() {
        const self = this;
        if(Meteor.isClient && this.propsListHTML==""){
            this.propsListHTML = $('#props_list').html()
        }
        if(Meteor.isClient) {
            this.isServerSSRReq = $('#isservercheckdiv').html()
            if (this.isServerSSRReq == "") this.isServerSSRReq = true
            else this.isServerSSRReq = false
        }
        // if(this.propsListHTML) console.log("propsListHTML: "+this.propsListHTML.length)

        return (
            <div>
                <MainLayoutHeader />
                { (this.props.isSubsLoaded )  ? (
                        this.renderFullMain()
                    ) :
                    this.isServerSSRReq && this.propsListHTML? (
                        <div dangerouslySetInnerHTML={{__html: this.propsListHTML}}></div>
                    ): (
                        <section className="mar-top-20 mar-btm-20 no-print">
                            <div className="container text-center mar-top-20 pad-btm-30">
                                <div className="filter-holder">
                                    <div className="mar-top-30">
                                        <div className={'h2-div'}>Loading...</div>
                                    </div>
                                </div>
                            </div>
                        </section>
                    )}
                <MainLayoutFooter />
            </div>
        )
    }
}

export default withTracker(() => {

    var key = FlowRouter.getParam('key'); if(!key)return {data:false,alreadyLeased:false,isSubsLoaded:true};
    if(key && !propertyKeyOfThisPage) propertyKeyOfThisPage = key;//This will init the var

    const viewLettingSub = Meteor.subscribe("viewLetting",key,function(){
        if(ConfigSub.ready()  )Session.set('subscriptionsReady',true);//AreasSub.ready() &&  make areas sub not req
    })
    // const AreasSub = Meteor.subscribe('Areas',function(){
    //     if(viewLettingSub.ready() && ConfigSub.ready()  )Session.set('subscriptionsReady',true);
    // });
    const ConfigSub = Meteor.subscribe('Config',function(){
        if(viewLettingSub.ready() )Session.set('subscriptionsReady',true);
    });

    if(Meteor.isClient)Session.get('subscriptionsReady');
    if( !viewLettingSub.ready() || !ConfigSub.ready() ) {
        return {data: false, alreadyLeased: false,isSubsLoaded:false};
    }

    var globalConfig = Collections.Config.findOne();

    var deletedList = []
    if(globalConfig){
        deletedList = globalConfig.deletedList
    }

    if(deletedList.includes(key)){
        return {data:false,alreadyLeased:false,isSubsLoaded:true};
    }

    var user = Meteor.user();
    var priceRange = {min:0, max:10000}
    var myBid = false;
    var otherBids = false;
    var PD = {}
    var sliderImages = []

    advancedCrumbs = function(countyParam,areaParam,propertyType){
        let fCrumbs = [], tmpCrumbs = [], areaCrumbs = [], countyCrumbs = [];
        if(propertyType)propertyType = propertyType.toLowerCase();

        // Home / Search Residential Rentals / Dublin City Apartments for Rent / Dublin 2 Apartments for Rent
        //Property Size
        //Property Size - Property Type
        //Property Size - Property Type - County
        //Property Type - county
        //Counties
        //Areas
        //Property Size - Property Type - area - County
        //Property Size - area - County
        //Property Type - area - county

        fCrumbs.push({url: generateSlugURL({propertyType: 'studio'}), name: 'Studios'})//Property Size
        fCrumbs.push({url: generateSlugURL({bedCount: 1}), name: '1-Beds'})//Property Size
        fCrumbs.push({url: generateSlugURL({bedCount: 2}), name: '2-Beds'})
        fCrumbs.push({url: generateSlugURL({bedCount: 3}), name: '3-Beds'})

        tmpCrumbs.push({url: generateSlugURL({cheapSort: true, propertyType: 'house'}), name: 'Cheap Houses'})
        tmpCrumbs.push({url: generateSlugURL({bedCount: 1, propertyType: 'house'}), name: '1-Bed Houses'})//Property Size - Property Type
        tmpCrumbs.push({url: generateSlugURL({bedCount: 2, propertyType: 'house'}), name: '2-Bed Houses'})
        tmpCrumbs.push({url: generateSlugURL({bedCount: 3, propertyType: 'house'}), name: '3-Bed Houses'})
        tmpCrumbs.push({url: generateSlugURL({luxurySort: true, propertyType: 'house'}), name: 'Luxury Houses'})

        if (propertyType == 'house') {
            fCrumbs = fCrumbs.concat(tmpCrumbs);
        }

        fCrumbs.push({
            url: generateSlugURL({cheapSort: true, propertyType: 'apartment'}),
            name: 'Cheap Apartments'
        })
        fCrumbs.push({url: generateSlugURL({bedCount: 1, propertyType: 'apartment'}), name: '1-Bed Apartments'})//Property Size - Property Type
        fCrumbs.push({url: generateSlugURL({bedCount: 2, propertyType: 'apartment'}), name: '2-Bed Apartments'})
        fCrumbs.push({url: generateSlugURL({bedCount: 3, propertyType: 'apartment'}), name: '3-Bed Apartments'})
        fCrumbs.push({
            url: generateSlugURL({luxurySort: true, propertyType: 'apartment'}),
            name: 'Luxury Apartments'
        })

        if (propertyType != 'house') {
            fCrumbs = fCrumbs.concat(tmpCrumbs);
        }

        //dublin-apartments
        //Not doing dublin-houses due to less searches for Dublin apartments
        var staticCounties = ["Carlow", "Cavan", "Clare", "Cork", "Donegal", "Dublin", "Galway", "Kerry", "Kildare", "Kilkenny", "Laois", "Leitrim", "Limerick", "Longford", "Louth", "Mayo", "Meath", "Monaghan", "Offaly", "Roscommon", "Sligo", "Tipperary", "Waterford", "Westmeath", "Wexford", "Wicklow"];

        for (var i = 0; i < staticCounties.length; i++) {
            if (!staticCounties[i]) continue;
            countyCrumbs.push({
                url: generateSlugURL({county: staticCounties[i]}),
                name: staticCounties[i] + ' Apartments'
            })
        }

        if (countyParam) {
            // var propertyType = curURL.propertyType;
            // var county = curURL.county
            // var area = curURL.area
            // var maxRent = curURL.maxRent
            // var country = curURL.country;
            // var bedCount = curURL.bedCount;
            // var luxurySort = curURL.luxurySort;
            // var cheapSort = curURL.cheapSort;

            //////////////////////////// WITH COUNTY
            tmpCrumbs = [];
            tmpCrumbs.push({
                url: generateSlugURL({cheapSort: true, propertyType: 'house', county: countyParam}),
                name: 'Cheap Houses for rent in county ' + titleCase(countyParam)
            })

            if (propertyType == 'house') {
                fCrumbs = fCrumbs.concat(tmpCrumbs);
            }
            fCrumbs.push({
                url: generateSlugURL({cheapSort: true, propertyType: 'apartment', county: countyParam}),
                name: 'Cheap Apartments for rent in county ' + titleCase(countyParam)
            })

            if (propertyType != 'house') {
                fCrumbs = fCrumbs.concat(tmpCrumbs);
            }

            fCrumbs.push({
                url: generateSlugURL({propertyType: 'studio', county: countyParam}),
                name: 'Studio for rent in county ' + titleCase(countyParam)
            })

            tmpCrumbs = [];
            tmpCrumbs.push({
                url: generateSlugURL({bedCount: 1, propertyType: 'house', county: countyParam}),
                name: '1-Bed Houses for rent in county ' + titleCase(countyParam)
            })//Property Size - Property Type
            tmpCrumbs.push({
                url: generateSlugURL({bedCount: 2, propertyType: 'house', county: countyParam}),
                name: '2-Bed Houses for rent in county ' + titleCase(countyParam)
            })
            tmpCrumbs.push({
                url: generateSlugURL({bedCount: 3, propertyType: 'house', county: countyParam}),
                name: '3-Bed Houses for rent in county ' + titleCase(countyParam)
            })
            tmpCrumbs.push({
                url: generateSlugURL({luxurySort: true, propertyType: 'house', county: countyParam}),
                name: 'Luxury Houses for rent in county ' + titleCase(countyParam)
            })

            if (propertyType == 'house') {
                fCrumbs = fCrumbs.concat(tmpCrumbs);
            }
            fCrumbs.push({
                url: generateSlugURL({bedCount: 1, propertyType: 'apartment', county: countyParam}),
                name: '1-Bed Apartments for rent in county ' + titleCase(countyParam)
            })//Property Size - Property Type
            fCrumbs.push({
                url: generateSlugURL({bedCount: 2, propertyType: 'apartment', county: countyParam}),
                name: '2-Bed Apartments for rent in county ' + titleCase(countyParam)
            })
            fCrumbs.push({
                url: generateSlugURL({bedCount: 3, propertyType: 'apartment', county: countyParam}),
                name: '3-Bed Apartments for rent in county ' + titleCase(countyParam)
            })
            fCrumbs.push({
                url: generateSlugURL({luxurySort: true, propertyType: 'apartment', county: countyParam}),
                name: 'Luxury Apartments for rent in county ' + titleCase(countyParam)
            })

            if (propertyType != 'house') {
                fCrumbs = fCrumbs.concat(tmpCrumbs);
            }

            if (areaParam) {
                //////////////////////////// WITH AREA COUNTY
                tmpCrumbs = [];
                tmpCrumbs.push({
                    url: generateSlugURL({
                        cheapSort: true,
                        propertyType: 'house',
                        county: countyParam,
                        area: areaParam
                    }), name: 'Cheap Houses for rent in ' + titleCase(areaParam) + ' ' + titleCase(countyParam)
                })

                if (propertyType == 'house') {
                    fCrumbs = fCrumbs.concat(tmpCrumbs);
                }
                fCrumbs.push({
                    url: generateSlugURL({
                        cheapSort: true,
                        propertyType: 'apartment',
                        county: countyParam,
                        area: areaParam
                    }), name: 'Cheap Apartments for rent in ' + titleCase(areaParam) + ' ' + titleCase(countyParam)
                })

                if (propertyType != 'house') {
                    fCrumbs = fCrumbs.concat(tmpCrumbs);
                }

                fCrumbs.push({
                    url: generateSlugURL({propertyType: 'studio', county: countyParam, area: areaParam}),
                    name: 'Studio for rent in ' + titleCase(areaParam) + ' ' + titleCase(countyParam)
                })

                tmpCrumbs = [];
                tmpCrumbs.push({
                    url: generateSlugURL({
                        bedCount: 1,
                        propertyType: 'house',
                        county: countyParam,
                        area: areaParam
                    }), name: '1-Bed Houses for rent in ' + titleCase(areaParam) + ' ' + titleCase(countyParam)
                })//Property Size - Property Type
                tmpCrumbs.push({
                    url: generateSlugURL({
                        bedCount: 2,
                        propertyType: 'house',
                        county: countyParam,
                        area: areaParam
                    }), name: '2-Bed Houses for rent in ' + titleCase(areaParam) + ' ' + titleCase(countyParam)
                })
                tmpCrumbs.push({
                    url: generateSlugURL({
                        bedCount: 3,
                        propertyType: 'house',
                        county: countyParam,
                        area: areaParam
                    }), name: '3-Bed Houses for rent in ' + titleCase(areaParam) + ' ' + titleCase(countyParam)
                })
                tmpCrumbs.push({
                    url: generateSlugURL({
                        luxurySort: true,
                        propertyType: 'house',
                        county: countyParam,
                        area: areaParam
                    }), name: 'Luxury Houses for rent in ' + titleCase(areaParam) + ' ' + titleCase(countyParam)
                })

                if (propertyType == 'house') {
                    fCrumbs = fCrumbs.concat(tmpCrumbs);
                }
                fCrumbs.push({
                    url: generateSlugURL({
                        bedCount: 1,
                        propertyType: 'apartment',
                        county: countyParam,
                        area: areaParam
                    }), name: '1-Bed Apartments for rent in ' + titleCase(areaParam) + ' ' + titleCase(countyParam)
                })//Property Size - Property Type
                fCrumbs.push({
                    url: generateSlugURL({
                        bedCount: 2,
                        propertyType: 'apartment',
                        county: countyParam,
                        area: areaParam
                    }), name: '2-Bed Apartments for rent in ' + titleCase(areaParam) + ' ' + titleCase(countyParam)
                })
                fCrumbs.push({
                    url: generateSlugURL({
                        bedCount: 3,
                        propertyType: 'apartment',
                        county: countyParam,
                        area: areaParam
                    }), name: '3-Bed Apartments for rent in ' + titleCase(areaParam) + ' ' + titleCase(countyParam)
                })
                fCrumbs.push({
                    url: generateSlugURL({
                        luxurySort: true,
                        propertyType: 'apartment',
                        county: countyParam,
                        area: areaParam
                    }), name: 'Luxury Apartments for rent in ' + titleCase(areaParam) + ' ' + titleCase(countyParam)
                })

                if (propertyType != 'house') {
                    fCrumbs = fCrumbs.concat(tmpCrumbs);
                }
            }

            var distinctEntries = _.uniq(Collections.Areas.find({}, {//County: countyParam ; Dynamically load areas based on the subscription.
                sort: {Area: 1}, fields: {Area: true}
            }).fetch().map(function (x) {
                return x.Area;
            }), true);
            areaCrumbs = []
            for (var i = 0; i < distinctEntries.length; i++) {
                if (!distinctEntries[i]) continue;
                // if (distinctEntries[i] == areaParam) continue;//Don't show the same area in this list
                areaCrumbs.push({
                    url: generateSlugURL({county: countyParam, area: distinctEntries[i]}),
                    name: distinctEntries[i] + ' Apartments'
                })
            }

            // let ptypeString='';
            // switch(propertyType){
            //     case 'apartment': ptypeString = 'Apartments '; break;
            //     case 'house': ptypeString = 'Houses '; break;
            // }
            // fCrumbs.push({url:FlowRouter.url('b',{slug:slugTemp[0]}), name:'Studio for rent in county '+titleCase(PD.address.county)})
            // fCrumbs.push({url:FlowRouter.url('b',{slug:slugTemp[0]}), name:'1-Bed '+ptypeString+'for rent in county '+titleCase(PD.address.county)})
            // fCrumbs.push({url:FlowRouter.url('b',{slug:slugTemp[0]}), name:'2-Bed '+ptypeString+'for rent in county '+titleCase(PD.address.county)})
            // fCrumbs.push({url:FlowRouter.url('b',{slug:slugTemp[0]}), name:'3-Bed '+ptypeString+'for rent in county '+titleCase(PD.address.county)})
        }
        return {
            fCrumbs:fCrumbs,
            areaCrumbs: areaCrumbs,
            countyCrumbs:countyCrumbs
        }
    }


    var data = Collections.Auctions.findOne({"lettingAuctionCode" : key}, { limit: 1 });

    if(data){

        data.applicationsReceivedCount = Collections.Bids.find({auctionId:data._id}).count();
        PDret = Collections.Properties.find(data.propertyId).fetch();
        PD = PDret[0];

        PD.bedroomsCount=0
        PD.ensuiteCount = 0;
        PD.doubleBedCount = 0;
        if(PD.bedrooms){
            PD.bedroomsCount = PD.bedrooms.length;
            for (var i = 0; i < PD.bedrooms.length; i++) {
                if (PD.bedrooms[i]["ensuite"] ) {
                    PD.ensuiteCount++;
                }
            if (PD.bedrooms[i]["bedType"] == 'double' ) {
                PD.doubleBedCount++;
            }
        }
        }

        if(PD.contacts) {//Take the contact of activation not property
            data.primaryContact = PD.contacts[0];
        }else data.primaryContact = {};

        tmp = [];
        if(PD.amenities){
            for ( var i=0; i< PD.amenities.length;i++){
                var src = globalConfig.amenitiesLogos[PD.amenities[i]];
                if(!src)src = globalConfig.amenitiesLogos["default"]
                tmp.push({name:PD.amenities[i], src: cdnPath(src) })
            }
        }
        PD.amenitiesWithImgs = tmp;

        if(PD.gallery){
            for(var i=0;i<PD.gallery.length;i++){
                let altText = 'Photo '+(i+1)+' of '+titleCase(PD.address.address)
                if (PD.address.area) altText +=', '+titleCase(PD.address.area)
                if (PD.address.county) altText +=', '+titleCase(PD.address.county)

                // sliderImages.push(PD.gallery[i].url)
                sliderImages.push({url:PD.gallery[i].url,altText:altText})
            }
        }

        ////////// BREADCRUMBS
        let bcrumbs = [];let slugTemp, searchCrumbs = [];
        // Home / Search Residential Rentals / Dublin City Apartments for Rent / Dublin 2 Apartments for Rent
        if(PD.address.county){
            slugTemp = generateSlug({county:PD.address.county})
            bcrumbs.push({url:FlowRouter.url('b',{slug:slugTemp[0]}), name:titleCase(PD.address.county)})
            searchCrumbs.push({url:FlowRouter.url('b',{slug:slugTemp[0]}), name:'rent in '+titleCase(PD.address.county)})
        }
        if(PD.address.area && PD.address.county) {
            slugTemp = generateSlug({county: PD.address.county, area:PD.address.area})
            bcrumbs.push({url:FlowRouter.url('b',{slug:slugTemp[0]}), name:titleCase(PD.address.area)})
            searchCrumbs.push({url:FlowRouter.url('b',{slug:slugTemp[0]}), name:'rent in '+titleCase(PD.address.area)+" of county "+titleCase(PD.address.county)})
        }
        if(PD.address.area && PD.address.county && PD.type) {
            slugTemp = generateSlug({
                county: PD.address.county,
                area: PD.address.area,
                propertyType: PD.type
            })
            bcrumbs.push({url:FlowRouter.url('b',{slug:slugTemp[0]}), name:titleCase(PD.type)})
            searchCrumbs.push({url:FlowRouter.url('b',{slug:slugTemp[0]}), name:''+titleCase(PD.type)+" for rent in "+titleCase(PD.address.area)+" of county "+titleCase(PD.address.county)})
        }
        data.bcrumbs = bcrumbs;
        data.searchCrumbs = searchCrumbs.reverse();
        ////////// END BREADCRUMBS
        ////////// ADV BREADCRUMBS MORE LINKS
        if(true) {
            if(PD.address.county) {
                AreasSub = Meteor.subscribe('Areas','','',PD.address.county,'','',function(){
                    Session.set('subscriptionsReady2',true);
                });
            }
            if(Meteor.isClient)Session.get('subscriptionsReady2');

            var advC = advancedCrumbs(PD.address.county,PD.address.area,PD.type);
            data.fCrumbs = advC.fCrumbs;
            data.areaCrumbs = advC.areaCrumbs;
            data.countyCrumbs = advC.countyCrumbs;
        }
        ////////// END ADV BREADCRUMBS
        //////// RELATED PROPS
        var notArr = [PD._id]
        var filters = {
            "type":PD.type,
            "address.county":PD.address.county,
            "address.area":PD.address.area,
            "auctionId": {$exists:true, $gt: "" },
            "isArchived":false,
            "_id": { $not: { $in: notArr } }
        }

        data.relatedProps = []
        var tmpRelated = Collections.Properties.find(filters,{
            transform:function(doc){
                doc.auction = Collections.Auctions.findOne({_id:doc.auctionId})
                if(doc.gallery){
                    if(doc.gallery[0])doc.firstImg = doc.gallery[0]
                }
                return doc;
            },
            limit:4}).fetch();
        data.relatedProps = data.relatedProps.concat(tmpRelated);
        notArr = [PD._id]
        for(var i=0;i<data.relatedProps.length;i++){
            notArr.push(data.relatedProps[i]._id)
        }
        filters["_id"] = { $not: { $in: notArr } };

        if(data.relatedProps.length<4){
            delete filters["address.area"];
            var tmpRelated = Collections.Properties.find(filters,{
                transform:function(doc){
                    doc.auction = Collections.Auctions.findOne({_id:doc.auctionId})
                    if(doc.gallery){
                        if(doc.gallery[0])doc.firstImg = doc.gallery[0]
                    }
                    return doc;
                },
                limit:4}).fetch();
            data.relatedProps = data.relatedProps.concat(tmpRelated);
        }
        notArr = [PD._id]
        for(var i=0;i<data.relatedProps.length;i++){
            notArr.push(data.relatedProps[i]._id)
        }filters["_id"] = { $not: { $in: notArr } };

        if(data.relatedProps.length<4){
            delete filters["address.county"]
            var tmpRelated = Collections.Properties.find(filters,{
                transform:function(doc){
                    doc.auction = Collections.Auctions.findOne({_id:doc.auctionId})
                    if(doc.gallery){
                        if(doc.gallery[0])doc.firstImg = doc.gallery[0]
                    }
                    return doc;
                },
                limit:4}).fetch();
            data.relatedProps = data.relatedProps.concat(tmpRelated);(tmpRelated);
        }
        notArr = [PD._id]
        for(var i=0;i<data.relatedProps.length;i++){
            notArr.push(data.relatedProps[i]._id)
        }filters["_id"] = { $not: { $in: notArr } };

        if(data.relatedProps.length<4){
            delete filters["type"]
            var tmpRelated = Collections.Properties.find(filters,{
                transform:function(doc){
                    doc.auction = Collections.Auctions.findOne({_id:doc.auctionId})
                    if(doc.gallery){
                        if(doc.gallery[0])doc.firstImg = doc.gallery[0]
                    }
                    return doc;
                },
                limit:4}).fetch();
            data.relatedProps = data.relatedProps.concat(tmpRelated);(tmpRelated);
        }
        if(data.relatedProps.length>4){
            data.relatedProps = data.relatedProps.slice(0,4);
        }
        ///////// END FILTERS

        var min = data.price*0.7, max = data.price*1.5;// also used in propertyApplications.onRendered
        priceRange = {min:min, max:max}

        ///////// START MY BIG AND OTHER BIDS
        if(user){
            var ret = Collections.Bids.find({auctionId:data._id,userId:user._id, isArchived:false}, {limit: 1}).fetch();
            myBid = ret[0];

            var maxLen = 5;
            var forTotCount = Collections.Bids.find({auctionId:data._id, isArchived:false}, {
                limit: maxLen,
                sort: { yourBid : -1 }
            })
            // debugger;
            if(!forTotCount.count()){//No results, return
                otherBids = {
                    needed: false,
                    arr: []
                }
            }else{
                if(!myBid || !user)
                    otherBids = {
                        needed: true,
                        arr: forTotCount.fetch()
                    }
                else{
                    var weNeedOnSides = Math.floor( maxLen/2 )
                    var needAbove = weNeedOnSides;
                    var back = Collections.Bids.find({auctionId:data._id, userId:{$ne: user._id}, yourBid:{$lt:myBid.yourBid} ,isArchived:false}, {
                        limit: maxLen - 1,
                        sort: { yourBid : -1 }
                    })
                    var backCount = back.count();

                    if(backCount<weNeedOnSides){ // if count isn't enough, then change back itself.
                        back = Collections.Bids.find({auctionId: data._id, userId:{$ne: user._id}, yourBid:{$lte:myBid.yourBid} ,isArchived:false},         {
                            limit: maxLen - 1,
                            sort: { yourBid : -1 }
                        })
                    }
                    backCount = back.count();
                    if(backCount<weNeedOnSides){//if its still less, then update we needAbove value
                        needAbove += weNeedOnSides-backCount;
                    }

                    var above = Collections.Bids.find({auctionId:data._id, userId:{$ne: user._id}, yourBid:{$gt:myBid.yourBid} ,isArchived:false}, {
                        limit: maxLen - 1,
                        sort: { yourBid : -1 }
                    })
                    var aboveCount = above.count();

                    if(aboveCount<needAbove){ // if count isn't enough, then change back itself.
                        above = Collections.Bids.find({auctionId:data._id, userId:{$ne: user._id}, yourBid:{$gte:myBid.yourBid} ,isArchived:false}, {
                            limit: maxLen - 1,
                            sort: { yourBid : -1 }
                        })
                    }
                    aboveCount = above.count();

                    var retAbove = above.fetch();
                    var retBack = back.fetch();
                    retAbove.push(myBid)

                    otherBids = {
                        needed: true,
                        arr: retAbove.concat(retBack)
                    };

                }
            }
        }
        ///////// START MY BIG AND OTHER BIDS
    }

    var isAgent = false;
    // switch(data.createdByAgent){
    //     case '':
    //         isAgent = {
    //             "logourl":Meteor.absoluteUrl()+'images/property-rental-agents/Bell-Property-Consultants.jpeg',
    //             "name": 'Bell Property Consultants Ltd',
    //             "address1":"Harolds Cross, Dublin",
    //             "style":{height:"100px"}
    //         }
    // }

    var alreadyLeased = false;
    if(data){
        if(data.isArchived)alreadyLeased=true;
    }

    var refListArr = [];
    var hasAllReqReferences = false;
    if(user)
    if(user.profile)
    if(user.profile.references) {
        // if (!user.profile.references.hasResume) refListArr.push("Resume");//Why do you need it?
        if (!user.profile.references.hasLandlordRef) refListArr.push("Landlord reference");
        if (!user.profile.references.employerName) refListArr.push("Employer name");
        if (!user.profile.references.hasWorkRef) refListArr.push("Work reference");
        if (!user.profile.references.hasFinancialRef) refListArr.push("Financial reference");
        if (!user.profile.references.hasGovtID) refListArr.push("Government ID");
        if (!user.profile.references.hasPassport) refListArr.push("Passport");
        if (!user.profile.references.hasPPS) refListArr.push("PPS");
        try{
            if(user.profile.references.hasResume && user.profile.references.hasLandlordRef && user.profile.references.hasGovtID && user.profile.references.hasWorkRef )hasAllReqReferences = true;
        }catch(e){console.log(e)}
    }



    try {
        var title = '';
        title = PD.address.address + ', ' + PD.address.area;
        if (PD.address.county) title += ', ' + PD.address.county;

        var desc = '';
        if(PD.type) desc += titleCase(PD.type)+ ' for rent at ';
        desc += PD.address.address + ', ' + PD.address.area;
        if (PD.address.county) desc += ', ' + PD.address.county+'. ';
        desc += 'Its '+ (PD.furnished ? "a furnished " : "an Unfurnished ")+ titleCase(PD.type)+
            " with "+ (PD.bedroomsCount ? PD.bedroomsCount : 'no')+" beds, "+
            (PD.baths ? PD.baths : 'no')+" baths, "+
            (PD.ensuiteCount ? PD.ensuiteCount : "no" )+" Ensuite and " +
            (PD.doubleBedCount ? PD.doubleBedCount : "has no" )+" Double bed property. "
        desc += "Apply for this " + PD.type + ", view its images, details and much more.";

        // Apartment for rent in
        //     Newbrook road, mullingar, co. westmeath, murrisk, mayo | SpotMyCrib
        clearMeta();
        let titleTmp = title + ' | SpotMyCrib'
        if(titleTmp.length<=75)title = titleTmp;

        DocHead.setTitle(title);
        DocHead.addMeta({
            name: "description",
            content: desc
        });

        var socialDesc = "Apply for this " + PD.type + ", view its images, details and much more.";
        var socialTitle = '';
        if(PD.bedroomsCount) socialTitle += PD.bedroomsCount+ ' Bed '
        if(PD.type) socialTitle += PD.type+ ' available at '
        socialTitle += title
        socialTitle = '' + titleCase(socialTitle) + ' | SpotMyCrib'
        DocHead.addMeta({property: "og:title", content: socialTitle});
        DocHead.addMeta({property: "og:description", content: socialDesc});

        {/*<link rel="canonical" href="http://example.com/wordpress/seo-plugin/" />*/}
        if(FlowRouter.current().route.name == 'letting')
        DocHead.addMeta({rel: "canonical", href: FlowRouter.url('rent',{slug:PD.slug,key:key}) });

        DocHead.addMeta({property: "og:type", content: "place"});
        DocHead.addMeta({property: "og:url", content: FlowRouter.url(FlowRouter.current().route.name, FlowRouter.current().params) });
        DocHead.addMeta({property: "fb:app_id", content: '309356899476430'})

        try{DocHead.addMeta({property: "og:image", content: PD.gallery[0].url  }); }
        catch (c){
            //Putting this here is making FB take the first response from here. & its showing no image if if this meta is later updated. So better put it later after all rendering at a template level. For now lets not keep anywhere.
            // DocHead.addMeta({name: "og:image", content: 'https://www.spotmycrib.ie/images/spot-my-crib-logo.png'  });
        }

    }catch(err){
        clearMeta();
        DocHead.setTitle(' Property not found | SpotMyCrib');
        DocHead.addMeta({name: "description", content: ""});
    }

    return {
        data: data,
        alreadyLeased: alreadyLeased,
        isAgent: isAgent,
        user: user,
        refListArr: refListArr,
        priceRange: priceRange,
        hasAllReqReferences: hasAllReqReferences,
        myBid: myBid,
        otherBids: otherBids,
        PD: PD,
        sliderImages: sliderImages,
        isSubsLoaded:true
    };
})(LettingDetail);

class ImagesSlider extends Component {
    constructor(props) {
        super(props)
        var current = FlowRouter.current();
        this.currentURL = FlowRouter.url(FlowRouter.current().route.name, FlowRouter.current().params)
    }
    componentDidMount(){
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
    }
    render() {
        return (

            <div id="lettingDetailCarousel" className="carousel slide" data-ride="carousel">
                <div className="carousel-inner">
                    {this.props.images ?
                        this.props.images.map(function(image,i){
                            return (
                            <div key={i} className={'item '+ (i==0 ? 'active' : "")}>
                                <img src={image.url} alt={image.altText} title={image.altText} className="img-responsive"/>
                            </div>
                            )
                        })
                    :(
                        <div className="item active">
                            <img src={cdnPath("/images/no-photo.png")} alt={'Image not available'} title={'Image not available'} className="img-responsive"/>
                        </div>
                    )}
                </div>
                {/* Left and right controls */}
                <a className="left carousel-control" href={"javascript:void(0)"} data-slide="prev">
                    <span className="glyphicon glyphicon-chevron-left"/>
                    <span className="sr-only">Previous</span>
                </a>
                <a className="right carousel-control" href={"javascript:void(0)"} data-slide="next">
                    <span className="glyphicon glyphicon-chevron-right"/>
                    <span className="sr-only">Next</span>
                </a>
            </div>
        );
    }
}
class AddThisReact extends Component {
    constructor(props) {
        super(props)
        console.log('Add this started')
    }
    componentDidMount(){
        console.log('Add this rendered');
    }
    render() {
        return (
            <div className="addThis">
                <div className="addthis_inline_share_toolbox"></div>
            </div>
        );
    }
}
// Error: Can't find npm module 'aws-sdk'. Did you forget to call 'Npm.depends' in package.js within the 'jns_flow-router-ssr' package?