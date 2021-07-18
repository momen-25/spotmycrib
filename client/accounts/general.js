import {Template} from "meteor/templating";

Template.loginForm.helpers({
    showSignupForm: function () {
        return Session.get('showSignupForm');
    },
    showForgotForm: function () {
        return Session.get('showForgotForm');
    },
    isLandLordMode: function () {
        return Session.get('isLandLordMode');
    }
})
Template.socialLoginButtons.onCreated(function(){
    Session.set('loginFlowStart',true)
    Session.set('loginFlowComplete', undefined)
    delete Session.keys.loginFlowComplete
    this.errorMessages = new ReactiveVar({});
})
Template.socialLoginButtons.helpers({
    showSignupForm: function () {
        return Session.get('showSignupForm');
    },
    showForgotForm: function () {
        return Session.get('showForgotForm');
    },
    errorMessages:function () {
        return Template.instance().errorMessages.get();
    },
    buttonForText:function () {
        var buttonFor;
        if(Template.instance().data) buttonFor =  Template.instance().data.buttonFor;
        switch(buttonFor){
            case 'login': return 'Login';
            case 'signup': return 'Signup';
            default: return 'Login / Signup';
        }
    }
})
Template.socialLoginButtons.events({
    'click #facebook-login': function(event) {
        let templateInstance = Template.instance();
        templateInstance.errorMessages.set({})
        Meteor.loginWithFacebook({}, function(err){
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
                templateInstance.errorMessages.set({
                    errors: errors
                });
            }else{
                if(templateInstance.data.usedInDlg){
                    Session.set('showLoginSignupFancyBoxDialog',false)
                    Session.set('showForgotForm',false)
                    Session.set('showSignupForm',true)
                    Session.set('showLoginDialog',true)
                }
                Session.set('loginFlowComplete', true)
                Session.set('loginFlowStart',undefined)
                delete Session.keys.loginFlowStart
            }
        });
    },
    'click #twitter-login': function(event) {
        let templateInstance = Template.instance();
        templateInstance.errorMessages.set({})
        Meteor.loginWithTwitter({}, function(err){
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
                templateInstance.errorMessages.set({
                    errors: errors
                });
            }else{
                if(templateInstance.data.usedInDlg){
                    Session.set('showLoginSignupFancyBoxDialog',false)
                    Session.set('showForgotForm',false)
                    Session.set('showSignupForm',true)
                    Session.set('showLoginDialog',true)
                }
                Session.set('loginFlowComplete', true)
                Session.set('loginFlowStart',undefined)
                delete Session.keys.loginFlowStart
            }
        });
    },
    'click #google-login': function(event) {
        let templateInstance = Template.instance();
        templateInstance.errorMessages.set({})
        Meteor.loginWithGoogle({}, function(err){
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
                templateInstance.errorMessages.set({
                    errors: errors
                });
            }else{
                if(templateInstance.data.usedInDlg){
                    Session.set('showLoginSignupFancyBoxDialog',false)
                    Session.set('showForgotForm',false)
                    Session.set('showSignupForm',true)
                    Session.set('showLoginDialog',true)
                }
                Session.set('loginFlowComplete', true)
                Session.set('loginFlowStart',undefined)
                delete Session.keys.loginFlowStart
            }
        });
    },
    'click #linkedin-login': function(event) {
        let templateInstance = Template.instance();
        templateInstance.errorMessages.set({})
        Meteor.loginWithLinkedIn({}, function(err){
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
                templateInstance.errorMessages.set({
                    errors: errors
                });
            }else{
                if(templateInstance.data.usedInDlg){
                    Session.set('showLoginSignupFancyBoxDialog',false)
                    Session.set('showForgotForm',false)
                    Session.set('showSignupForm',true)
                    Session.set('showLoginDialog',true)
                }
                Session.set('loginFlowComplete', true)
                Session.set('loginFlowStart',undefined)
                delete Session.keys.loginFlowStart
            }
        });
    }
});
Template.loginPageHorizontal.onCreated(function(){
    var instance = this;
    instance.isTempLoaded = new ReactiveVar(false);
    instance.autorun(function(){
        instance.subscribe('userData');
        if(instance.subscriptionsReady()){
            instance.isTempLoaded.set(true)
        }
    })

})
Template.loginPageHorizontal.helpers({
    isTemplateLoaded:function(){
        return Template.instance().subscriptionsReady();
    }
})
Template.loginFormHorizontal.helpers({
    showForgotForm:function () {
        return Session.get('showForgotForm');
    },
    isLandLordMode: function () {
        var mode = '';
        if(Template.instance().data)mode = Template.instance().data.isLandLordMode;
        return mode;
        // return Session.get('isLandLordMode');
    }
})
Template.loginFormHorizontal.onRendered(function(){
    var user = Meteor.user();//when u load this form if the user is alredy loggedin then throw an event.
    if(user) Session.set('loginFlowComplete', true)
})
