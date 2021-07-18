// import "./collections.js";
import {check} from "meteor/check";
import {Meteor} from "meteor/meteor";

function numDifferentiation(val) {
    if(val >= 1000000000) val = (val/1000000000).toFixed(2) + ' Billion';
    else if(val >= 1000000) val = (val/1000000).toFixed(2) + ' Million';
    return val.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
}
function titleCase(str){
    if(!str)return;
    return str.charAt(0).toUpperCase() + str.toLowerCase().substring(1);
}

Meteor.methods({
  placeBid: function(args){
      check(args[0], String);
      check(args[1], Number);
      check(args[2], String);
      if(args[3])check(args[3], String);
      // check(price, Number);
      var auctionId = args[0];
      var price = args[1];
      var bidMessage = args[2];
      let userIdPassed = false;
      if(args[3])userIdPassed = args[3];
      bidMessage = bidMessage.substring(0,500);
      console.log("server method outBid called: " + auctionId)

      let userId  = '';
      if(!userIdPassed)userId = Meteor.userId();
      else userId = userIdPassed;
      var biduser         = Meteor.users.findOne({_id:userId})

      const auction = Collections.Auctions.findOne(auctionId);
      const property = Collections.Properties.findOne(auction.propertyId);

      const bid = Collections.Bids.findOne({
          "auctionId": auctionId,
          "userId"   : userId
      });
      const emailEnquiry = Collections.EmailEnquiries.findOne({
          "auctionId": auctionId,
          "email"   : biduser.profile.email
      });
      if (bid) {
          throw new Meteor.Error(500, 'Error 500: Bid exists', 'Please wait, there might be network lag.');
      }

      var bidData = {
          "auctionCode"             : auction.lettingAuctionCode,
          "auctionId"               : auctionId,
          "userId"                  : userId,
          "yourBid"                 : price,
          "bidMessage"              : bidMessage,
          "isArchived"              : false,
          "chosen"                  : false
      }
      let bidId = Collections.Bids.insert(bidData);
      if(bidMessage){
          Accounts.users.update(userId,{
              $set: {
                  "profile.personalMessage" :bidMessage
              }
          });
      }
      if(emailEnquiry){//Enquiry exists, deactivate it as now it converted into an application.
          Collections.EmailEnquiries.update({_id:emailEnquiry._id},{$set:{isArchived:true,bidId:bidId}})
      }


      const agent = Accounts.users.findOne(property.createdByAgent);
      if(!agent.profile.totalBidsReceived)agent.profile.totalBidsReceived=0
      if(!agent.profile.bidsReceivedActiveAuctions)agent.profile.bidsReceivedActiveAuctions=0
      if(!agent.profile.bidProfitActive)agent.profile.bidProfitActive=0
      if(!agent.profile.totalBidProfit)agent.profile.totalBidProfit=0
      agent.profile.totalBidsReceived++;
      agent.profile.bidsReceivedActiveAuctions++;
      if(price>auction.price){//Its in profit
          var profit = price -  auction.price;
          var oldProfit = auction.auctionBidProfit;
          if(!oldProfit)oldProfit = 0;

          if(profit > oldProfit){
              //Update auction with auctionProfit as we hv a new highest profit
              Collections.Auctions.update(auction._id, {
                  $set: {
                      "auctionBidProfit": profit
                  }
              });
              agent.profile.bidProfitActive = agent.profile.bidProfitActive + (profit - oldProfit);
              agent.profile.totalBidProfit = agent.profile.totalBidProfit + (profit - oldProfit);
          }else{
              //U already hv highest added to auctionBidProfit and agents bidProfit, so do nothing
          }

      }
      Collections.Auctions.update(auction._id, {
          $inc: {
              "bids": 1
          }
      });


      Accounts.users.update(agent._id,{
          $set: {
              "profile.totalBidsReceived" :agent.profile.totalBidsReceived,
              "profile.bidsReceivedActiveAuctions" :agent.profile.bidsReceivedActiveAuctions,
              "profile.bidProfitActive" :agent.profile.bidProfitActive,
              "profile.totalBidProfit" :agent.profile.totalBidProfit,
          }
      });

      // Meteor.call('requestEmail',{
      //     userId: biduser._id,
      //     requestType: 'reminderUploadReferences',//This is an Ack email for all the emailEnqueries placed by user in a group of 15mns.
      //     propertyId: property._id
      // });

      ///////////////////////////MAIL CODE - Bid Successfully Placed
      property.type = titleCase(property.type);
      property.address.address = titleCase(property.address.address);
      property.address.area = titleCase(property.address.area);
      property.address.county = titleCase(property.address.county);
      var globalConfig = Collections.Config.findOne();
      let userFirstName = biduser.profile.name;
      if(userFirstName){
          userFirstName = titleCase(userFirstName.split(' ')[0]);
      }
      let propertyImage = '';
      if(property.gallery){
          if(property.gallery[0])propertyImage = property.gallery[0]
          propertyImage.titleText = 'Photo 1 of ' + property.address.address + (property.address.area ? ", " + property.address.area : '') + (property.address.county ? ", " + property.address.county : '');
      }
      var mailData     = {
          template    : 'applicationPlaced',
          subject     : "Application Successfully Placed",
          mailTo      : biduser.profile.email,
          // replyTo      : agent.profile.email,//He just placed the application, don't reveal the email yet, agent needs to start the communication first.
          //mailTo: 'srikanth681@gmail.com',
          // homepage    : Meteor.absoluteUrl(),//its done by sendNotificationEmail
          propertyURL: FlowRouter.url('rent', {
                          slug: property.slug,
                          key: auction.lettingAuctionCode
                      }),
          application : bidData,
          auction     : auction,
          project     : property,
          user        : biduser,
          userFirstName      : userFirstName,
          propertyImage      : propertyImage,
          agentName        : agent.profile.name,
          agentEmail        : agent.profile.email,
          bedsCount   : property.bedrooms.length,
          offerFormated: numDifferentiation(bidData.yourBid),
          rentFormated: numDifferentiation(auction.price)
      };
      Meteor.call('sendNotificationEmail', mailData);
      
      var mailData     = {
          template    : 'applicationReceived',
          subject     : "Application Received",
          mailTo      : agent.profile.email,
          replyTo     : biduser.profile.email,//Agent can reach out to the person directly
          //mailTo: 'srikanth681@gmail.com',
          // homepage    : Meteor.absoluteUrl(),//its done by sendNotificationEmail
          application : bidData,
          auction     : auction,
          project     : property,
          user        : biduser,
          agent        : agent,
          bedsCount   : property.bedrooms.length,
          offerFormated: numDifferentiation(bidData.yourBid),
          rentFormated: numDifferentiation(auction.price)
      };
      Meteor.call('sendNotificationEmail', mailData);

      Meteor.call('addActivityHistory', {propertyId:auction.propertyId,auctionId:auction._id,type:'applicationReceived',userId:biduser._id,name:biduser.profile.name,email:biduser.profile.email,userIdPassed:userIdPassed});


      ///////////////////////////MAIL CODE END  - SMS CODE START ////

      var smsText = 'Hi ' + biduser.profile.name + '. We have mailed your bid details and the total price to your registered mail id.';
      // Meteor.call('sendSMS', [user.profile.mobile, smsText]);

      return {
          status : 'Success',
          bidData: bidData
      }


  },
  getDateFromServer: function (args) {
    check(args, [Match.Any]);
    return new Date;
  },
  updateViews:function (auctionId) {
    // console.log("updateViews called for: "+auctionId)
      Collections.Auctions.update(auctionId,{
          $inc:{
              "views":1
          }
      })
  },
  withdrawBid: function(auctionId){
    console.log('withdrawBid called')

    check(auctionId, String);
    var userId = Meteor.userId();

    const bid = Collections.Bids.findOne({
        auctionId: auctionId,
        userId:userId
    });

      if (bid) {
          throw new Meteor.Error(500, 'Error 500: Bid not found');
      }

    //console.log(userId)
    //console.log(bidId)
    Collections.Bids.update({
      "_id": bidId
    }, {
      $set: {
          "isArchived": true
      }
    });

    return {
      status: 'success'
    }
  },
  sendInviteForViewingEmail: function(args){
        // check(args, Match.Any);
        var bidId = args[0];

        console.log("server method sendInviteForViewingEmail called")
        console.log(bidId);
        var bid = Collections.Bids.findOne(bidId,{
            transform:function (data) {
                data.user = Accounts.users.findOne( data.userId );
                data.auction = Collections.Auctions.findOne( {_id:data.auctionId,isArchived:false });
                data.property = Collections.Properties.findOne( data.auction.propertyId );
                return data;
            }
        });

        if(!bid) throw new Meteor.Error(500, 'Error 500: Invalid application', 'Application not found.');
        if (bid.isArchived)throw new Meteor.Error('This application is withdrawn by the user. Please choose another application.');
        if(!bid.user)throw new Meteor.Error(500, 'Error 500: Invalid user', 'User not found.');
        if(!bid.auction)throw new Meteor.Error(500, 'Error 500: Property not active', 'Active property is needed to send an invite.');
        if(!bid.property)throw new Meteor.Error(500, 'Error 500: Property not active', 'Active property is needed to send an invite.');//In future we will have concept of archiving the property, so the same keywords like 'property not active' just like auction.
        var d = new Date(args[1]);
        if(!d)throw new Meteor.Error(500, 'Error 500: Invalid invite date', 'Please select a valid invite date.');

        var property = bid.property;
        var auction = bid.auction;

        Collections.Bids.update(bidId,{
            $set: {
                invitedDate: new Date()
            }
        });


        var options = {
            weekday: "long", year: "numeric", month: "short",
            day: "numeric", hour: "2-digit", minute: "2-digit"
        };

        const agent = Meteor.user();
        //////////// SEND MAIL to winning user
        property.type = titleCase(property.type);
        property.address.address = titleCase(property.address.address);
        property.address.area = titleCase(property.address.area);
        property.address.county = titleCase(property.address.county);
        var mailData     = {
            template    : 'inviteForViewing',
            subject     : "Invite for viewing",
            mailTo      : bid.user.profile.email,
            replyTo      : agent.profile.email,
            inviteDateFormated      : d.toLocaleTimeString("en-us", options),
            //mailTo: 'srikanth681@gmail.com',
            homepage    : Meteor.absoluteUrl(),
            application : bid,
            auction     : auction,
            project     : property,
            user        : bid.user,
            agent        : Accounts.user(),
            bedsCount   : property.bedrooms.length,
            offerFormated: numDifferentiation(bid.yourBid),
            rentFormated: numDifferentiation(auction.price)
        };
        Meteor.call('sendNotificationEmail', mailData);


        return {
            status: 'Success'
        }


    },
    sendInviteToApplyEmail: function(args){
        // check(args, Match.Any);
        var advertisements = args[0];
        var tenantId = args[1];
        console.log("server method sendInviteToApplyEmail called")

        var tenant = Meteor.users.findOne(tenantId);
        if(!tenant)throw new Meteor.Error(500, 'Error 500: Invalid tenant', 'Tenant not found.');

        console.log(advertisements);
        var results = Collections.Auctions.find({_id : {$in: advertisements}},{
            fields:{
                lettingAuctionCode:1,
                propertyId:1,
                property:1
            },
            transform:function(data){
                data.property = Collections.Properties.findOne(data.propertyId,{
                    fields:{
                        address:1,
                        createdByAgent:1,
                        createdAt:1,
                        updatedAt:1,
                        isArchived:1,
                        auctionId:1
                    }
                });
                return data;
            }

        }).fetch();
        var advertisementCount = results.length;

        console.log(advertisementCount);
        if(!advertisementCount){//Nothing found.
            throw new Meteor.Error(500, 'Error 500: Invalid advertisements', 'Advertisements not found.');
        }


        const agent = Meteor.user();
        //////////// SEND MAIL to winning user
        var mailData     = {
            template    : 'inviteToApply',
            subject     : "Invitation to apply for properties",
            mailTo      : tenant.profile.email,
            replyTo      : agent.profile.email,
            //mailTo: 'srikanth681@gmail.com',
            homepage    : Meteor.absoluteUrl(),
            user        : tenant,
            agent        : Accounts.user(),
            advertisementCount   : advertisementCount,
            advertisements   : results
        };
        // console.log('results are:');
        // console.log(results);
        Meteor.call('sendNotificationEmail', mailData);


        return {
            status: 'Success'
        }


    }
})