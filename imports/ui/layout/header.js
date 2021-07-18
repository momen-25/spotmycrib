/**
 * Created by srikanth681 on 18/02/16.
 */
import {Template} from "meteor/templating";
import "./header.html";


Template.headerExtended.onRendered(function(){

    $.getScript(cdnPath('/js/bootstrap.js'), function(){
        // console.log("Bootstrap loaded")
    });
    // $.getScript(cdnPath('//static.filestackapi.com/filestack-js/1.x.x/filestack.min.js'), function(){
    //     console.log("Filestack loaded")
    // });

    $.getScript('plugins/fancybox/js/jquery.fancybox.js', function(){
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
    setTimeout(delayedFunctions,1500)
})
isMobileMenuEventAttached = false;
function delayedFunctions() {
    // $('.xs-menu-icon').click(function(){
    //     $('.xs-menu').addClass('slide-right');
    // });
    // $('.xs-menu-close-icon, .xs-menu a').click(function(){
    //     $('.xs-menu').removeClass('slide-right');
    // });

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
Template.headerExtended.onCreated(function(){
    Session.set('showLoginDialog',false)
    Session.set('showForgotForm',false)
    Session.set('showLoginDialog',false)
    Session.set('showLoginSignupFancyBoxDialog',false)
    Session.set('showAddPropertyHeaderTemplate',false)
    Session.set('showAddPropertyHeaderFancyBoxDialog',false)
    if( !Session.get("showErrorDlg") ) Session.set("showErrorDlg",[]);
})
Template.headerExtended.helpers({
    loginFlowCompleteManager:function(){
        if(Session.get('loginFlowComplete')){
            setTimeout(function(){
                Session.set('loginFlowComplete',undefined);
            },1000)
        }
    },
    errorModel: function(){
        var tmp =  Session.get("showErrorDlg");if(!tmp)tmp=[];
        if(tmp)
            if(tmp.length){
                var timeoutVal = 0;
                if(!$.fancybox) timeoutVal = 3000;
                setTimeout(function () {
                    $.fancybox({
                        'padding': 0,
                        'href': '#errorModel',
                        // afterShow:function(template){
                        //     setTimeout(function () {
                        //         $.fancybox.close();
                        //     },3000)
                        // },
                        afterClose:function(){
                            var tmp =  Session.get("showErrorDlg");if(!tmp)tmp=[];
                            tmp.shift();
                            Session.set("showErrorDlg",tmp)
                        }
                    })
                },timeoutVal)

            }
        return Session.get("showErrorDlg");
    },
    showAddPropertyHeaderTemplate: function(){

        if(Session.get('showAddPropertyHeaderFancyBoxDialog') ){
            showAddPropertyHeaderPopup()
        }else{
            if($)
                if($.fancybox)
                    $.fancybox.close();
        }

        return Session.get('showAddPropertyHeaderTemplate');
    },
    showLoginDialog: function(){//Reason to create this method is for the lazyloading of signIn and signUp templates

        if(Session.get('showLoginSignupFancyBoxDialog') ){
            showLoginPopup()
        }else{
            if($)
                if($.fancybox)
                    $.fancybox.close();
        }

        return Session.get('showLoginDialog');
    },
    isAgentRole:function () {
        var user = Meteor.user();
        if(!user)return false;
        if( user.profile.role == 'agent'){return true;}
        return false;
    },
    showCookieConsent: function(){
        return !parseInt(readCookie('cookieConsent'));
        // var userConfig = Session.get('userConfig');
        // if(!userConfig) return false;
        // return userConfig.cookieConsent;
    }
})
Template.headerExtended.events({
    "click .showLoginDialog": function (event, template) {
        showLoginDialog();
    },
    "click .showSignupDialog": function (event, template) {
        showSignupDialog();
    },
    "click .logoutBtn":function () {
        Meteor.logout(function(err){
            if (err) {
                throw new Meteor.Error("Logout failed");
            }
        })
    },
    "click .addPropertyHeaderBtn":function(){
        FlowRouter.go('advertisewithus')
        console.log("added add property form");
        // Session.set('showAddPropertyHeaderTemplate',true)
        //        Session.set('showAddPropertyHeaderFancyBoxDialog',true)
    },
    "click .profileBtn":function () {
        FlowRouter.go('account/profile');
    },
    "click .cookieConsentBtn":function () {
        createCookie('cookieConsent',1,365);
        $('.cookieConsentArea').remove();
        // var userConfig = Session.get('userConfig');
        //
        // if(!userConfig){
        //     Session.set('userConfig',{cookieConsent:1})
        // }else if(!userConfig.cookieConsent){
        //     Session.set('userConfig',{cookieConsent:1})
        // }
    }
})

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
    $.fancybox({
        'padding': 0,
        'href': '#signin-div',

        afterClose:function(template){
            console.log(template);
            //template.showLoginDialog.set(false);
            Session.set('isLandLordMode',false)
            Session.set('showLoginDialog',false)
            Session.set('showLoginSignupFancyBoxDialog',false)

        }
    })
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
