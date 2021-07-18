/**
 * Created by srikanth681 on 14/02/16.
 */
import {Template} from "meteor/templating";
import "./home.html";
homeSearchFormDelayedRan1st = false;
homePageMainFormInstance = '';
Template.homePageMainForm.onCreated(function(){//This onCreated runs when the form is first created.
    //This is create a template variable. its like var someVar;
    this.showFilters = new ReactiveVar( false );//Variable name is showFilters
    this.countySelected = new ReactiveVar( false );
    this.countyRestored = new ReactiveVar( false );
    this.areaRestored = new ReactiveVar( false );
    homePageMainFormInstance = Template.instance();
})
Template.homePageMainForm.helpers({
    "showFilters": function(){// This helper works like a variable that can be used in html, like {{varName}}
        return Template.instance().showFilters.get() ;//To get value of it we need to use all Template.instance(). and then use .get()
    },
    countries:function(){
        return [{label: "Ireland", value: "Ireland", selected:"selected"}];//Both capital
    },
    counties:function(){
        var countyRestored = Template.instance().countyRestored.get();
        var staticCounties = ["Carlow", "Cavan", "Clare", "Cork", "Donegal", "Dublin", "Galway", "Kerry", "Kildare", "Kilkenny", "Laois", "Leitrim", "Limerick", "Longford", "Louth", "Mayo", "Meath", "Monaghan", "Offaly", "Roscommon", "Sligo", "Tipperary", "Waterford", "Westmeath", "Wexford", "Wicklow"];

        var ret = [], selected ='';
        for(var i=0;i< staticCounties.length;i++){
            if(!staticCounties[i])continue;
            // if(staticCounties[i] == 'Dublin'){
            //     selected='selected' ;
            // }else selected = '';
            if(countyRestored && staticCounties[i] == countyRestored){
                countyRestored = false;
                selected='selected' ;
            }else selected = '';
            ret.push({label: staticCounties[i], value: staticCounties[i], selected:selected })
        }
        return ret;

        var countyRestored = Template.instance().countyRestored.get();
        // return [{label: "Dublin", value: "dublin"}];//Both capital
        var distinctEntries = _.uniq(Collections.Areas.find({}, {
            sort: {County: 1}, fields: {County: true}
        }).fetch().map(function(x) {
            return x.County;
        }), true);

        if(distinctEntries.length && !homeSearchFormDelayedRan1st){
            homeSearchFormDelayedRan1st = true;
            setTimeout(delayedCode,1000)
        }

        var ret = [], selected ='';
        for(var i=0;i< distinctEntries.length;i++){
            if(!distinctEntries[i])continue;
            if(countyRestored && distinctEntries[i] == countyRestored){
                countyRestored = false;
                selected='selected' ;
            }else selected = '';
            ret.push({label: titleCase(distinctEntries[i]), value: distinctEntries[i], selected:selected })
        }
        return ret;
    },
    areas:function(){
        var countySelected = Template.instance().countySelected.get();
        var areaRestored = Template.instance().areaRestored.get();
        if(!countySelected){
            return [];
        }

        var distinctEntries = _.uniq(Collections.Areas.find({County:countySelected}, {
            sort: {Area: 1}, fields: {Area: true}
        }).fetch().map(function(x) {
            return x.Area;
        }), true);
        var ret = [], selected ='';
        for(var i=0;i< distinctEntries.length;i++){
            if(!distinctEntries[i])continue;
            if(areaRestored && distinctEntries[i] == areaRestored){
                areaRestored = false;
                selected='selected' ;
            }else selected = '';
            ret.push({label: titleCase(distinctEntries[i]), value: distinctEntries[i], selected:selected })
        }
        return ret;
    },
    maxRent:function(){
        var range = [{cur:"eur",min:400,max:10000}]
        var selectedCur = range[0];

        var ret = []
        for(var i=selectedCur.min;i<selectedCur.max+1;i=i+50){
            ret.push({label: i, value: i })
        }
        return ret;
    },
    propertyTypes:function(){
        var Config = Collections.Config.find().fetch();Config = Config[0];
        var ret = []
        for(var i=0;i< Config.propertyType.length;i++){
            ret.push({label: titleCase(Config.propertyType[i].name), value: Config.propertyType[i].value})
        }
        return ret;
    },
})
Template.homePageMainForm.events({
    "click .showFilters":function(){
        //see if its true, if yes, then make it false, else make it true.
        if(Template.instance().showFilters.get() )Template.instance().showFilters.set(false);
        else Template.instance().showFilters.set(true);
    },
    'change .countySelected': function(event, template) {
        template.countySelected.set(event.target.value);
        setTimeout(function(){
            $('.areaSelected').val("")
            saveToLocalStorage();
        },250)
    },
    'change .areaSelected': function(event, template) {
        setTimeout(saveToLocalStorage,250)
    },
    'change .maxRent': function(event, template) {
        saveToLocalStorage();
    },
    'change .propertyType': function(event, template) {
        saveToLocalStorage();
    },
    "submit .propertykey-form":function (event) {
      event.preventDefault();
      const target = event.target;
      const key = target.propertykey.value;
      if(key){
          Router.go('letting',{key:key.toUpperCase()})
          return;
      }

    // const territory = target.territory.value;

        var data={
            country:target.country.value,
            county:target.countySelected.value,
            area:target.areaSelected.value,
            maxRent:target.maxRent.value,
            propertyType:target.propertyType.value,
        }
        var slug = generateSlug(data);
        Router.go('b',{slug:slug[0]},{query: slug[1]})

  },
})
Template.homePageMainForm.onRendered(function () {
    setTimeout(delayedCode,250)
})

