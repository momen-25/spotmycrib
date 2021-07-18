import { Meteor } from 'meteor/meteor';
import React, { Component } from 'react';
import { withTracker } from 'meteor/react-meteor-data';

import MainLayoutFooter from '../layout/MainLayoutFooter.jsx'
import MainLayoutHeader from '../layout/MainLayoutHeader.jsx'

import { Collections } from  '../../api/collections.js'
if(Meteor.isClient)Session.set('subscriptionsReady',false);

let countsCollection = null;
function dateFormat(text){
    var date = new Date(text)
    if(date.toString() == "Invalid Date")return 'N/A';
    return  date.toDateString();
}

class Pagination extends Component {

    constructor(props) {
        super(props);
    }

    componentDidMount() {
        // console.log(this.props)
    }
    
    render() {
        const self = this;
        return (
        <nav>
            <ul className="pagination">
                <li className={"page-item " +self.props.pagination.prevPage.disabled}>
                    <a 
                    className="page-link" 
                    href={self.props.pagination.prevPage.href} 
                    tabIndex="-1"
                    onClick={self.props.handleChoosePage.bind(self, self.props.pagination.prevPage.prevPageNo, self.props.parent)}
                    >{self.props.pagination.prevPage.text}
                    </a>
                </li>
                {self.props.pagination.pages.map((page, i) => {
                    if(typeof page.current !== 'undefined' && page.current) {
                        return (
                            <li key={i} className="page-item active">
                                <a className="page-link" href={page.href}>{page.text} <span className="sr-only">(current)</span></a>
                            </li>
                        );
                    } else {
                        return (
                           <li key={i} className="page-item">
                            <a 
                            className="page-link" 
                            onClick={self.props.handleChoosePage.bind(self, page.text, self.props.parent)}
                            href={page.href}
                            >{page.text}
                            </a>
                           </li>
                        );
                    }
                })}
                <li className={"page-item " + self.props.pagination.nextPage.disabled}>
                    <a 
                    className="page-link" 
                    href={self.props.pagination.nextPage.href}
                    onClick={self.props.handleChoosePage.bind(self, self.props.pagination.nextPage.nextPageNo, self.props.parent)}
                    >{self.props.pagination.nextPage.text}
                    </a>
                </li>
            </ul>
        </nav>
        )
    }
}

class BlogHome extends Component {

    constructor(props) {
        super(props);

        let pBlogs = props.blogs; if(!pBlogs)pBlogs = [];
        let pTotalCount = props.totalCount; if(!pTotalCount)pTotalCount = 0;
        let pPagination = props.pagination; if(!pPagination)pPagination = 0;
        this.state = {
            blogs: pBlogs,
            totalCount: pTotalCount,
            pagination: pPagination,
        };
        this.propsListHTML = '';
        this.isServerSSRReq = '';
    }

    componentWillReceiveProps(nextProps) {
        this.setState({
            blogs: nextProps.blogs,
            totalCount: nextProps.totalCount,
            pagination: nextProps.pagination
        });
    }

    componentWillMount() {}

    componentDidMount() {
        const self = this;
        setTimeout(function(){
            try {
                jQuery("html,body").animate({scrollTop: 0}, 250);
            } catch (e) {
                document.body.scrollTop = document.documentElement.scrollTop = 0;
            }
        },500)
    }
    componentDidUpdate() {}
    handleChoosePage(page, component) {
        if (typeof page == "undefined") return

        // var data = getSlugData();
        // var slug = generateSlug(data);
        //
        // FlowRouter.go('/b/:slug/:pageno?', {slug: slug[0], pageno: page}, slug[1]);
        //
        // component.setState({pagination: pagination()});
    }

