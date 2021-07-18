import "./profile.html";
// import "./accounts/helpers.js";
// import "./accounts/validation.js";
var _validFileExtensions = [".jpg", ".jpeg", ".png", ".pdf", ".txt", ".doc", ".docx", ".ODT"];
function filevalidation(arrInputs){
    for (var i = 0; i < arrInputs.length; i++) {
        var oInput = arrInputs[i];
        var sFileName = oInput.name;
        if (sFileName.length > 0) {
            var blnValid = false;
            for (var j = 0; j < _validFileExtensions.length; j++) {
                var sCurExtension = _validFileExtensions[j];
                if (sFileName.substr(sFileName.length - sCurExtension.length, sCurExtension.length).toLowerCase() == sCurExtension.toLowerCase()) {
                    blnValid = true;
                    break;
                }
            }

            if (!blnValid) {
                // alert("Sorry, " + sFileName + " is invalid, allowed extensions are: " + _validFileExtensions.join(", "));
                return false;
            }
        }

    }

    return true;
}

Template.profile.onCreated(function(){
    var instance = this;
    instance.isSubsLoaded = new ReactiveVar(false);
    instance.autorun(function(){

        instance.subscribe('userData');

        if(instance.subscriptionsReady()){
            var data =  Accounts.user();
            try{
                if(data.profile.isPublic && data.profile.username){
                    console.log('')
                    // FlowRouter.redirect('tenant',{username:data.profile.username})
                }
            }catch(e){
                console.log(e);
            }
            instance.isSubsLoaded.set(true)
        }
    })
})
Template.profile.helpers({
    isSubsLoaded:function(){
        return Template.instance().subscriptionsReady();
    },
    userLoggedIn:function(){
        if(Meteor.user())return true;
        return false;
    }
})
Template.userProfile.onCreated(function(){
    this.privacyTermsMore = new ReactiveVar( false );
    this.hasPasswordSet = new ReactiveVar( false );
    this.hasPasswordSetReqCompleted = new ReactiveVar( false );
})
Template.userProfile.helpers({
    "data": function(){
    var data =  Accounts.user();
    // console.log(data);
    var city = '';
    // profile.files.has
    // if(data)
    // if(data.profile)
    // if(data.profile.addressBook)
    // if(data.profile.addressBook.length){
    //   city = data.profile.addressBook[0].city
    // }
      clearMeta();
        try {
            DocHead.setTitle(titleCase(data.profile.name) + '\'s profile | SpotMyCrib');
            DocHead.addMeta({name: "description", content: "Upload and manage your references."});
        }catch(err){
            DocHead.setTitle(' User not found | SpotMyCrib');
            DocHead.addMeta({name: "description", content: ""});
        }
    return {
      "userData": data,
      "userCity":city,
      "userEmail":data.profile.email,
      "userEmailVerified":data.profile.emailVerified
    };
  },
    backBtnNeeded:function () {
        var prevRoute = Session.get('prevRoute');
        try{if( FlowRouter.current().route.name != prevRoute.name )return true;}catch(e){}
        return false;
    },
    prevRoute:function () {
        return Session.get('prevRoute');
    },
    isPublicProfileSelectYes: function(){
        var user = Meteor.user();
        try{
            if(user.profile.isPublic){
                return 'selected';
            }
        }catch(e){}
        return '';
    },
    isPublicProfileSelectNo: function() {
        var user = Meteor.user();
        try {
            if (!user.profile.isPublic) {
                return 'selected';
            }
        } catch (e) {
        }
        return '';
    },
    progress:function () {
      var user = Meteor.user();
      var score = 0;
      var css = 'progress-bar-danger';
      var issues = [];
if(user.profile.mobile){score += 15;}else{issues.push('Mobile number is required. Landlord needs to contact you.')}
if(!user.services)user.services={}
if(user.services.facebook){score += 15;}else{issues.push('Connect with your Facebook profile. Its shows your social presence.')}
// if(user.services.google){score += 10;}else{issues.push('Connect with your google profile. Its shows your social presence.')}//No weightage
if(user.services.twitter){score += 10;}else{issues.push('Connect with your Twitter profile. Its shows your social presence.')}
if(user.services.linkedin){score += 15;}else{issues.push('Connect with your LinkedIn profile. Its shows your professional presence.')}
if(user.profile.references.hasPassport){score += 10;}else{issues.push('Passport is required. Its your legal identity card.')}
if(user.profile.references.employerName){score += 3;}else{issues.push('Name of your employer is recommended. It can highlight your profile to landlord.')}
if(user.profile.references.employerTakeHome){score += 2;}else{issues.push('Monthly take home salary is recommended. It can act as your finantial reference.')}
if(user.profile.references.hasWorkRef){score += 10;}else{issues.push('Work reference is required. It shows your professional side.')}
if(user.profile.references.hasLandlordRef){score += 10;}else{issues.push('Landlord reference is required. ')}
if(user.profile.references.hasPPS){score += 3;}else{issues.push('PPS is recommended. Its your legal identity card.')}
// if(user.profile.references.hasFinancialRef){score += 0;}else{issues.push('Financial reference if work reference is not given.')}
if(user.profile.references.hasGovtID){score += 4;}else{issues.push('Govt ID is recommended. Driving license or GNIB as your identity card.')}
if(user.profile.references.hasResume){score += 3;}else{issues.push('Resume is recommended. It shows your professional side.')}

        if(score>100)score = 100;
        if(score>50)css = 'progress-bar-warning';
        if(score>70)css = 'progress-bar-info';
        if(score>90)css = 'progress-bar-success';


        return {
            css:css,
            percent:score+"%",
            issues:issues
        }
    },
    privacyTermsMore: function(){
        return Template.instance().privacyTermsMore.get() ;
    },
    showFileTemplate:function () {
        return Session.get('showFileTemplate');
    },
    showHideFileDlg: function () {
        console.log("Event showHideFileDlg");
        var ses = Session.get('showFileDlg');

        if(ses) {
            if (ses.show) {
                $.fancybox({
                    'padding': 0,
                    'href': '#fileupload-dlg',
                    width: '80%',
                    afterShow: function () {
                        Session.set('showFileTemplate', true);
                    },
                    afterClose: function () {
                        var ses = {show: false, cate: ""}
                        Session.set('showFileDlg', ses);// Has the overall info and basic required info.
                        Session.set('showFileTemplate', false);
                    }
                });
                return true;
            } else if (ses.show==false){
                try {
                    $.fancybox.close();
                } catch (e) {
                }
            }
        }
        return false;
    },
    hasPasswordSet:function(){
        var localHasPasswordSet = Session.get('localHasPasswordSet');
        if(localHasPasswordSet)return localHasPasswordSet;
        return Template.instance().hasPasswordSet.get();
    },
    hasPasswordSetReqCompleted:function(){
        return Template.instance().hasPasswordSetReqCompleted.get();
    }
})
Template.userProfile.events({
    "change .togglePublicProfileSetting":function(event,template){
        Meteor.call('togglePublicProfileSetting',function(err, res) {
            if (err) {
                var tmp =  Session.get("showErrorDlg");if(!tmp)tmp=[];
                var msg = 'Public profile setting change failed. Check your internet connection. ';
                if(err.error)msg += err.error+'. ';
                msg += "Please try again. Contact us if needed.";
                tmp.push(msg);
                Session.set("showErrorDlg",tmp)
            } else {
                setTimeout(function(){
                    var data =  Accounts.user();
                    try{
                        if(data.profile.isPublic && data.profile.username){
                            FlowRouter.go('tenant',{username:data.profile.username})
                        }else{
                            FlowRouter.go('account/profile')
                        }
                    }catch(e){
                        console.log(e);
                    }
                },1000)
            }

        });
    },
    "click .profileLinkCopyBtn":function(event, template){
        console.log("Event profileLinkCopyBtn");
        $('#profileLinkField').select();

        try {
            var successful = document.execCommand('copy');
            var msg = successful ? 'successful' : 'unsuccessful';
            // console.log('Copying text command was ' + msg);

            var tmp =  Session.get("showErrorDlg");if(!tmp)tmp=[];
            var msg = 'Your profile is copied to your clipboard. ';
            tmp.push(msg);
            Session.set("showErrorDlg",tmp)
        } catch (err) {
            console.log('Oops, unable to copy');
        }
    },
    "click .requestRedgRefund":function(event, template){
        console.log("Event requestRedgRefund");
        $.fancybox({
            'padding': 0,
            'href': '#requestRedgRefund-popup'
        });
    },
    "click .requestConfRefund":function(event, template){
        console.log("Event requestConfRefund");
        $.fancybox({
            'padding': 0,
            'href': '#requestConfRefund-popup'
        });
    },
    "click .changePwdBtn":function(event, template){
        console.log("Event changePwdBtn");
        $('#changepass-dlg .changePwdAlertMsgs .color-text').html('');
        $('#changepass-dlg .help-block p').html('');


        $("#changepass-dlg button[type=submit]").attr("disabled",false);
        $.fancybox({
            'padding'   : 0,
            'href'      : '#changepass-dlg',
            'afterClose': () => {
                console.log("Event: Fancybox closed");

                //reset fields
                $('.oldpwd').val("");
                $('.newpwd').val("");
            }
        });
    },
    "click .setPwdBtn":function(event, template){
        console.log("Event setPwdBtn");
        $('#setpass-dlg .changePwdAlertMsgs .color-text').html('');
        $('#setpass-dlg .help-block p').html('');


        $("#setpass-dlg button[type=submit]").attr("disabled",false);
        $.fancybox({
            'padding'   : 0,
            'href'      : '#setpass-dlg',
            'afterClose': () => {
                console.log("Event: Fancybox closed");

                //reset fields
                $('.newpwd').val("");
                $('.newpwdconfirm').val("");
            }
        });
    },
    "click .changeMobileBtn":function(event, template){
        console.log("Event changeMobileBtn");

        $.fancybox({
            'padding': 0,
            'href': '#changeMobile-div'
        });
    },
    "click .changeCityBtn":function(event, template){
        console.log("Event changeCityBtn");
        $.fancybox({
            'padding': 0,
            'href': '#changeCity-div'
        });
    },
    "click .changeEmployerNameConfirmation":function(event, template){
        console.log("Event changeEmployerNameConfirmation");

        var ele = $(event.target);
        hideSaveBtn(ele)
        Meteor.call('updateEmployerName',$('.changeEmployerNameValue').val(),function(error, result){

            if(error){
                console.log(error.error);
                var tmp =  Session.get("showErrorDlg");if(!tmp)tmp=[];
                if(!error.error)error.error = 'An error occurred';
                tmp.push(error.error);
                Session.set("showErrorDlg",tmp)
                showSaveBtn(ele)
                return;
            }
            if(result.status=='Success'){

            }
        });
    },
    "click .changeEmployerTakeHomeConfirmation":function(event, template){
        console.log("Event changeEmployerTakeHomeConfirmation");
        debugger
        var ele = $(event.target);
        hideSaveBtn(ele)
        var num = parseInt($('.changeEmployerTakeHomeValue').val());
        Meteor.call('updateEmployerTakeHome',num,function(error, result){

            if(error){
                console.log(error.error);
                var tmp =  Session.get("showErrorDlg");if(!tmp)tmp=[];
                if(!error.error)error.error = 'An error occurred';
                tmp.push(error.error);
                Session.set("showErrorDlg",tmp)
                showSaveBtn(ele)
                return;
            }
            if(result.status=='Success'){

            }
        });
    },
    "click .privacyTermsMore_btn": function (event, template) {
        if(template.privacyTermsMore.get() )template.privacyTermsMore.set(false);
        else template.privacyTermsMore.set(true);
    },
    //////// TODO: Events below are not working.

    "click .requestRedgRefundConf":function(event, template){
        console.log("Event requestRedgRefundConf");
        var ret = Meteor.call('registrationAmountRefund',[],function(ret){
            if(ret.status=='AlreadyRequested'){

            }
            $.fancybox.close();
        });


    },
    "click .requestConfRefundConf":function(event, template){
        console.log("Event requestConfRefundConf");
        var ret = Meteor.call('confirmationAmountRefund',[],function(ret){
            if(ret.status=='AlreadyRequested'){

            }
            $.fancybox.close();
        });

    },
    "click .noBtn":function(event, template){
        console.log("Event noBtn");
        $.fancybox.close();

    },
    "click .backBtn": function(event, template){
        var prevRoute = Session.get('prevRoute');
        // Session.set('prevRoute',{
        //   name:"letting",
        //     args:{key:"DUN1"}
        // });
        if(prevRoute){
            FlowRouter.go(prevRoute.name,prevRoute.args)
            var prevRoute = {name: FlowRouter.current().route.name,args:{} }
            Session.set('prevRoute',prevRoute);
        }else{
            FlowRouter.go("home");
        }

    },
    "click .linkWithGoogleBtn": function(event, template){
        Meteor.linkWithGoogle({}, function(err){
            if (err) {
                console.log(err)

                var tmp =  Session.get("showErrorDlg");if(!tmp)tmp=[];
                var msg = 'Link with Google failed. ';
                if(err.error)msg += err.error+'. ';
                msg += "Please try again. Contact us if needed.";
                tmp.push(msg);
                Session.set("showErrorDlg",tmp)

                throw new Meteor.Error("Google login failed");
            }else{

            }
        });
    },
    "click .linkWithTwitterBtn": function(event, template){
        Meteor.linkWithTwitter({}, function(err){
            if (err) {
                console.log(err)

                var tmp =  Session.get("showErrorDlg");if(!tmp)tmp=[];
                var msg = 'Link with Twitter failed. ';
                if(err.error)msg += err.error+'. ';
                msg += "Please try again. Contact us if needed.";
                tmp.push(msg);
                Session.set("showErrorDlg",tmp)

                throw new Meteor.Error("Twitter login failed");
            }else{

            }
        });
    },
    "click .linkWithFacebookBtn": function(event, template){
        Meteor.linkWithFacebook({}, function(err){
            if (err) {
                console.log(err)

                var tmp =  Session.get("showErrorDlg");if(!tmp)tmp=[];
                var msg = 'Link with Facebook failed. ';
                if(err.error)msg += err.error+'. ';
                msg += "Please try again. Contact us if needed.";
                tmp.push(msg);
                Session.set("showErrorDlg",tmp)

                throw new Meteor.Error("Facebook login failed");
            }else{

            }
        });
    },
    "click .linkWithLinkedInBtn": function(event, template){
        Meteor.connectWithLinkedIn({}, function(err){
            if (err) {
                console.log(arguments)

                var tmp =  Session.get("showErrorDlg");if(!tmp)tmp=[];
                var msg = 'Link with LinkedIn failed. ';
                if(err.error)msg += err.error+'. ';
                msg += "Please try again. Contact us if needed.";
                tmp.push(msg);
                Session.set("showErrorDlg",tmp)

                throw new Meteor.Error("LinkedIn login failed");
            }else{

            }
        });
    }
})
Template.userProfile.onRendered(function(){

    var templateInstance = Template.instance();
    Meteor.call('hasPasswordSet',function (err,result) {
        if(!err){
            templateInstance.hasPasswordSet.set(result);
            templateInstance.hasPasswordSetReqCompleted.set(true);
        }
    })

    //////// TODO: Remove below JQuery events after making meteor events working.
    $('.noBtn, .cancel, .close').click(function(){
        console.log("Event noBtn jquery");
        $.fancybox.close();
    })
    $('.requestRedgRefundConf').click(function(){
        console.log("Event requestRedgRefundConf jquery");
        var ret = Meteor.call('registrationAmountRefund',[],function(error, result){
            if(error){
                console.log(error.error);
                return;
            }
            if(result.status=='AlreadyRequested'){

            }
            $.fancybox.close();
        });

    })
    $('.requestConfRefundConf').click(function(){
        console.log("Event requestConfRefundConf jquery");
        var ele = this;
        hideSaveBtn(ele)
        var ret = Meteor.call('confirmationAmountRefund',[],function(error, result){
            if(error){
                console.log(error.error);
                showSaveBtn(ele)
                return;
            }
        });

    })
    $('.changeMobileConfirmation').click(function(){
        console.log("Event changeMobileConfirmation jquery");
        var ele = this;
        hideSaveBtn(ele)
        var mobile = $('.changeMobileValue').val();
        validatedMobile = LoginFormValidation.mobile(mobile);
        if (validatedMobile !== true) {
            $('.mobileValidationErrors').show().html(validatedMobile.reason) ;showSaveBtn(ele);return;
        }
        Meteor.call('updateMobile',mobile,function(error, result){
            if(error){
                console.log(error.error);
                showSaveBtn(ele)
                return;
            }
            $('.mobileValidationErrors').hide();
            // Session.set('showMobileVerification',true)
        });

    })
    $('.changeEmployerNameConfirmation').click(function(){
        // console.log("Event changeEmployerNameConfirmation jquery");
        // var ele = this;
        // hideSaveBtn(ele)
        // Meteor.call('updateEmployerName',[$('.changeEmployerNameValue').val()],function(error, result){
        //
        //   if(error){
        //     console.log(error.error);
        //     showSaveBtn(ele)
        //     return;
        //   }
        //   if(result.status=='Success'){
        //
        //   }
        // });
    })




    $('.mobileValidationErrors').hide();
    $('.eyebtn').click(function () {
        if ($(".show-pwd").hasClass("shown"))
        {
            $(".show-pwd").attr("type", "password");
            $(".show-pwd").removeClass("shown");

        } else
        {
            $(".show-pwd").attr("type", "text");
            $(".show-pwd").addClass("shown");
        }


    });

    $(document).ready(function(){

        //$('.change-click').click(function(){
        //
        //  });

        $('.cancel-clk').click(function(){
            hideSaveBtn(this);
            $('.mobileValidationErrors').hide();
        });
        $('.change-click').click(function(){
            showSaveBtn(this)
        });
        //$('.request-clk').click(function(){
        //  $('.hideen-div').fadeOut();
        //});
        $('.sendEmailVerification').click(function(){
            console.log('event sendEmailVerification');
            $('.sendEmailVerification').text('Verification mail sent')
            setTimeout(function(){
                $('.sendEmailVerification').text('Send verification link')
            },10000)
        });

    });


})