Template.homePage.events({
  "click .joinNowBtn": function(){
      Session.set('showForgotForm',false)
      Session.set('isLandLordMode',true)
      Session.set('showSignupForm',true)
      Session.set('showLoginSignupFancyBoxDialog',true)
      Session.set('showLoginDialog',true)
  },
  "click .postYourProperty": function(event){
      event.preventDefault();
      var prevRoute = {name: Router.current().route.getName(),args:{scrollTo:0},instructions:{openPostNewProp:true} }
      Session.set('prevRoute',prevRoute);
      Router.go('account/myProperties')
  }
})
//
// Template.homePage.helpers({
//   valueAuctions: function() {
//     var Projects = Collections.Properties;
//     var limit = 6;
//     var selector = {};
//
//     /*Dates Logic*/
//     var date = new Date(); var date2;
//     date.setHours(0,0,0,0)
//     var gloablConfig = Collections.Config.findOne();
//     var endDay = parseInt(gloablConfig.auctionEndDay)
//     if(date.getDate()<endDay+1){
//       date2 = new Date(date.getFullYear(),date.getMonth(),endDay)
//     }else{
//       date2 = new Date(date.getFullYear(),date.getMonth()+1,endDay)
//     }
//     date2.setHours(23,59,59,999);
//     //date2.toDateString()
//     //selector.auctionEndsAt = { $lte : date2, $gte : date }
//     selector.auctionEndsAt = { $gte : date }
//
//     var ret = Projects.find(selector, {
//       //sort: {
//       //  title: 1
//       //},
//       limit: limit
//     });
//     // console.log('in valueAuctions');
//     //console.log(ret);
//     return ret;
//   },
//   endsDate: function(){
//     var date = new Date(); var date2;
//     var gloablConfig = Collections.Config.findOne();
//     var endDay = parseInt(gloablConfig.auctionEndDay)
//     if(date.getDay()<endDay+1){
//       date2 = new Date(date.getFullYear(),date.getMonth(),endDay)
//     }else{
//       date2 = new Date(date.getFullYear(),date.getMonth()+1,endDay)
//     }
//     return date2.toDateString()
//   }
// })
// Template.homePageValueAuctions.helpers({
//   cityData: function(city) {
//     let Projects = Collections.Properties;
//     let limit = 6;
//     let selector = {
//       "projectDetails.address.county" : city
//     };
//
//     var ret = Projects.find(selector, {
//       //sort: {
//       //  title: 1
//       //},
//       limit: limit
//     });
//     // console.log('in cityData');
//     // console.log(ret);
//     return ret;
//   }
// })

