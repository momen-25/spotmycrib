import { Meteor } from 'meteor/meteor';
import React, { Component } from 'react';
import MainLayoutFooter from '../layout/MainLayoutFooter.jsx'
import MainLayoutHeader from '../layout/MainLayoutHeader.jsx'

var TxtType = function(el, toRotate, period) {
    this.toRotate = toRotate;
    this.el = el;
    this.loopNum = 0;
    this.period = parseInt(period, 10) || 2000;
    this.txt = '';
    this.tick();
    this.isDeleting = false;
};

TxtType.prototype.tick = function() {
    var i = this.loopNum % this.toRotate.length;
    var fullTxt = this.toRotate[i];

    if (this.isDeleting) {
        this.txt = fullTxt.substring(0, this.txt.length - 1);
    } else {
        this.txt = fullTxt.substring(0, this.txt.length + 1);
    }

    this.el.innerHTML = '<span class="wrap">'+this.txt+'</span>';

    var that = this;
    var delta = 200 - Math.random() * 100;

    if (this.isDeleting) { delta /= 2; }

    if (!this.isDeleting && this.txt === fullTxt) {
        delta = this.period;
        this.isDeleting = true;
    } else if (this.isDeleting && this.txt === '') {
        this.isDeleting = false;
        this.loopNum++;
        delta = 500;
    }

    setTimeout(function() {
        that.tick();
    }, delta);
};
export default class Careers extends Component {
    componentDidMount(){
        var elements = document.getElementsByClassName('typewrite');
        for (var i=0; i<elements.length; i++) {
            var toRotate = elements[i].getAttribute('data-type');
            var period = elements[i].getAttribute('data-period');
            if (toRotate) {
                new TxtType(elements[i], JSON.parse(toRotate), period);
            }
        }
        // INJECT CSS
        var css = document.createElement("style");
        css.type = "text/css";
        css.innerHTML = ".typewrite > .wrap { border-right: 0.08em solid #fff}";
        document.body.appendChild(css);
    }
    render() {
        return (
            <div>
                <MainLayoutHeader />
                <div className="index">
                    <section className="contact-bnr">
                        <h1>We are looking for talented <a className="typewrite" data-period={2000} data-type="[ &quot;marketers&quot;, &quot;sales&quot;, &quot;engineers&quot; ]">
                            <span className="wrap" />
                        </a></h1>
                    </section>
                    <section className="contact-content career-content">
                        <div className="container">
                            <h3 className="bnr-txt">Join our team in Dublin to transform the online real estate industry. Build tools that help hundreds of people find their dream home everyday. </h3><br />
                            <p style={{fontSize: 14}}>Why wait? tell us about you and why you want to join us. </p><br />
                            <a href="https://goo.gl/forms/nYxSp8YmuyMYTMEc2" className="btns blue-btn">Apply</a>
                        </div>
                    </section>
                </div>
                <footer className="footer-default"><MainLayoutFooter /></footer>
            </div>

        )
    }
}