Template.fileUploadDlgTemplate.onCreated(function(){
    this.sesCate = new ReactiveVar( false );
    this.p1 = new ReactiveVar( false );
    this.p2 = new ReactiveVar( false );
    var ses = Session.get('showFileDlg');
    if(ses){
        this.sesCate.set(ses.cate);
        if(ses.cate){
            var p1='';
            var p2='';
            switch (ses.cate){
                case "Resume": p1 = "hasResume"; p2 = "resume"; break;
                case "Work Reference": p1 = "hasWorkRef"; p2 = "workRef"; break;
                case "Landlord Reference": p1 = "hasLandlordRef"; p2 = "landlordRef"; break;
                case "Financial Reference": p1 = "hasFinancialRef"; p2 = "financialRef"; break;
                case "Government ID": p1 = "hasGovtID"; p2 = "govtID"; break;
                case "Passport": p1 = "hasPassport"; p2 = "passport"; break;
                case "PPS": p1 = "hasPPS"; p2 = "PPS"; break;
            }

            // p1 = "profile.references."+p1
            // p2 = "profile.references." + p2
            this.p1.set(p1);
            this.p2.set(p2);
        }
    }

    this.step = new ReactiveVar( 1 );
    this.sFileName = new ReactiveVar( false );

    this.uploading = new ReactiveVar( false );
    this.fileObj = new ReactiveVar( {} );
    this.fileObjPrevious = new ReactiveVar( false );
})
Template.fileUploadDlgTemplate.helpers({
    dlgTitle: function () {
        var title = '';
        var p1 = Template.instance().p1.get();
        var p2 = Template.instance().p2.get();
        var uploading = Template.instance().uploading.get();
        var user = Meteor.user();
        if(user.profile.references[p1]) var existingFile = true;


        if(existingFile){
            title =  'Update ';
            if(!Template.instance().fileObjPrevious.get()) // only if its not yet set . Else other function will set it.
                Template.instance().fileObjPrevious.set(user.profile.references[p2]);
            console.log('fileObjPrevious')
            console.log(Template.instance().fileObjPrevious.get())
        }
        else if(uploading)title =  'Uploading ';
        else title = 'Upload ';

        var sesCate = Template.instance().sesCate.get();
        if(sesCate)title += sesCate;
        else title+='References';

        return title;
    },
    existingFile:function () {
        var p2 = Template.instance().p2.get();
        var user = Meteor.user();
        if(user.profile.references[p2]) return user.profile.references[p2];

        return false;
    },
    isStep: function (step) {
      if(step == Template.instance().step.get() )return true;
      else return false;
    },
    isNotStep: function (step) {
      if(step != Template.instance().step.get() )return true;
      else return false;
    },
    uploading: function(){
        return Template.instance().uploading.get() ;
    },
    validFileExtensions: function(){
        return _validFileExtensions;
    }
})

