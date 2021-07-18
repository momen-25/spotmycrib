import "./collections.js";
import {check} from "meteor/check";



Meteor.methods({
  bookSiteVisit: function(parms){
    check(parms, [Match.Any]);
    console.log("server method bookSiteVisit called")
    var projectId = parms[0];
    const user = Meteor.user();

    if(user.profile.bookSiteVisit){
      if(user.profile.bookSiteVisit.constructor === Array){
        user.profile.bookSiteVisit.pushUnique(projectId)
      }else{
        user.profile.bookSiteVisit = [projectId]
      }
    }else{
      user.profile.bookSiteVisit = [projectId]
    }

    Meteor.users.update({
      "_id": user._id
    }, {
      $set: {
        "profile.bookSiteVisit": user.profile.bookSiteVisit
      }
    });
    return {
      status: 'Success'
    }

  },
  requestAssistance: function(parms){
    check(parms, [Match.Any]);
    console.log("server method requestAssistance called")
    // var projectId = parms[0];
    const user = Meteor.user();
    Meteor.users.update({
      "_id": user._id
    }, {
      $set: {
        "profile.assistanceRequested": true
      }
    });
    return {
      status: 'Success'
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
