import { Meteor } from 'meteor/meteor';
import React, { Component } from 'react';
import { withTracker } from 'meteor/react-meteor-data';
import {LoginFormSignInView,LoginFormSignUpView,LoginFormSignUpViewLandlord,LoginFormResetPasswordView  } from './LoginFormViews.jsx'

emailAlerts = [
    // {
    //     heading: 'OH, HEY!',
    //     para: 'Get your dream place sooner without even searching for it! Sign up for our emails and we will send you the latest properties of your choice',
    //     yesButtonText: "Awesome 🤘👍"
    // },
    {
        heading: 'Always First.',
        para: 'Be the first to hear about the latest lettings in your area. Signup for our email alerts.',
        yesButtonText: "HELL YES!"
    }
    // ,
    // {
    //     heading: 'Get Notified.',
    //     para: 'Get your rental soon by signing up for our email alerts. Be the first one to know when a letting is posted.',
    //     yesButtonText: "Okays! Sign me up. :)"
    // }
]
EMAIL_ALERT_VARIATION_count = 2;
// EMAIL_ALERT_VARIATION = Math.floor(Math.random() * EMAIL_ALERT_VARIATION_count) // expected output: 0, 1, 2
EMAIL_ALERT_VARIATION = 0;//Keeping only 1 variation.
EMAILALERT = emailAlerts[EMAIL_ALERT_VARIATION]
isMobileMenuEventAttached = false;
function delayedFunctions() {
    // if(!isMobileMenuEventAttached) {
        $(document).unbind('click').bind('click',function (e) {
            if (!$('.xs-menu').hasClass('slide-right')) {//Its not open
                if ($(e.target).closest(".xs-menu-icon-master").length > 0) {
                    if(FlowRouter.current().route.name=='home')
                        $('.carousel-indicators').addClass('carousel-indicatorsLowZindex');
                    $('.xs-menu').addClass('slide-right');
                    return true;
                } else return true
            } else {//Its open
                if ($(e.target).closest(".xs-menu-close-icon .xs-close, .xs-menu a").length > 0 || $(e.target).closest(".slide-right").length < 1) {
                    $('.xs-menu').removeClass('slide-right')
                    if(FlowRouter.current().route.name=='home')
                        setTimeout(function(){
                            if(FlowRouter.current().route.name=='home') $('.carousel-indicators').removeClass('carousel-indicatorsLowZindex');
                        },250);
                    return true;
                }
            }
        });
        // isMobileMenuEventAttached = true;
    // }

}
function showLoginDialog(){
    Session.set('showForgotForm',false)
    Session.set('showSignupForm',false)
    Session.set('showLoginSignupFancyBoxDialog',true)
    Session.set('showLoginDialog',true)
}
function showSignupDialog(){
    Session.set('showForgotForm',false)
    Session.set('showSignupForm',true)
    Session.set('showLoginSignupFancyBoxDialog',true)
    Session.set('showLoginDialog',true)
}
function showLoginPopup(){
    // let doesDivStillExists = $('#signin-div').html()
    // if( doesDivStillExists != "" ){//To prevent home page dialogs
        $.fancybox({
            'padding': 0,
            'href': '#signin-div',
            afterClose:function(template){
                console.log(template);
                //template.showLoginDialog.set(false);
                Session.set('isLandLordMode',false)
                Session.set('showLoginDialog',false)
                Session.set('showLoginSignupFancyBoxDialog',false)
                Session.set('loginFromApplyNowBtn',false)

            }
        })
}
function emailValidation(email) {

    email = email.trim();
    var re = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;

    // Valid
    if( re.test(email) ){
        return true;
    }

    // Invalid
    return {
        error: "INVALID_EMAIL",
        reason: "Please enter a valid email address in format pat@gmail.com",
    };

}
function decideAndShowCreateAlertPopup(){
    // console.log("Apply decideAndShowCreateAlertPopup")
    let showAlertCreate = true;
    
    let saidNo = parseInt(readCookie('emailAlertNoThanks')) ;
    if(!saidNo){
        let c = parseInt(readCookie('emailAlertShowedCount')) ;
        let on = parseInt(readCookie('emailAlertShowedOnTime')) ;
        let tmp = (Date.now() - on) / 60000 ;// time in mins
        // console.log('Time is: '+tmp);
        if(c > 1 ){
            if( tmp < 2 )showAlertCreate = false; //its not even 2mns since last popup show, so wait
        }
        if(c > 2 ){
            if( tmp < 2 )showAlertCreate = false; //its not even 2mns since last popup show, so wait
        }
        if(c > 3 ){
            if( tmp < 3 )showAlertCreate = false; //its not even 3mns since last popup show, so wait
        }
        if(c > 4 ){
            if( tmp < 6 )showAlertCreate = false; //its not even 6mns since last popup show, so wait
        }
        if(c > 5 ){
            if( tmp < 12 )showAlertCreate = false; //its not even 12mns since last popup show, so wait
        }
    }
    let user = Meteor.user();
    if(user){
        if(user.profile.emailAlertsActive || user.profile.emailAlertsNoThanks) showAlertCreate = false; // he already has alerts or he said no to them.
    }
    if(parseInt(readCookie('emailAlertAlreadyHasIt')) || parseInt(readCookie('emailAlertNoThanks')) ) showAlertCreate = false; // He already has alerts or He already said no
    //you don't need above fallback because this function is called only after 3-5 sec , by then user subscription must be loaded.
    // console.log("decision: "+showAlertCreate)
    if(showAlertCreate){
        showCreateAlertPopup();
    }
}
function showCreateAlertPopup(){
    if ( ['rent',"b",'letting'].includes(  FlowRouter.current().route.name ) ){
    let c = parseInt(readCookie('emailAlertShowedCount')) ;
    c= parseInt(c);
    if(isNaN(c))c = 1;
    else {
        c++;
    }
    createCookie('emailAlertShowedCount',c,5)
    createCookie('emailAlertShowedOnTime',Date.now(),5)

    $.fancybox({
        'padding': 0,
        'href': '#create-alert-popup',
        afterShow:function(){
            $('#emailAlertUserEmailAddress').focus();
            ga('send', 'event', 'emailAlert', 'Show Email Alert', 'Route name: '+FlowRouter.current().route.name+' Variation: '+EMAIL_ALERT_VARIATION);
        },
        afterClose:function(){
            Session.set('showCreateAlertPopup',false)
        }
    })
    }
}
function showAddPropertyHeaderPopup(){
    $.fancybox({
        'padding': 0,
        'href': '#addPropertyHeader-div',

        afterClose:function(template){
            //console.log(template);
            Session.set('showAddPropertyHeaderTemplate',false)
            Session.set('showAddPropertyHeaderFancyBoxDialog',false)

        }
    })
}
function createCookie(name,value,days) {
    var expires = "";
    if (days) {
        var date = new Date();
        date.setTime(date.getTime() + (days*24*60*60*1000));
        expires = "; expires=" + date.toUTCString();
    }
    document.cookie = name + "=" + value + expires + "; path=/";
}
function readCookie(name) {
    var nameEQ = name + "=";
    var ca = document.cookie.split(';');
    for(var i=0;i < ca.length;i++) {
        var c = ca[i];
        while (c.charAt(0)==' ') c = c.substring(1,c.length);
        if (c.indexOf(nameEQ) == 0) return c.substring(nameEQ.length,c.length);
    }
    return null;
}
function eraseCookie(name) {
    createCookie(name,"",-1);
}
function loadFonts(){
    (function() {
        var wf = document.createElement('link');
        wf.href = cdnPath('/fonts/Montserrat/stylesheet.css');
        wf.rel = 'stylesheet';
        wf.async = 'true';//link doesnt support async
        var s = document.getElementsByTagName('link')[0];
        s.parentNode.insertBefore(wf, s);

        Session.set('fontsLoaded',true);

        // var wf = document.createElement('script');
        // wf.src = 'https://ajax.googleapis.com/ajax/libs/webfont/1/webfont.js';
        // wf.type = 'text/javascript';
        // wf.async = 'true';
        // var s = document.getElementsByTagName('script')[0];
        // s.parentNode.insertBefore(wf, s);
    })();
}

