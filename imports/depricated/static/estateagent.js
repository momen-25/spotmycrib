/**
 * Created by njanjanam on 21/10/2017.
 */
// import "../accounts/validation.js";
templateInstance = '';

Template.estateagent.onCreated(function() {
    this.f1Loading = new ReactiveVar( false );
    this.f2Loading = new ReactiveVar( false );
    this.f2Success = new ReactiveVar( false );
    this.knowMore = new ReactiveVar( false );
    templateInstance = Template.instance();
})
Template.estateagent.onRendered(function () {
    // var $zoho=$zoho || {};$zoho.salesiq = $zoho.salesiq ||
    //     {widgetcode:"5e6f4b070bdd6e53b8a76febfd867047f48220a3f0e688fad51400b27169fabc7e3e6a8594601225fa1324917f66ed28", values:{},ready:function(){}};
    // var d=document;s=d.createElement("script");s.type="text/javascript";s.id="zsiqscript";s.defer=true;
    // s.src="https://salesiq.zoho.eu/widget";t=d.getElementsByTagName("script")[0];t.parentNode.insertBefore(s,t);d.write("<div id='zsiqwidget'></div>");
    try{
        jQuery("html,body").animate({scrollTop: 0}, 250);
    }catch(e){
        document.body.scrollTop = document.documentElement.scrollTop = 0;
    }
    var data = [
        [30,1,2,20],
        ['300',10,20,'200'],//333 //10
        ['3,000',100,200,'2,000'],//333 //100
        ['6,000',200,400,'4,000'],//333 //200
        ['12,000',400,800,'8,000'],//333 //400
        ['30,000','1,000','2,000','20,000'],//333 //1000
        ['60,000','2,000','4,000','40,000'],//333 //2000
    ]
    // $("#slider").slider({
    //
    //     value: "1",
    //     min: 0,
    //     max: 6,
    //     step: 1,
    //     slide: function(event, ui) {
    //         console.log('Sliding in progress');
    //         // debugger;
    //         $(".viewingsSaved").html(data[ui.value][0]);
    //         $(".tripsSaved").html(data[ui.value][1]);
    //         $(".hoursSaved").html(data[ui.value][2]);
    //         $(".moneySaved").html(data[ui.value][3]);
    //
    //     }
    // });

    this.$("#many_properties_area_slider").noUiSlider({
        start: [ 10 ],
        range: {
            'min': [  1 ],
            '30%': [  10 ],
            '50%': [  100 ],
            '60%': [  500 ],
            '70%': [  1000 ],
            'max': [ 2000 ]
        }
        }).on('slide', function (ev, val) {
            // set real values on 'slide' event
            var i = Math.round(val);
            // $('#lcountInline').html(i);
            $('#lcount').html(i);
            $(".viewingsSaved").html(30*i);
            $(".tripsSaved").html(1*i);
            $(".hoursSaved").html(2*i);
            $(".moneySaved").html(80*i);
        }).on('change', function (ev, val) {
            // round off values on 'change' event
        });

    // setTimeout(function() {
    //     var slider = document.getElementById('many_properties_area_slider');
    //     templateInstance.noUiSlider.create(slider, {
    //         start: [ 10 ],
    //         range: {
    //             'min': [  1 ],
    //             '30%': [  200 ],
    //             '50%': [  500 ],
    //             '70%': [  1000 ],
    //             'max': [ 2000 ]
    //         },
    //         // tooltips: [wNumb({ decimals: 1 })]
    //         tooltips: true
    //
    //
    //     });
    //
    //     slider.noUiSlider.on('update', function( values, handle ) {
    //         var i = Math.round(values[handle]);
    //         $('#lcount').html(i);
    //         $(".viewingsSaved").html(30*i);
    //         $(".tripsSaved").html(1*i);
    //         $(".hoursSaved").html(2*i);
    //         $(".moneySaved").html(80*i);
    //     });
    // },500);
    // setTimeout(function() {
    //     // $.scrollify({
    //     //     section: "section",
    //     // });
    // },500);
})
Template.estateagent.helpers({
    'f1Loading':function () {
        return Template.instance().f1Loading.get() ;
    },
    'f2Loading':function () {
        return Template.instance().f2Loading.get() ;
    },
    "f2Success": function () {
        return Template.instance().f2Success.get() ;
    },
    knowMore:function () {
        return Template.instance().knowMore.get()
    }
})
Template.estateagent.events({
    "click .joinNowBtn": function(){
        Router.go('joinnowlandlord');
    },
    "submit .sinterest-form":function (event,template) {
        event.preventDefault();
        const target = event.target;
        const email = target.emailaddress.value;
        const fullname = target.fullname.value;
        const company = target.company.value;
        const phone = target.phone.value;

        // import "../accounts/validation.js";
        let validatedEmail = LoginFormValidation.email(email);
        if (validatedEmail !== true) {
            console.log(validatedEmail.error);
            alert(validatedEmail.reason);
            // var tmp =  Session.get("showErrorDlg");if(!tmp)tmp=[];
            // if(!validatedEmail.reason)error.reason = 'Invalid email. Please correct the email address entered.';
            // tmp.push(validatedEmail.reason);
            // Session.set("showErrorDlg",tmp)
        }else{
            ga('send', 'event', 'estateAgentPage', 'sinterestForm', 'Special intro offer form submitted');
            Meteor.call('introOfferRequestReceived',email,fullname,company,phone);
            Template.instance().f2Success.set(true) ;
        }
    },
    "click .knowmoreformtryagain":function () {
        Template.instance().f1Success.set(false) ;
    },
    "click .sinterestformtryagain":function () {
        Template.instance().f2Success.set(false) ;
    },
    "click .knowMoreBtn":function () {
        if(Template.instance().knowMore.get())Template.instance().knowMore.set(false) ;
        else{
            Template.instance().knowMore.set(true) ;
            setTimeout(function () {
                $('html, body').animate({
                    scrollTop: $("#knowmorebegin").offset().top
                }, 500);
            },500)
        }
    }
})
Template.knowmoreform.onCreated(function() {
    this.f1Success = new ReactiveVar( false );
})
Template.knowmoreform.helpers({
    'f1Success': function () {
        return Template.instance().f1Success.get() ;
    }
})
Template.knowmoreform.events({
    "submit .knowmore-form":function (event,template) {
        event.preventDefault();
        const target = event.target;
        const email = target.emailaddress.value;


        let validatedEmail = LoginFormValidation.email(email);
        if (validatedEmail !== true) {
            console.log(validatedEmail.error);
            alert(validatedEmail.reason);
            // var tmp =  Session.get("showErrorDlg");if(!tmp)tmp=[];
            // if(!validatedEmail.reason)error.reason = 'Invalid email. Please correct the email address entered.';
            // tmp.push(validatedEmail.reason);
            // Session.set("showErrorDlg",tmp)
        }else{
            ga('send', 'event', 'estateAgentPage', 'knowmoreForm', 'Know more form submitted');
            Meteor.call('knowMoreRequestReceived',email);
            Template.instance().f1Success.set(true) ;
        }
    },
    "click .knowmoreformtryagain":function () {
        Template.instance().f1Success.set(false) ;
    }
})