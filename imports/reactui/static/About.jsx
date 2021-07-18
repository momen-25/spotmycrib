import { Meteor } from 'meteor/meteor';
import React, { Component } from 'react';
import MainLayoutFooter from '../layout/MainLayoutFooter.jsx'
import MainLayoutHeader from '../layout/MainLayoutHeader.jsx'

export default class About extends Component {
    render() {
        return (
        <div>
            <MainLayoutHeader />
            <div className="index">
                <section className="about-bnr">

                    <h1>About Us</h1>

                </section>
                <section className="abt-content1">
                    <div className="container text-center" style={{maxWidth: 750}}>
                        <h2 className="no-capitalize">Renting in Ireland is a pain, let us make it easy.</h2>
                        <span className="bottom-line"></span>
                        <q className="color-grey" style={{display: 'block', marginBottom: 20}}>An average tenant spends
                            around 1 month of their time, viewing 10+ houses and submitting manual printed references to
                            find their rental home. In the same way, a landlord shows their letting to 50+ potential
                            tenants, manually verifying all of their paper refrences before finalising one of them. </q>
                        <h6>We are spotmycrib. A couple of months ago, we had an intuition : A painless renting system.
                            One where people can find their dream home for rent without any pain, unnecessary viewings
                            and disappointment. That gave us our inspiration "Renting made digital". That means both
                            landlords and tenants can use spotmycrib to save their time and money - For the better. We
                            are just getting started. So, join us. <br/> Write to us at <a
                                href={FlowRouter.url('contactus')}>Contact</a></h6>
                    </div>
                </section>
            </div>
            <footer className="footer-default"><MainLayoutFooter /></footer>
        </div>

        )
    }
}