Template.fileUploadDlgTemplate.events({
    'click .showCamera':function (event, template) {
        event.preventDefault();

        template.$('#cropImage').cropper("destroy");
        template.$('#cropImage').attr("src",'').hide();
        template.$('#finalImage').attr("src",'').hide();
        $('.step2, #uploadImagePreviewArea').show();
        $('.step3').hide();


        var cameraOptions = {
            width: 800,
            height: 600
        };
        MeteorCamera.getPicture(cameraOptions, function (error, data) {
            if (!error) {
                template.$('#cropImage').attr('src', data);
                template.step.set(2)
                $('.step2').show();
                $('.step3').hide();

                template.sFileName.set('cameraPhoto.jpg');
                //Now start the crop
                if (data) {
                    $('.step1').hide();
                    template.$("#cropImage").cropper({
                        aspectRatio: 4 / 3
                    });
                }

            }
        });
    },
    'click .getCroppedImage':function (event, template) {

        template.step.set(3)
        $('.step2').hide();
        $('.step3').show();
        //Ratio 4:3 => 700 * 525
        var finalImgData = template.$('#cropImage').cropper("getCroppedCanvas", { width: 700, height: 525 }).toDataURL();
        template.$('#finalImage').attr('src', finalImgData).show();

        var head = 'data:image/png;base64,';
        var imgFileSize = Math.round((finalImgData.length - head.length)*3/4) ;
        var sizeKB = imgFileSize/1000;
        var sizeMB = imgFileSize/1000000;
        console.log("imgFileSize", imgFileSize, "size", sizeMB, "MB", "-----", sizeKB, "KB");

        var mimeType = 'image/jpeg';
        var imgQuality = 1;
        if(sizeKB>200)var imgQuality = 0.9;
        if(sizeKB>300)var imgQuality = 0.8;
        if(sizeKB>400)var imgQuality = 0.7;

        const cate = template.sesCate.get();
        var sFileName = template.sFileName.get(); if(!sFileName)sFileName = 'cameraPhoto.jpg';
        // const inst = Template.instance();
        var finalImgData = template.$('#cropImage').cropper("getCroppedCanvas", { width: 700, height: 525 }).toBlob(function(blob){
            template.uploading.set(true);
            template.fileObj.set({});//Reset old status as this might be 2nd upload.

            var ret = S3.upload({
                file:new File([blob], sFileName),
                path:"profileFiles"
            },function(e,r){

                if(e){
                    $('.step1').show();
                    var tmp =  Session.get("showErrorDlg");if(!tmp)tmp=[];
                    tmp.push("Upload failed. Please check your internet connectivity and try again. Contact us if needed.");
                    try{if(e.error)tmp.push(e.error);}catch (cat){}
                    Session.set("showErrorDlg",tmp)
                    throw new Meteor.Error('Upload failed ', e);
                    template.uploading.set(false);
                    return;
                }
                console.log(r);

                template.fileObj.set(r);

                var tmp = {
                    name: r.file.original_name,
                    relative_url: r.relative_url,
                    url: r.secure_url
                }

                console.log(tmp);
                var fileObjPrevious = template.fileObjPrevious.get()//move here due to bug
                Meteor.call('updateReferenceFile', [cate, tmp], (err, res) => {
                    template.uploading.set(false);//Make it false even if it failed. Users should know that its not uploading anymore.
                    $('.step2').hide();
                    $('.step1').show();
                    $('.step3').show();//Because its an image from cropped area
                    if (err) {
                        console.log(err);

                        var tmp =  Session.get("showErrorDlg");if(!tmp)tmp=[];
                        tmp.push("Upload failed. Please check your internet connectivity and try again. Contact us if needed.");
                        try{if(err.error)tmp.push(err.error);}catch (cat){}
                        Session.set("showErrorDlg",tmp)

                        //If updating in DB failed. Then delete in Amazon as well.
                        var fileObj = template.fileObj.get();
                        S3.delete(fileObj.relative_url,function(error, result){})
                    } else {//If upload is success, then delete the old file and re-set it.
                        // debugger;
                        // var fileObjPrevious = template.fileObjPrevious.get()//Don' get it here, as parallely another code is changing this val->lead to bug
                        if(fileObjPrevious){//only if it exists.
                            S3.delete(fileObjPrevious.relative_url,function(error, result){})
                            template.fileObjPrevious.set(template.fileObj.get() );
                        }
                    }
                });


            });



        },mimeType, imgQuality);

    },
    'click .zoomInBtn':function (event, template) {
        template.$('#cropImage').cropper("zoom", 0.1);
    },
    'click .zoomOutBtn':function (event, template) {
        template.$('#cropImage').cropper("zoom", -0.1);
    },
    'click .rotateLeftBtn':function (event, template) {
        template.$('#cropImage').cropper("rotate", -90);
    },
    'click .rotateRightBtn':function (event, template) {
        template.$('#cropImage').cropper("rotate", 90);
    },
    'click .resetBtn':function (event, template) {
        template.$('#cropImage').cropper("reset");
    },
    'click .goToStep1':function (event, template) {
        $('.step1').show();
        template.$('#cropImage').cropper("destroy");
        template.$('#cropImage').attr("src",'').hide();
        template.$('#finalImage').attr("src",'').hide();
        $('.step2').hide();
        $('.step3').hide();
    },
    'click .closeDlg':function (event, template) {
        var ses = {show: false, cate: ""}
        Session.set('showFileDlg', ses);// Has the overall info and basic required info.
        Session.set('showFileTemplate', false);
    },
    'change .uploadBtn': function(event, template) {
        var files = event.target.files;
        if(!files)return;
        if(files.length == 0)return;

        Template.instance().step.set(2)
        $('.step2, #uploadImagePreviewArea').show();
        template.$('#cropImage').cropper("destroy");
        template.$('#cropImage').attr("src",'').hide();
        template.$('#finalImage').attr("src",'').hide();
        $('.step3').hide();

        if (!filevalidation(files)) {
            var tmp = Session.get("showErrorDlg");
            if (!tmp) tmp = [];
            var msg = 'Upload rejected. Please upload only document or image files. Allowed extensions are ' + _validFileExtensions.join(', ') + '.';
            tmp.push(msg);
            Session.set("showErrorDlg", tmp)

            throw new Meteor.Error("Upload rejected. ");
            return;
        }

        const cate = template.sesCate.get();
        Template.instance().uploading.set(true);
        // const inst = Template.instance();
        template.fileObj.set({});//Reset old status as this might be 2nd upload.


        if (files.length == 1) {
            var target = event.target;
            var sFileName = files[0].name;
            template.sFileName.set(sFileName);
            // $("#uploadImagePreviewArea").html("");
            var regex = /^([a-zA-Z0-9\s_\\.\-:])+(.jpg|.jpeg|.gif|.png|.bmp)$/;
            if (regex.test($(target).val().toLowerCase())) {
                if (isIE() && isIE() <= 9) {
                    $("#uploadImagePreviewArea").show();
                    $("#uploadImagePreviewArea")[0].filters.item("DXImageTransform.Microsoft.AlphaImageLoader").src = $(target).val();
                }
                else {
                    if (typeof (FileReader) != "undefined") {
                        template.uploading.set(false);
                        $("#uploadImagePreviewArea, #cropImage").show();
                        // $("#uploadImagePreviewArea").append('<img class="img-responsive" id="cropImage"/>');
                        var reader = new FileReader();
                        reader.onload = function (e) {
                            $("#cropImage").attr("src", e.target.result);

                            //File name is set few lines above this
                            //Now start the crop
                            var imgData = $("#cropImage").attr('src');
                            if (imgData) {
                                $('.step1').hide();
                                template.$("#cropImage").cropper({
                                    aspectRatio: 4 / 3
                                });
                            }


                        }
                        reader.readAsDataURL($(target)[0].files[0]);
                        return;//If previewer is available then let the cropper handle the upload.
                    } else {
                        console.log("This browser does not support FileReader.");
                    }
                }
            } else {
                console.log("File upload: Not an image file to show preview.");
            }
        }

        // console.log('Not an image, so proceeding with traditional upload')

        var ret = S3.upload({
            files:files,
            path:"profileFiles"
        },function(e,r){
            if(e){
                var tmp =  Session.get("showErrorDlg");if(!tmp)tmp=[];
                tmp.push("Upload failed. Please check your internet connectivity and try again. Contact us if needed.");
                try{if(e.error)tmp.push(e.error);}catch (cat){}
                Session.set("showErrorDlg",tmp)
                throw new Meteor.Error('Upload failed ', e);
                template.uploading.set(false);
                return;
            }
            console.log(r);

            template.fileObj.set(r);

            var tmp = {
                name: r.file.original_name,
                relative_url: r.relative_url,
                url: r.secure_url
            }

            console.log(tmp);
            var fileObjPrevious = template.fileObjPrevious.get()//move here due to bug
            Meteor.call('updateReferenceFile', [cate, tmp], (err, res) => {
                template.uploading.set(false);//Make it false even if it failed. Users should know that its not uploading anymore.
                $('.step2').hide();
                $('.step3').hide();//Because its not an image.
                if (err) {
                    console.log(err);

                    var tmp =  Session.get("showErrorDlg");if(!tmp)tmp=[];
                    tmp.push("Upload failed. Please check your internet connectivity and try again. Contact us if needed.");
                    try{if(err.error)tmp.push(err.error);}catch (cat){}
                    Session.set("showErrorDlg",tmp)

                    //If updating in DB failed. Then delete in Amazon as well.
                    var fileObj = template.fileObj.get();
                    S3.delete(fileObj.relative_url,function(error, result){})
                } else {//If upload is success, then delete the old file and re-set it.
                    // debugger;
                    // var fileObjPrevious = template.fileObjPrevious.get()//Don' get it here, as parallely another code is changing this val->lead to bug
                    if(fileObjPrevious){//only if it exists.
                        S3.delete(fileObjPrevious.relative_url,function(error, result){})
                        template.fileObjPrevious.set(template.fileObj.get() );
                    }
                }

            });


        });
        // for (var i = 0, ln = files.length; i < ln; i++) {
        //     propertyImagesCollection.insert(files[i], function (err, fileObj) {
        //         // Inserted new doc with ID fileObj._id, and kicked off the data upload using HTTP
        //         console.log(fileObj);
        //         var cursor = propertyImagesCollection.find(fileObj._id);
        //
        //         var liveQuery = cursor.observe({
        //             changed: function(newImage, oldImage) {
        //
        //                 console.log("Inside live query ");
        //                 console.log(newImage);
        //                 if (newImage.isUploaded()) {
        //                     liveQuery.stop();
        //
        //                     // Call your onUploaded callback here...
        //                 }
        //             }
        //         });
        //     });
        // }
    },
})
Template.fileUploadDlgTemplate.onRendered(function(){
    $("#uploadImagePreviewArea, #cropImage, #finalImage").hide();
    $('#cropImage, #finalImage').attr('src','');
})
Template.fileUploadArea.onCreated(function(){
    this.uploading = new ReactiveVar( false );
    // this.fileObj = new ReactiveVar( {} );
})
Template.fileUploadArea.helpers({
    uploading: function(isMyBidsPage){
        return Template.instance().uploading.get() ;
    },
    validFileExtensions: function(){
        return _validFileExtensions;
    }
})
Template.fileUploadArea.events({
    'click .showUploadDlg': function(event, template) {
        var ses = {show:true,cate:this.title}
        Session.set('showFileDlg',ses);
        return false;
    },
    // 'change .uploadBtn': function(event, template) {
    //     var files = event.target.files;
    //
    //     if(!filevalidation(files)){
    //         var tmp =  Session.get("showErrorDlg");if(!tmp)tmp=[];
    //         var msg = 'Upload rejected. Please upload only document or image files. Allowed extensions are '+_validFileExtensions.join(', ')+'.';
    //         tmp.push(msg);
    //         Session.set("showErrorDlg",tmp)
    //
    //         throw new Meteor.Error("Upload rejected. ");
    //         return;
    //     }
    //
    //     const cate = event.target.getAttribute('cate');
    //     Template.instance().uploading.set(true);
    //     const inst = Template.instance();
    //     inst.fileObj.set({});//Reset old status as this might be 2nd upload.
    //     var ret = S3.upload({
    //         files:files,
    //         path:"profileFiles"
    //     },function(e,r){
    //         if(e){
    //             var tmp =  Session.get("showErrorDlg");if(!tmp)tmp=[];
    //             tmp.push("Upload failed. Please check your internet connectivity and try again. Contact us if needed.");
    //             try{if(e.error)tmp.push(e.error);}catch (cat){}
    //             Session.set("showErrorDlg",tmp)
    //             throw new Meteor.Error('Upload failed ', e);return;
    //         }
    //         console.log(r);
    //
    //         inst.fileObj.set(r);
    //
    //         var tmp = {
    //             name: r.file.original_name,
    //             relative_url: r.relative_url,
    //             url: r.secure_url
    //         }
    //
    //         console.log(tmp);
    //         Meteor.call('updateReferenceFile', [cate, tmp], (err, res) => {
    //             inst.uploading.set(false);//Make it false even if it failed. Users should know that its not uploading anymore.
    //             if (err) {
    //                 console.log(err);
    //
    //                 var tmp =  Session.get("showErrorDlg");if(!tmp)tmp=[];
    //                 tmp.push("Upload failed. Please check your internet connectivity and try again. Contact us if needed.");
    //                 try{if(err.error)tmp.push(err.error);}catch (cat){}
    //                 Session.set("showErrorDlg",tmp)
    //
    //                 //If updating in DB failed. Then delete in Amazon as well.
    //                 var fileObj = inst.fileObj.get();
    //                 S3.delete(fileObj.relative_url,function(error, result){})
    //             } else {
    //
    //             }
    //
    //         });
    //
    //
    //     });
    //     // for (var i = 0, ln = files.length; i < ln; i++) {
    //     //     propertyImagesCollection.insert(files[i], function (err, fileObj) {
    //     //         // Inserted new doc with ID fileObj._id, and kicked off the data upload using HTTP
    //     //         console.log(fileObj);
    //     //         var cursor = propertyImagesCollection.find(fileObj._id);
    //     //
    //     //         var liveQuery = cursor.observe({
    //     //             changed: function(newImage, oldImage) {
    //     //
    //     //                 console.log("Inside live query ");
    //     //                 console.log(newImage);
    //     //                 if (newImage.isUploaded()) {
    //     //                     liveQuery.stop();
    //     //
    //     //                     // Call your onUploaded callback here...
    //     //                 }
    //     //             }
    //     //         });
    //     //     });
    //     // }
    // },
})




