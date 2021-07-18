/**
 * Created by srikanth681 on 24/02/16.
 */



var smsURL = "http://atrans.smscuppa.com/sendsms.jsp"
var smsUser = "mybids"
var smsPassword = "mybids"
var smsSenderID = "MYBIDS"
var smsVersion = "3"


Meteor.methods({
  sendSMS: function (args) { //mobileNumber, smsText
    check(args, [Match.Any]);
    var mobileNumber = args[0]
    var smsText = args[1]

    var smsURL = 'http://atrans.smscuppa.com/sendsms.jsp';

    var options = {
      "params":{
        "user" : smsUser,
        "password" : smsPassword,
        "senderid" : smsSenderID,
        "version" : smsVersion,
        "mobiles" : mobileNumber,
        "sms" : smsText
      }
    }
    var response  = HTTP.get(smsURL, options);


    return response;
  }
})
