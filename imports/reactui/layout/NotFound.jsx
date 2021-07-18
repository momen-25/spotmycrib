import {Component} from "react";
import MainLayoutHeader from "./MainLayoutHeader";
import MainLayoutFooter from "./MainLayoutFooter";
import React from "react";

export default class NotFound extends Component {
    render() {
        return (
            <div>
                <MainLayoutHeader />
                <main role="main" id="main">
                    <div className="container text-center mar-top-20 pad-btm-30">
                        <div className="filter-holder">
                            <div className="mar-top-30">
                                <h2>Page Not Found</h2><br/>
                                <button className="blue-btn btns backBtn" type="button">Try again</button>
                            </div>
                        </div>
                    </div>
                </main>
                <footer className="footer-default"><MainLayoutFooter /></footer>
            </div>
        );
    }
};