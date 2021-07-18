
import {check} from "meteor/check";
// import TokenGen from 'token-gen';

Meteor.methods({
    archiveProperty:function (propertyId) {
        check(propertyId, String);
        console.log("server method archiveProperty called")

        console.log(propertyId);
        const userId = Meteor.userId();
        console.log(userId)

        if (!userId) throw new Meteor.Error('not-authorized');
        const property = Collections.Properties.findOne({
            _id: propertyId
        });

        if (!property)throw new Meteor.Error('Invalid property');

        if (property.createdByAgent != userId)throw new Meteor.Error('Invalid user');
        //PROPERTY BELONGS TO THIS AGENT

        if(property.auctionId) {//if it has an active auction
            Meteor.call('deactivateAuction', property.auctionId, function (error, result) {
                if (error) {
                    throw new Meteor.Error(400, "Deactivation Failed");
                }

            });
        }

        Collections.Properties.update(propertyId, {
            $set: {
                "isArchived": true
            }
        });
    },
    editProperty: function(propertyId, data) {
        console.log("common method editProperty called")

        const userId = Meteor.userId();
        console.log(userId)
        if (!userId) throw new Meteor.Error('not-authorized');

        var property = Collections.Properties.findOne(propertyId);
        if (property.createdByAgent != userId)throw new Meteor.Error('not-authorized');// Its not your property

        var price = getA(data, 'price');

        if(price) {
            var tmpP = price.split('.');
            tmpP = tmpP[0]//No decimals
            price = tmpP.trim().match(/\d+/g).join('');
        }
        if (!price) price = 0;

        // console.log('price is: '+price)
        // console.log('parsed price is: '+parseInt(price))

        var rentMonthly=parseFloat(price);
        if(getA(data,'type')=='weekly') rentMonthly = parseFloat((rentMonthly/7)*30) // Month has 30 days

        var doc = {
            "address" : {
                "address" : getA(data,'address.address'),
                "county" : getA(data,'address.county'),
                "area" : getA(data,'address.area'),
                "country" : "Ireland"
            },
            "rent" : parseInt(price),
            "rentMonthly" : rentMonthly,
            "type" : getA(data,'type'),
            "baths" : parseInt(getA(data,'baths')),
            "furnished" : getA(data,'furnished')=="true" ? true : false,
            "contacts" : [
                {
                    "name" : getA(data,'contacts.0.name'),
                    "phone" : getA(data,'contacts.0.phone'),
                    "email" : getA(data,'contacts.0.email')
                }
            ],
            "about" : getA(data,'about'),
            "amenities" : getA(data,'amenities'),
            "createdByAgent":userId,
            "updatedAt":new Date()
        }
        // {name: "bedrooms.0.ensuite", value: "on"}
        // 8
        // :
        // {name: "bedrooms.0.bedType", value: "single"}
        // "bedrooms" : [
        //     {
        //         "bedType" : "double",
        //         "ensuite" : true
        //     },
        //     {
        //         "bedType" : "single",
        //         "ensuite" : false
        //     }
        // ],

        var numBedRoomCount = getA(data,'numBedRoomCount')
        if( numBedRoomCount ){
            var bedrooms = [];
            for(var i=0; i<numBedRoomCount; i++){
                var bne = "bedrooms."+i+".ensuite"
                var bnt = "bedrooms."+i+".bedType"
                var tmp = {}

                if(getA(data,bne)) tmp.ensuite = true;
                else tmp.ensuite = false;
                tmp.bedType = getA(data,bnt);

                bedrooms.push(tmp)
            }
            doc['bedrooms'] = bedrooms;
            doc['bedCount'] = bedrooms.length;
        }else {
            doc['bedrooms'] = [];
            doc['bedCount'] = '1';//default 1
        }

        // console.log('before');
        // console.log(doc);
        // console.log('after');

        // debugger;

        // Collections.Properties.update(propertyId,{
        //     $set:{
        //         contacts:[],
        //         bedrooms:[]
        //     }
        // });//commeted due to point: editProperty server method has 2 updates one after another - not needed, below code will replace anyways.
        Collections.Properties.update(propertyId,{
            $set:doc
        });

        ////////ADVERTISE FORM DATA
        var advertiseFormActive = getA(data,'advertiseFormActive'); if(advertiseFormActive=='yes') {
            console.log("common method editProperty - editAdvertisement section")

            var lease = getA(data, 'lease')
            var allowedLease = ['1 month', '2 months', '3 months', '4 months', '5  months', '6 months', '7 months', '8 months', '9 months', '10 months', '11 months', '1 year', 'More than a year'];
            if (!lease || allowedLease.indexOf(lease) == -1) lease = 'More than a year'

            var rentType = getA(data, 'rentType')
            var allowedRentType = ['weekly', 'monthly', 'other'];
            if (!rentType || allowedRentType.indexOf(rentType) == -1) rentType = 'monthly'

            var currency = getA(data, 'currency')
            var allowedCurrencies = ["EUR", "POUND", "USD"];
            if (!currency || allowedCurrencies.indexOf(currency) == -1) currency = "EUR"

            var readyFrom = getA(data, 'readyFrom')
            if (!readyFrom) readyFrom = new Date(moment().add(1, 'days').startOf('day'))
            if (readyFrom < new Date(moment().add(1, 'days').startOf('day'))) readyFrom = new Date(moment().add(1, 'days').startOf('day'))


            var adDoc = {
                "price": parseInt(price),
                "currency": currency,
                "readyFrom": readyFrom,
                "lease": lease,
                "rentType": rentType,
                "updatedAt": new Date()
            }

            if (getA(data, 'advertContacts.0.name') || getA(data, 'advertContacts.0.phone') || getA(data, 'advertContacts.0.email')) {
                adDoc['contacts'] = [{
                    "name": getA(data, 'advertContacts.0.name'),
                    "phone": getA(data, 'advertContacts.0.phone'),
                    "email": getA(data, 'advertContacts.0.email')
                }]
            }
            Collections.Auctions.update(property.auctionId,{
                $set:adDoc
            });
        }//End of auctions

    },
    updateGalleries: function(args) {
        console.log(args);
        // check(args, [String, [null]]);
        var propertyId = args[0];
        var galleries = args[1];
        console.log("server method updateGalleries called")

        if (!Meteor.userId()) {
            throw new Meteor.Error('not-authorized');
        }

        const property = Collections.Properties.findOne({
            _id: propertyId
        });

        const userId = Meteor.userId();
        // console.log(userId)
        //console.log(bidId)

        if (!property)throw new Meteor.Error('Invalid property');

        if (property.createdByAgent != userId)throw new Meteor.Error('Invalid user');
        //PROPERTY BELONGS TO THIS AGENT
        console.log(galleries);
        Collections.Properties.update(propertyId, {
            $set: {
                "gallery": galleries
            }
        });

        return {
            status: 'success'
        }

    },
    updateGalleriesInUserProfile: function(galleries) {
        // console.log(galleries);
        console.log("server method updateGalleriesInUserProfile called")

        const userId = Meteor.userId();
        if (!userId) throw new Meteor.Error('not-authorized');


        // console.log(galleries);
        Meteor.users.update(userId, {
            $set: {
                "profile.session.addproperty.gallery": galleries
            }
        });

        return {
            status: 'success'
        }

    },
    addAuction: function(auctionId) {
        check(auctionId, String);
        console.log("server method addAuction called")

        console.log(auctionId);
        const userId = Meteor.userId();
        console.log(userId)

        if (!userId) {
            throw new Meteor.Error('not-authorized');
        }

        const auction = Collections.Auctions.findOne(auctionId);
        if (!auction)throw new Meteor.Error('Invalid auction');

        const property = Collections.Properties.findOne({
            _id: auction.propertyId
        });

        if (!property)throw new Meteor.Error('Invalid property');

        // if(property.auctionId)throw new Meteor.Error('Property already has an auction ID');//NOT NEEDED, LET IT REWRITE

        if (property.createdByAgent != userId)throw new Meteor.Error('Invalid user');
        //PROPERTY BELONGS TO THIS AGENT

        var rentMonthly=parseFloat(auction.price);
        if(auction.rentType=='weekly') rentMonthly = parseFloat((rentMonthly/7)*30) // Month has 30 days

        Collections.Properties.update(auction.propertyId, {
            $set: {
                "auctionId": auction._id,
                "rent": parseInt(auction.price),
                "rentMonthly":rentMonthly
            }
        });

        // var TokenGen = require('token-gen');
        // var auctionCode = TokenGen();
        // console.log(auctionCode);
        // auctionCode = auctionCode.toString()
        // console.log(auctionCode);
        //
        // Collections.Auctions.update(auctionId, {
        //     $set: {
        //         "lettingAuctionCode": auctionCode
        //     }
        // });

        const user = Meteor.user();
        if(!user.profile.activeAuctions)user.profile.activeAuctions=0
        if(!user.profile.totalAuctions)user.profile.totalAuctions=0
        user.profile.activeAuctions++;
        user.profile.totalAuctions++;


        Meteor.users.update(userId,{
            $set: {
                "profile.activeAuctions" :user.profile.activeAuctions,
                "profile.totalAuctions" :user.profile.totalAuctions
            }
        });

        Meteor.call('addActivityHistory', {propertyId:auction.propertyId,auctionId:auction._id,type:'prop_activation',activated:true});


        return {
            status: 'success'
        }

    },
    addAdvertisement: function(data,pid) {
        // check(auctionId, String);
        console.log("server method addAdvertisement called")

        const userId = Meteor.userId();
        console.log(userId)

        if (!userId) {
            throw new Meteor.Error('not-authorized');
        }

        var propertyId = getA(data,'propertyId');
        if(!propertyId && pid)propertyId = pid;
        if(!propertyId){throw  new Meteor.Error('Invalid property ID key. Aborting.');return;}

        const property = Collections.Properties.findOne({
            _id: propertyId
        });

        if (!property)throw new Meteor.Error('Invalid property');

        if (property.createdByAgent != userId)throw new Meteor.Error('Invalid user');
        //PROPERTY BELONGS TO THIS AGENT


        var price = getA(data,'price');

        if(price) {
            var tmpP = price.split('.');
            tmpP = tmpP[0]//No decimals
            price = tmpP.trim().match(/\d+/g).join('');
        }
        if(!price)price=0;

        var lease = getA(data,'lease')
        var allowedLease = ['1 month', '2 months', '3 months', '4 months', '5  months', '6 months', '7 months', '8 months', '9 months', '10 months', '11 months', '1 year', 'More than a year'];
        if(!lease || allowedLease.indexOf(lease) == -1 ) lease= 'More than a year'

        var rentType = getA(data,'rentType')
        var allowedRentType = ['weekly', 'monthly', 'other'];
        if(!rentType || allowedRentType.indexOf(rentType) == -1 ) rentType= 'monthly'

        var currency = getA(data,'currency')
        var allowedCurrencies = ["EUR", "POUND", "USD"];
        if(!currency || allowedCurrencies.indexOf(currency) == -1 ) currency= "EUR"

        var readyFrom = getA(data,'readyFrom')
        if(!readyFrom) readyFrom= new Date(moment().add(1, 'days').startOf('day'))
        if(readyFrom<new Date(moment().add(1, 'days').startOf('day'))) readyFrom= new Date(moment().add(1, 'days').startOf('day'))

        var rentMonthly=parseFloat(price);
        if(rentType=='weekly') rentMonthly = parseFloat((rentMonthly/7)*30) // Month has 30 days

        var doc = {
            "propertyId" : propertyId,
            "price" : parseInt(price),
            "rentMonthly" : rentMonthly,
            "createdByAgent" : userId,
            "isArchived" : false,
            "auctionBidProfit" : 0,
            "currency" : currency,
            "readyFrom" : readyFrom,
            "lease" : lease,
            "rentType" : rentType,
            "views" : 0,
            "bids" : 0,
            "enquiryCount" : 0,
            "createdByAgent":userId,
            "createdAt":new Date(),
            "updatedAt":new Date()
        }

        if(getA(data,'contacts.0.name') || getA(data,'contacts.0.phone') || getA(data,'contacts.0.email')){
            doc['contacts'] = [{
                "name" : getA(data,'contacts.0.name'),
                "phone" : getA(data,'contacts.0.phone'),
                "email" : getA(data,'contacts.0.email')
            }]
        }


        import TokenGen from 'token-gen';
        var auctionCode = TokenGen();
        var key = auctionCode.toString();
        var auc = Collections.Auctions.findOne({"lettingAuctionCode" : key})
        var i=0;
        while(auc){// it should be undefined, else loop
            auctionCode = TokenGen();
            key = auctionCode.toString();
            auc = Collections.Auctions.findOne({"lettingAuctionCode" : key})
            if(1>10000){throw  new Meteor.Error('Couldnt generate property key. Aborting.');return;}
            i++;
        }

        if(auctionCode){
            doc['lettingAuctionCode'] = key;
        }

        // console.log(doc);
        var auctionId = Collections.Auctions.insert(doc);
// return 'as';
        // const auction = Collections.Auctions.findOne(auctionId);
        const auction = doc;

        Collections.Properties.update(propertyId, {
            $set: {
                "auctionId": auctionId,
                "rent": parseInt(price),
                "rentMonthly": rentMonthly,
            }
        });


        const user = Meteor.user();
        if(!user.profile.activeAuctions)user.profile.activeAuctions=0
        if(!user.profile.totalAuctions)user.profile.totalAuctions=0
        user.profile.activeAuctions++;
        user.profile.totalAuctions++;


        Meteor.users.update(userId,{
            $set: {
                "profile.activeAuctions" :user.profile.activeAuctions,
                "profile.totalAuctions" :user.profile.totalAuctions
            }
        });

        Meteor.call('addActivityHistory', {propertyId:auction.propertyId,auctionId:auction._id,type:'prop_activation',activated:true});

        var sub = 'Property added: '+user.profile.name;
        var desc = `
Property ID: `+auction.propertyId+`<br/>
Property Key: `+auction.lettingAuctionCode+`<br/>
Property Link: <a href="https://www.spotmycrib.ie/letting/`+auction.lettingAuctionCode+`">Link</a><br/>
Property Link New: <a href="https://www.spotmycrib.ie/rent/`+property.slug+'/'+auction.lettingAuctionCode+`">Link New</a><br/>
`
        Meteor.call('notifyAdmin', sub, desc);


        return auctionId;

    },
    chooseWinning: function (args) {
        auctionId = args[0]
        bidId = args[1]
        check(auctionId, String);
        check(bidId, String);
        console.log("server method chooseWinning called")

        const agent = Meteor.user();
        // console.log(agent._id);

        if (!agent._id)throw new Meteor.Error('not-authorized');


        const auction = Collections.Auctions.findOne(auctionId);
        if (!auction)throw new Meteor.Error('Invalid auction');

        const bid = Collections.Bids.findOne(bidId,{
            transform: function(doc) {
                doc.user = Meteor.users.findOne(doc.userId);
                return doc;
            }
        });
        if (!bid)throw new Meteor.Error('Invalid bid');
        if (bid.isArchived)throw new Meteor.Error('This application is withdrawn by the user. Please choose another application.');

        const user = bid.user;
        if (!user._id)throw new Meteor.Error('User not found');

        const property = Collections.Properties.findOne({
            _id: auction.propertyId
        });
        if (!property)throw new Meteor.Error('Invalid property');

        if (property.createdByAgent != agent._id)throw new Meteor.Error('Invalid user');
        //PROPERTY BELONGS TO THIS AGENT CHECK


        ///////DONE WITH ALL THE CHECKS
        var chosenBids = []; var formattedBid = {} ;
        if(auction.chosenBids){
            chosenBids = auction.chosenBids;
            for(var a=0;a<auction.chosenBids.length;a++){
                if(auction.chosenBids[a].bidId == bid._id ){throw new Meteor.Error('This application is already chosen');}//Already in chosen
            }
        }
        formattedBid = {bidId : bid._id , chosenOn: new Date()}
        chosenBids.unshift(formattedBid);

        console.log('chosenBids');
        console.log(chosenBids);
        Collections.Auctions.update(auction._id,{
            $set:{
                chosenBids: chosenBids
            }
        })

        Collections.Bids.update(bid._id,{
            $set:{
                chosen: true
            }
        })


        //////////// CODE TO COPY ALL REFERENCES
        var bids = Collections.Bids.find({auctionId:auction._id,isArchived:false},{
            transform: function(doc) {
                doc.user = Meteor.users.findOne(doc.userId);
                return doc;
            },
        }).fetch();
        for(var i=0;i<bids.length;i++){//Everytime you click on choose, this field gets refreshed.
            Collections.Bids.update(bids[i]._id,{
                $set:{
                    references: bids[i].user.profile.references,
                    // isArchived: true//Bid archive is used for bid deletion, so don't archive
                }
            })
        }
        //////////// SEND MAIL to winning user
        property.type = titleCase(property.type);
        property.address.address = titleCase(property.address.address);
        property.address.area = titleCase(property.address.area);
        property.address.county = titleCase(property.address.county);
        var mailData     = {
            template    : 'applicationWon',
            subject     : "Application Won",
            mailTo      : bid.user.profile.email,
            replyTo      : agent.profile.email,
            //mailTo: 'srikanth681@gmail.com',
            homepage    : Meteor.absoluteUrl(),
            application : bid,
            auction     : auction,
            project     : property,
            user        : user,
            agentName        : agent.profile.name,
            agentEmail        : agent.profile.email,
            bedsCount   : property.bedrooms.length,
            offerFormated: numDifferentiation(bid.yourBid),
            rentFormated: numDifferentiation(auction.price)
        };
        Meteor.call('sendNotificationEmail', mailData);



        // Meteor.call('deactivateAuction', auctionId);

    },
    unChooseWinning: function (args) {
        auctionId = args[0]
        bidId = args[1]
        check(auctionId, String);
        check(bidId, String);
        console.log("server method unChooseWinning called")

        const agent = Meteor.user();
        // console.log(agent._id);

        if (!agent._id)throw new Meteor.Error('not-authorized');


        const auction = Collections.Auctions.findOne(auctionId);
        if (!auction)throw new Meteor.Error('Invalid auction');

        const bid = Collections.Bids.findOne(bidId,{
            transform: function(doc) {
                doc.user = Meteor.users.findOne(doc.userId);
                return doc;
            }
        });
        if (!bid)throw new Meteor.Error('Invalid bid');
        if (bid.isArchived)throw new Meteor.Error('This application is withdrawn by the user. Please choose another application.');

        const user = bid.user;
        if (!user._id)throw new Meteor.Error('User not found');

        const property = Collections.Properties.findOne({
            _id: auction.propertyId
        });
        if (!property)throw new Meteor.Error('Invalid property');

        if (property.createdByAgent != agent._id)throw new Meteor.Error('Invalid user');
        //PROPERTY BELONGS TO THIS AGENT CHECK


        ///////DONE WITH ALL THE CHECKS
        var chosenBids = []; var formattedBid = {} ;
        if(!auction.chosenBids)throw new Meteor.Error('You need to chose an application first.');
        if(!auction.chosenBids.length)throw new Meteor.Error('You need to chose an application first.');

        chosenBids = auction.chosenBids;
        var found = false;
        for(var a=0;a<chosenBids.length;a++){
            if(chosenBids[a].bidId == bid._id ){found=true;chosenBids.splice(a,1);}//Already in chosen
        }
        if(!found)throw new Meteor.Error('You need to chose an application first.');

        // console.log('chosenBids');
        // console.log(chosenBids);
        Collections.Auctions.update(auction._id,{
            $set:{
                chosenBids: chosenBids
            }
        })

        Collections.Bids.update(bid._id,{
            $set:{
                chosen: false
            }
        })


        //////////// CODE TO COPY ALL REFERENCES
        var bids = Collections.Bids.find({auctionId:auction._id,isArchived:false},{
            transform: function(doc) {
                doc.user = Meteor.users.findOne(doc.userId);
                return doc;
            },
        }).fetch();
        for(var i=0;i<bids.length;i++){//Everytime you click on choose, this field gets refreshed.
            Collections.Bids.update(bids[i]._id,{
                $set:{
                    references: bids[i].user.profile.references,
                    // isArchived: true//Bid archive is used for bid deletion, so don't archive
                }
            })
        }
        //////////// SEND MAIL to winning user
        property.type = titleCase(property.type);
        property.address.address = titleCase(property.address.address);
        property.address.area = titleCase(property.address.area);
        property.address.county = titleCase(property.address.county);
        var mailData     = {
            template    : 'applicationPending',
            subject     : "Application Pending",
            mailTo      : bid.user.profile.email,
            replyTo      : agent.profile.email,
            //mailTo: 'srikanth681@gmail.com',
            homepage    : Meteor.absoluteUrl(),
            application : bid,
            auction     : auction,
            project     : property,
            user        : user,
            agentName        : agent.profile.name,
            agentEmail        : agent.profile.email,
            bedsCount   : property.bedrooms.length,
            offerFormated: numDifferentiation(bid.yourBid),
            rentFormated: numDifferentiation(auction.price)
        };
        Meteor.call('sendNotificationEmail', mailData);



        // Meteor.call('deactivateAuction', auctionId);

    },
    markChosen: function (args) {
        bidId = args[0]
        check(bidId, String);
        console.log("server method markChosen called")

        const agent = Meteor.user();
        // console.log(agent._id);

        if (!agent._id)throw new Meteor.Error('not-authorized');

        const bid = Collections.Bids.findOne(bidId,{
            transform: function(doc) {
                doc.auction = Collections.Auctions.findOne(doc.auctionId);
                return doc;
            }
        });
        if (!bid)throw new Meteor.Error('Invalid bid');
        if (bid.isArchived)throw new Meteor.Error('This application is withdrawn by the user. Please choose another application.');
        var auction = bid.auction;

        if (!bid.auction)throw new Meteor.Error('Invalid auction');

        if (bid.auction.createdByAgent != agent._id)throw new Meteor.Error('Invalid property owner. '); //PROPERTY BELONGS TO THIS AGENT CHECK

        Collections.Bids.update(bidId,{
            $set:{
                chosen: false
            }
        })
    },
    unMarkChosen: function (args) {
        bidId = args[0]
        check(bidId, String);
        console.log("server method unMarkChosen called")

        const agent = Meteor.user();
        // console.log(agent._id);

        if (!agent._id)throw new Meteor.Error('not-authorized');

        const bid = Collections.Bids.findOne(bidId,{
            transform: function(doc) {
                doc.auction = Collections.Auctions.findOne(doc.auctionId);
                return doc;
            }
        });
        if (!bid)throw new Meteor.Error('Invalid bid');
        if (bid.isArchived)throw new Meteor.Error('This application is withdrawn by the user. Please choose another application.');
        var auction = bid.auction;

        if (!bid.auction)throw new Meteor.Error('Invalid auction');

        if (bid.auction.createdByAgent != agent._id)throw new Meteor.Error('Invalid property owner. '); //PROPERTY BELONGS TO THIS AGENT CHECK

        Collections.Bids.update(bidId,{
            $set:{
                chosen: false
            }
        })
    },
    deactivateAuction: function(auctionId) {
        check(auctionId, String);
        console.log("server method deactivateAuction called")

        console.log(auctionId);
        const userId = Meteor.userId();
        console.log(userId)

        if (!userId) {
            throw new Meteor.Error('not-authorized');
        }

        const auction = Collections.Auctions.findOne(auctionId);
        if (!auction)throw new Meteor.Error('Invalid auction');

        const property = Collections.Properties.findOne({
            _id: auction.propertyId
        });
        if (!property)throw new Meteor.Error('Invalid property');

        if (property.createdByAgent != userId)throw new Meteor.Error('Invalid user');
        //PROPERTY BELONGS TO THIS AGENT

        var auctionHistory = property.auctionHistory;
        if(!auctionHistory)auctionHistory = [];

        auctionHistory.push({
            auctionId:property.auctionId,
            deactivatedOn: new Date()
        })
        Collections.Properties.update(auction.propertyId, {
            $set: {
                "auctionId": "",
                "rent": "",
                "auctionHistory":auctionHistory
            }
        });
        Collections.Auctions.update(auction._id, {
            $set: {
                "isArchived": true,
                "endDate":new Date()
            }
        });

        var bidCount = Collections.Bids.find({auctionId:auction._id}).count();

        if(bidCount){//Non zero
            Collections.Bids.update({auctionId:auction._id}, {
                $set: {
                    "isArchived": true,
                    "endDate":new Date()
                }
            });
        }

        const user = Meteor.user();




        if(!auction.auctionBidProfit)auction.auctionBidProfit=0
        if(!user.profile.bidProfitActive)user.profile.bidProfitActive=0
        if(!user.profile.activeAuctions)user.profile.activeAuctions=0
        if(!user.profile.bidsReceivedActiveAuctions)user.profile.bidsReceivedActiveAuctions=0
        user.profile.activeAuctions--;
        user.profile.bidsReceivedActiveAuctions-=bidCount;
        user.profile.bidProfitActive -= auction.auctionBidProfit;

        if(user.profile.activeAuctions<0)user.profile.activeAuctions=0
        if(user.profile.bidsReceivedActiveAuctions<0)user.profile.bidsReceivedActiveAuctions=0
        if(user.profile.bidProfitActive<0)user.profile.bidProfitActive=0
        Meteor.users.update(userId,{
            $set: {
                "profile.activeAuctions" :user.profile.activeAuctions,
                "profile.bidsReceivedActiveAuctions" :user.profile.bidsReceivedActiveAuctions,
                "profile.bidProfitActive" :user.profile.bidProfitActive,
            }
        });

        Meteor.call('addActivityHistory', {propertyId:auction.propertyId,auctionId:auction._id,type:'prop_deactivation',activated:false});

        return {
            status: 'success'
        }

    },
    deactivateAuctionMulti: function(propIds) {
        // check(auctionId, String);
        console.log("server method deactivateAuctionMulti called")

        let propId = '', successCount = 0, deactivatedProps = [];
        for(let i=0;i<propIds.length;i++){
            propId = propIds[i];
            console.log('propId is: '+propId);
            const auction = Collections.Auctions.findOne({propertyId:propId,isArchived:false});//Dont get already archived props
            if (!auction)continue;

            const property = Collections.Properties.findOne(propId);
            if (!property)continue;

            var auctionHistory = property.auctionHistory;
            if(!auctionHistory)auctionHistory = [];

            auctionHistory.push({
                auctionId:property.auctionId,
                deactivatedOn: new Date()
            })
            console.log('auctionHistory done '+auction._id);
            Collections.Properties.update(auction.propertyId, {
                $set: {
                    "auctionId": "",
                    "rent": "",
                    "auctionHistory":auctionHistory
                }
            });
            console.log('Properties update done '+auction.propertyId);
            
            Collections.Auctions.update(auction._id, {
                $set: {
                    "isArchived": true,
                    "endDate":new Date()
                }
            });

            var bidCount = Collections.Bids.find({auctionId:auction._id}).count();
            if(bidCount){//Non zero
                Collections.Bids.update({auctionId:auction._id}, {
                    $set: {
                        "isArchived": true,
                        "endDate":new Date()
                    }
                });
            }
            console.log('bidCount done '+bidCount);

            const userId = property.createdByAgent;
            const user = Meteor.users.findOne({_id:userId});


            if(!auction.auctionBidProfit)auction.auctionBidProfit=0
            if(user){ // in Dev with all users deleted, below code would fail, so adding this if condition. 
                if(!user.profile.bidProfitActive)user.profile.bidProfitActive=0
                if(!user.profile.activeAuctions)user.profile.activeAuctions=0
                if(!user.profile.bidsReceivedActiveAuctions)user.profile.bidsReceivedActiveAuctions=0
                user.profile.activeAuctions--;
                user.profile.bidsReceivedActiveAuctions-=bidCount;
                user.profile.bidProfitActive -= auction.auctionBidProfit;
    
                if(user.profile.activeAuctions<0)user.profile.activeAuctions=0
                if(user.profile.bidsReceivedActiveAuctions<0)user.profile.bidsReceivedActiveAuctions=0
                if(user.profile.bidProfitActive<0)user.profile.bidProfitActive=0
                Meteor.users.update(userId,{
                    $set: {
                        "profile.activeAuctions" :user.profile.activeAuctions,
                        "profile.bidsReceivedActiveAuctions" :user.profile.bidsReceivedActiveAuctions,
                        "profile.bidProfitActive" :user.profile.bidProfitActive,
                    }
                });
            }

            data = {propertyId:auction.propertyId,auctionId:auction._id,type:'prop_deactivation',activated:false,createdAt : new Date()}
            
            Collections.ActivityHistory.insert(data);
            successCount++;
            deactivatedProps.push({slug:property.slug,lettingAuctionCode:auction.lettingAuctionCode, address:property.address.address +', '+property.address.county+', '+property.address.area})
        }

        if(successCount>0){
            var sub = 'Multi Auctions Deactivated'
            let tableHtml = '',deactivatedProp={};
            for(i=0;i<deactivatedProps.length;i++){
                deactivatedProp = deactivatedProps[i];
                tableHtml += `<tr>
                <td>`+deactivatedProps[i].address+`</td>
                <td><a href="https://www.spotmycrib.ie/rent/`+deactivatedProps[i].slug+`/`+deactivatedProps[i].lettingAuctionCode+`">Link1</a></td>
                <td><a href="https://www.spotmycrib.ie/letting/`+deactivatedProps[i].lettingAuctionCode+`">Link2</a></td>
                </tr>`;
            }
            var desc = `

    Deactivate Count: `+successCount+`<br/><br/>

    <table>
    `+tableHtml+`
    </table>
    `
            Meteor.call('notifyAdmin', sub, desc);
        } 

        return {
            status: 'success'
        }

    }
})
Array.prototype.pushUnique = function (item){
    if(this.indexOf(item) == -1) {
        //if(jQuery.inArray(item, this) == -1) {
        this.push(item);
        return true;
    }
    return false;
}
function numDifferentiation(val) {
    if(val >= 1000000000) val = (val/1000000000).toFixed(2) + ' Billion';
    else if(val >= 1000000) val = (val/1000000).toFixed(2) + ' Million';
    return val.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
}
function titleCase(str){
    if(!str)return;
    return str.charAt(0).toUpperCase() + str.toLowerCase().substring(1);
}
function getA(arr,find){
    if(!Array.isArray(arr))return;
    var eles = [];
    for(var i=0;i<arr.length;i++){
        if(arr[i]['name']==find)eles.push(arr[i]['value'])
    }
    if(find=='amenities')return eles;
    if(eles.lenght>1)return eles;
    if(eles.lenght==0)return false;
    return eles[0];
}
