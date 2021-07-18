import {check} from "meteor/check";
// import TokenGen from 'token-gen';

Meteor.methods({
    addManageProperty: function(propertyId) {
        check(propertyId, String);

        console.log("server method addManageProperty called")

        console.log(propertyId);
        const userId = Meteor.userId();
        console.log(userId)

        if (!userId) {
            throw new Meteor.Error('not-authorized');
        }
        const property = Collections.Properties.findOne({
            _id: propertyId
        });
        if (!property)throw new Meteor.Error('Invalid property');

        var doc = {
            "propertyId" : propertyId,
            "rent" : {
                "price" : 0,
                "collectionDayInMonth" : 1,
                "frequency" : "monthly",
                "reminderEmail" : false
            },
            "econtract" : {
                "manualFileUploaded" : false,
                "file" : {
                    "name" : "",
                    "relative_url" : "",
                    "url" : ""
                },
                "reminderEmail" : false
            },
            "tenants" : [],
            "prevActivationsCount" : 0,
            "createdAt":new Date(),
            "updatedAt":new Date()
        }


        var docId = Collections.PropertyManage.insert(doc);

        return docId;

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