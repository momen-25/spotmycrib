import {check} from "meteor/check";
// import TokenGen from 'token-gen';

Meteor.methods({
    addActivityHistory: function(data) {
        console.log("server method addActivityHistory called")
        this.unblock();

        if(!data.userIdPassed){
            const userId = Meteor.userId();
            console.log(userId)

            if (!userId)throw new Meteor.Error('not-authorized');
        }
        delete data.userIdPassed;

        if (!data.propertyId)throw new Meteor.Error('Property ID id required.');

        data.createdAt = new Date();

        var docId = Collections.ActivityHistory.insert(data);

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