function showSaveBtn(ele){
  $(ele).parents('div.inp-hold').find('.overlay-text').fadeOut();
  $(ele).fadeOut();
  $(ele).parent('div.inp-hold').find('.save-btn').addClass('show-save');
  $(ele).parent('div.inp-hold').find('div.cancel-div').css('display','block');
  $(ele).parent('div.inp-hold').find('input').focus();
}
function hideSaveBtn(ele){
  $(ele).parents('div.inp-hold').find('.save-btn').removeClass('show-save');
  $(ele).parents('div.inp-hold').find('div.cancel-div').css('display','none');
  $(ele).parents('div.inp-hold').find('.change-click').fadeIn();
  $(ele).parents('div.inp-hold').find('.overlay-text').fadeIn();
}


Template.loginFormSetPassword.onCreated(() => {
    let template = Template.instance();
    template.formMessages = new ReactiveVar({});
    template.isLoading = new ReactiveVar(false);
});
Template.loginFormSetPassword.helpers(LoginFormSharedHelpers);
Template.loginFormSetPassword.events({

    /**
     * Submit form for password update
     * @param  {Event} event - jQuery Event
     * @param  {Template} template - Blaze Template
     * @return {void}
     */
    "submit form": function (event, template) {
        event.preventDefault();
        event.stopPropagation();

        template.$("button[type=submit]").attr("disabled",true);

        let password1Input = template.$(".login-input--password1");
        let password2Input = template.$(".login-input--password2");
        let password1 = password1Input.val().trim();
        let password2 = password2Input.val().trim();
        let templateInstance = Template.instance();
        var errors = []


        if(password1!=password2){
            errors.push({
                error: "INVALID_PASSWORD",
                reason: "Passwords doesn't match"
            });
            // errors.password2 = [
            //     {
            //         error: "INVALID_PASSWORD",
            //         reason: "Passwords doesn't match"
            //     }
            // ]
            // templateInstance.$("button[type=submit]").attr("disabled",false);//We need it here because line 560 errors.password2 = validatedPassword2; will over write this message if we don't return here. Also array merge isn't an option as our UI is not ready to show multiple messages. It can only take 1 error at a time.
            // templateInstance.formMessages.set({
            //     errors: errors
            // });
            // return;
        }
        // We only check if it exists, just in case we"ve change the password strength and want the
        // user to have an opportunity to update to a stronger password
        // let validatedPassword1 = LoginFormValidation.password(password1);//Not needed as we are doing equal check
        let validatedPassword2 = LoginFormValidation.password(password2, {validationLevel: "length"});


        templateInstance.formMessages.set({});
        templateInstance.isLoading.set(true);

        // if (validatedPassword1 !== true) {
        //     errors.push(validatedPassword1);
        // }
        if (validatedPassword2 !== true) {
            errors.push(validatedPassword2);
        }

        if (errors.length) {
            templateInstance.$("button[type=submit]").attr("disabled",false);
            templateInstance.formMessages.set({
                errors: errors
            });
            // prevent signup
            templateInstance.isLoading.set(false)
            return;
        }

        Meteor.call('setUserPwd',[Meteor.userId(),password2],function(error, result){
            // templateInstance.isLoading.set(false);
            if (error) {
                templateInstance.$("button[type=submit]").attr("disabled",false);
                // Show some error message
                templateInstance.formMessages.set({
                    errors: [error]
                });
            } else {
                Session.set('localHasPasswordSet',true);
                templateInstance.$(".login-input--password1, .login-input--password2").val('')
                $('#setpass-dlg .changePwdAlertMsgs p, #setpass-dlg .help-block p').html('');

                // // Close dropdown or navigate to page
                templateInstance.formMessages.set({
                    info: [{
                        reason: 'Password successfully set'
                    }]
                });

                if($)if($.fancybox){
                    $.fancybox.close();
                    templateInstance.formMessages.set({});
                }
            }
        })
    }
});

