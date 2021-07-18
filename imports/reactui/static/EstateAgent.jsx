import { Meteor } from 'meteor/meteor';
import React, { Component } from 'react';

export default class EstateAgent extends Component {
    constructor(props){
        super(props);
        this.state={
            f2Success:false,
            knowMore:false
        }
        this.sinterestformHandler = this.sinterestformHandler.bind(this)
        this.sinterestformtryagainHandler = this.sinterestformtryagainHandler.bind(this)
        this.knowMoreBtnHandler = this.knowMoreBtnHandler.bind(this)
    }
    componentDidMount(){
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

        $("#many_properties_area_slider").noUiSlider({
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
    }
    joinNowBtnHandler(){
        FlowRouter.go('joinnowlandlord');
    }
    sinterestformHandler(event){
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
            this.setState({f2Success:true})
        }
    }
    sinterestformtryagainHandler(){
        this.setState({f2Success:false})
    }
    knowMoreBtnHandler(){
        if(this.state.knowMore)this.setState({knowMore:false})
        else{
            this.setState({knowMore:true})
            setTimeout(function () {
                try{
                    $('html, body').animate({
                        scrollTop: $("#knowmorebegin").offset().top
                    }, 500);
                }catch(e){}
            },500)
        }
    }
    render() {
        return (
            <div>
                <link rel="stylesheet" href="css/estateagent.css" />
                <section className="topheader" id="topheader">
                    <div className="container-fluid">
                        <div className="container container-fixed rdc">
                            <div className="col-md-12 logo">
                                <a href={FlowRouter.url('home')}><img src={cdnPath("/images/estateagentpage/logo.png")}/></a>
                            </div>
                            <div className="col-md-10 col-md-offset-1 property_listings">
                                <h1>Post Your Property listings and Select your tenant now</h1>
                                <div className="box-places home-page-box-places" style={{background: 'none', padding: 0}}>
                                    <ul>
                                        <li>
                                            <KnowMoreForm/>
                                        </li>
                                    </ul>
                                </div>
                                {/*<div class="col-md-10 col-md-offset-1 ">
                  <form class="form-horizontal">
                      <div class="form-group">
                          <div class="col-sm-9">
                              <input type="email" class="input-group form-control" id="email" placeholder="Enter email">
                          </div>
                          <div class="col-sm-3">
                              <button type="submit" class="btn green-btn">Know More!</button>
                          </div>
                      </div>
                  </form>
              </div>*/}
                            </div>
                        </div>
                    </div>
                </section>
                {/* Header Section End*/}
                {/*Spot Your Tenant Section Start*/}
                <section className="spotyourtenant">
                    <div className="container-fluid">
                        <div className="container container-fixed rdc">
                            <div className="col-md-12 rdc">
                                <div className="col-md-6 ">
                                    <h2>Spot Your Tenant</h2>
                                    <p>SpotMyCrib makes your work easy. You can <br />post your property and screen tenants online. The screening process includes a rental application <br />with their references and their complete social profiles.</p>
                                </div>
                                <div className="col-md-6 ">
                                    {false? (<img src={cdnPath("/images/estateagentpage/video.png")} className="img-responsive" />):""}
            <div id="video-div">
                <iframe width="462.2" height="260" src="https://www.youtube.com/embed/L689NIDwFdc?rel=0" frameBorder="0" allowFullScreen></iframe>
                {/* allow="accelerometer; autoplay; encrypted-media; gyroscope; picture-in-picture" */}
            </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>
                {/*Spot Your Tenant Section Start*/}
                {/*Spot Your Tenant Section Start*/}
                <section className="many_properties_area" style={{minHeight: 700}}>
                    <div className="container-fluid">
                        <div className="container rdc container-fixed">
                            <div className="col-md-12 rdc text-center">
                                <h2>How Many Properties are you listing?</h2>
                                {/*<span id="lcountInline">10</span>*/}
                                <div className="wrappernew">
                                    <div className="colThree" style={{margin: '0px 0 20px 0px', textAlign: 'left'}}>
                                        <div id="contenta">
                                            <div id="lcount">10</div>
                                            <span>1</span><span style={{float: 'right'}}>2000</span>
                                            <div id="many_properties_area_slider" />
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <div className="container container-fixed">
                                <div className="col-md-12 rdc">
                                    <article className="col oneline">
                                        <div className="circle-in">
                                            <div className="viewingsSaved">300</div>
                                            <p>Viewings Saved</p></div>
                                    </article>
                                    <article className="col oneline">
                                        <div className="circle-in">
                                            <div className="tripsSaved">10</div>
                                            <p>Travel trips Saved</p>
                                        </div>
                                    </article>
                                    <article className="col oneline">
                                        <div className="circle-in">
                                            <div><span className="hoursSaved">20</span><strong>Hours</strong></div>
                                            <p>Time Saved</p>
                                        </div>
                                    </article>
                                    <article className="col oneline">
                                        <div className="circle-in">
                                            <div>€<span className="moneySaved">800</span></div>
                                            <p>Money Saved</p>
                                        </div>
                                    </article>
                                </div>
                            </div>
                            <div className="col-md-12 btn-account_area">
                                <button type="submit" className="btn green-btn joinNowBtn" onClick={this.joinNowBtnHandler}>Claim your Free Account</button>
                            </div>
                            <div className="container rdc">
                            </div>
                        </div>
                    </div>
                </section>
                {/*Spot Your Tenant Section Start*/}
                {/*Business Section Start*/}
                <section className="business_area" style={{minHeight: 970}}>
                    <div className="container-fluid">
                        <div className="container  rdc">
                            <div className="col-md-12 rdc business_area_onesecton">
                                <h2>Expand / Develop Your Business with these BENEFITS</h2>
                                <div className="col-md-4 competitive">
                                    <img src={cdnPath("/images/estateagentpage/img_01.png")} className="img-responsive" />
                                    <h3>Competitive Advantage</h3>
                                    <p style={{lineHeight: '30px', fontSize: '17px'}}>Get the competitive edge you need to excel in this extremely competitive market. </p>
                                    {/*This value added service will give you the competitive edge you need in an extremely competitive market*/}
                                </div>
                                <div className="col-md-4 competitive">
                                    <img src={cdnPath("/images/estateagentpage/img_02.png")} className="img-responsive" />
                                    <h3>Reduced Admin</h3>
                                    <p style={{lineHeight: '30px', fontSize: '17px'}}>Save time and money by automating <br />renting, managing and maintaining <br />your property.</p>
                                </div>
                                <div className="col-md-4 competitive">
                                    <img src={cdnPath("/images/estateagentpage/img_03.png")} className="img-responsive" />
                                    <h3>Safe secure system</h3>
                                    <p style={{lineHeight: '30px', fontSize: '17px'}}>SpotMyCrib uses state of the art<br />technology to keep your data<br /> safe and secure.</p>
                                </div>
                            </div>
                            <div className="col-md-12 rdc business_area_onesecton">
                                <div className="col-md-4 competitive">
                                    <img src={cdnPath("/images/estateagentpage/img_04.png")} className="img-responsive" />
                                    <h3>Digital accounting and maintenance</h3>
                                    <p style={{lineHeight: '30px', fontSize: '17px'}}>Post your property instantly on the<br />go, from your mobile phone. Save valuable time.</p>
                                </div>
                                <div className="col-md-4 competitive">
                                    <img src={cdnPath("/images/estateagentpage/img_05.png")} className="img-responsive" />
                                    <h3>Screen tenants</h3>
                                    <p style={{lineHeight: '30px', fontSize: '17px'}}>Receive and access all your tenant <br />references and applications from one centralised account. Access them anytime, anywhere across the globe. </p>
                                    {/*No more manual uploading into your 3rd party file storage.*/}
                                </div>
                                <div className="col-md-4 competitive">
                                    <img src={cdnPath("/images/estateagentpage/img_06.png")} className="img-responsive" />
                                    <h3>Verify social profiles</h3>
                                    <p style={{lineHeight: '30px', fontSize: '17px'}}> LinkedIn, twitter and facebook profile verification.</p>
                                </div>
                            </div>
                            <div className="col-md-12 rdc business_area_onesecton">
                                <div className="col-md-4 competitive">
                                    <img src={cdnPath("/images/estateagentpage/img_10.png")} className="img-responsive" />
                                    <h3>Report</h3>
                                    <p style={{lineHeight: '30px', fontSize: '17px'}}>Get intelligent reports on rental and maintenance costs identifying patterns to add revenue streams.</p>
                                    {/*Intelligent reporting on rents received, maintenance costs to identify patterns to boost business and add new revenue streams.*/}
                                </div>
                                <div className="col-md-4 competitive">
                                    <img src={cdnPath("/images/estateagentpage/img_08.png")} className="img-responsive" />
                                    <h3>Get Paid</h3>
                                    {/*<p style="line-height:30px;font-size:17px;">Set your own Application Fee.<br>The Applicants will pay you online</p>*/}
                                    <p style={{lineHeight: '30px', fontSize: '17px'}}>Auto-rent collection, friendly rental reminders 24 hours prior to rental date, failure to pay on time leads to warning notices being issued and much more.</p>
                                </div>
                                <div className="col-md-4 competitive">
                                    <img src={cdnPath("/images/estateagentpage/img_09.png")} className="img-responsive" />
                                    <h3>e-Sign Lease</h3>
                                    <p style={{lineHeight: '30px', fontSize: '17px'}}>Generate and sign lease/contracts<br />online.</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>
                {/*Business Section End*/}
                {/*How It Work Section End*/}
                <section className="howitwork_section" style={{minHeight: 650}}>
                    <div className="container-fluid">
                        <div className="container rdc">
                            <h2>How it works</h2>
                            <div className="col-md-12 rdc">
                                <div className="col-md-3 posting_section" style={{paddingBottom: 81}}>
                                    <h3>POSTING LETTING</h3>
                                    <img src={cdnPath("/images/estateagentpage/workimg_01.png")} className="img-responsive" />
                                    <p style={{lineHeight: '30px', fontSize: '17px'}}>Market your property through spotmycrib.ie and find your ideal tenant effortlessly. Post your property photographs n details.</p>
                                    <p style={{lineHeight: '30px', fontSize: '17px'}}>Market your property through spotmycrib.ie and find your ideal tenant effortlessly. Post your property photographs and particulars.</p>
                                </div>
                                <div className="col-md-3 posting_section" style={{paddingBottom: 56}}>
                                    <h3>SCREEN TENANTS</h3>
                                    <img src={cdnPath("/images/estateagentpage/workimg_02.png")} className="img-responsive" />
                                    <p style={{lineHeight: '30px', fontSize: '17px'}}>Our applicants apply for your property online via SpotMyCrib. View all their details, references, social profiles online and screen them. Click "choose" and select your tenant. It is as simple as that.</p>
                                </div>
                                <div className="col-md-3 posting_section" style={{paddingBottom: 81}}>
                                    <h3>SIGN DIGITAL LEASE</h3>
                                    <img src={cdnPath("/images/estateagentpage/workimg_03.png")} className="img-responsive" />
                                    <p style={{lineHeight: '30px', fontSize: '17px'}}>Generate and sign legally binding lease/contracts online. Automatic reminder and reporting on lease expiry dates. </p>
                                </div>
                                <div className="col-md-3 posting_section" style={{paddingBottom: 81}}>
                                    <h3>COLLECT RENTS</h3>
                                    <img src={cdnPath("/images/estateagentpage/workimg_04.png")} className="img-responsive" />
                                    <p style={{lineHeight: '30px', fontSize: '17px'}}>Let your tenants pay rent online. Automated rent collection and owner disbursements. Reminders and reporting on all payments.</p>
                                </div>
                            </div>
                            <div className="col-md-12 btn-account_area">
                                {this.state.knowMore ? (
                                    <button className="btn green-btn knowMoreBtn" onClick={this.knowMoreBtnHandler}>Know Less!</button>
                                ) : (
                                    <button className="btn green-btn knowMoreBtn" onClick={this.knowMoreBtnHandler}>Know More!</button>
                                )}
                            </div>
                        </div>
                    </div>
                </section>
                {/*How It Work Section End*/}
            {this.state.knowMore ? (
                <div>
                {/*Property Area Section Start*/}
                <section id="knowmorebegin" className="property_area" style={{minHeight: 700}}>
                    <div className="container-fluid">
                        <div className="container container-fixed rdc">
                            <h2 style={{marginBottom: 60}}>Make your life faster and easier!!</h2>
                            <div className="col-md-12">
                                <div className="col-md-6">
                                    <h3>Post your property</h3>
                                    <p style={{}}>Here is your chance to post your property in the best light possible. Describe it, is it furnished? What amenities are available? Pets allowed? Add all the desirable features of it. Post the best photographs of it. Have tenants fall in love with your property time and time again.</p>
                                    <a href={FlowRouter.url('advertisewithus')} className="btn green-btn">Post your letting</a>
                                </div>
                                <div className="col-md-6">
                                    <img src={cdnPath("/images/post.png")} className="img-responsive" style={{boxShadow: 'none'}} />
                                </div>
                            </div>
                        </div>
                    </div>
                </section>
                {/*Property Area Section End*/}
                {/*Property Area Section Start*/}
                <section className="screentenants_area" style={{minHeight: 700}}>
                    <div className="container-fluid">
                        <div className="container container-fixed rdc">
                            <div className="col-md-12">
                                <div className="col-md-6">
                                    <img src={cdnPath("/images/estateagentpage/screen-tenants.jpg")} className="img-responsive" />
                                </div>
                                <div className="col-md-1" />
                                <div className="col-md-5">
                                    <h3>Screen Tenants</h3>
                                    <p>Find your best tenant by screening them online. You get all their details, references, social profiles as they apply for your property. Their application package will also include credentials like their experian credit check, criminal check, previous rental history and all other necessary details. Screen them faster and close your deal.</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>
                {/*Manage rent*/}
                <section className="property_area" style={{minHeight: 700}}>
                    <div className="container-fluid">
                        <div className="container container-fixed rdc">
                            <div className="col-md-12">
                                <div className="col-md-6">
                                    <h3>Manage Rent Online</h3>
                                    <p>No more paperwork. Manage your rental income online. SpotMyCrib is safe and reliable. You can also check the deposits, rent amount and deadlines here. No more hassle with cash payments or standing orders.</p>
                                </div>
                                <div className="col-md-6">
                                    <img src={cdnPath("/images/payment.png")} className="img-responsive" />
                                </div>
                            </div>
                        </div>
                    </div>
                </section>
                {/*Online Lease Signing*/}
                <section className="property_area" style={{minHeight: 700}}>
                    <div className="container-fluid">
                        <div className="container container-fixed rdc">
                            <div className="col-md-12">
                                <div className="col-md-6">
                                    <img src={cdnPath("/images/e-sign.png")} className="img-responsive" />
                                </div>
                                <div className="col-md-1" />
                                <div className="col-md-5">
                                    <h3>Online Lease Signing</h3>
                                    <p>Simply upload your necessary details. Get your legally binding document back with minimal effort. SpotMyCrib makes your job much easier and simpler. Store your contract online and view it any time you wish.</p>
                                    {/*Generate rental agreements online and get them to e-sign. */}
                                </div>
                            </div>
                        </div>
                    </div>
                </section>
                </div>
            ):""}
                {/*receive Section Start*/}
                <section className="receive_area">
                    <div className="container-fluid">
                        <div className="container container-fixed rdc">
                            <div className="col-md-12 rdc text-center">
                                <h2>Receive a Special Introductory Offer</h2>
                                {this.state.f2Success ? (
        <div>
            <p style={{marginBottom: 20, color: 'black'}} className="text-center">Thank you for your interest.</p>
            <button className="btn green-btn sinterestformtryagain" type="submit" onClick={this.sinterestformtryagainHandler}>Add another</button>
        </div>
                                ):(
                                <form role="form" className="sinterest-form" onSubmit={this.sinterestformHandler}>
                                    <div className="form-group col-xs-12 col-sm-6 col-md-6 col-lg-6">
                                        <input autoComplete="email" type="email" className="form-control" id="emailaddress" name="emailaddress" placeholder="Enter your email" />
                                    </div>
                                    <div className="form-group col-xs-12 col-sm-6 col-md-6 col-lg-6">
                                        <input autoComplete="name" type="text" className="form-control" id="fullname" name="fullname" placeholder="Your full name" />
                                    </div>
                                    <div className="clearfix" />
                                    <div className="form-group col-xs-12 col-sm-6 col-md-6 col-lg-6">
                                        <input autoComplete="organization" type="text" className="form-control" id="company" name="company" placeholder="Company" />
                                    </div>
                                    <div className="form-group col-xs-12 col-sm-6 col-md-6 col-lg-6">
                                        <input autoComplete="tel" type="text" className="form-control" id="phone" name="phone" placeholder="Phone" />
                                    </div>
                                    <div className="clearfix" />
                                    <div className="clearfix" />
                                    <div className="col-xs-12 col-sm-12 col-md-12 col-lg-12 submit">
                                        <button type="submit" className="btns green-btn">Learn More!</button>
                                    </div>
                                </form>
                                )}
                            </div>
                        </div>
                    </div>
                </section>
                {/*receive Section End*/}
                <section className="frequently_area">
                    <div className="container-fluid">
                        <section className="faq-content mar-btm-20">
                            <div className="container container-fixed rdc">
                                <div className="faq-section-hold">
                                    <h2>Frequently asked questions</h2>
                                    <div className="panel-group agent-panel-group" id="accordion" role="tablist" aria-multiselectable="true">
                                        <div className="panel panel-default">
                                            <a role="button" data-toggle="collapse" data-parent="#accordion" href="#collapseOne" aria-expanded="false" aria-controls="collapseOne" className="collapsed">
                                                <div className="panel-heading" role="tab" id="headingOne">
                                                    <h4 className="panel-title ">
                                                        <span className="green-circle">1</span>
                                                        <p className="position">It is my understanding that current legislation will not allow for bidding that exceeds the permitted rent amount. </p>
                                                        <i className="glyphicon glyphicon-menu-down active-arrow" />
                                                    </h4>
                                                </div>
                                            </a>
                                            <div id="collapseOne" className="panel-collapse collapse" role="tabpanel" aria-labelledby="headingOne" aria-expanded="false" style={{height: 0}}>
                                                <div className="panel-body">
                                                    <ul>
                                                        <li>We have an option to disable the bidding and have done so.</li>
                                                        <li>We have contacted the RTB: Residential Tenancies Board in Ireland (in writing) and asked them if a tenant offers more rent and a landlord agrees to it - is that legal. They confirmed it is legal if both sides agree to it.</li>
                                                    </ul>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="panel panel-default">
                                            <a role="button" data-toggle="collapse" data-parent="#accordion" href="#collapseTwo" aria-expanded="false" aria-controls="collapseOne" className="collapsed">
                                                <div className="panel-heading" role="tab" id="headingOne">
                                                    <h4 className="panel-title ">
                                                        <span className="green-circle">2</span>
                                                        <p className="position">What would the knock effect be should there be arrears, can warning letters be sent? etc</p>
                                                        <i className="glyphicon glyphicon-menu-down active-arrow" />
                                                    </h4>
                                                </div>
                                            </a>
                                            <div id="collapseTwo" className="panel-collapse collapse" role="tabpanel" aria-labelledby="headingOne" aria-expanded="false">
                                                <div className="panel-body">
                                                    <ul>
                                                        <li>We can send warning emails/reminder emails and report on who are due rents, arrears.</li>                                              <li>SpotMyCrib also remembers the history of a tenants arrears, etc</li>
                                                    </ul>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="panel panel-default">
                                            <a className="collapsed" role="button" data-toggle="collapse" data-parent="#accordion" href="#collapseThree" aria-expanded="false" aria-controls="collapseTwo">
                                                <div className="panel-heading" role="tab" id="headingTwo">
                                                    <h4 className="panel-title">
                                                        <span className="green-circle">3</span>
                                                        <p className="position">What responsibility is there on the agent, from a Data Protection perspective, If references are sent to a website?</p>
                                                        <i className="glyphicon glyphicon-menu-down active-arrow" />
                                                    </h4>
                                                </div>
                                            </a>
                                            <div id="collapseThree" className="panel-collapse collapse" role="tabpanel" aria-labelledby="headingTwo" aria-expanded="false">
                                                <div className="panel-body">
                                                    <ul>
                                                        <li>All Data is being held and maintained by SpotMyCrib within Europe and the key system ensures the data is being shared within in the terms of the consumer's signup.</li>
                                                        <li>There is no responsibility on the agent, Users agree to terms of service, privacy when they upload their references. This actively operates within the GDPR (<a target="_blank" href="https://en.wikipedia.org/wiki/General_Data_Protection_Regulation"> Data protection Regulation</a>) framework. </li>
                                                        <li>Customers retain at all times the option to have all of their data removed, inspected or deletion if we're contacted in writing directly or indirectly by the agent on the consumer's behalf.</li>
                                                        <li>The key system ensures the agent can deal with all Data Protection issues for a renter, speedily and thoroughly within the regulations.</li>
                                                        <li>Plus we are 100% compliant with data being stored within Europe, all of our data is stored on Amazon Ireland.</li>
                                                        <li>We also use https encryption, which encrypts all the communication between user and spotmycrib.ie</li>
                                                    </ul>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="panel panel-default">
                                            <a className="collapsed" role="button" data-toggle="collapse" data-parent="#accordion" href="#collapseFour" aria-expanded="false" aria-controls="collapseThree">
                                                <div className="panel-heading" role="tab" id="headingThree">
                                                    <h4 className="panel-title">
                                                        <span className="green-circle">4</span>
                                                        <p className="position">Is there a benefit to the references being collect by Spot my crib rather than say our personal emails? </p>
                                                        <i className="glyphicon glyphicon-menu-down active-arrow" />
                                                    </h4>
                                                </div>
                                            </a>
                                            <div id="collapseFour" className="panel-collapse collapse" role="tabpanel" aria-labelledby="headingThree" aria-expanded="false">
                                                <div className="panel-body">
                                                    <p>There are many other advantages as given below. </p>
                                                    <ul>
                                                        <li>Centralised records, no more going through emails back and forth to gain references.</li>
                                                        <li>Time tracking applications and sequencing</li>
                                                        <li>Elimination of duplication.</li>
                                                        <li>Time-saving - as discussed on our previous meeting, let's say Neptune gets 30 viewings per house and for 100 units, its 3000 viewings - that is 3k digital applications</li>
                                                        <li>Instant social profile checks - verify users to check if they would they be a good fit for the property.</li>
                                                        <li>Digital fingerprint background Checks - of all the references</li>
                                                        <li>Instant salary affordability checks - Check if the tenants can afford the house</li>
                                                        <li>No more paper to get lose.</li>
                                                        <li>No longer tied to office - checks can be made from anywhere, any device, laptop/mobile.</li>
                                                        <li>Customised filters - to choose only the best tenants using an Agent's experience.</li>
                                                        <li>Set up invites for viewing - only invite selected applicants for the viewing.</li>
                                                        <li>The key ensures it is a particular property and eliminates confusion for the renter.</li>
                                                    </ul>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="panel panel-default">
                                            <a className="collapsed" role="button" data-toggle="collapse" data-parent="#accordion" href="#collapseFive" aria-expanded="false" aria-controls="collapseThree">
                                                <div className="panel-heading" role="tab" id="headingThree">
                                                    <h4 className="panel-title">
                                                        <span className="green-circle">5</span>
                                                        <p className="position">How does someone who Is looking for an Apartment know to go to Spot my Crib?. They will think My Home and Daft. </p>
                                                        <i className="glyphicon glyphicon-menu-down active-arrow" />
                                                    </h4>
                                                </div>
                                            </a>
                                            <div id="collapseFive" className="panel-collapse collapse" role="tabpanel" aria-labelledby="headingThree" aria-expanded="false">
                                                <div className="panel-body">
                                                    <ul>
                                                        <li>Tenants can search for the property directly from our home page.</li>
                                                        <li>A property's link/key is shared either in the ad or with the ad in daft, myhome etc.</li>
                                                        <li>A property's link/key can also be posted on the Agent's website.</li>
                                                        <li>Agents can print the key and give a hardcopy of the key to viewers when they visit the property. </li>
                                                    </ul>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="col-md-12 btn-account_area">
                                        <a href={FlowRouter.url('faqs')} className="btn green-btn">More FAQs!</a>
                                    </div>
                                </div>
                            </div>{/*container*/}
                        </section>
                    </div>
                </section>
            </div>

        )
    }
}
class KnowMoreForm extends Component {
    constructor(props){
        super(props);
        this.state={
            f1Success:false,
        }
        this.knowmoreformtryagainHandler = this.knowmoreformtryagainHandler.bind(this)
        this.knowmoreformHandler = this.knowmoreformHandler.bind(this)
    }
    knowmoreformtryagainHandler(){
        this.setState({f1Success:false})
    }
    knowmoreformHandler(event){
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
            this.setState({f1Success:true})
        }
    }
    render() {
        return (
            <form className="knowmore-form" onSubmit={this.knowmoreformHandler}>
                <div className="input-group">
                    <span className="input-group-btn" style={{zIndex: 0, margin: 0}}>
                      <a href={FlowRouter.url('advertisewithus')} className="btn green-btn">Advertise your property</a>
                    </span>
                    {this.state.f1Success ? (
                        <p style={{marginBottom: 20, display: 'inline', paddingRight:'15px'}}>Thank you for your interest.</p>
                    ) : (
                        <input autoComplete="email" type="text" className="form-control emailaddress" name="emailaddress" placeholder="Enter your email." style={{paddingLeft: 10, zIndex: 0}} />
                    )}
                    {this.state.f1Success ? (
                        <button className="btn transparent-btn knowmoreformtryagain" type="submit" onClick={this.knowmoreformtryagainHandler}>Add another</button>
                        ) : (
                        <span className="input-group-btn" style={{zIndex: 0}}>
                          <button className="btn transparent-btn" type="submit">Know More!</button>
                        </span>
                    )}

                </div>
            </form>
        )
    }
}