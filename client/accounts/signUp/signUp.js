// import "./signUp.html";
import "../helpers.js";
import "../validation.js";


Template.loginFormSignUpView.onCreated(() => {
  let template = Template.instance();

  // template.uniqueId = Random.id();
  template.formMessages = new ReactiveVar({});
  template.type = "signUp";
  template.isOTPverified =  new ReactiveVar(false);
  template.isLoading = new ReactiveVar(true);
});

Template.loginFormSignUpView.onRendered( function(){
// This is the new 1 line code I have added
  this.$(".SignupFormMobileField").intlTelInput({
    preferredCountries:["ie","gb",'in']
  });

 $('#signin-div').find('#name').focus();
  $('.new-focus').click(function(){
    $('#signin-div').find('#name').focus();
  });
    Template.instance().isLoading.set(false)

});

Template.loginFormSignUpView.helpers(LoginFormSharedHelpers);


/**
 * Events: Login form sign up view
 */
Template.loginFormSignUpView.events({
  /**
   * Submit sign up form
   * @param  {Event} event - jQuery Event
   * @param  {Template} template - Blaze Template
   * @return {void}
   */
  "click [data-event-action=signIn]": function (event, template) {
      Session.set('showForgotForm',false)
      Session.set('showSignupForm',false)
      Session.set('showLoginSignupFancyBoxDialog',true)
      Session.set('showLoginDialog',true)
  },
  "submit form": function (event, template) {
    event.preventDefault();

    // var usernameInput = template.$(".login-input--username");
    let emailInput = template.$(".login-input-email");
    let passwordInput = template.$(".login-input-password");
    let fullNameInput = template.$(".login-input-fullName");
    let mobileInput = template.$(".login-input-mobile");

    let email = emailInput.val().trim();
    let password = passwordInput.val().trim();
    let fullName = fullNameInput.val().trim();
    let mobile = mobileInput.val().trim();
    // mobile = mobileInput.intlTelInput("getNumber");//not working
    // mobileInput.val();

    let validatedEmail = LoginFormValidation.email(email);
    let validatedFullName = LoginFormValidation.username(fullName);
    let validatedPassword = LoginFormValidation.password(password, {validationLevel: "length"});
    let validatedMobile = LoginFormValidation.mobile(mobile);

    let templateInstance = Template.instance();
    var errors = []

    templateInstance.formMessages.set({});
    templateInstance.isLoading.set(true);


    if (validatedEmail !== true) {
        errors.push(validatedEmail);
    }

    if (validatedFullName !== true) {
        errors.push(validatedFullName);
    }

    if (validatedMobile !== true) {
        errors.push(validatedMobile);
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

    //if(!templateInstance.isOTPverified.get()){
    //  //Show OTP screen
    //
    //}


    let newUserData = {
      // username: username,
      email: email,
      password: password,
      profile:{
        name:fullName,
        email: email,
        mobile:mobile
      }
    };

    Accounts.createUser(newUserData, function (error, result) {
        templateInstance.isLoading.set(false)
      if (error) {
        // Show some error message
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
      }
    });

    //,
    //name: fullName,
    //  "profile.mobile" :[mobile]

  }
});

Template.loginFormSignUpViewLandlord.onCreated(() => {
  let template = Template.instance();

  // template.uniqueId = Random.id();
  template.formMessages = new ReactiveVar({});
  template.type = "signUp";
  template.isOTPverified =  new ReactiveVar(false);
  template.isLoading = new ReactiveVar(true);
});

Template.loginFormSignUpViewLandlord.onRendered( function(){

  this.$(".SignupFormMobileField").intlTelInput({
    preferredCountries:["ie","gb",'in']
  });

 $('#signin-div').find('#name').focus();
  $('.new-focus').click(function(){
    $('#signin-div').find('#name').focus();
  });
    Template.instance().isLoading.set(false)

});

Template.loginFormSignUpViewLandlord.helpers(LoginFormSharedHelpers);


/**
 * Events: Login form sign up view
 */
Template.loginFormSignUpViewLandlord.events({
    "click [data-event-action=signIn]": function (event, template) {
        Session.set('showForgotForm',false)
        Session.set('showSignupForm',false)
        Session.set('showLoginSignupFancyBoxDialog',true)
        Session.set('showLoginDialog',true)
    },
  /**
   * Submit sign up form
   * @param  {Event} event - jQuery Event
   * @param  {Template} template - Blaze Template
   * @return {void}
   */
  "submit form": function (event, template) {
    event.preventDefault();

    // var usernameInput = template.$(".login-input--username");
    let emailInput = template.$(".login-input-email");
    let passwordInput = template.$(".login-input-password");
    let fullNameInput = template.$(".login-input-fullName");
    let mobileInput = template.$(".login-input-mobile");

    let email = emailInput.val().trim();
    let password = passwordInput.val().trim();
    let fullName = fullNameInput.val().trim();
    let mobile = mobileInput.val().trim();

    let validatedEmail = LoginFormValidation.email(email);
    let validatedFullName = LoginFormValidation.username(fullName);
    let validatedPassword = LoginFormValidation.password(password, {validationLevel: "length"});
    let validatedMobile = LoginFormValidation.mobile(mobile);

    let templateInstance = Template.instance();
    var errors = []

    templateInstance.formMessages.set({});
      templateInstance.isLoading.set(true);


    if (validatedEmail !== true) {
      errors.push(validatedEmail);
    }

    if (validatedFullName !== true) {
      errors.push(validatedFullName);
    }

    if (validatedMobile !== true) {
      errors.push(validatedMobile);
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

    //if(!templateInstance.isOTPverified.get()){
    //  //Show OTP screen
    //
    //}


    let newUserData = {
      // username: username,
      email: email,
      password: password,
      profile:{
        name:fullName,
        email: email,
        mobile:mobile
      }
    };

    Accounts.createUser(newUserData, function (error, result) {
        templateInstance.isLoading.set(false)
      if (error) {
        // Show some error message
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
      }
    });

    //,
    //name: fullName,
    //  "profile.mobile" :[mobile]

  }
});
