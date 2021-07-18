/**
 * Created by srikanth681 on 29/02/16.
 */
import emailProcessors from './functions.js'

// SyncedCron.add({
//   name    : 'CORN-E1',
//   schedule: function(parser) {
//     return parser.text('every 1 mins');
//   },
//   job     : function() {
//     console.log('CORN-E1 executing ')
//     deactivateProps();
    
//     return true;
//   }
// });
// SyncedCron.add({
//   name    : 'CORN-E1',
//   schedule: function(parser) {
//     return parser.text('every 3 mins');
//   },
//   job     : function() {
//     console.log('CORN-E1 executing ')
//     emailProcessors.dailyPropAlerts()
//     return true;
//   }
// });
SyncedCron.add({
  name    : 'CORN-E15',
  schedule: function(parser) {
    return parser.text('every 15 mins');
  },
  job     : function() {
    console.log('CORN-E15 executing ')

    emailProcessors.emailEnquiryReceived()
    if(!Meteor.Development){
      // importBlogs();//Disabling as migration to new wordpress has changed the import json format, so the old code doesnt work anymore. 
    }

    return true;
  }
});
SyncedCron.add({
  name    : 'CORN-E1D',
  schedule: function(parser) {
    return parser.text('every 1 day');
  },
  job     : function() {
    console.log('CORN-E1D executing ')
    // emailProcessors.reminderUploadReferences()
    deactivateProps();
    return true;
  }
});
Meteor.startup(function () {
  // deactivateProps();  
  if(!process.env.MAIL_URL)console.log('Env URL is empty : ' + process.env.MAIL_URL)
  if(!process.env.MAIL_URL)process.env.MAIL_URL = 'smtp://dev%40spotmycrib.ie:b399dbc946d2ef90dac4a1c3414d31dc-1d8af1f4-9c3055ea@smtp.mailgun.org:587';
})

SyncedCron.start();




// SyncedCron.add({
//   name: 'Auctions are completed. Send mails to users who won aucitons.',
//     schedule: function(parser) {//12 am of everyday
//     // parser is a later.parse object
//     //return parser.text('every 2 hours');
//     //var gloablConfig = ReactionCore.Collections.Config.findOne()
//     //return parser.recur().on(parseInt(gloablConfig.auctionEndDay)+1).month();
//     return parser.text('at 12:00am every day');
//   },
//   job: function() {
//     // sendAuctionWonMails();
//     processRefunds();
//     return true;
//   }
// });