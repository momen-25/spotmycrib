/**
 * Created by srikanth681 on 24/02/16.
 */
import {check} from "meteor/check";

var EMAIL_CONFIG = Meteor.settings.EMAIL_CONFIG
var SUPPORT_DATA = Meteor.settings.SUPPORT_DATA




Meteor.methods({
    requestEmail: function (mailData) {
        this.unblock();
        console.log('requestEmail method called')

        switch(mailData.requestType){
            case 'emailEnquiryReceived'://15 mns grouping
                mailData.frequency = 15;//its a 15min grouping
                if(!mailData.scheduledDate)mailData.scheduledDate = moment().add(15, 'm').toDate()
                break;
            case 'uploadRefsReminder'://1440 mns grouping - 1 day
                mailData.frequency = 1440;//its a 1 per day grouping
                if(!mailData.scheduledDate)mailData.scheduledDate = moment().add(1, 'd').toDate()
                break;
            case 'reminderUploadReferences'://1440 mns grouping - 1 day
                mailData.frequency = 1440;//its a 1 per day grouping
                if(!mailData.scheduledDate)mailData.scheduledDate = moment().add(1, 'd').toDate()
                break;
            default: throw new Meteor.Error('Invalid requestType');
        }
        mailData.status = 'new';
        mailData.isArchived = false;

        Collections.EmailRequests.insert(mailData)
    },
  sendNotificationEmail: function (data,serialMode=false) {
    //Format as shown below
    //data = {
    //  template: "bidSuccessfullyPlaced",
    //  subject: "Welcome to SMC"
    //}
    // check(args, [String]);

    // Let other method calls from the same client start running,
    // without waiting for the email sending to complete.
    if(!serialMode)this.unblock();

    console.log('sendNotificationEmail '+(serialMode?"serialMode":"")+' called for '+data.mailTo)

    // don't send account emails unless email server configured
    // if (!Meteor.settings.MAIL_URL) {
    if (!process.env.MAIL_URL) {
      console.log("Mail not configured: suppressing sendNotificationEmail output");
      console.log('no MAIL_URL in env vars')
      return true;
    }

    SSR.compileTemplate("email/"+data.template, Assets.getText("email/"+data.template+".html"));
    let renderArr = {
        homepage: ( Meteor.isDevelopment ? 'https://www.spotmycrib.ie/' : Meteor.absoluteUrl() ),
        cdnHomepage: ( Meteor.isDevelopment ? 'https://www.spotmycrib.ie/' : CDN.get_cdn_url()+'/' ),
        support: EMAIL_CONFIG,
        headers:{}
    }

    renderArr.data = data;
    let renderedTemplate = SSR.render("email/" + data.template, renderArr)

    if(Meteor.isDevelopment && !data.mailTo.endsWith('@spotmycrib.com')){
        data.mailTo = 'srikanth681@gmail.com'
    }
    if(data.mailTo.indexOf('daft.ie')!=-1){
        console.log("Looks like a daft.ie email, supressing it.");
        console.log(data.mailTo)
        return true;
    }

      var arr = {
          to: data.mailTo,
          // to: 'srikanth681@gmail.com',
          from: EMAIL_CONFIG.name+" <"+EMAIL_CONFIG.email+">",
          subject: data.subject,
          html: renderedTemplate
      }
      if(data.replyTo)arr.replyTo = data.replyTo;
      if(data['o:tag'])arr.headers['o:tag'] = data['o:tag'];
      if(Meteor.isDevelopment && !data.mailTo.endsWith('@spotmycrib.com')){
          arr['o:testmode']=true;
      }

      Email.send(arr);

      return true;



  },
  sendEmail: function (to, from, subject, text) {
    check([to, from, subject, text], [String]);

    // Let other method calls from the same client start running,
    // without waiting for the email sending to complete.
    this.unblock();

    //actual email sending method
    Email.send({
      to: to,
      from: from,
      subject: subject,
      text: text
    });
  },
  knowMoreRequestReceived:function (email) {
      console.log('in knowMoreRequestReceived')
      console.log(email)
      this.unblock();
      Email.send({
          to: 'srikanth681@gmail.com',
          from: 'sales@spotmycrib.com',
          subject: "Know more request received",
          text: 'Email provided is: '+email,
          headers:{
            'o:tag': 'notifySales',
          }
      });
  },
  notifyAdmin:function (subject='',desc='') {
     console.log('in notifyAdmin')

     this.unblock();
     if(Meteor.isDevelopment)return ;
     
     Email.send({
        to: 'srikanth681@gmail.com',
        // cc: 'divyarao807@gmail.com',
        from: 'support@spotmycrib.com',
        subject: "Notify: "+subject,
        html: 'Content is: '+desc,
        headers:{
            'o:tag': 'notifyAdmin',
          }
     });
  },
  introOfferRequestReceived:function (email,name,company,phone) {
      console.log('in introOfferRequestReceived')
      console.log(email+" "+ name+" "+ company+" "+ phone)
      this.unblock();
      Email.send({
          to: 'srikanth681@gmail.com',
          from: 'sales@spotmycrib.com',
          subject: "Intro offer request received",
          text: 'Email provided is: '+email+"\n   name: "+name+"\n   company: "+company+"\n   phone: "+phone,
          headers:{
            'o:tag': 'notifySales',
          }
      });
  },
  sendWelcomeEmailCustom: function(args){
        // check(args, Match.Any);
        var userId = args[0];

        console.log("server method sendWelcomeEmailCustom called")
        console.log(userId);
        var user = Accounts.users.findOne(userId);
        // console.log(user);
        if(!user){
            throw new Meteor.Error(500, 'Error 500: Invalid user', 'User not found.');
        }

        let userFirstName = user.profile.name;
        if(userFirstName){
            userFirstName = titleCase(userFirstName.split(' ')[0]);
        }

        var globalConfig = Collections.Config.findOne();
        var mailData = {
            template: 'welcomeEmail',
            'o:tag': 'welcomeEmail',
            subject: "Welcome to SpotMyCrib",
            mailTo: user.profile.email,
            user: user,
            conf: globalConfig,
            data : {
                userFirstName: userFirstName
            }
        }
        //debugger;
        // Accounts.sendVerificationEmail(userId);
        

        Meteor.call('sendNotificationEmailWithoutSSR', mailData)

      /*
       if( user.profile.isEmailVerified){
       throw new Meteor.Error(500, 'Error 500: Email already verified. ', 'Your email is already verified.');
       }

       var newVerifyCode = randomString(32, '#a');//Random alpha numeric string of 32 chars
       Meteor.users.update({
       "_id": user._id
       }, {
       $currentDate: {
       "profile.emailVerificationSentOn": { $type: "timestamp" }
       },
       $set: {
       "profile.emailVerificationValue": newVerifyCode
       }
       });
       */


        return {
            status: 'Success'
        }


    },
    sendNotificationEmailWithoutSSR: function (mailData) {
        //Format as shown below
        //data = {
        //  template: "bidSuccessfullyPlaced",
        //  subject: "Welcome to SMC"
        //}
        // check(args, [String]);
    
        // Let other method calls from the same client start running,
        // without waiting for the email sending to complete.
        this.unblock();
    
        console.log('sendNotificationEmailWithoutSSR called for '+mailData.user.profile.name)
    
        // don't send account emails unless email server configured
        // if (!Meteor.settings.MAIL_URL) {
        if (!process.env.MAIL_URL) {
          console.log("Mail not configured: suppressing sendNotificationEmail output");
          console.log('no MAIL_URL in env vars')
          return true;
        }
        mailData.data.homepage = Meteor.absoluteUrl();
        if(Meteor.isDevelopment)mailData.data.homepage = 'https://www.spotmycrib.ie/';
        mailData.data.cdnHomepage = CDN.get_cdn_url()+'/';
        if(Meteor.isDevelopment)mailData.data.cdnHomepage = 'https://www.spotmycrib.ie/';
        mailData.data.support = EMAIL_CONFIG;

        let variableData = {}
        variableData[mailData.mailTo]= mailData.data
        console.log(variableData)

        if(Meteor.isDevelopment){
            mailData.mailTo = 'srikanth681@gmail.com'
        }
        
        let arr = {
            to: mailData.mailTo,
            from: EMAIL_CONFIG.name+" <"+EMAIL_CONFIG.email+">",
            subject: mailData.subject,
            html: Assets.getText("email/"+mailData.template+".html"),
            headers:{
                'X-Mailgun-Recipient-Variables':JSON.stringify(variableData)
            }
        }
        if(mailData.replyTo)arr.replyTo = mailData.replyTo;
        if(mailData['o:tag'])arr.headers['o:tag'] = mailData['o:tag'];
        if(Meteor.isDevelopment){
        //   arr['o:testmode']=true;
        }

          Email.send(arr);
    
          console.log({
            to: mailData.mailTo,
            from: EMAIL_CONFIG.name+" <"+EMAIL_CONFIG.email+">",
            subject: mailData.subject,
          })
          return true;
    
    
    
    },
    sendNotificationEmailWithTemplate: function (mailData) {
    this.unblock();
    console.log('sendNotificationEmailWithTemplate called')

    // don't send account emails unless email server configured
    if (!process.env.MAIL_URL) {
        console.log("Mail not configured: suppressing sendNotificationEmail output");
        console.log('no MAIL_URL in env vars')
        return true;
    }
    mailData.data.homepage = Meteor.absoluteUrl();
    if(Meteor.isDevelopment)mailData.data.homepage = 'https://www.spotmycrib.ie/';
    mailData.data.cdnHomepage = CDN.get_cdn_url()+'/';
    if(Meteor.isDevelopment)mailData.data.cdnHomepage = 'https://www.spotmycrib.ie/';
    mailData.data.support = EMAIL_CONFIG;
    
    let arr = {
        to: mailData.mailTo,
        from: EMAIL_CONFIG.name+" <"+EMAIL_CONFIG.email+">",
        subject: mailData.subject,
        template: mailData.template
        // ,
        // headers:{
        //     // 'X-Mailgun-Recipient-Variables':JSON.stringify(variableData),
        //     'X-Mailgun-Variables':JSON.stringify(mailData.data)
        // }
    }
    if(mailData.replyTo)arr.replyTo = mailData.replyTo;
    if(mailData['o:tag'])arr.headers['o:tag'] = mailData['o:tag'];
    // if(Meteor.isDevelopment){
    //   arr['o:testmode']=true;
    // }key-85cc066727dcada64aa3e70b96274e55

    arr = {
        to: 'srikanth681@gmail.com',
        from: 'Mailgun Sandbox <postmaster@spotmycrib.com>',
        subject: 'Hello Naga Srikanth',
        template: 'propertyalerts'
        // ,
        // headers:{
        //     // 'X-Mailgun-Recipient-Variables':JSON.stringify(variableData),
        //     'X-Mailgun-Variables':JSON.stringify(mailData.data)
        // }
    }

    Email.send(arr);

    console.log(arr)
    return true;
    },
})


