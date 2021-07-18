import { Meteor } from 'meteor/meteor';
import React, { Component } from 'react';
import MainLayoutFooter from '../layout/MainLayoutFooter.jsx'
import MainLayoutHeader from '../layout/MainLayoutHeader.jsx'

export default class Gdpr extends Component {
    render() {
        return (
            <div>
                <MainLayoutHeader />
                <div className="index">
                    <section className="contact-bnr">
                        <h1>Data Protection / GDPR</h1>
                    </section>
                    <section className="faq-content conditions">
                        <div className="container">
                            <div className="pad-top-btm-30 for-font">
                                <h3>EU General Data Protection Regulation (GDPR)</h3>
                                <div className>
                                    <p>
                                        The EU General Data Protection Regulation (GDPR) will set a new standard for how companies use and protect EU citizens' data. It will take effect from May 2018.
                                    </p><p>
                                    At SpotMyCrib, we've been working hard to prepare for GDPR, to ensure that we fulfil its obligations and maintain our transparency about user and customer data and how we use data.
                                </p><p>
                                    Here's an overview of GDPR, and how we are preparing for it at SpotMyCrib.
                                </p>
                                    <h3>Overview</h3>
                                    <h4>What is GDPR?</h4>
                                    <p>The GDPR is a comprehensive European data protection law that provides significant data rights for protecting the privacy of natural persons residing in the EU. SpotMyCrib is committed to ensuring that our platform is GDPR-compliant when the regulation becomes enforceable on May 25, 2018.</p>
                                    <h4>How is GDPR applicable to SpotMyCrib?</h4>
                                    <p>We collect data from our users and customers to better serve them. We also take ID proofs, references from our users as a supporting document for their letting application. We respect everyone's personal information, and it makes perfect sense for us to have one privacy policy and set of procedures to protect everyone's interests, including compliance with applicable local laws.</p>
                                    <h4>What personal information does SpotMyCrib process on behalf of its customers?</h4>
                                    <ol>
                                        <li>We collect and maintain personal contact details which includes contact name, job title, email address, telephone number, and company name. If the customer is an individual sole proprietor or unaffiliated with any commercial or non-profit entity, it's possible that additional information such as street address and credit cardholder data is included.</li>
                                        <li>All customer data, that is, data controlled by our customers which we process according to their instructions, is appropriately classified as Confidential. This confidential data could contain personally-identifiable information about our Customers' End Users, which we cannot identify because it is encrypted and not accessible by SpotMyCrib staff.</li>
                                        <li>We also collect personal identity information as references to users application to a property. For example passport ID, PPS, resume or other details are collected to help you with your application process.</li>
                                        <li>More covered on <a href={FlowRouter.url('privacy')}>privacy page</a>.</li>
                                    </ol>
                                    <h4>What are Data Controllers and Data Processors?</h4>
                                    <p>GDPR is designed to ensure protection of the privacy rights of data subjects. Data subjects are people from whom or about whom you collect information in connection with your business and its operations. Your obligations with regard to data subjects and their personal data depend on whether you're considered a controller or a processor under GDPR.</p>
                                    <ul>
                                        <li>Data Controllers</li>
                                    </ul>
                                    <p>GDPR defines a data controller as "the natural or legal person, public authority, agency or another body which, alone or jointly with others, determines the purposes and means of the processing of personal data." In other words, if your organization processes personal data for your own organization's purposes and needs-not merely as a service provider acting on behalf of another organization-then you are likely to be a data controller.</p>
                                    <p>SpotMyCrib is a Data Controller for our direct customers.</p>
                                    <ul>
                                        <li>Data Processor</li>
                                    </ul>
                                    <p>Businesses or organizations that process personal data solely on behalf of, and as directed by, data controllers are data processors. In other words, when a data controller outsources a data processing function to another entity, that other entity is generally a data processor.</p>
                                    <p>For purposes of the GDPR, SpotMyCrib is also considered a Data Processor for our customers' end-users.</p>
                                    <h4>What steps is SpotMyCrib taking to ensure GDPR compliance?</h4>
                                    <ol>
                                        <li>We conducted an internal review of all data our data points, how its collected, stored and how it's being used.</li>
                                        <li>We conducted an internal Data Protection Impact Assessment (DPIA) to discover what information we collect, and how it's being used.</li>
                                        <li>We will provide users and customers with resources and helpful information about privacy and GDPR, including whitepapers and blog posts.</li>
                                        <li>We will announce an update of our Privacy Policy for GDPR.</li>
                                    </ol>
                                    <h3>Our Customers and the GDPR</h3>
                                    <h4>As a SpotMyCrib customer, what are my main responsibilities under the GDPR?</h4>
                                    <p>SpotMyCrib customers are responsible for protecting the personal information of their end users, as Data Controllers and/or Data Exporters.</p>
                                    <p>Your responsibilities under GDPR will depend on the nature of your business and your personal data processing activities.  Nonetheless, broadly speaking, GDPR requires that personal data be:</p>
                                    <ol>
                                        <li>Processed lawfully, fairly and in a transparent manner,</li>
                                        <li>Collected for specified, explicit and legitimate purposes and not further processed in a manner incompatible with those purposes,</li>
                                        <li>Adequate, relevant, and limited to what is necessary for achieving those purposes,</li>
                                        <li>Accurate and kept up to date</li>
                                        <li>Stored no longer than necessary to achieve the purposes for which it was collected, and</li>
                                        <li>Properly secured against accidental loss, destruction or damage.</li>
                                    </ol>
                                    <p>It is our customer's responsibility to obtain the EXPRESS CONSENT of individual Data Subjects (for example, tenants, applications) to transfer their Personal Data to SpotMyCrib as a Data Processor and/or Data Importer. SpotMyCrib processes all such information as Confidential Data in accordance with the terms of our Data Processing Agreement and/or this Privacy Policy.</p>
                                    <h4>What actions does our customers need to take?</h4>
                                    <ol>
                                        <li>In addition to seeking independent legal advice regarding your obligations under the GDPR, here are some tips to get you started:</li>
                                        <li>Educate yourself on the provisions of the <a href="https://gdpr-info.eu/" target="_blank">GDPR</a> to understand how they may differ from your existing data protection obligations and practices.</li>
                                        <li>If you don't have dedicated data privacy or security personnel in-house, consider appointing a directly responsible individual (DRI) or small team to manage your company's GDPR compliance efforts.</li>
                                        <li>Create an up-to-date inventory of personal data that you collect and manage.</li>
                                        <li>Create a list of vendors who you send data to (analytics tools, CRMs, email tools, etc.), and understand whether they are a controller or a processor. Then, determine what their obligations are, and make sure they have a plan to be ready for the GDPR.</li>
                                        <li>Develop a plan for obtaining and managing <a href="https://gdpr-info.eu/art-7-gdpr/" target="_blank">consent</a> in accordance with the GDPR or establish other lawful grounds for using personal data.</li>
                                        <li>Determine if your company needs to appoint a <a href="https://gdpr-info.eu/art-37-gdpr/" target="_blank">Data Protection Officer</a> (DPO). For public authorities, and companies processing large amounts of special categories of personal data, the appointment of a <a href="https://secure.edps.europa.eu/EDPSWEB/edps/EDPS/DPO" target="_blank">data protection officer</a> (DPO) is mandatory. Organizations will be expected to hire someone who has real expertise and knowledge of the latest laws and practices.</li>
                                        <li>Becoming GDPR compliant takes time, and will require you to rethink how you collect and manage customer data. If you have any questions about the GDPR or want to learn how SpotMyCrib can help you prepare, please let us know.</li>
                                    </ol>
                                    <h4>What are the penalties for non-compliance with GDPR?</h4>
                                    <p>Depending on the nature of the violation, data protection authorities may issue fines or penalties for non-compliance up to € 20 million or 4% of global revenue.</p>
                                    <h4>Where can I get more information about GDPR?</h4>
                                    <ol>
                                        <li>From the original source: The Council of the European Union where the legislation was approved. <a href="https://publications.europa.eu/en/publication-detail/-/publication/c7d157e6-fccd-11e7-b8f5-01aa75ed71a1/language-en/format-PDF/source-62885347" target="_blank">https://publications.europa.eu/en/publication-detail/-/publication/c7d157e6-fccd-11e7-b8f5-01aa75ed71a1/language-en/format-PDF/source-62885347</a></li>
                                        <li>For more general GDPR readiness portals, we suggest:&nbsp;<a href="https://www.eugdpr.org/" target="_blank">https://www.eugdpr.org/</a>
                                            <ul>
                                                <li>GDPR FAQs: <a href="https://www.eugdpr.org/gdpr-faqs.html" target="_blank">https://www.eugdpr.org/gdpr-faqs.html</a></li>
                                            </ul>
                                        </li>
                                        <li>From leading Privacy advocacy organizations:
                                            <ol>
                                                <li><a href="https://iapp.org/resources/topics/eu-gdpr/" target="_blank">https://iapp.org/resources/topics/eu-gdpr/</a></li>
                                                <li><a href="https://www.epic.org/international/eu_general_data_protection_reg.html" target="_blank">https://www.epic.org/international/eu_general_data_protection_reg.html</a></li>
                                                <li><a href="http://www.truste.com" target="_blank">www.truste.com</a></li>
                                            </ol>
                                        </li>
                                    </ol>
                                    <p>Have more questions? <a href={FlowRouter.url('contactus')} target="_blank">Submit a request</a></p>
                                </div>
                            </div>
                        </div>
                    </section>
                </div>
                <footer className="footer-default"><MainLayoutFooter /></footer>
            </div>

        )
    }
}