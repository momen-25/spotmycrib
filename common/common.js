import "../imports/api/publications.js";
import '../imports/api/profile.js';
import "../imports/api/properties.js";
import {Meteor} from "meteor/meteor";
// import '../imports/ui/templates/accounts/signIn/signIn.js'
// import '../imports/ui/templates/accounts/signUp/signUp.js'
// import '../imports/ui/templates/accounts/forgot/forgot.js'

views = {};

views['propertyManage.view'] = function(terms){
    try{
        // var id = Router.current().params.id
        return {
            find: {propertyId:terms.id},
            options: {limit: 1}
            // sort: {sort: {createdAt: -1}, limit: 1}
        };
    }catch(e){
        return {
            find:{},
            options: {limit: 1},
            fail:true
        }
    }
}
views['property.view'] = function(terms){
    try{
        return {
            find: {_id:terms.id},
            options: {limit: 1}
        };
    }catch(e){
        return {
            find:{},
            options: {limit: 1},
            fail:true
        }
    }
}
views['PMactivityHistory.view'] = function(terms){
    try{
        // var id = Router.current().params.id
        var lim = Session.get('resultsPerPage');
        if(!lim) lim = 100;
        return {
            find: {propertyId:terms.id},
            options: {limit: lim,sort: { createdAt : -1 }}
            // sort: {sort: {createdAt: -1}, limit: 1}
        };
    }catch(e){
        return {
            find:{},
            options: {limit: 1},
            fail:true
        }
    }
}
views['MyProperties.view'] = function(terms){
    try{
        var resperpage = terms.resperpage;
        if(isNaN(resperpage))resperpage = 20;
        if(!resperpage) resperpage = 20;
        if(resperpage<0||resperpage>100) resperpage = 20;


        var pg = 1;
        try{pg = parseInt(terms.pageno);}catch(e){}
        if(isNaN(pg))pg = 1;
        var skip = (pg-1)*resperpage;
        if(isNaN(skip))skip = 0;

        return {
            find: {},
            options: {limit: parseInt(resperpage),sort: { updatedAt : -1 }, skip: parseInt(skip)}
        };
    }catch(e){
        console.log(e);
        return {
            find:{},
            options: {limit: 1},
            fail:true
        }
    }
}
views['PropertyApplications.view'] = function(terms){
    try{
        let originalPgSplit = null, validOriginalPgSplit = false;
        if(terms.pageno){
            originalPgSplit = terms.pageno.toString().split('-')
            if(originalPgSplit.length==2){//if format issue, then reset issue.
                // if inside it means that format is correct, below if will correct data if required.
                validOriginalPgSplit = true;
                if(isNaN(originalPgSplit[0])) originalPgSplit[0] = 1;// if its not a number then reset it.
                if(isNaN(originalPgSplit[1])) originalPgSplit[1] = 1;// if its not a number then reset it.
            }
        }
        if(!validOriginalPgSplit){//invalid originalPgSplit; reset it
            originalPgSplit = [1,1]
        }

        //// for property applications
        var resperpage = terms.PAresperpage;
        if(isNaN(resperpage))resperpage = 20;
        if(!resperpage) resperpage = 20;
        if(resperpage<0||resperpage>100) resperpage = 20;
        var pg = originalPgSplit[0];
        var skip = (pg-1)*resperpage;
        if(isNaN(skip))skip = 0;
        let out = {id:terms.id,options:{limit:resperpage}}
        out.propertyApplications = {
            find: {},
            options: {limit: parseInt(resperpage),sort: { createdAt : -1 }, skip: parseInt(skip)}
        }
        //// for Email Enquiries
        resperpage = terms.EEresperpage;
        if(isNaN(resperpage))resperpage = 20;
        if(!resperpage) resperpage = 20;
        if(resperpage<0||resperpage>100) resperpage = 20;
        pg = originalPgSplit[1];
        skip = (pg-1)*resperpage;
        if(isNaN(skip))skip = 0;
        out.emailEnquiries = {
            find: {},
            options: {limit: parseInt(resperpage),sort: { createdAt : -1 }, skip: parseInt(skip)}
        }

        return out;
    }catch(e){
        console.log(e);
        return {
            propertyApplications: {
                find:{},
                options: {limit: 1},
                fail:true
            },
            emailEnquiries: {
                find:{},
                options: {limit: 1},
                fail:true
            },
            fail:true
        }
    }
}
views['MyAdvertisements.view'] = function(terms){

    try{
        var resperpage = terms.resperpage;
        if(isNaN(resperpage))resperpage = 20;
        if(!resperpage) resperpage = 20;
        if(resperpage<0||resperpage>100) resperpage = 20;


        var pg = 1;
        try{pg = parseInt(terms.pageno);}catch(e){}
        if(isNaN(pg))pg = 1;
        var skip = (pg-1)*resperpage;
        if(isNaN(skip))skip = 0;

        return {
            find: {},
            options: {limit: parseInt(resperpage),sort: { updatedAt : -1 }, skip: parseInt(skip)}
        };
    }catch(e){
        console.log(e);
        return {
            find:{},
            options: {limit: 1},
            fail:true
        }
    }
}
views['browseLettings.view'] = function(terms){

    try{
        var resperpage = terms.resperpage;
        if(isNaN(resperpage))resperpage = 20;
        if(!resperpage) resperpage = 20;
        if(resperpage<0||resperpage>100) resperpage = 20;

        var slugData = getSlugData(terms.slug,terms.query);

        var find={}
        if(slugData.area) find['address.area']=slugData.area
        if(slugData.county) find['address.county']=slugData.county
        if(slugData.propertyType) find['type']=slugData.propertyType //.toString().toLowerCase()
        // if(slugData.country) find.address.country=slugData.country;
        // console.log(slugData)
        var bedCount = null;
        if(slugData.bedCount && !isNaN(slugData.bedCount) )bedCount=parseInt(slugData.bedCount)

        var pg = 1;
        try{pg = parseInt(terms.pageno);}catch(e){}
        if(isNaN(pg))pg = 1;
        var skip = (pg-1)*resperpage;
        if(isNaN(skip))skip = 0;

        var sortOptions = { updatedAt : -1 }
        if( slugData.luxurySort )sortOptions = { rentMonthly : -1 }
        else if( slugData.cheapSort )sortOptions = { rentMonthly : 1 }
        else if( slugData.mostRecentSort )sortOptions = { updatedAt : -1 }
        else if( slugData.leastRecentSort )sortOptions = { updatedAt : 1 }

        let tmp = [],validKeys = null;
        if(terms.propertykey){
            validKeys = []
            tmp = terms.propertykey.split('-');
            for(let i=0;i<tmp.length;i++){
                if(tmp[i].length==5)validKeys.push(tmp[i].toUpperCase())//This is the validation we are doing.
            }
        }

        return {
            find: find,
            propertykey:validKeys,
            minRent:slugData.minRent,
            maxRent:slugData.maxRent,
            minBeds:slugData.minBeds,
            maxBeds:slugData.maxBeds,
            bedCount:bedCount,
            options: {limit: parseInt(resperpage),sort: sortOptions, skip: parseInt(skip)}
        };
    }catch(e){
        console.log(e);
        return {
            find:{},
            options: {limit: 1},
            fail:true
        }
    }
}
views['browseBlogs.view'] = function(terms){

    try{
        var resperpage = terms.resperpage;
        if(isNaN(resperpage))resperpage = 6;
        if(!resperpage) resperpage = 6;
        if(resperpage<0||resperpage>100) resperpage = 6;

        // if(!terms.slug) throw 'Slug required';
        var find={}
        // if(terms.slug) find['slug']=slug

        var pg = 1;
        try{pg = parseInt(terms.pageno);}catch(e){}
        if(isNaN(pg))pg = 1;
        var skip = (pg-1)*resperpage;
        if(isNaN(skip))skip = 0;

        var sortOptions = { updatedAt : -1 }

        return {
            find: find,
            options: {limit: parseInt(resperpage),sort: sortOptions, skip: parseInt(skip)}
        };
    }catch(e){
        console.log(e);
        return {
            find:{},
            options: {limit: 1},
            fail:true
        }
    }
}

