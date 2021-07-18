/**
 * Created by njanjanam on 08/04/2017.
 */

// Deny all client-side updates to user documents
// Meteor.users.deny({
//     update() { return true; }
// });
Meteor.users.deny({
    insert() { return true; },
    update() { return true; },
    remove() { return true; }
});
Accounts.onCreateUser(function(options, user) {
    //@RELATIVE: imports/ui/templates/accounts/signUp/signUp.js

    if (options.profile) {
        if(user.services.facebook){
            options.profile.picture = "http://graph.facebook.com/" + user.services.facebook.id + "/picture/?width=40";//?type=large
            options.profile.email = user.services.facebook.email ;
        }
        if(user.services.twitter){
            options.profile.picture = user.services.twitter.profile_image_url_https;//?type=large
            options.profile.name = user.services.twitter.screenName ;
            options.profile.email = "";//Twitter doesn' give email.
        }
        if(user.services.google){
            options.profile.picture = user.services.google.picture+"?sz=40";
            options.profile.name = user.services.google.given_name + user.services.google.family_name;
            options.profile.email = user.services.google.email;
        }
        if(user.services.linkedin){
            options.profile.picture = user.services.linkedin.pictureUrl;
            options.profile.name = user.services.linkedin.firstName + user.services.linkedin.lastName;
            options.profile.email = user.services.linkedin.emailAddress;
        }
        // user.profile = options.profile; Dont overwrite like this
        if(user.profile){
            if(options.profile.name)user.profile.name = options.profile.name
            user.profile.email = options.profile.email
            user.profile.picture = options.profile.picture
        }else user.profile = options.profile;

    }
    // user.createdAt = new Date();

    return user;
});
// Meteor.users.before.insert(function (userId, user) {
//
// });
//https://guide.meteor.com/accounts.html
// https://github.com/lirbank/meteor-accounts-merge
// Ensuring every user has an email address, should be in server-side code
Accounts.validateNewUser((user) => {
    console.log('In validate new user');
    console.log(user);

    if(user.profile.email){
        var tmp = Meteor.users.findOne({'profile.email':user.profile.email});
        var msg = '';var t1 = []; var t2=[];
        if(tmp)
        if(tmp.services){
            if(tmp.services.facebook){
                t1.push('Facebook');
                t2.push('Facebook');
                // msg = 'Existing Facebook account exists, please login with your Facebook account.'
            }
            if(tmp.services.twitter){
                t1.push('Twitter')
                t2.push('Twitter')
            }
            if(tmp.services.google){
                t1.push('Google')
                t2.push('Google')
            }
            if(tmp.services.linkedin){
                t1.push('LinkedIn')
                t2.push('LinkedIn')
            }
            if(tmp.services.password){
                t1.push('Password');
                t2.push('Username-password');
            }
        }
        if(t1.length){
            var s = t1.length>1 ? 's' :''
            msg = 'Existing '+formatArray(t1)+' account'+s+' found, please login with your '+formatArray(t2,'or')+'.'
            throw new Meteor.Error('account-exists', msg);
        }

    }

    // Return true to allow user creation to proceed
    return true;
});
function formatArray(arr, con='and'){
    var outStr = "";
    if (arr.length === 1) {
        outStr = arr[0];
    } else if (arr.length === 2) {
        //joins all with "and" but no commas
        //example: "bob and sam"
        outStr = arr.join(' '+con+' ');
    } else if (arr.length > 2) {
        //joins all with commas, but last one gets ", and" (oxford comma!)
        //example: "bob, joe, and sam"
        outStr = arr.slice(0, -1).join(', ') + ' '+con+' ' + arr.slice(-1);
    }
    return outStr;
}
Meteor.users.after.insert(function (userId, user) {

    console.log(user);

    var toUpdate = {
        "profile.role" : "agent",
        "profile.personalMessage" : "",
        "lastLoginDate": new Date(),
        "profile.isPublic":false
    }

    if(!user.profile.picture)toUpdate["profile.picture"] = "";
    if(!user.profile.mobile)toUpdate["profile.mobile"] = "";
    if(!user.profile.email)toUpdate["profile.email"] = "";


    var references = {};
    references.hasResume = false;
    references.hasLandlordRef = false;
    references.hasGovtID = false;
    references.employerName = "";
    references.employerTakeHome = "";
    references.hasWorkRef = false;
    references.hasPassport = false;
    references.hasPPS = false;
    references.hasFinancialRef = false;
    references.others = [];

    toUpdate["profile.references"] = references ;

    console.log("Account Created hook: ")

    if(user.profile.email){//Check if this user already has any emailEnquiry with us?
        let req = Collections.EmailEnquiries.findOne({email: user.profile.email,message:{$exists:true, $gt: "" } },{sort:{createdAt:-1}});
        if(req){
            toUpdate['profile.personalMessage'] = req.message;
        }
    }

    Meteor.users.update({
        "_id": user._id
    }, {
        $set: toUpdate
    });

    // if(!user.services.password && user.profile.email){
    //     Accounts.sendEnrollmentEmail(user._id);
    // }

    // Meteor.call('sendWelcomeEmailCustom',[userId]); Moved to server side in Accounts.onCreateUser
    // var smsText = 'Hi '+fullName+'. Welcome to SpotMyCrib. ';//Please verify your mobile number and email id.
    // Meteor.call('sendSMS',[mobile, smsText]);

    Meteor.call('sendWelcomeEmailCustom',[user._id]);
});

