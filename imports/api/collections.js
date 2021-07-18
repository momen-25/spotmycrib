/**
 * Created by njanjanam on 06/04/2017.
 */
import {Mongo} from "meteor/mongo";
// import "./schemas.js";
// export const Tasks = new Mongo.Collection('Property');
// import SimpleSchema from "simpl-schema";
// SimpleSchema.extendOptions(['autoform']);
Collections = {}
Collections.Properties = new Mongo.Collection("Properties");
Collections.Bids = new Mongo.Collection("Bids");
Collections.Auctions = new Mongo.Collection("Auctions");
Collections.Agents = new Mongo.Collection("Agents");
Collections.Config = new Mongo.Collection("Config");
Collections.PropertyManage = new Mongo.Collection("PropertyManage");
Collections.ActivityHistory = new Mongo.Collection("ActivityHistory");
Collections.Areas = new Mongo.Collection("Areas");
Collections.Blogs = new Mongo.Collection("Blogs");
Collections.EmailEnquiries = new Mongo.Collection("EmailEnquiries");
Collections.EmailRequests = new Mongo.Collection("EmailRequests");

Collections.Properties.before.insert(function (userId, doc) {
    doc.createdAt = new Date()
    doc.updatedAt = new Date()
});
Collections.Properties.before.update(function (userId, doc, fieldNames, modifier, options) {
    var skip=false;
    if(Array.isArray(fieldNames))
        if(fieldNames.indexOf('auctionHistory')!=-1){
            if(modifier['$set']['auctionId']=="" && modifier['$set']['rent']=="")
                skip = true //This is for deactivate
        }
    if(!skip){
        modifier.$set = modifier.$set || {};
        modifier.$set.updatedAt = new Date()
    }
});
Collections.Bids.before.insert(function (userId, doc) {
    doc.createdAt = new Date()
    doc.updatedAt = new Date()
});
Collections.Bids.before.update(function (userId, doc, fieldNames, modifier, options) {
    modifier.$set = modifier.$set || {};
    modifier.$set.updatedAt = new Date()
});
Collections.Auctions.before.insert(function (userId, doc) {
    doc.createdAt = new Date()
    doc.updatedAt = new Date()
});
Collections.Auctions.before.update(function (userId, doc, fieldNames, modifier, options) {
    var skip=false;
    if(Array.isArray(fieldNames))
    if(fieldNames.length==1 && fieldNames.indexOf('views')!=-1){
        // console.log('Its just view, so skipping')
        skip=true
    }
    if(fieldNames['isArchived']==true) skip=true //This is for deactivate
    if(!skip){
        modifier.$set = modifier.$set || {};
        modifier.$set.updatedAt = new Date()
    }
});
Collections.Agents.before.insert(function (userId, doc) {
    doc.createdAt = new Date()
    doc.updatedAt = new Date()
});
Collections.Agents.before.update(function (userId, doc, fieldNames, modifier, options) {
    modifier.$set = modifier.$set || {};
    modifier.$set.updatedAt = new Date()
});
Collections.Config.before.insert(function (userId, doc) {
    doc.createdAt = new Date()
    doc.updatedAt = new Date()
});
Collections.Config.before.update(function (userId, doc, fieldNames, modifier, options) {
    modifier.$set = modifier.$set || {};
    modifier.$set.updatedAt = new Date()
});
Collections.PropertyManage.before.insert(function (userId, doc) {
    doc.createdAt = new Date()
    doc.updatedAt = new Date()
});
Collections.PropertyManage.before.update(function (userId, doc, fieldNames, modifier, options) {
    modifier.$set = modifier.$set || {};
    modifier.$set.updatedAt = new Date()
});
Collections.ActivityHistory.before.insert(function (userId, doc) {
    doc.createdAt = new Date()
    doc.updatedAt = new Date()
});
Collections.ActivityHistory.before.update(function (userId, doc, fieldNames, modifier, options) {
    modifier.$set = modifier.$set || {};
    modifier.$set.updatedAt = new Date()
});
Collections.Areas.before.insert(function (userId, doc) {
    doc.createdAt = new Date()
    doc.updatedAt = new Date()
});
Collections.Areas.before.update(function (userId, doc, fieldNames, modifier, options) {
    modifier.$set = modifier.$set || {};
    modifier.$set.updatedAt = new Date()
});
Collections.Blogs.before.insert(function (userId, doc) {
    doc.createdAt = new Date()
    doc.updatedAt = new Date()
});
Collections.Blogs.before.update(function (userId, doc, fieldNames, modifier, options) {
    modifier.$set = modifier.$set || {};
    modifier.$set.updatedAt = new Date()
});
Collections.EmailEnquiries.before.insert(function (userId, doc) {
    doc.createdAt = new Date()
    doc.updatedAt = new Date()
});
Collections.EmailEnquiries.before.update(function (userId, doc, fieldNames, modifier, options) {
    modifier.$set = modifier.$set || {};
    modifier.$set.updatedAt = new Date()
});
Collections.EmailRequests.before.insert(function (userId, doc) {
    doc.createdAt = new Date()
    doc.updatedAt = new Date()
});
Collections.EmailRequests.before.update(function (userId, doc, fieldNames, modifier, options) {
    modifier.$set = modifier.$set || {};
    modifier.$set.updatedAt = new Date()
});

if (Meteor.isClient) {
    Collections.PA_AvgOffer = new Mongo.Collection("avgOffer");
}
if(Meteor.isServer){
    Collections.propertyAlerts = new Mongo.Collection("propertyAlerts");
    Collections.propertyAlerts.before.insert(function (userId, doc) {
        if(userId)doc.userId = userId
        doc.createdAt = new Date()
        doc.updatedAt = new Date()
    });
    Collections.propertyAlerts.before.update(function (userId, doc, fieldNames, modifier, options) {
        modifier.$set = modifier.$set || {};
        modifier.$set.updatedAt = new Date()
    });

}

// Collections.Auctions.attachSchema(Schema.Auctions);
// Collections.Properties.attachSchema(Schema.Properties);
// Collections.Bids.attachSchema(Schema.Bids);

UI.registerHelper("retCollectionProperties", function () {
    return  Collections.Properties;
});




export {Collections};




//
// Collections = [
//     {"Property" : new Mongo.Collection("Property") },
//     {Bids : new Mongo.Collection("Bids")},
//     {Auctions : new Mongo.Collection("Auctions")},
//     {Agents : new Mongo.Collection("Agents")},
//     {Config : new Mongo.Collection("Config")}
// ];


// Collections.Properties = new Mongo.Collection("Property");
// //Meteor.subscribe("Projects");
// export Collections.Bids = new Mongo.Collection("Bids");
// //Meteor.subscribe("Bids");
// export Collections.Auctions = new Mongo.Collection("Auctions");
// //Meteor.subscribe("Auctions");
// export Collections.Config = new Mongo.Collection("Config");
// //Meteor.subscribe("Config");