class MainLayoutHeader extends Component {
    constructor(props){
        super(props);
        this.state = {
            emailAlertEmailAddress : this.props.currentUser ? this.props.currentUser.profile.email : ""
        };
        this.emailAlertEmailAddressHandler = this.emailAlertEmailAddressHandler.bind(this);
        this.NeedsCreateAlertPopup = false;
        if( ['rent',"b",'letting'].includes(  FlowRouter.current().route.name ) ){
            this.NeedsCreateAlertPopup = true;
            // EMAIL_ALERT_VARIATION = Math.floor(Math.random() * EMAIL_ALERT_VARIATION_count) // expected output: 0, 1
            EMAIL_ALERT_VARIATION = 0;
            EMAILALERT = emailAlerts[EMAIL_ALERT_VARIATION]
        }
    }
    componentWillReceiveProps(nextProps) {
        if(nextProps.currentUser && !this.state.emailAlertEmailAddress)//update only if it has vals and emailAlertEmailAddress is empty.
            this.setState({emailAlertEmailAddress: nextProps.currentUser.profile.email })
    }
    componentWillMount(){
        if(Meteor.isClient) {
            Session.set('showLoginDialog', false)
            Session.set('showForgotForm', false)
            Session.set('showLoginDialog', false)
            Session.set('showLoginSignupFancyBoxDialog', false)
            Session.set('showAddPropertyHeaderTemplate', false)
            Session.set('showAddPropertyHeaderFancyBoxDialog', false)
            if (!Session.get("showErrorDlg")) Session.set("showErrorDlg", []);
        }
        this.state = {
            newAlertCreateForm:true,
            newAlertCreatedSuccessfully:false
        }
        this.emailAlertCreateBtnHandler = this.emailAlertCreateBtnHandler.bind(this)
        this.emailAlertNoThanksBtnHandler = this.emailAlertNoThanksBtnHandler.bind(this)
    }
    emailAlertCreateBtnHandler(){
        console.log('emailAlertCreateBtnHandler')
        let val = $('#emailAlertUserEmailAddress').val();
        let validatedEmail = emailValidation(val);
        if(validatedEmail !== true){
            alert('Invalid email, please enter a valid email address.');
            $('#emailAlertUserEmailAddress').focus();
            return;
        }
        this.subscribeToEmailAlert = function(error, result){
            if(error){
                console.log(error);
                alert('Error: '+error.reason);
                $('#emailAlertUserEmailAddress').focus();
                return;
            }else{
                createCookie('emailAlertAlreadyHasIt',1,365)
                this.setState({newAlertCreateForm:false,newAlertCreatedSuccessfully:true})
                setTimeout(function () {
                    if ($)
                        if ($.fancybox)
                            $.fancybox.close();
                },10000)
            }
        }
        this.subscribeToEmailAlert = this.subscribeToEmailAlert.bind(this);
        Meteor.call('subscribeToEmailAlert',val,this.subscribeToEmailAlert);

        ga('send', 'event', 'emailAlert', 'Created Email Alert', 'Route name: '+FlowRouter.current().route.name+' Variation: '+EMAIL_ALERT_VARIATION);
    }
    emailAlertNoThanksBtnHandler(){
        console.log('emailAlertNoThanksBtnHandler')
        createCookie('emailAlertNoThanks',1,365)
        if(this.props.currentUser){
            Meteor.call('emailAlertsNoThanks');
        }
        if ($)
            if ($.fancybox)
                $.fancybox.close();
    }
    componentDidMount(){
        $.getScript(cdnPath('/js/bootstrap.min.js'), function(){
            // console.log("Bootstrap loaded")
        });
        // $.getScript(cdnPath('//static.filestackapi.com/filestack-js/1.x.x/filestack.min.js'), function(){
        //     console.log("Filestack loaded")
        // });

        $.getScript(cdnPath('/plugins/fancybox/js/jquery.fancybox.min.js'), function(){
            // script should be loaded and do something with it.
            $('.fancybox').fancybox({
                scrolling:'no',
                helpers: {
                    overlay: {
                        locked: true
                    }
                }
            })
        });
        if(Meteor.isClient){
            var fontsLoaded = Session.get('fontsLoaded');
            if(!fontsLoaded) {
                //Below code is taken from https://developers.google.com/speed/docs/insights/OptimizeCSSDelivery
                var raf = window.requestAnimationFrame || window.mozRequestAnimationFrame ||
                    window.webkitRequestAnimationFrame || window.msRequestAnimationFrame;
                if (raf) raf(function() { window.setTimeout(loadFonts, 0); });
                else window.addEventListener('load', loadFonts);
            }
        }
        setTimeout(delayedFunctions,1500)
        if( ['rent',"b",'letting'].includes(  FlowRouter.current().route.name ) ){
            setTimeout(function(){
                decideAndShowCreateAlertPopup();
            },10000)
            var runOnlyOnce = false;
            $(document).off('scroll').on('scroll', function() {
                try{
                    let addon = 50; if(FlowRouter.current().route.name == 'b')addon = 300;
                    if($(this).scrollTop()>=($('.subscribeTillPopop').position().top - addon) && !runOnlyOnce ){
                        runOnlyOnce = true;
                        decideAndShowCreateAlertPopup();
                    }
                }catch(e){}
            })
        }
    }

