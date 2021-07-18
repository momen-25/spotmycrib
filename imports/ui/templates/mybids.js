/**
 * Created by srikanth681 on 20/02/16.
 */

function numDifferentiation(val) {
    if(val >= 1000000000) val = (val/1000000000).toFixed(2) + ' Billion';
    else if(val >= 1000000) val = (val/1000000).toFixed(2) + ' Million';
    return val.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
}


Template.accountMyBids.onCreated(function(){
  //debugger;
  Meteor.call('getDateFromServer',[],function(error, success){
    Session.set('getDateFromServer',success)
  })
  Session.set('globalConfig', Collections.Config.findOne());
  Session.set('enableDelayedFunctions',false);
})

Template.accountMyBids.helpers({
  data : function () {
    var user =  Accounts.user();
    var userId = user._id;
    console.log("Current User: "+userId);

    if(Session.get('enableDelayedFunctions')){
      if(Session.get('showConfirmFancyBox') && Session.get('showConfirmFancyBoxPaymentSuccess')){
        $.fancybox({
          'padding': 0,
          'href': '#fully-confirm',
          afterClose:function(){
            Session.set('showConfirmFancyBox',false)
          }
        });
        Session.set('showConfirmFancyBox',false)
      }
    }



    var Bids = Collections.Bids;


    /////PAGINATION
    var resultsPerPage = 10;
    var currentPageNo = Router.current().params.pageno;
    if(!currentPageNo){currentPageNo = 1}
    var skip = (currentPageNo -1) * resultsPerPage;
    var urlBase = 'accounts/mybids/';

    var user =  Accounts.user();
    var userId = user._id;
    var totalResultsCount =Collections.Bids.find({}).count()

    var ret = Collections.Bids.find({userId:userId}, {
      transform: function(doc) {
        doc.isMyBidsPage = true;
        doc.bid = doc;
        doc.unit = Collections.Units.findOne({
          _id: doc.unitId
        });
        var auction = Collections.Auctions.find({
          _id: doc.auctionId
        }).fetch();
        doc.auction = auction[0];
        if(!doc.unit) return doc;
        doc.project = Collections.Properties.findOne({
          _id: doc.unit.projectId
        });
        doc.pricing = {
          "currentprice": doc.project.developersCurrentPrice,
          "currentpriceTot": numDifferentiation(doc.project.developersCurrentPrice * doc.unit.superBuiltUpArea),
          "biddingStartsAt": doc.project.biddingStartsAt ,
          "biddingStartsAtTot": numDifferentiation(doc.project.biddingStartsAt * doc.unit.superBuiltUpArea),
          "bestPricel": doc.project.bestPriceToBuy[0] ,
          "bestPriceu": doc.project.bestPriceToBuy[1] ,
          "bestPricelTot": numDifferentiation(doc.project.bestPriceToBuy[0] * doc.unit.superBuiltUpArea),
          "bestPriceuTot": numDifferentiation(doc.project.bestPriceToBuy[1] * doc.unit.superBuiltUpArea)
        }

        //TOTAL SAVED CALCULATION
        var userBid = doc.yourBid.basePrice;
        var developerBid = doc.project.developersCurrentPrice;
        var superBuiltUpArea = doc.unit.superBuiltUpArea;
        var developerUnitTotalAllInclusive = doc.unit.priceBreakUp.totalAllInclusive;

        var priceWithOutSuperBuildUpArea = developerUnitTotalAllInclusive - (developerBid*superBuiltUpArea)
        //var newTotalAllInclusive = priceWithOutSuperBuildUpArea + (userBid*superBuiltUpArea)
        var newTotalAllInclusive = doc.yourBid.total

        doc.totalSaved = developerUnitTotalAllInclusive - newTotalAllInclusive;
        return doc;
      },
      sort: {
        createdAt: -1
      },
      limit: resultsPerPage,
      skip: skip
    });
    //console.log("Getting Data");
    //console.log(ret);


    return {
      results: ret,
      hasResults:totalResultsCount ? true: false ,
      totalResultsCount:totalResultsCount,
      pagination: getPaginationData(totalResultsCount,currentPageNo,urlBase,resultsPerPage)
    };
  },
  getClass: function(index){
    if(this.isArchived)return "archive";
    if(index == 0)return "active";
    else return "border-top";
  },
  assistanceAlreadyRequested: function(){
    //Just to make this reactive
    var user = Meteor.user();
    return user.profile.assistanceRequested || Session.get('assistanceRequested');
  }
})