Meteor.methods({
    'setUserPwd':function(args){
        var clientUserId = args[0]
        var newPassword = args[1]
        const userId  = Meteor.userId();
        if(clientUserId!=userId) throw new Meteor.Error(400, 'Invalid user, please re-login and try again. ');

        Accounts.setPassword(userId, newPassword,{logout:false});
    },
    'togglePublicProfileSetting':function () {
        console.log('togglePublicProfileSetting called.')
        var currentUser = Meteor.user();
        if(!currentUser){
            throw new Meteor.Error(500, 'Error 500: Invalid user', 'You need to login first.');
        }
        var update =currentUser.profile.isPublic;

        if(update==undefined)update = true;//First time, users get the option of public to true.
        else{
            if(update)update=false;
            else update =true;
        }

        Meteor.users.update({
            "_id": currentUser._id
        }, {
            $set: {
                "profile.isPublic" :update
            }
        });

        if(update){//If its true
            if(!currentUser.profile.username) {//Check if user name doesnt exists
                Meteor.call('generateUsername',currentUser._id);
            }
        }

    },
    'userLoggedIn':function () {
        // Let other method calls from the same client start running,
        // without waiting for the email sending to complete.
        this.unblock();

        var currentUser = Meteor.userId();
        if(!currentUser){
            throw new Meteor.Error(500, 'Error 500: Invalid user', 'You need to login first.');
        }

        Meteor.users.update({
            "_id": currentUser
        }, {
            $set: {
                "lastLoginDate" :new Date()
            }
        });

    },
    'generateUsername'(userId) {
        this.unblock();
        var currentUser = Meteor.userId();
        if(!currentUser){
            throw new Meteor.Error(500, 'Error 500: Invalid user', 'You need to login first.');
        }
        var user = Meteor.user(userId);
        if(!user)throw new Meteor.Error(500, 'Error 500: Invalid user', 'Please send a valid userID');
        console.log('user found: '+user._id)

        let username = slugify(user.profile.name);
        if(!username)return false;
        let u1 = Meteor.users.findOne({ "profile.username":username });

        let number = 0;

        while(u1) {
            number++;
            username = slugify(user.profile.name+number);
            u1 = Meteor.users.findOne({ "profile.username":username });
        }
        if(username){
            Accounts.users.update(user._id,{
                $set: {
                    "profile.username" :username
                }
            });
        }
        return username;
    },
    isSocialAccount:function(email){
        // new SimpleSchema({
        //     email: { type: [email] }
        // }).validate({ email });

        // User has no password set
        var user = Accounts.findUserByEmail(email)
        if(!user){//Not found in generic way
            var users = Meteor.users.find({'profile.email':email}).fetch()
            if(users.length)user= users[0];
        }
        if(user){
            var social = '';
            if(user.services.facebook)social = 'Facebook';
            if(user.services.twitter)social = 'Twitter';
            if(user.services.google)social = 'Google';
            if(user.services.linkedin)social = 'LinkedIn';

            if(social) return {
                error:false,
                reason: social+' user found. Please try login with '+social+'.'
            }
        }
        return {
            error:'NoUser',
            reason:'User not found'
        }
    },
    hasPasswordSet:function(){
        // new SimpleSchema({
        //     email: { type: [email] }
        // }).validate({ email });

        var user = Meteor.user();
        if(!user)return false;

        try{
            if(user.services.password) return true;
        }catch(e){
            console.log(e)
        }
        return false;
    }
})
function slugify (text) {
    if(!text)return '';
    const a = 'àáäâèéëêìíïîòóöôùúüûñçßÿœæŕśńṕẃǵǹḿǘẍźḧ·/_,:;'
    const b = 'aaaaeeeeiiiioooouuuuncsyoarsnpwgnmuxzh------'
    const p = new RegExp(a.split('').join('|'), 'g')

    return text.toString().toLowerCase()
        .replace(/\s+/g, '')           // Replace spaces with ""
        .replace(p, c =>
            b.charAt(a.indexOf(c)))     // Replace special chars
        .replace(/&/g, '-and-')         // Replace & with ''
        .replace(/[^\w\-]+/g, '')       // Remove all non-word chars
        .replace(/\-\-+/g, '-')         // Replace multiple - with single ''
        .replace(/^-+/, '')             // Trim - from start of text
        .replace(/-+$/, '')             // Trim - from end of text
}