/**
 * Created by njanjanam on 08/08/2018.
 */
import { Meteor } from 'meteor/meteor';
import React, { Component } from 'react';
import ReactDOM from 'react-dom';
import { withTracker } from 'meteor/react-meteor-data';
import MainLayoutFooter from '../layout/MainLayoutFooter.jsx'
import MainLayoutHeader from '../layout/MainLayoutHeader.jsx'
import {Collections} from "../../api/collections";
if(Meteor.isClient)Session.set('subscriptionsReady',false);

function titleCase(str) {
    if(!str)return;
    return str.charAt(0).toUpperCase() + str.toLowerCase().substring(1);
}
function dateFormat(text){
    var date = new Date(text)
    if(date.toString() == "Invalid Date")return 'N/A';
    return  date.toDateString();
}

function chunkify(a, n, balanced) {

    if (n < 2)
        return [a];

    var len = a.length,
        out = [],
        i = 0,
        size;

    if (len % n === 0) {
        size = Math.floor(len / n);
        while (i < len) {
            out.push(a.slice(i, i += size));
        }
    }

    else if (balanced) {
        while (i < len) {
            size = Math.ceil((len - i) / n--);
            out.push(a.slice(i, i += size));
        }
    }

    else {

        n--;
        size = Math.floor(len / n);
        if (len % size === 0)
            size--;
        while (i < size * n) {
            out.push(a.slice(i, i += size));
        }
        out.push(a.slice(size * n));

    }

    return out;
}

class blogDetail extends Component {

    constructor(props) {
        super(props)
        var current = FlowRouter.current();
        this.currentURL = FlowRouter.url(FlowRouter.current().route.name, FlowRouter.current().params)

        this.backBtnHandler = this.backBtnHandler.bind(this)

        this.propsListHTML = '';
        this.isServerSSRReq = '';
    }
    backBtnHandler(){
        var prevRoute = Session.get('prevRoute');
        if(prevRoute){
            FlowRouter.go(prevRoute.name,prevRoute.args)
            Session.set('prevRoute',false);
        }else{
            FlowRouter.go("/account/myproperies/",{pageno:1});
        }
    }
    componentDidMount(){
        try {
            jQuery("html,body").animate({scrollTop: 0}, 250);
        } catch (e) {
            document.body.scrollTop = document.documentElement.scrollTop = 0;
        }
        setTimeout(function(){
            try {
                jQuery("html,body").animate({scrollTop: 0}, 250);
            } catch (e) {
                document.body.scrollTop = document.documentElement.scrollTop = 0;
            }

        },500)
    }
    componentDidUpdate() {}


