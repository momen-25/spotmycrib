/**
 * Created by njanjanam on 11/05/2017.
 */
import "./imageView.html";
import "./editProperty.html";
import './shared.js';
import filestack from 'filestack-js';
const apikey = 'AIPACLEs7ShGwwPh6fMTxz';
const fsClient = filestack.init(apikey,{
    policy: 'eyJleHBpcnkiOjE4NjE5MjAwMDAsImNhbGwiOlsicGljayIsInJlYWQiLCJzdGF0Iiwid3JpdGUiLCJ3cml0ZVVybCIsInN0b3JlIiwiY29udmVydCIsInJlbW92ZSIsImV4aWYiXX0=',
    signature: '465e8652c5cef95f44e5858e09d430abea855d98deaeb7425558f2c80d0f4f57'
});
// import SimpleSchema from "simpl-schema";
// SimpleSchema.extendOptions(['autoform']);



Template.editProperty.onCreated(function(){
    // this.showEditProperty = new ReactiveVar( false );
    // console.log(this.data.propertyData)
    // debugger;
    var instance = this;
    instance.isSubsLoaded = new ReactiveVar(false);
    instance.autorun(function(){

        instance.subscribe('Config');
        var id = FlowRouter.getParam('id');
        instance.subscribe('editProperty',id);
        instance.subscribe('Areas');//Let it wait in edit prop page
        instance.subscribe('userData');

        if(instance.subscriptionsReady()){
            instance.isSubsLoaded.set(true)
        }
    })

    this.deactivateInProgress = new ReactiveVar( false );
    this.archiveInProgress = new ReactiveVar( false );
    // Session.set('editPropertyImagesNewOnes',[]);
    // var gallery = this.data.propertyData.gallery;
    // if(!gallery)gallery=[]
    // Session.set('editPropertyImages',gallery);
})
Template.editProperty.helpers({
    // showEditProperty: function () {
    //     return Template.instance().showEditProperty.get();
    // },
    // propertyData : function () {
    //     var ret = getpropertyData();
    //     // console.log("propertyData");
    //     // console.log(ret);
    //     Session.set('propertyData',ret);
    //     return ret;
    // },
    isSubsLoaded:function(){
        return Template.instance().subscriptionsReady();
    },
    userLoggedIn:function(){
        if(Meteor.user())return true;
        return false;
    },
    propertyData: function () {
        // debugger;


        var id = FlowRouter.current().params.id;
        var ret = Collections.Properties.find(id, {
            transform: function (data) {

                var globalConfig = Collections.Config.findOne();
                if(data.auctionId)data.auction = Collections.Auctions.findOne(data.auctionId);

                return data;
            },
            limit: 1
        }).fetch();
        ret = ret[0];

        clearMeta();
        try {
            var title = 'Editing ' + ret.address.address + ', ' + ret.address.area;
            if (ret.address.county) title += ', ' + ret.address.county;

            DocHead.setTitle('' + titleCase(title) + ' | SpotMyCrib Admin');
            DocHead.addMeta({
                name: "description",
                content: "Edit property " + ret.type + ", upload its images, details and much more."
            });
        }catch(err){
            DocHead.setTitle(' Property not found | SpotMyCrib Admin');
            DocHead.addMeta({name: "description", content: ""});
        }

        Session.set("propertyData", ret);
        return ret;
        // return {propertyData: ret};
    },
    propertyFound:function(){
        var c = Collections.Properties.find().count()
        if(c)return true;
        return false;
    },
    inIgnoreList:function (str) {
        ignoreList = ['gallery','isArchived']
        if(ignoreList.indexOf(str) !== -1)return true;
        return false;
    },
    deactivateInProgress: function(){
        deactivateInProgress = Template.instance().deactivateInProgress;
        return Template.instance().deactivateInProgress.get() ;
    },
    archiveInProgress: function(){
        archiveInProgress = Template.instance().archiveInProgress;
        return Template.instance().archiveInProgress.get() ;
    },
    // getGallery:function () {
    //     // debugger;
    //     var propertyData = Session.get('propertyData');
    //     return propertyData.gallery;
    // }
})
Template.editProperty.onRendered(function() {
    try{
        jQuery("html,body").animate({scrollTop: 0}, 250);
    }catch(e){
        document.body.scrollTop = document.documentElement.scrollTop = 0;
    }



})

