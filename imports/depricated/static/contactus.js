/**
 * Created by njanjanam on 12/03/2018.
 */
contactFormSaving = '';
contactFormSavedSuccess = '';
contactFormInstance = '';

Template.contactUsForm.onCreated(function(){
    this.contactFormSaving = new ReactiveVar( false );
    this.contactFormSavedSuccess = new ReactiveVar( false );
    contactFormInstance = Template.instance();
})
Template.contactUsForm.helpers({
    contactFormSaving:function () {
        return Template.instance().contactFormSaving.get();
    },
    contactFormSavedSuccess:function () {
        return Template.instance().contactFormSavedSuccess.get();
    },
})
Template.contactUsForm.events({
    'change textarea':function () {
        saveToLocalStorage();
    },
    'change input':function () {
        saveToLocalStorage();
    },
    'submit form': function(event){
        event.preventDefault();
    },
    'keyup .autoGrowTA': function(event, template) {
        var element = event.target;
        element.style.height = "5px";
        if(element.scrollHeight<310)element.style.height = (element.scrollHeight)+"px";
        else element.style.height = "310px";
    },
});

Template.contactUsForm.onRendered(function () {

    updateFormFromLocalStorage();

    // this.$('#addPropertyFormCF').validate();
    contactFormSaving = this.contactFormSaving
    contactFormSavedSuccess = this.contactFormSavedSuccess
    var validator = this.$('#contactUsForm').validate({
        submitHandler: function(event){
            contactFormSaving.set(true);
            contactFormSavedSuccess.set(false);
            console.log("You just submitted the 'contact us' form.");
            var userId = Meteor.userId();
            if(!userId)userId = '';
            var sub = 'Contact form request '
            var desc = `

Name: `+$( "input[name='name']" ).val()+`<br/>
Email: `+$( "input[name='email']" ).val()+`<br/>
Mobile: `+$( "input[name='mobile']" ).val()+`<br/>
Message: `+$( "textarea[name='message']" ).val()+`<br/>
User ID: `+userId+`<br/>
`
            Meteor.call('notifyAdmin', sub, desc,function(){
                $('#contactUsForm')[0].reset();
                clearLocalStorage();
                contactFormSaving.set(false);
                contactFormSavedSuccess.set(true);
            });

//             var sub = 'Thank you for getting in touch!'
//             var desc = `
// We will look over your message and get back to you by soon. In the meantime, you can check the <a href="https://www.spotmycrib.com/faqs">FAQ section</a>, our <a href="https://www.spotmycrib.com/estateagent">EstateAgent / Landlord page</a>, our <a href="https://www.spotmycrib.com/b/rent-in-ireland/?">latest letting listings</a> or browse through our <a href="http://blog.spotmycrib.com/">latest blog posts</a>.
//
// Your friends at SpotMyCrib.com
// `
//             Meteor.call('notifyAdmin', sub, desc,function(){
//
//             });

            // fbq('track', 'ViewContent');No FB Q here, let keep fb thing only for pre planned areas, just to make sure it doesn' give wrong success notices .
            ga('send', 'event', 'ContactUsPage', 'formSubmitted', 'Contact us form is submitted');
        }
    });
    fbq('track', 'ViewContent');
    ga('send', 'event', 'ContactUsPage', 'formRendered', 'Contact us form is viewed');
})

function updateFormFromLocalStorage() {
    if(localStorage) {
        if (localStorage.contactFormData_name) {
            $( "input[name='name']" ).val( localStorage.contactFormData_name );
        }
        if (localStorage.contactFormData_email) {
            $( "input[name='email']" ).val(localStorage.contactFormData_email);
        }
        if (localStorage.contactFormData_mobile) {
            $( "input[name='mobile']" ).val( localStorage.contactFormData_mobile);
        }
        if (localStorage.contactFormData_message) {
            $( "textarea[name='message']" ).val( localStorage.contactFormData_message);
            try {
                var element = $("textarea[name='message']")[0]
                element.style.height = "5px";
                if (element.scrollHeight < 310) element.style.height = (element.scrollHeight) + "px";
                else element.style.height = "310px";
            }catch(e){}
        }
    }
}
function saveToLocalStorage(){
    searialisedContactUsForm = $('#contactUsForm').serializeArray();
    if (localStorage) {
        localStorage.contactFormData_name = $( "input[name='name']" ).val();
        localStorage.contactFormData_email = $( "input[name='email']" ).val();
        localStorage.contactFormData_mobile = $( "input[name='mobile']" ).val();
        localStorage.contactFormData_message = $( "textarea[name='message']" ).val();
    }
}
function clearLocalStorage(){
    searialisedContactUsForm = $('#contactUsForm').serializeArray();
    if (localStorage) {
        localStorage.removeItem('contactFormData_name')
        localStorage.removeItem('contactFormData_email')
        localStorage.removeItem('contactFormData_mobile')
        localStorage.removeItem('contactFormData_message')
    }
}