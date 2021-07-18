/**
 * Created by srikanth681 on 29/02/16.
 */

sendAuctionWonMails = function(){
  //To be executed at 12:00 am, mid night, once the day is closed.

  today = new Date();
  yesterday = new Date(today);
  yesterday.setDate(today.getDate() - 1);
  var start = yesterday
  // start.setHours(0,0,0,0);
  start = start.setHours(0,0,0,0);
  start = new Date(start)
  var end = yesterday
  end.setHours(23,59,59,999);

  // debugger;
  // var AuctionDocuments = Collections.Auctions.find({endDate:{$gte: start, $lte: end}},{
  //   transform: function(doc){
  //     if(doc.highestBid)
  //       doc.highestBidUser = Meteor.users.findOne({_id:doc.highestBid});
  //     if(doc.secondHighestBidUser)
  //       doc.secondHighestBidUser = Meteor.users.findOne({_id:doc.secondHighestBid});
  //
  //     return doc;
  //   }
  // }).fetch();

  var globalConfig = Collections.Config.findOne();

  //fetch list to whom highest bid email is to be send
  var AuctionDocuments = Collections.Auctions.find({
      "endDate": {$lte: end},
      $or      : [
        {"highestBid": {$ne: ""}, "isHighestBidWonEmailSent": false},
        {"secondHighestBid": {$ne: ""}, "isSecondHighestBidWonEmailSent": false}]
    },
    {
    transform: function(doc){
      if (doc.highestBid && !doc.isHighestBidWonEmailSent)
        doc.highestBidUser = Meteor.users.findOne({_id:doc.highestBid});
      if (doc.secondHighestBid && !doc.isSecondHighestBidWonEmailSent)
        doc.secondHighestBidUser = Meteor.users.findOne({_id:doc.secondHighestBid});

      return doc;
    }
  }).fetch();

  for (var i = 0; i < AuctionDocuments.length; i++) {
    var auction                   = AuctionDocuments[i]
    var endDate = new Date(auction.endDate);
    var firstHigestBidderEndDate = new Date(endDate.setDate(endDate.getDate() + 2));
    var secondHigestBidderEndDate = new Date(endDate.setDate(endDate.getDate() + 4));

    if (auction.highestBidUser && !auction.isHighestBidWonEmailSent) {
      var mailDataHighestBidUser = {
        template: 'userWonBid',
        subject: "Congratulation! You have placed the winning bid.",
        mailTo: auction.highestBidUser.profile.email,
        //mailTo: 'srikanth681@gmail.com',
        homepage: Meteor.absoluteUrl(),
        auction: auction,
        user:auction.highestBidUser,
        endDate: endDate.toDateString(),
        firstHigestBidderEndDate: firstHigestBidderEndDate.toDateString(),
        secondHigestBidderEndDate: secondHigestBidderEndDate.toDateString(),
        conf: globalConfig
      }
      Meteor.call('sendNotificationEmail',mailDataHighestBidUser)
      var smsText = 'Hi ' + auction.highestBidUser.profile.name + '. Congratulations! You bid is the highest. Login to SpotMyCrib and confirm your unit!';
      Meteor.call('sendSMS',[auction.highestBidUser.profile.mobile, smsText]);

      //update email sent flag
      Collections.Auctions.update({_id: auction._id},
        {$set: {isHighestBidWonEmailSent: true}});
    }
    if (auction.secondHighestBidUser && !auction.isSecondHighestBidWonEmailSent) {
      var mailDataSecondHighestBidUser = {
        template: 'userAnnouncedAsSecondHigest',
        subject: "Congratulations! You have placed the 2nd highest bid.",
        mailTo: auction.secondHighestBidUser.profile.email,
        //mailTo: 'srikanth681@gmail.com',
        homepage: Meteor.absoluteUrl(),
        auction: auction,
        user:auction.secondHighestBidUser,
        endDate: endDate.toDateString(),
        firstHigestBidderEndDate: firstHigestBidderEndDate.toDateString(),
        secondHigestBidderEndDate: secondHigestBidderEndDate.toDateString(),
        conf: globalConfig
      }
      Meteor.call('sendNotificationEmail',mailDataSecondHighestBidUser)
      var smsText = 'Hi '+auction.secondHighestBidUser.profile.name+'. You have placed the 2nd highest bid. You have a chance to buy it. Login to follow the post-auction procedure closely.';
      Meteor.call('sendSMS',[auction.secondHighestBidUser.profile.mobile, smsText]);

      //update email sent flag
      Collections.Auctions.update({_id: auction._id},
        {$set: {isSecondHighestBidWonEmailSent: true}});
    }
  }

  return true;
}
notYetARegisteredBidder = function(){
  var today = new Date()
  var start = new Date(today.getYear() , today.getMonth() , today.getDate() , today.getHours() , today.getMinutes(), 0, 0);
  var end = new Date(today.getYear() , today.getMonth() , today.getDate() , today.getHours() , today.getMinutes(), 59, 999);

  // var data = Meteor.users.find({
  //   "profile.isRegisteredBidder":false,
  //   createdAt:{$gte: start, $lte: end}
  // }).fetch();
  var data = Meteor.users.find({
    "profile.hasSignedUpButNotPaidRegistrationAmount": true,
    "profile.isRegistrationPaymentReminderSent"      : false
  }).fetch();

  var globalConfig = Collections.Config.findOne();

  for(var i=0;i<data.length;i++) {
    var user = data[i]

    var mailData = {
      template: 'notYetARegisteredBidder',
      subject : "Created account but not paid Rs 499",
      //mailTo: 'srikanth681@gmail.com',
      mailTo  : user.profile.email,
      homepage: Meteor.absoluteUrl(),
      user    : user,
      conf    : globalConfig
    }
    Meteor.call('sendNotificationEmail', mailData)
    ///////////////////////////MAIL CODE END  - SMS CODE START ////

    var smsText = 'Hi ' + user.profile.name + '. Now that you have signed in, select an apartment and proceed to bid by paying an auction amount of Rs.499';
    Meteor.call('sendSMS', [user.profile.mobile, smsText]);

    ///////////////////////////SMS END  - SMS CODE START ////

    //update email remidner flags
    Meteor.users.update({"_id": user._id}, {
      $set: {
        "profile.isRegistrationPaymentReminderSent": true
      }
    });
  }
}
notYetBidOnProperty = function(){
  // debugger;
  var auctionDocuments = Collections.Auctions.find({
      propertyConfirmationNotificationNeededForBidders: {$exists: true, $ne: []},
    },
    {
      transform: function (doc) {
        doc.userDocuments = Meteor.users.find({
            _id: {$in: doc.propertyConfirmationNotificationNeededForBidders}
          }
        ).fetch();

        return doc;
      }
    }).fetch();

  var globalConfig = Collections.Config.findOne();

  //loop on all auctionDocuments
  for (var i = 0; i < auctionDocuments.length; i++) {
    //loop on all users in auctionDocuments.userDocuments
    for (var j = 0; j < auctionDocuments[i].userDocuments.length; j++) {
      var user = auctionDocuments[i].userDocuments[j];

      var mailData = {
        template: 'notYetBidOnProperty',
        subject : "We have observed that you are yet to place the bid on SpotMyCrib.",
        //mailTo: 'srikanth681@gmail.com',
        mailTo  : user.profile.email,
        homepage: Meteor.absoluteUrl(),
        user    : user,
        conf    : globalConfig
      }
      Meteor.call('sendNotificationEmail', mailData)
      ///////////////////////////MAIL CODE END  - SMS CODE START ////

      var smsText = 'Hi ' + user.profile.name + '. You are now a registered bidder, but have not placed your bid. Avail the apartment by outbidding current highest bid.';
      Meteor.call('sendSMS', [user.profile.mobile, smsText]);

      ///////////////////////////SMS END  - SMS CODE START ////

      //update email reminder flags
      Collections.Auctions.update({_id: auctionDocuments[i]._id},
        {
          $pull: {
            propertyConfirmationNotificationNeededForBidders: user._id
          }
        });
    }
  }

};
processRefunds = function(){
  //To be executed at 12:00 am, mid night, once the auction winner is diclared, auction is closed 5 days ago.
  today = new Date();
  yesterday = new Date($today);
  yesterday.setDate(today.getDate() - 5);
  var start = yesterday
  start = start.setHours(0,0,0,0);
  start = new Date(start)
  var end = yesterday
  end.setHours(23,59,59,999);

  //isAuctionConfirmed: true
  var data = Collections.Auctions.find({endDate:{$gte: start, $lte: end}},{}).fetch();

  for(var i=0;i<data.length;i++){
    var auction = data[i]
    var user;
    for (var i=0;i<auction.registeredBidders.length;i++){
      userId = auction.registeredBidders[i]

      if(auction.highestBid == userId && !auction.highestBidWithdrawed){continue;}
      if(auction.highestBidWithdrawed && auction.secondHighestBid){continue;}
      //if(auction.auctionConfirmedUser  == userId ){continue;}

      var payment = Collections.Payments.findOne({_id:userId, auctionId:auction._id });
      Meteor.call('requestRefund',[payment._id,'Bidder registration amount refunded as unit is confirmed to another user.'])
    }


    //var mailDataHighestBidUser = {
    //  template: 'userWonBid',
    //  subject: "Congratulation! You have placed the winning bid.",
    //  mailTo: auction.highestBidUser.profile.email,
    //  //mailTo: 'srikanth681@gmail.com',
    //  homepage: Meteor.absoluteUrl(),
    //  data: auction,
    //  conf: globalConfig
    //}
    //var mailDataSecondHighestBidUser = {
    //  template: 'userAnnouncedAsSecondHigest',
    //  subject: "Congratulations! You have placed the 2nd highest bid.",
    //  mailTo: auction.highestBidUser.profile.email,
    //  //mailTo: 'srikanth681@gmail.com',
    //  homepage: Meteor.absoluteUrl(),
    //  data: auction,
    //  conf: globalConfig
    //}
    //Meteor.call('sendNotificationEmail',mailDataHighestBidUser)
    //Meteor.call('sendNotificationEmail',mailDataSecondHighestBidUser)

  }

  return true;
}


/*


 transform: function(doc){
 doc.registeredBidUsers = []
 if(doc.registeredBidders){
 for (var i=0;i<doc.registeredBidders.length;i++){
 if(doc.highestBid == doc.registeredBidders[i] && !doc.highestBidWithdrawed){continue;}
 if(doc.highestBidWithdrawed && doc.secondHighestBid){continue;}
 //if(doc.auctionConfirmedUser  == doc.registeredBidders[i] ){continue;}
 var user = Meteor.users.findOne({_id:doc.registeredBidders[i] });
 doc.registeredBidUsers.push(user);
 }
 }
 return doc;
 }



 var user;
 for (var i=0;i<auction.registeredBidUsers.length;i++){
 user = auction.registeredBidUsers[i]
 var payment = Collections.Payments.findOne({_id:user._id, auctionId:auction._id });
 Meteor.call('requestRefund',[payment._id,'Bidder registration amount refunded as unit is confirmed to another user.'])
 }

 */
