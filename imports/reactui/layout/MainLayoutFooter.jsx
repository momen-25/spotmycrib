import React, { Component } from 'react';

export default class MainLayoutFooter extends Component {
    render() {
        return (
            <div>
            <section className="footer-div">
                <div className="container">
                    <div className="row">
                        <div className="col-md-9 col-sm-12 col-xs-12 foot-menu">
                            <div className="col-md-3 col-sm-3 col-xs-12 foot-logo">
                                <a href={FlowRouter.url('home')}><img src={cdnPath("/images/spot-my-crib-logo.png")} height="32px" alt=""/></a>
                            </div>
                            <div className="col-md-9 col-sm-9 col-xs-12 pad0">
                                <div className="col-md-4 col-sm-4 col-xs-12">
                                    <ul>
                                        <li><h6 className="pad-bot-2">TENANTS</h6></li>

                                        <li><a href={FlowRouter.url('b', {slug:'rent-in-dublin-ireland'})}>Rent in Dublin</a></li>
                                        <li><a href={FlowRouter.url('b', {slug:'rent-in-cork-ireland'})}>Rent in Cork</a></li>
                                        <li><a href={FlowRouter.url('b', {slug:'rent-in-kildare-ireland'})}>Rent in Kildare</a></li>
                                        <li><a href={FlowRouter.url('b', {slug:'rent-in-galway-ireland'})}>Rent in Galway</a></li>
                                        <li><a href={FlowRouter.url('b', {slug:'rent-in-meath-ireland'})}>Rent in Meath</a></li>
                                    </ul>
                                </div>
                                <div className="col-md-4 col-sm-4 col-xs-12">
                                    <ul>
                                        <li><h6 className="pad-bot-2">LANDLORDS</h6></li>
                                        <li><a href={FlowRouter.url('advertisewithus')}>List My Property</a></li>
                                        <li><a href={FlowRouter.url('estateagent')}>Estate Agents/Landlords</a></li>
                                        <li><a href={FlowRouter.url('howitworks')}>How it Works?</a></li>
                                        <li><a href={FlowRouter.url('faqs')}>FAQs</a></li>
                                        <li><a href={FlowRouter.url('contactus')}>Contact Us</a></li>
                                    </ul>
                                </div>

                                <div className="col-md-4 col-sm-4 col-xs-12">
                                    <ul>
                                        <li><h6 className="pad-bot-2">SPOTMYCRIB</h6></li>
                                        <li><a href={FlowRouter.url('about')}>About Us</a></li>
                                        <li><a href={FlowRouter.url('bloghome')}>Blog</a></li>
                                        <li><a href={FlowRouter.url('careers')}>Careers</a></li>
                                        <li><a href={FlowRouter.url('gdpr')}>Data Protection / EU GDPR</a></li>
                                        <li><a href={FlowRouter.url('terms')}>Legal</a></li>
                                        <li><a href={FlowRouter.url('privacy')}>Privacy Policy</a></li>
                                        <li><a href={FlowRouter.url('cookiepolicy')}>Cookie Policy</a></li>
                                    </ul>
                                </div>
                            </div>
                        </div>

                        <div className="col-md-3 col-sm-12 col-xs-12 social-icon">
                            <div className="col-md-12 col-sm-12 col-xs-12">
                                <ul>
                                    <li><a href="https://www.facebook.com/SpotMyCrib/" target="_blank"><img src={cdnPath("/images/facebook-icon.png")} alt=""/></a></li>
                                    <li><a href="https://twitter.com/SpotMyCrib" target="_blank"><img src={cdnPath("/images/twitter-icon.png")} alt=""/></a></li>
                                    <li><a href="https://www.linkedin.com/company/11223356/" target="_blank"><img src={cdnPath("/images/linkedin-icon.png")} alt=""/></a></li>
                                </ul>
                            </div>
                        </div>
                    </div>
                </div>
            </section>
            <section className="copyright" style={{display: 'none'}}>
                <div className="container">
                    <ul className="footer-left visible-md">
                        <li>SpotMyCrib. </li>
                    </ul>
                    <ul className="footer-left hidden-md">
                        <li>SpotMyCrib. </li>
                    </ul>
                </div>
            </section>
            </div>
        );
        }
};