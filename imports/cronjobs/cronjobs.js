/**
 * Created by srikanth681 on 29/02/16.
 */


SyncedCron.add({
  name: 'Auctions are completed. Send mails to users who won aucitons.',
    schedule: function(parser) {//12 am of everyday
    // parser is a later.parse object
    //return parser.text('every 2 hours');
    //var gloablConfig = Collections.Config.findOne()
    //return parser.recur().on(parseInt(gloablConfig.auctionEndDay)+1).month();
    return parser.text('at 12:00am every day');
  },
  job: function() {
    // sendAuctionWonMails();
    processRefunds();
    return true;
  }
});
SyncedCron.add({
  name    : 'Cron ALWAYS',
  schedule: function(parser) {
    return parser.text('every 3 mins');
  },
  job     : function() {
    console.log('Server Cron ALWAYS executing ')
    // sendAuctionWonMails();
    notYetARegisteredBidder();
    notYetBidOnProperty();
    sendAuctionWonMails();

    //Meteor.call('sendNotificationEmail',{
    //  template: "bidSuccessfullyPlaced",
    //  subject: "subject",
    //  mailTo: 'srikanth681@gmail.com',
    //  homepage: Meteor.absoluteUrl(),
    //  user:{
    //    "username" : "jns"
    //  }
    //})
    //debugger;
    return true;
  }
});

// SyncedCron.start();

