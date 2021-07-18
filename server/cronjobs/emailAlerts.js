import {check} from "meteor/check";


Meteor.methods({
    subscribeToEmailAlert(email){
        console.log('in subscribeToEmailAlert: '+email)
        this.unblock();
        let validatedEmail = emailValidation(email);
        if(validatedEmail !== true){
            throw new Meteor.Error(400, 'Invalid email, please enter a valid email address.');
        }
        let ele = Collections.propertyAlerts.findOne({'email':email})// You can make this email field unique index and save 1 mongodb query here, but its async anyway, so ignoring
        if(ele){
            //ignore; you alredy have it subscribed ;
        }else{
            Collections.propertyAlerts.insert({'email':email})
        }
        if(this.userId){
            Meteor.users.update({
                "_id": this.userId
            }, {
                $set: {
                    "profile.emailAlertsActive": true
                }
            });
        }
        return true;
    },
    emailAlertsNoThanks(){
        console.log('in emailAlertsNoThanks')
        this.unblock();
        if(this.userId){
            Meteor.users.update({
                "_id": this.userId
            }, {
                $set: {
                    "profile.emailAlertsNoThanks": true
                }
            });
        }
        return true;
    }
})

function emailValidation(email) {

    email = email.trim();
    var re = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;

    // Valid
    if( re.test(email) ){
        return true;
    }

    // Invalid
    return {
        error: "INVALID_EMAIL",
        reason: "Please enter a valid email address in format pat@gmail.com",
    };

}