import "./collections.js";
import {check} from "meteor/check";

Meteor.methods({
  updateReferenceFile: function(args){
    // check([], []);
    console.log("server method updateReferenceFile called")

    const userId = Meteor.userId();
    var p1='';
    var p2='';
    switch (args[0]){
        case "Resume": p1 = "hasResume"; p2 = "resume"; break;
        case "Work Reference": p1 = "hasWorkRef"; p2 = "workRef"; break;
        case "Landlord Reference": p1 = "hasLandlordRef"; p2 = "landlordRef"; break;
        case "Financial Reference": p1 = "hasFinancialRef"; p2 = "financialRef"; break;
        case "Government ID": p1 = "hasGovtID"; p2 = "govtID"; break;
        case "Passport": p1 = "hasPassport"; p2 = "passport"; break;
        case "PPS": p1 = "hasPPS"; p2 = "PPS"; break;
       }

    if(p1 && p2) {
      p1 = "profile.references."+p1
      p2 = "profile.references."+p2
        var setObj = {}
        setObj[p1] =true;
        setObj[p2]= args[1]

        console.log(p1);
        console.log(p2);
        console.log(setObj);
        Meteor.users.update(userId, {
            $set: setObj
        });
    }
    return {
      status: 'Success'
    }

  },
  updateMobile: function(newMobile){
    // check(newMobile, []);
    console.log("server method updateMobile called")
    const userId = Meteor.userId();
    Meteor.users.update({
      "_id": userId
    }, {
      $set: {
        "profile.mobile": newMobile,
        "profile.isMobileVerified": false
      }
    });
    return {
      status: 'Success'
    }

  },
  updateEmployerName: function(newEmp){
    check(newEmp, String);
    if(!newEmp.length || newEmp.length<2){
        throw new Meteor.Error(500, 'Invalid employee name', 'Employee name cannot be less then 2 characters.');
    }
    console.log("server method updateEmployerName called: "+newEmp)
    const userId = Meteor.userId();
    Meteor.users.update({
      "_id": userId
    }, {
      $set: {
        "profile.references.employerName": newEmp
      }
    });
    return {
      status: 'Success'
    }

  },
  updateEmployerTakeHome: function(salary){
    check(salary, Number);
    if(salary<0 || salary > Number.MAX_VALUE){
        throw new Meteor.Error(500, 'Invalid employee take home', 'Employee take home salary cannot be less then 0 or too large.');
    }
    console.log("server method updateEmployerTakeHome called: "+salary)
    const userId = Meteor.userId();
    Meteor.users.update({
      "_id": userId
    }, {
      $set: {
        "profile.references.employerTakeHome": salary
      }
    });
    return {
      status: 'Success'
    }

  },
  sendOTP: function(args){
    check(args, Match.Any);
    console.log("server method sendOTP called")

    if(!isLoggedOn()){
      throw new Meteor.Error(500, 'Error 500: Login needed', 'Please login before you request.');
    }

    const user = Meteor.user();
    if( user.profile.isMobileVerified){
      throw new Meteor.Error(500, 'Error 500: Mobile already verified. ', 'Your mobile is already verified.');
    }

    //DON'T need below code as we will be using this method for both send and RESEND.
    //if(user.profile.OTPValue){
    //  var today = new Date();
    //  var OTPSentOn = new Date(user.profile.OTPSentOn);
    //  var diffMs = (OTPSentOn - today); // milliseconds between now & Christmas
    //  var diffMins = Math.round(((diffMs % 86400000) % 3600000) / 60000); // minutes
    //  if(diffMins > 15){//OTP has expired
    //
    //  }else{//OTP previous OTP is still valid.
    //
    //  }
    //}

    const newOTP    = Math.floor(100000 + Math.random() * 900000);
    const userEmail = user.profile.email;
    const username  = user.profile.name;

    //TODO separate SMS sending in an this.unblock method

    /* Send OTP via email */
    Meteor.call("sendNotificationEmail", {
      template: "otpEmail",
      user    : {
        profile: {
          username: username
        }
      },
      otp     : newOTP,
      subject : "IBidMyHome OTP: Verify your mobile number",
      mailTo  : user.profile.email
    });

    /* Send OTP via mobile*/
    var OPTsmsText = 'Your OTP is: ' + newOTP;

    var APIURL = 'http://atrans.smscuppa.com/sendsms.jsp?user=mybids&password=mybids&mobiles='+user.profile.mobile+'&general='+OPTsmsText+'&senderid=MYBIDS&version=3';
    var APIURL = 'http://atrans.smscuppa.com/sendsms.jsp';

    var options = {
      "params":{
        "user" : "mybids",
        "password" : "mybids",
        "mobiles":user.profile.mobile,
        "sms":OPTsmsText,
        "senderid":"MYBIDS",
        "version":"3"
      },
      "headers":{
        //"X-API-KEY" : APIKey,
        //"X-Auth-Token" : AUTHToken
      }
    }
    var response  = HTTP.get(APIURL, options)


    Meteor.users.update({
      "_id": user._id
    }, {
      $currentDate: {
        "profile.OTPSentOn": { $type: "timestamp" }
      },
      $set: {
        "profile.OTPValue": newOTP
      }
    });


    return {
      status: 'Success'
    }

  },
  verifyOTP: function(args){
    check(args, Match.Any);
    var otp = args[0];
    console.log("server method verifyOTP called")

    if(!isLoggedOn()){
      throw new Meteor.Error(500, 'Error 500: Login needed', 'Please login before you request.');
    }

    const user = Meteor.user();

    if(user.profile.OTPValue){
      var today = new Date();
      var OTPSentOn = new Date(user.profile.OTPSentOn);
      var diffMs = (OTPSentOn - today); // milliseconds between now & Christmas
      var diffMins = Math.round(((diffMs % 86400000) % 3600000) / 60000); // minutes
      if(diffMins > 15){//OTP has expired
        throw new Meteor.Error(500, 'Error 500: OTP has expired', 'Your OTP has expired.');
      }else{//OTP previous OTP is still valid.

      }
    }else{
      throw new Meteor.Error(500, 'Error 500: OTP is not valid', 'You need an OTP to verify.');
    }


    if(user.profile.OTPValue == otp) {
      Meteor.users.update({
        "_id": user._id
      }, {
        $set: {
          "profile.isMobileVerified": true
        }
      });
    }else{
      throw new Meteor.Error(500, 'Error 500: OTP is not valid', 'OTP entered is wrong.');
    }

    return {
      status: 'Success'
    }

  }
})

function randomString(length, chars) {
  var mask = '';
  if (chars.indexOf('a') > -1) mask += 'abcdefghijklmnopqrstuvwxyz';
  if (chars.indexOf('A') > -1) mask += 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
  if (chars.indexOf('#') > -1) mask += '0123456789';
  if (chars.indexOf('!') > -1) mask += '~`!@#$%^&*()_+-={}[]:";\'<>?,./|\\';
  var result = '';
  for (var i = length; i > 0; --i) result += mask[Math.floor(Math.random() * mask.length)];
  return result;
}
