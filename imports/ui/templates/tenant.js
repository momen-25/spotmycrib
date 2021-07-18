import "./profile.js";
import "./tenant.html";

Template.tenant.onCreated(function(){

    var instance = this;
    instance.isSubsLoaded = new ReactiveVar(false);
    instance.autorun(function(){

        instance.subscribe('userData');//works only if viewing your profile
        instance.subscribe('userDataUsername',FlowRouter.getParam('username'));//works if viewing your profile and others

        if(instance.subscriptionsReady()){
            instance.isSubsLoaded.set(true)
        }
    })

})
Template.tenant.helpers({
    isSubsLoaded:function(){
        return Template.instance().subscriptionsReady();
    },
    userLoggedIn:function(){
        if(Meteor.user())return true;
        return false;
    },
    isViewingHisProfile:function () {
        var currentUser =  Accounts.user();
        var username = FlowRouter.getParam('username');
        try{if(currentUser.profile.username==username)return true;}catch(e){}
        return false;
    },
    isPublicProfile:function(){
        var username = FlowRouter.getParam('username');
        var u1 = Meteor.users.findOne({ "profile.username":username },{limit:1});

        try{if(u1.profile.isPublic){
            clearMeta();
            DocHead.setTitle(titleCase(u1.profile.name) + '\'s profile | Teanat Profile SpotMyCrib');
            DocHead.addMeta({name: "description", content: "View and download "+titleCase(u1.profile.name) + "'s references."});
            return true;
        }}catch(e){}
        return false;
    },
    userFound:function(){
        var username = FlowRouter.getParam('username');
        var u1 = Meteor.users.findOne({ "profile.username":username },{limit:1});
        if(u1)return true;

        clearMeta();
        DocHead.setTitle(' User not found | SpotMyCrib');
        DocHead.addMeta({name: "description", content: ""});
        return false;
    },
    userFirstName:function(){
        var username = FlowRouter.getParam('username');
        var u1 = Meteor.users.find({ "profile.username":username },{limit:1}).fetch();
        try{
            clearMeta();
            DocHead.setTitle(titleCase(u1.profile.name) + '\'s profile | Teanat Profile SpotMyCrib');
            DocHead.addMeta({name: "description", content: ""});
            var tmp = u1.profile.name.split(' ');
            return tmp[0];
        }catch(e){}
        return 'Tenant'
    },
    user:function(){
        var username = FlowRouter.getParam('username');
        return Meteor.users.find({ "profile.username":username },{limit:1});
    }
})

function titleCase(str){
    if(!str)return;
    return str.charAt(0).toUpperCase() + str.toLowerCase().substring(1);
}