Template.mybidsUnitDetail.helpers({
  biddingStatus: function(){
    //console.log('Calculating biddingStatus')
    var isHigestBidder =false, isSecondHigestBidder =false, hasPlacedWinningBid =false, hasPlacedSecondHigestWinningBid =false, hasWonAuctionConfirmed =false, isArchived =false, showOutBid=false, showOutBidConfirm=false;
    if(Meteor.userId() == this.auction.highestBid) {
      isHigestBidder = true;
      isSecondHigestBidder = false;
      hasPlacedWinningBid = false;
      hasWonAuctionConfirmed = false;
      isArchived = false;
    }
    if(Meteor.userId() == this.auction.secondHighestBid) {
      isHigestBidder = false;
      isSecondHigestBidder = true;
      hasPlacedWinningBid = false;
      hasWonAuctionConfirmed = false;
      isArchived = false;
    }
    var getDateFromServer = Session.get('getDateFromServer');
    getDateFromServer = new Date(getDateFromServer);
    //console.log(getDateFromServer);
    if(!getDateFromServer){}//No date from server, below logic won't work.
    else {
      var day = getDateFromServer.getDate();
      var gloablConfig  = Session.get('globalConfig');
      var auctionEndDay = gloablConfig.auctionEndDay;

      if(!isHigestBidder && day <= auctionEndDay ){
        showOutBid = true;
      }
      if (Meteor.userId() == this.auction.highestBid && day > auctionEndDay && day <= auctionEndDay+2) {
        isHigestBidder = false;
        isSecondHigestBidder = false;
        showOutBid = false;
        hasPlacedSecondHigestWinningBid = false;
        hasPlacedWinningBid = true;
        hasWonAuctionConfirmed = false;
        isArchived = false;
      }
      if (Meteor.userId() == this.auction.secondHighestBid  && day > auctionEndDay && day <= auctionEndDay+2 ) {
        //U r 2nd higest bidder and Bidding is closed, So u can't outbid anyone.
        isHigestBidder = false;
        isSecondHigestBidder = false;
        showOutBid = false;
        hasPlacedSecondHigestWinningBid = true;
        hasPlacedWinningBid = false;
        hasWonAuctionConfirmed = false;
        isArchived = false;
      }
      if (Meteor.userId() == this.auction.secondHighestBid && day > auctionEndDay+2 && day <= auctionEndDay+4) {
        isHigestBidder = false;
        isSecondHigestBidder = false;
        showOutBid = false;
        hasPlacedSecondHigestWinningBid = false;
        hasPlacedWinningBid = true;
        hasWonAuctionConfirmed = false;
        isArchived = false;
      }


    }
    if(this.isConfirmationAmountPaid) {
      isHigestBidder = false;
      isSecondHigestBidder = false;
      showOutBid = false;
      hasPlacedSecondHigestWinningBid = false;
      hasPlacedWinningBid = false;
      hasWonAuctionConfirmed = true;
      isArchived = false;
    }
    if(this.isArchived) {
      isHigestBidder = false;
      isSecondHigestBidder = false;
      showOutBid = false;
      hasPlacedSecondHigestWinningBid = false;
      hasPlacedWinningBid = false;
      hasWonAuctionConfirmed = false;
      isArchived = true;
    }
    mybidsJqueryEvents();

    if(Template.instance().showRequireConfirmation.get() && showOutBid){
      showOutBid = false;
      showOutBidConfirm = true;
    }


    return {
      "isHigestBidder":isHigestBidder,
      "showOutBid":showOutBid,
      "showOutBidConfirm":showOutBidConfirm,
      "hasPlacedWinningBid":hasPlacedWinningBid,
      "hasPlacedSecondHigestWinningBid":hasPlacedSecondHigestWinningBid,
      "hasWonAuctionConfirmed":hasWonAuctionConfirmed,
      "isArchived":isArchived
    }
  },
  time: function(){
    var timestamp = TimeSync.serverTime(null, 30000);

    //var dend = Date.parse(product.Bidding.ends_at );
    var dend = Date.parse(this.auction.endDate);
    var timeDiff = Math.abs(dend - timestamp );
    var day = Math.floor(timeDiff / (1000 * 3600 * 24))
    var hour = Math.floor(timeDiff / (1000 * 3600 ))
    var min = Math.floor(timeDiff / (1000 * 60 ) )
    hour = hour - (day * 24);
    min = min - (day * 24* 60) - (hour * 60);
    return {"day":day,"hour":hour,"min":min}
  },
  isAuctionClosed:function(){
    var timestamp = TimeSync.serverTime(null, 1000);
    var dend = Date.parse(this.auction.endDate);
    var timeDiff = dend - timestamp;
    if(timeDiff<=0){
      return true;
    }
    return false;
  }
})
Template.mybidsUnitDetail.onCreated(function(){
  this.expanded = new ReactiveVar( false );
  this.showRequireConfirmation = new ReactiveVar( false );
  this.showBidAlreadyPlaced = new ReactiveVar( false );
  this.showOutBid = new ReactiveVar( true );
})
Template.mybidsUnitDetail.events({//NOT WORKING; EVENTS DOESN'T FIRE
  "click .bidConfirmBtn":function(){
    console.log("bidConfirmBtn clicked")
    $('.payNowBtn').attr('bidid',this._id);
    $('.amountSaved').html(numDifferentiation(this.totalSaved));
    $.fancybox({
      'padding': 0,
      'href': '#paynow-div'
    });
  },
  "click .bidWithdrawBtn":function(){
    console.log(this)
    $('.amountSaved').html(numDifferentiation(this.totalSaved));
    $('.withdrawConfirmBtn').attr('bidid',this._id);
    $.fancybox({
      'padding': 0,
      'href': '#withdraw-pop'
    });
  },
  "click .showSubaPopup": function(event, template){

    $('.subaCarpetArea').html(template.data.priceBreakUp.sbuaBreakUp.carpetArea+"  sq.ft");
    $('.subaBuiltUpArea').html(template.data.priceBreakUp.sbuaBreakUp.buildupArea+"  sq.ft");
    $('.subaCommonArea').html(template.data.priceBreakUp.sbuaBreakUp.commonArea+"  sq.ft");
    $('.subaSuperBuiltUpArea').html(template.data.priceBreakUp.sbuaBreakUp.superBuildupArea+"  sq.ft");
    $.fancybox({
      'padding': 0,
      'href': '#super-bulit-up-area-popup'
    });
  },
  "click .outBidBtn": function (event, template) {
    console.log("outBidBtn event")
    template.showRequireConfirmation.set(true);

  },
  "click .outBidCancelBtn": function(event, template){
    template.showRequireConfirmation.set(false);
  },
  "click .outBidConfirmBtn": function(event, template){
    console.log("outBidConfirmBtn event")

    var auctionId = event.target.value;

    var user  = Meteor.user();
    //console.log(event)
    //console.log(template)
    //console.log(user)
    //console.log(auctionId)
    $('.outBidSuccessUnitNo').html(template.data.unit.unitNumber);

    Meteor.call('updateOutBid',[template.data._id, auctionId],function(error, result){
      if(error){
        console.log(error.reason);
        return;
      }
      $.fancybox({
        'padding': 0,
        'href': '#outBidSuccess-popup'
      });
      template.showRequireConfirmation.set(false);
    })

  }
})

