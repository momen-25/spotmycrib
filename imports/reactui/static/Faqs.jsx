import { Meteor } from 'meteor/meteor';
import React, { Component } from 'react';
import MainLayoutFooter from '../layout/MainLayoutFooter.jsx'
import MainLayoutHeader from '../layout/MainLayoutHeader.jsx'

export default class Faqs extends Component {
    render() {
        return (
            <div>
                <MainLayoutHeader />
                <div className="index">
                    <section className="contact-bnr">
                        <h1>Frequently Asked Questions</h1>
                    </section>
                    <section className="faq-content">
                        <div className="container">
                            <div className="faq-section-hold">
                                <h3>About SpotMyCrib</h3>
                                <div className="panel-group" id="accordion1" role="tablist" aria-multiselectable="true">
                                    <div className="panel panel-default">
                                        <a role="button" data-toggle="collapse" data-parent="#accordion1" href="#collapseOne1" aria-expanded="false" aria-controls="collapseOne">
                                            <div className="panel-heading" role="tab" id="headingOne">
                                                <h4 className="panel-title ">
                                                    <span className="green-circle">1</span>
                                                    <p className="position">What is SpotMyCrib?</p>
                                                    <i className="glyphicon glyphicon-menu-down active-arrow" />
                                                </h4>
                                            </div>
                                        </a>
                                        <div id="collapseOne1" className="panel-collapse collapse in" role="tabpanel" aria-labelledby="headingOne">
                                            <div className="panel-body">
                                                <p>Spotmycrib is an honest and open platform to provide you an ultimately safe and secure way make your renting experience an incredibly convenient experience for you. We understand your pain of standing in cold long queues and not getting called for. Say goodbye to your worries as spotmycrib is just a click away to bring together the landlord and the renter.</p>
                                                <p>SpotMyCrib brings renters and property owners together in one&nbsp;transparent platform.</p>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="panel panel-default">
                                        <a className="collapsed" role="button" data-toggle="collapse" data-parent="#accordion1" href="#collapseTwo1" aria-expanded="false" aria-controls="collapseTwo">
                                            <div className="panel-heading" role="tab" id="headingTwo">
                                                <h4 className="panel-title">
                                                    <span className="green-circle">2</span>
                                                    <p className="position">Why do you need it?</p>
                                                    <i className="glyphicon glyphicon-menu-down active-arrow" />
                                                </h4>
                                            </div>
                                        </a>
                                        <div id="collapseTwo1" className="panel-collapse collapse" role="tabpanel" aria-labelledby="headingTwo">
                                            <div className="panel-body">
                                                <p>Your pain in waiting for the call after a long reference is about to end. This is the platform to view and apply to your future home conveniently using your mobile and get screened sooner. This platform provides you the ideal experience like no other.</p>
                                                <p>Save your precious time and valuable money! You don’t need to wait for long. Submit your online application along with your personal credentials and make this process much easier and faster. Get your dream house with just a few clicks. Our online rental payment system is reliable and safe to pay your rent once you are in your home. Monthly payment is digital now.
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="panel panel-default">
                                        <a className="collapsed" role="button" data-toggle="collapse" data-parent="#accordion1" href="#collapseThree1" aria-expanded="false" aria-controls="collapseThree">
                                            <div className="panel-heading" role="tab" id="headingThree">
                                                <h4 className="panel-title">
                                                    <span className="green-circle">3</span>
                                                    <p className="position">How it works?</p>
                                                    <i className="glyphicon glyphicon-menu-down active-arrow" />
                                                </h4>
                                            </div>
                                        </a>
                                        <div id="collapseThree1" className="panel-collapse collapse" role="tabpanel" aria-labelledby="headingThree">
                                            <div className="panel-body">
                                                <p className="hidden-xs">I am a
                                                    <a className="btns transparent-btn mar-left-10" href={FlowRouter.url('estateagent')}>Landlord</a>
                                                    <a className="btns green-btn scroll1 mar-left-10" href={FlowRouter.url('howitworks')}>Renter</a>
                                                </p>
                                                <p className="visible-xs">
                                                    Choose from below options<br />
                                                    <a className="btns transparent-btn mar-left-10" href={FlowRouter.url('estateagent')}>Landlord</a>
                                                    <a className="btns green-btn scroll1 mar-left-10" href={FlowRouter.url('howitworks')}>Renter</a>
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <div className="faq-section-hold pad-btm-60">
                                <h3>Estate Agents/Landlords/Property Owners</h3>
                                <div className="panel-group agent-panel-group" id="accordion" role="tablist" aria-multiselectable="true">
                                    <div className="panel panel-default">
                                        <a role="button" data-toggle="collapse" data-parent="#accordion" href="#collapseOne" aria-expanded="false" aria-controls="collapseOne">
                                            <div className="panel-heading" role="tab" id="headingOne">
                                                <h4 className="panel-title ">
                                                    <span className="green-circle">1</span>
                                                    <p className="position">It is my understanding that current legislation will not allow for bidding that exceeds the permitted rent amount. </p>
                                                    <i className="glyphicon glyphicon-menu-down active-arrow" />
                                                </h4>
                                            </div>
                                        </a>
                                        <div id="collapseOne" className="panel-collapse collapse in" role="tabpanel" aria-labelledby="headingOne">
                                            <div className="panel-body">
                                                <ul>
                                                    <li>We have an option to disable the bidding and have done so.</li>
                                                    <li>We have contacted the RTB: Residential Tenancies Board in Ireland (in writing) and asked them if a tenant offers more rent and a landlord agrees to it - is that legal. They confirmed it is legal if both sides agree to it.</li>
                                                </ul>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="panel panel-default">
                                        <a role="button" data-toggle="collapse" data-parent="#accordion" href="#collapseTwo" aria-expanded="false" aria-controls="collapseOne">
                                            <div className="panel-heading" role="tab" id="headingOne">
                                                <h4 className="panel-title ">
                                                    <span className="green-circle">2</span>
                                                    <p className="position">What would the knock effect be should there be arrears, can warning letters be sent? etc</p>
                                                    <i className="glyphicon glyphicon-menu-down active-arrow" />
                                                </h4>
                                            </div>
                                        </a>
                                        <div id="collapseTwo" className="panel-collapse collapse" role="tabpanel" aria-labelledby="headingOne">
                                            <div className="panel-body">
                                                <ul>
                                                    <li>We can send warning emails/ reminder emails and report on who are due rents, arrears.</li>                                              <li>SpotMyCrib also remembers the history of a tenants arrears, etc</li>
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
                                        <div id="collapseThree" className="panel-collapse collapse" role="tabpanel" aria-labelledby="headingTwo">
                                            <div className="panel-body">
                                                <ul>
                                                    <li>All Data is being held and maintained by Spot My Crib within Europe and the key system ensures the data is being shared within in the terms of the consumer's signup.</li>
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
                                        <div id="collapseFour" className="panel-collapse collapse" role="tabpanel" aria-labelledby="headingThree">
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
                                        <div id="collapseFive" className="panel-collapse collapse" role="tabpanel" aria-labelledby="headingThree">
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
                                <div className="container mar-top-30" style={{textAlign: 'center'}}>
                                    <p>Learn more</p>
                                    <a className="btns transparent-btn mar-left-10" href={FlowRouter.url('estateagent')}>I'm a Landlord</a>
                                    <a className="btns green-btn scroll1 mar-left-10" href={FlowRouter.url('howitworks')}>I'm a Renter</a>
                                </div>
                            </div>
                        </div>{/*container*/}
                    </section>
                </div>

                <footer className="footer-default"><MainLayoutFooter /></footer>
            </div>

        )
    }
}