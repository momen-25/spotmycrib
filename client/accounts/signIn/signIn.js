// import "/signIn.html";
import "../helpers.js";
import "../validation.js";

Template.loginFormSignInView.onCreated(() => {
  let template = Template.instance();
  // template.uniqueId = Random.id();
  template.formMessages = new ReactiveVar({});
  template.loginFailedError = new ReactiveVar(false);
  template.isLoading = new ReactiveVar(true);
});

Template.loginFormSignInView.onRendered( function(){

  $('#signin-div').find('#email').focus();
  $('.new-focus').click(function(){
    $('#signin-div').find('#email').focus();
  });
    Template.instance().isLoading.set(false)

});
Template.loginFormSignInView.helpers(LoginFormSharedHelpers);

/**
 * Events: Login form sign in view
 */
Template.loginFormSignInView.events({

  /**
   * Submit sign in form
   * @param  {Event} event - jQuery Event
   * @param  {Template} template - Blaze Template
   * @return {void}
   */
  "click [data-event-action=signUp]": function (event, template) {

      Session.set('showForgotForm',false)
      Session.set('showSignupForm',true)
      Session.set('showLoginSignupFancyBoxDialog',true)
      Session.set('showLoginDialog',true)
  },
  "click [data-event-action=forgotPassword]": function (event, template) {
      var isOnPage = false;
      if(template.data)if(template.data.onPage)isOnPage = true;
      if( !isOnPage ){
          Session.set('showForgotForm',true)
          Session.set('showSignupForm',false)
          Session.set('showLoginSignupFancyBoxDialog',true)
          Session.set('showLoginDialog',true)
      }else{
          Session.set('showForgotForm',true)
      }
  },
  "submit form": (event, template) => {
      console.log("jns")
    event.preventDefault();

    let usernameInput = template.$(".login-input-email");
    let passwordInput = template.$(".login-input-password");

    let username = usernameInput.val().trim();
    let password = passwordInput.val().trim();

    let validatedEmail = LoginFormValidation.email(username);
    let validatedPassword = LoginFormValidation.password(password, {validationLevel: "exists"});

    let templateInstance = Template.instance();
    var errors = []

    templateInstance.formMessages.set({});
    templateInstance.isLoading.set(true);
    templateInstance.loginFailedError.set(false);

    if (validatedEmail !== true) {
      errors.push(validatedEmail);
    }

    if (validatedPassword !== true) {
      errors.push(validatedPassword);
    }

    if (errors.length) {
      templateInstance.formMessages.set({
          errors: errors
      });
      // prevent signup
      templateInstance.isLoading.set(false)
      return;
    }

    Meteor.loginWithPassword(username, password, (error) => {

        templateInstance.isLoading.set(false)
      if (error) {
          console.log(error)
          templateInstance.loginFailedError.set(true);
            debugger;
          if(error.reason=='User has no password set' || error.reason=='User not found'){
              Meteor.call('isSocialAccount',username,function (err1,result) {
                  if(err1)  templateInstance.formMessages.set({
                      errors: [err1]
                  });
                  else  templateInstance.formMessages.set({
                      info: [result]
                  });
              })
          }

        // Show some error messages above the form fields
        templateInstance.formMessages.set({
          errors: [error]
        });
      } else {
            var isOnPage = false;
            if(templateInstance.data)if(templateInstance.data.onPage)isOnPage = true;
            if( !isOnPage ){
                $('#signin-div , .fancybox-overlay').hide()
                Session.set('showLoginDialog',false)
                Session.set('showSignupDialog',false)
                Session.set('showLoginSignupFancyBoxDialog',false)
            }
            Session.set('loginFlowComplete', true)
            Session.set('loginFlowStart',undefined)
            delete Session.keys.loginFlowStart
            Meteor.call("userLoggedIn");
      }
    });
  }
});
