import { Meteor } from 'meteor/meteor';
import React, { Component } from 'react';
import { withTracker } from 'meteor/react-meteor-data';
import MainLayoutFooter from '../layout/MainLayoutFooter.jsx'
import MainLayoutHeader from '../layout/MainLayoutHeader.jsx'
import {Collections} from "../../api/collections";
if(Meteor.isClient)Session.set('subscriptionsReady',false);

function titleCase(str){
    if(!str)return;
    return str.charAt(0).toUpperCase() + str.toLowerCase().substring(1);
}
function saveToLocalStorage(){
    if(Meteor.isServer)return;
    if (localStorage) {
        // if($( ".countySelected" ).val().toString().trim()) //It needs to work even all options are reset, i.e its empty.
        localStorage.homePageMainFormData_county = $( ".countySelected" ).val();
        // if($( ".areaSelected" ).val().toString().trim())//it needs to reset to empty
        localStorage.homePageMainFormData_area = $( ".areaSelected" ).val();
        var tmp = $( "input:radio[name=propertyType]:checked" ).val();
        if(tmp)localStorage.homePageMainFormData_propertyType = tmp
        localStorage.homePageMainFormData_maxRent = $('.maxRent').val();
    }
}
function slugify (text) {
    if(!text)return '';
    const a = 'àáäâèéëêìíïîòóöôùúüûñçßÿœæŕśńṕẃǵǹḿǘẍźḧ·/,:;'
    const b = 'aaaaeeeeiiiioooouuuuncsyoarsnpwgnmuxzh------'
    const p = new RegExp(a.split('').join('|'), 'g')

    return text.toString().toLowerCase()
        .replace(/\s+/g, '')           // Replace spaces with ""
        .replace(p, c =>
            b.charAt(a.indexOf(c)))     // Replace special chars
        .replace(/&/g, '-and-')         // Replace & with ''
        .replace(/[^\w\-]+/g, '')       // Remove all non-word chars
        .replace(/\-\-+/g, '-')         // Replace multiple - with single ''
        .replace(/^-+/, '')             // Trim - from start of text
        .replace(/-+$/, '')             // Trim - from end of text
}
function generateSlug(curURL){
    var propertyType = curURL.propertyType;
    var county = curURL.county
    var area = curURL.area
    var maxRent = curURL.maxRent
    var country = curURL.country;
    // const territory = target.territory.value;

    var slug='';
    var query=[];

    if(propertyType)propertyType = propertyType.replace(/\s+/g, '_')
    if(county)county = county.replace(/\s+/g, '_')
    if(area)area = area.replace(/\s+/g, '_')
    if(country)country = country.replace(/\s+/g, '_')

    if(propertyType)slug=propertyType+"-for-"
    slug+="rent"
    // if(areaSelected||countySelected||country)
    slug+="-in-"

    if(!county)area = '';

    if(area)slug+=area
    if(area && county)slug+="-"
    if(county)slug+=county

    if(country)slug+="-"+country

    var range = [{cur:"eur",min:400,max:10000}]
    var selectedCur = range[0];
    if(maxRent && maxRent!=selectedCur.max)query["maxRent"] = maxRent;

    // apartment-for-rent-in-dundrum-dublin-ireland
    // apartment-for-rent-in-donnybroke-london-uk
    // rent/apartment/dundrum/dublin
    // rent/apartment/donnybroke/london/england/uk/
    return [
        slugify(slug),
        query
    ]
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
function generateSlug(curURL){
    var propertyType = curURL.propertyType;
    var county = curURL.county
    var area = curURL.area
    var maxRent = curURL.maxRent
    var country = curURL.country;
    var bedCount = curURL.bedCount;
    var luxurySort = curURL.luxurySort;
    var cheapSort = curURL.cheapSort;
    // const territory = target.territory.value;

    var slug='';
    var query={};

    if(propertyType)propertyType = propertyType.replace(/\s+/g, '_')
    if(county)county = county.replace(/\s+/g, '_')
    if(area)area = area.replace(/\s+/g, '_')
    if(country)country = country.replace(/\s+/g, '_')

    if(propertyType)slug=propertyType+"-for-"
    slug+="rent"
    // if(areaSelected||countySelected||country)
    slug+="-in-"

    if(!county)area = '';

    if(area)slug+=area
    if(area && county)slug+="-"
    if(county)slug+=county

    if(bedCount)query.bedCount = bedCount;
    if(luxurySort)query.luxurySort = 1;
    if(cheapSort)query.cheapSort = 1;

    if(country)slug+="-"+country
    else slug+="-ireland"

    var range = [{cur:"eur",min:400,max:10000}]
    var selectedCur = range[0];
    if(maxRent && maxRent!=selectedCur.max)query.maxRent = maxRent;

    // apartment-for-rent-in-dundrum-dublin-ireland
    // apartment-for-rent-in-donnybroke-london-uk
    // rent/apartment/dundrum/dublin
    // rent/apartment/donnybroke/london/england/uk/
    return [
        slugify(slug),
        query
    ]
}
function generateSlugURL(curURL){
    var ret = generateSlug(curURL)
    return FlowRouter.url('b',{slug:ret[0]},ret[1]);
}
function fixImageSize() {
    var avgW=0;
    $('.image-holder img').each(function(){

        if(!avgW)avgW = $(this).width();
        else {
            avgW += $(this).width();
            avgW =  avgW / 2;
        }
    })
    if(!avgW)avgW = 250;
    $('.image-holder img').width('100%');
    $('.image-holder img').height(avgW*0.7);
}
class Home extends Component {

    constructor(props) {
        super(props);
        var searchCrumbs = {c1:[],c2:[],c3:[]}
        var fCrumbs = {c1:[],c2:[],c3:[]}
        var areaCrumbs = {c1:[],c2:[],c3:[]}
        var countyCrumbs = {c1:[],c2:[],c3:[]}
        if(props.searchCrumbs){
            var chunks = chunkify(props.searchCrumbs,3,true)
            searchCrumbs = {c1:chunks[0],c2:chunks[1],c3:chunks[2]}
        }
        if(props.fCrumbs){
            var chunks = chunkify(props.fCrumbs,3,true)
            fCrumbs = {c1:chunks[0],c2:chunks[1],c3:chunks[2]}
        }
        if(props.areaCrumbs){
            var chunks = chunkify(props.areaCrumbs,3,true)
            areaCrumbs = {c1:chunks[0],c2:chunks[1],c3:chunks[2]}
        }
        if(props.countyCrumbs){
            var chunks = chunkify(props.countyCrumbs,3,true)
            countyCrumbs = {c1:chunks[0],c2:chunks[1],c3:chunks[2]}
        }
        this.state = {
            'searchCrumbs':searchCrumbs,fCrumbs:fCrumbs,areaCrumbs:areaCrumbs,countyCrumbs:countyCrumbs
        }
        this.searchCrumbsLoaded = false;

    }
    componentWillMount(){
        if(Meteor.isClient) Session.set('showLoginInPlace',false);
        // console.log('In componentWillMount');
    }

    componentDidMount() {
        // console.log('In componentDidMount');
        if ( /^((?!chrome|android).)*safari/i.test(navigator.userAgent)) {
            $('select').addClass('safariSelect')//css('-moz-appearance','none');
        }
   
        $('.iamarenterbtn').click(function (e) {
            e.preventDefault();
            $('html,body').animate({scrollTop: $(this.hash).offset().top }, 500,function(){
                $(".bigsearchbox").css({border: '0 solid red','background-color':"rgba(0, 0, 0, 0.8)"}).animate({
                    borderWidth: 2,
                    'background-color':"rgba(0, 0, 0, 1)"
                }, 500, function() {
                    $(".bigsearchbox").animate({
                        borderWidth: 0,
                        'background-color':"rgba(0, 0, 0, 0.8)"
                    }, 500);
                });
            })
        });

        if(Meteor.isClient) {
            setTimeout(function(){
                if(window.location.hash){
                    jQuery("html,body").animate({scrollTop: $(window.location.hash).offset().top }, 250);
                }
            },2000)
        }
    }
    
    componentDidUpdate() {
    }

    crumbsUpdate(){
        if(!this.searchCrumbsLoaded){
            var searchCrumbs = {c1:[],c2:[],c3:[]}
            var fCrumbs = {c1:[],c2:[],c3:[]}
            var areaCrumbs = {c1:[],c2:[],c3:[]}
            var countyCrumbs = {c1:[],c2:[],c3:[]}
            if(this.props.searchCrumbs){
                var chunks = chunkify(this.props.searchCrumbs,3,true)
                searchCrumbs = {c1:chunks[0],c2:chunks[1],c3:chunks[2]}
                this.searchCrumbsLoaded = true;
            }
            if(this.props.fCrumbs){
                var chunks = chunkify(this.props.fCrumbs,3,true)
                fCrumbs = {c1:chunks[0],c2:chunks[1],c3:chunks[2]}
                this.searchCrumbsLoaded = true;
            }
            if(this.props.areaCrumbs){
                var chunks = chunkify(this.props.areaCrumbs,3,true)
                areaCrumbs = {c1:chunks[0],c2:chunks[1],c3:chunks[2]}
                this.searchCrumbsLoaded = true;
            }
            if(this.props.countyCrumbs){
                var chunks = chunkify(this.props.countyCrumbs,3,true)
                countyCrumbs = {c1:chunks[0],c2:chunks[1],c3:chunks[2]}
                this.searchCrumbsLoaded = true;
            }
            if(this.searchCrumbsLoaded)//Update the state only once; when its true
                this.setState({'searchCrumbs':searchCrumbs,fCrumbs:fCrumbs,areaCrumbs:areaCrumbs,countyCrumbs:countyCrumbs})
        }
    }

    componentWillReceiveProps(nextProps) {
        // console.log(nextProps)
        // console.log(this)
        // console.log('In componentWillReceiveProps');
        this.crumbsUpdate();
    }

    handleJoinNow() {
        Session.set('showForgotForm',false)
        Session.set('isLandLordMode',true)
        Session.set('showSignupForm',true)
        Session.set('showLoginSignupFancyBoxDialog',true)
        Session.set('showLoginDialog',true)
    }
    
    handlePostYourProperty(event) {
        event.preventDefault();
        var prevRoute = {name: FlowRouter.current().route.name,args:{scrollTo:0},instructions:{openPostNewProp:true} }
        Session.set('prevRoute',prevRoute);
        FlowRouter.go('account/myProperties')
    }

    render() {
        const self = this;
        return (
        <div>
            <MainLayoutHeader />
            <div className="index home">
                <section className="" id="searchform">
                    <div className="index-main-banner">
                        <div className="container">
                            <div className="index-bnr-cont">
                                
                                { true ? (
                                <div id="homeSliderParent" >
                                    <div id="homeSlider">
                                        <div className="carousel-inner">
                                            <div className="item active">
                                                <p>Best properties to rent in Ireland. Find them, right here!</p>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                                ) : ""}
                                <div className="home-banner" style={{marginBottom: "50px"}}>
                                    <a className="btns green-btn " href={FlowRouter.url('estateagent')} style={{fontSize:'15px'}}>I'm a Landlord</a>
                                    <a className="btns transparent-btn iamarenterbtn" href="#searchform">I'm a Renter</a>
                                </div>
                                <div className="box-places home-page-box-places bigsearchbox">
                                    <ul>
                                        <li>
                                            <HomePageMainFormT />
                                        </li>
                                    </ul>
                                </div>
                                
                            </div>
                        </div>
                    </div>
                </section>
                <HomePageLatestPropsT />
                {true ? (
                <section id="homeLinks" className="sec-holder how-it-works">
                    <div className="container">

                        <div className="row">
                            <div className="col-md-12">
                                <div id="" className="mar-btm-30 amenities">

                                    <div className="" style={{paddingTop:0}}>
                                        { this.props.fCrumbs === undefined || this.props.fCrumbs.length == 0 ? ("") : (
                                            <div className={'bottomcrumbs row'}>
                                                <h2>Browse properties to rent in top cities</h2>
                                                <span className="bottom-line"></span>
                                                <div className="col-md-12 col-sm-12 col-xs-12 pad0">
                                                    <div className="col-md-4 col-sm-4 col-xs-12">
                                                        {this.state.fCrumbs.c1 ?
                                                            this.state.fCrumbs.c1.map(function (crumb, i) {
                                                                return (
                                                                    <a key={i} style={{display: "block"}}
                                                                       href={crumb.url}>{crumb.name}</a>
                                                                )
                                                            })
                                                            : ""}
                                                    </div>
                                                    <div className="col-md-4 col-sm-4 col-xs-12">
                                                        {this.state.fCrumbs.c2 ?
                                                            this.state.fCrumbs.c2.map(function (crumb, i) {
                                                                return (
                                                                    <a key={i} style={{display: "block"}}
                                                                       href={crumb.url}>{crumb.name}</a>
                                                                )
                                                            })
                                                            : ""}
                                                    </div>
                                                    <div className="col-md-4 col-sm-4 col-xs-12">
                                                        {this.state.fCrumbs.c3 ?
                                                            this.state.fCrumbs.c3.map(function (crumb, i) {
                                                                return (
                                                                    <a key={i} style={{display: "block"}}
                                                                       href={crumb.url}>{crumb.name}</a>
                                                                )
                                                            })
                                                            : ""}
                                                        <a style={{display: "block"}} className="iamarenterbtn" href="#searchform">More</a>
                                                    </div>
                                                </div>
                                            </div>
                                        )}
                                        { this.props.countyCrumbs === undefined || this.props.countyCrumbs.length == 0  ? ("") : (
                                            <div className={'bottomcrumbs row mar-top-30'}>
                                                {/*<h2>Counties</h2>*/}
                                                <span className="bottom-line"></span>
                                                <div className="col-md-12 col-sm-12 col-xs-12 pad0">
                                                    <div className="col-md-4 col-sm-4 col-xs-12">
                                                        {this.state.countyCrumbs.c1 ?
                                                            this.state.countyCrumbs.c1.map(function (crumb, i) {
                                                                return (
                                                                    <a key={i} style={{display: "block"}}
                                                                       href={crumb.url}>{crumb.name}</a>
                                                                )
                                                            })
                                                            : ""}
                                                    </div>
                                                    <div className="col-md-4 col-sm-4 col-xs-12">
                                                        {this.state.countyCrumbs.c2 ?
                                                            this.state.countyCrumbs.c2.map(function (crumb, i) {
                                                                return (
                                                                    <a key={i} style={{display: "block"}}
                                                                       href={crumb.url}>{crumb.name}</a>
                                                                )
                                                            })
                                                            : ""}
                                                    </div>
                                                    <div className="col-md-4 col-sm-4 col-xs-12">
                                                        {this.state.countyCrumbs.c3 ?
                                                            this.state.countyCrumbs.c3.map(function (crumb, i) {
                                                                return (
                                                                    <a key={i} style={{display: "block"}}
                                                                       href={crumb.url}>{crumb.name}</a>
                                                                )
                                                            })
                                                            : ""}
                                                        <a style={{display: "block"}} className="iamarenterbtn" href="#searchform">More</a>
                                                    </div>
                                                </div>

                                            </div>
                                        )}
                                    </div>

                                </div>
                            </div>
                        </div>

                    </div>
                </section>
                ) : ""}
                <section id="whatis" className="sec-holder how-it-works whatissmc" style={{background:'white'}}>
                    <div className="container">
                        <h2>What is SpotMyCrib?</h2>
                        <span className="bottom-line"></span>
                        <div className="container">
                            <p>SpotMyCrib is the safest platform to find your next rental home. It brings 100% verified landlords with genuine rentals to you. Just search for your ideal home, apply, get screened, e-sign your lease and pay rent online.</p>
                            <a href="#how-works" className="scroll1 transparent-btn btns ">Know More</a>
                        </div>
                    </div>
                </section>
                <section id="how-works" className="sec-holder how-it-works">
                    <div className="container">
                        <h2>How it works</h2>
                        <span className="bottom-line"></span>
                        <ul className="mar-top-30">
                            <li>
                                <h6 className="pad-btm-30">Search Property</h6>
                                <img src={cdnPath("/images/how-it-works/search-and-find-property-apartment-flat.png")} alt="Search and find your rental property" className="pad-btm-30" />
                                <p>
                                    Search and find an apartment/house you like from our <a className="iamarenterbtn" href={FlowRouter.url('home')+'#searchform'}>browse form</a>.
Or choose your county from our <a href={FlowRouter.url('home')+'#homeLinks'}>county list</a>.
                                    </p>
                            </li>
                            <li>
                                <h6 className="pad-btm-30">Set Your Rent</h6>
                                <img src={cdnPath("/images/how-it-works/set-your-rent-apartment.png")} alt="Apply and set your rent for Apartment"  className="pad-btm-30"/>
                                <p>Make your offer for the house and click apply. Remember to upload all your references in your profile.</p>
                            </li>
                            <li>
                                <h6 className="pad-btm-30">Confirm your Home</h6>
                                <img src={cdnPath("/images/how-it-works/confirm-your-rent-in-dublin.png")} alt="Confirm your rental"  className="pad-btm-30"/>
                                <p>Landlord chooses a tenant based on your references and your offer. If you are chosen, you would receive a confirmation email. </p>
                            </li>
                        </ul>
                    </div>
                    <div className="container mar-top-30">
                        <a href={FlowRouter.url('faqs')} className="transparent-btn btns " type="button">Learn more</a>
                        <span className="pad-btm-30 visible-xs visible-sm">&nbsp;</span>
                    </div>
                </section>
                <section className="sec-holder about-us">
                    <div className="container">
                        <h1>Manage all your lettings at one place</h1>
                        <h3 style={{marginTop: "10px", color: "white"}}>From finding tenants to verifying their social profiles</h3>
                        <h3 style={{marginTop: "10px", color: "white"}}>From collecting rents to logging maintenance costs</h3>
                        <div>
                        { self.props.currentUserId ?
                            <a href="#TODO" style={{marginTop: "10px"}} onClick={self.handlePostYourProperty} className="pink-btn oval-btn postYourProperty">Post your property</a>
                        :
                            <a href="javascript:;" style={{marginTop: "10px"}} onClick={self.handleJoinNow} className="pink-btn oval-btn joinNowBtn">Start Your Free 30-Day Trial</a>
                        }
                        </div>
                    </div>
                </section>
            </div>
            <footer className="footer-default"><MainLayoutFooter /></footer>
        </div>
        );
    }
};


export default withTracker(() => {
    ////////// ADV BREADCRUMBS MORE LINKS
    advancedCrumbs = function(propertyType){
        let fCrumbs = [], tmpCrumbs = [], areaCrumbs = [], countyCrumbs = [];
        if(propertyType)propertyType = propertyType.toLowerCase();

        // Home / Search Residential Rentals / Dublin City Apartments for Rent / Dublin 2 Apartments for Rent
        //Property Size
        //Property Size - Property Type
        //Property Size - Property Type - County
        //Property Type - county
        //Counties
        //Areas
        //Property Size - Property Type - area - County
        //Property Size - area - County
        //Property Type - area - county

        fCrumbs.push({url: generateSlugURL({propertyType: 'studio'}), name: 'Studios'})//Property Size
        fCrumbs.push({url: generateSlugURL({bedCount: 1}), name: '1-Beds'})//Property Size
        fCrumbs.push({url: generateSlugURL({bedCount: 2}), name: '2-Beds'})
        fCrumbs.push({url: generateSlugURL({bedCount: 3}), name: '3-Beds'})

        tmpCrumbs.push({url: generateSlugURL({cheapSort: true, propertyType: 'house'}), name: 'Cheap Houses'})
        tmpCrumbs.push({url: generateSlugURL({bedCount: 1, propertyType: 'house'}), name: '1-Bed Houses'})//Property Size - Property Type
        tmpCrumbs.push({url: generateSlugURL({bedCount: 2, propertyType: 'house'}), name: '2-Bed Houses'})
        tmpCrumbs.push({url: generateSlugURL({bedCount: 3, propertyType: 'house'}), name: '3-Bed Houses'})
        tmpCrumbs.push({url: generateSlugURL({luxurySort: true, propertyType: 'house'}), name: 'Luxury Houses'})

        if (propertyType == 'house') {
            fCrumbs = fCrumbs.concat(tmpCrumbs);
        }

        fCrumbs.push({
            url: generateSlugURL({cheapSort: true, propertyType: 'apartment'}),
            name: 'Cheap Apartments'
        })
        fCrumbs.push({url: generateSlugURL({bedCount: 1, propertyType: 'apartment'}), name: '1-Bed Apartments'})//Property Size - Property Type
        fCrumbs.push({url: generateSlugURL({bedCount: 2, propertyType: 'apartment'}), name: '2-Bed Apartments'})
        fCrumbs.push({url: generateSlugURL({bedCount: 3, propertyType: 'apartment'}), name: '3-Bed Apartments'})
        fCrumbs.push({
            url: generateSlugURL({luxurySort: true, propertyType: 'apartment'}),
            name: 'Luxury Apartments'
        })

        if (propertyType != 'house') {
            fCrumbs = fCrumbs.concat(tmpCrumbs);
        }

//dublin-apartments
        //Not doing dublin-houses due to less searches for Dublin apartments
        var staticCounties = ["Carlow", "Cavan", "Clare", "Cork", "Donegal", "Dublin", "Galway", "Kerry", "Kildare", "Kilkenny", "Laois", "Leitrim", "Limerick", "Longford", "Louth", "Mayo", "Meath", "Monaghan", "Offaly", "Roscommon", "Sligo", "Tipperary", "Waterford", "Westmeath", "Wexford", "Wicklow"];

        for (var i = 0; i < staticCounties.length; i++) {
            if (!staticCounties[i]) continue;
            countyCrumbs.push({
                url: generateSlugURL({county: staticCounties[i]}),
                name: staticCounties[i] + ' Apartments'
            })
        }

        return {
            fCrumbs:fCrumbs,
            areaCrumbs: areaCrumbs,
            countyCrumbs:countyCrumbs
        }
    }
    let advC = {fCrumbs:[],areaCrumbs:[],countyCrumbs:[]}
    if(true) {
        let propertyType = '';
        if(Meteor.isClient)propertyType = Session.get('HPFpropertyTypeSelected');
        if(!propertyType)propertyType = 'Apartment';
        advC = advancedCrumbs(propertyType);
    }
    ////////// END ADV BREADCRUMBS

    
    // Meteor.subscribe('Areas')
    // Meteor.subscribe('Config');

  return {
    currentUserId: Meteor.userId(),
    fCrumbs : advC.fCrumbs,
    areaCrumbs : advC.areaCrumbs,
    countyCrumbs : advC.countyCrumbs
  };
})(Home);

class HomePageMainForm extends Component{
    constructor(props) {
        super(props);
        this.state = {
            counties:props.counties,
            areas:props.areas,
            countySelected:props.countySelected,
        }
        this.isLocalAlreadySet = false;
        this.isLocalAreaAlreadySet = false;
        this.countySelectedHandler = this.countySelectedHandler.bind(this);
        this.areaSelectedHandler = this.areaSelectedHandler.bind(this);
        this.propertyTypeHandler = this.propertyTypeHandler.bind(this);
        this.maxRentHandler = this.maxRentHandler.bind(this);
        this.localHistorySet = this.localHistorySet.bind(this);
    }
    componentWillReceiveProps(nextProps) {
        // console.log(nextProps)
        this.setState({
            areas: nextProps.areas
        });
    }
    localHistorySet(){
        if(this.props.isSubsLoaded && this.isLocalAlreadySet && !this.isLocalAreaAlreadySet){
            if (localStorage.homePageMainFormData_area) {
                this.setState({areaSelected:localStorage.homePageMainFormData_area})
            }
            this.isLocalAreaAlreadySet = true;
        }
        if(this.props.isSubsLoaded && !this.isLocalAlreadySet){
            var county = '';
            if(localStorage) {
                if (localStorage.homePageMainFormData_maxRent) {
                    $('.maxRent').val(localStorage.homePageMainFormData_maxRent);
                }
                if (localStorage.homePageMainFormData_county) {
                    county=localStorage.homePageMainFormData_county;
                }else if(localStorage.homePageMainFormData_county===undefined){//Only for first time users
                    county = 'Dublin'
                }
                if (localStorage.homePageMainFormData_propertyType) {
                    var tmp = localStorage.homePageMainFormData_propertyType
                    $('input:radio[name=propertyType]').removeAttr('checked');
                    $('input:radio[name=propertyType][value="'+tmp+'"]').prop('checked', true)
                }
            }
            this.setState({countySelected:county})
            if( Meteor.isClient )Session.set('countySelected', county);
            // if(county)this.setState({areas:getAreas(county)})
            this.isLocalAreaAlreadySet = false;

            this.isLocalAlreadySet = true;
        }
    }
    componentDidMount(){
        this.localHistorySet();
        // setTimeout(function () {
        //     $('.countySelected').val(county)
        // },100)
        // setTimeout(function () {
        //     if (localStorage.homePageMainFormData_area) {
        //         Session.set('areaRestored',localStorage.homePageMainFormData_area)
        //         // setTimeout(function () {
        //         //     $('.areaSelected').val(localStorage.homePageMainFormData_area)
        //         // },100)
        //     }
        // },1000)
    }
    componentDidUpdate(){
        this.localHistorySet();
    }
    countySelectedHandler(event){
        var countySelected = event.target.value
        this.setState({countySelected:countySelected})
        if( Meteor.isClient )Session.set('countySelected', countySelected);

        //if(countySelected) this.setState({areas:getAreas(countySelected)})
        this.isLocalAreaAlreadySet = false;

        if(localStorage)localStorage.homePageMainFormData_county = countySelected;
    }
    areaSelectedHandler(event){
        this.setState({areaSelected:event.target.value})
        if(localStorage)localStorage.homePageMainFormData_area = event.target.value;
    }
    propertyTypeHandler(event){
        if(localStorage)localStorage.homePageMainFormData_propertyType = event.target.value;
    }
    maxRentHandler(event){
        if(localStorage)localStorage.homePageMainFormData_maxRent = event.target.value;
    }
    submitFormHandler(event) {
        event.preventDefault();
        const target = event.target;
        const key = target.propertykey.value;
        if(key){
            if(key.length!=5){
                alert('Invalid property key! It should of 5 characters in length.');
                return;
            }
            FlowRouter.go('letting',{key:key.toUpperCase()})
            return;
        }

        // const territory = target.territory.value;

        var data={
            country:target.country.value,
            county:target.countySelected.value == 'all' ? '' : target.countySelected.value,
            area:target.areaSelected.value == 'all' ? '' : target.areaSelected.value,
            maxRent:target.maxRent.value,
            propertyType:target.propertyType.value,
        }
        var slug = generateSlug(data);
        FlowRouter.go('b',{slug:slug[0]},slug[1])
    }
    render(){
    return (
<form className="propertykey-form" onSubmit={this.submitFormHandler}>
<div className="input-group">
{/*start */}
<div className="searchformSec">
<input type="hidden" name="country" defaultValue="ireland" />
<div className="profile-text">
<div className="rd-details">
{ false ? (<span>I am looking for an</span>) : ""}
<label className="account-type-label" htmlFor="rd1">
<input autoComplete="on" className="account-type-radio propertyType" id="rd1" name="propertyType" defaultValue="apartment" type="radio" defaultChecked onChange={this.propertyTypeHandler} />
Apartment for rent
</label>
<label className="account-type-label">
<input autoComplete="on" className="account-type-radio propertyType" name="propertyType" defaultValue="house" type="radio" onChange={this.propertyTypeHandler} />
House for rent
</label>
<label className="account-type-label">
<input autoComplete="on" className="account-type-radio propertyType" name="propertyType" defaultValue="student" type="radio" onChange={this.propertyTypeHandler} />
Student Accommodation
</label>
<label className="account-type-label">
<input autoComplete="on" className="account-type-radio propertyType" name="propertyType" defaultValue="share" type="radio" onChange={this.propertyTypeHandler} />
Share
</label>
{ false ? (
<label className="account-type-label">
<input autoComplete="on" className="account-type-radio propertyType" name="propertyType" defaultValue="holidayhomes" type="radio" onChange={this.propertyTypeHandler} />
Holiday Homes
</label>
) : ""}
</div>

<div className="signin-form">
<div className="frm-group clearfix">
<div className="styled-input styled-input-select">
<select autoComplete="on" name="countySelected" className="countySelected" onChange={this.countySelectedHandler} value={this.state.countySelected}>
<option value={""}>Choose City/County</option>
<option value={"all"} >All</option>
{this.state.counties.map(function(c,i){
    return (
        <option key={i} value={c.value} >{c.label}</option>
        )
})}
</select>
<span />
</div>
<div className="styled-input styled-input-select">
<select autoComplete="on" name="areaSelected" className="areaSelected" onChange={this.areaSelectedHandler} value={this.state.areaSelected}>
<option value={""}>Choose Area</option>
<option value={"all"}>All</option>
    {this.state.areas.map(function(c,i){
        return (
            <option key={i} value={c.value} >{c.label}</option>
        )
    })}
</select>
<span />
</div>
<div className="styled-input styled-input-select">
<select autoComplete="on" name="maxRent" className="maxRent" onChange={this.maxRentHandler}>
<option value={""}>Max Rent</option>
<option value={""}>Any</option>
    {this.props.maxRent.map(function(c,i){
        return (
            <option key={i} value={c.value} >{c.label}</option>
        )
    })}
</select>
<span />
</div>
<div className="styled-input styled-input-select">
<input autoComplete="on" type="text" className="form-control propertykey" name="propertykey" placeholder="Property KEY" />
</div>
<div className="styled-input">
<span className="input-group-btn" style={{zIndex: 0}}>
<button className="btn white-btn" type="submit" style={{width:'100%'}}>Find</button>
</span>
</div>
</div>
</div>

</div>
</div>
</div>
</form>

    );
    }
}
HomePageMainFormT = withTracker(() => {
    var countries = [{label: "Ireland", value: "Ireland"}];//Both capital
    var staticCounties = ["Carlow", "Cavan", "Clare", "Cork", "Donegal", "Dublin", "Galway", "Kerry", "Kildare", "Kilkenny", "Laois", "Leitrim", "Limerick", "Longford", "Louth", "Mayo", "Meath", "Monaghan", "Offaly", "Roscommon", "Sligo", "Tipperary", "Waterford", "Westmeath", "Wexford", "Wicklow"];
    var allareas = [];
    var allcounties = [];
    var countySelected = 'Dublin';

    if( Meteor.isClient )if(Session.get('countySelected'))countySelected = Session.get('countySelected')
    let isSubsLoaded = false;
//    const areasSub = Meteor.subscribe('Areas','','',countySelected,'','',function(){
//        if(areasSub.ready() && Meteor.isClient )Session.set('subscriptionsReady',true);
//    })
    // Meteor.subscribe('Config');
    if( Meteor.isClient )
    if( Session.get('subscriptionsReady') ) {
        isSubsLoaded = true;
    }

    if(Meteor.isClient)Session.get('subscriptionsReady');

    for(var i=0;i< staticCounties.length;i++){
        if(!staticCounties[i])continue;
        allcounties.push({label: staticCounties[i], value: staticCounties[i] })
    }
    ////////////////////////START AREAS PROCESSING
    var distinctEntries = _.uniq(Collections.Areas.find({}, {//Dynamically load areas based on the subscription.
        sort: {Area: 1}, fields: {Area: true}
    }).fetch().map(function(x) {
        return x.Area;
    }), true);
    allareas = []
    for(var i=0;i< distinctEntries.length;i++){
        if(!distinctEntries[i])continue;
        allareas.push({label: titleCase(distinctEntries[i]), value: distinctEntries[i] })
    }
    ////////////////////////END AREAS PROCESSING

    var range = [{cur:"eur",min:400,max:10000}]
    var selectedCur = range[0];
    var maxRent = []
    for(var i=selectedCur.min;i<selectedCur.max+1;i=i+50){
        maxRent.push({label: i, value: i })
    }

    // var Config = Collections.Config.find().fetch();Config = Config[0];
    var propertyTypes = []
    // if(Config)
    // for(var i=0;i< Config.propertyType.length;i++){
    //     propertyTypes.push({label: titleCase(Config.propertyType[i].name), value: Config.propertyType[i].value})
    // }

    
    return {
        // countries: countries,
        counties: allcounties,
        countySelected: countySelected,
        areas: allareas,
        maxRent: maxRent,
        isSubsLoaded:isSubsLoaded
        // propertyTypes: propertyTypes,
    };
})(HomePageMainForm);


class HomePageLatestProps extends Component{
    constructor(props) {
        super(props);
        let pAuctions = props.auctions; if(!pAuctions)pAuctions = [];
        let pProperties = props.properties; if(!pProperties)pProperties = [];
        this.state = {
            auctions: pAuctions,
            properties: pProperties
        };
        this.propsListHTML = '';
        this.isServerSSRReq = '';
    }

    componentWillReceiveProps(nextProps) {
        // console.log(nextProps)
        this.setState({
            auctions: nextProps.auctions,
            properties: nextProps.properties
        });
    }

    componentWillMount() {}

    componentDidMount() {
        const self = this;
        // console.log('In componentDidMount');
        // console.log(this)

        setTimeout(fixImageSize,1000)
        setTimeout(fixImageSize,3000)
        setTimeout(fixImageSize,5000)
        $(window).resize(fixImageSize);
    }

    componentDidUpdate() {
        // console.log('In did update');
        // console.log(this)

        setTimeout(fixImageSize,1000)
        setTimeout(fixImageSize,3000)
        setTimeout(fixImageSize,5000)
    }
    propGrid() {
        const self = this;
        let propType = '';
        return (
            <div className="row" id="props_list">
                {
                    Meteor.isServer ? (
                        <div id={"isservercheckdiv"}></div>
                    ):""
                }
                {self.state.auctions.map((auction, i) => {
                    return (
                        <div key={i} className="col-md-4 col-sm-6 img-hold-div">
                            {this.state.properties.map(function (property, a) {
                                if (auction.propertyId !== property._id) return false
                                if(typeof property.gallery === 'undefined' || property.gallery.length == 0 || typeof property.gallery[0] !== 'object') return false;
                                propType = '';
                                switch(property.type){
                                    case 'apartment': propType = 'Apartment to rent'; break;
                                        case 'house': propType = 'House for rent'; break;
                                        case 'student': propType = 'Student Accommodation'; break;
                                        case 'share': propType = 'Flat Share'; break;
                                        case 'holidayhomes': propType = 'Holiday Home'; break;
                                        case 'studio': propType = 'Studio for rent'; break;
                                }
                                return (
                                    <div key={a} className="proj-card">
                                        <div className="prop-img-hold">
                                            <a href={
                                                property.slug && auction.lettingAuctionCode ?
                                                    FlowRouter.url('rent', {
                                                        slug: property.slug,
                                                        key: auction.lettingAuctionCode
                                                    })
                                                    :
                                                    FlowRouter.url('letting', {key: auction.lettingAuctionCode})
                                            }>
                                                <div className="image-holder">
                                                    {typeof property.gallery !== 'undefined' && property.gallery.length > 0 && typeof property.gallery[0] === 'object' ? (
                                                        <img className="img-responsive" src={property.gallery[0].url}
                                                             alt={'Photo 1 of ' + titleCase(property.address.address) + (property.address.area ? ", " + titleCase(property.address.area) : '') + (property.address.county ? ", " + titleCase(property.address.county) : '')}/>
                                                    ) : (
                                                        <div className="item active">
                                                            <img src={cdnPath("/images/no-photo.png")}
                                                                 alt={'Image not available'}
                                                                 className="img-responsive"/>
                                                        </div>
                                                    )}
                                                    <div className="image-position">
                                                        <h3 className="color-white"
                                                            style={{paddingBottom: "2px"}}>{property.address.area ? titleCase(property.address.area) : ''}{property.address.county ? (property.address.area ? ", " : "") + titleCase(property.address.county) : ''}</h3>
                                                        {/*<h4>{property.address.county ? titleCase(property.address.county) : ''} </h4>*/}
                                                        {propType ? ( <h4 style={{paddingBottom:'4px'}}>{propType}</h4> ) : ''}
                                                        <h4>{property.bedCount ? property.bedCount : '1'} Beds, {property.baths ? property.baths : '1'} Baths </h4>
                                                    </div>

                                                </div>
                                                <div className="bg-opacity"></div>
                                            </a>
                                        </div>
                                        <div className="textbox-holder" style={{margin: 0, padding: 20, height: 130}}>
                                            <h4>
                                                <a href={
                                                    property.slug && auction.lettingAuctionCode ?
                                                        FlowRouter.url('rent', {
                                                            slug: property.slug,
                                                            key: auction.lettingAuctionCode
                                                        })
                                                        :
                                                        FlowRouter.url('letting', {key: auction.lettingAuctionCode})
                                                }>
                                                    {titleCase(property.address.address)}
                                                    {property.address.area ? " " + titleCase(property.address.area) : ''}
                                                    {/*{property.address.county ? " "+titleCase(property.address.county) : ''}*/}
                                                </a>
                                            </h4>
                                            <ul>
                                                <li className="left-border">
                                                    <h4>Rent</h4>
                                                    <div className={'h2-div'}>&euro;<span>{auction.price}</span></div>
                                                </li>

                                                <li className="pad-right-0">
                                                    <a
                                                        className="transparent-btn btns view-details"
                                                        href={
                                                            property.slug && auction.lettingAuctionCode ?
                                                                FlowRouter.url('rent', {
                                                                    slug: property.slug,
                                                                    key: auction.lettingAuctionCode
                                                                })
                                                                :
                                                                FlowRouter.url('letting', {key: auction.lettingAuctionCode})
                                                        }
                                                        type="button"
                                                        id="enter-auction">view details</a>
                                                </li>
                                            </ul>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    );
                })}
            </div>
        )
    }
    render(){

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
<section className="property-list" id="latestRentals">
   <div className="container">
      {true ? (
      <div className="prop-wrap">
         <h2>Latest Rentals</h2>
         <span className="bottom-line" />
      </div>
      ): ''}
      <div className="auction">
        { false ? (<h5>Ends on endsDate</h5> ): ""}
         <section>
            <section className="proplist-sec">
               <div className="row blogs">
                  
                  { (this.props.isSubsLoaded && this.state.auctions && this.state.properties )  ? (
                        this.propGrid()
                    ) :
                    this.isServerSSRReq && this.propsListHTML? (
                        <div dangerouslySetInnerHTML={{__html: this.propsListHTML}}></div>
                    ): (
                        <div className={'h2-div'} style={{textAlign:'center'}}>Loading...</div>
                )}

                  <div className="pink-div col-xs-12 col-sm-12 col-md-12 col-lg-12">
                     <a href={FlowRouter.url('b',{'slug':"rent-in-ireland"},{'mostRecentSort':1})} className="pink-btn oval-btn ">View All</a>
                  </div>
               </div>
            </section>
         </section>
      </div>
   </div>
</section>


    );
    }
}
HomePageLatestPropsT = withTracker(() => {
//    const bLettingsSub = Meteor.subscribe("browseLettings", {viewName: 'browseLettings.view', slug:'rent-in-ireland', pageno:1, resperpage:6, query:{mostRecentSort:1}, propertykey:''} ,function(){
//        if(bLettingsSub.ready() && Meteor.isClient)Session.set('subscriptionsReady',true);
//    });

    if(Meteor.isClient)Session.get('subscriptionsReady');
//    if( !bLettingsSub.ready() ) {
 //       return {
 //           isSubsLoaded : false
 //       }
 //   }

    return {
        auctions: Collections.Auctions.find({},{sort:{updatedAt : -1}}).fetch(),
        properties: Collections.Properties.find().fetch(),
        isSubsLoaded : true
    };
})(HomePageLatestProps);
