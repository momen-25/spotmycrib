import { Meteor } from 'meteor/meteor';
import React, { Component } from 'react';
import MainLayoutFooter from '../layout/MainLayoutFooter.jsx'
import MainLayoutHeader from '../layout/MainLayoutHeader.jsx'

export default class Privacy extends Component {
    render() {
        return (
            <div>
                <MainLayoutHeader />
                <div className="index">
                    <section className="contact-bnr">
                        <h1>Privacy Policy</h1>
                    </section>
                    <section className="faq-content conditions">
                        <div className="container">
                            <div className="pad-top-btm-30 for-font">
                                {/*<h3>SpotMyCrib Terms &amp; Conditions</h3>*/}
                                <div className="color-grey">
                                    <div className="innerText">Your privacy is important to us. This privacy policy explains what personal data SpotMyCrib collects from you, through our interactions with you and through our products, and how we use that data.
                                        <br /></div>
                                    <span id="infoCo" /><br />
                                    <div className="innerText">It is compiled to better serve those who are concerned with how their 'Personally Identifiable Information' (PII) is being used online. PII, as described in privacy law and information security, is information that can be used on its own or with other information to identify, contact, or locate a single person, or to identify an individual in context. Please read our privacy policy carefully to get a clear understanding of how we collect, use, protect or otherwise handle your Personally Identifiable Information in accordance with our website.<br /></div>
                                    <span id="infoCo" /><br />
                                    <div className="color-black"><strong>What personal information do we collect from the people that visit website?</strong></div>
                                    <br />
                                    <ol>
                                        <li>We collect and maintain personal contact details which includes contact name, job title, email address, telephone number, and company name. If the customer is an individual sole proprietor or unaffiliated with any commercial or non-profit entity, it's possible that additional information such as street address and credit cardholder data is included.</li>
                                        <li>All customer data, that is, data controlled by our customers which we process according to their instructions, is appropriately classified as Confidential. This confidential data could contain personally-identifiable information about our Customers' End Users, which we cannot identify because it is encrypted and not accessible by SpotMyCrib staff.</li>
                                        <li>We also collect personal identity information as references to users application to a property. For example passport ID, PPS, resume or other details are collected to help you with your application process.</li>
                                        <li>More covered on <a href={FlowRouter.url('gdpr')}>Data Protection</a> page.</li>
                                    </ol>
                                    <br />
                                    <div className="color-black"><strong>When do we collect information?</strong></div>
                                    <br />
                                    <div className="innerText">We collect information from you when you register on our site, applying for a letting, upload references to your profile, browse through the site, search for properties, fill out a form or enter information on our site.</div>
                                    <br /> <span id="infoUs" /><br />
                                    <div className="color-black"><strong>How do we use your information? </strong></div>
                                    <br />
                                    <div className="innerText"> We may use the information we collect from you when you register, apply for a letting, sign up for our newsletter, respond to a survey or marketing communication, surf the website, or use certain other site features in the following ways:<br /><br /></div>
                                    <div className="color-black">&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; <strong>•</strong> As a reference to your letting application process, your references and personal info will only be shared with the landlord or the agents who posted the property. Your information will not be shared with anyone else and will be kept confidential. </div>
                                    <div className="innerText">&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; <strong>•</strong> To personalize your experience and to allow us to deliver the type of content and product offerings in which you are most interested.</div>
                                    <div className="innerText">&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; <strong>•</strong> To improve our website in order to better serve you.</div>
                                    <div className="innerText">&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; <strong>•</strong> To quickly process your transactions.</div>
                                    <div className="innerText">&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; <strong>•</strong> To send periodic emails regarding your rental application, profile, property alerts or other similar services.</div>
                                    <div className="innerText">&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; <strong>•</strong> To follow up with them after correspondence (live chat, email or phone inquiries)</div>
                                    <span id="infoPro" /><br />
                                    <div className="color-black"><strong>How do we protect your information?</strong></div>
                                    <br />
                                    <div className="innerText">We do not use vulnerability scanning and/or scanning to PCI standards.</div>
                                    <div className="innerText">We only provide articles and information. We never ask for credit card numbers.</div>
                                    <div className="innerText">We do not use Malware Scanning.<br /><br /></div>
                                    <div className="innerText">Your personal information is contained behind secured networks and is only accessible by a limited number of persons who have special access rights to such systems, and are required to keep the information confidential. In addition, all sensitive/credit information you supply is encrypted via Secure Socket Layer (SSL) technology. </div>
                                    <br />
                                    <div className="innerText">We implement a variety of security measures when a user enters, submits, or accesses their information to maintain the safety of your personal information.</div>
                                    {/*<br>*/}
                                    {/*<div class='innerText'>For your convenience we may store your credit card information kept for more than 60 days in order to expedite future orders, and to automate the billing process.</div>*/}
                                    <br /><span id="coUs" /><br />
                                    <div className="color-black"><strong>How to Access &amp; Control Your Personal Data?</strong></div>
                                    <br />
                                    <div className="innerText">You can view, edit, or delete your personal data online for your profile. You can always choose whether you wish to receive promotional email, SMS messages, telephone calls and postal mail from SpotMyCrib. You can also opt out from receiving interest-based advertising from SpotMyCrib by clicking on unsubscribe from our emails or by writing to us at <a href="mailto:support@spotmycrib.com">support@spotmycrib.com</a> .</div><br />
                                    <br /><span id="coUs" /><br />
                                    <div className="color-black"><strong>Do we use 'cookies'?</strong></div>
                                    <br />
                                    <div className="innerText">Yes. Cookies are small files that a site or its service provider transfers to your computer's hard drive through your Web browser (if you allow) that enables the site's or service provider's systems to recognize your browser and capture and remember certain information. For instance, we use cookies to help us remember and process the items in your shopping cart. They are also used to help us understand your preferences based on previous or current site activity, which enables us to provide you with improved services. We also use cookies to help us compile aggregate data about site traffic and site interaction so that we can offer better site experiences and tools in the future.</div>
                                    <div className="innerText"><br /><strong>We use cookies to:</strong></div>
                                    <div className="innerText">&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; <strong>•</strong> Understand and save user's preferences for future visits.</div>
                                    <div className="innerText"><br />You can choose to have your computer warn you each time a cookie is being sent, or you can choose to turn off all cookies. You do this through your browser settings. Since browser is a little different, look at your browser's Help Menu to learn the correct way to modify your cookies.<br /></div>
                                    <br />
                                    <div className="innerText">If you turn cookies off, Some of the features that make your site experience more efficient may not function properly.It won't affect the user's experience that make your site experience more efficient and may not function properly.</div><br />
                                    <div className="innerText">More information about out cookies are in our <a href={FlowRouter.url('cookiepolicy')}>Cookie Policy</a> page.</div>
                                    <br /><span id="trDi" /><br />
                                    <div className="color-black"><strong>Third-party disclosure</strong></div>
                                    <br />
                                    <div className="innerText"><strong>Do we disclose the information we collect to Third-Parties?</strong></div>
                                    <div className="innerText">
                                        We sell,trade, or otherwise transfer to outside parties your name, address,city,town, any form or online contact identifier email, name of chat account etc., screen name or user names, phone number
                                        <div className="innerText"><br /><strong>We engage in this practice because,:</strong></div>
                                        <div className="innerText">Users references and personal details uploaded in profile will only be shared with landlord or agents, as a proof of your application. </div>
                                        Personally Identifiable Information.
                                    </div>
                                    <br /><span id="trLi" /><br />
                                    <div className="color-black"><strong>Third-party links</strong></div>
                                    <br />
                                    <div className="innerText">Occasionally, at our discretion, we may include or offer third-party products or services on our website. These third-party sites have separate and independent privacy policies. We therefore have no responsibility or liability for the content and activities of these linked sites. Nonetheless, we seek to protect the integrity of our site and welcome any feedback about these sites.</div>
                                    <span id="gooAd" /><br />
                                    <div className="blueText"><strong>Google</strong></div>
                                    <br />
                                    <div className="innerText">Google's advertising requirements can be summed up by Google's Advertising Principles. They are put in place to provide a positive experience for users. https://support.google.com/adwordspolicy/answer/1316548?hl=en <br /><br /></div>
                                    <div className="innerText">We use Google AdSense Advertising on our website.</div>
                                    <div className="innerText"><br />Google, as a third-party vendor, uses cookies to serve ads on our site. Google's use of the DART cookie enables it to serve ads to our users based on previous visits to our site and other sites on the Internet. Users may opt-out of the use of the DART cookie by visiting the Google Ad and Content Network privacy policy.<br /></div>
                                    <div className="innerText"><br /><strong>We have implemented the following:</strong></div>
                                    <br />
                                    <div className="innerText">We, along with third-party vendors such as Google use first-party cookies (such as the Google Analytics cookies) and third-party cookies (such as the DoubleClick cookie) or other third-party identifiers together to compile data regarding user interactions with ad impressions and other ad service functions as they relate to our website. </div>
                                    <div className="innerText"><br />
                                        <strong>Opting out:</strong>
                                        <br />
                                        Users can set preferences for how Google advertises to you using the Google Ad Settings page. Alternatively, you can opt out by visiting the Network Advertising Initiative Opt Out page or by using the Google Analytics Opt Out Browser add on.
                                    </div>
                                    <span id="calOppa" /><br />
                                    <div className="blueText"><strong>California Online Privacy Protection Act</strong></div>
                                    <br />
                                    <div className="innerText">CalOPPA is the first state law in the nation to require commercial websites and online services to post a privacy policy.  The law's reach stretches well beyond California to require any person or company in the United States (and conceivably the world) that operates websites collecting Personally Identifiable Information from California consumers to post a conspicuous privacy policy on its website stating exactly the information being collected and those individuals or companies with whom it is being shared. -  See more at: http://consumercal.org/california-online-privacy-protection-act-caloppa/#sthash.0FdRbT51.dpuf<br /></div>
                                    <div className="innerText"><br /><strong>According to CalOPPA, we agree to the following:</strong><br /></div>
                                    <div className="innerText">Users can visit our site anonymously.</div>
                                    <div className="innerText">Once this privacy policy is created, we will add a link to it on our home page or as a minimum, on the first significant page after entering our website.<br /></div>
                                    <div className="innerText">Our Privacy Policy link includes the word 'Privacy' and can easily be found on the page specified above.</div>
                                    <div className="innerText"><br />You will be notified of any Privacy Policy changes:</div>
                                    <div className="innerText">&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; <strong>•</strong> On our Privacy Policy Page<br /></div>
                                    <div className="innerText">Can change your personal information:</div>
                                    <div className="innerText">&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; <strong>•</strong> By logging in to your account</div>
                                    <div className="innerText"><br /><strong>How does our site handle Do Not Track signals?</strong><br /></div>
                                    <div className="innerText">We honor Do Not Track signals and Do Not Track, plant cookies, or use advertising when a Do Not Track (DNT) browser mechanism is in place. </div>
                                    <div className="innerText"><br /><strong>Does our site allow third-party behavioral tracking?</strong><br /></div>
                                    <div className="innerText">It's also important to note that we do not allow third-party behavioral tracking</div>
                                    <span id="coppAct" /><br />
                                    <div className="blueText"><strong>COPPA (Children Online Privacy Protection Act)</strong></div>
                                    <br />
                                    <div className="innerText">When it comes to the collection of personal information from children under the age of 13 years old, the Children's Online Privacy Protection Act (COPPA) puts parents in control.  The Federal Trade Commission, United States' consumer protection agency, enforces the COPPA Rule, which spells out what operators of websites and online services must do to protect children's privacy and safety online.<br /><br /></div>
                                    <div className="innerText">We do not specifically market to children under the age of 13 years old.</div>
                                    <div className="innerText">Do we let third-parties, including ad networks or plug-ins collect PII from children under 13?</div>
                                    <span id="ftcFip" /><br />
                                    <div className="blueText"><strong>Fair Information Practices</strong></div>
                                    <br />
                                    <div className="innerText">The Fair Information Practices Principles form the backbone of privacy law in the United States and the concepts they include have played a significant role in the development of data protection laws around the globe. Understanding the Fair Information Practice Principles and how they should be implemented is critical to comply with the various privacy laws that protect personal information.<br /><br /></div>
                                    <div className="innerText"><strong>In order to be in line with Fair Information Practices we will take the following responsive action, should a data breach occur:</strong></div>
                                    <div className="innerText">&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; <strong>•</strong> Within 7 business days</div>
                                    <div className="innerText">We will notify the users via in-site notification</div>
                                    <div className="innerText">&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; <strong>•</strong> Within 7 business days</div>
                                    <div className="innerText"><br />We also agree to the Individual Redress Principle which requires that individuals have the right to legally pursue enforceable rights against data collectors and processors who fail to adhere to the law. This principle requires not only that individuals have enforceable rights against data users, but also that individuals have recourse to courts or government agencies to investigate and/or prosecute non-compliance by data processors.</div>
                                    <br />
                                    <p>Have more questions? <a href={FlowRouter.url('contactus')}>Submit a request</a></p>
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