    renderMain(){
        let blog = this.props.data
        let blogImage='';
        return (


            <section className="main-sec" style={{marginTop:0}}>
                {false ? (
                    <div>
                        <section className="banner">
                            <div className="container">
                                <div className="row">
                                    <div id="imagessection" className="col-md-7 padding0">
                                        <figure>
                                            <div className="banner-holder">
                                                {blog.image ? (
                                                    <img src={cdnPath(blog.image)} alt={'Photo of '+blog.title} title={blog.title}/>
                                                ):(
                                                    <img src={cdnPath("/images/no-photo.png")} alt={'Image not available'} title={'Image not available'}/>
                                                )}
                                            </div>
                                            { false ? (
                                                <figcaption>
                                                    <h2>{this.props.isAgent.name}</h2>
                                                    <h5 style={{padding: 0}}>{this.props.isAgent.address1}</h5>
                                                </figcaption>
                                            ) : ""
                                            }
                                        </figure>
                                    </div>
                                    <div className="col-md-5 purva-bg">
                                        <div className="purva">
                                            <h1 dangerouslySetInnerHTML={{__html: blog.title}}></h1>
                                            <div className="blogContentArea" style={{marginBottom: '10px'}} dangerouslySetInnerHTML={{__html: blog.excerpt}}></div>

                                        </div>
                                    </div>
                                </div>
                            </div>
                        </section>
                    </div>
                ):""}
                    <div className="container">
                        <div className="row">
                            <div id="detailssection" className="border mar-btm-20 background-white col-md-9 col-sm-12 col-xs-12">
                                <div className="head-border-bottom head-border-bottomTitleArea">
                                    <h1 dangerouslySetInnerHTML={{__html: blog.title}}></h1>
                                </div>
                                <div className="developer proj-dtls ">
                                    <div className="clearfix">
                                        <div className="col-md-12 blogContentArea" style={{marginBottom: '10px'}} dangerouslySetInnerHTML={{__html: blog.content}}>

                                        </div>
                                    </div>
                                </div>
                            </div>
                            {this.props.data.related ?(
                                <div id="" className="rightRelatedSection mar-btm-30 amenities col-md-3 col-sm-12 col-xs-12">
                                    <div className="head-border-bottom head-border-bottomTitleArea"><h2>Similar Articles</h2></div>
                                        <div className="background-white" style={{float:'left',display:'block'}}>
                                            <p style={{margin: '0px 0px 5px 5px'}}>Below are few more articles similar to <span dangerouslySetInnerHTML={{__html: blog.title}}></span></p>
                                            <ul className={"thumbnails thumbRelated"}>
                {
                    this.props.data.related.map(function (relatedBlog,i) {

                    // style={{width: 250, height: 188}}
                    return (
                    <li className="span4" key={i} style={{float:'left'}}>
                        <a href={ FlowRouter.url('blogdetail',{slug:relatedBlog.slug}) }>
                            <div className="thumbnail">
                                {relatedBlog.image.src ? (
                                    <img src={relatedBlog.image.src} width={relatedBlog.image.width} height={relatedBlog.image.height}
                                    alt={relatedBlog.title}
                                    className="img-responsive"/>
                                    ) : (
                                    <img src={cdnPath("/images/no-photo.png")}
                                         alt={'Image not available'}
                                         className="img-responsive" style={{width: 250, height: 188}}/>
                                )}
                                <h3 dangerouslySetInnerHTML={{__html: relatedBlog.title}}></h3>
                        </div></a>
                    </li>
                    )
                }
                )
                }
                                                </ul>
                                            </div>
                                 </div>
                            ): ""}
                            {this.props.recentBlogs ?(
                                <div id="realtedsection" className="background-white mar-btm-30 amenities col-md-12 col-sm-12 col-xs-12">
                                    <div className="head-border-bottom head-border-bottomTitleArea"><h2>Recent Articles</h2></div>
                                        <div className="amenitiy-block" style={{float:'left',display:'block'}}>
                                            <p style={{margin: '0 20px'}}>Below are few more recenty updated articles similar to <span dangerouslySetInnerHTML={{__html: blog.title}}></span></p>
                                            <ul className={"thumbnails thumbRelated"}>
                {
                    this.props.recentBlogs.map(function (relatedBlog,i) {

                    // style={{width: 250, height: 188}}
                    return (
                    <li className="span4" key={i} style={{float:'left'}}>
                        <a href={ FlowRouter.url('blogdetail',{slug:relatedBlog.slug}) }>
                            <div className="thumbnail">
                                {relatedBlog.image ? (
                                    <img src={relatedBlog.image} style={{width: 250, height: 188}}
                                    alt={relatedBlog.title}
                                    className="img-responsive"/>
                                    ) : (
                                    <img src={cdnPath("/images/no-photo.png")}
                                         alt={'Image not available'}
                                         className="img-responsive" style={{width: 250, height: 188}}/>
                                )}
                                <h3 dangerouslySetInnerHTML={{__html: relatedBlog.title}}></h3>
                        </div></a>
                    </li>
                    )
                }
                )
                }
                                                </ul>
                                            </div>
                                 </div>
                            ): ""}

                        </div>
                    </div>
                </section>

        )
    }

    renderFullMain(){

        if(Meteor.isClient){
            setTimeout(function(){
                $('#lettingDetailCarousel').carousel();
                $('#lettingDetailCarousel .carousel-control.right').unbind('click').bind('click',function(){$('#lettingDetailCarousel').carousel('next')})
                $('#lettingDetailCarousel .carousel-control.left').unbind('click').bind('click',function(){$('#lettingDetailCarousel').carousel('prev')})
            },1000)
        }

        return (
            <div className="property-details-page" id={'props_list'}>
                {
                    Meteor.isServer ? (
                        <div id={"isservercheckdiv"}></div>
                    ):""
                }

                <section className="banner">
                    <div className="container">
                        <div className="row">
                            <nav aria-label="breadcrumb">
                                <ol className="breadcrumb" style={{margin:"10px 0"}}>
                                    <li className="breadcrumb-item"><a href={FlowRouter.url('home')}>Home</a></li>
                                    <li className="breadcrumb-item"><a href={FlowRouter.url('bloghome')}>Blogs</a></li>
                                    <li className="breadcrumb-item active" aria-current="page">This Article</li>
                                </ol>
                            </nav>
                        </div>
                    </div>
                </section>

                {
                    this.props.isSubsLoaded ?
                        this.props.data ? this.renderMain() :
                            (
                                <section className="">
                                    <div className="container text-center mar-top-20 pad-btm-30">
                                        <div className="filter-holder">
                                            <div className="mar-top-30">
                                                <span>
                                                    <strong>This article is not found. Please check the url and try again.</strong><br /><br />
                                                    <a href={FlowRouter.url('bloghome')} className="blue-btn btns noPropBackBtn">Find recent articles</a>
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                </section>
                            )
                        :
                        (
                            <section className="mar-top-20 mar-btm-20 no-print">
                                <div className="container text-center mar-top-20 pad-btm-30">
                                    <div className="filter-holder">
                                        <div className="mar-top-30">
                                            <div className={'h2-div'}>Loading...</div>
                                        </div>
                                    </div>
                                </div>
                            </section>
                        )
                }
            </div>
        )
    }