    showLoginDialogClick(event){
        showLoginDialog();
    }
    showSignupDialogClick(event){
        showSignupDialog();
    }
    logoutBtnClick(event){
        Meteor.logout(function(err){
            if (err) {
                throw new Meteor.Error("Logout failed");
            }
        })
    }
    profileBtnClick(event){
        FlowRouter.go('account/profile');
    }
    cookieConsentBtnClick(event){
        createCookie('cookieConsent',1,365);
        $('.cookieConsentArea').remove();
    }
    emailAlertEmailAddressHandler(event){
        this.setState({emailAlertEmailAddress:event.target.value})
    }

    render() {
        const self = this;
        return (
<div>
    { this.props.showCookieConsent ?
    <section className="cookieConsentArea">
        <div className="container">
            <div className="cookieConsentArea-inner">
                <div className="left-menu text-center" style={{color: 'white'}}><p>  SpotMyCrib uses cookies. By continuing to use this site you consent to the use of cookies in accordance to our  <a href={FlowRouter.url('cookiepolicy')}> cookie policy </a>.<button className="green-btn btns cookieConsentBtn" onClick={self.cookieConsentBtnClick.bind(this)} type="button" style={{marginLeft: 20}}>I understand</button></p>
            </div>
        </div>
    </div>
</section>
: ""}
<section className="header">
    <div className="container">
        <div className="logo-holder-div">
            <div className="xs-menu-icon-master"><div className="xs-menu-icon">
                    <span className="menu-xs sprite" />
            </div></div>
                <div className="logo-holder">
                    <a href={FlowRouter.url('home')}>
                        <img src={cdnPath("/images/spot-my-crib-logo.png")} alt="SpotMyCrib" title="SpotMyCrib - Safe and easy rentals" className="logo-big" />
                        <img src={cdnPath("/images/spotmycrib-logo-130.jpg")} alt="SpotMyCrib" title="SpotMyCrib - Safe and easy rentals" className="logo-xs" />
                    </a>
                </div>
                <div className="menu">
                    <ul>
                        <li className="hidden-xs"><a href={FlowRouter.url('advertisewithus')} className="btns green-btn addPropertyHeaderBtn" type="button"><span className="glyphicon glyphicon-object-align-bottom" aria-hidden="true" /> Advertise property</a></li>
                        
                        { this.props.currentUserId ?
                            <li className="login-menu hidden-xs">
                                <a href={FlowRouter.url('account/myProperties')}>
                                    <span className="glyphicon glyphicon-check" aria-hidden="true"/> MY PROPERTIES
                                </a>
                            </li>
                            : ""}
                        { this.props.currentUserId ?
                            <li className="login-menu hidden-xs">
                                <a href={FlowRouter.url('account/profile')}>
                                    <span className="glyphicon glyphicon-check" aria-hidden="true"/> MY REFERENCES
                                </a>
                            </li>
                        : ""}
                        { this.props.currentUserId ?
                            <li className="login-menu hidden-xs"><a href="javascript:void(0);" onClick={self.logoutBtnClick.bind(this)} className="logoutBtn">SIGN OUT</a></li>
                        : ""}
                        { this.props.currentUserId ?
                            <li>
                                <div className="navbar-accounts">
                                    <a href={FlowRouter.path('account/profile')}>
                                        <img className="circular-icon profileBtn" src={this.props.getProfilePic} width="40px" height="40px" />
                                        <span id="logged-in-display-name profileBtn">
                                                        {this.props.displayName}
                                        </span>
                                    </a>
                                </div>
                            </li>
                            :
                            <ul className="oval logedout-menu">
                                <li><a className="right-border showLoginDialog" onClick={self.showLoginDialogClick.bind(this)} href="javascript:;">SIGN IN</a></li>
                                <li><a href="javascript:;" onClick={self.showSignupDialogClick.bind(this)} className="showSignupDialog">SIGN UP</a></li>
                            </ul>
                        }
                    </ul>
                </div>
                        <div className="xs-menu visible-xs transition">
                            <div className="xs-menu-close-icon text-right">
                                <span className="sprite xs-close" />
                                </div>
                                <ul className="transition">
                                    <li><a href={FlowRouter.url('home')}>HOME / SEARCH</a></li>
                                    { this.props.currentUserId ?
                                        <li><a href={FlowRouter.path('account/profile')}>MY REFERENCES</a></li>
                                        : ""
                                    }
                                    <li><a href={FlowRouter.url('advertisewithus')}>LIST PROPERTY</a></li>
                                    { this.props.currentUserId ?
                                        <li><a href={FlowRouter.path('account/myProperties')}>MY PROPERTIES</a></li>
                                        : ""
                                    }
                                    <li><a href={FlowRouter.url('estateagent')}>AGENTS/LANDLORDS</a></li>
                                    <li><a href={FlowRouter.url('howitworks')}>HOW IT WORKS?</a></li>
                                    <li><a href={FlowRouter.url('faqs')}>FAQ</a></li>
                                    <li><a href={FlowRouter.url('contactus')}>CONTACT US</a></li>
                                    <li><a href={FlowRouter.url('careers')}>CAREERS</a></li>
                                    { this.props.currentUserId ?
                                        <li><a href="javascript:void(0);" onClick={self.logoutBtnClick.bind(this)}>SIGN OUT</a></li>
                                        : ""
                                    }
                                </ul>
                            </div>
                        </div>
                    </div>
                </section>


                <div id="errorModel" className="alert alert-danger " style={{display: 'none'}}></div>
                <div id="signin-div" className="signin1" style={{display: 'none'}}>
                    {this.props.showLoginDialog ? <LoginFormT/> : "" }
                </div>
    {this.NeedsCreateAlertPopup ? (
                <div id="create-alert-popup" style={{display: 'none'}} className={"verification-div1"}>
                    <div className="refund-div">
                        {this.state.newAlertCreateForm && !this.state.newAlertCreatedSuccessfully  ? (<h2>{EMAILALERT.heading}</h2>) : ""}
                        {this.state.newAlertCreatedSuccessfully && !this.state.newAlertCreateForm ? (<h2 className="green-text">Well Done! Alert Created.</h2>) : ""}
                    </div>
                    {this.state.newAlertCreateForm && !this.state.newAlertCreatedSuccessfully  ? (
                        <div className="profile-text">
                            <p className="color-text"
                               style={{textAlign: 'center', margin: '10px 0px', fontSize: '14px'}}>{EMAILALERT.para}</p>
                            <hr/>
                            <form className="signin-form" action="javascript:void(0);">

                                <div className="form-border">
                                    <div className="styled-input"><input type="text"
                                                                         placeholder="Enter your email address" id="emailAlertUserEmailAddress"
                                                                         required="required" style={{
                                        fontSize: '14px',
                                        marginBottom: '10px !important', borderBottom: 'none !important'
                                    }} value={this.state.emailAlertEmailAddress} onChange={this.emailAlertEmailAddressHandler}/></div>
                                </div>

                                <div className="signup-btn">
                                    <button onClick={this.emailAlertCreateBtnHandler} className="green-btn btns" type="submit" style={{width: '100%', marginTop: '10px'}}>
                                        {EMAILALERT.yesButtonText}
                                    </button>
                                </div>
                            </form>
                            <a href="javascript:void(0)" onClick={this.emailAlertNoThanksBtnHandler} className={'noThanks'}>No thanks, I'm happy to search myself</a>
                        </div>
                    ) : ""}
                    {this.state.newAlertCreatedSuccessfully  && !this.state.newAlertCreateForm ? (
                        <div className="profile-text">
                            {/*<p style={{color: '#ccac4c', paddingBottom: 0}}>Well Done! </p>*/}
                            <p className="color-text" style={{textAlign: 'center', margin: '10px 0px', fontSize: '13px'}}>We will
                                send you an email a day with new lettings. Be the first to apply for them. </p>
                            <iframe src="https://giphy.com/embed/fxsqOYnIMEefC" frameBorder={0} className="giphy-embed"
                                    allowFullScreen style={{width: '80%'}}/>
                        </div>
                    ) : ""}
                    {false ? (
                        <div className="profile-text">
                            <p className="green-text" style={{textAlign: 'center', margin: '10px 0px', color: 'black'}}>
                                You will now be notified of the new lettings in Dundrum of County Dubin.
                            </p>
                            <hr/>
                            <p className="color-text mar-top-20" style={{
                                textAlign: 'center',
                                margin: '20px 0px 10px', /* display: 'none', */
                                fontSize: '14px'
                            }}>Your active alerts are</p>
                            <table className="table table-bordered">
                                <thead>
                                <tr>
                                    <th style={{textAlign: 'center'}}>County</th>
                                    <th style={{textAlign: 'center'}}>Area</th>
                                    <th/>
                                </tr>
                                </thead>
                                <tbody style={{color: '#8b8b8b', fontSize: '14px'}}>
                                <tr>
                                    <td>Dublin</td>
                                    <td>All Areas</td>
                                    <td><a>Delete</a></td>
                                </tr>
                                <tr>
                                    <td>Limrick</td>
                                    <td>City Center North</td>
                                    <td><a>Delete</a></td>
                                </tr>
                                <tr>
                                    <td>Limrick</td>
                                    <td>Madison square</td>
                                    <td><a>Delete</a></td>
                                </tr>
                                </tbody>
                            </table>
                        </div>
                    ) : ""}
                </div>
    ) : ""}

            </div>

        );
        }
};
export default withTracker(() => {

    var showCookieConsent = false;
    var errorModel = false;
    var showLoginDialog = false;
    if(Meteor.isClient) {
        if (Session.get('loginFlowComplete')) {
            setTimeout(function () {
                Session.set('loginFlowComplete', undefined);
            }, 1000)
        }

        ///////////////////// errorModel start
        var tmp = Session.get("showErrorDlg");
        if (!tmp) tmp = [];
        if (tmp)
            if (tmp.length) {
                var timeoutVal = 0;
                if (!$.fancybox) timeoutVal = 3000;
                let tmpHTML = ''
                for(let j=0;j<tmp.length;j++){
                    tmpHTML += '<p>'+tmp[j]+'</p>'
                }
                $('#errorModel').html(tmpHTML);
                setTimeout(function () {
                    $.fancybox({
                        'padding': 0,
                        'href': '#errorModel',
                        // afterShow:function(template){
                        //     setTimeout(function () {
                        //         $.fancybox.close();
                        //     },3000)
                        // },
                        afterClose: function () {
                            var tmp = Session.get("showErrorDlg");
                            if (!tmp) tmp = [];
                            tmp.shift();
                            Session.set("showErrorDlg", tmp)
                        }
                    })
                }, timeoutVal)

            }
        ///////////////////// showLoginDialog start
        if (Session.get('showLoginSignupFancyBoxDialog')) {
            showLoginPopup()
        } else {
            if ($)
                if ($.fancybox)
                    $.fancybox.close();
        }
        ///////////////////// showCreateAlertPopup start
        if (Session.get('showCreateAlertPopup')) {
            showCreateAlertPopup();
        }
        // else {//No need for any control over its closing.
        //     if ($)
        //         if ($.fancybox)
        //             $.fancybox.close();
        // }

        showCookieConsent = !parseInt(readCookie('cookieConsent'))
        errorModel= Session.get("showErrorDlg")
        showLoginDialog= Session.get("showLoginDialog")
    }

    var user= Meteor.user();
    ///////////////////// displayName start
    var displayName = "Guest";
    try{
        if (user) {
            if (user.profile && user.profile.name) {
                displayName = user.profile.name;
            }
        }
    }catch (e){}
    ///////////////////// getProfilePic start
    var getProfilePic = cdnPath("/images/user-img.png");
    try{
        if (user.profile.picture)
        {
            if(user.services.facebook)
                if(user.services.facebook.indexOf('?width=40')==-1)
                    getProfilePic = user.profile.picture+"?width=40"; //@BCompatibility : adding ?width=40 to it

            getProfilePic = user.profile.picture;
        }
    }catch (e){}


    return {
        showCookieConsent: showCookieConsent,
        currentUserId: Meteor.userId(),
        errorModel: errorModel,
        showLoginDialog: showLoginDialog,
        displayName: displayName,
        currentUser: Meteor.user(),
    };
})(MainLayoutHeader);

