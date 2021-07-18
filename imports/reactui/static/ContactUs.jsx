import { Meteor } from 'meteor/meteor';
import React, { Component } from 'react';
import MainLayoutFooter from '../layout/MainLayoutFooter.jsx'
import MainLayoutHeader from '../layout/MainLayoutHeader.jsx'

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

export default class ContactUs extends Component {
    constructor(props){
        super(props);
        this.state={
            contactFormSaving:false,
            contactFormSavedSuccess:false
        }
        this.takeBackupHandler = this.takeBackupHandler.bind(this)
        this.formSubmitHandler = this.formSubmitHandler.bind(this)
        this.autoGrowTAHandler = this.autoGrowTAHandler.bind(this)
    }
    takeBackupHandler(){
        saveToLocalStorage();
    }
    formSubmitHandler(event){
        event.preventDefault();
    }
    autoGrowTAHandler(event){
        var element = event.target;
        element.style.height = "5px";
        if(element.scrollHeight<310)element.style.height = (element.scrollHeight)+"px";
        else element.style.height = "310px";
    }
    componentDidMount(){
        updateFormFromLocalStorage();

        const self = this;
        var validator = $('#contactUsForm').validate({
            submitHandler: function(event){
                self.setState({contactFormSaving:true})
                self.setState({contactFormSavedSuccess:true})

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
                    self.setState({contactFormSaving:false})
                    self.setState({contactFormSavedSuccess:false})
                });

//             var sub = 'Thank you for getting in touch!'
//             var desc = `
// We will look over your message and get back to you by soon. In the meantime, you can check the <a href="https://www.spotmycrib.ie/faqs">FAQ section</a>, our <a href="https://www.spotmycrib.ie/estateagent">EstateAgent / Landlord page</a>, our <a href="https://www.spotmycrib.com/b/rent-in-ireland/?">latest letting listings</a> or browse through our <a href="http://blog.spotmycrib.com/">latest blog posts</a>.
//
// Your friends at SpotMyCrib.ie
// `
//             Meteor.call('notifyAdmin', sub, desc,function(){
//
//             });

                // fbq('track', 'ViewContent');No FB Q here, let keep fb thing only for pre planned areas, just to make sure it doesn' give wrong success notices .
                ga('send', 'event', 'ContactUsPage', 'formSubmitted', 'Contact us form is submitted');
            }
        });
        setTimeout(function () {
            fbq('track', 'ViewContent');
            ga('send', 'event', 'ContactUsPage', 'formRendered', 'Contact us form is viewed');
        },2000)

    }
    render() {
        return (
            <div>
                <MainLayoutHeader />
                <div className="index">
                    <section className="contact-bnr">
                        <h1>Contact Us</h1>
                    </section>
                    <section className="contact-content mar-btm-20" style={{background: 'white'}}>
                        <div className="container">
                            <p className="text-center" style={{marginBottom: 10}}>
                                Please contact the owner directly for queries regarding the properties advertised on our site as we do not own or deal diretly with them. For other queries please email at below email or fill the form below.
                            </p>
                            <p className="text-center"><a style={{color: '#428bca'}} href="mailto:support@spotmycrib.com"><i className="glyphicon glyphicon-envelopee" /> support@spotmycrib.com</a></p>
                            <p className="text-center"> Or </p>
                            <form onSubmit={this.formSubmitHandler} className="signin-form cf-1" id="contactUsForm">
                                <div className="w-100" />
                                <div className="sep-section">
                                    <label className="sep-label">Write to us</label>
                                    <div className="styled-input underline">
                                        <input onChange={this.takeBackupHandler} type="text" name="name" required />
                                        <label>Name *</label>
                                        <span />
                                    </div>
                                    <div className="styled-input underline">
                                        <input onChange={this.takeBackupHandler} type="email" name="email" required />
                                        <label>Email *</label>
                                        <span />
                                    </div>
                                    <div className="styled-input underline">
                                        <input onChange={this.takeBackupHandler} type="text" name="mobile" />
                                        <label>Mobile </label>
                                        <span />
                                    </div>
                                    <div className="styled-full-width">
                                        <textarea onChange={this.takeBackupHandler} onKeyUp={this.autoGrowTAHandler} name="message" className="styled-input-textarea autoGrowTA" id="contactAG" placeholder="Enter your message" required defaultValue={""} />
                                    </div>
                                    <div className="styled-full-width mar-top-10">
                                        {this.state.contactFormSaving ? (
                                            <button type="button" className="btns transparent-btn">Saving</button>
                                        ):(
                                            <button type="submit" className="btns blue-btn">Submit</button>
                                        )}
                                    </div>
                                    {this.state.contactFormSavedSuccess ? (
                                    <div className="styled-full-width">
                                        <div className="alert alert-success" role="alert">
                                            <span className="glyphicon glyphicon-ok" aria-hidden="true" />&nbsp;Thank you for contacting us, we will reach out to you as soon as possible.
                                        </div>
                                    </div>
                                    ):""}
                                </div>
                                <div className="w-100" />
                            </form>

                        </div>
                    </section>
                </div>
                <footer className="footer-default"><MainLayoutFooter /></footer>
            </div>

        )
    }
}