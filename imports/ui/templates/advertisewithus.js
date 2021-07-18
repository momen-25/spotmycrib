import "./advertisewithus.html";
import "./imageView.html";
import './shared.js';
import "./editProperty.js";
searialisedAdvertiseForm = '';
advertiseWithUsFormInstance = '';
advertiseWithUsFormDelayedRan1st = false;
Template.advertisewithus.onCreated(function(){
    // var pageno = parseInt(Router.current().params.pageno); if(!pageno)pageno=1;
    // this.curStep = new ReactiveVar( pageno );
})
Template.advertisewithus.helpers({
    curTemplate:function(){
        // var curStep = Template.instance().curStep.get();
        var curStep = parseInt(Router.current().params.pageno); if(!curStep)curStep=1;
        switch(curStep){
            case 1:advertiseWithUsFormDelayedRan1st = false;return 'aws_step1';
            case 2:return 'aws_step2';
            case 3:return 'aws_step3';
        }
        return '';
    },
    stepUpdater:function () {
        var stepUpdater = Session.get('stepUpdater');
        // var curStep = Template.instance().curStep.get();
        var curStep = parseInt(Router.current().params.pageno); if(!curStep)curStep=1;
        if(stepUpdater)
        if(stepUpdater != curStep){//it changed
            // if(stepUpdater==1){//You are moving to step 1
            //
            // }
            Template.instance().curStep.set(stepUpdater);
            Session.set('stepUpdater',undefined);
        }

        var loginFlowComplete = Session.get('loginFlowComplete')
        if(curStep == 2 && loginFlowComplete){
            fbq('track', 'Lead');
            ga('send', 'event', 'AdvertiseWithUsPage', 'UserLoginCompleted', 'User login / signup')
            Router.go('advertisewithus',{pageno:3})
            // Template.instance().curStep.set(3);
        }
        // if(curStep == 3 && !fsClient){
        //     import filestack from 'filestack-js';
        //     const apikey = 'AIPACLEs7ShGwwPh6fMTxz';
        //     fsClient = filestack.init(apikey, {
        //             policy: 'eyJleHBpcnkiOjE4NjE5MjAwMDAsImNhbGwiOlsicGljayIsInJlYWQiLCJzdGF0Iiwid3JpdGUiLCJ3cml0ZVVybCIsInN0b3JlIiwiY29udmVydCIsInJlbW92ZSIsImV4aWYiXX0=',
        //             signature: '465e8652c5cef95f44e5858e09d430abea855d98deaeb7425558f2c80d0f4f57'
        //         });
        // }
    },
    curStep:function () {
        var pageno = parseInt(Router.current().params.pageno); if(!pageno)pageno=1;
        return pageno;
    },
    isStep1:function () {
        var curStep = parseInt(Router.current().params.pageno); if(!curStep)curStep=1;
        return curStep==1;
    }
})
function updateFormFromLocalStorage(){
    if (localStorage) {
        if(localStorage.advertisewithusFormData){
            $( "input[name='address.address']" ).val(localStorage.advertisewithusFormData_address);
            $( "input[name='price']" ).val(localStorage.advertisewithusFormData_price);
            $( "select[name='address.county']" ).val(localStorage.advertisewithusFormData_county);
            $( "select[name='address.area']" ).val(localStorage.advertisewithusFormData_area);
            $( "select[name='type']" ).val(localStorage.advertisewithusFormData_type);
            $( "select[name='furnished']" ).val(localStorage.advertisewithusFormData_furnished);
            $( "input[name='baths']" ).val(localStorage.advertisewithusFormData_baths);
            $( "input[name='numBedRoomCount']" ).val(localStorage.advertisewithusFormData_numBedRoomCount);
        }
    }
}
function saveToLocalStorage(){
    searialisedAdvertiseForm = $('#advertiseWithUsFormCF').serializeArray();
    if (localStorage) {
        // localStorage.searialisedAdvertiseForm=searialisedAdvertiseForm// doesn' work as it saves as string, but we need to store as object
        localStorage.advertisewithusFormData={}
        localStorage.advertisewithusFormData_address = $( "input[name='address.address']" ).val();
        localStorage.advertisewithusFormData_price = $( "input[name='price']" ).val();
        localStorage.advertisewithusFormData_county = $( "select[name='address.county']" ).val();
        localStorage.advertisewithusFormData_area = $( "select[name='address.area']" ).val();
        localStorage.advertisewithusFormData_type = $( "select[name='type']" ).val();
        localStorage.advertisewithusFormData_furnished = $( "select[name='furnished']" ).val();
        localStorage.advertisewithusFormData_baths = $( "input[name='baths']" ).val();
        localStorage.advertisewithusFormData_numBedRoomCount = $( "input[name='numBedRoomCount']" ).val();
    }
}
Template.aws_step2.events({
    'click .backBtn':function () {
        Router.go('advertisewithus')
        // Session.set('stepUpdater',1)
    }
})
Template.aws_step3.onCreated(function(){
    this.propertyId = new ReactiveVar( false );
    this.auctionId = new ReactiveVar( false );
    Session.set('OpenImageUploader',false);
})
Template.aws_step3.events({
    "click .openFileUploader":function (event, template) {
        event.preventDefault();
        openPicker();
        return;
    },
    'click .backBtn':function () {
        Router.go('advertisewithus')
        // Session.set('stepUpdater',1)
    },
    'click .addPropImages':function () {
        ga('send', 'event', 'AdvertiseWithUsPage', 'addPropertyImagesBtnClick', 'AddPropertyImages button clicked.');
        Session.set('OpenImageUploader',true);
        Session.set('fromAdvertiseWithUsPage',true);
        Router.go('account/editproperty',{id:Template.instance().propertyId.get()})
    }
})
Template.aws_step3.helpers({
    propertyId:function () {
        return Template.instance().propertyId.get();
    },
    auctionKey:function () {
        var auctionId = Template.instance().auctionId.get();
        if(!auctionId)return ;

        var auction = Collections.Auctions.find({_id:auctionId}).fetch();
        if(!auction.length)return ;

        return auction[0].lettingAuctionCode;
    }
})
Template.aws_step3.onRendered(function () {
    var user = Meteor.user();
    if(!user){//
        // console.log('User still didnt login');
        Router.go('advertisewithus',{pageno:2})
        // Session.set('stepUpdater',2);//Back to step 2
        return;
    }
    if(!searialisedAdvertiseForm){
        // console.log('Cant find form data');
        Router.go('advertisewithus')
        // Session.set('stepUpdater',1);//Back to step 1
        return;
    }

    var templateInstance = Template.instance();
    Meteor.call('addProperty',searialisedAdvertiseForm,function (error, propertyId) {

        if(error){
            console.log(error)
            var tmp =  Session.get("showErrorDlg");if(!tmp)tmp=[];
            var msg = 'An error occurred.';
            if(error.reason)msg += ' '+error.reason+'.'
            else if(error.message)msg += ' '+error.message+'.'
            tmp.push(msg);
            Session.set("showErrorDlg",tmp)
            return;
        }
        templateInstance.propertyId.set(propertyId)
        Meteor.call('addAdvertisement',searialisedAdvertiseForm,propertyId,function (error, auctionId) {

            if(error){
                console.log(error)
                //    validator.showErrors({
                //         email: error.reason
                //     });
                var tmp =  Session.get("showErrorDlg");if(!tmp)tmp=[];
                var msg = 'An error occurred.';
                if(error.reason)msg += ' '+error.reason+'.'
                else if(error.message)msg += ' '+error.message+'.'
                tmp.push(msg);
                Session.set("showErrorDlg",tmp)
                return;
            }
            console.log('addAdvertisement created successfully')
            console.log(auctionId);
            templateInstance.auctionId.set(auctionId)
        })
    })
})
Template.advertiseWithUsForm.onCreated(function(){

    this.numBedRoomCount = new ReactiveVar( 0 );
    this.addPropertyFormSaving = new ReactiveVar( false );
    this.countySelected = new ReactiveVar( false );
    this.countyRestored = new ReactiveVar( false );
    this.areaRestored = new ReactiveVar( false );
    this.propertyTypeSelected = new ReactiveVar( false );
    advertiseWithUsFormInstance = Template.instance();
})
Template.advertiseWithUsForm.helpers({
    countries:function(){
        return [{label: "Ireland", value: "Ireland", selected:"selected"}];//Both capital
    },
    counties:function(){
        var countyRestored = Template.instance().countyRestored.get();
        // return [{label: "Dublin", value: "dublin"}];//Both capital
        var distinctEntries = _.uniq(Collections.Areas.find({}, {
            sort: {County: 1}, fields: {County: true}
        }).fetch().map(function(x) {
            return x.County;
        }), true);

        if(distinctEntries.length && !advertiseWithUsFormDelayedRan1st){
            advertiseWithUsFormDelayedRan1st = true;
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
        // if(!countyRestored)Template.instance().countyRestored.set(countyRestored);
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
        // if(!areaRestored)Template.instance().areaRestored.set(areaRestored);
        return ret;
    },
    propertyTypes:function(){
        var propertyTypeSelected = Template.instance().propertyTypeSelected.get();

        var Config = Collections.Config.find().fetch();Config = Config[0];
        var ret = [], selected ='';
        if(Config)
        if(Config.propertyType)
        for(var i=0;i< Config.propertyType.length;i++){
            propertyTypeSelected && Config.propertyType[i].value == propertyTypeSelected ?selected='selected' : selected = '';
            ret.push({label: titleCase(Config.propertyType[i].name), value: Config.propertyType[i].value, selected:selected})
        }
        return ret;
    },
    numBedRoomCount:function () {
        var c = Template.instance().numBedRoomCount.get();
        if(c<100)return Template.instance().numBedRoomCount.get();
        else return 0;
    },
    addPropertyFormSaving:function () {
        return Template.instance().addPropertyFormSaving.get();
    },
    ensuiteLoop: function(count){
        var countArr = [];
        for (var i=0; i<count; i++){
            countArr.push({i:i+1});
        }
        return countArr;
    }
})
Template.advertiseWithUsForm.events({
    'change select':function () {
        saveToLocalStorage();
    },
    'change input[name=price]':function(event, template){
        if(event.target.value){
            var tmp = event.target.value.split('.');tmp=tmp[0]//No decimals
            tmp = tmp.trim().match(/\d+/g)
            if(!Array.isArray(tmp))event.target.value = '';
            event.target.value = tmp.join('');
        }
    },
    'change input':function () {
        saveToLocalStorage();
    },
    'change .countySelected': function(event, template) {
        template.countySelected.set(event.target.value);
    },
    'change #numBedRoomCount': function(event, template) {
        var numBedRoomCount = parseInt($(event.target).val());
        if(isNaN(numBedRoomCount))return;
        Template.instance().numBedRoomCount.set(numBedRoomCount);
        t1 = template;
        setTimeout(function () {
            t1.$('#addPropertyFormCF').validate();
        },500)
    },
    'submit form': function(event){
        event.preventDefault();
    },
    "click .addPropertyFormSaveActivateBtn": function(event, template) {
        $('#addPropertyFormCF').submit();
    },
    "click .addPropertyFormCancelBtn": function(event, template) {
        Router.go('home')
    }
});

Template.advertiseWithUsForm.onRendered(function () {

    updateFormFromLocalStorage();

    // this.$('#addPropertyFormCF').validate();
    addPropertyFormSaving = this.addPropertyFormSaving
    var validator = this.$('#advertiseWithUsFormCF').validate({
        submitHandler: function(event){
            addPropertyFormSaving.set(true);//Not needed on this form.
            console.log("You just submitted the 'addPropertyForm' form.");
            saveToLocalStorage();
            var user = Meteor.user();
            if(user){
                Router.go('advertisewithus',{pageno:3})
                // Session.set('stepUpdater',3)
            }
            else {
                Router.go('advertisewithus',{pageno:2})
                // Session.set('stepUpdater',2)
            }

        }
    });
    fbq('track', 'ViewContent');
    ga('send', 'event', 'AdvertiseWithUsPage', 'formRendered', 'Form is viewed');
})

function delayedCode() {
    if(localStorage) {
        if (localStorage.advertisewithusFormData_county) {
            advertiseWithUsFormInstance.countySelected.set(localStorage.advertisewithusFormData_county);
            advertiseWithUsFormInstance.countyRestored.set(localStorage.advertisewithusFormData_county);
        }
        if (localStorage.advertisewithusFormData_type) {
            advertiseWithUsFormInstance.propertyTypeSelected.set(localStorage.advertisewithusFormData_type);
        }
        if (localStorage.advertisewithusFormData_numBedRoomCount) {
            advertiseWithUsFormInstance.numBedRoomCount.set(localStorage.advertisewithusFormData_numBedRoomCount) ;
        }
    }
    setTimeout(function () {
        if (localStorage.advertisewithusFormData_area) {
            advertiseWithUsFormInstance.areaRestored.set(localStorage.advertisewithusFormData_area);
        }
    },1000)
}
function titleCase(str){
    if(!str)return;
    return str.charAt(0).toUpperCase() + str.toLowerCase().substring(1);
}