Template.editProperty.events({
    "click .deactivatePropertyBtn": function (event, template) {
        event.preventDefault();
        var propertyData = Session.get('propertyData');
        if(!propertyData){
            console.log("Empty project data");
            return false;}
        var user = Meteor.user();
        if(!user){console.log("Invalid user");return;}
        if(propertyData.createdByAgent != user._id){console.log("Invalid user");return;}

        $.fancybox({
            'padding': 0,
            'href': '#conf-dactivate-pop',
            afterShow:function(template){
                attachEvents();
            },
            afterClose:function(template){
                console.log(template);
            }
        })
    },
    "click .archivePropertyBtn": function (event, template) {
        event.preventDefault();
        var propertyData = Session.get('propertyData');
        if(!propertyData){
            console.log("Empty project data");
            return false;}
        var user = Meteor.user();
        if(!user){console.log("Invalid user");return;}
        if(propertyData.createdByAgent != user._id){console.log("Invalid user");return;}

        $.fancybox({
            'padding': 0,
            'href': '#conf-archive-pop',
            afterShow:function(template){
                attachEvents();
            },
            afterClose:function(template){
                console.log(template);
            }
        })
    },
    // 'change .selectPropertyImages': function(event, template) {
    //     var files = event.target.files;
    //     S3.upload({
    //         files:files,
    //         path:"propertyImagesLarge"
    //     },function(e,r){
    //         if(e){
    //             throw new Meteor.Error('Upload failed ', e);
    //             var tmp =  Session.get("showErrorDlg");if(!tmp)tmp=[];
    //             tmp.push("Upload failed: please check your internet connection, contact us if needed.");
    //             Session.set("showErrorDlg",tmp)
    //             return;
    //         }
    //         var editPropertyImages = Session.get('editPropertyImages');
    //         var editPropertyImagesNewOnes = Session.get('editPropertyImagesNewOnes');
    //         var tmp = {
    //             name: r.file.original_name,
    //             relative_url: r.relative_url,
    //             url: r.secure_url
    //         };
    //         editPropertyImages.push(tmp);
    //         editPropertyImagesNewOnes.push(tmp);
    //         Session.set('editPropertyImages',editPropertyImages);
    //         Session.set('editPropertyImagesNewOnes',editPropertyImagesNewOnes);
    //         var propertyData = Session.get("propertyData");
    //         updateGalleriesInServer(editPropertyImages,propertyData._id, function (err, res) {
    //             if (err) {
    //                 console.log(err);
    //                 var tmp =  Session.get("showErrorDlg");if(!tmp)tmp=[];
    //                 tmp.push("Upload failed: please check your internet connection, contact us if needed.");
    //                 Session.set("showErrorDlg",tmp)
    //                 return;
    //             } else {
    //                 var editPropertyImages = Session.get('editPropertyImages');
    //                 console.log("Current Count: "+editPropertyImages.length )
    //             }
    //         });
    //         console.log(r);
    //     });
    // },
    "click .backBtn": function(event, template){
        goBack();
    },
    'change input[name=price]':function(event, template){
        if(event.target.value){
            var tmp = event.target.value.split('.');tmp=tmp[0]//No decimals
            tmp = tmp.trim().match(/\d+/g)
            if(!Array.isArray(tmp))event.target.value = '';
            event.target.value = tmp.join('');
        }
    },
    "click .showCopyDlg": function (event, template) {
        var propertyData = Session.get('propertyData');

        let user = Meteor.user();
        let sluggedName = slugifyEmailAddress(user.profile.name);
        if(!sluggedName)sluggedName = 'rent'
        let email = sluggedName+'-let-'+propertyData.auction.lettingAuctionCode.toLowerCase()+"@spotmycrib.ie";
        $('#agentPropertyEmailField').val(email);

        var url = FlowRouter.url('letting',{key:propertyData.auction.lettingAuctionCode})
        $('#propertyLinkField').val(url);
        $.fancybox({
            'padding': 0,
            'href': '#propertyLinkDlg',
            afterShow:function(template){
                $('#agentPropertyEmailField').select();
                $('#propertyLinkDlg .copyEmailBtn').unbind().bind('click',function () {
                    $('#agentPropertyEmailField').select();

                    try {
                        var successful = document.execCommand('copy');
                        var msg = successful ? 'successful' : 'unsuccessful';
                        // console.log('Copying text command was ' + msg);
                        $.fancybox.close()
                    } catch (err) {
                        console.log('Oops, unable to copy');
                    }
                    ga('send', 'event', 'editPropertyPage', 'copyShareEmail', 'copyShareEmail Btn Clicked');
                })
                $('#propertyLinkDlg .copyLinkBtn').unbind().bind('click',function () {
                    $('#propertyLinkField').select();

                    try {
                        var successful = document.execCommand('copy');
                        var msg = successful ? 'successful' : 'unsuccessful';
                        // console.log('Copying text command was ' + msg);
                        $.fancybox.close()
                    } catch (err) {
                        console.log('Oops, unable to copy');
                    }
                    ga('send', 'event', 'editPropertyPage', 'copyShareLink', 'copyShareLink Btn Clicked');
                })
                $('#propertyLinkDlg .cancelBtn').unbind().bind('click',function () {
                    $.fancybox.close()
                })
            },
        });

    },
})
Template.editPropertyForm.onCreated(function(){
    if(!Session.get('editPropertyImages')) {// Lets do this. Anyways we have delete button.
        Session.set('editPropertyImages', []);
        S3.collection.remove({})
    }
    this.numBedRoomCount = new ReactiveVar( 0 );
    this.editPropertyFormSaving = new ReactiveVar( false );
    this.countySelected = new ReactiveVar( false );

    var instance = this;
    instance.isSubsLoaded = new ReactiveVar(false);
    instance.autorun(function(){
        if(instance.countySelected.get()){
            instance.isSubsLoaded.set(false)
            instance.subscribe('Areas','','',instance.countySelected.get(),'','');
        }
        if(instance.subscriptionsReady()){
            instance.isSubsLoaded.set(true)
        }
    })

    Session.set('editPropertyImagesNewOnes',[]);
    var gallery = []
    try{gallery = this.data.propertyData.gallery;}catch(e){gallery=[]}
    Session.set('editPropertyImages',gallery);
})
Template.editPropertyForm.helpers({
    'data':function(){
        var user = Meteor.user();
        if(!user) return {
            results: []
        }
        var id = FlowRouter.current().params.id;
        var doc = Collections.Properties.findOne(id,{
            transform: function (data) {
                if(data.auctionId)data.auction = Collections.Auctions.findOne(data.auctionId);
                return data;
            },
            limit: 1
        })
        if(doc)if(doc.bedrooms)
        Template.instance().numBedRoomCount.set(doc.bedrooms.length);

        if(doc)
        if(doc.gallery)Session.set('editPropertyImages',doc.gallery);//This will re-run everytime u update an images and data gets fetched again.

        return doc;
    },
    trimVal:function (str) {
        return str.trim();
    },
    isEqualSelect:function (a,b) {
        if(a==b)return 'selected';
        return '';
    },
    isEqualCheck:function (a,b) {
        if(a==b)return 'checked';
        return '';
    },
    furnishedOptions:function(isFurnished){
        return [{label: "yes", value: "true",selected:isFurnished?'selected':''},{label: "No", value: "false",selected:!isFurnished?'selected':''}];
    },
    countries:function(){
        return [{label: "Ireland", value: "Ireland", selected:"selected"}];//Both capital
    },
    counties:function(){
        let staticCounties = ["Carlow", "Cavan", "Clare", "Cork", "Donegal", "Dublin", "Galway", "Kerry", "Kildare", "Kilkenny", "Laois", "Leitrim", "Limerick", "Longford", "Louth", "Mayo", "Meath", "Monaghan", "Offaly", "Roscommon", "Sligo", "Tipperary", "Waterford", "Westmeath", "Wexford", "Wicklow"];
        let ret = []
        for(let i=0;i< staticCounties.length;i++){
            if(!staticCounties[i])continue;
            ret.push({label: titleCase(staticCounties[i]), value: staticCounties[i] })
        }
        return ret;
        // return [{label: "Dublin", value: "dublin"}];//Both capital
        // var distinctEntries = _.uniq(Collections.Areas.find({}, {
        //     sort: {County: 1}, fields: {County: true}
        // }).fetch().map(function(x) {
        //     return x.County;
        // }), true);
        // var ret = []
        // for(var i=0;i< distinctEntries.length;i++){
        //     if(!distinctEntries[i])continue;
        //     ret.push({label: titleCase(distinctEntries[i]), value: distinctEntries[i] })
        // }
        // return ret;
    },
    areas:function(){
        var countySelected = Template.instance().countySelected.get();
        if(!countySelected){
            var c = Collections.Properties.find().count();
            if(c>1)return [] // This is the fix for - bug of not loading existing areas - page is designed to work with 1 prop, but when user comes to this page from myprop page, it has many results, leading to invalid countySelected
            var doc = Collections.Properties.findOne(); if(!doc)return [];
            Template.instance().countySelected.set(doc.address.county);
            countySelected = doc.address.county;
        }

        var distinctEntries = _.uniq(Collections.Areas.find({County:countySelected}, {
            sort: {Area: 1}, fields: {Area: true}
        }).fetch().map(function(x) {
            return x.Area;
        }), true);
        var ret = []
        for(var i=0;i< distinctEntries.length;i++){
            if(!distinctEntries[i])continue;
            ret.push({label: titleCase(distinctEntries[i]), value: distinctEntries[i] })
        }
        return ret;
        //Previous logic
        // var Config = Collections.Config.find().fetch();Config = Config[0];
        // var ret = []
        // for(var i=0;i< Config.countyInfo.length;i++){
        //     ret.push({label: titleCase(Config.countyInfo[i].area), value: Config.countyInfo[i].area})
        // }
    },
    propertyTypes:function(){
        var Config = Collections.Config.find().fetch();Config = Config[0];
        var ret = []
        for(var i=0;i< Config.propertyType.length;i++){
            ret.push({label: titleCase(Config.propertyType[i].name), value: Config.propertyType[i].value})
        }
        return ret;
    },
    numBedRoomCount:function () {
        var c = Template.instance().numBedRoomCount.get();
        if(c<100)return Template.instance().numBedRoomCount.get();
        else return 0;
    },
    editPropertyFormSaving:function () {
        return Template.instance().editPropertyFormSaving.get();
    },
    ensuiteLoop: function(count){
        var countArr = [];
        for (var i=0; i<count; i++){
            countArr.push({i:i+1});
        }
        return countArr;
    },
    ensuiteLoopCheckbox :function (index) {
        var doc = Collections.Properties.findOne()
        if(doc)if(doc.bedrooms[index]){
            if(doc.bedrooms[index].ensuite)return 'checked';
        }
        return '';
    },
    ensuiteLoopBedType :function (index , b) {
        var doc = Collections.Properties.findOne()
        if(doc)if(doc.bedrooms[index]){
            if(doc.bedrooms[index].bedType == b)return 'selected';
        }
        return '';
    },
    leaseUntil:function () {
        var allowedVals = ['1 month', '2 months', '3 months', '4 months', '5  months', '6 months', '7 months', '8 months', '9 months', '10 months', '11 months', '1 year', 'More than a year'];
        return allowedVals;
    },
    ensuiteLoopBedTypeOptions:function(index){
        var doc = Collections.Properties.findOne();
        var isSingle= false,isDouble= false,isTwin = false;
        if(doc)if(doc.bedrooms)if(doc.bedrooms[index]){
            switch(doc.bedrooms[index].bedType){
                case 'single':isSingle=true;break;
                case 'double':isDouble=true;break;
                case 'twin':isTwin=true;break;
            }
        }
        var arr = [{label: "Single", value: "single",sel:isSingle?'selected':''},{label: "Double", value: "double",sel:isDouble?'selected':''},{label: "Twin", value: "twin",sel:isTwin?'selected':''}];
        return arr;
    },
    hasAmenityCheckbox :function (v) {
        var doc = Collections.Properties.findOne()
        if(doc)
        if(doc.amenities)
        if(doc.amenities.length)
        if(doc.amenities.indexOf(v)!=-1)return 'checked';
        return '';
    },
    propertyContact :function (i) {
        var doc = Collections.Properties.findOne()
        if(doc)if(doc.contacts) if(doc.contacts.length) return doc.contacts[0];

        return {
            name:'',
            phone:'',
            email:'',
        };
    },
    advertisementContact:function (i) {
        var id = FlowRouter.current().params.id;
        var doc = Collections.Properties.findOne(id,{
            transform: function (data) {
                if(data.auctionId)data.auction = Collections.Auctions.findOne(data.auctionId);
                return data;
            },
            limit: 1
        })
        if(doc)if(doc.auction)if(doc.auction.contacts) if(doc.auction.contacts.length) return doc.auction.contacts[0];
        return {
            name:'',
            phone:'',
            email:'',
        };
    }
})
Template.editPropertyForm.events({
    "click .backBtn": function(event, template){
        goBack();
    },
    'submit form': function(event){
        event.preventDefault();
    },
    "click .editPropertyFormSaveActivateBtn": function(event, template) {
        $('#editPropertyFormCF').submit();
    },
    "click .editPropertyFormCancelBtn": function(event, template) {
        goBack();
    },
    'change .selectPropertyImages': function(event, template) {return;
        var files = event.target.files;
        console.log('Upload called');
        // console.log(files);
        S3.upload({
            files:files,
            path:"DEVpropertyImagesLarge"
        },function(e,r){
            if(e){
                throw new Meteor.Error('Upload failed ', e);
                var tmp =  Session.get("showErrorDlg");if(!tmp)tmp=[];
                tmp.push("Upload failed: please check your internet connection, contact us if needed.");
                Session.set("showErrorDlg",tmp)
                return;
            }
            var editPropertyImages = Session.get('editPropertyImages');
            var editPropertyImagesNewOnes = Session.get('editPropertyImagesNewOnes');
            var tmp = {
                name: r.file.original_name,
                relative_url: r.relative_url,
                url: r.secure_url
            };
            editPropertyImages.push(tmp);
            editPropertyImagesNewOnes.push(tmp);
            Session.set('editPropertyImages',editPropertyImages);
            Session.set('editPropertyImagesNewOnes',editPropertyImagesNewOnes);
            var propertyData = Session.get("propertyData");

            updateGalleriesInServer(editPropertyImages,propertyData._id, function (err, res) {
                if (err) {
                    console.log(err);
                    var tmp =  Session.get("showErrorDlg");if(!tmp)tmp=[];
                    tmp.push("Upload failed: please check your internet connection, contact us if needed.");
                    Session.set("showErrorDlg",tmp)
                    return;
                } else {
                    var editPropertyImages = Session.get('editPropertyImages');
                    console.log("Current Count: "+editPropertyImages.length )
                }
            });
            console.log(r);
        });
    },
    'change .countySelected': function(event, template) {
        template.countySelected.set(event.target.value);
    },
    "click .openFileUploader":function (event, template) {
        event.preventDefault();
        openPicker();
        // filename
        //     :
        //     "webcam-1/12/2018, 6:53:25 PM.png"
        // handle
        //     :
        //     "G8lStVqHTiGnwxof6d5y"
        // mimetype
        //     :
        //     "image/png"
        // originalFile
        //     :
        // {name: "webcam-1/12/2018, 6:53:25 PM.png", type: "image/png", size: 630585}
        // originalPath
        //     :
        //     "webcam-1/12/2018, 6:53:25 PM.png"
        // size
        //     :
        //     629612
        // source
        //     :
        //     "local_file_system"
        // status
        //     :
        //     "Stored"
        // uploadId
        //     :
        //     "ba2fe36e9fd182ec0cb88236d676cefad"
        // url
        //     :
        //     "https://cdn.filestackcontent.com
        return;
    },
    'keyup .autoGrowTA': function(event, template) {
        var element = event.target;
        element.style.height = "5px";
        if(element.scrollHeight<310)element.style.height = (element.scrollHeight)+"px";
        else element.style.height = "310px";
    },
    'change #numBedRoomCount': function(event, template) {
        var numBedRoomCount = parseInt($(event.target).val());
        if(isNaN(numBedRoomCount))return;
        Template.instance().numBedRoomCount.set(numBedRoomCount);
        t1 = template;
        setTimeout(function () {
            t1.$('#editPropertyFormCF').validate();
        },500)
    },
})
Template.editPropertyForm.onRendered(function () {
    this.$('#readyFrom').datetimepicker();
    var element = this.$('.autoGrowTA')[0];
    if(element.scrollHeight<310)element.style.height = (element.scrollHeight)+"px";
    else element.style.height = "310px";

    // this.$('#editPropertyFormCF').validate();
    editPropertyFormSaving = this.editPropertyFormSaving
    var validator = this.$('#editPropertyFormCF').validate({
        submitHandler: function(event){
            editPropertyFormSaving.set(true);
            console.log("You just submitted the 'editPropertyForm' form.");
            var doc = Collections.Properties.findOne()
            if(doc){
            Meteor.call('editProperty',doc._id,$('#editPropertyFormCF').serializeArray(),function (error, result) {
                editPropertyFormSaving.set(false);
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
                var propertyData = Session.get("propertyData");
                var editPropertyImages = Session.get('editPropertyImages');
                if(!editPropertyImages){
                    Session.set('editPropertyImages',[]);
                    S3.collection.remove({})
                    goBack();
                }else{
                updateGalleriesInServer(editPropertyImages, propertyData._id, function (err, res) {
                    if (err) {
                        console.log(err);
                    } else {
                        Session.set('editPropertyImages',[]);
                        S3.collection.remove({})
                    }
                    goBack();
                })
                }
                Session.set('hideAddPropertyForm',true)
            })
            }
        }
    });


    if(Session.get('OpenImageUploader')){
        scrollTo('.openFileUploader',0,500);
        openPicker();
        Session.set('OpenImageUploader',false)
    }
})
Template.imageEditView.helpers({
    images: function () {
        // var propertyData = Session.get('propertyData');
        // var existingGallery = propertyData.gallery;
        // var editPropertyImages = Session.get('editPropertyImages');
        // if(!editPropertyImages)editPropertyImages=[]
        // if(!existingGallery )existingGallery =[]
        // var newCombined = editPropertyImages.concat(existingGallery);
        return Session.get('editPropertyImages');
    }
});
Template.imgEditTag.events({
    "click .editImgBtn": function (event, template) {
        console.log(this);
        debugger;

        var editPropertyImages = Session.get('editPropertyImages');
        var editPropertyImagesNewOnes = Session.get('editPropertyImagesNewOnes');
        var isOriginalImageFromOwnS3 = false;

        var newArr = [];
        if(!editPropertyImages)return;
        if(!editPropertyImages.length)return;

        if(this.handle) {
            index = getIndexByHandle(editPropertyImages, this.handle);
        }else{
            isOriginalImageFromOwnS3 = true;
            index = getIndexByRelativeURL(editPropertyImages, this.relative_url);
        }
        newArr.push(editPropertyImages[index].url)//put it at first
        // editPropertyImages.splice(index, 1);
        //
        // for(var i=0;i<editPropertyImages.length;i++){
        //     newArr.push(editPropertyImages[i].url)
        // }

        const pickOptions = {
            transformations:{
                crop:{      force:true,
                    aspectRatio:1.333},
                rotate:true},
            accept: 'image/*',
            imageMax:[800,600]
        };
        fsClient.cropFiles(newArr,pickOptions).then( (response) => {
            debugger;
            var editPropertyImages = Session.get('editPropertyImages');
            var editPropertyImagesNewOnes = Session.get('editPropertyImagesNewOnes');

            //if its conversion from old amazon to new filestack, then it will create a new file, so delete the old file seperatly and insert a new file seperatly.

            if(!response.filesUploaded.length){
                var tmp =  Session.get("showErrorDlg");if(!tmp)tmp=[];
                tmp.push("Edit failed: please try again, contact us if needed.");
                Session.set("showErrorDlg",tmp)
                return;
            }

            if(isOriginalImageFromOwnS3){
                S3.delete(editPropertyImages[index].relative_url,function(error, result){
                    if(error){
                        var tmp =  Session.get("showErrorDlg");if(!tmp)tmp=[];
                        tmp.push("Edit failed: please check your internet connection, contact us if needed.");
                        Session.set("showErrorDlg",tmp)
                        return;
                    }

                    var editPropertyImages = Session.get('editPropertyImages');
                    editPropertyImages.splice(index, 1);
                    Session.set('editPropertyImages',editPropertyImages);
                    var propertyData = Session.get("propertyData");
                    updateGalleriesInServer(editPropertyImages,propertyData._id, function (err, res) {
                        if (err) {
                            console.log(err);
                            var tmp =  Session.get("showErrorDlg");if(!tmp)tmp=[];
                            tmp.push("Edit failed: please check your internet connection, contact us if needed.");
                            Session.set("showErrorDlg",tmp)
                            return;
                        } else {
                            var editPropertyImages = Session.get('editPropertyImages');
                            console.log("Current Count: "+editPropertyImages.length )
                        }
                    });
                })
            }else{
                fsClient.remove(editPropertyImages[index].handle).then(function(result){
                    debugger;
                    console.log('In fs remove result');
                    var editPropertyImages = Session.get('editPropertyImages');
                    editPropertyImages.splice(index, 1);
                    Session.set('editPropertyImages',editPropertyImages);
                    var propertyData = Session.get("propertyData");
                    updateGalleriesInServer(editPropertyImages,propertyData._id, function (err, res) {
                        if (err) {
                            console.log(err);
                            var tmp =  Session.get("showErrorDlg");if(!tmp)tmp=[];
                            tmp.push("Edit failed: please check your internet connection, contact us if needed.");
                            Session.set("showErrorDlg",tmp)
                            return;
                        } else {
                            var editPropertyImages = Session.get('editPropertyImages');
                            console.log("Current Count: "+editPropertyImages.length )
                        }
                    });
                });
            }


            var tmp = {};
            for(var i =0;i<response.filesUploaded.length;i++){
                tmp = {
                    name: response.filesUploaded[i].filename,
                    url: response.filesUploaded[i].url,
                    handle: response.filesUploaded[i].handle,
                    mimetype: response.filesUploaded[i].mimetype,
                    originalFile: response.filesUploaded[i].originalFile,
                    originalPath: response.filesUploaded[i].originalPath,
                    size: response.filesUploaded[i].size,
                    source: response.filesUploaded[i].source,
                    status: response.filesUploaded[i].status,
                    uploadId: response.filesUploaded[i].uploadId
                }
                // editPropertyImages.push(tmp);
                editPropertyImages.splice(index+1, 0, tmp);//insert at the index place where its deleted.
                editPropertyImagesNewOnes.push(tmp);
            }

            //Logic to insert new file.
            Session.set('editPropertyImages',editPropertyImages);
            var propertyData = Session.get("propertyData");
            updateGalleriesInServer(editPropertyImages,propertyData._id, function (err, res) {
                if (err) {
                    console.log(err);
                    var tmp =  Session.get("showErrorDlg");if(!tmp)tmp=[];
                    tmp.push("Edit failed: please check your internet connection, contact us if needed.");
                    Session.set("showErrorDlg",tmp)
                    return;
                } else {
                    var editPropertyImages = Session.get('editPropertyImages');
                    console.log("Current Count: "+editPropertyImages.length )
                }
            });
        });


    },
    "click .deleteImgBtn": function (event, template) {
        console.log(this);
        debugger;

        var editPropertyImages = Session.get('editPropertyImages');
        // editPropertyImages.splice(index, 1);
        // Session.set('editPropertyImages',editPropertyImages);

        if(this.handle){
            index = getIndexByHandle(editPropertyImages, this.handle);

            fsClient.remove(this.handle).then(function(result){
                debugger;
                console.log('In fs remove result');
                var editPropertyImages = Session.get('editPropertyImages');
                editPropertyImages.splice(index, 1);
                Session.set('editPropertyImages',editPropertyImages);
                var propertyData = Session.get("propertyData");
                updateGalleriesInServer(editPropertyImages,propertyData._id, function (err, res) {
                    if (err) {
                        console.log(err);
                        var tmp =  Session.get("showErrorDlg");if(!tmp)tmp=[];
                        tmp.push("Deletion failed: please check your internet connection, contact us if needed.");
                        Session.set("showErrorDlg",tmp)
                        return;
                    } else {
                        var editPropertyImages = Session.get('editPropertyImages');
                        console.log("Current Count: "+editPropertyImages.length )
                    }
                });
            });

        }else{
            index = getIndexByRelativeURL(editPropertyImages, this.relative_url);

            S3.delete(this.relative_url,function(error, result){
                if(error){
                    var tmp =  Session.get("showErrorDlg");if(!tmp)tmp=[];
                    tmp.push("Deletion failed: please check your internet connection, contact us if needed.");
                    Session.set("showErrorDlg",tmp)
                    return;
                }

                var editPropertyImages = Session.get('editPropertyImages');
                editPropertyImages.splice(index, 1);
                Session.set('editPropertyImages',editPropertyImages);
                var propertyData = Session.get("propertyData");
                updateGalleriesInServer(editPropertyImages,propertyData._id, function (err, res) {
                    if (err) {
                        console.log(err);
                        var tmp =  Session.get("showErrorDlg");if(!tmp)tmp=[];
                        tmp.push("Deletion failed: please check your internet connection, contact us if needed.");
                        Session.set("showErrorDlg",tmp)
                        return;
                    } else {
                        var editPropertyImages = Session.get('editPropertyImages');
                        console.log("Current Count: "+editPropertyImages.length )
                    }
                });
            })
        }


    }
});
function openPicker() {
    fsClient.pick({
        fromSources:["local_file_system","webcam","facebook","url","googledrive","dropbox","flickr","instagram","gmail","picasa","onedrive","clouddrive"],
        maxFiles:10,
        transformations:{
            crop:{      force:true,
                aspectRatio:1.333},
            rotate:true},
        imageMax:[800,600],
        accept:["image/*"]//,".pdf",".doc",".docx",".docm"
    }).then(function(response) {
        // declare this function to handle response
        debugger;
        var editPropertyImages = Session.get('editPropertyImages');
        var editPropertyImagesNewOnes = Session.get('editPropertyImagesNewOnes');
        var tmp = {};
        if(response.filesUploaded)
            for(var i =0;i<response.filesUploaded.length;i++){
                tmp = {
                    name: response.filesUploaded[i].filename,
                    url: response.filesUploaded[i].url,
                    handle: response.filesUploaded[i].handle,
                    mimetype: response.filesUploaded[i].mimetype,
                    originalFile: response.filesUploaded[i].originalFile,
                    originalPath: response.filesUploaded[i].originalPath,
                    size: response.filesUploaded[i].size,
                    source: response.filesUploaded[i].source,
                    status: response.filesUploaded[i].status,
                    uploadId: response.filesUploaded[i].uploadId
                }
                editPropertyImages.push(tmp);
                editPropertyImagesNewOnes.push(tmp);
            }
        Session.set('editPropertyImages',editPropertyImages);
        Session.set('editPropertyImagesNewOnes',editPropertyImagesNewOnes);

        var propertyData = Session.get("propertyData");
        updateGalleriesInServer(editPropertyImages,propertyData._id, function (err, res) {
            if (err) {
                console.log(err);
                var tmp =  Session.get("showErrorDlg");if(!tmp)tmp=[];
                tmp.push("Upload failed: please check your internet connection, contact us if needed.");
                Session.set("showErrorDlg",tmp)
                return;
            } else {
                var editPropertyImages = Session.get('editPropertyImages');
                console.log("Current Count: "+editPropertyImages.length )
                if(Session.get('fromAdvertiseWithUsPage')){
                    fbq('track', 'CompleteRegistration');
                    ga('send', 'event', 'AdvertiseWithUsPage', 'ImageUploaded', 'Property Images Uploaded.')
                    Session.set('fromAdvertiseWithUsPage',false)
                }
            }
        });
        console.log(response);
    });
}

