import { Meteor } from 'meteor/meteor';
import React, { Component } from 'react';
import { withTracker } from 'meteor/react-meteor-data';

import MainLayoutFooter from '../layout/MainLayoutFooter.jsx'
import MainLayoutHeader from '../layout/MainLayoutHeader.jsx'

import { Collections } from  '../../api/collections.js'

let countsCollection = null;
if(Meteor.isClient)Session.set('subscriptionsReady',false);

function titleCase(str) {
    if(!str)return;
    return str.charAt(0).toUpperCase() + str.toLowerCase().substring(1);
}

function titleCaseAllWords(str) {
    if(!str)return;
    return str.split(' ').map(function(str){
        return str.charAt(0).toUpperCase() + str.toLowerCase().substring(1);
    }).join(' ')
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

function getSlugData() {
    var query = FlowRouter.current().queryParams;
    var slug = FlowRouter.current().params.slug;

    var propertyType = "";
    var county = "";
    var area = "";
    var maxRent = "";
    var minRent = "";
    var minBeds = "";
    var maxBeds = "";
    var country = "";
    var bedCount = "";
    var luxurySort = "";
    var cheapSort = "";
    var mostRecentSort = "";
    var leastRecentSort = "";

    var range = [{cur:"eur",min:0,max:10000}]
    var selectedCur = range[0];

    if(query) {
        if(query.minRent)minRent = query.minRent;
        if(query.maxRent)maxRent = query.maxRent;
        if(query.minBeds)minBeds = query.minBeds;
        if(query.maxBeds)maxBeds = query.maxBeds;
        if(query.bedCount)bedCount = query.bedCount;
        if(query.luxurySort)luxurySort = query.luxurySort;
        if(query.cheapSort)cheapSort = query.cheapSort;
        if(query.mostRecentSort)mostRecentSort = query.mostRecentSort;
        if(query.leastRecentSort)leastRecentSort = query.leastRecentSort;
    }

    if(!slug){
        return {
            country:country,
            county:county,
            area:area,
            minRent:minRent,
            maxRent:maxRent,
            minBeds:minBeds,
            maxBeds:maxBeds,
            bedCount:bedCount,
            luxurySort:luxurySort,
            cheapSort:cheapSort,
            mostRecentSort:mostRecentSort,
            leastRecentSort:leastRecentSort,
            propertyType:propertyType,
        };
    }
    if(slug.indexOf('-for-')!=-1){
        propertyType = slug.split('-for-')[0];
        propertyType = propertyType.split('-').join(' ');
    }
    if(slug.indexOf('-in-')!=-1) {
        var tmp = slug.split('-in-')[1].split('-')
        switch (tmp.length) {
            case 3:
                country = tmp[2];
                county = tmp[1];
                area = tmp[0];
                break;
            case 2:
                country = tmp[1];
                county = tmp[0];
                break;
            case 1:
                country = tmp[0];
                break;
        }
        if (propertyType) propertyType = propertyType.replace(/_/g, ' ')
        if (county) county = titleCaseAllWords(county.replace(/_/g, ' '))
        if (country) country = titleCaseAllWords(country.replace(/_/g, ' '))
        if (area) area = titleCaseAllWords(area.replace(/_/g, ' '))
    }
    return {
        country:country,
        county:county,
        area:area,
        minRent:minRent,
        maxRent:maxRent,
        minBeds:minBeds,
        maxBeds:maxBeds,
        bedCount:bedCount,
        luxurySort:luxurySort,
        cheapSort:cheapSort,
        mostRecentSort:mostRecentSort,
        leastRecentSort:leastRecentSort,
        propertyType:propertyType,
    }
}

function generateSlug(curURL){
    var propertyType = curURL.propertyType;
    var county = curURL.county
    var area = curURL.area
    var minRent = curURL.minRent
    var maxRent = curURL.maxRent
    var minBeds = curURL.minBeds
    var maxBeds = curURL.maxBeds
    var sortBy = curURL.sortBy
    var country = curURL.country;
    var bedCount = curURL.bedCount;
    var luxurySort = curURL.luxurySort;
    var cheapSort = curURL.cheapSort;
    var mostRecentSort = curURL.mostRecentSort;
    var leastRecentSort = curURL.leastRecentSort;
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

    if(country)slug+="-"+country
    else slug+="-ireland"

    var range = [{cur:"eur",min:200,max:10000}]
    var selectedCur = range[0];
    if(minRent && minRent!=selectedCur.min)query.minRent = minRent;
    if(maxRent && maxRent!=selectedCur.max)query.maxRent = maxRent;
    if(minBeds)query.minBeds = minBeds;
    if(maxBeds)query.maxBeds = maxBeds;
    if(sortBy){
        switch(sortBy){
            case 'ascRent': query.cheapSort = 1; break;
            case 'descRent': query.luxurySort = 1; break;
            case 'mRecent': query.mostRecentSort = 1; break;
            case 'lRecent': query.leastRecentSort = 1; break;
        }
    }else{
        if(luxurySort)query.luxurySort = 1;
        if(cheapSort)query.cheapSort = 1;
        if(mostRecentSort)query.mostRecentSort = 1;
        if(leastRecentSort)query.leastRecentSort = 1;
    }

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

function updateRoute() {
    // Function is not in use
    //console.log("In updateRoute")
    // TODO Router.query.clear();

  var baseURL = window.location.href.split('?')[0];
  var route = baseURL;
  //debugger;

  var curCity = Session.get('curCity');
  if(curCity && curCity!='All')
    route = updateQueryStringParameter(route, 'city', curCity)


    var curBuilder = Session.get('curBuilder');
    if(curBuilder && curBuilder!='All')
        route = updateQueryStringParameter(route, 'builder', curBuilder)

  //console.log("New Route"+route);
  FlowRouter.go(route);
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

function saveToLocalStorage(){//There is no restore local on this page; its not needed as people come to this page from other pages and they might have diff preferences every time.
    if (localStorage) {

        localStorage.homePageMainFormData_county = $( ".countySelected" ).val();

        localStorage.homePageMainFormData_area = $( ".areaSelected" ).val();
        var tmp = $( "input:radio[name=propertyType]:checked" ).val();
        if(tmp)localStorage.homePageMainFormData_propertyType = tmp
            tmp = $('.maxRent').val()
        if(tmp)localStorage.homePageMainFormData_maxRent = $('.maxRent').val();
    }
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


class HousesForrent extends Component {

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
        let pCS = props.countySelected; if(!pCS)pCS = '';
        let pAS = props.areaSelected; if(!pAS)pAS = '';
        let pTS = props.propertyTypeSelected; if(!pTS)pTS = '';
        let pCounties = props.counties; if(!pCounties)pCounties = [];
        let pPropertyTypes = props.propertyTypes; if(!pPropertyTypes)pPropertyTypes = [];
        let pAreas = props.areas; if(!pAreas)pAreas = [];
        let pAuctions = props.auctions; if(!pAuctions)pAuctions = [];
        let pProperties = props.properties; if(!pProperties)pProperties = [];
        let pTotalCount = props.totalCount; if(!pTotalCount)pTotalCount = 0;
        let pPagination = props.pagination; if(!pPagination)pPagination = 0;
        this.state = {
            showXSMenu:false,
            countySelected: pCS,
            areaSelected: pAS,
            propertyTypeSelected: pTS,
            counties: pCounties,
            propertyTypes: pPropertyTypes,
            areas: pAreas,
            auctions: pAuctions,
            properties: pProperties,
            totalCount: pTotalCount,
            pagination: pPagination,
            'searchCrumbs':searchCrumbs,fCrumbs:fCrumbs,areaCrumbs:areaCrumbs,countyCrumbs:countyCrumbs
        };
        this.searchCrumbsLoaded = false;

        this.propsListHTML = '';
        this.isServerSSRReq = '';
    }

    componentWillReceiveProps(nextProps) {
        // console.log(nextProps)
        this.setState({
            counties: nextProps.counties,
            areas: nextProps.areas,
            propertyTypes: nextProps.propertyTypes,
            auctions: nextProps.auctions,
            properties: nextProps.properties,
            totalCount: nextProps.totalCount,
            pagination: nextProps.pagination
        });
        // if(!this.state.countySelected)
            this.setState({countySelected:nextProps.countySelected})
        // if(!this.state.areaSelected)
            this.setState({areaSelected:nextProps.areaSelected})
        // if(!this.state.propertyTypeSelected)
            this.setState({propertyTypeSelected:nextProps.propertyTypeSelected})

            this.setState({minRentSelected:nextProps.minRentSelected})
            this.setState({maxRentSelected:nextProps.maxRentSelected})
            this.setState({minBedCountSelected:nextProps.minBedCountSelected})
            this.setState({maxBedCountSelected:nextProps.maxBedCountSelected})
            this.setState({sortBySelected:nextProps.sortBySelected})
    }

    componentWillMount() {}

    componentDidMount() {
        const self = this;
        // console.log('In componentDidMount');
        // console.log(this)

        try{
            jQuery("html,body").animate({scrollTop: 0}, 250);
        }catch(e){
            document.body.scrollTop = document.documentElement.scrollTop = 0;
        }

        setTimeout(fixImageSize,1000)
        setTimeout(fixImageSize,3000)
        setTimeout(fixImageSize,5000)
        $(window).resize(fixImageSize);

        setTimeout(function(){
            try {
                jQuery("html,body").animate({scrollTop: 0}, 250);
            } catch (e) {
                document.body.scrollTop = document.documentElement.scrollTop = 0;
            }
        },500)
    }

    componentDidUpdate() {
        // console.log('In did update');
        // console.log(this)

        setTimeout(fixImageSize,1000)
        setTimeout(fixImageSize,3000)
        setTimeout(fixImageSize,5000)
        this.crumbsUpdate();

        setTimeout(function(){
            try {
                jQuery("html,body").animate({scrollTop: 0}, 250);
            } catch (e) {
                document.body.scrollTop = document.documentElement.scrollTop = 0;
            }
        },500)
    }

    minRentOptions(){
        var range = [{cur:"eur",min:200,max:9900}]
        var selectedCur = range[0];
        var maxRent = []
        for(var i=selectedCur.min;i<selectedCur.max+1;){
            maxRent.push({label: i, value: i })
            if(i<1000)i=i+50
            else if(i<=4000)i=i+100
            else if(i<=8000)i=i+500
            else i=i+1000
        }
        return maxRent;
    }
    maxRentOptions(){
        var range = [{cur:"eur",min:400,max:10000}]
        var selectedCur = range[0];
        var maxRent = []
        for(var i=selectedCur.min;i<selectedCur.max+1;){
            maxRent.push({label: i, value: i })
            if(i<1000)i=i+50
            else if(i<=4000)i=i+100
            else if(i<=8000)i=i+500
            else i=i+1000
        }
        return maxRent;
    }
    minBedOptions(){
        var range = [{min:1,max:9}]
        var selectedCur = range[0];
        var maxRent = []
        for(var i=selectedCur.min;i<selectedCur.max+1;i=i+1){
            maxRent.push({label: i, value: i })
        }
        return maxRent;
    }
    maxBedOptions(){
        var range = [{min:2,max:10}]
        var selectedCur = range[0];
        var maxRent = []
        for(var i=selectedCur.min;i<selectedCur.max+1;i=i+1){
            maxRent.push({label: i, value: i })
        }
        return maxRent;
    }
    sortByOptions(){
        var sortBy = [
            {label: "Most recent", value: "mRecent" },
            {label: "Least recent", value: "lRecent" },
            {label: "Rent: Cheaper first", value: "ascRent" },
            {label: "Rent: Luxury first", value: "descRent" },
            ]
        return sortBy;
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
    isEqualSelect(a,b) {
        if(a==b)return ' selected ';
        return '';
    }

    updateQueryStringParameter(uri, key, value) {
        var re = new RegExp("([?&])" + key + "=.*?(&|$)", "i");
        var separator = uri.indexOf('?') !== -1 ? "&" : "?";
        if (uri.match(re)) {
            return uri.replace(re, '$1' + key + "=" + value + '$2');
        } else {
            return uri + separator + key + "=" + value;
        }
    }

    handleChoosePage(page, component) {
        if (typeof page == "undefined") return 

        // var data = getSlugData();
        // var slug = generateSlug(data);
        //
        // FlowRouter.go('/b/:slug/:pageno?', {slug: slug[0], pageno: page}, slug[1]);
        //
        // component.setState({pagination: pagination()});
    }

    handleCountyDropdown(event){
        var val = event.target.value;

        var countyChanged = false;
        var data = getSlugData();
        var countySelected = data.county;

        this.setState({countySelected: val});
        if(localStorage)localStorage.homePageMainFormData_county = val;

        this.setState({areaSelected: ""});

        // if(val!=countySelected)
        //     countyChanged=true;

        // if(countyChanged)
        //     this.setState({areaSelected: ""});

        data.county = val;
        data.area = '';
        // if(countyChanged)data.area='';

        var slug = generateSlug(data);

        FlowRouter.go('/b/:slug/:pageno?', {slug: slug[0]}, slug[1]);
    }
    handleAreaDropdown(event){
        var val = event.target.value;
        this.setState({areaSelected: val});
        if(localStorage)localStorage.homePageMainFormData_area = val;

        var data = getSlugData();
        data.area = val;
        var slug = generateSlug(data);

        FlowRouter.go('/b/:slug/:pageno?', {slug: slug[0]}, slug[1]);
    }
    handlePropertyTypeDropdown(event){
        var val = event.target.value;
        this.setState({propertyTypeSelected: val});
        if(localStorage)localStorage.homePageMainFormData_propertyType = val;

        var data = getSlugData();
        data.propertyType = val;
        var slug = generateSlug(data);

        FlowRouter.go('/b/:slug/:pageno?', {slug: slug[0]}, slug[1]);
    }
    handleMinRentDropdown(event){
        var val = event.target.value;
        this.setState({minRentSelected: val});
        if(localStorage)localStorage.homePageMainFormData_minRent = val;

        var data = getSlugData();
        data.minRent = val;
        var slug = generateSlug(data);

        FlowRouter.go('/b/:slug/:pageno?', {slug: slug[0]}, slug[1]);
    }
    handleMaxRentDropdown(event){
        var val = event.target.value;
        this.setState({maxRentSelected: val});
        if(localStorage)localStorage.homePageMainFormData_maxRent = val;

        var data = getSlugData();
        data.maxRent = val;
        var slug = generateSlug(data);

        FlowRouter.go('/b/:slug/:pageno?', {slug: slug[0]}, slug[1]);
    }
    handleMinBedDropdown(event){
        var val = event.target.value;
        this.setState({minBedCountSelected: val});
        if(localStorage)localStorage.homePageMainFormData_minBed = val;

        var data = getSlugData();
        data.minBeds = val;
        var slug = generateSlug(data);

        FlowRouter.go('/b/:slug/:pageno?', {slug: slug[0]}, slug[1]);
    }
    handleMaxBedDropdown(event){
        var val = event.target.value;
        this.setState({maxBedCountSelected: val});
        if(localStorage)localStorage.homePageMainFormData_maxBed = val;

        var data = getSlugData();
        data.maxBeds = val;
        var slug = generateSlug(data);

        FlowRouter.go('/b/:slug/:pageno?', {slug: slug[0]}, slug[1]);
    }
    handleSortByDropdown(event){
        var val = event.target.value;
        this.setState({sortBySelected: val});

        var data = getSlugData();
        data.sortBy = val;
        var slug = generateSlug(data);

        FlowRouter.go('/b/:slug/:pageno?', {slug: slug[0]}, slug[1]);
    }
    searchXSMenu(event){
        console.log('searchXSMenu')
        this.setState({showXSMenu: false});
        ga('send', 'event', 'BrowsePage', 'searchXSMenuBtn', 'Mobile: searchXSMenu Btn Clicked');
    }
    cancelSearchXSMenu(event){
        console.log('cancelSearchXSMenu')
        this.setState({showXSMenu: false});
        ga('send', 'event', 'BrowsePage', 'cancelFilterBtn', 'Mobile: cancelFilter Btn Clicked');
    }
    handleShowFilters(event){
        this.setState({showXSMenu: true});
        ga('send', 'event', 'BrowsePage', 'showFilterBtn', 'Mobile: showFilter Btn Clicked');
    }
    showFilterText(state){
        var text = [];
        if(state.countySelected){
            text.push("County: "+state.countySelected)
        }//else text.push("all counties")
        if(state.areaSelected){
            text.push("Area: "+state.areaSelected)
        }//else text.push("Area: all areas")
        if(state.propertyTypeSelected){
            text.push("Type: "+this.formatedPT(state.propertyTypeSelected))
        }//else text.push("Type: all property types")

        if(state.minRentSelected && state.maxRentSelected){
            text.push("Rent: between &euro;"+state.minRentSelected+" and &euro;"+state.maxRentSelected+"")
        }else if(state.minRentSelected){
            text.push("Rent: greater than &euro;"+state.minRentSelected+"")
        }else if(state.maxRentSelected){
            text.push("Rent: less than &euro;"+state.maxRentSelected+"")
        }else{
            // text.push("Rent: Any")
        }

        if(state.minBedCountSelected && state.maxBedCountSelected){
            text.push("Beds: between "+state.minBedCountSelected+" and "+state.maxBedCountSelected)
        }else if(state.minBedCountSelected){
            text.push("Beds: has at least "+state.minBedCountSelected+"" )
        }else if(state.maxBedCountSelected){
            text.push("Beds: at most "+state.maxBedCountSelected+"")
        }else{
            // text.push("Rent: Any")
        }

        switch(this.state.sortBySelected){
            case 'mRecent': text.push('Showing: Most recent first'); break;
            case 'lRecent': text.push('Showing: Oldest first'); break;
        }
        if(state.propertyTypeSelected){
            switch(this.state.sortBySelected){
                case 'ascRent': text.push('Showing: Cheap '+this.formatedPT(state.propertyTypeSelected)+' first'); break;
                case 'descRent': text.push('Showing: Luxury '+this.formatedPT(state.propertyTypeSelected)+' first'); break;
            }
        }else{
            switch(this.state.sortBySelected){
                case 'ascRent': text.push('Showing: Least expensive first'); break;
                case 'descRent': text.push('Showing: Most expensive first'); break;
            }
        }



        return 'Chosen filters are <br/>'+text.join('<br/>')

        // Searching in county Dublin<br>
        // Area: Amiens Street<br>
        // Rent: between 200 to 1200 Euros<br>
        // Bedrooms: between 2 to 4<br>
        // Showing: Most recent first
    }

    handleClearFilters() {
        FlowRouter.go('/b/:slug/:pageno?', {slug: 'rent-in-ireland'});
    }
    formatedPT(propertyTypeSelected){
        propertyTypeSelected = propertyTypeSelected.toLowerCase();
        if(propertyTypeSelected=='student')return 'Student Accommodation';
        if(propertyTypeSelected=='holidayhomes')return 'Holiday Homes';
        if(propertyTypeSelected=='parkingspace')return 'Parking Space';
        return titleCaseAllWords(propertyTypeSelected);
    }

    propGrid() {
        const self = this;
        let propType = '';
        return (
            <div className="row">
                {self.state.auctions.map((auction, i) => {
                    return (
                        <div key={i} className="col-md-4 col-sm-6 img-hold-div">
                            {this.state.properties.map(function (property, a) {
                                if (auction.propertyId !== property._id) return false
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
                                                {/*<li className="" style={{verticalAlign:"middle"}}>*/}
                                                {/*<h4 style={{padding:"0"}}>{property.bedCount ? property.bedCount : '1'} Beds</h4><br/>*/}
                                                {/*<h4>{property.baths ? property.baths : '1'} Baths</h4>*/}
                                                {/*</li>*/}
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
    mainAllPage(){
        const self = this;
        var slugData = getSlugData();
        this.sluggedTitle = '';
        this.sluggedTitleWithoutType = '';
        this.sluggedType = ''

        try{
            this.sluggedType = slugData.propertyType ? slugData.propertyType : 'Property';

            this.sluggedTitle += slugData.propertyType ? slugData.propertyType+" for" : '';
            this.sluggedTitle += this.sluggedTitle ? ' rent in' : 'rent in'
            this.sluggedTitle += slugData.area ? ' '+slugData.area+"" : '';
            this.sluggedTitle += slugData.county ? ' '+slugData.county+"" : '';
            this.sluggedTitle += ' Ireland'

            this.sluggedTitleWithoutType = 'rent in'
            this.sluggedTitleWithoutType += slugData.area ? ' '+slugData.area+"" : '';
            this.sluggedTitleWithoutType += slugData.county ? ' '+slugData.county+"" : '';
            this.sluggedTitleWithoutType += ' Ireland'
        }catch(e){}

        try{this.sluggedTitle = this.props.slug.replace(/[-_]/g,' ');}catch(e){}

        this.propertyTypePlural = this.state.propertyTypeSelected;
        switch(this.propertyTypePlural){
            case 'apartment': this.propertyTypePlural = 'Apartments '; break;
                case 'house': this.propertyTypePlural = 'Houses '; break;
                case 'student': this.propertyTypePlural = 'Student Accommodations '; break;
                case 'share': this.propertyTypePlural = 'Flat Shares '; break;
                case 'holidayhomes': this.propertyTypePlural = 'Holiday Homes '; break;
                case 'studio': this.propertyTypePlural = 'Studios '; break;
                case '': this.propertyTypePlural = 'advertisements '; break;
        }

        return (
            <div id="props_list">
                <section className="logo-below-div value-div">
                    <div className="container">
                        <div className="logo-holder-div">
                            <div className="logo-holder">
                                <ul>
                                    <li>
                                        <h1 style={{marginBottom: 10}}>
                                            {self.state.propertyTypeSelected ? this.formatedPT(self.state.propertyTypeSelected) : 'Houses'}
                                            &nbsp;for rent
                                            { self.state.countySelected ? (
                                                <span>
                                                    &nbsp;in {self.state.areaSelected ? self.state.areaSelected + " " : ''}
                                                    {self.state.countySelected}
                                                </span>
                                            ) : (
                                                ""
                                            )}
                                        </h1>
                                        <div className="h4-div" style={{paddingBottom: 5}}>Found {self.state.totalCount} 
                                        {this.props.pageno > 1 ? ( ' (Showing page 3)' ):""}
                                        </div>
                                    </li>
                                </ul>
                            </div>
                            {this.state.showXSMenu ? (
                            <div className="xs-filter-menu xs-menu visible-xs transition">
                                <div className="xs-menu-close-icon text-right">
                                    <span className="h2-h2" style={{float: "left",marginLeft:'12px'}}>FILTERS</span>
                                    <span className="sprite xs-close" onClick={self.cancelSearchXSMenu.bind(this)}/>
                                </div>
                                <ul className="transition" style={{paddingTop:0}}>
                                    <li>
                                        <p className="color-grey">Change County</p>
                                        <div className="styled-input styled-input-select">
                                            <select
                                                name="furnished"
                                                autoComplete="true"
                                                style={{margin: 0}}
                                                className="countyDropdown countySelected"
                                                onChange={self.handleCountyDropdown.bind(this)}
                                                value={self.state.countySelected}
                                            >
                                                <option value="">All</option>
                                                {self.state.counties ?
                                                    self.state.counties.map((item, i) => {
                                                        return (
                                                            <option key={i} value={item.value}>{item.label}</option>
                                                        )
                                                    }) : ""}
                                            </select>
                                        </div>
                                    </li>
                                    <li>
                                        <p className="color-grey">Area</p>
                                        <div className="styled-input styled-input-select">
                                            <select
                                                name="furnished"
                                                autoComplete="true"
                                                style={{margin: 0}}
                                                className="countyDropdown areaSelected"
                                                onChange={self.handleAreaDropdown.bind(this)}
                                                value={self.state.areaSelected}
                                            >
                                                <option value="">All</option>
                                                {self.state.areas ? self.state.areas.map((item, i) => {
                                                    return (
                                                        <option key={i} value={item.value}>{item.label}</option>
                                                    )
                                                }):""}
                                            </select>
                                        </div>
                                    </li>
                                    <li>
                                        <div className="row">
                                            <div className="col-xs-6 col-md-6">
                                                <p className="color-grey">Min Rent</p>
                                                <div className="styled-input styled-input-select">
                                                    <select
                                                        name="furnished"
                                                        autoComplete="true"
                                                        style={{margin: 0}}
                                                        className="countyDropdown countySelected"
                                                        onChange={self.handleMinRentDropdown.bind(this)}
                                                        value={self.state.minRentSelected}
                                                    >
                                                        <option value="">All</option>
                                                        { self.minRentOptions().map((item, i) => {
                                                            return (
                                                                <option key={i} value={item.value}>{item.label}</option>
                                                            )
                                                        }) }
                                                    </select>
                                                </div>
                                            </div>
                                            <div className="col-xs-6 col-md-6">
                                                <p className="color-grey">Max Rent</p>
                                                <div className="styled-input styled-input-select">
                                                    <select
                                                        name="furnished"
                                                        autoComplete="true"
                                                        style={{margin: 0}}
                                                        className="countyDropdown countySelected"
                                                        onChange={self.handleMaxRentDropdown.bind(this)}
                                                        value={self.state.maxRentSelected}
                                                    >
                                                        <option value="">All</option>
                                                        { self.maxRentOptions().map((item, i) => {
                                                            return (
                                                                <option key={i} value={item.value}>{item.label}</option>
                                                            )
                                                        }) }
                                                    </select>
                                                </div>
                                            </div>
                                        </div>
                                    </li>
                                    <li>
                                        <p className="color-grey">How many bedrooms?</p>
                                        <div className="row">
                                            <div className="col-xs-6 col-md-6">
                                                <p className="color-grey">Min Beds</p>
                                                <div className="styled-input styled-input-select">
                                                    <select
                                                        name="furnished"
                                                        autoComplete="true"
                                                        style={{margin: 0}}
                                                        className="countyDropdown countySelected"
                                                        onChange={self.handleMinBedDropdown.bind(this)}
                                                        value={self.state.minBedCountSelected}
                                                    >
                                                        <option value="">All</option>
                                                        { self.minBedOptions().map((item, i) => {
                                                            return (
                                                                <option key={i} value={item.value}>{item.label}</option>
                                                            )
                                                        }) }
                                                    </select>
                                                </div>
                                            </div>
                                            <div className="col-xs-6 col-md-6">
                                                <p className="color-grey">Max Beds</p>
                                                <div className="styled-input styled-input-select">
                                                    <select
                                                        name="furnished"
                                                        autoComplete="true"
                                                        style={{margin: 0}}
                                                        className="countyDropdown countySelected"
                                                        onChange={self.handleMaxBedDropdown.bind(this)}
                                                        value={self.state.maxBedCountSelected}
                                                    >
                                                        <option value="">All</option>
                                                        { self.maxBedOptions().map((item, i) => {
                                                            return (
                                                                <option key={i} value={item.value}>{item.label}</option>
                                                            )
                                                        }) }
                                                    </select>
                                                </div>
                                            </div>
                                        </div>
                                    </li>
                                    <li>
                                        <p className="color-grey">Property Type? </p>
                                        <div className="styled-input styled-input-select">
                                            <select
                                                name="furnished"
                                                autoComplete="true"
                                                style={{margin: 0}}
                                                className="countyDropdown countySelected"
                                                onChange={self.handlePropertyTypeDropdown.bind(this)}
                                                value={self.state.propertyTypeSelected}
                                            >
                                                <option value="">All</option>
                                                {self.state.propertyTypes ? self.state.propertyTypes.map((item, i) => {
                                                    return (
                                                        <option key={i} value={item.value}>{item.label}</option>
                                                    )
                                                }):""}
                                            </select>
                                        </div>
                                    </li>
                                    <li>
                                        <p className="color-grey">Sort by</p>
                                        <div className="styled-input styled-input-select">
                                            <select
                                                name="furnished"
                                                autoComplete="true"
                                                style={{margin: 0}}
                                                className="countyDropdown countySelected"
                                                onChange={self.handleSortByDropdown.bind(this)}
                                                value={self.state.sortBySelected}
                                            >
                                                <option value="">All</option>
                                                {self.sortByOptions().map((item, i) => {
                                                    return (
                                                        <option key={i} value={item.value}>{item.label}</option>
                                                    )
                                                })}
                                            </select>
                                        </div>
                                    </li>
                                    <li>
                                        <button className="btns green-btn" onClick={self.searchXSMenu.bind(this)}>Search</button>
                                        <button className="btns transparent-btn" style={{marginLeft:5}}  onClick={self.cancelSearchXSMenu.bind(this)}>Cancel</button>
                                    </li>
                                </ul>
                            </div>
                            ):""}
                            <div className="menu houseForRentFilters">
                                <ul>
                                    <li className="left-border pad-right-0 cf-1">
                                        <p className="visible-xs" dangerouslySetInnerHTML={{__html:this.showFilterText(this.state)}}></p>
                                        <a className="visible-xs" href="javascript:void(0)" onClick={self.handleShowFilters.bind(this)}><h4 className="hfr-h4">Edit Filters <span className="glyphicon glyphicon-filter"></span></h4></a>
                                        <p className="color-grey">Change County</p>
                                        <div className="styled-input styled-input-select">
                                            <select
                                                name="furnished"
                                                autoComplete="true"
                                                style={{margin: 0}}
                                                className="countyDropdown countySelected"
                                                onChange={self.handleCountyDropdown.bind(this)}
                                                value={self.state.countySelected}
                                            >
                                                <option value="">All</option>
                                                {self.state.counties ?
                                                    self.state.counties.map((item, i) => {
                                                        return (
                                                            <option key={i} value={item.value}>{item.label}</option>
                                                        )
                                                    }) : ""}
                                            </select>
                                        </div>
                                    </li>
                                    <li className="cf-1 pad-right-0">
                                        <p className="color-grey">Area</p>
                                        <div className="styled-input styled-input-select">
                                            <select
                                                name="furnished"
                                                autoComplete="true"
                                                style={{margin: 0}}
                                                className="countyDropdown countySelected"
                                                onChange={self.handleAreaDropdown.bind(this)}
                                                value={self.state.areaSelected}
                                            >
                                                <option value="">All</option>
                                                {self.state.areas ? self.state.areas.map((item, i) => {
                                                    return (
                                                        <option key={i} value={item.value}>{item.label}</option>
                                                    )
                                                }):""}
                                            </select>
                                        </div>
                                    </li>
                                </ul>
                            </div>
                        </div>
                    </div>
                </section>

                { self.state.totalCount == 0 && this.props.isSubsLoaded ? (
                    <div className="container text-center mar-top-20 pad-btm-30">
                        <strong>
                            No {this.propertyTypePlural}found
                            { self.state.countySelected ? (
                                <span>
                                &nbsp;in {self.state.areaSelected ? self.state.areaSelected + " of " : ''}
                                    county {self.state.countySelected}
                            </span>
                            ) : (
                                ""
                            )}.&nbsp;
                            Click show all below to search other areas.
                        </strong>

                        <br/><br/>
                        <button
                            className="blue-btn btns clearFilters"
                            onClick={self.handleClearFilters}
                            type="button">Show all
                        </button>
                    </div>
                ) : ("")}

                { self.state.totalCount > 0 ? (
                    <section className="paginationArea mar-top-20 ">
                        <div className="container">
                            <div className="row">
                                <div className="col-md-12">
                                    <p className={'mar-btm-20'}>
                                        {this.props.pageno > 1 ? ( 'Showing page 3 of ' ):'Found '}
                                        total {self.state.totalCount ? self.state.totalCount : 'no'} {this.sluggedTitle}. Browse through the apartments, houses, studios, 1 bed, 2 bed, 3 bed rooms available to {this.sluggedTitleWithoutType}. Choose county and area from the top right drop-down options. Click view details button by the {this.sluggedType.toLowerCase()} to know more about it. Use the navigation below to find more {this.sluggedTitle}.
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

                <section className="proplist-sec property-list">
                    <div className="container">
                        {this.propGrid()}
                    </div>
                </section>
                { self.state.totalCount > 0 ? (
                    <section className="paginationArea subscribeTillPopop">
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







                {true ? (
                    <section className="">
                        <div className="container">
                                    <div id="homeLinks" className="mar-btm-30 amenities">

                                        <div className="amenitiy-block-removed" style={{paddingTop:0,textAlign:"center"}}>
                                            { this.props.searchCrumbs === undefined || this.props.searchCrumbs.length == 0  ? ("") : (
                                                <div id="searchsection" className={'row'}>
                                                    <h2>Search more properties to rent</h2>
                                                    <p>Chooes a link below to browse through more relavent properties to rent.</p>
                                                    <br/>
                                                    <div className="pad0">
                                                        <div className="col-md-5 col-sm-5 col-xs-12">
                                                            {this.state.searchCrumbs.c1 ?
                                                                this.state.searchCrumbs.c1.map(function(crumb,i){
                                                                    return (
                                                                        <a key={i} style={{display:"block"}} href={crumb.url}>{crumb.name}</a>
                                                                    )
                                                                })
                                                                : ""}
                                                        </div>
                                                        <div className="col-md-4 col-sm-4 col-xs-12">
                                                            {this.state.searchCrumbs.c2 ?
                                                                this.state.searchCrumbs.c2.map(function(crumb,i){
                                                                    return (
                                                                        <a key={i} style={{display:"block"}} href={crumb.url}>{crumb.name}</a>
                                                                    )
                                                                })
                                                                : ""}
                                                        </div>
                                                        <div className="col-md-3 col-sm-3 col-xs-12">
                                                            {this.state.searchCrumbs.c3 ?
                                                                this.state.searchCrumbs.c3.map(function(crumb,i){
                                                                    return (
                                                                        <a key={i} style={{display:"block"}} href={crumb.url}>{crumb.name}</a>
                                                                    )
                                                                })
                                                                : ""}
                                                        </div>
                                                    </div>

                                                </div>
                                            )}
                                            { this.props.fCrumbs === undefined || this.props.fCrumbs.length == 0 ? ("") : (
                                                <div className={'row mar-top-30'}>
                                                    <h2>Property types to rent</h2><br/>
                                                    <div className="pad0">
                                                        <div className="col-md-3 col-sm-3 col-xs-12">
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
                                                        <div className="col-md-5 col-sm-5 col-xs-12">
                                                            {this.state.fCrumbs.c3 ?
                                                                this.state.fCrumbs.c3.map(function (crumb, i) {
                                                                    return (
                                                                        <a key={i} style={{display: "block"}}
                                                                           href={crumb.url}>{crumb.name}</a>
                                                                    )
                                                                })
                                                                : ""}
                                                        </div>
                                                    </div>
                                                </div>
                                            )}
                                            { this.props.areaCrumbs === undefined || this.props.areaCrumbs.length == 0  ? ("") : (
                                                <div className={'row mar-top-30'}>
                                                    <h2>{self.state.countySelected} neighbourhoods</h2><br/>
                                                    <div className="pad0">
                                                        <div className="col-md-4 col-sm-4 col-xs-12">
                                                            {this.state.areaCrumbs.c1 ?
                                                                this.state.areaCrumbs.c1.map(function (crumb, i) {
                                                                    return (
                                                                        <a key={i} style={{display: "block"}}
                                                                           href={crumb.url}>{crumb.name}</a>
                                                                    )
                                                                })
                                                                : ""}
                                                        </div>
                                                        <div className="col-md-4 col-sm-4 col-xs-12">
                                                            {this.state.areaCrumbs.c2 ?
                                                                this.state.areaCrumbs.c2.map(function (crumb, i) {
                                                                    return (
                                                                        <a key={i} style={{display: "block"}}
                                                                           href={crumb.url}>{crumb.name}</a>
                                                                    )
                                                                })
                                                                : ""}
                                                        </div>
                                                        <div className="col-md-4 col-sm-4 col-xs-12">
                                                            {this.state.areaCrumbs.c3 ?
                                                                this.state.areaCrumbs.c3.map(function (crumb, i) {
                                                                    return (
                                                                        <a key={i} style={{display: "block"}}
                                                                           href={crumb.url}>{crumb.name}</a>
                                                                    )
                                                                })
                                                                : ""}
                                                        </div>
                                                    </div>
                                                </div>
                                            )}
                                            { this.props.countyCrumbs === undefined || this.props.countyCrumbs.length == 0  ? ("") : (
                                                <div className={'row mar-top-30'}>
                                                    <h2>Other counties</h2><br/>
                                                    <div className="pad0">
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
                                                        </div>
                                                    </div>

                                                </div>
                                            )}
                                        </div>

                                    </div>
                                
                        </div>
                    </section>
                ) : ""}






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
                { (this.props.isSubsLoaded && self.state.auctions && self.state.properties )  ? (
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
var startTime = Date.now();
export default withTracker(() => {
    var staticCounties = ["Carlow", "Cavan", "Clare", "Cork", "Donegal", "Dublin", "Galway", "Kerry", "Kildare", "Kilkenny", "Laois", "Leitrim", "Limerick", "Longford", "Louth", "Mayo", "Meath", "Monaghan", "Offaly", "Roscommon", "Sligo", "Tipperary", "Waterford", "Westmeath", "Wexford", "Wicklow"];
    function counties() {

        var ret = []
        for(var i=0;i< staticCounties.length;i++){
            if(!staticCounties[i])continue;
            ret.push({label: titleCase(staticCounties[i]), value: staticCounties[i] })
        }
        return ret;
    }

    function areas() {

        var distinctEntries = _.uniq(Collections.Areas.find({}, {//Dynamically load areas based on the subscription.
            sort: {Area: 1}, fields: {Area: true}
        }).fetch().map(function(x) {
            return x.Area;
        }), true);
        var ret = []
        for(var i=0;i< distinctEntries.length;i++){
            if(!distinctEntries[i])continue;
            ret.push({label: titleCase(distinctEntries[i]), value: distinctEntries[i] })
        }
        return ret;
    }
    function propertyTypes() {
        var Config = Collections.Config.find().fetch();Config = Config[0];
        var propertyTypes = []
        if(Config)
            for(var i=0;i< Config.propertyType.length;i++){
                propertyTypes.push({label: titleCase(Config.propertyType[i].name), value: Config.propertyType[i].value})
            }

        return propertyTypes;
    }

    function areaSelected(){
        var data = getSlugData();
        var areaSelected = data.area;

        if(areaSelected!=false)return areaSelected;
        else{
            var data = getSlugData();
            return data.area;
        }
    }


    function propertyTypeSelected(){
        var data = getSlugData();
        var propertyTypeSelected = data.propertyType;

        if(propertyTypeSelected!=false){
            propertyTypeSelected = propertyTypeSelected.toLowerCase();
            return propertyTypeSelected;
        }
        else{
            var data = getSlugData();
            propertyTypeSelected = data.propertyType;
            propertyTypeSelected = propertyTypeSelected.toLowerCase();
            return propertyTypeSelected;
        }
    }

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

    advancedCrumbs = function(countyParam,areaParam,propertyType){
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
        fCrumbs.push({url: generateSlugURL({bedCount: 1}), name: '1-Bed'})//Property Size
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

        for (var i = 0; i < staticCounties.length; i++) {
            if (!staticCounties[i]) continue;
            countyCrumbs.push({
                url: generateSlugURL({county: staticCounties[i]}),
                name: staticCounties[i] + ' Apartments'
            })
        }

        if (countyParam) {
            // var propertyType = curURL.propertyType;
            // var county = curURL.county
            // var area = curURL.area
            // var maxRent = curURL.maxRent
            // var country = curURL.country;
            // var bedCount = curURL.bedCount;
            // var luxurySort = curURL.luxurySort;
            // var cheapSort = curURL.cheapSort;

            //////////////////////////// WITH COUNTY
            tmpCrumbs = [];
            tmpCrumbs.push({
                url: generateSlugURL({cheapSort: true, propertyType: 'house', county: countyParam}),
                name: 'Cheap Houses to rent in ' + titleCase(countyParam)
            })

            if (propertyType == 'house') {
                fCrumbs = fCrumbs.concat(tmpCrumbs);
            }
            fCrumbs.push({
                url: generateSlugURL({cheapSort: true, propertyType: 'apartment', county: countyParam}),
                name: 'Cheap Apartments to rent in ' + titleCase(countyParam)
            })

            if (propertyType != 'house') {
                fCrumbs = fCrumbs.concat(tmpCrumbs);
            }

            fCrumbs.push({
                url: generateSlugURL({propertyType: 'studio', county: countyParam}),
                name: 'Studio to rent in ' + titleCase(countyParam)
            })

            tmpCrumbs = [];
            tmpCrumbs.push({
                url: generateSlugURL({bedCount: 1, propertyType: 'house', county: countyParam}),
                name: '1-Bed Houses to rent in ' + titleCase(countyParam)
            })//Property Size - Property Type
            tmpCrumbs.push({
                url: generateSlugURL({bedCount: 2, propertyType: 'house', county: countyParam}),
                name: '2-Bed Houses to rent in ' + titleCase(countyParam)
            })
            tmpCrumbs.push({
                url: generateSlugURL({bedCount: 3, propertyType: 'house', county: countyParam}),
                name: '3-Bed Houses to rent in ' + titleCase(countyParam)
            })
            tmpCrumbs.push({
                url: generateSlugURL({luxurySort: true, propertyType: 'house', county: countyParam}),
                name: 'Luxury Houses to rent in ' + titleCase(countyParam)
            })

            if (propertyType == 'house') {
                fCrumbs = fCrumbs.concat(tmpCrumbs);
            }
            fCrumbs.push({
                url: generateSlugURL({bedCount: 1, propertyType: 'apartment', county: countyParam}),
                name: '1-Bed Apartments to rent in ' + titleCase(countyParam)
            })//Property Size - Property Type
            fCrumbs.push({
                url: generateSlugURL({bedCount: 2, propertyType: 'apartment', county: countyParam}),
                name: '2-Bed Apartments to rent in ' + titleCase(countyParam)
            })
            fCrumbs.push({
                url: generateSlugURL({bedCount: 3, propertyType: 'apartment', county: countyParam}),
                name: '3-Bed Apartments to rent in ' + titleCase(countyParam)
            })
            fCrumbs.push({
                url: generateSlugURL({luxurySort: true, propertyType: 'apartment', county: countyParam}),
                name: 'Luxury Apartments to rent in ' + titleCase(countyParam)
            })

            if (propertyType != 'house') {
                fCrumbs = fCrumbs.concat(tmpCrumbs);
            }

            if (areaParam) {
                //////////////////////////// WITH AREA COUNTY
                tmpCrumbs = [];
                tmpCrumbs.push({
                    url: generateSlugURL({
                        cheapSort: true,
                        propertyType: 'house',
                        county: countyParam,
                        area: areaParam
                    }), name: 'Cheap Houses to rent in ' + titleCase(areaParam) + ' ' + titleCase(countyParam)
                })

                if (propertyType == 'house') {
                    fCrumbs = fCrumbs.concat(tmpCrumbs);
                }
                fCrumbs.push({
                    url: generateSlugURL({
                        cheapSort: true,
                        propertyType: 'apartment',
                        county: countyParam,
                        area: areaParam
                    }), name: 'Cheap Apartments to rent in ' + titleCase(areaParam) + ' ' + titleCase(countyParam)
                })

                if (propertyType != 'house') {
                    fCrumbs = fCrumbs.concat(tmpCrumbs);
                }

                fCrumbs.push({
                    url: generateSlugURL({propertyType: 'studio', county: countyParam, area: areaParam}),
                    name: 'Studio to rent in ' + titleCase(areaParam) + ' ' + titleCase(countyParam)
                })

                tmpCrumbs = [];
                tmpCrumbs.push({
                    url: generateSlugURL({
                        bedCount: 1,
                        propertyType: 'house',
                        county: countyParam,
                        area: areaParam
                    }), name: '1-Bed Houses for rent in ' + titleCase(areaParam) + ' ' + titleCase(countyParam)
                })//Property Size - Property Type
                tmpCrumbs.push({
                    url: generateSlugURL({
                        bedCount: 2,
                        propertyType: 'house',
                        county: countyParam,
                        area: areaParam
                    }), name: '2-Bed Houses for rent in ' + titleCase(areaParam) + ' ' + titleCase(countyParam)
                })
                tmpCrumbs.push({
                    url: generateSlugURL({
                        bedCount: 3,
                        propertyType: 'house',
                        county: countyParam,
                        area: areaParam
                    }), name: '3-Bed Houses for rent in ' + titleCase(areaParam) + ' ' + titleCase(countyParam)
                })
                tmpCrumbs.push({
                    url: generateSlugURL({
                        luxurySort: true,
                        propertyType: 'house',
                        county: countyParam,
                        area: areaParam
                    }), name: 'Luxury Houses for rent in ' + titleCase(areaParam) + ' ' + titleCase(countyParam)
                })

                if (propertyType == 'house') {
                    fCrumbs = fCrumbs.concat(tmpCrumbs);
                }
                fCrumbs.push({
                    url: generateSlugURL({
                        bedCount: 1,
                        propertyType: 'apartment',
                        county: countyParam,
                        area: areaParam
                    }), name: '1-Bed Apartments for rent in ' + titleCase(areaParam) + ' ' + titleCase(countyParam)
                })//Property Size - Property Type
                fCrumbs.push({
                    url: generateSlugURL({
                        bedCount: 2,
                        propertyType: 'apartment',
                        county: countyParam,
                        area: areaParam
                    }), name: '2-Bed Apartments for rent in ' + titleCase(areaParam) + ' ' + titleCase(countyParam)
                })
                fCrumbs.push({
                    url: generateSlugURL({
                        bedCount: 3,
                        propertyType: 'apartment',
                        county: countyParam,
                        area: areaParam
                    }), name: '3-Bed Apartments for rent in ' + titleCase(areaParam) + ' ' + titleCase(countyParam)
                })
                fCrumbs.push({
                    url: generateSlugURL({
                        luxurySort: true,
                        propertyType: 'apartment',
                        county: countyParam,
                        area: areaParam
                    }), name: 'Luxury Apartments for rent in ' + titleCase(areaParam) + ' ' + titleCase(countyParam)
                })

                if (propertyType != 'house') {
                    fCrumbs = fCrumbs.concat(tmpCrumbs);
                }
            }

            var distinctEntries = _.uniq(Collections.Areas.find({}, {//County: countyParam ; Dynamically load areas based on the subscription.
                sort: {Area: 1}, fields: {Area: true}
            }).fetch().map(function (x) {
                return x.Area;
            }), true);
            areaCrumbs = []
            for (var i = 0; i < distinctEntries.length; i++) {
                if (!distinctEntries[i]) continue;
                // if (distinctEntries[i] == areaParam) continue;//Don't show the same area in this list
                areaCrumbs.push({
                    url: generateSlugURL({county: countyParam, area: distinctEntries[i]}),
                    name: distinctEntries[i] + ' Apartments'
                })
            }

            // let ptypeString='';
            // switch(propertyType){
            //     case 'apartment': ptypeString = 'Apartments '; break;
            //     case 'house': ptypeString = 'Houses '; break;
            // }
            // fCrumbs.push({url:FlowRouter.url('b',{slug:slugTemp[0]}), name:'Studio for rent in county '+titleCase(PD.address.county)})
            // fCrumbs.push({url:FlowRouter.url('b',{slug:slugTemp[0]}), name:'1-Bed '+ptypeString+'for rent in county '+titleCase(PD.address.county)})
            // fCrumbs.push({url:FlowRouter.url('b',{slug:slugTemp[0]}), name:'2-Bed '+ptypeString+'for rent in county '+titleCase(PD.address.county)})
            // fCrumbs.push({url:FlowRouter.url('b',{slug:slugTemp[0]}), name:'3-Bed '+ptypeString+'for rent in county '+titleCase(PD.address.county)})
        }
        return {
            fCrumbs:fCrumbs,
            areaCrumbs: areaCrumbs,
            countyCrumbs:countyCrumbs
        }
    }

    var pageno = FlowRouter.getParam('pageno'); if(!pageno)pageno=1;
    var resperpage = 20;
    var minBeds = FlowRouter.getQueryParam('minBeds'); if(!minBeds)minBeds="";
    var maxBeds = FlowRouter.getQueryParam('maxBeds'); if(!maxBeds)maxBeds="";
    var minRent = FlowRouter.getQueryParam('minRent'); if(!minRent)minRent="";
    var maxRent = FlowRouter.getQueryParam('maxRent'); if(!maxRent)maxRent="";
    var bedCount = FlowRouter.getQueryParam('bedCount'); if(!bedCount)bedCount=null;
    var luxurySort = FlowRouter.getQueryParam('luxurySort'); if(!luxurySort)luxurySort=null;
    var cheapSort = FlowRouter.getQueryParam('cheapSort'); if(!cheapSort)cheapSort=null;
    var mostRecentSort = FlowRouter.getQueryParam('mostRecentSort'); if(!mostRecentSort)mostRecentSort=null;
    var leastRecentSort = FlowRouter.getQueryParam('leastRecentSort'); if(!leastRecentSort)leastRecentSort=null;
    var propertykey = FlowRouter.getQueryParam('propertykey'); if(!propertykey)propertykey=null;
    var slug = FlowRouter.getParam('slug');
    var query = FlowRouter.current().queryParams;
    var current = FlowRouter.current();
    var currentURL = FlowRouter.url(FlowRouter.current().route.name, FlowRouter.current().params, FlowRouter.current().queryParams)

    // try{if(!slug)slug = FlowRouter.current().params.slug;}catch(e){}

    if(!slug || slug.indexOf('-in-')==-1){
        return {
            isSubsLoaded : false
        }
        // if( (Date.now() - startTime) < 1000 )
        //     return {
        //         isSubsLoaded : false
        //     }
        // // this.render('notFound');
        // var prevRoute = {name: 'home',args:{scrollTo:0} }
        // Session.set('prevRoute',prevRoute);
        // FlowRouter.go('pagenotfound');
        // return;
    }

    let sortBySelected = "mRecent";
    var sortOptions = { updatedAt : -1 }
    if( luxurySort ){sortBySelected = "descRent"; sortOptions = { rentMonthly : -1 } }
    else if( cheapSort ){sortBySelected = "ascRent";  sortOptions = { rentMonthly : 1 } }
    else if( mostRecentSort ){sortBySelected = "mRecent"; sortOptions = { updatedAt : -1 } }
    else if( leastRecentSort ){sortBySelected = "lRecent"; sortOptions = { updatedAt : 1 } }

    const bLettingsSub = Meteor.subscribe("browseLettings", {viewName: 'browseLettings.view', slug:slug, pageno:pageno, resperpage:resperpage, query:query, propertykey:propertykey} ,function(){
        if(bLettingsSub.ready() && areasSub.ready()  && Meteor.isClient)Session.set('subscriptionsReady',true);
    });

    Meteor.subscribe("total-houses-for-rent-count", {viewName: 'browseLettings.view', slug:slug, pageno:pageno, resperpage:resperpage, query:query, propertykey:propertykey});

    if(Meteor.isServer){
        if(countsCollection==null)countsCollection = new Mongo.Collection('counts');
        Counts.get = function countsGet(name) {
            const count = countsCollection.findOne(name);
            return count && count.count || 0;
        };
        Counts.has = function countsHas(name) {
            return !!countsCollection.findOne(name);
        };

        totalCount = Counts.get("total-houses-for-rent-count");

    }else{
        totalCount = Counts.get("total-houses-for-rent-count");
    }

    var slugData = getSlugData();
    var countySelected = slugData.county;

    Meteor.subscribe('userData');
    const areasSub = Meteor.subscribe('Areas','','',countySelected,'','',function(){
        if(bLettingsSub.ready() && areasSub.ready() && Meteor.isClient )Session.set('subscriptionsReady',true);
    })
    Meteor.subscribe('Config');

    if(Meteor.isClient)Session.get('subscriptionsReady');
    if( !bLettingsSub.ready() || !areasSub.ready() ) {
        return {
            isSubsLoaded : false
        }
    }

    ////////// ADV BREADCRUMBS MORE LINKS
    let advC = {fCrumbs:[],areaCrumbs:[],countyCrumbs:[]}
    if(true) {
        advC = advancedCrumbs(slugData.county,slugData.area,slugData.propertyType);
    }
    ////////// END ADV BREADCRUMBS

    var title = '';//slug.replace(/[-_]/g,' ')
    title += slugData.propertyType ? slugData.propertyType+" for" : '';
    title += title ? ' rent in' : 'Rent in'
    title += slugData.area ? ' '+slugData.area+"" : '';
    title += slugData.county ? ' '+slugData.county+"" : '';
    title += ' Ireland'

    var description = ""
    description = 'Find';
    description += slugData.propertyType ? ' an '+slugData.propertyType+" for" : '';
    description += ' rent in'
    description += slugData.area ? ' '+slugData.area+"" : '';
    description += slugData.county ? ' '+slugData.county+"" : '';
    description += ' Ireland.'

    description += " Browse through the apartments, houses, studios, 1 bed, 2 bed, 3 bed rooms available to rent in Ireland."


    // Find an apartment for rent in Ireland. Browse through the studio, apartments, houses, 1 bed, 2 bed, 3 bed rooms available to rent in Ireland.
    // Found total 32 apartment for rent in Ireland. Browse through the studio, apartments, houses, 1 bed, 2 bed, 3 bed rooms available to rent in Ireland. Choose county and area from the top right drop-down options. Click view details button by the apartment to know more about it. Use the navigation below to find more apartment for rent in Ireland.
    clearMeta();
    let titleTmp = title + ' | SpotMyCrib'
    if(titleTmp.length<=75)title = titleTmp;

    DocHead.setTitle(title);
    DocHead.addMeta({name: "description", content: description});

    return {
        // currentUserId: Meteor.userId(),
        counties: counties(),
        totalCount: totalCount,
        pagination: getPaginationData(totalCount,pageno,20),
        pageno:pageno,
        areas: areas(),
        propertyTypes: propertyTypes(),
        auctions: Collections.Auctions.find({},{sort:sortOptions}).fetch(),
        properties: Collections.Properties.find().fetch(),
        areaSelected: areaSelected(),
        countySelected: countySelected,
        propertyTypeSelected: propertyTypeSelected(),
        isSubsLoaded : true,
        slug:slug,
        fCrumbs : advC.fCrumbs,
        areaCrumbs : advC.areaCrumbs,
        countyCrumbs : advC.countyCrumbs,
        minRentSelected: slugData.minRent,
        maxRentSelected: slugData.maxRent,
        minBedCountSelected: slugData.minBeds,
        maxBedCountSelected: slugData.maxBeds,
        sortBySelected: sortBySelected,
    };
})(HousesForrent);