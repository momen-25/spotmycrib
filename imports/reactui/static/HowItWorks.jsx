import { Meteor } from 'meteor/meteor';
import React, { Component } from 'react';
import MainLayoutFooter from '../layout/MainLayoutFooter.jsx'
import MainLayoutHeader from '../layout/MainLayoutHeader.jsx'

export default class HowItWorks extends Component {
    render() {
        return (
            <div>
                <MainLayoutHeader />
                <div className="index">
                    <section className="about-bnr">
                        <h1>How it Works</h1>
                    </section>
                    <section id="how-works" className="sec-holder how-it-works">
                        <div className="container">
                            {/*<h2>How it works</h2>*/}
                            {/*<span class="bottom-line"></span>*/}
                            {/*<div class="">*/}
                            {/*<a id="video" class="oval-btn green-btn cursor"><span class="fa fa-play-circle-o play-icon"></span>Watch the video</a>*/}
                            {/*</div>*/}
                            <ul className="mar-top-30">
                                <li>
                                    <h6 className="pad-btm-30">Search Property</h6>
                                    <img src={cdnPath("/images/how-it-works/search-and-find-property-apartment-flat.png")} alt="Search and find your rental property" className="pad-btm-30" />
                                    <p>
                                    Search and find an apartment/house you like from our <a href={FlowRouter.url('home')+'#searchform'}>browse form</a>.
Or choose your county from our <a href={FlowRouter.url('home')+'#homeLinks'}>county list</a> in our home page.
                                    </p>
                                </li>
                                <li>
                                    <h6 className="pad-btm-30">Set Your Rent</h6>
                                    <img src={cdnPath("/images/how-it-works/set-your-rent-apartment.png")} alt="Apply and set your rent for Apartment" className="pad-btm-30" />
                                    <p>Make your offer for the house and click apply. Remember to upload all your references in your profile.</p>
                                </li>
                                <li>
                                    <h6 className="pad-btm-30">Confirm your Home</h6>
                                    <img src={cdnPath("/images/how-it-works/confirm-your-rent-in-dublin.png")} alt="Confirm your rental" className="pad-btm-30" />
                                    <p>Landlord chooses a tenant based on your references and your offer. If you are chosen, you would receive a confirmation email. </p>
                                </li>
                            </ul>
                        </div>
                        <div className="container mar-top-30">
                            <a href={FlowRouter.url('faqs')} className="green-btn btns " type="button">Learn more</a>
                        </div>
                    </section>
                </div>
                <footer className="footer-default"><MainLayoutFooter /></footer>
            </div>

        )
    }
}