queryConstructor = function (terms) {

    var viewFunction = views[terms.viewName]
    var data = viewFunction(terms);

    if (data.options.limit > 100) {
        data.options.limit = 100;
    }

    return data;

}//http://www.discovermeteor.com/blog/query-constructors/

function getSlugData(slug, query){//This needs to be seperate on common.
    var propertyType = "";
    var county = "";
    var area = "";
    var maxRent = "";
    var minRent = "";
    var minBeds = "";
    var maxBeds = "";
    var country = "";
    var bedCount = "";
    var luxurySort = "";
    var cheapSort = "";
    var mostRecentSort = "";
    var leastRecentSort = "";

    var range = [{cur:"eur",min:0,max:10000}]
    var selectedCur = range[0];

    if(query) {
        if(query.minRent)minRent = query.minRent;
        if(query.maxRent)maxRent = query.maxRent;
        if(query.minBeds)minBeds = query.minBeds;
        if(query.maxBeds)maxBeds = query.maxBeds;
        if(query.bedCount)bedCount = query.bedCount;
        if(query.luxurySort)luxurySort = query.luxurySort;
        if(query.cheapSort)cheapSort = query.cheapSort;
        if(query.mostRecentSort)mostRecentSort = query.mostRecentSort;
        if(query.leastRecentSort)leastRecentSort = query.leastRecentSort;
    }

    if(!slug){
        return {
            country:country,
            county:county,
            area:area,
            minRent:minRent,
            maxRent:maxRent,
            minBeds:minBeds,
            maxBeds:maxBeds,
            bedCount:bedCount,
            luxurySort:luxurySort,
            cheapSort:cheapSort,
            mostRecentSort:mostRecentSort,
            leastRecentSort:leastRecentSort,
            propertyType:propertyType,
        };
    }
    if(slug.indexOf('-for-')!=-1){
        propertyType = slug.split('-for-')[0];
        propertyType = propertyType.split('-').join(' ');
    }
    if(slug.indexOf('-in-')!=-1) {
        var tmp = slug.split('-in-')[1].split('-')
        switch (tmp.length) {
            case 3:
                country = tmp[2];
                county = tmp[1];
                area = tmp[0];
                break;
            case 2:
                country = tmp[1];
                county = tmp[0];
                break;
            case 1:
                country = tmp[0];
                break;
        }
        if (propertyType) propertyType = propertyType.replace(/_/g, ' ')
        if (county) county = titleCaseAllWords(county.replace(/_/g, ' '))
        if (country) country = titleCaseAllWords(country.replace(/_/g, ' '))
        if (area) area = titleCaseAllWords(area.replace(/_/g, ' '))
    }
    return {
        country:country,
        county:county,
        area:area,
        minRent:minRent,
        maxRent:maxRent,
        minBeds:minBeds,
        maxBeds:maxBeds,
        bedCount:bedCount,
        luxurySort:luxurySort,
        cheapSort:cheapSort,
        mostRecentSort:mostRecentSort,
        leastRecentSort:leastRecentSort,
        propertyType:propertyType,
    }
}
function titleCaseAllWords(str){
    if(!str)return;
    return str.split(' ').map(function(str){
        return str.charAt(0).toUpperCase() + str.toLowerCase().substring(1);
    }).join(' ')
    // var words = str.split(' ')
    // for(var i=0;i<words.length;i++){
    //
    // }
    // return str.charAt(0).toUpperCase() + str.toLowerCase().substring(1);
}
cdnPath = function(url){
    if(Meteor.settings.public.CDN_ENABLED){
        return CDN.get_cdn_url()+url;

        // if(Meteor.isDevelopment || !process.env.GALAXY_APP_VERSION_ID) return `http://d30nklzkhaqiiz.cloudfront.net${url}`;
        //
        // if(url.indexOf('?')!=-1)return `http://d30nklzkhaqiiz.cloudfront.net${url}?_g_app_v_=${process.env.GALAXY_APP_VERSION_ID}`;
        // else return `http://d30nklzkhaqiiz.cloudfront.net${url}&_g_app_v_=${process.env.GALAXY_APP_VERSION_ID}`;
    }
    return url;
}
clearMeta = function() {
    addLangLink();
    if(!Meteor.isClient)return;
    var arr_elms = [];
    arr_elms = document.head.getElementsByTagName("meta"); // This var is reactive
    var c = 0;
    while(arr_elms[c]){//First 3 are default and useful
        // console.log(arr_elms[3])
        if(arr_elms[c].name == "description")
            document.head.removeChild(arr_elms[c]);
        c++;
    }
    // console.log('Removed: '+c);
    ///Below code removed extra link hreflang 's
    arr_elms = []
    arr_elms = document.head.getElementsByTagName("link"); // This var is reactive
    c = 0;
    while(arr_elms[c]){//First 3 are default and useful
        if(arr_elms[c].hreflang)
            document.head.removeChild(arr_elms[c]);
        c++;
    }
}
addLangLink = function(){
    try {
        // <link rel="alternate" href="https://www.spotmycrib.ie/" hreflang="en-ie" />
        var currentURL = FlowRouter.url(FlowRouter.current().route.name, FlowRouter.current().params, FlowRouter.current().queryParams)
        var linkInfo = {rel: "alternate", hreflang: "en-ie", href: currentURL};
        DocHead.addLink(linkInfo);

        if(FlowRouter.current().route.name != 'letting')
            DocHead.addMeta({rel: "canonical", href: currentURL });
        // console.log('In addLang');
    }catch(e){

    }
}
fbq = function(){}//Replacement for FB pixel code