    propGrid() {
        const self = this;
        let blogImage = '';
        return (
            <div className="row">
                {self.state.blogs.map((blog, i) => {
                    if(blog.image){
                        let tmp = blog.image.split('?');
                        blogImage = tmp[0]+"?resize=200%2C140";
                    }else{
                        blogImage='';
                    }
                    return (
                        <section key={i} className="main-holder border-top mar-btm-10" id>
                            <div className="container">
                                <div className="act-box">
                                    <div className="background-white">
                                        <div className="logo-holder-div" style={{padding: '10px 20px'}}>
                                            <div className="logo-holder">
                                                <ul>
                                                    <li>
                                                        <a href={FlowRouter.url('blogdetail', {slug: blog.slug})}>
                                                            <h3 className="pad-btm-0" dangerouslySetInnerHTML={{__html: blog.title}}></h3>
                                                        </a>
                                                    </li>
                                                </ul>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="apt-info1 background-white clearfix">
                                        <div className="media">
                                            { blogImage ?
                                                (
                                                <a className="pull-left" href={FlowRouter.url('blogdetail', {slug: blog.slug})}>
                                                    <img className="media-object" src={blogImage} alt={blog.title}/>
                                                </a>
                                                )
                                                :
                                                (
                                                <img src={cdnPath("/images/no-photo.png")}
                                                alt={'Image not available'}
                                                className="img-responsive"/>
                                                )
                                            }

                                            <div className="media-body">
                                                <div className="text-left mar-btm-10" dangerouslySetInnerHTML={{__html: blog.excerpt}}></div>
                                                {/*... <span className="read-more"><a href={FlowRouter.url('blogdetail', {slug: blog.slug})}>Read More &raquo;</a></span>*/}
                                                <ul className="list-inline list-unstyled">
                                                    <li><span><i className="glyphicon glyphicon-calendar" /> {dateFormat(blog.created)} </span></li>
                                                    {/*<li>|</li>*/}
                                                    {/*<li>*/}
                                                        {/*/!* Use Font Awesome http://fortawesome.github.io/Font-Awesome/ *!/*/}
                                                        {/*<span><i className="fa fa-facebook-square" /></span>*/}
                                                        {/*<span><i className="fa fa-twitter-square" /></span>*/}
                                                        {/*<span><i className="fa fa-google-plus-square" /></span>*/}
                                                    {/*</li>*/}
                                                </ul>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </section>
                    );
                })}
            </div>
        )
    }
    mainAllPage(){
        const self = this;
        return (
            <div id="props_list">
                <section className="logo-below-div value-div">
                    <div className="container">
                        <div className="logo-holder-div">
                            <div className="logo-holder">
                                <ul>
                                    <li>
                                        <h1 style={{marginBottom: 10}}>Blog – SpotMyCrib</h1>
                                        <div className="h4-div" style={{paddingBottom: 5}}>Property renting tips, management and much more</div>
                                    </li>
                                </ul>
                            </div>
                        </div>
                    </div>
                </section>

                { self.state.totalCount == 0 && this.props.isSubsLoaded ? (
                    <div className="container text-center mar-top-20 pad-btm-30">
                        <strong>
                            No blogs found.
                        </strong>
                    </div>
                ) : ("")}

                { self.state.totalCount > 0 ? (
                    <section className="paginationArea mar-top-20 ">
                        <div className="container">
                            <div className="row">
                                <div className="col-md-12">
                                    <p className={'mar-btm-20'}>
                                        Found total {self.state.totalCount ? self.state.totalCount : 'no'} articles. Browse the latest property news, renting tips, management and much more. Use the navigation below to find more.
                                    </p>
                                    <Pagination
                                        pagination={self.state.pagination}
                                        handleChoosePage={self.handleChoosePage}
                                        parent={self}
                                    />
                                </div>
                            </div>
                        </div>
                    </section>
                ) : ("")}

                {
                    Meteor.isServer ? (
                        <div id={"isservercheckdiv"}></div>
                    ):""
                }

                { self.state.totalCount > 0 ? (
                <section className="proplist-sec property-list">
                    <div className="container">
                        {this.propGrid()}
                    </div>
                </section>
                ) : ("")}
                { self.state.totalCount > 0 ? (
                    <section className="paginationArea">
                        <div className="container">
                            <div className="row">
                                <div className="col-md-12">
                                    <Pagination
                                        pagination={self.state.pagination}
                                        handleChoosePage={self.handleChoosePage}
                                        parent={self}
                                    />
                                </div>
                            </div>
                        </div>
                    </section>
                ) : ("")}

            </div>
        )
    }

    render() {
    const self = this;
    let totalCount = 0;
    if(Meteor.isClient && this.propsListHTML==""){
        this.propsListHTML = $('#props_list').html()
    }
    if(Meteor.isClient) {
        this.isServerSSRReq = $('#isservercheckdiv').html()
        if (this.isServerSSRReq == "") this.isServerSSRReq = true
        else this.isServerSSRReq = false
    }
    // if(this.propsListHTML) console.log("propsListHTML: "+this.propsListHTML.length)
    return (
            <div>
                <MainLayoutHeader />
                { (this.props.isSubsLoaded && self.state.blogs )  ? (
                        this.mainAllPage()
                    ) :
                    this.isServerSSRReq && this.propsListHTML? (
                        <div dangerouslySetInnerHTML={{__html: this.propsListHTML}}></div>
                    ): (
                        <section className="mar-top-20 mar-btm-20 no-print">
                            <div className="container text-center mar-top-20 pad-btm-30">
                                <div className="filter-holder">
                                    <div className="mar-top-30">
                                        <div className={'h2-div'}>Loading...</div>
                                    </div>
                                </div>
                            </div>
                        </section>
                )}
                <MainLayoutFooter />
            </div>
        )
    }
};

