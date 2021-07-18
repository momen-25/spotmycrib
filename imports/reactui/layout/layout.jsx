import React, { Component } from 'react';
import MainLayoutFooter from './MainLayoutFooter.jsx'
import MainLayoutHeader from './MainLayoutHeader.jsx'

export default class MainLayout extends Component {
    render() {
        return (
            <div>
                <MainLayoutHeader />
                <main role="main" id="main">
                    {this.props.content}
                </main>
                <footer className="footer-default"><MainLayoutFooter /></footer>
            </div>
        );
    }
};