    render() {
        const self = this;
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
                { (this.props.isSubsLoaded )  ? (
                        this.renderFullMain()
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
}

export default withTracker(() => {

    var slug = FlowRouter.getParam('slug'); if(!slug)return {data:false,isSubsLoaded:true};

    const viewBlogSub = Meteor.subscribe("viewBlog",slug,function(){
        Session.set('subscriptionsReady',true);
    })
    if(Meteor.isClient)Session.get('subscriptionsReady');

    if( !viewBlogSub.ready() ) {
        return {data: false, isSubsLoaded:false};
    }

    var blog = Collections.Blogs.find({"slug" : slug}, { limit: 1 }).fetch();
    if(blog.length){
        blog = blog[0];
    }
    var recentBlogs = Collections.Blogs.find({"slug" : {$not: slug}}, { sort: {updatedAt:-1} }).fetch();

    if(!blog || blog.length==0){//Blog not found
        clearMeta();
        DocHead.setTitle('Article not found | SpotMyCrib');
        DocHead.addMeta({name: "description", content: ""});
        return {
            data: false,
            recentBlogs: recentBlogs,
            isSubsLoaded:true
        }
    }else{
        var title = blog.metaTitle; //Is Rental Cap Able to Control the Housing Market Crisis? - Blog - SpotMyCrib
        var desc = blog.metaDesc;

        clearMeta();
        let titleTmp = title + ' | SpotMyCrib Blog'
        if(titleTmp.length<=75)title = titleTmp;

        DocHead.setTitle(title);
        DocHead.addMeta({
            name: "description",
            content: desc
        });

        var socialDesc = blog.metaDesc;
        var socialTitle = blog.metaTitle;
        var currentURL = FlowRouter.url(FlowRouter.current().route.name, FlowRouter.current().params);
        DocHead.addMeta({property: "og:title", content: socialTitle});
        DocHead.addMeta({property: "og:description", content: socialDesc});

        DocHead.addMeta({rel: "canonical", href: currentURL  });

        DocHead.addMeta({property: "og:type", content: "article"});
        DocHead.addMeta({property: "og:url", content: currentURL });
        DocHead.addMeta({property: "fb:app_id", content: '309356899476430'})

        try{DocHead.addMeta({property: "og:image", content: blog.image  }); }
        catch (c){
            //Putting this here is making FB take the first response from here. & its showing no image if if this meta is later updated. So better put it later after all rendering at a template level. For now lets not keep anywhere.
            // DocHead.addMeta({name: "og:image", content: 'https://www.spotmycrib.ie/images/spot-my-crib-logo.png'  });
        }
    }


    return {
        data: blog,
        recentBlogs: recentBlogs,
        isSubsLoaded:true
    };
})(blogDetail);

class ImagesSlider extends Component {
    constructor(props) {
        super(props)
        var current = FlowRouter.current();
        this.currentURL = FlowRouter.url(FlowRouter.current().route.name, FlowRouter.current().params)
    }
    componentDidMount(){
        $(document).ready(function() {
            // $('#lettingDetailCarousel').first().addClass('active');//not needed as bug of isActive helper not working is fixed.

            $('#imagessection .item img').width('100%')
            var w = $('#imagessection .item img').first().width()
            var h = w/1.33;
            if(h>250)$('#imagessection .item img').height(w/1.33)
            setTimeout(function () {
                $('#imagessection .item img').width('100%')
                var w = $('#imagessection .item img').first().width()
                var h = w/1.33;
                if(h>250)$('#imagessection .item img').height()
            },3000)

            // $('#lettingDetailCarousel').carousel();
            // $("#lettingDetailCarousel").swiperight(function() {
            //     $(this).carousel('prev');
            // });
            // $("#lettingDetailCarousel").swipeleft(function() {
            //     $(this).carousel('next');
            // });
        });
    }
    render() {
        return (

            <div id="lettingDetailCarousel" className="carousel slide" data-ride="carousel">
                <div className="carousel-inner">
                    {this.props.images ?
                        this.props.images.map(function(image,i){
                            return (
                            <div key={i} className={'item '+ (i==0 ? 'active' : "")}>
                                <img src={image.url} alt={image.altText} title={image.altText} className="img-responsive"/>
                            </div>
                            )
                        })
                    :(
                        <div className="item active">
                            <img src={cdnPath("/images/no-photo.png")} alt={'Image not available'} title={'Image not available'} className="img-responsive"/>
                        </div>
                    )}
                </div>
                {/* Left and right controls */}
                <a className="left carousel-control" href={"javascript:void(0)"} data-slide="prev">
                    <span className="glyphicon glyphicon-chevron-left"/>
                    <span className="sr-only">Previous</span>
                </a>
                <a className="right carousel-control" href={"javascript:void(0)"} data-slide="next">
                    <span className="glyphicon glyphicon-chevron-right"/>
                    <span className="sr-only">Next</span>
                </a>
            </div>
        );
    }
}
