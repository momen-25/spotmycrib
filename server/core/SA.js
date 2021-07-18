/**
 * Created by njanjanam on 27/03/2018.
 */
Meteor.methods({
    SAGenerateSlugsForMissingProperties: function(auctionCode) {
        //Will generate slugs to all auctions, missing ones
        console.log("server method Super Admin SAGenerateSlugsForMissingProperties called")

        var user = Meteor.user();
        if (!user) {
            throw new Meteor.Error('not-authorized');
        }
        if(!user.isSA){//Only super admins can use this method.
            throw new Meteor.Error('not-authorized');
            return false;
        }

        var properties = Collections.Properties.find({isArchived:false})
        var tmp = properties.fetch();var property = '';var c=0;var slug='';

        // console.log('Total: '+tmp.length)
        for(var i=0;i<tmp.length;i++){
            property = tmp[i];
            // if(property.slug){
                //Format: (apartment-for-rent-in-area- // not this format as its for browse pages) (name and are apartment)
                //Approved format: /rent/apartment-name-of-apt-AREA-CITY
                if(property.type)slug = property.type
                if(property.address.address)slug += '-'+property.address.address
                if(property.address.area)slug += '-'+property.address.area
                if(property.address.county)slug += '-'+property.address.county

                Collections.Properties.update(property._id, {
                    $set: {
                        "slug": slugify(slug)
                    }
                });
                c++;
            // }
        }
        return 'Slug Added Count: '+c;
    },
    SAdeactivateAuction: function(auctionCode) {
        //Below is the code used on client to mass delete the objects.
        // var props = Collections.Auctions.find({},{fields:{lettingAuctionCode:1}}).fetch()
        // var excludes = ['TUK94','RR5DK','KZ6X9','RCWJG']
        // var a=[];
        // for(var i=0;i<props.length;i++){
        //     if(excludes.indexOf(props[i].lettingAuctionCode)!=-1)continue;
        //     a.push(props[i].lettingAuctionCode)
        // }
        // for(var i=0;i<a.length;i++){
        //     Meteor.call('SAdeactivateAuction',a[i]);
        // }
        check(auctionCode, String);
        console.log("server method Super Admin deactivateAuction called")

        console.log(auctionCode);

        var user = Meteor.user();
        if (!user) {
            throw new Meteor.Error('not-authorized');
        }
        if(!user.isSA){//Only super admins can use this method.
            throw new Meteor.Error('not-authorized');
            return false;
        }

        const auction = Collections.Auctions.findOne({lettingAuctionCode:auctionCode});
        if (!auction)throw new Meteor.Error('Invalid auction');

        const property = Collections.Properties.findOne({
            _id: auction.propertyId
        });
        if (!property)throw new Meteor.Error('Invalid property');

        var userId=property.createdByAgent;

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

        // const user = Meteor.user();
        user = Meteor.users.findOne(userId);



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


        return {
            status: 'success'
        }

    },
    FixAddRentToProperty:function(){//Add rent field to all property records, take from auction table.
        console.log("server method Super Admin FixAddRentToProperty called")

        var user = Meteor.user();
        if (!user) {
            throw new Meteor.Error('not-authorized');
        }
        if(!user.isSA){//Only super admins can use this method.
            throw new Meteor.Error('not-authorized');
            return false;
        }

        var auctions = Collections.Auctions.find({isArchived:false})
        var tmp = auctions.fetch();var auction = '';var c=0;

        // console.log('Total: '+tmp.length)
        for(var i=0;i<tmp.length;i++){
            auction = tmp[i];
            // if(auction.propertyId=='JGhAi548Bfa3q7TEJ')console.log('found it')
            // console.log(auction._id)
            if(!auction.propertyId)continue;
            Collections.Properties.update(auction.propertyId, {
                $set: {
                    "rent": parseInt(auction.price)
                }
            });
            c++;
        }
        return 'Fixed count: '+c;

    },
    AddBedCountToAllProperty:function(){//Add rent field to all property records, take from auction table.
        console.log("server method Super Admin AddBedCountToAllProperty called")

        var user = Meteor.user();
        if (!user) {
            throw new Meteor.Error('not-authorized');
        }
        if(!user.isSA){//Only super admins can use this method.
            throw new Meteor.Error('not-authorized');
            return false;
        }

        var properties = Collections.Properties.find({isArchived:false})
        var tmp = properties.fetch();var property = '';var c=0;var bedCount=1;

        console.log('Total: '+tmp.length)
        for(var i=0;i<tmp.length;i++){
            property = tmp[i];

            if(property.bedrooms)bedCount = property.bedrooms.length;
            if(!bedCount)bedCount = 1

            Collections.Properties.update(property._id, {
                $set: {
                    "bedCount": parseInt(bedCount)
                }
            });
            c++;
        }
        console.log('bedCount Added Count: '+c);
        return 'bedCount Added Count: '+c;
    },
    AddMonthlyRentOnAuctionProperty:function(){//Add rent field to all property records, take from auction table.
        console.log("server method Super Admin AddMonthlyRentOnAuctionProperty called")

        var user = Meteor.user();
        if (!user) {
            throw new Meteor.Error('not-authorized');
        }
        if(!user.isSA){//Only super admins can use this method.
            throw new Meteor.Error('not-authorized');
            return false;
        }

        var properties = Collections.Properties.find({isArchived:false})
        var tmp = properties.fetch();var property = '';var c=0;var rentMonthly=0;var auction = {}

        console.log('Total: '+tmp.length)
        for(var i=0;i<tmp.length;i++){
            property = tmp[i];
            if(!property.auctionId)continue;

            auction = Collections.Auctions.findOne({_id:property.auctionId})
            // if(auction.price==null)auction.price = Math.floor(Math.random() *10 +10) *10
            rentMonthly = parseFloat(auction.price)
            if(auction.rentType=='weekly') rentMonthly = parseFloat((rentMonthly/7)*30) // Month has 30 days

            if(!rentMonthly)continue;
            if(!auction.price)continue;

            Collections.Properties.update(property._id, {
                $set: {
                    "rent": parseInt(auction.price),
                    "rentMonthly": rentMonthly
                }
            });
            Collections.Auctions.update(property.auctionId, {
                $set: {
                    "price": parseInt(auction.price),
                    "rentMonthly": rentMonthly
                }
            });
            c++;
        }
        console.log('bedCount Added Count: '+c);
        return 'Fixed count: '+c;

    },






    ////////////// TEMP - NOT IMP
    FixRentDataTypeOnAuctionProperty:function(){//Add rent field to all property records, take from auction table.
        console.log("server method Super Admin FixRentFormatOnAuctionProperty called")

        var user = Meteor.user();
        if (!user) {
            throw new Meteor.Error('not-authorized');
        }
        if(!user.isSA){//Only super admins can use this method.
            throw new Meteor.Error('not-authorized');
            return false;
        }

        var auctions = Collections.Auctions.find({isArchived:false})
        var tmp = auctions.fetch();var auction = '';var c=0;

        // console.log('Total: '+tmp.length)
        for(var i=0;i<tmp.length;i++){
            auction = tmp[i];
            if(!auction.propertyId)continue;

            Collections.Auctions.update(auction._id, {
                $set: {
                    "price": parseInt(auction.price)
                }
            });
            Collections.Properties.update(auction.propertyId, {
                $set: {
                    "rent": parseInt(auction.price)
                }
            });
            c++;
        }
        return 'Fixed count: '+c;

    },

})
// Meteor.call('FixAddRentToProperty',function(err, res){
//     debugger;
//     console.log(res);
// })
function slugify (text) {
    if(!text)return '';
    const a = 'àáäâèéëêìíïîòóöôùúüûñçßÿœæŕśńṕẃǵǹḿǘẍźḧ·/_,:;'
    const b = 'aaaaeeeeiiiioooouuuuncsyoarsnpwgnmuxzh------'
    const p = new RegExp(a.split('').join('|'), 'g')

    return text.toString().toLowerCase()
        .replace(/\s+/g, '-')           // Replace spaces with -
        .replace(p, c =>
            b.charAt(a.indexOf(c)))     // Replace special chars
        .replace(/&/g, '-and-')         // Replace & with 'and'
        .replace(/[^\w\-]+/g, '')       // Remove all non-word chars
        .replace(/\-\-+/g, '-')         // Replace multiple - with single -
        .replace(/^-+/, '')             // Trim - from start of text
        .replace(/-+$/, '')             // Trim - from end of text
}