class LoginFormMessages extends Component {
    render() {
        return (
            <div>
                { this.props.messages ?
                    (
                        <div>
                        {this.props.messages.info ?
                            this.props.messages.info.map((item, i) => {
                                return (
                                    <div className="changePwdAlertMsgs alert alert-info" role="alert" key={i}>
                                        <span className="glyphicon glyphicon-info-sign" aria-hidden="true"></span>&nbsp; {item.reason}
                                    </div>
                                )
                            })
                        :""}
                        {this.props.messages.warning ?
                            this.props.messages.warning.map((item, i) => {
                                return (
                                <div className="changePwdAlertMsgs alert alert-warning" role="alert" key={i}>
                                    <span className="glyphicon glyphicon-warning-sign" aria-hidden="true"></span>&nbsp; {item.reason}
                                </div>
                                )
                            })
                        :""}
                            {this.props.messages.success ?
                                this.props.messages.success.map((item, i) => {
                                    return (
                                        <div className="changePwdAlertMsgs alert success" role="alert" key={i}>
                                            <span className="glyphicon glyphicon-ok" aria-hidden="true"></span>&nbsp; {item.reason}
                                        </div>
                                    )
                                })
                            :""}
                            {this.props.messages.errors ?
                                this.props.messages.errors.map((item, i) => {
                                    return (
                                        <div className="changePwdAlertMsgs alert alert-danger" role="alert" key={i}>
                                            <span className="glyphicon glyphicon-exclamation-sign" aria-hidden="true"></span>&nbsp; {item.reason}
                                        </div>
                                    )
                                })
                            :""}

                        </div>
                    )
                :""
                }
            </div>

        );
    }
};