Accounts.emailTemplates.siteName = EMAIL_CONFIG.companyName;
Accounts.emailTemplates.from = Meteor.settings.NO_REPLY.name+' <'+Meteor.settings.NO_REPLY.email+'>';
// Accounts.emailTemplates.enrollAccount.subject = (user) => {
//     return `Welcome to Awesome Town, ${user.profile.name}`;
// };
// Accounts.emailTemplates.enrollAccount.text = (user, url) => {
//     return 'You have been selected to participate in building a better future!'
//         + ' To activate your account, simply click the link below:\n\n'
//         + url;
// };
Accounts.emailTemplates.resetPassword = {
    from:function(){
        return Meteor.settings.NO_REPLY.name+' Password Reset <'+Meteor.settings.NO_REPLY.email+'>';
    },
    subject:function(user){
        return titleCase(user.profile.name)+', here\'s the link to reset your password';
    },
    html:function(user, url){
        SSR.compileTemplate('email/forgotPassword', Assets.getText('email/forgotPassword.html'));
        console.log(Meteor.absoluteUrl())

        return SSR.render("email/forgotPassword", {
            homepage: Meteor.absoluteUrl(),
            support: EMAIL_CONFIG,
            user: user,
            activationLink: url,
        })
    }
}
Accounts.emailTemplates.verifyEmail = {
    from:function(){
        return Meteor.settings.NO_REPLY.name+' <'+Meteor.settings.NO_REPLY.email+'>';
    },
    subject:function(){
        return 'Activate your account now!';
    },
    html:function(user, url){
        SSR.compileTemplate('email/verifyEmail', Assets.getText('email/verifyEmail.html'));

        return SSR.render("email/verifyEmail", {
            homepage: Meteor.absoluteUrl(),
            support: EMAIL_CONFIG,
            user: user,
            activationLink: url,
        })
    }
}
// Accounts.emailTemplates.verifyEmail = {
//     subject() {
//         return "Activate your account now!";
//     },
//     text(user, url) {
//         return `Hey ${user}! Verify your e-mail by following this link: ${url}`;
//     }
// };
function titleCase(str){
    if(!str)return;
    return str.charAt(0).toUpperCase() + str.toLowerCase().substring(1);
}