Template.mybidsUnitDetail.onRendered(function(){
  mybidsJqueryEvents();
console.log("On rendered")
  console.log(this)
  var bidid = Router.current().params.query.bidid;
  if(this.data._id == bidid){
    console.log("Setting auto expand: "+bidid)
    Session.set('adjustAutoExpandToUnitID',unitid)
    $('.fullyConfirmBlgUnitNumber').html(this.data.unit.unitNumber)
    Session.set('showConfirmFancyBox',true)
  }
})
Template.accountMyBids.onRendered(function(){
  mybidsJqueryEvents();
  var transactionid = Router.current().params.query.transactionid;
  if(transactionid) {
    console.log('Payment found')
    var payment_id = Router.current().params.query.payment_id;
    var payment_request_id = Router.current().params.query.payment_request_id;
    var paymentpurpose = Router.current().params.query.paymentpurpose;
    var userid = Router.current().params.query.userid;
    var bidId = Router.current().params.query.bidid;
    if(payment_id && payment_request_id) {
      console.log('Payment validated')
      if(paymentpurpose=='BidderRegistration'){
        Meteor.call('updateBidderRegistrationPaymentStatus',
          [transactionid,payment_id,payment_request_id,userid],
          function(error, result){
            var unitid = Session.get('adjustAutoExpandToUnitID');
            if(unitid){
              setTimeout(function(){$('html,body').animate({scrollTop: $('#unit_'+unitid).offset().top }, 1000)}, 1000)
            }

            if(error){
              return;
            }
            $('#unitPaymentSuccessFancyBox-popup .status').text(' is successful.')
            Session.set('showUnitPaymentSuccessFancyBox',true)

          });
      }


      else if(paymentpurpose=='UnitConfimation'){
        Meteor.call('updateUnitConfimationPaymentStatus',
          [transactionid,payment_id,payment_request_id,userid, bidId],
          function(error, result){
            var unitid = Session.get('adjustAutoExpandToUnitID');
            if(unitid){
              setTimeout(function(){$('html,body').animate({scrollTop: $('#unit_'+unitid).offset().top }, 1000)}, 1000)
            }

            if(error){
              console.log(error.reason);
              return;
            }
            Session.set('showConfirmFancyBoxPaymentSuccess',true)

          });
      }


    }
  }

  callDelayedFunctions();

})
callDelayedFunctions = function(){
  setTimeout(delayedFunctions, 2000);
}