class LoginForm extends Component {
    constructor(props){
        super(props);
        this.state = {
            showForgotForm : props.showForgotForm ? true : false,
            showSignupForm : props.showSignupForm ? true : false,
            isLandLordMode : props.isLandLordMode ? true : false,
            loginFromApplyNowBtn : props.loginFromApplyNowBtn ? true : false
        }
    }
    showForgotFormHandler(){
        this.setState({showForgotForm:true});
        this.setState({showSignupForm:false});
        this.setState({isLandLordMode:false});
    }
    showSignupFormHandler(){
        this.setState({showForgotForm:false});
        this.setState({showSignupForm:true});
        this.setState({isLandLordMode:false});
    }
    showSignInFormHandler(){
        this.setState({showForgotForm:false});
        this.setState({showSignupForm:false});
        this.setState({isLandLordMode:false});
    }
    showLandlordViewHandler(){
        this.setState({showForgotForm:false});
        this.setState({showSignupForm:true});
        this.setState({isLandLordMode:true});
    }
    render() {
        return (
            <div className="loginForm">
                {
                    this.state.showForgotForm ?
                        <LoginFormResetPasswordView onPage={false} showSignInFormHandler={this.showSignInFormHandler.bind(this)}/>
                    :
                        this.state.showSignupForm ?
                            this.state.isLandLordMode ?
                                <LoginFormSignUpViewLandlord onPage={false} showSignInFormHandler={this.showSignInFormHandler.bind(this)}/>
                            :
                                <LoginFormSignUpView loginFromApplyNowBtn={this.state.loginFromApplyNowBtn} onPage={false} showSignInFormHandler={this.showSignInFormHandler.bind(this)}/>
                        :
                            <LoginFormSignInView loginFromApplyNowBtn={this.state.loginFromApplyNowBtn} onPage={false} showSignupFormHandler={this.showSignupFormHandler.bind(this)} showForgotFormHandler={this.showForgotFormHandler.bind(this)}/>

                }
            </div>
        );
    }
};
LoginFormT = withTracker(() => {
    var ret = {}
    if(Meteor.isClient){
        ret.showSignupForm = Session.get('showSignupForm')
        ret.showForgotForm = Session.get('showForgotForm')
        ret.isLandLordMode = Session.get('isLandLordMode')
        ret.loginFromApplyNowBtn = Session.get('loginFromApplyNowBtn')
    }
    return ret;
})(LoginForm);

