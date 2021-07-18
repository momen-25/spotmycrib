// import "./forgot.html";
import "../helpers.js";
import "../validation.js";

Template.loginFormResetPasswordView.events({

  /**
   * Submit the password reset form
   * @param {Event} event - jQuery Event
   * @param {Object} template - Blaze Template
   * @return {void}
   */
  "click .tryAgainBtn":function(){
      Template.instance().showForm.set(true);
  },
  "click .contactusBtn":function(){
        if($)
            if($.fancybox)
                $.fancybox.close();
  },
  "click [data-event-action=signIn]": function (event, template) {
      var isOnPage = false;
      if(template.data)if(template.data.onPage)isOnPage = true;
      if( !isOnPage ){
          Session.set('showForgotForm',false)
          Session.set('showSignupForm',false)
          Session.set('showLoginSignupFancyBoxDialog',true)
          Session.set('showLoginDialog',true)
      }else{
          Session.set('showForgotForm',false)
      }
  },
  "submit form": (event, template) => {
    event.preventDefault();

    let emailAddress = template.$(".login-input-email").val().trim();
    let validatedEmail = LoginFormValidation.email(emailAddress);
    let templateInstance = Template.instance();

    var errors = []

    templateInstance.formMessages.set({});
    templateInstance.isLoading.set(true);

    if (validatedEmail !== true) {
      errors.push(validatedEmail);
    }

    if (errors.length) {
      templateInstance.formMessages.set({
          errors: errors
      });
      // prevent signup
      templateInstance.isLoading.set(false)
      return;
    }



    Accounts.forgotPassword({ email: emailAddress}, (error) => {
        templateInstance.isLoading.set(false)
      // Show some message confirming result
      if (error) {
        console.log(error)
        templateInstance.formMessages.set({
          errors: [error]
        });
      } else {

        templateInstance.showForm.set(false)

        templateInstance.formMessages.set({
          info: [{
            reason:  "Password reset mail sent."
          }]
        });
      }
    });
  }

});


/**
 * loginFormResetPasswordView
 *
 */
Template.loginFormResetPasswordView.onCreated(() => {
  let template = Template.instance();

  // template.uniqueId = Random.id();
  template.formMessages = new ReactiveVar({});
  template.showForm = new ReactiveVar(true);
  template.isLoading = new ReactiveVar(true);
});

Template.loginFormResetPasswordView.onRendered( function(){

    $('#signin-div').find('#email').focus();
    $('.new-focus').click(function(){
        $('#signin-div').find('#email').focus();
    });

    Template.instance().isLoading.set(false)

});

Template.loginFormResetPasswordView.helpers(LoginFormSharedHelpers);