function delayedCode() {
    var county = '';
    if(localStorage) {
        if (localStorage.homePageMainFormData_maxRent) {
            $('.maxRent').val(localStorage.homePageMainFormData_maxRent);
        }
        if (localStorage.homePageMainFormData_county) {
            county=localStorage.homePageMainFormData_county;
        }else if(localStorage.homePageMainFormData_county===undefined){//Only for first time users
            county = 'Dublin'
        }
        if (localStorage.homePageMainFormData_propertyType) {
            var tmp = localStorage.homePageMainFormData_propertyType
            $('input:radio[name=propertyType]').removeAttr('checked');
            $('input:radio[name=propertyType][value="'+tmp+'"]').prop('checked', true)
        }
    }
    homePageMainFormInstance.countyRestored.set(county);
    homePageMainFormInstance.countySelected.set(county);
    setTimeout(function () {
        $('.countySelected').val(county)
    },100)
    setTimeout(function () {
        if (localStorage.homePageMainFormData_area) {
            homePageMainFormInstance.areaRestored.set(localStorage.homePageMainFormData_area);
            setTimeout(function () {
                $('.areaSelected').val(localStorage.homePageMainFormData_area)
            },100)
        }
    },1000)
}
function saveToLocalStorage(){
    if (localStorage) {
        // if($( ".countySelected" ).val().toString().trim()) //It needs to work even all options are reset, i.e its empty.
        localStorage.homePageMainFormData_county = $( ".countySelected" ).val();
        // if($( ".areaSelected" ).val().toString().trim())//it needs to reset to empty
        localStorage.homePageMainFormData_area = $( ".areaSelected" ).val();
        var tmp = $( "input:radio[name=propertyType]:checked" ).val();
        if(tmp)localStorage.homePageMainFormData_propertyType = tmp
        tmp = $('.maxRent').val()
        if(tmp)localStorage.homePageMainFormData_maxRent = $('.maxRent').val();
    }
}


Template.homePage.onCreated(function() {
  Session.set('showLoginInPlace',false);
})
Template.homePage.onRendered(function() {
    if ( /^((?!chrome|android).)*safari/i.test(navigator.userAgent)) {
        $('select').addClass('safariSelect')//css('-moz-appearance','none');
    }
    // $('.scroll1').click(function (e) {
    //     e.preventDefault();
    //     $('html,body').animate({scrollTop: $(this.hash).offset().top }, 1000)
    //
    //     $('.scroll1').removeClass('active');
    //     $(this).addClass('active');
    //
    // });
    $('.iamarenterbtn').click(function (e) {
        e.preventDefault();
        $('html,body').animate({scrollTop: $(this.hash).offset().top }, 500,function(){
            $(".bigsearchbox").css({border: '0 solid red'}).animate({
//          opacity:"0.5",
                borderWidth: 2
            }, 500, function() {
                $(".bigsearchbox").animate({
//            opacity:"1",
                    borderWidth: 0
                }, 500);
            });
        })
    });


    // $("#video").click(function () {
    //     $.fancybox({
    //         'padding': 0,
    //         'href': '#video-div',
    //     });
    // });
});
function titleCase(str){
    if(!str)return;
    return str.charAt(0).toUpperCase() + str.toLowerCase().substring(1);
}

UI.registerHelper('withResult', function () {
  Template._withResult.helpers({result: this.valueOf()});
  return Template._withResult;
});
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
function resotreSlugify(text){
    if(!text)return '';
    return text.toLowerCase().replace(/\s+/g, '_')
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