class LoginPage extends Component {
    render() {
        return (
            <section className="mar-top-20 no-print">
                <div className="container">
                    <div className="filter-holder">
                        <div className="head-border-bottom">
                            <LoginFormT/>
                        </div>
                    </div>
                </div>
            </section>
        );
    }
};

class SocialLoginButtons extends Component {
    componentWillMount(){
        if(Meteor.isClient){
            Session.set('loginFlowStart',true)
            Session.set('loginFlowComplete', undefined)
            delete Session.keys.loginFlowComplete
        }
        this.state = {
            errorMessages : {}
        }
        this.dontShow = true
        this.buttonForText = '';
        switch(this.props.buttonFor){
            case 'login': this.buttonForText = 'Login';break;
            case 'signup': this.buttonForText = 'Signup';break;
            default: this.buttonForText = 'Login / Signup';
        }
        this.handleFBLogin = this.handleFBLogin.bind(this)
        this.handleTwitterLogin = this.handleTwitterLogin.bind(this)
        this.handleGoogleLogin = this.handleGoogleLogin.bind(this)
        this.handleLinkedInLogin = this.handleLinkedInLogin.bind(this)
    }

    handleFBLogin(event) {
        this.setState({errorMessages:{}})
        this.FBCallback = function(err){
            switch(this.props.buttonFor){
                case 'login':
                    fbq('track', 'FBUserLogin'+ (err ? "Failed" : "Successful"));
                    ga('send', 'event', 'General', 'userLoginSignup', 'FB Login '+ (err ? "Failed" : "Successful"));
                    break;
                case 'signup':
                    fbq('track', 'FBUserSignup'+ (err ? "Failed" : "Successful"));
                    ga('send', 'event', 'General', 'userLoginSignup', 'FB Signup '+ (err ? "Failed" : "Successful"));
                    break;
                default:
                    fbq('track', 'FBUserLoginSignup'+ (err ? "Failed" : "Successful"));
                    ga('send', 'event', 'General', 'userLoginSignup', 'FB LoginSignup '+ (err ? "Failed" : "Successful"));
                    break;
            }
            if (err) {
                console.log(err)
                var msg = 'Connect with Facebook failed. ';
                if(err.errorType=='Accounts.LoginCancelledError')msg += 'Seems like attempt was cancelled. ';
                else if(err.error=='account-exists'){
                    msg += err.reason+' ';
                }else if(err.message)msg += err.message+'. ';
                msg += "Please try again. Contact us if needed.";
                var errors = []
                errors.push( {
                    "error": "SOCIALLOGIN_FAIL",
                    "reason": msg
                })
                this.setState({errorMessages:{errors: errors}})
            }else{
                if(this.props.usedInDlg){
                    Session.set('showLoginSignupFancyBoxDialog',false)
                    Session.set('showForgotForm',false)
                    Session.set('showSignupForm',true)
                    Session.set('showLoginDialog',true)
                }
                Session.set('loginFlowComplete', true)
                Session.set('loginFlowStart',undefined)
                delete Session.keys.loginFlowStart
            }
        }
        this.FBCallback = this.FBCallback.bind(this)
        Meteor.loginWithFacebook({}, this.FBCallback);
    }