Template.loginFormChangePassword.onCreated(() => {
    let template = Template.instance();
    template.formMessages = new ReactiveVar({});
    template.isLoading = new ReactiveVar(false);
});
Template.loginFormChangePassword.helpers(LoginFormSharedHelpers);
Template.loginFormChangePassword.events({

    /**
     * Submit form for password update
     * @param  {Event} event - jQuery Event
     * @param  {Template} template - Blaze Template
     * @return {void}
     */
    "submit form": function (event, template) {
        event.preventDefault();
        event.stopPropagation();

        template.$("button[type=submit]").attr("disabled",true);

        let oldPasswordInput = template.$(".login-input--oldPassword");
        let passwordInput = template.$(".login-input--password");

        let oldPassword = oldPasswordInput.val().trim();
        let password = passwordInput.val().trim();

        // We only check if it exists, just incase we"ve change the password strength and want the
        // user to have an oppurtinity to update to a stronger password
        let validatedOldPassword = LoginFormValidation.password(oldPassword, {validationLevel: "exists"});
        let validatedPassword = LoginFormValidation.password(password, {validationLevel: "length"});

        let templateInstance = Template.instance();
        templateInstance.isLoading.set(true);
        var errors = []

        templateInstance.formMessages.set({});
        templateInstance.isLoading.set(true)

        if(oldPassword==password){
            errors.push({
                error: "INVALID_PASSWORD",
                reason: "New password cannot be same as old password."
            });
            // errors.password2 = [
            //     {
            //         error: "INVALID_PASSWORD",
            //         reason: "Passwords doesn't match"
            //     }
            // ]
            // templateInstance.$("button[type=submit]").attr("disabled",false);//We need it here because line 560 errors.password2 = validatedPassword2; will over write this message if we don't return here. Also array merge isn't an option as our UI is not ready to show multiple messages. It can only take 1 error at a time.
            // templateInstance.formMessages.set({
            //     errors: errors
            // });
            // return;
        }
        if (validatedOldPassword !== true) {
            errors.push(validatedOldPassword);
        }
        if (validatedPassword !== true) {
            errors.push(validatedPassword);
        }

        if (errors.length) {
            templateInstance.$("button[type=submit]").attr("disabled",false);
            templateInstance.formMessages.set({
                errors: errors
            });
            // prevent signup
            templateInstance.isLoading.set(false)
            return;
        }

        Accounts.changePassword(oldPassword, password, (error) => {
            //console.log('Here in callback');
            //templateInstance.$("button[type=submit]").attr("disabled",false);
            templateInstance.isLoading.set(false);
            if (error) {
                templateInstance.$("button[type=submit]").attr("disabled",false);
                // Show some error message
                templateInstance.formMessages.set({
                    errors: [error]
                });
            } else {

                templateInstance.$(".login-input--oldPassword, .login-input--password").val('')
                $('#changepass-dlg .changePwdAlertMsgs p, #changepass-dlg .help-block p').html('');
                //$('.login-input--password, .login-input--oldPassword').val('');

                // // Close dropdown or navigate to page
                templateInstance.formMessages.set({
                    info: [{
                        reason: 'Password successfully changed'
                    }]
                });

                if($)if($.fancybox){
                    $.fancybox.close();
                    templateInstance.formMessages.set({});
                }
            }
        });
    }
});

function titleCase(str){
    if(!str)return;
    return str.charAt(0).toUpperCase() + str.toLowerCase().substring(1);
}
function isIE () {
    var myNav = navigator.userAgent.toLowerCase();
    return (myNav.indexOf('msie') != -1) ? parseInt(myNav.split('msie')[1]) : false;
}