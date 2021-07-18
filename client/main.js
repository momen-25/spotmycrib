/**
 * Created by njanjanam on 05/04/2017.
 */

Template.notFound.events({
    "click .backBtn": function(event, template){
        var prevRoute = Session.get('prevRoute');
        if(prevRoute){
            Router.go(prevRoute.name,prevRoute.args)
            Session.set('prevRoute',false);
            if(prevRoute.scrollTo){
                scrollTo(prevRoute.scrollTo,0,500)
            }
        }else{
            history.go(-1);
        }
    }
})
Template.registerHelper("cdnPath",function(url){
    return cdnPath(url);
});
Template.registerHelper("pathFor",function(hash){
    try{
        var params = {};
        var query = {};
        var route = '';
        if (typeof hash === 'string' || hash instanceof String) route = hash;

        if(hash.hash) {
            if (hash.hash.route) {
                route = hash.hash.route;
                delete hash.hash.route;
            }
            if (hash.hash.query) {
                query = hash.hash.query;
                delete hash.hash.query;
            }
            if (hash.hash.data) {
                params = hash.hash.data;
                delete hash.hash.data;
            }
            else {
                params = hash.hash;
            }
        }
        return FlowRouter.path(route, params, query);
        // return FlowRouter.path(pathDef, params, queryParams);
    }catch(e){
        console.log(e);
    }
    return '';
});
Template.registerHelper("urlFor",function(hash){
    try{
        var params = {};
        var query = {};
        var route = '';
        if (typeof hash === 'string' || hash instanceof String) route = hash;

        if(hash.hash) {
            if (hash.hash.route) {
                route = hash.hash.route;
                delete hash.hash.route;
            }
            if (hash.hash.query) {
                query = hash.hash.query;
                delete hash.hash.query;
            }
            if (hash.hash.data) {
                params = hash.hash.data;
                delete hash.hash.data;
            }
            else {
                params = hash.hash;
            }
        }
        return FlowRouter.url(route, params, query);
    }catch(e){
        console.log(e);
    }
    return '';
});
Template.registerHelper("hostname",function(){
    return Meteor.absoluteUrl();
});
Template.registerHelper("titleCase",function(str){
    return titleCase(str);
});
Template.registerHelper("nlToBr",function(str){
    if(!str)return '';
    return str.replace(/(?:\r\n|\r|\n)/g, '<br />');
});
Template.registerHelper("arrLength",function(arr){
    if(Array.isArray(arr)) return arr.length;
    else 0;
});
Template.registerHelper("dontShow",function(){
    return false;
});
UI.registerHelper("getProfilePic", function () {
    var user= Meteor.user();
    // debugger;
    // if(user.services)
    // if(user.services.twitter)
    // if(user.services.twitter.profile_image_url){
    //     return user.services.twitter.profile_image_url;
    // }

    if (user.profile.picture)
    {
        try{
            if(user.services.facebook)
            if(user.services.facebook.indexOf('?width=40')==-1)
                return user.profile.picture+"?width=40"; //@BCompatibility : adding ?width=40 to it
        }catch (e){}

        return user.profile.picture;

    }

    return "/images/user-img.png";

});
UI.registerHelper("addCommaToEach", function (arr) {
    if(!arr)return '';
    return  arr.join(', ');
});
Template.registerHelper("objectToPairs",function(object){
    return _.map(object, function(value, key) {
        return {
            key: key,
            value: value
        };
    });
});
UI.registerHelper("dateFormat", function (text) {
    var date = new Date(text)
    if(date.toString() == "Invalid Date")return 'N/A';
    return  date.toDateString();
});
UI.registerHelper("dateTimeFormat", function (text) {
    var date = new Date(text)
    if(date.toString() == "Invalid Date")return 'N/A';
    return  date.toDateString()+ ' '+date.toLocaleTimeString();
});
UI.registerHelper("possessionDate", function (inputDate) {
    var monthNames = [
        "January", "February", "March",
        "April", "May", "June", "July",
        "August", "September", "October",
        "November", "December"
    ];
    var monthNames = [
        "JAN", "FEB", "MAR",
        "APR", "MAY", "JUNE", "JULY",
        "AUG", "SEPT", "OCT",
        "NOV", "DEC"
    ];

    var date = new Date(inputDate);
    var day = date.getDate();
    var monthIndex = date.getMonth();
    var year = date.getFullYear();

    //return date.toDateString();
    return monthNames[monthIndex]+' '+ year
});
Template.registerHelper("displayName", function () {
    try{
        const user = Meteor.user();
        if (user) {
            if (user.profile && user.profile.name) {
                return user.profile.name;
            }
        }
    }catch (e){}
    return "Guest";
});
Template.registerHelper("fName", function (displayUser) {
    const user = displayUser || Meteor.user();
    if (user && user.profile && user.profile.name) {
        return user.profile.name.split(" ")[0];
    } else if (user && user.username) {
        return user.username.name.split(" ")[0];
    }
    if (user && user.services) {
        const username = (function () {
            switch (false) {
                case !user.services.twitter:
                    return user.services.twitter.first_name;
                case !user.services.google:
                    return user.services.google.given_name;
                case !user.services.facebook:
                    return user.services.facebook.first_name;
                case !user.services.instagram:
                    return user.services.instagram.first_name;
                case !user.services.pinterest:
                    return user.services.pinterest.first_name;
                default:
                    return i18n.t("accountsUI.guest") || "Guest";
            }
        })();
        return username;
    }
    return i18n.t("accountsUI.signIn") || "Sign in";
});
Template.registerHelper("numDifferentiation", function (val) {
    if(isNaN(val))return 0;
    val = parseInt(val);
    if(val >= 1000000000) val = (val/1000000000).toFixed(2) + ' Billion';
    else if(val >= 1000000) val = (val/1000000).toFixed(2) + ' Million';
    else if(val >= 1000) val = val.toFixed(2) ;
    else val = val.toFixed(0);
    return val.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
});




isLoggedOn = function () {
    if(Meteor.userId()){
        return true;
    }
    return false;
}
scrollTo = function (ele,adjustment,delay) {
    setTimeout(function () {
        if($(ele).length ) {
        var to = $(ele).first().offset().top + adjustment;
        if (to<0)to = 0 ;

        $('html, body').animate({
            scrollTop: to
        }, 500);

        }
    }, delay)
}
function titleCase(str){
    if(!str)return;
    return str.charAt(0).toUpperCase() + str.toLowerCase().substring(1);
}