    handleTwitterLogin(event) {
        this.setState({errorMessages:{}})
        this.TwitterCallback = function(err){
            switch(this.props.buttonFor){
                case 'login':
                    fbq('track', 'TwitterUserLogin'+ (err ? "Failed" : "Successful"));
                    ga('send', 'event', 'General', 'userLoginSignup', 'Twitter Login '+ (err ? "Failed" : "Successful"));
                    break;
                case 'signup':
                    fbq('track', 'TwitterUserSignup'+ (err ? "Failed" : "Successful"));
                    ga('send', 'event', 'General', 'userLoginSignup', 'Twitter Signup '+ (err ? "Failed" : "Successful"));
                    break;
                default:
                    fbq('track', 'TwitterUserLoginSignup'+ (err ? "Failed" : "Successful"));
                    ga('send', 'event', 'General', 'userLoginSignup', 'Twitter LoginSignup '+ (err ? "Failed" : "Successful"));
                    break;
            }
            if (err) {
                console.log(err)
                var msg = 'Connect with Twitter failed. ';
                if(err.errorType=='Accounts.LoginCancelledError')msg += 'Seems like attempt was cancelled. ';
                else if(err.error=='account-exists'){
                    msg += err.reason+' ';
                }else if(err.message)msg += err.message+'. ';
                msg += "Please try again. Contact us if needed.";
                var errors = []
                errors.push( {
                    "error": "SOCIALLOGIN_FAIL",
                    "reason": msg
                })
                this.setState({errorMessages:{errors: errors}})
            }else{
                if(this.props.usedInDlg){
                    Session.set('showLoginSignupFancyBoxDialog',false)
                    Session.set('showForgotForm',false)
                    Session.set('showSignupForm',true)
                    Session.set('showLoginDialog',true)
                }
                Session.set('loginFlowComplete', true)
                Session.set('loginFlowStart',undefined)
                delete Session.keys.loginFlowStart
            }
        }
        this.TwitterCallback = this.TwitterCallback.bind(this)
        Meteor.loginWithTwitter({}, this.TwitterCallback);
    }

    handleGoogleLogin(event) {
        this.setState({errorMessages:{}})
        this.GoogleCallback = function(err){
            switch(this.props.buttonFor){
                case 'login':
                    fbq('track', 'GoogleUserLogin'+ (err ? "Failed" : "Successful"));
                    ga('send', 'event', 'General', 'userLoginSignup', 'Google Login '+ (err ? "Failed" : "Successful"));
                    break;
                case 'signup':
                    fbq('track', 'GoogleUserSignup'+ (err ? "Failed" : "Successful"));
                    ga('send', 'event', 'General', 'userLoginSignup', 'Google Signup '+ (err ? "Failed" : "Successful"));
                    break;
                default:
                    fbq('track', 'GoogleUserLoginSignup'+ (err ? "Failed" : "Successful"));
                    ga('send', 'event', 'General', 'userLoginSignup', 'Google LoginSignup '+ (err ? "Failed" : "Successful"));
                    break;
            }
            if (err) {
                console.log(err)
                var msg = 'Connect with Google failed. ';
                if(err.errorType=='Accounts.LoginCancelledError')msg += 'Seems like attempt was cancelled. ';
                else if(err.error=='account-exists'){
                    msg += err.reason+' ';
                }else if(err.message)msg += err.message+'. ';
                msg += "Please try again. Contact us if needed.";
                var errors = []
                errors.push( {
                    "error": "SOCIALLOGIN_FAIL",
                    "reason": msg
                })
                this.setState({errorMessages:{errors: errors}})
            }else{
                if(this.props.usedInDlg){
                    Session.set('showLoginSignupFancyBoxDialog',false)
                    Session.set('showForgotForm',false)
                    Session.set('showSignupForm',true)
                    Session.set('showLoginDialog',true)
                }
                Session.set('loginFlowComplete', true)
                Session.set('loginFlowStart',undefined)
                delete Session.keys.loginFlowStart
            }
        }
        this.GoogleCallback = this.GoogleCallback.bind(this)
        Meteor.loginWithGoogle({}, this.GoogleCallback);
    }