export default withTracker(() => {
    
    function getPaginationData(totalResultsCount,currentPageNo,resultsPerPage) {
        currentPageNo = parseInt(currentPageNo);
        var pages = [], prevPage = {}, nextPage={};
        var pgMin = currentPageNo-4, pgMax = currentPageNo+ 5, maxPages = Math.ceil(totalResultsCount/resultsPerPage);
        if(!Number.isInteger(currentPageNo)){
            return {
                "prevPage":prevPage,
                "pages":pages,
                "nextPage": nextPage
            }
        }
        
        if(pgMin<1)pgMin =1;
        if(pgMax<1)pgMax =1;
        if(maxPages<1)maxPages =1;
        if(pgMin>maxPages)currentPageNo =maxPages;

        let tmp={};let href = '';
        let cRoute = FlowRouter.current().route.name, cParams = FlowRouter.current().params, cQueryParams = FlowRouter.current().queryParams;
        for (var i=pgMin; i<=maxPages;i++){
            cParams.pageno = i;
            tmp = {
                "href": FlowRouter.url(cRoute, cParams, cQueryParams),
                "text": i
            }
            if(i== currentPageNo) {
                tmp['href'] = 'javascript:void(0);';
                tmp['current'] = true;
            }
            pages.push(tmp)
        }

        var prevPageNo = currentPageNo- 1, nextPageNo=currentPageNo+ 1;
        
        if(prevPageNo<1){
            prevPage['href'] = 'javascript:void(0)';
            prevPage['text'] = 'Previous';
            prevPage['disabled'] = 'disabled';
        }else{
            cParams.pageno = prevPageNo;
            prevPage['href'] = FlowRouter.url(cRoute, cParams, cQueryParams),
            prevPage['prevPageNo'] = prevPageNo;
            prevPage['text'] = 'Previous';
            prevPage['disabled'] = '';
        }

        if(nextPageNo>maxPages) nextPageNo = maxPages;
        if(nextPageNo == currentPageNo){
            nextPage['href'] = 'javascript:void(0)';
            nextPage['text'] = 'Next';
            nextPage['disabled'] = 'disabled';
        }else{
            cParams.pageno = nextPageNo;
            nextPage['href'] = FlowRouter.url(cRoute, cParams, cQueryParams),
            nextPage['text'] = 'Next';
            nextPage['nextPageNo'] = nextPageNo;
            nextPage['disabled'] = '';
        }

        return {
            "prevPage":prevPage,
            "pages":pages,
            "nextPage": nextPage
        }
    }

    var pageno = FlowRouter.getParam('pageno'); if(!pageno)pageno=1;
    var resperpage = 6;
    // var query = FlowRouter.current().queryParams;
    var current = FlowRouter.current();
    var currentURL = FlowRouter.url(FlowRouter.current().route.name, FlowRouter.current().params, FlowRouter.current().queryParams)

    var sortOptions = { updatedAt : -1 }

    const bBlogsSub = Meteor.subscribe("browseBlogs", {viewName: 'browseBlogs.view', pageno:pageno, resperpage:resperpage } ,function(){
        if(bBlogsSub.ready() && Meteor.isClient)Session.set('subscriptionsReady',true);
    });

    Meteor.subscribe("total-blogs-count", {viewName: 'browseBlogs.view', pageno:pageno, resperpage:resperpage});

    if(Meteor.isServer){
        if(countsCollection==null)countsCollection = new Mongo.Collection('counts');
        Counts.get = function countsGet(name) {
            const count = countsCollection.findOne(name);
            return count && count.count || 0;
        };
        Counts.has = function countsHas(name) {
            return !!countsCollection.findOne(name);
        };

        totalCount = Counts.get("total-blogs-count");

    }else{
        totalCount = Counts.get("total-blogs-count");
    }

    // Meteor.subscribe('userData');
    // Meteor.subscribe('Config');

    if(Meteor.isClient)Session.get('subscriptionsReady');
    if( !bBlogsSub.ready() ) {
        return {
            isSubsLoaded : false
        }
    }

    return {
        totalCount: totalCount,
        pagination: getPaginationData(totalCount,pageno,6),
        blogs: Collections.Blogs.find().fetch(),
        isSubsLoaded : true
    };
})(BlogHome);