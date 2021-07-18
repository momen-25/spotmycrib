import { Meteor } from 'meteor/meteor';
import React, { Component } from 'react';
import MainLayoutFooter from '../layout/MainLayoutFooter.jsx'
import MainLayoutHeader from '../layout/MainLayoutHeader.jsx'

export default class Team extends Component {
    render() {
        return (
            <div>
                <MainLayoutHeader />
                <div className="index">
                    <section className="about-bnr">

                        <h1>Our Team</h1>

                    </section>
                    <section className="abt-content1">
                        <div className="container text-center" style={{maxWidth: 750}}>





                        </div>
                    </section>
                </div>
                <footer className="footer-default"><MainLayoutFooter /></footer>
            </div>

        )
    }
}