    handleLinkedInLogin(event) {
        this.setState({errorMessages:{}})
        this.LinkedInCallback = function(err){
            switch(this.props.buttonFor){
                case 'login':
                    fbq('track', 'LinkedInUserLogin'+ (err ? "Failed" : "Successful"));
                    ga('send', 'event', 'General', 'userLoginSignup', 'LinkedIn Login '+ (err ? "Failed" : "Successful"));
                    break;
                case 'signup':
                    fbq('track', 'LinkedInUserSignup'+ (err ? "Failed" : "Successful"));
                    ga('send', 'event', 'General', 'userLoginSignup', 'LinkedIn Signup '+ (err ? "Failed" : "Successful"));
                    break;
                default:
                    fbq('track', 'LinkedInUserLoginSignup'+ (err ? "Failed" : "Successful"));
                    ga('send', 'event', 'General', 'userLoginSignup', 'LinkedIn LoginSignup '+ (err ? "Failed" : "Successful"));
                    break;
            }
            if (err) {
                console.log(err)
                var msg = 'Connect with LinkedIn failed. ';
                if(err.errorType=='Accounts.LoginCancelledError')msg += 'Seems like attempt was cancelled. ';
                else if(err.error=='account-exists'){
                    msg += err.reason+' ';
                }else if(err.message)msg += err.message+'. ';
                msg += "Please try again. Contact us if needed.";
                var errors = []
                errors.push( {
                    "error": "SOCIALLOGIN_FAIL",
                    "reason": msg
                })
                this.setState({errorMessages:{errors: errors}})
            }else{
                if(this.props.usedInDlg){
                    Session.set('showLoginSignupFancyBoxDialog',false)
                    Session.set('showForgotForm',false)
                    Session.set('showSignupForm',true)
                    Session.set('showLoginDialog',true)
                }
                Session.set('loginFlowComplete', true)
                Session.set('loginFlowStart',undefined)
                delete Session.keys.loginFlowStart
            }
        }
        this.LinkedInCallback = this.LinkedInCallback.bind(this)
        Meteor.loginWithLinkedIn({}, this.LinkedInCallback);
    }
    
    render() {
        const self = this;
        return (
            <div>
                <div onClick={self.handleFBLogin} id="facebook-login" className="blue-btn btns social-button" data-max-rows="1" data-size="medium" data-show-faces="false" data-auto-logout-link="false">{this.buttonForText} with Facebook</div>
                <div onClick={self.handleTwitterLogin} id="twitter-login" style={{marginTop: '10px'}} className="blue-btn btns social-button" data-max-rows="1" data-size="medium" data-show-faces="false" data-auto-logout-link="false">{this.buttonForText} with Twitter</div>
                <div onClick={self.handleGoogleLogin} id="google-login" style={{marginTop: '10px'}} className="blue-btn btns social-button" data-max-rows="1" data-size="medium" data-show-faces="false" data-auto-logout-link="false">{this.buttonForText} with Google</div>
                {this.dontShow ? "" :
                <div onClick={self.handleLinkedInLogin} id="linkedin-login" style={{marginTop: '10px'}} className="blue-btn btns social-button" data-max-rows="1" data-size="medium" data-show-faces="false" data-auto-logout-link="false">Login with LinkedIn</div>
                }

                <br/>
                <LoginFormMessages messages={this.state.errorMessages} />
                <br/>
            </div>
        );
    }
};
SocialLoginButtonsT = withTracker(() => {
    var ret = {}
    if(Meteor.isClient){
        ret.showSignupForm = Session.get('showSignupForm')
        ret.showForgotForm = Session.get('showForgotForm')
    }
    ret.user = Meteor.user()
    return ret;
})(SocialLoginButtons);

class LoginFormHorizontal extends Component {
    constructor(props){
        super(props);
        this.state = {
            showForgotForm : props.showForgotForm ? true : false,
            isLandLordMode : props.isLandLordMode ? true : false
        }
    }
    showForgotFormHandler(){
        this.setState({showForgotForm:true});
    }
    showSignInFormHandler(){
        this.setState({showForgotForm:false});
    }
    componentDidMount(){
        if(this.props.user) Session.set('loginFlowComplete', true)//todo: check this
    }
    render() {
        return (
            <div className="loginForm onpageSignin-form">
                <div className="row">
                    <SocialLoginButtonsT/>
                </div>
                <div className="row text-center">
                    <div className="col-md-6 col-sm-12">
                        {
                            this.state.showForgotForm ?
                                <LoginFormResetPasswordView onPage={true} showSignInFormHandler={this.showSignInFormHandler.bind(this)}/>
                                :
                                <LoginFormSignInView  onPage={true} showForgotFormHandler={this.showForgotFormHandler.bind(this)}/>
                        }
                    </div>
                    <div className="col-md-6 col-sm-12">
                        {
                            this.state.isLandLordMode ?
                                <LoginFormSignUpViewLandlord onPage={true}/>
                                :
                                <LoginFormSignUpView  onPage={true}/>
                        }
                    </div>
                </div>
            </div>
        );
    }
};
LoginFormHorizontalT = withTracker(() => {
    var ret = {}
    ret.user = Meteor.user()
    return ret;
})(LoginFormHorizontal);

class LoginPageHorizontal extends Component {
    render() {
        return (
        <section className="mar-top-20 mar-btm-20 no-print loginPageHorizontal">
            <div className="container">
                <div className="filter-holder">
                    <div className="head-border-bottom">
                        <LoginFormHorizontalT/>
                    </div>
                </div>
            </div>
        </section>
            
        );
    }
};

export {
    LoginFormHorizontalT,
    SocialLoginButtonsT,
    LoginPage,
    LoginPageHorizontal,
    LoginFormT,
    LoginFormMessages
}