function goBack(){
    var prevRoute = Session.get('prevRoute');
    if(prevRoute){
        FlowRouter.go(prevRoute.name,prevRoute.args)
        Session.set('prevRoute',false);
        if(prevRoute.scrollTo){
            scrollTo(prevRoute.scrollTo,0,500)
        }
    }else{
        FlowRouter.go("/account/myproperies/",{pageno:1});
    }
}
function getpropertyData(){
    var id = FlowRouter.current().params.id;

    var ret = Collections.Properties.find(id, {
        transform: function(data){

            data.auction = Collections.Auctions.findOne(data.auctionId);
            data.applicationsReceivedCount = Collections.Bids.find({auctionId:data.auctionId}).count();
            data.applicationsActiveCount = Collections.Bids.find({auctionId:data.auctionId,isArchived:false}).count();

            return data;
        },
        limit: 1
    }).fetch();
    // console.log("getProjectData");
    return ret[0];
}
function getIndexByHandle(myArray, fileId){
    for (var i=0; i < myArray.length; i++) {
        if (myArray[i].handle === fileId) {
            return i;
        }
    }
}
function getIndexByRelativeURL(myArray, fileId){
    for (var i=0; i < myArray.length; i++) {
        if (myArray[i].relative_url === fileId) {
            return i;
        }
    }
}

