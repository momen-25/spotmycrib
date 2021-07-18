import "./collections.js";

if (Meteor.isClient) {

}

//PUBLICATIONS
if (Meteor.isServer) {
    Meteor.publish("PropertyManage", function (terms) {
        var parameters = queryConstructor(terms);
        if(parameters.fail) {return [];this.ready();}
        return Collections.PropertyManage.find(parameters.find, parameters.options);
    });
    Meteor.publish("ActivityHistory", function (terms) {
        // console.log('ActivityHistory');

        return Collections.ActivityHistory.find( {propertyId:terms.id}, {limit: terms.limit,sort: { createdAt : -1 }});
    });
    Meteor.publish("avgOffer", function(auctionId) {
        // console.log("Subscribed: auctionId: "+auctionId)
        // var self = this;
        // var handle = Collections.Bids.aggregate([
        //     { $match : { "auctionId" : auctionId } },
        //     { $group : {
        //             '_id': this.userId,
        //             'avgOffer': {
        //                 // In this case, we're running summation.
        //                 $avg: '$yourBid'
        //             }
        //         }
        //     }
        // ]).forEach(function(data) {
        //     self.added('avgOffer', 'first', data);
        // });

        ReactiveAggregate(this, Collections.Bids,[
            { $match : { "auctionId" : auctionId } },
            { $group : {
                    '_id': this.userId,
                    'avgOffer': {
                        // In this case, we're running summation.
                        $avg: '$yourBid'
                    }
                }
            }
        ] , { clientCollection: "avgOffer" }
        );

    });
    Meteor.publish("Property", function (terms) {
        // console.log('Property');
        var parameters = queryConstructor(terms);
        // console.log(parameters.find)
        // console.log(parameters.options)
        // console.log(Collections.Properties.find(parameters.find, parameters.options).count())
        if(parameters.fail) {return [];this.ready();}
        return Collections.Properties.find(parameters.find, parameters.options);
    });
    Meteor.publish("userData", function () {
        if(!this.userId)return []; //Need to login
        // 'services.password':1,Don use this , we have a method for this
        return Meteor.users.find({_id: this.userId},{
            limit:1, 
            fields: { 
            'services.facebook.id':1,
            'services.twitter.screenName':1,
            'services.linkedin.publicProfileUrl':1,
            'services.google.id':1,
            'createdAt':1, 
            'lastLoginDate':1, 
            'profile':1 ,
            'isSA':1 ,
            },
        }
        )
    });
    Meteor.publish("userDataUsername", function (username) {
        if(!username)return [];
        var ret = Meteor.users.find({ "profile.username":username },{
            limit:1,
            fields: {
                'createdAt':1,
                'lastLoginDate':1,
                'profile.name':1,
                'profile.email':1,
                'profile.role':1,
                'profile.picture':1,
                'profile.mobile':1,
                'profile.isPublic':1,
                'profile.username':1,
            }
        });
        var user = ret.fetch();
        // console.log(username)
        // console.log(user)
        if(!user.length){ return [];}
        try{
        if(user[0].profile.isPublic){//If public then include social info as well.
            return  Meteor.users.find({ "profile.username":username },{
                limit:1,
                fields: {
                    'createdAt':1,
                    'lastLoginDate':1,
                    'profile':1,
                    'services.facebook.id':1,
                    'services.twitter.screenName':1,
                    'services.linkedin.publicProfileUrl':1,
                    'services.google.id':1,
                }
            });
        }
        }catch(e){
            console.log(e)
        }
        return ret;
    });
    Meteor.publish("allUserData", function () {
        return Meteor.users.find({}, {
            fields: {
                'createdAt':1,
                'lastLoginDate':1,
                'profile':1,
                'services.facebook.id':1,
                'services.twitter.screenName':1,
                'services.linkedin.publicProfileUrl':1,
                'services.google.id':1
            }
        });//fields: {'nested.things': 1}
    });
    Meteor.publish("tenants", function (pageno) {
        var pg = 1;
        try{pg = parseInt(pageno);}catch(e){}
        if(isNaN(pg))pg = 1;
        var resperpage = 10;
        var skip = (pg-1)*resperpage;

        return Meteor.users.find({ "profile.isPublic":true },{
            skip:skip,
            limit:resperpage,
            fields: {
                'createdAt':1,
                'lastLoginDate':1,
                'profile.name':1,
                'profile.email':1,
                'profile.role':1,
                'profile.picture':1,
                'profile.mobile':1,
                'profile.isPublic':1,
                'services.facebook.id':1,
                'services.twitter.screenName':1,
                'services.linkedin.publicProfileUrl':1,
                'services.google.id':1,
                // 'profile.username':1,
            }
        });
    });

    Meteor.publish("browseLettings", function (terms) {
        var parameters = queryConstructor(terms);

        if(parameters.fail) {return [];this.ready();}

        var auctions = [],properties = [];
        parameters.options.fields = {
            address:1,
            createdByAgent:1,
            type:1,
            createdAt:1,
            updatedAt:1,
            isArchived:1,
            auctionId:1,
            slug:1,
            bedCount:1,
            baths:1,
            rent:1,
            rentType:1,
            gallery:1
        };

        // console.log('property key is')
        // console.log(parameters.propertykey)
        if(parameters.propertykey)
        if(parameters.propertykey.length>0){
            console.log('inside propertykey')
            auctions = Collections.Auctions.find({lettingAuctionCode:{$in:parameters.propertykey},isArchived:false},parameters.options)
            var tmp = auctions.fetch();

            var propertyIds = [];
            for(var i=0;i<tmp.length;i++){
                propertyIds.push(tmp[i].propertyId);
                if(i>parameters.options.limit)break;
            }

            properties = []
            if(propertyIds.length){
                properties = Collections.Properties.find({_id:{$in:propertyIds}},{
                    limit:parameters.options.limit,
                    sort:parameters.options.sort
                })
            }
            if(!propertyIds.length)return [];
            return [properties, auctions];
        }

        parameters.find.isArchived = false;
        parameters.find.auctionId = {$exists:true, $gt: "" };//if we don' put $gt, then its also giving results of records with empty vals - but we don' need deactivated properties
        if(parameters.minRent && parameters.maxRent){
            parameters.find.rent = {$gte:parseInt(parameters.minRent),$lte:parseInt(parameters.maxRent)}
        }else if (parameters.minRent){
            parameters.find.rent = {$gte:parseInt(parameters.minRent)}
        }else if (parameters.maxRent){
            parameters.find.rent = {$lte:parseInt(parameters.maxRent)}
        }
        if(parameters.minBeds && parameters.maxBeds){
            parameters.find.bedCount = {$gte:parseInt(parameters.minBeds),$lte:parseInt(parameters.maxBeds)}
        }else if (parameters.minBeds){
            parameters.find.bedCount = {$gte:parseInt(parameters.minBeds)}
        }else if (parameters.maxBeds){
            parameters.find.bedCount = {$lte:parseInt(parameters.maxBeds)}
        }else if(parameters.bedCount && !isNaN(parameters.bedCount)){
            parameters.find.bedCount = parseInt(parameters.bedCount)
        }

        // console.log('In browseLettings start')
        // console.log(parameters.find)
        // console.log(parameters.options)
        // console.log(Collections.Properties.find(parameters.find, parameters.options).count())
        // console.log('In browseLettings end')

        properties = Collections.Properties.find(parameters.find,parameters.options)
        var tmp = properties.fetch();

        var propertyIds = [];
        for(var i=0;i<tmp.length;i++){
            propertyIds.push(tmp[i].auctionId);
            if(i>parameters.options.limit)break;
        }

        auctions = []
        if(propertyIds.length){
            auctions = Collections.Auctions.find({_id:{$in:propertyIds}},{
                limit:parameters.options.limit,
                sort:parameters.options.sort
            })
        }

        if(!propertyIds.length)return properties;
        return [properties, auctions];
    });
    Meteor.publish("total-houses-for-rent-count",function(terms){
        var parameters = queryConstructor(terms);

        if(parameters.fail) {return [];this.ready();}

        parameters.options.fields = {_id:1};

        if(parameters.propertykey) {
            if (parameters.propertykey.length > 0) {

                Counts.publish(this,"total-houses-for-rent-count",Collections.Auctions.find({
                    lettingAuctionCode: {$in: parameters.propertykey},
                    isArchived: false
                }),parameters.options);

            }
        }else{
            parameters.find.isArchived = false;
            parameters.find.auctionId = {$exists:true, $gt: "" };//if we don' put $gt, then its also giving results of records with empty vals - but we don' need deactivated properties
            if(parameters.minRent && parameters.maxRent){
                parameters.find.rent = {$gte:parseInt(parameters.minRent),$lte:parseInt(parameters.maxRent)}
            }else if (parameters.minRent){
                parameters.find.rent = {$gte:parseInt(parameters.minRent)}
            }else if (parameters.maxRent){
                parameters.find.rent = {$lte:parseInt(parameters.maxRent)}
            }
            if(parameters.minBeds && parameters.maxBeds){
                parameters.find.bedCount = {$gte:parseInt(parameters.minBeds),$lte:parseInt(parameters.maxBeds)}
            }else if (parameters.minBeds){
                parameters.find.bedCount = {$gte:parseInt(parameters.minBeds)}
            }else if (parameters.maxBeds){
                parameters.find.bedCount = {$lte:parseInt(parameters.maxBeds)}
            }else if(parameters.bedCount && !isNaN(parameters.bedCount)){
                parameters.find.bedCount = parseInt(parameters.bedCount)
            }
            // console.log('In count start')
            // console.log(parameters.find)
            // console.log(parameters.options)
            // console.log(Collections.Properties.find(parameters.find, parameters.options).count())
            // console.log('In count end')

            Counts.publish(this,"total-houses-for-rent-count",Collections.Properties.find(parameters.find),parameters.options);
        }
    });

    Meteor.publish("viewLetting", function (key) {

        // var auctions = Collections.Auctions.find({lettingAuctionCode:key,isArchived:false},{
        var auctions = Collections.Auctions.find({lettingAuctionCode:key},{
            limit:1
        })
        var tmp = auctions.fetch();

        var properties = [],bids=[],mainProperty={},relatedPropsTmp=[],maxRel = 5,//Max rel always needs to be 1 number higher than the req, due to the logic below.
            relPropIds = [],relAuctionIds = [],i=0
        try{
            relPropIds.push(tmp[0].propertyId);
            relAuctionIds.push(tmp[0]._id);

            bids = Collections.Bids.find({auctionId:tmp[0]._id},{
                limit:100,
                sort: {updatedAt: -1}
            })

            //////// RELATED PROPS
            mainProperty = Collections.Properties.findOne({_id:tmp[0].propertyId});
            var notArr = [mainProperty._id]
            var filters = {
                "type":mainProperty.type,
                "address.county":mainProperty.address.county,
                "address.area":mainProperty.address.area,
                "auctionId": {$exists:true, $gt: "" },
                "isArchived":false,
                "_id": { $not: { $in: relPropIds } }
            }

            relatedPropsTmp = Collections.Properties.find(filters,{fields:{_id:1,auctionId:1},limit:maxRel}).fetch();
            for(i=0;i<relatedPropsTmp.length;i++){
                relPropIds.push(relatedPropsTmp[i]._id);
                relAuctionIds.push(relatedPropsTmp[i].auctionId)
            }

            if(relPropIds.length<maxRel) {
                delete filters["address.area"];
                filters["_id"] = { $not: { $in: relPropIds } };
                relatedPropsTmp = Collections.Properties.find(filters, {
                    fields: {_id: 1,auctionId:1},
                    limit: (maxRel - relPropIds.length)
                }).fetch();
                for (i = 0; i < relatedPropsTmp.length; i++){ relPropIds.push(relatedPropsTmp[i]._id); relAuctionIds.push(relatedPropsTmp[i].auctionId)}
            }
            if(relPropIds.length<maxRel) {
                delete filters["address.county"];
                filters["_id"] = { $not: { $in: relPropIds } };
                relatedPropsTmp = Collections.Properties.find(filters, {
                    fields: {_id: 1,auctionId:1},
                    limit: (maxRel - relPropIds.length)
                }).fetch();
                for (i = 0; i < relatedPropsTmp.length; i++){ relPropIds.push(relatedPropsTmp[i]._id); relAuctionIds.push(relatedPropsTmp[i].auctionId)}
            }
            if(relPropIds.length<maxRel) {
                delete filters["type"];
                filters["_id"] = { $not: { $in: relPropIds } };
                relatedPropsTmp = Collections.Properties.find(filters, {
                    fields: {_id: 1,auctionId:1},
                    limit: (maxRel - relPropIds.length)
                }).fetch();
                for (i = 0; i < relatedPropsTmp.length; i++){ relPropIds.push(relatedPropsTmp[i]._id); relAuctionIds.push(relatedPropsTmp[i].auctionId)}
            }


            properties = Collections.Properties.find({_id:{$in:relPropIds}},{
                limit:(maxRel+1)})
            auctions = Collections.Auctions.find({_id:{$in:relAuctionIds}},{
                limit:(maxRel+1)})
        }catch(e){
            console.log(e);
        }

        if(!tmp.length)return [];
        return [properties, auctions,bids];
    });

    let transformMyActiveAdvertisements = (data) => {
        // console.log('in transformMyActiveAdvertisements');
        // console.log(data.propertyId)
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
    };
    Meteor.publish("inviteToApply.MyActiveAdvertisements", function () {
        if(!this.userId)return []; //Need to login

        var self = this;
        let subHandle = Collections.Auctions
            .find()
            .observeChanges({
                added: (id, fields) => {
                    fields = transformMyActiveAdvertisements(fields);
                    this.added('Auctions', id, fields);
                },
                changed: (id, fields) => {
                    this.changed('Auctions', id, fields);
                },
                removed: (id) => {
                    this.removed('Auctions', id);
                }
            });
        this.ready();
        this.onStop(() => {
            subHandle.stop();
        });

        self.ready();
    });

    Meteor.publish("MyProperties", function (terms) {
        console.log('In MyProperties Publish ');
        var parameters = queryConstructor(terms);

        if(parameters.fail) {return [];this.ready();}
        if(!this.userId)return [];

        find = {}
        find['createdByAgent'] = {$in:[this.userId,'demoproperty']}
        find['isArchived'] = false
        if(terms.onlyActive)find.auctionId = {$exists:true, $gt: "" };

        var properties = Collections.Properties.find(find, parameters.options)

        var relAuctionIds = []
        var props = properties.fetch();
        for(var i=0;i<props.length;i++)if(props[i].auctionId)relAuctionIds.push(props[i].auctionId)

        var auctions = Collections.Auctions.find({_id:{$in:relAuctionIds}},{limit:(parameters.options.limit?parameters.options.limit+2:22) } )
        var bids = Collections.Bids.find({auctionId:{$in:relAuctionIds}},{limit:(parameters.options.limit?parameters.options.limit+2:22) } )

        return [properties,
            auctions,
            bids
        ];

        this.ready();
    });
    Meteor.publish("total-MyProperties", function (terms) {
        if(!this.userId)return [];

        find = {}
        find['createdByAgent'] = {$in:[this.userId,'demoproperty']}
        find['isArchived'] = false
        if(terms.onlyActive)find.auctionId = {$exists:true, $gt: "" };

        Counts.publish(this,"total-MyProperties",Collections.Properties.find(find));
    });

    Meteor.publish("PropertyApplications", function (terms) {

        var parameters = queryConstructor(terms);

        if(parameters.fail) {return [];this.ready();}
        if(!this.userId)return [];

        find = {_id:parameters.id}
        find['isArchived'] = false

        let properties = Collections.Properties.find(find, {limit:1})
        let tmp = properties.fetch();
        if(tmp.length==0)return [];

        let auctionId = tmp[0].auctionId;
        let propertyId = tmp[0]._id;


        // console.log('In PropertyApplications start')
        // console.log(parameters)
        // console.log('Auctions')
        // console.log(Collections.Auctions.find({_id:auctionId,isArchived:false},{limit:1 } ).count())
        // console.log(Collections.Bids.find({auctionId:auctionId,isArchived:false},parameters.propertyApplications.options ).count())
        // console.log(Collections.EmailEnquiries.find({propertyId:propertyId,isArchived:false},parameters.emailEnquiries.options ).count())
        // console.log('In PropertyApplications end')

        let auctions = Collections.Auctions.find({_id:auctionId,isArchived:false},{limit:1 } )
        tmp = auctions.fetch();
        if(tmp.length==0)return [];

        let bids = Collections.Bids.find({auctionId:auctionId,isArchived:false},parameters.propertyApplications.options )

        let EmailEnquiries = Collections.EmailEnquiries.find({propertyId:propertyId,isArchived:false},parameters.emailEnquiries.options )

        tmp = bids.fetch();
        let userIds = []
        for(let j=0; j< tmp.length ; j++){
            userIds.push(tmp[j].userId);
        }
        let users = Meteor.users.find({_id:this.userId})
        if(parameters.emailEnquiries)
            users = Meteor.users.find({_id:{$in: userIds}},{limit: parameters.emailEnquiries.options.limit,fields: {
                    'services.facebook.id':1,
                    'services.twitter.screenName':1,
                    'services.linkedin.publicProfileUrl':1,
                    'services.google.id':1,
                    'createdAt':1,
                    'lastLoginDate':1,
                    'profile':1 ,
                    'isSA':1 ,
                } })// just need the limit from there.


        return [properties,
            auctions,
            bids,
            EmailEnquiries,
            users
        ];

        this.ready();
    });
    Meteor.publish("total-PropertyApplications", function (terms) {

        var parameters = queryConstructor(terms);

        if(parameters.fail) {return [];this.ready();}
        if(!this.userId)return [];

        find = {_id:parameters.id}
        find['isArchived'] = false

        let properties = Collections.Properties.find(find, {limit:1})
        let tmp = properties.fetch();
        if(tmp.length==0)return [];

        let auctionId = tmp[0].auctionId;
        let propertyId = tmp[0]._id;

        Counts.publish(this,"total-PropertyApplications",Collections.Bids.find({auctionId:auctionId,isArchived:false}),parameters.propertyApplications.options)
    });
    Meteor.publish("total-EmailEnquiries", function (terms) {

        var parameters = queryConstructor(terms);

        if(parameters.fail) {return [];this.ready();}
        if(!this.userId)return [];

        find = {_id:parameters.id}
        find['isArchived'] = false

        let properties = Collections.Properties.find(find, {limit:1})
        let tmp = properties.fetch();
        if(tmp.length==0)return [];

        let auctionId = tmp[0].auctionId;
        let propertyId = tmp[0]._id;

        Counts.publish(this,"total-EmailEnquiries",Collections.EmailEnquiries.find({propertyId:propertyId,isArchived:false}),parameters.emailEnquiries.options)
    });
    Meteor.publish("Advertisement", function (advertisementId) {
        let validationSuccess = false;
        if(advertisementId.length > 12 && advertisementId.length < 20)validationSuccess=true

        if(!validationSuccess) return [];
        else return Collections.Auctions.find({_id:advertisementId,isArchived:false}, {limit:1});

        this.ready();
    });
    Meteor.publish("MyAdvertisements", function (terms) {

        var parameters = queryConstructor(terms);

        if(parameters.fail) {return [];this.ready();}
        if(!this.userId)return [];

        return Collections.Auctions.find({createdByAgent:{$in:[this.userId,'demoproperty']},isArchived:false}, parameters.options);

        this.ready();
    });
    Meteor.publish("editProperty", function (propertyId) {
        if(!this.userId)return [];

        var auctions = Collections.Auctions.find({isArchived:false,propertyId:propertyId},{
            transform:function(doc){
                if(doc.createdByAgent!=this.userId){
                    return {
                        _id:doc._id,
                        propertyId:doc.propertyId,
                        createdByAgent:doc.createdByAgent
                    }
                }
            },
            limit:1
        })

        var properties = Collections.Properties.find({isArchived:false,_id:propertyId},{
            transform:function(doc){
                if(doc.createdByAgent!=this.userId){
                    return {
                        _id:doc._id,
                        propertyId:doc.propertyId
                    }
                }
            },
            limit:1
        })

        return [auctions,properties];
    });
    Meteor.publish("propertyApplication", function (propertyId,auctionId) {
        if(!this.userId)return [];

        var properties = Collections.Properties.find({isArchived:false,_id:propertyId},{
            transform:function(doc){
                if(doc.createdByAgent!=this.userId){
                    return {
                        _id:doc._id,
                        propertyId:doc.propertyId,
                        invalidAgent:true
                    }
                }
            },
            limit:1
        })

        var auctionIDTmp = '';var invalidAgentProp = false;
        var tmp = properties.fetch()
        try{
            auctionIDTmp = tmp[0].auctionId;
            if(tmp[0].invalidAgent)invalidAgentProp=true
        }catch(e){}

        if(!tmp.length || invalidAgentProp){//Property not found, no need to find auction
            console.log("invalidAgentProp: "+invalidAgentProp)
            console.log("tmp.length: "+tmp.length)
            return [];
        }


        if(auctionId)auctionIDTmp=auctionId

        var auctions = Collections.Auctions.find({isArchived:false,_id:auctionIDTmp},{
            transform:function(doc){
                if(doc.createdByAgent!=this.userId){
                    return {
                        _id:doc._id,
                        propertyId:doc.propertyId,
                        createdByAgent:doc.createdByAgent
                    }
                }
            },
            limit:1
        })

        var tmp = properties.fetch()
        if(!tmp.length){
            return [];
        }

        var bids = Collections.Bids.find({isArchived:false, _id:auctionIDTmp},{
            transform:function(doc){
                if(doc.createdByAgent!=this.userId){
                    return {
                        _id:doc._id,
                        propertyId:doc.propertyId,
                        createdByAgent:doc.createdByAgent
                    }
                }
            },
            limit:1
        })

        return [auctions,properties];
    });
    Meteor.publish("Areas", function (c1,c2,c3,c4,c5) {
        // For ireland
        // c1: Territory: like UK for ireland, its empty
        // c2: Country => Ireland
        // c3: County => Dublin / City
        // c4: Sub County => Dublin 1
        // c5: Area => Baltinglass
        // console.log('Vals are c3: '+c3)
        // return [];
        var selector = {},paramReceived = false;
        if(c1){paramReceived=true;selector['Territory']=c1;}
        if(c2){paramReceived=true;selector['Country']=c2;}
        if(c3){paramReceived=true;selector['County']=c3;}
        if(c4){paramReceived=true;selector['Sub County']=c4;}
        if(c5){paramReceived=true;selector['Area']=c5;}
        if(!paramReceived){//Don't send all area info, for performance reasons. 
            // console.log('in if c3: '+c3)
            return [];
        }else{ 
            // console.log('in else c3: '+c3)
            // console.log(selector)
            return Collections.Areas.find(selector, {});}
        this.ready();
    });

    Meteor.publish("browseBlogs", function (terms) {
        var parameters = queryConstructor(terms);
        if(parameters.fail) {return [];this.ready();}

        parameters.find.isArchived = false;

        var Blogs = Collections.Blogs.find(parameters.find,parameters.options)
        return Blogs;
        this.ready();
    });
    Meteor.publish("total-blogs-count",function(terms){
        var parameters = queryConstructor(terms);
        if(parameters.fail) {return [];this.ready();}

        parameters.find.isArchived = false;

        Counts.publish(this,"total-blogs-count",Collections.Blogs.find(parameters.find),{fields:{_id:1}});
    });
    Meteor.publish("viewBlog", function (key) {

        if(!key)return [];

        var tmp = Collections.Blogs.findOne({slug:key},{
            limit:1
        })
        if(!tmp || !tmp._id){
            return []; //Blog not found.
        }

        let notArr = [], Blogs = [],recentBlogsTmp = [],relBlogIds=[],i=0,maxRecent = 4
        try{
            notArr.push(tmp.wpId);
            relBlogIds.push(tmp._id);
            for(i=0; i< tmp.related.length;i++ ){
                notArr.push(tmp.related[i].wpId);
            }
            var filters = {
                "isArchived":false,
                "wpId": { $not: { $in: notArr } }
            }
            recentBlogsTmp = Collections.Blogs.find(filters,{fields:{_id:1,wpId:1},limit:maxRecent}).fetch();
            for(i=0;i<recentBlogsTmp.length;i++){
                relBlogIds.push(recentBlogsTmp[i]._id);
            }

            Blogs = Collections.Blogs.find({_id:{$in:relBlogIds}},{
                limit:(maxRecent+1),
                // sort:{updatedAt : -1} // Not needed, anyway, it will send records to UI without order. and IDs are definitly specified.
            })
        }catch(e){
            console.log(e);
        }

        return Blogs;this.ready();

    });


    Meteor.publish("Properties", function () {

        let Properties = Collections.Properties;
        let selector = {};
        return Properties.find(selector, {});

        this.ready();
    });
    Meteor.publish("Bids", function () {
        //if (this.userId) {
        //  let Projects = Collections.Bids;
        //  //let selector = {"userId":this.userId};
        //  let selector = {};//We need to query even when he isn't logged in.
        //  return Projects.find(selector, {});
        //}else {
        //    // Declare that no data is being published. If you leave this line
        //    // out, Meteor will never consider the subscription ready because
        //    // it thinks you're using the added/changed/removed interface where
        //    // you have to explicitly call this.ready().
        //    return [];
        //  }
        let Projects = Collections.Bids;
        let selector = {};
        return Projects.find(selector, {});
        this.ready();
    });
    Meteor.publish("MyBids", function () {
        if (this.userId) {
            let Projects = Collections.Bids;
            let selector = {"userId":this.userId};
            //let selector = {};//We need to query even when he isn't logged in.
            return Projects.find(selector, {});
        }else {
            // Declare that no data is being published. If you leave this line
            // out, Meteor will never consider the subscription ready because
            // it thinks you're using the added/changed/removed interface where
            // you have to explicitly call this.ready().
            return [];
        }
    });
    Meteor.publish("Auctions", function () {

        let Projects = Collections.Auctions;
        let selector = {};
        return Projects.find(selector, {});

        this.ready();
    });
    Meteor.publish("Config", function () {

        let Projects = Collections.Config;
        let selector = {};
        return Projects.find(selector, {});

        this.ready();
    });
    // Meteor.publish("Payments", function () {
    //
    //     if (this.userId) {
    //         let Payments = Collections.Payments;
    //         let selector = {"userId":this.userId};
    //         //let selector = {};//We need to query even when he isn't logged in.
    //         return Payments.find(selector, {});
    //
    //         this.ready();
    //     }else {
    //         let Payments = Collections.Payments;
    //         let selector = {};
    //         return Payments.find(selector, {});
    //
    //         this.ready();
    //     }
    // });
    //Meteor.publish("MyBids", function () {//NOT WORKING IN PUBLISH, HAS TO DO IN CLIENT
    //
    //  if (this.userId) {//userId is null if no user is logged in.
    //    let Bids = Collections.Bids;
    //    //const userId = Meteor.userId();
    //    let selector = {"userId":this.userId};
    //    return Bids.find(selector, {
    //      transform: function(doc) {
    //        doc.unit = Collections.Units.findOne({
    //          _id: doc.unitId
    //        });
    //        doc.auction = Collections.Auctions.findOne({
    //          _id: doc.auctionId
    //        });
    //        doc.project = Collections.Properties.findOne({
    //          _id: doc.unit.projectId
    //        });
    //        return doc;
    //      },
    //      sort: {
    //        createdAt: -1
    //      }
    //
    //    });
    //  } else {
    //    // Declare that no data is being published. If you leave this line
    //    // out, Meteor will never consider the subscription ready because
    //    // it thinks you're using the added/changed/removed interface where
    //    // you have to explicitly call this.ready().
    //    return [];
    //  }
    //  this.ready();
    //});
    // Meteor.publish('Meteor.users.initials', function ({ userIds }) {
    //     // Validate the arguments to be what we expect
    //     new SimpleSchema({
    //         userIds: { type: [String] }
    //     }).validate({ userIds });
    //
    //     // Select only the users that match the array of IDs passed in
    //     const selector = {
    //         _id: { $in: userIds }
    //     };
    //
    //     // Only return one field, `initials`
    //     const options = {
    //         fields: { initials: 1 }
    //     };
    //
    //     return Meteor.users.find(selector, options);
    // });
}