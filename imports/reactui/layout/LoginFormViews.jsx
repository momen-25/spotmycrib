import { Meteor } from 'meteor/meteor';
import React, { Component } from 'react';
import { withTracker } from 'meteor/react-meteor-data';
import {LoginFormMessages,SocialLoginButtonsT} from "./MainLayoutHeader";

export class LoginFormSignInView extends Component{
  constructor(props){
      super(props);
      if(!props.onPage)props.onPage=false;
      this.state = {
          isLoading:true,
          formMessages:{
              errors:[]
          }
      }
      // this.forgotPwdHandler = this.forgotPwdHandler.bind(this)
      this.signInHandler = this.signInHandler.bind(this)
      // this.signUpHandler = this.signUpHandler.bind(this)
  }
  componentDidMount(){
      $('#signin-div').find('#email').focus();
      $('.new-focus').click(function(){
          $('#signin-div').find('#email').focus();
      });
      this.setState({isLoading:false})
  }
    signInHandler(event){
        event.preventDefault();

        let usernameInput = $(".login-input-email-LoginFormSignInView");
        let passwordInput = $(".login-input-password-LoginFormSignInView");

        let username = usernameInput.val().trim();
        let password = passwordInput.val().trim();

        let validatedEmail = LoginFormValidation.email(username);
        let validatedPassword = LoginFormValidation.password(password, {validationLevel: "exists"});

        var errors = []

        this.setState({formMessages:{}})
        this.setState({isLoading:true})

        if (validatedEmail !== true) {
            errors.push(validatedEmail);
        }

        if (validatedPassword !== true) {
            errors.push(validatedPassword);
        }

        if (errors.length) {
            this.setState({formMessages:{errors: errors}})
            this.setState({isLoading:false})
            return;
        }

        this.loginCallBack = (error) => {
            fbq('track', 'EmailUserLogin'+ (error ? "Failed" : "Successful"));
            ga('send', 'event', 'General', 'userLoginSignup', 'Email Login '+ (error ? "Failed" : "Successful"));

            this.setState({isLoading:false})
            if (error) {
                console.log(error)
                if(error.reason=='User has no password set' || error.reason=='User not found'){
                    this.isSocialAccountCallback = function (err1,result) {
                        if(err1) this.setState({formMessages:{errors: [err1]}})
                        else this.setState({formMessages:{info: [result]}})
                    }
                    this.isSocialAccountCallback = this.isSocialAccountCallback.bind(this);
                    Meteor.call('isSocialAccount',username,this.isSocialAccountCallback)
                }

                // Show some error messages above the form fields
                this.setState({formMessages:{errors: [error]}})
            } else {
                var isOnPage = false;

                if(this.props.onPage)isOnPage = true;

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
        }
        this.loginCallBack = this.loginCallBack.bind(this)
        Meteor.loginWithPassword(username, password, this.loginCallBack);
    }
    // signUpHandler(){
    //     Session.set('showForgotForm',false)
    //     Session.set('showSignupForm',true)
    //     Session.set('showLoginSignupFancyBoxDialog',true)
    //     Session.set('showLoginDialog',true)
    // }
    // forgotPwdHandler(){
    //     var isOnPage = false;
    //     if(this.props.onPage)isOnPage = true;
    //     if( !isOnPage ){
    //         Session.set('showForgotForm',true)
    //         Session.set('showSignupForm',false)
    //         Session.set('showLoginSignupFancyBoxDialog',true)
    //         Session.set('showLoginDialog',true)
    //     }else{
    //         Session.set('showForgotForm',true)
    //     }
    // }
  render(){
      return (
<div>
    <div className="refund-div"><h2>Sign In {this.props.loginFromApplyNowBtn ? "Required":""}</h2></div>
    {this.props.loginFromApplyNowBtn ? (
        <p className={"color-text info-msg-text"}>Login is required to apply for this property. Quickly use the options below to Login or Create yourself an account.</p>
    ):""}
    <div className="profile-text" style={{paddingTop:'20px'}}>
        {this.props.onPage ? "" : (
            <div>
                <SocialLoginButtonsT buttonFor='login' usedInDlg={true}/>
                <div className="seperator" style={{margin: '0 0 30px 0px'}}><span></span></div>
            </div>
        )}

        <h5>Enter your email and password below</h5>

        <form className="signin-form">
            <div className="form-border">

                <div className={"styled-input  "+ (this.state.formMessages.errors ? this.state.formMessages.errors.email ? "has-error has-feedback" : "" : "") }>
                    <input autoComplete="email" type="email" name="email" required htmlFor="email-loginFormSignInView"
                           className="login-input-email-LoginFormSignInView"/>
                    <label htmlFor="email-loginFormSignInView">EMAIL ID</label>
                    <span></span>
                </div>

                <div className={"styled-input underline "+ (this.state.formMessages.errors ? this.state.formMessages.errors.password ? "has-error has-feedback" : "" : "") }>
                    <input autoComplete="current-password" type="password" name="password"
                           className="login-input-password-LoginFormSignInView" required htmlFor="password-loginFormSignInView"/>
                    <label htmlFor="password-loginFormSignInView">PASSWORD</label>
                    <span></span>
                </div>


            </div>
            <LoginFormMessages messages={this.state.formMessages} />

            <div className="signup-btn">
                {this.state.isLoading ? (
                    <button className="transparent-btn btns">Loading...</button>
                ):(
                    <button className="blue-btn btns" type="submit" data-event-action="submitSignInForm" onClick={this.signInHandler}>SIGN IN</button>
                )}
                <h5 data-event-action="forgotPassword" onClick={this.props.showForgotFormHandler}>Forgot password?</h5>
                {this.props.onPage ? "" : (
                    <h6>Not registered? <span style={{color: '#0c68a7'}} data-event-action="signUp"  onClick={this.props.showSignupFormHandler}>Sign Up now</span></h6>
                )}
            </div>

        </form>
    </div>
</div>
      )
  }
};

export class LoginFormSignUpView extends Component{
    constructor(props){
        super(props);
        this.state = {
            isLoading:true,
            formMessages:{
                errors:[]
            }
        }
        this.forgotPwdHandler = this.forgotPwdHandler.bind(this)
        // this.signInHandler = this.signInHandler.bind(this)
        this.signUpHandler = this.signUpHandler.bind(this)
    }
    componentDidMount(){
        $(".SignupFormMobileField").intlTelInput({
            preferredCountries:["ie","gb",'in']
        });

        $('#signin-div').find('#name').focus();
        $('.new-focus').click(function(){
            $('#signin-div').find('#name').focus();
        });
        this.setState({isLoading:false})
    }
    // signInHandler(){
    //     Session.set('showForgotForm',false)
    //     Session.set('showSignupForm',false)
    //     Session.set('showLoginSignupFancyBoxDialog',true)
    //     Session.set('showLoginDialog',true)
    // }
    signUpHandler(event){
        event.preventDefault();

        // var usernameInput = $(".login-input--username");
        let emailInput = $(".login-input-email-LoginFormSignUpView");
        let passwordInput = $(".login-input-password-LoginFormSignUpView");
        let fullNameInput = $(".login-input-fullName-LoginFormSignUpView");
        let mobileInput = $(".login-input-mobile-LoginFormSignUpView");

        let email = emailInput.val().trim();
        let password = passwordInput.val().trim();
        let fullName = fullNameInput.val().trim();
        let mobile = mobileInput.val().trim();

        let validatedEmail = LoginFormValidation.email(email);
        let validatedFullName = LoginFormValidation.username(fullName);
        let validatedPassword = LoginFormValidation.password(password, {validationLevel: "length"});
        let validatedMobile = LoginFormValidation.mobile(mobile);

        var errors = []

        this.setState({formMessages:{}})
        this.setState({isLoading:true})


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
            this.setState({formMessages:{errors: errors}})
            this.setState({isLoading:false})
            return;
        }

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
        this.createUserCallback = function (error, result) {
            fbq('track', 'EmailUserSignup'+ (error ? "Failed" : "Successful"));
            ga('send', 'event', 'General', 'userLoginSignup', 'Email Signup '+ (error ? "Failed" : "Successful"));

            this.setState({isLoading:false})
            if (error) {
                // Show some error message
                this.setState({formMessages:{errors: [error]}})
            } else {
                var isOnPage = false;
                if(this.props.onPage)isOnPage = true;
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
        }
        this.createUserCallback = this.createUserCallback.bind(this);
        Accounts.createUser(newUserData, this.createUserCallback);
    }
    forgotPwdHandler(){
        var isOnPage = false;
        if(this.props.onPage)isOnPage = true;
        if( !isOnPage ){
            Session.set('showForgotForm',true)
            Session.set('showSignupForm',false)
            Session.set('showLoginSignupFancyBoxDialog',true)
            Session.set('showLoginDialog',true)
        }else{
            Session.set('showForgotForm',true)
        }
    }
    render(){
        return (
            <div>
                <div className="refund-div"><h2>Sign Up {this.props.loginFromApplyNowBtn ? "Required":""}</h2></div>
                {this.props.loginFromApplyNowBtn ? (
                    <p className={"color-text info-msg-text"}>Login is required to apply for this property. Quickly use the options below to Login or Create yourself an account.</p>
                ):""}
                <div className="profile-text" style={{paddingTop:'20px'}}>
                    {this.props.onPage ? "" : (
                        <div>
                            <SocialLoginButtonsT buttonFor='signup' usedInDlg={true}/>
                            <div className="seperator" style={{margin: '0 0 30px 0px'}}><span></span></div>
                        </div>
                    )}

                    <h5>Enter your details below</h5>
                    <form className="signin-form">
                        <div className="form-border">

                            <div className="styled-input">
                                <input autoComplete="name" className="login-input-fullName-LoginFormSignUpView" type="text" name="name"
                                       required htmlFor="email-loginFormSignUpView"/><br/>
                                <label htmlFor="email-loginFormSignUpView">FULL NAME</label>
                                <span></span>
                            </div>

                            <div className="styled-input">
                                <input autoComplete="email" className="login-input-email-LoginFormSignUpView" type="email" name="email"
                                       required htmlFor="email-loginFormSignUpView"/>
                                <label htmlFor="email-loginFormSignUpView">EMAIL ID</label>
                                <span></span>
                            </div>

                            <div className="styled-input">
                                <input autoComplete="new-password" className="login-input-password-LoginFormSignUpView" type="password"
                                       name="password" required htmlFor="password-loginFormSignUpView"/>
                                <label htmlFor="password-loginFormSignUpView">PASSWORD</label>
                                <span></span>
                                {this.state.formMessages.errors ? this.state.formMessages.errors.password ? (
                                    <span className="help-block">
                                    {
                                        this.state.formMessages.errors.password.map(function (p, i) {
                                            return (<p key={i}>{p.reason}</p>)
                                        })
                                    }
                                    </span>
                                ) : "" : ""}
                            </div>

                            <div className="styled-input">
                                <input autoComplete="tel" className="login-input-mobile-LoginFormSignUpView SignupFormMobileField"
                                       type="text" name="mobile" htmlFor="mobile-loginFormSignUpView"/>
                                <label htmlFor="mobile-loginFormSignUpView">MOBILE</label>
                                <span></span>
                            </div>

                        </div>
                        <LoginFormMessages messages={this.state.formMessages} />

                        <div className="signup-btn">
                            {this.state.isLoading ? (
                                <button className="transparent-btn btns">Loading...</button>
                            ):(
                                <button className="blue-btn btns" type="Submit" data-event-category="accounts" data-event-action="register"  onClick={this.signUpHandler}>SIGN UP</button>
                            )}
                            {this.props.onPage ? "" : (
                                <p>Already have an account? <a href="javascript:;"><span style={{color: '#0c67a6'}} data-event-category="accounts" data-event-action="signIn"  onClick={this.props.showSignInFormHandler}>Sign In</span></a></p>
                            )}
                        </div>

                    </form>

                </div>
            </div>
        )
    }
};

export class LoginFormSignUpViewLandlord extends Component{
    constructor(props){
        super(props);
        this.state = {
            isLoading:true,
            formMessages:{
                errors:[]
            }
        }
        this.forgotPwdHandler = this.forgotPwdHandler.bind(this)
        this.signInHandler = this.signInHandler.bind(this)
        this.signUpHandler = this.signUpHandler.bind(this)
    }
    componentDidMount(){
        $(".SignupFormMobileField").intlTelInput({
            preferredCountries:["ie","gb",'in']
        });

        $('#signin-div').find('#name').focus();
        $('.new-focus').click(function(){
            $('#signin-div').find('#name').focus();
        });
        this.setState({isLoading:false})
    }
    signInHandler(){
        Session.set('showForgotForm',false)
        Session.set('showSignupForm',false)
        Session.set('showLoginSignupFancyBoxDialog',true)
        Session.set('showLoginDialog',true)
    }
    signUpHandler(event){
        event.preventDefault();

        // var usernameInput = $(".login-input--username");
        let emailInput = $(".login-input-email-LoginFormSignUpViewLandlord");
        let passwordInput = $(".login-input-password-LoginFormSignUpViewLandlord");
        let fullNameInput = $(".login-input-fullName-LoginFormSignUpViewLandlord");
        let mobileInput = $(".login-input-mobile-LoginFormSignUpViewLandlord");

        let email = emailInput.val().trim();
        let password = passwordInput.val().trim();
        let fullName = fullNameInput.val().trim();
        let mobile = mobileInput.val().trim();

        let validatedEmail = LoginFormValidation.email(email);
        let validatedFullName = LoginFormValidation.username(fullName);
        let validatedPassword = LoginFormValidation.password(password, {validationLevel: "length"});
        let validatedMobile = LoginFormValidation.mobile(mobile);

        var errors = []

        this.setState({formMessages:{}})
        this.setState({isLoading:true})


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
            this.setState({formMessages:{errors: errors}})
            this.setState({isLoading:false})
            return;
        }

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
        this.createUserCallback = function (error, result) {
            fbq('track', 'EmailLandlordSignup'+ (error ? "Failed" : "Successful"));
            ga('send', 'event', 'General', 'userLoginSignup', 'Email Landlord Signup '+ (error ? "Failed" : "Successful"));

            this.setState({isLoading:false})
            if (error) {
                // Show some error message
                this.setState({formMessages:{errors: [error]}})
            } else {
                var isOnPage = false;
                if(this.props.onPage)isOnPage = true;
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
        }
        this.createUserCallback = this.createUserCallback.bind(this);
        Accounts.createUser(newUserData, this.createUserCallback);
    }
    forgotPwdHandler(){
        var isOnPage = false;
        if(this.props.onPage)isOnPage = true;
        if( !isOnPage ){
            Session.set('showForgotForm',true)
            Session.set('showSignupForm',false)
            Session.set('showLoginSignupFancyBoxDialog',true)
            Session.set('showLoginDialog',true)
        }else{
            Session.set('showForgotForm',true)
        }
    }
    radioHandler(){

    }
    render(){
        return (
            <div className="landlordSignup-div signup-div">

                <div className="refund-div"><h2>Landlord Join Now</h2></div>
                <div className="profile-text">
                    <div className="row">
                        <div className="col-md-12 rd-details">
                            <span>I am a</span>
                            <label className="account-type-label" htmlFor="rd1">
                                <input className="account-type-radio" name="accountType" value="LANDLORD" type="radio"
                                       defaultChecked onChange={this.radioHandler}/>
                                    Landlord
                            </label>
                            <label className="account-type-label">
                                <input className="account-type-radio" name="accountType" value="LANDLORD" type="radio"/>
                                    Agent
                            </label>
                            <label className="account-type-label">
                                <input className="account-type-radio" name="accountType" value="LANDLORD" type="radio"/>
                                    Building Manager
                            </label>
                            <label className="account-type-label">
                                <input className="account-type-radio" name="accountType" value="LANDLORD" type="radio"/>
                                    Tenant
                            </label>
                        </div>
                    </div>


                    <form className="signin-form">
                        <div className="form-border">
                            <div className="row frm-group">
                                <div className="col-sm-6">
                                    <div className="styled-input">
                                        <input autoComplete="name" type="text" name="name"
                                               className="login-input-fullName-LoginFormSignUpViewLandlord" required/><br/>
                                        <label>FULL NAME</label>
                                        <span></span>
                                    </div>
                                </div>
                                <div className="col-sm-6">
                                    <div className="styled-input">
                                        <input autoComplete="email" type="email" name="email"
                                               className="login-input-email-LoginFormSignUpViewLandlord" required/>
                                        <label>EMAIL ID</label>
                                        <span></span>
                                    </div>
                                </div>

                                <div className="col-sm-6">
                                    <div className="styled-input">
                                        <input autoComplete="new-password" type="password" name="password"
                                               className="login-input-password-LoginFormSignUpViewLandlord" required/>
                                        <label>PASSWORD</label>
                                        <span></span></div>
                                </div>

                                <div className="col-sm-6">
                                    <div className="styled-input">
                                        <input autoComplete="tel" type="number" name="mobile"
                                               className="login-input-mobile-LoginFormSignUpViewLandlord SignupFormMobileField" required/>
                                        <label>MOBILE</label>
                                        <span></span>
                                    </div>
                                </div>
                            </div>

                            <LoginFormMessages messages={this.state.formMessages}/>

                        </div>
                        <div className="signup-btn">
                            <div className="styled-input">
                                {this.state.isLoading ? (
                                    <button className="transparent-btn btns">Loading...</button>
                                ):(
                                    <button className="blue-btn btns" type="submit" onClick={this.signUpHandler}>SIGN UP</button>
                                )}
                            </div>
                            {this.props.onPage ? "" : (
                                <p style={{paddingTop: 0}}>Already have an account? <a href="javascript:;"><span style={{color: '#0c67a6'}} data-event-category="accounts" data-event-action="signIn" onClick={this.props.showSignInFormHandler}>Sign In</span></a></p>
                            )}
                        </div>
                    </form>

                </div>
            </div>
        )
    }
};

export class LoginFormResetPasswordView extends Component{
    constructor(props){
        super(props);
        this.state = {
            isLoading:true,
            showForm:true,
            formMessages:{
                errors:[]
            }
        }
        this.forgotPwdHandler = this.forgotPwdHandler.bind(this)
        // this.signInHandler = this.signInHandler.bind(this)
        // this.signUpHandler = this.signUpHandler.bind(this)
        this.tryAgainBtnHandler = this.tryAgainBtnHandler.bind(this)
    }
    componentDidMount(){
        $('#signin-div').find('#email').focus();
        $('.new-focus').click(function(){
            $('#signin-div').find('#email').focus();
        });
        this.setState({isLoading:false})
    }
    // signInHandler(){
    //     var isOnPage = false;
    //     if(this.props.onPage)isOnPage = true;
    //     if( !isOnPage ){
    //         Session.set('showForgotForm',false)
    //         Session.set('showSignupForm',false)
    //         Session.set('showLoginSignupFancyBoxDialog',true)
    //         Session.set('showLoginDialog',true)
    //     }else{
    //         this.props.showSignInFormHandler();
    //         // Session.set('showForgotForm',false)
    //     }
    // }
    forgotPwdHandler(event){
        event.preventDefault();

        let emailAddress = $(".login-input-email-LoginFormResetPasswordView").val().trim();
        let validatedEmail = LoginFormValidation.email(emailAddress);

        var errors = []

        this.setState({formMessages:{}})
        this.setState({isLoading:true})

        if (validatedEmail !== true) {
            errors.push(validatedEmail);
        }

        if (errors.length) {
            this.setState({formMessages:{errors: errors}})
            this.setState({isLoading:false})
            return;
        }

        this.forgotPwdCallback = (error) => {
            fbq('track', 'ForgotPwd'+ (error ? "Failed" : "Successful"));
            ga('send', 'event', 'General', 'userLoginSignup', 'Forgot Password '+ (error ? "Failed" : "Successful"));

            this.setState({isLoading:false})
            // Show some message confirming result
            if (error) {
                console.log(error)
                this.setState({formMessages:{errors: [error]}})
            } else {

                this.setState({showForm:false})
                this.setState({formMessages:{info: [{
                            reason:  "Password reset mail sent."
                        }]
                }})
            }
        };
        this.forgotPwdCallback = this.forgotPwdCallback.bind(this);

        Accounts.forgotPassword({ email: emailAddress}, this.forgotPwdCallback);

    }
    tryAgainBtnHandler(){
        this.state.setState({showForm:true})
    }
    contactUsClickHandler(){
        if($)
            if($.fancybox)
                $.fancybox.close();
    }
    render(){
        return (
            <div>
                {this.state.showForm ? (
                    <div>
                        <div className="refund-div">
                            <h2>Forgot password?</h2>
                        </div>
                        <div className="profile-text">
                            <h5 className="no-capitalize">Enter your registered Email ID</h5>
                            <form className="signin-form">
                                <div className="form-border">
                                    <div className={"styled-input  " + (this.state.formMessages.errors ? this.state.formMessages.errors.email ? "has-error has-feedback" : "" : "")}>
                                        <input autoComplete="email" type="email" name="email" required
                                               htmlFor="email-LoginFormResetPasswordView"
                                               className="login-input-email-LoginFormResetPasswordView"/>
                                        <label htmlFor="email-LoginFormResetPasswordView">EMAIL ID</label>
                                        <span></span>
                                    </div>
                                    <LoginFormMessages messages={this.state.formMessages}/>
                                    <div className="signup-btn">
                                        {this.state.isLoading ? (
                                            <button className="transparent-btn btns">Loading...</button>
                                        ) : (
                                            <button className="blue-btn btns" type="submit" data-event-action="accounts"
                                                    onClick={this.forgotPwdHandler}>Reset My Password</button>
                                        )}
                                        <h6><span style={{color: '#0c68a7'}} data-event-category="accounts"
                                                  data-event-action="signIn" onClick={this.props.showSignInFormHandler}>Sign In</span>
                                        </h6>
                                    </div>
                                </div>
                            </form>
                        </div>
                    </div>
                ) : (
                    <div>
                        <div className="refund-div">
                            <h2>We just emailed you a link</h2>
                        </div>
                        <div className="profile-text">
                            <h5 className="no-capitalize">Please check your email and click the secure link.</h5>
                            <div className="signup-btn">
                                <button className="transparent-btn btns tryAgainBtn"
                                        onClick={this.tryAgainBtnHandler}>Try again
                                </button>
                            </div>
                            <p></p>
                            <p className="color-text contactusBtn">If you don’t see our email, check your spam folder
                                or <a href={FlowRouter.url('contactus')} onClick={this.contactUsClickHandler}>Contact
                                    us</a></p>
                        </div>
                    </div>
                )}
        </div>
        )
    }
};