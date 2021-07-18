import { Meteor } from 'meteor/meteor';
import React, { Component } from 'react';
import MainLayoutFooter from '../layout/MainLayoutFooter.jsx'
import MainLayoutHeader from '../layout/MainLayoutHeader.jsx'

export default class CookiePolicy extends Component {
    render() {
        return (
            <div>
                <MainLayoutHeader />
                <div className="index">
                    <section className="about-bnr">
                        <h1>Cookie Policy</h1>
                    </section>
                    <section className="faq-content cookieconsent-content pad-btm-30">
                        <div className="container">
                            <div className="faq-section-hold">
                                <p>By using this website, you consent to the use of cookies in accordance with the SpotMyCrib.ie Cookie Policy below.<br /><br />SpotMyCrib.ie uses small pieces of data called cookies to help customise your user experience. Learn more about cookies and how you can control them by reading our Cookies Policy.<br /><br />We may update our Cookies Policy to reflect any changes in technology or data protection legislation. Any updates or changes that may affect how we use cookies or how you as a user can manage cookies will appear on this page.</p>
                                <h3>What is a Cookie?</h3>
                                <p>A cookie is a small piece of data sent by a website’s server to your computer or mobile device and stored in your browser (e.g. Google Chrome, Firefox, Internet Explorer etc). It consists of anonymous information, including a unique user identifier. When you revisit a site or navigate between pages, this data is passed from your browser to the site’s server. With this data, the website is able to ‘remember’ your browser, enabling it to retrieve your user preferences, to personalise your visits and to simplify any sign-in procedures.<br /><br />Cookies are intended to improve your user experience by making it easier and faster to navigate through a website. For example, some websites require that you log in to gain access. If such sites did not use cookies, then you would be required to enter your login details every time you navigated to a new page because the website would not be able to remember that you had already logged in.<br /><br />Many websites also use cookies for advertising purposes. For example, certain cookies allow a website to determine if you’ve already seen a particular ad and therefore it may not display that ad on subsequent pages that you visit.<br /><br />All of the information a cookie collects can only be retrieved by the website server that sent the cookie to your browser.</p>
                                <h3>Cookies on SpotMyCrib.ie</h3>
                                <p>We use the following Cookies on sections of SpotMyCrib.ie site and the mobile application:<br /><br />Strictly necessary cookies: These are cookies that are required for the operation of our website. They include, for example, cookies that enable you to log into secure areas of our website.<br /><br />Analytical / Performance Cookies: They are set by SpotMyCrib.ie and third parties, including Comscore and Google Analytics. Performance cookies allow us to collect statistical information about our visitors, such as whether they have visited the site before and the pages they view. This information is gathered anonymously - it does NOT enable us to identify who you are. We use these cookies to determine the kind of content and services our visitors value most, which in turn helps us improve our website and its content.<br /><br />Third Party Cookies: We and third-party vendors, including Google, use first-party cookies and third-party cookies together to inform, optimise and serve ads based on users’ past visits to this website. We use data from Google's Interest-based advertising or 3rd-party audience data (such as age, gender and interests) with Google Analytics to understand who our users are in order to create a better experience for them while visiting our website. We may use Remarketing with Google Analytics to advertise online. Third-party vendors, including Google, show our ads on sites across the Internet.<br /><br />Google Analytics: Users can opt out of Google Analytics for Display Advertising and customise Google Display Network ads using the Ads Settings found here: www.google.com/settings/ads.<br /><br />Functionality cookies: These are used to recognise you when you return to our website. This enables us to personalise our content for you, greet you by name and remember your preferences.<br /><br />Targeting cookies: These cookies record your visit to our website, the pages you have visited and the links you have followed. We will use this information to make our website and the advertising displayed on it more relevant to your interests. We may also share this information with third parties for this purpose.<br /><br />We do not control which cookies are set by third parties or how the cookie information is used – a cookie can only be accessed by the party who set it. For more information on these cookies, please visit the third-party website.</p>
                                <h3>Controlling cookies</h3>
                                <p>Cookies are meant to improve the user experience, but some users prefer to set restrictions on the types of cookies that can be stored on their computer or mobile phone.<br /><br />By modifying your browser preferences, you have the choice to accept all cookies, to be notified when a cookie is set or to reject all cookies.<br /><br />It is important to note that you will lose some functions of a website if you choose to restrict or disable its cookies.</p>
                                <br />
                                <p>Have more questions? <a href={FlowRouter.url('contactus')}>Submit a request</a></p>
                            </div>
                        </div>
                    </section>
                </div>

                <footer className="footer-default"><MainLayoutFooter /></footer>
            </div>

        )
    }
}