// function delayedFunctions(){// Defined in auctionDetailUnitList.js
//   Session.set('enableDelayedFunctions',true)
//   $('.fullyConfirmBlgOKBtn').unbind().click(function(){
//     console.log('fullyConfirmBlgOKBtn called');
//     Session.set('showConfirmFancyBox',false)
//     Router.query.clear();
//     $.fancybox.close();
//   })
// }

function mybidsJqueryEvents(){
  $('.payNowBtn').unbind().click(function(){
    console.log("jquery event payNowBtn")
    console.log(this)
    var redirectURL = Router.current().originalUrl;
    if(redirectURL.indexOf('http:') == -1) {
      var redirectURL = Meteor.absoluteUrl() + Router.current().originalUrl.substring(1);
    }
    var bidId = $(this).attr('bidid');
    Meteor.call("getUnitConfirmationPaymentURL",[redirectURL,bidId], function(error, result){
      if(error){
        console.log(error.reason);
        return;
      }
      console.log(result)
      window.location.href = result;
    })
  })
  $('.withdrawConfirmBtn').unbind().click(function(){
    console.log("jquery event withdrawBtn")
    console.log(this)
    var bidId = $(this).attr('bidid');
    Meteor.call("archiveBid",[bidId], function(error, result){
      if(error){
        console.log(error.reason);
        return;
      }
      console.log(result)
      $.fancybox.close();
    })
  })
  $('.cancelBtn').unbind().click(function(){
    console.log('event cancelBtn jquery')
    $.fancybox.close();
  })
}
function getPaginationData(totalResultsCount,currentPageNo,urlBase, resultsPerPage){
  var pages = [], prevPage = {}, nextPage={};
  var pgMin = currentPageNo-4, pgMax = currentPageNo+ 5, maxPages = Math.floor(totalResultsCount/resultsPerPage);
  if(pgMin<1)pgMin =1;
  if(pgMin>maxPages)currentPageNo =maxPages;
  for (var i=pgMin; i<=maxPages;i++){
    var href = urlBase+i+"/";
    if(i== currentPageNo) href = 'javascript:void(0);';
    pages.push({
      "href": href,
      "text": i
    })
  }
  var prevPageNo = currentPageNo- 1, nextPageNo=currentPageNo+ 1;
  if(prevPageNo<1){
    prevPage['href'] = 'javascript:void(0);';
    prevPage['text'] = 'Previous';
  }else{
    prevPage['href'] = urlBase+prevPageNo+"/";
    prevPage['text'] = 'Previous';
  }
  if(nextPageNo>maxPages)nextPageNo =maxPages;
  if(nextPageNo == currentPageNo){
    nextPage['href'] = 'javascript:void(0);';
    nextPage['text'] = 'Next';
  }else{
    nextPage['href'] = urlBase+nextPageNo+"/";
    nextPage['text'] = 'Next';
  }
  return {
    "prevPage":prevPage,
    "pages":pages,
    "nextPage": nextPage
  }
}
