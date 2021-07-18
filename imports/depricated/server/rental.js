/**
 * Created by njanjanam on 10/05/2018.
 */
//SERVER ROUTES
// var fs = Npm.require('fs');
// var path = Npm.require('path');
// var basePath = path.resolve('.').split('.meteor')[0];
// basePath += 'private/cache/'
// console.log(basePath)

var AWS = Npm.require('aws-sdk');
var config = new AWS.Config({
    accessKeyId: Meteor.settings['galaxy.meteor.com'].env.accessKeyId, secretAccessKey: Meteor.settings['galaxy.meteor.com'].env.secretAccessKey, region: Meteor.settings['galaxy.meteor.com'].env.region
});
var s3 = new AWS.S3(config);
var myBucket = 'flatbid-cache';


Meteor.methods({
    createCache: function (html,key) {
        console.log('in createCache method');
        this.unblock();

        var filename = 'LDPage/'+ key +'.html';
        // var temPath = basePath+'rent/'+ key +'.html';
        var Minimize = require('minimize')
            , minimize = new Minimize();

        minimize.parse(html, function (error, data) {
            // console.log('Minimised');
            // console.log(data);
            // fs.writeFileSync(temPath , data, 'utf8');
            var params = {
                Bucket    : myBucket,
                Key           : filename,
                ContentLength : data.size,
                Body          : Date.now()+'{jns}'+data
            };

            s3.putObject(params, function(err, data) {
                console.log('Cache create for: '+filename + " Length: "+html.length)
                // console.log(data)
                // console.log(err)
            });
        });

        return;
        // fs.writeFileSync(temPath , data, 'utf8');
    },
    clearCache:function(key){
        console.log('in clearCache method');
    }
});