function attachEvents() {
    $(".deactivateConfirmBtn").unbind().bind("click",function () {
        deactivateConfEvent();
    })
    $(".archiveConfirmBtn").unbind().bind("click",function () {
        archiveConfEvent();
    })
    $(".closePopupBtn").unbind().bind("click",function () {
        closePopupEvent();
    })
}
function deactivateConfEvent() {
    var data = Session.get("propertyData");
    var auctionId = data.auctionId;

    deactivateInProgress.set(true) ;
    Meteor.call('deactivateAuction',auctionId,function(error, result){
        deactivateInProgress.set(false) ;
        if(error){
            console.log(error);
            var tmp =  Session.get("showErrorDlg");if(!tmp)tmp=[];
            tmp.push("Failed deactivating. Please try again, try checking your internet connectivity. Contact us if needed.");
            Session.set("showErrorDlg",tmp)
            return;
        }
        console.log("Success");
        var prevRoute = Session.get('prevRoute');
        closePopupEvent();
        goBack();

    });
}
function archiveConfEvent() {
    var data = Session.get("propertyData");
    var propertyId = data._id;

    archiveInProgress.set(true) ;
    Meteor.call('archiveProperty',propertyId,function(error, result){
        archiveInProgress.set(false) ;
        if(error){
            console.log(error);
            var tmp =  Session.get("showErrorDlg");if(!tmp)tmp=[];
            tmp.push("Failed archiving. Please try again, try checking your internet connectivity. Contact us if needed.");
            Session.set("showErrorDlg",tmp)
            return;
        }
        console.log("Success");
        var prevRoute = Session.get('prevRoute');
        closePopupEvent();
        goBack();

    });
}
function closePopupEvent() {
    console.log('closePopupEvent');
    if($)
        if($.fancybox)
            $.fancybox.close();
}


function titleCase(str){
    if(!str)return;
    return str.charAt(0).toUpperCase() + str.toLowerCase().substring(1);
}
function slugifyEmailAddress (text) {
    if(!text)return '';
    const a = 'àáäâèéëêìíïîòóöôùúüûñçßÿœæŕśńṕẃǵǹḿǘẍźḧ/_,:;'
    const b = 'aaaaeeeeiiiioooouuuuncsyoarsnpwgnmuxzh------'
    const p = new RegExp(a.split('').join('|'), 'g')

    return text.toString().toLowerCase()
        .replace(/\s+/g, '.')           // Replace spaces with "."
        .replace(p, c =>
            b.charAt(a.indexOf(c)))     // Replace special chars
        .replace(/&/g, '-and-')         // Replace & with ''
        // .replace(/[^\w\-]+/g, '')       // Remove all non-word chars
        .replace(/\-\-+/g, '-')         // Replace multiple - with single ''
        .replace(/^-+/, '')             // Trim - from start of text
        .replace(/-+$/, '')             // Trim - from end of text
}