Router.map(function route() {

    this.route('rent', {
        path: 'rent/:slug/:key',
        where:"server",
        action : function() {
            // console.log('Server LD: '+this.params.key)
            var start = new Date().getTime();

            var url = 'https://s3-eu-west-1.amazonaws.com/flatbid-cache/LDPage/' + this.params.key + '.html';
            try {
                result = Meteor.http.get(url);
                if(result.statusCode==200){
                    var tmp = result.content.split('{jns}')
                    var ftime = parseInt(tmp[0])
                    var minHTML = tmp[1]
                    var tnow = Date.now();
                    var diff = tnow - ftime;

                    var cacheExpiryTimeinMS = 48 * 60 * 60 *1000 //48 hours
                    // var cacheExpiryTimeinMS = 60 *1000 //1 sec

                    if(diff < cacheExpiryTimeinMS) {//Cachce has not expired yet.
                        console.log('Fetching from cache: '+this.params.key);
                        this.response.writeHead(200, {'Content-Type': 'text/html'});
                        this.response.end(minHTML);

                        return;
                    }else{
                        console.log('Cache expired: '+this.params.key);
                        Meteor.call('clearCache',this.params.key);
                    }
                }else{
                    console.log('No cache: '+this.params.key);
                }
            }catch(e){
                console.log('Cache not found: '+this.params.key);
            }

            // var temPath = basePath + 'rent/' + this.params.key + '.html';
            // try {
            //     // stats.atimeMs
            //     var stats = fs.statSync(temPath)
            //     if (stats) {
            //         var ftime = Date.parse(stats.atime);
            //         var tnow = Date.now();
            //         var diff = tnow - ftime;
            //         // console.log(diff)
            //
            //         var cacheExpiryTimeinMS = 48 * 60 * 60 *1000 //48 hours
            //         // var cacheExpiryTimeinMS = 60 *1000 //1 sec
            //
            //         if(diff < cacheExpiryTimeinMS) {//Cachce has not expired yet.
            //             console.log('Fetching from cache');
            //             var minHTML = Assets.getText('cache/rent/' + this.params.key + '.html')
            //             this.response.writeHead(200, {'Content-Type': 'text/html'});
            //             this.response.end(minHTML);
            //             var end = new Date().getTime();
            //                         time = end - start;
            //                         console.log('Cache Execution time: ' + time);
            //             return;
            //         }else{
            //             console.log('Cache expired: '+temPath);
            //         }
            //     }
            // }catch(e){
            //     console.log('Cache not found: '+temPath);
            // }
            // var check = new Date().getTime();
            // time = check - start;
            // console.log('1 Check Execution time: ' + time);
            // SSR.compileTemplate('loginForm', Assets.getText('uiServer/layout/loginForm.html'));
            // SSR.compileTemplate('headerExtended', Assets.getText('uiServer/layout/header.html'));
            // SSR.compileTemplate('footer', Assets.getText('uiServer/layout/footer.html'));
            SSR.compileTemplate('layout', Assets.getText('uiServer/layout/layout.html'));
            // var check = new Date().getTime();
            // time = check - start;
            // console.log('2 Check Execution time: ' + time);
            Template.layout.helpers({
                "getDocType": function() {
                    return "<!DOCTYPE html>";
                },
                "hostname": function(){
                    return Meteor.absoluteUrl();
                }
            });
            // var check = new Date().getTime();
            // time = check - start;
            // console.log('3 Check Execution time: ' + time);
            // SSR.compileTemplate('testssr', Assets.getText('uiServer/testssr.html'));
            SSR.compileTemplate('imagesSlider', Assets.getText('uiServer/templates/imagesSlider.html'));
            // var check = new Date().getTime();
            // time = check - start;
            // console.log('4 Check Execution time: ' + time);
            SSR.compileTemplate('lettingDetail', Assets.getText('uiServer/templates/lettingDetail.html'));
            // var check = new Date().getTime();
            // time = check - start;
            // console.log('5 Check Execution time: ' + time);
            Template.lettingDetail.onCreated(function() {
                this.isApplicationInProgress = new ReactiveVar( false );
                this.isPageLocked = new ReactiveVar( true );
                isPageLockedMaster = this.isPageLocked;
            })
            Template.lettingDetail.helpers({
                priceRange: function(){
                    var min = this.data.price*0.7, max = this.data.price*1.5;// also used in propertyApplications.onRendered
                    return {min:min, max:max}
                },
                currentURL:function () {
                    return Router.current().originalUrl;
                },
                alreadyLeased:function () {
                    if(!this.data){
                        return false;
                    }
                    if(this.data.isArchived){
                        if(prevRoute){
                        }else{
                        }
                        return true;
                    }
                    return false;
                },
                isAgent:function(){
                    // return {
                    //     "logourl":Meteor.absoluteUrl()+'images/property-rental-agents/Bell-Property-Consultants.jpeg',
                    //     "name": 'Bell Property Consultants Ltd',
                    //     "address1":"Harolds Cross, Dublin",
                    //     "style":"height:100px;"
                    // }
                switch(this.data.createdByAgent){
                    case 'zWu7Niwj9ruGWRwmH':
                        return {
                            "logourl":Meteor.absoluteUrl()+'images/property-rental-agents/Bell-Property-Consultants.jpeg',
                            "name": 'Bell Property Consultants Ltd',
                            "address1":"Harolds Cross, Dublin",
                            "style":"height:100px;"
                        }
                }

                return false;
            }
            })
            Template.imagesSlider.helpers({
                images: function(){
                    // console.log(this.data);
                    var data = this.data;
                    var list = []
                    // debugger;
                    try{if(data.PD.gallery){}}catch(e){ return []; }
                    for(var i=0;i<data.PD.gallery.length;i++){
                        list.push(data.PD.gallery[i].url)
                    }
                    return list;
                },
                altText:function(){
                    var data = this.data.PD;
                    return '' {{titleCase data.PD.address.address}}{{#if data.PD.address.area}}, {{titleCase data.PD.address.area}}{{/if}}{{#if data.PD.address.county}}, {{titleCase data.PD.address.county}} {{/if}}
                },
                isActive: function (index) {
                    return (index==0) ? 'active': '';
                }
            })
            // var check = new Date().getTime();
            // time = check - start;
            // console.log('6 Check Execution time: ' + time);
            var id = this.params.key;
            var html = SSR.render('layout', {
                template: "lettingDetail",
                data : function () {
                    // debugger;

                    let Projects = Collections.Auctions;
                    let selector = {
                        "lettingAuctionCode" : id
                    };
                    var ret = Projects.findOne(selector, {
                        transform: function(data){

                            var globalConfig = Collections.Config.findOne();
                            data.PD = Collections.Properties.findOne(data.propertyId);
                            data.applicationsReceivedCount = Collections.Bids.find({auctionId:data._id}).count();

                            ////////// BREADCRUMBS
                            let bcrumbs = [];let slugTemp;
                            // Home / Search Residential Rentals / Dublin City Apartments for Rent / Dublin 2 Apartments for Rent
                            if(data.PD.address.county){
                                slugTemp = generateSlug({county:data.PD.address.county})
                                bcrumbs.push({slug: slugTemp[0], name:titleCase(data.PD.address.county)})
                            }
                            if(data.PD.address.area && data.PD.address.county) {
                                slugTemp = generateSlug({county: data.PD.address.county, area:data.PD.address.area})
                                bcrumbs.push({slug: slugTemp[0], name: titleCase(data.PD.address.area)})
                            }
                            if(data.PD.address.area && data.PD.address.county && data.PD.type) {
                                slugTemp = generateSlug({
                                    county: data.PD.address.county,
                                    area: data.PD.address.area,
                                    propertyType: data.PD.type
                                })
                                bcrumbs.push({slug: slugTemp[0], name: titleCase(data.PD.type)})
                            }
                            data.bcrumbs = bcrumbs;
                            ////////// END BREADCRUMBS
                            //////// FILTERS
                            var filters = {
                                "type":data.PD.type,
                                "address.county":data.PD.address.county,
                                "address.area":data.PD.address.area,
                                "auctionId": {$exists:true, $gt: "" },
                                "isArchived":false
                            }

                            data.relatedProps = []
                            var tmpRelated = Collections.Properties.find(filters,{
                                transform:function(doc){
                                    doc.auction = Collections.Auctions.findOne({_id:doc.auctionId})
                                    if(doc.gallery){
                                        if(doc.gallery[0])doc.firstImg = doc.gallery[0]
                                    }
                                    return doc;
                                },
                                limit:4}).fetch();
                            data.relatedProps = data.relatedProps.concat(tmpRelated);

                            if(data.relatedProps.length<4){
                                delete filters["address.area"];
                                var tmpRelated = Collections.Properties.find(filters,{
                                    transform:function(doc){
                                        doc.auction = Collections.Auctions.findOne({_id:doc.auctionId})
                                        if(doc.gallery){
                                            if(doc.gallery[0])doc.firstImg = doc.gallery[0]
                                        }
                                        return doc;
                                    },
                                    limit:4}).fetch();
                                data.relatedProps = data.relatedProps.concat(tmpRelated);
                            }
                            if(data.relatedProps.length<4){
                                delete filters["address.county"]
                                var tmpRelated = Collections.Properties.find(filters,{
                                    transform:function(doc){
                                        doc.auction = Collections.Auctions.findOne({_id:doc.auctionId})
                                        if(doc.gallery){
                                            if(doc.gallery[0])doc.firstImg = doc.gallery[0]
                                        }
                                        return doc;
                                    },
                                    limit:4}).fetch();
                                data.relatedProps = data.relatedProps.concat(tmpRelated);(tmpRelated);
                            }
                            if(data.relatedProps.length<4){
                                delete filters["type"]
                                var tmpRelated = Collections.Properties.find(filters,{
                                    transform:function(doc){
                                        doc.auction = Collections.Auctions.findOne({_id:doc.auctionId})
                                        if(doc.gallery){
                                            if(doc.gallery[0])doc.firstImg = doc.gallery[0]
                                        }
                                        return doc;
                                    },
                                    limit:4}).fetch();
                                data.relatedProps = data.relatedProps.concat(tmpRelated);(tmpRelated);
                            }
                            if(data.relatedProps.length>4){
                                data.relatedProps = data.relatedProps.slice(0,4);
                            }
                            ///////// END FILTERS

                            data.PD.bedroomsCount=0
                            data.PD.ensuiteCount = 0;
                            data.PD.doubleBedCount = 0;
                            if(data.PD.bedrooms){
                                data.PD.bedroomsCount = data.PD.bedrooms.length;
                                for (var i = 0; i < data.PD.bedrooms.length; i++) {
                                    if (data.PD.bedrooms[i]["ensuite"] ) {
                                        data.PD.ensuiteCount++;
                                    }
                                    if (data.PD.bedrooms[i]["bedType"] == 'double' ) {
                                        data.PD.doubleBedCount++;
                                    }
                                }
                            }

                            if(data.contacts) {//Take the contact of activation not property
                                data.primaryContact = data.contacts[0];
                            }else data.primaryContact = {};

                            tmp = [];
                            if(data.PD.amenities){
                                for ( var i=0; i< data.PD.amenities.length;i++){
                                    var src = globalConfig.amenitiesLogos[data.PD.amenities[i]];
                                    if(!src)src = globalConfig.amenitiesLogos["default"]
                                    tmp.push({name:data.PD.amenities[i], src: src })
                                }
                            }
                            data.PD.amenitiesWithImgs = tmp;


                            return data;
                        },
                        limit: 1
                    })

                    return {data:ret};
                },
            });
            // var check = new Date().getTime();
            // time = check - start;
            // console.log('7 Check Execution time: ' + time);
            // console.log('html generated: '+html.length)
            var response = this.response;
            // var check = new Date().getTime();
            // time = check - start;
            // console.log('8 Check Execution time: ' + time);

            // var minify = require('html-minifier').minify;
            // var minHTML = minify(html,{
            //     removeComments:true,
            //     html5:true,
            //     removeComments:true,
            //     trimCustomFragments:true,
            // });
            var key = this.params.key;
            // Meteor.wrapAsync(function(){
            //     console.log('inside wrap')
            //     Meteor.call('createCache',html,key);
            // })
            // Meteor.call('createCache',html,key);

            // var check = new Date().getTime();
            // time = check - start;
            // console.log('9 Check Execution time: ' + time);
            response.writeHead(200, {'Content-Type':'text/html'});
            response.end(html);
            var end = new Date().getTime();
            time = end - start;
            console.log('Full Execution time: ' + time);
        }
    });

});

function titleCase(str){
    if(!str)return;
    return str.charAt(0).toUpperCase() + str.toLowerCase().substring(1);
}
function generateSlug(curURL){
    var propertyType = curURL.propertyType;
    var county = curURL.county
    var area = curURL.area
    var maxRent = curURL.maxRent
    var country = curURL.country;
    // const territory = target.territory.value;

    var slug='';
    var query='';

    if(propertyType)propertyType = propertyType.replace(/\s+/g, '_')
    if(county)county = county.replace(/\s+/g, '_')
    if(area)area = area.replace(/\s+/g, '_')
    if(country)country = country.replace(/\s+/g, '_')

    if(propertyType)slug=propertyType+"-for-"
    slug+="rent"
    // if(areaSelected||countySelected||country)
    slug+="-in-"

    if(!county)area = '';

    if(area)slug+=area
    if(area && county)slug+="-"
    if(county)slug+=county

    if(country)slug+="-"+country
    else slug+="-ireland"

    var range = [{cur:"eur",min:400,max:10000}]
    var selectedCur = range[0];
    if(maxRent && maxRent!=selectedCur.max)query = "maxRent="+maxRent;

    // apartment-for-rent-in-dundrum-dublin-ireland
    // apartment-for-rent-in-donnybroke-london-uk
    // rent/apartment/dundrum/dublin
    // rent/apartment/donnybroke/london/england/uk/
    return [
        slugify(slug),
        query
    ]
}
function slugify (text) {
    if(!text)return '';
    const a = 'àáäâèéëêìíïîòóöôùúüûñçßÿœæŕśńṕẃǵǹḿǘẍźḧ·/,:;'
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